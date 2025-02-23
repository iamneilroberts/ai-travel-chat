# Database Schema Simplification Plan

## Current Issues
1. JSONB[] array type for images causing schema issues
2. Multiple optional JSON fields adding complexity
3. Required fields without defaults blocking migration

## Proposed Changes

### Fields to Remove
1. `images` - Remove JSONB[] field entirely for now
2. Optional JSON fields that can be added later:
   - `schedule` (availability data)
   - `itinerary` (detailed itinerary)
   - `reviewsData` (detailed review statistics)

### Fields to Keep (Core Functionality)
1. Essential Tour Info:
   - id, tourId, title, description
   - location (JSON)
   - ratings, reviews
   - categories, duration
   - priceRange (JSON)

2. Basic Additional Info:
   - inclusions, exclusions, highlights (string arrays)
   - languages, accessibility (string arrays)
   - tags (integer array)
   - productUrl

3. Required Metadata:
   - status
   - region  
   - lastSync
   - updatedAt
   - createdAt

### Implementation Steps
1. Create new migration to:
   - Drop problematic fields
   - Add default values for required fields
   - Keep core functionality intact

2. Update TypeScript interfaces to match simplified schema

3. Modify ingestion script to:
   - Remove handling of dropped fields
   - Ensure all required fields have values

4. Test bulk load functionality with simplified schema

## Future Enhancements
- Re-add image support with proper field type
- Gradually add back optional JSON fields with proper validation
- Consider splitting complex data into separate tables

## Success Criteria
1. Clean migration without errors
2. Successful bulk data ingestion
3. Tour recommendation system functioning
4. Core tour data preserved and queryable