/**
 * usePageState Hook
 * 
 * Centralized state management for all page-level UI states using useReducer pattern.
 * Consolidates all dialog states, UI toggles, and UI-specific data into a single source of truth.
 * 
 * Managed state:
 * - Dialog states: settings, educate, SNOW, pfOps, searchResult
 * - UI toggles: quick actions active tab, search dialog mode
 * 
 * Provides both dispatch function and convenience helper functions for state updates.
 * 
 * @hook
 * @returns {UsePageStateResult} Object with state, dispatch, and helper functions
 * 
 * @example
 * const pageState = usePageState();
 * pageState.openSettings(); // Open settings dialog
 * pageState.setQaActive('ping-federate'); // Set active quick action tab
 * pageState.toggleEducate(true); // Toggle educate dialog
 */

"use client";

import { useCallback, useReducer } from "react";
import { UI_DEFAULTS } from "@/lib/ui-config";
import type { SystemKey } from "@/lib/types";

/**
 * Page state shape - all UI state in one place
 */
export interface PageState {
  dialogs: {
    settingsOpen: boolean;
    educateOpen: boolean;
    snowOpen: boolean;
    pfOpsOpen: boolean;
    searchResultOpen: boolean;
  };
  ui: {
    qaActive: SystemKey;
    searchDialogMode: "json" | "html";
  };
}

/**
 * All possible page state actions
 */
export type PageAction =
  | { type: "OPEN_SETTINGS" }
  | { type: "CLOSE_SETTINGS" }
  | { type: "OPEN_EDUCATE" }
  | { type: "CLOSE_EDUCATE" }
  | { type: "OPEN_SNOW" }
  | { type: "CLOSE_SNOW" }
  | { type: "OPEN_PFOPS" }
  | { type: "CLOSE_PFOPS" }
  | { type: "OPEN_SEARCH_RESULT" }
  | { type: "CLOSE_SEARCH_RESULT" }
  | { type: "SET_QA_ACTIVE"; system: SystemKey }
  | { type: "SET_SEARCH_DIALOG_MODE"; mode: "json" | "html" }
  | { type: "RESET_DIALOGS" };

/**
 * Initial page state
 */
const initialState: PageState = {
  dialogs: {
    settingsOpen: false,
    educateOpen: false,
    snowOpen: false,
    pfOpsOpen: false,
    searchResultOpen: false,
  },
  ui: {
    qaActive: UI_DEFAULTS.QA_ACTIVE_SYSTEM,
    searchDialogMode: "json",
  },
};

/**
 * Reducer function for page state
 */
function pageStateReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case "OPEN_SETTINGS":
      return {
        ...state,
        dialogs: { ...state.dialogs, settingsOpen: true },
      };
    case "CLOSE_SETTINGS":
      return {
        ...state,
        dialogs: { ...state.dialogs, settingsOpen: false },
      };
    case "OPEN_EDUCATE":
      return {
        ...state,
        dialogs: { ...state.dialogs, educateOpen: true },
      };
    case "CLOSE_EDUCATE":
      return {
        ...state,
        dialogs: { ...state.dialogs, educateOpen: false },
      };
    case "OPEN_SNOW":
      return {
        ...state,
        dialogs: { ...state.dialogs, snowOpen: true },
      };
    case "CLOSE_SNOW":
      return {
        ...state,
        dialogs: { ...state.dialogs, snowOpen: false },
      };
    case "OPEN_PFOPS":
      return {
        ...state,
        dialogs: { ...state.dialogs, pfOpsOpen: true },
      };
    case "CLOSE_PFOPS":
      return {
        ...state,
        dialogs: { ...state.dialogs, pfOpsOpen: false },
      };
    case "OPEN_SEARCH_RESULT":
      return {
        ...state,
        dialogs: { ...state.dialogs, searchResultOpen: true },
      };
    case "CLOSE_SEARCH_RESULT":
      return {
        ...state,
        dialogs: { ...state.dialogs, searchResultOpen: false },
      };
    case "SET_QA_ACTIVE":
      return {
        ...state,
        ui: { ...state.ui, qaActive: action.system },
      };
    case "SET_SEARCH_DIALOG_MODE":
      return {
        ...state,
        ui: { ...state.ui, searchDialogMode: action.mode },
      };
    case "RESET_DIALOGS":
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

/**
 * Hook for managing all page-level UI state
 * Consolidates dialog states and UI toggles into a single reducer
 * 
 * Returns state and dispatch, plus helper functions for common operations
 */
export function usePageState() {
  const [state, dispatch] = useReducer(pageStateReducer, initialState);

  // Basic helper functions
  const openSettings = useCallback(() => dispatch({ type: "OPEN_SETTINGS" }), []);
  const closeSettings = useCallback(() => dispatch({ type: "CLOSE_SETTINGS" }), []);
  const openEducate = useCallback(() => dispatch({ type: "OPEN_EDUCATE" }), []);
  const closeEducate = useCallback(() => dispatch({ type: "CLOSE_EDUCATE" }), []);
  const openSnow = useCallback(() => dispatch({ type: "OPEN_SNOW" }), []);
  const closeSnow = useCallback(() => dispatch({ type: "CLOSE_SNOW" }), []);
  const openPfOps = useCallback(() => dispatch({ type: "OPEN_PFOPS" }), []);
  const closePfOps = useCallback(() => dispatch({ type: "CLOSE_PFOPS" }), []);
  const openSearchResult = useCallback(() => dispatch({ type: "OPEN_SEARCH_RESULT" }), []);
  const closeSearchResult = useCallback(() => dispatch({ type: "CLOSE_SEARCH_RESULT" }), []);
  const setQaActive = useCallback((system: SystemKey) => dispatch({ type: "SET_QA_ACTIVE", system }), []);
  const setSearchDialogMode = useCallback((mode: "json" | "html") => dispatch({ type: "SET_SEARCH_DIALOG_MODE", mode }), []);
  const resetDialogs = useCallback(() => dispatch({ type: "RESET_DIALOGS" }), []);

  // Toggle helper functions
  const toggleSettings = useCallback((open: boolean) => open ? openSettings() : closeSettings(), [openSettings, closeSettings]);
  const toggleEducate = useCallback((open: boolean) => open ? openEducate() : closeEducate(), [openEducate, closeEducate]);
  const toggleSnow = useCallback((open: boolean) => open ? openSnow() : closeSnow(), [openSnow, closeSnow]);
  const togglePfOps = useCallback((open: boolean) => open ? openPfOps() : closePfOps(), [openPfOps, closePfOps]);
  const toggleSearchResult = useCallback((open: boolean) => open ? openSearchResult() : closeSearchResult(), [openSearchResult, closeSearchResult]);

  return {
    state,
    dispatch,
    openSettings,
    closeSettings,
    toggleSettings,
    openEducate,
    closeEducate,
    toggleEducate,
    openSnow,
    closeSnow,
    toggleSnow,
    openPfOps,
    closePfOps,
    togglePfOps,
    openSearchResult,
    closeSearchResult,
    toggleSearchResult,
    setQaActive,
    setSearchDialogMode,
    resetDialogs,
  };
}

export default usePageState;
