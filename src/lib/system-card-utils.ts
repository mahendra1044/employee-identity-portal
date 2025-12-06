/**
 * System Card Utilities
 * =====================
 * 
 * Helper functions for SystemCard component.
 * Extracted to keep the main component clean and make testing easier.
 * 
 * WHEN TO EDIT THIS FILE:
 * - Adding new status detection logic
 * - Adding new metric extraction patterns
 * - Modifying how data is interpreted for display
 */

import type { SystemData } from "@/lib/types";

// ============================================================================
// STATUS DETECTION
// ============================================================================

/**
 * Possible status values for a system card
 */
export type DataStatus = 'success' | 'warning' | 'error' | 'loading' | 'empty';

/**
 * Detect the status of system data for UI display
 * 
 * Used to show appropriate icons and colors on system cards
 * 
 * @param data - The system data object
 * @param loading - Whether the data is currently loading
 * @param error - Error message if any
 * @returns Status string for UI rendering
 * 
 * @example
 * const status = getDataStatus(data, false, null);
 * // Returns: 'success', 'warning', 'error', 'loading', or 'empty'
 */
export function getDataStatus(
  data: SystemData | null,
  loading: boolean,
  error: string | null
): DataStatus {
  if (loading) return 'loading';
  if (error) return 'error';
  if (!data) return 'empty';
  
  // Check for common status indicators in the data
  const status = String(
    (data as Record<string, unknown>)?.status || 
    (data as Record<string, unknown>)?.state || 
    (data as Record<string, unknown>)?.enabled || 
    ''
  ).toLowerCase();
  
  if (status.includes('active') || status === 'true' || status === '1') {
    return 'success';
  }
  if (status.includes('inactive') || status.includes('disabled') || status === 'false') {
    return 'warning';
  }
  
  // Default to success if data exists
  return 'success';
}

// ============================================================================
// METRIC EXTRACTION
// ============================================================================

/**
 * A displayable metric from system data
 */
export interface KeyMetric {
  icon: string;
  label: string;
  value: string;
}

/**
 * Extract key metrics from system data for quick display
 * 
 * Looks for common patterns like groups, status, last login, email
 * and formats them for compact card display
 * 
 * @param data - The system data object
 * @returns Array of up to 3 metrics to display
 * 
 * @example
 * const metrics = extractKeyMetrics(data);
 * // Returns: [{ icon: '👥', label: 'Groups', value: '5' }, ...]
 */
export function extractKeyMetrics(data: SystemData | null): KeyMetric[] {
  if (!data || typeof data !== 'object') return [];
  
  const metrics: KeyMetric[] = [];
  const dataObj = data as Record<string, unknown>;
  
  // Groups/Membership
  const groups = dataObj.groups || dataObj.memberOf;
  if (groups && Array.isArray(groups) && groups.length > 0) {
    metrics.push({
      icon: '👥',
      label: 'Groups',
      value: String(groups.length)
    });
  }
  
  // Status
  const status = dataObj.status || dataObj.state;
  if (status) {
    metrics.push({
      icon: '🔐',
      label: 'Status',
      value: String(status)
    });
  }
  
  // Last Activity
  const lastActivity = dataObj.lastLogin || dataObj.lastSignIn || dataObj.lastActivity;
  if (lastActivity) {
    metrics.push({
      icon: '📅',
      label: 'Activity',
      value: String(lastActivity).substring(0, 10)
    });
  }
  
  // Email
  const email = dataObj.email || dataObj.mail || dataObj.userPrincipalName;
  if (email) {
    metrics.push({
      icon: '📧',
      label: 'Email',
      value: String(email)
    });
  }
  
  // Return max 3 metrics
  return metrics.slice(0, 3);
}

// ============================================================================
// SNOW TICKET HELPERS
// ============================================================================

/**
 * Build the description for a SNOW ticket
 * 
 * @param email - User email
 * @param system - System name
 * @param additionalInfo - Optional additional info from user
 * @returns Formatted ticket description
 */
export function buildTicketDescription(
  email: string,
  system: string,
  additionalInfo?: string
): string {
  const defaultDesc = `Access issue investigation request for user ${email} in ${system} system. Please review attached payload for details.`;
  const additional = additionalInfo?.trim() 
    ? `\n\nAdditional information:\n${additionalInfo.trim()}` 
    : '';
  return defaultDesc + additional;
}
