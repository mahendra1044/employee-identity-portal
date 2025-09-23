import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for Azure AD
  const data = {
    userId: "u12345@company.com",
    displayName: "John Doe",
    jobTitle: "Software Engineer",
    department: "Engineering",
    groups: 3,
    signInCount: 150,
    lastSignIn: new Date().toISOString(),
    accountEnabled: true,
    mfaStatus: "enabled",
    conditionalAccess: "passed",
    groupsList: ["engineers", "devops", "it"],
    signInLogs: [
      { time: "2024-09-20T10:00:00Z", ip: "192.168.1.100", app: "Microsoft Teams" },
    ],
    policies: ["mfa-policy", "conditional-access"],
    audit: "Azure audit events...",
  };

  return NextResponse.json({ data });
}