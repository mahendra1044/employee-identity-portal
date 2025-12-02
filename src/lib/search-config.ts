/**
 * Search Configuration
 * 
 * Centralized configuration for employee search result cards.
 * Defines system-specific table columns, labels, and feature keys.
 * 
 * @module search-config
 */

import type { SystemKey } from "./types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Column definition for search result tables */
export interface SearchColumn {
  key: string;
  header: string;
  /** Optional accessor function for nested values */
  accessor?: (item: Record<string, unknown>) => string;
}

/** Configuration for a search result system card */
export interface SearchSystemConfig {
  system: SystemKey;
  label: string;
  /** Feature key for employee access control */
  featureKey: keyof EmployeeSearchSystems;
  /** Columns to display in the results table */
  columns: SearchColumn[];
  /** Key used to identify unique rows */
  rowKey: string;
  /** Fields to use for detail view key resolution */
  detailKeyFields: string[];
}

/** Employee search systems feature flags */
export interface EmployeeSearchSystems {
  "ping-directory"?: boolean;
  "ping-mfa"?: boolean;
  "ping-federate"?: boolean;
  "azure-ad"?: boolean;
  "cyberark"?: boolean;
  "saviynt"?: boolean;
}

// ============================================================================
// SEARCH SYSTEM CONFIGURATIONS
// ============================================================================

/**
 * Configuration for Ping Directory search results
 */
export const PING_DIRECTORY_CONFIG: SearchSystemConfig = {
  system: "ping-directory",
  label: "Ping Directory",
  featureKey: "ping-directory",
  rowKey: "userId",
  detailKeyFields: ["userId", "email"],
  columns: [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "userId", header: "User ID" },
  ],
};

/**
 * Configuration for Ping MFA search results
 */
export const PING_MFA_CONFIG: SearchSystemConfig = {
  system: "ping-mfa",
  label: "Ping MFA",
  featureKey: "ping-mfa",
  rowKey: "userId",
  detailKeyFields: ["userId", "email"],
  columns: [
    { key: "userId", header: "User ID" },
    { key: "status", header: "Status" },
    { key: "lastEvent", header: "Last Event" },
  ],
};

/**
 * All search system configurations in display order
 */
export const SEARCH_SYSTEMS: SearchSystemConfig[] = [
  PING_DIRECTORY_CONFIG,
  PING_MFA_CONFIG,
];

/**
 * Map of system key to configuration for quick lookup
 */
export const SEARCH_SYSTEM_MAP: Record<string, SearchSystemConfig> = 
  SEARCH_SYSTEMS.reduce((acc, config) => {
    acc[config.system] = config;
    return acc;
  }, {} as Record<string, SearchSystemConfig>);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get search configuration for a system
 */
export function getSearchConfig(system: SystemKey): SearchSystemConfig | undefined {
  return SEARCH_SYSTEM_MAP[system];
}

/**
 * Check if employee can view system based on features and search context
 */
export function canEmployeeViewSystem(
  system: SystemKey,
  role: string,
  search: string,
  email: string | null,
  features?: { employeeSearchSystems?: EmployeeSearchSystems }
): boolean {
  const isEmployee = role === "employee";
  if (!isEmployee) return true;
  
  const isSelf = String(search).trim().toLowerCase() === String(email || "").toLowerCase();
  if (isSelf) return true;
  
  const config = getSearchConfig(system);
  if (!config) return true;
  
  const allowSystem = features?.employeeSearchSystems?.[config.featureKey] ?? true;
  return allowSystem;
}

/**
 * Filter search results - returns all results consistently for all roles
 * The API already handles search filtering, so we pass through results as-is
 */
export function filterSearchResults<T extends Record<string, unknown>>(
  results: T[],
  _role: string,
  _search: string
): T[] {
  return results;
}

/**
 * Get the detail key from a result item
 */
export function getDetailKey(item: Record<string, unknown>, config: SearchSystemConfig): string {
  for (const field of config.detailKeyFields) {
    const value = item[field];
    if (value && typeof value === "string") {
      return value;
    }
  }
  return "";
}

/**
 * Build candidate keys for consolidated view search
 */
export function buildCandidateKeys(
  searchResults: Record<string, unknown[]> | null,
  search: string
): string[] {
  const pd = Array.isArray(searchResults?.["ping-directory"]) 
    ? searchResults["ping-directory"] as Record<string, unknown>[]
    : [];
  const mfa = Array.isArray(searchResults?.["ping-mfa"]) 
    ? searchResults["ping-mfa"] as Record<string, unknown>[]
    : [];
  
  const q = String(search).trim().toLowerCase();
  
  const exactPd = pd.find((u) => 
    (typeof u.email === "string" && u.email.toLowerCase() === q) ||
    u.userId === search.trim()
  );
  const exactMfa = mfa.find((u) => u.userId === search.trim());
  const firstPd = pd[0];
  const firstMfa = mfa[0];
  
  const baseCandidates = [
    exactPd?.email,
    exactPd?.userId,
    exactMfa?.userId,
    firstPd?.email,
    firstPd?.userId,
    firstMfa?.userId,
    firstMfa?.email,
    search,
  ]
    .filter((s): s is string => Boolean(s) && typeof s === "string")
    .map((s) => String(s));
  
  return Array.from(new Set([
    ...baseCandidates,
    ...baseCandidates.map((k) => k.toLowerCase()),
    ...baseCandidates.map((k) => k.toUpperCase()),
  ]));
}
