# Identity Portal (Next.js 15 + shadcn/ui)

## New Features (Sept 2025)

- Copy JSON everywhere
  - Added "Copy JSON" buttons to all places where JSON is rendered:
    - System tiles (initial data)
    - System Details dialog
    - Employee Search result dialogs (single and All Systems)
    - All Systems HTML/JSON views (per-system and global)
- Ops enhancements for All Systems view
  - Renamed button to: "View all system details JSON" (ops only)
  - Added adjacent: "View all system details HTML" (ops only)
  - HTML view renders a clean key/value layout for non-technical readability
- System tile header layout (employee view)
  - Buttons are now consistently aligned and wrap nicely on smaller screens
  - System name is more prominent and always visible (truncates gracefully)
- Server-side email endpoint (mock)
  - Replaced mailto with a server API to record email requests for audit/debug
  - Route: `POST /api/send-email`
  - Logs mock payloads to the server console and returns `{ ok: true }`

## How to Use

### Copy JSON
- Click "Copy JSON" above any JSON block to copy the pretty-printed JSON to your clipboard.
- In the All Systems dialog (both JSON and HTML modes), use either the global Copy JSON (top-right) or the per-system Copy JSON.

### Ops: All Systems buttons
- In the search section (for ops role):
  - "View all system details JSON": Aggregates per-system details across all six systems into one dialog.
  - "View all system details HTML": Same data as JSON view, but rendered as a key/value layout for readability.

### HTML View on system tiles
- Each system tile includes an "HTML View" button that opens a key/value popup for the current system's data.
- If Details are already loaded, it uses those; otherwise it shows Initial data.

### Send Email (server-side mock)
- Each system tile includes a "Send Email" button.
- This posts to a Next.js API route instead of opening your inbox.
- Endpoint: `POST /api/send-email`
  - Request: `{ to: string, subject: string, body: string, system: string, payload: any }`
  - Response: `{ ok: true, message: "Email queued (mock)", to, system, timestamp }`
- Server will log a concise mock entry with recipient, subject, preview of body, a payload snippet, and timestamp.

## Configuration

### Support email mapping
- Edit `src/lib/support-emails.ts` to change the destination team addresses per system.
- Helper: `getSupportEmail(system: "ping-directory" | "ping-federate" | "cyberark" | "saviynt" | "azure-ad" | "ping-mfa")`

## Implementation Notes

- File: `src/app/page.tsx`
  - Added Copy JSON buttons to cards and dialogs
  - Improved header layout for system tiles
  - Added Ops-only dual buttons for All Systems (JSON/HTML) with consistent data aggregation
  - System tile "Send Email" now calls `/api/send-email` instead of `mailto:`
- File: `src/app/api/send-email/route.ts`
  - Mock server endpoint that logs email requests and returns success

## Local Dev
- Frontend: `npm run dev` (Next.js 15)
- Backend (mock API assumed at localhost:3001 per existing setup)

Notes:
- If your backend isn't running, the app provides sensible fallbacks/mocks for some views.
- Styled-JSX is not used anywhere (Tailwind only).

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

## Mock test data & scenarios
- Mock mode is ON by default: backend/config/features.json → `{"useMocks": true, "useMockAuth": true}`
- Files (backend/mocks):
  - ping-directory-initial.json / ping-directory-details.json
  - ping-federate-initial.json / ping-federate-details.json
  - cyberark-initial.json / cyberark-details.json
  - saviynt-initial.json / saviynt-details.json
  - azure-ad-initial.json / azure-ad-details.json
  - ping-mfa-initial.json / ping-mfa-details.json
  - ping-directory-search.json / ping-mfa-search.json
  - all-users.json

What you can test
- Employee dashboard (any non-ops email)
  - System cards → Refresh / View Details
    - Ping Directory (Alice Johnson): name, email, department, groups, pwd policy, etc.
    - Ping Federate: lastLogin, activeSessions, tokenClaims, audit
    - CyberArk: accounts with lastRotation, compliance, policies
    - Saviynt: roles, entitlements, risk, certifications
    - Azure AD: licenses, groups, devices, conditional access
    - Ping MFA: status, enrolledDevices, policy, history
- Search (employees and ops)
  - Try queries (case-insensitive):
    - "Alice" → shows PD row for Alice Johnson and MFA status for u1001
    - "u1003" → shows PD row for Charlie Kim and MFA Disabled
    - "dana.lee@company.com" → shows PD row for Dana Lee and MFA Enabled
- Ops view (sign in as ops@company.com)
  - All Users table uses all-users.json (20 seeded users)
  - Click a row → modal shows per-system JSON (PD department/title, MFA status, etc.)
  - Pagination controls work with total/limit reported by API

Sample records (for quick reference)
- ping-directory-initial.json (own): Alice Johnson — Engineering, Senior Software Engineer, Active
- ping-mfa-initial.json (own): status Enabled; devices: iPhone 14, PingID
- ping-directory-search.json: u1001..u1010 (Alice, Bob, Charlie, Dana, ...)
- ping-mfa-search.json: MFA status per userId (Enabled/Disabled/Pending)
- all-users.json: u1001..u1020 with departments and MFA status

Tips
- To simulate a disabled system, set `systems["azure-ad"] = false` in backend/config/features.json → UI cards show "Feature not enabled" and relevant APIs return 404
- To test RBAC 403s, remove `all` permission for a role/system in backend/config/roles.json and retry the corresponding endpoint

## Feature updates

- Theme defaults and options
  - Light theme is now the default (ignores system preference on first load). Your last selection persists in localStorage.
  - Navy theme refined to a lighter, more professional gradient with smooth fade. Toggle cycles: Light → Dark → Navy.

- Ops view behavior
  - On login, the Ops dashboard no longer auto-loads the full employee list or show per-user details.
  - A new "Recent Failures" panel shows:
    - Ping Federate login failures in the last N minutes
    - Ping MFA verification failures in the last N minutes
  - The time window is configurable via an input (default 10 minutes); click Refresh to update.
  - The full All Users table is hidden by default. Load it on demand with the "Load all users" button.
  - Search behavior for Ops: when searching, results are reduced to the specific employee (exact match by userId/email), and full details are still shown via "View Details" dialogs.

- Clean, responsive UI
  - Layout scales across breakpoints (1/2/3-column grids), with improved spacing and overflow handling.
  - System details and user details open in dialogs to keep pages compact and professional.

### How to use

- Theme toggle: header button cycles Light/Dark/Navy; selection persists across reloads.
- Ops: adjust the minutes field in the Recent Failures card and hit Refresh.
- Ops: click "Load all users" to fetch the full list only when needed.
- Search: type name/email/ID and click Search; click "View Details" on a card or row to see expanded data.

### Notes

- If your backend does not implement `/api/ops-failures?system=<ping-federate|ping-mfa>&minutes=<n>`, the Recent Failures panel will show a friendly message; mocks can be added later to support it.
- Navy theme variables and gradient are defined under the `.navy` class in `src/app/globals.css`.

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