/**
 * useOpsActions Hook
 * ==================
 * 
 * Manages Quick Actions for operations team.
 * Uses configuration-driven approach - all endpoints defined in ops-endpoints.ts
 * 
 * HOW IT WORKS:
 * 1. All endpoints are defined in @/lib/ops-endpoints.ts
 * 2. This hook generates handlers automatically from that config
 * 3. UI components use actionHandlers[actionKey]() to trigger actions
 * 
 * TO ADD A NEW ACTION:
 * 1. Add endpoint to OPS_ENDPOINTS in @/lib/ops-endpoints.ts
 * 2. That's it! The handler is auto-generated
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import { UI_DEFAULTS } from "@/config";
import { OPS_ENDPOINTS, type EndpointAction } from "@/lib/ops-endpoints";
import type { PfOpsResponse, SystemKey } from "@/lib/types";

// Type for action handlers - simple map of function names to async functions
export type ActionHandlers = Record<string, () => Promise<void>>;

export interface UseOpsActionsReturn {
  // Dialog state
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  dialogTitle: string;
  dialogLoading: boolean;
  dialogData: PfOpsResponse;
  
  // Active tab in Quick Actions
  activeTab: string;
  setActiveTab: (system: string) => void;
  
  // All action handlers (auto-generated from config)
  actionHandlers: ActionHandlers;
  
  // Helper to get actions for a specific system
  getActionsForSystem: (system: SystemKey) => EndpointAction[];
  
  // Generic loader (for custom actions not in config)
  loadEndpoint: (url: string, title: string) => Promise<void>;
}

/**
 * Hook for managing ops quick actions
 */
export function useOpsActions(): UseOpsActionsReturn {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogData, setDialogData] = useState<PfOpsResponse>(null);
  
  // Active tab - uses default from config
  const [activeTab, setActiveTab] = useState<string>(UI_DEFAULTS.quickActionsDefaultTab);

  /**
   * Generic endpoint loader
   * Opens dialog, shows loading state, fetches data
   */
  const loadEndpoint = useCallback(async (url: string, title: string) => {
    setDialogTitle(title);
    setDialogOpen(true);
    setDialogLoading(true);
    
    try {
      const res = await fetch(url);
      
      if (!res.ok) {
        setDialogData({ error: `Failed to load: HTTP ${res.status}` });
        return;
      }
      
      const json = await res.json();
      setDialogData(json?.data ?? json);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setDialogData({ error: `Failed to load: ${message}` });
    } finally {
      setDialogLoading(false);
    }
  }, []);

  /**
   * Auto-generate action handlers from config
   * Each action in OPS_ENDPOINTS becomes a callable handler
   */
  const actionHandlers = useMemo<ActionHandlers>(() => {
    const handlers: ActionHandlers = {};
    
    // Loop through all systems and their actions
    OPS_ENDPOINTS.forEach(systemConfig => {
      systemConfig.actions.forEach(action => {
        // Create a handler for each action
        handlers[action.key] = async () => {
          await loadEndpoint(action.url, action.title);
        };
      });
    });
    
    return handlers;
  }, [loadEndpoint]);

  /**
   * Get all actions available for a system
   */
  const getActionsForSystem = useCallback((system: SystemKey): EndpointAction[] => {
    const config = OPS_ENDPOINTS.find(e => e.system === system);
    return config?.actions || [];
  }, []);

  return {
    // Dialog state
    dialogOpen,
    setDialogOpen,
    dialogTitle,
    dialogLoading,
    dialogData,
    
    // Tab state
    activeTab,
    setActiveTab,
    
    // Action handlers
    actionHandlers,
    getActionsForSystem,
    loadEndpoint,
  };
}

// Also export with old name for backward compatibility
export { useOpsActions as usePfOps };
export default useOpsActions;
