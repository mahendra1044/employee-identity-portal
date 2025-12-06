/**
 * IGA Mock API Configuration
 * ==========================
 * 
 * Mock API endpoints for IGA/Saviynt systems.
 * Used when SYSTEM_DATA_SOURCE.iga = 'USE_MOCK'
 * 
 * Systems covered:
 * - Saviynt IGA (Core)
 * - Saviynt Certifications
 * - Saviynt Analytics
 * - Saviynt Controls
 * - Saviynt Requests
 * - Saviynt Provisioning
 * 
 * @module config/api/mock/iga
 */

import type { MockSystemConfig } from '../types';

export const IGA_MOCK_CONFIG: MockSystemConfig = {
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
    saviynt: {
      endpoint: '/api/own-saviynt',
      method: 'GET',
      description: 'Get user roles and entitlements from Saviynt',
      mockFile: 'saviynt-initial.json',
    },
    saviyntCertifications: {
      endpoint: '/api/own-saviynt-certifications',
      method: 'GET',
      description: 'Get user pending certifications',
      mockFile: 'saviynt-certifications-initial.json',
    },
    saviyntAnalytics: {
      endpoint: '/api/own-saviynt-analytics',
      method: 'GET',
      description: 'Get user risk analytics',
      mockFile: 'saviynt-analytics-initial.json',
    },
    saviyntControls: {
      endpoint: '/api/own-saviynt-controls',
      method: 'GET',
      description: 'Get user SOD controls',
      mockFile: 'saviynt-controls-initial.json',
    },
    saviyntRequests: {
      endpoint: '/api/own-saviynt-requests',
      method: 'GET',
      description: 'Get user access requests',
      mockFile: 'saviynt-requests-initial.json',
    },
    saviyntProvisioning: {
      endpoint: '/api/own-saviynt-provisioning',
      method: 'GET',
      description: 'Get user provisioning status',
      mockFile: 'saviynt-provisioning-initial.json',
    },
  },

  // ===========================================================================
  // SEARCH - Ops user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/api/search-employee/{query}',
      method: 'GET',
      description: 'Search users in Saviynt',
      mockFile: 'saviynt-search.json',
    },
    getUserDetails: {
      endpoint: '/api/search-employee/{query}/details?system=saviynt',
      method: 'GET',
      description: 'Get detailed user info from Saviynt',
      mockFile: 'saviynt-details.json',
    },
  },

  // ===========================================================================
  // FAILURES - Ops failure monitoring
  // ===========================================================================
  failures: {
    saviyntFailures: {
      endpoint: '/api/ops-failures?system=saviynt&minutes={minutes}',
      method: 'GET',
      description: 'Get Saviynt IGA failures (provisioning, certification, etc.)',
      mockGenerator: 'generateSaviyntFailures',
    },
  },

  // ===========================================================================
  // QUICK ACTIONS - Ops actions
  // ===========================================================================
  quickActions: {
    revokeRole: {
      endpoint: '/api/saviynt/revoke-role',
      method: 'POST',
      description: 'Remove role assignment from user',
      mockResponse: { success: true, message: 'Role revoked successfully' },
    },
    revokeEntitlement: {
      endpoint: '/api/saviynt/revoke-entitlement',
      method: 'POST',
      description: 'Remove entitlement from user',
      mockResponse: { success: true, message: 'Entitlement revoked successfully' },
    },
    disableAccount: {
      endpoint: '/api/saviynt/disable',
      method: 'POST',
      description: 'Disable user account in Saviynt',
      mockResponse: { success: true, message: 'Account disabled' },
    },
    triggerCertification: {
      endpoint: '/api/saviynt/trigger-cert',
      method: 'POST',
      description: 'Force access certification review',
      mockResponse: { success: true, message: 'Certification campaign triggered' },
    },
  },
};
