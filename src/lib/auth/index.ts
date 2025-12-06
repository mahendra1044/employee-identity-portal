/**
 * Auth Module Index
 * =================
 * 
 * Centralized authentication module for Full Stack Identity Ops Portal.
 * Supports dual-mode authentication:
 * - Mock Auth: For development and testing
 * - SAML/MFA Auth: For production with Ping Federate
 * 
 * ARCHITECTURE:
 * ```
 * auth/
 * ├── index.ts          <- You are here (barrel export)
 * ├── types.ts          <- Auth type definitions
 * ├── auth-provider.ts  <- Unified provider (mode switcher)
 * ├── mock-auth.ts      <- Mock authentication
 * ├── saml-auth.ts      <- SAML authentication
 * └── role-mapper.ts    <- Group to role mapping
 * ```
 * 
 * USAGE:
 * ```typescript
 * // Import what you need
 * import { createAuthProvider, isMockAuthMode } from '@/lib/auth';
 * 
 * // Create provider from config
 * const auth = createAuthProvider(config);
 * 
 * // Check auth mode
 * if (auth.isMockAuth()) {
 *   // Handle mock auth flow
 * } else {
 *   // Handle SAML flow
 * }
 * ```
 * 
 * @module lib/auth
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // User & session types
  AuthUser,
  AuthSession,
  
  // SAML types
  SamlAttributes,
  SamlAuthResult,
  SamlAuthnRequest,
  
  // Auth provider interface
  AuthProvider,
  AuthInitParams,
  AuthInitResult,
  AuthCompleteParams,
  AuthCompleteResult,
  AuthLogoutParams,
  AuthLogoutResult,
  
  // Role mapping
  RoleMappingResult,
} from './types';

// ============================================================================
// AUTH PROVIDER EXPORTS
// ============================================================================

export {
  // Unified provider
  UnifiedAuthProvider,
  createAuthProvider,
  createAuthProviderFromSettings,
  getAuthProviderInfo,
} from './auth-provider';

// ============================================================================
// MOCK AUTH EXPORTS
// ============================================================================

export {
  MockAuthProvider,
  createMockAuthProvider,
  getMockUserData,
  extractUserId,
  USER_MOCK_ROLES,
  USER_MOCK_DETAILS,
} from './mock-auth';

// ============================================================================
// SAML AUTH EXPORTS
// ============================================================================

export {
  SamlAuthProvider,
  createSamlAuthProvider,
  generateSamlSpMetadata,
  validateSamlResponse,
  extractUserFromAssertion,
} from './saml-auth';

// ============================================================================
// ROLE MAPPER EXPORTS
// ============================================================================

export type {
  GroupRoleMapping,
  RolePriority,
} from './role-mapper';

export {
  RoleMapper,
  createRoleMapper,
  mapGroupsToRoles,
  getHighestPriorityRole,
  extractGroupName,
  normalizeGroupDn,
  DEFAULT_GROUP_ROLE_MAPPING,
  ROLE_PRIORITY,
} from './role-mapper';

// ============================================================================
// CONFIG RE-EXPORTS (convenience)
// ============================================================================

export {
  type AuthMode,
  type AuthConfig,
  type MfaAuthConfig,
  type MockAuthConfig,
  type ServiceProviderConfig,
  type IdentityProviderConfig,
  type AttributeMappingConfig,
  type GroupRoleMapping as ConfigGroupRoleMapping,
  isMockAuthMode,
  isMfaAuthMode,
  getAuthModeDisplayName,
  DEFAULT_AUTH_CONFIG,
  DEFAULT_AUTH_MODE,
  DEFAULT_MFA_AUTH_CONFIG,
  DEFAULT_MOCK_AUTH_CONFIG,
  DEFAULT_GROUP_ROLE_MAPPING as CONFIG_GROUP_ROLE_MAPPING,
  DEFAULT_ROLE,
} from '@/config/auth.config';
