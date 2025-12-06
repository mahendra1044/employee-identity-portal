/**
 * Centralized Role Configuration
 * ==============================
 * Single source of truth for all role definitions.
 * This eliminates duplication across multiple files.
 * 
 * When updating roles, only modify this file.
 * All other parts of the application will use these definitions.
 */

import type { SystemKey } from "@/lib/types";

/**
 * Role Key Type
 * These are the string identifiers used throughout the UI
 */
export type RoleKey = 
  | 'ops' 
  | 'sso_ops' 
  | 'pam_ops' 
  | 'iga_ops' 
  | 'entraid_ops' 
  | 'tpag_ops' 
  | 'employee' 
  | 'management' 
  | 'admin';

/**
 * RBAC Role ID Type
 * These are the IDs used in the backend RBAC system
 */
export type RoleId = 'R001' | 'R002' | 'R003' | 'R004' | 'R005' | 'R006' | 'R007' | 'R008';

/**
 * Role Definition Interface
 */
export interface RoleDefinition {
  id: RoleId;
  key: RoleKey;
  name: string;
  shortName: string;
  description: string;
  priority: number;
  systems: SystemKey[] | ['all'];
  isMaster: boolean;
}

/**
 * All Ops Role Keys
 * Used for checking if a role has ops privileges
 */
export const OPS_ROLE_KEYS: RoleKey[] = [
  'ops',
  'sso_ops',
  'pam_ops',
  'iga_ops',
  'entraid_ops',
  'tpag_ops',
];

/**
 * Master Role Definitions
 * -----------------------
 * This is the single source of truth for all roles.
 * Matches backend/config/rbac.json
 */
export const ROLE_DEFINITIONS: Record<RoleId, RoleDefinition> = {
  R001: {
    id: 'R001',
    key: 'ops',
    name: 'Super User',
    shortName: 'Super User',
    description: 'Full access to all systems and roles',
    priority: 1,
    systems: ['all'],
    isMaster: true,
  },
  R002: {
    id: 'R002',
    key: 'sso_ops',
    name: 'SSO Ops',
    shortName: 'SSO Ops',
    description: 'Single Sign-On operations',
    priority: 2,
    systems: ['ping-federate', 'ping-directory', 'ping-access', 'ping-authorize', 'ping-intelligence'],
    isMaster: false,
  },
  R003: {
    id: 'R003',
    key: 'pam_ops',
    name: 'PAM Ops',
    shortName: 'PAM Ops',
    description: 'Privileged Access Management operations',
    priority: 3,
    systems: ['cyberark', 'cyberark-epm', 'cyberark-alero', 'cyberark-conjur', 'cyberark-dpa', 'cyberark-identity'],
    isMaster: false,
  },
  R004: {
    id: 'R004',
    key: 'iga_ops',
    name: 'IGA Ops',
    shortName: 'IGA Ops',
    description: 'Identity Governance and Administration operations',
    priority: 4,
    systems: ['saviynt', 'saviynt-certifications', 'saviynt-analytics', 'saviynt-controls', 'saviynt-requests', 'saviynt-provisioning'],
    isMaster: false,
  },
  R005: {
    id: 'R005',
    key: 'entraid_ops',
    name: 'Entra ID Ops',
    shortName: 'Entra ID Ops',
    description: 'Microsoft Entra ID operations',
    priority: 5,
    systems: ['azure-ad', 'azure-ad-users', 'azure-ad-groups', 'azure-ad-apps', 'azure-ad-conditional', 'azure-ad-signin'],
    isMaster: false,
  },
  R006: {
    id: 'R006',
    key: 'tpag_ops',
    name: 'TPAG Ops',
    shortName: 'TPAG Ops',
    description: 'Third Party Access Governance operations',
    priority: 6,
    systems: ['saviynt-tpag', 'saviynt-tpag-vendors', 'saviynt-tpag-contracts', 'saviynt-tpag-access', 'saviynt-tpag-risk', 'saviynt-tpag-lifecycle'],
    isMaster: false,
  },
  R007: {
    id: 'R007',
    key: 'ops',
    name: 'Full Stack Identity Ops',
    shortName: 'Full Stack Identity Ops',
    description: 'Unified operations access across all identity systems',
    priority: 7,
    systems: ['ping-federate', 'ping-directory', 'ping-mfa', 'cyberark', 'saviynt', 'azure-ad'],
    isMaster: false,
  },
  R008: {
    id: 'R008',
    key: 'employee',
    name: 'Employee',
    shortName: 'Employee',
    description: 'Employee self-service access only',
    priority: 8,
    systems: [],
    isMaster: false,
  },
};

/**
 * Role ID to Key Mapping
 * Derived from ROLE_DEFINITIONS
 */
export const ROLE_ID_TO_KEY: Record<RoleId, RoleKey> = Object.fromEntries(
  Object.entries(ROLE_DEFINITIONS).map(([id, def]) => [id, def.key])
) as Record<RoleId, RoleKey>;

/**
 * Role Labels (Display Names)
 * Derived from ROLE_DEFINITIONS
 */
export const ROLE_LABELS: Record<RoleKey, string> = {
  'ops': 'Full Stack Identity Ops',
  'sso_ops': 'SSO Ops',
  'pam_ops': 'PAM Ops',
  'iga_ops': 'IGA Ops',
  'entraid_ops': 'Entra ID Ops',
  'tpag_ops': 'TPAG Ops',
  'employee': 'Employee',
  'management': 'Management',
  'admin': 'Administrator',
};

/**
 * Role Descriptions
 * Human-readable descriptions for each role key
 */
export const ROLE_DESCRIPTIONS: Record<RoleKey, string> = {
  'ops': 'Full Stack Identity Ops',
  'sso_ops': 'SSO Operations (Ping Systems)',
  'pam_ops': 'PAM Operations (CyberArk)',
  'iga_ops': 'IGA Operations (Saviynt)',
  'entraid_ops': 'Entra ID Operations (Azure AD)',
  'tpag_ops': 'TPAG Operations (Third-Party Access Governance)',
  'employee': 'Employee Self-Service',
  'management': 'Management View',
  'admin': 'Administrator',
};

/**
 * Helper: Check if a role key has ops privileges
 */
export function isOpsRoleKey(role: string | null | undefined): boolean {
  if (!role) return false;
  return OPS_ROLE_KEYS.includes(role as RoleKey);
}

/**
 * Helper: Get role definition by ID
 */
export function getRoleById(roleId: RoleId): RoleDefinition | undefined {
  return ROLE_DEFINITIONS[roleId];
}

/**
 * Helper: Get role key from role ID
 */
export function getRoleKeyFromId(roleId: string): RoleKey {
  return ROLE_ID_TO_KEY[roleId as RoleId] || 'employee';
}

/**
 * Helper: Get role label from role key
 */
export function getRoleLabel(roleKey: string): string {
  return ROLE_LABELS[roleKey as RoleKey] || roleKey;
}

/**
 * Helper: Get role description from role key
 */
export function getRoleDescription(roleKey: string): string {
  return ROLE_DESCRIPTIONS[roleKey as RoleKey] || '';
}

/**
 * RBAC Config for API Route
 * This generates the config object used in the login API route
 */
export const RBAC_CONFIG = {
  roles: Object.fromEntries(
    Object.entries(ROLE_DEFINITIONS).map(([id, def]) => [
      id,
      {
        id: def.id,
        name: def.name,
        priority: def.priority,
        systems: def.systems,
        isMaster: def.isMaster,
        description: def.description,
      },
    ])
  ),
  roleKeyMapping: ROLE_ID_TO_KEY,
  defaultRole: 'R008' as RoleId,
};
