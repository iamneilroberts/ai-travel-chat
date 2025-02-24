# Viator Search Test Plan

## Issue
The testViatorSearch.ts script is failing with the error:
```
Error: Viator API error: searchType.pagination.count must be between 1 and 50
```

## Analysis
- The test script is currently requesting 100 results per page
- The Viator API has a limit of 50 results per page
- Need to update pagination parameters to comply with API limits

## Solution Plan
1. Update testViatorSearch.ts:
   - Modify the count parameter to be within the 1-50 range
   - Suggest using 50 to get maximum allowed results per request

2. Add Validation in viatorClient.ts:
   - Add validation to ensure count is between 1-50
   - Throw clear error message if invalid count is provided
   - Consider automatically capping at 50 instead of throwing error

3. Documentation:
   - Add clear documentation about pagination limits
   - Document how to handle cases where more than 50 results are needed

## Implementation Notes
- The count parameter should be set to 50 or less
- For cases where more than 50 results are needed, multiple requests with updated start parameters will be required
- Consider implementing pagination helper methods in the future if needed

## Testing
After implementation:
1. Test with count = 50 (maximum allowed)
2. Test with count = 1 (minimum allowed)
3. Verify error handling for invalid counts