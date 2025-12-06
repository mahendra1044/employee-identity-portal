# Authentication & MFA Integration Requirements

| Document ID | REQ-AUTH-001 |
|-------------|--------------|
| Version | 1.0 |
| Status | Draft |
| Author | Development Team |
| Created | December 3, 2025 |
| Last Updated | December 3, 2025 |

---

## 1. Executive Summary

This document defines the requirements for enabling the Employee Identity Portal with SAML-based Multi-Factor Authentication (MFA) using Ping Federate as the Identity Provider (IDP), while maintaining backward compatibility with the existing mock authentication flow for development and testing purposes.

---

## 2. Background & Context

### 2.1 Current State
The Employee Identity Portal currently uses a mock authentication system where:
- Users enter a userId (e.g., `u1001`)
- The system validates against mock user data
- Roles are assigned based on mock data configuration

### 2.2 Target State
Enable production-grade authentication with:
- SAML 2.0 protocol integration
- Ping Federate as the Identity Provider
- Mandatory MFA enforcement
- SSO (Single Sign-On) capability
- Role assignment based on directory group membership

### 2.3 Infrastructure Components

| Component | System | Purpose |
|-----------|--------|---------|
| Identity Provider (IDP) | Ping Federate | Authentication, MFA, SSO, Policy enforcement |
| Attribute Store | Ping Directory | User profiles, SSO credentials, group memberships |
| Policy Store | Ping Federate | Authorization grants, access policies |
| Service Provider (SP) | Employee Identity Portal | This application |

---

## 3. Authentication Modes

The application shall support two authentication modes, controlled via configuration toggle:

| Mode | Configuration Value | Description | Use Case |
|------|---------------------|-------------|----------|
| **Mock Authentication** | `USE_MOCK_AUTH` | Current userId-based login flow using mock data | Development, Testing, Demo |
| **MFA Authentication** | `USE_MFA_AUTH` | Production SSO login with SAML + MFA via Ping Federate | Production, Staging |

---

## 4. Functional Requirements

### 4.1 Authentication Mode Configuration

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| FR-AUTH-001 | The system shall provide a configuration property `AUTH_MODE` to toggle between `USE_MOCK_AUTH` and `USE_MFA_AUTH` | High |
| FR-AUTH-002 | The configuration shall be defined in both frontend (`features.config.ts`) and backend (`features.json`) | High |
| FR-AUTH-003 | The backend configuration shall be the source of truth for authentication mode at runtime | High |
| FR-AUTH-004 | Changing authentication mode shall require only configuration change, no code modifications | High |

---

### 4.2 Mock Authentication Flow (USE_MOCK_AUTH)

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| FR-MOCK-001 | When `AUTH_MODE = 'USE_MOCK_AUTH'`, the login page shall display userId input field | High |
| FR-MOCK-002 | System shall validate userId against mock user data stored in `backend/mocks/` | High |
| FR-MOCK-003 | Upon successful validation, system shall return JWT token containing user roles | High |
| FR-MOCK-004 | Mock authentication shall not require external IDP connectivity | High |
| FR-MOCK-005 | Mock authentication shall remain the default mode for development environments | Medium |

**Mock Authentication Flow:**

```
┌──────────────────────────────────────────────────────────────────┐
│                     MOCK AUTHENTICATION FLOW                      │
└──────────────────────────────────────────────────────────────────┘

  User                    Frontend                   Backend
   │                         │                          │
   │  1. Enter userId        │                          │
   │────────────────────────>│                          │
   │                         │                          │
   │                         │  2. POST /api/auth/login │
   │                         │  { userId: "u1001" }     │
   │                         │─────────────────────────>│
   │                         │                          │
   │                         │                          │ 3. Validate against
   │                         │                          │    mock user data
   │                         │                          │
   │                         │                          │ 4. Load roles from
   │                         │                          │    mock configuration
   │                         │                          │
   │                         │  5. Return JWT + Roles   │
   │                         │<─────────────────────────│
   │                         │                          │
   │  6. Login Success       │                          │
   │  Show role switcher     │                          │
   │<────────────────────────│                          │
   │                         │                          │
```

---

