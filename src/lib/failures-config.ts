/**
 * Failures Configuration
 * 
 * Centralized configuration for ops role failure types.
 * Defines failure categories, their API endpoints, display titles,
 * role mappings, and test data for each failure type.
 * 
 * @module failures-config
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** All possible failure type keys */
export type FailureKey = 
  | 'fed' | 'mfa'           // SSO failures
  | 'pam' | 'vault'         // PAM failures  
  | 'igaAccess' | 'igaProvisioning'  // IGA failures
  | 'entraAuth' | 'entraAccess'      // EntraAD failures
  | 'tpagVendor' | 'tpagAccess';     // TPAG failures

/** Render types for formatting failure items */
export type FailureRenderType = 'sso' | 'pam' | 'iga' | 'entra' | 'tpag';

/** Role types that can view failures */
export type FailureRole = 'ops' | 'sso_ops' | 'pam_ops' | 'iga_ops' | 'entraid_ops' | 'tpag_ops';

/** Failure category grouping */
export type FailureCategory = 'sso' | 'pam' | 'iga' | 'entra' | 'tpag';

/** Configuration for a single failure type */
export interface FailureTypeConfig {
  key: FailureKey;
  apiSystem: string;
  title: string;
  renderType: FailureRenderType;
  category: FailureCategory;
}

/** Configuration for a failure category (group of related failures) */
export interface FailureCategoryConfig {
  category: FailureCategory;
  roles: FailureRole[];
  failures: FailureTypeConfig[];
}

/** Single failure data item */
export interface FailureData {
  userId?: string;
  email?: string;
  reason?: string;
  error?: string;
  timestamp: string;
  time?: string;
  system?: string;
  safe?: string;
  account?: string;
  application?: string;
  entitlement?: string;
  certificationId?: string;
}

/** Test data generator function type */
type TestDataGenerator = (mkTs: (minsAgo: number) => string) => FailureData[];

// ============================================================================
// FAILURE TYPE CONFIGURATIONS
// ============================================================================

/** All failure types with their configurations */
export const FAILURE_TYPES: Record<FailureKey, FailureTypeConfig> = {
  // SSO Failures
  fed: {
    key: 'fed',
    apiSystem: 'ping-federate',
    title: 'Ping Federate – Login Failures',
    renderType: 'sso',
    category: 'sso',
  },
  mfa: {
    key: 'mfa',
    apiSystem: 'ping-mfa',
    title: 'Ping MFA – Verification Failures',
    renderType: 'sso',
    category: 'sso',
  },
  
  // PAM Failures
  pam: {
    key: 'pam',
    apiSystem: 'cyberark-pam',
    title: 'CyberArk PAM – Access Failures',
    renderType: 'pam',
    category: 'pam',
  },
  vault: {
    key: 'vault',
    apiSystem: 'cyberark-vault',
    title: 'CyberArk Vault – Operation Failures',
    renderType: 'pam',
    category: 'pam',
  },
  
  // IGA Failures
  igaAccess: {
    key: 'igaAccess',
    apiSystem: 'saviynt-access',
    title: 'Saviynt – Access Request Failures',
    renderType: 'iga',
    category: 'iga',
  },
  igaProvisioning: {
    key: 'igaProvisioning',
    apiSystem: 'saviynt-provisioning',
    title: 'Saviynt – Provisioning Failures',
    renderType: 'iga',
    category: 'iga',
  },
  
  // EntraAD Failures
  entraAuth: {
    key: 'entraAuth',
    apiSystem: 'azure-ad-auth',
    title: 'Entra ID – Authentication Failures',
    renderType: 'entra',
    category: 'entra',
  },
  entraAccess: {
    key: 'entraAccess',
    apiSystem: 'azure-ad-access',
    title: 'Entra ID – Access Failures',
    renderType: 'entra',
    category: 'entra',
  },
  
  // TPAG Failures
  tpagVendor: {
    key: 'tpagVendor',
    apiSystem: 'saviynt-tpag-vendor',
    title: 'TPAG – Vendor Failures',
    renderType: 'tpag',
    category: 'tpag',
  },
  tpagAccess: {
    key: 'tpagAccess',
    apiSystem: 'saviynt-tpag-access',
    title: 'TPAG – Access Failures',
    renderType: 'tpag',
    category: 'tpag',
  },
};

