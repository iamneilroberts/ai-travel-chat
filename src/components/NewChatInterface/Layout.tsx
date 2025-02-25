import { ReactNode, useState } from 'react';
import { useTheme } from 'next-themes';
import { ChatPanel } from './ChatPanel';
import { ContentPanel } from './ContentPanel';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [contentType, setContentType] = useState<'welcome' | 'tripDetails' | 'html'>('welcome');
  const [contentData, setContentData] = useState<string>('');
  const { theme, setTheme } = useTheme();
  
  // Function to handle changing the content panel
  const handleContentChange = (type: 'welcome' | 'tripDetails' | 'html', data?: string) => {
    setContentType(type);
    if (data) {
      setContentData(data);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation Bar */}
      <nav className="h-14 border-b border-border flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">AI Travel Chat</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Model Selector */}
          <select
            className="bg-background border border-border rounded-md px-2 py-1 text-sm"
            onChange={(e) => console.log('Model changed:', e.target.value)}
          >
            <option value="gpt-4">GPT-4</option>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
          </select>
          
          {/* System Prompt Selector */}
          <select
            className="bg-background border border-border rounded-md px-2 py-1 text-sm"
            onChange={(e) => console.log('Prompt changed:', e.target.value)}
          >
            <option value="default">Default</option>
            <option value="travel-expert">Travel Expert</option>
            <option value="tour-guide">Tour Guide</option>
          </select>
          
          {/* Find Tours Button */}
          <button
            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
            onClick={() => console.log('Find Tours clicked')}
          >
            Find Tours
          </button>
          
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-accent rounded-md"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel (Left Side) */}
        <ChatPanel onContentChange={handleContentChange} />
        
        {/* Content Panel (Right Side) */}
        <ContentPanel type={contentType} content={contentData} />
      </div>
    </div>
  );
};