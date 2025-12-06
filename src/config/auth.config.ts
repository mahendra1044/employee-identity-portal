/**
 * Authentication Configuration
 * ============================
 * 
 * Centralized configuration for authentication modes and SAML settings.
 * This file defines types and default values for auth configuration.
 * 
 * AUTHENTICATION MODES:
 * - USE_MOCK_AUTH: Development mode using userId-based mock login
 * - USE_MFA_AUTH: Production mode using SAML SSO with Ping Federate
 * 
 * CONFIGURATION SOURCE:
 * - Runtime config comes from backend/config/features.json
 * - This file provides TypeScript types and default values
 * 
 * @see docs/requirements/REQ-AUTH-MFA-SAML-Integration.md
 */

// ============================================================================
// AUTH MODE TYPES
// ============================================================================

/**
 * Authentication Mode
 * Controls which authentication flow is active
 */
export type AuthMode = 'USE_MOCK_AUTH' | 'USE_MFA_AUTH';

/**
 * Default authentication mode for development
 */
export const DEFAULT_AUTH_MODE: AuthMode = 'USE_MOCK_AUTH';

// ============================================================================
// MOCK AUTH CONFIGURATION
// ============================================================================

/**
 * Mock Authentication Configuration
 * Used for development and testing without IDP
 */
export interface MockAuthConfig {
  /** Whether mock auth is enabled */
  enabled: boolean;
  /** Default userId for quick testing (optional) */
  defaultUserId?: string;
}

/**
 * Default mock auth configuration
 */
export const DEFAULT_MOCK_AUTH_CONFIG: MockAuthConfig = {
  enabled: true,
  defaultUserId: 'u1001',
};

// ============================================================================
// SAML/MFA AUTH CONFIGURATION
// ============================================================================

/**
 * Service Provider (SP) Configuration
 * This application's SAML identity
 */
export interface ServiceProviderConfig {
  /** Unique identifier for this application (e.g., https://identity-portal.company.com) */
  entityId: string;
  /** URL where IDP sends SAML assertions (Assertion Consumer Service) */
  assertionConsumerServiceUrl: string;
  /** URL for Single Logout requests */
  singleLogoutUrl: string;
  /** Path to SP private key for signing requests (optional) */
  privateKeyPath?: string;
  /** Path to SP certificate for IDP to encrypt assertions (optional) */
  certificatePath?: string;
}

/**
 * Identity Provider (IDP) Configuration
 * Ping Federate SAML endpoints
 */
export interface IdentityProviderConfig {
  /** IDP unique identifier */
  entityId: string;
  /** IDP SSO endpoint URL */
  ssoUrl: string;
  /** IDP Single Logout endpoint URL */
  sloUrl: string;
  /** Path to IDP certificate for validating assertion signatures */
  certificatePath: string;
}

/**
 * SAML Attribute Mapping
 * Maps SAML assertion attributes to application fields
 */
export interface AttributeMappingConfig {
  /** Attribute containing user ID (e.g., 'uid', 'sAMAccountName') */
  userId: string;
  /** Attribute containing email (e.g., 'mail') */
  email: string;
  /** Attribute containing display name (e.g., 'cn', 'displayName') */
  displayName: string;
  /** Attribute containing group memberships (e.g., 'memberOf') */
  groups: string;
}

/**
 * MFA/SAML Authentication Configuration
 * Production SSO settings
 */
export interface MfaAuthConfig {
  /** Whether MFA auth is enabled */
  enabled: boolean;
  /** Authentication protocol (currently only SAML supported) */
  protocol: 'SAML';
  /** Service Provider configuration */
  serviceProvider: ServiceProviderConfig;
  /** Identity Provider configuration */
  identityProvider: IdentityProviderConfig;
  /** SAML attribute mapping */
  attributeMapping: AttributeMappingConfig;
}

/**
 * Default MFA auth configuration (placeholder values)
 * These should be overridden by environment-specific config
 */
export const DEFAULT_MFA_AUTH_CONFIG: MfaAuthConfig = {
  enabled: false,
  protocol: 'SAML',
  serviceProvider: {
    entityId: 'https://identity-portal.company.com',
    assertionConsumerServiceUrl: 'http://localhost:3001/api/auth/saml/callback',
    singleLogoutUrl: 'http://localhost:3001/api/auth/saml/logout',
  },
  identityProvider: {
    entityId: 'https://sso.company.com',
    ssoUrl: 'https://sso.company.com/idp/SSO.saml2',
    sloUrl: 'https://sso.company.com/idp/SLO.saml2',
    certificatePath: './config/saml/idp-certificate.pem',
  },
  attributeMapping: {
    userId: 'uid',
    email: 'mail',
    displayName: 'cn',
    groups: 'memberOf',
  },
};

// ============================================================================
// GROUP TO ROLE MAPPING
// ============================================================================

/**
 * Group to Role Mapping
 * Maps directory group DNs to application role keys
 */
export type GroupRoleMapping = Record<string, string[]>;

/**
 * Default group to role mapping
 * Maps Active Directory/LDAP groups to application roles
 */
export const DEFAULT_GROUP_ROLE_MAPPING: GroupRoleMapping = {
  'CN=SSO_OPS,OU=Groups,DC=company,DC=com': ['employee', 'sso_ops'],
  'CN=PAM_OPS,OU=Groups,DC=company,DC=com': ['employee', 'pam_ops'],
  'CN=IGA_OPS,OU=Groups,DC=company,DC=com': ['employee', 'iga_ops'],
  'CN=ENTRAID_OPS,OU=Groups,DC=company,DC=com': ['employee', 'entraid_ops'],
  'CN=TPAG_OPS,OU=Groups,DC=company,DC=com': ['employee', 'tpag_ops'],
  'CN=MASTER_OPS,OU=Groups,DC=company,DC=com': ['employee', 'ops'],
};

/**
 * Default role when no group mappings match
 */
export const DEFAULT_ROLE = 'employee';

// ============================================================================
// COMPLETE AUTH CONFIGURATION
// ============================================================================

/**
 * Complete Authentication Configuration
 * Combines all auth settings into a single interface
 */
export interface AuthConfig {
  /** Active authentication mode */
  authMode: AuthMode;
  /** Mock authentication settings */
  mockAuth: MockAuthConfig;
  /** MFA/SAML authentication settings */
  mfaAuth: MfaAuthConfig;
  /** Directory group to role mapping */
  groupRoleMapping: GroupRoleMapping;
  /** Default role when no groups match */
  defaultRole: string;
}

/**
 * Default complete auth configuration
 */
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  authMode: DEFAULT_AUTH_MODE,
  mockAuth: DEFAULT_MOCK_AUTH_CONFIG,
  mfaAuth: DEFAULT_MFA_AUTH_CONFIG,
  groupRoleMapping: DEFAULT_GROUP_ROLE_MAPPING,
  defaultRole: DEFAULT_ROLE,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if current mode is mock authentication
 */
export function isMockAuthMode(authMode: AuthMode): boolean {
  return authMode === 'USE_MOCK_AUTH';
}

/**
 * Check if current mode is MFA/SAML authentication
 */
export function isMfaAuthMode(authMode: AuthMode): boolean {
  return authMode === 'USE_MFA_AUTH';
}

/**
 * Get auth mode display name for UI
 */
export function getAuthModeDisplayName(authMode: AuthMode): string {
  switch (authMode) {
    case 'USE_MOCK_AUTH':
      return 'Mock Authentication';
    case 'USE_MFA_AUTH':
      return 'SSO with MFA';
    default:
      return 'Unknown';
  }
}
