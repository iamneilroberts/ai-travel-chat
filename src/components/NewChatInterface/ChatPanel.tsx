import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { UserInput } from './UserInput';
import { ProgressIndicator } from './ProgressIndicator';

// Define message type
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  onContentChange: (type: 'welcome' | 'tripDetails' | 'html', data?: string) => void;
}

export const ChatPanel = ({ onContentChange }: ChatPanelProps) => {
  // State for messages and processing status
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm ai-travel-chat. What kind of travel are we working on today?",
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle user message submission
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Set processing state
    setIsProcessing(true);
    
    // Simulate processing stages
    simulateProcessingStages();
    
    // TODO: Replace with actual API call
    setTimeout(() => {
      // If message contains trip request, show trip options
      if (content.toLowerCase().includes('trip') || content.toLowerCase().includes('travel')) {
        // Simulate trip options response
        const tripOptionsResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I've prepared some trip options for you. Please check the panel on the right.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, tripOptionsResponse]);
        
        // Show trip options in the content panel
        onContentChange('html', generateTripOptionsHtml());
      } else {
        // Regular response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I can help you plan your perfect trip. Just let me know where you'd like to go, for how long, and any specific interests you have.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
      
      setIsProcessing(false);
      setProcessingStage('');
    }, 3000);
  };

  // Simulate processing stages
  const simulateProcessingStages = () => {
    const stages = [
      'Connecting to AI provider...',
      'Analyzing your request...',
      'Searching for travel options...',
      'Preparing response...'
    ];
    
    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setProcessingStage(stages[currentStage]);
        currentStage++;
      } else {
        clearInterval(interval);
      }
    }, 700);
  };

  // Generate sample trip options HTML
  const generateTripOptionsHtml = (): string => {
    return `
      <div class="trip-options">
        <h2 class="text-xl font-bold mb-4">Trip Options</h2>
        <p class="mb-4">Based on your request, here are some options:</p>
        
        <div class="option mb-6 p-4 border border-border rounded-lg">
          <h3 class="text-lg font-semibold">Option 1: City Explorer</h3>
          <p>A 7-day urban adventure focusing on cultural attractions and local cuisine.</p>
          <div class="flex gap-2 mt-3">
            <button class="px-3 py-1 bg-primary text-primary-foreground rounded-md">Accept</button>
            <button class="px-3 py-1 border border-border rounded-md">Edit</button>
          </div>
        </div>
        
        <div class="option mb-6 p-4 border border-border rounded-lg">
          <h3 class="text-lg font-semibold">Option 2: Nature Retreat</h3>
          <p>A 7-day escape to natural wonders with hiking and outdoor activities.</p>
          <div class="flex gap-2 mt-3">
            <button class="px-3 py-1 bg-primary text-primary-foreground rounded-md">Accept</button>
            <button class="px-3 py-1 border border-border rounded-md">Edit</button>
          </div>
        </div>
        
        <div class="option mb-6 p-4 border border-border rounded-lg">
          <h3 class="text-lg font-semibold">Option 3: Balanced Journey</h3>
          <p>A 7-day mix of urban exploration and natural attractions.</p>
          <div class="flex gap-2 mt-3">
            <button class="px-3 py-1 bg-primary text-primary-foreground rounded-md">Accept</button>
            <button class="px-3 py-1 border border-border rounded-md">Edit</button>
          </div>
        </div>
        
        <div class="mt-4">
          <button class="px-3 py-1 bg-destructive text-destructive-foreground rounded-md">Reject All</button>
          <div class="mt-2">
            <input 
              type="text" 
              placeholder="Why didn't these options work for you? (Optional)" 
              class="w-full p-2 border border-border rounded-md"
            />
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="w-1/2 border-r border-border flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex flex-col gap-2">
            <ProgressIndicator />
            {processingStage && (
              <div className="text-sm text-muted-foreground">{processingStage}</div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* User Input */}
      <div className="border-t border-border p-4">
        <UserInput onSendMessage={handleSendMessage} isDisabled={isProcessing} />
      </div>
    </div>
  );
};