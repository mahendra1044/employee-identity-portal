# Mock IDP Testing Guide

A step-by-step guide for testing SAML SSO authentication with the built-in Mock Identity Provider.

---

## Table of Contents

1. [Overview](#overview)
2. [Mock IDP Flow Diagram](#mock-idp-flow-diagram)
3. [How Mock IDP Works](#how-mock-idp-works)
4. [Enable Mock IDP & MFA Auth](#enable-mock-idp--mfa-auth)
5. [Test the SSO Login Flow](#test-the-sso-login-flow)
6. [Revert to Regular Mock Login](#revert-to-regular-mock-login)
7. [Test Users Reference](#test-users-reference)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Mock IDP is a built-in testing tool that simulates a real SAML Identity Provider (like Ping Federate, Okta, or Azure AD). It allows developers to test the complete SAML SSO flow without needing access to a real IDP.

### Key Features
- ✅ Full SAML 2.0 SSO flow simulation
- ✅ Pre-configured test users with different roles
- ✅ Optional MFA simulation step
- ✅ Beautiful login page UI
- ✅ Easy enable/disable via configuration
- ✅ Zero external dependencies

---

## Mock IDP Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOCK IDP AUTHENTICATION FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐         ┌──────────────┐         ┌──────────────┐
    │  User    │         │   Frontend   │         │   Backend    │
    │ Browser  │         │  (Next.js)   │         │  (Express)   │
    └────┬─────┘         └──────┬───────┘         └──────┬───────┘
         │                      │                        │
         │  1. Click "SSO"      │                        │
         │─────────────────────>│                        │
         │                      │                        │
         │  2. Redirect to /api/saml/login              │
         │<─────────────────────│                        │
         │                      │                        │
         │  3. GET /api/saml/login                       │
         │──────────────────────────────────────────────>│
         │                      │                        │
         │                      │    4. Build SAML Request
         │                      │    5. Check: mockIdp.enabled?
         │                      │       YES → Use Mock IDP URL
         │                      │       NO  → Use Real IDP URL
         │                      │                        │
         │  6. 302 Redirect to Mock IDP SSO URL          │
         │<──────────────────────────────────────────────│
         │                      │                        │
    ┌────┴─────────────────────────────────────────────────────┐
    │                      MOCK IDP                            │
    │  ┌────────────────────────────────────────────────────┐  │
    │  │  7. Display Login Page                             │  │
    │  │     - Username/Password form                       │  │
    │  │     - Quick login buttons for test users           │  │
    │  └────────────────────────────────────────────────────┘  │
    │                          │                               │
    │  8. User enters credentials (or clicks quick login)      │
    │                          │                               │
    │  ┌────────────────────────────────────────────────────┐  │
    │  │  9. Validate Credentials                           │  │
    │  │     - Check user exists in MOCK_IDP_USERS          │  │
    │  │     - Verify password (all passwords = "demo")     │  │
    │  └────────────────────────────────────────────────────┘  │
    │                          │                               │
    │  ┌────────────────────────────────────────────────────┐  │
    │  │  10. MFA Simulation (if enabled)                   │  │
    │  │      - Show MFA challenge page                     │  │
    │  │      - User clicks "Approve MFA"                   │  │
    │  └────────────────────────────────────────────────────┘  │
    │                          │                               │
    │  ┌────────────────────────────────────────────────────┐  │
    │  │  11. Generate SAML Response                        │  │
    │  │      - Create SAML Assertion with:                 │  │
    │  │        • User ID (uid)                             │  │
    │  │        • Email (mail)                              │  │
    │  │        • Display Name (cn)                         │  │
    │  │        • Groups (memberOf)                         │  │
    │  │      - Base64 encode response                      │  │
    │  └────────────────────────────────────────────────────┘  │
    │                          │                               │
    └──────────────────────────┼───────────────────────────────┘
                               │
         │  12. Auto-POST SAML Response to ACS               │
         │──────────────────────────────────────────────────>│
         │                      │                        │
         │                      │    13. Parse SAML Response
         │                      │    14. Extract user attributes
         │                      │    15. Map groups → roles
         │                      │    16. Generate JWT token
         │                      │                        │
         │  17. Set auth cookie + Redirect to app            │
         │<──────────────────────────────────────────────────│
         │                      │                        │
         │  18. Load app with authenticated session          │
         │─────────────────────>│                        │
         │                      │                        │
    ┌────┴─────┐         ┌──────┴───────┐         ┌──────┴───────┐
    │  User    │         │   Frontend   │         │   Backend    │
    │ Logged In│         │  Shows User  │         │  Validates   │
    └──────────┘         └──────────────┘         └──────────────┘
```

---

## How Mock IDP Works

### 1. Authentication Initiation
When the user clicks "Sign in with SSO", the frontend redirects to `/api/saml/login`.

### 2. SAML Request Generation
The backend generates a SAML AuthnRequest containing:
- Request ID (for response correlation)
- SP Entity ID (our application identifier)
- Assertion Consumer Service URL (where to send the response)

### 3. IDP Selection
The backend checks `features.mockIdp.enabled`:
- **If true** → Redirects to Mock IDP (`/api/mock-idp/sso`)
- **If false** → Redirects to real IDP URL from `features.mfaAuth.identityProvider.ssoUrl`

### 4. Mock IDP Login Page
The Mock IDP displays a login form with:
- Username/password fields
- Quick-login buttons for each test user
- MFA simulation notice (if enabled)

### 5. Credential Validation
Mock IDP validates against `MOCK_IDP_USERS` in `backend/mock-idp/config.js`.
All test users have password: **`demo`**

### 6. MFA Simulation (Optional)
If `mockIdp.simulateMfa: true`, shows an MFA challenge page that the user must "approve".

### 7. SAML Response Generation
Mock IDP creates a SAML Response containing:
- User attributes (uid, email, displayName)
- Group memberships (for role mapping)
- Timestamps and session info

### 8. Response Delivery
An auto-submitting HTML form POSTs the SAML Response to the backend's Assertion Consumer Service (ACS).

### 9. Token Creation
The backend:
- Parses the SAML Response
- Extracts user attributes
- Maps groups to application roles
- Creates a JWT session token
- Sets authentication cookie

### 10. Authenticated Session
User is redirected to the application with full authentication.

---

## Enable Mock IDP & MFA Auth

### Step 1: Edit Configuration File

Open `backend/config/features.json` and make these changes:

```json
{
  "authMode": "USE_MFA_AUTH",
  
  "mockAuth": {
    "enabled": false,
    "defaultUserId": "u1001"
  },
  
  "mockIdp": {
    "enabled": true,
    "simulateMfa": true,
    "entityId": "https://mock-idp.identity-portal.local",
    "ssoUrl": "http://localhost:3001/api/mock-idp/sso",
    "sloUrl": "http://localhost:3001/api/mock-idp/slo",
    "metadataUrl": "http://localhost:3001/api/mock-idp/metadata"
  },
  
  "mfaAuth": {
    "enabled": true,
    ...
  }
}
```

### Step 2: Key Configuration Changes

| Setting | Value | Description |
|---------|-------|-------------|
| `authMode` | `"USE_MFA_AUTH"` | Switches from mock auth to SAML auth |
| `mockAuth.enabled` | `false` | Disables the simple mock login |
| `mockIdp.enabled` | `true` | Enables the Mock IDP |
| `mockIdp.simulateMfa` | `true` | Shows MFA step (set `false` to skip) |

### Step 3: Restart the Application

```powershell
# Stop any running servers (Ctrl+C)

# Start backend
cd backend
npm start

# In another terminal, start frontend
cd ..
npm run dev
```

### Step 4: Verify Mock IDP is Running

You should see this in the backend console:

```
═══════════════════════════════════════════════════════════════
  🔐 Mock Identity Provider - Starting
═══════════════════════════════════════════════════════════════
  Entity ID: https://mock-idp.identity-portal.local
  SSO URL:   http://localhost:3001/api/mock-idp/sso
  SLO URL:   http://localhost:3001/api/mock-idp/slo
  MFA Sim:   Enabled
  Test Users:
    - u1001: Sarah Chen (Master Admin)
    - u1002: Michael Torres (IAM Engineering)
    ...
═══════════════════════════════════════════════════════════════
```

---

## Test the SSO Login Flow

### Step 1: Open the Application

Navigate to `http://localhost:3000` in your browser.

### Step 2: Initiate SSO Login

Click the **"Sign in with SSO"** button (or SAML login option).

### Step 3: Mock IDP Login Page

You'll be redirected to the Mock IDP login page:

![Mock IDP Login](./images/mock-idp-login.png)

**Option A: Quick Login**
- Click any of the pre-configured user buttons
- This auto-fills credentials and submits

**Option B: Manual Login**
- Enter User ID (e.g., `u1001`)
- Enter Password: `demo`
- Click "Sign In with SSO"

### Step 4: MFA Challenge (if enabled)

If `simulateMfa: true`, you'll see an MFA simulation page:

- Click **"Approve MFA (Simulated)"** to continue

### Step 5: Authenticated!

You'll be redirected back to the application, now logged in as the selected user with their roles.

### Step 6: Verify User Info

Check the user avatar/name in the header to confirm you're logged in as the correct user with appropriate permissions.

---

## Revert to Regular Mock Login

To switch back to the simple development mock login (no SSO flow):

### Step 1: Edit Configuration File

Open `backend/config/features.json` and change:

```json
{
  "authMode": "USE_MOCK_AUTH",
  
  "mockAuth": {
    "enabled": true,
    "defaultUserId": "u1001"
  },
  
  "mockIdp": {
    "enabled": false,
    ...
  }
}
```

### Step 2: Key Changes Summary

| Setting | Value | Description |
|---------|-------|-------------|
| `authMode` | `"USE_MOCK_AUTH"` | Switches back to mock auth |
| `mockAuth.enabled` | `true` | Enables simple mock login |
| `mockIdp.enabled` | `false` | Disables Mock IDP (optional) |

### Step 3: Restart the Application

```powershell
# Restart backend
cd backend
npm start

# Restart frontend (if needed)
cd ..
npm run dev
```

### Step 4: Verify

- The login page should now show the regular mock login form
- You can log in with just a user ID (no SSO flow)
- The role switcher dropdown should be available

---

## Test Users Reference

| User ID | Name | Role/Groups | Use Case |
|---------|------|-------------|----------|
| `u1001` | Sarah Chen | MASTER_OPS | Full admin access, all systems |
| `u1002` | Michael Torres | SSO_OPS | SSO/Federation systems only |
| `u1003` | Jessica Park | PAM_OPS | PAM/CyberArk systems only |
| `u1004` | David Kim | IGA_OPS | IGA/Saviynt systems only |
| `u1005` | Emily Watson | ENTRAID_OPS | Entra ID/Azure AD only |
| `u1006` | James Wilson | TPAG_OPS | Third-party access governance |
| `u1007` | Regular Employee | ALL_EMPLOYEES | Read-only, employee view |

**All passwords:** `demo`

---

## Troubleshooting

### Mock IDP Not Loading

**Symptom:** Console shows "Mock IDP module not found"

**Solution:**
1. Verify `backend/mock-idp/` folder exists with all files
2. Check `mockIdp.enabled: true` in features.json
3. Ensure `NODE_ENV` is not set to `production`

### SSO Button Not Appearing

**Symptom:** Login page only shows mock login form

**Solution:**
1. Set `authMode: "USE_MFA_AUTH"` in features.json
2. Restart the frontend application
3. Clear browser cache

### SAML Response Error

**Symptom:** Error after clicking "Approve MFA"

**Solution:**
1. Check browser console for detailed error
2. Verify ACS URL matches in Mock IDP and SAML config
3. Check backend logs for parsing errors

### User Has Wrong Permissions

**Symptom:** Logged in but missing expected permissions

**Solution:**
1. Check `groupRoleMapping` in features.json
2. Verify the test user's groups in `mock-idp/config.js`
3. Clear cookies and log in again

### Port Already in Use

**Symptom:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```powershell
# Find and kill the process using port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

---

## Quick Reference Card

### Enable SSO Testing
```json
{
  "authMode": "USE_MFA_AUTH",
  "mockAuth": { "enabled": false },
  "mockIdp": { "enabled": true, "simulateMfa": true }
}
```

### Disable SSO Testing (Back to Dev Mode)
```json
{
  "authMode": "USE_MOCK_AUTH",
  "mockAuth": { "enabled": true },
  "mockIdp": { "enabled": false }
}
```

### Mock IDP Endpoints
| Endpoint | Description |
|----------|-------------|
| `GET /api/mock-idp/sso` | Login page |
| `POST /api/mock-idp/sso` | Process login |
| `GET /api/mock-idp/slo` | Logout |
| `GET /api/mock-idp/metadata` | IDP metadata XML |
| `GET /api/mock-idp/users` | List test users (API) |
| `GET /api/mock-idp/status` | Health check |

---

## Related Documentation

- [MFA/SAML Developer Guide](./MFA-SAML-Developer-Guide.md)
- [Mock IDP README](../backend/mock-idp/README.md)
- [Authentication Requirements](./requirements/REQ-AUTH-MFA-SAML-Integration.md)
