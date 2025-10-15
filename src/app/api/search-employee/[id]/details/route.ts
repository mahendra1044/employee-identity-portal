import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const system = searchParams.get('system');
  
  if (!system) {
    return NextResponse.json({ error: 'System parameter is required' }, { status: 400 });
  }

  try {
    // Load mock data directly from backend/mocks folder
    const mockFile = join(process.cwd(), 'backend', 'mocks', `${system}-details.json`);
    const mockData = await readFile(mockFile, 'utf-8');
    const data = JSON.parse(mockData);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error(`Failed to load mock data for ${system}:`, error);
    return NextResponse.json({ error: 'Failed to fetch employee details' }, { status: 500 });
  }
}