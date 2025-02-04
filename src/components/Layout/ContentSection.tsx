import React from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { HtmlPreview } from '@/components/HtmlPreview';
import { welcomeContent } from '@/utils/helpContent';

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
  console.log('ContentSection content prop:', content);
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

      {/* Right column - Preview area */}
      <div className="flex-1 p-2 flex flex-col min-h-0">
        <HtmlPreview
          markdown={content}
          style={{ mode: isDark ? 'dark' : 'light' }}
        />
      </div>
    </div>
  );
};
