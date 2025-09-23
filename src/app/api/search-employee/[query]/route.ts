import { NextRequest, NextResponse } from "next/server";

const MOCK_PD = [
  { "name": "Alice Johnson", "email": "alice.johnson@company.com", "userId": "u1001" },
  { "name": "Bob Martin", "email": "bob.martin@company.com", "userId": "u1002" },
  { "name": "Charlie Kim", "email": "charlie.kim@company.com", "userId": "u1003" },
  { "name": "Dana Lee", "email": "dana.lee@company.com", "userId": "u1004" },
  { "name": "Evan Torres", "email": "evan.torres@company.com", "userId": "u1005" },
  { "name": "Fatima Khan", "email": "fatima.khan@company.com", "userId": "u1006" },
  { "name": "George Smith", "email": "george.smith@company.com", "userId": "u1007" },
  { "name": "Hannah Park", "email": "hannah.park@company.com", "userId": "u1008" },
  { "name": "Ian Chen", "email": "ian.chen@company.com", "userId": "u1009" },
  { "name": "Julia Nguyen", "email": "julia.nguyen@company.com", "userId": "u1010" },
  { "name": "Kevin Patel", "email": "kevin.patel@company.com", "userId": "u1011" },
  { "name": "Laura Garcia", "email": "laura.garcia@company.com", "userId": "u1012" },
  { "name": "Mohammed Ali", "email": "mohammed.ali@company.com", "userId": "u1013" },
  { "name": "Nina Brown", "email": "nina.brown@company.com", "userId": "u1014" },
  { "name": "Oscar Diaz", "email": "oscar.diaz@company.com", "userId": "u1015" },
  { "name": "Priya Singh", "email": "priya.singh@company.com", "userId": "u1016" },
  { "name": "Quentin Roux", "email": "quentin.roux@company.com", "userId": "u1017" },
  { "name": "Rita Souza", "email": "rita.souza@company.com", "userId": "u1018" },
  { "name": "Sam Wilson", "email": "sam.wilson@company.com", "userId": "u1019" },
  { "name": "Tina Zhang", "email": "tina.zhang@company.com", "userId": "u1020" }
];

const MOCK_MFA = [
  { "userId": "u1001", "status": "Active", "lastEvent": "2025-09-20T14:30:00Z" },
  { "userId": "u1002", "status": "Pending", "lastEvent": "2025-09-19T09:15:00Z" },
  { "userId": "u1003", "status": "Active", "lastEvent": "2025-09-21T16:45:00Z" },
  { "userId": "u1004", "status": "Suspended", "lastEvent": "2025-09-18T11:20:00Z" },
  { "userId": "u1005", "status": "Active", "lastEvent": "2025-09-22T13:10:00Z" },
  { "userId": "u1006", "status": "Active", "lastEvent": "2025-09-20T08:05:00Z" },
  { "userId": "u1007", "status": "Pending", "lastEvent": "2025-09-21T17:55:00Z" },
  { "userId": "u1008", "status": "Active", "lastEvent": "2025-09-19T12:40:00Z" },
  { "userId": "u1009", "status": "Suspended", "lastEvent": "2025-09-22T10:25:00Z" },
  { "userId": "u1010", "status": "Active", "lastEvent": "2025-09-20T15:00:00Z" },
  { "userId": "u1011", "status": "Active", "lastEvent": "2025-09-21T09:30:00Z" },
  { "userId": "u1012", "status": "Pending", "lastEvent": "2025-09-18T14:50:00Z" },
  { "userId": "u1013", "status": "Active", "lastEvent": "2025-09-22T11:35:00Z" },
  { "userId": "u1014", "status": "Suspended", "lastEvent": "2025-09-19T07:20:00Z" },
  { "userId": "u1015", "status": "Active", "lastEvent": "2025-09-21T18:10:00Z" },
  { "userId": "u1016", "status": "Active", "lastEvent": "2025-09-20T12:55:00Z" },
  { "userId": "u1017", "status": "Pending", "lastEvent": "2025-09-22T16:40:00Z" },
  { "userId": "u1018", "status": "Active", "lastEvent": "2025-09-18T13:25:00Z" },
  { "userId": "u1019", "status": "Suspended", "lastEvent": "2025-09-21T10:05:00Z" },
  { "userId": "u1020", "status": "Active", "lastEvent": "2025-09-19T09:15:00Z" }
];

const MOCK_PD_DETAILS = {
  "userId": "u1001",
  "name": "Alice Johnson",
  "email": "alice.johnson@company.com",
  "department": "Engineering",
  "title": "Senior Software Engineer",
  "manager": "Bob Martin",
  "location": "NYC",
  "phone": "+1-212-555-0101",
  "status": "Active",
  "hireDate": "2022-04-12",
  "employeeType": "Full-Time",
  "costCenter": "EN-001",
  "employeeId": "E-7742",
  "uid": "alice.johnson",
  "groups": [
    "eng-apps",
    "vpn-users",
    "slack-standard"
  ],
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
  },
  "attributes": {
    "givenName": "Alice",
    "sn": "Johnson",
    "displayName": "Alice Johnson",
    "street": "100 7th Ave",
    "postalCode": "10011",
    "country": "US"
  }
};

const MOCK_MFA_DETAILS = {
  "userId": "u1001",
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

export async function GET(request: NextRequest, { params }: { params: { query: string } }) {
  const query = params.query.toLowerCase().trim();
  if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 });

  // Simple filter for demo
  const filterPD = MOCK_PD.filter(u => 
    u.name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    u.userId.toLowerCase().includes(query)
  ).slice(0, 10); // limit results

  const filterMFA = MOCK_MFA.filter(u => 
    u.userId.toLowerCase().includes(query)
  ).slice(0, 10);

  const results = {
    'ping-directory': filterPD.map(u => ({ name: u.name, email: u.email, userId: u.userId })),
    'ping-mfa': filterMFA.map(u => ({ userId: u.userId, status: u.status, lastEvent: u.lastEvent }))
  };

  return NextResponse.json(results);
}