import { useState, useCallback } from 'react';
import { CommandProcessor, CommandType } from '@/utils/commandProcessor';
import { AIClient } from '@/utils/aiClient';
import { formatError } from '@/utils/errorHandling';
import { formatInitialTripDescription } from '@/utils/helpContent';

interface TripManagementProps {
  content: string;
  systemPrompt: string;
  setContent: (content: string) => void;
}

export interface TripOption {
  title: string;
  description: string;
  estimatedCost?: number;
}

interface ResponseState {
  error?: string;
  rawRequest?: string;
  rawResponse?: any;
}

export const useTripManagement = ({ content, systemPrompt, setContent }: TripManagementProps) => {
  const [processingState, setProcessingState] = useState<false | { type: CommandType }>(false);
  const [commandResult, setCommandResult] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ResponseState | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [tripAlternatives, setTripAlternatives] = useState<TripOption[] | null>(null);

  const handleCommand = useCallback(async (
    commandType: CommandType,
    chatInput?: string,
    rejectionNote?: string,
    alternatives?: string[],
    overrideContent?: string,
    detailedPlanRejectionNote?: string
  ) => {
    console.log('Handling command:', { commandType, chatInput, content });
    setProcessingState({ type: commandType });
    setCommandError(null);

    try {
      let commandContent = '';
      
      if (commandType === 'new') {
        if (!chatInput) {
          throw new Error('Chat input is required for new commands');
        }
        commandContent = chatInput;
      } else if (commandType === 'build') {
        // Use override content if provided, otherwise use current content
        const contentToUse = overrideContent || content;

        // For build command, extract the required sections
        const initialDescription = contentToUse.match(/## Initial Trip Description\n([\s\S]*?)(?=\n##|$)/)?.[1]?.trim();
        const selectedOption = contentToUse.match(/## Selected Option\n([\s\S]*?)(?=\n##|$)/)?.[1]?.trim();
        
        if (!initialDescription || !selectedOption) {
          throw new Error('Missing required sections for build command');
        }

        // Format the content for the build command with ## prefixes
        commandContent = [
          `## Initial Trip Description`,
          initialDescription,
          '',
          `## Selected Option`,
          selectedOption
        ].join('\n');

        console.log('Build command content:', commandContent);
      } else {
        commandContent = content;
      }

      const result = CommandProcessor.processCommand(
        commandType,
        commandContent,
        systemPrompt,
        undefined,
        rejectionNote,
        detailedPlanRejectionNote,
        alternatives
      );

      if (!result.isValid || !result.formattedCommand) {
        throw new Error(result.error || 'Invalid command');
      }

      console.log('Sending command to AI:', result.formattedCommand);
      const aiResponse = await AIClient.sendCommand(result.formattedCommand);

      if (aiResponse.error) {
        throw new Error(aiResponse.error);
      }

      // Store response for debugging
      setLastResponse({
        rawRequest: result.formattedCommand,
        rawResponse: aiResponse
      });

      // For new commands, format the content after successful response
      if (commandType === 'new' && chatInput) {
        setContent(formatInitialTripDescription(chatInput));
      }

      // Handle the response
      if (commandType === 'new') {
        const parsedOptions = parseNewTripOptions(aiResponse.content);
        setTripAlternatives(parsedOptions);
      } else {
        setCommandResult(aiResponse.content);
      }
    } catch (error) {
      console.error('Command execution error:', error);
      const formattedError = formatError(error);
      if (formattedError) {
        setCommandError(formattedError);
      }
    } finally {
      setProcessingState(false);
    }
  }, [content, systemPrompt, setContent]);

  const parseNewTripOptions = (responseContent: string): TripOption[] => {
    if (!responseContent) {
      throw new Error('Empty response from AI');
    }

    console.log('Parsing response content:', responseContent);

    // First try to find Generated Options section
    const sections = responseContent.split(/^## /m);
    const optionsSection = sections.find(s => s.startsWith('Generated Options'));
    
    // If no Generated Options section, treat entire response as options
    const contentToProcess = optionsSection ? 
      optionsSection.split(/(?=### Option \d+:)/).slice(1) :
      responseContent.split(/(?=### Option \d+:)/);
    
    const blocks = contentToProcess.filter(block => block.trim());
    
    if (blocks.length === 0) {
      console.error('No option blocks found in response:', responseContent);
      throw new Error('No valid options found in response');
    }

    console.log('Found option blocks:', blocks);

    return blocks.map((block, index) => {
      const lines = block.split('\n').filter(line => line.trim());
      
      // Extract title from the first line
      const titleMatch = lines[0].match(/### Option \d+:\s*(.+)/);
      if (!titleMatch) {
        console.error(`Failed to parse title for option ${index + 1}:`, lines[0]);
        throw new Error(`Failed to parse title for option ${index + 1}`);
      }

      const title = titleMatch[1].trim();
      
      // Get all lines after the title
      const descriptionLines = lines.slice(1);
      
      // Find estimated cost line
      const costLine = descriptionLines.find(line => 
        line.toLowerCase().includes('estimated cost:') || 
        line.toLowerCase().includes('estimated cost')
      );
      const costMatch = costLine?.match(/\$(\d+(?:,\d{3})*)/);
      const estimatedCost = costMatch ? parseInt(costMatch[1].replace(/,/g, '')) : undefined;

      // Join all lines except the cost line for description
      const description = descriptionLines
        .filter(line => !line.toLowerCase().includes('estimated cost'))
        .join('\n')
        .trim();

      console.log(`Parsed option ${index + 1}:`, {
        title: titleMatch[1].trim(),
        estimatedCost,
        description
      });

      return {
        title,
        description,
        ...(estimatedCost !== undefined && { estimatedCost })
      };
    });
  };

  const handleTripOptionAccept = useCallback(async (option: TripOption, optionNumber: number) => {
    try {
      // Get both the original request and initial description
      const originalRequest = content.match(/## Original Request\n([\s\S]*?)(?=\n##|$)/)?.[1]?.trim();
      const initialDescription = content.match(/## Initial Trip Description\n([\s\S]*?)(?=\n##|$)/)?.[1]?.trim();
      
      if (!originalRequest || !initialDescription) {
        throw new Error('Missing required trip details');
      }

      console.log('Found trip details:', { originalRequest, initialDescription });

      // Format the selected option with all details
      const optionDetails = [
        `### Option ${optionNumber}: ${option.title}`,
        option.description,
        option.estimatedCost ? `Estimated Cost: $${option.estimatedCost}` : '',
        '', // Empty line for spacing
      ].filter(Boolean).join('\n');

      // Build the complete content with all sections
      const updatedContent = [
        `## Initial Trip Description`,
        initialDescription,
        '',
        `## Original Request`,
        originalRequest,
        '',
        `## Selected Option`,
        optionDetails, // Just the option details directly under Selected Option
        '',
        `## Overview`,
        `[This section will be auto-populated based on the selected option]`,
        '',
        `## Travelers`,
        `[This section will be auto-populated based on the initial description and selected option]`,
        '',
        `## Duration & Dates`,
        `[This section will be auto-populated based on the initial description and selected option]`,
        '',
        `## Budget`,
        `[This section will be auto-populated based on the selected option]`,
        '',
        `## Preferences`,
        `[This section will be auto-populated based on the initial description and selected option]`,
        '',
        `## Selected Itinerary`,
        `[This section will be populated with the expanded details of your chosen option]`,
        '',
        `## Trip Notes`,
        `[Any additional notes or modifications to the trip will be tracked here]`
      ].join('\n');

      console.log('Updated content:', updatedContent);

      // Pass the updated content directly to handleCommand
      setContent(updatedContent);
      setTripAlternatives(null);
      handleCommand('build', undefined, undefined, undefined, updatedContent);
    } catch (error) {
      console.error('Error updating trip details:', error);
      const formattedError = formatError(error);
      if (formattedError) {
        setCommandError(formattedError);
      }
    }
  }, [content, handleCommand, setContent]);

  const handleTripOptionReject = useCallback((reason?: string) => {
    if (tripAlternatives) {
      // Preserve original markdown formatting
      const previousAlternatives = tripAlternatives.map(alt => {
        return `### Option ${alt.title}\n${alt.description}${alt.estimatedCost !== undefined ? `\nEstimated cost: $${alt.estimatedCost}` : ''}`;
      });

      handleCommand('new', content, reason, previousAlternatives);
    }
  }, [content, handleCommand, tripAlternatives]);

  const handleDetailedPlanReject = useCallback(async (detailedPlanRejectionNote: string) => {
    handleCommand('build', content, undefined, undefined, undefined, detailedPlanRejectionNote);
  }, [content, handleCommand]);

  return {
    processingState,
    commandResult,
    setCommandResult,
    lastResponse,
    commandError,
    setCommandError,
    tripAlternatives,
    setTripAlternatives,
    debugInfo: lastResponse,
    handleCommand,
    handleTripOptionAccept,
    handleTripOptionReject,
    handleDetailedPlanReject
  };
};
