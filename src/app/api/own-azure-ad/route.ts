import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock initial data for Azure AD
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
  };

  return NextResponse.json({ data });
}