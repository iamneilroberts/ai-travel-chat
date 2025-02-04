'use client';

import { useEffect, useState } from 'react';
import { SystemPrompt, PromptLoader } from '@/utils/promptLoader';

interface PromptSelectorProps {
  onPromptChange: (prompt: string) => void;
  className?: string;
}

export function PromptSelector({ onPromptChange, className = '' }: PromptSelectorProps) {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const availablePrompts = await PromptLoader.listPrompts();
      setPrompts(availablePrompts);
      
      // Select the first prompt by default
      if (availablePrompts.length > 0) {
        handlePromptSelect(availablePrompts[0].path);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      setError('Failed to load system prompts');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSelect = async (promptPath: string) => {
    try {
      setSelectedPrompt(promptPath);
      const content = await PromptLoader.loadPrompt(promptPath);
      onPromptChange(content);
    } catch (error) {
      console.error('Error loading prompt content:', error);
      setError('Failed to load prompt content');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-200 dark:border-gray-200 border-t-transparent" />
        <span className="text-gray-600 dark:text-gray-400">Loading prompts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="prompt-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        System Prompt:
      </label>
      <select
        id="prompt-select"
        value={selectedPrompt}
        onChange={(e) => handlePromptSelect(e.target.value)}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none transition-colors"
      >
        {prompts.map((prompt) => (
          <option 
            key={prompt.path} 
            value={prompt.path}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {prompt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
