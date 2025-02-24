# Ireland Tour Test Plan

## Objective
Test bulk loading of Viator tour data specifically for Ireland, using a systematic approach to first identify the correct filtering parameters and then implement the bulk loading functionality.

## Phase 1: Identify Ireland Tours Using Freetext Search

1. Use the search/freetext endpoint to:
   - Search for "Ireland" to see what fields are returned
   - Analyze the response to identify:
     - Location/destination identifiers
     - Country codes
     - Region identifiers
   - Document the relevant field(s) that can be used to filter Ireland tours

2. Test different search terms:
   - "Ireland"
   - "Dublin"
   - Other major Irish cities
   - Note which provides the most accurate results

## Phase 2: Verify with Destinations API

1. Call the destinations endpoint to:
   - Get the official Viator destination ID for Ireland
   - Understand the hierarchy (country vs. city destinations)
   - Confirm the correct identifier to use for filtering

## Phase 3: Implement Test Script

1. Modify testViatorApi.ts to:
   - Add a new test function for freetext search
   - Test searching with the identified parameters
   - Log results to verify correct filtering

2. Create a new test file specifically for Ireland tours:
   - Start with a small subset (e.g., 10 tours)
   - Include proper error handling
   - Log results to a debug file

## Phase 4: Bulk Loading Implementation

1. Update ViatorClient class:
   - Add new methods for bulk tour loading
   - Implement proper filtering for Ireland
   - Include pagination handling
   - Add proper error handling and logging

2. Modify ingestViatorTours.ts:
   - Update the ingestToursByRegion method
   - Add Ireland-specific handling
   - Implement proper database storage

## Phase 5: Testing and Verification

1. Create test cases:
   - Test with small batch (10 tours)
   - Verify correct filtering
   - Check data integrity
   - Validate region mapping

2. Monitor and log:
   - Create separate log file for Ireland ingestion
   - Track API rate limits
   - Monitor data quality

## Success Criteria

1. Successfully identify Ireland-specific tours
2. Correctly filter and load a small subset of tours
3. Proper error handling and logging
4. Data integrity in database
5. Clear documentation of the process

## Implementation Notes

- Use existing logging infrastructure
- Follow established TypeScript conventions
- Maintain proper error handling
- Document API responses for future reference
- Keep initial test size small to avoid rate limiting