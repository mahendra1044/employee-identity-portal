import { NextRequest, NextResponse } from "next/server";

// Reuse mocks from initial, but extended for details
// (Copy getSystemDetailsMock from above, or define here)

function getSystemDetailsMock(system: string, id: string) {
  // Same as in [id]/route.ts - to avoid duplication, in real would import
  // For now, repeat the logic
  let mock;
  switch (system) {
    case 'ping-directory':
      mock = {
        "userId": id,
        "name": id.includes('@') ? id.split('@')[0].replace(/\./g, ' ').replace(/(^|\s)[a-z]/g, c => c.toUpperCase()) : id.toUpperCase(),
        "email": id.includes('@') ? id : `${id}@company.com`,
        "department": "Engineering",
        "title": "Software Engineer",
        "manager": "John Doe",
        "location": "NYC Office",
        "phone": "+1-212-555-0123",
        "status": "Active",
        "hireDate": "2022-01-15",
        "employeeType": "Full-Time",
        "costCenter": "EN-001",
        "groups": ["eng-apps", "vpn-users"],
        "lastPasswordChange": "2025-05-02T11:42:00Z",
        "pwdPolicy": {
          "minLength": 12,
          "requiresNumber": true,
          "requiresSymbol": true,
          "maxAgeDays": 90
        },
        "accountFlags": {
          "locked": false,
          "mustChangePassword": false,
          "mfaEnforced": true
        }
      };
      break;
    case 'ping-mfa':
      mock = {
        "userId": id,
        "status": "Active",
        "enrolledMethods": ["sms", "push"],
        "devices": [
          { "type": "phone", "number": "+1-212-555-0101", "lastUsed": "2025-09-20T14:30:00Z" },
          { "type": "app", "name": "Authy iOS", "lastUsed": "2025-09-19T09:15:00Z" }
        ],
        "lastEvent": {
          "type": "push_success",
          "timestamp": "2025-09-20T14:30:00Z",
          "ip": "192.168.1.100"
        },
        "enrollmentDate": "2023-01-15",
        "backupCodes": "available",
        "rateLimits": {
          "remaining": 8,
          "resetAt": "2025-09-21T00:00:00Z"
        },
        "policy": {
          "requiredForLogin": true,
          "methods": ["push", "sms"],
          "timeout": "60s"
        }
      };
      break;
    // Add cases for other systems similarly...
    case 'ping-federate':
      mock = {
        "userId": id,
        "email": id.includes('@') ? id : `${id}@company.com`,
        "lastSuccessfulLogin": "2025-09-23T09:45:00Z",
        "sessionActive": true,
        "roles": ["user", "employee"],
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "mfaStatus": "verified",
        "failedAttempts": 0,
        "accountLockout": false,
        "federatedIds": ["google-oauth", "saml-corp"]
      };
      break;
    case 'cyberark':
      mock = {
        "userId": id,
        "safesAccess": 3,
        "accountsManaged": 5,
        "lastAccess": "2025-09-22T16:20:00Z",
        "privileges": ["read", "list"],
        "complianceStatus": "compliant",
        "safes": ["privileged-accounts", "app-creds"],
        "platforms": 2,
        "verificationStatus": "pending",
        "riskScore": 25
      };
      break;
    case 'saviynt':
      mock = {
        "userId": id,
        "rolesAssigned": 4,
        "entitlements": 12,
        "accessReviewsDue": "2025-10-01",
        "lastCertification": "2025-08-15",
        "riskLevel": "low",
        "roles": ["engineer-access", "devops-base"],
        "pendingRequests": 1,
        "violations": 0,
        "analyticsScore": 85
      };
      break;
    case 'azure-ad':
      mock = {
        "userId": id,
        "displayName": id.includes('@') ? id.split('@')[0].replace(/\./g, ' ') : id,
        "mail": id.includes('@') ? id : `${id}@company.com`,
        "groups": ["engineering", "developers", "all-employees"],
        "signInCount": 45,
        "lastSignIn": "2025-09-23T08:30:00Z",
        "accountEnabled": true,
        "creationType": "local",
        "strongAuthentication": ["mfa"],
        "licenses": ["M365_E3"]
      };
      break;
    default:
      return null;
  }
  return mock;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const system = searchParams.get('system');
  const id = params.id.trim().toLowerCase();

  if (!system || !id) {
    return NextResponse.json({ error: 'ID and system required' }, { status: 400 });
  }

  if (!['ping-directory', 'ping-federate', 'cyberark', 'saviynt', 'azure-ad', 'ping-mfa'].includes(system)) {
    return NextResponse.json({ error: 'Invalid system' }, { status: 400 });
  }

  const data = getSystemDetailsMock(system, id);
  if (!data) {
    return NextResponse.json({ error: 'Details not available' }, { status: 500 });
  }

  return NextResponse.json({ system, userId: id, data });
}