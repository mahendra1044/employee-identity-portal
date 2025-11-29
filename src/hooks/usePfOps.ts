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
    await loadEndpoint("/api/saviynt/requests", "Saviynt IGA — Requests");
  }, [loadEndpoint]);

  const loadSaviynt_Roles = useCallback(async () => {
    await loadEndpoint("/api/saviynt/roles", "Saviynt IGA — Roles");
  }, [loadEndpoint]);

  const loadSaviynt_Entitlements = useCallback(async () => {
    await loadEndpoint("/api/saviynt/entitlements", "Saviynt IGA — Entitlements");
  }, [loadEndpoint]);

  // Saviynt Certifications endpoints
  const loadSaviyntCertificationsCampaigns = useCallback(async () => {
    await loadEndpoint("/api/saviynt-certifications/campaigns", "Saviynt Certifications — Campaigns");
  }, [loadEndpoint]);

  const loadSaviyntCertificationsPending = useCallback(async () => {
    await loadEndpoint("/api/saviynt-certifications/pending", "Saviynt Certifications — Pending Reviews");
  }, [loadEndpoint]);

  const loadSaviyntCertificationsHistory = useCallback(async () => {
    await loadEndpoint("/api/saviynt-certifications/history", "Saviynt Certifications — History");
  }, [loadEndpoint]);

  // Saviynt Analytics endpoints
  const loadSaviyntAnalyticsDashboard = useCallback(async () => {
    await loadEndpoint("/api/saviynt-analytics/dashboard", "Saviynt Analytics — Dashboard");
  }, [loadEndpoint]);

  const loadSaviyntAnalyticsRiskScores = useCallback(async () => {
    await loadEndpoint("/api/saviynt-analytics/risk-scores", "Saviynt Analytics — Risk Scores");
  }, [loadEndpoint]);

  const loadSaviyntAnalyticsAnomalies = useCallback(async () => {
    await loadEndpoint("/api/saviynt-analytics/anomalies", "Saviynt Analytics — Anomalies");
  }, [loadEndpoint]);

  // Saviynt Controls endpoints
  const loadSaviyntControlsSod = useCallback(async () => {
    await loadEndpoint("/api/saviynt-controls/sod", "Saviynt Controls — SoD Violations");
  }, [loadEndpoint]);

  const loadSaviyntControlsPolicies = useCallback(async () => {
    await loadEndpoint("/api/saviynt-controls/policies", "Saviynt Controls — Policies");
  }, [loadEndpoint]);

  const loadSaviyntControlsExceptions = useCallback(async () => {
    await loadEndpoint("/api/saviynt-controls/exceptions", "Saviynt Controls — Exceptions");
  }, [loadEndpoint]);

  // Saviynt Requests endpoints
  const loadSaviyntRequestsPending = useCallback(async () => {
    await loadEndpoint("/api/saviynt-requests/pending", "Saviynt Requests — Pending");
  }, [loadEndpoint]);

  const loadSaviyntRequestsApproved = useCallback(async () => {
    await loadEndpoint("/api/saviynt-requests/approved", "Saviynt Requests — Approved");
  }, [loadEndpoint]);

  const loadSaviyntRequestsRejected = useCallback(async () => {
    await loadEndpoint("/api/saviynt-requests/rejected", "Saviynt Requests — Rejected");
  }, [loadEndpoint]);

  // Saviynt Provisioning endpoints
  const loadSaviyntProvisioningTasks = useCallback(async () => {
    await loadEndpoint("/api/saviynt-provisioning/tasks", "Saviynt Provisioning — Tasks");
  }, [loadEndpoint]);

  const loadSaviyntProvisioningFailed = useCallback(async () => {
    await loadEndpoint("/api/saviynt-provisioning/failed", "Saviynt Provisioning — Failed");
  }, [loadEndpoint]);

  const loadSaviyntProvisioningQueue = useCallback(async () => {
    await loadEndpoint("/api/saviynt-provisioning/queue", "Saviynt Provisioning — Queue");
  }, [loadEndpoint]);

  // ===== EntraAD (Azure AD) Endpoints =====

  // EntraAD Users endpoints
  const loadEntraUsersAll = useCallback(async () => {
    await loadEndpoint("/api/aad/users/all", "Entra ID Users — All Users");
  }, [loadEndpoint]);

  const loadEntraUsersGuests = useCallback(async () => {
    await loadEndpoint("/api/aad/users/guests", "Entra ID Users — Guest Users");
  }, [loadEndpoint]);

  const loadEntraUsersLicenses = useCallback(async () => {
    await loadEndpoint("/api/aad/users/licenses", "Entra ID Users — License Assignments");
  }, [loadEndpoint]);

  // EntraAD Groups endpoints
  const loadEntraGroupsAll = useCallback(async () => {
    await loadEndpoint("/api/aad/groups/all", "Entra ID Groups — All Groups");
  }, [loadEndpoint]);

  const loadEntraGroupsDynamic = useCallback(async () => {
    await loadEndpoint("/api/aad/groups/dynamic", "Entra ID Groups — Dynamic Groups");
  }, [loadEndpoint]);

  const loadEntraGroupsMembership = useCallback(async () => {
    await loadEndpoint("/api/aad/groups/membership", "Entra ID Groups — Group Membership");
  }, [loadEndpoint]);

  // EntraAD Apps endpoints
  const loadEntraAppsEnterprise = useCallback(async () => {
    await loadEndpoint("/api/aad/apps/enterprise", "Entra ID Apps — Enterprise Applications");
  }, [loadEndpoint]);

  const loadEntraAppsRegistrations = useCallback(async () => {
    await loadEndpoint("/api/aad/apps/registrations", "Entra ID Apps — App Registrations");
  }, [loadEndpoint]);

  const loadEntraAppsConsent = useCallback(async () => {
    await loadEndpoint("/api/aad/apps/consent", "Entra ID Apps — Admin Consent");
  }, [loadEndpoint]);

  // EntraAD Conditional Access endpoints
  const loadEntraConditionalPolicies = useCallback(async () => {
    await loadEndpoint("/api/aad/conditional/policies", "Conditional Access — Policies");
  }, [loadEndpoint]);

  const loadEntraConditionalNamedLocations = useCallback(async () => {
    await loadEndpoint("/api/aad/conditional/named-locations", "Conditional Access — Named Locations");
  }, [loadEndpoint]);

  const loadEntraConditionalReports = useCallback(async () => {
    await loadEndpoint("/api/aad/conditional/reports", "Conditional Access — Sign-in Reports");
  }, [loadEndpoint]);

  // EntraAD Sign-in endpoints
  const loadEntraSigninLogs = useCallback(async () => {
    await loadEndpoint("/api/aad/signin/logs", "Sign-in Logs — Recent Sign-ins");
  }, [loadEndpoint]);

  const loadEntraSigninRisky = useCallback(async () => {
    await loadEndpoint("/api/aad/signin/risky", "Sign-in Logs — Risky Sign-ins");
  }, [loadEndpoint]);

  const loadEntraSigninFailures = useCallback(async () => {
    await loadEndpoint("/api/aad/signin/failures", "Sign-in Logs — Failed Sign-ins");
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
    // Saviynt Certifications
    loadSaviyntCertificationsCampaigns,
    loadSaviyntCertificationsPending,
    loadSaviyntCertificationsHistory,
    // Saviynt Analytics
    loadSaviyntAnalyticsDashboard,
    loadSaviyntAnalyticsRiskScores,
    loadSaviyntAnalyticsAnomalies,
    // Saviynt Controls
    loadSaviyntControlsSod,
    loadSaviyntControlsPolicies,
    loadSaviyntControlsExceptions,
    // Saviynt Requests
    loadSaviyntRequestsPending,
    loadSaviyntRequestsApproved,
    loadSaviyntRequestsRejected,
    // Saviynt Provisioning
    loadSaviyntProvisioningTasks,
    loadSaviyntProvisioningFailed,
    loadSaviyntProvisioningQueue,
    // EntraAD Users
    loadEntraUsersAll,
    loadEntraUsersGuests,
    loadEntraUsersLicenses,
    // EntraAD Groups
    loadEntraGroupsAll,
    loadEntraGroupsDynamic,
    loadEntraGroupsMembership,
    // EntraAD Apps
    loadEntraAppsEnterprise,
    loadEntraAppsRegistrations,
    loadEntraAppsConsent,
    // EntraAD Conditional Access
    loadEntraConditionalPolicies,
    loadEntraConditionalNamedLocations,
    loadEntraConditionalReports,
    // EntraAD Sign-in Logs
    loadEntraSigninLogs,
    loadEntraSigninRisky,
    loadEntraSigninFailures,
  };
}

export default usePfOps;