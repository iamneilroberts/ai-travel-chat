# Changes Log

2024-02-04:
- Enhanced debug window functionality:
  - Improved debug info handling in useTripAlternatives hook
  - Added proper TypeScript types for response state
  - Fixed raw request/response preservation in error cases
  - Enhanced CollapsibleDebug component with better formatting
  - Added indicators for available debug data
  - Improved error messages for parsing failures
  - Added empty state handling for debug display
  - Added JSON string parsing for better formatting
  - Added visual indicators for request/response data availability
  - Improved dark mode support in debug window

2024-02-04:
- Fixed hydration error in MessageBubble component:
  - Modified timestamp formatting to be consistent between server and client
  - Replaced toLocaleTimeString with custom time formatter
  - Used useMemo to optimize time formatting
  - Resolved React hydration mismatch warnings

2024-02-04:
- Refactored page.tsx into smaller, more manageable components:
  - Created Layout directory with MainLayout, HeaderSection, and ContentSection components
  - Extracted error handling logic into errorHandling.ts utility
  - Created useTheme hook for dark mode management
  - Created useTripManagement hook for trip-related state and handlers
  - Improved code organization and maintainability
  - Reduced page.tsx complexity by ~70%
  - Added proper TypeScript interfaces for all components

2024-02-04:
- Cleaned up unused code and dependencies:
  - Removed unused Tailwind Typography plugin and configuration
  - Removed unused markdown processing system (markdownProcessor.ts)
  - Removed unused dependencies (remark, remark-gfm, remark-html, unified)
  - Removed @tailwindcss/typography from devDependencies
  - Updated project name from "temp" to "create-ai-travel-assistant"
  - Simplified tailwind configuration

2024-02-04:
- Improved error handling:
  - Modified error handling to silently handle cancellation errors
  - Updated formatError to return null for errors that should be ignored
  - Added explicit cancellation error checks in promise rejection handlers
  - Improved error display logic to skip silently handled errors
  - Fixed error display in command execution and trip option handling
  - Added handling for empty object errors to prevent unnecessary error displays

2024-02-04:
- Improved error handling:
  - Added specific handling for empty object errors `{}`
  - Modified formatError to silently handle empty object errors
  - Improved error message filtering to reduce noise

2024-02-04:
- Fixed trip destination handling:
  - Modified command formatting to prioritize trip details
  - Added explicit instruction to respect specified destination
  - Reordered command structure to emphasize initial requirements
  - Improved prompt clarity for destination adherence

2024-02-04:
- Added debug window and fixed system prompt handling:
  - Created new CollapsibleDebug component for showing API requests/responses
  - Fixed system prompt not being properly included in API requests
  - Modified aiClient.ts to use provided system prompt instead of hardcoded one
  - Added debug info to ChatInterface component
  - Made debug window collapsible like the editor
  - Added request/response tabs in debug view
  - Fixed TypeScript type issues with debugInfo

2024-02-04:
- Improved HTML and markdown rendering:
  - Updated HtmlPreview component to handle both HTML and markdown content
  - Added custom styling for markdown headings and lists
  - Fixed issue with raw HTML being displayed instead of rendered content
  - Removed prose classes when rendering HTML to prevent style conflicts

- Enhanced dark mode support: 
  - Added MutationObserver to track theme changes in real-time
  - Implemented proper dark mode colors for text and backgrounds
  - Fixed contrast issues in dark mode for better readability
  - Added theme-aware styling for markdown content

- Improved error handling:
  - Added better error formatting for object-type errors
  - Improved error message display with proper JSON stringification
  - Added pre-wrap and monospace font for error messages
  - Increased error message container width for better readability

- Updated welcome content:
  - Converted HTML content to markdown format for better maintainability
  - Improved content organization with clearer sections
  - Added "Things to Try" section with practical suggestions
  - Enhanced typography and spacing for better readability

- UI/UX improvements:
  - Fixed theme toggle button position to prevent overlap
  - Added transition effects for color changes
  - Improved spacing and layout in dark mode
  - Enhanced visual hierarchy with consistent heading styles

- Code quality improvements:
  - Added proper TypeScript type assertions
  - Improved state management for theme handling
  - Enhanced component reusability
  - Added proper cleanup for event listeners and observers

2024-02-04:
- Enhanced trip planning workflow:
  - Modified handleTripOptionAccept to automatically trigger build command after selecting a trip option
  - Improved user experience by seamlessly transitioning from option selection to detailed plan building

2024-02-04:
- Fixed layout and error handling issues:
  - Resolved vertical scrollbar issue by properly constraining main container height
  - Improved error handling with better object error formatting and error message conversion
  - Added proper error boundary around error formatting logic
  - Added global error handler to catch and display page-level errors
  - Unified error display for both command and page errors
  - Enhanced error formatting to handle circular references and special cases
  - Added specific handling for "Object: Object" error pattern
  - Added DOMPurify for HTML sanitization
  - Improved error handling in HtmlPreview component
  - Added fallback content for rendering failures
  - Configured DOMPurify to safely handle style tags
  - Added proper attribute allowlist for HTML elements
  - Added unhandled promise rejection handling
  - Improved error handling for system prompt initialization
  - Added comprehensive error event listeners
  - Added specific handling for Puppeteer JSHandle objects
  - Improved error message formatting for browser-specific errors
  - Added specific handling for cancellation errors
  - Added handling for browser session closure errors
  - Improved error filtering to ignore expected cancellations
  - Added centralized browser error handling
  - Added silent handling for expected browser errors
  - Improved error logging for browser-specific cases
  - Added robust error checking for Puppeteer objects
  - Added try-catch blocks around error handlers
  - Added fallback error handling for browser errors
