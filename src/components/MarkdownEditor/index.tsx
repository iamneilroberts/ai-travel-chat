import { useRef, useCallback, useEffect, useState } from 'react';
import { Editor, useMonaco } from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { EditorControls } from './EditorControls';
import { CommandProcessor, CommandType } from '@/utils/commandProcessor';
import { saveFile } from '@/utils/fileSync';
import { AIClient } from '@/utils/aiClient';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onCommand: (command: CommandType, model?: string, rejectionNote?: string, alternatives?: string[], detailedPlanRejectionNote?: string) => void;
  isProcessing?: boolean;
  mode: 'split' | 'full';
  buildDisabled?: boolean;
  showActionButtons?: boolean;
}

export function MarkdownEditor({
  content,
  onChange,
  onCommand,
  isProcessing = false,
  mode,
  buildDisabled = true,
  showActionButtons = true
}: EditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const [tripDetails, setTripDetails] = useState('');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-2.1');
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');

  // Theme effect
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setEditorTheme(isDark ? 'vs-dark' : 'vs-light');
    };

    // Initial theme
    updateTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch('/utils/trip-details.md')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch trip details');
        }
        return response.text();
      })
      .then(data => setTripDetails(data))
      .catch(() => {
        setTripDetails(CommandProcessor.initialTemplate);
      });
  }, []);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
  };

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newContent = value || '';
      if (newContent !== content) {
        onChange(newContent);
      }
    },
    [onChange, content]
  );

  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (content !== currentValue) {
        const position = editorRef.current.getPosition();
        editorRef.current.setValue(content);
        if (position) {
          editorRef.current.setPosition(position);
        }
      }
    }
  }, [content]);

  const handleNewTrip = useCallback((model?: string) => {
    onCommand('new', model);
  }, [onCommand]);

  const handleBuildTrip = useCallback((model?: string) => {
    onCommand('build', model);
  }, [onCommand]);

  const handleRejectPlan = useCallback((note: string) => {
    onCommand('build', undefined, undefined, undefined, note);
  }, [onCommand]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {showActionButtons && (
        <EditorControls
          onNewTrip={handleNewTrip}
          onBuildTrip={handleBuildTrip}
          onRejectPlan={handleRejectPlan}
          mode={mode}
          disabled={isProcessing}
          buildDisabled={buildDisabled}
        />
      )}
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={editorTheme}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'on',
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          folding: true,
          lineDecorationsWidth: 5,
          lineNumbersMinChars: 3,
          padding: { top: 10, bottom: 10 },
        }}
      />
    </div>
  );
}
