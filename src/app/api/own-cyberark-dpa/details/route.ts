import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for CyberArk DPA
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
    authorizationHistory: [
      { resource: "prod-database-write", requestTime: "2024-11-24T09:00:00Z", duration: "2 hours", status: "active", approver: "manager@company.com" },
      { resource: "prod-server-admin", requestTime: "2024-11-24T09:05:00Z", duration: "2 hours", status: "active", approver: "manager@company.com" },
      { resource: "prod-backup-access", requestTime: "2024-11-23T15:30:00Z", duration: "1 hour", status: "expired", approver: "manager@company.com" },
    ],
    riskAssessment: {
      score: "low",
      factors: ["time-of-day: normal", "location: office", "behavior: consistent"],
      lastAssessment: "2024-11-24T09:00:00Z",
    },
    policiesApplied: ["JIT-Access-Policy", "Time-Limited-Authorization"],
    approvalWorkflow: "manager-approval",
    auditTrail: "complete",
  };

  return NextResponse.json({ data });
}
