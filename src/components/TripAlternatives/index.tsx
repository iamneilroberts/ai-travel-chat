import React, { useState } from 'react';
import { HtmlPreview } from '@/components/HtmlPreview';

interface TripOption {
  title: string;
  description: string;
  estimatedCost?: number;
}

interface TripAlternativesProps {
  options: TripOption[];
  onAccept: (option: TripOption, optionNumber: number) => void;
  onReject: (reason?: string) => void;
  onCancel: () => void;
  rawResponse?: any;
  rawRequest?: any;
}

export const TripAlternatives: React.FC<TripAlternativesProps> = ({
  options,
  onAccept,
  onReject,
  onCancel,
  rawResponse,
  rawRequest
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [selectedOption, setSelectedOption] = useState<TripOption | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [debugTab, setDebugTab] = useState<'request' | 'response'>('response');

  const handleReject = () => {
    onReject(rejectionReason || undefined);
    setRejectionReason('');
  };

  const handleSelect = (option: TripOption, index: number) => {
    setSelectedOption(option);
    setSelectedIndex(index);
  };

  const handleAccept = () => {
    if (selectedOption && selectedIndex !== null) {
      onAccept(selectedOption, selectedIndex + 1); // Add 1 to convert from 0-based to 1-based index
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trip Alternatives
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {showDebug ? 'Hide' : 'Show'} Debug
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
        {showDebug && (rawResponse || rawRequest) && (
          <div className="p-4 bg-gray-100 dark:bg-gray-700 max-h-64 overflow-auto">
            <div className="flex items-center space-x-4 mb-4">
              <h3 className="text-lg font-semibold dark:text-white">
                Debug Information
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setDebugTab('request')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    debugTab === 'request'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Request
                </button>
                <button
                  onClick={() => setDebugTab('response')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    debugTab === 'response'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Response
                </button>
              </div>
            </div>
            {debugTab === 'request' && rawRequest && (
              <div>
                <h4 className="text-sm font-semibold mb-1 dark:text-white">
                  Raw Request:
                </h4>
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {JSON.stringify(rawRequest, null, 2)}
                </pre>
              </div>
            )}
            {debugTab === 'response' && rawResponse && (
              <div>
                <h4 className="text-sm font-semibold mb-1 dark:text-white">
                  Raw Response:
                </h4>
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {options.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                No trip alternatives found. This might be due to a parsing error. Please check the debug view for more details.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 p-6">
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-6 transition-all ${
                    selectedOption === option
                      ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg'
                      : 'hover:shadow-lg dark:border-gray-700'
                  }`}
                  onClick={() => handleSelect(option, index)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-semibold dark:text-white">
                      Option {index + 1}: {option.title}
                    </h3>
                    {option.estimatedCost !== undefined && (
                      <span className="text-xl text-green-600 font-bold">
                        ${option.estimatedCost}
                      </span>
                    )}
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <HtmlPreview
                      markdown={option.description}
                      style={{ mode: 'dark' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Why didn't these options work for you? (Optional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="flex-grow px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reject All
            </button>
            {selectedOption && (
              <button
                onClick={handleAccept}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Select Option {selectedIndex !== null ? selectedIndex + 1 : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
