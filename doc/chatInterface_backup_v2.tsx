import React, { useState } from 'react';
import { ChatHistory } from './ChatHistory';
import { Message } from './MessageBubble';
import { v4 as uuidv4 } from 'uuid';
import { CollapsibleDebug } from '../CollapsibleDebug';

interface ChatInterfaceProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  mode: 'initial' | 'modifications';
  debugInfo?: {
    rawRequest?: any;
    rawResponse?: any;
  };
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSubmit,
  isProcessing,
  mode,
  debugInfo
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      type: 'ai',
      content: 'Welcome! I\'m your AI Travel Assistant. How can I help plan your trip?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        type: 'user',
        content: inputText.trim(),
        timestamp: new Date(),
      };
      
      // Add AI acknowledgment
      const aiMessage: Message = {
        id: uuidv4(),
        type: 'ai',
        content: mode === 'initial' 
          ? 'Processing your trip request...'
          : 'Updating your trip details...',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
      // Format input with trip details followed by command
      const formattedInput = `${inputText}\n\nCommand: /new`;
      onSubmit(formattedInput);
      setInputText('');
    }
  };

  const getPromptText = () => {
    if (mode === 'initial') {
      return 'Enter your initial trip details (destination, dates, preferences, etc.)';
    }
    return 'Enter any modifications, notes, or additional information';
  };

  return (
    <div className="flex flex-col h-full bg-emerald-50/30 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="flex-1 min-h-0">
        <ChatHistory messages={messages} />
      </div>
      <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-emerald-200/50 dark:border-gray-700">
        <div className="space-y-2 max-w-full">
          <div className="flex justify-between items-center">
            <label 
              htmlFor="chatInput" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {getPromptText()}
            </label>
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {showDebug ? 'Hide' : 'Show'} Debug
            </button>
          </div>
          <div className="flex flex-col space-y-2 w-full">
            <textarea
              id="chatInput"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full min-h-[80px] p-2 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-sm md:text-base rounded-md border border-emerald-200/50 dark:border-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
              placeholder="Example: Planning a literary tour of England for our 25th anniversary..."
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className={`px-4 py-2 rounded-md text-white font-medium self-end ${
                isProcessing || !inputText.trim()
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </form>
      {debugInfo && (
        <CollapsibleDebug
          debugInfo={debugInfo}
          isVisible={showDebug}
        />
      )}
    </div>
  );
};
