# MFA/SAML Authentication - Developer Guide

| Document Info | |
|---------------|---|
| **Version** | 1.0 |
| **Last Updated** | December 6, 2025 |
| **Author** | Development Team |
| **Related Requirement** | REQ-AUTH-MFA-SAML-Integration.md |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [File Structure](#3-file-structure)
4. [Configuration](#4-configuration)
5. [Code Flow - Mock Authentication](#5-code-flow---mock-authentication)
6. [Code Flow - SAML/MFA Authentication](#6-code-flow---samlmfa-authentication)
7. [Key Components Deep Dive](#7-key-components-deep-dive)
8. [Role Mapping System](#8-role-mapping-system)
9. [How to Make Changes](#9-how-to-make-changes)
10. [Testing](#10-testing)
11. [Troubleshooting](#11-troubleshooting)
12. [Security Considerations](#12-security-considerations)

---

## 1. Overview

The Employee Identity Portal supports **dual authentication modes**:

| Mode | Config Value | Description | Use Case |
|------|--------------|-------------|----------|
| **Mock Auth** | `USE_MOCK_AUTH` | UserId-based login with mock data | Development, Testing |
| **MFA Auth** | `USE_MFA_AUTH` | SAML 2.0 SSO with Ping Federate | Production, Staging |

### Key Design Principles

1. **Configuration-Driven**: Switch modes by changing config only, no code changes
2. **Modular Architecture**: Separate providers for each auth type
3. **Backward Compatible**: Existing mock auth works unchanged
4. **Extensible**: Easy to add OAuth/OIDC in future

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │   LoginForm.tsx │────>│  useAuthMode()  │────>│ /api/config/    │       │
│  │                 │     │     Hook        │     │   features      │       │
│  └────────┬────────┘     └─────────────────┘     └─────────────────┘       │
│           │                                                                 │
│           │ isMfaAuth?                                                      │
│           ├──────────────────────────────────────┐                          │
│           │ NO (Mock)                            │ YES (SAML)               │
│           ▼                                      ▼                          │
│  ┌─────────────────┐                    ┌─────────────────┐                 │
│  │ POST /api/auth/ │                    │ Redirect to     │                 │
│  │     login       │                    │ /api/saml/login │                 │
│  └─────────────────┘                    └─────────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Express)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                        routes/index.js                           │       │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │       │
│  │  │  auth.js    │  │  saml.js    │  │  search.js  │  ...         │       │
│  │  │ (mock login)│  │ (SSO flow)  │  │             │              │       │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                      services/                                   │       │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │       │
│  │  │ authService.js  │  │ rbacService.js  │  │mockDataService  │  │       │
│  │  │ (JWT, config)   │  │ (role mapping)  │  │                 │  │       │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL (SAML Mode Only)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐           ┌─────────────────┐                         │
│  │  Ping Federate  │◄─────────►│  Ping Directory │                         │
│  │  (IDP)          │           │  (User Store)   │                         │
│  │  - SSO          │           │  - Attributes   │                         │
│  │  - MFA          │           │  - Groups       │                         │
│  └─────────────────┘           └─────────────────┘                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. File Structure

### Frontend Files (`src/`)

```
src/
├── config/
│   └── auth.config.ts              # Auth types & default configuration
│
├── lib/
│   └── auth/
│       ├── index.ts                # Barrel exports for auth module
│       ├── types.ts                # TypeScript interfaces (AuthUser, SamlAttributes, etc.)
│       ├── auth-provider.ts        # UnifiedAuthProvider (mode switcher)
│       ├── mock-auth.ts            # MockAuthProvider class
│       ├── saml-auth.ts            # SamlAuthProvider class
│       └── role-mapper.ts          # RoleMapper class (group → role)
│
├── hooks/
│   ├── useAuthMode.ts              # Hook for auth mode detection & SSO initiation
│   └── index.ts                    # Exports useAuthMode
│
├── components/
│   └── LoginForm.tsx               # Dual-mode login form (mock + SSO)
│
└── config/
    └── labels/
        └── login.json              # i18n translations for login/SSO
```

### Backend Files (`backend/`)

```
backend/
├── config/
│   └── features.json               # Runtime configuration (authMode, mfaAuth, groupRoleMapping)
│
├── services/
│   ├── authService.js              # Auth utilities (JWT, config getters)
│   ├── rbacService.js              # RBAC & role mapping utilities
│   └── index.js                    # Service exports
│
└── routes/
    ├── auth.js                     # Mock login endpoint (/api/auth/login)
    ├── saml.js                     # SAML endpoints (login, acs, logout, metadata)
    └── index.js                    # Route registration
```

---

## 4. Configuration

### 4.1 Main Configuration File

**Location**: `backend/config/features.json`

```json
{
  // ═══════════════════════════════════════════════════════════════════
  // AUTH MODE - This is the main toggle
  // ═══════════════════════════════════════════════════════════════════
  "authMode": "USE_MOCK_AUTH",    // Options: "USE_MOCK_AUTH" | "USE_MFA_AUTH"

  // ═══════════════════════════════════════════════════════════════════
  // MOCK AUTH SETTINGS (used when authMode = "USE_MOCK_AUTH")
  // ═══════════════════════════════════════════════════════════════════
  "mockAuth": {
    "enabled": true,
    "defaultUserId": "u1001"       // Optional: pre-fill userId field
  },

  // ═══════════════════════════════════════════════════════════════════
  // MFA/SAML SETTINGS (used when authMode = "USE_MFA_AUTH")
  // ═══════════════════════════════════════════════════════════════════
  "mfaAuth": {
    "enabled": false,              // Set to true when using SAML
    "protocol": "SAML",
    
    // Service Provider (This Application)
    "serviceProvider": {
      "entityId": "https://identity-portal.company.com",
      "assertionConsumerServiceUrl": "http://localhost:3001/api/saml/acs",
      "singleLogoutUrl": "http://localhost:3001/api/saml/logout"
    },
    
    // Identity Provider (Ping Federate)
    "identityProvider": {
      "entityId": "https://sso.company.com",
      "ssoUrl": "https://sso.company.com/idp/SSO.saml2",
      "sloUrl": "https://sso.company.com/idp/SLO.saml2",
      "certificatePath": "./config/saml/idp-certificate.pem"
    },
    
    // Attribute Mapping (SAML assertion → app fields)
    "attributeMapping": {
      "userId": "uid",              // SAML attribute for user ID
      "email": "mail",              // SAML attribute for email
      "displayName": "cn",          // SAML attribute for display name
      "groups": "memberOf"          // SAML attribute for group memberships
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // GROUP TO ROLE MAPPING (used in both modes for role assignment)
  // ═══════════════════════════════════════════════════════════════════
  "groupRoleMapping": {
    "CN=SSO_OPS,OU=Groups,DC=company,DC=com": ["employee", "sso_ops"],
    "CN=PAM_OPS,OU=Groups,DC=company,DC=com": ["employee", "pam_ops"],
    "CN=IGA_OPS,OU=Groups,DC=company,DC=com": ["employee", "iga_ops"],
    "CN=MASTER_OPS,OU=Groups,DC=company,DC=com": ["employee", "ops"]
  },

  // Default role when no groups match
  "defaultRole": "employee"
}
```

### 4.2 Frontend Type Definitions

**Location**: `src/config/auth.config.ts`

```typescript
// Auth mode type
export type AuthMode = 'USE_MOCK_AUTH' | 'USE_MFA_AUTH';

// Check functions
export function isMockAuthMode(mode: AuthMode): boolean {
  return mode === 'USE_MOCK_AUTH';
}

export function isMfaAuthMode(mode: AuthMode): boolean {
  return mode === 'USE_MFA_AUTH';
}
```

---

## 5. Code Flow - Mock Authentication

### Sequence Diagram

```
┌──────┐          ┌───────────┐          ┌───────────┐          ┌─────────────┐
│ User │          │ LoginForm │          │useAuthMode│          │ Backend API │
└──┬───┘          └─────┬─────┘          └─────┬─────┘          └──────┬──────┘
   │                    │                      │                       │
   │  1. Page Load      │                      │                       │
   │───────────────────>│                      │                       │
   │                    │                      │                       │
   │                    │  2. Fetch auth mode  │                       │
   │                    │─────────────────────>│                       │
   │                    │                      │                       │
   │                    │                      │  3. GET /api/config/features
   │                    │                      │──────────────────────>│
   │                    │                      │                       │
   │                    │                      │  4. { authMode: "USE_MOCK_AUTH" }
   │                    │                      │<──────────────────────│
   │                    │                      │                       │
   │                    │  5. isMockAuth=true  │                       │
   │                    │<─────────────────────│                       │
   │                    │                      │                       │
   │  6. Show userId    │                      │                       │
   │     input form     │                      │                       │
   │<───────────────────│                      │                       │
   │                    │                      │                       │
   │  7. Enter userId   │                      │                       │
   │     "u1001"        │                      │                       │
   │───────────────────>│                      │                       │
   │                    │                      │                       │
   │                    │  8. POST /api/auth/login                     │
   │                    │     { userId: "u1001" }                      │
   │                    │─────────────────────────────────────────────>│
   │                    │                      │                       │
   │                    │                      │        9. Validate    │
   │                    │                      │           user        │
   │                    │                      │        10. Get roles  │
   │                    │                      │        11. Create JWT │
   │                    │                      │                       │
   │                    │  12. { token, roles, availableRoles }        │
   │                    │<─────────────────────────────────────────────│
   │                    │                      │                       │
   │  13. Login Success │                      │                       │
   │      Show App      │                      │                       │
   │<───────────────────│                      │                       │
   │                    │                      │                       │
```

### Code Walkthrough

#### Step 1-5: Auth Mode Detection

**File**: `src/hooks/useAuthMode.ts`

```typescript
export function useAuthMode(): UseAuthModeReturn {
  const [authMode, setAuthMode] = useState<AuthMode>('USE_MOCK_AUTH');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAuthMode = async () => {
      try {
        // Fetch from backend config API
        const response = await fetch('/api/config/features');
        if (response.ok) {
          const data = await response.json();
          if (data.authMode) {
            setAuthMode(data.authMode as AuthMode);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuthMode();
  }, []);
  
  return {
    authMode,
    isMockAuth: authMode === 'USE_MOCK_AUTH',
    isMfaAuth: authMode === 'USE_MFA_AUTH',
    isLoading,
    // ...
  };
}
```

#### Step 6: Render Login Form

**File**: `src/components/LoginForm.tsx`

```tsx
export function LoginForm() {
  const { isMfaAuth, isLoading } = useAuthMode();
  
  // Show loading spinner while auth mode is determined
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      {isMfaAuth ? (
        // SSO Mode - Show SSO button
        <Button onClick={handleSSOLogin}>Sign in with SSO</Button>
      ) : (
        // Mock Mode - Show userId form
        <form onSubmit={submitMockLogin}>
          <Input name="userId" placeholder="e.g., u1001" />
          <Button type="submit">Sign In</Button>
        </form>
      )}
    </div>
  );
}
```

#### Step 7-12: Mock Login API Call

**File**: `src/components/LoginForm.tsx`

```typescript
const submitMockLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Call mock login API
    const response = await api.auth.login(userId, password);
    
    if (!response.ok) throw new Error(response.error);
    
    const data = response.data as LoginResponse;
    
    // Store auth in context
    login(data.token, data.role, data.userId, {
      assignedRoles: data.assignedRoles,
      availableRoles: data.availableRoles,
      activeRole: data.activeRole,
      isMaster: data.isMaster,
    });
  } catch (err) {
    setError(ErrorHandler.getUserFriendlyMessage(err));
  }
};
```

**File**: `backend/routes/auth.js` (existing route, unchanged)

```javascript
// POST /api/auth/login
router.post('/login', (req, res) => {
  const { userId } = req.body;
  
  // Validate user against mock data
  const rbacResponse = rbacService.getRbacLoginResponse(userId);
  
  // Generate JWT token
  const token = jwt.sign({
    userId: rbacResponse.userId,
    roles: rbacResponse.assignedRoles
  }, JWT_SECRET, { expiresIn: '24h' });
  
  res.json({
    success: true,
    token,
    ...rbacResponse
  });
});
```

---

## 6. Code Flow - SAML/MFA Authentication

### Sequence Diagram

```
┌──────┐      ┌───────────┐      ┌─────────────┐      ┌──────────────┐
│ User │      │ LoginForm │      │ Backend API │      │Ping Federate │
└──┬───┘      └─────┬─────┘      └──────┬──────┘      └──────┬───────┘
   │                │                   │                    │
   │  1. Click      │                   │                    │
   │  "SSO Login"   │                   │                    │
   │───────────────>│                   │                    │
   │                │                   │                    │
   │                │  2. initiateSSO() │                    │
   │                │──────────────────>│                    │
   │                │                   │                    │
   │  3. Redirect to /api/saml/login   │                    │
   │<───────────────────────────────────│                    │
   │                │                   │                    │
   │  4. GET /api/saml/login            │                    │
   │───────────────────────────────────>│                    │
   │                │                   │                    │
   │                │                   │ 5. Build SAML      │
   │                │                   │    AuthnRequest    │
   │                │                   │                    │
   │  6. 302 Redirect to IDP SSO URL                        │
   │<───────────────────────────────────│                    │
   │                │                   │                    │
   │  7. IDP Login Page                                      │
   │────────────────────────────────────────────────────────>│
   │                │                   │                    │
   │  8. Enter SSO credentials                               │
   │────────────────────────────────────────────────────────>│
   │                │                   │                    │
   │  9. MFA Challenge (Push/OTP)                            │
   │<────────────────────────────────────────────────────────│
   │                │                   │                    │
   │  10. Complete MFA                                       │
   │────────────────────────────────────────────────────────>│
   │                │                   │                    │
   │                │                   │  11. POST /api/saml/acs
   │                │                   │      SAMLResponse  │
   │                │                   │<───────────────────│
   │                │                   │                    │
   │                │                   │ 12. Parse assertion│
   │                │                   │ 13. Extract attrs  │
   │                │                   │ 14. Map groups→roles
   │                │                   │ 15. Generate JWT   │
   │                │                   │                    │
   │  16. Redirect to app with token    │                    │
   │<───────────────────────────────────│                    │
   │                │                   │                    │
   │                │  17. Process token│                    │
   │                │      from URL     │                    │
   │───────────────>│                   │                    │
   │                │                   │                    │
   │  18. Login     │                   │                    │
   │      Success   │                   │                    │
   │<───────────────│                   │                    │
```

### Code Walkthrough

#### Step 1-3: Initiate SSO

**File**: `src/hooks/useAuthMode.ts`

```typescript
const initiateSSO = useCallback((returnUrl?: string) => {
  const url = returnUrl || window.location.pathname;
  // Redirect to backend SAML login endpoint
  window.location.href = `/api/saml/login?returnUrl=${encodeURIComponent(url)}`;
}, []);
```

**File**: `src/components/LoginForm.tsx`

```tsx
const handleSSOLogin = () => {
  setLoading(true);
  initiateSSO(window.location.pathname);
};
```

#### Step 4-6: Backend SAML Login Route

**File**: `backend/routes/saml.js`

```javascript
// GET /api/saml/login
router.get('/login', (req, res) => {
  // Check if MFA auth is enabled
  if (!authService.isMfaAuth()) {
    return res.status(400).json({ error: 'SAML not enabled' });
  }

  const spConfig = authService.getSpConfig();
  const idpConfig = authService.getIdpConfig();

  // Generate unique request ID
  const requestId = generateRequestId();
  
  // Build SAML AuthnRequest XML
  const authnRequest = buildAuthnRequest(requestId, spConfig, idpConfig);
  
  // Base64 encode the request
  const encodedRequest = Buffer.from(authnRequest).toString('base64');

  // Build redirect URL with SAML request
  const relayState = req.query.returnUrl || '/';
  const redirectUrl = `${idpConfig.ssoUrl}?SAMLRequest=${encodeURIComponent(encodedRequest)}&RelayState=${encodeURIComponent(relayState)}`;

  // Redirect to IDP
  res.redirect(redirectUrl);
});
```

#### Step 7-10: User Authenticates at IDP

This happens entirely at Ping Federate:
1. User sees IDP login page
2. Enters SSO credentials
3. Completes MFA challenge (push notification, OTP, etc.)
4. IDP validates credentials and MFA

#### Step 11-15: Assertion Consumer Service (ACS)

**File**: `backend/routes/saml.js`

```javascript
// POST /api/saml/acs
router.post('/acs', express.urlencoded({ extended: true }), async (req, res) => {
  const { SAMLResponse, RelayState } = req.body;

  if (!SAMLResponse) {
    return res.status(400).json({ error: 'SAML Response required' });
  }

  // Parse and validate SAML assertion
  const attributeMapping = authService.getAttributeMapping();
  const result = parseAssertion(SAMLResponse, attributeMapping);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  const { attributes } = result;

  // Map directory groups to application roles
  const roles = authService.mapGroupsToRoles(attributes.groups);
  
  // Get RBAC role objects
  const roleIds = rbacService.getRoleIdsFromKeys(roles);
  const isMaster = roleIds.includes('R001');
  const availableRoles = rbacService.getRolesFromIds(roleIds, isMaster);

  // Generate JWT token
  const token = authService.generateToken({
    userId: attributes.userId,
    email: attributes.email,
    displayName: attributes.displayName,
    roles: roleIds,
    authMethod: 'saml'
  });

  // Redirect back to app with token
  const returnUrl = RelayState || '/';
  res.redirect(`${returnUrl}?authSuccess=true&token=${encodeURIComponent(token)}`);
});
```

#### Step 16-18: Process Token in Frontend

**File**: `src/components/LoginForm.tsx`

```typescript
useEffect(() => {
  const { isSuccess, token, isLogout } = getAuthCallbackParams();
  
  if (isSuccess && token) {
    setLoading(true);
    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Store in context
      login(token, payload.roles?.[0] || 'employee', payload.userId, {
        assignedRoles: payload.roles || [],
        availableRoles: [],
        activeRole: undefined,
        isMaster: payload.roles?.includes('R001') || false,
      });
    } catch (err) {
      setError('Failed to process SSO login');
    } finally {
      clearAuthCallbackParams();  // Remove token from URL
      setLoading(false);
    }
  }
}, [login]);
```

---

## 7. Key Components Deep Dive

### 7.1 UnifiedAuthProvider

**File**: `src/lib/auth/auth-provider.ts`

The UnifiedAuthProvider acts as a facade that switches between mock and SAML providers:

```typescript
export class UnifiedAuthProvider implements AuthProvider {
  private authMode: AuthMode;
  private mockProvider: MockAuthProvider;
  private samlProvider: SamlAuthProvider | null;

  constructor(authMode, mfaConfig, groupRoleMapping, defaultRole) {
    this.authMode = authMode;
    this.mockProvider = createMockAuthProvider();
    
    if (mfaConfig.enabled) {
      this.samlProvider = createSamlAuthProvider(mfaConfig, groupRoleMapping, defaultRole);
    }
  }

  // Get active provider based on mode
  private getActiveProvider(): AuthProvider {
    if (this.isMfaAuth() && this.samlProvider) {
      return this.samlProvider;
    }
    return this.mockProvider;
  }

  // Delegate to active provider
  async initiateAuth(params) {
    return this.getActiveProvider().initiateAuth(params);
  }
}
```

### 7.2 MockAuthProvider

**File**: `src/lib/auth/mock-auth.ts`

Handles development authentication with mock user data:

```typescript
export class MockAuthProvider implements AuthProvider {
  readonly name = 'mock';

  async initiateAuth(params: AuthInitParams): Promise<AuthInitResult> {
    const { userId, password } = params;
    
    // Validate user
    const validatedUserId = extractUserId(userId || '');
    if (!validatedUserId) {
      return { success: false, error: 'Invalid user ID' };
    }

    // Get role information
    const roleIds = getUserRoleIds(validatedUserId);
    const availableRoles = getAvailableRoles(validatedUserId);
    
    return {
      success: true,
      authResult: {
        success: true,
        user: { userId: validatedUserId, ... },
        availableRoles,
        activeRole: availableRoles[0],
      }
    };
  }
}
```

### 7.3 SamlAuthProvider

**File**: `src/lib/auth/saml-auth.ts`

Handles SAML 2.0 authentication:

```typescript
export class SamlAuthProvider implements AuthProvider {
  readonly name = 'saml';
  private config: MfaAuthConfig;
  private roleMapper: RoleMapper;

  async initiateAuth(params): Promise<AuthInitResult> {
    // Generate AuthnRequest
    const requestId = this.generateRequestId();
    const authnRequest = this.buildAuthnRequest(requestId);
    const encodedRequest = this.encodeRequest(authnRequest);
    
    // Return redirect URL to IDP
    return {
      success: true,
      redirectUrl: this.buildRedirectUrl(encodedRequest, params.returnUrl),
      samlRequest: encodedRequest,
    };
  }

  async completeAuth(params): Promise<AuthCompleteResult> {
    const { samlResponse } = params;
    
    // Validate assertion
    const authResult = await this.validateAssertion(samlResponse);
    
    // Map groups to roles
    const roleMapping = this.roleMapper.mapGroupsToRoles(authResult.attributes.groups);
    
    return {
      success: true,
      user: { ... },
      availableRoles: roleMapping.availableRoles,
      activeRole: roleMapping.activeRole,
    };
  }
}
```

### 7.4 RoleMapper

**File**: `src/lib/auth/role-mapper.ts`

Maps directory groups to application roles:

```typescript
export class RoleMapper {
  private groupRoleMapping: GroupRoleMapping;
  private defaultRole: string;

  mapGroupsToRoles(groups: string[]): RoleMappingResult {
    const mappedRoles = new Set<string>();

    // Map each group to its roles
    for (const group of groups) {
      const roles = this.groupRoleMapping[group];
      if (roles) {
        roles.forEach(role => mappedRoles.add(role));
      }
    }

    // Apply default role if no matches
    if (mappedRoles.size === 0) {
      mappedRoles.add(this.defaultRole);
    }

    const roleKeys = Array.from(mappedRoles);
    const roleIds = this.roleKeysToRoleIds(roleKeys);
    const availableRoles = this.getRolesFromIds(roleIds);

    return {
      roles: roleKeys,
      roleIds,
      isMaster: roleIds.includes('R001'),
      availableRoles,
      activeRole: availableRoles[0],
    };
  }
}
```

---

## 8. Role Mapping System

### How Group-to-Role Mapping Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ROLE MAPPING FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  SAML Assertion                    Config Mapping                  App Roles
  (from IDP)                        (features.json)                 (Result)
       │                                  │                              │
       ▼                                  ▼                              ▼
┌─────────────────┐        ┌─────────────────────────┐        ┌─────────────┐
│ memberOf:       │        │ groupRoleMapping:       │        │ Mapped:     │
│ - CN=SSO_OPS,.. │───────>│   "CN=SSO_OPS,.." :     │───────>│ - employee  │
│ - CN=PAM_OPS,.. │        │     ["employee","sso"]  │        │ - sso_ops   │
│                 │        │   "CN=PAM_OPS,.." :     │        │ - pam_ops   │
│                 │        │     ["employee","pam"]  │        │             │
└─────────────────┘        └─────────────────────────┘        └─────────────┘
                                      │
                                      ▼
                           ┌─────────────────────────┐
                           │ No matches?             │
                           │ Use defaultRole:        │
                           │   "employee"            │
                           └─────────────────────────┘
```

### Configuration Example

```json
{
  "groupRoleMapping": {
    // Format: "Directory Group DN": ["role1", "role2"]
    
    // SSO Operations team gets employee + sso_ops roles
    "CN=SSO_OPS,OU=Groups,DC=company,DC=com": ["employee", "sso_ops"],
    
    // PAM Operations team gets employee + pam_ops roles
    "CN=PAM_OPS,OU=Groups,DC=company,DC=com": ["employee", "pam_ops"],
    
    // Master Operations team gets all roles (via "ops" master role)
    "CN=MASTER_OPS,OU=Groups,DC=company,DC=com": ["employee", "ops"]
  },
  
  // Default role for users with no matching groups
  "defaultRole": "employee"
}
```

---

## 9. How to Make Changes

### 9.1 Switch Auth Mode (No Code Changes)

**To enable SAML/MFA auth:**

```json
// backend/config/features.json
{
  "authMode": "USE_MFA_AUTH",  // ← Change this line
  "mfaAuth": {
    "enabled": true,           // ← Enable MFA config
    // ... configure SP/IDP ...
  }
}
```

**To switch back to mock auth:**

```json
{
  "authMode": "USE_MOCK_AUTH"  // ← Change back
}
```

### 9.2 Add a New Group-to-Role Mapping

```json
// backend/config/features.json
{
  "groupRoleMapping": {
    // Existing mappings...
    
    // Add new mapping:
    "CN=NEW_TEAM,OU=Groups,DC=company,DC=com": ["employee", "new_role"]
  }
}
```

### 9.3 Change SAML Attribute Names

If your IDP uses different attribute names:

```json
// backend/config/features.json
{
  "mfaAuth": {
    "attributeMapping": {
      "userId": "sAMAccountName",    // ← Change from "uid"
      "email": "userPrincipalName",  // ← Change from "mail"
      "displayName": "displayName",
      "groups": "memberOf"
    }
  }
}
```

### 9.4 Add New Auth Provider (e.g., OAuth)

1. **Create provider file**: `src/lib/auth/oauth-auth.ts`

```typescript
export class OAuthAuthProvider implements AuthProvider {
  readonly name = 'oauth';
  
  async initiateAuth(params): Promise<AuthInitResult> {
    // Build OAuth authorization URL
    // Return redirect URL
  }
  
  async completeAuth(params): Promise<AuthCompleteResult> {
    // Exchange code for token
    // Get user info
    // Map to roles
  }
}
```

2. **Update auth-provider.ts** to include new provider:

```typescript
export class UnifiedAuthProvider {
  private oauthProvider: OAuthAuthProvider | null;
  
  constructor(authMode, mfaConfig, oauthConfig, ...) {
    if (oauthConfig?.enabled) {
      this.oauthProvider = new OAuthAuthProvider(oauthConfig);
    }
  }
}
```

3. **Add new auth mode** to `auth.config.ts`:

```typescript
export type AuthMode = 'USE_MOCK_AUTH' | 'USE_MFA_AUTH' | 'USE_OAUTH_AUTH';
```

### 9.5 Customize Login Form Appearance

**File**: `src/components/LoginForm.tsx`

```tsx
{isMfaAuth ? (
  // Customize SSO button
  <Button 
    onClick={handleSSOLogin}
    className="custom-sso-button"
  >
    <CompanyLogo />
    {ssoT.button || 'Sign in with Corporate SSO'}
  </Button>
) : (
  // Customize mock form
  <form>...</form>
)}
```

### 9.6 Add i18n Translations

**File**: `src/config/labels/login.json`

```json
{
  "sso": {
    "button": "Sign in with SSO",
    "description": "Sign in with your corporate credentials.",
    "redirecting": "Redirecting to SSO...",
    "mfaNote": "You may be prompted for MFA.",
    "error": "SSO authentication failed."
  }
}
```

---

## 10. Testing

### 10.1 Test Mock Auth Mode

```bash
# 1. Ensure mock mode is enabled
# backend/config/features.json: "authMode": "USE_MOCK_AUTH"

# 2. Start the app
npm run dev

# 3. Test login with different users
# u1001 - Master user (all roles)
# u1002 - IAM Engineering
# u1003 - IAM Ops
# ... etc
```

### 10.2 Test SAML Flow (Without Real IDP)

You can test the SAML flow structure without a real IDP:

```bash
# 1. Enable MFA mode
# backend/config/features.json: "authMode": "USE_MFA_AUTH"

# 2. Start the app
npm run dev

# 3. Click "Sign in with SSO"
# You'll be redirected to the configured IDP URL (will fail without real IDP)

# 4. Check the redirect URL contains:
# - SAMLRequest parameter (base64 encoded)
# - RelayState parameter (return URL)
```

### 10.3 Test with Mock IDP (Recommended for Development)

For full SAML testing without a real IDP, you can use:

- **SimpleSAMLphp** - PHP-based test IDP
- **Keycloak** - Full-featured open-source IDP
- **Okta Developer** - Free developer account

### 10.4 Unit Test Role Mapping

```typescript
// Example test
import { RoleMapper } from '@/lib/auth/role-mapper';

describe('RoleMapper', () => {
  const mapping = {
    'CN=SSO_OPS,OU=Groups': ['employee', 'sso_ops'],
  };
  
  it('maps groups to roles', () => {
    const mapper = new RoleMapper(mapping, 'employee');
    const result = mapper.mapGroupsToRoles(['CN=SSO_OPS,OU=Groups']);
    
    expect(result.roles).toContain('sso_ops');
  });
  
  it('uses default role when no groups match', () => {
    const mapper = new RoleMapper(mapping, 'employee');
    const result = mapper.mapGroupsToRoles(['CN=UNKNOWN']);
    
    expect(result.roles).toEqual(['employee']);
  });
});
```

---

## 11. Troubleshooting

### Problem: "SAML authentication is not enabled"

**Cause**: Auth mode is set to mock but SSO login was attempted.

**Solution**:
```json
// backend/config/features.json
{
  "authMode": "USE_MFA_AUTH"  // Ensure this is set
}
```

### Problem: SSO redirects but IDP returns error

**Cause**: SP configuration doesn't match IDP settings.

**Solution**: Verify these match your IDP configuration:
```json
{
  "mfaAuth": {
    "serviceProvider": {
      "entityId": "must-match-idp-sp-config",
      "assertionConsumerServiceUrl": "must-match-idp-acs-config"
    }
  }
}
```

### Problem: User has no roles after SAML login

**Cause**: Group names don't match mapping configuration.

**Debug**:
1. Check SAML assertion for actual group values
2. Compare with `groupRoleMapping` keys
3. Group DNs are case-sensitive!

**Solution**: Update mapping to match actual group DNs:
```json
{
  "groupRoleMapping": {
    "cn=sso_ops,ou=groups,dc=company,dc=com": ["employee", "sso_ops"]
  }
}
```

### Problem: Token not being stored after SSO callback

**Cause**: URL parsing issue or CORS problem.

**Debug**:
1. Check browser console for errors
2. Verify callback URL has `authSuccess=true&token=...`
3. Check for CORS errors

**Solution**: Ensure callback processes correctly:
```typescript
// LoginForm.tsx
useEffect(() => {
  const { isSuccess, token } = getAuthCallbackParams();
  console.log('Auth callback:', { isSuccess, hasToken: !!token });
  // ...
}, []);
```

---

## 12. Security Considerations

### 12.1 Production Checklist

| Item | Status | Notes |
|------|--------|-------|
| ☐ | HTTPS enabled | All auth endpoints must use HTTPS |
| ☐ | IDP certificate installed | Required for signature validation |
| ☐ | JWT secret is secure | Use 32+ character random string |
| ☐ | Private keys not in repo | Use environment variables or secrets manager |
| ☐ | Session timeout configured | Default: 8 hours |
| ☐ | CORS properly configured | Restrict to known origins |

### 12.2 SAML Assertion Validation

The current implementation has **simplified** assertion parsing. For production, enable full validation:

```javascript
// backend/routes/saml.js - Production enhancements needed:

// 1. Signature validation
// 2. Certificate chain verification
// 3. NotBefore/NotOnOrAfter time checks
// 4. Audience restriction validation
// 5. Replay prevention (track assertion IDs)

// Recommended: Use @node-saml/passport-saml library
const { SAML } = require('@node-saml/passport-saml');
```

### 12.3 Token Handling

```typescript
// Never log tokens
console.log('User logged in:', userId);  // ✓ Good
console.log('Token:', token);            // ✗ Bad

// Clear tokens from URL after processing
clearAuthCallbackParams();

// Store tokens securely (HttpOnly cookies preferred over localStorage)
```

---

## Appendix: Quick Reference

### File Quick Reference

| What You Need | File Location |
|---------------|---------------|
| Change auth mode | `backend/config/features.json` → `authMode` |
| Add group mapping | `backend/config/features.json` → `groupRoleMapping` |
| Change IDP settings | `backend/config/features.json` → `mfaAuth.identityProvider` |
| Change SP settings | `backend/config/features.json` → `mfaAuth.serviceProvider` |
| Modify login UI | `src/components/LoginForm.tsx` |
| Change auth hook logic | `src/hooks/useAuthMode.ts` |
| Change role mapping logic | `src/lib/auth/role-mapper.ts` |
| Modify SAML flow | `backend/routes/saml.js` |
| Change JWT settings | `backend/services/authService.js` |

### Environment Variables

```env
# Production environment variables
AUTH_MODE=USE_MFA_AUTH
JWT_SECRET=<32-char-random-string>
JWT_EXPIRY=24h
SAML_SP_ENTITY_ID=https://your-app.com
SAML_IDP_SSO_URL=https://your-idp.com/sso
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Mock authentication |
| `/api/saml/login` | GET | Initiate SAML SSO |
| `/api/saml/acs` | POST | SAML assertion consumer |
| `/api/saml/logout` | GET | Initiate SAML logout |
| `/api/saml/slo` | POST | SAML logout callback |
| `/api/saml/metadata` | GET | SP metadata for IDP |
| `/api/config/features` | GET | Get auth configuration |

---

*End of Developer Guide*
