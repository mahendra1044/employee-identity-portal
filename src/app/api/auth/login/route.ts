import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { RBAC_CONFIG } from '@/config/roles.config';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// User to Role mapping (static for mock auth)
// In production, this would come from a database or identity provider
const USER_ROLES: Record<string, string[]> = {
  u1001: ['R001'],
  u1002: ['R002'],
  u1003: ['R003'],
  u1004: ['R004'],
  u1005: ['R005'],
  u1006: ['R006'],
  u1007: ['R007'],
  u1008: ['R008'],
  u1009: ['R002', 'R003', 'R004'],
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
  const roles = USER_ROLES[userId];
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

function getRbacLoginResponse(userIdInput: string) {
  const userId = extractUserId(userIdInput);
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