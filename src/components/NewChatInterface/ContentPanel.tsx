import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WelcomeContent } from './WelcomeContent';

interface ContentPanelProps {
  type: 'welcome' | 'tripDetails' | 'html';
  content?: string;
}

export const ContentPanel = ({ type, content }: ContentPanelProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableContent, setEditableContent] = useState<string>('');
  const [tripDetailsContent, setTripDetailsContent] = useState<string>('');

  // Load trip-details.md when needed
  useEffect(() => {
    if (type === 'tripDetails' && !tripDetailsContent) {
      // In a real app, this would fetch from the server or file system
      fetch('/utils/trip-details.md')
        .then(response => response.text())
        .then(text => {
          setTripDetailsContent(text);
          setEditableContent(text);
        })
        .catch(error => console.error('Error loading trip details:', error));
    }
  }, [type, tripDetailsContent]);

  // Handle saving edited content
  const handleSave = () => {
    // In a real app, this would save to the server or file system
    setTripDetailsContent(editableContent);
    setIsEditing(false);
    console.log('Saving content:', editableContent);
    // TODO: Implement actual save functionality
  };

  // Render panel title based on content type
  const renderTitle = () => {
    switch (type) {
      case 'welcome':
        return 'Welcome';
      case 'tripDetails':
        return 'Trip Details';
      case 'html':
        return 'Preview';
      default:
        return 'Content';
    }
  };

  // Render content based on type
  const renderContent = () => {
    // If in editing mode, show editor
    if (isEditing) {
      return (
        <div className="space-y-4">
          <textarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            className="w-full h-[calc(100vh-12rem)] bg-background border border-border rounded-md p-4 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-md border border-border hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </div>
      );
    }

    // Otherwise, show content based on type
    switch (type) {
      case 'welcome':
        return <WelcomeContent />;
      
      case 'tripDetails':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {tripDetailsContent}
            </ReactMarkdown>
          </div>
        );
      
      case 'html':
        return (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content || '' }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-1/2 flex flex-col h-full">
      <div className="h-14 border-b border-border flex items-center px-4 justify-between">
        <span className="font-medium">{renderTitle()}</span>
        <div className="flex items-center gap-2">
          {type === 'tripDetails' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-accent rounded-md"
              aria-label="Edit"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};