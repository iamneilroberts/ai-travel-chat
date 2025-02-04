import React from 'react';
import { PromptSelector } from '@/components/PromptSelector';
import { ModelSelector } from '@/components/ModelSelector';

interface HeaderSectionProps {
  onPromptChange: (prompt: string) => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ onPromptChange }) => {
  return (
    <div className="flex justify-between items-center p-2 bg-emerald-50/30 dark:bg-gray-800 border-b border-emerald-200/50 dark:border-gray-700 shadow-sm">
      <div className="flex items-center space-x-4 flex-1">
        <PromptSelector
          onPromptChange={onPromptChange}
          className="max-w-xl"
        />
        <ModelSelector />
      </div>
    </div>
  );
};
