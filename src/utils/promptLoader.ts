export interface SystemPrompt {
  name: string;
  path: string;
  content?: string;
}

export class PromptLoader {
  private static API_BASE = '/api/prompts';

  static async listPrompts(): Promise<SystemPrompt[]> {
    try {
      const response = await fetch(this.API_BASE);
      if (!response.ok) {
        throw new Error(`Failed to list prompts: ${response.statusText}`);
      }

      const data = await response.json();
      return data.prompts;
    } catch (error) {
      console.error('Error listing prompts:', error);
      return [];
    }
  }

  static async loadPrompt(promptPath: string): Promise<string> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promptPath }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load prompt: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error loading prompt:', error);
      return '';
    }
  }
}
