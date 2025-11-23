'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import type { SystemKey } from '@/lib/types';

/**
 * Hook for user toggle operations
 */
export function useAppToggles() {
  const { state, dispatch } = useAppContext();

  const toggleSystem = useCallback(
    (system: SystemKey, enabled: boolean) => {
      dispatch({ type: 'TOGGLE_SYSTEM', payload: { system, enabled } });
    },
    [dispatch]
  );

  const resetToggles = useCallback(() => {
    dispatch({ type: 'RESET_TOGGLES' });
  }, [dispatch]);

  return {
    toggles: state.userToggles,
    toggleSystem,
    resetToggles,
  };
}
