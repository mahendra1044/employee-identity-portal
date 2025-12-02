/**
 * API Client - Centralized API Management
 * ========================================
 * 
 * A scalable, centralized utility for all API interactions.
 * 
 * CORE PRINCIPLES:
 * 1. Single entry point for all API calls
 * 2. Organized by system category (SSO, PAM, IGA, etc.)
 * 3. Built-in caching, error handling, and authentication
 * 4. Easy to extend for new systems/endpoints
 * 
 * USAGE EXAMPLES:
 * ---------------
 * ```typescript
 * import { api } from '@/lib/api-client';
 * 
 * // Simple GET request
 * const response = await api.get('/api/users', { token });
 * if (response.ok) {
 *   console.log(response.data);
 * } else {
 *   console.error(response.error);
 * }
 * 
 * // POST request with body
 * const result = await api.post('/api/submit-snow-ticket', { 
 *   system: 'cyberark', 
 *   description: '...' 
 * }, { token });
 * 
 * // System-specific methods (organized by category)
 * const saviyntData = await api.iga.saviynt.getDetails('u1001', { token });
 * const cyberarkData = await api.pam.cyberark.getDetails('u1001', { token });
 * const pingData = await api.sso.pingDirectory.getDetails('u1001', { token });
 * const azureData = await api.cloud.azureAd.getDetails('u1001', { token });
 * 
 * // Operations/Search
 * const searchResult = await api.ops.search.employee('u1001', { token });
 * const failures = await api.ops.failures.get('ping-federate', 10, { token });
 * const ticket = await api.ops.snow.submitTicket({ ... }, { token });
 * 
 * // With caching disabled
 * const freshData = await api.get('/api/config/features', { skipCache: true });
 * 
 * // Authentication
 * const loginResult = await api.auth.login('u1001', 'password');
 * ```
 * 
 * STRUCTURE:
 * ----------
 * api.get/post/put/delete  - Generic HTTP methods
 * api.auth                  - Authentication (login, logout, refresh)
 * api.sso                   - SSO/Ping systems
 * api.pam                   - CyberArk/PAM systems  
 * api.iga                   - Saviynt/IGA systems
 * api.cloud                 - Azure AD/Cloud identity
 * api.ops                   - Operations (search, failures, SNOW, email)
 * 
 * @module api-client
 */

// Main client export
export { apiClient, api, clearCache, clearCacheForEndpoint } from './client';

// Type exports
export type { 
  ApiRequestOptions, 
  ApiResponse, 
  ApiError as ApiErrorType,
  SystemCategory,
  LoginRequest,
  LoginResponse,
  SearchResult,
  SystemDetails,
  SnowTicketRequest,
  SnowTicketResponse,
  FailureRecord,
  FeaturesConfig,
} from './types';

// Error exports for custom error handling
export { 
  ApiError,
  NetworkError,
  TimeoutError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  isApiError,
  getErrorMessage,
} from './errors';

// Configuration exports
export { API_CONFIG, ENDPOINTS, getFullUrl } from './config';

// Default export for convenience
export { api as default } from './client';

