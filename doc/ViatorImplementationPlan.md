# Viator Integration Implementation Plan

## Overview
This plan outlines the steps to integrate Viator tour recommendations into the existing Next.js travel assistant application. The integration will use the current trip details stored in markdown format to suggest relevant Viator tours.

## 1. Database Setup (Week 1)

### Technology Choice
Instead of MongoDB, we'll use Prisma with PostgreSQL for better Next.js integration and type safety. Reasons:
- Built-in TypeScript support
- Better integration with Next.js and Vercel deployment
- Automatic migrations and type generation
- Can still handle JSON fields for flexible tour data

### Implementation Steps
1. Add Prisma and PostgreSQL dependencies
```bash
npm install @prisma/client prisma
npx prisma init
```

2. Define Prisma schema for tours (prisma/schema.prisma):
```prisma
model Tour {
  id          String   @id @default(cuid())
  tourId      String   @unique // Viator's tour ID
  title       String
  description String   @db.Text
  location    Json     // City, country, coordinates
  ratings     Float
  reviews     Int
  categories  String[]
  duration    String
  priceRange  Json     // min/max pricing
  schedule    Json?    // Available dates/times
  updatedAt   DateTime @updatedAt
}
```

3. Create database migration and deploy
```bash
npx prisma migrate dev --name init
```

## 2. Viator API Integration (Week 1)

1. Create Viator API client (src/utils/viatorClient.ts):
- Implement authentication
- Create typed API methods for:
  - Bulk catalog download
  - Tour availability check
  - Pricing verification

2. Add environment variables:
```env
VIATOR_API_KEY=your_key
VIATOR_API_URL=https://api.viator.com/partner/
```

3. Create tour ingestion script (scripts/ingestViatorTours.ts):
- Fetch tours from Viator API
- Transform to database schema
- Upsert to PostgreSQL via Prisma
- Add error handling and logging

## 3. AI Query Generation (Week 2)

1. Create AI prompt engineering module (src/utils/tourQueryGenerator.ts):
- Parse trip details markdown
- Generate structured tour search parameters
- Map locations and activities to Viator categories

2. Extend existing AI client:
```typescript
interface TourSearchParams {
  location: string;
  categories: string[];
  duration?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  dates?: string[];
}

async function generateTourQueries(tripDetails: string): Promise<TourSearchParams[]>
```

## 4. Search Implementation (Week 2)

1. Create tour search service (src/utils/tourSearch.ts):
- Implement Prisma queries using AI-generated parameters
- Add sorting and filtering
- Include pagination support

2. Add API endpoint (src/app/api/tours/route.ts):
```typescript
export async function GET(request: Request) {
  // Parse trip details
  // Generate search queries
  // Search database
  // Verify availability
  // Return results
}
```

## 5. Frontend Integration (Week 3)

1. Create TourRecommendations component:
```typescript
// src/components/TourRecommendations/index.tsx
interface TourRecommendationProps {
  tripDetails: string;
}
```

2. Add to existing UI:
- Integrate with trip details display
- Add loading states
- Implement error handling
- Add tour filtering/sorting controls

3. Style components:
- Match existing design system
- Ensure responsive layout
- Add animations for loading states

## 6. Testing & Optimization (Week 3)

1. Unit Tests:
- AI query generation
- Tour search logic
- API endpoints

2. Integration Tests:
- Database operations
- API integration
- Frontend components

3. Performance Optimization:
- Implement caching
- Add request debouncing
- Optimize database queries

## 7. Deployment & Monitoring (Week 4)

1. Database Setup:
- Create production database
- Configure connection pooling
- Set up backups

2. Environment Configuration:
- Add production environment variables
- Configure error tracking
- Set up monitoring

3. Documentation:
- API documentation
- Database schema
- Deployment procedures

## Timeline
- Week 1: Database setup and API integration
- Week 2: AI integration and search implementation
- Week 3: Frontend development and testing
- Week 4: Deployment and documentation

## Prerequisites
1. Viator API access (key and documentation)
2. PostgreSQL database (local for development)
3. Production database host (e.g., Vercel Postgres)

## Notes
- The implementation uses TypeScript throughout for type safety
- Follows Next.js 14 App Router patterns
- Maintains existing markdown-based trip details structure
- Integrates with current AI processing pipeline