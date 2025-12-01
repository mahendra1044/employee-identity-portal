/**
 * Data Display Utilities
 * ======================
 * 
 * Shared utility functions for displaying and formatting data
 * across multiple components (SearchSection, DataDialog, etc.)
 * 
 * WHEN TO EDIT THIS FILE:
 * - Adding new field type detection (e.g., new data format)
 * - Modifying how values are displayed
 * - Adding new field icons or section groupings
 * - Updating relative time formatting
 */

import type { FieldSection, JsonValue } from "./types";

// ============================================================================
// TYPE DETECTION UTILITIES
// ============================================================================

/**
 * Check if a value is a valid email address
 */
export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Check if a value is a valid URL
 */
export function isUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    new URL(value);
    return value.startsWith('http://') || value.startsWith('https://');
  } catch {
    return false;
  }
}

/**
 * Check if a value is an ISO date string
 */
export function isDate(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  return isoDateRegex.test(value);
}

/**
 * Check if a value is a JavaScript timestamp (milliseconds since epoch)
 * Valid range: 2000-01-01 to 2100-01-01
 */
export function isTimestamp(value: unknown): boolean {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const num = typeof value === 'string' ? parseInt(value) : value;
  return !isNaN(num) && num > 946684800000 && num < 4102444800000;
}

// ============================================================================
// DATE/TIME FORMATTING
// ============================================================================

/**
 * Get human-readable relative time from a date string
 * 
 * @example
 * getRelativeTime('2025-12-01T10:00:00Z') // "2 hours ago"
 */
export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

/**
 * Format a timestamp or date string for display
 */
export function formatDateTime(value: unknown): { formatted: string; relative: string } {
  if (isTimestamp(value)) {
    const date = new Date(Number(value));
    return {
      formatted: date.toLocaleString(),
      relative: getRelativeTime(date.toISOString())
    };
  }
  if (isDate(value)) {
    const date = new Date(value as string);
    return {
      formatted: date.toLocaleString(),
      relative: getRelativeTime(value as string)
    };
  }
  return { formatted: String(value), relative: '' };
}

// ============================================================================
// CLIPBOARD UTILITIES
// ============================================================================

/**
 * Copy a field value to clipboard and show toast notification
 * 
 * @example
 * copyFieldValue('email', 'user@example.com') // Copies and shows toast
 */
export function copyFieldValue(
  key: string, 
  value: unknown, 
  showToast?: (message: string) => void
): void {
  const textToCopy = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  navigator.clipboard.writeText(textToCopy);
  if (showToast) {
    showToast(`Copied ${key}`);
  }
}

// ============================================================================
// FIELD ICONS
// ============================================================================

/**
 * Get an emoji icon for a field based on its key and value
 * 
 * @example
 * getFieldIcon('email', 'user@example.com') // '📧'
 * getFieldIcon('status', 'active') // '📊'
 */
export function getFieldIcon(key: string, value: unknown): string {
  const lowerKey = key.toLowerCase();
  
  // Value-based detection
  if (isEmail(value)) return '📧';
  if (isUrl(value)) return '🔗';
  if (typeof value === 'boolean') return value ? '✅' : '❌';
  if (Array.isArray(value)) return '📦';
  if (typeof value === 'object' && value !== null) return '📄';
  if (typeof value === 'number') return '🔢';
  
  // Key-based detection
  if (lowerKey.includes('password') || lowerKey.includes('secret')) return '🔒';
  if (lowerKey.includes('user') || lowerKey === 'upn' || lowerKey.includes('username')) return '👤';
  if (lowerKey.includes('email') || lowerKey.includes('mail')) return '📧';
  if (lowerKey.includes('phone') || lowerKey.includes('mobile')) return '📱';
  if (lowerKey.includes('date') || lowerKey.includes('time') || lowerKey.includes('sync')) return '📅';
  if (lowerKey.includes('department') || lowerKey.includes('org')) return '🏢';
  if (lowerKey.includes('title') || lowerKey.includes('job')) return '💼';
  if (lowerKey.includes('manager') || lowerKey.includes('supervisor')) return '👔';
  if (lowerKey.includes('group') || lowerKey.includes('team')) return '👥';
  if (lowerKey.includes('role')) return '🎭';
  if (lowerKey.includes('license') || lowerKey.includes('subscription')) return '🎫';
  if (lowerKey.includes('device') || lowerKey.includes('computer')) return '💻';
  if (lowerKey.includes('status') || lowerKey.includes('state')) return '📊';
  if (lowerKey.includes('risk') || lowerKey.includes('security')) return '🛡️';
  if (lowerKey.includes('access') || lowerKey.includes('permission')) return '🔐';
  if (lowerKey.includes('policy') || lowerKey.includes('policies')) return '📋';
  if (lowerKey.includes('id') || lowerKey.includes('guid')) return '🔑';
  if (lowerKey.includes('location') || lowerKey.includes('address')) return '📍';
  
  return '📌';
}

