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

import type { SystemKey } from '@/lib/types';

/**
 * All System Keys
 * ---------------
 * Complete list of system identifiers used throughout the app
 */
export const SYSTEM_KEYS: SystemKey[] = [
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
];


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
 * System Groups
 * -------------
 * Logical groupings of systems for specialized ops roles
 */
export const SYSTEM_GROUPS = {
  // Core systems visible to employees and general ops
  core: [
    'ping-directory',
    'ping-federate',
    'ping-mfa',
    'azure-ad',
    'cyberark',
    'saviynt',
  ] as SystemKey[],
  
  // SSO/Ping systems (for sso_ops role)
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
  
  // TPAG systems (for tpag_ops role)
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
 * System Group Type
 * -----------------
 * Type-safe keys for system groups
 */
export type SystemGroupKey = keyof typeof SYSTEM_GROUPS;

/**
 * Get the system group for a specific system
 * ------------------------------------------
 * Maps a system key (e.g., 'ping-federate') to its group (e.g., 'sso')
 * Used to determine data source mode for the system
 * 
 * @param system - The system key to look up
 * @returns The system group, or null if not in any group
 */
export function getSystemGroup(system: SystemKey): SystemGroupKey | null {
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
 */
export const ROLE_LABELS: Record<string, string> = {
  'ops': 'Operations Team',
  'sso_ops': 'SSO Ops',
  'pam_ops': 'PAM Ops',
  'iga_ops': 'IGA Ops',
  'entraid_ops': 'Entra ID Ops',
  'tpag_ops': 'TPAG Ops',
  'employee': 'Employee Access',
  'management': 'Management',
  'admin': 'Administrator',
  'manager': 'Manager',
};


/**
 * RBAC Role ID to Role Key Mapping
 * --------------------------------
 * Maps RBAC role IDs (R001, R002, etc.) to role keys used in UI
 * This must match backend/config/rbac.json roleKeyMapping
 */
export const ROLE_ID_TO_KEY: Record<string, string> = {
  'R001': 'ops',
  'R002': 'sso_ops',
  'R003': 'pam_ops',
  'R004': 'iga_ops',
  'R005': 'entraid_ops',
  'R006': 'tpag_ops',
  'R007': 'ops',
  'R008': 'employee',
};

// Helper: Get role key from role ID
export function getRoleKeyFromId(roleId: string): string {
  return ROLE_ID_TO_KEY[roleId] || 'employee';
}


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
  if (!role) return SYSTEM_GROUPS.core;
  const systems = ROLE_SYSTEM_ACCESS[role];
  return systems ?? SYSTEM_KEYS; // null means all systems
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

// Helper: Get role label
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}
