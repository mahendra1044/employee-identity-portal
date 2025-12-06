import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for CyberArk EPM
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
    recentElevations: [
      { application: "cmd.exe", timestamp: "2024-11-23T09:15:00Z", status: "approved" },
      { application: "regedit.exe", timestamp: "2024-11-22T14:30:00Z", status: "approved" },
      { application: "powershell.exe", timestamp: "2024-11-21T11:45:00Z", status: "denied" },
    ],
    endpointDetails: {
      hostname: "LAPTOP-USER123",
      os: "Windows 11 Enterprise",
      agentVersion: "12.6.5",
      lastSync: "2024-11-24T08:00:00Z",
    },
    securityEvents: 3,
    blockedApplications: ["malware.exe", "suspicious.bat"],
    trustedApplications: ["chrome.exe", "code.exe", "outlook.exe"],
  };

  return NextResponse.json({ data });
}
