/**
 * External Services Configuration
 * ================================
 * 
 * URLs and settings for external services (Splunk, CloudWatch, etc.)
 * 
 * WHEN TO EDIT THIS FILE:
 * - Adding a new external service integration
 * - Changing URLs for different environments
 * - Enabling/disabling external service links
 * 
 * FUTURE: These can be overridden by environment variables for cloud deployment
 */

/**
 * Splunk Configuration
 * --------------------
 * Log aggregation and search
 */
export const SPLUNK_CONFIG = {
  // Is Splunk integration enabled?
  enabled: true,
  
  // Base URL for Splunk dashboard
  baseUrl: 'https://splunk.company.com',
  
  // Direct link to search (append query params as needed)
  searchUrl: 'https://splunk.company.com/en-US/app/search/search',
  
  // Link text shown in UI
  linkText: 'View in Splunk',
} as const;


/**
 * CloudWatch Configuration
 * ------------------------
 * AWS monitoring and logs
 */
export const CLOUDWATCH_CONFIG = {
  // Is CloudWatch integration enabled?
  enabled: true,
  
  // Base URL for CloudWatch console
  baseUrl: 'https://console.aws.amazon.com/cloudwatch/home',
  
  // Default region (can be overridden)
  defaultRegion: 'us-east-1',
  
  // Link text shown in UI
  linkText: 'View in CloudWatch',
} as const;


/**
 * ServiceNow Configuration
 * ------------------------
 * Ticketing system integration
 */
export const SERVICENOW_CONFIG = {
  // Is ServiceNow integration enabled?
  enabled: true,
  
  // Base URL for ServiceNow instance
  baseUrl: 'https://company.service-now.com',
  
  // API endpoint for incidents
  incidentsEndpoint: '/api/now/table/incident',
  
  // Link text shown in UI
  linkText: 'Open in ServiceNow',
} as const;


/**
 * Future AWS Configuration (Placeholder)
 * ---------------------------------------
 * Ready for Terraform/AWS deployment
 * 
 * NOTE: These are placeholders. Actual values will come from
 * environment variables or AWS Secrets Manager in production.
 */
export const AWS_CONFIG = {
  // AWS Region
  region: process.env.AWS_REGION || 'us-east-1',
  
  // S3 bucket for logs/exports (if applicable)
  s3Bucket: process.env.S3_BUCKET || '',
  
  // Cognito settings (if using AWS auth)
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
    clientId: process.env.COGNITO_CLIENT_ID || '',
  },
} as const;


/**
 * All External Services
 * ---------------------
 * Convenient object with all external service configs
 */
export const EXTERNAL_SERVICES = {
  splunk: SPLUNK_CONFIG,
  cloudwatch: CLOUDWATCH_CONFIG,
  servicenow: SERVICENOW_CONFIG,
  aws: AWS_CONFIG,
} as const;


// Helper to get a service URL with null check
export function getServiceUrl(service: keyof typeof EXTERNAL_SERVICES): string | null {
  const config = EXTERNAL_SERVICES[service];
  if ('enabled' in config && !config.enabled) return null;
  if ('baseUrl' in config) return config.baseUrl;
  return null;
}

// Helper to check if a service is enabled
export function isServiceEnabled(service: 'splunk' | 'cloudwatch' | 'servicenow'): boolean {
  return EXTERNAL_SERVICES[service].enabled;
}
