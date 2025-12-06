/**
 * Educate Me Utilities
 * 
 * Helper functions for parsing tips, mapping icons, and categorizing systems
 * for the Educational Guides feature.
 * 
 * @module educate-utils
 */

import type { SystemKey } from "./types";

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

export type SystemCategory = "sso" | "pam" | "iga" | "entra" | "tpag";

export interface CategoryConfig {
  id: SystemCategory;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export const CATEGORY_CONFIG: Record<SystemCategory, CategoryConfig> = {
  sso: {
    id: "sso",
    name: "Single Sign-On",
    shortName: "SSO",
    icon: "🔐",
    color: "blue",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  pam: {
    id: "pam",
    name: "Privileged Access",
    shortName: "PAM",
    icon: "🔒",
    color: "purple",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-700 dark:text-purple-300",
  },
  iga: {
    id: "iga",
    name: "Identity Governance",
    shortName: "IGA",
    icon: "👤",
    color: "emerald",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  entra: {
    id: "entra",
    name: "Microsoft Entra",
    shortName: "Entra",
    icon: "☁️",
    color: "sky",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    borderColor: "border-sky-200 dark:border-sky-800",
    textColor: "text-sky-700 dark:text-sky-300",
  },
  tpag: {
    id: "tpag",
    name: "Third-Party Access",
    shortName: "TPAG",
    icon: "🤝",
    color: "amber",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-700 dark:text-amber-300",
  },
};

// ============================================================================
// SYSTEM TO CATEGORY MAPPING
// ============================================================================

export const SYSTEM_CATEGORY_MAP: Record<string, SystemCategory> = {
  // SSO - Ping Systems
  "ping-directory": "sso",
  "ping-federate": "sso",
  "ping-mfa": "sso",
  "ping-access": "sso",
  "ping-authorize": "sso",
  "ping-intelligence": "sso",
  
  // PAM - CyberArk Systems
  "cyberark": "pam",
  "cyberark-epm": "pam",
  "cyberark-alero": "pam",
  "cyberark-conjur": "pam",
  "cyberark-dpa": "pam",
  "cyberark-identity": "pam",
  
  // IGA - Saviynt Systems
  "saviynt": "iga",
  "saviynt-certifications": "iga",
  "saviynt-analytics": "iga",
  "saviynt-controls": "iga",
  "saviynt-requests": "iga",
  "saviynt-provisioning": "iga",
  
  // Entra - Azure AD Systems
  "azure-ad": "entra",
  "azure-ad-users": "entra",
  "azure-ad-groups": "entra",
  "azure-ad-apps": "entra",
  "azure-ad-conditional": "entra",
  "azure-ad-signin": "entra",
  
  // TPAG - Third-Party Access Governance
  "saviynt-tpag": "tpag",
  "saviynt-tpag-vendors": "tpag",
  "saviynt-tpag-contracts": "tpag",
  "saviynt-tpag-access": "tpag",
  "saviynt-tpag-risk": "tpag",
  "saviynt-tpag-lifecycle": "tpag",
};

// ============================================================================
// SYSTEM ICONS
// ============================================================================

export const SYSTEM_ICONS: Record<string, string> = {
  // Ping Systems
  "ping-directory": "📁",
  "ping-federate": "🔗",
  "ping-mfa": "📱",
  "ping-access": "🚪",
  "ping-authorize": "✅",
  "ping-intelligence": "🧠",
  
  // CyberArk Systems
  "cyberark": "🏦",
  "cyberark-epm": "💻",
  "cyberark-alero": "🌐",
  "cyberark-conjur": "🔑",
  "cyberark-dpa": "🛡️",
  "cyberark-identity": "🆔",
  
  // Saviynt Systems
  "saviynt": "⚙️",
  "saviynt-certifications": "📜",
  "saviynt-analytics": "📊",
  "saviynt-controls": "🎛️",
  "saviynt-requests": "📝",
  "saviynt-provisioning": "🔧",
  
  // Azure AD Systems
  "azure-ad": "☁️",
  "azure-ad-users": "👥",
  "azure-ad-groups": "👨‍👩‍👧‍👦",
  "azure-ad-apps": "📦",
  "azure-ad-conditional": "🚦",
  "azure-ad-signin": "📋",
  
  // TPAG Systems
  "saviynt-tpag": "🤝",
  "saviynt-tpag-vendors": "🏢",
  "saviynt-tpag-contracts": "📄",
  "saviynt-tpag-access": "🔓",
  "saviynt-tpag-risk": "⚠️",
  "saviynt-tpag-lifecycle": "🔄",
};

// ============================================================================
// TIP ACTION PARSING
// ============================================================================

export type TipActionType = 
  | "verify" 
  | "check" 
  | "review" 
  | "monitor" 
  | "validate" 
  | "inspect" 
  | "confirm" 
  | "track"
  | "manage"
  | "examine"
  | "list"
  | "general";

export interface ParsedTip {
  action: TipActionType;
  actionIcon: string;
  actionLabel: string;
  text: string;
  keywords: string[];
}

const ACTION_PATTERNS: Array<{ pattern: RegExp; action: TipActionType; icon: string; label: string }> = [
  { pattern: /^verify/i, action: "verify", icon: "✓", label: "Verify" },
  { pattern: /^check/i, action: "check", icon: "🔍", label: "Check" },
  { pattern: /^review/i, action: "review", icon: "📋", label: "Review" },
  { pattern: /^monitor/i, action: "monitor", icon: "👁️", label: "Monitor" },
  { pattern: /^validate/i, action: "validate", icon: "✅", label: "Validate" },
  { pattern: /^inspect/i, action: "inspect", icon: "🔎", label: "Inspect" },
  { pattern: /^confirm/i, action: "confirm", icon: "☑️", label: "Confirm" },
  { pattern: /^track/i, action: "track", icon: "📍", label: "Track" },
  { pattern: /^manage/i, action: "manage", icon: "⚙️", label: "Manage" },
  { pattern: /^examine/i, action: "examine", icon: "🧐", label: "Examine" },
  { pattern: /^list/i, action: "list", icon: "📝", label: "List" },
  { pattern: /^conduct/i, action: "review", icon: "📋", label: "Conduct" },
];

// Keywords to highlight in tips
const HIGHLIGHT_KEYWORDS = [
  "blocked", "denied", "failed", "error", "expired", "locked", "suspended",
  "missing", "invalid", "revoked", "violation", "risk", "alert", "critical",
  "pending", "timeout", "sync", "compliance", "security", "access",
];

/**
 * Parse a tip to extract action type, icon, and keywords
 */
export function parseTip(tip: string): ParsedTip {
  let action: TipActionType = "general";
  let actionIcon = "💡";
  let actionLabel = "Tip";
  
  // Find matching action pattern
  for (const { pattern, action: act, icon, label } of ACTION_PATTERNS) {
    if (pattern.test(tip)) {
      action = act;
      actionIcon = icon;
      actionLabel = label;
      break;
    }
  }
  
  // Extract keywords found in the tip
  const keywords = HIGHLIGHT_KEYWORDS.filter(kw => 
    tip.toLowerCase().includes(kw.toLowerCase())
  );
  
  return {
    action,
    actionIcon,
    actionLabel,
    text: tip,
    keywords,
  };
}

/**
 * Get category for a system
 */
export function getSystemCategory(system: string): SystemCategory | null {
  return SYSTEM_CATEGORY_MAP[system] || null;
}

/**
 * Get category config for a system
 */
export function getSystemCategoryConfig(system: string): CategoryConfig | null {
  const category = getSystemCategory(system);
  return category ? CATEGORY_CONFIG[category] : null;
}

/**
 * Get icon for a system
 */
export function getSystemIcon(system: string): string {
  return SYSTEM_ICONS[system] || "📌";
}

/**
 * Group systems by category
 */
export function groupSystemsByCategory(systems: SystemKey[]): Map<SystemCategory, SystemKey[]> {
  const groups = new Map<SystemCategory, SystemKey[]>();
  
  for (const system of systems) {
    const category = getSystemCategory(system);
    if (category) {
      const existing = groups.get(category) || [];
      existing.push(system);
      groups.set(category, existing);
    }
  }
  
  return groups;
}

/**
 * Get all categories that have systems in the provided list
 */
export function getActiveCategories(systems: SystemKey[]): SystemCategory[] {
  const categories = new Set<SystemCategory>();
  
  for (const system of systems) {
    const category = getSystemCategory(system);
    if (category) {
      categories.add(category);
    }
  }
  
  // Return in a specific order
  const order: SystemCategory[] = ["sso", "pam", "iga", "entra", "tpag"];
  return order.filter(cat => categories.has(cat));
}

// ============================================================================
// ADDITIONAL EXPORTS FOR EDUCATE DIALOG
// ============================================================================

import {
  Key,
  Shield,
  Users,
  Cloud,
  Handshake,
  LucideIcon,
  CheckCircle,
  Search,
  ClipboardList,
  Eye,
  AlertCircle,
  Settings,
  List,
  Lightbulb,
} from "lucide-react";

/**
 * Category display names
 */
export const SYSTEM_CATEGORIES: Record<SystemCategory, string> = {
  sso: "Single Sign-On (Ping)",
  pam: "Privileged Access (CyberArk)",
  iga: "Identity Governance (Saviynt)",
  entra: "Microsoft Entra ID",
  tpag: "Third-Party Access Governance",
};

/**
 * Get Lucide icon component for a category
 */
export function getCategoryIcon(category: SystemCategory): LucideIcon {
  const icons: Record<SystemCategory, LucideIcon> = {
    sso: Key,
    pam: Shield,
    iga: Users,
    entra: Cloud,
    tpag: Handshake,
  };
  return icons[category] || Key;
}

/**
 * Get Tailwind color classes for a category
 */
export function getCategoryColor(category: SystemCategory): string {
  const colors: Record<SystemCategory, string> = {
    sso: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    pam: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    iga: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    entra: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    tpag: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return colors[category] || "bg-gray-500/10 text-gray-600 dark:text-gray-400";
}

/**
 * Get Lucide icon for a tip based on its content
 */
export function getTipIcon(tip: string): LucideIcon {
  const lowerTip = tip.toLowerCase();
  
  if (lowerTip.startsWith("verify") || lowerTip.startsWith("confirm")) {
    return CheckCircle;
  }
  if (lowerTip.startsWith("check") || lowerTip.startsWith("inspect")) {
    return Search;
  }
  if (lowerTip.startsWith("review") || lowerTip.startsWith("examine")) {
    return ClipboardList;
  }
  if (lowerTip.startsWith("monitor") || lowerTip.startsWith("track")) {
    return Eye;
  }
  if (lowerTip.startsWith("validate")) {
    return AlertCircle;
  }
  if (lowerTip.startsWith("manage") || lowerTip.startsWith("configure")) {
    return Settings;
  }
  if (lowerTip.startsWith("list")) {
    return List;
  }
  
  return Lightbulb;
}