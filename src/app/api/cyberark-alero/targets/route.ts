import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock Alero targets data
  const data = {
    user,
    targets: [
      { name: 'PROD-DB-01', type: 'Database Server', access: 'authorized', protocol: 'RDP', lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { name: 'PROD-WEB-02', type: 'Web Server', access: 'authorized', protocol: 'SSH', lastAccessed: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      { name: 'PROD-APP-03', type: 'Application Server', access: 'authorized', protocol: 'HTTPS', lastAccessed: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString() },
      { name: 'DEV-SERVER-01', type: 'Development Server', access: 'authorized', protocol: 'SSH', lastAccessed: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString() },
    ],
    totalTargets: 4,
    authorizedTargets: 4,
  };

  return NextResponse.json({ data });
}
