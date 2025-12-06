import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock initial data for CyberArk EPM (Endpoint Privilege Manager)
  const data = {
    userId: "u12345",
    policyName: "Standard User Policy",
    policyStatus: "active",
    elevationRequests: 12,
    applicationsManaged: 45,
    lastPolicyUpdate: new Date().toISOString(),
    privilegeLevel: "standard",
    endpointProtection: "enabled",
    complianceScore: 92,
    lastAudit: "2024-11-20T10:30:00Z",
  };

  return NextResponse.json({ data });
}
