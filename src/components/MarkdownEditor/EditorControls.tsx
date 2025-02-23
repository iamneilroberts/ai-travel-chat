import { FC, useState } from 'react';
import ModelSelector from '../ModelSelector';

interface EditorControlsProps {
  onNewTrip: (model?: string) => void;
  onBuildTrip: (model?: string) => void;
  mode: 'full' | 'split';
  disabled: boolean;
  buildDisabled: boolean;
  onRejectPlan?: (note: string) => void;
}

export const EditorControls: FC<EditorControlsProps> = ({
  onNewTrip,
  onBuildTrip,
  mode,
  disabled,
  buildDisabled,
  onRejectPlan
}) => {
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-2.1');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');

  const handleNewTrip = () => {
    onNewTrip(selectedModel);
  };

  const handleBuildTrip = () => {
    onBuildTrip(selectedModel);
  };

  const handleRejectPlan = () => {
    if (onRejectPlan && rejectionNote.trim()) {
      onRejectPlan(rejectionNote.trim());
      setRejectionNote('');
      setShowRejectDialog(false);
    }
  };

  return (
    <>
    <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-2">
        {onRejectPlan && (
          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={disabled}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              disabled 
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Reject Plan
          </button>
        )}
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
    {showRejectDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Reject Current Plan
          </h3>
          <textarea
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
            placeholder="Please explain what you'd like to change about this plan..."
            className="w-full h-32 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowRejectDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectPlan}
              disabled={!rejectionNote.trim()}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                rejectionNote.trim()
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Rejection
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
