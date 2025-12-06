/**
 * Role utility functions for determining ops modes and system access
 * 
 * Note: This file uses constants from ./constants.ts for system groups.
 * Role definitions are centralized in @/config/roles.config.ts
 */

import type { SystemKey } from "./types";
import { ROLE_SYSTEM_ACCESS } from "@/config/systems.config";
import { OPS_ROLE_KEYS, ROLE_DESCRIPTIONS, isOpsRoleKey } from "@/config/roles.config";

/**
 * Determines if a role is an ops-like role (has ops privileges)
 * Uses centralized OPS_ROLE_KEYS from roles.config.ts
 */
export function isOpsRole(role: string | null | undefined): boolean {
  return isOpsRoleKey(role);
}

/**
 * Gets the allowed systems for a specific ops role
 * Uses ROLE_SYSTEM_ACCESS from systems.config.ts (single source of truth)
 */
export function getAllowedSystemsForRole(role: string | null | undefined): SystemKey[] | null {
  if (!role) return null;
  
  // Use centralized ROLE_SYSTEM_ACCESS mapping
  const systems = ROLE_SYSTEM_ACCESS[role];
  
  // undefined means role not found, return null (all systems)
  // null means admin role (all systems)
  // array means specific systems for that role
  if (systems === undefined) return null;
  if (systems === null) return null;
  
  return [...systems]; // Return copy to prevent mutation
}

/**
 * Filters systems based on role permissions
 */
export function filterSystemsByRole(systems: readonly SystemKey[], role: string | null | undefined): SystemKey[] {
  if (!role) return [...systems];
  
  const allowedSystems = getAllowedSystemsForRole(role);
  
  // null means all systems allowed
  if (allowedSystems === null) return [...systems];
  
  // Filter to only allowed systems
  return systems.filter(sys => allowedSystems.includes(sys));
}

/**
 * Gets a human-readable description of the ops mode
 * Uses centralized ROLE_DESCRIPTIONS from roles.config.ts
 */
export function getOpsModeDescription(role: string | null | undefined): string {
  if (!role) return "";
  return ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS] || "";
}