/**
 * Operations API
 * ===============
 * 
 * API methods for operations-related functionality:
 * - Employee search
 * - Recent failures monitoring
 * - ServiceNow ticket management
 * - Email notifications
 * - Feature configuration
 * 
 * @module api-client/systems/ops
 */

import { ENDPOINTS } from '../config';
import type { 
  ApiRequestOptions, 
  ApiResponse, 
  SearchResult, 
  SystemDetails,
  SnowTicketRequest,
  SnowTicketResponse,
  FailureRecord,
  FeaturesConfig,
} from '../types';

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
 * Employee Search API
 */
const search = {
  /**
   * Search for an employee by ID/email
   * 
   * @example
   * const response = await api.ops.search.employee('u1001', { token });
   * if (response.ok) {
   *   const { userId, email, systems } = response.data;
   * }
   */
  async employee(
    query: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SearchResult>> {
    const { get } = getApi();
    return get<SearchResult>(ENDPOINTS.search.employee(query), options);
  },

  /**
   * Get system-specific details for an employee
   * 
   * @example
   * const response = await api.ops.search.systemDetails('u1001', 'cyberark', { token });
   */
  async systemDetails(
    query: string,
    system: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SystemDetails>> {
    const { get } = getApi();
    return get<SystemDetails>(
      ENDPOINTS.search.employeeDetails(query, system),
      options
    );
  },
};

/**
 * Recent Failures API
 */
const failures = {
  /**
   * Get recent failures for a system
   * 
   * @example
   * const response = await api.ops.failures.get('ping-federate', 10, { token });
   */
  async get(
    system: string,
    minutes: number = 10,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<FailureRecord[]>> {
    const { get } = getApi();
    return get<FailureRecord[]>(ENDPOINTS.ops.failures(system, minutes), options);
  },

  /**
   * Get failures for multiple systems
   * 
   * @example
   * const response = await api.ops.failures.getMultiple(['ping-federate', 'ping-mfa'], 10, { token });
   */
  async getMultiple(
    systems: string[],
    minutes: number = 10,
    options?: ApiRequestOptions
  ): Promise<Record<string, ApiResponse<FailureRecord[]>>> {
    const results: Record<string, ApiResponse<FailureRecord[]>> = {};
    
    // Fetch all in parallel
    await Promise.all(
      systems.map(async (system) => {
        results[system] = await this.get(system, minutes, options);
      })
    );
    
    return results;
  },
};

/**
 * ServiceNow API
 */
const snow = {
  /**
   * Submit a ServiceNow ticket
   * 
   * @example
   * const response = await api.ops.snow.submitTicket({
   *   system: 'cyberark',
   *   userEmail: 'user@example.com',
   *   description: 'Access request...',
   * }, { token });
   */
  async submitTicket(
    request: SnowTicketRequest,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SnowTicketResponse>> {
    const { post } = getApi();
    return post<SnowTicketResponse>(
      ENDPOINTS.ops.snowTicket,
      request,
      { ...options, skipCache: true }
    );
  },

  /**
   * Get ServiceNow incidents for a user
   * 
   * @example
   * const response = await api.ops.snow.getIncidents('user@example.com', { token });
   */
  async getIncidents(
    email: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(ENDPOINTS.ops.snowIncidents(email), options);
  },
};

/**
 * Email API
 */
const email = {
  /**
   * Send an email notification
   * 
   * @example
   * const response = await api.ops.email.send({
   *   to: 'admin@example.com',
   *   subject: 'Alert',
   *   body: 'System alert...',
   * }, { token });
   */
  async send(
    payload: { to: string; subject: string; body: string; [key: string]: unknown },
    options?: ApiRequestOptions
  ): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const { post } = getApi();
    return post<{ success: boolean; message?: string }>(
      ENDPOINTS.ops.sendEmail,
      payload,
      { ...options, skipCache: true }
    );
  },
};

/**
 * Configuration API
 */
const config = {
  /**
   * Get application features configuration
   * 
   * @example
   * const response = await api.ops.config.getFeatures();
   */
  async getFeatures(options?: ApiRequestOptions): Promise<ApiResponse<FeaturesConfig>> {
    const { get } = getApi();
    return get<FeaturesConfig>(ENDPOINTS.config.features, options);
  },

  /**
   * Get roles configuration
   */
  async getRoles(options?: ApiRequestOptions): Promise<ApiResponse<unknown>> {
    const { get } = getApi();
    return get<unknown>(ENDPOINTS.config.roles, options);
  },
};

/**
 * All Users API
 */
const users = {
  /**
   * Get all users (for ops role)
   * 
   * @example
   * const response = await api.ops.users.getAll({ token });
   */
  async getAll(options?: ApiRequestOptions): Promise<ApiResponse<unknown[]>> {
    const { get } = getApi();
    return get<unknown[]>(ENDPOINTS.ops.allUsers, options);
  },
};

/**
 * Operations API - Aggregated ops-related methods
 */
export const opsApi = {
  search,
  failures,
  snow,
  email,
  config,
  users,
};
