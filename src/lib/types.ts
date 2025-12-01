/**
 * Centralized type definitions for the application
 * This file contains all TypeScript interfaces and types
 */

export type SystemKey =
  | "ping-directory"
  | "ping-federate"
  | "cyberark"
  | "cyberark-epm"
  | "cyberark-alero"
  | "cyberark-conjur"
  | "cyberark-dpa"
  | "cyberark-identity"
  | "saviynt"
  | "saviynt-certifications"
  | "saviynt-analytics"
  | "saviynt-controls"
  | "saviynt-requests"
  | "saviynt-provisioning"
  | "azure-ad"
  | "azure-ad-users"
  | "azure-ad-groups"
  | "azure-ad-apps"
  | "azure-ad-conditional"
  | "azure-ad-signin"
  | "ping-mfa"
  | "ping-access"
  | "ping-authorize"
  | "ping-intelligence"
  | "saviynt-tpag"
  | "saviynt-tpag-vendors"
  | "saviynt-tpag-contracts"
  | "saviynt-tpag-access"
  | "saviynt-tpag-risk"
  | "saviynt-tpag-lifecycle";

export type Features = {
  credentialSource: string;
  useMocks: boolean;
  useMockAuth: boolean;
  systems: Record<string, boolean>;
  opsShowTilesAfterSearch?: boolean;
  employeeSearchSystems?: Partial<Record<SystemKey, boolean>>;
  systemsOrder?: SystemKey[];
  employeeEducateGuideEnabled?: boolean;
  quickActionsTabs?: Partial<Record<SystemKey, boolean>>;
};

export type LoginResponse = {
  token: string;
  role: string;
  email: string;
};

export type SystemData = Record<string, unknown>;

export type SearchResult = {
  userId: string;
  email: string;
  name: string;
  [key: string]: unknown;
};

// Search results by system - each system returns array of results
export type SearchResults = Record<SystemKey | string, SearchResult[] | Record<string, unknown>>;

// PF Ops dialog data structure
export type PfOpsResponse = {
  data?: Record<string, unknown>;
  error?: string;
  status?: number;
} | null;

export type SnowIncident = {
  number: string;
  short_description: string;
  state: string;
  priority: string;
  updatedAt: string;
  assigned_to: string;
};

export type SnowResponse = {
  email: string;
  total: number;
  items: SnowIncident[];
};

export type AuthData = {
  token: string | null;
  role: string | null;
  email: string | null;
};

export type SystemToggleState = Record<SystemKey, boolean>;

export type ApiErrorResponse = {
  error?: string;
  message?: string;
  status?: number;
};

// ============================================================================
// DATA DISPLAY TYPES (for DataDialog, SearchSection, etc.)
// ============================================================================

/** JSON-serializable primitive values */
export type JsonPrimitive = string | number | boolean | null;

/** JSON-serializable value (recursive) */
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/** Field section grouping for organized display */
export type FieldSection = {
  section: string;
  title: string;
  icon: string;
  gradient: string;
};
