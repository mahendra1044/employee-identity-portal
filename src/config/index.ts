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
 */

// Re-export all configurations
export * from './app.config';
export * from './features.config';
export * from './systems.config';
export * from './external-services.config';
