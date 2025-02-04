'use client';

import { useState, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/Layout';
import { useTheme } from '@/hooks/useTheme';
import { useTripManagement } from '@/hooks/useTripManagement';
import { useErrorHandlers } from '@/utils/errorHandling';
import { welcomeContent } from '@/utils/helpContent';

export default function Home() {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState<Error | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    console.log('Content state in page.tsx:', content);
  }, [content]);

  // Prevent commands if system prompt is not set
  const validateCommand = useCallback(() => {
    if (!systemPrompt) {
      setCommandError('Please wait for system prompt to load');
      return false;
    }
    return true;
  }, [systemPrompt]);

  const {
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
  } = useTripManagement({
    content,
    systemPrompt,
    setContent
  });

  const { handleUnhandledRejection, handleError, handlePromiseError } = useErrorHandlers(
    setPageError,
    setCommandError
  );

  // Set up error handlers
  useEffect(() => {
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseError);
    };
  }, [handleUnhandledRejection, handleError, handlePromiseError]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setOriginalContent(content);
      console.log('Content saved:', content);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content !== originalContent) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [content, originalContent, handleSave]);

  return (
    <MainLayout
      content={content}
      isDark={isDark}
      isProcessing={!!processingState}
      processingType={processingState ? processingState.type : undefined}
      commandError={commandError}
      pageError={pageError}
      isSaving={isSaving}
      commandResult={commandResult}
      tripAlternatives={tripAlternatives}
      lastResponse={lastResponse}
      debugInfo={debugInfo}
      onPromptChange={(prompt: string) => {
        console.log('System prompt updated:', prompt);
        setSystemPrompt(prompt);
      }}
      onContentChange={(newContent: string) => setContent(newContent)}
      onCommand={(type, chatInput) => {
        if (validateCommand()) {
          handleCommand(type, chatInput);
        }
      }}
      onTripOptionAccept={handleTripOptionAccept}
      onTripOptionReject={handleTripOptionReject}
      onTripOptionCancel={() => setTripAlternatives(null)}
      onCommandResultAccept={(content) => {
        setContent(content);
        setCommandResult(null);
      }}
      onCommandResultClose={() => setCommandResult(null)}
      onErrorClose={() => {
        setCommandError(null);
        setPageError(null);
      }}
    />
  );
}
