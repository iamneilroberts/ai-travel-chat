import React from 'react';
import { HeaderSection } from '@/components/Layout/HeaderSection';
import { ContentSection } from '@/components/Layout/ContentSection';
import { CollapsibleEditor } from '@/components/CollapsibleEditor';
import { TripAlternatives } from '@/components/TripAlternatives';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { HtmlPreview } from '@/components/HtmlPreview';
import { CommandType } from '@/utils/commandProcessor';

interface TripOption {
  title: string;
  description: string;
  estimatedCost?: number;
}

interface MainLayoutProps {
  content: string;
  isDark: boolean;
  isProcessing: boolean;
  processingType?: CommandType;
  commandError: string | null;
  pageError: Error | null;
  isSaving: boolean;
  commandResult: string | null;
  tripAlternatives: TripOption[] | null;
  lastResponse: any;
  debugInfo: any;
  onPromptChange: (prompt: string) => void;
  onContentChange: (content: string) => void;
  onCommand: (commandType: CommandType) => void;
  onTripOptionAccept: (option: TripOption, optionNumber: number) => void;
  onTripOptionReject: (reason?: string) => void;
  onTripOptionCancel: () => void;
  onCommandResultAccept: (content: string) => void;
  onCommandResultClose: () => void;
  onErrorClose: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  content,
  isDark,
  isProcessing,
  processingType,
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
  onErrorClose
}) => {
  return (
    <main className="h-screen bg-emerald-50/50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        <HeaderSection onPromptChange={onPromptChange} />
        <ContentSection
          content={content}
          isDark={isDark}
          isProcessing={isProcessing}
          debugInfo={debugInfo}
          onContentSubmit={(text: string) => {
            onContentChange(text);
            onCommand('new');
          }}
        />
        <div className="p-2 border-t border-emerald-200/50 dark:border-gray-700">
          <CollapsibleEditor
            content={content}
            onChange={onContentChange}
            onCommand={onCommand}
            isProcessing={isProcessing}
            mode="split"
            buildDisabled={!content.includes('## Selected Itinerary')}
          />
        </div>
      </div>

      {/* Modals and Overlays */}
      {tripAlternatives && (
        <TripAlternatives
          options={tripAlternatives}
          onAccept={onTripOptionAccept}
          onReject={onTripOptionReject}
          onCancel={onTripOptionCancel}
          rawResponse={lastResponse?.rawResponse}
          rawRequest={lastResponse?.rawRequest}
        />
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <ProgressIndicator 
            onComplete={() => {}} 
            commandType={processingType === 'new' ? 'new' : 'build'}
          />
        </div>
      )}

      {(commandError || pageError) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50 max-w-lg">
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {commandError || (pageError && pageError.message)}
          </pre>
          <button
            onClick={onErrorClose}
            className="ml-2 text-white hover:text-gray-200 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {isSaving && (
        <div className="fixed top-4 right-4 flex items-center space-x-2 bg-gray-800 text-gray-200 px-3 py-1.5 rounded-md shadow-lg z-40">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-transparent" />
          <span className="text-sm">Saving...</span>
        </div>
      )}

      {commandResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50">
          <div className="bg-emerald-50/30 dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-emerald-200/50 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Response</h2>
              <button
                onClick={onCommandResultClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <HtmlPreview
                markdown={commandResult}
                style={{ mode: isDark ? 'dark' : 'light' }}
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={onCommandResultClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => onCommandResultAccept(commandResult)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Accept Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
