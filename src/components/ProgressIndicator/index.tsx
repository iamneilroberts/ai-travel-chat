import React, { useState, useEffect } from 'react';

interface ProgressIndicatorProps {
  duration?: number; // Total duration in seconds (default 12)
  onComplete?: () => void;
  commandType: 'new' | 'build';
}

const STAGES = {
  new: [
    'Preparing trip request...',
    'Analyzing travel preferences...',
    'Exploring destination options...',
    'Generating trip alternatives...',
    'Calculating estimated costs...',
    'Finalizing recommendations...'
  ],
  build: [
    'Preparing build request...',
    'Analyzing selected itinerary...',
    'Gathering travel details...',
    'Building comprehensive plan...',
    'Adding travel tips...',
    'Finalizing travel guide...'
  ]
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  duration = 24,
  onComplete,
  commandType
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(STAGES[commandType][0]);

  useEffect(() => {
    const startTime = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const newProgress = Math.min((elapsedTime / duration) * 100, 100);
      
      // Update stage based on progress
      const stages = STAGES[commandType];
      const stageIndex = Math.floor((newProgress / 100) * (stages.length - 0.1));
      setCurrentStage(stages[Math.min(stageIndex, stages.length - 1)]);

      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else {
        onComplete?.();
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [duration, onComplete, commandType]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4 text-center text-white text-lg">
        {currentStage}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-200 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