### 4.3 MFA Authentication Flow (USE_MFA_AUTH)

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| FR-MFA-001 | When `AUTH_MODE = 'USE_MFA_AUTH'`, the login page shall display "Sign in with SSO" button | High |
| FR-MFA-002 | Clicking SSO login shall redirect user to Ping Federate IDP login page | High |
| FR-MFA-003 | User shall authenticate with SSO credentials (SSO ID + Password) at IDP | High |
| FR-MFA-004 | MFA challenge shall be mandatory and enforced by the IDP | High |
| FR-MFA-005 | Upon successful MFA, IDP shall return SAML assertion to application's ACS URL | High |
| FR-MFA-006 | Application shall validate SAML assertion signature using IDP certificate | High |
| FR-MFA-007 | Application shall extract user attributes from SAML assertion | High |
| FR-MFA-008 | Application shall establish user session and return JWT token | High |
| FR-MFA-009 | Application shall support Single Logout (SLO) via SAML | Medium |

**MFA/SAML Authentication Flow:**

```
┌──────────────────────────────────────────────────────────────────┐
│                    MFA/SAML AUTHENTICATION FLOW                   │
└──────────────────────────────────────────────────────────────────┘

  User          Frontend          Backend          Ping Federate
   │               │                 │                   │
   │ 1. Click      │                 │                   │
   │ "SSO Login"   │                 │                   │
   │──────────────>│                 │                   │
   │               │                 │                   │
   │               │ 2. GET /api/auth/saml/login         │
   │               │────────────────>│                   │
   │               │                 │                   │
   │               │                 │ 3. Generate SAML  │
   │               │                 │    AuthnRequest   │
   │               │                 │                   │
   │               │ 4. Redirect to IDP SSO URL          │
   │<──────────────│<────────────────│                   │
   │               │                 │                   │
   │ 5. SSO Login Page                                   │
   │────────────────────────────────────────────────────>│
   │               │                 │                   │
   │ 6. Enter SSO ID + Password                          │
   │────────────────────────────────────────────────────>│
   │               │                 │                   │
   │ 7. MFA Challenge (Push/OTP/SMS)                     │
   │<────────────────────────────────────────────────────│
   │               │                 │                   │
   │ 8. Complete MFA                                     │
   │────────────────────────────────────────────────────>│
   │               │                 │                   │
   │               │                 │  9. SAML Assertion│
   │               │ 10. POST /api/auth/saml/callback    │
   │<────────────────────────────────────────────────────│
   │               │────────────────>│                   │
   │               │                 │                   │
   │               │                 │ 11. Validate      │
   │               │                 │     Assertion     │
   │               │                 │                   │
   │               │                 │ 12. Extract       │
   │               │                 │     Attributes    │
   │               │                 │                   │
   │               │                 │ 13. Map Groups    │
   │               │                 │     to Roles      │
   │               │                 │                   │
   │               │ 14. JWT + Roles │                   │
   │               │<────────────────│                   │
   │               │                 │                   │
   │ 15. Login Success               │                   │
   │ Show role switcher              │                   │
   │<──────────────│                 │                   │
   │               │                 │                   │
```

---

### 4.4 Role Mapping from Directory Groups

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| FR-ROLE-001 | Post-authentication, system shall retrieve user's group memberships from SAML assertion | High |
| FR-ROLE-002 | System shall map directory groups to application roles using configurable mapping | High |
| FR-ROLE-003 | Users with no matching groups shall be assigned default `employee` role | High |
| FR-ROLE-004 | Role switcher shall display only roles assigned to the authenticated user | High |
| FR-ROLE-005 | Group-to-role mapping shall be configurable without code changes | Medium |

**Group-to-Role Mapping Table:**

| Directory Group (DN) | Assigned Application Roles | Description |
|----------------------|---------------------------|-------------|
| `CN=SSO_OPS,OU=Groups,DC=company,DC=com` | `employee`, `sso_ops` | SSO Operations team |
| `CN=PAM_OPS,OU=Groups,DC=company,DC=com` | `employee`, `pam_ops` | PAM Operations team |
| `CN=IGA_OPS,OU=Groups,DC=company,DC=com` | `employee`, `iga_ops` | IGA Operations team |
| `CN=ENTRAID_OPS,OU=Groups,DC=company,DC=com` | `employee`, `entraid_ops` | Entra ID Operations team |
| `CN=TPAG_OPS,OU=Groups,DC=company,DC=com` | `employee`, `tpag_ops` | TPAG Operations team |
| `CN=MASTER_OPS,OU=Groups,DC=company,DC=com` | `employee`, `ops` | Master Operations (all systems) |
| *(No matching groups)* | `employee` | Default role for all users |

