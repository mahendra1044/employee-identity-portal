"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";

interface FailureItem {
  userId?: string;
  email?: string;
  reason?: string;
  error?: string;
  timestamp?: string;
  time?: string;
  safe?: string;
  account?: string;
  system?: string;
  application?: string;
  entitlement?: string;
  certificationId?: string;
}

interface RecentFailuresPanelProps {
  minutes: number;
  onMinutesChange: (minutes: number) => void;
  onRefresh: () => void;
  loading: boolean;
  error?: string;
  role?: string | null;
  // SSO failures (for sso_ops and general ops)
  failFed?: FailureItem[];
  failMfa?: FailureItem[];
  // PAM failures (for pam_ops)
  failPam?: FailureItem[];
  failVault?: FailureItem[];
  // IGA failures (for iga_ops)
  failIgaAccess?: FailureItem[];
  failIgaProvisioning?: FailureItem[];
  // EntraAD failures (for entraid_ops)
  failEntraAuth?: FailureItem[];
  failEntraAccess?: FailureItem[];
  // TPAG failures (for tpag_ops)
  failTpagVendor?: FailureItem[];
  failTpagAccess?: FailureItem[];
}

// Helper to render a failure item based on its type
function renderFailureItem(it: FailureItem, type: 'sso' | 'pam' | 'iga' | 'entra' | 'tpag') {
  const user = it.userId || it.email || "unknown";
  const reason = it.reason || it.error || "failure";
  const time = it.time || it.timestamp || "";
  
  if (type === 'pam') {
    const context = it.safe ? ` [Safe: ${it.safe}]` : it.account ? ` [Account: ${it.account}]` : it.system ? ` [${it.system}]` : '';
    return `${user} — ${reason}${context} — ${time}`;
  }
  
  if (type === 'iga') {
    const context = it.application ? ` [App: ${it.application}]` : it.entitlement ? ` [Entitlement: ${it.entitlement}]` : it.system ? ` [${it.system}]` : '';
    return `${user} — ${reason}${context} — ${time}`;
  }

  if (type === 'entra') {
    const context = it.application ? ` [App: ${it.application}]` : it.system ? ` [${it.system}]` : '';
    return `${user} — ${reason}${context} — ${time}`;
  }

  if (type === 'tpag') {
    const context = it.application ? ` [Vendor: ${it.application}]` : it.system ? ` [${it.system}]` : '';
    return `${user} — ${reason}${context} — ${time}`;
  }
  
  return `${user} — ${reason} — ${time}`;
}

// Determine panel title based on role
function getPanelTitle(role: string | null | undefined, minutes: number): string {
  switch (role) {
    case 'sso_ops':
      return `SSO Recent Failures (last ${minutes} min)`;
    case 'pam_ops':
      return `PAM Recent Failures (last ${minutes} min)`;
    case 'iga_ops':
      return `IGA Recent Failures (last ${minutes} min)`;
    case 'entraid_ops':
      return `Entra ID Recent Failures (last ${minutes} min)`;
    case 'tpag_ops':
      return `TPAG Recent Failures (last ${minutes} min)`;
    default:
      return `Recent Failures (last ${minutes} min)`;
  }
}

