/**
 * TPAG Real API Configuration
 * ===========================
 * 
 * Real API endpoints for Third Party Access Governance (TPAG) systems.
 * Used when SYSTEM_DATA_SOURCE.tpag = 'USE_API'
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - TPAG_API_BASE_URL: Base URL for TPAG API (typically Saviynt TPAG module)
 * - TPAG_CLIENT_ID: OAuth2 client ID
 * - TPAG_CLIENT_SECRET: OAuth2 client secret
 * 
 * Systems covered:
 * - TPAG Overview
 * - TPAG Vendors
 * - TPAG Contracts
 * - TPAG Access
 * - TPAG Risk
 * - TPAG Lifecycle
 * 
 * @module config/api/real/tpag
 */

import type { RealSystemConfig } from '../types';

export const TPAG_REAL_CONFIG: RealSystemConfig = {
  // ===========================================================================
  // CONNECTION SETTINGS
  // ===========================================================================
  connection: {
    baseUrl: process.env.TPAG_API_BASE_URL || 'https://saviynt.company.com/ECM/api/v5/tpag',
    clientId: process.env.TPAG_CLIENT_ID || '',
    clientSecret: process.env.TPAG_CLIENT_SECRET || '',
    authMethod: 'oauth2',
    tokenEndpoint: '/oauth2/token',
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
    saviyntTpag: {
      endpoint: '/getThirdPartyUser',
      method: 'POST',
      description: 'Get TPAG overview for user',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        vendor: 'vendorName',
        contract: 'contractName',
        accessLevel: 'accessLevel',
        expiryDate: 'contractEndDate',
        riskScore: 'riskScore',
      },
    },
    saviyntTpagVendors: {
      endpoint: '/getVendorDetails',
      method: 'POST',
      description: 'Get vendor associations',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        vendors: 'vendors',
        primaryVendor: 'primaryVendor',
        vendorContacts: 'contacts',
      },
    },
    saviyntTpagContracts: {
      endpoint: '/getContractDetails',
      method: 'POST',
      description: 'Get contract details',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        contracts: 'contracts',
        activeContracts: 'active',
        expiredContracts: 'expired',
        expiringContracts: 'expiringSoon',
      },
    },
    saviyntTpagAccess: {
      endpoint: '/getThirdPartyAccess',
      method: 'POST',
      description: 'Get third-party access grants',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        accessGrants: 'grants',
        applications: 'applications',
        permissions: 'permissions',
      },
    },
    saviyntTpagRisk: {
      endpoint: '/getThirdPartyRisk',
      method: 'POST',
      description: 'Get third-party risk assessment',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        riskScore: 'overallRiskScore',
        riskLevel: 'riskLevel',
        riskFactors: 'factors',
        recommendations: 'recommendations',
      },
    },
    saviyntTpagLifecycle: {
      endpoint: '/getLifecycleStatus',
      method: 'POST',
      description: 'Get third-party lifecycle status',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        status: 'lifecycleStatus',
        startDate: 'engagementStartDate',
        endDate: 'engagementEndDate',
        onboardingStatus: 'onboarding',
        offboardingStatus: 'offboarding',
      },
    },
  },

  // ===========================================================================
  // SEARCH - Ops user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/searchThirdPartyUsers',
      method: 'POST',
      description: 'Search third-party users',
      requestBody: {
        searchCriteria: '{query}',
        max: 50,
        offset: 0,
      },
      responseMapping: {
        userId: 'username',
        name: 'displayname',
        email: 'email',
        vendor: 'vendorName',
        status: 'status',
      },
    },
    getUserDetails: {
      endpoint: '/getThirdPartyUser',
      method: 'POST',
      description: 'Get detailed third-party user info',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        // Full third-party user object
      },
    },
  },

  // ===========================================================================
  // FAILURES - Ops failure monitoring
  // ===========================================================================
  failures: {
    tpagFailures: {
      endpoint: '/getTPAGAuditLogs',
      method: 'POST',
      description: 'Get TPAG failures',
      requestBody: {
        eventType: 'ACCESS_GRANT,LIFECYCLE,CONTRACT',
        status: 'FAILURE',
        startDate: '{startTime}',
        endDate: '{endTime}',
        max: 100,
      },
      responseMapping: {
        timestamp: 'eventDate',
        userId: 'username',
        email: 'email',
        error: 'errorMessage',
        action: 'eventType',
        vendor: 'vendorName',
      },
    },
  },

  // ===========================================================================
  // QUICK ACTIONS - Ops actions
  // ===========================================================================
  quickActions: {
    suspendVendorAccess: {
      endpoint: '/suspendThirdPartyAccess',
      method: 'POST',
      description: 'Suspend third-party vendor access',
      requestBody: {
        username: '{userId}',
        reason: '{reason}',
        suspendedBy: '{suspendedBy}',
      },
      successMessage: 'Vendor access suspended',
    },
    terminateContract: {
      endpoint: '/terminateContract',
      method: 'POST',
      description: 'Terminate third-party contract',
      requestBody: {
        username: '{userId}',
        contractId: '{contractId}',
        reason: '{reason}',
        terminatedBy: '{terminatedBy}',
      },
      successMessage: 'Contract terminated',
    },
    revokeAccess: {
      endpoint: '/revokeThirdPartyAccess',
      method: 'POST',
      description: 'Revoke specific third-party access',
      requestBody: {
        username: '{userId}',
        accessGrant: '{accessGrantId}',
        reason: '{reason}',
      },
      successMessage: 'Access revoked',
    },
  },
};
