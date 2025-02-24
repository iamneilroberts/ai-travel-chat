# Changes Log

2025-02-24:
- Fixed ESLint and TypeScript issues for Vercel deployment:
  - Added ESLint configuration for TypeScript and React Hook rules
  - Fixed hook dependency warnings in ProgressIndicator and PromptSelector
  - Fixed type issues in useTripAlternatives hook
  - Added .npmrc for legacy peer dependencies
  - Upgraded Monaco editor for React 19 compatibility

- Fixed Viator search pagination issues:
  - Updated searchTours count parameter to respect 50-item limit
  - Added validation in ViatorClient for pagination parameters
  - Added documentation about API pagination limits
  - Updated test script to use correct pagination values

- Enhanced Viator tag handling and tour data storage:
  - Added Tag and TourTag models to Prisma schema
  - Implemented tag relationship tracking in database
  - Added support for storing raw tag IDs from Viator
  - Added tag synchronization functionality
  - Enhanced tour data transformation with tag relationships
  - Added proper handling of tour-tag associations
  - Updated test script to fetch and store tag data

- Implemented and tested Viator freetext search functionality:
  - Created testViatorSearch.ts script to verify API functionality
  - Successfully tested API connectivity and search endpoint
  - Added proper duration transformation for different duration formats
  - Implemented tour data transformation and database storage
  - Added detailed logging of API responses
  - Fixed TypeScript type issues with API response handling
  - Successfully saved London tours to database

2025-02-23:
[Previous entries remain unchanged...]
