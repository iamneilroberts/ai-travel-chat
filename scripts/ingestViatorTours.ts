import { PrismaClient, Prisma } from '@prisma/client';
import { ViatorClient } from '../src/utils/viatorClient';
import { 
  TourWithParsedJson, 
  ViatorLocation 
} from '../src/types/tour';

// Test data for UK tour
const TEST_TOUR: Omit<TourWithParsedJson, 'id' | 'createdAt' | 'updatedAt'> = {
  tourId: 'TEST-LONDON-1',
  title: 'London City Walking Tour',
  description: 'Explore the historic streets of London with a knowledgeable guide.',
  location: {
    city: 'London',
    country: 'United Kingdom',
    coordinates: { lat: 51.5074, lon: -0.1278 }
  },
  ratings: 4.5,
  reviews: 100,
  categories: ['Walking Tours', 'Historical Tours'],
  duration: '3 hours',
  priceRange: {
    min: 25,
    max: 50,
    currency: 'GBP'
  },
  reviewCount: 100,
  ratingAvg: 4.5,
  status: 'ACTIVE',
  region: 'UK',
  lastSync: new Date()
};

class ViatorTourIngestionService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  // Determine region based on country
  private determineRegion(country: string): string {
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

    for (const [region, countries] of Object.entries(REGION_MAPPING)) {
      if (countries.includes(country)) {
        return region;
      }
    }
    return 'Other';
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
        region: this.determineRegion(tour.location.country),
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

  async ingestToursByRegion(region: string): Promise<void> {
    console.log(`Starting tour ingestion for ${region}...`);
    
    try {
      // For testing, use our test tour data
      if (region === 'UK') {
        await this.saveTourToDatabase(TEST_TOUR);
      } else {
        console.log(`No test data available for region: ${region}`);
      }
    } catch (error) {
      console.error(`Error ingesting tours for ${region}:`, error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

async function main() {
  const region = process.argv[2];
  const validRegions = ['UK', 'Ireland', 'Italy', 'France', 'Caribbean'];
  
  if (!region || !validRegions.includes(region)) {
    console.error('Please provide a valid region:', validRegions.join(', '));
    process.exit(1);
  }

  const ingestionService = new ViatorTourIngestionService();
  
  try {
    await ingestionService.ingestToursByRegion(region);
  } catch (error) {
    console.error(`Error ingesting tours for ${region}:`, error);
    process.exit(1);
  } finally {
    await ingestionService.close();
  }
}

main().catch(console.error);