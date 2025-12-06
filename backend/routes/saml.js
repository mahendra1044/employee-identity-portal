/**
 * SAML Routes
 * ===========
 * 
 * Backend routes for SAML SSO authentication flow.
 * 
 * Routes:
 * - GET  /api/saml/login     - Initiate SAML SSO (redirect to IDP)
 * - POST /api/saml/acs       - Assertion Consumer Service (IDP callback)
 * - GET  /api/saml/logout    - Initiate Single Logout
 * - POST /api/saml/slo       - Single Logout callback
 * - GET  /api/saml/metadata  - SP Metadata for IDP configuration
 * 
 * @module backend/routes/saml
 */

import express from 'express';
import * as authService from '../services/authService.js';
import { rbacService } from '../services/rbacService.js';

const router = express.Router();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return `_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Build SAML AuthnRequest XML
 */
function buildAuthnRequest(requestId, spConfig, idpConfig) {
  const issueInstant = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="${requestId}"
    Version="2.0"
    IssueInstant="${issueInstant}"
    Destination="${idpConfig.ssoUrl}"
    AssertionConsumerServiceURL="${spConfig.assertionConsumerServiceUrl}"
    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
    <saml:Issuer>${spConfig.entityId}</saml:Issuer>
    <samlp:NameIDPolicy
        Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
        AllowCreate="true"/>
</samlp:AuthnRequest>`;
}

/**
 * Build SP Metadata XML
 */
function buildSpMetadata(spConfig) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor 
    xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
    entityID="${spConfig.entityId}">
  <md:SPSSODescriptor 
      AuthnRequestsSigned="false"
      WantAssertionsSigned="true"
      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</md:NameIDFormat>
    <md:AssertionConsumerService 
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="${spConfig.assertionConsumerServiceUrl}"
        index="0"
        isDefault="true"/>
    ${spConfig.singleLogoutServiceUrl ? `<md:SingleLogoutService 
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        Location="${spConfig.singleLogoutServiceUrl}"/>` : ''}
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
}

/**
 * Parse SAML assertion and extract attributes
 * NOTE: Simplified implementation - use passport-saml for production
 */
