import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock initial data for CyberArk
  const data = {
    userId: "u12345",
    safe: "CORP-APP-PROD",
    account: "svc_corp_app",
    access: "granted",
    credentialStatus: "available",
    lastChecked: new Date().toISOString(),
    permissions: ["view", "use"],
    vaultId: "vault-001",
    platform: "Windows",
    address: "10.0.0.50",
  };

  return NextResponse.json({ data });
}