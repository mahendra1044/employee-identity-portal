import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Map system names to their details file paths
const SYSTEM_DETAILS_FILES: Record<string, string> = {
  'ping-directory': 'ping-directory-details.json',
  'ping-federate': 'ping-federate-details.json',
  'ping-mfa': 'ping-mfa-details.json',
  'azure-ad': 'azure-ad-details.json',
  'cyberark': 'cyberark-details.json',
  'saviynt': 'saviynt-details.json',
  'ping-access': 'ping-access-search.json',
  'ping-authorize': 'ping-authorize-search.json',
  'ping-intelligence': 'ping-intelligence-search.json',
};

// Saviynt sub-systems that use saviynt-details.json with computed data
const SAVIYNT_SUB_SYSTEMS = ['saviynt', 'saviynt-certifications', 'saviynt-analytics', 'saviynt-controls', 'saviynt-requests', 'saviynt-provisioning'];

// EntraAD sub-systems that use azure-ad-details.json with computed data
const ENTRAID_SUB_SYSTEMS = ['azure-ad', 'azure-ad-users', 'azure-ad-groups', 'azure-ad-apps', 'azure-ad-conditional', 'azure-ad-signin'];

// TPAG sub-systems that use saviynt-tpag-details.json with computed data
const TPAG_SUB_SYSTEMS = ['saviynt-tpag', 'saviynt-tpag-vendors', 'saviynt-tpag-contracts', 'saviynt-tpag-access', 'saviynt-tpag-risk', 'saviynt-tpag-lifecycle'];

