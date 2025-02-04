'use client';

import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

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
}

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({ markdown, style = { mode: 'light' } }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      let html = '';
      // Check if the content is HTML (starts with <)
      if (markdown.trim().startsWith('<')) {
        html = DOMPurify.sanitize(markdown, purifyConfig);
        containerRef.current.className = `p-4 overflow-auto`;
      } else {
        // If not HTML, parse as markdown and keep prose classes
        const parsedHtml = marked.parse(markdown, { 
          breaks: true,
          silent: true // Prevents throwing on parse errors
        });
        if (typeof parsedHtml === 'string') {
          html = DOMPurify.sanitize(parsedHtml, purifyConfig);
          containerRef.current.className = `markdown-content p-4 overflow-auto ${style.mode === 'dark' ? 'dark' : ''}`;
        }
      }
      
      if (html) {
        containerRef.current.innerHTML = html;
      } else {
        containerRef.current.innerHTML = '<p>Error rendering content</p>';
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = '<p>Error rendering content</p>';
      }
    }
  }, [markdown, style.mode]);

  return (
    <div 
      ref={containerRef}
      className="p-4 overflow-auto"
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
  );
};