// ============================================================================
// CATEGORY CONFIGURATIONS
// ============================================================================

/** Failure categories with their role mappings */
export const FAILURE_CATEGORIES: FailureCategoryConfig[] = [
  {
    category: 'sso',
    roles: ['sso_ops', 'ops'],
    failures: [FAILURE_TYPES.fed, FAILURE_TYPES.mfa],
  },
  {
    category: 'pam',
    roles: ['pam_ops'],
    failures: [FAILURE_TYPES.pam, FAILURE_TYPES.vault],
  },
  {
    category: 'iga',
    roles: ['iga_ops'],
    failures: [FAILURE_TYPES.igaAccess, FAILURE_TYPES.igaProvisioning],
  },
  {
    category: 'entra',
    roles: ['entraid_ops'],
    failures: [FAILURE_TYPES.entraAuth, FAILURE_TYPES.entraAccess],
  },
  {
    category: 'tpag',
    roles: ['tpag_ops'],
    failures: [FAILURE_TYPES.tpagVendor, FAILURE_TYPES.tpagAccess],
  },
];

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

/** Test data generators for each failure type (used when backend returns empty) */
export const FAILURE_TEST_DATA: Record<FailureKey, TestDataGenerator> = {
  fed: (mkTs) => [
    { userId: "u12345", reason: "Invalid credentials", timestamp: mkTs(2) },
    { email: "jane.doe@company.com", reason: "Account locked", timestamp: mkTs(5) },
    { userId: "u67890", reason: "MFA required not satisfied", timestamp: mkTs(9) },
  ],
  mfa: (mkTs) => [
    { userId: "u12345", error: "Push timeout", timestamp: mkTs(3) },
    { email: "john.smith@company.com", error: "Device not enrolled", timestamp: mkTs(7) },
  ],
  pam: (mkTs) => [
    { userId: "u12345", reason: "Session timeout", safe: "CORP-PROD", timestamp: mkTs(1) },
    { email: "admin@company.com", reason: "Access denied to safe", safe: "IT-ADMIN", timestamp: mkTs(4) },
    { userId: "u67890", reason: "Credential checkout failed", account: "svc_app01", timestamp: mkTs(6) },
  ],
  vault: (mkTs) => [
    { userId: "u12345", error: "Vault sync failed", system: "cyberark-conjur", timestamp: mkTs(2) },
    { email: "devops@company.com", error: "Secret rotation failed", system: "cyberark-conjur", timestamp: mkTs(5) },
    { userId: "u99999", error: "DPA authorization expired", system: "cyberark-dpa", timestamp: mkTs(8) },
  ],
  igaAccess: (mkTs) => [
    { userId: "u12345", reason: "Access certification expired", application: "SAP-PROD", timestamp: mkTs(1) },
    { email: "manager@company.com", reason: "Entitlement request denied", entitlement: "ADMIN_ROLE", timestamp: mkTs(3) },
    { userId: "u67890", reason: "Role assignment failed", application: "Salesforce", timestamp: mkTs(5) },
  ],
  igaProvisioning: (mkTs) => [
    { userId: "u12345", error: "Provisioning timeout", application: "ServiceNow", timestamp: mkTs(2) },
    { email: "newuser@company.com", error: "Account creation failed", system: "saviynt-provisioning", timestamp: mkTs(4) },
    { userId: "u99999", error: "Deprovisioning incomplete", application: "Workday", timestamp: mkTs(7) },
  ],
  entraAuth: (mkTs) => [
    { userId: "u12345", reason: "Sign-in blocked by Conditional Access", application: "Microsoft 365", timestamp: mkTs(1) },
    { email: "user@company.com", reason: "MFA challenge failed", application: "Azure Portal", timestamp: mkTs(3) },
    { userId: "u67890", reason: "Password expired", application: "SharePoint Online", timestamp: mkTs(5) },
  ],
  entraAccess: (mkTs) => [
    { userId: "u12345", error: "Group membership sync failed", system: "azure-ad-groups", timestamp: mkTs(2) },
    { email: "admin@company.com", error: "App consent required", application: "Power BI", timestamp: mkTs(4) },
    { userId: "u99999", error: "License assignment failed", system: "azure-ad-users", timestamp: mkTs(7) },
  ],
  tpagVendor: (mkTs) => [
    { userId: "v12345", reason: "Vendor contract expired", application: "Vendor Portal", timestamp: mkTs(1) },
    { email: "vendor@partner.com", reason: "Third-party access suspended", application: "B2B Gateway", timestamp: mkTs(3) },
    { userId: "v67890", reason: "Vendor onboarding incomplete", application: "Supplier Hub", timestamp: mkTs(5) },
  ],
  tpagAccess: (mkTs) => [
    { userId: "v12345", error: "Access request denied - risk score too high", system: "saviynt-tpag-risk", timestamp: mkTs(2) },
    { email: "contractor@external.com", error: "Lifecycle policy violation", system: "saviynt-tpag-lifecycle", timestamp: mkTs(4) },
    { userId: "v99999", error: "Contract renewal required", system: "saviynt-tpag-contracts", timestamp: mkTs(7) },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get categories that should be loaded for a given role
 * @param role - Current user role
 * @returns Array of failure categories to load
 */
export function getCategoriesForRole(role: string | null): FailureCategoryConfig[] {
  if (!role) return [];
  return FAILURE_CATEGORIES.filter(cat => cat.roles.includes(role as FailureRole));
}

/**
 * Get all failure types that should be loaded for a given role
 * @param role - Current user role
 * @returns Array of failure type configs to load
 */
export function getFailureTypesForRole(role: string | null): FailureTypeConfig[] {
  const categories = getCategoriesForRole(role);
  return categories.flatMap(cat => cat.failures);
}

/**
 * Check if a category should be shown for a given role
 * @param category - Failure category
 * @param role - Current user role
 * @returns Whether the category should be displayed
 */
export function shouldShowCategory(category: FailureCategory, role: string | null): boolean {
  if (!role) return false;
  const categoryConfig = FAILURE_CATEGORIES.find(c => c.category === category);
  return categoryConfig ? categoryConfig.roles.includes(role as FailureRole) : false;
}

/**
 * Get panel title based on role
 * @param role - Current user role
 * @param minutes - Time window in minutes
 * @returns Formatted panel title
 */
export function getPanelTitle(role: string | null | undefined, minutes: number): string {
  switch (role) {
    case 'sso_ops':
      return `SSO Recent Failures (last ${minutes} min)`;
    case 'pam_ops':
      return `PAM Recent Failures (last ${minutes} min)`;
    case 'iga_ops':
      return `IGA Recent Failures (last ${minutes} min)`;
    case 'entraid_ops':
      return `Entra ID Recent Failures (last ${minutes} min)`;
    case 'tpag_ops':
      return `TPAG Recent Failures (last ${minutes} min)`;
    default:
      return `Recent Failures (last ${minutes} min)`;
  }
}

/**
 * Format a failure item for display
 * @param item - Failure data item
 * @param renderType - Type for formatting context
 * @returns Formatted failure string
 */
export function formatFailureItem(item: FailureData, renderType: FailureRenderType): string {
  const user = item.userId || item.email || "unknown";
  const reason = item.reason || item.error || "failure";
  const time = item.time || item.timestamp || "";
  
  let context = '';
  
  switch (renderType) {
    case 'pam':
      context = item.safe ? ` [Safe: ${item.safe}]` : 
                item.account ? ` [Account: ${item.account}]` : 
                item.system ? ` [${item.system}]` : '';
      break;
    case 'iga':
      context = item.application ? ` [App: ${item.application}]` : 
                item.entitlement ? ` [Entitlement: ${item.entitlement}]` : 
                item.system ? ` [${item.system}]` : '';
      break;
    case 'entra':
      context = item.application ? ` [App: ${item.application}]` : 
                item.system ? ` [${item.system}]` : '';
      break;
    case 'tpag':
      context = item.application ? ` [Vendor: ${item.application}]` : 
                item.system ? ` [${item.system}]` : '';
      break;
    default:
      context = '';
  }
  
  return `${user} — ${reason}${context} — ${time}`;
}

/** All failure keys for iteration */
export const ALL_FAILURE_KEYS: FailureKey[] = Object.keys(FAILURE_TYPES) as FailureKey[];

/** Create empty failures state object */
export function createEmptyFailuresState(): Record<FailureKey, FailureData[]> {
  return ALL_FAILURE_KEYS.reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {} as Record<FailureKey, FailureData[]>);
}
