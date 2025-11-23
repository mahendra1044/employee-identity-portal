import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Map system names to their details file paths
const SYSTEM_DETAILS_FILES: Record<string, string> = {
  'ping-directory': 'ping-directory-details.json',
  'ping-federate': 'ping-federate-details.json',
  'ping-mfa': 'ping-mfa-details.json',
  'azure-ad': 'azure-ad-details.json',
  'cyberark': 'cyberark-details.json',
  'saviynt': 'saviynt-details.json',
};

// Load system details data
function loadSystemDetails(system: string) {
  try {
    const fileName = SYSTEM_DETAILS_FILES[system];
    if (!fileName) {
      console.error(`❌ Unknown system: ${system}`);
      return null;
    }

    const filePath = join(process.cwd(), 'backend/mocks', fileName);
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log(`✅ Loaded ${system} details from ${fileName}`);
    return data;
  } catch (error) {
    console.error(`❌ Error loading ${system} details:`, error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) {
  const { query } = await params;
  const { searchParams } = new URL(request.url);
  const system = searchParams.get('system');
  
  console.log(`🔍 [Details API] Query: ${query}, System: ${system}`);
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!system) {
    return NextResponse.json({ error: 'System parameter is required' }, { status: 400 });
  }

  // Verify JWT token
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Load system details
  const systemData = loadSystemDetails(system);
  
  if (!systemData) {
    return NextResponse.json({ error: `System ${system} not found or not available` }, { status: 404 });
  }

  // Find user data by userId
  const userData = systemData[query];
  
  if (!userData) {
    console.log(`⚠️ User ${query} not found in ${system} details`);
    return NextResponse.json({ error: `User ${query} not found in ${system}` }, { status: 404 });
  }

  console.log(`✅ Found details for ${query} in ${system}`);
  
  // Return data in the expected format
  return NextResponse.json({
    data: userData
  });
}
