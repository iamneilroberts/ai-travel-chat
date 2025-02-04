import 'react';

declare module 'react' {
  // Add missing type definitions for React 19
  function useState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>];
  function useState<T = undefined>(): [T | undefined, Dispatch<SetStateAction<T | undefined>>];
}