function parseAssertion(samlResponse, attributeMapping) {
  try {
    // Decode base64
    const decoded = Buffer.from(samlResponse, 'base64').toString('utf-8');
    
    // Extract attributes using regex (simplified)
    const extractValue = (xml, attrName) => {
      const regex = new RegExp(
        `<(?:saml:)?Attribute[^>]*Name=["']${attrName}["'][^>]*>\\s*<(?:saml:)?AttributeValue[^>]*>([^<]*)</(?:saml:)?AttributeValue>`,
        'i'
      );
      const match = xml.match(regex);
      return match ? match[1].trim() : null;
    };

    const extractMultiValue = (xml, attrName) => {
      const values = [];
      const attrRegex = new RegExp(
        `<(?:saml:)?Attribute[^>]*Name=["']${attrName}["'][^>]*>([\\s\\S]*?)</(?:saml:)?Attribute>`,
        'gi'
      );
      const attrMatch = xml.match(attrRegex);
      
      if (attrMatch) {
        const valueRegex = /<(?:saml:)?AttributeValue[^>]*>([^<]*)<\/(?:saml:)?AttributeValue>/gi;
        let valueMatch;
        while ((valueMatch = valueRegex.exec(attrMatch[0])) !== null) {
          values.push(valueMatch[1].trim());
        }
      }
      return values;
    };

    const userId = extractValue(decoded, attributeMapping.userId);
    if (!userId) {
      return { success: false, error: 'User ID not found in assertion' };
    }

    return {
      success: true,
      attributes: {
        userId,
        email: extractValue(decoded, attributeMapping.email) || `${userId}@company.com`,
        displayName: extractValue(decoded, attributeMapping.displayName) || userId,
        groups: extractMultiValue(decoded, attributeMapping.groups),
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/saml/login
 * Initiate SAML SSO - redirects user to IDP
 */
router.get('/login', (req, res) => {
  try {
    // Check if MFA auth is enabled
    if (!authService.isMfaAuth()) {
      return res.status(400).json({
        error: 'SAML authentication is not enabled',
        authMode: authService.getAuthMode()
      });
    }

    const spConfig = authService.getSpConfig();
    const idpConfig = authService.getIdpConfig();

    if (!idpConfig.ssoUrl) {
      return res.status(500).json({
        error: 'IDP SSO URL not configured'
      });
    }

    // Generate request
    const requestId = generateRequestId();
    const authnRequest = buildAuthnRequest(requestId, spConfig, idpConfig);
    const encodedRequest = Buffer.from(authnRequest).toString('base64');

    // Build redirect URL
    const relayState = req.query.returnUrl || '/';
    const redirectUrl = `${idpConfig.ssoUrl}?SAMLRequest=${encodeURIComponent(encodedRequest)}&RelayState=${encodeURIComponent(relayState)}`;

    // Store request ID for validation (in production, use proper session store)
    // req.session.samlRequestId = requestId;

    // Redirect to IDP
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('[SAML] Login error:', error);
    res.status(500).json({ error: 'Failed to initiate SAML authentication' });
  }
});

/**
 * POST /api/saml/acs
 * Assertion Consumer Service - receives SAML Response from IDP
 */
router.post('/acs', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { SAMLResponse, RelayState } = req.body;

    if (!SAMLResponse) {
      return res.status(400).json({ error: 'SAML Response required' });
    }

    // Parse and validate assertion
    const attributeMapping = authService.getAttributeMapping();
    const result = parseAssertion(SAMLResponse, attributeMapping);

    if (!result.success) {
      console.error('[SAML] Assertion validation failed:', result.error);
      return res.status(401).json({ error: result.error });
    }

    const { attributes } = result;

    // Map groups to roles
    const roles = authService.mapGroupsToRoles(attributes.groups);
    
    // Get role IDs from role keys
    const roleIds = rbacService.getRoleIdsFromKeys(roles);
    const isMaster = roleIds.includes('R001');
    const availableRoles = rbacService.getRolesFromIds(roleIds, isMaster);
    const activeRole = availableRoles.length > 0 ? availableRoles[0] : rbacService.getDefaultRole();

    // Generate JWT token
    const token = authService.generateToken({
      userId: attributes.userId,
      email: attributes.email,
      displayName: attributes.displayName,
      roles: roleIds,
      authMethod: 'saml'
    });

    // Build response
    const loginResponse = {
      success: true,
      token,
      user: {
        userId: attributes.userId,
        email: attributes.email,
        displayName: attributes.displayName,
      },
      rbac: {
        availableRoles,
        activeRole,
        isMaster,
        roleIds,
      }
    };

    // Redirect back to app with token
    // In production, use secure cookie or POST to frontend
    const returnUrl = RelayState || '/';
    const successUrl = `${returnUrl}?authSuccess=true&token=${encodeURIComponent(token)}`;
    
    // For API clients, return JSON
    if (req.headers.accept?.includes('application/json')) {
      return res.json(loginResponse);
    }

    // For browser, redirect with token in URL (not ideal for production)
    // Better: Set HttpOnly cookie and redirect
    res.redirect(successUrl);
  } catch (error) {
    console.error('[SAML] ACS error:', error);
    res.status(500).json({ error: 'Failed to process SAML assertion' });
  }
});

/**
 * GET /api/saml/logout
 * Initiate Single Logout
 */
router.get('/logout', (req, res) => {
  try {
    const idpConfig = authService.getIdpConfig();
    const spConfig = authService.getSpConfig();

    // If SLO URL not configured, just redirect to home
    if (!idpConfig.sloUrl) {
      return res.redirect('/?loggedOut=true');
    }

    // Build logout request
    const requestId = generateRequestId();
    const issueInstant = new Date().toISOString();
    
    const logoutRequest = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:LogoutRequest
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="${requestId}"
    Version="2.0"
    IssueInstant="${issueInstant}"
    Destination="${idpConfig.sloUrl}">
    <saml:Issuer>${spConfig.entityId}</saml:Issuer>
</samlp:LogoutRequest>`;

    const encodedRequest = Buffer.from(logoutRequest).toString('base64');
    const returnUrl = req.query.returnUrl || '/';
    const redirectUrl = `${idpConfig.sloUrl}?SAMLRequest=${encodeURIComponent(encodedRequest)}&RelayState=${encodeURIComponent(returnUrl)}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('[SAML] Logout error:', error);
    // Even if SLO fails, redirect to home
    res.redirect('/?loggedOut=true');
  }
});

/**
 * POST /api/saml/slo
 * Single Logout callback from IDP
 */
router.post('/slo', express.urlencoded({ extended: true }), (req, res) => {
  try {
    const { RelayState } = req.body;
    const returnUrl = RelayState || '/';
    res.redirect(`${returnUrl}?loggedOut=true`);
  } catch (error) {
    console.error('[SAML] SLO callback error:', error);
    res.redirect('/?loggedOut=true');
  }
});

/**
 * GET /api/saml/metadata
 * Return SP Metadata for IDP configuration
 */
router.get('/metadata', (req, res) => {
  try {
    const spConfig = authService.getSpConfig();
    
    if (!spConfig.entityId) {
      return res.status(500).json({ error: 'SP not configured' });
    }

    const metadata = buildSpMetadata(spConfig);
    res.set('Content-Type', 'application/xml');
    res.send(metadata);
  } catch (error) {
    console.error('[SAML] Metadata error:', error);
    res.status(500).json({ error: 'Failed to generate SP metadata' });
  }
});

/**
 * GET /api/saml/config
 * Return SAML configuration (for debugging/admin)
 */
router.get('/config', (req, res) => {
  const mfaConfig = authService.getMfaAuthConfig();
  
  // Don't expose sensitive data
  res.json({
    enabled: mfaConfig.enabled,
    authMode: authService.getAuthMode(),
    serviceProvider: {
      entityId: mfaConfig.serviceProvider?.entityId,
      assertionConsumerServiceUrl: mfaConfig.serviceProvider?.assertionConsumerServiceUrl,
    },
    identityProvider: {
      entityId: mfaConfig.identityProvider?.entityId,
      ssoUrl: mfaConfig.identityProvider?.ssoUrl,
      // Don't expose certificate
    },
    attributeMapping: mfaConfig.attributeMapping,
  });
});

export default router;
