/**
 * API Client Types
 * =================
 * 
 * TypeScript interfaces for the centralized API client.
 * These types ensure type safety across all API interactions.
 * 
 * @module api-client/types
 */

import type { SystemKey } from '../types';

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Options for API requests
 * Pass these to control authentication, caching, and request behavior
 */
export interface ApiRequestOptions {
  /** Authentication token (JWT) */
  token?: string | null;
  /** Skip cache and force fresh request */
  skipCache?: boolean;
  /** Cache TTL in milliseconds (default: 30000) */
  cacheTtl?: number;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Additional headers to include */
  headers?: Record<string, string>;
  /** Abort signal for request cancellation */
  signal?: AbortSignal;
}

/**
 * Standardized API response wrapper
 * All API methods return this structure for consistency
 */
export interface ApiResponse<T = unknown> {
  /** Whether the request was successful */
  ok: boolean;
  /** Response data (undefined if error) */
  data?: T;
  /** Error message (undefined if success) */
  error?: string;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers?: Record<string, string>;
  /** Whether response came from cache */
  cached?: boolean;
}

/**
 * Custom API error with additional context
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  endpoint?: string;
  details?: unknown;
}

// ============================================================================
// SYSTEM CATEGORIES
// ============================================================================

/**
 * System categories for organization
 * Used to group related systems together
 */
export type SystemCategory = 
  | 'sso'      // SSO/Ping systems
  | 'pam'      // CyberArk/PAM systems
  | 'iga'      // Saviynt/IGA systems
  | 'cloud'    // Azure AD/Cloud identity
  | 'ops';     // Operations (SNOW, failures, etc.)

/**
 * Map of system keys to their categories
 */
export const SYSTEM_CATEGORIES: Record<SystemKey, SystemCategory> = {
  // SSO Systems
  'ping-directory': 'sso',
  'ping-federate': 'sso',
  'ping-mfa': 'sso',
  'ping-access': 'sso',
  'ping-authorize': 'sso',
  'ping-intelligence': 'sso',
  
  // PAM Systems
  'cyberark': 'pam',
  'cyberark-epm': 'pam',
  'cyberark-alero': 'pam',
  'cyberark-conjur': 'pam',
  'cyberark-dpa': 'pam',
  'cyberark-identity': 'pam',
  
  // IGA Systems
  'saviynt': 'iga',
  'saviynt-certifications': 'iga',
  'saviynt-analytics': 'iga',
  'saviynt-controls': 'iga',
  'saviynt-requests': 'iga',
  'saviynt-provisioning': 'iga',
  'saviynt-tpag': 'iga',
  'saviynt-tpag-vendors': 'iga',
  'saviynt-tpag-contracts': 'iga',
  'saviynt-tpag-access': 'iga',
  'saviynt-tpag-risk': 'iga',
  'saviynt-tpag-lifecycle': 'iga',
  
  // Cloud Identity
  'azure-ad': 'cloud',
  'azure-ad-users': 'cloud',
  'azure-ad-groups': 'cloud',
  'azure-ad-apps': 'cloud',
  'azure-ad-conditional': 'cloud',
  'azure-ad-signin': 'cloud',
};

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Login request payload
 */
export interface LoginRequest {
  userId: string;
  password: string;
}

/**
 * Login response with token and RBAC data
 * Re-exported from central types.ts (single source of truth)
 */
export type { LoginResponse } from '@/lib/types';

// ============================================================================
// SEARCH TYPES
// ============================================================================

/**
 * Employee search result
 */
export interface SearchResult {
  userId: string;
  email: string;
  name?: string;
  department?: string;
  title?: string;
  systems?: Record<string, unknown>;
}

/**
 * System details response
 */
export interface SystemDetails {
  userId?: string;
  data?: unknown;
  error?: string;
  status?: string;
  [key: string]: unknown;
}

// ============================================================================
// OPERATIONS TYPES
// ============================================================================

/**
 * SNOW ticket submission request
 */
export interface SnowTicketRequest {
  system: string;
  payload?: Record<string, unknown>;
  userEmail: string;
  description: string;
}

/**
 * SNOW ticket response
 */
export interface SnowTicketResponse {
  success: boolean;
  ticketNumber?: string;
  message?: string;
  error?: string;
}

/**
 * Failure data from ops endpoints
 */
export interface FailureRecord {
  id: string;
  timestamp: string;
  system: string;
  userId?: string;
  error?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// DATA SOURCE TYPES
// ============================================================================

/**
 * Data Source Mode
 * Controls whether a system group uses real API or mock data
 */
export type DataSourceMode = 'USE_API' | 'USE_MOCK';

/**
 * System Group identifiers
 */
export type SystemGroup = 'sso' | 'pam' | 'iga' | 'entraId' | 'tpag';

/**
 * Per-system-group data source configuration
 */
export type SystemDataSourceConfig = Record<SystemGroup, DataSourceMode>;

// ============================================================================
// CONFIG TYPES
// ============================================================================

/**
 * Features configuration response
 */
export interface FeaturesConfig {
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
}
