# Identity Portal (Next.js + Express)

A local-first web portal for employees and ops to view identity data across systems. Frontend is a Next.js 15 + TypeScript app using shadcn/ui. Backend is an Express server with JWT auth, RBAC, and mock data for rapid local testing.

- Frontend: http://localhost:3000
- Backend: http://localhost:3001 (health: GET /health → { ok: true })

## TL;DR — Run Locally

1) Install deps at repo root
```
npm install
```

2) Start frontend (3000) + backend (3001) together
```
npm run dev:all
```

3) Sign in (mock auth)
- ops@company.com / any password
- management@company.com / any password
- any-other@company.com / any password

If you prefer running separately:
```
# Terminal A (backend)
cd backend && npm install && node server.js

# Terminal B (frontend)
npm run dev
```

## Prerequisites & Install
- Node.js 18+ (recommended 20.x) and npm 8+
- One-time install at repo root: `npm install`
  - The first run of `npm run dev:all` will auto-install backend deps (under `backend/`). You can also do `cd backend && npm install` manually.

## Features

Frontend (Next.js)
- Login (mock auth): Email/password form; role inferred from email prefix and persisted in localStorage
- Dashboard: Responsive cards per system with initial data + "View Details" for extended data
- Employee Search: Search by name/email/ID; shows Ping Directory and Ping MFA limited results (if enabled)
- Ops View: All users table (50/page) with row-click modal to inspect per-system data
- Feature-aware UI: If a system is disabled, shows "Feature not enabled" empty state
- Error + loading states: Friendly errors (403/404), loading indicators

Backend (Express)
- JWT Auth: POST /auth/login issues 24h token (mock mode infers role from email)
- RBAC: Per-role permissions from config/roles.json
- Rate Limiting: 100 req/min per IP
- Structured Logging: Winston JSON logs (console + file), tokens redacted
- Config Endpoint: GET /config/features exposes runtime feature flags
- Identity Endpoints (read-only):
  - GET /api/own-:system
  - GET /api/own-:system/details
  - GET /api/all-users?limit=50&offset=0 (role with any "all" permission)
  - GET /api/search-employee/:query (limited attrs for Ping Directory + Ping MFA)
- Mock Data: Located under backend/mocks/* with initial/details/search JSON files

Supported systems
- Ping Directory, Ping Federate, CyberArk, Saviynt, Azure AD, Ping MFA


## Quickstart

One command (recommended)
- npm run dev:all
- Starts Next.js (3000) and Express (3001). First run also installs backend deps.

Run separately
- Backend: cd backend && npm install && node server.js
- Frontend: npm install && npm run dev

Health checks
- Backend: http://localhost:3001/health → { ok: true }
- Frontend: http://localhost:3000


## Test Logins (Mock Auth)
- ops role: ops@company.com (any password)
- management role: management@company.com (any password)
- employee role: anything-else@company.com (any password)
- In mock mode, role is inferred from email prefix and any password works.


## How the App Works

- Frontend stores token/role/email in localStorage after POST /auth/login
- System cards call backend endpoints with Authorization: Bearer <token>
- Search calls GET /api/search-employee/:query and shows PD + MFA limited results
- Ops role additionally loads GET /api/all-users with pagination
- UI honors feature flags returned by GET /config/features


## Configuration and Behavior Toggles

All config lives in the backend folder. Changes require restarting the backend server.

1) backend/config/features.json
```
{
  "credentialSource": "env",              // env | cyberArkCcp (stubbed)
  "useMocks": true,                       // true = use backend/mocks/*, false = real integrations
  "useMockAuth": true,                    // true = mock email/pwd, false = (placeholder for real SSO)
  "systems": {
    "ping-directory": true,
    "ping-federate": true,
    "cyberark": true,
    "saviynt": true,
    "azure-ad": true,
    "ping-mfa": true
  }
}
```
- Flip behaviors:
  - Disable a system: set systems["<system>"] to false → UI shows "Feature not enabled" and APIs 404
  - Turn off mocks: set useMocks=false → backend will call real integrations where implemented
  - Switch auth mode: set useMockAuth=false → backend expects real SSO (placeholder), UI still posts to /auth/login
  - Credential source: set credentialSource=cyberArkCcp to fetch secrets from CCP (fallback to env if fails)

2) backend/config/roles.json
- Define which roles can access own/all/search for each system. 403 when denied.
- Example shape:
```
{
  "employee": {
    "ping-directory": { "own": true, "all": false, "search": true },
    "ping-mfa": { "own": true, "all": false, "search": true }
    // other systems...
  },
  "ops": {
    "ping-directory": { "own": true, "all": true, "search": true },
    "ping-mfa": { "own": true, "all": true, "search": true }
    // other systems...
  }
}
```
- Add a role by key (e.g., "management") and define per-system permissions.
- Mock auth infers role from email prefix; unknown roles default to employee.

3) backend/.env
- Typical variables (names may vary by integration):
```
PORT=3001
JWT_SECRET=dev-secret
LOG_LEVEL=info
LOG_FILE=./logs/app.log

PING_DIR_URL=https://example/pd
PING_DIR_API_KEY=xxxx
# ... other system credentials
```
- Used when credentialSource=env or as fallback if CCP fails.

Mock data layout (when useMocks=true)
- backend/mocks/
  - <system>-initial.json → ~10 attributes
  - <system>-details.json → ~20 attributes
  - <system>-search.json → limited attrs (Ping Directory & Ping MFA only)
  - all-users.json → aggregated list for ops view


## API Overview
- POST /auth/login → { token, role, email }
- GET /config/features → feature flags object
- GET /api/own-:system → initial data for current user
- GET /api/own-:system/details → extended data for current user
- GET /api/all-users?limit=50&offset=0 → ops-only list
- GET /api/search-employee/:query → limited PD + MFA results

Responses
- 200: { data: any } for system endpoints; or domain objects for search/all-users
- 403: RBAC denial (see roles.json)
- 404: Feature/system disabled (see features.json)


## Scripts
- npm run dev → Frontend only (Next.js)
- npm run dev:be → Installs backend deps and starts Express
- npm run dev:all → Runs frontend + backend together (recommended for local dev)


## Troubleshooting
- CORS/Network: Ensure backend is running on 3001; frontend calls http://localhost:3001 directly
- 404 errors: Likely system disabled in features.json
- 403 errors: Role lacks permission in roles.json
- Token issues: Click "Sign out" (clears localStorage) and log back in
- Port conflicts: Change PORT in backend/.env and update API_BASE in src/app/page.tsx if needed
- Backend not starting: Verify `backend/server.js` exists and that you ran `npm install` at the repo root (or `cd backend && npm install`).
- Windows path error (ENOENT backend/backend/...): Fixed. The server now resolves paths relative to `backend/server.js`. Pull latest and use `npm run dev:all` (avoid manually changing working directories when starting the backend).


## Tech Stack
- Frontend: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express, Winston, jsonwebtoken, express-rate-limit, dotenv


## Roadmap (real integrations)
- Real SSO (when useMockAuth=false)
- Replace mocks with live system connectors (when useMocks=false)
- Additional filters and CSV export for Ops