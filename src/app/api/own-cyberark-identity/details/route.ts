import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for CyberArk Identity
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
    registeredDevices: [
      { deviceName: "iPhone 14 Pro", deviceType: "mobile", lastUsed: "2024-11-24T08:30:00Z", trusted: true },
      { deviceName: "MacBook Pro", deviceType: "desktop", lastUsed: "2024-11-24T07:00:00Z", trusted: true },
    ],
    ssoApplicationsList: [
      "Salesforce", "Office 365", "Slack", "GitHub", "AWS Console",
      "Jira", "Confluence", "Zoom", "DocuSign", "ServiceNow",
      "Okta", "Google Workspace", "Azure Portal", "Workday", "SAP"
    ],
    recentLoginHistory: [
      { timestamp: new Date().toISOString(), location: "San Francisco, CA", device: "MacBook Pro", status: "success" },
      { timestamp: "2024-11-23T18:30:00Z", location: "San Francisco, CA", device: "iPhone 14 Pro", status: "success" },
      { timestamp: "2024-11-22T09:15:00Z", location: "San Francisco, CA", device: "MacBook Pro", status: "success" },
    ],
    securityPolicies: ["password-complexity", "mfa-required", "session-timeout-30min"],
    roles: ["employee", "developer"],
    groups: ["engineering", "full-time"],
  };

  return NextResponse.json({ data });
}
