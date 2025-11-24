import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for CyberArk Conjur
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
    secretTypes: {
      databaseCredentials: 10,
      apiKeys: 8,
      sslCertificates: 5,
    },
    recentRetrievals: [
      { secretName: "prod-db-password", timestamp: "2024-11-24T07:30:00Z", application: "web-app" },
      { secretName: "api-key-stripe", timestamp: "2024-11-23T14:20:00Z", application: "payment-service" },
      { secretName: "staging-db-password", timestamp: "2024-11-22T09:45:00Z", application: "web-app" },
    ],
    rotationSchedule: {
      nextRotation: "2025-02-20T00:00:00Z",
      lastRotation: "2024-11-20T00:00:00Z",
      rotationInterval: "90 days",
    },
    auditLogs: "enabled",
    complianceStatus: "compliant",
  };

  return NextResponse.json({ data });
}
