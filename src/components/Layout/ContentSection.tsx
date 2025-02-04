import React, { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { HtmlPreview } from '@/components/HtmlPreview';
import { CollapsibleEditor } from '@/components/CollapsibleEditor';
import { welcomeContent } from '@/utils/helpContent';
import { CommandType } from '@/utils/commandProcessor';

interface ContentSectionProps {
  content: string;
  isDark: boolean;
  isProcessing: boolean;
  debugInfo: any;
  onContentSubmit: (text: string) => void;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  content,
  isDark,
  isProcessing,
  debugInfo,
  onContentSubmit
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleCommand = (command: CommandType, model?: string) => {
    if (command === 'save') {
      onContentSubmit(content);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0">
      {/* Left column - Chat interface */}
      <div className="w-full lg:w-[35%] flex-shrink-0 p-2 flex flex-col min-h-0">
        <ChatInterface
          onSubmit={onContentSubmit}
          isProcessing={isProcessing}
          mode={content.includes('## Selected Itinerary') ? 'modifications' : 'initial'}
          debugInfo={debugInfo}
        />
      </div>

      {/* Right column - Preview/Editor area */}
      <div className="flex-1 p-2 flex flex-col min-h-0">
        <div className="mb-2 flex justify-end">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="px-3 py-1.5 bg-emerald-100/50 hover:bg-emerald-200/50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md shadow-md flex items-center space-x-2 transition-colors"
          >
            {isEditMode ? 'Show Preview' : 'Edit Trip Details'}
          </button>
        </div>
        
        {isEditMode ? (
          <div className="flex-1 overflow-hidden">
            <CollapsibleEditor
              content={content}
              onChange={onContentSubmit}
              onCommand={handleCommand}
              isProcessing={isProcessing}
              mode="split"
              buildDisabled={!content.includes('## Selected Itinerary')}
              showActionButtons={false}
              title="Edit Trip Details"
            />
          </div>
        ) : (
          <HtmlPreview
            markdown={content}
            style={{ mode: isDark ? 'dark' : 'light' }}
          />
        )}
      </div>
    </div>
  );
};
