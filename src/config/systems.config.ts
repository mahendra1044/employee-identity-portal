/**
 * Systems Configuration
 * =====================
 * 
 * Configuration for all identity systems integrated with this portal.
 * 
 * WHEN TO EDIT THIS FILE:
 * - Adding a new system integration
 * - Changing system display names
 * - Grouping systems differently
 * 
 * STRUCTURE:
 * - SYSTEM_KEYS: All valid system identifiers
 * - SYSTEM_LABELS: Human-readable names for each system
 * - SYSTEM_GROUPS: Logical groupings (SSO, PAM, IGA, etc.)
 * - ROLE_SYSTEM_ACCESS: Which roles can see which systems
 */

/**
 * All System Keys
 * ---------------
 * Complete list of system identifiers used throughout the app.
 * This is the SINGLE SOURCE OF TRUTH - the SystemKey type is derived from this array.
 */
export const SYSTEM_KEYS = [
  // Ping Identity Systems
  'ping-directory',
  'ping-federate',
  'ping-mfa',
  'ping-access',
  'ping-authorize',
  'ping-intelligence',
  
  // CyberArk Systems
  'cyberark',
  'cyberark-epm',
  'cyberark-alero',
  'cyberark-conjur',
  'cyberark-dpa',
  'cyberark-identity',
  
  // Saviynt Systems
  'saviynt',
  'saviynt-certifications',
  'saviynt-analytics',
  'saviynt-controls',
  'saviynt-requests',
  'saviynt-provisioning',
  
  // Azure/Entra ID Systems
  'azure-ad',
  'azure-ad-users',
  'azure-ad-groups',
  'azure-ad-apps',
  'azure-ad-conditional',
  'azure-ad-signin',
  
  // TPAG Systems
  'saviynt-tpag',
  'saviynt-tpag-vendors',
  'saviynt-tpag-contracts',
  'saviynt-tpag-access',
  'saviynt-tpag-risk',
  'saviynt-tpag-lifecycle',
] as const;

/**
 * SystemKey Type
 * --------------
 * Derived from SYSTEM_KEYS array - this is the SINGLE SOURCE OF TRUTH
 * Any new system added to SYSTEM_KEYS will automatically be part of this type
 */
export type SystemKey = typeof SYSTEM_KEYS[number];


/**
 * System Display Labels
 * ---------------------
 * Human-friendly names shown in the UI
 */
export const SYSTEM_LABELS: Record<SystemKey, string> = {
  // Ping Identity
  'ping-directory': 'Ping Directory',
  'ping-federate': 'Ping Federate',
  'ping-mfa': 'Ping MFA',
  'ping-access': 'Ping Access',
  'ping-authorize': 'Ping Authorize',
  'ping-intelligence': 'Ping Intelligence',
  
  // CyberArk
  'cyberark': 'CyberArk PAM',
  'cyberark-epm': 'CyberArk EPM',
  'cyberark-alero': 'CyberArk Alero',
  'cyberark-conjur': 'CyberArk Conjur',
  'cyberark-dpa': 'CyberArk DPA',
  'cyberark-identity': 'CyberArk Identity',
  
  // Saviynt
  'saviynt': 'Saviynt IGA',
  'saviynt-certifications': 'Saviynt Certifications',
  'saviynt-analytics': 'Saviynt Analytics',
  'saviynt-controls': 'Saviynt Controls',
  'saviynt-requests': 'Saviynt Requests',
  'saviynt-provisioning': 'Saviynt Provisioning',
  
  // Azure/Entra ID
  'azure-ad': 'Microsoft Entra ID',
  'azure-ad-users': 'Entra ID Users',
  'azure-ad-groups': 'Entra ID Groups',
  'azure-ad-apps': 'Entra ID Apps',
  'azure-ad-conditional': 'Conditional Access',
  'azure-ad-signin': 'Sign-in Logs',
  
  // TPAG
  'saviynt-tpag': 'TPAG Overview',
  'saviynt-tpag-vendors': 'TPAG Vendors',
  'saviynt-tpag-contracts': 'TPAG Contracts',
  'saviynt-tpag-access': 'TPAG Access',
  'saviynt-tpag-risk': 'TPAG Risk',
  'saviynt-tpag-lifecycle': 'TPAG Lifecycle',
};


/**
 * System Groups (UI Display Groups)
 * ==================================
 * 
 * Logical groupings of systems for UI display and role-based access control.
 * 
 * IMPORTANT DISTINCTION:
 * ----------------------
 * - SystemGroup (in lib/types.ts): Data source groups for API configuration
 *   Values: 'sso' | 'pam' | 'iga' | 'entraId' | 'tpag' | 'ops'
 *   Used for: SYSTEM_DATA_SOURCE toggle (mock vs real API)
 * 
 * - SYSTEM_GROUPS (here): UI display groups for role-based visibility
 *   Includes 'core' which is NOT a data source group
 *   'core' is a subset of systems shown to employees/general ops
 * 
 * The 'core' group contains systems from multiple data source groups
 * (sso + pam + iga + entraId) - it's a UI concept, not a data source concept.
 */
