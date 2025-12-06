/**
 * PAM Real API Configuration
 * ==========================
 * 
 * Real API endpoints for PAM/CyberArk systems.
 * Used when SYSTEM_DATA_SOURCE.pam = 'USE_API'
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - CYBERARK_API_BASE_URL: Base URL for CyberArk PVWA
 * - CYBERARK_CLIENT_ID: API client ID
 * - CYBERARK_CLIENT_SECRET: API client secret
 * - CYBERARK_EPM_URL: EPM API URL
 * - CYBERARK_CONJUR_URL: Conjur API URL
 * 
 * Systems covered:
 * - CyberArk PAM (PVWA)
 * - CyberArk EPM
 * - CyberArk Alero
 * - CyberArk Conjur
 * - CyberArk DPA
 * - CyberArk Identity
 * 
 * @module config/api/real/pam
 */

import type { RealSystemConfig } from '../types';

export const PAM_REAL_CONFIG: RealSystemConfig = {
  // ===========================================================================
  // CONNECTION SETTINGS
  // ===========================================================================
  connection: {
    baseUrl: process.env.CYBERARK_API_BASE_URL || 'https://pvwa.company.com/PasswordVault',
    clientId: process.env.CYBERARK_CLIENT_ID || '',
    clientSecret: process.env.CYBERARK_CLIENT_SECRET || '',
    authMethod: 'oauth2',
    tokenEndpoint: '/api/oauth2/token',
    timeout: 30000,
  },

  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // ===========================================================================
  // SYSTEM CARDS - Employee self-service view
  // ===========================================================================
  systemCards: {
    cyberark: {
      endpoint: '/api/Users/{userId}/Accounts',
      method: 'GET',
      description: 'Get user privileged accounts from CyberArk PAM',
      responseMapping: {
        accounts: 'value',
        totalCount: 'count',
        safes: 'value[*].safeName',
      },
    },
    cyberarkEpm: {
      endpoint: '/api/v1/users/{userId}/policies',
      method: 'GET',
      description: 'Get user endpoint privileges from CyberArk EPM',
      responseMapping: {
        policies: 'policies',
        applications: 'applications',
        elevationRules: 'elevationRules',
      },
    },
    cyberarkAlero: {
      endpoint: '/api/v1/users/{userId}/sessions',
      method: 'GET',
      description: 'Get user remote access sessions from CyberArk Alero',
      responseMapping: {
        activeSessions: 'sessions',
        targets: 'targets',
        recordings: 'recordings',
      },
    },
    cyberarkConjur: {
      endpoint: '/api/v1/resources/{userId}',
      method: 'GET',
      description: 'Get user secrets access from CyberArk Conjur',
      responseMapping: {
        secrets: 'resources',
        permissions: 'permissions',
      },
    },
    cyberarkDpa: {
      endpoint: '/api/v1/users/{userId}/access',
      method: 'GET',
      description: 'Get user dynamic access from CyberArk DPA',
      responseMapping: {
        accessGrants: 'grants',
        policies: 'policies',
      },
    },
    cyberarkIdentity: {
      endpoint: '/api/v1/users/{userId}/profile',
      method: 'GET',
      description: 'Get user identity info from CyberArk Identity',
      responseMapping: {
        profile: 'user',
        mfaDevices: 'mfaDevices',
        ssoApps: 'applications',
      },
    },
  },

  // ===========================================================================
  // SEARCH - Ops user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/api/Users',
      method: 'GET',
      queryParams: ['search', 'limit', 'offset'],
      description: 'Search users in CyberArk',
      requestMapping: {
        search: '{query}',
        limit: '50',
      },
      responseMapping: {
        userId: 'id',
        name: 'displayName',
        email: 'email',
        accountCount: 'accountCount',
      },
    },
    getUserDetails: {
      endpoint: '/api/Users/{userId}/Details',
      method: 'GET',
      description: 'Get detailed user info from CyberArk',
      responseMapping: {
        // Full user object with accounts, safes, etc.
      },
    },
  },

  // ===========================================================================
  // FAILURES - Ops failure monitoring
  // ===========================================================================
  failures: {
    cyberarkFailures: {
      endpoint: '/api/Audit/Events',
      method: 'GET',
      queryParams: ['eventType', 'status', 'startTime', 'endTime', 'limit'],
      description: 'Get CyberArk PAM failures',
      requestMapping: {
        eventType: 'LOGIN,CHECKOUT,PSM_CONNECT',
        status: 'FAILURE',
        startTime: '{startTime}',
        endTime: '{endTime}',
        limit: '100',
      },
      responseMapping: {
        timestamp: 'eventTime',
        userId: 'userName',
        email: 'userEmail',
        error: 'reason',
        safe: 'safeName',
        account: 'accountName',
        action: 'eventType',
      },
    },
  },

  // ===========================================================================
  // QUICK ACTIONS - Ops actions
  // ===========================================================================
  quickActions: {
    suspendAccount: {
      endpoint: '/api/Users/{userId}/Suspend',
      method: 'POST',
      description: 'Suspend user privileged account access',
      requestBody: {
        reason: '{reason}',
        suspendedBy: '{suspendedBy}',
      },
      successMessage: 'Account suspended',
    },
    rotatePassword: {
      endpoint: '/api/Accounts/{accountId}/Change',
      method: 'POST',
      description: 'Force immediate credential rotation',
      requestBody: {
        immediate: true,
        reason: '{reason}',
      },
      successMessage: 'Password rotation initiated',
    },
    terminateSession: {
      endpoint: '/api/PSM/Sessions/{sessionId}/Terminate',
      method: 'POST',
      description: 'Terminate active PSM session',
      requestBody: {
        reason: '{reason}',
      },
      successMessage: 'Session terminated',
    },
    revokeSafeAccess: {
      endpoint: '/api/Safes/{safeName}/Members/{userId}',
      method: 'DELETE',
      description: 'Remove user from safe membership',
      successMessage: 'Safe access revoked',
    },
  },
};
