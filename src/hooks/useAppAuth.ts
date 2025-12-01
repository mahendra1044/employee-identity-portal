'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import type { RBACRole } from '@/lib/types';

/**
 * Hook for authentication operations with RBAC support
 */
export function useAppAuth() {
  const { state, dispatch } = useAppContext();

  const login = useCallback(
    (
      token: string, 
      role: string, 
      userId: string,
      rbacData?: {
        assignedRoles?: string[];
        availableRoles?: RBACRole[];
        activeRole?: RBACRole | null;
        isMaster?: boolean;
      }
    ) => {
      dispatch({ 
        type: 'LOGIN', 
        payload: { 
          token, 
          role, 
          userId,
          ...rbacData 
        } 
      });
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  const switchRbacRole = useCallback(
    (role: RBACRole) => {
      dispatch({ type: 'SWITCH_RBAC_ROLE', payload: role });
    },
    [dispatch]
  );

  return {
    // Basic auth
    token: state.auth.token,
    role: state.auth.role,
    userId: state.auth.userId,
    email: state.auth.userId, // Alias for backward compatibility - email = userId
    isLoading: state.auth.isLoading,
    // RBAC
    assignedRoles: state.auth.assignedRoles,
    availableRoles: state.auth.availableRoles,
    activeRole: state.auth.activeRole,
    isMaster: state.auth.isMaster,
    // Actions
    login,
    logout,
    switchRbacRole,
  };
}
