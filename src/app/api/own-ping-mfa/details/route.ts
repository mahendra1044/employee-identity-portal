import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for Ping MFA
  const data = {
    userId: "u12345",
    status: "enabled",
    enrolledDevices: ["iPhone 14", "Android Device"],
    lastEvent: "login",
    lastEventTime: new Date().toISOString(),
    backupCodes: 3,
    recoveryEnabled: true,
    pushNotifications: true,
    adminOverride: false,
    devices: [
      { id: "dev1", type: "mobile", enrolled: "2023-01-01", lastUsed: "2024-09-20" },
    ],
    events: [
      { type: "push_sent", time: "2024-09-20T10:00:00Z", success: true },
      { type: "backup_used", time: "2024-08-15T15:30:00Z", success: true },
    ],
    policies: ["multi-factor", "device-trust"],
  };

  return NextResponse.json({ data });
}