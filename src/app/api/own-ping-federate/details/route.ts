import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for Ping Federate
  const data = {
    userId: "u12345",
    lastLogin: new Date().toISOString(),
    tokenStatus: "active",
    ssoProvider: "saml",
    lastAccess: "2024-09-20T10:30:00Z",
    sessionId: "session-abc123",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0",
    authenticationMethod: "password",
    mfaStatus: "passed",
    connections: ["saml-corp", "oidc-app"],
    policies: ["mfa-required", "sso-enforced"],
    events: [
      { type: "login", timestamp: "2024-09-20T10:30:00Z" },
      { type: "logout", timestamp: "2024-09-19T18:00:00Z" },
    ],
    auditLog: "Full audit events...",
  };

  return NextResponse.json({ data });
}