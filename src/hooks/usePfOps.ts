"use client";

import { useCallback, useState } from "react";
import type { PfOpsResponse } from "@/lib/types";

export function usePfOps() {
  const [pfOpsOpen, setPfOpsOpen] = useState(false);
  const [pfOpsTitle, setPfOpsTitle] = useState<string>("");
  const [pfOpsLoading, setPfOpsLoading] = useState(false);
  const [pfOpsData, setPfOpsData] = useState<PfOpsResponse>(null);
  const [qaActive, setQaActive] = useState<string>("ping-federate");

  // Generic loader wrapper
  const loadEndpoint = useCallback(async (url: string, title: string) => {
    setPfOpsTitle(title);
    setPfOpsOpen(true);
    setPfOpsLoading(true);
    try {
      const res = await fetch(url);
      
      // Check status BEFORE parsing JSON to avoid HTML error responses
      if (!res.ok) {
        const errorMsg = await res.text().catch(() => `HTTP ${res.status}`);
        console.error(`❌ Failed to load ${title}: ${res.status} ${res.statusText}`);
        setPfOpsData({ error: `Failed to load ${title}: ${res.status} ${res.statusText}` });
        return;
      }
      
      const j = await res.json();
      setPfOpsData(j?.data ?? j);
      console.log(`✅ Loaded ${title}:`, j);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to load ${title}:`, message);
      setPfOpsData({ error: `Failed to load ${title}: ${message}` });
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

  // CyberArk PAM endpoints
  const loadCyberarkAccounts = useCallback(async () => {
    await loadEndpoint("/api/cyberark/accounts", "CyberArk PAM — Accounts");
  }, [loadEndpoint]);

  const loadCyberarkActivity = useCallback(async () => {
    await loadEndpoint("/api/cyberark/activity", "CyberArk PAM — Activity");
  }, [loadEndpoint]);

  const loadCyberarkSafes = useCallback(async () => {
    await loadEndpoint("/api/cyberark/safes", "CyberArk PAM — Safes");
  }, [loadEndpoint]);

  // CyberArk EPM endpoints
  const loadCyberarkEpmPolicies = useCallback(async () => {
    await loadEndpoint("/api/cyberark-epm/policies", "CyberArk EPM — Policies");
  }, [loadEndpoint]);

  const loadCyberarkEpmApplications = useCallback(async () => {
    await loadEndpoint("/api/cyberark-epm/applications", "CyberArk EPM — Applications");
  }, [loadEndpoint]);

  const loadCyberarkEpmElevations = useCallback(async () => {
    await loadEndpoint("/api/cyberark-epm/elevation-history", "CyberArk EPM — Elevation History");
  }, [loadEndpoint]);

  // CyberArk Alero endpoints
  const loadCyberarkAleroSessions = useCallback(async () => {
    await loadEndpoint("/api/cyberark-alero/sessions", "CyberArk Alero — Sessions");
  }, [loadEndpoint]);

  const loadCyberarkAleroTargets = useCallback(async () => {
    await loadEndpoint("/api/cyberark-alero/targets", "CyberArk Alero — Targets");
  }, [loadEndpoint]);

  const loadCyberarkAleroRecordings = useCallback(async () => {
    await loadEndpoint("/api/cyberark-alero/recordings", "CyberArk Alero — Recordings");
  }, [loadEndpoint]);

  // CyberArk Conjur endpoints
  const loadCyberarkConjurSecrets = useCallback(async () => {
    await loadEndpoint("/api/cyberark-conjur/secrets", "CyberArk Conjur — Secrets");
  }, [loadEndpoint]);

  const loadCyberarkConjurVaults = useCallback(async () => {
    await loadEndpoint("/api/cyberark-conjur/vaults", "CyberArk Conjur — Vaults");
  }, [loadEndpoint]);

  const loadCyberarkConjurRotation = useCallback(async () => {
    await loadEndpoint("/api/cyberark-conjur/rotation", "CyberArk Conjur — Rotation Schedule");
  }, [loadEndpoint]);

  // CyberArk DPA endpoints
  const loadCyberarkDpaAuthorizations = useCallback(async () => {
    await loadEndpoint("/api/cyberark-dpa/authorizations", "CyberArk DPA — Authorizations");
  }, [loadEndpoint]);

  const loadCyberarkDpaRiskAssessment = useCallback(async () => {
    await loadEndpoint("/api/cyberark-dpa/risk-assessment", "CyberArk DPA — Risk Assessment");
  }, [loadEndpoint]);

  const loadCyberarkDpaPolicies = useCallback(async () => {
    await loadEndpoint("/api/cyberark-dpa/policies", "CyberArk DPA — Policies");
  }, [loadEndpoint]);

  // CyberArk Identity endpoints
  const loadCyberarkIdentityDevices = useCallback(async () => {
    await loadEndpoint("/api/cyberark-identity/devices", "CyberArk Identity — Devices");
  }, [loadEndpoint]);

  const loadCyberarkIdentitySsoApps = useCallback(async () => {
    await loadEndpoint("/api/cyberark-identity/sso-apps", "CyberArk Identity — SSO Applications");
  }, [loadEndpoint]);

  const loadCyberarkIdentityLoginHistory = useCallback(async () => {
    await loadEndpoint("/api/cyberark-identity/login-history", "CyberArk Identity — Login History");
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

  const loadSaviynt_Roles = useCallback(async () => {
    await loadEndpoint("/api/saviynt/roles", "Saviynt — Roles");
  }, [loadEndpoint]);

  const loadSaviynt_Entitlements = useCallback(async () => {
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
    loadCyberarkEpmPolicies,
    loadCyberarkEpmApplications,
    loadCyberarkEpmElevations,
    loadCyberarkAleroSessions,
    loadCyberarkAleroTargets,
    loadCyberarkAleroRecordings,
    loadCyberarkConjurSecrets,
    loadCyberarkConjurVaults,
    loadCyberarkConjurRotation,
    loadCyberarkDpaAuthorizations,
    loadCyberarkDpaRiskAssessment,
    loadCyberarkDpaPolicies,
    loadCyberarkIdentityDevices,
    loadCyberarkIdentitySsoApps,
    loadCyberarkIdentityLoginHistory,
    loadPdProfile,
    loadPdGroups,
    loadPdAudit,
    loadMfaStatus,
    loadMfaDevices,
    loadMfaEvents,
    loadSaviynt,
    loadSaviynt_Roles,
    loadSaviynt_Entitlements,
  };
}

export default usePfOps;