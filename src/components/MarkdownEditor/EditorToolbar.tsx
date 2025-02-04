import { useCallback } from 'react';

interface EditorToolbarProps {
  onNewTrip: () => void;
  onBuildItinerary: () => void;
  onModifyTrip: () => void;
  isProcessing: boolean;
  hasContent: boolean;
}

export function EditorToolbar({
  onNewTrip,
  onBuildItinerary,
  onModifyTrip,
  isProcessing,
  hasContent
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
      <button
        onClick={onNewTrip}
        disabled={isProcessing || !hasContent}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        New Trip
      </button>
      <button
        onClick={onBuildItinerary}
        disabled={isProcessing || !hasContent}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Build Itinerary
      </button>
      <button
        onClick={onModifyTrip}
        disabled={isProcessing || !hasContent}
        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Modify Trip
      </button>
      {isProcessing && (
        <div className="flex items-center ml-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          <span className="ml-2 text-gray-300">Processing...</span>
        </div>
      )}
    </div>
  );
}
