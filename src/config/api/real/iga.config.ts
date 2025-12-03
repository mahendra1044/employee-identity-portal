/**
 * IGA Real API Configuration
 * ==========================
 * 
 * Real API endpoints for IGA/Saviynt systems.
 * Used when SYSTEM_DATA_SOURCE.iga = 'USE_API'
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - SAVIYNT_API_BASE_URL: Base URL for Saviynt EIC
 * - SAVIYNT_CLIENT_ID: OAuth2 client ID
 * - SAVIYNT_CLIENT_SECRET: OAuth2 client secret
 * 
 * Systems covered:
 * - Saviynt IGA (Core)
 * - Saviynt Certifications
 * - Saviynt Analytics
 * - Saviynt Controls
 * - Saviynt Requests
 * - Saviynt Provisioning
 * 
 * @module config/api/real/iga
 */

import type { RealSystemConfig } from '../types';

export const IGA_REAL_CONFIG: RealSystemConfig = {
  // ===========================================================================
  // CONNECTION SETTINGS
  // ===========================================================================
  connection: {
    baseUrl: process.env.SAVIYNT_API_BASE_URL || 'https://saviynt.company.com/ECM/api/v5',
    clientId: process.env.SAVIYNT_CLIENT_ID || '',
    clientSecret: process.env.SAVIYNT_CLIENT_SECRET || '',
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
    saviynt: {
      endpoint: '/getUser',
      method: 'POST',
      description: 'Get user roles and entitlements from Saviynt',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        displayName: 'displayname',
        email: 'email',
        roles: 'roles',
        entitlements: 'entitlements',
        accounts: 'accounts',
        riskScore: 'riskScore',
      },
    },
    saviyntCertifications: {
      endpoint: '/getCertifications',
      method: 'POST',
      description: 'Get user pending certifications',
      requestBody: {
        certifier: '{userId}',
        status: 'PENDING',
      },
      responseMapping: {
        pendingCount: 'totalCount',
        certifications: 'certifications',
        dueDate: 'nextDueDate',
      },
    },
    saviyntAnalytics: {
      endpoint: '/getUserAnalytics',
      method: 'POST',
      description: 'Get user risk analytics',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        riskScore: 'overallRiskScore',
        riskLevel: 'riskLevel',
        anomalies: 'anomalies',
        recommendations: 'recommendations',
      },
    },
    saviyntControls: {
      endpoint: '/getSODViolations',
      method: 'POST',
      description: 'Get user SOD controls',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        violations: 'violations',
        controlsApplied: 'controls',
        riskMitigations: 'mitigations',
      },
    },
    saviyntRequests: {
      endpoint: '/getAccessRequests',
      method: 'POST',
      description: 'Get user access requests',
      requestBody: {
        requester: '{userId}',
      },
      responseMapping: {
        pendingRequests: 'pending',
        approvedRequests: 'approved',
        rejectedRequests: 'rejected',
      },
    },
    saviyntProvisioning: {
      endpoint: '/getProvisioningTasks',
      method: 'POST',
      description: 'Get user provisioning status',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        pendingTasks: 'pending',
        completedTasks: 'completed',
        failedTasks: 'failed',
      },
    },
  },

  // ===========================================================================
  // SEARCH - Ops user search
  // ===========================================================================
  search: {
    searchUsers: {
      endpoint: '/searchUsers',
      method: 'POST',
      description: 'Search users in Saviynt',
      requestBody: {
        searchCriteria: '{query}',
        max: 50,
        offset: 0,
      },
      responseMapping: {
        userId: 'username',
        name: 'displayname',
        email: 'email',
        status: 'status',
        riskScore: 'riskScore',
      },
    },
    getUserDetails: {
      endpoint: '/getUser',
      method: 'POST',
      description: 'Get detailed user info from Saviynt',
      requestBody: {
        username: '{userId}',
      },
      responseMapping: {
        // Full user object with roles, entitlements, accounts
      },
    },
  },

  // ===========================================================================
  // FAILURES - Ops failure monitoring
  // ===========================================================================
  failures: {
    saviyntFailures: {
      endpoint: '/getAuditLogs',
      method: 'POST',
      description: 'Get Saviynt IGA failures',
      requestBody: {
        eventType: 'PROVISIONING,CERTIFICATION,ACCESS_REQUEST',
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
        target: 'targetSystem',
      },
    },
  },

  // ===========================================================================
  // QUICK ACTIONS - Ops actions
  // ===========================================================================
  quickActions: {
    revokeRole: {
      endpoint: '/revokeRole',
      method: 'POST',
      description: 'Remove role assignment from user',
      requestBody: {
        username: '{userId}',
        rolename: '{roleName}',
        reason: '{reason}',
        revokedBy: '{revokedBy}',
      },
      successMessage: 'Role revoked successfully',
    },
    revokeEntitlement: {
      endpoint: '/revokeEntitlement',
      method: 'POST',
      description: 'Remove entitlement from user',
      requestBody: {
        username: '{userId}',
        entitlement: '{entitlementName}',
        endpoint: '{endpointName}',
        reason: '{reason}',
      },
      successMessage: 'Entitlement revoked successfully',
    },
    disableAccount: {
      endpoint: '/updateUser',
      method: 'POST',
      description: 'Disable user account in Saviynt',
      requestBody: {
        username: '{userId}',
        statuskey: 'Inactive',
        reason: '{reason}',
      },
      successMessage: 'Account disabled',
    },
    triggerCertification: {
      endpoint: '/triggerCertification',
      method: 'POST',
      description: 'Force access certification review',
      requestBody: {
        username: '{userId}',
        certificationName: 'Emergency_Review',
        priority: 'HIGH',
      },
      successMessage: 'Certification campaign triggered',
    },
  },
};
