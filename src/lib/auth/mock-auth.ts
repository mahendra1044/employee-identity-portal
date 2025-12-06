/**
 * Mock Authentication Provider
 * ============================
 * 
 * Handles mock authentication for development and testing.
 * Validates users against static mock data without external IDP.
 * 
 * USAGE:
 * - Active when authMode = 'USE_MOCK_AUTH'
 * - Uses userId pattern (e.g., u1001) for login
 * - Returns roles based on USER_MOCK_ROLES configuration
 * 
 * @module lib/auth/mock-auth
 */

import { RBAC_CONFIG, ROLE_DEFINITIONS, type RoleId } from '@/config/roles.config';
import type { RBACRole } from '@/lib/types';
import type {
  AuthProvider,
  AuthInitParams,
  AuthInitResult,
  AuthCompleteParams,
  AuthCompleteResult,
  AuthLogoutParams,
  AuthLogoutResult,
  AuthUser,
} from './types';

// ============================================================================
// MOCK USER DATA
// ============================================================================

/**
 * Mock user to role mapping
 * In production, this comes from SAML assertion group memberships
 */
export const USER_MOCK_ROLES: Record<string, string[]> = {
  u1001: ['R001'],  // Super User - all roles
  u1002: ['R002'],  // SSO Ops
  u1003: ['R003'],  // PAM Ops
  u1004: ['R004'],  // IGA Ops
  u1005: ['R005'],  // Entra ID Ops
  u1006: ['R006'],  // TPAG Ops
  u1007: ['R007'],  // Full Stack Identity Ops
  u1008: ['R008'],  // Employee
  u1009: ['R002', 'R003', 'R004'],  // Multi-role user
};

/**
 * Mock user details
 * Simulates user attributes from directory
 */
