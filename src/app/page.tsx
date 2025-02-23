'use client';

import TourRecommendations from '@/components/TourRecommendations';
import { MainLayout } from '@/components/Layout';
import { ChatInterface } from '@/components/ChatInterface';
import { HtmlPreview } from '@/components/HtmlPreview';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptSelector } from '@/components/PromptSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTourRecommendations } from '@/hooks/useTourRecommendations';
import { useCallback } from 'react';

export default function Home() {
  const {
    content,
    isDark,
    isProcessing,
    commandError,
    pageError,
    isSaving,
    commandResult,
    tripAlternatives,
    lastResponse,
    debugInfo,
    onPromptChange,
    onContentChange,
    onCommand,
    onTripOptionAccept,
    onTripOptionReject,
    onTripOptionCancel,
    onCommandResultAccept,
    onCommandResultClose,
    onErrorClose,
  } = useTourRecommendations();

  const handleChatSubmit = useCallback((input: string) => {
    onCommand('new', input);
  }, [onCommand]);

  return (
    <>
      <MainLayout
        content={content}
        isDark={isDark}
        isProcessing={isProcessing}
        processingType={isProcessing ? 'new' : 'build'}
        commandError={commandError}
        pageError={pageError}
        isSaving={isSaving}
        commandResult={commandResult}
        tripAlternatives={tripAlternatives}
        lastResponse={lastResponse}
        debugInfo={debugInfo}
        onPromptChange={onPromptChange}
        onContentChange={onContentChange}
        onCommand={onCommand}
        onTripOptionAccept={onTripOptionAccept}
        onTripOptionReject={onTripOptionReject}
        onTripOptionCancel={onTripOptionCancel}
        onCommandResultAccept={onCommandResultAccept}
        onCommandResultClose={onCommandResultClose}
        onErrorClose={onErrorClose}
      />

      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <ModelSelector />
            <PromptSelector onPromptChange={onPromptChange} />
          </div>
          <ThemeToggle />
        </header>

        <div className="flex-1 flex">
          {/* Left panel - Chat Interface */}
          <div className="w-1/2 border-r">
            <ChatInterface
              onSubmit={handleChatSubmit}
              isProcessing={isProcessing}
              mode="initial"
            />
          </div>

          {/* Right panel - Preview and Recommendations */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-auto">
              <HtmlPreview
                markdown={content}
                style={{ mode: isDark ? 'dark' : 'light' }}
              />
            </div>
            
            {/* Tour Recommendations Section */}
            <div className="border-t">
              <TourRecommendations className="p-4" />
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          onComplete={() => {}}
          commandType={isProcessing ? 'new' : 'build'}
        />
      </div>
    </>
  );
}
