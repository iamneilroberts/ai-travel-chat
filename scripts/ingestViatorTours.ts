import { PrismaClient, Prisma } from '@prisma/client';
import { ViatorClient } from '../src/utils/viatorClient';
import { 
  TourWithParsedJson, 
  ViatorLocation 
} from '../src/types/tour';

// Flexible region mapping that can be easily updated
const REGION_MAPPING: { [key: string]: string[] } = {
  'UK': ['United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland'],
  'Ireland': ['Ireland', 'Republic of Ireland'],
  'Italy': ['Italy'],
  'France': ['France'],
  'Caribbean': [
    'Jamaica', 'Bahamas', 'Dominican Republic', 'Puerto Rico', 
    'Cuba', 'Barbados', 'Trinidad and Tobago', 'Cayman Islands'
  ]
};

class ViatorTourIngestionService {
  private prisma: PrismaClient;
  private viatorClient: ViatorClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.viatorClient = ViatorClient.initialize();
  }

  // Determine region based on country
  private determineRegion(country: string): string {
    for (const [region, countries] of Object.entries(REGION_MAPPING)) {
      if (countries.includes(country)) {
        return region;
      }
    }
    return 'Other';
  }

  async ingestToursByRegion(region: string): Promise<void> {
    console.log(`Starting tour ingestion for ${region}...`);
    
    try {
      // In a real implementation, you'd use the modified-since endpoint
      // For now, we'll simulate with a single product retrieval
      const tourDetails = await this.viatorClient.getTour('5010SYDNEY');
      
      if (!tourDetails) {
        console.error(`No tours found for region: ${region}`);
        return;
      }

      // Dynamically determine region based on tour's country
      const tourRegion = this.determineRegion(tourDetails.location.country);

      // Only ingest if the tour's region matches the requested region
      if (tourRegion === region) {
        await this.saveTourToDatabase(tourDetails);
      }
    } catch (error) {
      console.error(`Error ingesting tours for ${region}:`, error);
    }
  }

  private convertToInputJson(obj: any): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(obj));
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
        categories: tour.categories,
        duration: tour.duration,
        priceRange: this.convertToInputJson(tour.priceRange),
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        highlights: tour.highlights,
        languages: tour.languages,
        accessibility: tour.accessibility,
        tags: tour.tags,
        productUrl: tour.productUrl,
        bookingInfo: this.convertToInputJson(tour.bookingInfo),
        reviewCount: tour.reviewCount,
        ratingAvg: tour.ratingAvg,
        status: tour.status,
        region: this.determineRegion(tour.location.country),
        lastSync: new Date()
      };

      await this.prisma.tour.upsert({
        where: { tourId: tour.tourId },
        update: tourData,
        create: tourData
      });
      console.log(`Saved tour: ${tour.title}`);
    } catch (error) {
      console.error(`Error saving tour ${tour.tourId}:`, error);
    }
  }

  async bulkIngestTours(): Promise<void> {
    console.log('Starting bulk tour ingestion...');
    
    for (const region of Object.keys(REGION_MAPPING)) {
      await this.ingestToursByRegion(region);
    }
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

async function main() {
  const ingestionService = new ViatorTourIngestionService();
  
  try {
    await ingestionService.bulkIngestTours();
  } catch (error) {
    console.error('Bulk ingestion failed:', error);
  } finally {
    await ingestionService.close();
  }
}

main().catch(console.error);