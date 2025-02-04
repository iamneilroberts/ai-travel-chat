import { Change } from './diffGenerator';

export type CommandType = 'new' | 'select' | 'build' | 'update' | 'save';

export interface Command {
  type: CommandType;
  content: string;
  systemPrompt?: string;
  savePath?: string;
  optionNumber?: number;
}

export interface CommandResult {
  original: string;
  modified: string;
  changes: Change[];
  savedPath?: string;
}

export interface CommandContext {
  currentContent: string;
  savePath?: string;
}

export class CommandProcessor {
  static readonly initialTemplate = `## Initial Trip Description
Enter your initial trip idea or requirements here. This can be as brief or detailed as you like.

## Generated Options
### Option 1
[Details of first generated option will appear here]

### Option 2
[Details of second generated option will appear here]

### Option 3
[Details of third generated option will appear here]

## Selected Option
[The chosen option and its details will be copied here]

## Overview
[This section will be auto-populated based on the selected option]

## Travelers
[This section will be auto-populated based on the initial description and selected option]

## Duration & Dates
[This section will be auto-populated based on the initial description and selected option]

## Budget
[This section will be auto-populated based on the selected option]

## Preferences
[This section will be auto-populated based on the initial description and selected option]

## Selected Itinerary
[This section will be populated with the expanded details of your chosen option]

## Trip Notes
[Any additional notes or modifications to the trip will be tracked here]`;

  private static validateCommand(type: string): boolean {
    return ['new', 'select', 'build', 'update', 'save'].includes(type);
  }

  private static cleanContent(content: string): string {
    // Remove welcome screen content
    const welcomeScreenStart = '# 🌍 AI Travel Assistant:';
    const welcomeScreenEnd = '### Things to Try';
    const welcomeRegex = new RegExp(`${welcomeScreenStart}[\\s\\S]*?${welcomeScreenEnd}[\\s\\S]*?(?=Command:|$)`);
    return content.replace(welcomeRegex, '').trim();
  }

  private static validateContent(content: string): { isValid: boolean; error?: string } {
    if (!content.trim()) {
      return { isValid: false, error: 'Trip details cannot be empty' };
    }

    if (content.length > 12000) {
      return { isValid: false, error: 'Trip details exceed maximum length. Please provide a shorter description.' };
    }

    return { isValid: true };
  }

  private static formatCommandForAI(
    type: CommandType,
    content: string,
    systemPrompt?: string,
    rejectionNote?: string,
    alternatives?: string[],
    optionNumber?: number
  ): string {
    // Clean the content first
    const cleanedContent = this.cleanContent(content);

    // Validate the cleaned content
    const validation = this.validateContent(cleanedContent);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    let formattedCommand = '';

    // Always start with the system prompt if provided
    if (systemPrompt) {
      formattedCommand += `System Prompt:\n${systemPrompt}\n\n`;
    }

    // For new trips, add format instructions before trip details
    if (type === 'new') {
      formattedCommand += `Format Instructions:
Please generate three distinct trip alternatives based on the trip details below. Format each option as follows:

### Option N: [Title]
- Brief overview of the trip concept
- Key highlights and unique aspects
- Estimated total cost
- High-level schedule outline
- Why this option might appeal to the travelers

Example:
### Option 1: Cultural Immersion in Kyoto
- 7-day deep dive into traditional Japanese culture
- Stay in historic ryokan in Southern Higashiyama
- Focus on hands-on experiences: tea ceremony, cooking classes
- Estimated cost: $3,800
- Perfect for travelers seeking authentic cultural experiences
- Key activities: temple visits, craft workshops, garden tours
- Why this fits: Matches interest in cultural immersion and preference for traditional accommodations\n\n`;

      formattedCommand += `IMPORTANT: Generate options ONLY for the destination specified in the Trip Details below. Do not suggest alternatives for other countries or regions.\n\n`;
    }

    // For select command, add option selection context
    if (type === 'select' && optionNumber) {
      formattedCommand += `Selection Instructions:
Please process Option ${optionNumber} from the Generated Options section:
1. Copy the full option details to the Selected Option section
2. Parse the details to populate the Overview, Travelers, Duration & Dates, Budget, and Preferences sections
3. Preserve the Initial Trip Description and other options\n\n`;
    }

    // Add trip details for all commands
    formattedCommand += `Trip Details:\n${cleanedContent}\n\n`;

    // For rejected alternatives, include the context after trip details
    if (type === 'new' && rejectionNote && alternatives) {
      formattedCommand += 'Previously Rejected Alternatives:\n';
      alternatives.forEach((alt, i) => {
        formattedCommand += `Option ${i + 1}:\n${alt}\n`;
      });
      formattedCommand += `\nRejection Note: ${rejectionNote}\n`;
      formattedCommand += `\nPlease provide three new alternatives following the format above, taking into account the rejection feedback.\n\n`;
    }

    // Add the command at the end
    formattedCommand += `Command: /${type}${optionNumber ? ` ${optionNumber}` : ''}`;

    return formattedCommand;
  }

  static processCommand(
    type: CommandType,
    content: string,
    systemPrompt?: string,
    savePath?: string,
    rejectionNote?: string,
    alternatives?: string[],
    optionNumber?: number
  ): { isValid: boolean; formattedCommand?: string; error?: string; savedPath?: string } {
    // Validate the command type
    if (!this.validateCommand(type)) {
      return {
        isValid: false,
        error: 'Invalid command type. Use new, select, build, update, or save'
      };
    }

    // Validate option number for select command
    if (type === 'select' && (!optionNumber || optionNumber < 1 || optionNumber > 3)) {
      return {
        isValid: false,
        error: 'Select command requires a valid option number (1-3)'
      };
    }

    // Format the command with content
    const formattedCommand = this.formatCommandForAI(
      type,
      content,
      systemPrompt,
      rejectionNote,
      alternatives,
      optionNumber
    );

    return {
      isValid: true,
      formattedCommand,
      savedPath: type === 'save' ? savePath : undefined
    };
  }
}
