'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import type { AppState } from '@/context/AppContext';

/**
 * Hook for UI state operations
 */
export function useAppUI() {
  const { state, dispatch } = useAppContext();

  const setUIState = useCallback(
    (key: keyof AppState['ui'], value: boolean | string | null) => {
      dispatch({ type: 'SET_UI_STATE', payload: { key, value } });
    },
    [dispatch]
  );

  const setRole = useCallback((role: string) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, [dispatch]);

  const openSettings = useCallback(() => {
    setUIState('settingsOpen', true);
  }, [setUIState]);

  const closeSettings = useCallback(() => {
    setUIState('settingsOpen', false);
  }, [setUIState]);

  const openEducate = useCallback(() => {
    setUIState('educateOpen', true);
  }, [setUIState]);

  const closeEducate = useCallback(() => {
    setUIState('educateOpen', false);
  }, [setUIState]);

  const openSnow = useCallback(() => {
    setUIState('snowOpen', true);
  }, [setUIState]);

  const closeSnow = useCallback(() => {
    setUIState('snowOpen', false);
  }, [setUIState]);

  return {
    ui: state.ui,
    setUIState,
    setRole,
    openSettings,
    closeSettings,
    openEducate,
    closeEducate,
    openSnow,
    closeSnow,
  };
}