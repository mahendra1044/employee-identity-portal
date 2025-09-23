import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for Saviynt
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
    roleDetails: [
      { id: "role1", name: "ROLE_ENGINEER", granted: "2023-01-01" },
      { id: "role2", name: "ROLE_DEVOPS", granted: "2024-06-15" },
    ],
    pendingRequests: [
      { id: "req1", type: "role_add", status: "pending" },
    ],
    audit: "Compliance audit logs...",
  };

  return NextResponse.json({ data });
}