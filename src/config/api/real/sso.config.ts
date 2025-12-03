/**
 * SSO Real API Configuration
 * ==========================
 * 
 * Real API endpoints for SSO/Ping Identity systems.
 * Used when SYSTEM_DATA_SOURCE.sso = 'USE_API'
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - PING_API_BASE_URL: Base URL for Ping Identity APIs
 * - PING_CLIENT_ID: OAuth2 client ID
 * - PING_CLIENT_SECRET: OAuth2 client secret
 * 
 * Systems covered:
 * - Ping Directory
 * - Ping Federate
 * - Ping MFA
 * - Ping Access
 * - Ping Authorize
 * - Ping Intelligence
 * 
 * @module config/api/real/sso
 */

import type { RealSystemConfig } from '../types';

export const SSO_REAL_CONFIG: RealSystemConfig = {
  // ===========================================================================
  // CONNECTION SETTINGS
  // ===========================================================================
  connection: {
    baseUrl: process.env.PING_API_BASE_URL || 'https://api.pingidentity.com',
    clientId: process.env.PING_CLIENT_ID || '',
    clientSecret: process.env.PING_CLIENT_SECRET || '',
    authMethod: 'oauth2',
    tokenEndpoint: '/oauth2/token',
    scopes: ['openid', 'profile', 'email', 'directory.read', 'mfa.manage'],
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
    pingDirectory: {
      endpoint: '/directory/v1/users/{userId}',
      method: 'GET',
      description: 'Get user profile from Ping Directory',
      responseMapping: {
        displayName: 'cn',
        email: 'mail',
        department: 'department',
        manager: 'manager',
        groups: 'memberOf',
        status: 'ds-pwp-account-disabled',
        lastLogin: 'ds-pwp-last-login-time',
      },
    },
    pingFederate: {
      endpoint: '/pf/v1/users/{userId}/sessions',
      method: 'GET',
      description: 'Get user SSO sessions from Ping Federate',
      responseMapping: {
        activeSessions: 'sessions.length',
        lastLogin: 'sessions[0].createdAt',
        applications: 'sessions[*].application',
      },
    },
    pingMfa: {
      endpoint: '/mfa/v1/users/{userId}/status',
      method: 'GET',
      description: 'Get user MFA status from Ping MFA',
      responseMapping: {
        enrolled: 'mfaEnabled',
        devices: 'devices',
        preferredMethod: 'preferredMethod',
        lastUsed: 'lastAuthentication',
      },
    },
    pingAccess: {
      endpoint: '/pa/v1/users/{userId}/policies',
      method: 'GET',
      description: 'Get user access policies from Ping Access',
      responseMapping: {
        policies: 'policies',
        applications: 'applications',
      },
    },
    pingAuthorize: {
      endpoint: '/paz/v1/users/{userId}/policies',
      method: 'GET',
      description: 'Get user authorization policies',
      responseMapping: {
        policies: 'policies',
        permissions: 'permissions',
      },
    },
    pingIntelligence: {
      endpoint: '/pi/v1/users/{userId}/risk',
      method: 'GET',
      description: 'Get user risk score from Ping Intelligence',
      responseMapping: {
        riskScore: 'riskScore',
        riskLevel: 'riskLevel',
        anomalies: 'anomalies',
      },
    },
  },

  // ===========================================================================
  // SEARCH - Ops user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/directory/v1/users',
      method: 'GET',
      queryParams: ['filter', 'limit', 'offset'],
      description: 'Search users in Ping Directory',
      requestMapping: {
        filter: '(|(cn=*{query}*)(mail=*{query}*)(uid=*{query}*))',
        limit: '50',
      },
      responseMapping: {
        userId: 'uid',
        name: 'cn',
        email: 'mail',
        department: 'department',
      },
    },
    getUserDetails: {
      endpoint: '/directory/v1/users/{userId}',
      method: 'GET',
      description: 'Get detailed user info from Ping Directory',
      responseMapping: {
        // Full user object
      },
    },
  },

  // ===========================================================================
  // FAILURES - Ops failure monitoring
  // ===========================================================================
  failures: {
    pingFederateAuthFailures: {
      endpoint: '/pf/v1/audit/events',
      method: 'GET',
      queryParams: ['eventType', 'status', 'startTime', 'endTime', 'limit'],
      description: 'Get SSO authentication failures',
      requestMapping: {
        eventType: 'AUTHN_ATTEMPT',
        status: 'FAILURE',
        startTime: '{startTime}',
        endTime: '{endTime}',
        limit: '100',
      },
      responseMapping: {
        timestamp: 'eventTime',
        userId: 'subject.userId',
        email: 'subject.email',
        error: 'outcome.errorMessage',
        application: 'resource.applicationName',
        ipAddress: 'client.ipAddress',
      },
    },
    pingMfaFailures: {
      endpoint: '/mfa/v1/audit/events',
      method: 'GET',
      queryParams: ['eventType', 'status', 'startTime', 'endTime'],
      description: 'Get MFA authentication failures',
      requestMapping: {
        eventType: 'MFA_CHALLENGE',
        status: 'FAILURE',
        startTime: '{startTime}',
        endTime: '{endTime}',
      },
      responseMapping: {
        timestamp: 'eventTime',
        userId: 'userId',
        email: 'email',
        error: 'failureReason',
        device: 'deviceType',
        method: 'mfaMethod',
      },
    },
  },

  // ===========================================================================
  // QUICK ACTIONS - Ops actions
  // ===========================================================================
  quickActions: {
    unlockAccount: {
      endpoint: '/directory/v1/users/{userId}',
      method: 'PATCH',
      description: 'Unlock user account in Ping Directory',
      requestBody: {
        operations: [
          { op: 'replace', path: 'ds-pwp-account-disabled', value: false },
          { op: 'replace', path: 'ds-pwp-account-locked', value: false },
        ],
      },
      successMessage: 'Account unlocked successfully',
    },
    resetPassword: {
      endpoint: '/directory/v1/users/{userId}/password',
      method: 'POST',
      description: 'Reset user password in Ping Directory',
      requestBody: {
        generatePassword: true,
        notifyUser: true,
        requireChange: true,
      },
      successMessage: 'Password reset - email sent to user',
    },
    terminateSessions: {
      endpoint: '/pf/v1/users/{userId}/sessions',
      method: 'DELETE',
      description: 'Terminate all SSO sessions in Ping Federate',
      successMessage: 'All sessions terminated',
    },
    revokeOAuthTokens: {
      endpoint: '/pf/v1/users/{userId}/grants',
      method: 'DELETE',
      description: 'Revoke all OAuth tokens/grants',
      successMessage: 'OAuth tokens revoked',
    },
    resetMfa: {
      endpoint: '/mfa/v1/users/{userId}/devices',
      method: 'DELETE',
      description: 'Clear all MFA devices for user',
      successMessage: 'MFA devices cleared - user must re-enroll',
    },
    bypassMfa: {
      endpoint: '/mfa/v1/users/{userId}/bypass',
      method: 'POST',
      description: 'Enable temporary MFA bypass',
      requestBody: {
        duration: 3600,
        reason: '{reason}',
        approvedBy: '{approvedBy}',
      },
      successMessage: 'MFA bypass enabled for 1 hour',
    },
  },
};