export function RecentFailuresPanel({
  minutes,
  onMinutesChange,
  onRefresh,
  loading,
  error,
  role,
  failFed = [],
  failMfa = [],
  failPam = [],
  failVault = [],
  failIgaAccess = [],
  failIgaProvisioning = [],
  failEntraAuth = [],
  failEntraAccess = [],
  failTpagVendor = [],
  failTpagAccess = [],
}: RecentFailuresPanelProps) {
  // Determine which failure panels to show based on role
  // SSO failures: shown for sso_ops and base ops roles
  // PAM failures: shown only for pam_ops role
  // IGA failures: shown only for iga_ops role
  // EntraAD failures: shown only for entraid_ops role
  // TPAG failures: shown only for tpag_ops role
  const showSsoFailures = role === 'sso_ops' || role === 'ops';
  const showPamFailures = role === 'pam_ops';
  const showIgaFailures = role === 'iga_ops';
  const showEntraFailures = role === 'entraid_ops';
  const showTpagFailures = role === 'tpag_ops';

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>{getPanelTitle(role, minutes)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm">Window (minutes)</label>
              <Input
                type="number"
                min={1}
                className="w-28"
                value={minutes}
                onChange={(e) => onMinutesChange(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading} title="Refresh recent failures data">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>

          {/* SSO Failures Section (for sso_ops and general ops) */}
          {showSsoFailures && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ping Federate – Login Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm animate-pulse">Loading...</p>
                  ) : (failFed?.length || 0) > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {failFed!.slice(0, 25).map((it: FailureItem, idx: number) => (
                        <li key={`fed-${idx}`}>
                          {renderFailureItem(it, 'sso')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No failures in window</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ping MFA – Verification Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm animate-pulse">Loading...</p>
                  ) : (failMfa?.length || 0) > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {failMfa!.slice(0, 25).map((it: FailureItem, idx: number) => (
                        <li key={`mfa-${idx}`}>
                          {renderFailureItem(it, 'sso')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No failures in window</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* PAM Failures Section (for pam_ops and general ops) */}
          {showPamFailures && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">CyberArk PAM – Access Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm animate-pulse">Loading...</p>
                  ) : (failPam?.length || 0) > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {failPam!.slice(0, 25).map((it: FailureItem, idx: number) => (
                        <li key={`pam-${idx}`}>
                          {renderFailureItem(it, 'pam')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No failures in window</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">CyberArk Vault – Operation Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm animate-pulse">Loading...</p>
                  ) : (failVault?.length || 0) > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {failVault!.slice(0, 25).map((it: FailureItem, idx: number) => (
                        <li key={`vault-${idx}`}>
                          {renderFailureItem(it, 'pam')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No failures in window</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* IGA Failures Section (for iga_ops) */}
          {showIgaFailures && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Saviynt – Access Request Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm animate-pulse">Loading...</p>
                  ) : (failIgaAccess?.length || 0) > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {failIgaAccess!.slice(0, 25).map((it: FailureItem, idx: number) => (
                        <li key={`iga-access-${idx}`}>
                          {renderFailureItem(it, 'iga')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No failures in window</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Saviynt – Provisioning Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm animate-pulse">Loading...</p>
                  ) : (failIgaProvisioning?.length || 0) > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {failIgaProvisioning!.slice(0, 25).map((it: FailureItem, idx: number) => (
                        <li key={`iga-prov-${idx}`}>
                          {renderFailureItem(it, 'iga')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No failures in window</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* EntraAD Failures Section (for entraid_ops) */}
          {showEntraFailures && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Entra ID – Authentication Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm animate-pulse">Loading...</p>
                  ) : (failEntraAuth?.length || 0) > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {failEntraAuth!.slice(0, 25).map((it: FailureItem, idx: number) => (
                        <li key={`entra-auth-${idx}`}>
                          {renderFailureItem(it, 'entra')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No failures in window</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Entra ID – Access Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm animate-pulse">Loading...</p>
                  ) : (failEntraAccess?.length || 0) > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {failEntraAccess!.slice(0, 25).map((it: FailureItem, idx: number) => (
                        <li key={`entra-access-${idx}`}>
                          {renderFailureItem(it, 'entra')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No failures in window</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TPAG Failures Section (for tpag_ops) */}
          {showTpagFailures && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">TPAG – Vendor Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm animate-pulse">Loading...</p>
                  ) : (failTpagVendor?.length || 0) > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {failTpagVendor!.slice(0, 25).map((it: FailureItem, idx: number) => (
                        <li key={`tpag-vendor-${idx}`}>
                          {renderFailureItem(it, 'tpag')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No failures in window</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">TPAG – Access Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm animate-pulse">Loading...</p>
                  ) : (failTpagAccess?.length || 0) > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {failTpagAccess!.slice(0, 25).map((it: FailureItem, idx: number) => (
                        <li key={`tpag-access-${idx}`}>
                          {renderFailureItem(it, 'tpag')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No failures in window</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
