/**
 * API Configuration Index
 * =======================
 * 
 * Main entry point for API configurations.
 * Provides resolver functions to get the appropriate config (mock or real)
 * based on SYSTEM_DATA_SOURCE settings.
 * 
 * USAGE:
 * ```typescript
 * import { getApiConfig, getEndpoint } from '@/config/api';
 * 
 * // Get full config for a system group
 * const ssoConfig = getApiConfig('sso');
 * 
 * // Get specific endpoint
 * const endpoint = getEndpoint('sso', 'systemCards', 'pingDirectory');
 * ```
 * 
 * @module config/api
 */

import { SYSTEM_DATA_SOURCE } from '../features.config';
import { mockApiConfig } from './mock';
import { realApiConfig } from './real';
import type {
  SystemGroupId,
  FeatureSection,
  SystemConfig,
  EndpointConfig,
  EndpointLookup,
  MockSystemConfig,
  RealSystemConfig,
} from './types';

// Re-export types
export * from './types';

// Re-export configs for direct access
export { mockApiConfig } from './mock';
export { realApiConfig } from './real';

/**
 * Get API configuration for a system group
 * Returns mock or real config based on SYSTEM_DATA_SOURCE setting
 * 
 * @param group - System group identifier (sso, pam, iga, entraId, tpag, ops)
 * @returns The appropriate SystemConfig (mock or real)
 * 
 * @example
 * const ssoConfig = getApiConfig('sso');
 * console.log(ssoConfig.connection.baseUrl);
 */
export function getApiConfig(group: SystemGroupId): SystemConfig {
  const dataSource = SYSTEM_DATA_SOURCE[group];
  
  if (dataSource === 'USE_API') {
    return realApiConfig[group];
  }
  
  return mockApiConfig[group];
}

/**
 * Check if a system group is using real API
 * 
 * @param group - System group identifier
 * @returns true if using real API, false if using mock
 */
export function isUsingRealApi(group: SystemGroupId): boolean {
  const dataSource = SYSTEM_DATA_SOURCE[group];
  return dataSource === 'USE_API';
}

/**
 * Check if a system group is using mock data
 * 
 * @param group - System group identifier
 * @returns true if using mock, false if using real API
 */
export function isUsingMockData(group: SystemGroupId): boolean {
  return !isUsingRealApi(group);
}

/**
 * Get the data source mode for a system group
 * 
 * @param group - System group identifier
 * @returns 'USE_API' or 'USE_MOCK'
 */
export function getDataSourceMode(group: SystemGroupId): 'USE_API' | 'USE_MOCK' {
  return SYSTEM_DATA_SOURCE[group];
}

/**
 * Type guard to check if a config is a MockSystemConfig
 * 
 * @param config - The system config to check
 * @returns true if config is MockSystemConfig
 */
export function isMockConfig(config: SystemConfig): config is MockSystemConfig {
  // Mock configs have 'none' auth and no clientId
  return config.connection.authMethod === 'none' && !config.connection.clientId;
}

/**
 * Type guard to check if a config is a RealSystemConfig
 * 
 * @param config - The system config to check
 * @returns true if config is RealSystemConfig
 */
export function isRealConfig(config: SystemConfig): config is RealSystemConfig {
  return !isMockConfig(config);
}

/**
 * Get endpoint configuration for a specific feature and action
 * 
 * @param group - System group (sso, pam, etc.)
 * @param section - Feature section (systemCards, search, failures, quickActions)
 * @param actionName - Specific action name within the section
 * @returns The endpoint configuration or undefined if not found
 * 
 * @example
 * const endpoint = getEndpoint('sso', 'quickActions', 'unlockAccount');
 * // { endpoint: '/api/pd/unlock', method: 'POST', ... }
 */
export function getEndpoint(
  group: SystemGroupId,
  section: FeatureSection,
  actionName: string
): EndpointConfig | undefined {
  const config = getApiConfig(group);
  const sectionConfig = config[section];
  
  if (!sectionConfig || typeof sectionConfig !== 'object') {
    return undefined;
  }
  
  return (sectionConfig as Record<string, EndpointConfig>)[actionName];
}

/**
 * Get full endpoint lookup with URL and headers
 * 
 * @param group - System group
 * @param section - Feature section
 * @param actionName - Action name
 * @param pathParams - Parameters to replace in endpoint path
 * @returns Full endpoint lookup with URL, headers, and auth info
 * 
 * @example
 * const lookup = getEndpointLookup('sso', 'systemCards', 'pingDirectory', { userId: 'u1001' });
 * // { config: {...}, fullUrl: '/api/own-ping-directory', headers: {...}, authMethod: 'none' }
 */
export function getEndpointLookup(
  group: SystemGroupId,
  section: FeatureSection,
  actionName: string,
  pathParams?: Record<string, string>
): EndpointLookup | undefined {
  const config = getApiConfig(group);
  const endpointConfig = getEndpoint(group, section, actionName);
  
  if (!endpointConfig) {
    return undefined;
  }
  
  // Validate connection base URL
  const baseUrl = config.connection.baseUrl || '';
  const endpoint = endpointConfig.endpoint || '';
  
  // Build full URL with path parameters
  let fullUrl = `${baseUrl}${endpoint}`;
  
  // Replace path parameters like {userId}
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
    });
  }
  
  return {
    config: endpointConfig,
    fullUrl,
    headers: config.headers || {},
    authMethod: config.connection.authMethod,
  };
}

/**
 * Get all endpoints for a feature section
 * 
 * @param group - System group
 * @param section - Feature section
 * @returns Record of all endpoints in the section
 */
export function getSectionEndpoints(
  group: SystemGroupId,
  section: FeatureSection
): Record<string, EndpointConfig> {
  const config = getApiConfig(group);
  const sectionConfig = config[section];
  
  if (!sectionConfig || typeof sectionConfig !== 'object') {
    return {};
  }
  
  return sectionConfig as Record<string, EndpointConfig>;
}

/**
 * Get connection info for a system group
 * Useful for setting up authentication before making requests
 * 
 * @param group - System group
 * @returns Connection configuration
 */
export function getConnectionInfo(group: SystemGroupId) {
  const config = getApiConfig(group);
  return config.connection;
}

/**
 * List all available endpoints across all system groups
 * Useful for debugging and documentation
 */
export function listAllEndpoints(): Record<SystemGroupId, Record<FeatureSection, string[]>> {
  // Derive groups from SYSTEM_DATA_SOURCE keys (single source of truth)
  const groups = Object.keys(SYSTEM_DATA_SOURCE) as SystemGroupId[];
  const sections: FeatureSection[] = ['systemCards', 'search', 'failures', 'quickActions'];
  
  // Initialize empty section for each group dynamically
  const emptySections = (): Record<FeatureSection, string[]> => ({
    systemCards: [],
    search: [],
    failures: [],
    quickActions: [],
  });
  
  // Build result dynamically from groups
  const result = groups.reduce((acc, group) => {
    acc[group] = emptySections();
    return acc;
  }, {} as Record<SystemGroupId, Record<FeatureSection, string[]>>);
  
  // Populate endpoints
  groups.forEach(group => {
    sections.forEach(section => {
      const endpoints = getSectionEndpoints(group, section);
      result[group][section] = Object.keys(endpoints);
    });
  });
  
  return result;
}
