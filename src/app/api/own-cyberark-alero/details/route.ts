import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for CyberArk Alero
  const data = {
    userId: "u12345",
    remoteAccessStatus: "enabled",
    activeSessions: 0,
    totalSessions: 47,
    lastConnection: "2024-11-23T16:45:00Z",
    connectionType: "vendor-access",
    accessLevel: "read-write",
    multiFactorAuth: "enabled",
    sessionRecording: "enabled",
    maxSessionDuration: "4 hours",
    recentSessions: [
      { target: "PROD-DB-01", startTime: "2024-11-23T16:45:00Z", duration: "45 minutes", status: "completed" },
      { target: "PROD-WEB-02", startTime: "2024-11-22T10:20:00Z", duration: "2 hours", status: "completed" },
      { target: "PROD-APP-03", startTime: "2024-11-20T14:00:00Z", duration: "1.5 hours", status: "completed" },
    ],
    authorizedTargets: ["PROD-DB-01", "PROD-WEB-02", "PROD-APP-03", "DEV-SERVER-01"],
    connectionProtocols: ["RDP", "SSH", "HTTPS"],
    recordingsAvailable: 47,
    complianceReports: "monthly",
    sessionAuditLog: "enabled",
  };

  return NextResponse.json({ data });
}
