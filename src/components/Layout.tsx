'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Layout() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [selectedPrompt, setSelectedPrompt] = useState('trip-planner');
  const [prompts, setPrompts] = useState([
    { name: 'Trip Planner', path: '1_trip-planner-prompt.md' },
    { name: 'Document Generator', path: 'docs-generator-prompt.md' }
  ]);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  const handleFindTours = () => {
    // TODO: Implement Viator API integration
    console.log('Finding tours...');
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between bg-white dark:bg-gray-900">
        <h1 className="font-semibold text-xl">AI Travel Chat</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleFindTours}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Find Tours
          </button>
          <select 
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            className="px-3 py-1.5 rounded border border-gray-200 dark:border-gray-800 bg-transparent"
          >
            <option value="trip-planner">Trip Planner</option>
            <option value="docs-generator">Document Generator</option>
          </select>
          <select className="px-3 py-1.5 rounded border border-gray-200 dark:border-gray-800 bg-transparent">
            <option>GPT-4</option>
            <option>Claude</option>
          </select>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-800"
          >
            {mounted ? (theme === 'dark' ? 'Light' : 'Dark') : ''}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-[minmax(400px,_500px)_1fr]">
        {/* Chat area */}
        <div className="border-r border-gray-200 dark:border-gray-800">
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="text-lg leading-relaxed">
                Hi! I'm your AI travel assistant. How can I help plan your perfect trip?
              </div>
            </div>
            
            {/* Input */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="relative">
                <textarea 
                  placeholder="Message AI Travel Assistant..."
                  className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  rows={1}
                />
                <button className="absolute right-2 bottom-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview area */}
        <div className="bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
          <div className="p-6">
            <h2 className="font-semibold text-xl mb-4">Available Commands</h2>
            
            <div className="prose dark:prose-invert max-w-none prose-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedPrompt === 'trip-planner' ? `
### Trip Planning Commands

- \`/start\` - Begin a new trip planning session
- \`/accept N\` - Accept option N (1-3) and generate detailed plan
- \`/reject\` - Reject current options and generate new ones
- \`/edit\` - Edit the current detailed plan
- \`/verify all\` - Verify all places and activities
- \`/save\` - Save current plan to trip-details.md

### Document Generation

- \`/pdf proposal\` - Generate formal trip proposal
- \`/pdf guide\` - Generate location guide
- \`/mobile guide\` - Generate mobile-friendly guide

### Tour Search

- \`/tours [location]\` - Search for available tours in the specified location
- \`/tours save\` - Save current tour results to trip-details.md
                ` : `
### Document Generation Commands

- \`/pdf proposal\` - Generate formal trip proposal with:
  - Professional header
  - Trip overview
  - Detailed itinerary
  - Pricing breakdown
  - Terms and booking info

- \`/pdf location guide\` - Create detailed location guide with:
  - Area overview and map
  - Key attractions
  - Local transportation
  - Dining recommendations
  - Cultural tips

- \`/mobile guide\` - Create mobile-optimized guide with:
  - Collapsible sections
  - Interactive elements
  - Offline support
  - Quick reference info
                `}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
