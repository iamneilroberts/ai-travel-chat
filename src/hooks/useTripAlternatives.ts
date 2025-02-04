import { useState, useCallback } from 'react';
import { AIClient } from '@/utils/aiClient';
import { CommandProcessor, CommandType } from '@/utils/commandProcessor';

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

export const useTripAlternatives = (content: string, systemPrompt: string) => {
  const [tripAlternatives, setTripAlternatives] = useState<TripOption[] | null>(null);
  const [lastResponse, setLastResponse] = useState<ResponseState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandError, setCommandError] = useState<string | null>(null);

  const processCommand = useCallback(async (
    commandType: CommandType,
    rejectionNote?: string,
    alternatives?: string[],
    optionNumber?: number
  ) => {
    setIsProcessing(true);
    setCommandError(null);

    let commandResult;
    try {
      commandResult = CommandProcessor.processCommand(
        commandType,
        content,
        systemPrompt,
        undefined,
        rejectionNote,
        alternatives,
        optionNumber
      );

      if (!commandResult.isValid || !commandResult.formattedCommand) {
        const error = commandResult.error || 'Invalid command';
        setCommandError(error);
        setLastResponse({
          error,
          rawRequest: commandResult.formattedCommand,
          rawResponse: null
        });
        return null;
      }

      console.log('Sending command to AI:', commandResult.formattedCommand);
      const response = await AIClient.sendCommand(commandResult.formattedCommand);

      if (response.error) {
        console.error('AI response error:', response.error);
        setCommandError(response.error);
        setLastResponse({
          error: response.error,
          rawRequest: commandResult.formattedCommand,
          rawResponse: response
        });
        return null;
      }

      // Store the complete response object including raw request/response
      const fullResponse = {
        ...response,
        rawRequest: response.rawRequest || commandResult.formattedCommand,
        rawResponse: response.rawResponse || response
      };
      console.log('Raw AI response:', fullResponse);
      setLastResponse(fullResponse);

      if (commandType === 'new') {
        // If we have a raw response, use the content from the first choice's message
        const content = response.rawResponse?.choices?.[0]?.message?.content || response.content;
        return parseNewTripOptions(content, commandResult.formattedCommand, response);
      }

      return response.content;
    } catch (error) {
      console.error('Error processing command:', error);
      // Handle cancellation errors silently
      if (error && typeof error === 'object' && 'type' in error && error.type === 'cancellation') {
        console.log('Operation cancelled');
        return null;
      }
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setCommandError(errorMessage);
      setLastResponse({
        error: errorMessage,
        rawRequest: commandResult?.formattedCommand,
        rawResponse: null
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [content, systemPrompt]);

  const parseNewTripOptions = (responseContent: string, rawRequest?: string, rawResponse?: any) => {
    console.log('Parsing response content:', responseContent);
    
    if (!responseContent) {
      const error = 'Empty response from AI';
      console.error(error);
      setCommandError(error);
      setLastResponse({
        error,
        rawRequest,
        rawResponse
      });
      return null;
    }

    // First try to split by markdown headers
    let optionBlocks = responseContent.split(/(?=### Option \d+:)/);
    
    // Remove any content before the first option
    if (!optionBlocks[0].includes('Option 1:')) {
      optionBlocks = optionBlocks.slice(1);
    }
    
    // Filter out empty blocks
    optionBlocks = optionBlocks.filter(block => block.trim());
    
    if (optionBlocks.length > 0) {
      console.log('Found markdown header blocks:', optionBlocks.length);
    }
    console.log('Split option blocks:', optionBlocks);

    if (optionBlocks.length === 0) {
      // Try alternative format without markdown headers
      let altBlocks = responseContent.split(/(?=Option \d+:)/);
      
      // Remove any content before the first option
      if (!altBlocks[0].includes('Option 1:')) {
        altBlocks = altBlocks.slice(1);
      }
      
      // Filter out empty blocks
      altBlocks = altBlocks.filter(block => block.trim());
      console.log('Alternative split blocks:', altBlocks);
      
      if (altBlocks.length === 0) {
        const error = 'Failed to parse trip alternatives - no valid option blocks found in response';
        console.error(error);
        setCommandError(error);
        setLastResponse({
          error,
          rawRequest,
          rawResponse
        });
        return null;
      }
      
      return parseOptions(altBlocks);
    }

    return parseOptions(optionBlocks);
  };

  const parseOptions = (blocks: string[]) => {
    console.log('Parsing blocks:', blocks);

    const parsedAlternatives = blocks.map((block, index) => {
      console.log(`Parsing block ${index + 1}:`, block);
      try {
        // Split block into lines and remove empty lines
        const lines = block.split('\n').filter(line => line.trim());
        console.log(`Block ${index + 1} lines:`, lines);
        
        // Extract title from the first line
        const titleMatch = lines[0].match(/(?:###\s*)?Option \d+:\s*(.+)/);
        if (!titleMatch) {
          console.error('Failed to parse option title:', lines[0]);
          return null;
        }

        const title = titleMatch[1].trim();
        console.log(`Block ${index + 1} title:`, title);

        // Find estimated cost in any line
        const costLine = lines.find(line => line.toLowerCase().includes('estimated cost'));
        const costMatch = costLine?.match(/\$(\d+(?:,\d{3})*)/);
        const estimatedCost = costMatch
          ? parseInt(costMatch[1].replace(/,/g, ''))
          : undefined;

        // Get all lines after the title for the description
        const descriptionLines = lines.slice(1);
        
        // Find the estimated cost line and its index
        const costLineIndex = descriptionLines.findIndex(line => 
          line.toLowerCase().includes('estimated cost')
        );
        
        let description = '';
        
        if (costLineIndex !== -1) {
          // Include everything up to the cost line in the description
          description = descriptionLines
            .slice(0, costLineIndex)
            .concat(descriptionLines.slice(costLineIndex + 1)) // Add everything after cost line
            .join('\n')
            .trim();
        } else {
          description = descriptionLines.join('\n').trim();
        }

        const option: TripOption = {
          title,
          description,
          ...(estimatedCost !== undefined && { estimatedCost })
        };

        console.log('Parsed option:', option);
        return option;
      } catch (error) {
        console.error('Error parsing option block:', error);
        return null;
      }
    });

    // Filter out null values
    const validOptions = parsedAlternatives.filter((option): option is TripOption => option !== null);
    console.log('Final parsed alternatives:', validOptions);

    if (validOptions.length === 0) {
      const error = 'Failed to parse trip alternatives - no valid options extracted from response';
      console.error(error);
      setCommandError(error);
      setLastResponse((prev: ResponseState | null) => ({
        error,
        rawRequest: prev?.rawRequest,
        rawResponse: prev?.rawResponse
      }));
      return null;
    }

    setTripAlternatives(validOptions);
    return validOptions;
  };

  const resetTripAlternatives = useCallback(() => {
    setTripAlternatives(null);
    setLastResponse(null);
    setCommandError(null);
  }, []);

  const debugInfo = lastResponse ? {
    rawRequest: lastResponse.rawRequest,
    rawResponse: lastResponse.rawResponse || lastResponse
  } : undefined;

  // Log debug info for troubleshooting
  console.log('Debug info:', debugInfo);

  return {
    tripAlternatives,
    lastResponse,
    isProcessing,
    commandError,
    processCommand,
    resetTripAlternatives,
    setTripAlternatives,
    debugInfo
  };
};
