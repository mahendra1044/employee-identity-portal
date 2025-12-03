/**
 * SSO Mock API Configuration
 * ==========================
 * 
 * Mock API endpoints for SSO/Ping Identity systems.
 * Used when SYSTEM_DATA_SOURCE.sso = 'USE_MOCK'
 * 
 * Systems covered:
 * - Ping Directory
 * - Ping Federate
 * - Ping MFA
 * - Ping Access
 * - Ping Authorize
 * - Ping Intelligence
 * 
 * @module config/api/mock/sso
 */

import type { MockSystemConfig } from '../types';

export const SSO_MOCK_CONFIG: MockSystemConfig = {
  // ===========================================================================
  // CONNECTION (Mock - uses local Next.js API routes)
  // ===========================================================================
  connection: {
    baseUrl: '',
    authMethod: 'none',
    timeout: 30000,
  },

  headers: {
    'Content-Type': 'application/json',
  },

  // ===========================================================================
  // SYSTEM CARDS - Employee self-service view
  // ===========================================================================
  systemCards: {
    pingDirectory: {
      endpoint: '/api/own-ping-directory',
      method: 'GET',
      description: 'Get user profile from Ping Directory',
      mockFile: 'ping-directory-initial.json',
    },
    pingFederate: {
      endpoint: '/api/own-ping-federate',
      method: 'GET',
      description: 'Get user SSO sessions from Ping Federate',
      mockFile: 'ping-federate-initial.json',
    },
    pingMfa: {
      endpoint: '/api/own-ping-mfa',
      method: 'GET',
      description: 'Get user MFA status from Ping MFA',
      mockFile: 'ping-mfa-initial.json',
    },
    pingAccess: {
      endpoint: '/api/own-ping-access',
      method: 'GET',
      description: 'Get user access policies from Ping Access',
      mockFile: 'ping-access-initial.json',
    },
    pingAuthorize: {
      endpoint: '/api/own-ping-authorize',
      method: 'GET',
      description: 'Get user authorization policies from Ping Authorize',
      mockFile: 'ping-authorize-initial.json',
    },
    pingIntelligence: {
      endpoint: '/api/own-ping-intelligence',
      method: 'GET',
      description: 'Get user risk score from Ping Intelligence',
      mockFile: 'ping-intelligence-initial.json',
    },
  },

  // ===========================================================================
  // SEARCH - Ops user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/api/search-employee/{query}',
      method: 'GET',
      description: 'Search users in Ping Directory',
      mockFile: 'ping-directory-search.json',
    },
    getUserDetails: {
      endpoint: '/api/search-employee/{query}/details?system=ping-directory',
      method: 'GET',
      description: 'Get detailed user info from Ping Directory',
      mockFile: 'ping-directory-details.json',
    },
  },

  // ===========================================================================
  // FAILURES - Ops failure monitoring
  // ===========================================================================
  failures: {
    pingFederateAuthFailures: {
      endpoint: '/api/ops-failures?system=ping-federate&minutes={minutes}',
      method: 'GET',
      description: 'Get SSO authentication failures',
      mockGenerator: 'generatePingFederateFailures',
    },
    pingMfaFailures: {
      endpoint: '/api/ops-failures?system=ping-mfa&minutes={minutes}',
      method: 'GET',
      description: 'Get MFA authentication failures',
      mockGenerator: 'generatePingMfaFailures',
    },
  },

  // ===========================================================================
  // QUICK ACTIONS - Ops actions
  // ===========================================================================
  quickActions: {
    unlockAccount: {
      endpoint: '/api/pd/unlock',
      method: 'POST',
      description: 'Unlock user account in Ping Directory',
      mockResponse: { success: true, message: 'Account unlocked successfully' },
    },
    resetPassword: {
      endpoint: '/api/pd/reset-password',
      method: 'POST',
      description: 'Reset user password in Ping Directory',
      mockResponse: { success: true, message: 'Password reset email sent' },
    },
    terminateSessions: {
      endpoint: '/api/pf/terminate-sessions',
      method: 'POST',
      description: 'Terminate all SSO sessions in Ping Federate',
      mockResponse: { success: true, message: 'All sessions terminated' },
    },
    revokeOAuthTokens: {
      endpoint: '/api/pf/revoke-tokens',
      method: 'POST',
      description: 'Revoke all OAuth tokens/grants',
      mockResponse: { success: true, message: 'OAuth tokens revoked' },
    },
    resetMfa: {
      endpoint: '/api/mfa/reset',
      method: 'POST',
      description: 'Clear all MFA devices for user',
      mockResponse: { success: true, message: 'MFA devices cleared - user must re-enroll' },
    },
    bypassMfa: {
      endpoint: '/api/mfa/bypass',
      method: 'POST',
      description: 'Enable temporary MFA bypass',
      mockResponse: { success: true, message: 'MFA bypass enabled for 1 hour' },
    },
  },
};
