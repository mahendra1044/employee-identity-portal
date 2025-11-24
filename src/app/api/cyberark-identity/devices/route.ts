import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock CyberArk Identity devices data
  const data = {
    user,
    devices: [
      { name: 'iPhone 14 Pro', type: 'mobile', os: 'iOS 17.2', trusted: true, lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), registered: '2024-01-15T10:00:00Z' },
      { name: 'MacBook Pro', type: 'desktop', os: 'macOS 14.2', trusted: true, lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), registered: '2024-01-10T09:00:00Z' },
    ],
    totalDevices: 2,
    trustedDevices: 2,
  };

  return NextResponse.json({ data });
}
