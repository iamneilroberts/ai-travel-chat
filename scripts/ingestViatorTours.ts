import { PrismaClient, Prisma } from '@prisma/client';
import { ViatorClient } from '../src/utils/viatorClient';
import { TourWithParsedJson } from '../src/types/tour';

class ViatorTourIngestionService {
  private prisma: PrismaClient;
  private viatorClient: ViatorClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    this.viatorClient = ViatorClient.initialize();
  }

  private convertToInputJson(obj: any): Prisma.InputJsonValue {
    try {
      console.log('Converting to JSON:', obj);
      const converted = JSON.parse(JSON.stringify(obj));
      return converted as Prisma.InputJsonValue;
    } catch (error) {
      console.error('Error converting to JSON:', error);
      throw error;
    }
  }

  private async saveTourToDatabase(tour: Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      console.log('Preparing tour data for database...');
      const tourData: Prisma.TourCreateInput = {
        tourId: tour.tourId,
        title: tour.title,
        description: tour.description,
        location: this.convertToInputJson(tour.location),
        ratings: tour.ratings,
        reviews: tour.reviews,
        categories: { set: tour.categories },
        duration: tour.duration,
        priceRange: this.convertToInputJson(tour.priceRange),
        reviewCount: tour.reviewCount,
        ratingAvg: tour.ratingAvg,
        status: tour.status,
        region: tour.region,
        lastSync: new Date()
      };

      console.log('Upserting tour to database...');
      await this.prisma.tour.upsert({
        where: { tourId: tour.tourId },
        update: tourData,
        create: tourData
      });
      console.log(`Successfully saved tour: ${tour.title}`);
    } catch (error) {
      console.error(`Error saving tour ${tour.tourId}:`, error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  async initializeCatalog(): Promise<void> {
    console.log('Starting initial catalog ingestion...');
    
    try {
      let cursor: string | undefined;
      let totalIngested = 0;
      let hasMore = true;

      while (hasMore) {
        const result = await this.viatorClient.getModifiedProducts({
          cursor,
          count: 500
        });

        for (const tour of result.products) {
          await this.saveTourToDatabase(tour);
          totalIngested++;
        }

        console.log(`Processed ${result.products.length} tours (Total: ${totalIngested})`);
        
        hasMore = !!result.nextCursor;
        cursor = result.nextCursor;
      }
    } catch (error) {
      console.error('Error during catalog initialization:', error);
      throw error;
    }
  }

  async ingestToursByDateRange(startDate?: string, endDate?: string): Promise<void> {
    console.log(`Starting tour ingestion from ${startDate}${endDate ? ` to ${endDate}` : ''}...`);
    
    try {
      let cursor: string | undefined;
      let totalIngested = 0;
      let hasMore = true;

      while (hasMore) {
        // Get modified products with pagination
        const result = await this.viatorClient.getModifiedProducts({
          modifiedSince: startDate,
          cursor: cursor,
          count: 500 // Maximum allowed per request
        });

        // Process the products
        for (const tour of result.products) {
          await this.saveTourToDatabase(tour);
          totalIngested++;

          // Log progress every 100 tours
          if (totalIngested % 100 === 0) {
            console.log(`Processed ${totalIngested} tours so far...`);
          }
        }

        // Check if we have more pages
        if (result.nextCursor) {
          cursor = result.nextCursor;
          console.log(`Processed ${result.products.length} tours. Moving to next page...`);
        } else {
          hasMore = false;
        }

        // If endDate is specified and we've reached it, stop ingesting
        if (endDate && result.products.length > 0) {
          const lastTour = result.products[result.products.length - 1];
          if (lastTour.lastSync && new Date(lastTour.lastSync) > new Date(endDate)) {
            console.log(`Reached end date ${endDate}. Stopping ingestion.`);
            break;
          }
        }
      }

      console.log(`Completed ingestion. Total tours processed: ${totalIngested}`);
    } catch (error) {
      console.error('Error during tour ingestion:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

async function main() {
  const startDate = process.argv[2];
  const endDate = process.argv[3]; 
  const command = process.argv[2]; // Allow for different commands

  // Validate date format if provided
  if (startDate && startDate !== 'init' && !startDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
    console.error('If provided, start date must be in ISO format (e.g., 2025-02-23T00:00:00Z)');
    process.exit(1); 
  }

  const ingestionService = new ViatorTourIngestionService();
  
  try {
    if (command === 'init') {
      // Initialize the full catalog
      console.log('Initializing full product catalog...');
      await ingestionService.initializeCatalog();
    } else if (startDate) {
      // Use date-based ingestion
      console.log('Running date-based ingestion...');
      await ingestionService.ingestToursByDateRange(startDate, endDate);
    } else {
      console.error('Please specify either "init" to initialize the catalog or provide a start date');
      process.exit(1);
    }
    console.log('Ingestion completed successfully');
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  } finally {
    await ingestionService.close();
  }
}

main().catch(console.error);