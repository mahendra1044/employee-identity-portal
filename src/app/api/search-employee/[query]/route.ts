import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Load mock data
function loadMockData() {
  try {
    const pingDirPath = join(process.cwd(), 'backend/mocks/ping-directory-search.json');
    const pingMfaPath = join(process.cwd(), 'backend/mocks/ping-mfa-search.json');
    
    const pingDirectory = JSON.parse(readFileSync(pingDirPath, 'utf-8'));
    const pingMfa = JSON.parse(readFileSync(pingMfaPath, 'utf-8'));
    
    return { pingDirectory, pingMfa };
  } catch (error) {
    console.error('Error loading mock data:', error);
    return { pingDirectory: [], pingMfa: [] };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) {
  const { query } = await params;
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  console.log('🔍 [Search API] Query:', query);

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

  // Load mock data
  const { pingDirectory, pingMfa } = loadMockData();
  
  // Search logic: case-insensitive partial match on name, email, or userId
  const searchTerm = query.toLowerCase().trim();
  
  const matchedUsers = pingDirectory.filter((user: any) => {
    return (
      user.name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.userId?.toLowerCase().includes(searchTerm)
    );
  });

  console.log('🔍 [Search API] Found matches:', matchedUsers.length);

  // Enrich with MFA data
  const results = matchedUsers.map((user: any) => {
    const mfaData = pingMfa.find((mfa: any) => mfa.userId === user.userId);
    return {
      ...user,
      mfaStatus: mfaData?.status || 'Unknown',
      mfaLastEvent: mfaData?.lastEvent || null
    };
  });

  // Return in the expected format
  return NextResponse.json({
    'ping-directory': results,
    'ping-mfa': results.map((r: any) => ({
      userId: r.userId,
      status: r.mfaStatus,
      lastEvent: r.mfaLastEvent
    }))
  });
}