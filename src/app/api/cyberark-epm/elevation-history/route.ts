import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock EPM elevation history data
  const data = {
    user,
    elevations: [
      { application: 'cmd.exe', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'approved', reason: 'System maintenance' },
      { application: 'powershell.exe', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), status: 'approved', reason: 'Script execution' },
      { application: 'regedit.exe', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: 'denied', reason: 'Policy violation' },
      { application: 'cmd.exe', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), status: 'approved', reason: 'Configuration change' },
    ],
    totalElevations: 12,
    approvedCount: 10,
    deniedCount: 2,
  };

  return NextResponse.json({ data });
}
