import { useState, useCallback } from 'react';
import { CommandProcessor, CommandContext } from '@/utils/commandProcessor';

interface CommandInputProps {
  onCommand: (formattedCommand: string) => void;
  context?: CommandContext;
  systemPrompt?: string;
  className?: string;
}

export function CommandInput({
  onCommand,
  context = {},
  systemPrompt,
  className = ''
}: CommandInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = CommandProcessor.processCommand(input, context, systemPrompt);
    
    if (!result.isValid) {
      setError(result.error || 'Invalid command');
      return;
    }

    if (result.formattedCommand) {
      onCommand(result.formattedCommand);
      setInput(''); // Clear input after successful command
    }
  }, [input, context, systemPrompt, onCommand]);

  const handleNewTrip = useCallback(() => {
    console.group('New Trip Command Processing');
    const description = input.trim();
    console.log('Input description:', description);

    if (!description) {
      console.log('Error: No description provided');
      setError('Please enter a trip description');
      console.groupEnd();
      return;
    }

    try {
      console.log('Step 1: Creating initial trip details');
      const initialContent = CommandProcessor.createInitialTripDetails(description);
      console.log('Initial content created:', initialContent);

      console.log('Step 2: Processing command with system prompt');
      console.log('System prompt:', systemPrompt);
      
      // Format as a proper /new command with the description
      const formattedInput = `/new ${description}`;
      console.log('Formatted command input:', formattedInput);
      
      const result = CommandProcessor.processCommand(formattedInput, {
        tripDescription: description,
        currentContent: initialContent
      }, systemPrompt);

      console.log('Step 3: Command processing result:', result);

      if (!result.isValid) {
        console.error('Command validation failed:', result.error);
        setError(result.error || 'Failed to process command');
        console.groupEnd();
        return;
      }

      if (result.formattedCommand) {
        console.log('Step 4: Sending formatted command to AI');
        console.log('Formatted command:', result.formattedCommand);
        onCommand(result.formattedCommand);
        setInput('');
        console.log('Command sent successfully');
      } else {
        console.error('Error: No formatted command in result');
        setError('Failed to format command');
      }
    } catch (error) {
      console.error('Critical error in handleNewTrip:', error);
      setError('An error occurred while processing the command');
    } finally {
      console.groupEnd();
    }
  }, [input, systemPrompt, onCommand]);

  const handleModify = useCallback((type: 'build' | 'modify') => {
    if (!context.currentContent) {
      setError('No trip content to modify');
      return;
    }

    try {
      console.log('Modifying trip with type:', type, 'input:', input);
      console.log('Current context:', context);
      console.log('System prompt:', systemPrompt);

    // Format as a proper command with the input
    const formattedInput = `/${type} ${input.trim()}`;
    console.log('Formatted command input:', formattedInput);
    
    const result = CommandProcessor.processCommand(
      formattedInput,
      context,
      systemPrompt
    );

      console.log('Command processing result:', result);

      if (!result.isValid) {
        console.error('Invalid command result:', result.error);
        setError(result.error || 'Failed to process command');
        return;
      }

      if (result.formattedCommand) {
        console.log('Sending formatted command:', result.formattedCommand);
        onCommand(result.formattedCommand);
        setInput('');
      } else {
        console.error('No formatted command in result');
        setError('Failed to format command');
      }
    } catch (error) {
      console.error('Error in handleModify:', error);
      setError('An error occurred while processing the command');
    }
  }, [input, context, systemPrompt, onCommand]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter trip details or modification..."
            className="flex-1 px-3 py-2 bg-gray-800 text-gray-100 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Send
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </form>

      <div className="flex gap-2">
        <button
          onClick={handleNewTrip}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          New Trip
        </button>
        <button
          onClick={() => handleModify('build')}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          disabled={!context.currentContent}
        >
          Build Itinerary
        </button>
        <button
          onClick={() => handleModify('modify')}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          disabled={!context.currentContent}
        >
          Modify Trip
        </button>
      </div>
    </div>
  );
}
