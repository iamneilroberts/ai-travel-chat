import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TRIP_DETAILS_PATH = path.join(process.cwd(), 'src', 'utils', 'trip-details.md');

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Write the content to the file
    await fs.promises.writeFile(TRIP_DETAILS_PATH, content, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating trip details:', error);
    return NextResponse.json(
      { error: 'Failed to update trip details' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const content = await fs.promises.readFile(TRIP_DETAILS_PATH, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error reading trip details:', error);
    return NextResponse.json(
      { error: 'Failed to read trip details' },
      { status: 500 }
    );
  }
}
