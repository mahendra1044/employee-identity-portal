# Employee Identity Portal - Developer Guide

## Table of Contents

1. [Overview](#overview)
2. [Configuration System](#configuration-system)
   - [Features Configuration](#features-configuration)
   - [System Data Source Configuration](#system-data-source-configuration)
   - [Feature Flags](#feature-flags)
   - [System Configuration](#system-configuration)
   - [Application Settings](#application-settings)
   - [External Services](#external-services)
3. [API Architecture](#api-architecture)
   - [Architecture Overview](#architecture-overview)
   - [Code Flow Diagram](#code-flow-diagram)
   - [Key Modules](#key-modules)
4. [Integrating Real APIs](#integrating-real-apis)
   - [Step-by-Step Guide](#step-by-step-guide)
   - [Files to Modify](#files-to-modify)
   - [Sample Code Changes](#sample-code-changes)
5. [Quick Reference](#quick-reference)

---

## Overview

The Employee Identity Portal is a Next.js application with an Express.js backend that integrates with multiple identity systems:

- **SSO/Ping Systems**: Ping Directory, Ping Federate, Ping MFA, Ping Access, Ping Authorize, Ping Intelligence
- **PAM Systems**: CyberArk (PAM, EPM, Alero, Conjur, DPA, Identity)
- **IGA Systems**: Saviynt (IGA, Certifications, Analytics, Controls, Requests, Provisioning)
- **Entra ID Systems**: Microsoft Entra ID (Users, Groups, Apps, Conditional Access, Sign-in Logs)
- **TPAG Systems**: Third-Party Access Governance modules

The application supports **dual-mode operation**:
- **Mock Mode**: Uses local JSON files for development/testing
- **Real API Mode**: Connects to actual identity systems

---

## Configuration System

### Configuration Hierarchy

```
Backend (Source of Truth)          Frontend (Defaults/Fallback)
─────────────────────────          ─────────────────────────────
backend/config/features.json  →    src/config/features.config.ts
backend/config/roles.json     →    (Role definitions)
backend/config/rbac.json      →    (User-role mappings)
```

**Important**: The backend configuration is the **runtime source of truth**. Frontend configuration files provide defaults used when the backend is unavailable.

---

### Features Configuration

#### Backend Configuration File

**File**: `backend/config/features.json`

```json
{
  "credentialSource": "env",
  "useMocks": true,
  "useMockAuth": true,
  "systemDataSource": {
    "sso": "USE_MOCK",
    "pam": "USE_MOCK",
    "iga": "USE_MOCK",
    "entraId": "USE_MOCK",
    "tpag": "USE_MOCK",
    "ops": "USE_MOCK"
  },
  "systems": {
    "ping-directory": true,
    "ping-federate": true,
    "cyberark": true,
    "saviynt": true,
    "azure-ad": true,
    "ping-mfa": true
  },
  "quickActionsTabs": {
    "ping-directory": true,
    "ping-federate": true,
    "cyberark": true
  }
}
```

#### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `credentialSource` | `"env"` | Source of API credentials (environment variables) |
| `useMocks` | `boolean` | **Global override** - When `true`, ALL systems use mock data regardless of `systemDataSource` settings |
| `useMockAuth` | `boolean` | When `true`, use mock authentication (no real IDP) |
| `systemDataSource` | `object` | Per-group mock/real API toggle |
| `systems` | `object` | Enable/disable individual systems |
| `quickActionsTabs` | `object` | Show/hide systems in Quick Actions panel |

---

### System Data Source Configuration

Controls whether each system group uses mock data or real API integration.

#### System Groups

| Group | Systems Covered | Use Case |
|-------|-----------------|----------|
| `sso` | Ping Directory, Ping Federate, Ping MFA, Ping Access, Ping Authorize, Ping Intelligence | SSO/Identity systems |
| `pam` | CyberArk PAM, EPM, Alero, Conjur, DPA, Identity | Privileged Access Management |
| `iga` | Saviynt IGA, Certifications, Analytics, Controls, Requests, Provisioning | Identity Governance |
| `entraId` | Microsoft Entra ID (Users, Groups, Apps, Conditional Access, Sign-in) | Azure AD / Entra ID |
| `tpag` | Third-Party Access Governance modules | Vendor/Third-party access |
| `ops` | ServiceNow, Operations tools | Ops team tooling |

#### How to Switch Between Mock and Real API

**To enable real API for SSO systems:**

1. **Edit backend/config/features.json:**
```json
{
  "useMocks": false,
  "systemDataSource": {
    "sso": "USE_API",
    "pam": "USE_MOCK",
    "iga": "USE_MOCK",
    "entraId": "USE_MOCK",
    "tpag": "USE_MOCK",
    "ops": "USE_MOCK"
  }
}
```

2. **Set environment variables** (see [Environment Variables](#environment-variables))

#### Priority Order for Data Source Resolution

```
1. useMocks === true  → Always USE_MOCK (global override)
2. systemDataSource[group] → Use specified setting
3. Fallback → USE_MOCK (safety default)
```

---

### Feature Flags

Feature flags control application behavior and feature visibility.

**File**: `src/config/features.config.ts` (defaults) / `backend/config/features.json` (runtime)

| Flag | Default | Description |
|------|---------|-------------|
| `educateGuideEnabled` | `true` | Show "Educate Me" guide for employees |
| `useMockAuth` | `true` | Use mock authentication (development) |
| `snowTicketsEnabled` | `true` | Show ServiceNow tickets button |
| `quickActionsEnabled` | `true` | Show Quick Actions panel for ops users |
| `recentFailuresEnabled` | `true` | Show Recent Failures panel for ops users |
| `searchEnabled` | `true` | Enable employee search functionality |
| `autoLoadFailuresOnLogin` | `true` | Auto-load failures when ops user logs in |

#### How to Turn Features On/Off

**Option 1: Backend Config (Runtime)**
```json
// backend/config/features.json
{
  "snowTicketsEnabled": false,
  "quickActionsEnabled": true
}
```

**Option 2: Frontend Default (Fallback)**
```typescript
// src/config/features.config.ts
export const FEATURE_FLAGS = {
  snowTicketsEnabled: false,  // Disabled by default
  quickActionsEnabled: true,
};
```

---

### System Configuration

**File**: `src/config/systems.config.ts`

#### System Keys

All valid system identifiers used throughout the application:

```typescript
export const SYSTEM_KEYS: SystemKey[] = [
  // Ping Identity Systems
  'ping-directory', 'ping-federate', 'ping-mfa',
  'ping-access', 'ping-authorize', 'ping-intelligence',
  
  // CyberArk Systems
  'cyberark', 'cyberark-epm', 'cyberark-alero',
  'cyberark-conjur', 'cyberark-dpa', 'cyberark-identity',
  
  // Saviynt Systems
  'saviynt', 'saviynt-certifications', 'saviynt-analytics',
  'saviynt-controls', 'saviynt-requests', 'saviynt-provisioning',
  
  // Azure/Entra ID Systems
  'azure-ad', 'azure-ad-users', 'azure-ad-groups',
  'azure-ad-apps', 'azure-ad-conditional', 'azure-ad-signin',
  
  // TPAG Systems
  'saviynt-tpag', 'saviynt-tpag-vendors', 'saviynt-tpag-contracts',
  'saviynt-tpag-access', 'saviynt-tpag-risk', 'saviynt-tpag-lifecycle',
];
```

#### System Groups for UI Display

```typescript
export const SYSTEM_GROUPS = {
  // Core systems (shown to employees)
  core: ['ping-directory', 'ping-federate', 'ping-mfa', 'azure-ad', 'cyberark', 'saviynt'],
  
  // SSO systems (for sso_ops role)
  sso: ['ping-directory', 'ping-federate', 'ping-mfa', 'ping-access', 'ping-authorize', 'ping-intelligence'],
  
  // PAM systems (for pam_ops role)
  pam: ['cyberark', 'cyberark-epm', 'cyberark-alero', 'cyberark-conjur', 'cyberark-dpa', 'cyberark-identity'],
  
  // ... etc
};
```

#### Adding a New System

1. Add system key to `SYSTEM_KEYS`
2. Add display label to `SYSTEM_LABELS`
3. Add to appropriate group in `SYSTEM_GROUPS`
4. Add to backend `backend/config/features.json` under `systems`
5. Add role permissions to `backend/config/roles.json`

---

### Application Settings

**File**: `src/config/app.config.ts`

```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:3001',  // Backend API URL
  timeout: {
    default: 30000,  // 30 seconds
    search: 10000,   // 10 seconds
    upload: 60000,   // 60 seconds
  },
  retry: {
    attempts: 3,
    delay: 1000,
  },
};

export const UI_DEFAULTS = {
  opsFailureMinutes: 10,
  quickActionsDefaultTab: 'ping-federate',
  searchDebounceMs: 300,
  listPreviewLimit: 5,
};
```

---

### External Services

**File**: `src/config/external-services.config.ts`

```typescript
export const SPLUNK_CONFIG = {
  enabled: true,
  baseUrl: 'https://splunk.company.com',
  searchUrl: 'https://splunk.company.com/en-US/app/search/search',
};

export const SERVICENOW_CONFIG = {
  enabled: true,
  baseUrl: 'https://company.service-now.com',
  incidentsEndpoint: '/api/now/table/incident',
};
```

---

## API Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Pages     │    │ Components  │    │   Hooks     │    │   Config    │  │
│  │ (app/*.tsx) │ -> │ (ui/*.tsx)  │ -> │(useFeatures)│ -> │ (api/*.ts)  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                   │          │
│                                                                   ▼          │
│                                         ┌─────────────────────────────────┐  │
│                                         │  API Config Resolver            │  │
│                                         │  getApiConfig('sso')            │  │
│                                         │  → Returns mock OR real config  │  │
│                                         └─────────────────────────────────┘  │
│                                                        │                     │
│         ┌──────────────────────────────────────────────┴─────────────────┐   │
│         │                                                                │   │
│         ▼                                                                ▼   │
│  ┌─────────────────┐                                      ┌─────────────────┐│
│  │  Mock Config    │                                      │  Real Config    ││
│  │  (mock/*.ts)    │                                      │  (real/*.ts)    ││
│  └─────────────────┘                                      └─────────────────┘│
│         │                                                        │           │
│         ▼                                                        ▼           │
│  ┌─────────────────┐                                      ┌─────────────────┐│
│  │ Next.js API     │                                      │ Real API        ││
│  │ Routes          │                                      │ Endpoints       ││
│  │ (/api/own-*)    │                                      │ (External)      ││
│  └─────────────────┘                                      └─────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Express.js)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Routes    │    │  Services   │    │   Config    │    │   Mocks     │  │
│  │ (routes/*) │ -> │(services/*) │ -> │(config/*.json)│<-│(mocks/*.json)│  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                            │                                                 │
│         ┌──────────────────┴──────────────────┐                             │
│         ▼                                     ▼                             │
│  ┌─────────────────┐                   ┌─────────────────┐                  │
│  │ mockDataService │                   │  rbacService    │                  │
│  │ (Load JSON mock)│                   │ (Role checking) │                  │
│  └─────────────────┘                   └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Code Flow Diagram

#### Request Flow: Employee Views Own Ping Directory Data

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW DIAGRAM                                │
└──────────────────────────────────────────────────────────────────────────────┘

User Action: Employee clicks "Ping Directory" card
                    │
                    ▼
┌─────────────────────────────────────────┐
│  1. FRONTEND: Component                  │
│     src/components/SystemCard.tsx        │
│     - User clicks to view system data    │
│     - Calls API hook/service             │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  2. FRONTEND: API Config Resolution      │
│     src/config/api/index.ts             │
│                                          │
│     const config = getApiConfig('sso');  │
│     // Checks SYSTEM_DATA_SOURCE.sso     │
│     // Returns mock or real config       │
│                                          │
│     if USE_MOCK:                         │
│       → SSO_MOCK_CONFIG                  │
│       → endpoint: '/api/own-ping-directory'
│     if USE_API:                          │
│       → SSO_REAL_CONFIG                  │
│       → endpoint: '/directory/v1/users/{userId}'
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  3. FRONTEND: API Request                │
│     (Using fetch or axios)               │
│                                          │
│     Mock Mode:                           │
│       GET /api/own-ping-directory        │
│       → Routed to backend server         │
│                                          │
│     Real API Mode:                       │
│       GET https://ping.api.com/v1/users  │
│       → Direct call to Ping Identity API │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  4. BACKEND: Route Handler               │
│     backend/routes/systems.js            │
│                                          │
│     app.get('/api/own-:system', ...)     │
│     │                                    │
│     ├─ Check RBAC permission             │
│     ├─ Check data source mode            │
│     │   getDataSourceForSystem('ping-directory', features)
│     │                                    │
│     └─ if USE_MOCK:                      │
│          mockDataService.getSystemData() │
│        else:                             │
│          Call real API (TODO)            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  5. BACKEND: Data Service                │
│     backend/services/mockDataService.js  │
│                                          │
│     getSystemData('ping-directory')      │
│     → Loads: mocks/ping-directory-initial.json
│     → Returns JSON data                  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  6. RESPONSE: JSON to Frontend           │
│     {                                    │
│       "data": { ... user data ... },     │
│       "_dataSource": "MOCK"              │
│     }                                    │
└─────────────────────────────────────────┘
```

---

### Key Modules

#### Frontend Modules

| Module | Path | Purpose |
|--------|------|---------|
| **Config Index** | `src/config/index.ts` | Main export for all configurations |
| **Features Config** | `src/config/features.config.ts` | Feature flags and data source settings |
| **Systems Config** | `src/config/systems.config.ts` | System definitions, labels, groups |
| **API Config** | `src/config/api/index.ts` | API configuration resolver |
| **Mock API Config** | `src/config/api/mock/*.ts` | Mock endpoint configurations |
| **Real API Config** | `src/config/api/real/*.ts` | Real API endpoint configurations |
| **API Types** | `src/config/api/types.ts` | TypeScript types for API configs |

#### Backend Modules

| Module | Path | Purpose |
|--------|------|---------|
| **Server** | `backend/server.js` | Express.js entry point |
| **Routes Index** | `backend/routes/index.js` | Route setup aggregator |
| **System Routes** | `backend/routes/systems.js` | `/api/own-*` endpoints |
| **Search Routes** | `backend/routes/search.js` | `/api/search-employee` endpoint |
| **Auth Routes** | `backend/routes/auth.js` | Authentication endpoints |
| **Mock Data Service** | `backend/services/mockDataService.js` | Loads mock JSON files |
| **RBAC Service** | `backend/services/rbacService.js` | Role-based access control |
| **Features Config** | `backend/config/features.json` | Runtime feature configuration |
| **Roles Config** | `backend/config/roles.json` | System permissions per role |

---

## Integrating Real APIs

### Step-by-Step Guide

#### Step 1: Create Real API Configuration

**File**: `src/config/api/real/{group}.config.ts`

Example for SSO systems:

```typescript
// src/config/api/real/sso.config.ts

import type { RealSystemConfig } from '../types';

export const SSO_REAL_CONFIG: RealSystemConfig = {
  // Connection settings
  connection: {
    baseUrl: process.env.PING_API_BASE_URL || 'https://api.pingidentity.com',
    clientId: process.env.PING_CLIENT_ID || '',
    clientSecret: process.env.PING_CLIENT_SECRET || '',
    authMethod: 'oauth2',
    tokenEndpoint: '/oauth2/token',
    scopes: ['openid', 'profile', 'email', 'directory.read'],
    timeout: 30000,
  },

  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Define endpoints
  systemCards: {
    pingDirectory: {
      endpoint: '/directory/v1/users/{userId}',
      method: 'GET',
      description: 'Get user profile from Ping Directory',
      responseMapping: {
        displayName: 'cn',
        email: 'mail',
        department: 'department',
      },
    },
  },

  search: {
    searchUsers: {
      endpoint: '/directory/v1/users',
      method: 'GET',
      queryParams: ['filter', 'limit'],
      requestMapping: {
        filter: '(|(cn=*{query}*)(mail=*{query}*))',
      },
    },
    getUserDetails: {
      endpoint: '/directory/v1/users/{userId}',
      method: 'GET',
    },
  },

  failures: {
    pingFederateAuthFailures: {
      endpoint: '/pf/v1/audit/events',
      method: 'GET',
      queryParams: ['eventType', 'status', 'startTime', 'endTime'],
    },
  },

  quickActions: {
    unlockAccount: {
      endpoint: '/directory/v1/users/{userId}',
      method: 'PATCH',
      requestBody: {
        operations: [{ op: 'replace', path: 'ds-pwp-account-locked', value: false }],
      },
      successMessage: 'Account unlocked successfully',
    },
  },
};
```

#### Step 2: Implement Backend API Handler

**File**: `backend/routes/systems.js`

Add real API implementation in the route handler:

```javascript
import axios from 'axios';

// Add real API service
async function callRealApi(system, group, features, userId) {
  const config = getRealApiConfig(group);
  
  // Get access token (OAuth2)
  const token = await getAccessToken(config.connection);
  
  // Build request
  const url = `${config.connection.baseUrl}${config.systemCards[system].endpoint}`
    .replace('{userId}', userId);
  
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: config.connection.timeout,
  });
  
  // Apply response mapping
  return mapResponse(response.data, config.systemCards[system].responseMapping);
}

// Update route handler
export function setupSystemRoutes(app, features, logger) {
  app.get('/api/own-:system', async (req, res) => {
    const system = req.params.system;
    const group = SYSTEM_TO_GROUP[system];
    
    // ... RBAC checks ...
    
    if (shouldUseMock(system, features)) {
      // Mock mode
      const data = mockDataService.getSystemData(system);
      return res.json({ data, _dataSource: 'MOCK' });
    }
    
    // Real API mode
    try {
      const userId = req.user.userId;
      const data = await callRealApi(system, group, features, userId);
      return res.json({ data, _dataSource: 'API' });
    } catch (error) {
      logger.error({ msg: 'api_error', system, error: error.message });
      return res.status(500).json({ error: 'Failed to fetch data from API' });
    }
  });
}
```

#### Step 3: Set Environment Variables

Create or update `.env` file in backend:

```bash
# backend/.env

# Ping Identity API
PING_API_BASE_URL=https://api.pingidentity.com
PING_CLIENT_ID=your-client-id
PING_CLIENT_SECRET=your-client-secret

# CyberArk API
CYBERARK_API_BASE_URL=https://cyberark.company.com
CYBERARK_API_KEY=your-api-key

# Saviynt API
SAVIYNT_API_BASE_URL=https://saviynt.company.com
SAVIYNT_CLIENT_ID=your-client-id
SAVIYNT_CLIENT_SECRET=your-client-secret

# Microsoft Graph API (Entra ID)
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
```

#### Step 4: Enable Real API Mode

**File**: `backend/config/features.json`

```json
{
  "useMocks": false,
  "systemDataSource": {
    "sso": "USE_API",
    "pam": "USE_MOCK",
    "iga": "USE_MOCK",
    "entraId": "USE_MOCK",
    "tpag": "USE_MOCK",
    "ops": "USE_MOCK"
  }
}
```

---

### Files to Modify

When integrating a real API for a system group, you need to modify/create these files:

#### Configuration Files

| File | Action | Purpose |
|------|--------|---------|
| `src/config/api/real/{group}.config.ts` | Create/Modify | Define real API endpoints |
| `src/config/api/real/index.ts` | Update | Export new config |
| `backend/config/features.json` | Update | Set `systemDataSource.{group}` to `USE_API` |
| `backend/.env` | Create/Update | Add API credentials |

#### Backend Implementation Files

| File | Action | Purpose |
|------|--------|---------|
| `backend/routes/systems.js` | Modify | Add real API call logic |
| `backend/services/apiService.js` | Create | API client with OAuth/auth handling |
| `backend/services/tokenService.js` | Create | OAuth token management |

#### Frontend Files (Usually No Changes Needed)

| File | Notes |
|------|-------|
| `src/config/api/index.ts` | Automatically routes to real config when `USE_API` |
| Components | Should work unchanged - config-driven |

---

### Sample Code Changes

#### Complete Backend Implementation Example

**File**: `backend/services/apiService.js` (New File)

```javascript
import axios from 'axios';
import { tokenService } from './tokenService.js';

class ApiService {
  constructor() {
    this.clients = {};
  }

  getClient(group) {
    if (!this.clients[group]) {
      this.clients[group] = axios.create({
        timeout: 30000,
      });
    }
    return this.clients[group];
  }

  async call(group, config, params = {}) {
    const client = this.getClient(group);
    
    // Get token for authenticated requests
    const token = await tokenService.getToken(group);
    
    // Build URL with path parameters
    let url = config.baseUrl + config.endpoint;
    for (const [key, value] of Object.entries(params.pathParams || {})) {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    }

    // Make request
    const response = await client.request({
      method: config.method,
      url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...config.headers,
      },
      params: params.queryParams,
      data: params.body,
    });

    // Apply response mapping if defined
    if (config.responseMapping) {
      return this.mapResponse(response.data, config.responseMapping);
    }

    return response.data;
  }

  mapResponse(data, mapping) {
    const result = {};
    for (const [appField, apiField] of Object.entries(mapping)) {
      result[appField] = this.getNestedValue(data, apiField);
    }
    return result;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }
}

export const apiService = new ApiService();
```

**File**: `backend/services/tokenService.js` (New File)

```javascript
import axios from 'axios';

const TOKEN_CONFIGS = {
  sso: {
    tokenEndpoint: process.env.PING_TOKEN_ENDPOINT,
    clientId: process.env.PING_CLIENT_ID,
    clientSecret: process.env.PING_CLIENT_SECRET,
    grantType: 'client_credentials',
  },
  pam: {
    tokenEndpoint: process.env.CYBERARK_TOKEN_ENDPOINT,
    apiKey: process.env.CYBERARK_API_KEY,
    grantType: 'api_key',
  },
  iga: {
    tokenEndpoint: process.env.SAVIYNT_TOKEN_ENDPOINT,
    clientId: process.env.SAVIYNT_CLIENT_ID,
    clientSecret: process.env.SAVIYNT_CLIENT_SECRET,
    grantType: 'client_credentials',
  },
  entraId: {
    tokenEndpoint: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grantType: 'client_credentials',
  },
};

class TokenService {
  constructor() {
    this.tokens = {};
  }

  async getToken(group) {
    // Check cache
    if (this.tokens[group] && this.tokens[group].expiresAt > Date.now()) {
      return this.tokens[group].accessToken;
    }

    // Fetch new token
    const config = TOKEN_CONFIGS[group];
    if (!config) throw new Error(`No token config for group: ${group}`);

    const token = await this.fetchToken(config);
    this.tokens[group] = token;
    return token.accessToken;
  }

  async fetchToken(config) {
    if (config.grantType === 'api_key') {
      return { accessToken: config.apiKey, expiresAt: Date.now() + 3600000 };
    }

    const params = new URLSearchParams({
      grant_type: config.grantType,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      ...(config.scope && { scope: config.scope }),
    });

    const response = await axios.post(config.tokenEndpoint, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return {
      accessToken: response.data.access_token,
      expiresAt: Date.now() + (response.data.expires_in - 60) * 1000,
    };
  }
}

export const tokenService = new TokenService();
```

---

## Quick Reference

### Toggle Mock/Real API

```json
// backend/config/features.json

// All mock (development)
{ "useMocks": true }

// Per-group control
{
  "useMocks": false,
  "systemDataSource": {
    "sso": "USE_API",     // Real API
    "pam": "USE_MOCK",    // Mock
    "iga": "USE_MOCK",
    "entraId": "USE_MOCK",
    "tpag": "USE_MOCK",
    "ops": "USE_MOCK"
  }
}
```

### Enable/Disable Systems

```json
// backend/config/features.json
{
  "systems": {
    "ping-directory": true,    // Enabled
    "ping-federate": false,    // Disabled (hidden)
    "cyberark": true
  }
}
```

### Enable/Disable Features

```json
// backend/config/features.json
{
  "snowTicketsEnabled": true,
  "quickActionsEnabled": false,
  "searchEnabled": true
}
```

### Environment Variables

| Variable | Group | Description |
|----------|-------|-------------|
| `PING_API_BASE_URL` | sso | Ping Identity API base URL |
| `PING_CLIENT_ID` | sso | OAuth2 client ID |
| `PING_CLIENT_SECRET` | sso | OAuth2 client secret |
| `CYBERARK_API_BASE_URL` | pam | CyberArk API base URL |
| `CYBERARK_API_KEY` | pam | CyberArk API key |
| `SAVIYNT_API_BASE_URL` | iga | Saviynt API base URL |
| `SAVIYNT_CLIENT_ID` | iga | Saviynt client ID |
| `SAVIYNT_CLIENT_SECRET` | iga | Saviynt client secret |
| `AZURE_TENANT_ID` | entraId | Azure AD tenant ID |
| `AZURE_CLIENT_ID` | entraId | Azure AD app client ID |
| `AZURE_CLIENT_SECRET` | entraId | Azure AD app client secret |

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Real API not yet implemented" | `USE_API` set but no backend implementation | Implement API handler or set to `USE_MOCK` |
| 401 Unauthorized | Invalid/expired token | Check credentials in `.env` |
| Feature not showing | `systems.{system}` is `false` | Enable in `features.json` |
| Using mock when expecting real | `useMocks: true` overrides all | Set `useMocks: false` |

### Debug Mode

Add logging to track data source:

```javascript
// Response includes data source indicator
res.json({ 
  data,
  _dataSource: shouldUseMock(system, features) ? 'MOCK' : 'API'
});
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-03 | Initial documentation |

