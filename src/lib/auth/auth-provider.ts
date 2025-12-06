/**
 * Auth Provider
 * =============
 * 
 * Main authentication provider that switches between auth modes.
 * Acts as a facade over mock and SAML auth providers.
 * 
 * CONFIGURATION:
 * - authMode determines which provider is active
 * - USE_MOCK_AUTH: Uses MockAuthProvider
 * - USE_MFA_AUTH: Uses SamlAuthProvider
 * 
 * USAGE:
 * ```typescript
 * const authProvider = createAuthProvider(config);
 * const result = await authProvider.initiateAuth({ userId, password });
 * ```
 * 
 * @module lib/auth/auth-provider
 */

import type { AuthMode, AuthConfig, MfaAuthConfig } from '@/config/auth.config';
import { isMockAuthMode, isMfaAuthMode } from '@/config/auth.config';
import type {
  AuthProvider,
  AuthInitParams,
  AuthInitResult,
  AuthCompleteParams,
  AuthCompleteResult,
  AuthLogoutParams,
  AuthLogoutResult,
} from './types';
import { MockAuthProvider, createMockAuthProvider } from './mock-auth';
import { SamlAuthProvider, createSamlAuthProvider } from './saml-auth';
import type { GroupRoleMapping } from './role-mapper';

// ============================================================================
// UNIFIED AUTH PROVIDER
// ============================================================================

/**
 * UnifiedAuthProvider
 * Switches between mock and SAML auth based on configuration
 */
export class UnifiedAuthProvider implements AuthProvider {
  readonly name = 'unified';
  
  private authMode: AuthMode;
  private mockProvider: MockAuthProvider;
  private samlProvider: SamlAuthProvider | null;

  constructor(
    authMode: AuthMode,
    mfaConfig: MfaAuthConfig,
    groupRoleMapping: GroupRoleMapping,
    defaultRole: string
  ) {
    this.authMode = authMode;
    
    // Always create mock provider (for development fallback)
    this.mockProvider = createMockAuthProvider();
    
    // Create SAML provider only if MFA is enabled
    if (mfaConfig.enabled) {
      this.samlProvider = createSamlAuthProvider(mfaConfig, groupRoleMapping, defaultRole);
    } else {
      this.samlProvider = null;
    }
  }

  /**
   * Get the currently active auth mode
   */
  getAuthMode(): AuthMode {
    return this.authMode;
  }

  /**
   * Check if mock auth is active
   */
  isMockAuth(): boolean {
    return isMockAuthMode(this.authMode);
  }

  /**
   * Check if MFA/SAML auth is active
   */
  isMfaAuth(): boolean {
    return isMfaAuthMode(this.authMode);
  }

  /**
   * Get the active provider based on auth mode
   */
  private getActiveProvider(): AuthProvider {
    if (this.isMfaAuth() && this.samlProvider) {
      return this.samlProvider;
    }
    return this.mockProvider;
  }

  /**
   * Initiate authentication using the active provider
   */
  async initiateAuth(params: AuthInitParams): Promise<AuthInitResult> {
    const provider = this.getActiveProvider();
    return provider.initiateAuth(params);
  }

  /**
   * Complete authentication using the active provider
   */
  async completeAuth(params: AuthCompleteParams): Promise<AuthCompleteResult> {
    const provider = this.getActiveProvider();
    return provider.completeAuth(params);
  }

  /**
   * Logout using the active provider
   */
  async logout(params: AuthLogoutParams): Promise<AuthLogoutResult> {
    const provider = this.getActiveProvider();
    return provider.logout(params);
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create unified auth provider from full config
 */
export function createAuthProvider(config: AuthConfig): UnifiedAuthProvider {
  return new UnifiedAuthProvider(
    config.authMode,
    config.mfaAuth,
    config.groupRoleMapping,
    config.defaultRole
  );
}

/**
 * Create auth provider from individual settings
 */
export function createAuthProviderFromSettings(
  authMode: AuthMode,
  mfaConfig: MfaAuthConfig,
  groupRoleMapping: GroupRoleMapping,
  defaultRole: string
): UnifiedAuthProvider {
  return new UnifiedAuthProvider(authMode, mfaConfig, groupRoleMapping, defaultRole);
}

// ============================================================================
// AUTH MODE UTILITIES
// ============================================================================

/**
 * Get auth provider info for display
 */
export function getAuthProviderInfo(authMode: AuthMode): {
  name: string;
  displayName: string;
  description: string;
  requiresRedirect: boolean;
} {
  if (isMfaAuthMode(authMode)) {
    return {
      name: 'saml',
      displayName: 'Single Sign-On',
      description: 'Authenticate using your corporate SSO credentials with MFA',
      requiresRedirect: true,
    };
  }
  
  return {
    name: 'mock',
    displayName: 'Development Login',
    description: 'Mock authentication for development and testing',
    requiresRedirect: false,
  };
}
