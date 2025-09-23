import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for CyberArk
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
    history: [
      { action: "checkout", timestamp: "2024-09-20T09:00:00Z" },
      { action: "return", timestamp: "2024-09-20T09:30:00Z" },
    ],
    policies: ["safe-member", "account-owner"],
    secrets: "Redacted for security",
  };

  return NextResponse.json({ data });
}