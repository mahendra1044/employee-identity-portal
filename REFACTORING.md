# Employee Identity Portal - Complete Refactoring Plan

## 📌 Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [The Problem](#the-problem)
3. [The Solution: 9-Phase Strategy](#the-solution-9-phase-strategy)
4. [Phase 1: Backend Refactoring (START HERE)](#phase-1-backend-refactoring)
5. [Phase 2-9 Overview](#phases-2-9-overview)
6. [Implementation Checklist](#implementation-checklist)
7. [Success Metrics](#success-metrics)

---

## Current State Analysis

### Codebase Health Report

| Metric | Value | Status |
|--------|-------|--------|
| Main Page Size | 2,478 lines | 🔴 Critical |
| Backend Server | 293 lines | 🟡 Monolithic |
| API Routes | 20+ scattered files | ⚠️ Dispersed |
| Custom Hooks | 1 | 🟡 Minimal |
| Test Coverage | 0% | 🔴 None |
| Components | 40+ UI components | 🟢 Good |

### Main Pain Points

#### 1. Frontend: `page.tsx` (2,478 lines) 🔴
```
Issues:
❌ Multiple components defined inline
❌ Complex state with 20+ useState hooks
❌ No separation of concerns
❌ Hard to test
❌ Difficult to maintain
❌ Prop drilling throughout
```

**Components Mixed In:**
- useAuth() custom hook
- LoginCard component
- SystemCard component
- SystemDetails component
- EmployeeSearch component
- OpsView component
- AllUsersTable component
- QuickActionsPanel component
- RecentFailures component

#### 2. Backend: `server.js` (293 lines) 🟡
```
Issues:
❌ All routes in single file
❌ No middleware separation
❌ No service layer
❌ Mock data loading scattered
❌ Error handling inconsistent
❌ Hard to locate specific routes
```

#### 3. API Routes Scattered 📁
```
Location: src/app/api/
├── aad/ (3 routes)
├── cyberark/ (3 routes)
├── mfa/ (3 routes)
├── pd/ (3 routes)
├── pf/ (3 routes)
├── saviynt/ (3 routes)
├── search-employee/ (1 route)
├── send-email/ (1 route)
└── submit-snow-ticket/ (1 route)

Issues:
❌ Duplicated mock data logic
❌ No shared response format
❌ Inconsistent error handling
❌ No request validation
```

#### 4. Missing Abstractions ❌
```
No custom hooks for:
- System data fetching
- Search functionality
- Feature flag loading
- Theme management
- Ops-specific data

No utilities for:
- API calls (fetch wrapper)
- Data formatting
- Error handling
- Type definitions
```

---

## The Problem

```
Current State → Issues
───────────────────────────────────────

2,478 line page.tsx
    ↓
    → Hard to understand
    → Hard to test
    → Hard to maintain
    → Hard to extend

293 line server.js
    ↓
    → All logic mixed together
    → Difficult to locate routes
    → Hard to add new endpoints

20+ API route files
    ↓
    → Duplicated code
    → No consistent patterns
    → Hard to manage

Impact:
❌ Adding features: 2-3 days
❌ Debugging: Very difficult
❌ Onboarding: 3-5 days
❌ Code reuse: Minimal
❌ Risk of breaking things: High
```

---

## The Solution: 9-Phase Strategy

### Phase Overview

```
Phase 1 - Backend Routes ...................... 2-3 days  ⭐ START HERE
├─ Modularize server.js
├─ Create middleware, services, routes
└─ Result: Organized backend

Phase 2 - Layout Components ................... 1-2 days
├─ Extract Header, Login, MainContent
└─ Result: Cleaner page.tsx

Phase 3 - Feature Components .................. 2 days
├─ Extract SystemCard, Search, OpsView
└─ Result: Modular features

Phase 4 - Custom Hooks ....................... 2 days
├─ Extract useSearch, useSystemData, etc.
└─ Result: Reusable logic

Phase 5 - Utilities & Services ............... 2 days
├─ Extract API, services, types
└─ Result: Shared code

Phase 6 - State Management ................... 3 days
├─ Consolidate with useReducer/Context
└─ Result: Centralized state

Phase 7 - Backend Modularity ................. 2-3 days
├─ Complete backend refactor
└─ Result: Fully organized

Phase 8 - Testing & Documentation ........... 3-4 days
├─ Add tests & documentation
└─ Result: >80% coverage

Phase 9 - Performance & Optimization ........ 2 days
├─ Code splitting, memoization
└─ Result: Better performance

TOTAL: 19-23 days (~5 weeks)
```

### Expected Results After Full Refactoring

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Main page | 2,478 lines | 300-400 | -88% ✨ |
| Backend main | 293 lines | 50 | -83% ✨ |
| Components | Inline | Organized | +100% ✨ |
| Custom hooks | 1 | 8-10 | +800% ✨ |
| Test coverage | 0% | >80% | +80% ✨ |
| Time to add feature | 2-3 days | 1 day | -67% ✨ |
| Onboarding | 3-5 days | 1-2 days | -70% ✨ |

---

## Phase 1: Backend Refactoring

### ⭐ START HERE - Why Phase 1?

✅ **Lowest risk** - no UI changes
✅ **Establishes patterns** - for future phases
✅ **Improves logging** - better visibility
✅ **Better error handling** - easier debugging
✅ **Takes 2-3 days** - quick win!

### What Gets Done

```
BEFORE:
backend/
├── server.js (293 lines - everything)
├── mocks/
├── config/
└── logs/

AFTER:
backend/
├── server.js (50 lines - clean entry)
├── middleware/ (auth, errors, logging)
├── routes/ (organized by feature)
├── services/ (business logic)
├── utils/ (helpers)
├── config/ (configuration)
├── mocks/ (unchanged)
└── logs/ (unchanged)
```

### Phase 1: 10 Detailed Tasks

#### Task 1.1: Create Directory Structure (0.5 day)

```bash
mkdir backend/middleware
mkdir backend/routes
mkdir backend/services
mkdir backend/utils
mkdir backend/config
```

#### Task 1.2: Create `backend/middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function authOptional(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
    } catch (e) {
      // Token invalid, but don't fail
    }
  }
  
  next();
}
```

#### Task 1.3: Create `backend/middleware/errorHandler.js`

```javascript
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (err.code === 'INVALID_SYSTEM') {
    return res.status(404).json({ error: err.message || 'System not found' });
  }
  
  if (err.code === 'FORBIDDEN') {
    return res.status(403).json({ error: err.message || 'Forbidden' });
  }
  
  if (err.code === 'VALIDATION_ERROR') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

#### Task 1.4: Create `backend/middleware/requestLogger.js`

```javascript
export function requestLogger(logger) {
  return (req, res, next) => {
    const redactedAuth = req.headers.authorization ? '[REDACTED]' : undefined;
    
    logger.info({
      msg: 'request',
      method: req.method,
      url: req.originalUrl,
      auth: redactedAuth,
      timestamp: new Date().toISOString()
    });
    
    next();
  };
}

export function responseTimer(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}
```

#### Task 1.5: Create `backend/middleware/index.js`

```javascript
export { authRequired, authOptional } from './auth.js';
export { errorHandler, asyncHandler } from './errorHandler.js';
export { requestLogger, responseTimer } from './requestLogger.js';
```

#### Task 1.6: Create `backend/services/mockDataService.js`

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class MockDataService {
  constructor() {
    this.cache = {};
  }
  
  loadMock(filename) {
    if (this.cache[filename]) {
      return this.cache[filename];
    }
    
    try {
      const filepath = path.join(__dirname, '../mocks', filename);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      this.cache[filename] = data;
      return data;
    } catch (e) {
      console.error(`Failed to load mock file ${filename}:`, e);
      return null;
    }
  }
  
  getAllUsers() {
    return this.loadMock('all-users.json') || [];
  }
  
  getSystemData(system) {
    return this.loadMock(`${system}-initial.json`);
  }
  
  getSystemDetails(system, userId) {
    const data = this.loadMock(`${system}-details.json`);
    return data ? data[userId] : null;
  }
  
  searchEmployees(query) {
    const pd = this.loadMock('ping-directory-search.json') || [];
    const mfa = this.loadMock('ping-mfa-search.json') || [];
    
    const filter = (arr) =>
      (arr || []).filter((u) => {
        const hay = `${u.name || ''} ${u.email || ''} ${u.userId || ''}`.toLowerCase();
        return hay.includes(query.toLowerCase());
      });
    
    return {
      'ping-directory': filter(pd).map((u) => ({ name: u.name, email: u.email, userId: u.userId })),
      'ping-mfa': filter(mfa).map((u) => ({ userId: u.userId, status: u.status, lastEvent: u.lastEvent })),
    };
  }
  
  getSnowIncidents(email) {
    const incidents = this.loadMock('snow-incidents.json') || [];
    return incidents.filter((i) => i.assigned_to === email);
  }
}

export const mockDataService = new MockDataService();
```

#### Task 1.7: Create `backend/services/rbacService.js`

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rolesPath = path.join(__dirname, '../config/roles.json');

class RBACService {
  constructor() {
    this.roles = JSON.parse(fs.readFileSync(rolesPath, 'utf-8'));
  }
  
  getRoleFromEmail(email) {
    const lower = (email || '').toLowerCase();
    if (lower.startsWith('ops@')) return 'ops';
    if (lower.startsWith('management@')) return 'management';
    return 'employee';
  }
  
  isSystemEnabled(system, features) {
    return !!(features?.systems && features.systems[system]);
  }
  
  hasPermission(role, system, permission) {
    const roleObj = this.roles[role] || this.roles['employee'];
    return !!(roleObj && roleObj[system] && roleObj[system][permission]);
  }
}

export const rbacService = new RBACService();
```

#### Task 1.8: Create `backend/services/index.js`

```javascript
export { mockDataService } from './mockDataService.js';
export { rbacService } from './rbacService.js';
```

#### Task 1.9: Create `backend/routes/auth.js`

```javascript
import jwt from 'jsonwebtoken';
import { rbacService } from '../services/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function setupAuthRoutes(app, features, logger) {
  app.post('/auth/login', (req, res) => {
    if (!features.useMockAuth) {
      return res.status(501).json({ error: 'Real auth not implemented' });
    }
    
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const role = rbacService.getRoleFromEmail(email);
    const token = jwt.sign({ email, role }, JWT_SECRET, { expiresIn: '24h' });
    
    logger.info({ msg: 'login', role, email });
    
    return res.json({ token, role, email });
  });
}
```

#### Task 1.10: Create `backend/routes/search.js`

```javascript
import { mockDataService } from '../services/index.js';

export function setupSearchRoutes(app, features, logger) {
  app.get('/api/search-employee/:query', (req, res) => {
    const { query } = req.params;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query too short' });
    }
    
    const results = mockDataService.searchEmployees(query);
    logger.info({ msg: 'search_employee', query });
    
    res.json(results);
  });
  
  app.get('/api/all-users', (req, res) => {
    const role = (req.user && req.user.role) || 'employee';
    
    if (role !== 'ops') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const allUsers = mockDataService.getAllUsers();
    const paginated = allUsers.slice(offset, offset + limit);
    
    res.json({
      total: allUsers.length,
      limit,
      offset,
      users: paginated,
    });
  });
}
```

#### Task 1.11: Create `backend/routes/systems.js`

```javascript
import { mockDataService, rbacService } from '../services/index.js';

const SYSTEMS = ['ping-directory', 'ping-federate', 'cyberark', 'saviynt', 'azure-ad', 'ping-mfa'];

export function setupSystemRoutes(app, features, logger) {
  app.get('/api/own-:system', (req, res) => {
    const system = req.params.system;
    
    if (!SYSTEMS.includes(system)) {
      return res.status(404).json({ error: 'System not found' });
    }
    
    if (!rbacService.isSystemEnabled(system, features)) {
      return res.status(404).json({ error: 'Feature not enabled' });
    }
    
    const role = (req.user && req.user.role) || 'employee';
    if (!rbacService.hasPermission(role, system, 'own')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const data = mockDataService.getSystemData(system);
    logger.info({ msg: 'system_own', system, role });
    
    res.json({ data });
  });
  
  app.get('/api/own-:system/details/:userId', (req, res) => {
    const { system, userId } = req.params;
    
    if (!SYSTEMS.includes(system)) {
      return res.status(404).json({ error: 'System not found' });
    }
    
    const role = (req.user && req.user.role) || 'employee';
    if (!rbacService.hasPermission(role, system, 'own')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const data = mockDataService.getSystemDetails(system, userId);
    
    if (!data) {
      return res.status(404).json({ error: 'No data found' });
    }
    
    logger.info({ msg: 'system_details', system, userId });
    res.json({ data });
  });
}
```

#### Task 1.12: Create `backend/routes/index.js`

```javascript
import { setupAuthRoutes } from './auth.js';
import { setupSearchRoutes } from './search.js';
import { setupSystemRoutes } from './systems.js';

export function setupAllRoutes(app, features, rbac, logger) {
  setupAuthRoutes(app, features, logger);
  setupSearchRoutes(app, features, logger);
  setupSystemRoutes(app, features, logger);
}
```

#### Task 1.13: Update `backend/server.js`

Replace entire file with:

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { 
  requestLogger, 
  responseTimer, 
  errorHandler,
  authRequired 
} from './middleware/index.js';
import { setupAllRoutes } from './routes/index.js';
import { logger } from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const featuresPath = path.join(__dirname, 'config/features.json');
let FEATURES = JSON.parse(fs.readFileSync(featuresPath, 'utf-8'));

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(requestLogger(logger));
app.use(responseTimer);

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/config/features', (_req, res) => res.json(FEATURES));

app.use('/api/own-*', authRequired);
app.use('/api/all-users', authRequired);
app.use('/api/snow/incidents', authRequired);
app.use('/api/ops-failures', authRequired);

setupAllRoutes(app, FEATURES, null, logger);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Backend listening on http://localhost:${PORT}`);
});
```

#### Task 1.14: Create `backend/utils/logger.js`

```javascript
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    }),
  ],
});
```

### Phase 1: Testing

After completing all tasks, test each endpoint:

```bash
# Health check
curl http://localhost:3001/health

