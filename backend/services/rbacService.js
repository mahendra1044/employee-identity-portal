import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rolesPath = path.join(__dirname, '../config/roles.json');
const rbacPath = path.join(__dirname, '../config/rbac.json');

class RBACService {
  constructor() {
    this.roles = JSON.parse(fs.readFileSync(rolesPath, 'utf-8'));
    this.rbac = JSON.parse(fs.readFileSync(rbacPath, 'utf-8'));
  }

  /**
   * Extract userId from input
   * Accepts: "u1001" (plain user ID only)
   */
  extractUserId(userId) {
    if (!userId) return null;
    const input = userId.toLowerCase().trim();
    
    // Only accept userId pattern directly (e.g., "u1001")
    if (/^u\d+$/.test(input)) {
      return input;
    }
    
    return null;
  }

  /**
   * Get assigned role IDs for a user
   */
  getUserRoleIds(userId) {
    if (!userId) return [this.rbac.defaultRole];
    const roles = this.rbac.userRoles[userId];
    return roles && roles.length > 0 ? roles : [this.rbac.defaultRole];
  }

  /**
   * Get full role objects for given role IDs
   */
  getRoleObjects(roleIds) {
    return roleIds
      .map(id => this.rbac.roles[id])
      .filter(Boolean)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get available roles for a user (for switcher dropdown)
   * Master users get ALL roles, others get only their assigned roles
   */
  getAvailableRoles(userId) {
    const assignedRoleIds = this.getUserRoleIds(userId);
    const isMaster = assignedRoleIds.includes('R001');
    
    if (isMaster) {
      // Master gets all roles
      return Object.values(this.rbac.roles).sort((a, b) => a.priority - b.priority);
    }
    
    return this.getRoleObjects(assignedRoleIds);
  }

  /**
   * Get the active (highest priority) role for initial login
   */
  getActiveRole(userId) {
    const availableRoles = this.getAvailableRoles(userId);
    return availableRoles.length > 0 ? availableRoles[0] : this.rbac.roles[this.rbac.defaultRole];
  }

  /**
   * Check if user is a master user
   */
  isMasterUser(userId) {
    const roleIds = this.getUserRoleIds(userId);
    return roleIds.includes('R001');
  }

  /**
   * Get role key string for the given role ID
   */
  getRoleKey(roleId) {
    return this.rbac.roleKeyMapping[roleId] || 'employee';
  }

  /**
   * Get complete RBAC response for login
   */
  getRbacLoginResponse(userId) {
    const validatedUserId = this.extractUserId(userId);
    const assignedRoleIds = this.getUserRoleIds(validatedUserId);
    const availableRoles = this.getAvailableRoles(validatedUserId);
    const activeRole = this.getActiveRole(validatedUserId);
    const isMaster = this.isMasterUser(validatedUserId);
    const roleKey = this.getRoleKey(activeRole.id);
    
    return {
      userId: validatedUserId,
      assignedRoles: assignedRoleIds,
      availableRoles,
      activeRole,
      isMaster,
      roleKey,
    };
  }

  /**
   * Get role IDs from role keys (e.g., 'master' -> 'R001')
   */
  getRoleIdsFromKeys(roleKeys) {
    const roleIds = [];
    const reverseMapping = {};
    
    // Build reverse mapping from key to ID
    for (const [id, key] of Object.entries(this.rbac.roleKeyMapping)) {
      reverseMapping[key] = id;
    }
    
    for (const key of roleKeys) {
      const id = reverseMapping[key];
      if (id) {
        roleIds.push(id);
      }
    }
    
    return roleIds;
  }

  /**
   * Get roles from IDs with master user handling
   */
  getRolesFromIds(roleIds, isMaster = false) {
    if (isMaster) {
      return Object.values(this.rbac.roles).sort((a, b) => a.priority - b.priority);
    }
    return this.getRoleObjects(roleIds);
  }

  /**
   * Get default role object
   */
  getDefaultRole() {
    return this.rbac.roles[this.rbac.defaultRole];
  }
}

export const rbacService = new RBACService();
