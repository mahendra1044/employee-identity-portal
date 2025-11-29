/**
 * useOpsFeatures Hook
 * 
 * Manages all operations (ops) role-specific features including:
 * - Recent failures loading from systems based on role:
 *   - SSO Ops (sso_ops): ping-federate and ping-mfa failures
 *   - PAM Ops (pam_ops): cyberark-pam and cyberark-vault failures
 *   - General Ops (ops): All failures
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
 * // For SSO Ops
 * const { failFed, failMfa, ... } = useOpsFeatures(role, token, features, enabled);
 * // For PAM Ops
 * const { failPam, failVault, ... } = useOpsFeatures(role, token, features, enabled);
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/constants";
import { OPS_CONFIG } from "@/lib/ui-config";
import { isOpsRole } from "@/lib/role-utils";
import type { SystemKey } from "@/lib/types";

interface FailureData {
  userId?: string;
  email?: string;
  reason?: string;
  error?: string;
  timestamp: string;
  system?: string;
  safe?: string;
  account?: string;
}

interface UseOpsFeuresResult {
  isOps: boolean;
  minutes: number;
  setMinutes: (minutes: number) => void;
  // SSO failures (for sso_ops and general ops)
  failFed: FailureData[];
  failMfa: FailureData[];
  // PAM failures (for pam_ops and general ops)
  failPam: FailureData[];
  failVault: FailureData[];
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
  const isOps = isOpsRole(role);
  const [minutes, setMinutes] = useState<number>(OPS_CONFIG.DEFAULT_TIME_RANGE);
  // SSO failure states
  const [failFed, setFailFed] = useState<FailureData[]>([]);
  const [failMfa, setFailMfa] = useState<FailureData[]>([]);
  // PAM failure states
  const [failPam, setFailPam] = useState<FailureData[]>([]);
  const [failVault, setFailVault] = useState<FailureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Quick actions enabled tabs (merge system enabled with feature-specific config)
  const qaEnabledTabs = useMemo(() => ({
    ...enabled,
    ...(features?.quickActionsTabs || {}),
  }), [enabled, features]);

  // Determine which failure types to load based on role
  const shouldLoadSsoFailures = role === 'sso_ops' || role === 'ops';
  const shouldLoadPamFailures = role === 'pam_ops' || role === 'ops';

  // Load recent failures for ops role (role-aware)
  const loadFailures = useCallback(async () => {
    if (!isOps || !token) return;

    setLoading(true);
    setError(undefined);

    try {
      const now = Date.now();
      const mkTs = (minsAgo: number) => 
        new Date(now - minsAgo * 60_000).toISOString();

      // Build fetch promises based on role
      const fetchPromises: Promise<Response>[] = [];
      const fetchLabels: string[] = [];

      // SSO failures (for sso_ops or general ops)
      if (shouldLoadSsoFailures) {
        fetchPromises.push(
          fetch(`${API_BASE}/api/ops-failures?system=ping-federate&minutes=${minutes}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/ops-failures?system=ping-mfa&minutes=${minutes}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        fetchLabels.push('fed', 'mfa');
      }

      // PAM failures (for pam_ops or general ops)
      if (shouldLoadPamFailures) {
        fetchPromises.push(
          fetch(`${API_BASE}/api/ops-failures?system=cyberark-pam&minutes=${minutes}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/ops-failures?system=cyberark-vault&minutes=${minutes}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        fetchLabels.push('pam', 'vault');
      }

      const responses = await Promise.all(fetchPromises);
      const dataPromises = responses.map(r => r.json().catch(() => ({ data: [] })));
      const allData = await Promise.all(dataPromises);

      // Process SSO failures
      if (shouldLoadSsoFailures) {
        let fed = Array.isArray(allData[0]?.data) ? allData[0].data : [];
        let mfa = Array.isArray(allData[1]?.data) ? allData[1].data : [];

        // Provide test data if backend has none (SSO)
        if ((!fed || fed.length === 0) && (!mfa || mfa.length === 0)) {
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
      } else {
        setFailFed([]);
        setFailMfa([]);
      }

      // Process PAM failures
      if (shouldLoadPamFailures) {
        const pamIndex = shouldLoadSsoFailures ? 2 : 0;
        const vaultIndex = shouldLoadSsoFailures ? 3 : 1;
        
        let pam = Array.isArray(allData[pamIndex]?.data) ? allData[pamIndex].data : [];
        let vault = Array.isArray(allData[vaultIndex]?.data) ? allData[vaultIndex].data : [];

        // Provide test data if backend has none (PAM)
        if ((!pam || pam.length === 0) && (!vault || vault.length === 0)) {
          pam = [
            { userId: "u12345", reason: "Session timeout", safe: "CORP-PROD", timestamp: mkTs(1) },
            { email: "admin@company.com", reason: "Access denied to safe", safe: "IT-ADMIN", timestamp: mkTs(4) },
            { userId: "u67890", reason: "Credential checkout failed", account: "svc_app01", timestamp: mkTs(6) },
          ];
          vault = [
            { userId: "u12345", error: "Vault sync failed", system: "cyberark-conjur", timestamp: mkTs(2) },
            { email: "devops@company.com", error: "Secret rotation failed", system: "cyberark-conjur", timestamp: mkTs(5) },
            { userId: "u99999", error: "DPA authorization expired", system: "cyberark-dpa", timestamp: mkTs(8) },
          ];
        }
        setFailPam(pam);
        setFailVault(vault);
      } else {
        setFailPam([]);
        setFailVault([]);
      }

      // Check if any responses failed
      const anyFailed = responses.some(r => !r.ok);
      if (anyFailed) {
        setError("Some failure feeds not available (backend may not implement /api/ops-failures)");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load failures");
      setFailFed([]);
      setFailMfa([]);
      setFailPam([]);
      setFailVault([]);
    } finally {
      setLoading(false);
    }
  }, [isOps, token, minutes, shouldLoadSsoFailures, shouldLoadPamFailures]);

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
    failPam,
    failVault,
    loading,
    error,
    qaEnabledTabs,
    loadFailures,
  };
}

export default useOpsFeatures;