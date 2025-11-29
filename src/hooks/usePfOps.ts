/**
 * usePfOps Hook (Refactored)
 * 
 * Manages PingFederate and other system operations for Quick Actions.
 * Now uses configuration-driven approach instead of 70+ individual functions.
 * 
 * @hook
 * @returns {UsePfOpsReturn} Object with dialog state, active tab, and action handlers
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import type { PfOpsResponse } from "@/lib/types";
import type { SystemKey } from "@/lib/types";
import { OPS_ENDPOINTS, ENDPOINT_MAP, type EndpointAction } from "@/lib/ops-endpoints";

// Type for the action handlers map
export type ActionHandlers = Record<string, () => Promise<void>>;

export interface UsePfOpsReturn {
  // Dialog state
  pfOpsOpen: boolean;
  setPfOpsOpen: (open: boolean) => void;
  pfOpsTitle: string;
  pfOpsLoading: boolean;
  pfOpsData: PfOpsResponse;
  
  // Quick Actions tab state
  qaActive: string;
  setQaActive: (system: string) => void;
  
  // Generic loader function
  loadEndpoint: (url: string, title: string) => Promise<void>;
  
  // Action handlers map (all endpoints by key)
  actionHandlers: ActionHandlers;
  
  // Helper to get actions for a system
  getActionsForSystem: (system: SystemKey) => EndpointAction[];
  
  // ===== Legacy individual loaders (for backward compatibility) =====
  // These will be removed in a future refactor
  loadPfUserInfo: () => Promise<void>;
  loadPfOidc: () => Promise<void>;
  loadPfConnections: () => Promise<void>;
  loadAadGroups: () => Promise<void>;
  loadAadSignins: () => Promise<void>;
  loadAadUser: () => Promise<void>;
  loadCyberarkAccounts: () => Promise<void>;
  loadCyberarkActivity: () => Promise<void>;
  loadCyberarkSafes: () => Promise<void>;
  loadCyberarkEpmPolicies: () => Promise<void>;
  loadCyberarkEpmApplications: () => Promise<void>;
  loadCyberarkEpmElevations: () => Promise<void>;
  loadCyberarkAleroSessions: () => Promise<void>;
  loadCyberarkAleroTargets: () => Promise<void>;
  loadCyberarkAleroRecordings: () => Promise<void>;
  loadCyberarkConjurSecrets: () => Promise<void>;
  loadCyberarkConjurVaults: () => Promise<void>;
  loadCyberarkConjurRotation: () => Promise<void>;
  loadCyberarkDpaAuthorizations: () => Promise<void>;
  loadCyberarkDpaRiskAssessment: () => Promise<void>;
  loadCyberarkDpaPolicies: () => Promise<void>;
  loadCyberarkIdentityDevices: () => Promise<void>;
  loadCyberarkIdentitySsoApps: () => Promise<void>;
  loadCyberarkIdentityLoginHistory: () => Promise<void>;
  loadPdProfile: () => Promise<void>;
  loadPdGroups: () => Promise<void>;
  loadPdAudit: () => Promise<void>;
  loadMfaStatus: () => Promise<void>;
  loadMfaDevices: () => Promise<void>;
  loadMfaEvents: () => Promise<void>;
  loadSaviynt: () => Promise<void>;
  loadSaviynt_Roles: () => Promise<void>;
  loadSaviynt_Entitlements: () => Promise<void>;
  loadSaviyntCertificationsCampaigns: () => Promise<void>;
  loadSaviyntCertificationsPending: () => Promise<void>;
  loadSaviyntCertificationsHistory: () => Promise<void>;
  loadSaviyntAnalyticsDashboard: () => Promise<void>;
  loadSaviyntAnalyticsRiskScores: () => Promise<void>;
  loadSaviyntAnalyticsAnomalies: () => Promise<void>;
  loadSaviyntControlsSod: () => Promise<void>;
  loadSaviyntControlsPolicies: () => Promise<void>;
  loadSaviyntControlsExceptions: () => Promise<void>;
  loadSaviyntRequestsPending: () => Promise<void>;
  loadSaviyntRequestsApproved: () => Promise<void>;
  loadSaviyntRequestsRejected: () => Promise<void>;
  loadSaviyntProvisioningTasks: () => Promise<void>;
  loadSaviyntProvisioningFailed: () => Promise<void>;
  loadSaviyntProvisioningQueue: () => Promise<void>;
  loadEntraUsersAll: () => Promise<void>;
  loadEntraUsersGuests: () => Promise<void>;
  loadEntraUsersLicenses: () => Promise<void>;
  loadEntraGroupsAll: () => Promise<void>;
  loadEntraGroupsDynamic: () => Promise<void>;
  loadEntraGroupsMembership: () => Promise<void>;
  loadEntraAppsEnterprise: () => Promise<void>;
  loadEntraAppsRegistrations: () => Promise<void>;
  loadEntraAppsConsent: () => Promise<void>;
  loadEntraConditionalPolicies: () => Promise<void>;
  loadEntraConditionalNamedLocations: () => Promise<void>;
  loadEntraConditionalReports: () => Promise<void>;
  loadEntraSigninLogs: () => Promise<void>;
  loadEntraSigninRisky: () => Promise<void>;
  loadEntraSigninFailures: () => Promise<void>;
  loadTpagOverviewDashboard: () => Promise<void>;
  loadTpagOverviewStats: () => Promise<void>;
  loadTpagOverviewAlerts: () => Promise<void>;
  loadTpagVendorsAll: () => Promise<void>;
  loadTpagVendorsActive: () => Promise<void>;
  loadTpagVendorsPending: () => Promise<void>;
  loadTpagContractsAll: () => Promise<void>;
  loadTpagContractsExpiring: () => Promise<void>;
  loadTpagContractsRenewal: () => Promise<void>;
  loadTpagAccessRequests: () => Promise<void>;
  loadTpagAccessActive: () => Promise<void>;
  loadTpagAccessRevoked: () => Promise<void>;
  loadTpagRiskAssessments: () => Promise<void>;
  loadTpagRiskHighRisk: () => Promise<void>;
  loadTpagRiskCompliance: () => Promise<void>;
  loadTpagLifecycleOnboarding: () => Promise<void>;
  loadTpagLifecycleOffboarding: () => Promise<void>;
  loadTpagLifecycleReviews: () => Promise<void>;
}

export function usePfOps(): UsePfOpsReturn {
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

  // Generate all action handlers from config
  const actionHandlers = useMemo<ActionHandlers>(() => {
    const handlers: ActionHandlers = {};
    
    OPS_ENDPOINTS.forEach(systemConfig => {
      systemConfig.actions.forEach(action => {
        handlers[action.key] = async () => {
          await loadEndpoint(action.url, action.title);
        };
      });
    });
    
    return handlers;
  }, [loadEndpoint]);

  // Helper to get actions for a system
  const getActionsForSystem = useCallback((system: SystemKey): EndpointAction[] => {
    const config = OPS_ENDPOINTS.find(e => e.system === system);
    return config?.actions || [];
  }, []);

  // ===== Legacy loaders for backward compatibility =====
  // Map old function names to new action handlers
  // This allows existing code to continue working
  
  return {
    // Dialog state
    pfOpsOpen,
    setPfOpsOpen,
    pfOpsTitle,
    pfOpsLoading,
    pfOpsData,
    
    // Quick Actions tab state
    qaActive,
    setQaActive,
    
    // Generic loader
    loadEndpoint,
    
    // New config-driven handlers
    actionHandlers,
    getActionsForSystem,
    
    // ===== Legacy loaders (backward compatibility) =====
    // Ping Federate
    loadPfUserInfo: actionHandlers.pfUserInfo || (async () => {}),
    loadPfOidc: actionHandlers.pfOidc || (async () => {}),
    loadPfConnections: actionHandlers.pfConnections || (async () => {}),
    
    // Ping Directory
    loadPdProfile: actionHandlers.pdProfile || (async () => {}),
    loadPdGroups: actionHandlers.pdGroups || (async () => {}),
    loadPdAudit: actionHandlers.pdAudit || (async () => {}),
    
    // Ping MFA
    loadMfaStatus: actionHandlers.mfaStatus || (async () => {}),
    loadMfaDevices: actionHandlers.mfaDevices || (async () => {}),
    loadMfaEvents: actionHandlers.mfaEvents || (async () => {}),
    
    // Azure AD
    loadAadUser: actionHandlers.aadUser || (async () => {}),
    loadAadGroups: actionHandlers.aadGroups || (async () => {}),
    loadAadSignins: actionHandlers.aadSignins || (async () => {}),
    
    // CyberArk PAM
    loadCyberarkSafes: actionHandlers.cyberarkSafes || (async () => {}),
    loadCyberarkAccounts: actionHandlers.cyberarkAccounts || (async () => {}),
    loadCyberarkActivity: actionHandlers.cyberarkActivity || (async () => {}),
    
    // CyberArk EPM
    loadCyberarkEpmPolicies: actionHandlers.cyberarkEpmPolicies || (async () => {}),
    loadCyberarkEpmApplications: actionHandlers.cyberarkEpmApplications || (async () => {}),
    loadCyberarkEpmElevations: actionHandlers.cyberarkEpmElevations || (async () => {}),
    
    // CyberArk Alero
    loadCyberarkAleroSessions: actionHandlers.cyberarkAleroSessions || (async () => {}),
    loadCyberarkAleroTargets: actionHandlers.cyberarkAleroTargets || (async () => {}),
    loadCyberarkAleroRecordings: actionHandlers.cyberarkAleroRecordings || (async () => {}),
    
    // CyberArk Conjur
    loadCyberarkConjurSecrets: actionHandlers.cyberarkConjurSecrets || (async () => {}),
    loadCyberarkConjurVaults: actionHandlers.cyberarkConjurVaults || (async () => {}),
    loadCyberarkConjurRotation: actionHandlers.cyberarkConjurRotation || (async () => {}),
    
    // CyberArk DPA
    loadCyberarkDpaAuthorizations: actionHandlers.cyberarkDpaAuthorizations || (async () => {}),
    loadCyberarkDpaRiskAssessment: actionHandlers.cyberarkDpaRiskAssessment || (async () => {}),
    loadCyberarkDpaPolicies: actionHandlers.cyberarkDpaPolicies || (async () => {}),
    
    // CyberArk Identity
    loadCyberarkIdentityDevices: actionHandlers.cyberarkIdentityDevices || (async () => {}),
    loadCyberarkIdentitySsoApps: actionHandlers.cyberarkIdentitySsoApps || (async () => {}),
    loadCyberarkIdentityLoginHistory: actionHandlers.cyberarkIdentityLoginHistory || (async () => {}),
    
    // Saviynt IGA
    loadSaviynt: actionHandlers.saviyntRequests || (async () => {}),
    loadSaviynt_Roles: actionHandlers.saviyntRoles || (async () => {}),
    loadSaviynt_Entitlements: actionHandlers.saviyntEntitlements || (async () => {}),
    
    // Saviynt Certifications
    loadSaviyntCertificationsCampaigns: actionHandlers.saviyntCertificationsCampaigns || (async () => {}),
    loadSaviyntCertificationsPending: actionHandlers.saviyntCertificationsPending || (async () => {}),
    loadSaviyntCertificationsHistory: actionHandlers.saviyntCertificationsHistory || (async () => {}),
    
    // Saviynt Analytics
    loadSaviyntAnalyticsDashboard: actionHandlers.saviyntAnalyticsDashboard || (async () => {}),
    loadSaviyntAnalyticsRiskScores: actionHandlers.saviyntAnalyticsRiskScores || (async () => {}),
    loadSaviyntAnalyticsAnomalies: actionHandlers.saviyntAnalyticsAnomalies || (async () => {}),
    
    // Saviynt Controls
    loadSaviyntControlsSod: actionHandlers.saviyntControlsSod || (async () => {}),
    loadSaviyntControlsPolicies: actionHandlers.saviyntControlsPolicies || (async () => {}),
    loadSaviyntControlsExceptions: actionHandlers.saviyntControlsExceptions || (async () => {}),
    
    // Saviynt Requests
    loadSaviyntRequestsPending: actionHandlers.saviyntRequestsPending || (async () => {}),
    loadSaviyntRequestsApproved: actionHandlers.saviyntRequestsApproved || (async () => {}),
    loadSaviyntRequestsRejected: actionHandlers.saviyntRequestsRejected || (async () => {}),
    
    // Saviynt Provisioning
    loadSaviyntProvisioningTasks: actionHandlers.saviyntProvisioningTasks || (async () => {}),
    loadSaviyntProvisioningFailed: actionHandlers.saviyntProvisioningFailed || (async () => {}),
    loadSaviyntProvisioningQueue: actionHandlers.saviyntProvisioningQueue || (async () => {}),
    
    // EntraAD Users
    loadEntraUsersAll: actionHandlers.entraUsersAll || (async () => {}),
    loadEntraUsersGuests: actionHandlers.entraUsersGuests || (async () => {}),
    loadEntraUsersLicenses: actionHandlers.entraUsersLicenses || (async () => {}),
    
    // EntraAD Groups
    loadEntraGroupsAll: actionHandlers.entraGroupsAll || (async () => {}),
    loadEntraGroupsDynamic: actionHandlers.entraGroupsDynamic || (async () => {}),
    loadEntraGroupsMembership: actionHandlers.entraGroupsMembership || (async () => {}),
    
    // EntraAD Apps
    loadEntraAppsEnterprise: actionHandlers.entraAppsEnterprise || (async () => {}),
    loadEntraAppsRegistrations: actionHandlers.entraAppsRegistrations || (async () => {}),
    loadEntraAppsConsent: actionHandlers.entraAppsConsent || (async () => {}),
    
    // EntraAD Conditional Access
    loadEntraConditionalPolicies: actionHandlers.entraConditionalPolicies || (async () => {}),
    loadEntraConditionalNamedLocations: actionHandlers.entraConditionalNamedLocations || (async () => {}),
    loadEntraConditionalReports: actionHandlers.entraConditionalReports || (async () => {}),
    
    // EntraAD Sign-in Logs
    loadEntraSigninLogs: actionHandlers.entraSigninLogs || (async () => {}),
    loadEntraSigninRisky: actionHandlers.entraSigninRisky || (async () => {}),
    loadEntraSigninFailures: actionHandlers.entraSigninFailures || (async () => {}),
    
    // TPAG Overview
    loadTpagOverviewDashboard: actionHandlers.tpagOverviewDashboard || (async () => {}),
    loadTpagOverviewStats: actionHandlers.tpagOverviewStats || (async () => {}),
    loadTpagOverviewAlerts: actionHandlers.tpagOverviewAlerts || (async () => {}),
    
    // TPAG Vendors
    loadTpagVendorsAll: actionHandlers.tpagVendorsAll || (async () => {}),
    loadTpagVendorsActive: actionHandlers.tpagVendorsActive || (async () => {}),
    loadTpagVendorsPending: actionHandlers.tpagVendorsPending || (async () => {}),
    
    // TPAG Contracts
    loadTpagContractsAll: actionHandlers.tpagContractsAll || (async () => {}),
    loadTpagContractsExpiring: actionHandlers.tpagContractsExpiring || (async () => {}),
    loadTpagContractsRenewal: actionHandlers.tpagContractsRenewal || (async () => {}),
    
    // TPAG Access
    loadTpagAccessRequests: actionHandlers.tpagAccessRequests || (async () => {}),
    loadTpagAccessActive: actionHandlers.tpagAccessActive || (async () => {}),
    loadTpagAccessRevoked: actionHandlers.tpagAccessRevoked || (async () => {}),
    
    // TPAG Risk
    loadTpagRiskAssessments: actionHandlers.tpagRiskAssessments || (async () => {}),
    loadTpagRiskHighRisk: actionHandlers.tpagRiskHighRisk || (async () => {}),
    loadTpagRiskCompliance: actionHandlers.tpagRiskCompliance || (async () => {}),
    
    // TPAG Lifecycle
    loadTpagLifecycleOnboarding: actionHandlers.tpagLifecycleOnboarding || (async () => {}),
    loadTpagLifecycleOffboarding: actionHandlers.tpagLifecycleOffboarding || (async () => {}),
    loadTpagLifecycleReviews: actionHandlers.tpagLifecycleReviews || (async () => {}),
  };
}

export default usePfOps;
