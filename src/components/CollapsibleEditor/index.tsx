import React, { useState } from 'react';
import { MarkdownEditor } from '../MarkdownEditor';
import { CommandType } from '@/utils/commandProcessor';

interface CollapsibleEditorProps {
  content: string;
  onChange: (content: string) => void;
  onCommand: (command: CommandType, model?: string, rejectionNote?: string, alternatives?: string[]) => void;
  isProcessing: boolean;
  mode: 'split';
  buildDisabled: boolean;
  showActionButtons?: boolean;
  title?: string;
}

export const CollapsibleEditor: React.FC<CollapsibleEditorProps> = ({
  content,
  onChange,
  onCommand,
  isProcessing,
  mode,
  buildDisabled,
  showActionButtons = true,
  title = "Trip Details Editor",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleContentChange = (newContent: string) => {
    setHasChanges(true);
    onChange(newContent);
  };

  const handleSave = () => {
    onCommand('save');
    setHasChanges(false);
  };

  return (
    <div className="bg-emerald-50/30 dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-emerald-200/50 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">{title}</h3>
          {hasChanges && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              (Unsaved changes)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className={`px-3 py-1.5 mr-2 ${
                isProcessing 
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } text-white rounded-md shadow-md transition-colors`}
            >
              Save Changes
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-emerald-100/50 hover:bg-emerald-200/50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md shadow-md flex items-center space-x-2 transition-colors"
          >
            <span>{isExpanded ? 'Hide Editor' : 'Show Editor'}</span>
            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
      
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <MarkdownEditor
          content={content}
          onChange={handleContentChange}
          onCommand={onCommand}
          isProcessing={isProcessing}
          mode={mode}
          buildDisabled={buildDisabled}
          showActionButtons={showActionButtons}
        />
      </div>
    </div>
  );
};
