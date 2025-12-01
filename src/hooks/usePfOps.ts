/**
 * usePfOps Hook (Backward Compatibility Wrapper)
 * ===============================================
 * 
 * This file exists for backward compatibility.
 * New code should use useOpsActions instead.
 * 
 * @deprecated Use useOpsActions from @/hooks/useOpsActions instead
 */

"use client";

import { useOpsActions, type ActionHandlers, type UseOpsActionsReturn } from "./useOpsActions";
import type { PfOpsResponse, SystemKey } from "@/lib/types";
import type { EndpointAction } from "@/lib/ops-endpoints";

// Re-export types
export type { ActionHandlers };

// Legacy interface for backward compatibility
export interface UsePfOpsReturn {
  pfOpsOpen: boolean;
  setPfOpsOpen: (open: boolean) => void;
  pfOpsTitle: string;
  pfOpsLoading: boolean;
  pfOpsData: PfOpsResponse;
  qaActive: string;
  setQaActive: (system: string) => void;
  loadEndpoint: (url: string, title: string) => Promise<void>;
  actionHandlers: ActionHandlers;
  getActionsForSystem: (system: SystemKey) => EndpointAction[];
}

/**
 * @deprecated Use useOpsActions instead
 */
export function usePfOps(): UsePfOpsReturn {
  const ops = useOpsActions();
  
  // Map new names to old names for backward compatibility
  return {
    pfOpsOpen: ops.dialogOpen,
    setPfOpsOpen: ops.setDialogOpen,
    pfOpsTitle: ops.dialogTitle,
    pfOpsLoading: ops.dialogLoading,
    pfOpsData: ops.dialogData,
    qaActive: ops.activeTab,
    setQaActive: ops.setActiveTab,
    loadEndpoint: ops.loadEndpoint,
    actionHandlers: ops.actionHandlers,
    getActionsForSystem: ops.getActionsForSystem,
  };
}

export default usePfOps;
