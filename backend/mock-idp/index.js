/**
 * Mock Identity Provider Module
 * =============================
 * 
 * A self-contained mock SAML Identity Provider for testing SAML authentication
 * without requiring a real IDP like Ping Federate, Okta, or Azure AD.
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  ⚠️  DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION                       │
 * │                                                                         │
 * │  This entire folder (backend/mock-idp/) can be safely deleted when     │
 * │  integrating with a real Identity Provider.                            │
 * │                                                                         │
 * │  See: docs/MFA-SAML-Developer-Guide.md#removing-mock-idp               │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * Features:
 * - Mock SAML 2.0 SSO login flow
 * - Pre-configured test users with different roles
 * - MFA simulation (optional)
 * - IDP metadata endpoint
 * - Auto-submit SAML response to SP
 * 
 * @module backend/mock-idp
 */

import mockIdpRoutes from './routes.js';
import { MOCK_IDP_CONFIG, MOCK_IDP_USERS, SAML_ATTRIBUTES } from './config.js';
import {
  validateMockUser,
  getMockUsers,
  generateMockSamlResponse,
  generateMockIdpMetadata,
  parseSamlRequest,
} from './service.js';

/**
 * Setup the Mock IDP routes on an Express app.
 * 
 * @param {import('express').Application} app - Express application instance
 * @returns {boolean} true if setup was successful
 * 
 * @example
 * import { setupMockIdp } from './mock-idp/index.js';
 * 
 * if (features.mockIdp?.enabled) {
 *   setupMockIdp(app);
 * }
 */
export function setupMockIdp(app) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🔐 Mock Identity Provider - Starting');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Entity ID: ${MOCK_IDP_CONFIG.entityId}`);
  console.log(`  SSO URL:   ${MOCK_IDP_CONFIG.ssoUrl}`);
  console.log(`  SLO URL:   ${MOCK_IDP_CONFIG.sloUrl}`);
  console.log(`  MFA Sim:   ${MOCK_IDP_CONFIG.simulateMfa ? 'Enabled' : 'Disabled'}`);
  console.log('  Test Users:');
  getMockUsers().forEach(user => {
    console.log(`    - ${user.userId}: ${user.displayName} (${user.groupCount} groups)`);
  });
  console.log('');
  console.log('  ⚠️  This is for DEVELOPMENT ONLY. Do not use in production.');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Register routes
  app.use('/api/mock-idp', mockIdpRoutes);
  
  return true;
}

/**
 * Check if Mock IDP should be enabled based on features config.
 * 
 * @param {object} featuresConfig - Features configuration object
 * @returns {boolean} true if mock IDP should be enabled
 */
export function shouldEnableMockIdp(featuresConfig) {
  return (
    featuresConfig?.mockIdp?.enabled === true &&
    process.env.NODE_ENV !== 'production'
  );
}

// Re-export everything for convenience
export {
  // Routes
  mockIdpRoutes,
  
  // Config
  MOCK_IDP_CONFIG,
  MOCK_IDP_USERS,
  SAML_ATTRIBUTES,
  
  // Service
  validateMockUser,
  getMockUsers,
  generateMockSamlResponse,
  generateMockIdpMetadata,
  parseSamlRequest,
};

export default {
  setupMockIdp,
  shouldEnableMockIdp,
  routes: mockIdpRoutes,
  config: MOCK_IDP_CONFIG,
};
