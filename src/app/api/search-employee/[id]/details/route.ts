"use client" no;

import { NextRequest, NextResponse } from "next/server";

const SYSTEMS = [
  'ping-directory',
  'ping-federate',
  'cyberark',
  'saviynt',
  'azure-ad',
  'ping-mfa',
] as const;

type System = typeof SYSTEMS[number];

// Load mocks
const loadMock = (system: System): any => {
  try {
    const mocks = {
      'ping-directory': {
        userId: "u1001",
        name: "Alice Johnson",
        email: "alice.johnson@company.com",
        department: "Engineering",
        title: "Senior Software Engineer",
        manager: "Bob Martin",
        location: "NYC",
        phone: "+1-212-555-0101",
        status: "Active",
        hireDate: "2022-04-12",
        employeeType: "Full-Time",
        costCenter: "EN-001",
        employeeId: "E-7742",
        uid: "alice.johnson",
        groups: [
          "eng-apps",
          "vpn-users",
          "slack-standard"
        ],
        lastPasswordChange: "2025-05-02T11:42:00Z",
        pwdPolicy: {
          "minLength": 12,
          "requiresNumber": true,
          "requiresSymbol": true,
          "maxAgeDays": 90
        },
        accountFlags: {
          "locked": false,
          "mustChangePassword": false,
          "mfaEnforced": true
        },
        attributes: {
          "givenName": "Alice",
          "sn": "Johnson",
          "displayName": "Alice Johnson",
          "street": "100 7th Ave",
          "postalCode": "10011",
          "country": "US"
        }
      },
      'ping-federate': {
        lastLogin: "2025-09-23T10:00:00Z",
        tokens: [
          { type: "access", expires: "2025-09-23T11:00:00Z", scopes: ["read", "write"] }
        ],
        status: "Active",
        ssoProviders: ["saml", "oidc"],
        session: { active: true, timeout: "30m" }
      },
      'cyberark': {
        safes: ["FinanceSafe", "HRVault"],
        accounts: [
          { id: "acc1", name: "admin", status: "Active", safe: "FinanceSafe" },
          { id: "acc2", name: "service", status: "Active", safe: "HRVault" }
        ],
        accessRequests: 0,
        auditEvents: [
          { type: "login", time: "2025-09-23T09:30:00Z" }
        ]
      },
      'saviynt': {
        roles: ["AdminRole", "UserRole"],
        entitlements: [
          { id: "ent1", name: "file-access", type: "app" }
        ],
        requests: [
          { id: "req1", type: "access", status: "pending" }
        ],
        certifications: { completed: 5, pending: 0 }
      },
      'azure-ad': {
        groups: ["Domain Users", "Engineering"],
        signins: [
          { time: "2025-09-23T09:30:00Z", ip: "192.168.1.100", location: "NYC" }
        ],
        profile: { jobTitle: "Engineer", department: "IT" },
        appRegistrations: 2,
        conditionalAccess: { policiesApplied: true }
      },
      'ping-mfa': {
        status: "Active",
        enrolledMethods: ["sms", "push"],
        devices: [
          { type: "phone", number: "+1-212-555-0101", lastUsed: "2025-09-23T08:45:00Z" },
          { type: "app", name: "Authy iOS", lastUsed: "2025-09-22T14:20:00Z" }
        ],
        lastEvent: {
          type: "push_success",
          timestamp: "2025-09-23T08:45:00Z",
          ip: "192.168.1.100"
        },
        enrollmentDate: "2023-01-15",
        backupCodes: "available",
        rateLimits: {
          remaining: 8,
          resetAt: "2025-09-24T00:00:00Z"
        },
        policy: {
          requiredForLogin: true,
          methods: ["push", "sms"],
          timeout: "60s"
        }
      }
    };
    return mocks[system] || null;
  } catch {
    return null;
  }
};

function findUser(mock: any, id: string): any {
  // For demo, since single object per system, return mock with id field set
  if (mock) {
    return {
      ...mock,
      userId: id,
      email: id.includes('@') ? id : `${id}@company.com`
    };
  }
  return null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const { searchParams } = new URL(request.url);
  const system = searchParams.get('system');

  if (!system || !SYSTEMS.includes(system as System)) {
    return NextResponse.json({ error: 'System parameter required' }, { status: 400 });
  }

  const mock = loadMock(system as System);
  if (!mock) {
    return NextResponse.json({ error: 'Data not found' }, { status: 404 });
  }

  const userData = findUser(mock, id);
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ data: userData });
}