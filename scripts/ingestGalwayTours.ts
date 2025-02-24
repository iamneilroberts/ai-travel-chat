import { PrismaClient, Prisma } from '@prisma/client';
import { ViatorClient } from '../src/utils/viatorClient';
import { TourWithParsedJson } from '../src/types/tour';

class GalwayTourIngestionService {
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
      const converted = JSON.parse(JSON.stringify(obj));
      return converted as Prisma.InputJsonValue;
    } catch (error) {
      console.error('Error converting to JSON:', error);
      throw error;
    }
  }

  private isGalwayTour(tour: Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'>): boolean {
    // Check if tour is in Galway
    const isInGalway = 
      tour.location?.city?.toLowerCase().includes('galway') ||
      tour.title.toLowerCase().includes('galway') ||
      tour.description?.toLowerCase().includes('galway');
    
    return isInGalway;
  }

  private async saveTourToDatabase(tour: Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
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

      await this.prisma.tour.upsert({
        where: { tourId: tour.tourId },
        update: tourData,
        create: tourData
      });
      console.log(`Successfully saved Galway tour: ${tour.title}`);
    } catch (error) {
      console.error(`Error saving tour ${tour.tourId}:`, error);
      throw error;
    }
  }

  async ingestGalwayTours(): Promise<void> {
    console.log('Starting Galway tours ingestion...');
    
    try {
      let cursor: string | undefined;
      let totalFound = 0;
      let hasMore = true;

      while (hasMore) {
        // Get all products with just count parameter
        const result = await this.viatorClient.getModifiedProducts({
          count: 500 // Maximum allowed per request
        });

        // Filter and process Galway tours
        for (const tour of result.products) {
          if (this.isGalwayTour(tour)) {
            await this.saveTourToDatabase(tour);
            totalFound++;
            console.log(`Found and saved Galway tour: ${tour.title}`);
          }
        }

        // Check if we have more pages
        if (result.nextCursor) {
          cursor = result.nextCursor;
          console.log(`Processed page. Found ${totalFound} Galway tours so far. Moving to next page...`);
        } else {
          hasMore = false;
        }
      }

      console.log(`Completed ingestion. Total Galway tours found: ${totalFound}`);
    } catch (error) {
      console.error('Error during Galway tour ingestion:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

async function main() {
  const ingestionService = new GalwayTourIngestionService();
  
  try {
    await ingestionService.ingestGalwayTours();
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  } finally {
    await ingestionService.close();
  }
}

main().catch(console.error);