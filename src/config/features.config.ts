/**
 * Features Configuration
 * ======================
 * 
 * Toggle features ON/OFF from this single file.
 * No code changes needed - just flip the boolean!
 * 
 * WHEN TO EDIT THIS FILE:
 * - Enabling/disabling a feature for testing
 * - Rolling out features gradually
 * - Turning off features during incidents
 */

/**
 * Feature Flags
 * -------------
 * Master switches for application features
 * 
 * Set to `true` to enable, `false` to disable
 */
export const FEATURE_FLAGS = {
  // Show the "Educate Me" guide for employees
  educateGuideEnabled: true,
  
  // Use mock data instead of real API calls (for development)
  useMockData: true,
  
  // Use mock authentication (for development)
  useMockAuth: true,
  
  // Show the ServiceNow tickets button
  snowTicketsEnabled: true,
  
  // Show Quick Actions panel for ops users
  quickActionsEnabled: true,
  
  // Show Recent Failures panel for ops users
  recentFailuresEnabled: true,
  
  // Enable search functionality
  searchEnabled: true,
  
  // Auto-load failures when ops user logs in
  autoLoadFailuresOnLogin: true,
} as const;


/**
 * Ops Configuration
 * -----------------
 * Settings specific to operations team features
 */
export const OPS_CONFIG = {
  // Available time ranges for failure search (in minutes)
  failureTimeRanges: [5, 10, 15, 30, 60] as const,
  
  // Default time range for failure search
  defaultFailureMinutes: 10,
  
  // Max failures to show in the panel
  maxFailuresToShow: 100,
  
  // Refresh interval for failures (ms) - 0 means no auto-refresh
  failuresRefreshInterval: 0,
} as const;


/**
 * Search Configuration
 * --------------------
 * Settings for employee search functionality
 */
export const SEARCH_CONFIG = {
  // Minimum characters before search triggers
  minSearchLength: 2,
  
  // Debounce delay (ms) before search executes
  debounceMs: 300,
  
  // Max results to show per system
  maxResultsPerSystem: 50,
} as const;


/**
 * ServiceNow Configuration
 * ------------------------
 * Settings for SNOW ticket integration
 */
export const SNOW_CONFIG = {
  // Default ticket priority
  defaultPriority: '3 - Moderate',
  
  // Default ticket state for new tickets
  defaultState: 'open',
  
  // Ticket number prefix
  ticketPrefix: 'INC-',
  
  // Max tickets to load
  maxTicketsToLoad: 100,
} as const;


/**
 * Dialog Configuration
 * --------------------
 * Settings for modal dialogs
 */
export const DIALOG_CONFIG = {
  // Default mode for data dialogs
  defaultDataViewMode: 'json' as const,
  
  // Max height for dialog content (CSS value)
  maxContentHeight: '70vh',
} as const;


// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature] === true;
}

// Type exports
export type FeatureFlag = keyof typeof FEATURE_FLAGS;
