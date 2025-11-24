import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Load mock data
function loadMockData() {
  try {
    const pingDirPath = join(process.cwd(), 'backend/mocks/ping-directory-search.json');
    const pingMfaPath = join(process.cwd(), 'backend/mocks/ping-mfa-search.json');
    
    const pingDirectory = JSON.parse(readFileSync(pingDirPath, 'utf-8'));
    const pingMfa = JSON.parse(readFileSync(pingMfaPath, 'utf-8'));
    
    return { pingDirectory, pingMfa };
  } catch (error) {
    console.error('Error loading mock data:', error);
    return { pingDirectory: [], pingMfa: [] };
  }
}

// Generate mock CyberArk data for all 6 systems with success/failure scenarios
function generateCyberArkMockData(userId: string, email: string) {
  // Define users with failures (similar to Ping Systems pattern)
  const failureUsers = ['u1003', 'u1007', 'u1012', 'u1018']; // Charlie, George, Laura, Rita
  const hasFailure = failureUsers.includes(userId);

  return {
    'cyberark': hasFailure ? {
      userId,
      error: 'Access denied',
      status: 'failed',
      message: 'User does not have PAM vault access',
    } : {
      userId,
      safe: 'CORP-APP-PROD',
      account: `svc_${email.split('@')[0]}`,
      access: 'granted',
      credentialStatus: 'available',
      lastChecked: new Date().toISOString(),
      permissions: ['view', 'use'],
      vaultId: 'vault-001',
      platform: 'Windows',
      address: '10.0.0.50',
    },
    'cyberark-epm': hasFailure ? {
      userId,
      error: 'Policy not found',
      status: 'failed',
      message: 'No EPM policy assigned to user',
    } : {
      userId,
      policyName: 'Standard User Policy',
      policyStatus: 'active',
      elevationRequests: Math.floor(Math.random() * 20),
      applicationsManaged: Math.floor(Math.random() * 50) + 20,
      lastPolicyUpdate: new Date().toISOString(),
      privilegeLevel: 'standard',
      endpointProtection: 'enabled',
      complianceScore: Math.floor(Math.random() * 20) + 80,
      lastAudit: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'cyberark-alero': hasFailure ? {
      userId,
      error: 'Remote access disabled',
      status: 'failed',
      message: 'User not authorized for remote access',
    } : {
      userId,
      remoteAccessStatus: 'enabled',
      activeSessions: 0,
      totalSessions: Math.floor(Math.random() * 100) + 20,
      lastConnection: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      connectionType: 'vendor-access',
      accessLevel: 'read-write',
      multiFactorAuth: 'enabled',
      sessionRecording: 'enabled',
      maxSessionDuration: '4 hours',
    },
    'cyberark-conjur': hasFailure ? {
      userId,
      error: 'Secrets access denied',
      status: 'failed',
      message: 'User does not have Conjur vault permissions',
    } : {
      userId,
      secretsManaged: Math.floor(Math.random() * 30) + 10,
      vaultsAccess: ['production-vault', 'staging-vault'],
      lastSecretRetrieval: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      apiKeysManaged: Math.floor(Math.random() * 10) + 3,
      certificatesManaged: Math.floor(Math.random() * 8) + 2,
      rotationPolicy: '90-day',
      accessLevel: 'developer',
      conjurRole: 'app-developer',
      permissions: ['read', 'execute'],
    },
    'cyberark-dpa': hasFailure ? {
      userId,
      error: 'DPA authorization failed',
      status: 'failed',
      message: 'No active authorizations found',
    } : {
      userId,
      privilegeLevel: 'just-in-time',
      activeAuthorizations: Math.floor(Math.random() * 3),
      requestsPending: 0,
      lastAuthorization: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      authorizationDuration: '2 hours',
      approvalRequired: true,
      riskScore: ['low', 'medium'][Math.floor(Math.random() * 2)],
      complianceChecks: 'passed',
      temporaryAccess: ['prod-database-write', 'prod-server-admin'].slice(0, Math.floor(Math.random() * 2) + 1),
    },
    'cyberark-identity': hasFailure ? {
      userId,
      error: 'Identity not found',
      status: 'failed',
      message: 'User identity not provisioned in CyberArk Identity',
    } : {
      userId,
      identityStatus: 'active',
      mfaEnabled: true,
      ssoApplications: Math.floor(Math.random() * 10) + 10,
      lastLogin: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      riskScore: ['low', 'medium'][Math.floor(Math.random() * 2)],
      authenticatorApps: 2,
      passwordLastChanged: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      accountLockStatus: 'unlocked',
      failedLoginAttempts: 0,
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) {
  const { query } = await params;
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  console.log('🔍 [Search API] Query:', query);

  // Verify JWT token
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Load mock data
  const { pingDirectory, pingMfa } = loadMockData();
  
  // Search logic: case-insensitive partial match on name, email, or userId
  const searchTerm = query.toLowerCase().trim();
  
  const matchedUsers = pingDirectory.filter((user: any) => {
    return (
      user.name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.userId?.toLowerCase().includes(searchTerm)
    );
  });

  console.log('🔍 [Search API] Found matches:', matchedUsers.length);

  // Enrich with MFA data and CyberArk data
  const results = matchedUsers.map((user: any) => {
    const mfaData = pingMfa.find((mfa: any) => mfa.userId === user.userId);
    const cyberArkData = generateCyberArkMockData(user.userId, user.email);
    
    return {
      ...user,
      mfaStatus: mfaData?.status || 'Unknown',
      mfaLastEvent: mfaData?.lastEvent || null,
      ...cyberArkData,
    };
  });

  // Return in the expected format with all systems
  return NextResponse.json({
    'ping-directory': results,
    'ping-mfa': results.map((r: any) => ({
      userId: r.userId,
      status: r.mfaStatus,
      lastEvent: r.mfaLastEvent
    })),
    'cyberark': results.map((r: any) => r.cyberark),
    'cyberark-epm': results.map((r: any) => r['cyberark-epm']),
    'cyberark-alero': results.map((r: any) => r['cyberark-alero']),
    'cyberark-conjur': results.map((r: any) => r['cyberark-conjur']),
    'cyberark-dpa': results.map((r: any) => r['cyberark-dpa']),
    'cyberark-identity': results.map((r: any) => r['cyberark-identity']),
  });
}