/**
 * Role Mapper
 * ===========
 * 
 * Maps directory groups to application roles.
 * Used by both mock and SAML authentication flows.
 * 
 * CONFIGURATION:
 * - Group-to-role mapping is defined in backend/config/features.json
 * - Default role is applied when no groups match
 * 
 * @module lib/auth/role-mapper
 */

import { ROLE_DEFINITIONS, type RoleId, type RoleKey } from '@/config/roles.config';
import type { RBACRole } from '@/lib/types';
import type { RoleMappingResult } from './types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Group to role mapping configuration
 */
export type GroupRoleMapping = Record<string, string[]>;

// ============================================================================
// ROLE MAPPER CLASS
// ============================================================================

/**
 * RoleMapper
 * Maps directory groups to application roles
 */
export class RoleMapper {
  private groupRoleMapping: GroupRoleMapping;
  private defaultRole: string;

  constructor(groupRoleMapping: GroupRoleMapping, defaultRole: string = 'employee') {
    this.groupRoleMapping = groupRoleMapping;
    this.defaultRole = defaultRole;
  }

  /**
   * Map user's groups to application roles
   * 
   * @param groups - Array of directory group DNs
   * @returns Role mapping result with roles, role IDs, and RBAC data
   */
  mapGroupsToRoles(groups: string[]): RoleMappingResult {
    const mappedRoles = new Set<string>();

    // Map each group to its roles
    for (const group of groups) {
      const roles = this.groupRoleMapping[group];
      if (roles) {
        roles.forEach(role => mappedRoles.add(role));
      }
    }

    // If no roles mapped, use default role
    if (mappedRoles.size === 0) {
      mappedRoles.add(this.defaultRole);
    }

    const roleKeys = Array.from(mappedRoles);
    
    // Convert role keys to role IDs and get RBAC data
    const roleIds = this.roleKeysToRoleIds(roleKeys);
    const isMaster = roleIds.includes('R001');
    const availableRoles = this.getRolesFromIds(roleIds, isMaster);
    const activeRole = availableRoles[0]; // Highest priority role

    return {
      roles: roleKeys,
      roleIds,
      isMaster,
      availableRoles,
      activeRole,
    };
  }

  /**
   * Convert role keys to role IDs
   */
  private roleKeysToRoleIds(roleKeys: string[]): string[] {
    const roleIds: string[] = [];
    
    for (const [id, definition] of Object.entries(ROLE_DEFINITIONS)) {
      if (roleKeys.includes(definition.key)) {
        roleIds.push(id);
      }
    }

    return roleIds;
  }

  /**
   * Get RBAC role objects from role IDs
   */
  private getRolesFromIds(roleIds: string[], isMaster: boolean): RBACRole[] {
    // If master, return all roles
    if (isMaster) {
      return Object.values(ROLE_DEFINITIONS)
        .map(def => this.definitionToRBACRole(def))
        .sort((a, b) => a.priority - b.priority);
    }

    // Otherwise, return only assigned roles
    return roleIds
      .map(id => ROLE_DEFINITIONS[id as RoleId])
      .filter(Boolean)
      .map(def => this.definitionToRBACRole(def))
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Convert role definition to RBAC role format
   */
  private definitionToRBACRole(def: typeof ROLE_DEFINITIONS[RoleId]): RBACRole {
    return {
      id: def.id,
      name: def.name,
      priority: def.priority,
      systems: def.systems as string[],
      isMaster: def.isMaster,
      description: def.description,
    };
  }

  /**
   * Get default role when no groups match
   */
  getDefaultRole(): string {
    return this.defaultRole;
  }

  /**
   * Check if a group is mapped to any roles
   */
  isGroupMapped(group: string): boolean {
    return group in this.groupRoleMapping;
  }

  /**
   * Get roles for a specific group
   */
  getRolesForGroup(group: string): string[] {
    return this.groupRoleMapping[group] || [];
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a role mapper from configuration
 * 
 * @param config - Configuration object with groupRoleMapping and defaultRole
 * @returns Configured RoleMapper instance
 */
export function createRoleMapper(config: {
  groupRoleMapping: GroupRoleMapping;
  defaultRole: string;
}): RoleMapper {
  return new RoleMapper(config.groupRoleMapping, config.defaultRole);
}

// ============================================================================
// STANDALONE FUNCTIONS
// ============================================================================

/**
 * Map groups to roles using provided mapping
 * Convenience function for one-off mappings
 * 
 * @param groups - Array of directory group DNs
 * @param mapping - Group to role mapping
 * @param defaultRole - Default role if no groups match
 * @returns Role mapping result
 */
export function mapGroupsToRoles(
  groups: string[],
  mapping: GroupRoleMapping,
  defaultRole: string = 'employee'
): RoleMappingResult {
  const mapper = new RoleMapper(mapping, defaultRole);
  return mapper.mapGroupsToRoles(groups);
}

/**
 * Get highest priority role from list
 */
export function getHighestPriorityRole(roles: RBACRole[]): RBACRole | null {
  if (roles.length === 0) return null;
  return [...roles].sort((a, b) => a.priority - b.priority)[0];
}

/**
 * Extract group name from DN
 * e.g., "cn=idops-admin,ou=groups,dc=company" -> "idops-admin"
 */
export function extractGroupName(groupDn: string): string {
  const match = groupDn.match(/^cn=([^,]+)/i);
  return match ? match[1] : groupDn;
}

/**
 * Normalize group DN for comparison
 */
export function normalizeGroupDn(groupDn: string): string {
  return groupDn.toLowerCase().trim();
}

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================

export type RolePriority = 'high' | 'medium' | 'low';

// ============================================================================
// DEFAULT MAPPING
// ============================================================================

/**
 * Default group-to-role mapping for development
 */
export const DEFAULT_GROUP_ROLE_MAPPING: GroupRoleMapping = {
  'cn=idops-admin,ou=groups,dc=company': ['master'],
  'cn=idops-iam-engineering,ou=groups,dc=company': ['iam-engineering'],
  'cn=idops-iam-ops,ou=groups,dc=company': ['iam-ops'],
  'cn=idops-security,ou=groups,dc=company': ['security-ops'],
  'cn=idops-iam-governance,ou=groups,dc=company': ['iam-governance'],
  'cn=idops-audit,ou=groups,dc=company': ['audit-compliance'],
  'cn=employees,ou=groups,dc=company': ['employee'],
};

/**
 * Role priority for sorting (lower number = higher priority)
 */
export const ROLE_PRIORITY: Record<string, number> = {
  'master': 1,
  'iam-engineering': 2,
  'iam-ops': 3,
  'security-ops': 4,
  'iam-governance': 5,
  'audit-compliance': 6,
  'employee': 99,
};
