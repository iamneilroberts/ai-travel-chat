# Changes Log

2025-02-23:
- Enhanced Viator tour ingestion with bulk loading:
  - Added getModifiedProducts method to ViatorClient for bulk product retrieval
  - Added bookingConfirmationSettings to product data interface
  - Added filtering for INSTANT confirmation products only
  - Added cursor storage functionality for tracking ingestion progress
  - Added new initialization command for full catalog ingestion
  - Implemented pagination handling with cursor-based navigation
  - Added date range filtering for product ingestion
  - Simplified ingestion script to remove region filtering
  - Added progress logging for bulk operations
  - Fixed TypeScript issues with tour data handling
  - Added proper error handling and logging
  - Updated ingestion process to follow Viator's recommended approach
  - Added support for storing and retrieving last cursor position
  - Enhanced error handling with detailed logging

- Added Ireland tour testing functionality:
  - Added freetext search capability to ViatorClient
  - Created interfaces for freetext search request/response
  - Implemented searchTours method with filtering options
  - Created testIrelandTours.ts script for exploring Irish tours
  - Added comprehensive logging for search results
  - Set up test infrastructure for analyzing tour data

- Fixed tour schema and ingestion issues:
  - Simplified tour schema by removing problematic fields
  - Removed image arrays and optional JSON fields
  - Updated TypeScript types to match simplified schema
  - Modified ingestion script to use test data
  - Successfully tested database operations with simplified schema
  - Added detailed logging for debugging
  - Fixed JSON field handling in Prisma operations

- Enhanced Viator tour data model with more comprehensive fields:
  - Added support for detailed location information
  - Included tour images, inclusions, exclusions
  - Added booking information and review data
  - Implemented region-based filtering for tours
  - Enhanced ViatorClient with more robust API interaction methods
- Updated Prisma schema to support new tour data structure
- Refactored ViatorClient to handle more complex tour data retrieval
- Improved test script for Viator API integration
- Added more detailed error handling in API calls
- Implemented region determination for tours
- Enhanced type definitions for tour-related data

- Implemented Viator tour recommendations feature:
  - Added Prisma with PostgreSQL for tour data storage
  - Created Tour model and database schema
  - Implemented Viator API client for fetching tour data
  - Added tour ingestion script for bulk data import
  - Created tour recommendations API endpoint
  - Added TourRecommendations React component
  - Integrated recommendations into main UI
  - Added database initialization and management scripts
  - Added new npm scripts for database operations
  - Created comprehensive types for tour-related data
  - Implemented AI-powered tour search parameter generation
  - Added tour relevance scoring system
  - Added real-time availability checking
  - Updated page layout to include recommendations panel

2025-02-05:
- Fixed useCallback error in HtmlPreview component:
  - Added missing useCallback import from React
  - Fixed import statement formatting
  - Resolved "useCallback is not defined" runtime error

2024-02-04:
- Enhanced HTML preview edit mode:
  - Added proper border and focus states to textarea
  - Improved tab key handling with 2-space indentation
  - Added content validation before saving
  - Fixed cursor position after tab insertion
  - Added visual feedback for focus states
  - Maintained proper whitespace formatting
  - Improved overall editing experience

2024-02-04:
- Fixed trip options handling:
  - Fixed "Missing required trip details" error when accepting options
  - Improved content state management in useTripManagement hook
  - Updated option generation to properly save options in content
  - Fixed race condition between template and actual options
  - Removed dependency on Original Request section
  - Streamlined content updates for better reliability

2024-02-04:
- Added quick interaction commands:
  - Added /describe command for getting detailed information about places/activities
  - Added /verify command for validating trip items
  - Updated CommandProcessor to handle new commands
  - Added new command handlers in AIClient
  - Enhanced ChatInterface to support command-specific processing messages
  - Added command documentation to system prompt
  - Improved user feedback with contextual processing messages

2024-02-04:
- Enhanced edit mode in HTML preview:
  - Fixed textarea editability issues
  - Improved text formatting with proper line height and spacing
  - Added monospace font for better code readability
  - Enabled whitespace preservation for proper Markdown formatting
  - Disabled spellcheck for code editing
  - Added proper tab size handling
  - Improved overall editing experience

2024-02-04:
- Fixed content duplication in trip details:
  - Removed duplicate "Original Request" section
  - Simplified initial trip description format
  - Improved content organization
  - Removed redundant information display
  - Enhanced readability of trip details

2024-02-04:
- Improved trip details editing experience:
  - Removed separate CollapsibleEditor component
  - Added in-place editing directly in HTML preview
  - Added Edit/Save buttons to preview controls
  - Simplified UI by removing redundant editor window
  - Improved user experience with seamless editing workflow
  - Added proper state management for edit mode

2024-02-04:
- Added "Suggest Changes" button to trip plan preview:
  - Added reject plan functionality to PreviewControls component
  - Added rejection dialog with feedback input
  - Updated HtmlPreview to support plan rejection
  - Separated plan rejection from direct editing functionality
  - Improved user experience with clear feedback mechanism
  - Added proper TypeScript types and error handling

2024-02-04:
- Redesigned trip-details.md editor interface:
  - Moved editor into the HTML preview area for in-place editing
  - Added toggle button to switch between preview and edit modes
  - Removed redundant editor from bottom of page
  - Simplified editor controls by removing unnecessary buttons
  - Improved user experience with clearer editing workflow
  - Added visual feedback for edit mode state

2024-02-04:
- Enhanced trip-details.md editor functionality:
  - Added unsaved changes indicator in CollapsibleEditor
  - Moved save button to CollapsibleEditor header for better visibility
  - Removed redundant save button from MarkdownEditor
  - Improved visual feedback for editing state
  - Streamlined editor controls interface

2024-02-04:
- Added detailed plan rejection feature:
  - Updated system prompt to handle detailed plan rejections
  - Modified CommandProcessor to support detailed plan rejection notes
  - Updated AIClient to handle detailed plan rejection parameters
  - Added handleDetailedPlanReject function to useTripManagement hook
  - Fixed TypeScript errors and improved error handling
  - Added proper parameter passing for rejection notes
  - Improved code organization and maintainability

2024-02-04:
- Optimized welcome screen content:
  - Streamlined content to reduce vertical scrolling
  - Consolidated sections for better space efficiency
  - Combined similar examples into a more concise format
  - Improved content hierarchy and organization
  - Reduced redundancy while maintaining key information
  - Enhanced readability with focused essential content

2024-02-04:
- Improved command processing and system prompt handling:
  - Modified command processor to properly separate system prompt and trip details
  - Updated AI client to extract and handle system prompt correctly
  - Removed welcome screen content from AI requests
  - Improved command formatting structure
  - Updated TypeScript target to ES2018 for regex support
  - Enhanced system prompt placement in API requests

2024-02-04:
- Enhanced trip-details.md template:
  - Added Initial Trip Request section to preserve complete raw requests
  - Added Trip Planning History section for tracking changes
  - Improved template structure for better organization
  - Maintained existing sections for trip details

2024-02-04:
- Initialized git repository and renamed project:
  - Renamed project from "create-ai-travel-chat" to "ai-travel-chat"
  - Set up initial git repository
  - Added .gitignore for node_modules and other build artifacts
  - Created initial commit with base project structure
