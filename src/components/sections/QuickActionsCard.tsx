/**
 * QuickActionsCard Component
 * 
 * Renders the ops quick actions card with system-specific action tabs.
 * Only shown when ops user has performed a successful search.
 * 
 * Features:
 * - Tab-based interface for each system (ping-federate, ping-directory, ping-mfa, azure-ad, cyberark, saviynt)
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
  onLoadSaviynt: () => void;
  onLoadSaviyhtRoles: () => void;
  onLoadSaviyhtEntitlements: () => void;
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
  onLoadSaviynt,
  onLoadSaviyhtRoles,
  onLoadSaviyhtEntitlements,
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

            {qaActive === "saviynt" && qaEnabledTabs["saviynt"] && (
              <div className="flex flex-wrap gap-2 justify-start">
                <Button size="sm" variant="secondary" onClick={onLoadSaviyhtRoles} title="Roles">
                  <Badge className="h-4 w-4 mr-1" />
                  Roles
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviyhtEntitlements} title="Entitlements">
                  <Key className="h-4 w-4 mr-1" />
                  Entitlements
                </Button>
                <Button size="sm" variant="secondary" onClick={onLoadSaviynt} title="Requests">
                  <Send className="h-4 w-4 mr-1" />
                  Requests
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
