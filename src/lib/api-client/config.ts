/**
 * API Client Configuration
 * =========================
 * 
 * Centralized configuration for API client behavior.
 * Modify these values to change global API settings.
 * 
 * @module api-client/config
 */

/**
 * API Configuration
 * 
 * These settings control the default behavior of all API requests.
 * Individual requests can override these via ApiRequestOptions.
 */
export const API_CONFIG = {
  /**
   * Base URL for API requests
   * Empty string means use relative URLs (same origin)
   * For external APIs, set the full URL here
   */
  baseUrl: '',

  /**
   * Default request timeout in milliseconds
   * Requests taking longer will be aborted
   */
  defaultTimeout: 30000,

  /**
   * Default cache TTL in milliseconds
   * Cached responses older than this are considered stale
   */
  defaultCacheTtl: 30000,

  /**
   * Enable debug logging
   * When true, logs all requests/responses to console
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Retry configuration for failed requests
   */
  retry: {
    /** Number of retry attempts for failed requests */
    maxRetries: 0,
    /** Delay between retries in milliseconds */
    retryDelay: 1000,
    /** HTTP status codes that should trigger a retry */
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  },

  /**
   * Default headers included in all requests
   */
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * API Endpoints
 * 
 * Centralized endpoint definitions for all API routes.
 * Use these instead of hardcoding URLs in components.
 */
export const ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
  },

  // Configuration
  config: {
    features: '/api/config/features',
    roles: '/api/config/roles',
  },

  // Search
  search: {
    employee: (query: string) => `/api/search-employee/${encodeURIComponent(query)}`,
    employeeDetails: (query: string, system: string) => 
      `/api/search-employee/${encodeURIComponent(query)}/details?system=${system}`,
  },

  // Own data (current user)
  own: {
    system: (system: string) => `/api/own-${system}`,
  },

  // SSO Systems
  sso: {
    pingDirectory: '/api/pd',
    pingFederate: '/api/pf',
    pingMfa: '/api/mfa',
    userInfo: '/api/pf/userinfo',
    oidc: '/api/pf/oidc',
    saml: '/api/pf/saml',
  },

  // PAM Systems
  pam: {
    cyberark: {
      accounts: '/api/cyberark/accounts',
      activity: '/api/cyberark/activity',
      safes: '/api/cyberark/safes',
    },
  },

  // IGA Systems
  iga: {
    saviynt: {
      roles: '/api/saviynt/roles',
    },
  },

  // Cloud Identity
  cloud: {
    azureAd: {
      user: '/api/aad/user',
      groups: '/api/aad/groups',
      signins: '/api/aad/signins',
    },
  },

  // Operations
  ops: {
    failures: (system: string, minutes: number) => 
      `/api/ops-failures?system=${system}&minutes=${minutes}`,
    snowTicket: '/api/submit-snow-ticket',
    snowIncidents: (email: string) => `/api/snow/incidents?email=${encodeURIComponent(email)}`,
    sendEmail: '/api/send-email',
    allUsers: '/api/all-users',
  },
} as const;

/**
 * Get full URL for an endpoint
 * Combines base URL with endpoint path
 */
export function getFullUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  return `${API_CONFIG.baseUrl}${endpoint}`;
}
