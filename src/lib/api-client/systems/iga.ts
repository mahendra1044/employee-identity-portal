/**
 * IGA Systems API
 * ================
 * 
 * API methods for Saviynt/IGA systems:
 * - Saviynt IGA (Core)
 * - Saviynt Certifications
 * - Saviynt Analytics
 * - Saviynt Controls
 * - Saviynt Requests
 * - Saviynt Provisioning
 * - Saviynt TPAG (Third-Party Access Governance)
 * 
 * @module api-client/systems/iga
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
 * Saviynt IGA (Core) API
 */
const saviynt = {
  /**
   * Get user IGA details
   * 
   * @example
   * const response = await api.iga.saviynt.getDetails('u1001', { token });
   */
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt'),
      options
    );
  },

  /**
   * Get own Saviynt data
   */
  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('saviynt'), options);
  },

  /**
   * Get Saviynt roles
   */
  async getRoles(options?: ApiRequestOptions): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(ENDPOINTS.iga.saviynt.roles, options);
  },
};

/**
 * Saviynt Certifications API
 */
const saviyntCertifications = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-certifications'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('saviynt-certifications'), options);
  },
};

/**
 * Saviynt Analytics API
 */
const saviyntAnalytics = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-analytics'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('saviynt-analytics'), options);
  },
};

/**
 * Saviynt Controls API
 */
const saviyntControls = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-controls'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('saviynt-controls'), options);
  },
};

/**
 * Saviynt Requests API
 */
const saviyntRequests = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-requests'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('saviynt-requests'), options);
  },
};

/**
 * Saviynt Provisioning API
 */
const saviyntProvisioning = {
  async getDetails(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-provisioning'),
      options
    );
  },

  async getOwn(options?: ApiRequestOptions): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(ENDPOINTS.own.system('saviynt-provisioning'), options);
  },
};

/**
 * Saviynt TPAG (Third-Party Access Governance) API
 */
const saviyntTpag = {
  /**
   * Get TPAG overview
   */
  async getOverview(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-tpag'),
      options
    );
  },

  /**
   * Get TPAG vendors
   */
  async getVendors(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-tpag-vendors'),
      options
    );
  },

  /**
   * Get TPAG contracts
   */
  async getContracts(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-tpag-contracts'),
      options
    );
  },

  /**
   * Get TPAG access
   */
  async getAccess(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-tpag-access'),
      options
    );
  },

  /**
   * Get TPAG risk
   */
  async getRisk(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-tpag-risk'),
      options
    );
  },

  /**
   * Get TPAG lifecycle
   */
  async getLifecycle(
    userId: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(userId, 'saviynt-tpag-lifecycle'),
      options
    );
  },
};

/**
 * IGA API - Aggregated Saviynt/IGA system methods
 */
export const igaApi = {
  saviynt,
  saviyntCertifications,
  saviyntAnalytics,
  saviyntControls,
  saviyntRequests,
  saviyntProvisioning,
  saviyntTpag,

  /**
   * Get details for any IGA system
   */
  async getSystemDetails(
    system: 'saviynt' | 'saviynt-certifications' | 'saviynt-analytics' | 'saviynt-controls' | 'saviynt-requests' | 'saviynt-provisioning',
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
