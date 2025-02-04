import { Change } from './diffGenerator';

export type CommandType = 'new' | 'select' | 'build' | 'update' | 'save';

export interface Command {
  type: CommandType;
  content: string;
  systemPrompt?: string;
  savePath?: string;
  optionNumber?: number;
  tripDetails?: string;
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

  private static validateContent(content: string): { isValid: boolean; error?: string } {
    if (!content.trim()) {
      return { isValid: false, error: 'No trip details found in the request' };
    }

    if (content.length > 12000) {
      return { isValid: false, error: 'Trip details exceed maximum length. Please provide a shorter description.' };
    }

    return { isValid: true };
  }

  private static parseSection(content: string, section: string): string | undefined {
    // Try with ## prefix first
    const withPrefix = content.match(new RegExp(`## ${section}\\n([\\s\\S]*?)(?=\\n##|$)`))?.[1]?.trim();
    if (withPrefix) return withPrefix;
    
    // Fall back to without prefix
    const withoutPrefix = content.match(new RegExp(`${section}:\\n([\\s\\S]*?)(?=\\n\\w+:|$)`))?.[1]?.trim();
    return withoutPrefix;
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

    // Validate content
    const validation = this.validateContent(content);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error
      };
    }

    // Validate option number for select command
    if (type === 'select' && (!optionNumber || optionNumber < 1 || optionNumber > 3)) {
      return {
        isValid: false,
        error: 'Select command requires a valid option number (1-3)'
      };
    }

    // Start with system prompt
    let formattedCommand = `System Prompt:\n${systemPrompt || ''}\n\n`;

    // Add command-specific content
    if (type === 'new') {
      formattedCommand += `Command: /${type}\n\n`;
      formattedCommand += `Initial Trip Request:\n${content}`;
    } else if (type === 'build') {
      // For build command, parse and include both initial description and selected option
      const initialDescription = this.parseSection(content, 'Initial Trip Description');
      const selectedOption = this.parseSection(content, 'Selected Option');
      
      if (!initialDescription || !selectedOption) {
        console.error('Failed to parse build command sections:', { content });
        return {
          isValid: false,
          error: 'Missing required sections for build command'
        };
      }

      formattedCommand += `Command: /build\n\n`;
      formattedCommand += `## Initial Trip Description\n${initialDescription}\n\n`;
      formattedCommand += `## Selected Option\n${selectedOption}`;
    } else {
      formattedCommand += `Command: /${type}`;
      if (optionNumber) {
        formattedCommand += ` ${optionNumber}`;
      }
      formattedCommand += `\n\n`;
      formattedCommand += `Current Trip Details:\n${content}`;
    }

    // Add rejection context if provided
    if (type === 'new' && rejectionNote && alternatives) {
      formattedCommand += '\n\n## Previously Rejected Options\n';
      alternatives.forEach((alt) => {
        formattedCommand += alt + '\n\n'; // Use the formatted alternative directly
      });
      formattedCommand += `## Rejection Reason\n${rejectionNote}\n\n`;
      formattedCommand += `Please generate 3 new options that address this feedback, following the format instructions exactly.`;
    }

    // Log for debugging
    console.log('Command Input:', {
      type: type,
      userInput: content,
      systemPrompt: systemPrompt
    });
    console.log('Formatted Output:', formattedCommand);

    return {
      isValid: true,
      formattedCommand,
      savedPath: type === 'save' ? savePath : undefined
    };
  }
}
