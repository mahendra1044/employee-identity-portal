import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock DPA authorizations data
  const data = {
    user,
    authorizations: [
      { resource: 'prod-database-write', requestTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), duration: '2 hours', status: 'active', approver: 'manager@company.com', riskScore: 'low' },
      { resource: 'prod-server-admin', requestTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), duration: '2 hours', status: 'active', approver: 'manager@company.com', riskScore: 'low' },
      { resource: 'prod-backup-access', requestTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), duration: '1 hour', status: 'expired', approver: 'manager@company.com', riskScore: 'low' },
    ],
    activeAuthorizations: 2,
    pendingRequests: 0,
  };

  return NextResponse.json({ data });
}
