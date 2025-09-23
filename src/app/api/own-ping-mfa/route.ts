import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock initial data for Ping MFA
  const data = {
    userId: "u12345",
    status: "enabled",
    enrolledDevices: ["iPhone 14"],
    lastEvent: "login",
    lastEventTime: new Date().toISOString(),
    backupCodes: 3,
    recoveryEnabled: true,
    pushNotifications: true,
    adminOverride: false,
  };

  return NextResponse.json({ data });
}