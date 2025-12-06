import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock initial data for CyberArk Identity (Identity as a Service)
  const data = {
    userId: "u12345",
    identityStatus: "active",
    mfaEnabled: true,
    ssoApplications: 15,
    lastLogin: new Date().toISOString(),
    riskScore: "low",
    authenticatorApps: 2,
    passwordLastChanged: "2024-10-15T00:00:00Z",
    accountLockStatus: "unlocked",
    failedLoginAttempts: 0,
  };

  return NextResponse.json({ data });
}
