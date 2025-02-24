# Viator API Configuration Plan

## Current Issues
- Getting 403 Forbidden error when attempting to access /products/modified-since endpoint
- Current API access level (Basic-access) does not have permission for bulk product ingestion
- Need proper access level for production environment

## Implementation Plan

### 1. API Access Requirements
- /products/modified-since endpoint requires higher access level:
  - Full-access Affiliate
  - Full + Booking access Affiliate
  - Merchant
- Need to contact Viator to upgrade access level for production use
- Basic endpoints like /destinations are working correctly

### 2. Development Strategy
- Continue development using sandbox environment
- Use /products/bulk endpoint for testing with small product subset
- Implement proper error handling and logging
- Prepare for production upgrade

### 3. Configuration Updates
- Maintain proper headers:
  - exp-api-key: API key from environment
  - Accept: application/json;version=2.0
  - Accept-Language: en-US
  - Accept-Encoding: gzip
  - User-Agent: AI-Travel-Chat/1.0
- Enhanced error logging with:
  - Detailed API response information
  - Masked API keys in logs
  - Specific error handling for different status codes

### 4. Testing Steps
1. Test API connectivity with basic endpoints
2. Verify sandbox environment functionality
3. Test with small product subset using /products/bulk
4. Monitor and log all API interactions

### 5. Success Criteria
- Successful authentication with API
- Access to appropriate endpoints based on current level
- Proper error handling and logging in place
- Clear upgrade path identified

## Next Steps
1. Continue development in sandbox environment
2. Contact Viator about upgrading access level
3. Consider implementing /products/bulk endpoint for initial testing
4. Once access level is upgraded:
   - Switch to production environment
   - Implement full catalog ingestion
   - Monitor and verify successful data ingestion