// ============================================================================
// FIELD SECTIONS (for grouping in display)
// ============================================================================

// Note: FieldSection type is imported from ./types

/**
 * Determine which section a field belongs to for grouped display
 * 
 * @example
 * getSectionForField('userPrincipalName')
 * // { section: 'identity', title: 'Identity Information', icon: '👤', gradient: '...' }
 */
export function getSectionForField(key: string): FieldSection {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.includes('upn') || lowerKey.includes('objectid') || lowerKey.includes('tenant') || 
      lowerKey.includes('username') || lowerKey.includes('userid') || lowerKey === 'id') {
    return {
      section: 'identity',
      title: 'Identity Information',
      icon: '👤',
      gradient: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900'
    };
  }
  
  if (lowerKey.includes('job') || lowerKey.includes('title') || lowerKey.includes('department') || 
      lowerKey.includes('manager') || lowerKey.includes('organization')) {
    return {
      section: 'organization',
      title: 'Organization',
      icon: '🏢',
      gradient: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900'
    };
  }
  
  if (lowerKey.includes('license') || lowerKey.includes('group') || lowerKey.includes('role') || 
      lowerKey.includes('permission') || lowerKey.includes('entitlement')) {
    return {
      section: 'access',
      title: 'Licenses & Access',
      icon: '🔐',
      gradient: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900'
    };
  }
  
  if (lowerKey.includes('device') || lowerKey.includes('computer') || lowerKey.includes('machine')) {
    return {
      section: 'devices',
      title: 'Devices',
      icon: '💻',
      gradient: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900'
    };
  }
  
  if (lowerKey.includes('risk') || lowerKey.includes('security') || lowerKey.includes('conditional') || 
      lowerKey.includes('mfa') || lowerKey.includes('authentication')) {
    return {
      section: 'security',
      title: 'Security',
      icon: '🛡️',
      gradient: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900'
    };
  }
  
  if (lowerKey.includes('sync') || lowerKey.includes('modified') || lowerKey.includes('created') || 
      lowerKey.includes('updated') || lowerKey.includes('last')) {
    return {
      section: 'metadata',
      title: 'Metadata',
      icon: '📊',
      gradient: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'
    };
  }
  
  return {
    section: 'other',
    title: 'Other Information',
    icon: '📌',
    gradient: 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'
  };
}

// ============================================================================
// VALUE TYPE ICONS (for JSON view)
// ============================================================================

/**
 * Get a type indicator icon for a value (for JSON-style display)
 */
export function getTypeIcon(value: unknown): string {
  if (value === null) return '∅';
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (typeof value === 'number') return '#';
  if (typeof value === 'string') return '"';
  if (Array.isArray(value)) return '[]';
  if (typeof value === 'object') return '{}';
  return '?';
}

// ============================================================================
// SYSTEM ICONS
// ============================================================================

/**
 * Get an icon for a system based on its key
 */
export function getSystemIcon(system: string): string {
  if (system.includes('azure') || system.includes('ad')) return '☁️';
  if (system.includes('ping')) return '🔐';
  if (system.includes('cyber')) return '🛡️';
  if (system.includes('saviynt')) return '⚡';
  return '📦';
}

// ============================================================================
// COPY UTILITIES
// ============================================================================

/**
 * Copy a value to clipboard with optional key prefix
 */
export function formatForCopy(value: unknown, key?: string): string {
  if (key) {
    return `"${key}": ${typeof value === 'string' ? `"${value}"` : JSON.stringify(value, null, 2)}`;
  }
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