export const USER_MOCK_DETAILS: Record<string, { email: string; displayName: string }> = {
  u1001: { email: 'super.user@company.com', displayName: 'Super User' },
  u1002: { email: 'sso.ops@company.com', displayName: 'SSO Operations' },
  u1003: { email: 'pam.ops@company.com', displayName: 'PAM Operations' },
  u1004: { email: 'iga.ops@company.com', displayName: 'IGA Operations' },
  u1005: { email: 'entraid.ops@company.com', displayName: 'Entra ID Operations' },
  u1006: { email: 'tpag.ops@company.com', displayName: 'TPAG Operations' },
  u1007: { email: 'identity.ops@company.com', displayName: 'Identity Operations' },
  u1008: { email: 'employee@company.com', displayName: 'Employee User' },
  u1009: { email: 'multi.role@company.com', displayName: 'Multi-Role User' },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate and extract userId from input
 * @param input - User input (e.g., "u1001", "U1001")
 * @returns Normalized userId or null if invalid
 */
export function extractUserId(input: string): string | null {
  const normalized = input.toLowerCase().trim();
  // Accept userId pattern (e.g., "u1001")
  if (/^u\d+$/.test(normalized)) {
    return normalized;
  }
  return null;
}

/**
 * Get role IDs for a user
 */
function getUserRoleIds(userId: string | null): string[] {
  if (!userId) return [RBAC_CONFIG.defaultRole];
  const roles = USER_MOCK_ROLES[userId];
  return roles && roles.length > 0 ? roles : [RBAC_CONFIG.defaultRole];
}

/**
 * Get RBAC role objects from role IDs
 */
function getRoleObjects(roleIds: string[]): RBACRole[] {
  const roles: RBACRole[] = [];
  
  for (const id of roleIds) {
    const def = ROLE_DEFINITIONS[id as RoleId];
    if (def) {
      roles.push({
        id: def.id,
        name: def.name,
        priority: def.priority,
        systems: def.systems as string[],
        isMaster: def.isMaster,
        description: def.description,
      });
    }
  }
  
  return roles.sort((a, b) => a.priority - b.priority);
}

/**
 * Get all available roles for a user (handles master user case)
 */
function getAvailableRoles(userId: string | null): RBACRole[] {
  const assignedRoleIds = getUserRoleIds(userId);
  const isMaster = assignedRoleIds.includes('R001');
  
  if (isMaster) {
    // Master user gets all roles
    return Object.values(ROLE_DEFINITIONS)
      .map(def => ({
        id: def.id,
        name: def.name,
        priority: def.priority,
        systems: def.systems as string[],
        isMaster: def.isMaster,
        description: def.description,
      }))
      .sort((a, b) => a.priority - b.priority);
  }
  
  return getRoleObjects(assignedRoleIds);
}

/**
 * Get default employee role
 */
function getDefaultRole(): RBACRole {
  const def = ROLE_DEFINITIONS.R008;
  return {
    id: def.id,
    name: def.name,
    priority: def.priority,
    systems: def.systems as string[],
    isMaster: def.isMaster,
    description: def.description,
  };
}

// ============================================================================
// MOCK AUTH PROVIDER
// ============================================================================

/**
 * MockAuthProvider
 * Implements AuthProvider interface for mock authentication
 */
export class MockAuthProvider implements AuthProvider {
  readonly name = 'mock';

  /**
   * Initiate mock authentication
   * Validates userId and returns authentication result immediately
   */
  async initiateAuth(params: AuthInitParams): Promise<AuthInitResult> {
    const { userId: userIdInput, password } = params;

    // Validate inputs
    if (!userIdInput) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    if (!password) {
      return {
        success: false,
        error: 'Password is required',
      };
    }

    // Extract and validate userId
    const userId = extractUserId(userIdInput);
    if (!userId) {
      return {
        success: false,
        error: 'Invalid user ID format. Use format: u1001',
      };
    }

    // Mock auth completes immediately (no redirect needed)
    const completeResult = await this.completeAuth({ samlResponse: userId });
    
    return {
      success: completeResult.success,
      authResult: completeResult,
      error: completeResult.error,
    };
  }

  /**
   * Complete mock authentication
   * For mock auth, this is called internally by initiateAuth
   */
  async completeAuth(params: AuthCompleteParams): Promise<AuthCompleteResult> {
    // In mock mode, samlResponse is actually the userId
    const userId = params.samlResponse || null;

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    // Get user details
    const userDetails = USER_MOCK_DETAILS[userId] || {
      email: `${userId}@company.com`,
      displayName: `User ${userId}`,
    };

    // Get role information
    const assignedRoleIds = getUserRoleIds(userId);
    const availableRoles = getAvailableRoles(userId);
    const activeRole = availableRoles.length > 0 ? availableRoles[0] : getDefaultRole();
    const isMaster = assignedRoleIds.includes('R001');

    // Map role IDs to role keys
    const roleKeyMapping = RBAC_CONFIG.roleKeyMapping as Record<string, string>;

    // Create authenticated user
    const user: AuthUser = {
      userId,
      email: userDetails.email,
      displayName: userDetails.displayName,
      roles: assignedRoleIds.map(id => roleKeyMapping[id] || 'employee'),
      authMethod: 'mock',
      authenticatedAt: new Date(),
    };

    return {
      success: true,
      user,
      availableRoles,
      activeRole,
      isMaster,
    };
  }

  /**
   * Logout (mock auth just clears session, no IDP involvement)
   */
  async logout(_params: AuthLogoutParams): Promise<AuthLogoutResult> {
    // Mock logout is simple - just return success
    // Actual session clearing happens in the API route
    return {
      success: true,
    };
  }
}

// ============================================================================
// FACTORY & EXPORTS
// ============================================================================

/**
 * Create a mock auth provider instance
 */
export function createMockAuthProvider(): MockAuthProvider {
  return new MockAuthProvider();
}

/**
 * Get mock user data (for external use)
 */
export function getMockUserData(userId: string): {
  roles: string[];
  details: { email: string; displayName: string };
} | null {
  const normalizedId = extractUserId(userId);
  if (!normalizedId) return null;

  const roles = USER_MOCK_ROLES[normalizedId];
  const details = USER_MOCK_DETAILS[normalizedId];

  if (!roles) return null;

  return {
    roles,
    details: details || { email: `${normalizedId}@company.com`, displayName: `User ${normalizedId}` },
  };
}
