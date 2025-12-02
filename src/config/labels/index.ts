/**
 * UI Labels Configuration
 * =======================
 * 
 * Centralized UI labels for the entire application.
 * All user-facing text should be defined here for:
 * - Easy maintenance and updates
 * - Future i18n/localization support
 * - Consistency across the application
 * 
 * USAGE:
 * ------
 * import { labels, t } from '@/config/labels';
 * 
 * // Direct access
 * <Button>{labels.common.buttons.submit}</Button>
 * 
 * // With interpolation
 * <p>{t(labels.common.copy.copiedData, { name: 'User' })}</p>
 * // Output: "Copied User to clipboard"
 * 
 * STRUCTURE:
 * ----------
 * - common.json: Shared labels (buttons, status, errors)
 * - login.json: Login form labels
 * - system-cards.json: System card UI labels
 * - dialogs.json: Dialog component labels
 * - snow.json: ServiceNow related labels
 * - search.json: Search section labels
 * - quick-actions.json: Quick actions panel labels
 * - failures.json: Failures section labels
 * 
 * @module config/labels
 */

import commonLabels from './common.json';
import loginLabels from './login.json';
import systemCardsLabels from './system-cards.json';
import dialogsLabels from './dialogs.json';
import snowLabels from './snow.json';
import searchLabels from './search.json';
import quickActionsLabels from './quick-actions.json';
import failuresLabels from './failures.json';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type for all labels organized by section
 */
export interface Labels {
  common: typeof commonLabels;
  login: typeof loginLabels;
  systemCards: typeof systemCardsLabels;
  dialogs: typeof dialogsLabels;
  snow: typeof snowLabels;
  search: typeof searchLabels;
  quickActions: typeof quickActionsLabels;
  failures: typeof failuresLabels;
}

// ============================================================================
// LABELS EXPORT
// ============================================================================

/**
 * All UI labels organized by section
 * 
 * @example
 * import { labels } from '@/config/labels';
 * 
 * // Access login labels
 * const title = labels.login.title; // "Sign in"
 * 
 * // Access common buttons
 * const submitText = labels.common.buttons.submit; // "Submit"
 */
export const labels: Labels = {
  common: commonLabels,
  login: loginLabels,
  systemCards: systemCardsLabels,
  dialogs: dialogsLabels,
  snow: snowLabels,
  search: searchLabels,
  quickActions: quickActionsLabels,
  failures: failuresLabels,
};

// ============================================================================
// INTERPOLATION HELPER
// ============================================================================

/**
 * Interpolate values into a template string
 * Replaces {key} placeholders with values from the provided object
 * 
 * @param template - String with {key} placeholders
 * @param values - Object with key-value pairs for replacement
 * @returns Interpolated string
 * 
 * @example
 * t("Hello {name}!", { name: "John" })
 * // Returns: "Hello John!"
 * 
 * t("Copied {name} JSON", { name: "Ping Directory" })
 * // Returns: "Copied Ping Directory JSON"
 * 
 * t("Refreshing {name} for {userKey}...", { name: "CyberArk", userKey: "u1001" })
 * // Returns: "Refreshing CyberArk for u1001..."
 */
export function t(
  template: string,
  values?: Record<string, string | number | undefined>
): string {
  if (!values) return template;
  
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : match;
  });
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

// Export individual label sections for direct imports
export const commonL = labels.common;
export const loginL = labels.login;
export const systemCardsL = labels.systemCards;
export const dialogsL = labels.dialogs;
export const snowL = labels.snow;
export const searchL = labels.search;
export const quickActionsL = labels.quickActions;
export const failuresL = labels.failures;

// Default export
export default labels;