export const SYSTEM_GROUPS = {
  /**
   * Core systems - UI subset for employees and general ops
   * NOTE: This is NOT a data source group. Each system maps to its
   * own data source group (sso, pam, iga, entraId)
   */
  core: [
    'ping-directory',   // → sso
    'ping-federate',    // → sso
    'ping-mfa',         // → sso
    'azure-ad',         // → entraId
    'cyberark',         // → pam
    'saviynt',          // → iga
  ] as SystemKey[],
  
  // SSO/Ping systems (for sso_ops role) → Data source: 'sso'
  sso: [
    'ping-directory',
    'ping-federate',
    'ping-mfa',
    'ping-access',
    'ping-authorize',
    'ping-intelligence',
  ] as SystemKey[],
  
  // PAM systems (for pam_ops role)
  pam: [
    'cyberark',
    'cyberark-epm',
    'cyberark-alero',
    'cyberark-conjur',
    'cyberark-dpa',
    'cyberark-identity',
  ] as SystemKey[],
  
  // IGA systems (for iga_ops role)
  iga: [
    'saviynt',
    'saviynt-certifications',
    'saviynt-analytics',
    'saviynt-controls',
    'saviynt-requests',
    'saviynt-provisioning',
  ] as SystemKey[],
  
  // Entra ID systems (for entraid_ops role)
  entraId: [
    'azure-ad',
    'azure-ad-users',
    'azure-ad-groups',
    'azure-ad-apps',
    'azure-ad-conditional',
    'azure-ad-signin',
  ] as SystemKey[],
  
  // TPAG systems (for tpag_ops role) → Data source: 'tpag'
  tpag: [
    'saviynt-tpag',
    'saviynt-tpag-vendors',
    'saviynt-tpag-contracts',
    'saviynt-tpag-access',
    'saviynt-tpag-risk',
    'saviynt-tpag-lifecycle',
  ] as SystemKey[],
} as const;

/**
 * UI System Group Key
 * -------------------
 * Keys for SYSTEM_GROUPS object (includes 'core' for UI display)
 * 
 * NOTE: This is different from SystemGroup (data source groups).
 * - UISystemGroupKey: 'core' | 'sso' | 'pam' | 'iga' | 'entraId' | 'tpag'
 * - SystemGroup: 'sso' | 'pam' | 'iga' | 'entraId' | 'tpag' | 'ops'
 * 
 * 'core' is UI-only, 'ops' is data-source-only
 */
export type UISystemGroupKey = keyof typeof SYSTEM_GROUPS;

// Alias for backward compatibility
export type SystemGroupKey = UISystemGroupKey;

/**
 * Get the DATA SOURCE group for a specific system
 * ------------------------------------------------
 * Maps a system key (e.g., 'ping-federate') to its data source group (e.g., 'sso')
 * Used to determine mock vs real API mode for the system.
 * 
 * NOTE: This returns a DATA SOURCE group, not a UI group.
 * 'core' is never returned - systems in 'core' map to their actual data source group.
 * 
 * @param system - The system key to look up
 * @returns The data source group (sso, pam, iga, entraId, tpag), or null if unknown
 */
export function getSystemGroup(system: SystemKey): UISystemGroupKey | null {
  // Check SSO group
  if ((SYSTEM_GROUPS.sso as readonly SystemKey[]).includes(system)) {
    return 'sso';
  }
  // Check PAM group
  if ((SYSTEM_GROUPS.pam as readonly SystemKey[]).includes(system)) {
    return 'pam';
  }
  // Check IGA group
  if ((SYSTEM_GROUPS.iga as readonly SystemKey[]).includes(system)) {
    return 'iga';
  }
  // Check Entra ID group
  if ((SYSTEM_GROUPS.entraId as readonly SystemKey[]).includes(system)) {
    return 'entraId';
  }
  // Check TPAG group
  if ((SYSTEM_GROUPS.tpag as readonly SystemKey[]).includes(system)) {
    return 'tpag';
  }
  // System not in any specific group
  return null;
}

/**
 * Get all systems in a group
 * --------------------------
 * Returns all system keys that belong to a specific group
 * 
 * @param group - The group to get systems for
 * @returns Array of system keys in the group
 */
export function getSystemsInGroup(group: SystemGroupKey): SystemKey[] {
  return [...SYSTEM_GROUPS[group]];
}


/**
 * Role Display Names
 * ------------------
 * Human-friendly names for user roles
 * Re-exported from centralized roles.config.ts
 */
export { ROLE_LABELS, ROLE_ID_TO_KEY, getRoleKeyFromId, getRoleLabel } from './roles.config';


/**
 * Role to System Group Mapping
 * ----------------------------
 * Maps each role to the systems they can access
 * null means access to all systems
 */
export const ROLE_SYSTEM_ACCESS: Record<string, SystemKey[] | null> = {
  'ops': SYSTEM_GROUPS.core,           // General ops sees core systems
  'sso_ops': SYSTEM_GROUPS.sso,        // SSO ops sees Ping systems
  'pam_ops': SYSTEM_GROUPS.pam,        // PAM ops sees CyberArk systems
  'iga_ops': SYSTEM_GROUPS.iga,        // IGA ops sees Saviynt systems
  'entraid_ops': SYSTEM_GROUPS.entraId, // Entra ops sees Azure AD systems
  'tpag_ops': SYSTEM_GROUPS.tpag,      // TPAG ops sees TPAG systems
  'employee': SYSTEM_GROUPS.core,       // Employees see core systems
  'management': SYSTEM_GROUPS.core,     // Management sees core systems
  'admin': null,                        // Admin sees all systems
};


// Helper: Get systems for a role
export function getSystemsForRole(role: string | null): SystemKey[] {
  if (!role) return [...SYSTEM_GROUPS.core];
  const systems = ROLE_SYSTEM_ACCESS[role];
  return systems ? [...systems] : [...SYSTEM_KEYS]; // null means all systems
}

// Helper: Check if system is visible to role
export function isSystemVisibleToRole(system: SystemKey, role: string | null): boolean {
  const allowedSystems = getSystemsForRole(role);
  return allowedSystems.includes(system);
}

// Helper: Get system label
export function getSystemLabel(system: SystemKey): string {
  return SYSTEM_LABELS[system] || system;
}
