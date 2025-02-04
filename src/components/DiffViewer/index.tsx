import { FC } from 'react';
import { Change } from '@/utils/diffGenerator';
import { ChangeDisplay } from './ChangeDisplay';
import { DiffControls } from './DiffControls';

export interface DiffProps {
  original: string;
  modified: string;
  onAccept: (changeId: string) => void;
  onReject: (changeId: string) => void;
  changes: Change[];
}

export const DiffViewer: FC<DiffProps> = ({
  original,
  modified,
  onAccept,
  onReject,
  changes
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <DiffControls
        changesCount={changes.length}
        onAcceptAll={() => changes.forEach(change => onAccept(change.id))}
        onRejectAll={() => changes.forEach(change => onReject(change.id))}
      />
      <div className="flex-1 overflow-auto p-4">
        {changes.map((change) => (
          <ChangeDisplay
            key={change.id}
            change={change}
            onAccept={() => onAccept(change.id)}
            onReject={() => onReject(change.id)}
          />
        ))}
        {changes.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No changes to display
          </div>
        )}
      </div>
    </div>
  );
};
