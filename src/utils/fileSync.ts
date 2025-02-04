import fs from 'fs';
import path from 'path';

export function saveFile(content: string, filePath: string): void {
  fs.writeFileSync(filePath, content, 'utf-8');
}
