/**
 * Configuration Module
 * ====================
 * 
 * This is the SINGLE SOURCE OF TRUTH for all application configuration.
 * 
 * IMPORTANT: Backend (backend/config/features.json) is the runtime source of truth.
 * Frontend config files provide defaults/fallbacks.
 * 
 * QUICK GUIDE FOR DEVELOPERS:
 * ---------------------------
 * - Need to enable/disable a feature? → See features.config.ts (defaults)
 *                                       → backend/config/features.json (runtime)
 * - Need to add a new system? → See systems.config.ts
 * - Need to change API URLs or timeouts? → See app.config.ts
 * - Need to add external service URLs? → See external-services.config.ts
 * - Need to configure mock vs real APIs? → See api/ folder
 * - Need to configure search results UI? → See search-results.config.ts
 * 
 * HOW TO USE:
 * -----------
 * import { FEATURE_FLAGS, SYSTEM_GROUPS, SYSTEM_LABELS } from '@/config';
 * 
 * // Check if a feature is enabled (default)
 * if (FEATURE_FLAGS.educateGuideEnabled) { ... }
 * 
 * // Get a system label
 * const label = SYSTEM_LABELS['ping-directory'];
 * 
 * // Get systems for a role
 * const systems = SYSTEM_GROUPS.sso;
 * 
 * // Get API config for a system group
 * import { getApiConfig, getEndpoint } from '@/config/api';
 * const ssoConfig = getApiConfig('sso');
 */

// Re-export all configurations
export * from './app.config';
export * from './features.config';
export * from './systems.config';
export * from './roles.config';
export * from './external-services.config';
export * from './search-results.config';

// Export labels configuration
export { labels, t } from './labels';
export type { Labels } from './labels';

// Export API configuration utilities
export {
  getApiConfig,
  getEndpoint,
  getEndpointLookup,
  getSectionEndpoints,
  getConnectionInfo,
  getDataSourceMode,
  isUsingRealApi,
  isUsingMockData,
  isMockConfig,
  isRealConfig,
  listAllEndpoints,
  mockApiConfig,
  realApiConfig,
} from './api';

// Export API types
export type {
  SystemGroupId,
  FeatureSection,
  SystemConfig,
  EndpointConfig,
  EndpointLookup,
  ApiConnection,
  RealEndpointConfig,
  MockEndpointConfig,
} from './api';