// Generate detailed CyberArk mock data for all 6 systems
function generateCyberArkDetailsData(system: string, userId: string, email: string) {
  const failureUsers = ['u1003', 'u1007', 'u1012', 'u1018'];
  const hasFailure = failureUsers.includes(userId);

  const dataGenerators: Record<string, any> = {
    'cyberark': hasFailure ? {
      userId,
      error: 'Access denied',
      status: 'failed',
      message: 'User does not have PAM vault access',
    } : {
      userId,
      safe: 'CORP-APP-PROD',
      account: `svc_${email.split('@')[0]}`,
      access: 'granted',
      credentialStatus: 'available',
      lastChecked: new Date().toISOString(),
      permissions: ['view', 'use'],
      vaultId: 'vault-001',
      platform: 'Windows',
      address: '10.0.0.50',
      history: [
        { action: 'checkout', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'return', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString() },
      ],
      policies: ['safe-member', 'account-owner'],
      secrets: 'Redacted for security',
    },
    'cyberark-epm': hasFailure ? {
      userId,
      error: 'Policy not found',
      status: 'failed',
      message: 'No EPM policy assigned to user',
    } : {
      userId,
      policyName: 'Standard User Policy',
      policyStatus: 'active',
      elevationRequests: Math.floor(Math.random() * 20),
      applicationsManaged: Math.floor(Math.random() * 50) + 20,
      lastPolicyUpdate: new Date().toISOString(),
      privilegeLevel: 'standard',
      endpointProtection: 'enabled',
      complianceScore: Math.floor(Math.random() * 20) + 80,
      lastAudit: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      recentElevations: [
        { application: 'cmd.exe', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'approved' },
        { application: 'regedit.exe', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'approved' },
        { application: 'powershell.exe', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'denied' },
      ],
      endpointDetails: {
        hostname: `LAPTOP-${userId.toUpperCase()}`,
        os: 'Windows 11 Enterprise',
        agentVersion: '12.6.5',
        lastSync: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      },
      securityEvents: Math.floor(Math.random() * 5),
      blockedApplications: ['malware.exe', 'suspicious.bat'],
      trustedApplications: ['chrome.exe', 'code.exe', 'outlook.exe'],
    },
    'cyberark-alero': hasFailure ? {
      userId,
      error: 'Remote access disabled',
      status: 'failed',
      message: 'User not authorized for remote access',
    } : {
      userId,
      remoteAccessStatus: 'enabled',
      activeSessions: 0,
      totalSessions: Math.floor(Math.random() * 100) + 20,
      lastConnection: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      connectionType: 'vendor-access',
      accessLevel: 'read-write',
      multiFactorAuth: 'enabled',
      sessionRecording: 'enabled',
      maxSessionDuration: '4 hours',
      recentSessions: [
        { target: 'PROD-DB-01', startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), duration: '45 minutes', status: 'completed' },
        { target: 'PROD-WEB-02', startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), duration: '2 hours', status: 'completed' },
        { target: 'PROD-APP-03', startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), duration: '1.5 hours', status: 'completed' },
      ],
      authorizedTargets: ['PROD-DB-01', 'PROD-WEB-02', 'PROD-APP-03', 'DEV-SERVER-01'],
      connectionProtocols: ['RDP', 'SSH', 'HTTPS'],
      recordingsAvailable: Math.floor(Math.random() * 50) + 20,
      complianceReports: 'monthly',
      sessionAuditLog: 'enabled',
    },
    'cyberark-conjur': hasFailure ? {
      userId,
      error: 'Secrets access denied',
      status: 'failed',
      message: 'User does not have Conjur vault permissions',
    } : {
      userId,
      secretsManaged: Math.floor(Math.random() * 30) + 10,
      vaultsAccess: ['production-vault', 'staging-vault'],
      lastSecretRetrieval: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      apiKeysManaged: Math.floor(Math.random() * 10) + 3,
      certificatesManaged: Math.floor(Math.random() * 8) + 2,
      rotationPolicy: '90-day',
      accessLevel: 'developer',
      conjurRole: 'app-developer',
      permissions: ['read', 'execute'],
      secretTypes: {
        databaseCredentials: Math.floor(Math.random() * 15) + 5,
        apiKeys: Math.floor(Math.random() * 10) + 3,
        sslCertificates: Math.floor(Math.random() * 8) + 2,
      },
      recentRetrievals: [
        { secretName: 'prod-db-password', timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), application: 'web-app' },
        { secretName: 'api-key-stripe', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), application: 'payment-service' },
        { secretName: 'staging-db-password', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), application: 'web-app' },
      ],
      rotationSchedule: {
        nextRotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastRotation: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        rotationInterval: '90 days',
      },
      auditLogs: 'enabled',
      complianceStatus: 'compliant',
    },
    'cyberark-dpa': hasFailure ? {
      userId,
      error: 'DPA authorization failed',
      status: 'failed',
      message: 'No active authorizations found',
    } : {
      userId,
      privilegeLevel: 'just-in-time',
      activeAuthorizations: Math.floor(Math.random() * 3),
      requestsPending: 0,
      lastAuthorization: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      authorizationDuration: '2 hours',
      approvalRequired: true,
      riskScore: ['low', 'medium'][Math.floor(Math.random() * 2)],
      complianceChecks: 'passed',
      temporaryAccess: ['prod-database-write', 'prod-server-admin'].slice(0, Math.floor(Math.random() * 2) + 1),
      authorizationHistory: [
        { resource: 'prod-database-write', requestTime: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), duration: '2 hours', status: 'active', approver: 'manager@company.com' },
        { resource: 'prod-server-admin', requestTime: new Date(Date.now() - 0.6 * 24 * 60 * 60 * 1000).toISOString(), duration: '2 hours', status: 'active', approver: 'manager@company.com' },
        { resource: 'prod-backup-access', requestTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), duration: '1 hour', status: 'expired', approver: 'manager@company.com' },
      ],
      riskAssessment: {
        score: ['low', 'medium'][Math.floor(Math.random() * 2)],
        factors: ['time-of-day: normal', 'location: office', 'behavior: consistent'],
        lastAssessment: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      policiesApplied: ['JIT-Access-Policy', 'Time-Limited-Authorization'],
      approvalWorkflow: 'manager-approval',
      auditTrail: 'complete',
    },
    'cyberark-identity': hasFailure ? {
      userId,
      error: 'Identity not found',
      status: 'failed',
      message: 'User identity not provisioned in CyberArk Identity',
    } : {
      userId,
      identityStatus: 'active',
      mfaEnabled: true,
      ssoApplications: Math.floor(Math.random() * 10) + 10,
      lastLogin: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      riskScore: ['low', 'medium'][Math.floor(Math.random() * 2)],
      authenticatorApps: 2,
      passwordLastChanged: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      accountLockStatus: 'unlocked',
      failedLoginAttempts: 0,
      registeredDevices: [
        { deviceName: 'iPhone 14 Pro', deviceType: 'mobile', lastUsed: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), trusted: true },
        { deviceName: 'MacBook Pro', deviceType: 'desktop', lastUsed: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000).toISOString(), trusted: true },
      ],
      ssoApplicationsList: [
        'Salesforce', 'Office 365', 'Slack', 'GitHub', 'AWS Console',
        'Jira', 'Confluence', 'Zoom', 'DocuSign', 'ServiceNow',
        'Okta', 'Google Workspace', 'Azure Portal', 'Workday', 'SAP'
      ],
      recentLoginHistory: [
        { timestamp: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000).toISOString(), location: 'San Francisco, CA', device: 'MacBook Pro', status: 'success' },
        { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), location: 'San Francisco, CA', device: 'iPhone 14 Pro', status: 'success' },
        { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), location: 'San Francisco, CA', device: 'MacBook Pro', status: 'success' },
      ],
      securityPolicies: ['password-complexity', 'mfa-required', 'session-timeout-30min'],
      roles: ['employee', 'developer'],
      groups: ['engineering', 'full-time'],
    },
  };

  return dataGenerators[system] || null;
}

