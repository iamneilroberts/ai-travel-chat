import React, { useState } from 'react';

interface DebugInfo {
  rawRequest?: any;
  rawResponse?: any;
}

interface CollapsibleDebugProps {
  debugInfo?: DebugInfo;
  isVisible: boolean;
}

export const CollapsibleDebug: React.FC<CollapsibleDebugProps> = ({
  debugInfo,
  isVisible
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('response');

  if (!isVisible) return null;

  const formatDebugContent = (content: any) => {
    try {
      if (typeof content === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(content);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // If it's not JSON, return as is
          return content;
        }
      }
      return JSON.stringify(content, null, 2);
    } catch (error) {
      console.error('Error formatting debug content:', error);
      return 'Error formatting content';
    }
  };

  const hasContent = (content: any) => {
    return content !== undefined && content !== null && content !== '';
  };

  return (
    <div className="fixed bottom-0 right-0 w-1/2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
      <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {isExpanded ? '▼' : '▲'} Debug Info
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('request')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                activeTab === 'request'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              Request {hasContent(debugInfo?.rawRequest) && '•'}
            </button>
            <button
              onClick={() => setActiveTab('response')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                activeTab === 'response'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              Response {hasContent(debugInfo?.rawResponse) && '•'}
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 h-64 overflow-auto">
          {activeTab === 'request' && (
            <div>
              <h4 className="text-sm font-semibold mb-1 dark:text-white">
                Raw Request:
              </h4>
              {hasContent(debugInfo?.rawRequest) ? (
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-900 p-2 rounded">
                  {formatDebugContent(debugInfo?.rawRequest)}
                </pre>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No request data available
                </p>
              )}
            </div>
          )}
          {activeTab === 'response' && (
            <div>
              <h4 className="text-sm font-semibold mb-1 dark:text-white">
                Raw Response:
              </h4>
              {hasContent(debugInfo?.rawResponse) ? (
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-900 p-2 rounded">
                  {formatDebugContent(debugInfo?.rawResponse)}
                </pre>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No response data available
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
