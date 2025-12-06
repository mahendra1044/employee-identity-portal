/**
 * Safe localStorage wrapper with SSR support
 */

import type { AuthData, SystemToggleState } from "./types";

export class StorageService {
  /**
   * Check if localStorage is available
   */
  private static isAvailable(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const test = "__test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get item from localStorage
   */
  static getItem(key: string): string | null {
    if (!this.isAvailable()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  static setItem(key: string, value: string): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage full or unavailable
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable
    }
  }

  /**
   * Clear all storage
   */
  static clear(): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.clear();
    } catch {
      // Storage unavailable
    }
  }

  /**
   * Get parsed JSON from storage
   */
  static getJson<T>(key: string, defaultValue: T): T {
    const item = this.getItem(key);
    if (!item) return defaultValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Set JSON to storage
   */
  static setJson(key: string, value: any): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {
      // Conversion or storage failed
    }
  }

  // Auth-specific methods (with RBAC support)
  static saveAuth(token: string, role: string, userId: string, rbacData?: {
    assignedRoles?: string[];
    availableRoles?: unknown[];
    activeRole?: unknown;
    isMaster?: boolean;
  }): void {
    this.setItem("token", token);
    this.setItem("role", role);
    this.setItem("userId", userId);
    // Save RBAC data if provided
    if (rbacData) {
      if (rbacData.assignedRoles) this.setJson("assignedRoles", rbacData.assignedRoles);
      if (rbacData.availableRoles) this.setJson("availableRoles", rbacData.availableRoles);
      if (rbacData.activeRole) this.setJson("activeRole", rbacData.activeRole);
      if (rbacData.isMaster !== undefined) this.setItem("isMaster", String(rbacData.isMaster));
    }
  }

  static getAuth(): AuthData & {
    assignedRoles?: string[];
    availableRoles?: unknown[];
    activeRole?: unknown;
    isMaster?: boolean;
  } {
    return {
      token: this.getItem("token"),
      role: this.getItem("role"),
      userId: this.getItem("userId"),
      assignedRoles: this.getJson<string[]>("assignedRoles", []),
      availableRoles: this.getJson<unknown[]>("availableRoles", []),
      activeRole: this.getJson<unknown>("activeRole", null),
      isMaster: this.getItem("isMaster") === "true",
    };
  }

  static clearAuth(): void {
    this.removeItem("token");
    this.removeItem("role");
    this.removeItem("userId");
    this.removeItem("assignedRoles");
    this.removeItem("availableRoles");
    this.removeItem("activeRole");
    this.removeItem("isMaster");
  }

  // Save active role separately (for role switching)
  static saveActiveRole(role: unknown): void {
    this.setJson("activeRole", role);
  }

  // Theme-specific methods
  static getTheme(): string {
    return this.getItem("theme") || "light";
  }

  static setTheme(theme: string): void {
    this.setItem("theme", theme);
  }

  static clearTheme(): void {
    this.removeItem("theme");
  }

  // System toggles-specific methods
  static getSystemToggles(): SystemToggleState {
    return this.getJson("systemToggles", {} as SystemToggleState);
  }

  static setSystemToggles(toggles: SystemToggleState): void {
    this.setJson("systemToggles", toggles);
  }

  static clearSystemToggles(): void {
    this.removeItem("systemToggles");
  }

  // Generic typed methods
  static get<T>(key: string, defaultValue?: T): T | null {
    const item = this.getItem(key);
    if (!item) return defaultValue ?? null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as any;
    }
  }

  static set(key: string, value: any): void {
    if (typeof value === "string") {
      this.setItem(key, value);
    } else {
      this.setJson(key, value);
    }
  }
}
