import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock Alero recordings data
  const data = {
    user,
    recordings: [
      { sessionId: 'REC-001', target: 'PROD-DB-01', startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), duration: '45 minutes', size: '450 MB' },
      { sessionId: 'REC-002', target: 'PROD-WEB-02', startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), duration: '2 hours', size: '1.2 GB' },
      { sessionId: 'REC-003', target: 'PROD-APP-03', startTime: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), duration: '1.5 hours', size: '900 MB' },
    ],
    totalRecordings: 47,
    totalSize: '24.5 GB',
  };

  return NextResponse.json({ data });
}