# Get features
curl http://localhost:3001/config/features

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ops@company.com","password":"test"}'

# Search employee
curl http://localhost:3001/api/search-employee/john

# System data (with token)
TOKEN="<token from login>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/own-ping-directory

# All users (ops only)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/all-users
```

### Phase 1: Success Criteria

- [ ] All API endpoints work identically
- [ ] No feature regressions
- [ ] Code is more organized
- [ ] Easier to add new routes
- [ ] Better error handling
- [ ] Frontend still works perfectly

---

## Phases 2-9 Overview

### Phase 2: Layout Components (1-2 days)
- Extract Header, LoginPage, MainContent
- Result: Cleaner page.tsx (~1,500 lines)

### Phase 3: Feature Components (2 days)
- Extract SystemCard, EmployeeSearch, OpsView
- Result: Modular, reusable components

### Phase 4: Custom Hooks (2 days)
- Extract useSearch, useSystemData, useFeatures
- Result: Reusable logic, cleaner components

### Phase 5: Utilities & Services (2 days)
- Extract API client, formatting, types
- Result: Shared, reusable code

### Phase 6: State Management (3 days)
- Consolidate state with useReducer/Context
- Result: Centralized, predictable state

### Phase 7: Backend Modularity (2-3 days)
- Complete backend reorganization
- Result: Fully modular backend

### Phase 8: Testing & Documentation (3-4 days)
- Add unit, integration, E2E tests
- Result: >80% test coverage

### Phase 9: Performance (2 days)
- Code splitting, memoization, optimization
- Result: Better bundle size and performance

---

## Implementation Checklist

### Before Starting
- [ ] Discuss plan with team
- [ ] Secure resources (1-2 developers)
- [ ] Plan timeline (4-5 weeks)
- [ ] Decide deployment strategy

### Phase 1 Execution
- [ ] Task 1.1: Create directories
- [ ] Task 1.2-1.8: Create middleware & services
- [ ] Task 1.9-1.12: Create routes
- [ ] Task 1.13: Update server.js
- [ ] Task 1.14: Create logger
- [ ] Test all endpoints
- [ ] Test frontend integration
- [ ] Get code review
- [ ] Commit: `git commit -m "refactor(backend): modularize routes and services"`

### After Phase 1
- [ ] Team celebrates! 🎉
- [ ] Plan Phase 2
- [ ] Continue with remaining phases

---

## Success Metrics

### Phase 1 Success
```
✅ All API endpoints working
✅ No feature regressions
✅ Code more organized
✅ Easier to locate routes
✅ Better error handling
✅ Improved logging
```

### Final Success (After All Phases)
```
Code Size:       2,478 → 300-400 lines (-88%)
Backend:         293 → 50 lines (-83%)
Test Coverage:   0% → >80%
Dev Speed:       -67% faster
Onboarding:      -70% faster
Bundle Size:     -15-20% smaller
```

---

## Quick Start Guide

### 5-Minute Overview
- This is a 9-phase refactoring plan
- Phase 1 (backend) is the starting point
- It takes 2-3 days with low risk
- All features remain unchanged

### 1-Hour Preparation
1. Read this document
2. Discuss with team
3. Review Phase 1 tasks
4. Create git branch

### Start Phase 1
1. Create directory structure (Task 1.1)
2. Create middleware files (Tasks 1.2-1.5)
3. Create services (Tasks 1.6-1.8)
4. Create routes (Tasks 1.9-1.12)
5. Update server.js (Task 1.13)
6. Create logger (Task 1.14)
7. Test everything
8. Commit and celebrate!

### Timeline
- Phase 1: 2-3 days
- Phases 2-3: 3-4 days
- Phases 4-5: 4 days
- Phases 6-7: 5-6 days
- Phases 8-9: 5-6 days
- **Total: 19-23 days (~5 weeks)**

---

## Key Principles

✅ **Zero Feature Loss** - Every feature works after each phase
✅ **Low Risk** - Easy to rollback if needed
✅ **Incremental** - Small, manageable steps
✅ **Team Friendly** - Clear documentation
✅ **Well Tested** - Testing after each phase

---

## Next Steps

1. ✅ Read this document
2. ✅ Discuss with team
3. ✅ Decide on timeline
4. ✅ Start Phase 1 (backend refactoring)
5. ✅ Test everything
6. ✅ Continue with remaining phases

**Ready to start? Begin with Phase 1: Backend Refactoring!**

Good luck! 🚀
