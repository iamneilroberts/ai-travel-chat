'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { PreviewControls } from './PreviewControls';

// Configure DOMPurify to allow style tags
const purifyConfig = {
  ADD_TAGS: ['style'],
  ADD_ATTR: ['class', 'id'],
};

interface HtmlPreviewProps {
  markdown: string;
  style?: {
    mode?: 'light' | 'dark';
  };
  onRejectPlan?: (note: string) => void;
  isProcessing?: boolean;
  onSave?: (content: string) => void;
}

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({ 
  markdown, 
  style = { mode: 'light' },
  onRejectPlan,
  isProcessing = false,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(markdown);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderContent = useCallback(() => {
    if (!containerRef.current) return;

    try {
      let html = '';
      const trimmedMarkdown = markdown.trim();
      
      if (!trimmedMarkdown) {
        containerRef.current.innerHTML = '';
        return;
      }

      // Check if the content is HTML (starts with <)
      if (trimmedMarkdown.startsWith('<')) {
        html = DOMPurify.sanitize(trimmedMarkdown, purifyConfig);
        containerRef.current.className = `p-4 overflow-auto`;
      } else {
        // If not HTML, parse as markdown and keep prose classes
        const parsedHtml = marked.parse(trimmedMarkdown, { 
          breaks: true,
          silent: true // Prevents throwing on parse errors
        });
        if (typeof parsedHtml === 'string') {
          html = DOMPurify.sanitize(parsedHtml, purifyConfig);
          containerRef.current.className = `markdown-content p-4 overflow-auto ${style.mode === 'dark' ? 'dark' : ''}`;
        }
      }
      
      containerRef.current.innerHTML = html || '';
    } catch (error) {
      console.error('Error rendering content:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
  }, [markdown, style.mode]);

  useEffect(() => {
    renderContent();
  }, [renderContent]);

  useEffect(() => {
    setEditContent(markdown);
  }, [markdown]);

  const handleSave = () => {
    if (onSave && editContent.trim() !== '') {
      onSave(editContent);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = editContent.substring(0, start) + '  ' + editContent.substring(end);
      setEditContent(newValue);
      // Set cursor position after tab
      setTimeout(() => {
        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PreviewControls 
        mode={style.mode || 'light'} 
        onRejectPlan={onRejectPlan}
        isProcessing={isProcessing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        isEditing={isEditing}
      />
      {isEditing ? (
        <div className="flex-1 overflow-auto">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            className="w-full h-full p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none whitespace-pre-wrap border border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-md"
            style={{
              lineHeight: '1.6',
              tabSize: 2,
              minHeight: '100%',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
            }}
          />
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="p-4 overflow-auto flex-1"
        >
        <style jsx global>{`
          .markdown-content h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: ${style.mode === 'dark' ? '#34D399' : '#059669'};
          }
          .markdown-content h2 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: ${style.mode === 'dark' ? '#34D399' : '#059669'};
          }
          .markdown-content h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: ${style.mode === 'dark' ? '#34D399' : '#059669'};
          }
          .markdown-content h4 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: ${style.mode === 'dark' ? '#34D399' : '#059669'};
          }
          .markdown-content p {
            margin-bottom: 0.75rem;
            color: ${style.mode === 'dark' ? '#E5E7EB' : '#374151'};
          }
          .markdown-content ul {
            list-style-type: none;
            padding-left: 1rem;
            margin-bottom: 1rem;
          }
          .markdown-content ul li {
            position: relative;
            padding-left: 1rem;
            margin-bottom: 0.25rem;
            color: ${style.mode === 'dark' ? '#E5E7EB' : '#374151'};
          }
          .markdown-content ul li::before {
            content: "•";
            position: absolute;
            left: -0.5rem;
            color: ${style.mode === 'dark' ? '#34D399' : '#059669'};
          }
          .markdown-content strong {
            color: ${style.mode === 'dark' ? '#34D399' : '#059669'};
            font-weight: 600;
          }
        `}</style>
      </div>
      )}
    </div>
  );
};
