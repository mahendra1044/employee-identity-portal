/**
 * useOpsFeatures Hook
 * 
 * Manages all operations (ops) role-specific features including:
 * - Recent failures loading from systems based on role:
 *   - SSO Ops (sso_ops): ping-federate and ping-mfa failures
 *   - PAM Ops (pam_ops): cyberark-pam and cyberark-vault failures
 *   - IGA Ops (iga_ops): saviynt access and provisioning failures
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
 * // For IGA Ops
 * const { failIgaAccess, failIgaProvisioning, ... } = useOpsFeatures(role, token, features, enabled);
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
  application?: string;
  entitlement?: string;
  certificationId?: string;
}

interface UseOpsFeuresResult {
  isOps: boolean;
  minutes: number;
  setMinutes: (minutes: number) => void;
  // SSO failures (for sso_ops and general ops)
  failFed: FailureData[];
  failMfa: FailureData[];
  // PAM failures (for pam_ops)
  failPam: FailureData[];
  failVault: FailureData[];
  // IGA failures (for iga_ops)
  failIgaAccess: FailureData[];
  failIgaProvisioning: FailureData[];
  // EntraAD failures (for entraid_ops)
  failEntraAuth: FailureData[];
  failEntraAccess: FailureData[];
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
  // IGA failure states
  const [failIgaAccess, setFailIgaAccess] = useState<FailureData[]>([]);
  const [failIgaProvisioning, setFailIgaProvisioning] = useState<FailureData[]>([]);
  // EntraAD failure states
  const [failEntraAuth, setFailEntraAuth] = useState<FailureData[]>([]);
  const [failEntraAccess, setFailEntraAccess] = useState<FailureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Quick actions enabled tabs (merge system enabled with feature-specific config)
  const qaEnabledTabs = useMemo(() => ({
    ...enabled,
    ...(features?.quickActionsTabs || {}),
  }), [enabled, features]);

  // Determine which failure types to load based on role
  // SSO failures: shown for sso_ops and base ops roles
  // PAM failures: shown only for pam_ops role
  // IGA failures: shown only for iga_ops role
  // EntraAD failures: shown only for entraid_ops role
  const shouldLoadSsoFailures = role === 'sso_ops' || role === 'ops';
  const shouldLoadPamFailures = role === 'pam_ops';
  const shouldLoadIgaFailures = role === 'iga_ops';
  const shouldLoadEntraFailures = role === 'entraid_ops';

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

      // IGA failures (for iga_ops or general ops)
      if (shouldLoadIgaFailures) {
        fetchPromises.push(
          fetch(`${API_BASE}/api/ops-failures?system=saviynt-access&minutes=${minutes}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/ops-failures?system=saviynt-provisioning&minutes=${minutes}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        fetchLabels.push('iga-access', 'iga-provisioning');
      }

      // EntraAD failures (for entraid_ops)
      if (shouldLoadEntraFailures) {
        fetchPromises.push(
          fetch(`${API_BASE}/api/ops-failures?system=azure-ad-auth&minutes=${minutes}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/ops-failures?system=azure-ad-access&minutes=${minutes}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        fetchLabels.push('entra-auth', 'entra-access');
      }

      const responses = await Promise.all(fetchPromises);
      const dataPromises = responses.map(r => r.json().catch(() => ({ data: [] })));
      const allData = await Promise.all(dataPromises);

      // Calculate indices based on which failures are being loaded
      let currentIndex = 0;

      // Process SSO failures
      if (shouldLoadSsoFailures) {
        let fed = Array.isArray(allData[currentIndex]?.data) ? allData[currentIndex].data : [];
        let mfa = Array.isArray(allData[currentIndex + 1]?.data) ? allData[currentIndex + 1].data : [];

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
        currentIndex += 2;
      } else {
        setFailFed([]);
        setFailMfa([]);
      }

      // Process PAM failures
      if (shouldLoadPamFailures) {
        let pam = Array.isArray(allData[currentIndex]?.data) ? allData[currentIndex].data : [];
        let vault = Array.isArray(allData[currentIndex + 1]?.data) ? allData[currentIndex + 1].data : [];

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
        currentIndex += 2;
      } else {
        setFailPam([]);
        setFailVault([]);
      }

      // Process IGA failures
      if (shouldLoadIgaFailures) {
        let igaAccess = Array.isArray(allData[currentIndex]?.data) ? allData[currentIndex].data : [];
        let igaProvisioning = Array.isArray(allData[currentIndex + 1]?.data) ? allData[currentIndex + 1].data : [];

        // Provide test data if backend has none (IGA)
        if ((!igaAccess || igaAccess.length === 0) && (!igaProvisioning || igaProvisioning.length === 0)) {
          igaAccess = [
            { userId: "u12345", reason: "Access certification expired", application: "SAP-PROD", timestamp: mkTs(1) },
            { email: "manager@company.com", reason: "Entitlement request denied", entitlement: "ADMIN_ROLE", timestamp: mkTs(3) },
            { userId: "u67890", reason: "Role assignment failed", application: "Salesforce", timestamp: mkTs(5) },
          ];
          igaProvisioning = [
            { userId: "u12345", error: "Provisioning timeout", application: "ServiceNow", timestamp: mkTs(2) },
            { email: "newuser@company.com", error: "Account creation failed", system: "saviynt-provisioning", timestamp: mkTs(4) },
            { userId: "u99999", error: "Deprovisioning incomplete", application: "Workday", timestamp: mkTs(7) },
          ];
        }
        setFailIgaAccess(igaAccess);
        setFailIgaProvisioning(igaProvisioning);
        currentIndex += 2;
      } else {
        setFailIgaAccess([]);
        setFailIgaProvisioning([]);
      }

      // Process EntraAD failures
      if (shouldLoadEntraFailures) {
        let entraAuth = Array.isArray(allData[currentIndex]?.data) ? allData[currentIndex].data : [];
        let entraAccess = Array.isArray(allData[currentIndex + 1]?.data) ? allData[currentIndex + 1].data : [];

        // Provide test data if backend has none (EntraAD)
        if ((!entraAuth || entraAuth.length === 0) && (!entraAccess || entraAccess.length === 0)) {
          entraAuth = [
            { userId: "u12345", reason: "Sign-in blocked by Conditional Access", application: "Microsoft 365", timestamp: mkTs(1) },
            { email: "user@company.com", reason: "MFA challenge failed", application: "Azure Portal", timestamp: mkTs(3) },
            { userId: "u67890", reason: "Password expired", application: "SharePoint Online", timestamp: mkTs(5) },
          ];
          entraAccess = [
            { userId: "u12345", error: "Group membership sync failed", system: "azure-ad-groups", timestamp: mkTs(2) },
            { email: "admin@company.com", error: "App consent required", application: "Power BI", timestamp: mkTs(4) },
            { userId: "u99999", error: "License assignment failed", system: "azure-ad-users", timestamp: mkTs(7) },
          ];
        }
        setFailEntraAuth(entraAuth);
        setFailEntraAccess(entraAccess);
      } else {
        setFailEntraAuth([]);
        setFailEntraAccess([]);
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
      setFailIgaAccess([]);
      setFailIgaProvisioning([]);
      setFailEntraAuth([]);
      setFailEntraAccess([]);
    } finally {
      setLoading(false);
    }
  }, [isOps, token, minutes, shouldLoadSsoFailures, shouldLoadPamFailures, shouldLoadIgaFailures, shouldLoadEntraFailures]);

  // Auto-load failures when ops role logs in
  useEffect(() => {
    if (isOps && OPS_CONFIG.AUTO_LOAD_ON_LOGIN) {
      loadFailures();
    }
  }, [isOps, loadFailures]);

  // Clear failure states when role changes to prevent stale data
  useEffect(() => {
    // Reset all failure states when role changes
    setFailFed([]);
    setFailMfa([]);
    setFailPam([]);
    setFailVault([]);
    setFailIgaAccess([]);
    setFailIgaProvisioning([]);
    setFailEntraAuth([]);
    setFailEntraAccess([]);
    setError(undefined);
  }, [role]);

  return {
    isOps,
    minutes,
    setMinutes,
    failFed,
    failMfa,
    failPam,
    failVault,
    failIgaAccess,
    failIgaProvisioning,
    failEntraAuth,
    failEntraAccess,
    loading,
    error,
    qaEnabledTabs,
    loadFailures,
  };
}

export default useOpsFeatures;