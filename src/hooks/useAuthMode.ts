/**
 * useAuthMode Hook
 * ================
 * 
 * Hook for accessing and managing authentication mode.
 * Provides auth mode state and SSO initiation.
 * 
 * USAGE:
 * ```typescript
 * const { authMode, isMockAuth, isMfaAuth, initiateSSO } = useAuthMode();
 * 
 * if (isMfaAuth) {
 *   return <SSOLoginButton onClick={initiateSSO} />;
 * }
 * ```
 * 
 * @module hooks/useAuthMode
 */

import { useCallback, useEffect, useState } from 'react';
import type { AuthMode } from '@/config/auth.config';

// ============================================================================
// TYPES
// ============================================================================

interface UseAuthModeReturn {
  /** Current auth mode from features config */
  authMode: AuthMode;
  
  /** Whether mock auth is active */
  isMockAuth: boolean;
  
  /** Whether MFA/SAML auth is active */
  isMfaAuth: boolean;
  
  /** Whether auth mode is loaded from config */
  isLoading: boolean;
  
  /** Initiate SSO login (redirects to IDP) */
  initiateSSO: (returnUrl?: string) => void;
  
  /** Initiate SSO logout */
  initiateLogout: (returnUrl?: string) => void;
  
  /** Auth mode display name */
  displayName: string;
  
  /** Auth mode description */
  description: string;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useAuthMode(): UseAuthModeReturn {
  const [authMode, setAuthMode] = useState<AuthMode>('USE_MOCK_AUTH');
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch auth mode from config API on mount
  useEffect(() => {
    const fetchAuthMode = async () => {
      try {
        const response = await fetch('/api/config/features');
        if (response.ok) {
          const data = await response.json();
          if (data.authMode) {
            setAuthMode(data.authMode as AuthMode);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch auth mode, using default:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuthMode();
  }, []);
  
  const isMockAuth = authMode === 'USE_MOCK_AUTH';
  const isMfaAuth = authMode === 'USE_MFA_AUTH';
  
  // Get display info based on mode
  const displayName = isMfaAuth ? 'Single Sign-On' : 'Development Login';
  const description = isMfaAuth 
    ? 'Authenticate using your corporate SSO credentials with MFA'
    : 'Mock authentication for development and testing';
  
  /**
   * Initiate SSO login flow
   * Redirects user to the SAML login endpoint
   */
  const initiateSSO = useCallback((returnUrl?: string) => {
    const url = returnUrl || window.location.pathname;
    // Use backend SAML login endpoint
    window.location.href = `/api/saml/login?returnUrl=${encodeURIComponent(url)}`;
  }, []);
  
  /**
   * Initiate SSO logout flow
   * Redirects user to the SAML logout endpoint
   */
  const initiateLogout = useCallback((returnUrl?: string) => {
    const url = returnUrl || '/';
    // Use backend SAML logout endpoint
    window.location.href = `/api/saml/logout?returnUrl=${encodeURIComponent(url)}`;
  }, []);
  
  return {
    authMode,
    isMockAuth,
    isMfaAuth,
    isLoading,
    initiateSSO,
    initiateLogout,
    displayName,
    description,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if current page is an auth callback
 * (has authSuccess or loggedOut query param)
 */
export function isAuthCallback(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('authSuccess') || params.has('loggedOut');
}

/**
 * Get auth callback params from URL
 */
export function getAuthCallbackParams(): {
  isSuccess: boolean;
  isLogout: boolean;
  token: string | null;
} {
  if (typeof window === 'undefined') {
    return { isSuccess: false, isLogout: false, token: null };
  }
  
  const params = new URLSearchParams(window.location.search);
  return {
    isSuccess: params.get('authSuccess') === 'true',
    isLogout: params.has('loggedOut'),
    token: params.get('token'),
  };
}

/**
 * Clear auth callback params from URL
 * Use after processing the callback
 */
export function clearAuthCallbackParams(): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  url.searchParams.delete('authSuccess');
  url.searchParams.delete('loggedOut');
  url.searchParams.delete('token');
  
  window.history.replaceState({}, '', url.toString());
}
