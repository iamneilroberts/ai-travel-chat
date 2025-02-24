# Viator Integration Plan

## Current Understanding
We've been trying to build a full product catalog integration, but Viator's architecture is designed for a different approach:

1. They expect partners to:
   - Build destination-based search interfaces
   - Use real-time product search and filtering
   - Direct users to viator.com for detailed product pages and booking

2. This explains our access issues:
   - Basic endpoints like /destinations work
   - Bulk ingestion endpoints require special access
   - The intended approach uses /products/search instead

## Revised Architecture

### 1. Destination Management
- Use /v1/taxonomy/destinations endpoint
- Cache destination data locally
- Update destination cache daily
- Implement destination search/filtering

### 2. Product Search
- Use /products/search endpoint for real-time results
- Implement filtering options:
  - Price ranges
  - Tags (categories)
  - Free cancellation
  - Date ranges
- Add sorting capabilities:
  - Price (high/low)
  - Rating
  - Relevance

### 3. Product Display
- Show product previews with:
  - Title
  - Thumbnail image
  - Short description
  - Average rating
  - Review count
  - Price
- Link to viator.com for full details/booking

### 4. User Experience
- Implement destination search
- Add filter controls
- Add sort options
- Allow date/price range selection
- Support pagination

## Implementation Steps

1. Phase 1: Destination Setup
   - Implement destination data caching
   - Create destination update scheduler
   - Build destination search interface

2. Phase 2: Product Search
   - Implement /products/search integration
   - Add filtering logic
   - Add sorting capabilities
   - Handle pagination

3. Phase 3: UI Components
   - Build destination browser
   - Create product preview cards
   - Implement filter controls
   - Add sorting controls

4. Phase 4: Integration
   - Connect to trip planning system
   - Add destination recommendations
   - Implement search history
   - Add favorite destinations

## Next Steps
1. Update ViatorClient to focus on destination and search endpoints
2. Create destination data management system
3. Build product search and preview components
4. Integrate with existing trip planning features