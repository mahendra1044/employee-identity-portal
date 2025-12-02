/**
 * Role utility functions for determining ops modes and system access
 */

import type { SystemKey } from "./types";
import { PING_SYSTEMS, PAM_SYSTEMS, IGA_SYSTEMS, ENTRAID_SYSTEMS, TPAG_SYSTEMS, ORIGINAL_SYSTEMS } from "./constants";

/**
 * Determines if a role is an ops-like role (has ops privileges)
 */
export function isOpsRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return role === "ops" || 
         role === "sso_ops" || 
         role === "pam_ops" || 
         role === "iga_ops" || 
         role === "entraid_ops" ||
         role === "tpag_ops";
}

/**
 * Gets the allowed systems for a specific ops role
 * Returns original 6 systems for general ops, or filtered systems for specialized ops
 */
export function getAllowedSystemsForRole(role: string | null | undefined): SystemKey[] | null {
  if (!role) return null;
  
  switch (role) {
    case "ops":
      return ORIGINAL_SYSTEMS; // General ops sees only the original 6 systems
    case "sso_ops":
      return PING_SYSTEMS;
    case "pam_ops":
      return PAM_SYSTEMS;
    case "iga_ops":
      return IGA_SYSTEMS;
    case "entraid_ops":
      return ENTRAID_SYSTEMS;
    case "tpag_ops":
      return TPAG_SYSTEMS;
    case "employee":
      return ORIGINAL_SYSTEMS; // Employees see only the original 6 systems
    default:
      return null;
  }
}

/**
 * Filters systems based on role permissions
 */
export function filterSystemsByRole(systems: SystemKey[], role: string | null | undefined): SystemKey[] {
  if (!role) return systems;
  
  const allowedSystems = getAllowedSystemsForRole(role);
  
  // null means all systems allowed
  if (allowedSystems === null) return systems;
  
  // Filter to only allowed systems
  return systems.filter(sys => allowedSystems.includes(sys));
}

/**
 * Gets a human-readable description of the ops mode
 */
export function getOpsModeDescription(role: string | null | undefined): string {
  if (!role) return "";
  
  switch (role) {
    case "ops":
      return "Operations Team (Core Systems)";
    case "sso_ops":
      return "SSO Operations (Ping Systems)";
    case "pam_ops":
      return "PAM Operations (CyberArk)";
    case "iga_ops":
      return "IGA Operations (Saviynt)";
    case "entraid_ops":
      return "Entra ID Operations (Azure AD)";
    case "tpag_ops":
      return "TPAG Operations (Third-Party Access Governance)";
    default:
      return "";
  }
}