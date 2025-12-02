/**
 * Application-wide constants and configuration
 */

import type { SystemKey } from "./types";

export const SYSTEMS: SystemKey[] = [
  "ping-directory",
  "ping-federate",
  "cyberark",
  "cyberark-epm",
  "cyberark-alero",
  "cyberark-conjur",
  "cyberark-dpa",
  "cyberark-identity",
  "saviynt",
  "saviynt-certifications",
  "saviynt-analytics",
  "saviynt-controls",
  "saviynt-requests",
  "saviynt-provisioning",
  "azure-ad",
  "azure-ad-users",
  "azure-ad-groups",
  "azure-ad-apps",
  "azure-ad-conditional",
  "azure-ad-signin",
  "ping-mfa",
  "ping-access",
  "ping-authorize",
  "ping-intelligence",
  "saviynt-tpag",
  "saviynt-tpag-vendors",
  "saviynt-tpag-contracts",
  "saviynt-tpag-access",
  "saviynt-tpag-risk",
  "saviynt-tpag-lifecycle",
];

export const SYSTEM_LABELS: Record<SystemKey, string> = {
  "ping-directory": "Ping Directory",
  "ping-federate": "Ping Federate",
  "cyberark": "CyberArk PAM",
  "cyberark-epm": "CyberArk EPM",
  "cyberark-alero": "CyberArk Alero",
  "cyberark-conjur": "CyberArk Conjur",
  "cyberark-dpa": "CyberArk DPA",
  "cyberark-identity": "CyberArk Identity",
  "saviynt": "Saviynt IGA",
  "saviynt-certifications": "Saviynt Certifications",
  "saviynt-analytics": "Saviynt Analytics",
  "saviynt-controls": "Saviynt Controls",
  "saviynt-requests": "Saviynt Requests",
  "saviynt-provisioning": "Saviynt Provisioning",
  "azure-ad": "Microsoft Entra ID",
  "azure-ad-users": "Entra ID Users",
  "azure-ad-groups": "Entra ID Groups",
  "azure-ad-apps": "Entra ID Apps",
  "azure-ad-conditional": "Conditional Access",
  "azure-ad-signin": "Sign-in Logs",
  "ping-mfa": "Ping MFA",
  "ping-access": "Ping Access",
  "ping-authorize": "Ping Authorize",
  "ping-intelligence": "Ping Intelligence",
  "saviynt-tpag": "TPAG Overview",
  "saviynt-tpag-vendors": "TPAG Vendors",
  "saviynt-tpag-contracts": "TPAG Contracts",
  "saviynt-tpag-access": "TPAG Access",
  "saviynt-tpag-risk": "TPAG Risk",
  "saviynt-tpag-lifecycle": "TPAG Lifecycle",
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
  "cyberark-epm",
  "cyberark-alero",
  "cyberark-conjur",
  "cyberark-dpa",
  "cyberark-identity",
];

export const IGA_SYSTEMS: SystemKey[] = [
  "saviynt",
  "saviynt-certifications",
  "saviynt-analytics",
  "saviynt-controls",
  "saviynt-requests",
  "saviynt-provisioning",
];

export const ENTRAID_SYSTEMS: SystemKey[] = [
  "azure-ad",
  "azure-ad-users",
  "azure-ad-groups",
  "azure-ad-apps",
  "azure-ad-conditional",
  "azure-ad-signin",
];

export const TPAG_SYSTEMS: SystemKey[] = [
  "saviynt-tpag",
  "saviynt-tpag-vendors",
  "saviynt-tpag-contracts",
  "saviynt-tpag-access",
  "saviynt-tpag-risk",
  "saviynt-tpag-lifecycle",
];

export const API_BASE = 
  typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001"
    : "http://localhost:3001";