/**
 * Mock IDP Routes
 * ===============
 * 
 * Express routes that simulate a SAML Identity Provider.
 * Used for testing SAML authentication without a real IDP.
 * 
 * Routes:
 * - GET  /api/mock-idp/sso       - Display mock login page
 * - POST /api/mock-idp/sso       - Process login, return SAML response
 * - GET  /api/mock-idp/slo       - Single logout
 * - GET  /api/mock-idp/metadata  - IDP metadata
 * - GET  /api/mock-idp/users     - List available test users (API)
 * 
 * ⚠️ This entire mock-idp folder can be safely deleted when
 *    integrating with a real IDP like Ping Federate.
 * 
 * @module backend/mock-idp/routes
 */

import express from 'express';
import {
  validateMockUser,
  getMockUsers,
  generateMockSamlResponse,
  generateMockIdpMetadata,
  parseSamlRequest,
} from './service.js';
import { MOCK_IDP_CONFIG } from './config.js';

const router = express.Router();

// ============================================================================
// HTML TEMPLATES
// ============================================================================

/**
 * Generate the Mock IDP Login Page HTML
 */
function renderLoginPage(samlRequest, relayState, error = null) {
  const users = getMockUsers();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mock IDP - SSO Login</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
            color: white;
            padding: 24px;
            text-align: center;
        }
        .header h1 { font-size: 1.5rem; margin-bottom: 8px; }
        .header p { opacity: 0.8; font-size: 0.875rem; }
        .badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            margin-top: 12px;
        }
        .content { padding: 24px; }
        .error {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 0.875rem;
        }
        .form-group { margin-bottom: 16px; }
        label {
            display: block;
            font-weight: 500;
            margin-bottom: 6px;
            color: #374151;
            font-size: 0.875rem;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .divider {
            display: flex;
            align-items: center;
            margin: 24px 0;
            color: #9ca3af;
            font-size: 0.875rem;
        }
        .divider::before, .divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e5e7eb;
        }
        .divider span { padding: 0 16px; }
        .quick-login { margin-top: 8px; }
        .quick-login h3 {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 12px;
        }
        .user-list {
            display: grid;
            gap: 8px;
        }
        .user-btn {
            display: flex;
            align-items: center;
            padding: 12px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
        }
        .user-btn:hover {
            background: #f3f4f6;
            border-color: #667eea;
        }
        .user-avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            margin-right: 12px;
            font-size: 0.875rem;
        }
        .user-info { flex: 1; }
        .user-name { font-weight: 500; color: #1f2937; font-size: 0.875rem; }
        .user-id { color: #6b7280; font-size: 0.75rem; }
        .footer {
            background: #f9fafb;
            padding: 16px 24px;
            text-align: center;
            font-size: 0.75rem;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .mfa-note {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            color: #92400e;
            padding: 12px;
            border-radius: 8px;
            margin-top: 16px;
            font-size: 0.875rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Mock Identity Provider</h1>
            <p>SAML 2.0 SSO Simulation</p>
            <div class="badge">⚠️ Development Only</div>
        </div>
        
        <div class="content">
            ${error ? `<div class="error">❌ ${error}</div>` : ''}
            
            <form method="POST" action="/api/mock-idp/sso">
                <input type="hidden" name="SAMLRequest" value="${samlRequest || ''}">
                <input type="hidden" name="RelayState" value="${relayState || '/'}">
                
                <div class="form-group">
                    <label for="userId">User ID</label>
                    <input type="text" id="userId" name="userId" placeholder="e.g., u1001" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter password (hint: demo)" required>
                </div>
                
                <button type="submit" class="btn">🔑 Sign In with SSO</button>
                
                ${MOCK_IDP_CONFIG.simulateMfa ? `
                <div class="mfa-note">
                    🛡️ MFA will be simulated after login
                </div>
                ` : ''}
            </form>
            
            <div class="divider"><span>or quick login as</span></div>
            
            <div class="quick-login">
                <div class="user-list">
                    ${users.map(user => `
                    <form method="POST" action="/api/mock-idp/sso" style="margin: 0;">
                        <input type="hidden" name="SAMLRequest" value="${samlRequest || ''}">
                        <input type="hidden" name="RelayState" value="${relayState || '/'}">
                        <input type="hidden" name="userId" value="${user.userId}">
                        <input type="hidden" name="password" value="demo">
                        <button type="submit" class="user-btn">
                            <div class="user-avatar">${user.userId.toUpperCase().slice(-2)}</div>
                            <div class="user-info">
                                <div class="user-name">${user.displayName}</div>
                                <div class="user-id">${user.userId} • ${user.email}</div>
                            </div>
                        </button>
                    </form>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div class="footer">
            Mock IDP for Identity Sphere Portal • Not for production use<br>
            All passwords: <code>demo</code>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Generate MFA simulation page HTML
 */
function renderMfaPage(userId, samlRequest, relayState) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mock IDP - MFA Challenge</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 400px;
            width: 100%;
            overflow: hidden;
            text-align: center;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 24px;
        }
        .header h1 { font-size: 1.25rem; margin-bottom: 8px; }
        .content { padding: 32px 24px; }
        .mfa-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 2rem;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
        }
        .message { color: #374151; margin-bottom: 24px; }
        .btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
        }
        .btn:hover { opacity: 0.9; }
        .user-info {
            background: #f0fdf4;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 24px;
            font-size: 0.875rem;
            color: #166534;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ MFA Verification</h1>
        </div>
        <div class="content">
            <div class="mfa-icon">📱</div>
            <div class="user-info">
                Authenticating as: <strong>${userId}</strong>
            </div>
            <p class="message">
                In a real environment, you would receive a push notification or enter an OTP code.
            </p>
            <form method="POST" action="/api/mock-idp/sso/complete">
                <input type="hidden" name="SAMLRequest" value="${samlRequest}">
                <input type="hidden" name="RelayState" value="${relayState}">
                <input type="hidden" name="userId" value="${userId}">
                <input type="hidden" name="mfaVerified" value="true">
                <button type="submit" class="btn">✅ Approve MFA (Simulated)</button>
            </form>
        </div>
    </div>
</body>
</html>`;
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/mock-idp/sso
 * Display the mock IDP login page
 */
router.get('/sso', (req, res) => {
  const { SAMLRequest, RelayState } = req.query;
  
  // Log incoming request
  console.log('[MockIDP] SSO request received');
  if (SAMLRequest) {
    const parsed = parseSamlRequest(SAMLRequest);
    console.log('[MockIDP] SAML Request:', parsed);
  }
  
  res.send(renderLoginPage(SAMLRequest, RelayState));
});

/**
 * POST /api/mock-idp/sso
 * Process login credentials
 */
router.post('/sso', express.urlencoded({ extended: true }), (req, res) => {
  const { userId, password, SAMLRequest, RelayState } = req.body;
  
  console.log(`[MockIDP] Login attempt for user: ${userId}`);
  
  // Validate credentials
  const result = validateMockUser(userId, password);
  
  if (!result.success) {
    console.log(`[MockIDP] Login failed: ${result.error}`);
    return res.send(renderLoginPage(SAMLRequest, RelayState, result.error));
  }
  
  console.log(`[MockIDP] Login successful for: ${userId}`);
  
  // If MFA simulation is enabled, show MFA page
  if (MOCK_IDP_CONFIG.simulateMfa) {
    return res.send(renderMfaPage(userId, SAMLRequest, RelayState));
  }
  
  // Otherwise, complete authentication directly
  completeAuthentication(res, userId, SAMLRequest, RelayState);
});

/**
 * POST /api/mock-idp/sso/complete
 * Complete authentication after MFA
 */
router.post('/sso/complete', express.urlencoded({ extended: true }), (req, res) => {
  const { userId, SAMLRequest, RelayState, mfaVerified } = req.body;
  
  if (mfaVerified !== 'true') {
    return res.status(400).send('MFA verification required');
  }
  
  console.log(`[MockIDP] MFA verified for: ${userId}`);
  completeAuthentication(res, userId, SAMLRequest, RelayState);
});

/**
 * Complete authentication and redirect to SP with SAML response
 */
function completeAuthentication(res, userId, samlRequest, relayState) {
  const user = validateMockUser(userId, 'demo').user;
  
  if (!user) {
    return res.status(400).send('User not found');
  }
  
  // Parse the original SAML request to get request ID and ACS URL
  let requestId = `_${Date.now()}`;
  let acsUrl = 'http://localhost:3001/api/saml/acs';
  let audienceUri = 'https://identity-portal.company.com';
  
  if (samlRequest) {
    const parsed = parseSamlRequest(samlRequest);
    if (parsed) {
      requestId = parsed.requestId;
      acsUrl = parsed.acsUrl;
      audienceUri = parsed.issuer;
    }
  }
  
  // Generate SAML Response
  const samlResponse = generateMockSamlResponse(user, requestId, acsUrl, audienceUri);
  
  console.log(`[MockIDP] Generated SAML Response for: ${userId}`);
  console.log(`[MockIDP] Posting to ACS: ${acsUrl}`);
  
  // Return an auto-submitting form that POSTs to the SP's ACS URL
  res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Redirecting...</title>
</head>
<body onload="document.forms[0].submit()">
    <noscript>
        <p>JavaScript is disabled. Click the button to continue.</p>
    </noscript>
    <form method="POST" action="${acsUrl}">
        <input type="hidden" name="SAMLResponse" value="${samlResponse}">
        <input type="hidden" name="RelayState" value="${relayState || '/'}">
        <noscript>
            <button type="submit">Continue</button>
        </noscript>
    </form>
    <p style="text-align: center; margin-top: 50px; font-family: sans-serif; color: #666;">
        Completing authentication...
    </p>
</body>
</html>`);
}

/**
 * GET /api/mock-idp/slo
 * Handle Single Logout
 */
router.get('/slo', (req, res) => {
  const { RelayState } = req.query;
  console.log('[MockIDP] Logout request received');
  
  // Redirect back to the application
  const returnUrl = RelayState || '/';
  res.redirect(`${returnUrl}?loggedOut=true`);
});

/**
 * GET /api/mock-idp/metadata
 * Return IDP metadata
 */
router.get('/metadata', (req, res) => {
  const metadata = generateMockIdpMetadata();
  res.set('Content-Type', 'application/xml');
  res.send(metadata);
});

/**
 * GET /api/mock-idp/users
 * Return list of available test users (API endpoint)
 */
router.get('/users', (req, res) => {
  const users = getMockUsers();
  res.json({
    message: 'Available test users for Mock IDP',
    hint: 'All passwords are: demo',
    users,
  });
});

/**
 * GET /api/mock-idp/status
 * Health check for mock IDP
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    name: 'Mock Identity Provider',
    entityId: MOCK_IDP_CONFIG.entityId,
    ssoUrl: MOCK_IDP_CONFIG.ssoUrl,
    userCount: Object.keys(getMockUsers()).length,
    mfaSimulation: MOCK_IDP_CONFIG.simulateMfa,
  });
});

export default router;
