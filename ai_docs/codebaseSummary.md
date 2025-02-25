# Codebase Summary

## Project Overview
AI Travel Chat is a modern web application that provides personalized travel recommendations using AI. The application is built with a Next.js frontend and integrates with various AI services for intelligent travel suggestions.

## Directory Structure
- `/src/`: Core application source code
  - `/components/`: React components
  - `/pages/`: Next.js pages and API routes
  - `/styles/`: Global styles and theme configuration
- `/scripts/`: Utility scripts and AI recommendation logic
- `/prisma/`: Database schema and migrations
- `/public/`: Static assets
- `/ai_docs/`: AI documentation and feature tracking
- `/doc/`: Project documentation
- `/testing/`: Test files and test utilities

## Key Components
1. AI Recommendation Engine
   - Location: `/scripts/aiRecommendations.ts`
   - Purpose: Core logic for generating travel suggestions

2. Database Integration
   - Technology: Prisma ORM
   - Schema: `/prisma/schema.prisma`

3. Frontend Architecture
   - Framework: Next.js
   - Styling: Tailwind CSS
   - State Management: React Context/Hooks

4. Testing Infrastructure
   - Framework: Jest
   - Location: `/testing/`

## Development Workflow
1. Feature Development
   - Track in `/ai_docs/features_in_progress/`
   - Move to `/ai_docs/features_done/` when complete

2. Documentation
   - Maintain feature documentation
   - Update technical documentation
   - Keep changelog current

3. Testing
   - Write tests for new features
   - Maintain test coverage

## Configuration
- Environment variables in `.env`
- Next.js config in `next.config.ts`
- TypeScript config in `tsconfig.json`
- ESLint config in `eslint.config.mjs`

## Getting Started
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development server: `npm run dev`
4. Run tests: `npm test`
