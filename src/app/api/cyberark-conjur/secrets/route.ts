import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock Conjur secrets data
  const data = {
    user,
    secrets: [
      { name: 'prod-db-password', type: 'database-credential', vault: 'production-vault', lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { name: 'api-key-stripe', type: 'api-key', vault: 'production-vault', lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { name: 'ssl-cert-prod', type: 'certificate', vault: 'production-vault', lastAccessed: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      { name: 'staging-db-password', type: 'database-credential', vault: 'staging-vault', lastAccessed: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
    ],
    totalSecrets: 23,
    vaultsAccess: ['production-vault', 'staging-vault'],
  };

  return NextResponse.json({ data });
}
