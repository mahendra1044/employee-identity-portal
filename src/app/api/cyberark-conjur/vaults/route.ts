import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock Conjur vaults data
  const data = {
    user,
    vaults: [
      { name: 'production-vault', secrets: 15, access: 'read-execute', lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { name: 'staging-vault', secrets: 8, access: 'read-execute', lastAccessed: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
    ],
    totalVaults: 2,
    totalSecrets: 23,
  };

  return NextResponse.json({ data });
}
