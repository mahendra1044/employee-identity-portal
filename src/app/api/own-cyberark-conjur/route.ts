import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock initial data for CyberArk Conjur (Secrets Management)
  const data = {
    userId: "u12345",
    secretsManaged: 23,
    vaultsAccess: ["production-vault", "staging-vault"],
    lastSecretRetrieval: "2024-11-24T07:30:00Z",
    apiKeysManaged: 8,
    certificatesManaged: 5,
    rotationPolicy: "90-day",
    accessLevel: "developer",
    conjurRole: "app-developer",
    permissions: ["read", "execute"],
  };

  return NextResponse.json({ data });
}
