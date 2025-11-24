/**
 * Application-wide constants and configuration
 */

import type { SystemKey } from "./types";

export const SYSTEMS: SystemKey[] = [
  "ping-directory",
  "ping-federate",
  "cyberark",
  "saviynt",
  "azure-ad",
  "ping-mfa",
  "ping-access",
  "ping-authorize",
  "ping-intelligence",
];

export const SYSTEM_LABELS: Record<SystemKey, string> = {
  "ping-directory": "Ping Directory",
  "ping-federate": "Ping Federate",
  "cyberark": "CyberArk",
  "saviynt": "Saviynt",
  "azure-ad": "Azure AD",
  "ping-mfa": "Ping MFA",
  "ping-access": "Ping Access",
  "ping-authorize": "Ping Authorize",
  "ping-intelligence": "Ping Intelligence",
};

export const ROLE_MAP: Record<string, string> = {
  "ops": "Operations Team",
  "sso_ops": "SSO Operations",
  "pam_ops": "PAM Operations",
  "iga_ops": "IGA Operations",
  "tpag_ops": "TPAG Operations",
  "employee": "Employee Access",
  "management": "Management",
  "admin": "Administrator",
  "manager": "Manager",
};

// System groups for specialized ops modes
export const PING_SYSTEMS: SystemKey[] = [
  "ping-directory",
  "ping-federate",
  "ping-mfa",
  "ping-access",
  "ping-authorize",
  "ping-intelligence",
];

// Original 6 systems (before the 3 new Ping systems were added)
export const ORIGINAL_SYSTEMS: SystemKey[] = [
  "ping-directory",
  "ping-federate",
  "ping-mfa",
  "azure-ad",
  "cyberark",
  "saviynt",
];

export const PAM_SYSTEMS: SystemKey[] = [
  "cyberark",
];

export const IGA_SYSTEMS: SystemKey[] = [
  "saviynt",
];

export const TPAG_SYSTEMS: SystemKey[] = [
  // To be defined based on requirements
];

export const API_BASE = 
  typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001"
    : "http://localhost:3001";

export const DEFAULT_THEME = "light";

export const AVAILABLE_THEMES = ["light", "dark", "navy"] as const;

export const STORAGE_KEYS = {
  TOKEN: "token",
  ROLE: "role",
  EMAIL: "email",
  THEME: "theme",
  SYSTEM_TOGGLES: "systemToggles",
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGIN_ERROR: "Login failed",
  LOGOUT_SUCCESS: "Logged out",
  THEME_CHANGED: "Theme changed",
  TOGGLE_SAVED: "Settings saved",
  RESET_SUCCESS: "Reset to defaults",
  COPY_SUCCESS: "Copied to clipboard",
  COPY_ERROR: "Failed to copy",
} as const;