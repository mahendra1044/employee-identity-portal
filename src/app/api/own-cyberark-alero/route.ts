import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock initial data for CyberArk Alero (Remote Access)
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
  };

  return NextResponse.json({ data });
}
