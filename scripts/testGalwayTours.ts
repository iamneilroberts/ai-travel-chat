import { PrismaClient, Prisma } from '@prisma/client';
import { ViatorClient, FreetextSearchProduct } from '../src/utils/viatorClient';

class GalwayToursTestService {
  private prisma: PrismaClient;
  private viatorClient: ViatorClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    this.viatorClient = ViatorClient.initialize();
  }

  private transformSearchResultToTour(product: FreetextSearchProduct): Prisma.TourCreateInput {
    // Create location object with Galway defaults if not provided
    const location = {
      city: product.location?.name || 'Galway',
      country: 'Ireland',
      coordinates: product.location?.coordinates || { lat: 53.2707, lon: -9.0568 } // Default Galway coordinates
    };

    const priceRange = {
      min: product.price?.min || 0,
      max: product.price?.max || 0,
      currency: product.price?.currency || 'EUR'
    };

    // Convert objects to Prisma InputJsonValue format
    const locationJson = JSON.parse(JSON.stringify(location)) as Prisma.InputJsonValue;
    const priceRangeJson = JSON.parse(JSON.stringify(priceRange)) as Prisma.InputJsonValue;

    return {
      tourId: product.productCode,
      title: product.title,
      description: product.description || 'No description available',
      ratings: 0, // Will be updated with actual data when available
      reviews: 0, // Will be updated with actual data when available
      categories: product.categories || [],
      duration: product.duration || 'Unknown',
      location: locationJson,
      priceRange: priceRangeJson,
      reviewCount: 0,
      ratingAvg: 0,
      status: 'ACTIVE',
      region: 'Ireland',
      lastSync: new Date()
    };
  }

  private async saveTourToDatabase(tour: Prisma.TourCreateInput): Promise<void> {
    try {
      await this.prisma.tour.upsert({
        where: { tourId: tour.tourId },
        update: tour,
        create: tour
      });
      console.log(`Successfully saved tour: ${tour.title}`);
    } catch (error) {
      console.error(`Error saving tour ${tour.tourId}:`, error);
      throw error;
    }
  }

  async searchAndSaveGalwayTours(): Promise<void> {
    try {
      console.log('Searching for Galway tours...');
      
      const searchResult = await this.viatorClient.searchTours('Galway Ireland', {
        currency: 'EUR',
        sortBy: 'RATING'
      });

      if (!searchResult || !searchResult.products?.data) {
        console.log('No tours found');
        return;
      }

      console.log(`Found ${searchResult.products.data.length} tours`);

      for (const product of searchResult.products.data) {
        const tour = this.transformSearchResultToTour(product);
        await this.saveTourToDatabase(tour);
      }

      console.log('Completed processing Galway tours');
    } catch (error) {
      console.error('Error during Galway tours search:', error);
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
  const service = new GalwayToursTestService();
  
  try {
    await service.searchAndSaveGalwayTours();
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  } finally {
    await service.close();
  }
}

main().catch(console.error);