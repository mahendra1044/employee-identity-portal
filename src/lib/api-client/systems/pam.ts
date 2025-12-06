/**
 * PAM Systems API
 * ================
 * 
 * API methods for CyberArk/PAM systems:
 * - CyberArk PAM (Vault)
 * - CyberArk EPM
 * - CyberArk Alero
 * - CyberArk Conjur
 * - CyberArk DPA
 * - CyberArk Identity
 * 
 * @module api-client/systems/pam
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
 * CyberArk PAM (Vault) API
 */
const cyberark = {
  /**
   * Get user PAM vault details
   * 
   * @example
   * const response = await api.pam.cyberark.getDetails('u1001', { token });
   */
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'cyberark'),
      options
    );
  },

  /**
   * Get own CyberArk data
   */
  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('cyberark'), options);
  },

  /**
   * Get CyberArk accounts for a user
   */
  async getAccounts(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(
      `${ENDPOINTS.pam.cyberark.accounts}?userId=${encodeURIComponent(userId)}`,
      options
    );
  },

  /**
   * Get CyberArk activity logs
   */
  async getActivity(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(
      `${ENDPOINTS.pam.cyberark.activity}?userId=${encodeURIComponent(userId)}`,
      options
    );
  },

  /**
   * Get CyberArk safes for a user
   */
  async getSafes(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(
      `${ENDPOINTS.pam.cyberark.safes}?userId=${encodeURIComponent(userId)}`,
      options
    );
  },
};

/**
 * CyberArk EPM API
 */
const cyberarkEpm = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'cyberark-epm'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('cyberark-epm'), options);
  },
};

/**
 * CyberArk Alero API
 */
const cyberarkAlero = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'cyberark-alero'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('cyberark-alero'), options);
  },
};

/**
 * CyberArk Conjur API
 */
const cyberarkConjur = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'cyberark-conjur'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('cyberark-conjur'), options);
  },
};

/**
 * CyberArk DPA API
 */
const cyberarkDpa = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'cyberark-dpa'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('cyberark-dpa'), options);
  },
};

/**
 * CyberArk Identity API
 */
const cyberarkIdentity = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'cyberark-identity'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('cyberark-identity'), options);
  },
};

/**
 * PAM API - Aggregated CyberArk/PAM system methods
 */
export const pamApi = {
  cyberark,
  cyberarkEpm,
  cyberarkAlero,
  cyberarkConjur,
  cyberarkDpa,
  cyberarkIdentity,

  /**
   * Get details for any PAM system
   */
  async getSystemDetails(
    system: 'cyberark' | 'cyberark-epm' | 'cyberark-alero' | 'cyberark-conjur' | 'cyberark-dpa' | 'cyberark-identity',
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
