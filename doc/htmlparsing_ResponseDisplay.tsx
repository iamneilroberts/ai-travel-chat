import React, { useState } from 'react';
import { TravelResponse } from '../../types/travel';

interface ResponseDisplayProps {
  response: TravelResponse | null;
}

export default function ResponseDisplay({ response }: ResponseDisplayProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [showText, setShowText] = useState(false);
  if (!response) return null;

  // Parse the nested JSON content
  const parseContent = (content: string): any => {
    try {
      return JSON.parse(content);
    } catch (e) {
      return null;
    }
  };

  // Extract HTML content from the nested structure
  const getContent = (response: TravelResponse) => {
    try {
      const firstLevel = parseContent(response.content);
      if (!firstLevel) return { text: null, html: null };
      
      const secondLevel = parseContent(firstLevel.content);
      if (!secondLevel) return { text: null, html: null };

      const content = secondLevel.content;
      if (Array.isArray(content)) {
        const textItem = content.find(item => item.type === 'text');
        const text = textItem?.text || null;
        
        // Extract content
        if (text) {
          // Remove analysis sections
          const cleanText = text
            .replace(/<input_analysis>[\s\S]*?<\/input_analysis>/g, '')
            .replace(/<command_analysis>[\s\S]*?<\/command_analysis>/g, '')
            .trim();

          // Look for <output> section
          const outputMatch = cleanText.match(/<output>[\s\S]*?<\/output>/);
          if (outputMatch) {
            const outputContent = outputMatch[0]
              .replace(/<output>/, '')
              .replace(/<\/output>/, '')
              .trim();

            // Extract HTML content
            const htmlTagStart = outputContent.indexOf('<html>');
            const htmlTagEnd = outputContent.lastIndexOf('</html>');
            
            if (htmlTagStart !== -1 && htmlTagEnd !== -1) {
              // If <html> tags exist, extract content between them
              const htmlContent = outputContent.slice(htmlTagStart, htmlTagEnd + 7);
              const preHtmlText = outputContent.slice(0, htmlTagStart).trim();
              return { text: preHtmlText, html: htmlContent };
            } else {
              // If no <html> tags, check if the content looks like HTML
              const hasHtmlIndicators = /<[^>]+>/.test(outputContent);
              if (hasHtmlIndicators) {
                // If it contains HTML tags, treat the whole thing as HTML
                return { text: null, html: outputContent };
              }
              // If no HTML indicators, treat as text
              return { text: outputContent, html: null };
            }
          }
        }
        return { text, html: null };
      }
      return { text: null, html: null };
    } catch (e) {
      return { text: null, html: null };
    }
  };

  const { text, html } = getContent(response);

  return (
    <div className="space-y-4">
      {/* Collapsible Raw JSON View */}
      <div className="bg-gray-100 rounded">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full p-4 text-left font-bold flex justify-between items-center hover:bg-gray-200 transition-colors"
        >
          Raw Response
          <span className="text-gray-500">{showRaw ? '▼' : '▶'}</span>
        </button>
        {showRaw && (
          <div className="p-4 border-t border-gray-200">
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[300px]">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Collapsible Text Content */}
      {text && (
        <div className="bg-gray-100 rounded">
          <button
            onClick={() => setShowText(!showText)}
            className="w-full p-4 text-left font-bold flex justify-between items-center hover:bg-gray-200 transition-colors"
          >
            Text Response
            <span className="text-gray-500">{showText ? '▼' : '▶'}</span>
          </button>
          {showText && (
            <div className="p-4 border-t border-gray-200">
              <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[300px]">
                {text}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* HTML Preview */}
      <div className="bg-white rounded shadow-md">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold">HTML Preview</h3>
        </div>
        <div className="p-4 overflow-auto max-h-[600px]">
          {html ? (
            <div 
              className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              style={{
                '--tw-prose-headings': 'var(--tw-prose-invert-headings)',
                '--tw-prose-body': 'var(--tw-prose-invert-body)',
                '--tw-prose-links': 'var(--tw-prose-invert-links)',
              } as React.CSSProperties}
              dangerouslySetInnerHTML={{ 
                __html: html
                  .replace(/<html>/gi, '')
                  .replace(/<\/html>/gi, '')
                  .replace(/<body>/gi, '')
                  .replace(/<\/body>/gi, '')
                  .trim()
              }} 
            />
          ) : (
            <p className="text-gray-500 italic">No HTML content found in response</p>
          )}
        </div>
      </div>
    </div>
  );
}
