import { FC } from 'react';

interface DiffControlsProps {
  changesCount: number;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export const DiffControls: FC<DiffControlsProps> = ({
  changesCount,
  onAcceptAll,
  onRejectAll
}) => {
  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Changes: {changesCount}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onAcceptAll}
          disabled={changesCount === 0}
          className={`px-3 py-1 text-sm font-medium rounded-md 
            ${changesCount === 0
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
            }`}
        >
          Accept All
        </button>
        <button
          onClick={onRejectAll}
          disabled={changesCount === 0}
          className={`px-3 py-1 text-sm font-medium rounded-md 
            ${changesCount === 0
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
            }`}
        >
          Reject All
        </button>
      </div>
    </div>
  );
};