// Generate Saviynt sub-system mock data
function generateSaviyntSubSystemData(system: string, userId: string, baseData: any) {
  const failureUsers = ['u1003', 'u1007', 'u1012', 'u1018'];
  const hasFailure = failureUsers.includes(userId);

  // For base saviynt system, return as-is
  if (system === 'saviynt') {
    return baseData;
  }

  // Extract relevant data based on sub-system
  const dataGenerators: Record<string, any> = {
    'saviynt-certifications': hasFailure ? {
      userId,
      error: 'Certification access denied',
      status: 'failed',
      message: 'User does not have access to certification campaigns',
    } : {
      userId,
      displayName: baseData.displayName,
      certifications: baseData.certifications || [],
      activeCampaigns: Math.floor(Math.random() * 3) + 1,
      completedCertifications: Math.floor(Math.random() * 10) + 5,
      pendingReviews: Math.floor(Math.random() * 5),
      complianceStatus: 'compliant',
      lastCertificationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      upcomingDeadlines: [
        { campaign: 'Q2 Access Review', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), itemsToReview: Math.floor(Math.random() * 10) + 5 },
        { campaign: 'Privileged Access Certification', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), itemsToReview: Math.floor(Math.random() * 5) + 2 },
      ],
    },
    'saviynt-analytics': hasFailure ? {
      userId,
      error: 'Analytics unavailable',
      status: 'failed',
      message: 'User analytics data not found',
    } : {
      userId,
      displayName: baseData.displayName,
      analytics: baseData.analytics || {},
      risk: baseData.risk || {},
      riskTrend: ['stable', 'increasing', 'decreasing'][Math.floor(Math.random() * 3)],
      peerGroupComparison: {
        avgRiskScore: 35,
        userRiskScore: baseData.risk?.score || 30,
        percentile: Math.floor(Math.random() * 40) + 30,
      },
      anomalyDetection: {
        recentAnomalies: Math.floor(Math.random() * 3),
        lastAnomaly: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        anomalyTypes: ['Unusual access time', 'New application access', 'Geographic anomaly'].slice(0, Math.floor(Math.random() * 3) + 1),
      },
      accessPatterns: {
        mostAccessedApps: ['SAP', 'ServiceNow', 'Workday', 'Salesforce'].slice(0, Math.floor(Math.random() * 3) + 2),
        peakAccessHours: '9 AM - 11 AM',
        averageSessionDuration: '45 minutes',
      },
    },
    'saviynt-controls': hasFailure ? {
      userId,
      error: 'Controls data unavailable',
      status: 'failed',
      message: 'Unable to retrieve SOD and policy data',
    } : {
      userId,
      displayName: baseData.displayName,
      controls: baseData.controls || {},
      sodViolations: baseData.controls?.sodViolations || [],
      policyExceptions: baseData.controls?.policyExceptions || [],
      mitigatingControls: baseData.controls?.mitigatingControls || [],
      riskRating: ['low', 'medium', 'high'][Math.floor(Math.random() * 2)],
      lastReviewDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      controlEffectiveness: Math.floor(Math.random() * 20) + 80,
      complianceFrameworks: ['SOX', 'GDPR', 'HIPAA'].slice(0, Math.floor(Math.random() * 2) + 1),
    },
    'saviynt-requests': hasFailure ? {
      userId,
      error: 'Request history unavailable',
      status: 'failed',
      message: 'Unable to retrieve access request history',
    } : {
      userId,
      displayName: baseData.displayName,
      pendingRequests: Math.floor(Math.random() * 3),
      approvedRequests: Math.floor(Math.random() * 20) + 10,
      deniedRequests: Math.floor(Math.random() * 5),
      recentRequests: [
        { requestId: `REQ-${Math.floor(Math.random() * 10000)}`, type: 'Application Access', application: 'SAP HR', status: 'approved', requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { requestId: `REQ-${Math.floor(Math.random() * 10000)}`, type: 'Role Assignment', role: 'Finance Analyst', status: 'pending', requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { requestId: `REQ-${Math.floor(Math.random() * 10000)}`, type: 'Entitlement', entitlement: 'DB Admin', status: 'denied', requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      averageApprovalTime: '4 hours',
      selfServiceEnabled: true,
    },
    'saviynt-provisioning': hasFailure ? {
      userId,
      error: 'Provisioning data unavailable',
      status: 'failed',
      message: 'Unable to retrieve provisioning status',
    } : {
      userId,
      displayName: baseData.displayName,
      provisioning: baseData.provisioning || {},
      provisionedApplications: Math.floor(Math.random() * 15) + 10,
      pendingProvisioningTasks: baseData.provisioning?.pendingTasks || Math.floor(Math.random() * 3),
      lastProvisioningAction: baseData.provisioning?.lastProvisioned || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      provisioningStatus: baseData.provisioning?.status || 'complete',
      recentProvisioningActions: [
        { action: 'Account Created', target: 'ServiceNow', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'success' },
        { action: 'Role Assigned', target: 'SAP', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'success' },
        { action: 'Access Revoked', target: 'Legacy HR System', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'success' },
      ],
      connectorHealth: {
        activeConnectors: Math.floor(Math.random() * 10) + 15,
        failedConnectors: 0,
        lastHealthCheck: new Date().toISOString(),
      },
    },
  };

  return dataGenerators[system] || null;
}

// Generate EntraAD sub-system mock data
function generateEntraADSubSystemData(system: string, userId: string, baseData: any) {
  const failureUsers = ['u1003', 'u1007', 'u1012', 'u1018'];
  const hasFailure = failureUsers.includes(userId);

  // For base azure-ad system, return as-is
  if (system === 'azure-ad') {
    return baseData;
  }

  // Extract relevant data based on sub-system
  const dataGenerators: Record<string, any> = {
    'azure-ad-users': hasFailure ? {
      userId,
      error: 'User management access denied',
      status: 'failed',
      message: 'Unable to retrieve user management data',
    } : {
      userId,
      upn: baseData.upn,
      displayName: baseData.displayName || baseData.jobTitle,
      department: baseData.department,
      manager: baseData.manager,
      accountEnabled: true,
      userType: 'Member',
      createdDateTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastPasswordChangeDateTime: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      licenses: baseData.licenses || [],
      assignedPlans: Math.floor(Math.random() * 20) + 10,
      riskLevel: baseData.signInRisk || 'low',
      onPremisesSyncEnabled: Math.random() > 0.3,
    },
    'azure-ad-groups': hasFailure ? {
      userId,
      error: 'Group access denied',
      status: 'failed',
      message: 'Unable to retrieve group membership data',
    } : {
      userId,
      displayName: baseData.displayName || baseData.jobTitle,
      memberOf: baseData.groups || [],
      ownedGroups: Math.floor(Math.random() * 3),
      securityGroups: Math.floor(Math.random() * 5) + 2,
      m365Groups: Math.floor(Math.random() * 4) + 1,
      dynamicGroups: Math.floor(Math.random() * 2),
      groupTypes: ['Security', 'Microsoft 365', 'Distribution'].slice(0, Math.floor(Math.random() * 2) + 1),
      lastGroupChange: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'azure-ad-apps': hasFailure ? {
      userId,
      error: 'App access unavailable',
      status: 'failed',
      message: 'Unable to retrieve application assignments',
    } : {
      userId,
      displayName: baseData.displayName || baseData.jobTitle,
      assignedApps: Math.floor(Math.random() * 15) + 8,
      consentedApps: Math.floor(Math.random() * 10) + 5,
      enterpriseApps: [
        { name: 'Microsoft 365', type: 'Enterprise', lastUsed: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Salesforce', type: 'Enterprise', lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'ServiceNow', type: 'Enterprise', lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      pendingConsent: Math.floor(Math.random() * 2),
      appRoleAssignments: Math.floor(Math.random() * 8) + 3,
    },
    'azure-ad-conditional': hasFailure ? {
      userId,
      error: 'Conditional Access data unavailable',
      status: 'failed',
      message: 'Unable to retrieve Conditional Access policy data',
    } : {
      userId,
      displayName: baseData.displayName || baseData.jobTitle,
      conditionalAccess: baseData.conditionalAccess || {},
      appliedPolicies: baseData.conditionalAccess?.policies || ['Require MFA', 'Block legacy auth'],
      policyEvaluations: Math.floor(Math.random() * 50) + 20,
      blockedSignIns: Math.floor(Math.random() * 5),
      mfaRequired: true,
      compliantDevice: Math.random() > 0.2,
      trustedLocation: Math.random() > 0.3,
      riskBasedPolicies: ['Sign-in Risk', 'User Risk'].slice(0, Math.floor(Math.random() * 2) + 1),
      lastPolicyHit: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    },
    'azure-ad-signin': hasFailure ? {
      userId,
      error: 'Sign-in logs unavailable',
      status: 'failed',
      message: 'Unable to retrieve sign-in history',
    } : {
      userId,
      displayName: baseData.displayName || baseData.jobTitle,
      lastSignIn: baseData.lastSync || new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      signInRisk: baseData.signInRisk || 'low',
      totalSignIns: Math.floor(Math.random() * 100) + 50,
      failedSignIns: Math.floor(Math.random() * 5),
      riskySignIns: Math.floor(Math.random() * 2),
      recentSignIns: [
        { timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), app: 'Microsoft 365', status: 'Success', location: 'San Francisco, CA' },
        { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), app: 'Azure Portal', status: 'Success', location: 'San Francisco, CA' },
        { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), app: 'Teams', status: 'Success', location: 'San Francisco, CA' },
      ],
      mfaCompletions: Math.floor(Math.random() * 30) + 10,
      devices: baseData.devices || [],
    },
  };

  return dataGenerators[system] || null;
}

// Generate TPAG sub-system mock data
function generateTPAGSubSystemData(system: string, userId: string, baseData: any) {
  const failureUsers = ['u1003', 'u1007', 'u1012', 'u1018'];
  const hasFailure = failureUsers.includes(userId);

  // For base saviynt-tpag system, return as-is
  if (system === 'saviynt-tpag') {
    return baseData;
  }

  // Extract relevant data based on sub-system
  const dataGenerators: Record<string, any> = {
    'saviynt-tpag-vendors': hasFailure ? {
      userId,
      error: 'Vendor data access denied',
      status: 'failed',
      message: 'Unable to retrieve vendor management data',
    } : {
      userId,
      displayName: baseData.displayName || baseData.vendorName,
      totalVendors: baseData.vendorStats?.total || Math.floor(Math.random() * 50) + 20,
      activeVendors: baseData.vendorStats?.active || Math.floor(Math.random() * 40) + 15,
      pendingOnboarding: baseData.vendorStats?.pending || Math.floor(Math.random() * 5),
      recentVendors: baseData.vendors || [
        { name: 'Acme Corp', status: 'Active', riskScore: 'Low', onboardDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'TechPartners Inc', status: 'Active', riskScore: 'Medium', onboardDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Global Services', status: 'Pending', riskScore: 'Low', onboardDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      vendorCategories: ['IT Services', 'Consulting', 'Manufacturing', 'Logistics'],
    },
    'saviynt-tpag-contracts': hasFailure ? {
      userId,
      error: 'Contract data unavailable',
      status: 'failed',
      message: 'Unable to retrieve contract information',
    } : {
      userId,
      displayName: baseData.displayName || baseData.vendorName,
      totalContracts: baseData.contractStats?.total || Math.floor(Math.random() * 30) + 10,
      activeContracts: baseData.contractStats?.active || Math.floor(Math.random() * 25) + 8,
      expiringContracts: baseData.contractStats?.expiring || Math.floor(Math.random() * 3),
      pendingRenewal: baseData.contractStats?.renewal || Math.floor(Math.random() * 2),
      recentContracts: baseData.contracts || [
        { vendor: 'Acme Corp', type: 'MSA', startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), status: 'Active' },
        { vendor: 'TechPartners Inc', type: 'SOW', startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'Expiring' },
      ],
      contractTypes: ['MSA', 'SOW', 'NDA', 'DPA'],
    },
    'saviynt-tpag-access': hasFailure ? {
      userId,
      error: 'Third-party access unavailable',
      status: 'failed',
      message: 'Unable to retrieve third-party access data',
    } : {
      userId,
      displayName: baseData.displayName || baseData.vendorName,
      activeAccessGrants: baseData.accessStats?.active || Math.floor(Math.random() * 20) + 5,
      pendingRequests: baseData.accessStats?.pending || Math.floor(Math.random() * 3),
      revokedAccess: baseData.accessStats?.revoked || Math.floor(Math.random() * 5),
      accessRequests: baseData.accessRequests || [
        { vendor: 'Acme Corp', user: 'john.vendor@acme.com', resource: 'SharePoint Site', status: 'Active', grantDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { vendor: 'TechPartners Inc', user: 'jane.contractor@techpartners.com', resource: 'Azure DevOps', status: 'Pending', requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      accessTypes: ['Read-Only', 'Read-Write', 'Admin', 'Limited'],
    },
    'saviynt-tpag-risk': hasFailure ? {
      userId,
      error: 'Risk assessment unavailable',
      status: 'failed',
      message: 'Unable to retrieve risk assessment data',
    } : {
      userId,
      displayName: baseData.displayName || baseData.vendorName,
      overallRiskScore: baseData.riskStats?.overall || ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      highRiskVendors: baseData.riskStats?.highRisk || Math.floor(Math.random() * 3),
      pendingAssessments: baseData.riskStats?.pending || Math.floor(Math.random() * 5),
      complianceScore: baseData.riskStats?.compliance || Math.floor(Math.random() * 20) + 80,
      riskAssessments: baseData.riskAssessments || [
        { vendor: 'Acme Corp', riskLevel: 'Low', lastAssessment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
        { vendor: 'TechPartners Inc', riskLevel: 'Medium', lastAssessment: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      riskCategories: ['Data Security', 'Compliance', 'Operational', 'Financial'],
    },
    'saviynt-tpag-lifecycle': hasFailure ? {
      userId,
      error: 'Lifecycle data unavailable',
      status: 'failed',
      message: 'Unable to retrieve lifecycle management data',
    } : {
      userId,
      displayName: baseData.displayName || baseData.vendorName,
      pendingOnboarding: baseData.lifecycleStats?.onboarding || Math.floor(Math.random() * 5),
      pendingOffboarding: baseData.lifecycleStats?.offboarding || Math.floor(Math.random() * 2),
      pendingReviews: baseData.lifecycleStats?.reviews || Math.floor(Math.random() * 8),
      completedReviews: baseData.lifecycleStats?.completed || Math.floor(Math.random() * 20) + 10,
      lifecycleEvents: baseData.lifecycleEvents || [
        { type: 'Onboarding', vendor: 'NewVendor LLC', status: 'In Progress', startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'Access Review', vendor: 'Acme Corp', status: 'Pending', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'Offboarding', vendor: 'OldVendor Inc', status: 'Completed', completedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      reviewTypes: ['Quarterly', 'Annual', 'Ad-hoc', 'Contract Renewal'],
    },
  };

  return dataGenerators[system] || null;
}

// Load system details data
function loadSystemDetails(system: string) {
  try {
    const fileName = SYSTEM_DETAILS_FILES[system];
    if (!fileName) {
      console.error(`❌ Unknown system: ${system}`);
      return null;
    }

    const filePath = join(process.cwd(), 'backend/mocks', fileName);
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log(`✅ Loaded ${system} details from ${fileName}`);
    return data;
  } catch (error) {
    console.error(`❌ Error loading ${system} details:`, error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) {
  const { query } = await params;
  const { searchParams } = new URL(request.url);
  const system = searchParams.get('system');
  
  console.log(`🔍 [Details API] Query: ${query}, System: ${system}`);
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!system) {
    return NextResponse.json({ error: 'System parameter is required' }, { status: 400 });
  }

  // Verify JWT token
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Check if it's a new CyberArk system - generate data dynamically
  const cyberarkSystems = ['cyberark', 'cyberark-epm', 'cyberark-alero', 'cyberark-conjur', 'cyberark-dpa', 'cyberark-identity'];
  if (cyberarkSystems.includes(system)) {
    // For CyberArk systems, we need to find the user email from ping-directory
    const pingDirPath = join(process.cwd(), 'backend/mocks/ping-directory-search.json');
    const pingDirectory = JSON.parse(readFileSync(pingDirPath, 'utf-8'));
    const user = pingDirectory.find((u: any) => u.userId === query || u.email === query);
    
    if (!user) {
      return NextResponse.json({ error: `User ${query} not found` }, { status: 404 });
    }

    const detailsData = generateCyberArkDetailsData(system, user.userId, user.email);
    
    if (!detailsData) {
      return NextResponse.json({ error: `System ${system} not found` }, { status: 404 });
    }

    return NextResponse.json({ data: detailsData });
  }

  // Check if it's a Saviynt sub-system - generate data dynamically
  if (SAVIYNT_SUB_SYSTEMS.includes(system)) {
    // Load base Saviynt data
    const saviyntPath = join(process.cwd(), 'backend/mocks/saviynt-details.json');
    let saviyntData;
    try {
      saviyntData = JSON.parse(readFileSync(saviyntPath, 'utf-8'));
    } catch (error) {
      console.error('❌ Error loading saviynt-details.json:', error);
      return NextResponse.json({ error: 'Saviynt data not available' }, { status: 500 });
    }

    const userData = saviyntData[query];
    if (!userData) {
      console.log(`⚠️ User ${query} not found in saviynt details`);
      return NextResponse.json({ error: `User ${query} not found in Saviynt` }, { status: 404 });
    }

    // For base saviynt system, return the data directly
    if (system === 'saviynt') {
      console.log(`✅ Found Saviynt details for ${query}`);
      return NextResponse.json({ data: userData });
    }

    // For sub-systems, generate specific data
    const detailsData = generateSaviyntSubSystemData(system, query, userData);
    
    if (!detailsData) {
      return NextResponse.json({ error: `System ${system} not found` }, { status: 404 });
    }

    console.log(`✅ Generated ${system} details for ${query}`);
    return NextResponse.json({ data: detailsData });
  }

  // Check if it's an EntraAD sub-system - generate data dynamically
  if (ENTRAID_SUB_SYSTEMS.includes(system)) {
    // Load base Azure AD data
    const azureAdPath = join(process.cwd(), 'backend/mocks/azure-ad-details.json');
    let azureAdData;
    try {
      azureAdData = JSON.parse(readFileSync(azureAdPath, 'utf-8'));
    } catch (error) {
      console.error('❌ Error loading azure-ad-details.json:', error);
      return NextResponse.json({ error: 'Azure AD data not available' }, { status: 500 });
    }

    const userData = azureAdData[query];
    if (!userData) {
      console.log(`⚠️ User ${query} not found in azure-ad details`);
      return NextResponse.json({ error: `User ${query} not found in Azure AD` }, { status: 404 });
    }

    // For base azure-ad system, return the data directly
    if (system === 'azure-ad') {
      console.log(`✅ Found Azure AD details for ${query}`);
      return NextResponse.json({ data: userData });
    }

    // For sub-systems, generate specific data
    const detailsData = generateEntraADSubSystemData(system, query, userData);
    
    if (!detailsData) {
      return NextResponse.json({ error: `System ${system} not found` }, { status: 404 });
    }

    console.log(`✅ Generated ${system} details for ${query}`);
    return NextResponse.json({ data: detailsData });
  }

  // Check if it's a TPAG sub-system - generate data dynamically
  if (TPAG_SUB_SYSTEMS.includes(system)) {
    // Load base Saviynt TPAG data (uses saviynt-details.json as base)
    const saviyntPath = join(process.cwd(), 'backend/mocks/saviynt-details.json');
    let saviyntData;
    try {
      saviyntData = JSON.parse(readFileSync(saviyntPath, 'utf-8'));
    } catch (error) {
      console.error('❌ Error loading saviynt-details.json for TPAG:', error);
      return NextResponse.json({ error: 'TPAG data not available' }, { status: 500 });
    }

    const userData = saviyntData[query];
    if (!userData) {
      console.log(`⚠️ User ${query} not found in saviynt details for TPAG`);
      return NextResponse.json({ error: `User ${query} not found in TPAG` }, { status: 404 });
    }

    // For base saviynt-tpag system, return the data directly
    if (system === 'saviynt-tpag') {
      console.log(`✅ Found TPAG details for ${query}`);
      return NextResponse.json({ data: userData });
    }

    // For sub-systems, generate specific data
    const detailsData = generateTPAGSubSystemData(system, query, userData);
    
    if (!detailsData) {
      return NextResponse.json({ error: `System ${system} not found` }, { status: 404 });
    }

    console.log(`✅ Generated ${system} TPAG details for ${query}`);
    return NextResponse.json({ data: detailsData });
  }

  // Load system details from file for other systems
  const systemData = loadSystemDetails(system);
  
  if (!systemData) {
    return NextResponse.json({ error: `System ${system} not found or not available` }, { status: 404 });
  }

  // Find user data by userId
  const userData = systemData[query];
  
  if (!userData) {
    console.log(`⚠️ User ${query} not found in ${system} details`);
    return NextResponse.json({ error: `User ${query} not found in ${system}` }, { status: 404 });
  }

  console.log(`✅ Found details for ${query} in ${system}`);
  
  // Return data in the expected format
  return NextResponse.json({
    data: userData
  });
}