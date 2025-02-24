# AI Travel Chat

## Overview

An interactive travel planning assistant powered by AI, using OpenRouter to provide flexible model selection for personalized travel recommendations and itineraries. Integrates with Viator's API for real-time tour availability and booking information.

### Prerequisites

- Node.js (v18 or later)
- OpenRouter Account
- PostgreSQL Database
- Viator API Access (Sandbox/Production)

### Setup

1. Create an account at [OpenRouter](https://openrouter.ai/)
2. Generate an API key in your account dashboard
3. Copy the `.env.local.example` file and add your API keys

```bash
cp .env.local.example .env.local
# Then edit .env.local and add your API keys:
# - NEXT_PUBLIC_OPENROUTER_API_KEY
# - VIATOR_API_KEY_SANDBOX
# - VIATOR_API_KEY_PRODUCTION
# - DATABASE_URL
```

4. Install dependencies
```bash
npm install
```

5. Initialize the database
```bash
npx prisma migrate dev
```

6. Run the development server
```bash
npm run dev
```

### Tour Data Management

The application uses Viator's API to manage tour data and recommendations:

#### Data Ingestion

1. **Tag Ingestion**
   ```bash
   npx ts-node --project scripts/tsconfig.json scripts/ingestViatorTags.ts
   ```
   - Fetches and categorizes Viator's tour tags
   - Adds AI-friendly descriptions and significance metadata
   - Organizes tags into categories (tourTypes, quality, features, etc.)
   - Stores processed tags in the local database

2. **Tour Ingestion**
   ```bash
   npx ts-node --project scripts/tsconfig.json scripts/ingestViatorTours.ts
   ```
   - Fetches tour data from Viator's API
   - Transforms and enriches tour information
   - Maintains relationships between tours and tags
   - Stores tours in the local database

### AI-Powered Recommendations

The system uses AI to provide intelligent tour recommendations:

1. **Trip Analysis**
   - Parses trip details from markdown files
   - Identifies travel dates, locations, and preferences
   - Uses AI to understand context and requirements

2. **Tour Selection**
   - Queries local database for relevant tours
   - Uses AI to evaluate tour suitability based on:
     - Tag categories and significance
     - Tour descriptions and features
     - User preferences and trip context
   - Ranks tours by relevance and quality

3. **Availability Verification**
   - Checks real-time availability through Viator API
   - Verifies pricing for specific dates
   - Ensures recommendations are bookable

### Available AI Models

The application supports multiple AI models:
- Claude 2.1 (Anthropic)
- GPT-4 Turbo (OpenAI)
- Gemini Pro (Google)
- Mistral 7B Instruct

### Model Selection

You can select different models programmatically using the `AIClient` methods:

```typescript
// Get available models
const models = AIClient.getAvailableModels();

// Send a command with a specific model
const response = await AIClient.sendNewTripCommand(
  content, 
  systemPrompt, 
  undefined, 
  undefined, 
  'openai/gpt-4-turbo'  // Optional model selection
);
```

### Environment Variables

- `NEXT_PUBLIC_OPENROUTER_API_KEY`: Your OpenRouter API key
- `VIATOR_API_KEY_SANDBOX`: Viator sandbox API key
- `VIATOR_API_KEY_PRODUCTION`: Viator production API key
- `VIATOR_USE_PRODUCTION`: Set to 'true' to use production API
- `DATABASE_URL`: PostgreSQL database connection string

### Features

- Flexible AI model selection
- Travel planning assistance
- Multiple AI provider support
- Viator tour integration
- Smart tour recommendations
- Real-time availability checking
- Easy configuration

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### License

Distributed under the MIT License. See `LICENSE` for more information.

### Contact

Your Name - [Your Email]

Project Link: [https://github.com/yourusername/ai-travel-chat](https://github.com/yourusername/ai-travel-chat)
