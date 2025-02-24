import { PrismaClient } from '@prisma/client';
import { ViatorClient } from '../src/utils/viatorClient';
import { TourWithParsedJson, ViatorLocation, ViatorPriceRange } from '../src/types/tour';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Initialize Prisma client with logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const client = ViatorClient.initialize();

const logToFile = async (content: string): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = join(__dirname, '..', 'testing', `viator_search_test_${timestamp}.log`);
  await writeFile(logPath, content);
  console.log(`Results logged to ${logPath}`);
};

interface ViatorTag {
  tagId: number;
  parentTagIds?: number[];
  allNamesByLocale: {
    [locale: string]: string;
  };
}

const syncTags = async (tags: ViatorTag[]): Promise<void> => {
  console.log('Syncing tags to database...');
  let syncedCount = 0;

  for (const tag of tags) {
    try {
      await prisma.tag.upsert({
        where: { id: tag.tagId },
        update: {
          name: tag.allNamesByLocale.en || String(tag.tagId),
          parentIds: tag.parentTagIds || [],
          lastUpdated: new Date()
        },
        create: {
          id: tag.tagId,
          name: tag.allNamesByLocale.en || String(tag.tagId),
          parentIds: tag.parentTagIds || [],
          lastUpdated: new Date()
        }
      });
      syncedCount++;
    } catch (error) {
      console.error(`Error syncing tag ${tag.tagId}:`, error);
    }
  }

  console.log(`Successfully synced ${syncedCount} tags`);
};

const transformTourData = (tour: any): any => {
  const location: ViatorLocation = {
    city: tour.location?.name || 'London',
    country: 'United Kingdom',
    coordinates: {
      lat: tour.location?.coordinates?.lat || 51.5074,
      lon: tour.location?.coordinates?.lon || -0.1278
    }
  };

  const priceRange: ViatorPriceRange = {
    min: tour.pricing?.summary?.fromPrice || 0,
    max: tour.pricing?.summary?.fromPriceBeforeDiscount || 0,
    currency: tour.pricing?.currency || 'USD'
  };

  // Store raw tag IDs
  const rawTagIds = tour.tags || [];

  return {
    tourId: tour.productCode,
    title: tour.title,
    description: tour.description || '',
    location: JSON.stringify(location),
    ratings: tour.reviews?.combinedAverageRating || 0,
    reviews: tour.reviews?.totalReviews || 0,
    categories: [], // Will be populated from tag relationships
    duration: tour.duration?.fixedDurationInMinutes 
      ? `${tour.duration.fixedDurationInMinutes} minutes`
      : tour.duration?.unstructuredDuration || 'Unknown',
    priceRange: JSON.stringify(priceRange),
    reviewCount: tour.reviews?.totalReviews || 0,
    ratingAvg: tour.reviews?.combinedAverageRating || 0,
    status: 'ACTIVE',
    region: 'UK',
    lastSync: new Date(),
    rawTagIds
  };
};

const saveTours = async (tours: any[]): Promise<void> => {
  console.log(`Saving ${tours.length} tours to database...`);
  let savedCount = 0;
  let errorCount = 0;

  for (const tour of tours) {
    try {
      const tourData = transformTourData(tour);
      
      // Create or update the tour
      const savedTour = await prisma.tour.upsert({
        where: { tourId: tourData.tourId },
        update: tourData,
        create: tourData
      });

      // Create tag relationships
      if (tourData.rawTagIds.length > 0) {
        // Delete existing relationships
        await prisma.tourTag.deleteMany({
          where: { tourId: savedTour.id }
        });

        // Create new relationships
        for (const tagId of tourData.rawTagIds) {
          await prisma.tourTag.create({
            data: {
              tourId: savedTour.id,
              tagId
            }
          });
        }
      }

      savedCount++;
      if (savedCount % 100 === 0) {
        console.log(`Progress: ${savedCount}/${tours.length} tours processed`);
      }
    } catch (error) {
      console.error(`Error saving tour ${tour.productCode}:`, error);
      errorCount++;
    }
  }

  console.log(`\nSummary:`);
  console.log(`- Total tours processed: ${tours.length}`);
  console.log(`- Successfully saved: ${savedCount}`);
  console.log(`- Errors: ${errorCount}`);
};

const main = async (): Promise<void> => {
  try {
    console.log('Starting Viator search test...');
    
    // Test API connection
    const connected = await client.testConnection();
    if (!connected) {
      throw new Error('Failed to connect to Viator API');
    }
    console.log('API connection successful');

    // First, fetch and sync all tags
    console.log('\nFetching Viator tags...');
    const tagsResponse = await client.getTags();
    if (tagsResponse?.tags) {
      await syncTags(tagsResponse.tags);
    }
    
    // Search for all London tours
    console.log('\nSearching for London tours...');
    const searchResult = await client.searchTours('London', {
      currency: 'USD',
      start: 1,
      count: 50, // Maximum allowed per API limits
      sortBy: 'RATING' // Sort by rating to get the best tours first
    });
    
    // Log full API response
    await logToFile(JSON.stringify(searchResult, null, 2));
    
    if (!searchResult?.products?.results) {
      throw new Error('No search results returned');
    }
    
    const totalResults = searchResult.products.totalCount;
    console.log(`\nTotal tours found: ${totalResults}`);
    
    // Save the tours with tag information
    await saveTours(searchResult.products.results);
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run the script
main().catch(console.error);