/**
 * API Configuration Types
 * =======================
 * 
 * TypeScript types for mock and real API configurations.
 * These types ensure consistent structure across all system configs.
 * 
 * @module config/api/types
 */

import type { SystemGroup } from '@/lib/types';

// ============================================================================
// AUTH & CONNECTION TYPES
// ============================================================================

/**
 * Authentication methods supported for real API connections
 */
export type AuthMethod = 'oauth2' | 'basic' | 'apiKey' | 'bearer' | 'none';

/**
 * HTTP methods supported for API calls
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Connection configuration for real APIs
 */
export interface ApiConnection {
  /** Base URL for the API (from environment variable) */
  baseUrl: string;
  /** Client ID for OAuth2/API authentication */
  clientId?: string;
  /** Client Secret for OAuth2 authentication */
  clientSecret?: string;
  /** Tenant ID (for Microsoft Graph) */
  tenantId?: string;
  /** API Key (for API key authentication) */
  apiKey?: string;
  /** Authentication method to use */
  authMethod: AuthMethod;
  /** Token endpoint for OAuth2 */
  tokenEndpoint?: string;
  /** OAuth2 scopes required */
  scopes?: string[];
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Default headers for API requests
 */
export interface ApiHeaders {
  'Content-Type'?: string;
  'Accept'?: string;
  [key: string]: string | undefined;
}

// ============================================================================
// ENDPOINT CONFIGURATION TYPES
// ============================================================================

/**
 * Base endpoint configuration
 */
export interface BaseEndpointConfig {
  /** API endpoint path (can include {placeholders}) */
  endpoint: string;
  /** HTTP method */
  method: HttpMethod;
  /** Description of what this endpoint does */
  description?: string;
}

/**
 * Real API endpoint configuration with full details
 */
export interface RealEndpointConfig extends BaseEndpointConfig {
  /** Query parameters supported */
  queryParams?: string[];
  /** Request body template */
  requestBody?: Record<string, unknown>;
  /** Mapping of request fields to API fields */
  requestMapping?: Record<string, string>;
  /** Mapping of API response fields to app fields */
  responseMapping?: Record<string, string>;
  /** Success message to show user */
  successMessage?: string;
  /** Error message template */
  errorMessage?: string;
}

/**
 * Mock API endpoint configuration
 */
export interface MockEndpointConfig extends BaseEndpointConfig {
  /** Mock JSON file to use for response */
  mockFile?: string;
  /** Mock generator function name */
  mockGenerator?: string;
  /** Static mock response */
  mockResponse?: Record<string, unknown>;
}

// ============================================================================
// SYSTEM GROUP CONFIGURATION TYPES
// ============================================================================

/**
 * Base system group configuration
 */
export interface BaseSystemConfig {
  /** Connection settings */
  connection: ApiConnection;
  /** Default headers */
  headers?: ApiHeaders;
}

/**
 * Real API system configuration
 */
export interface RealSystemConfig extends BaseSystemConfig {
  /** System Cards API calls */
  systemCards: Record<string, RealEndpointConfig>;
  /** Search API calls */
  search: {
    searchUsers: RealEndpointConfig;
    getUserDetails: RealEndpointConfig;
  };
  /** Failures API calls */
  failures: Record<string, RealEndpointConfig>;
  /** Quick Actions API calls */
  quickActions: Record<string, RealEndpointConfig>;
}

/**
 * Mock API system configuration
 */
export interface MockSystemConfig extends BaseSystemConfig {
  /** System Cards API calls */
  systemCards: Record<string, MockEndpointConfig>;
  /** Search API calls */
  search: {
    searchUsers: MockEndpointConfig;
    getUserDetails: MockEndpointConfig;
  };
  /** Failures API calls */
  failures: Record<string, MockEndpointConfig>;
  /** Quick Actions API calls */
  quickActions: Record<string, MockEndpointConfig>;
}

// ============================================================================
// AGGREGATED CONFIG TYPES
// ============================================================================

/**
 * All real API configurations by system group
 */
export interface RealApiConfigs {
  sso: RealSystemConfig;
  pam: RealSystemConfig;
  iga: RealSystemConfig;
  entraId: RealSystemConfig;
  tpag: RealSystemConfig;
  ops: RealSystemConfig;
}

/**
 * All mock API configurations by system group
 */
export interface MockApiConfigs {
  sso: MockSystemConfig;
  pam: MockSystemConfig;
  iga: MockSystemConfig;
  entraId: MockSystemConfig;
  tpag: MockSystemConfig;
  ops: MockSystemConfig;
}

/**
 * Union type for any system config
 */
export type SystemConfig = RealSystemConfig | MockSystemConfig;

/**
 * Union type for any endpoint config
 */
export type EndpointConfig = RealEndpointConfig | MockEndpointConfig;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * System group identifiers - alias to main SystemGroup type
 * Re-exported for API module convenience
 */
export type SystemGroupId = SystemGroup;

/**
 * Feature section identifiers
 */
export type FeatureSection = 'systemCards' | 'search' | 'failures' | 'quickActions';

/**
 * Endpoint lookup result
 */
export interface EndpointLookup {
  config: EndpointConfig;
  fullUrl: string;
  headers: ApiHeaders;
  authMethod: AuthMethod;
}
