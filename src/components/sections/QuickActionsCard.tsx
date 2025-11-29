/**
 * QuickActionsCard Component
 * 
 * Renders the ops quick actions card with system-specific action tabs.
 * Only shown when ops user has performed a successful search.
 * 
 * Features:
 * - Tab-based interface for each system (all identity systems including 6 CyberArk systems)
 * - System-specific action buttons (3 per system)
 * - Links to external tools (Splunk, CloudWatch)
 * - Target user display showing who the actions are for
 * 
 * @component
 * @returns {JSX.Element} Card component with quick action tabs
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import type { SystemKey } from "@/lib/types";
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/constants";

interface QuickActionsCardProps {
  qaActive: SystemKey;
  onSetQaActive: (system: SystemKey) => void;
  qaEnabledTabs: Record<SystemKey, boolean>;
  resolveSnowEmail: () => string | undefined;
  search: string;
  onLoadPfUserInfo: () => void;
  onLoadPfOidc: () => void;
  onLoadPfConnections: () => void;
  onLoadPdProfile: () => void;
  onLoadPdGroups: () => void;
  onLoadPdAudit: () => void;
  onLoadMfaStatus: () => void;
  onLoadMfaDevices: () => void;
  onLoadMfaEvents: () => void;
  onLoadAadUser: () => void;
  onLoadAadGroups: () => void;
  onLoadAadSignins: () => void;
  onLoadCyberarkSafes: () => void;
  onLoadCyberarkAccounts: () => void;
  onLoadCyberarkActivity: () => void;
  onLoadCyberarkEpmPolicies: () => void;
  onLoadCyberarkEpmApplications: () => void;
  onLoadCyberarkEpmElevations: () => void;
  onLoadCyberarkAleroSessions: () => void;
  onLoadCyberarkAleroTargets: () => void;
  onLoadCyberarkAleroRecordings: () => void;
  onLoadCyberarkConjurSecrets: () => void;
  onLoadCyberarkConjurVaults: () => void;
  onLoadCyberarkConjurRotation: () => void;
  onLoadCyberarkDpaAuthorizations: () => void;
  onLoadCyberarkDpaRiskAssessment: () => void;
  onLoadCyberarkDpaPolicies: () => void;
  onLoadCyberarkIdentityDevices: () => void;
  onLoadCyberarkIdentitySsoApps: () => void;
  onLoadCyberarkIdentityLoginHistory: () => void;
  onLoadSaviynt: () => void;
  onLoadSaviynt_Roles: () => void;
  onLoadSaviynt_Entitlements: () => void;
  // Saviynt Certifications
  onLoadSaviyntCertificationsCampaigns: () => void;
  onLoadSaviyntCertificationsPending: () => void;
  onLoadSaviyntCertificationsHistory: () => void;
  // Saviynt Analytics
  onLoadSaviyntAnalyticsDashboard: () => void;
  onLoadSaviyntAnalyticsRiskScores: () => void;
  onLoadSaviyntAnalyticsAnomalies: () => void;
  // Saviynt Controls
  onLoadSaviyntControlsSod: () => void;
  onLoadSaviyntControlsPolicies: () => void;
  onLoadSaviyntControlsExceptions: () => void;
  // Saviynt Requests
  onLoadSaviyntRequestsPending: () => void;
  onLoadSaviyntRequestsApproved: () => void;
  onLoadSaviyntRequestsRejected: () => void;
  // Saviynt Provisioning
  onLoadSaviyntProvisioningTasks: () => void;
  onLoadSaviyntProvisioningFailed: () => void;
  onLoadSaviyntProvisioningQueue: () => void;
  // EntraAD Users
  onLoadEntraUsersAll: () => void;
  onLoadEntraUsersGuests: () => void;
  onLoadEntraUsersLicenses: () => void;
  // EntraAD Groups
  onLoadEntraGroupsAll: () => void;
  onLoadEntraGroupsDynamic: () => void;
  onLoadEntraGroupsMembership: () => void;
  // EntraAD Apps
  onLoadEntraAppsEnterprise: () => void;
  onLoadEntraAppsRegistrations: () => void;
  onLoadEntraAppsConsent: () => void;
  // EntraAD Conditional Access
  onLoadEntraConditionalPolicies: () => void;
  onLoadEntraConditionalNamedLocations: () => void;
  onLoadEntraConditionalReports: () => void;
  // EntraAD Sign-in Logs
  onLoadEntraSigninLogs: () => void;
  onLoadEntraSigninRisky: () => void;
  onLoadEntraSigninFailures: () => void;
  // TPAG Overview
  onLoadTpagOverviewDashboard: () => void;
  onLoadTpagOverviewStats: () => void;
  onLoadTpagOverviewAlerts: () => void;
  // TPAG Vendors
  onLoadTpagVendorsAll: () => void;
  onLoadTpagVendorsActive: () => void;
  onLoadTpagVendorsPending: () => void;
  // TPAG Contracts
  onLoadTpagContractsAll: () => void;
  onLoadTpagContractsExpiring: () => void;
  onLoadTpagContractsRenewal: () => void;
  // TPAG Access
  onLoadTpagAccessRequests: () => void;
  onLoadTpagAccessActive: () => void;
  onLoadTpagAccessRevoked: () => void;
  // TPAG Risk
  onLoadTpagRiskAssessments: () => void;
  onLoadTpagRiskHighRisk: () => void;
  onLoadTpagRiskCompliance: () => void;
  // TPAG Lifecycle
  onLoadTpagLifecycleOnboarding: () => void;
  onLoadTpagLifecycleOffboarding: () => void;
  onLoadTpagLifecycleReviews: () => void;
  splunkUrl: string;
  cloudwatchUrl: string;
}

export function QuickActionsCard({
  qaActive,
  onSetQaActive,
  qaEnabledTabs,
  resolveSnowEmail,
  search,
  onLoadPfUserInfo,
  onLoadPfOidc,
  onLoadPfConnections,
  onLoadPdProfile,
  onLoadPdGroups,
  onLoadPdAudit,
  onLoadMfaStatus,
  onLoadMfaDevices,
  onLoadMfaEvents,
  onLoadAadUser,
  onLoadAadGroups,
  onLoadAadSignins,
  onLoadCyberarkSafes,
  onLoadCyberarkAccounts,
  onLoadCyberarkActivity,
  onLoadCyberarkEpmPolicies,
  onLoadCyberarkEpmApplications,
  onLoadCyberarkEpmElevations,
  onLoadCyberarkAleroSessions,
  onLoadCyberarkAleroTargets,
  onLoadCyberarkAleroRecordings,
  onLoadCyberarkConjurSecrets,
  onLoadCyberarkConjurVaults,
  onLoadCyberarkConjurRotation,
  onLoadCyberarkDpaAuthorizations,
  onLoadCyberarkDpaRiskAssessment,
  onLoadCyberarkDpaPolicies,
  onLoadCyberarkIdentityDevices,
  onLoadCyberarkIdentitySsoApps,
  onLoadCyberarkIdentityLoginHistory,
  onLoadSaviynt,
  onLoadSaviynt_Roles,
  onLoadSaviynt_Entitlements,
  // Saviynt Certifications
  onLoadSaviyntCertificationsCampaigns,
  onLoadSaviyntCertificationsPending,
  onLoadSaviyntCertificationsHistory,
  // Saviynt Analytics
  onLoadSaviyntAnalyticsDashboard,
  onLoadSaviyntAnalyticsRiskScores,
  onLoadSaviyntAnalyticsAnomalies,
  // Saviynt Controls
  onLoadSaviyntControlsSod,
  onLoadSaviyntControlsPolicies,
  onLoadSaviyntControlsExceptions,
  // Saviynt Requests
  onLoadSaviyntRequestsPending,
  onLoadSaviyntRequestsApproved,
  onLoadSaviyntRequestsRejected,
  // Saviynt Provisioning
  onLoadSaviyntProvisioningTasks,
  onLoadSaviyntProvisioningFailed,
  onLoadSaviyntProvisioningQueue,
  // EntraAD Users
  onLoadEntraUsersAll,
  onLoadEntraUsersGuests,
  onLoadEntraUsersLicenses,
  // EntraAD Groups
  onLoadEntraGroupsAll,
  onLoadEntraGroupsDynamic,
  onLoadEntraGroupsMembership,
  // EntraAD Apps
  onLoadEntraAppsEnterprise,
  onLoadEntraAppsRegistrations,
  onLoadEntraAppsConsent,
  // EntraAD Conditional Access
  onLoadEntraConditionalPolicies,
  onLoadEntraConditionalNamedLocations,
  onLoadEntraConditionalReports,
  // EntraAD Sign-in Logs
  onLoadEntraSigninLogs,
  onLoadEntraSigninRisky,
  onLoadEntraSigninFailures,
  // TPAG Overview
  onLoadTpagOverviewDashboard,
  onLoadTpagOverviewStats,
  onLoadTpagOverviewAlerts,
  // TPAG Vendors
  onLoadTpagVendorsAll,
  onLoadTpagVendorsActive,
  onLoadTpagVendorsPending,
  // TPAG Contracts
  onLoadTpagContractsAll,
  onLoadTpagContractsExpiring,
  onLoadTpagContractsRenewal,
  // TPAG Access
  onLoadTpagAccessRequests,
  onLoadTpagAccessActive,
  onLoadTpagAccessRevoked,
  // TPAG Risk
  onLoadTpagRiskAssessments,
  onLoadTpagRiskHighRisk,
  onLoadTpagRiskCompliance,
  // TPAG Lifecycle
  onLoadTpagLifecycleOnboarding,
  onLoadTpagLifecycleOffboarding,
  onLoadTpagLifecycleReviews,
  splunkUrl,
  cloudwatchUrl,
}: QuickActionsCardProps) {
  return (
    <section>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-6 space-y-0">
          <CardTitle>Quick Actions</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(splunkUrl, "_blank", "noopener,noreferrer")}
            >
              Take Me to Splunk
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(cloudwatchUrl, "_blank", "noopener,noreferrer")}
            >
              Take Me to Cloud Watch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap gap-1">
              <div className="flex flex-wrap gap-1 items-center">
                {SYSTEMS.filter((s) => qaEnabledTabs[s]).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={qaActive === s ? "default" : "outline"}
                    onClick={() => onSetQaActive(s)}
                    className="whitespace-nowrap"
                  >
                    {SYSTEM_LABELS[s]}
                  </Button>
                ))}
              </div>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[60%]">
              Target: {resolveSnowEmail() || search || "(unknown)"}
            </span>
          </div>

          {/* Buttons per active tab (3 each) */}
          <div className="rounded-lg border bg-gradient-to-r from-muted/60 to-background p-3 sm:p-4">
            {qaActive === "ping-federate" && qaEnabledTabs["ping-federate"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadPfUserInfo} title="User information">
                  <User className="h-4 w-4 mr-1" />
                  User Info
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadPfOidc} title="OIDC connections">
                  <Globe className="h-4 w-4 mr-1" />
                  OIDC
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadPfConnections} title="SAML connections">
                  <Shield className="h-4 w-4 mr-1" />
                  SAML
                </Button>
              </div>
            )}

            {qaActive === "ping-directory" && qaEnabledTabs["ping-directory"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadPdProfile} title="Profile">
                  <Database className="h-4 w-4 mr-1" />
                  Profile
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadPdGroups} title="Groups">
                  <Users className="h-4 w-4 mr-1" />
                  Groups
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadPdAudit} title="Audit">
                  <History className="h-4 w-4 mr-1" />
                  Audit
                </Button>
              </div>
            )}

            {qaActive === "ping-mfa" && qaEnabledTabs["ping-mfa"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadMfaStatus} title="Status">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Status
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadMfaDevices} title="Devices">
                  <Smartphone className="h-4 w-4 mr-1" />
                  Devices
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadMfaEvents} title="Events">
                  <Calendar className="h-4 w-4 mr-1" />
                  Events
                </Button>
              </div>
            )}

            {qaActive === "azure-ad" && qaEnabledTabs["azure-ad"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadAadUser} title="User">
                  <User className="h-4 w-4 mr-1" />
                  User
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadAadGroups} title="Groups">
                  <Users className="h-4 w-4 mr-1" />
                  Groups
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadAadSignins} title="Sign-ins">
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign-ins
                </Button>
              </div>
            )}

            {qaActive === "cyberark" && qaEnabledTabs["cyberark"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkSafes} title="Safes">
                  <Vault className="h-4 w-4 mr-1" />
                  Safes
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkAccounts} title="Accounts">
                  <Users className="h-4 w-4 mr-1" />
                  Accounts
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkActivity} title="Activity">
                  <Activity className="h-4 w-4 mr-1" />
                  Activity
                </Button>
              </div>
            )}

            {qaActive === "cyberark-epm" && qaEnabledTabs["cyberark-epm"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkEpmPolicies} title="Policies">
                  <Shield className="h-4 w-4 mr-1" />
                  Policies
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkEpmApplications} title="Applications">
                  <Server className="h-4 w-4 mr-1" />
                  Applications
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkEpmElevations} title="Elevation History">
                  <History className="h-4 w-4 mr-1" />
                  Elevations
                </Button>
              </div>
            )}

            {qaActive === "cyberark-alero" && qaEnabledTabs["cyberark-alero"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkAleroSessions} title="Sessions">
                  <Activity className="h-4 w-4 mr-1" />
                  Sessions
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkAleroTargets} title="Targets">
                  <Database className="h-4 w-4 mr-1" />
                  Targets
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkAleroRecordings} title="Recordings">
                  <MonitorPlay className="h-4 w-4 mr-1" />
                  Recordings
                </Button>
              </div>
            )}

            {qaActive === "cyberark-conjur" && qaEnabledTabs["cyberark-conjur"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkConjurSecrets} title="Secrets">
                  <FileKey className="h-4 w-4 mr-1" />
                  Secrets
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkConjurVaults} title="Vaults">
                  <Vault className="h-4 w-4 mr-1" />
                  Vaults
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkConjurRotation} title="Rotation">
                  <RotateCw className="h-4 w-4 mr-1" />
                  Rotation
                </Button>
              </div>
            )}

            {qaActive === "cyberark-dpa" && qaEnabledTabs["cyberark-dpa"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkDpaAuthorizations} title="Authorizations">
                  <Key className="h-4 w-4 mr-1" />
                  Authorizations
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkDpaRiskAssessment} title="Risk Assessment">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Risk
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkDpaPolicies} title="Policies">
                  <Shield className="h-4 w-4 mr-1" />
                  Policies
                </Button>
              </div>
            )}

            {qaActive === "cyberark-identity" && qaEnabledTabs["cyberark-identity"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkIdentityDevices} title="Devices">
                  <Smartphone className="h-4 w-4 mr-1" />
                  Devices
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkIdentitySsoApps} title="SSO Applications">
                  <Globe className="h-4 w-4 mr-1" />
                  SSO Apps
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadCyberarkIdentityLoginHistory} title="Login History">
                  <LogIn className="h-4 w-4 mr-1" />
                  Login History
                </Button>
              </div>
            )}

            {qaActive === "saviynt" && qaEnabledTabs["saviynt"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadSaviynt_Roles} title="Roles">
                  <Badge className="h-4 w-4 mr-1" />
                  Roles
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviynt_Entitlements} title="Entitlements">
                  <Key className="h-4 w-4 mr-1" />
                  Entitlements
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviynt} title="Requests">
                  <Send className="h-4 w-4 mr-1" />
                  Requests
                </Button>
              </div>
            )}

            {qaActive === "saviynt-certifications" && qaEnabledTabs["saviynt-certifications"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntCertificationsCampaigns} title="Campaigns">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Campaigns
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntCertificationsPending} title="Pending Reviews">
                  <Clock className="h-4 w-4 mr-1" />
                  Pending
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntCertificationsHistory} title="History">
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
              </div>
            )}

            {qaActive === "saviynt-analytics" && qaEnabledTabs["saviynt-analytics"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntAnalyticsDashboard} title="Dashboard">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntAnalyticsRiskScores} title="Risk Scores">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Risk Scores
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntAnalyticsAnomalies} title="Anomalies">
                  <Eye className="h-4 w-4 mr-1" />
                  Anomalies
                </Button>
              </div>
            )}

            {qaActive === "saviynt-controls" && qaEnabledTabs["saviynt-controls"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntControlsSod} title="SoD Violations">
                  <Layers className="h-4 w-4 mr-1" />
                  SoD Violations
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntControlsPolicies} title="Policies">
                  <Shield className="h-4 w-4 mr-1" />
                  Policies
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntControlsExceptions} title="Exceptions">
                  <XCircle className="h-4 w-4 mr-1" />
                  Exceptions
                </Button>
              </div>
            )}

            {qaActive === "saviynt-requests" && qaEnabledTabs["saviynt-requests"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntRequestsPending} title="Pending Requests">
                  <Clock className="h-4 w-4 mr-1" />
                  Pending
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntRequestsApproved} title="Approved Requests">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Approved
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntRequestsRejected} title="Rejected Requests">
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Rejected
                </Button>
              </div>
            )}

            {qaActive === "saviynt-provisioning" && qaEnabledTabs["saviynt-provisioning"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntProvisioningTasks} title="Tasks">
                  <ListChecks className="h-4 w-4 mr-1" />
                  Tasks
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntProvisioningFailed} title="Failed">
                  <ListX className="h-4 w-4 mr-1" />
                  Failed
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyntProvisioningQueue} title="Queue">
                  <ListOrdered className="h-4 w-4 mr-1" />
                  Queue
                </Button>
              </div>
            )}

            {/* EntraAD Tabs */}
            {qaActive === "azure-ad" && qaEnabledTabs["azure-ad"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadAadUser} title="User Profile">
                  <User className="h-4 w-4 mr-1" />
                  User Profile
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadAadGroups} title="Groups">
                  <Users className="h-4 w-4 mr-1" />
                  Groups
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadAadSignins} title="Sign-ins">
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign-ins
                </Button>
              </div>
            )}

            {qaActive === "azure-ad-users" && qaEnabledTabs["azure-ad-users"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadEntraUsersAll} title="All Users">
                  <Users className="h-4 w-4 mr-1" />
                  All Users
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadEntraUsersGuests} title="Guest Users">
                  <User className="h-4 w-4 mr-1" />
                  Guests
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadEntraUsersLicenses} title="Licenses">
                  <Badge className="h-4 w-4 mr-1" />
                  Licenses
                </Button>
              </div>
            )}

            {qaActive === "azure-ad-groups" && qaEnabledTabs["azure-ad-groups"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadEntraGroupsAll} title="All Groups">
                  <Users className="h-4 w-4 mr-1" />
                  All Groups
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadEntraGroupsDynamic} title="Dynamic Groups">
                  <RotateCw className="h-4 w-4 mr-1" />
                  Dynamic
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadEntraGroupsMembership} title="Membership">
                  <Layers className="h-4 w-4 mr-1" />
                  Membership
                </Button>
              </div>
            )}

            {qaActive === "azure-ad-apps" && qaEnabledTabs["azure-ad-apps"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadEntraAppsEnterprise} title="Enterprise Apps">
                  <Globe className="h-4 w-4 mr-1" />
                  Enterprise Apps
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadEntraAppsRegistrations} title="App Registrations">
                  <Server className="h-4 w-4 mr-1" />
                  Registrations
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadEntraAppsConsent} title="Admin Consent">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Consent
                </Button>
              </div>
            )}

            {qaActive === "azure-ad-conditional" && qaEnabledTabs["azure-ad-conditional"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadEntraConditionalPolicies} title="CA Policies">
                  <Shield className="h-4 w-4 mr-1" />
                  Policies
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadEntraConditionalNamedLocations} title="Named Locations">
                  <Database className="h-4 w-4 mr-1" />
                  Locations
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadEntraConditionalReports} title="Reports">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Reports
                </Button>
              </div>
            )}

            {qaActive === "azure-ad-signin" && qaEnabledTabs["azure-ad-signin"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadEntraSigninLogs} title="Sign-in Logs">
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign-in Logs
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadEntraSigninRisky} title="Risky Sign-ins">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Risky
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadEntraSigninFailures} title="Failures">
                  <XCircle className="h-4 w-4 mr-1" />
                  Failures
                </Button>
              </div>
            )}

            {/* TPAG Overview Tab */}
            {qaActive === "saviynt-tpag" && qaEnabledTabs["saviynt-tpag"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadTpagOverviewDashboard} title="TPAG Dashboard">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagOverviewStats} title="Statistics">
                  <Activity className="h-4 w-4 mr-1" />
                  Statistics
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagOverviewAlerts} title="Active Alerts">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Alerts
                </Button>
              </div>
            )}

            {/* TPAG Vendors Tab */}
            {qaActive === "saviynt-tpag-vendors" && qaEnabledTabs["saviynt-tpag-vendors"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadTpagVendorsAll} title="All Vendors">
                  <Users className="h-4 w-4 mr-1" />
                  All Vendors
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagVendorsActive} title="Active Vendors">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Active
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagVendorsPending} title="Pending Onboarding">
                  <Clock className="h-4 w-4 mr-1" />
                  Pending
                </Button>
              </div>
            )}

            {/* TPAG Contracts Tab */}
            {qaActive === "saviynt-tpag-contracts" && qaEnabledTabs["saviynt-tpag-contracts"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadTpagContractsAll} title="All Contracts">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  All Contracts
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagContractsExpiring} title="Expiring Contracts">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Expiring
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagContractsRenewal} title="Pending Renewal">
                  <RotateCw className="h-4 w-4 mr-1" />
                  Renewal
                </Button>
              </div>
            )}

            {/* TPAG Access Tab */}
            {qaActive === "saviynt-tpag-access" && qaEnabledTabs["saviynt-tpag-access"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadTpagAccessRequests} title="Access Requests">
                  <Send className="h-4 w-4 mr-1" />
                  Requests
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagAccessActive} title="Active Access">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Active
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagAccessRevoked} title="Revoked Access">
                  <XCircle className="h-4 w-4 mr-1" />
                  Revoked
                </Button>
              </div>
            )}

            {/* TPAG Risk Tab */}
            {qaActive === "saviynt-tpag-risk" && qaEnabledTabs["saviynt-tpag-risk"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadTpagRiskAssessments} title="Risk Assessments">
                  <Shield className="h-4 w-4 mr-1" />
                  Assessments
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagRiskHighRisk} title="High Risk Vendors">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  High Risk
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagRiskCompliance} title="Compliance Status">
                  <Eye className="h-4 w-4 mr-1" />
                  Compliance
                </Button>
              </div>
            )}

            {/* TPAG Lifecycle Tab */}
            {qaActive === "saviynt-tpag-lifecycle" && qaEnabledTabs["saviynt-tpag-lifecycle"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadTpagLifecycleOnboarding} title="Onboarding">
                  <User className="h-4 w-4 mr-1" />
                  Onboarding
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagLifecycleOffboarding} title="Offboarding">
                  <LogIn className="h-4 w-4 mr-1" />
                  Offboarding
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadTpagLifecycleReviews} title="Access Reviews">
                  <ListChecks className="h-4 w-4 mr-1" />
                  Reviews
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default QuickActionsCard;