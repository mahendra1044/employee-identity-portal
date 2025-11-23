/**
 * useOpsFeatures Hook
 * 
 * Manages all operations (ops) role-specific features including:
 * - Recent failures loading from ping-federate and ping-mfa systems
 * - Time range filtering for failure analysis (default: 10 minutes)
 * - Quick action tabs configuration and state
 * - Auto-loading failures on ops login
 * 
 * @hook
 * @param {string | null} role - Current user role
 * @param {string | null} token - Authentication token for API requests
 * @param {any} features - Application features configuration
 * @param {Record<SystemKey, boolean>} enabled - Enabled systems map
 * @returns {UseOpsFeuresResult} Object with minutes, failures, loading state, and action methods
 * 
 * @example
 * const { minutes, setMinutes, failFed, failMfa, loading, error, loadFailures } = useOpsFeatures(role, token, features, enabled);
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/constants";
import { OPS_CONFIG } from "@/lib/ui-config";
import type { SystemKey } from "@/lib/types";

interface FailureData {
  userId?: string;
  email?: string;
  reason?: string;
  error?: string;
  timestamp: string;
}

interface UseOpsFeuresResult {
  isOps: boolean;
  minutes: number;
  setMinutes: (minutes: number) => void;
  failFed: FailureData[];
  failMfa: FailureData[];
  loading: boolean;
  error: string | undefined;
  qaEnabledTabs: Record<SystemKey, boolean>;
  loadFailures: () => Promise<void>;
}

/**
 * Hook for managing ops-specific features
 * Handles: recent failures, minutes filter, quick action tabs
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
): UseOpsFeuresResult {
  const isOps = role === "ops";
  const [minutes, setMinutes] = useState<number>(OPS_CONFIG.DEFAULT_TIME_RANGE);
  const [failFed, setFailFed] = useState<FailureData[]>([]);
  const [failMfa, setFailMfa] = useState<FailureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Quick actions enabled tabs (merge system enabled with feature-specific config)
  const qaEnabledTabs = useMemo(() => ({
    ...enabled,
    ...(features?.quickActionsTabs || {}),
  }), [enabled, features]);

  // Load recent failures for ops role
  const loadFailures = useCallback(async () => {
    if (!isOps || !token) return;

    setLoading(true);
    setError(undefined);

    try {
      const [fedRes, mfaRes] = await Promise.all([
        fetch(`${API_BASE}/api/ops-failures?system=ping-federate&minutes=${minutes}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/ops-failures?system=ping-mfa&minutes=${minutes}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const fedData = await fedRes.json().catch(() => ({ data: [] }));
      const mfaData = await mfaRes.json().catch(() => ({ data: [] }));

      let fed = Array.isArray(fedData?.data) ? fedData.data : [];
      let mfa = Array.isArray(mfaData?.data) ? mfaData.data : [];

      // Provide test data if backend has none
      if ((!fed || fed.length === 0) && (!mfa || mfa.length === 0)) {
        const now = Date.now();
        const mkTs = (minsAgo: number) => 
          new Date(now - minsAgo * 60_000).toISOString();

        fed = [
          { userId: "u12345", reason: "Invalid credentials", timestamp: mkTs(2) },
          { email: "jane.doe@company.com", reason: "Account locked", timestamp: mkTs(5) },
          { userId: "u67890", reason: "MFA required not satisfied", timestamp: mkTs(9) },
        ];

        mfa = [
          { userId: "u12345", error: "Push timeout", timestamp: mkTs(3) },
          { email: "john.smith@company.com", error: "Device not enrolled", timestamp: mkTs(7) },
        ];
      }

      setFailFed(fed);
      setFailMfa(mfa);

      if (!fedRes.ok || !mfaRes.ok) {
        setError("Failure feeds not available (backend may not implement /api/ops-failures)");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load failures");
      setFailFed([]);
      setFailMfa([]);
    } finally {
      setLoading(false);
    }
  }, [isOps, token, minutes]);

  // Auto-load failures when ops role logs in
  useEffect(() => {
    if (isOps && OPS_CONFIG.AUTO_LOAD_ON_LOGIN) {
      loadFailures();
    }
  }, [isOps, loadFailures]);

  return {
    isOps,
    minutes,
    setMinutes,
    failFed,
    failMfa,
    loading,
    error,
    qaEnabledTabs,
    loadFailures,
  };
}

export default useOpsFeatures;
