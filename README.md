# AI Travel Chat

## Overview

An interactive travel planning assistant powered by AI, using OpenRouter to provide flexible model selection for personalized travel recommendations and itineraries.

### Prerequisites

- Node.js (v18 or later)
- OpenRouter Account

### Setup

1. Create an account at [OpenRouter](https://openrouter.ai/)
2. Generate an API key in your account dashboard
3. Copy the `.env.local.example` file and add your OpenRouter API key

```bash
cp .env.local.example .env.local
# Then edit .env.local and add your API key
```

4. Install dependencies
```bash
npm install
```

5. Run the development server
```bash
npm run dev
```

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

### Features

- Flexible AI model selection
- Travel planning assistance
- Multiple AI provider support
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
