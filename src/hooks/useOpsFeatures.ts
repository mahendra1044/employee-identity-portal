/**
 * useOpsFeatures Hook
 * 
 * Manages all operations (ops) role-specific features including:
 * - Recent failures loading from systems based on role (config-driven)
 * - Time range filtering for failure analysis (default: 10 minutes)
 * - Quick action tabs configuration and state
 * - Auto-loading failures on ops login
 * 
 * @hook
 * @param {string | null} role - Current user role
 * @param {string | null} token - Authentication token for API requests
 * @param {any} features - Application features configuration
 * @param {Record<SystemKey, boolean>} enabled - Enabled systems map
 * @returns {UseOpsFeaturesResult} Object with minutes, failures, loading state, and action methods
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/constants";
import { OPS_CONFIG } from "@/lib/ui-config";
import { isOpsRole } from "@/lib/role-utils";
import type { SystemKey } from "@/lib/types";
import {
  type FailureKey,
  type FailureData,
  type FailureTypeConfig,
  FAILURE_TEST_DATA,
  createEmptyFailuresState,
  getFailureTypesForRole,
} from "@/lib/failures-config";

/** Result type for the useOpsFeatures hook */
export interface UseOpsFeaturesResult {
  isOps: boolean;
  minutes: number;
  setMinutes: (minutes: number) => void;
  /** Consolidated failures object - access by key: failures.fed, failures.mfa, etc. */
  failures: Record<FailureKey, FailureData[]>;
  loading: boolean;
  error: string | undefined;
  qaEnabledTabs: Record<SystemKey, boolean>;
  loadFailures: () => Promise<void>;
}

/**
 * Hook for managing ops-specific features
 * Handles: recent failures (config-driven), minutes filter, quick action tabs
 * 
 * @param role - Current user role
 * @param token - Authentication token
 * @param features - Application features config
 * @param enabled - System enable/disable status
 */
export function useOpsFeatures(
  role: string | null,
  token: string | null,
  features: any,
  enabled: Record<SystemKey, boolean>
): UseOpsFeaturesResult {
  const isOps = isOpsRole(role);
  const [minutes, setMinutes] = useState<number>(OPS_CONFIG.DEFAULT_TIME_RANGE);
  
  // Consolidated failures state - single state object instead of 10 separate states
  const [failures, setFailures] = useState<Record<FailureKey, FailureData[]>>(createEmptyFailuresState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Quick actions enabled tabs (merge system enabled with feature-specific config)
  const qaEnabledTabs = useMemo(() => ({
    ...enabled,
    ...(features?.quickActionsTabs || {}),
  }), [enabled, features]);

  // Get failure types to load based on current role
  const failureTypesToLoad = useMemo(() => getFailureTypesForRole(role), [role]);

  // Load recent failures for ops role (config-driven)
  const loadFailures = useCallback(async () => {
    if (!isOps || !token || failureTypesToLoad.length === 0) return;

    setLoading(true);
    setError(undefined);

    try {
      const now = Date.now();
      const mkTs = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();

      // Build fetch promises from config
      const fetchPromises = failureTypesToLoad.map((config: FailureTypeConfig) =>
        fetch(`${API_BASE}/api/ops-failures?system=${config.apiSystem}&minutes=${minutes}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      const responses = await Promise.all(fetchPromises);
      const dataPromises = responses.map(r => r.json().catch(() => ({ data: [] })));
      const allData = await Promise.all(dataPromises);

      // Process responses and build new failures state
      const newFailures = createEmptyFailuresState();

      // Group failure types by category to check if both are empty (for test data)
      const categoryDataMap = new Map<string, { configs: FailureTypeConfig[]; data: any[] }>();
      
      failureTypesToLoad.forEach((config, index) => {
        const category = config.category;
        if (!categoryDataMap.has(category)) {
          categoryDataMap.set(category, { configs: [], data: [] });
        }
        const entry = categoryDataMap.get(category)!;
        entry.configs.push(config);
        entry.data.push(allData[index]);
      });

      // Process each category
      categoryDataMap.forEach(({ configs, data }) => {
        // Check if all data in category is empty
        const allEmpty = data.every(d => !Array.isArray(d?.data) || d.data.length === 0);
        
        configs.forEach((config, idx) => {
          let failureData = Array.isArray(data[idx]?.data) ? data[idx].data : [];
          
          // Use test data if backend has none for this category
          if (allEmpty && FAILURE_TEST_DATA[config.key]) {
            failureData = FAILURE_TEST_DATA[config.key](mkTs);
          }
          
          newFailures[config.key] = failureData;
        });
      });

      setFailures(newFailures);

      // Check if any responses failed
      const anyFailed = responses.some(r => !r.ok);
      if (anyFailed) {
        setError("Some failure feeds not available (backend may not implement /api/ops-failures)");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load failures");
      setFailures(createEmptyFailuresState());
    } finally {
      setLoading(false);
    }
  }, [isOps, token, minutes, failureTypesToLoad]);

  // Auto-load failures when ops role logs in
  useEffect(() => {
    if (isOps && OPS_CONFIG.AUTO_LOAD_ON_LOGIN) {
      loadFailures();
    }
  }, [isOps, loadFailures]);

  // Clear failure states when role changes to prevent stale data
  useEffect(() => {
    setFailures(createEmptyFailuresState());
    setError(undefined);
  }, [role]);

  return {
    isOps,
    minutes,
    setMinutes,
    failures,
    loading,
    error,
    qaEnabledTabs,
    loadFailures,
  };
}

export default useOpsFeatures;