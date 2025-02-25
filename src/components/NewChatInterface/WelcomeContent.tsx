import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const welcomeMarkdown = `
# Welcome to AI Travel Chat! 🌎

Let's plan your perfect trip together. Here's how to get started:

## Trip Planning Commands
- \`/new\` - Start a new trip (e.g. "7 day trip to Ireland October 2025, two adults")
- \`/select [1-3]\` - Choose from generated trip options
- \`/build\` - Create detailed itinerary from selected option
- \`/update\` - Update existing trip details
- \`/describe\` - Get detailed information about a place or activity

## Document Generation
- \`/pdf proposal\` - Generate formal trip proposal
- \`/pdf location guide\` - Create detailed location guide
- \`/mobile guide\` - Get mobile-optimized travel guide

## What I Can Help With
- ✈️ Trip planning and itineraries
- 🏨 Accommodation recommendations
- 🎯 Activity suggestions
- 🚗 Transportation planning
- 📝 Travel document creation

## Example Queries
- "Plan a 5-day trip to Tokyo for two adults in spring 2025"
- "Find food tours and cooking classes in Paris"
- "Create a family-friendly itinerary for London"
- "What are the best areas to stay in Barcelona for nightlife?"

## Travel Documents I Can Create
- 📋 Detailed trip proposals
- 📱 Mobile-friendly location guides
- 🗺️ Area guides with maps and attractions
- 🚇 Local transportation guides
- 🍽️ Dining recommendations
- 🛍️ Shopping district guides
- 📝 Cultural tips and etiquette guides
- ⚡ Emergency information

Need help? Just ask! 😊
`;

export const WelcomeContent = () => {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {welcomeMarkdown}
      </ReactMarkdown>
    </div>
  );
};