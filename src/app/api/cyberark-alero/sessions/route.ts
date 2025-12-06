import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock Alero sessions data
  const data = {
    user,
    sessions: [
      { target: 'PROD-DB-01', startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), duration: '45 minutes', status: 'completed', protocol: 'RDP' },
      { target: 'PROD-WEB-02', startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), duration: '2 hours', status: 'completed', protocol: 'SSH' },
      { target: 'PROD-APP-03', startTime: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), duration: '1.5 hours', status: 'completed', protocol: 'HTTPS' },
    ],
    activeSessions: 0,
    totalSessions: 47,
  };

  return NextResponse.json({ data });
}
