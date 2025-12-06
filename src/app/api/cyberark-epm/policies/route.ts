import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock EPM policies data
  const data = {
    user,
    policies: [
      { name: 'Standard User Policy', status: 'active', lastUpdate: new Date().toISOString() },
      { name: 'Developer Policy', status: 'active', lastUpdate: '2024-11-20T10:00:00Z' },
      { name: 'Admin Access Policy', status: 'inactive', lastUpdate: '2024-10-15T08:30:00Z' },
    ],
    totalPolicies: 3,
    activePolicies: 2,
  };

  return NextResponse.json({ data });
}
