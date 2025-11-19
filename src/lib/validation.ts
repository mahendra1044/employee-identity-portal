/**
 * Input validation utilities
 */

import { SYSTEMS } from "./constants";
import type { SystemKey } from "./types";

export class ValidationService {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if string is a valid system key
   */
  static isValidSystemKey(system: string): system is SystemKey {
    return SYSTEMS.includes(system as SystemKey);
  }

  /**
   * Validate role value
   */
  static isValidRole(role: string): boolean {
    return ["ops", "employee", "admin", "manager"].includes(role);
  }

  /**
   * Validate login inputs
   */
  static validateLoginInput(email: string, password: string): string[] {
    const errors: string[] = [];
    
    if (!email || email.trim() === "") {
      errors.push("Email is required");
    } else if (!this.isValidEmail(email)) {
      errors.push("Invalid email format");
    }

    if (!password || password.trim() === "") {
      errors.push("Password is required");
    } else if (password.length < 1) {
      errors.push("Password is too short");
    }

    return errors;
  }

  /**
   * Validate search input
   */
  static validateSearchInput(query: string): string[] {
    const errors: string[] = [];
    
    if (!query || query.trim() === "") {
      errors.push("Search query is required");
    } else if (query.length < 2) {
      errors.push("Search must be at least 2 characters");
    }

    return errors;
  }

  /**
   * Check if value is truthy
   */
  static isRequired(value: any): boolean {
    return value !== null && value !== undefined && value !== "";
  }

  /**
   * Validate token format (basic check)
   */
  static isValidToken(token: string): boolean {
    return !!(token && token.length > 10);
  }

  /**
   * Check if all required fields present
   */
  static hasRequiredFields(obj: any, fields: string[]): boolean {
    return fields.every(field => obj[field] !== null && obj[field] !== undefined);
  }
}
