/**
 * TPAG Mock API Configuration
 * ===========================
 * 
 * Mock API endpoints for Third Party Access Governance (TPAG) systems.
 * Used when SYSTEM_DATA_SOURCE.tpag = 'USE_MOCK'
 * 
 * Systems covered:
 * - TPAG Overview
 * - TPAG Vendors
 * - TPAG Contracts
 * - TPAG Access
 * - TPAG Risk
 * - TPAG Lifecycle
 * 
 * @module config/api/mock/tpag
 */

import type { MockSystemConfig } from '../types';

export const TPAG_MOCK_CONFIG: MockSystemConfig = {
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
    saviyntTpag: {
      endpoint: '/api/own-saviynt-tpag',
      method: 'GET',
      description: 'Get TPAG overview for user',
      mockFile: 'saviynt-tpag-initial.json',
    },
    saviyntTpagVendors: {
      endpoint: '/api/own-saviynt-tpag-vendors',
      method: 'GET',
      description: 'Get vendor associations',
      mockFile: 'saviynt-tpag-vendors-initial.json',
    },
    saviyntTpagContracts: {
      endpoint: '/api/own-saviynt-tpag-contracts',
      method: 'GET',
      description: 'Get contract details',
      mockFile: 'saviynt-tpag-contracts-initial.json',
    },
    saviyntTpagAccess: {
      endpoint: '/api/own-saviynt-tpag-access',
      method: 'GET',
      description: 'Get third-party access grants',
      mockFile: 'saviynt-tpag-access-initial.json',
    },
    saviyntTpagRisk: {
      endpoint: '/api/own-saviynt-tpag-risk',
      method: 'GET',
      description: 'Get third-party risk assessment',
      mockFile: 'saviynt-tpag-risk-initial.json',
    },
    saviyntTpagLifecycle: {
      endpoint: '/api/own-saviynt-tpag-lifecycle',
      method: 'GET',
      description: 'Get third-party lifecycle status',
      mockFile: 'saviynt-tpag-lifecycle-initial.json',
    },
  },

  // ===========================================================================
  // SEARCH - Ops user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/api/search-employee/{query}',
      method: 'GET',
      description: 'Search third-party users',
      mockFile: 'saviynt-tpag-search.json',
    },
    getUserDetails: {
      endpoint: '/api/search-employee/{query}/details?system=saviynt-tpag',
      method: 'GET',
      description: 'Get detailed third-party user info',
      mockFile: 'saviynt-tpag-details.json',
    },
  },

  // ===========================================================================
  // FAILURES - Ops failure monitoring
  // ===========================================================================
  failures: {
    tpagFailures: {
      endpoint: '/api/ops-failures?system=saviynt-tpag&minutes={minutes}',
      method: 'GET',
      description: 'Get TPAG failures (access, lifecycle, etc.)',
      mockGenerator: 'generateTpagFailures',
    },
  },

  // ===========================================================================
  // QUICK ACTIONS - Ops actions
  // ===========================================================================
  quickActions: {
    suspendVendorAccess: {
      endpoint: '/api/tpag/suspend-access',
      method: 'POST',
      description: 'Suspend third-party vendor access',
      mockResponse: { success: true, message: 'Vendor access suspended' },
    },
    terminateContract: {
      endpoint: '/api/tpag/terminate-contract',
      method: 'POST',
      description: 'Terminate third-party contract',
      mockResponse: { success: true, message: 'Contract terminated' },
    },
    revokeAccess: {
      endpoint: '/api/tpag/revoke-access',
      method: 'POST',
      description: 'Revoke specific third-party access',
      mockResponse: { success: true, message: 'Access revoked' },
    },
  },
};