---

## 5. Configuration Specification

### 5.1 Authentication Configuration Structure

```typescript
/**
 * Authentication Mode Type
 */
type AuthMode = 'USE_MOCK_AUTH' | 'USE_MFA_AUTH';

/**
 * Authentication Configuration Interface
 */
interface AuthConfig {
  /** Active authentication mode */
  authMode: AuthMode;
  
  /** Mock authentication settings */
  mockAuth: {
    enabled: boolean;
    defaultUserId: string;
  };
  
  /** MFA/SAML authentication settings */
  mfaAuth: {
    enabled: boolean;
    protocol: 'SAML';
    serviceProvider: ServiceProviderConfig;
    identityProvider: IdentityProviderConfig;
    attributeMapping: AttributeMappingConfig;
  };
  
  /** Group to role mapping */
  groupRoleMapping: Record<string, string[]>;
  
  /** Default role when no groups match */
  defaultRole: string;
}
```

### 5.2 Service Provider Configuration

```typescript
interface ServiceProviderConfig {
  /** Unique identifier for this application */
  entityId: string;
  
  /** URL where IDP sends SAML assertions (ACS) */
  assertionConsumerServiceUrl: string;
  
  /** URL for Single Logout */
  singleLogoutUrl: string;
  
  /** SP private key for signing requests */
  privateKeyPath?: string;
  
  /** SP certificate for IDP to encrypt assertions */
  certificatePath?: string;
}
```

### 5.3 Identity Provider Configuration

```typescript
interface IdentityProviderConfig {
  /** IDP unique identifier */
  entityId: string;
  
  /** IDP SSO endpoint URL */
  ssoUrl: string;
  
  /** IDP Single Logout endpoint URL */
  sloUrl: string;
  
  /** IDP certificate for validating signatures */
  certificatePath: string;
}
```

### 5.4 Attribute Mapping Configuration

```typescript
interface AttributeMappingConfig {
  /** SAML attribute containing user ID */
  userId: string;       // e.g., 'uid', 'sAMAccountName'
  
  /** SAML attribute containing email */
  email: string;        // e.g., 'mail'
  
  /** SAML attribute containing display name */
  displayName: string;  // e.g., 'cn', 'displayName'
  
  /** SAML attribute containing group memberships */
  groups: string;       // e.g., 'memberOf'
}
```

### 5.5 Sample Backend Configuration (features.json)

```json
{
  "authMode": "USE_MOCK_AUTH",
  
  "mockAuth": {
    "enabled": true,
    "defaultUserId": "u1001"
  },
  
  "mfaAuth": {
    "enabled": false,
    "protocol": "SAML",
    "serviceProvider": {
      "entityId": "https://identity-portal.company.com",
      "assertionConsumerServiceUrl": "https://identity-portal.company.com/api/auth/saml/callback",
      "singleLogoutUrl": "https://identity-portal.company.com/api/auth/saml/logout"
    },
    "identityProvider": {
      "entityId": "https://sso.company.com",
      "ssoUrl": "https://sso.company.com/idp/SSO.saml2",
      "sloUrl": "https://sso.company.com/idp/SLO.saml2"
    },
    "attributeMapping": {
      "userId": "uid",
      "email": "mail",
      "displayName": "cn",
      "groups": "memberOf"
    }
  },
  
  "groupRoleMapping": {
    "CN=SSO_OPS,OU=Groups,DC=company,DC=com": ["employee", "sso_ops"],
    "CN=PAM_OPS,OU=Groups,DC=company,DC=com": ["employee", "pam_ops"],
    "CN=IGA_OPS,OU=Groups,DC=company,DC=com": ["employee", "iga_ops"],
    "CN=ENTRAID_OPS,OU=Groups,DC=company,DC=com": ["employee", "entraid_ops"],
    "CN=TPAG_OPS,OU=Groups,DC=company,DC=com": ["employee", "tpag_ops"],
    "CN=MASTER_OPS,OU=Groups,DC=company,DC=com": ["employee", "ops"]
  },
  
  "defaultRole": "employee"
}
```

