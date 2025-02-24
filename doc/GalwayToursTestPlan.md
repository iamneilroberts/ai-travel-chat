# Galway Tours Test Plan - Updated

## Issue Analysis
The "Missing pagination" error occurs because the Viator API expects pagination parameters (start and count) at the top level of the request, not nested within other objects.

## Required Changes

1. Update FreetextSearchRequest Interface:
```typescript
interface FreetextSearchRequest {
  searchTerm: string;
  currency: string;
  start: number;     // Add at top level
  count: number;     // Add at top level
  searchTypes: Array<SearchType>;
  productFiltering?: {
    destinationIds?: string[];
    locationIds?: string[];
    categories?: string[];
  };
  productSorting?: {
    sortBy: 'RELEVANCE' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'RATING';
    sortOrder: 'ASC' | 'DESC';
  };
}
```

2. Update SearchType Interface:
```typescript
interface SearchType {
  searchType: 'PRODUCTS' | 'DESTINATIONS' | 'ATTRACTIONS';
}
```

3. Update Request Construction:
```typescript
const data: FreetextSearchRequest = {
  searchTerm,
  currency: options.currency || 'USD',
  start: options.start || 1,
  count: options.count || 50,
  searchTypes: [{
    searchType: 'PRODUCTS'
  }],
  // ... rest of the request
};
```

## Test Steps
1. Update viatorClient.ts with the new interface and request structure
2. Run the test script to verify the changes
3. Verify successful API response
4. Confirm tours are saved to database

## Success Criteria
- API returns 200 status code
- Response contains Galway tours
- Tours are successfully saved to database

## Implementation Plan
Switch to code mode to:
1. Update the interfaces in viatorClient.ts
2. Modify the searchTours method
3. Test the changes with the Galway tours test script