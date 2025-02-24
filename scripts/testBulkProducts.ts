import { PrismaClient, Prisma } from '@prisma/client';
import { ViatorClient } from '../src/utils/viatorClient';

// Helper function to safely convert objects to Prisma JSON
function toInputJson(obj: any): Prisma.InputJsonValue {
  try {
    // Convert to string and back to ensure JSON compatibility
    const jsonStr = JSON.stringify(obj);
    const parsed = JSON.parse(jsonStr);
    return parsed as Prisma.InputJsonValue;
  } catch (error) {
    console.error('Error converting to JSON:', error);
    throw error;
  }
}

async function main() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  const viatorClient = ViatorClient.initialize();

  try {
    // Test API connection first
    console.log('Testing API connection...');
    const isConnected = await viatorClient.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Viator API');
    }

    // Test with a small set of known product codes
    // These are example codes - they may or may not be valid
    const testProductCodes = [
      '92457P4',  // Ecuador Parapente Quito (from documentation example)
      '141567P21',
      '8932P17',
      '58593P53',
      '164413P1'
    ];

    console.log(`Testing bulk product retrieval for ${testProductCodes.length} products...`);
    const result = await viatorClient.getBulkProducts(testProductCodes);

    console.log('Successfully retrieved products:', {
      requested: testProductCodes.length,
      received: result.products.length,
      activeProducts: result.products.filter(p => p.status === 'ACTIVE').length
    });

    // Save products to database
    console.log('Saving products to database...');
    for (const tour of result.products) {
      // Convert location and priceRange to JSON for database storage
      const tourData: Prisma.TourCreateInput = {
        tourId: tour.tourId,
        title: tour.title,
        description: tour.description,
        location: toInputJson(tour.location),
        ratings: tour.ratings,
        reviews: tour.reviews,
        categories: { set: tour.categories },
        duration: tour.duration,
        priceRange: toInputJson(tour.priceRange),
        reviewCount: tour.reviewCount,
        ratingAvg: tour.ratingAvg,
        status: tour.status,
        region: tour.region,
        lastSync: tour.lastSync
      };

      await prisma.tour.upsert({
        where: { tourId: tour.tourId },
        update: tourData,
        create: tourData
      });
    }

    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during bulk products test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);