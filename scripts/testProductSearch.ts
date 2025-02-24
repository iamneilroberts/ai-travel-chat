import { PrismaClient, Prisma } from '@prisma/client';
import { ViatorClient } from '../src/utils/viatorClient';

interface SearchOptions {
  destinationId?: string;
  tags?: number[];
  flags?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  dates?: {
    start: string;
    end: string;
  };
  sorting?: {
    sort: 'PRICE' | 'RATING' | 'RELEVANCE';
    order: 'ASCENDING' | 'DESCENDING';
  };
  pagination?: {
    start: number;
    count: number;
  };
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

    // Example search for tours in Bar Harbor (destination ID: 4371)
    const searchOptions: SearchOptions = {
      destinationId: '4371',
      tags: [21972, 11930], // Example tags: Excellent Quality, Private Tours
      flags: ['FREE_CANCELLATION'],
      priceRange: {
        min: 50,
        max: 500
      },
      sorting: {
        sort: 'RATING',
        order: 'DESCENDING'
      },
      pagination: {
        start: 1,
        count: 10
      }
    };

    console.log('Searching for products with options:', searchOptions);
    const results = await viatorClient.searchProducts(searchOptions);

    if (results && results.products) {
      console.log(`Found ${results.products.length} products`);
      
      // Log sample product details
      if (results.products.length > 0) {
        const sample = results.products[0];
        console.log('Sample product:', {
          code: sample.productCode,
          title: sample.title,
          rating: sample.reviews?.combinedAverageRating,
          totalReviews: sample.reviews?.totalReviews,
          price: sample.pricing?.summary?.fromPrice,
          currency: sample.pricing?.currency
        });
      }
    } else {
      console.log('No products found');
    }

  } catch (error) {
    console.error('Error during product search test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);