# Mock Identity Provider (Mock IDP)

A self-contained mock SAML 2.0 Identity Provider for testing SAML SSO authentication
in the Identity Sphere Portal without requiring a real IDP like Ping Federate, Okta, or Azure AD.

> ⚠️ **DEVELOPMENT ONLY** - This module should NEVER be used in production environments.

## Overview

```
backend/mock-idp/
├── README.md       # This documentation
├── index.js        # Module entry point with setup function
├── config.js       # Configuration and test users
├── service.js      # SAML response generation
└── routes.js       # Express routes for IDP endpoints
```

## Features

- 🔐 Mock SAML 2.0 SSO login flow
- 👥 Pre-configured test users with different roles
- 🛡️ MFA simulation (optional)
- 📄 IDP metadata endpoint
- 🔄 Auto-submit SAML response to SP
- 🎨 Beautiful login page UI

## Test Users

| User ID | Display Name | Password | Groups |
|---------|--------------|----------|--------|
| u1001 | Master Admin | demo | MASTER_OPS (all permissions) |
| u1002 | SSO Operator | demo | SSO_OPS |
| u1003 | PAM Operator | demo | PAM_OPS |
| u1004 | IGA Operator | demo | IGA_OPS |
| u1005 | Employee User | demo | Employees (read-only) |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mock-idp/sso` | Display login page |
| POST | `/api/mock-idp/sso` | Process login |
| POST | `/api/mock-idp/sso/complete` | Complete after MFA |
| GET | `/api/mock-idp/slo` | Single logout |
| GET | `/api/mock-idp/metadata` | IDP metadata XML |
| GET | `/api/mock-idp/users` | List test users (API) |
| GET | `/api/mock-idp/status` | Health check |

---

## Configuration

### Enable Mock IDP

Edit `backend/config/features.json`:

```json
{
  "authMode": "USE_MFA_AUTH",
  "mockIdp": {
    "enabled": true,
    "simulateMfa": true,
    "entityId": "https://mock-idp.identity-portal.local",
    "ssoUrl": "http://localhost:3001/api/mock-idp/sso",
    "sloUrl": "http://localhost:3001/api/mock-idp/slo",
    "metadataUrl": "http://localhost:3001/api/mock-idp/metadata"
  }
}
```

### Disable Mock IDP

Option 1: Set `enabled` to `false`:
```json
{
  "mockIdp": {
    "enabled": false
  }
}
```

Option 2: Remove the `mockIdp` section entirely from features.json.

### Disable MFA Simulation

To skip the MFA step during mock authentication:
```json
{
  "mockIdp": {
    "enabled": true,
    "simulateMfa": false
  }
}
```

---

## Complete Removal Guide

When integrating with a real Identity Provider, you can completely remove the Mock IDP module.

### Step 1: Update Configuration

Edit `backend/config/features.json`:

```diff
{
  "authMode": "USE_MFA_AUTH",
  
- "mockIdp": {
-   "enabled": true,
-   "simulateMfa": true,
-   "entityId": "https://mock-idp.identity-portal.local",
-   "ssoUrl": "http://localhost:3001/api/mock-idp/sso",
-   "sloUrl": "http://localhost:3001/api/mock-idp/slo",
-   "metadataUrl": "http://localhost:3001/api/mock-idp/metadata"
- },
  
  "mfaAuth": {
    "enabled": true,
    "identityProvider": {
      "ssoUrl": "https://YOUR-REAL-IDP.com/sso"
    }
  }
}
```

### Step 2: Delete the Mock IDP Folder

```powershell
# PowerShell
Remove-Item -Recurse -Force backend/mock-idp
```

```bash
# Bash
rm -rf backend/mock-idp
```

### Step 3: Verify the Application

1. Restart the backend server
2. The routes/index.js will gracefully handle the missing module:
   ```
   [Routes] Mock IDP module not found or failed to load. This is OK if you removed it.
   ```
3. Test SAML SSO with your real IDP

### Step 4: (Optional) Remove Import Code

If you want a cleaner codebase, you can remove the Mock IDP import from `backend/routes/index.js`:

```diff
- // Mock IDP routes (for development/testing only)
- if (features.mockIdp?.enabled && process.env.NODE_ENV !== 'production') {
-   import('../mock-idp/index.js')
-     .then(({ setupMockIdp }) => {
-       setupMockIdp(app);
-       logger.info('[Routes] Mock IDP routes enabled');
-     })
-     .catch(err => {
-       logger.warn('[Routes] Mock IDP module not found...');
-     });
- }
```

---

## Testing Flow

### 1. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
npm run dev
```

### 2. Test SAML Flow

1. Navigate to http://localhost:3000
2. Click "Sign in with SSO" (or the SAML login button)
3. You'll be redirected to the Mock IDP login page
4. Either:
   - Click a quick-login user button, or
   - Enter credentials manually (any test user with password "demo")
5. If MFA simulation is enabled, click "Approve MFA"
6. You'll be redirected back to the application, logged in

### 3. View Available Users

```bash
curl http://localhost:3001/api/mock-idp/users
```

### 4. Check Mock IDP Status

```bash
curl http://localhost:3001/api/mock-idp/status
```

---

## Customizing Test Users

Edit `backend/mock-idp/config.js` to add or modify test users:

```javascript
export const MOCK_USERS = {
  u9999: {
    userId: 'u9999',
    email: 'custom@company.com',
    displayName: 'Custom User',
    firstName: 'Custom',
    lastName: 'User',
    department: 'Custom Dept',
    title: 'Custom Title',
    groups: [
      'CN=CUSTOM_GROUP,OU=Groups,DC=company,DC=com'
    ],
  },
  // ... other users
};
```

Then add the corresponding role mapping in `backend/config/features.json`:

```json
{
  "groupRoleMapping": {
    "CN=CUSTOM_GROUP,OU=Groups,DC=company,DC=com": ["employee", "custom_role"]
  }
}
```

---

## Troubleshooting

### Mock IDP not loading

**Check the console output for:**
```
═══════════════════════════════════════════════════════════════
  🔐 Mock Identity Provider - Starting
═══════════════════════════════════════════════════════════════
```

If not present:
1. Verify `mockIdp.enabled` is `true` in features.json
2. Ensure `NODE_ENV` is not set to `production`
3. Check for import errors in the console

### SAML Response not accepted

The Mock IDP generates simplified SAML responses. If the SP requires signed assertions:
1. Disable signature validation for development
2. Or use a full IDP like SimpleSAMLphp for more realistic testing

### Login page not appearing

1. Check that the SAML login route redirects to Mock IDP:
   ```
   [SAML] Using Mock IDP for development
   ```
2. Verify the `ssoUrl` in mockIdp config matches the route

---

## Security Note

This module:
- Uses hardcoded test credentials
- Does NOT sign SAML assertions
- Does NOT encrypt SAML responses
- Is blocked from running in production (`NODE_ENV=production`)

**Never deploy this to production!**

---

## Related Documentation

- [MFA/SAML Developer Guide](../../docs/MFA-SAML-Developer-Guide.md)
- [Authentication Architecture](../../docs/requirements/REQ-AUTH-MFA-SAML-Integration.md)
