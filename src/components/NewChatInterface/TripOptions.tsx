import { useState } from 'react';

interface TripOption {
  id: string;
  title: string;
  description: string;
}

interface TripOptionsProps {
  options: TripOption[];
  onAccept: (option: TripOption, edited?: boolean) => void;
  onRejectAll: (feedback?: string) => void;
}

export const TripOptions = ({ options, onAccept, onRejectAll }: TripOptionsProps) => {
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [editedOptions, setEditedOptions] = useState<Record<string, TripOption>>({});
  const [rejectionFeedback, setRejectionFeedback] = useState<string>('');

  const handleEdit = (optionId: string) => {
    setEditingOption(optionId);
    // Initialize edited option if not already present
    if (!editedOptions[optionId]) {
      const option = options.find(opt => opt.id === optionId);
      if (option) {
        setEditedOptions({
          ...editedOptions,
          [optionId]: { ...option }
        });
      }
    }
  };

  const handleSaveEdit = (optionId: string) => {
    setEditingOption(null);
    const editedOption = editedOptions[optionId];
    if (editedOption) {
      onAccept(editedOption, true);
    }
  };

  const handleCancelEdit = () => {
    setEditingOption(null);
  };

  const handleInputChange = (
    optionId: string,
    field: 'title' | 'description',
    value: string
  ) => {
    setEditedOptions({
      ...editedOptions,
      [optionId]: {
        ...editedOptions[optionId],
        [field]: value
      }
    });
  };

  const handleRejectAll = () => {
    onRejectAll(rejectionFeedback);
    setRejectionFeedback('');
  };

  return (
    <div className="trip-options space-y-6">
      <h2 className="text-xl font-bold mb-4">Trip Options</h2>
      <p className="mb-4">Based on your request, here are some options:</p>
      
      {options.map((option) => (
        <div key={option.id} className="option mb-6 p-4 border border-border rounded-lg">
          {editingOption === option.id ? (
            // Edit mode
            <div className="space-y-3">
              <input
                type="text"
                value={editedOptions[option.id]?.title || option.title}
                onChange={(e) => handleInputChange(option.id, 'title', e.target.value)}
                className="w-full p-2 border border-border rounded-md"
              />
              <textarea
                value={editedOptions[option.id]?.description || option.description}
                onChange={(e) => handleInputChange(option.id, 'description', e.target.value)}
                className="w-full p-2 border border-border rounded-md min-h-[100px]"
              />
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => handleSaveEdit(option.id)}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-md"
                >
                  Save
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="px-3 py-1 border border-border rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <>
              <h3 className="text-lg font-semibold">{option.title}</h3>
              <p>{option.description}</p>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => onAccept(option)}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-md"
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleEdit(option.id)}
                  className="px-3 py-1 border border-border rounded-md"
                >
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      
      <div className="mt-6 pt-4 border-t border-border">
        <button 
          onClick={handleRejectAll}
          className="px-3 py-1 bg-destructive text-destructive-foreground rounded-md"
        >
          Reject All
        </button>
        <div className="mt-2">
          <input 
            type="text" 
            value={rejectionFeedback}
            onChange={(e) => setRejectionFeedback(e.target.value)}
            placeholder="Why didn't these options work for you? (Optional)" 
            className="w-full p-2 border border-border rounded-md"
          />
        </div>
      </div>
    </div>
  );
};