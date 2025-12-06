/**
 * Cloud Identity API
 * ===================
 * 
 * API methods for cloud identity systems:
 * - Azure AD / Microsoft Entra ID
 * - Azure AD Users
 * - Azure AD Groups
 * - Azure AD Apps
 * - Conditional Access
 * - Sign-in Logs
 * 
 * @module api-client/systems/cloud
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
 * Azure AD / Microsoft Entra ID API
 */
const azureAd = {
  /**
   * Get user Azure AD details
   * 
   * @example
   * const response = await api.cloud.azureAd.getDetails('u1001', { token });
   */
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'azure-ad'),
      options
    );
  },

  /**
   * Get own Azure AD data
   */
  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('azure-ad'), options);
  },

  /**
   * Get Azure AD user info
   */
  async getUser(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown>> {
    const { get } = getApi();
    return get<unknown>(
      `${ENDPOINTS.cloud.azureAd.user}?userId=${encodeURIComponent(userId)}`,
      options
    );
  },

  /**
   * Get Azure AD groups for a user
   */
  async getGroups(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(
      `${ENDPOINTS.cloud.azureAd.groups}?userId=${encodeURIComponent(userId)}`,
      options
    );
  },

  /**
   * Get Azure AD sign-in logs
   */
  async getSignIns(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(
      `${ENDPOINTS.cloud.azureAd.signins}?userId=${encodeURIComponent(userId)}`,
      options
    );
  },
};

/**
 * Azure AD Users API
 */
const azureAdUsers = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'azure-ad-users'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('azure-ad-users'), options);
  },
};

/**
 * Azure AD Groups API
 */
const azureAdGroups = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'azure-ad-groups'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('azure-ad-groups'), options);
  },
};

/**
 * Azure AD Apps API
 */
const azureAdApps = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'azure-ad-apps'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('azure-ad-apps'), options);
  },
};

/**
 * Conditional Access API
 */
const conditionalAccess = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'azure-ad-conditional'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('azure-ad-conditional'), options);
  },
};

/**
 * Sign-in Logs API
 */
const signInLogs = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'azure-ad-signin'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('azure-ad-signin'), options);
  },
};

/**
 * Cloud API - Aggregated Azure AD/Cloud identity methods
 */
export const cloudApi = {
  azureAd,
  azureAdUsers,
  azureAdGroups,
  azureAdApps,
  conditionalAccess,
  signInLogs,

  /**
   * Get details for any cloud identity system
   */
  async getSystemDetails(
    system: 'azure-ad' | 'azure-ad-users' | 'azure-ad-groups' | 'azure-ad-apps' | 'azure-ad-conditional' | 'azure-ad-signin',
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
