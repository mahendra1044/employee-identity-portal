/**
 * Authentication API
 * ===================
 * 
 * Handles all authentication-related API calls.
 * 
 * @module api-client/systems/auth
 */

import { ENDPOINTS } from '../config';
import type { ApiRequestOptions, ApiResponse, LoginRequest, LoginResponse } from '../types';

// Import the core request function
// We use a getter to avoid circular dependency
let apiGet: <T>(endpoint: string, options?: ApiRequestOptions) => Promise<ApiResponse<T>>;
let apiPost: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<ApiResponse<T>>;

// Lazy initialization to avoid circular imports
function getApi() {
  if (!apiGet || !apiPost) {
    // Dynamic import to break circular dependency
    const { apiClient } = require('../client');
    apiGet = apiClient.get;
    apiPost = apiClient.post;
  }
  return { get: apiGet, post: apiPost };
}

/**
 * Authentication API methods
 */
export const authApi = {
  /**
   * Login with user credentials
   * 
   * @example
   * const response = await api.auth.login('u1001', 'password');
   * if (response.ok) {
   *   const { token, role } = response.data;
   * }
   */
  async login(
    userId: string,
    password: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<LoginResponse>> {
    const { post } = getApi();
    return post<LoginResponse>(
      ENDPOINTS.auth.login,
      { userId, password } as LoginRequest,
      { ...options, skipCache: true } // Never cache login requests
    );
  },

  /**
   * Logout current user
   */
  async logout(options?: ApiRequestOptions): Promise<ApiResponse<void>> {
    const { post } = getApi();
    return post<void>(ENDPOINTS.auth.logout, undefined, {
      ...options,
      skipCache: true,
    });
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(options?: ApiRequestOptions): Promise<ApiResponse<{ token: string }>> {
    const { post } = getApi();
    return post<{ token: string }>(ENDPOINTS.auth.refresh, undefined, {
      ...options,
      skipCache: true,
    });
  },
};
