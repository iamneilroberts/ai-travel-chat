import { ViatorClient } from '../src/utils/viatorClient';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const LOG_FILE = path.join('testing', 'viator_ireland_search.log');

// Helper function to write to log file
const logToFile = (message: string): void => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
};

async function searchIrelandTours(): Promise<void> {
  try {
    const viatorClient = ViatorClient.initialize();

    // Test connection first
    const connectionTest = await viatorClient.testConnection();
    logToFile(`Connection test: ${connectionTest ? 'Successful' : 'Failed'}`);

    if (!connectionTest) {
      throw new Error('Failed to connect to Viator API');
    }

    // Array of search terms to try
    const searchTerms = [
      'Ireland',
      'Dublin',
      'Irish',
      'Republic of Ireland',
      'Belfast', // Include to see if Northern Ireland tours appear
      'Galway',
      'Cork'
    ];

    // Search with each term
    for (const term of searchTerms) {
      logToFile(`\n=== Searching for term: ${term} ===`);
      
      const results = await viatorClient.searchTours(term, {
        currency: 'EUR',
        sortBy: 'RELEVANCE'
      });

      if (!results || !results.products) {
        logToFile(`No results found for "${term}"`);
        continue;
      }

      const tours = results.products.data;
      logToFile(`Found ${tours.length} tours for "${term}"`);

      // Log detailed information about each tour
      tours.forEach((tour, index) => {
        logToFile(`\nTour ${index + 1}:`);
        logToFile(`- Product Code: ${tour.productCode}`);
        logToFile(`- Title: ${tour.title}`);
        logToFile(`- Location: ${JSON.stringify(tour.location)}`);
        logToFile(`- Destination ID: ${tour.destinationId || 'N/A'}`);
        if (tour.categories) {
          logToFile(`- Categories: ${tour.categories.join(', ')}`);
        }
        if (tour.price) {
          logToFile(`- Price Range: ${tour.price.min}-${tour.price.max} ${tour.price.currency}`);
        }
      });

      // Add a separator between search terms
      logToFile('\n' + '='.repeat(50) + '\n');
    }

  } catch (error) {
    logToFile(`Error in searchIrelandTours: ${error}`);
    console.error('Error:', error);
  }
}

// Create testing directory if it doesn't exist
if (!fs.existsSync('testing')) {
  fs.mkdirSync('testing');
}

// Clear previous log file
fs.writeFileSync(LOG_FILE, '=== Ireland Tours Search Test ===\n\n');

// Run the search
searchIrelandTours().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});