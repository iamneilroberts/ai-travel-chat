import React, { useState } from 'react';
import { AIClient, AIModel } from '@/utils/aiClient';

interface ModelSelectorProps {
  onModelChange?: (model: string) => void;
  defaultModel?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  onModelChange, 
  defaultModel = 'anthropic/claude-2.1' 
}) => {
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const availableModels = AIClient.getAvailableModels();

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = event.target.value;
    setSelectedModel(newModel);
    onModelChange?.(newModel);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="model-selector" className="text-sm font-medium text-gray-700 dark:text-gray-200">
        AI Model:
      </label>
      <select
        id="model-selector"
        value={selectedModel}
        onChange={handleModelChange}
        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none transition-colors"
      >
        {availableModels.map((model) => (
          <option 
            key={model.id} 
            value={model.id}
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            {model.name} ({model.provider})
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;
