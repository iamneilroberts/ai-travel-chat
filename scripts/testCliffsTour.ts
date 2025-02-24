import { ViatorClient } from '../src/utils/viatorClient';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const LOG_FILE = path.join('testing', 'viator_cliffs_tour.log');

// Helper function to write to log file
const logToFile = (message: string): void => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
};

async function searchCliffsOfMoherTour(): Promise<void> {
  try {
    const viatorClient = ViatorClient.initialize();

    // Test connection first
    const connectionTest = await viatorClient.testConnection();
    logToFile(`Connection test: ${connectionTest ? 'Successful' : 'Failed'}`);

    if (!connectionTest) {
      throw new Error('Failed to connect to Viator API');
    }

    // Try different search terms to find the exact tour
    const searchTerms = [
      'Cliffs of Moher Tour Including Wild Atlantic Way and Galway City from Dublin',
      'Cliffs of Moher Tour Wild Atlantic Way',
      'Cliffs of Moher Dublin Day Tour',
      'Cliffs of Moher Galway'
    ];

    for (const searchTerm of searchTerms) {
      logToFile(`\n=== Searching for term: "${searchTerm}" ===\n`);
      
      const searchResults = await viatorClient.searchTours(searchTerm, {
        currency: 'EUR',
        sortBy: 'RELEVANCE'
      });

      if (!searchResults || !searchResults.products) {
        logToFile(`No results found for "${searchTerm}"`);
        continue;
      }

      const tours = searchResults.products.data;
      logToFile(`Found ${tours.length} tours for "${searchTerm}"`);

      // Log detailed information about each tour
      tours.forEach((tour, index) => {
        logToFile(`\nTour ${index + 1}:`);
        logToFile(`- Product Code: ${tour.productCode}`);
        logToFile(`- Title: ${tour.title}`);
        logToFile(`- Description: ${tour.description || 'N/A'}`);
        logToFile(`- Location: ${JSON.stringify(tour.location)}`);
        logToFile(`- Destination ID: ${tour.destinationId || 'N/A'}`);
        if (tour.categories) {
          logToFile(`- Categories: ${tour.categories.join(', ')}`);
        }
        if (tour.price) {
          logToFile(`- Price Range: ${tour.price.min}-${tour.price.max} ${tour.price.currency}`);
        }
        logToFile('----------------------------------------');
      });

      // Add a separator between search terms
      logToFile('\n' + '='.repeat(50) + '\n');
    }

  } catch (error) {
    logToFile(`Error in searchCliffsOfMoherTour: ${error}`);
    console.error('Error:', error);
  }
}

// Create testing directory if it doesn't exist
if (!fs.existsSync('testing')) {
  fs.mkdirSync('testing');
}

// Clear previous log file
fs.writeFileSync(LOG_FILE, '=== Cliffs of Moher Tour Search ===\n\n');

// Run the search
searchCliffsOfMoherTour().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});