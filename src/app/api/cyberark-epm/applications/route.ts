import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock EPM applications data
  const data = {
    user,
    applications: [
      { name: 'cmd.exe', managed: true, elevationRequired: true, lastUsed: new Date().toISOString() },
      { name: 'powershell.exe', managed: true, elevationRequired: true, lastUsed: '2024-11-23T15:30:00Z' },
      { name: 'regedit.exe', managed: true, elevationRequired: true, lastUsed: '2024-11-22T10:15:00Z' },
      { name: 'chrome.exe', managed: true, elevationRequired: false, lastUsed: new Date().toISOString() },
      { name: 'code.exe', managed: true, elevationRequired: false, lastUsed: new Date().toISOString() },
    ],
    totalApplications: 45,
    managedApplications: 45,
  };

  return NextResponse.json({ data });
}
