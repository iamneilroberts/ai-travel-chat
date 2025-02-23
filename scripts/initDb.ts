import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { ViatorClient } from '../src/utils/viatorClient';

async function initializeDatabase() {
  console.log('Starting database initialization...');

  try {
    // Step 1: Run Prisma migrations
    console.log('\nRunning database migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    console.log('Migrations completed successfully.');

    // Step 2: Verify database connection
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      console.log('\nDatabase connection verified.');
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error}`);
    }

    // Step 3: Verify Viator API configuration
    console.log('\nVerifying Viator API configuration...');
    try {
      const viatorClient = ViatorClient.initialize();
      const connected = await viatorClient.testConnection();
      if (!connected) {
        throw new Error('Failed to connect to Viator API');
      }
      
      console.log('Viator API configuration verified.');
    } catch (error) {
      throw new Error(`Failed to verify Viator API configuration: ${error}`);
    }

    // Step 4: Run initial tour ingestion
    console.log('\nStarting initial tour ingestion...');
    execSync('ts-node scripts/ingestViatorTours.ts', { stdio: 'inherit' });
    console.log('Initial tour ingestion completed.');

    console.log('\nDatabase initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit http://localhost:3000 to see the application');
    console.log('3. Check the tour recommendations section for ingested tours');

  } catch (error) {
    console.error('\nError during database initialization:', error);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .catch(error => {
      console.error('Fatal error during database initialization:', error);
      process.exit(1);
    });
}