---

## 6. Module Structure & Design

### 6.1 Design Principles

| Principle | Description |
|-----------|-------------|
| **Modularity** | Authentication logic separated into distinct modules for each auth type |
| **Configuration-Driven** | Auth mode switching via configuration, no code changes required |
| **Single Responsibility** | Each module handles one concern (SAML, mock, role mapping) |
| **Extensibility** | Easy to add new auth methods (OAuth, OIDC) in future |
| **Testability** | Mock auth enables testing without IDP dependency |

### 6.2 Proposed Directory Structure

```
src/
├── config/
│   ├── auth.config.ts              # Auth configuration types & defaults
│   ├── features.config.ts          # Feature flags (includes AUTH_MODE)
│   └── index.ts                    # Re-export all configs
│
├── lib/
│   └── auth/
│       ├── index.ts                # Auth module exports
│       ├── types.ts                # Auth-related TypeScript types
│       ├── auth-provider.ts        # Main auth provider (mode switcher)
│       ├── mock-auth.ts            # Mock authentication implementation
│       ├── saml-auth.ts            # SAML authentication implementation
│       └── role-mapper.ts          # Group-to-role mapping logic
│
├── app/
│   └── api/
│       └── auth/
│           ├── login/
│           │   └── route.ts        # Mock login endpoint
│           ├── saml/
│           │   ├── login/
│           │   │   └── route.ts    # Initiate SAML login (redirect to IDP)
│           │   ├── callback/
│           │   │   └── route.ts    # Handle SAML assertion (ACS)
│           │   ├── logout/
│           │   │   └── route.ts    # Initiate SAML logout (SLO)
│           │   └── metadata/
│           │       └── route.ts    # SP metadata endpoint for IDP config
│           └── session/
│               └── route.ts        # Get current session/user info
│
backend/
├── config/
│   ├── features.json               # Runtime feature configuration
│   ├── roles.json                  # Role definitions & permissions
│   └── saml/                       # SAML certificates (gitignored)
│       ├── sp-certificate.pem      # Service Provider certificate
│       ├── sp-private-key.pem      # Service Provider private key
│       └── idp-certificate.pem     # Identity Provider certificate
│
├── middleware/
│   └── auth.js                     # Auth middleware (mode-aware)
│
└── services/
    └── auth/
        ├── index.js                # Auth service exports
        ├── mock-auth.js            # Mock auth service
        ├── saml-auth.js            # SAML auth service
        └── role-mapper.js          # Group-to-role mapping service
```

---

## 7. Security Requirements

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| SR-001 | SAML assertions shall be validated for digital signature using IDP certificate | High |
| SR-002 | SAML assertions shall be validated for expiry (NotOnOrAfter condition) | High |
| SR-003 | SAML assertions shall be validated for audience restriction (must match SP Entity ID) | High |
| SR-004 | System shall implement replay prevention by tracking assertion IDs | High |
| SR-005 | Private keys shall be stored securely (environment variables or encrypted files) | High |
| SR-006 | Private keys shall never be committed to source control | High |
| SR-007 | JWT tokens shall include user ID, display name, email, roles, and expiry | High |
| SR-008 | Session timeout shall be configurable | Medium |
| SR-009 | Single Logout (SLO) shall invalidate session at both SP and IDP | Medium |
| SR-010 | All authentication endpoints shall use HTTPS in production | High |

---

## 8. Environment Variables

### 8.1 Development Environment (.env.local)

```env
# Authentication Mode
AUTH_MODE=USE_MOCK_AUTH
```

### 8.2 Production Environment

