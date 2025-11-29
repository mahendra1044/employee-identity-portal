'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, Dispatch } from 'react';
import { StorageService } from '@/lib/storage';
import { isOpsRole } from '@/lib/role-utils';
import type { SystemKey } from '@/lib/types';

/**
 * Global application state
 */
export interface AppState {
  // Auth state
  auth: {
    token: string | null;
    role: string | null;
    email: string | null;
    isLoading: boolean;
  };
  // Theme
  theme: 'light' | 'dark' | 'navy';
  // User preferences
  userToggles: Record<SystemKey, boolean>;
  // UI state
  ui: {
    currentRole: string | null; // ops or employee for ops users
    originalRole: string | null; // original role at login (ops or employee)
    settingsOpen: boolean;
    educateOpen: boolean;
    snowOpen: boolean;
  };
}

/**
 * Discriminated union of all possible actions
 */
export type AppAction =
  | { type: 'LOGIN'; payload: { token: string; role: string; email: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'navy' }
  | { type: 'TOGGLE_SYSTEM'; payload: { system: SystemKey; enabled: boolean } }
  | { type: 'RESET_TOGGLES' }
  | { type: 'SET_UI_STATE'; payload: { key: keyof AppState['ui']; value: boolean | string | null } }
  | { type: 'TOGGLE_ROLE' }
  | { type: 'SET_ROLE'; payload: string }
  | { type: 'INIT_STATE'; payload: Partial<AppState> };

/**
 * Initial state
 */
const initialState: AppState = {
  auth: {
    token: null,
    role: null,
    email: null,
    isLoading: false,
  },
  theme: 'light',
  userToggles: {
    'ping-directory': true,
    'ping-federate': true,
    'ping-mfa': true,
    'ping-access': true,
    'ping-authorize': true,
    'ping-intelligence': true,
    'azure-ad': true,
    'azure-ad-users': true,
    'azure-ad-groups': true,
    'azure-ad-apps': true,
    'azure-ad-conditional': true,
    'azure-ad-signin': true,
    cyberark: true,
    'cyberark-epm': true,
    'cyberark-alero': true,
    'cyberark-conjur': true,
    'cyberark-dpa': true,
    'cyberark-identity': true,
    saviynt: true,
    'saviynt-certifications': true,
    'saviynt-analytics': true,
    'saviynt-controls': true,
    'saviynt-requests': true,
    'saviynt-provisioning': true,
    'saviynt-tpag': true,
    'saviynt-tpag-vendors': true,
    'saviynt-tpag-contracts': true,
    'saviynt-tpag-access': true,
    'saviynt-tpag-risk': true,
    'saviynt-tpag-lifecycle': true,
  },
  ui: {
    currentRole: null,
    originalRole: null,
    settingsOpen: false,
    educateOpen: false,
    snowOpen: false,
  },
};

/**
 * Reducer function: pure function to compute next state from current state + action
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        auth: {
          token: action.payload.token,
          role: action.payload.role,
          email: action.payload.email,
          isLoading: false,
        },
        ui: {
          ...state.ui,
          currentRole: action.payload.role,
          originalRole: action.payload.role,
        },
      };

    case 'LOGOUT':
      return {
        ...state,
        auth: {
          token: null,
          role: null,
          email: null,
          isLoading: false,
        },
        userToggles: initialState.userToggles, // Reset to defaults
        ui: {
          ...state.ui,
          currentRole: null,
          originalRole: null,
        },
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'TOGGLE_SYSTEM': {
      const updated = {
        ...state.userToggles,
        [action.payload.system]: action.payload.enabled,
      };
      return {
        ...state,
        userToggles: updated,
      };
    }

    case 'RESET_TOGGLES':
      return {
        ...state,
        userToggles: initialState.userToggles,
      };

    case 'TOGGLE_ROLE': {
      const { currentRole, originalRole } = state.ui;
      
      // If no current role, do nothing
      if (!currentRole) return state;
      
      let newRole: string;
      
      // For specialized ops modes (sso_ops, pam_ops, iga_ops, tpag_ops)
      // Toggle between specialized mode ↔ general ops
      if (originalRole && originalRole !== 'ops' && isOpsRole(originalRole)) {
        // If currently in general ops, switch back to specialized mode
        if (currentRole === 'ops') {
          newRole = originalRole;
        } else {
          // If in specialized mode, switch to general ops
          newRole = 'ops';
        }
      } else {
        // For regular ops users: toggle between ops ↔ employee
        newRole = currentRole === 'ops' ? 'employee' : 'ops';
      }
      
      return {
        ...state,
        ui: {
          ...state.ui,
          currentRole: newRole,
        },
      };
    }

    case 'SET_ROLE':
      return {
        ...state,
        ui: {
          ...state.ui,
          currentRole: action.payload,
        },
      };

    case 'SET_UI_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'INIT_STATE':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

/**
 * Context type
 */
interface AppContextType {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

/**
 * Create context
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppProvider component
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    // Initialize function: restore state from localStorage
    try {
      const savedAuth = StorageService.getAuth();
      const savedTheme = StorageService.getTheme();
      const savedToggles = StorageService.getSystemToggles();

      return {
        ...initial,
        auth: savedAuth.token
          ? { ...savedAuth, isLoading: false }
          : initial.auth,
        theme: (savedTheme as 'light' | 'dark' | 'navy') || initial.theme,
        userToggles: {
          ...initial.userToggles,
          ...savedToggles,
        },
      };
    } catch {
      return initial;
    }
  });

  // Persist state changes to localStorage
  useEffect(() => {
    if (state.auth.token && state.auth.role && state.auth.email) {
      StorageService.saveAuth(state.auth.token, state.auth.role, state.auth.email);
    }
  }, [state.auth]);

  useEffect(() => {
    StorageService.setTheme(state.theme);
  }, [state.theme]);

  useEffect(() => {
    StorageService.setSystemToggles(state.userToggles);
  }, [state.userToggles]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to access app context
 * @throws Error if used outside AppProvider
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}