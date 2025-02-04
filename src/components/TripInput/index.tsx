import React, { useState } from 'react';

interface TripInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  mode: 'initial' | 'modifications';
}

export const TripInput: React.FC<TripInputProps> = ({ onSubmit, isProcessing, mode }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  const getPromptText = () => {
    if (mode === 'initial') {
      return 'Enter your initial trip details (destination, dates, preferences, etc.)';
    }
    return 'Enter any modifications, notes, or additional information to be used in building a detailed itinerary';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="tripInput" 
            className="block text-lg font-medium text-gray-200 mb-2"
          >
            {getPromptText()}
          </label>
          <textarea
            id="tripInput"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-3 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Example: Planning a literary tour of England for our 25th anniversary. Looking for a 10-day trip focused on famous author homes and historic libraries. Budget around $5000."
            disabled={isProcessing}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isProcessing || !text.trim()}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isProcessing || !text.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {mode === 'initial' ? 'New Trip' : 'Update Trip'}
          </button>
        </div>
      </form>
    </div>
  );
};
