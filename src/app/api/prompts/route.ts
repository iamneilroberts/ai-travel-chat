import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROMPTS_DIR = path.join(process.cwd(), 'prompts');

export async function GET() {
  try {
    const files = await fs.promises.readdir(PROMPTS_DIR);
    const prompts = files
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        name: file.replace('.md', '').replace(/-/g, ' '),
        path: file
      }));

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error listing prompts:', error);
    return NextResponse.json(
      { error: 'Failed to list prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { promptPath } = await request.json();
    const fullPath = path.join(PROMPTS_DIR, promptPath);

    // Validate the path is within the prompts directory
    if (!fullPath.startsWith(PROMPTS_DIR)) {
      return NextResponse.json(
        { error: 'Invalid prompt path' },
        { status: 400 }
      );
    }

    const content = await fs.promises.readFile(fullPath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error loading prompt:', error);
    return NextResponse.json(
      { error: 'Failed to load prompt' },
      { status: 500 }
    );
  }
}
