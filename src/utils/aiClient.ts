export interface AIResponse {
  content: string;
  error?: string;
  rawResponse?: any;
  rawRequest?: any;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  context_length: number;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

export class AIClient {
  private static OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  private static DEFAULT_MODEL = 'anthropic/claude-2.1';

  private static AVAILABLE_MODELS: AIModel[] = [
    {
      id: 'anthropic/claude-2.1',
      name: 'Claude 2.1',
      provider: 'Anthropic',
      context_length: 200000
    },
    {
      id: 'openai/gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      context_length: 128000
    },
    {
      id: 'google/gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      context_length: 32000
    },
    {
      id: 'mistralai/mistral-7b-instruct',
      name: 'Mistral 7B Instruct',
      provider: 'Mistral',
      context_length: 32000
    },
    {
      id: 'deepseek/deepseek-r1:free',
      name: 'DeepSeek R1 (Free)',
      provider: 'DeepSeek',
      context_length: 16000
    }
  ];

  static getAvailableModels(): AIModel[] {
    return this.AVAILABLE_MODELS;
  }

  private static validateResponse(data: OpenRouterResponse): string {
    // Check for API error response
    if (data.error) {
      throw new Error(`API error: ${data.error.message || 'Unknown error'}`);
    }

    // Check if choices array exists and is not empty
    if (!data.choices || data.choices.length === 0) {
      console.error('API Response:', JSON.stringify(data, null, 2));
      throw new Error('API response missing choices array');
    }

    const firstChoice = data.choices[0];
    
    // Check if message exists
    if (!firstChoice.message) {
      console.error('First choice:', JSON.stringify(firstChoice, null, 2));
      throw new Error('API response missing message in first choice');
    }

    // Check if content exists and is a string
    if (typeof firstChoice.message.content !== 'string') {
      console.error('Message:', JSON.stringify(firstChoice.message, null, 2));
      throw new Error('API response missing content in message');
    }

    return firstChoice.message.content;
  }

  static async sendCommand(
    command: string,
    rejectionNote?: string,
    alternatives?: string[],
    model: string = this.DEFAULT_MODEL,
    systemPrompt?: string
  ): Promise<AIResponse> {
    if (!this.API_KEY) {
      return {
        content: '',
        error: 'OpenRouter API key is not configured'
      };
    }

    try {
      const requestBody = {
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are a helpful AI assistant for travel planning.'
          },
          {
            role: 'user', 
            content: command
          }
        ],
        max_tokens: 4000,
        temperature: 0.7, // Add some randomness to get varied responses
        top_p: 0.9 // Maintain good response quality
      };

      // Store the raw request for debugging
      console.log('Raw API request:', requestBody);

      const response = await fetch(this.OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': 'https://github.com/yourusername/create-ai-travel-assistant',
          'X-Title': 'AI Travel Assistant'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed: ${response.statusText} - ${errorBody}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      // Store the raw response for debugging
      console.log('Raw API response:', data);

      try {
        const content = this.validateResponse(data);
        return {
          content,
          rawResponse: data,
          rawRequest: requestBody
        };
      } catch (validationError) {
        console.error('Response validation error:', validationError);
        return {
          content: '',
          error: validationError instanceof Error ? validationError.message : 'Invalid response format',
          rawResponse: data,
          rawRequest: requestBody
        };
      }
    } catch (error) {
      console.error('OpenRouter API error:', error);
      // Handle cancellation errors silently
      if (error && typeof error === 'object' && 'type' in error && error.type === 'cancellation') {
        console.log('Operation cancelled');
        return {
          content: '',
          error: undefined
        };
      }
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async sendNewTripCommand(
    content: string, 
    systemPrompt: string,
    rejectionNote?: string,
    alternatives?: string[],
    model?: string
  ): Promise<AIResponse> {
    const command = `/new\n${content}`;
    return this.sendCommand(command, rejectionNote, alternatives, model, systemPrompt);
  }

  static async sendBuildTripCommand(
    content: string,
    systemPrompt: string,
    model?: string
  ): Promise<AIResponse> {
    const command = `/build\n${content}\nSystem Prompt:\n${systemPrompt}`;
    return this.sendCommand(command, undefined, undefined, model);
  }

  // Keeping mock response for development/testing
  static async mockResponse(command: string): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (command.includes('/new') && !command.includes('Rejection Note:')) {
      return {
        content: `# Trip Summary

## Overview
Based on your requirements, here are three potential literary tour options for Sara and Darren's anniversary:

### Option 1: Classic Literary London & Countryside
- Focus on major literary sites in London
- Explore Jane Austen's Bath
- Visit the Brontë Parsonage in Yorkshire
- Estimated cost: $4,800

### Option 2: Shakespeare & Medieval Libraries
- Extended stay in Stratford-upon-Avon
- Oxford and Cambridge library tours
- Historic bookshops exploration
- Estimated cost: $4,600

### Option 3: Hidden Literary Gems
- Lesser-known author homes
- Boutique bookstores in small towns
- Quiet countryside retreats
- Estimated cost: $4,700

## Travelers
Sara and Darren, celebrating their 25th anniversary. Mid-40s couple who prefer to avoid crowded tourist spots.

## Duration & Dates
10 days in total, flexible on exact dates

## Budget
All options within $5000 budget excluding flights

## Preferences
- Accommodation: Boutique hotels with literary connections
- Transportation: Mix of train and private transfers
- Activities: Focused on literary history and local culture
- Special Requirements: Avoiding peak tourist times

## Selected Itinerary
Please review the options above and select your preferred itinerary, or reject with a note for new alternatives.

## Notes
- All options include private guided tours
- Evening literary events available
- Local dining recommendations included`
      };
    }

    return {
      content: 'Command not recognized',
      error: 'Invalid command type'
    };
  }
}
