/**
 * Entra ID Real API Configuration
 * ================================
 * 
 * Real API endpoints for Microsoft Entra ID (Azure AD) via Microsoft Graph.
 * Used when SYSTEM_DATA_SOURCE.entraId = 'USE_API'
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - AZURE_TENANT_ID: Azure AD tenant ID
 * - AZURE_CLIENT_ID: App registration client ID
 * - AZURE_CLIENT_SECRET: App registration client secret
 * 
 * Systems covered:
 * - Azure AD (Core)
 * - Azure AD Users
 * - Azure AD Groups
 * - Azure AD Apps
 * - Azure AD Conditional Access
 * - Azure AD Sign-in Logs
 * 
 * @module config/api/real/entraid
 */

import type { RealSystemConfig } from '../types';

export const ENTRAID_REAL_CONFIG: RealSystemConfig = {
  // ===========================================================================
  // CONNECTION SETTINGS (Microsoft Graph API)
  // ===========================================================================
  connection: {
    baseUrl: 'https://graph.microsoft.com/v1.0',
    tenantId: process.env.AZURE_TENANT_ID || '',
    clientId: process.env.AZURE_CLIENT_ID || '',
    clientSecret: process.env.AZURE_CLIENT_SECRET || '',
    authMethod: 'oauth2',
    tokenEndpoint: 'https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token',
    scopes: [
      'https://graph.microsoft.com/.default',
    ],
    timeout: 30000,
  },

  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ConsistencyLevel': 'eventual',
  },

  // ===========================================================================
  // SYSTEM CARDS - Employee self-service view
  // ===========================================================================
  systemCards: {
    azureAd: {
      endpoint: '/users/{userId}',
      method: 'GET',
      queryParams: ['$select'],
      description: 'Get user profile from Microsoft Entra ID',
      requestMapping: {
        '$select': 'id,displayName,mail,userPrincipalName,jobTitle,department,manager,accountEnabled,createdDateTime,lastSignInDateTime',
      },
      responseMapping: {
        displayName: 'displayName',
        email: 'mail',
        upn: 'userPrincipalName',
        department: 'department',
        jobTitle: 'jobTitle',
        accountEnabled: 'accountEnabled',
        lastSignIn: 'signInActivity.lastSignInDateTime',
      },
    },
    azureAdUsers: {
      endpoint: '/users/{userId}',
      method: 'GET',
      queryParams: ['$select', '$expand'],
      description: 'Get detailed user info from Entra ID',
      requestMapping: {
        '$select': 'id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation,mobilePhone',
        '$expand': 'manager($select=displayName,mail)',
      },
      responseMapping: {
        // Full user profile
      },
    },
    azureAdGroups: {
      endpoint: '/users/{userId}/memberOf',
      method: 'GET',
      queryParams: ['$select', '$top'],
      description: 'Get user group memberships',
      requestMapping: {
        '$select': 'id,displayName,groupTypes,securityEnabled',
        '$top': '100',
      },
      responseMapping: {
        groups: 'value',
        totalCount: '@odata.count',
      },
    },
    azureAdApps: {
      endpoint: '/users/{userId}/appRoleAssignments',
      method: 'GET',
      description: 'Get user app role assignments',
      responseMapping: {
        apps: 'value',
        totalCount: '@odata.count',
      },
    },
    azureAdConditional: {
      endpoint: '/identity/conditionalAccess/policies',
      method: 'GET',
      queryParams: ['$filter'],
      description: 'Get conditional access policies affecting user',
      requestMapping: {
        '$filter': "state eq 'enabled'",
      },
      responseMapping: {
        policies: 'value',
      },
    },
    azureAdSignin: {
      endpoint: '/auditLogs/signIns',
      method: 'GET',
      queryParams: ['$filter', '$top', '$orderby'],
      description: 'Get user sign-in logs',
      requestMapping: {
        '$filter': "userId eq '{userId}'",
        '$top': '50',
        '$orderby': 'createdDateTime desc',
      },
      responseMapping: {
        signIns: 'value',
        totalCount: '@odata.count',
      },
    },
  },

  // ===========================================================================
  // SEARCH - Ops user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/users',
      method: 'GET',
      queryParams: ['$search', '$select', '$top', '$count'],
      description: 'Search users in Microsoft Entra ID',
      requestMapping: {
        '$search': '"displayName:{query}" OR "mail:{query}" OR "userPrincipalName:{query}"',
        '$select': 'id,displayName,mail,userPrincipalName,jobTitle,department,accountEnabled',
        '$top': '50',
        '$count': 'true',
      },
      responseMapping: {
        userId: 'id',
        name: 'displayName',
        email: 'mail',
        upn: 'userPrincipalName',
        department: 'department',
        accountEnabled: 'accountEnabled',
      },
    },
    getUserDetails: {
      endpoint: '/users/{userId}',
      method: 'GET',
      queryParams: ['$select', '$expand'],
      description: 'Get detailed user info from Entra ID',
      requestMapping: {
        '$select': 'id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation,mobilePhone,accountEnabled,createdDateTime',
        '$expand': 'manager($select=displayName,mail),memberOf($select=displayName)',
      },
      responseMapping: {
        // Full user object
      },
    },
  },

  // ===========================================================================
  // FAILURES - Ops failure monitoring
  // ===========================================================================
  failures: {
    azureAdAuthFailures: {
      endpoint: '/auditLogs/signIns',
      method: 'GET',
      queryParams: ['$filter', '$top', '$orderby'],
      description: 'Get Entra ID sign-in failures',
      requestMapping: {
        '$filter': "status/errorCode ne 0 and createdDateTime ge {startTime}",
        '$top': '100',
        '$orderby': 'createdDateTime desc',
      },
      responseMapping: {
        timestamp: 'createdDateTime',
        userId: 'userId',
        email: 'userPrincipalName',
        error: 'status.failureReason',
        errorCode: 'status.errorCode',
        application: 'appDisplayName',
        ipAddress: 'ipAddress',
        location: 'location.city',
      },
    },
    azureAdAccessFailures: {
      endpoint: '/auditLogs/signIns',
      method: 'GET',
      queryParams: ['$filter', '$top', '$orderby'],
      description: 'Get conditional access policy failures',
      requestMapping: {
        '$filter': "conditionalAccessStatus eq 'failure' and createdDateTime ge {startTime}",
        '$top': '100',
        '$orderby': 'createdDateTime desc',
      },
      responseMapping: {
        timestamp: 'createdDateTime',
        userId: 'userId',
        email: 'userPrincipalName',
        error: 'conditionalAccessStatus',
        policies: 'appliedConditionalAccessPolicies',
        application: 'appDisplayName',
      },
    },
  },

  // ===========================================================================
  // QUICK ACTIONS - Ops actions
  // ===========================================================================
  quickActions: {
    blockSignIn: {
      endpoint: '/users/{userId}',
      method: 'PATCH',
      description: 'Block user sign-in in Entra ID',
      requestBody: {
        accountEnabled: false,
      },
      successMessage: 'Sign-in blocked',
    },
    revokeSessions: {
      endpoint: '/users/{userId}/revokeSignInSessions',
      method: 'POST',
      description: 'Revoke all refresh tokens and sessions',
      successMessage: 'All sessions revoked - user must re-authenticate',
    },
    removeFromGroup: {
      endpoint: '/groups/{groupId}/members/{userId}/$ref',
      method: 'DELETE',
      description: 'Remove user from security group',
      successMessage: 'Removed from group',
    },
    disableMfa: {
      endpoint: '/users/{userId}/authentication/methods',
      method: 'GET',
      description: 'List MFA methods (then delete individually)',
      // Note: Removing MFA methods requires individual DELETE calls per method
      successMessage: 'MFA methods listed - individual removal required',
    },
  },
};
