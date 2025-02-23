# Viator Integration Enhancement Plan

## Current State
- Basic tour data structure with limited fields
- Single product retrieval implementation
- Missing critical data for AI recommendations
- Location data not properly captured
- No bulk loading capability
- No pricing/availability sync

## Enhancement Goals
1. Enhance database schema to capture comprehensive tour data
2. Implement bulk loading and data sync for selected regions
3. Add availability and pricing retrieval
4. Support future booking capabilities
5. Improve location data handling

## Geographical Scope - Phase 1
Initial implementation limited to:
- United Kingdom
- Ireland
- Italy
- France
- Caribbean

## Database Schema Enhancements

### Tour Model Updates
```prisma
model Tour {
  id          String   @id @default(cuid())
  tourId      String   @unique // Viator's product code
  title       String
  description String   @db.Text
  location    Json     // Enhanced with full address, pickup points
  ratings     Float
  reviews     Int
  categories  String[] // Using Viator tags
  duration    String   // Proper duration format
  priceRange  Json     // Enhanced pricing info
  schedule    Json?    // Enhanced availability data
  
  // New fields
  images      Json[]   // Tour images
  inclusions  String[] // What's included
  exclusions  String[] // What's not included
  highlights  String[] // Key features
  itinerary   Json?    // Detailed itinerary
  bookingInfo Json     // Confirmation settings, requirements
  languages   String[] // Available languages
  accessibility String[] // Accessibility features
  tags        Int[]    // Viator tag IDs
  productUrl  String   // Viator booking URL with partner IDs
  
  // Review data
  reviewCount Int
  ratingAvg   Float
  reviewsData Json?    // Detailed review statistics
  
  // Metadata
  status      String   // ACTIVE/INACTIVE
  region      String   // For filtering by supported regions
  lastSync    DateTime // Last data sync timestamp
  updatedAt   DateTime @updatedAt
  createdAt   DateTime @default(now())
}
```

## Implementation Plan

### Phase 1: Data Structure & Bulk Loading
1. Update database schema with new fields
2. Implement destination and attraction data caching
   - Daily refresh cycle
   - Store in separate tables for efficient lookups
   - Filter by supported regions
3. Create bulk loading system using /products/modified-since
   - Initial full catalog ingestion for supported regions
   - Daily scheduled updates
   - Manual update trigger endpoint
   - Track sync cursor for incremental updates
4. Enhance location data handling using /locations/bulk
   - Cache location details
   - Weekly refresh cycle
   - On-demand updates for new locations

### Phase 2: Enhanced Data Capture
1. Update ViatorClient.ts to capture all available data:
   - Complete product details
   - Images and media
   - Booking requirements
   - Accessibility information
   - Language options
   - Reviews and ratings
   - Tags and categories
2. Implement proper error handling and retry logic
3. Add rate limiting compliance
4. Create data validation and transformation layer

### Phase 3: Availability & Pricing
1. Implement availability schedule sync
   - Cache future availability
   - Daily updates via /availability/schedules/modified-since
2. Add real-time availability checking
   - Direct API calls for selected dates
   - Price range updates
3. Store historical pricing data for trends
4. Implement booking URL generation with partner IDs

### Phase 4: AI Integration Support
1. Create data enrichment pipeline
   - Tag categorization
   - Location normalization
   - Duration standardization
2. Add metadata for AI decision making:
   - Popularity metrics
   - Booking patterns
   - Seasonal trends
   - Quality indicators
3. Implement data export format for LLM consumption

## API Endpoints to Implement

1. Bulk Data Management
```typescript
/api/tours/sync              // Trigger manual sync
/api/tours/destinations      // Get cached destinations
/api/tours/attractions       // Get cached attractions
```

2. Tour Data Access
```typescript
/api/tours/search           // Enhanced search with filters
/api/tours/availability     // Check real-time availability
/api/tours/pricing         // Get current pricing
/api/tours/{id}/details    // Get complete tour details
```

3. AI Support
```typescript
/api/tours/recommendations  // Get AI-powered recommendations
/api/tours/export          // Export formatted data for LLM
```

## Update Schedule

1. Regular Updates
- Product data: Daily sync at off-peak hours
- Availability: Daily sync for future dates
- Destinations: Weekly refresh
- Locations: Weekly refresh
- Reviews: Weekly updates

2. Manual Updates
- On-demand sync endpoint for immediate updates
- Rate-limited to prevent API abuse
- Region-specific update capability

## Maintenance Considerations

1. Data Volume Management
- Focus on supported regions only
- Implement data retention policies
- Archive inactive tours
- Consider database partitioning by region

2. Performance Optimization
- Index key search fields
- Cache frequently accessed data
- Implement query optimization
- Consider read replicas for heavy loads

3. Error Handling
- Implement retry logic with exponential backoff
- Log failed updates for manual review
- Alert on sync failures
- Monitor API rate limits

## Next Steps

1. Database Migration
   - Create new schema
   - Plan data migration
   - Set up backup strategy

2. Client Updates
   - Enhance ViatorClient.ts
   - Add new data handlers
   - Implement sync logic

3. Testing
   - Create comprehensive test suite
   - Validate data integrity
   - Test sync performance
   - Verify rate limiting

4. Documentation
   - Update API documentation
   - Document data structures
   - Create maintenance guides
   - Document regional limitations