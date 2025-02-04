import { FC } from 'react';

interface PreviewControlsProps {
  mode: 'light' | 'dark';
}

export const PreviewControls: FC<PreviewControlsProps> = ({ mode }) => {
  return (
    <div className={`flex items-center justify-between p-2 border-b ${
      mode === 'dark' 
        ? 'border-gray-700 bg-gray-800' 
        : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center space-x-2">
        <span className={`text-sm ${
          mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Preview
        </span>
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
  );
};
