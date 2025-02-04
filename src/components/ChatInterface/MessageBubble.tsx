import React from 'react';

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';
  
  // Format timestamp in a consistent way for both server and client
  const formattedTime = React.useMemo(() => {
    const date = new Date(message.timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [message.timestamp]);
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] md:max-w-[80%] rounded-lg px-3 md:px-4 py-2 shadow-md ${
          isUser
            ? 'bg-emerald-600 text-white ml-2 md:ml-4'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 mr-2 md:mr-4'
        }`}
      >
        <div className="text-sm md:text-base">{message.content}</div>
        <div className={`text-[10px] md:text-xs mt-1 ${
          isUser 
            ? 'text-emerald-200' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};
