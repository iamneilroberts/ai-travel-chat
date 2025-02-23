import { ViatorClient } from '../src/utils/viatorClient';

async function main() {
  try {
    // Use the static initialize method
    const viatorClient = ViatorClient.initialize();

    // Test connection
    const connectionTest = await viatorClient.testConnection();
    console.log('Connection Test:', connectionTest ? 'Successful' : 'Failed');

    // Test single product retrieval
    const productCode = '5010SYDNEY';
    console.log(`\nTesting single product retrieval for ${productCode}...`);
    const tourDetails = await viatorClient.getTour(productCode);
    
    if (tourDetails) {
      console.log('Tour details:', {
        title: tourDetails.title,
        location: {
          city: tourDetails.location.city,
          country: tourDetails.location.country,
          coordinates: tourDetails.location.coordinates
        },
        duration: tourDetails.duration
      });
    } else {
      console.log('Failed to retrieve tour details');
    }

    // Test multiple tours retrieval
    console.log('\nTesting multiple tours retrieval...');
    const toursResult = await viatorClient.getTours();
    console.log(`Retrieved ${toursResult.tours.length} tours`);
    console.log('Has more tours:', toursResult.hasMore);

    // Test availability checking
    console.log('\nTesting availability...');
    const availability = await viatorClient.checkAvailability(productCode, '2025-07-15');
    if (availability) {
      console.log('Availability:', {
        available: availability.available,
        price: availability.price,
        currency: availability.currency
      });
    } else {
      console.log('Failed to check availability');
    }

  } catch (error) {
    console.error('Error in Viator API testing:', error);
  }
}

// Run the main function
main().catch(console.error);