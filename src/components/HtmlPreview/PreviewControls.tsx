import { FC, useState } from 'react';

interface PreviewControlsProps {
  mode: 'light' | 'dark';
  onRejectPlan?: (note: string) => void;
  isProcessing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  isEditing?: boolean;
}

export const PreviewControls: FC<PreviewControlsProps> = ({ 
  mode,
  onRejectPlan,
  isProcessing = false,
  onEdit,
  onSave,
  isEditing = false
}) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');

  const handleRejectPlan = () => {
    if (onRejectPlan && rejectionNote.trim()) {
      onRejectPlan(rejectionNote.trim());
      setRejectionNote('');
      setShowRejectDialog(false);
    }
  };

  return (
    <>
      <div className={`flex items-center justify-between p-2 border-b ${
        mode === 'dark' 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-50'
      }`}>
      <div className="flex items-center space-x-2">
        {!isEditing && (
          <button
            onClick={onEdit}
            disabled={isProcessing}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              isProcessing 
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            Edit
          </button>
        )}
        {isEditing && (
          <button
            onClick={onSave}
            disabled={isProcessing}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              isProcessing 
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            Save
          </button>
        )}
        {onRejectPlan && (
          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={isProcessing}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              isProcessing 
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Suggest Changes
          </button>
        )}
      </div>
      <div className="flex items-center">
        <span className={`px-2 py-1 text-sm rounded-md ${
          mode === 'dark'
            ? 'bg-gray-700 text-gray-300'
            : 'bg-gray-200 text-gray-700'
        }`}>
          {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>
      </div>
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Suggest Changes to Trip Plan
            </h3>
            <textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="What changes would you like to make to this trip plan?"
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
                Submit Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
