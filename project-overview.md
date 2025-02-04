a travel planning application. The application should be built using modern web technologies and follow best practices for code organization, testing, and maintainability.

## Project Overview

Create a web-based travel assistant application with the following core features:
1. Markdown file editing and preview
2. Diff interface for reviewing changes
3. HTML preview of travel documents
4. Synchronization between local files and AI context

## Technical Requirements

### Stack
- Next.js for the application framework
- TypeScript for type safety
- TailwindCSS for styling
- Split.js for resizable panes
- CodeMirror/Monaco for the markdown editor
- DOMPurify for HTML sanitization
- diff-match-patch for diff generation

### File Structure
```
travel-assistant/
├── src/
│   ├── components/
│   │   ├── DiffViewer/
│   │   │   ├── index.tsx
│   │   │   ├── ChangeDisplay.tsx
│   │   │   └── DiffControls.tsx
│   │   ├── HtmlPreview/
│   │   │   ├── index.tsx
│   │   │   └── PreviewControls.tsx
│   │   └── MarkdownEditor/
│   │       ├── index.tsx
│   │       └── EditorControls.tsx
│   ├── utils/
│   │   ├── fileSync.ts
│   │   ├── diffGenerator.ts
│   │   └── markdownProcessor.ts
│   ├── styles/
│   │   └── main.css
│   └── pages/
│       ├── index.tsx
│       └── api/
│           ├── sync.ts
│           └── preview.ts
├── public/
│   └── styles/
├── types/
│   └── index.d.ts
└── tests/
```

### Core Components

1. MarkdownEditor
```typescript
interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  mode: 'full' | 'split';
}
```

2. DiffViewer
```typescript
interface DiffProps {
  original: string;
  modified: string;
  onAccept: (changeId: string) => void;
  onReject: (changeId: string) => void;
}
```

3. HtmlPreview
```typescript
interface PreviewProps {
  markdown: string;
  style: StyleConfig;
  mode: 'light' | 'dark';
}
```

### Implementation Steps

1. Project Setup
```bash
npx create-next-app travel-assistant --typescript
cd travel-assistant
npm install @monaco-editor/react split.js dompurify diff-match-patch
```

2. Create Base Components
- Implement the editor with Monaco
- Create the diff viewer with split view
- Build the HTML preview component

3. Implement File Synchronization
- Create file watchers
- Implement WebSocket connection
- Handle file system operations

4. Add Diff Interface
- Implement diff generation
- Create change acceptance/rejection
- Add change highlighting

5. Style System
- Implement style presets
- Add theme switching
- Create responsive layouts

6. Testing
- Unit tests for utilities
- Component tests
- Integration tests

## Implementation Guidelines

1. Error Handling
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

function handleError(error: Error): ErrorResponse {
  // Implementation
}
```

2. State Management
```typescript
interface AppState {
  currentFile: string;
  changes: Change[];
  syncStatus: SyncStatus;
  preferences: UserPreferences;
}
```

3. File Operations
```typescript
interface FileOperation {
  read: (path: string) => Promise<string>;
  write: (path: string, content: string) => Promise<void>;
  watch: (path: string, callback: FileCallback) => void;
}
```

4. Synchronization Protocol
```typescript
interface SyncProtocol {
  checkStatus: () => Promise<SyncStatus>;
  sync: () => Promise<void>;
  resolveConflict: (conflictId: string, resolution: Resolution) => Promise<void>;
}
```

## Quality Requirements

1. Code Quality
- Use TypeScript strictly
- Follow ESLint rules
- Maintain consistent formatting
- Document all interfaces

2. Performance
- Optimize large file handling
- Implement proper memoization
- Use efficient diff algorithms
- Optimize preview rendering

3. Testing
- Maintain 80%+ coverage
- Test edge cases
- Include integration tests
- Add performance tests

4. Documentation
- Add JSDoc comments
- Create README.md
- Document API endpoints
- Include setup instructions

