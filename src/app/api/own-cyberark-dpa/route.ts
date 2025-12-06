import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock initial data for CyberArk DPA (Dynamic Privilege Authorization)
  const data = {
    userId: "u12345",
    privilegeLevel: "just-in-time",
    activeAuthorizations: 2,
    requestsPending: 0,
    lastAuthorization: "2024-11-24T09:00:00Z",
    authorizationDuration: "2 hours",
    approvalRequired: true,
    riskScore: "low",
    complianceChecks: "passed",
    temporaryAccess: ["prod-database-write", "prod-server-admin"],
  };

  return NextResponse.json({ data });
}