```env
# Authentication Mode
AUTH_MODE=USE_MFA_AUTH

# Service Provider (This Application)
SAML_SP_ENTITY_ID=https://identity-portal.company.com
SAML_SP_ACS_URL=https://identity-portal.company.com/api/auth/saml/callback
SAML_SP_SLO_URL=https://identity-portal.company.com/api/auth/saml/logout
SAML_SP_PRIVATE_KEY_PATH=/secrets/sp-private-key.pem
SAML_SP_CERTIFICATE_PATH=/secrets/sp-certificate.pem

# Identity Provider (Ping Federate)
SAML_IDP_ENTITY_ID=https://sso.company.com
SAML_IDP_SSO_URL=https://sso.company.com/idp/SSO.saml2
SAML_IDP_SLO_URL=https://sso.company.com/idp/SLO.saml2
SAML_IDP_CERTIFICATE_PATH=/secrets/idp-certificate.pem

# Session Configuration
SESSION_SECRET=<secure-random-string-min-32-chars>
SESSION_TIMEOUT_MINUTES=480

# JWT Configuration
JWT_SECRET=<secure-random-string-min-32-chars>
JWT_EXPIRY_HOURS=8
```

---

## 9. Implementation Phases

| Phase | Name | Scope | Deliverables | Dependencies |
|-------|------|-------|--------------|--------------|
| **Phase 1** | Current State | Mock Authentication | ✅ Existing userId-based login | None |
| **Phase 2** | Configuration Setup | Auth configuration & toggle | `auth.config.ts`, `AUTH_MODE` flag, refactored login components | Phase 1 |
| **Phase 3** | SAML Integration | SAML authentication flow | SAML endpoints, assertion validation, IDP integration | Phase 2, IDP setup |
| **Phase 4** | Role Mapping | Group-based role assignment | Role mapper service, group extraction from SAML | Phase 3 |
| **Phase 5** | Security & Testing | Hardening & validation | Security audit, penetration testing, SLO implementation | Phase 4 |

---

## 10. Dependencies

### 10.1 NPM Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `@node-saml/passport-saml` | ^4.x | SAML 2.0 authentication for Node.js |
| `passport` | ^0.7.x | Authentication middleware |
| `express-session` | ^1.x | Session management |
| `jsonwebtoken` | ^9.x | JWT token generation & validation |

### 10.2 External Dependencies

| Dependency | Provider | Purpose |
|------------|----------|---------|
| Ping Federate Server | IT/Security Team | Identity Provider, MFA enforcement |
| Ping Directory | IT/Security Team | User attributes, group memberships |
| SSL Certificates | IT/Security Team | SP and IDP certificates |
| DNS Configuration | IT/Infrastructure | SP metadata URL accessibility |

---

## 11. Acceptance Criteria

| AC ID | Criteria | Test Method |
|-------|----------|-------------|
| AC-001 | When `AUTH_MODE = 'USE_MOCK_AUTH'`, existing login flow works unchanged | Manual/Automated Testing |
| AC-002 | When `AUTH_MODE = 'USE_MFA_AUTH'`, user is redirected to Ping Federate | Manual Testing |
| AC-003 | MFA is enforced by IDP before returning SAML assertion | Manual Testing |
| AC-004 | SAML assertion signature is validated | Automated Testing |
| AC-005 | User attributes are correctly extracted from SAML assertion | Automated Testing |
| AC-006 | User roles are correctly assigned based on group membership | Automated Testing |
| AC-007 | Role switcher displays only user's assigned roles | Manual Testing |
| AC-008 | Single Logout terminates session at both SP and IDP | Manual Testing |
| AC-009 | Configuration change between auth modes requires no code changes | Manual Verification |
| AC-010 | Invalid SAML assertions are rejected with appropriate error | Security Testing |

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **IDP** | Identity Provider - The system that authenticates users (Ping Federate) |
| **SP** | Service Provider - This application that relies on IDP for authentication |
| **SAML** | Security Assertion Markup Language - XML-based protocol for SSO |
| **MFA** | Multi-Factor Authentication - Requires multiple forms of verification |
| **SSO** | Single Sign-On - One login grants access to multiple applications |
| **ACS** | Assertion Consumer Service - SP endpoint that receives SAML assertions |
| **SLO** | Single Logout - Logout propagates to all SSO-connected applications |
| **JWT** | JSON Web Token - Compact token format for secure claims transmission |

---

## 13. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 3, 2025 | Development Team | Initial draft |

---

## 14. Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| Security Lead | | | |
| QA Lead | | | |
