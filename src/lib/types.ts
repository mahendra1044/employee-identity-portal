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

/**
 * Data Source Mode
 * -----------------
 * Controls whether a system group uses real API or mock data
 * 
 * NOTE: If backend's useMocks=true, it acts as a global override
 * and ALL systems use mock data regardless of systemDataSource settings.
 */
export type DataSourceMode = 'USE_API' | 'USE_MOCK';

/**
 * System Group (Data Source Groups)
 * ==================================
 * Logical groupings of systems for DATA SOURCE configuration.
 * Used to determine whether to use mock or real API for a system.
 * 
 * - sso: SSO/Ping Identity systems
 * - pam: CyberArk PAM systems
 * - iga: Saviynt IGA systems
 * - entraId: Microsoft Entra ID systems
 * - tpag: Third Party Access Governance systems
 * - ops: Operations/ServiceNow systems
 * 
 * NOTE: This is different from UISystemGroupKey in systems.config.ts,
 * which includes 'core' for UI display purposes.
 * 'core' is a UI concept containing a subset of systems for employee view.
 * 
 * @see UISystemGroupKey in systems.config.ts for UI display groups
 * @see SYSTEM_DATA_SOURCE in features.config.ts for toggle configuration
 */
export type SystemGroup = 'sso' | 'pam' | 'iga' | 'entraId' | 'tpag' | 'ops';

/**
 * System Data Source Configuration
 * ---------------------------------
 * Maps each system group to its data source mode
 */
export type SystemDataSourceConfig = Record<SystemGroup, DataSourceMode>;

// ============================================================================
// RBAC TYPES
// ============================================================================

/** Role definition from RBAC config */
export interface RBACRole {
  id: string;
  name: string;
  priority: number;
  systems: string[];
  isMaster: boolean;
  description: string;
}

/** RBAC data included in login response */
export interface RBACData {
  userId: string | null;
  assignedRoles: string[];
  availableRoles: RBACRole[];
  activeRole: RBACRole;
  isMaster: boolean;
}

// ============================================================================
// FEATURE & LOGIN TYPES
// ============================================================================

export type Features = {
  credentialSource: string;
  useMocks: boolean;
  useMockAuth: boolean;
  systems: Record<string, boolean>;
  /**
   * Per-system-group data source configuration
   * Allows incremental API rollout by system category
   */
  systemDataSource?: SystemDataSourceConfig;
  opsShowTilesAfterSearch?: boolean;
  employeeSearchSystems?: Partial<Record<SystemKey, boolean>>;
  systemsOrder?: SystemKey[];
  employeeEducateGuideEnabled?: boolean;
  quickActionsTabs?: Partial<Record<SystemKey, boolean>>;
};

export type LoginResponse = {
  token: string;
  role: string;
  // RBAC fields
  userId: string | null;
  assignedRoles?: string[];
  availableRoles?: RBACRole[];
  activeRole?: RBACRole;
  isMaster?: boolean;
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
  userId: string | null;
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
