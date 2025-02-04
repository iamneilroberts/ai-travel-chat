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

  private static extractTripDetails(content: string): string {
    // Find the /new command
    const commandIndex = content.lastIndexOf('Command: /new');
    if (commandIndex === -1) {
      return '';
    }

    // Get everything before the command
    let tripDetails = content.substring(0, commandIndex).trim();

    // Remove welcome screen content if present
    const welcomeScreenStart = '# 🌍 AI Travel Assistant:';
    const welcomeScreenEnd = '### Things to Try';
    const welcomeRegex = new RegExp(`${welcomeScreenStart}[\\s\\S]*?${welcomeScreenEnd}`);
    tripDetails = tripDetails.replace(welcomeRegex, '').trim();

    // Remove any HTML style tags
    tripDetails = tripDetails.replace(/<style>[\s\S]*?<\/style>/g, '').trim();

    return tripDetails;
  }

  private static validateContent(content: string): { isValid: boolean; error?: string } {
    // First check if the command exists
    const commandIndex = content.lastIndexOf('Command: /new');
    if (commandIndex === -1) {
      return { isValid: false, error: 'Missing /new command' };
    }

    const tripDetails = this.extractTripDetails(content);
    console.log('Extracted trip details:', tripDetails);

    if (!tripDetails) {
      return { isValid: false, error: 'No trip details found in the request' };
    }

    if (tripDetails.length > 12000) {
      return { isValid: false, error: 'Trip details exceed maximum length. Please provide a shorter description.' };
    }

    // Validate that trip details come before command
    const detailsBeforeCommand = content.indexOf(tripDetails) < commandIndex;
    if (!detailsBeforeCommand) {
      return { isValid: false, error: 'Trip details should come before the /new command' };
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
    if (!systemPrompt) {
      throw new Error('System prompt is required');
    }

    // Validate content first
    const validation = this.validateContent(content);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Extract trip details after validation
    const tripDetails = this.extractTripDetails(content);
    console.log('Formatting command with trip details:', tripDetails);

    let formattedCommand = `System Prompt:\n${systemPrompt}\n\n`;

    // Add trip details followed by command
    formattedCommand += `${tripDetails}\n\nCommand: /new\n\n`;

    // For rejected alternatives, include the context
    if (type === 'new' && rejectionNote && alternatives) {
      formattedCommand += 'Previously Rejected Alternatives:\n';
      alternatives.forEach((alt, i) => {
        formattedCommand += `Option ${i + 1}:\n${alt}\n`;
      });
      formattedCommand += `\nRejection Note: ${rejectionNote}\n\n`;
    }

    // Add the command
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
