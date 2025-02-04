import React, { useRef, useEffect } from 'react';
import { HtmlPreview } from '@/components/HtmlPreview';

interface HelpOverlayProps {
  content: string;
  onClose: () => void;
  style?: { mode: 'dark' | 'light' };
}

export const HelpOverlay: React.FC<HelpOverlayProps> = ({
  content,
  onClose,
  style = { mode: 'dark' },
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={overlayRef}
        className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto m-4"
      >
        <div className="p-6">
          <HtmlPreview markdown={content} style={style} />
        </div>
      </div>
    </div>
  );
};
