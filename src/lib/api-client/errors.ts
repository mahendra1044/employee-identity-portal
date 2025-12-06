/**
 * API Client Errors
 * ==================
 * 
 * Custom error classes for better error handling and debugging.
 * These provide more context than generic Error objects.
 * 
 * @module api-client/errors
 */

/**
 * Base API Error
 * 
 * Extended Error class with API-specific properties.
 * All API errors inherit from this class.
 */
export class ApiError extends Error {
  /** HTTP status code */
  public readonly status: number;
  /** Error code for programmatic handling */
  public readonly code: string;
  /** API endpoint that caused the error */
  public readonly endpoint: string;
  /** Additional error details */
  public readonly details?: unknown;
  /** Timestamp when error occurred */
  public readonly timestamp: Date;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'API_ERROR',
    endpoint: string = '',
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.endpoint = endpoint;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Convert error to a plain object for logging/serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      endpoint: this.endpoint,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    switch (this.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You don\'t have permission for this action.';
      case 404:
        return 'Resource not found.';
      case 408:
        return 'Request timed out. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }
}

/**
 * Network Error
 * 
 * Thrown when a request fails due to network issues.
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Network error', endpoint: string = '') {
    super(message, 0, 'NETWORK_ERROR', endpoint);
    this.name = 'NetworkError';
  }

  getUserMessage(): string {
    return 'Unable to connect. Please check your internet connection.';
  }
}

/**
 * Timeout Error
 * 
 * Thrown when a request exceeds the configured timeout.
 */
export class TimeoutError extends ApiError {
  /** Timeout duration in milliseconds */
  public readonly timeout: number;

  constructor(timeout: number, endpoint: string = '') {
    super(`Request timed out after ${timeout}ms`, 408, 'TIMEOUT_ERROR', endpoint);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}

/**
 * Authentication Error
 * 
 * Thrown when authentication fails or token is invalid.
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', endpoint: string = '') {
    super(message, 401, 'AUTH_ERROR', endpoint);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 * 
 * Thrown when user lacks permission for an action.
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied', endpoint: string = '') {
    super(message, 403, 'FORBIDDEN', endpoint);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation Error
 * 
 * Thrown when request validation fails.
 */
export class ValidationError extends ApiError {
  /** Validation errors by field */
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string = 'Validation failed',
    fieldErrors?: Record<string, string[]>,
    endpoint: string = ''
  ) {
    super(message, 400, 'VALIDATION_ERROR', endpoint, fieldErrors);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Parse error from response
 * 
 * Attempts to extract error details from a failed response.
 */
export async function parseErrorResponse(
  response: Response,
  endpoint: string
): Promise<ApiError> {
  let message = `HTTP ${response.status}`;
  let details: unknown;

  try {
    const body = await response.json();
    message = body.error || body.message || message;
    details = body;
  } catch {
    try {
      const text = await response.text();
      if (text) message = text;
    } catch {
      // Use default message
    }
  }

  // Return specific error type based on status
  switch (response.status) {
    case 401:
      return new AuthenticationError(message, endpoint);
    case 403:
      return new AuthorizationError(message, endpoint);
    case 400:
      return new ValidationError(message, undefined, endpoint);
    default:
      return new ApiError(message, response.status, 'HTTP_ERROR', endpoint, details);
  }
}

/**
 * Check if an error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Get user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.getUserMessage();
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}
