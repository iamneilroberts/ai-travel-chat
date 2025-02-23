export const welcomeContent = `
## Welcome to your AI Travel Assistant!

I can help you plan amazing trips. Just tell me where you'd like to go and for how long, and I'll generate some personalized itinerary options for you.

**Here are some examples of what you can ask me:**

- "Plan a 7-day trip to Japan for cherry blossom season"
- "Romantic getaway to Paris for a week"
- "Family vacation in Florida with theme parks"

**Key Features:**

- **Itinerary Generation:** I can create detailed day-by-day itineraries based on your preferences.
- **Option Selection:** Choose from multiple trip options tailored to your interests.
- **Customization:** Easily modify and update your itinerary as needed.
- **Markdown Editor:** Use the built-in editor to fine-tune your trip details and notes.
- **Real-time Preview:** See your itinerary come to life in the preview window.

**Get Started:**

1. **Enter your trip idea** in the chat input below. Be as specific or as general as you like.
2. **Click "Send"** to generate your initial trip options.
3. **Review the generated options** and select the one that best suits you.
4. **Customize and refine** your itinerary using the editor and chat.

Let's start planning your dream vacation! 🌍✈️
`;

export const formatInitialTripDescription = (chatInput: string) => {
  return [
    `## Initial Trip Description`,
    chatInput,
    '',
    `## Generated Options`,
    `### Option 1`,
    `[Details of first generated option will appear here]`,
    '',
    `### Option 2`,
    `[Details of second generated option will appear here]`,
    '',
    `### Option 3`,
    `[Details of third generated option will appear here]`,
    '',
    `## Selected Option`,
    `[The chosen option and its details will be copied here]`,
    '',
    `## Overview`,
    `[This section will be auto-populated based on the selected option]`,
    '',
    `## Travelers`,
    `[This section will be auto-populated based on the initial description and selected option]`,
    '',
    `## Duration & Dates`,
    `[This section will be auto-populated based on the initial description and selected option]`,
    '',
    `## Budget`,
    `[This section will be auto-populated based on the selected option]`,
    '',
    `## Preferences`,
    `[This section will be auto-populated based on the initial description and selected option]`,
    '',
    `## Selected Itinerary`,
    `[This section will be populated with the expanded details of your chosen option]`,
    '',
    `## Trip Notes`,
    `[Any additional notes or modifications to the trip will be tracked here]`
  ].join('\n');
};
