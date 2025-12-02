/**
 * Application Configuration
 * =========================
 * 
 * General app-level settings that control how the application behaves.
 * 
 * WHEN TO EDIT THIS FILE:
 * - Changing API endpoints or timeouts
 * - Adjusting default values (theme, pagination, etc.)
 * - Modifying storage keys
 */

/**
 * API Configuration
 * -----------------
 * Settings for backend communication
 */
export const API_CONFIG = {
  // Base URL for the backend API
  // In production, this should be set via NEXT_PUBLIC_API_BASE environment variable
  baseUrl: typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'
    : 'http://localhost:3001',
  
  // Request timeouts (in milliseconds)
  timeout: {
    default: 30000,    // 30 seconds for normal requests
    search: 10000,     // 10 seconds for search operations
    upload: 60000,     // 60 seconds for file uploads
  },
  
  // Retry settings for failed requests
  retry: {
    attempts: 3,       // Number of retry attempts
    delay: 1000,       // Delay between retries (ms)
  },
} as const;


/**
 * Theme Configuration
 * -------------------
 * Available themes and default settings
 */
export const THEME_CONFIG = {
  // Available theme options
  available: ['light', 'dark', 'navy'] as const,
  
  // Default theme when none is saved
  default: 'light' as const,
  
  // CSS classes to apply for each theme
  cssClasses: {
    light: '',
    dark: 'dark',
    navy: 'dark navy',
  } as const,
} as const;


/**
 * UI Defaults
 * -----------
 * Default values for various UI elements
 */
export const UI_DEFAULTS = {
  // Default minutes for ops failures panel
  opsFailureMinutes: 10,
  
  // Default active tab in Quick Actions
  quickActionsDefaultTab: 'ping-federate',
  
  // Debounce delay for search input (ms)
  searchDebounceMs: 300,
  
  // Max items to show before "show more"
  listPreviewLimit: 5,
} as const;


// Type exports for TypeScript users
export type Theme = typeof THEME_CONFIG.available[number];
