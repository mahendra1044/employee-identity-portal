/**
 * Entra ID Mock API Configuration
 * ================================
 * 
 * Mock API endpoints for Microsoft Entra ID (Azure AD) systems.
 * Used when SYSTEM_DATA_SOURCE.entraId = 'USE_MOCK'
 * 
 * Systems covered:
 * - Azure AD (Core)
 * - Azure AD Users
 * - Azure AD Groups
 * - Azure AD Apps
 * - Azure AD Conditional Access
 * - Azure AD Sign-in Logs
 * 
 * @module config/api/mock/entraid
 */

import type { MockSystemConfig } from '../types';

export const ENTRAID_MOCK_CONFIG: MockSystemConfig = {
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
    azureAd: {
      endpoint: '/api/own-azure-ad',
      method: 'GET',
      description: 'Get user profile from Microsoft Entra ID',
      mockFile: 'azure-ad-initial.json',
    },
    azureAdUsers: {
      endpoint: '/api/own-azure-ad-users',
      method: 'GET',
      description: 'Get user details from Entra ID',
      mockFile: 'azure-ad-users-initial.json',
    },
    azureAdGroups: {
      endpoint: '/api/own-azure-ad-groups',
      method: 'GET',
      description: 'Get user group memberships',
      mockFile: 'azure-ad-groups-initial.json',
    },
    azureAdApps: {
      endpoint: '/api/own-azure-ad-apps',
      method: 'GET',
      description: 'Get user app registrations/consents',
      mockFile: 'azure-ad-apps-initial.json',
    },
    azureAdConditional: {
      endpoint: '/api/own-azure-ad-conditional',
      method: 'GET',
      description: 'Get conditional access policies for user',
      mockFile: 'azure-ad-conditional-initial.json',
    },
    azureAdSignin: {
      endpoint: '/api/own-azure-ad-signin',
      method: 'GET',
      description: 'Get user sign-in logs',
      mockFile: 'azure-ad-signin-initial.json',
    },
  },

  // ===========================================================================
  // SEARCH - Ops user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/api/search-employee/{query}',
      method: 'GET',
      description: 'Search users in Microsoft Entra ID',
      mockFile: 'azure-ad-search.json',
    },
    getUserDetails: {
      endpoint: '/api/search-employee/{query}/details?system=azure-ad',
      method: 'GET',
      description: 'Get detailed user info from Entra ID',
      mockFile: 'azure-ad-details.json',
    },
  },

  // ===========================================================================
  // FAILURES - Ops failure monitoring
  // ===========================================================================
  failures: {
    azureAdAuthFailures: {
      endpoint: '/api/ops-failures?system=azure-ad-auth&minutes={minutes}',
      method: 'GET',
      description: 'Get Entra ID sign-in failures',
      mockGenerator: 'generateAzureAdAuthFailures',
    },
    azureAdAccessFailures: {
      endpoint: '/api/ops-failures?system=azure-ad-access&minutes={minutes}',
      method: 'GET',
      description: 'Get conditional access policy failures',
      mockGenerator: 'generateAzureAdAccessFailures',
    },
  },

  // ===========================================================================
  // QUICK ACTIONS - Ops actions
  // ===========================================================================
  quickActions: {
    blockSignIn: {
      endpoint: '/api/aad/block-signin',
      method: 'POST',
      description: 'Block user sign-in in Entra ID',
      mockResponse: { success: true, message: 'Sign-in blocked' },
    },
    revokeSessions: {
      endpoint: '/api/aad/revoke-sessions',
      method: 'POST',
      description: 'Revoke all refresh tokens/sessions',
      mockResponse: { success: true, message: 'All sessions revoked' },
    },
    removeFromGroup: {
      endpoint: '/api/aad/remove-group',
      method: 'POST',
      description: 'Remove user from security group',
      mockResponse: { success: true, message: 'Removed from group' },
    },
    disableMfa: {
      endpoint: '/api/aad/disable-mfa',
      method: 'POST',
      description: 'Remove MFA authentication methods',
      mockResponse: { success: true, message: 'MFA methods removed' },
    },
  },
};
