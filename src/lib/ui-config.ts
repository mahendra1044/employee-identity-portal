/**
 * UI Configuration & Constants
 * Centralized configuration for UI-related values
 */

// Theme configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  NAVY: 'navy',
} as const;

export const THEME_CLASSES = {
  light: '',
  dark: 'dark',
  navy: 'dark navy',
} as const;

// Dialog configuration
export const DIALOG_DEFAULTS = {
  SNOW_EMAIL_RESOLUTION_TIMEOUT: 5000,
  SEARCH_DIALOG_INITIAL_MODE: 'json' as const,
} as const;

// UI state defaults
export const UI_DEFAULTS = {
  QA_ACTIVE_SYSTEM: 'ping-federate' as const,
  OPS_MINUTES_DEFAULT: 10,
  SEARCH_TIMEOUT: 3000,
} as const;

// CSS classes & styling
export const CSS_CLASSES = {
  MAIN_CONTAINER: 'min-h-screen flex flex-col',
  CONTENT_CONTAINER: 'flex-1 max-w-7xl mx-auto px-4 py-6 space-y-8',
  SECTION_SPACING: 'space-y-8',
  BUTTON_WRAPPER: 'flex flex-wrap gap-2',
  GRID_LAYOUT: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
} as const;

// Time-based configuration
export const TIMING = {
  DEBOUNCE_DELAY: 300,
  API_TIMEOUT: 30000,
  RETRY_DELAY: 1000,
  RETRY_ATTEMPTS: 3,
} as const;

// Feature flag defaults
export const FEATURE_DEFAULTS = {
  EDUCATE_ENABLED: true,
  USE_MOCKS: true,
  USE_MOCK_AUTH: true,
} as const;

// SNOW configuration
export const SNOW_CONFIG = {
  DEFAULT_PRIORITY: '3 - Moderate' as const,
  DEFAULT_STATE: 'open' as const,
  TICKET_PREFIX: 'INC-' as const,
} as const;

// Ops configuration
export const OPS_CONFIG = {
  FAILURE_TIME_RANGES: [5, 10, 15, 30, 60] as const,
  DEFAULT_TIME_RANGE: 10,
  AUTO_LOAD_ON_LOGIN: true,
} as const;

const uiConfig = {
  THEME_CONFIG,
  THEME_CLASSES,
  DIALOG_DEFAULTS,
  UI_DEFAULTS,
  CSS_CLASSES,
  TIMING,
  FEATURE_DEFAULTS,
  SNOW_CONFIG,
  OPS_CONFIG,
};

export default uiConfig;
