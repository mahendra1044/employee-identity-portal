import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// RBAC Configuration matching backend/config/rbac.json
const RBAC_CONFIG = {
  roles: {
    R001: { id: 'R001', name: 'Master', priority: 1, systems: ['all'], isMaster: true, description: 'Full access to all systems and roles' },
    R002: { id: 'R002', name: 'SSO Admin', priority: 2, systems: ['ping-federate', 'ping-directory', 'ping-access', 'ping-authorize', 'ping-intelligence'], isMaster: false, description: 'Single Sign-On operations' },
    R003: { id: 'R003', name: 'PAM Admin', priority: 3, systems: ['cyberark', 'cyberark-epm', 'cyberark-alero', 'cyberark-conjur', 'cyberark-dpa', 'cyberark-identity'], isMaster: false, description: 'Privileged Access Management operations' },
    R004: { id: 'R004', name: 'IGA Admin', priority: 4, systems: ['saviynt', 'saviynt-certifications', 'saviynt-analytics', 'saviynt-controls', 'saviynt-requests', 'saviynt-provisioning'], isMaster: false, description: 'Identity Governance & Administration operations' },
    R005: { id: 'R005', name: 'EntraID Admin', priority: 5, systems: ['azure-ad', 'azure-ad-users', 'azure-ad-groups', 'azure-ad-apps', 'azure-ad-conditional', 'azure-ad-signin'], isMaster: false, description: 'Microsoft Entra ID operations' },
    R006: { id: 'R006', name: 'TPAG Admin', priority: 6, systems: ['saviynt-tpag', 'saviynt-tpag-vendors', 'saviynt-tpag-contracts', 'saviynt-tpag-access', 'saviynt-tpag-risk', 'saviynt-tpag-lifecycle'], isMaster: false, description: 'Third Party Access Governance operations' },
    R007: { id: 'R007', name: 'General Admin', priority: 7, systems: ['ping-federate', 'ping-directory', 'ping-mfa', 'cyberark', 'saviynt', 'azure-ad'], isMaster: false, description: 'General operations across all primary systems' },
    R008: { id: 'R008', name: 'Employee', priority: 8, systems: [], isMaster: false, description: 'Employee self-service access only' },
  },
  userRoles: {
    u1001: ['R001'],
    u1002: ['R002'],
    u1003: ['R003'],
    u1004: ['R004'],
    u1005: ['R005'],
    u1006: ['R006'],
    u1007: ['R007'],
    u1008: ['R008'],
    u1009: ['R002', 'R003', 'R004'],
  } as Record<string, string[]>,
  defaultRole: 'R008',
  roleKeyMapping: {
    R001: 'ops',
    R002: 'sso_ops',
    R003: 'pam_ops',
    R004: 'iga_ops',
    R005: 'entraid_ops',
    R006: 'tpag_ops',
    R007: 'ops',
    R008: 'employee',
  } as Record<string, string>,
};

function extractUserId(userId: string): string | null {
  const input = userId.toLowerCase().trim();
  // Only accept userId pattern directly (e.g., "u1001")
  if (/^u\d+$/.test(input)) {
    return input;
  }
  return null;
}

function getUserRoleIds(userId: string | null): string[] {
  if (!userId) return [RBAC_CONFIG.defaultRole];
  const roles = RBAC_CONFIG.userRoles[userId];
  return roles && roles.length > 0 ? roles : [RBAC_CONFIG.defaultRole];
}

function getRoleObjects(roleIds: string[]) {
  return roleIds
    .map(id => RBAC_CONFIG.roles[id as keyof typeof RBAC_CONFIG.roles])
    .filter(Boolean)
    .sort((a, b) => a.priority - b.priority);
}

function getAvailableRoles(userId: string | null) {
  const assignedRoleIds = getUserRoleIds(userId);
  const isMaster = assignedRoleIds.includes('R001');
  
  if (isMaster) {
    return Object.values(RBAC_CONFIG.roles).sort((a, b) => a.priority - b.priority);
  }
  
  return getRoleObjects(assignedRoleIds);
}

function getRbacLoginResponse(email: string) {
  const userId = extractUserId(email);
  const assignedRoleIds = getUserRoleIds(userId);
  const availableRoles = getAvailableRoles(userId);
  const activeRole = availableRoles.length > 0 ? availableRoles[0] : RBAC_CONFIG.roles.R008;
  const isMaster = assignedRoleIds.includes('R001');
  const roleKey = RBAC_CONFIG.roleKeyMapping[activeRole.id] || 'employee';
  
  return {
    userId,
    assignedRoles: assignedRoleIds,
    availableRoles,
    activeRole,
    isMaster,
    roleKey,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: userIdInput, password } = body;

    if (!userIdInput || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    // Get RBAC data for user (accepts userId like "u1001")
    const rbacData = getRbacLoginResponse(userIdInput);
    const role = rbacData.roleKey;

    // Generate JWT token
    const token = jwt.sign(
      { userId: rbacData.userId, role, activeRoleId: rbacData.activeRole.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      role,
      // RBAC fields
      userId: rbacData.userId || userIdInput,
      assignedRoles: rbacData.assignedRoles,
      availableRoles: rbacData.availableRoles,
      activeRole: rbacData.activeRole,
      isMaster: rbacData.isMaster,
    });
  } catch (error: unknown) {
    console.error('Auth login error:', error);
    const message = error instanceof Error ? error.message : 'Failed to login';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}