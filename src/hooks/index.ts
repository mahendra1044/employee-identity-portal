/**
 * Hooks Index
 * 
 * Central export point for all application hooks.
 * Import hooks from here for cleaner imports:
 * 
 * @example
 * import { useAppAuth, useAppTheme, useSearch } from '@/hooks';
 * 
 * ============================================================================
 * HOOK CATEGORIES
 * ============================================================================
 * 
 * CONTEXT HOOKS (wrappers around AppContext):
 * - useAppAuth     - Authentication state and actions (login, logout, token)
 * - useAppTheme    - Theme state and setter (light, dark, navy)
 * - useAppToggles  - System toggle preferences
 * - useAppUI       - UI state (dialogs, current role)
 * 
 * FEATURE HOOKS:
 * - useFeatures    - Feature flags from backend config
 * - useOpsFeatures - Ops-specific features (failures, time range)
 * - useOpsActions  - Quick actions with config-driven handlers
 * 
 * DATA HOOKS:
 * - useSearch           - Employee search state and logic
 * - useSnow             - ServiceNow incidents
 * - useConsolidatedView - Multi-system data aggregation
 * 
 * UTILITY HOOKS:
 * - useThemeDOM    - Side-effect hook for applying theme to DOM
 * - useMobile      - Responsive breakpoint detection
 * 
 * ============================================================================
 */

// Context Hooks (wrappers around AppContext)
export { useAppAuth } from './useAppAuth';
export { useAppTheme } from './useAppTheme';
export { useAppToggles } from './useAppToggles';
export { useAppUI } from './useAppUI';

// Feature Hooks
export { useFeatures } from './useFeatures';
export { useOpsFeatures } from './useOpsFeatures';
export { useOpsActions, type ActionHandlers, type UseOpsActionsReturn } from './useOpsActions';

// Data Hooks
export { useSearch } from './useSearch';
export { useSnow } from './useSnow';
export { useConsolidatedView } from './useConsolidatedView';

// Utility Hooks
export { useThemeDOM } from './useThemeDOM';
export { useIsMobile } from './use-mobile';

// Backward Compatibility (legacy exports)
export { usePfOps } from './usePfOps';
