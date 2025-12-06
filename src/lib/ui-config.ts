/**
 * UI Configuration & Constants
 * 
 * NOTE: Only exports that are actively used are kept here.
 * For other UI configs, see @/config/app.config.ts
 */

// Theme classes used by useThemeDOM
export const THEME_CLASSES = {
  light: '',
  dark: 'dark',
  navy: 'dark navy',
} as const;

// Ops configuration used by useOpsFeatures
export const OPS_CONFIG = {
  FAILURE_TIME_RANGES: [5, 10, 15, 30, 60] as const,
  DEFAULT_TIME_RANGE: 10,
  AUTO_LOAD_ON_LOGIN: true,
} as const;

