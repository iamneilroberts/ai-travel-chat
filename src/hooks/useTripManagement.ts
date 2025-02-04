import { useState, useCallback } from 'react';
import { CommandProcessor, CommandType } from '@/utils/commandProcessor';
import { AIClient } from '@/utils/aiClient';
import { formatError } from '@/utils/errorHandling';
import { useTripAlternatives } from './useTripAlternatives';

interface TripManagementProps {
  content: string;
  systemPrompt: string;
  setContent: (content: string) => void;
}

export const useTripManagement = ({ content, systemPrompt, setContent }: TripManagementProps) => {
  const [processingState, setProcessingState] = useState<false | { type: CommandType }>(false);
  const [commandResult, setCommandResult] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [commandError, setCommandError] = useState<string | null>(null);

  const { tripAlternatives, setTripAlternatives, processCommand: processTrip, debugInfo } = useTripAlternatives(
    content,
    systemPrompt || '' // Ensure systemPrompt is never undefined
  );

  const handleCommand = useCallback(async (
    commandType: CommandType, 
    model?: string,
    rejectionNote?: string, 
    alternatives?: string[]
  ) => {
    setProcessingState({ type: commandType });
    setCommandError(null);
    
    try {
      const result = CommandProcessor.processCommand(
        commandType, 
        content, 
        systemPrompt, 
        undefined, 
        rejectionNote, 
        alternatives
      );

      if (!result.isValid || !result.formattedCommand) {
        setCommandError(result.error || 'Invalid command');
        return;
      }

      const aiResponse = await AIClient.sendCommand(result.formattedCommand);
      
      if (aiResponse.error) {
        console.error('AI response error:', aiResponse.error);
        const formattedError = formatError(aiResponse.error);
        if (formattedError) { // Only set error if it's not meant to be handled silently
          setCommandError(formattedError);
        }
        return;
      }

      console.log('AI response:', aiResponse.content);
      setLastResponse(aiResponse);
      
      if (commandType === 'new') {
        const result = await processTrip(commandType, rejectionNote, alternatives);
        if (!result) {
          setCommandError('Failed to process trip alternatives');
        }
      } else {
        setCommandResult(aiResponse.content);
      }
    } catch (error) {
      console.error('Command execution error:', error);
      const formattedError = formatError(error);
      if (formattedError) { // Only set error if it's not meant to be handled silently
        setCommandError(formattedError);
      }
    } finally {
      setProcessingState(false);
    }
  }, [content, systemPrompt, processTrip]);

  const handleTripOptionAccept = useCallback(async (option: {
    title: string;
    description: string;
    estimatedCost?: number;
  }, optionNumber: number) => {
    try {
      const updatedContent = content.replace(
        /## Selected Itinerary\n[^#]*(?=#|$)/, 
        `## Selected Itinerary\n### Option ${optionNumber}: ${option.title}\n\n${option.description}${option.estimatedCost ? `\n\nEstimated Cost: $${option.estimatedCost}` : ''}\n\n`
      );
      
      setContent(updatedContent);
      
      const response = await fetch('/api/trip-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update trip details');
      }
      
      setTripAlternatives(null);
      
      // Trigger build command after updating content
      handleCommand('build');
    } catch (error) {
      console.error('Error updating trip details:', error);
      const formattedError = formatError(error);
      if (formattedError) { // Only set error if it's not meant to be handled silently
        setCommandError(formattedError);
      }
    }
  }, [content, handleCommand, setContent]);

  const handleTripOptionReject = useCallback((reason?: string) => {
    if (tripAlternatives) {
      const previousAlternatives = tripAlternatives.map((alt: { title: string; description: string; estimatedCost?: number }) => {
        let text = `**Option: ${alt.title}**\n${alt.description}`;
        if (alt.estimatedCost !== undefined) {
          text += `\nEstimated cost: $${alt.estimatedCost}`;
        }
        return text;
      });
      
      handleCommand('new', undefined, reason, previousAlternatives);
    }
  }, [handleCommand, tripAlternatives]);

  return {
    processingState,
    commandResult,
    setCommandResult,
    lastResponse,
    commandError,
    setCommandError,
    tripAlternatives,
    setTripAlternatives,
    debugInfo,
    handleCommand,
    handleTripOptionAccept,
    handleTripOptionReject
  };
};
