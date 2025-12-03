/**
 * Configuration Module
 * ====================
 * 
 * This is the SINGLE SOURCE OF TRUTH for all application configuration.
 * 
 * QUICK GUIDE FOR DEVELOPERS:
 * ---------------------------
 * - Need to enable/disable a feature? → See features.config.ts
 * - Need to add a new system? → See systems.config.ts
 * - Need to change API URLs or timeouts? → See app.config.ts
 * - Need to add external service URLs? → See external-services.config.ts
 * - Need to configure mock vs real APIs? → See api/ folder
 * 
 * HOW TO USE:
 * -----------
 * import { APP_CONFIG, FEATURES, SYSTEMS, EXTERNAL_SERVICES } from '@/config';
 * 
 * // Check if a feature is enabled
 * if (FEATURES.flags.educateGuideEnabled) { ... }
 * 
 * // Get a system label
 * const label = SYSTEMS.labels['ping-directory'];
 * 
 * // Get external URL
 * const splunkUrl = EXTERNAL_SERVICES.splunk.url;
 * 
 * // Get API config for a system group
 * import { getApiConfig, getEndpoint } from '@/config/api';
 * const ssoConfig = getApiConfig('sso');
 */

// Re-export all configurations
export * from './app.config';
export * from './features.config';
export * from './systems.config';
export * from './external-services.config';

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
  isUsingRealApi,
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

