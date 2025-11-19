/**
 * Formatting and transformation utilities
 */

import { ROLE_MAP, SYSTEM_LABELS } from "./constants";
import type { SystemKey } from "./types";

/**
 * Format role name for display
 */
export function formatRoleName(role: string): string {
  return ROLE_MAP[role] || role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Get icon type for role (use in components)
 */
export function getRoleIconType(role: string): "ops" | "employee" | "default" {
  if (role === "ops") return "ops";
  if (role === "employee") return "employee";
  return "default";
}

/**
 * Format system name for display
 */
export function formatSystemName(system: SystemKey): string {
  return SYSTEM_LABELS[system] || system;
}

/**
 * Convert object to key-value pairs for display
 */
export function toPairs(obj: any): Array<{ k: string; v: any }> {
  if (typeof obj !== "object" || obj === null) return [];
  return Object.entries(obj).map(([k, v]) => ({ k, v }));
}

/**
 * Convert object to HTML table string
 */
export function toHtmlTable(obj: any): string {
  if (typeof obj !== "object" || obj === null) {
    return `<p>${JSON.stringify(obj)}</p>`;
  }

  const pairs = toPairs(obj);
  if (pairs.length === 0) {
    return "<p>No data available</p>";
  }

  const rows = pairs
    .map(
      (p) =>
        `<tr><td style="border:1px solid #ccc;padding:8px;font-weight:bold;">${
          p.k
        }</td><td style="border:1px solid #ccc;padding:8px;">${
          typeof p.v === "object" ? JSON.stringify(p.v) : p.v
        }</td></tr>`
    )
    .join("");

  return `<table style="border-collapse:collapse;width:100%;"><tr style="background-color:#f5f5f5;"><th style="border:1px solid #ccc;padding:8px;text-align:left;">Key</th><th style="border:1px solid #ccc;padding:8px;text-align:left;">Value</th></tr>${rows}</table>`;
}

/**
 * Truncate string to max length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format ISO date string to readable format
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  } catch {
    return isoString;
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Format object for JSON display
 */
export function formatJson(obj: any, spaces: number = 2): string {
  try {
    return JSON.stringify(obj, null, spaces);
  } catch {
    return String(obj);
  }
}
