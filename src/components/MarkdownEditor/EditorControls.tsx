import { FC, useState } from 'react';
import ModelSelector from '../ModelSelector';

interface EditorControlsProps {
  onSave: () => void;
  onNewTrip: (model?: string) => void;
  onBuildTrip: (model?: string) => void;
  mode: 'full' | 'split';
  disabled: boolean;
  buildDisabled: boolean;
}

export const EditorControls: FC<EditorControlsProps> = ({
  onSave,
  onNewTrip,
  onBuildTrip,
  mode,
  disabled,
  buildDisabled
}) => {
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-2.1');

  const handleNewTrip = () => {
    onNewTrip(selectedModel);
  };

  const handleBuildTrip = () => {
    onBuildTrip(selectedModel);
  };

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-2">
        <button
          onClick={onSave}
          disabled={disabled}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            disabled 
              ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          Save
        </button>
        <button
          onClick={handleNewTrip}
          disabled={disabled}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            disabled 
              ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          New Trip
        </button>
        <button
          onClick={handleBuildTrip}
          disabled={disabled || buildDisabled}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            disabled || buildDisabled
              ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          Build Trip
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Mode:</span>
          <span className={`px-2 py-1 text-sm rounded-md ${
            mode === 'full' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
          >
            {mode === 'full' ? 'Full Editor' : 'Split View'}
          </span>
        </div>
        <ModelSelector 
          defaultModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>
    </div>
  );
};
