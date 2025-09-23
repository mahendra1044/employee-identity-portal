import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock initial data for Saviynt
  const data = {
    userId: "u12345",
    roles: ["ROLE_ENGINEER", "ROLE_DEVOPS"],
    entitlements: 5,
    requests: 2,
    status: "provisioned",
    lastReview: new Date().toISOString(),
    compliance: "compliant",
    accessLevel: "standard",
    managerApproval: "approved",
    certification: "passed",
  };

  return NextResponse.json({ data });
}