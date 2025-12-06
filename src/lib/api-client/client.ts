/**
 * Core API Client
 * ================
 * 
 * The main API client class that handles all HTTP requests.
 * Use this for generic requests or extend with system-specific methods.
 * 
 * USAGE:
 * ------
 * import { api } from '@/lib/api-client';
 * 
 * // GET request
 * const response = await api.get('/api/users', { token });
 * if (response.ok) {
 *   console.log(response.data);
 * }
 * 
 * // POST request
 * const result = await api.post('/api/users', { name: 'John' }, { token });
 * 
 * // Using system-specific methods
 * const user = await api.sso.pingDirectory.search('u1001', { token });
 * 
 * @module api-client/client
 */

import { API_CONFIG, getFullUrl } from './config';
import type { ApiRequestOptions, ApiResponse } from './types';
import { ApiError, NetworkError, TimeoutError, parseErrorResponse } from './errors';

// Import system-specific APIs
import { authApi } from './systems/auth';
import { ssoApi } from './systems/sso';
import { pamApi } from './systems/pam';
import { igaApi } from './systems/iga';
import { cloudApi } from './systems/cloud';
import { opsApi } from './systems/ops';

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry>();

// Pending requests for deduplication
const pendingRequests = new Map<string, Promise<ApiResponse>>();

/**
 * Generate cache key from request details
 */
function getCacheKey(url: string, options?: ApiRequestOptions): string {
  const tokenSuffix = options?.token ? options.token.slice(-10) : 'no-auth';
  return `${url}:${tokenSuffix}`;
}

/**
 * Check if cache entry is valid
 */
function isCacheValid(entry: CacheEntry, ttl: number): boolean {
  return Date.now() - entry.timestamp < ttl;
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clear cache for specific endpoint
 */
export function clearCacheForEndpoint(endpoint: string): void {
  const keys = Array.from(cache.keys());
  keys.forEach(key => {
    if (key.startsWith(endpoint)) {
      cache.delete(key);
    }
  });
}

// ============================================================================
// CORE REQUEST FUNCTION
// ============================================================================

/**
 * Make an HTTP request with caching, timeout, and error handling
 * 
 * @param method - HTTP method
 * @param endpoint - API endpoint (relative or absolute URL)
 * @param body - Request body for POST/PUT/PATCH
 * @param options - Request options
 * @returns Promise<ApiResponse<T>>
 */
async function request<T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: unknown,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const url = getFullUrl(endpoint);
  const cacheKey = getCacheKey(url, options);
  const cacheTtl = options.cacheTtl ?? API_CONFIG.defaultCacheTtl;
  const timeout = options.timeout ?? API_CONFIG.defaultTimeout;
  const skipCache = options.skipCache ?? false;

  // Only cache GET requests
  const canCache = method === 'GET' && !skipCache;

  // Check for pending request (deduplication)
  if (canCache && pendingRequests.has(cacheKey)) {
    if (API_CONFIG.debug) {
      console.log(`[API] Deduplicating request: ${method} ${endpoint}`);
    }
    return pendingRequests.get(cacheKey) as Promise<ApiResponse<T>>;
  }

  // Check cache
  if (canCache) {
    const cached = cache.get(cacheKey);
    if (cached && isCacheValid(cached, cacheTtl)) {
      if (API_CONFIG.debug) {
        console.log(`[API] Cache hit: ${method} ${endpoint}`);
      }
      return {
        ok: true,
        data: cached.data as T,
        status: 200,
        cached: true,
      };
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    ...API_CONFIG.defaultHeaders,
    ...options.headers,
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  // Build fetch options
  const fetchOptions: RequestInit = {
    method,
    headers,
    signal: options.signal,
  };

  if (body && method !== 'GET' && method !== 'DELETE') {
    fetchOptions.body = JSON.stringify(body);
  }

  // Create request promise
  const requestPromise = (async (): Promise<ApiResponse<T>> => {
    // Create timeout controller
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

    // Combine with user's abort signal if provided
    if (options.signal) {
      options.signal.addEventListener('abort', () => timeoutController.abort());
    }

    try {
      if (API_CONFIG.debug) {
        console.log(`[API] ${method} ${endpoint}`, { body, options: { ...options, token: options.token ? '***' : undefined } });
      }

      const response = await fetch(url, {
        ...fetchOptions,
        signal: timeoutController.signal,
      });

      clearTimeout(timeoutId);

      // Handle error responses
      if (!response.ok) {
        const error = await parseErrorResponse(response, endpoint);
        if (API_CONFIG.debug) {
          console.error(`[API] Error: ${method} ${endpoint}`, error.toJSON());
        }
        return {
          ok: false,
          error: error.message,
          status: response.status,
        };
      }

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const json = await response.json();
        // Handle wrapped responses (some APIs return { data: ... })
        data = json.data !== undefined ? json.data : json;
      } else {
        data = await response.text() as unknown as T;
      }

      // Cache successful GET responses
      if (canCache) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      if (API_CONFIG.debug) {
        console.log(`[API] Success: ${method} ${endpoint}`, { status: response.status });
      }

      return {
        ok: true,
        data,
        status: response.status,
        cached: false,
      };

    } catch (error) {
      clearTimeout(timeoutId);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          if (API_CONFIG.debug) {
            console.error(`[API] Timeout: ${method} ${endpoint}`);
          }
          const timeoutError = new TimeoutError(timeout, endpoint);
          return {
            ok: false,
            error: timeoutError.getUserMessage(),
            status: 408,
          };
        }

        // Network error
        if (API_CONFIG.debug) {
          console.error(`[API] Network error: ${method} ${endpoint}`, error);
        }
        const networkError = new NetworkError(error.message, endpoint);
        return {
          ok: false,
          error: networkError.getUserMessage(),
          status: 0,
        };
      }

      // Unknown error
      return {
        ok: false,
        error: 'An unexpected error occurred',
        status: 500,
      };
    }
  })();

  // Store pending request for deduplication
  if (canCache) {
    pendingRequests.set(cacheKey, requestPromise);
    requestPromise.finally(() => {
      pendingRequests.delete(cacheKey);
    });
  }

  return requestPromise;
}

// ============================================================================
// HTTP METHOD HELPERS
// ============================================================================

/**
 * GET request
 * 
 * @example
 * const response = await api.get('/api/users', { token });
 * if (response.ok) {
 *   console.log(response.data);
 * }
 */
async function get<T = unknown>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return request<T>('GET', endpoint, undefined, options);
}

/**
 * POST request
 * 
 * @example
 * const response = await api.post('/api/users', { name: 'John' }, { token });
 */
async function post<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return request<T>('POST', endpoint, body, options);
}

/**
 * PUT request
 */
async function put<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return request<T>('PUT', endpoint, body, options);
}

/**
 * PATCH request
 */
async function patch<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return request<T>('PATCH', endpoint, body, options);
}

/**
 * DELETE request
 */
async function del<T = unknown>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return request<T>('DELETE', endpoint, undefined, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * API Client instance
 * 
 * This is the main export - use this for all API calls.
 */
export const apiClient = {
  // Core HTTP methods
  get,
  post,
  put,
  patch,
  delete: del,
  
  // Cache management
  clearCache,
  clearCacheForEndpoint,
  
  // System-specific APIs (organized by category)
  auth: authApi,
  sso: ssoApi,
  pam: pamApi,
  iga: igaApi,
  cloud: cloudApi,
  ops: opsApi,
};

// Convenience alias
export const api = apiClient;

// Type export for the client
export type ApiClient = typeof apiClient;
