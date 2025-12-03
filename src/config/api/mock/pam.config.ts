/**
 * PAM Mock API Configuration
 * ==========================
 * 
 * Mock API endpoints for PAM/CyberArk systems.
 * Used when SYSTEM_DATA_SOURCE.pam = 'USE_MOCK'
 * 
 * Systems covered:
 * - CyberArk PAM (Vault)
 * - CyberArk EPM (Endpoint Privilege Manager)
 * - CyberArk Alero (Remote Access)
 * - CyberArk Conjur (Secrets Management)
 * - CyberArk DPA (Dynamic Privileged Access)
 * - CyberArk Identity
 * 
 * @module config/api/mock/pam
 */

import type { MockSystemConfig } from '../types';

export const PAM_MOCK_CONFIG: MockSystemConfig = {
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
    cyberark: {
      endpoint: '/api/own-cyberark',
      method: 'GET',
      description: 'Get user privileged accounts from CyberArk PAM',
      mockFile: 'cyberark-initial.json',
    },
    cyberarkEpm: {
      endpoint: '/api/own-cyberark-epm',
      method: 'GET',
      description: 'Get user endpoint privileges from CyberArk EPM',
      mockFile: 'cyberark-epm-initial.json',
    },
    cyberarkAlero: {
      endpoint: '/api/own-cyberark-alero',
      method: 'GET',
      description: 'Get user remote access sessions from CyberArk Alero',
      mockFile: 'cyberark-alero-initial.json',
    },
    cyberarkConjur: {
      endpoint: '/api/own-cyberark-conjur',
      method: 'GET',
      description: 'Get user secrets access from CyberArk Conjur',
      mockFile: 'cyberark-conjur-initial.json',
    },
    cyberarkDpa: {
      endpoint: '/api/own-cyberark-dpa',
      method: 'GET',
      description: 'Get user dynamic access from CyberArk DPA',
      mockFile: 'cyberark-dpa-initial.json',
    },
    cyberarkIdentity: {
      endpoint: '/api/own-cyberark-identity',
      method: 'GET',
      description: 'Get user identity info from CyberArk Identity',
      mockFile: 'cyberark-identity-initial.json',
    },
  },

  // ===========================================================================
  // SEARCH - Ops user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/api/search-employee/{query}',
      method: 'GET',
      description: 'Search users in CyberArk',
      mockFile: 'cyberark-search.json',
    },
    getUserDetails: {
      endpoint: '/api/search-employee/{query}/details?system=cyberark',
      method: 'GET',
      description: 'Get detailed user info from CyberArk',
      mockFile: 'cyberark-details.json',
    },
  },

  // ===========================================================================
  // FAILURES - Ops failure monitoring
  // ===========================================================================
  failures: {
    cyberarkFailures: {
      endpoint: '/api/ops-failures?system=cyberark&minutes={minutes}',
      method: 'GET',
      description: 'Get CyberArk PAM failures (login, checkout, etc.)',
      mockGenerator: 'generateCyberArkFailures',
    },
  },

  // ===========================================================================
  // QUICK ACTIONS - Ops actions
  // ===========================================================================
  quickActions: {
    suspendAccount: {
      endpoint: '/api/cyberark/suspend',
      method: 'POST',
      description: 'Suspend user privileged account access',
      mockResponse: { success: true, message: 'Account suspended' },
    },
    rotatePassword: {
      endpoint: '/api/cyberark/rotate-password',
      method: 'POST',
      description: 'Force immediate credential rotation',
      mockResponse: { success: true, message: 'Password rotation initiated' },
    },
    terminateSession: {
      endpoint: '/api/cyberark/terminate-session',
      method: 'POST',
      description: 'Terminate active PSM session',
      mockResponse: { success: true, message: 'Session terminated' },
    },
    revokeSafeAccess: {
      endpoint: '/api/cyberark/revoke-safe',
      method: 'POST',
      description: 'Remove user from safe membership',
      mockResponse: { success: true, message: 'Safe access revoked' },
    },
  },
};
