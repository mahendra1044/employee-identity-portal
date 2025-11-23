'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';

/**
 * Hook for theme operations
 */
export function useAppTheme() {
  const { state, dispatch } = useAppContext();

  const setTheme = useCallback(
    (theme: 'light' | 'dark' | 'navy') => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },
    [dispatch]
  );

  return {
    theme: state.theme,
    setTheme,
  };
}
