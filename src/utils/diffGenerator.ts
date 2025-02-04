import { diff_match_patch, Diff } from 'diff-match-patch';

export interface Change {
  id: string;
  type: 'add' | 'remove' | 'modify';
  content: {
    before: string;
    after: string;
  };
  lineNumber?: number;
}

export const generateDiff = (original: string, modified: string): Change[] => {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(original, modified);
  dmp.diff_cleanupSemantic(diffs);

  const changes: Change[] = [];
  let currentChange: Partial<Change> | null = null;
  let lineCount = 1;

  diffs.forEach((diff: Diff, index: number) => {
    const [operation, text] = diff;
    
    // diff-match-patch uses -1 for deletion, 1 for insertion, 0 for equal
    if (operation !== 0) {
      if (!currentChange) {
        currentChange = {
          id: `change-${index}`,
          type: operation === -1 ? 'remove' : 'add',
          content: {
            before: operation === -1 ? text : '',
            after: operation === 1 ? text : '',
          },
          lineNumber: lineCount
        };
      } else {
        if (operation === -1) {
          currentChange.content = {
            before: text,
            after: currentChange.content?.after || ''
          };
          currentChange.type = 'modify';
        } else {
          currentChange.content = {
            before: currentChange.content?.before || '',
            after: text
          };
          currentChange.type = 'modify';
        }
      }
    } else {
      if (currentChange) {
        changes.push(currentChange as Change);
        currentChange = null;
      }
      lineCount += (text.match(/\n/g) || []).length;
    }
  });

  if (currentChange) {
    changes.push(currentChange as Change);
  }

  return changes;
};

export const applyChanges = (original: string, changes: Change[]): string => {
  let result = original;
  
  changes.forEach(change => {
    if (change.type === 'modify') {
      result = result.replace(change.content.before, change.content.after);
    } else if (change.type === 'add') {
      result += change.content.after;
    } else if (change.type === 'remove') {
      result = result.replace(change.content.before, '');
    }
  });

  return result;
};
