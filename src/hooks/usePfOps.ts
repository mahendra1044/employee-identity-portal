"use client";

import { useCallback, useState } from "react";

export function usePfOps() {
  const [pfOpsOpen, setPfOpsOpen] = useState(false);
  const [pfOpsTitle, setPfOpsTitle] = useState<string>("");
  const [pfOpsLoading, setPfOpsLoading] = useState(false);
  const [pfOpsData, setPfOpsData] = useState<any>(null);
  const [qaActive, setQaActive] = useState<string>("ping-federate");

  // Generic loader wrapper
  const loadEndpoint = useCallback(async (url: string, title: string) => {
    setPfOpsTitle(title);
    setPfOpsOpen(true);
    setPfOpsLoading(true);
    try {
      const res = await fetch(url);
      const j = await res.json().catch(() => ({}));
      setPfOpsData(j?.data ?? j);
    } catch (e: any) {
      setPfOpsData({ error: `Failed to load ${title}` });
    } finally {
      setPfOpsLoading(false);
    }
  }, []);

  // Ping Federate endpoints
  const loadPfUserInfo = useCallback(async () => {
    await loadEndpoint("/api/pf/userinfo", "Ping Federate — User Info");
  }, [loadEndpoint]);

  const loadPfOidc = useCallback(async () => {
    await loadEndpoint("/api/pf/oidc", "Ping Federate — OIDC Connections");
  }, [loadEndpoint]);

  const loadPfConnections = useCallback(async () => {
    await loadEndpoint("/api/pf/connections", "Ping Federate — Connections");
  }, [loadEndpoint]);

  // Azure AD endpoints
  const loadAadGroups = useCallback(async () => {
    await loadEndpoint("/api/aad/groups", "Azure AD — Groups");
  }, [loadEndpoint]);

  const loadAadSignins = useCallback(async () => {
    await loadEndpoint("/api/aad/signins", "Azure AD — Sign-ins");
  }, [loadEndpoint]);

  // CyberArk endpoints
  const loadCyberarkAccounts = useCallback(async () => {
    await loadEndpoint("/api/cyberark/accounts", "CyberArk — Accounts");
  }, [loadEndpoint]);

  const loadCyberarkActivity = useCallback(async () => {
    await loadEndpoint("/api/cyberark/activity", "CyberArk — Activity");
  }, [loadEndpoint]);

  const loadCyberarkSafes = useCallback(async () => {
    await loadEndpoint("/api/cyberark/safes", "CyberArk — Safes");
  }, [loadEndpoint]);

  // Ping Directory endpoints
  const loadPdProfile = useCallback(async () => {
    await loadEndpoint("/api/pd/profile", "Ping Directory — Profile");
  }, [loadEndpoint]);

  const loadPdGroups = useCallback(async () => {
    await loadEndpoint("/api/pd/groups", "Ping Directory — Groups");
  }, [loadEndpoint]);

  const loadPdAudit = useCallback(async () => {
    await loadEndpoint("/api/pd/audit", "Ping Directory — Audit");
  }, [loadEndpoint]);

  // Ping MFA endpoints
  const loadMfaStatus = useCallback(async () => {
    await loadEndpoint("/api/mfa/status", "Ping MFA — Status");
  }, [loadEndpoint]);

  const loadMfaDevices = useCallback(async () => {
    await loadEndpoint("/api/mfa/devices", "Ping MFA — Devices");
  }, [loadEndpoint]);

  const loadMfaEvents = useCallback(async () => {
    await loadEndpoint("/api/mfa/events", "Ping MFA — Events");
  }, [loadEndpoint]);

  // Azure AD User endpoint
  const loadAadUser = useCallback(async () => {
    await loadEndpoint("/api/aad/user", "Azure AD — User");
  }, [loadEndpoint]);

  // Saviynt endpoints
  const loadSaviynt = useCallback(async () => {
    await loadEndpoint("/api/saviynt/requests", "Saviynt — Requests");
  }, [loadEndpoint]);

  const loadSaviyhtRoles = useCallback(async () => {
    await loadEndpoint("/api/saviynt/roles", "Saviynt — Roles");
  }, [loadEndpoint]);

  const loadSaviyhtEntitlements = useCallback(async () => {
    await loadEndpoint("/api/saviynt/entitlements", "Saviynt — Entitlements");
  }, [loadEndpoint]);

  return {
    pfOpsOpen,
    setPfOpsOpen,
    pfOpsTitle,
    pfOpsLoading,
    pfOpsData,
    qaActive,
    setQaActive,
    loadPfUserInfo,
    loadPfOidc,
    loadPfConnections,
    loadAadGroups,
    loadAadSignins,
    loadAadUser,
    loadCyberarkAccounts,
    loadCyberarkActivity,
    loadCyberarkSafes,
    loadPdProfile,
    loadPdGroups,
    loadPdAudit,
    loadMfaStatus,
    loadMfaDevices,
    loadMfaEvents,
    loadSaviynt,
    loadSaviyhtRoles,
    loadSaviyhtEntitlements,
  };
}

export default usePfOps;
