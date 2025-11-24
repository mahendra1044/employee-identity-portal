import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock CyberArk Identity login history data
  const data = {
    user,
    logins: [
      { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), location: 'San Francisco, CA', device: 'MacBook Pro', ip: '192.168.1.100', status: 'success', mfaUsed: true },
      { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), location: 'San Francisco, CA', device: 'iPhone 14 Pro', ip: '192.168.1.101', status: 'success', mfaUsed: true },
      { timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), location: 'San Francisco, CA', device: 'MacBook Pro', ip: '192.168.1.100', status: 'success', mfaUsed: true },
      { timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), location: 'Unknown', device: 'Unknown Device', ip: '203.45.67.89', status: 'failed', mfaUsed: false },
    ],
    totalLogins: 156,
    successfulLogins: 155,
    failedLogins: 1,
    last30Days: 42,
  };

  return NextResponse.json({ data });
}
