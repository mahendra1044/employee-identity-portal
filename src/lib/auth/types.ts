/**
 * Authentication Types
 * ====================
 * 
 * TypeScript types for authentication module.
 * These types are used across the auth library.
 * 
 * @module lib/auth/types
 */

import type { RBACRole } from '@/lib/types';

// ============================================================================
// USER & SESSION TYPES
// ============================================================================

/**
 * Authenticated User Information
 * Represents a user after successful authentication
 */
export interface AuthUser {
  /** User's unique identifier */
  userId: string;
  /** User's email address */
  email: string;
  /** User's display name */
  displayName: string;
  /** User's assigned role keys */
  roles: string[];
  /** Directory groups (from SAML assertion) */
  groups?: string[];
  /** Authentication method used */
  authMethod: 'mock' | 'saml';
  /** Timestamp when authentication occurred */
  authenticatedAt: Date;
}

/**
 * Authentication Session
 * Represents an active user session
 */
export interface AuthSession {
  /** JWT token */
  token: string;
  /** Authenticated user information */
  user: AuthUser;
  /** Session expiry timestamp */
  expiresAt: Date;
  /** Whether user has master (all roles) access */
  isMaster: boolean;
}

// ============================================================================
// SAML TYPES
// ============================================================================

/**
 * SAML Assertion Attributes
 * Parsed attributes from SAML assertion
 */
export interface SamlAttributes {
  /** User ID from assertion */
  userId: string;
  /** Email from assertion */
  email: string;
  /** Display name from assertion */
  displayName: string;
  /** Group memberships from assertion */
  groups: string[];
  /** Raw attributes for debugging */
  raw?: Record<string, unknown>;
}

/**
 * SAML Authentication Result
 * Result of SAML assertion validation
 */
export interface SamlAuthResult {
  /** Whether authentication was successful */
  success: boolean;
  /** Parsed user attributes (if successful) */
  attributes?: SamlAttributes;
  /** Error message (if failed) */
  error?: string;
  /** SAML assertion ID for replay prevention */
  assertionId?: string;
  /** Assertion expiry time */
  notOnOrAfter?: Date;
}

/**
 * SAML AuthnRequest
 * SAML authentication request to IDP
 */
export interface SamlAuthnRequest {
  /** Request ID */
  id: string;
  /** Encoded SAML request */
  samlRequest: string;
  /** Relay state for callback */
  relayState?: string;
  /** IDP SSO URL to redirect to */
  redirectUrl: string;
}

// ============================================================================
// AUTH PROVIDER TYPES
// ============================================================================

/**
 * Authentication Provider Interface
 * Common interface for all auth providers (mock, SAML)
 */
export interface AuthProvider {
  /** Provider name */
  readonly name: string;
  
  /**
   * Initiate authentication
   * For mock: validate credentials
   * For SAML: generate AuthnRequest and redirect URL
   */
  initiateAuth(params: AuthInitParams): Promise<AuthInitResult>;
  
  /**
   * Complete authentication
   * For mock: return user immediately
   * For SAML: validate assertion and extract user
   */
  completeAuth(params: AuthCompleteParams): Promise<AuthCompleteResult>;
  
  /**
   * Logout user
   * For mock: just clear session
   * For SAML: initiate SLO if configured
   */
  logout(params: AuthLogoutParams): Promise<AuthLogoutResult>;
}

/**
 * Auth Initiation Parameters
 */
export interface AuthInitParams {
  /** User ID (for mock auth) */
  userId?: string;
  /** Password (for mock auth) */
  password?: string;
  /** Relay state / return URL */
  returnUrl?: string;
}

/**
 * Auth Initiation Result
 */
export interface AuthInitResult {
  /** Whether initiation was successful */
  success: boolean;
  /** For mock: completed auth result */
  authResult?: AuthCompleteResult;
  /** For SAML: redirect URL to IDP */
  redirectUrl?: string;
  /** For SAML: encoded request */
  samlRequest?: string;
  /** Error message */
  error?: string;
}

/**
 * Auth Completion Parameters
 */
export interface AuthCompleteParams {
  /** SAML Response (base64 encoded) */
  samlResponse?: string;
  /** Relay state */
  relayState?: string;
}

/**
 * Auth Completion Result
 */
export interface AuthCompleteResult {
  /** Whether authentication was successful */
  success: boolean;
  /** Authenticated user */
  user?: AuthUser;
  /** JWT token */
  token?: string;
  /** Available roles for user */
  availableRoles?: RBACRole[];
  /** Active role */
  activeRole?: RBACRole;
  /** Whether user has master access */
  isMaster?: boolean;
  /** Error message */
  error?: string;
}

/**
 * Auth Logout Parameters
 */
export interface AuthLogoutParams {
  /** Current session token */
  token?: string;
  /** User ID */
  userId?: string;
  /** Return URL after logout */
  returnUrl?: string;
}

/**
 * Auth Logout Result
 */
export interface AuthLogoutResult {
  /** Whether logout was successful */
  success: boolean;
  /** For SAML SLO: redirect URL to IDP */
  redirectUrl?: string;
  /** Error message */
  error?: string;
}

// ============================================================================
// ROLE MAPPING TYPES
// ============================================================================

/**
 * Role Mapping Result
 * Result of mapping groups to roles
 */
export interface RoleMappingResult {
  /** Mapped role keys */
  roles: string[];
  /** Role IDs (R001, R002, etc.) */
  roleIds: string[];
  /** Whether user has master access */
  isMaster: boolean;
  /** Available RBAC roles */
  availableRoles: RBACRole[];
  /** Active (highest priority) role */
  activeRole: RBACRole;
}
