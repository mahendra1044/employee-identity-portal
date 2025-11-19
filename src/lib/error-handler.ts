/**
 * Error handling and parsing utilities
 */

import type { ApiErrorResponse } from "./types";

export class ErrorHandler {
  /**
   * Parse error from various formats
   */
  static parseError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object" && "message" in error) {
      return String((error as any).message);
    }

    if (error && typeof error === "object" && "error" in error) {
      return String((error as any).error);
    }

    return "An unexpected error occurred";
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError) {
      const message = error.message.toLowerCase();
      return (
        message.includes("fetch") ||
        message.includes("network") ||
        message.includes("connect")
      );
    }
    return false;
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthError(error: unknown): boolean {
    const message = this.parseError(error).toLowerCase();
    return (
      message.includes("401") ||
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("auth")
    );
  }

  /**
   * Check if error is a not found error
   */
  static isNotFoundError(error: unknown): boolean {
    const message = this.parseError(error).toLowerCase();
    return message.includes("404") || message.includes("not found");
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: unknown): boolean {
    const message = this.parseError(error).toLowerCase();
    return (
      message.includes("validation") ||
      message.includes("invalid") ||
      message.includes("required")
    );
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: unknown): string {
    if (this.isNetworkError(error)) {
      return "Network error. Please check your connection and try again.";
    }

    if (this.isAuthError(error)) {
      return "Your session has expired. Please log in again.";
    }

    if (this.isNotFoundError(error)) {
      return "The requested resource was not found.";
    }

    if (this.isValidationError(error)) {
      return "Please check your input and try again.";
    }

    const message = this.parseError(error);
    return message || "An unexpected error occurred. Please try again.";
  }

  /**
   * Parse response error
   */
  static async parseResponseError(response: Response): Promise<string> {
    try {
      const data: ApiErrorResponse = await response.json();
      return data?.error || data?.message || `HTTP ${response.status}`;
    } catch {
      try {
        const text = await response.text();
        return text || `HTTP ${response.status}`;
      } catch {
        return `HTTP ${response.status}`;
      }
    }
  }

  /**
   * Format error for logging
   */
  static formatForLogging(error: unknown): string {
    const message = this.parseError(error);
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${message}`;
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: unknown): boolean {
    if (this.isNetworkError(error)) return true;

    const message = this.parseError(error).toLowerCase();
    return (
      message.includes("timeout") ||
      message.includes("503") ||
      message.includes("502") ||
      message.includes("429")
    );
  }
}
