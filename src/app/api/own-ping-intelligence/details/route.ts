import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  try {
    const mockFilePath = path.join(process.cwd(), 'backend', 'mocks', 'ping-intelligence-details.json');
    const mockData = JSON.parse(fs.readFileSync(mockFilePath, 'utf-8'));
    
    return NextResponse.json({ data: mockData });
  } catch (error) {
    console.error('Error loading ping-intelligence details data:', error);
    return NextResponse.json(
      { error: 'Failed to load Ping Intelligence details' },
      { status: 500 }
    );
  }
}
