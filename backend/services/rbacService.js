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
   * Extract userId from username or email
   * Accepts: "u1001" (plain username) or "u1001@company.com" (email format)
   */
  extractUserId(usernameOrEmail) {
    if (!usernameOrEmail) return null;
    const input = usernameOrEmail.toLowerCase().trim();
    
    // First try to match userId pattern directly (e.g., "u1001")
    if (/^u\d+$/.test(input)) {
      return input;
    }
    
    // Fallback: try to extract from email format (e.g., "u1001@company.com")
    const match = input.match(/^(u\d+)@/);
    return match ? match[1] : null;
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
   * Get legacy role string for backward compatibility
   */
  getLegacyRole(roleId) {
    return this.rbac.roleToLegacyMapping[roleId] || 'employee';
  }

  /**
   * Get complete RBAC response for login
   */
  getRbacLoginResponse(email) {
    const userId = this.extractUserId(email);
    const assignedRoleIds = this.getUserRoleIds(userId);
    const availableRoles = this.getAvailableRoles(userId);
    const activeRole = this.getActiveRole(userId);
    const isMaster = this.isMasterUser(userId);
    const legacyRole = this.getLegacyRole(activeRole.id);
    
    return {
      userId,
      assignedRoles: assignedRoleIds,
      availableRoles,
      activeRole,
      isMaster,
      legacyRole, // For backward compatibility with existing UI
    };
  }
  
  // Legacy methods for backward compatibility
  getRoleFromEmail(email) {
    const userId = this.extractUserId(email);
    if (userId) {
      const activeRole = this.getActiveRole(userId);
      return this.getLegacyRole(activeRole.id);
    }
    
    // Fallback to old email-based logic for non-userId emails
    const lower = (email || '').toLowerCase();
    if (lower.startsWith('sso_ops@') || lower.includes('sso_ops@')) return 'sso_ops';
    if (lower.startsWith('pam_ops@') || lower.includes('pam_ops@')) return 'pam_ops';
    if (lower.startsWith('iga_ops@') || lower.includes('iga_ops@')) return 'iga_ops';
    if (lower.startsWith('tpag_ops@') || lower.includes('tpag_ops@')) return 'tpag_ops';
    if (lower.startsWith('ops@')) return 'ops';
    if (lower.startsWith('management@')) return 'management';
    return 'employee';
  }
  
  isSystemEnabled(system, features) {
    return !!(features?.systems && features.systems[system]);
  }
  
  hasPermission(role, system, permission) {
    const roleObj = this.roles[role] || this.roles['employee'];
    return !!(roleObj && roleObj[system] && roleObj[system][permission]);
  }
}

export const rbacService = new RBACService();
