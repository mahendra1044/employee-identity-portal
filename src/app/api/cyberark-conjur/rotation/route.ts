import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock Conjur rotation data
  const data = {
    user,
    rotations: [
      { secretName: 'prod-db-password', lastRotation: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), nextRotation: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(), policy: '90-day', status: 'on-schedule' },
      { secretName: 'api-key-stripe', lastRotation: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), nextRotation: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), policy: '90-day', status: 'on-schedule' },
      { secretName: 'ssl-cert-prod', lastRotation: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(), nextRotation: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(), policy: '365-day', status: 'on-schedule' },
    ],
    rotationPolicy: '90-day',
    complianceStatus: 'compliant',
  };

  return NextResponse.json({ data });
}
