'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';

/**
 * Hook for authentication operations
 */
export function useAppAuth() {
  const { state, dispatch } = useAppContext();

  const login = useCallback(
    (token: string, role: string, email: string) => {
      dispatch({ type: 'LOGIN', payload: { token, role, email } });
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  return {
    token: state.auth.token,
    role: state.auth.role,
    email: state.auth.email,
    isLoading: state.auth.isLoading,
    login,
    logout,
  };
}
