import { FC } from 'react';
import { Change } from '@/utils/diffGenerator';

interface ChangeDisplayProps {
  change: Change;
  onAccept: () => void;
  onReject: () => void;
}

export const ChangeDisplay: FC<ChangeDisplayProps> = ({
  change,
  onAccept,
  onReject
}) => {
  const getBorderColor = () => {
    switch (change.type) {
      case 'add':
        return 'border-green-500';
      case 'remove':
        return 'border-red-500';
      case 'modify':
        return 'border-yellow-500';
      default:
        return 'border-gray-300';
    }
  };

  const getBackgroundColor = () => {
    switch (change.type) {
      case 'add':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'remove':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'modify':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className={`mb-4 rounded-lg border ${getBorderColor()} ${getBackgroundColor()}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
            {change.lineNumber && ` at line ${change.lineNumber}`}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={onAccept}
              className="px-3 py-1 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={onReject}
              className="px-3 py-1 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {(change.type === 'modify' || change.type === 'remove') && (
            <div className="p-2 bg-red-100/50 dark:bg-red-900/30 rounded">
              <pre className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">
                {change.content.before}
              </pre>
            </div>
          )}
          {(change.type === 'modify' || change.type === 'add') && (
            <div className="p-2 bg-green-100/50 dark:bg-green-900/30 rounded">
              <pre className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                {change.content.after}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
