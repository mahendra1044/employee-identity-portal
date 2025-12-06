import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock DPA policies data
  const data = {
    user,
    policies: [
      { name: 'JIT-Access-Policy', status: 'active', description: 'Just-in-time access with approval', resources: ['prod-database-write', 'prod-server-admin'] },
      { name: 'Time-Limited-Authorization', status: 'active', description: 'Time-limited privilege grants', maxDuration: '2 hours' },
      { name: 'Risk-Based-Access', status: 'active', description: 'Access based on risk assessment', riskThreshold: 'medium' },
    ],
    totalPolicies: 3,
    appliedPolicies: 3,
  };

  return NextResponse.json({ data });
}
