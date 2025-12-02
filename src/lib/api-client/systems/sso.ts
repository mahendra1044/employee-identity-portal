/**
 * SSO Systems API
 * ================
 * 
 * API methods for SSO/Ping systems:
 * - Ping Directory
 * - Ping Federate
 * - Ping MFA
 * - Ping Access
 * - Ping Authorize
 * - Ping Intelligence
 * 
 * @module api-client/systems/sso
 */

import { ENDPOINTS } from '../config';
import type { ApiRequestOptions, ApiResponse, SystemDetails } from '../types';

// Lazy API import to avoid circular dependency
let apiGet: <T>(endpoint: string, options?: ApiRequestOptions) => Promise<ApiResponse<T>>;
let apiPost: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<ApiResponse<T>>;

function getApi() {
  if (!apiGet || !apiPost) {
    const { apiClient } = require('../client');
    apiGet = apiClient.get;
    apiPost = apiClient.post;
  }
  return { get: apiGet, post: apiPost };
}

/**
 * Ping Directory API
 */
const pingDirectory = {
  /**
   * Get user details from Ping Directory
   * 
   * @example
   * const response = await api.sso.pingDirectory.getDetails('u1001', { token });
   */
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'ping-directory'),
      options
    );
  },

  /**
   * Get own Ping Directory data (current user)
   */
  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('ping-directory'), options);
  },

  /**
   * Search Ping Directory audit logs
   */
  async getAuditLogs(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(`/api/pd/audit?userId=${encodeURIComponent(userId)}`, options);
  },
};

/**
 * Ping Federate API
 */
const pingFederate = {
  /**
   * Get user details from Ping Federate
   */
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'ping-federate'),
      options
    );
  },

  /**
   * Get own Ping Federate data
   */
  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('ping-federate'), options);
  },

  /**
   * Get user info from Ping Federate
   */
  async getUserInfo(options?: ApiRequestOptions): Promise<ApiResponse<unknown>> {
    const { get } = getApi();
    return get<unknown>(ENDPOINTS.sso.userInfo, options);
  },

  /**
   * Get OIDC configuration
   */
  async getOidcConfig(options?: ApiRequestOptions): Promise<ApiResponse<unknown>> {
    const { get } = getApi();
    return get<unknown>(ENDPOINTS.sso.oidc, options);
  },

  /**
   * Get SAML configuration
   */
  async getSamlConfig(options?: ApiRequestOptions): Promise<ApiResponse<unknown>> {
    const { get } = getApi();
    return get<unknown>(ENDPOINTS.sso.saml, options);
  },
};

/**
 * Ping MFA API
 */
const pingMfa = {
  /**
   * Get user MFA details
   */
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'ping-mfa'),
      options
    );
  },

  /**
   * Get own MFA data
   */
  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('ping-mfa'), options);
  },

  /**
   * Get MFA devices for a user
   */
  async getDevices(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(`/api/mfa/devices?userId=${encodeURIComponent(userId)}`, options);
  },

  /**
   * Get MFA events for a user
   */
  async getEvents(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(`/api/mfa/events?userId=${encodeURIComponent(userId)}`, options);
  },

  /**
   * Get MFA status for a user
   */
  async getStatus(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown>> {
    const { get } = getApi();
    return get<unknown>(`/api/mfa/status?userId=${encodeURIComponent(userId)}`, options);
  },
};

/**
 * Ping Access API
 */
const pingAccess = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'ping-access'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('ping-access'), options);
  },
};

/**
 * Ping Authorize API
 */
const pingAuthorize = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'ping-authorize'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('ping-authorize'), options);
  },
};

/**
 * Ping Intelligence API
 */
const pingIntelligence = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'ping-intelligence'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('ping-intelligence'), options);
  },
};

/**
 * SSO API - Aggregated SSO/Ping system methods
 */
export const ssoApi = {
  pingDirectory,
  pingFederate,
  pingMfa,
  pingAccess,
  pingAuthorize,
  pingIntelligence,

  /**
   * Get details for any SSO system
   */
  async getSystemDetails(
    system: 'ping-directory' | 'ping-federate' | 'ping-mfa' | 'ping-access' | 'ping-authorize' | 'ping-intelligence',
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, system),
      options
    );
  },
};
