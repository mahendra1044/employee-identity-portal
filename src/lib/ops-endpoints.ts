/**
 * Ops Endpoints Configuration
 * 
 * Centralized configuration for all Quick Actions endpoints.
 * This replaces 70+ individual useCallback functions with a data-driven approach.
 * 
 * Structure:
 * - Each system has a key matching its SystemKey
 * - Each system contains actions with url, title, and icon info
 */

import type { SystemKey } from "./types";
import type { LucideIcon } from "lucide-react";
import {
  User,
  Globe,
  Shield,
  Database,
  Users,
  History,
  CheckCircle,
  Smartphone,
  Calendar,
  LogIn,
  Vault,
  Activity,
  Badge,
  Key,
  Send,
  Lock,
  MonitorPlay,
  RotateCw,
  AlertTriangle,
  Server,
  FileKey,
  ClipboardList,
  Clock,
  BarChart2,
  Eye,
  Layers,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  ListChecks,
  ListX,
  ListOrdered,
  Building,
  FileText,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";

// Single action definition
export interface EndpointAction {
  key: string;        // Unique key for the action (used for function naming)
  url: string;        // API endpoint URL
  title: string;      // Dialog title when loaded
  label: string;      // Button label
  icon: LucideIcon;   // Lucide icon component
}

// System endpoint configuration
export interface SystemEndpoints {
  system: SystemKey;
  actions: EndpointAction[];
}

/**
 * All Quick Actions endpoints organized by system
 */
export const OPS_ENDPOINTS: SystemEndpoints[] = [
  // Ping Federate
  {
    system: "ping-federate",
    actions: [
      { key: "pfUserInfo", url: "/api/pf/userinfo", title: "Ping Federate — User Info", label: "User Info", icon: User },
      { key: "pfOidc", url: "/api/pf/oidc", title: "Ping Federate — OIDC Connections", label: "OIDC", icon: Globe },
      { key: "pfSaml", url: "/api/pf/saml", title: "Ping Federate — SAML Connections", label: "SAML", icon: Shield },
    ],
  },
  // Ping Directory
  {
    system: "ping-directory",
    actions: [
      { key: "pdProfile", url: "/api/pd/profile", title: "Ping Directory — Profile", label: "Profile", icon: User },
      { key: "pdGroups", url: "/api/pd/groups", title: "Ping Directory — Groups", label: "Groups", icon: Users },
      { key: "pdAudit", url: "/api/pd/audit", title: "Ping Directory — Audit", label: "Audit", icon: History },
    ],
  },
  // Ping MFA
  {
    system: "ping-mfa",
    actions: [
      { key: "mfaStatus", url: "/api/mfa/status", title: "Ping MFA — Status", label: "Status", icon: CheckCircle },
      { key: "mfaDevices", url: "/api/mfa/devices", title: "Ping MFA — Devices", label: "Devices", icon: Smartphone },
      { key: "mfaEvents", url: "/api/mfa/events", title: "Ping MFA — Events", label: "Events", icon: Calendar },
    ],
  },
  // Azure AD (base)
  {
    system: "azure-ad",
    actions: [
      { key: "aadUser", url: "/api/aad/user", title: "Microsoft Entra ID — User Profile", label: "User Profile", icon: User },
      { key: "aadGroups", url: "/api/aad/groups", title: "Microsoft Entra ID — Groups", label: "Groups", icon: Users },
      { key: "aadSignins", url: "/api/aad/signins", title: "Microsoft Entra ID — Sign-ins", label: "Sign-ins", icon: LogIn },
    ],
  },
  // CyberArk PAM (base)
  {
    system: "cyberark",
    actions: [
      { key: "cyberarkSafes", url: "/api/cyberark/safes", title: "CyberArk PAM — Safes", label: "Safes", icon: Vault },
      { key: "cyberarkAccounts", url: "/api/cyberark/accounts", title: "CyberArk PAM — Accounts", label: "Accounts", icon: Key },
      { key: "cyberarkActivity", url: "/api/cyberark/activity", title: "CyberArk PAM — Activity", label: "Activity", icon: Activity },
    ],
  },
  // CyberArk EPM
  {
    system: "cyberark-epm",
    actions: [
      { key: "cyberarkEpmPolicies", url: "/api/cyberark-epm/policies", title: "CyberArk EPM — Policies", label: "Policies", icon: Shield },
      { key: "cyberarkEpmApplications", url: "/api/cyberark-epm/applications", title: "CyberArk EPM — Applications", label: "Applications", icon: Server },
      { key: "cyberarkEpmElevations", url: "/api/cyberark-epm/elevation-history", title: "CyberArk EPM — Elevation History", label: "Elevations", icon: History },
    ],
  },
  // CyberArk Alero
  {
    system: "cyberark-alero",
    actions: [
      { key: "cyberarkAleroSessions", url: "/api/cyberark-alero/sessions", title: "CyberArk Alero — Sessions", label: "Sessions", icon: Activity },
      { key: "cyberarkAleroTargets", url: "/api/cyberark-alero/targets", title: "CyberArk Alero — Targets", label: "Targets", icon: Database },
      { key: "cyberarkAleroRecordings", url: "/api/cyberark-alero/recordings", title: "CyberArk Alero — Recordings", label: "Recordings", icon: MonitorPlay },
    ],
  },
  // CyberArk Conjur
  {
    system: "cyberark-conjur",
    actions: [
      { key: "cyberarkConjurSecrets", url: "/api/cyberark-conjur/secrets", title: "CyberArk Conjur — Secrets", label: "Secrets", icon: FileKey },
      { key: "cyberarkConjurVaults", url: "/api/cyberark-conjur/vaults", title: "CyberArk Conjur — Vaults", label: "Vaults", icon: Vault },
      { key: "cyberarkConjurRotation", url: "/api/cyberark-conjur/rotation", title: "CyberArk Conjur — Rotation", label: "Rotation", icon: RotateCw },
    ],
  },
  // CyberArk DPA
  {
    system: "cyberark-dpa",
    actions: [
      { key: "cyberarkDpaAuthorizations", url: "/api/cyberark-dpa/authorizations", title: "CyberArk DPA — Authorizations", label: "Authorizations", icon: Key },
      { key: "cyberarkDpaRiskAssessment", url: "/api/cyberark-dpa/risk-assessment", title: "CyberArk DPA — Risk Assessment", label: "Risk", icon: AlertTriangle },
      { key: "cyberarkDpaPolicies", url: "/api/cyberark-dpa/policies", title: "CyberArk DPA — Policies", label: "Policies", icon: Shield },
    ],
  },
  // CyberArk Identity
  {
    system: "cyberark-identity",
    actions: [
      { key: "cyberarkIdentityDevices", url: "/api/cyberark-identity/devices", title: "CyberArk Identity — Devices", label: "Devices", icon: Smartphone },
      { key: "cyberarkIdentitySsoApps", url: "/api/cyberark-identity/sso-apps", title: "CyberArk Identity — SSO Apps", label: "SSO Apps", icon: Globe },
      { key: "cyberarkIdentityLoginHistory", url: "/api/cyberark-identity/login-history", title: "CyberArk Identity — Login History", label: "Login History", icon: LogIn },
    ],
  },
  // Saviynt IGA (base)
  {
    system: "saviynt",
    actions: [
      { key: "saviyntRoles", url: "/api/saviynt/roles", title: "Saviynt IGA — Roles", label: "Roles", icon: Badge },
      { key: "saviyntEntitlements", url: "/api/saviynt/entitlements", title: "Saviynt IGA — Entitlements", label: "Entitlements", icon: Key },
      { key: "saviyntRequests", url: "/api/saviynt/requests", title: "Saviynt IGA — Requests", label: "Requests", icon: Send },
    ],
  },
  // Saviynt Certifications
  {
    system: "saviynt-certifications",
    actions: [
      { key: "saviyntCertificationsCampaigns", url: "/api/saviynt/certifications/campaigns", title: "Saviynt Certifications — Campaigns", label: "Campaigns", icon: ClipboardList },
      { key: "saviyntCertificationsPending", url: "/api/saviynt/certifications/pending", title: "Saviynt Certifications — Pending", label: "Pending", icon: Clock },
      { key: "saviyntCertificationsHistory", url: "/api/saviynt/certifications/history", title: "Saviynt Certifications — History", label: "History", icon: History },
    ],
  },
  // Saviynt Analytics
  {
    system: "saviynt-analytics",
    actions: [
      { key: "saviyntAnalyticsDashboard", url: "/api/saviynt/analytics/dashboard", title: "Saviynt Analytics — Dashboard", label: "Dashboard", icon: BarChart2 },
      { key: "saviyntAnalyticsRiskScores", url: "/api/saviynt/analytics/risk-scores", title: "Saviynt Analytics — Risk Scores", label: "Risk Scores", icon: AlertTriangle },
      { key: "saviyntAnalyticsAnomalies", url: "/api/saviynt/analytics/anomalies", title: "Saviynt Analytics — Anomalies", label: "Anomalies", icon: Eye },
    ],
  },
  // Saviynt Controls
  {
    system: "saviynt-controls",
    actions: [
      { key: "saviyntControlsSod", url: "/api/saviynt/controls/sod", title: "Saviynt Controls — SoD Violations", label: "SoD Violations", icon: Layers },
      { key: "saviyntControlsPolicies", url: "/api/saviynt/controls/policies", title: "Saviynt Controls — Policies", label: "Policies", icon: Shield },
      { key: "saviyntControlsExceptions", url: "/api/saviynt/controls/exceptions", title: "Saviynt Controls — Exceptions", label: "Exceptions", icon: XCircle },
    ],
  },
  // Saviynt Requests
  {
    system: "saviynt-requests",
    actions: [
      { key: "saviyntRequestsPending", url: "/api/saviynt/requests/pending", title: "Saviynt Requests — Pending", label: "Pending", icon: Clock },
      { key: "saviyntRequestsApproved", url: "/api/saviynt/requests/approved", title: "Saviynt Requests — Approved", label: "Approved", icon: ThumbsUp },
      { key: "saviyntRequestsRejected", url: "/api/saviynt/requests/rejected", title: "Saviynt Requests — Rejected", label: "Rejected", icon: ThumbsDown },
    ],
  },
  // Saviynt Provisioning
  {
    system: "saviynt-provisioning",
    actions: [
      { key: "saviyntProvisioningTasks", url: "/api/saviynt/provisioning/tasks", title: "Saviynt Provisioning — Tasks", label: "Tasks", icon: ListChecks },
      { key: "saviyntProvisioningFailed", url: "/api/saviynt/provisioning/failed", title: "Saviynt Provisioning — Failed", label: "Failed", icon: ListX },
      { key: "saviyntProvisioningQueue", url: "/api/saviynt/provisioning/queue", title: "Saviynt Provisioning — Queue", label: "Queue", icon: ListOrdered },
    ],
  },
  // EntraAD Users
  {
    system: "azure-ad-users",
    actions: [
      { key: "entraUsersAll", url: "/api/aad/users/all", title: "Entra ID Users — All Users", label: "All Users", icon: Users },
      { key: "entraUsersGuests", url: "/api/aad/users/guests", title: "Entra ID Users — Guest Users", label: "Guests", icon: User },
      { key: "entraUsersLicenses", url: "/api/aad/users/licenses", title: "Entra ID Users — Licenses", label: "Licenses", icon: Key },
    ],
  },
  // EntraAD Groups
  {
    system: "azure-ad-groups",
    actions: [
      { key: "entraGroupsAll", url: "/api/aad/groups/all", title: "Entra ID Groups — All Groups", label: "All Groups", icon: Users },
      { key: "entraGroupsDynamic", url: "/api/aad/groups/dynamic", title: "Entra ID Groups — Dynamic Groups", label: "Dynamic", icon: RefreshCw },
      { key: "entraGroupsMembership", url: "/api/aad/groups/membership", title: "Entra ID Groups — Membership", label: "Membership", icon: UserCheck },
    ],
  },
  // EntraAD Apps
  {
    system: "azure-ad-apps",
    actions: [
      { key: "entraAppsEnterprise", url: "/api/aad/apps/enterprise", title: "Entra ID Apps — Enterprise Apps", label: "Enterprise", icon: Building },
      { key: "entraAppsRegistrations", url: "/api/aad/apps/registrations", title: "Entra ID Apps — App Registrations", label: "Registrations", icon: FileText },
      { key: "entraAppsConsent", url: "/api/aad/apps/consent", title: "Entra ID Apps — Consent", label: "Consent", icon: CheckCircle },
    ],
  },
  // EntraAD Conditional Access
  {
    system: "azure-ad-conditional",
    actions: [
      { key: "entraConditionalPolicies", url: "/api/aad/conditional/policies", title: "Conditional Access — Policies", label: "Policies", icon: Shield },
      { key: "entraConditionalNamedLocations", url: "/api/aad/conditional/named-locations", title: "Conditional Access — Named Locations", label: "Locations", icon: Globe },
      { key: "entraConditionalReports", url: "/api/aad/conditional/reports", title: "Conditional Access — Reports", label: "Reports", icon: BarChart2 },
    ],
  },
  // EntraAD Sign-in Logs
  {
    system: "azure-ad-signin",
    actions: [
      { key: "entraSigninLogs", url: "/api/aad/signin/logs", title: "Sign-in Logs — All Logs", label: "All Logs", icon: History },
      { key: "entraSigninRisky", url: "/api/aad/signin/risky", title: "Sign-in Logs — Risky Sign-ins", label: "Risky", icon: AlertTriangle },
      { key: "entraSigninFailures", url: "/api/aad/signin/failures", title: "Sign-in Logs — Failures", label: "Failures", icon: XCircle },
    ],
  },
  // TPAG Overview
  {
    system: "saviynt-tpag",
    actions: [
      { key: "tpagOverviewDashboard", url: "/api/tpag/dashboard", title: "TPAG — Dashboard", label: "Dashboard", icon: BarChart2 },
      { key: "tpagOverviewStats", url: "/api/tpag/stats", title: "TPAG — Statistics", label: "Stats", icon: Activity },
      { key: "tpagOverviewAlerts", url: "/api/tpag/alerts", title: "TPAG — Alerts", label: "Alerts", icon: AlertTriangle },
    ],
  },
  // TPAG Vendors
  {
    system: "saviynt-tpag-vendors",
    actions: [
      { key: "tpagVendorsAll", url: "/api/tpag/vendors/all", title: "TPAG Vendors — All Vendors", label: "All Vendors", icon: Building },
      { key: "tpagVendorsActive", url: "/api/tpag/vendors/active", title: "TPAG Vendors — Active", label: "Active", icon: CheckCircle },
      { key: "tpagVendorsPending", url: "/api/tpag/vendors/pending", title: "TPAG Vendors — Pending", label: "Pending", icon: Clock },
    ],
  },
  // TPAG Contracts
  {
    system: "saviynt-tpag-contracts",
    actions: [
      { key: "tpagContractsAll", url: "/api/tpag/contracts/all", title: "TPAG Contracts — All Contracts", label: "All Contracts", icon: FileText },
      { key: "tpagContractsExpiring", url: "/api/tpag/contracts/expiring", title: "TPAG Contracts — Expiring", label: "Expiring", icon: Clock },
      { key: "tpagContractsRenewal", url: "/api/tpag/contracts/renewal", title: "TPAG Contracts — Renewal", label: "Renewal", icon: RefreshCw },
    ],
  },
  // TPAG Access
  {
    system: "saviynt-tpag-access",
    actions: [
      { key: "tpagAccessRequests", url: "/api/tpag/access/requests", title: "TPAG Access — Requests", label: "Requests", icon: Send },
      { key: "tpagAccessActive", url: "/api/tpag/access/active", title: "TPAG Access — Active", label: "Active", icon: CheckCircle },
      { key: "tpagAccessRevoked", url: "/api/tpag/access/revoked", title: "TPAG Access — Revoked", label: "Revoked", icon: UserX },
    ],
  },
  // TPAG Risk
  {
    system: "saviynt-tpag-risk",
    actions: [
      { key: "tpagRiskAssessments", url: "/api/tpag/risk/assessments", title: "TPAG Risk — Assessments", label: "Assessments", icon: ClipboardList },
      { key: "tpagRiskHighRisk", url: "/api/tpag/risk/high-risk", title: "TPAG Risk — High Risk", label: "High Risk", icon: AlertTriangle },
      { key: "tpagRiskCompliance", url: "/api/tpag/risk/compliance", title: "TPAG Risk — Compliance", label: "Compliance", icon: Shield },
    ],
  },
  // TPAG Lifecycle
  {
    system: "saviynt-tpag-lifecycle",
    actions: [
      { key: "tpagLifecycleOnboarding", url: "/api/tpag/lifecycle/onboarding", title: "TPAG Lifecycle — Onboarding", label: "Onboarding", icon: UserCheck },
      { key: "tpagLifecycleOffboarding", url: "/api/tpag/lifecycle/offboarding", title: "TPAG Lifecycle — Offboarding", label: "Offboarding", icon: UserX },
      { key: "tpagLifecycleReviews", url: "/api/tpag/lifecycle/reviews", title: "TPAG Lifecycle — Reviews", label: "Reviews", icon: Eye },
    ],
  },
];

/**
 * Get endpoints for a specific system
 */
export function getEndpointsForSystem(system: SystemKey): EndpointAction[] {
  const config = OPS_ENDPOINTS.find(e => e.system === system);
  return config?.actions || [];
}

/**
 * Get all endpoint keys (for type generation)
 */
export function getAllEndpointKeys(): string[] {
  return OPS_ENDPOINTS.flatMap(e => e.actions.map(a => a.key));
}

/**
 * Create a lookup map from key to endpoint config
 */
export const ENDPOINT_MAP: Record<string, EndpointAction> = OPS_ENDPOINTS.reduce(
  (acc, system) => {
    system.actions.forEach(action => {
      acc[action.key] = action;
    });
    return acc;
  },
  {} as Record<string, EndpointAction>
);
