"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sun, Moon, User, Copy, RefreshCw, Eye, Code, BookOpen, FileText, LogOut, Globe, Shield, Database, Users, History, CheckCircle as Status, Smartphone as Device, Calendar as Event, LogIn as Signin, Activity, Badge as Role, Key as Entitlement, Send as Request, Vault, Settings as SettingsIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useSearch from "@/hooks/useSearch";
import { useSnow } from "@/hooks/useSnow";
import { usePfOps } from "@/hooks/usePfOps";
import { useAppAuth } from "@/hooks/useAppAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAppToggles } from "@/hooks/useAppToggles";
import { useAppUI } from "@/hooks/useAppUI";
import { Header, LoginForm } from "@/components/layout-index";
import { EducateGuideDialog } from "@/components/dialogs/EducateGuideDialog";
import { SettingsDialog } from "@/components/dialogs/SettingsDialog";
import { SearchSection } from "@/components/sections/SearchSection";
import { SystemCard } from "@/components/SystemCard";
import { SnowIncidentsDialog } from "@/components/dialogs/SnowIncidentsDialog";
import { PfOpsDialog } from "@/components/dialogs/PfOpsDialog";
import { RecentFailuresPanel } from "@/components/RecentFailuresPanel";
import { SystemCardsGrid } from "@/components/SystemCardsGrid";
// Import from formatters
import { toPairs, formatRoleName, getRoleIconType } from "@/lib/formatters";
// Import from constants
import { SYSTEMS, SYSTEM_LABELS, API_BASE } from "@/lib/constants";
// Import from services
import { StorageService } from "@/lib/storage";
import { ErrorHandler } from "@/lib/error-handler";
// Import types
import type { Features, LoginResponse, SystemKey } from "@/lib/types";

function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const auth = StorageService.getAuth();
    if (auth.token && auth.role && auth.email) {
      setToken(auth.token);
      setRole(auth.role);
      setEmail(auth.email);
    }
  }, []);

  const login = async (emailInput: string, password: string) => {
    try {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data: LoginResponse = await res.json();
      StorageService.saveAuth(data.token, data.role, data.email);
      setToken(data.token);
      setRole(data.role);
      setEmail(data.email);
    } catch (error) {
      throw new Error(ErrorHandler.getUserFriendlyMessage(error));
    }
  };

  const logout = () => {
    StorageService.clearAuth();
    setToken(null);
    setRole(null);
    setEmail(null);
  };

  return { token, role, email, login, logout };
}

export default function HomePage() {
  const { token, role: originalRole, email, login, logout } = useAppAuth();
  const { theme, setTheme } = useAppTheme();
  const { toggles: userToggles, toggleSystem, resetToggles } = useAppToggles();
  const { ui, setUIState, toggleRole } = useAppUI();

  const [features, setFeatures] = useState<Features | null>(null);
  const {
    search,
    setSearch,
    searchResults,
    searchError,
    hasSearched,
    doSearch,
    searchDialogOpen,
    setSearchDialogOpen,
    searchDialogTitle,
    setSearchDialogTitle,
    searchDialogData,
    setSearchDialogData,
    searchDialogLoading,
    setSearchDialogLoading,
    searchDialogMode,
    setSearchDialogMode,
    openSearchDialog,
    closeSearchDialog,
  } = useSearch(token, originalRole);

  // Use effective role from context (ops can toggle between ops/employee)
  const role = ui.currentRole || originalRole;

  // SNOW state
  const {
    snowOpen,
    setSnowOpen,
    snowLoading,
    snowError,
    snowCount,
    snowItems,
    snowEmail,
    openSnowDialog,
    resolveSnowEmail,
  } = useSnow(token, role, search, searchResults, hasSearched, email);

  const {
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
  } = usePfOps();

  // Remaining local state
  const [minutes, setMinutes] = useState<number>(10);
  const [failFed, setFailFed] = useState<any[] | null>(null);
  const [failMfa, setFailMfa] = useState<any[] | null>(null);
  const [opsLoading, setOpsLoading] = useState(false);
  const [opsError, setOpsError] = useState<string | null>(null);

  // Apply theme class to root element
  useEffect(() => {
    if (typeof window !== 'undefined' && theme) {
      let classes = '';
      if (theme === 'light') {
        classes = '';
      } else if (theme === 'dark') {
        classes = 'dark';
      } else if (theme === 'navy') {
        classes = 'dark navy';
      }
      document.documentElement.className = classes;
    }
  }, [theme]);

  const isAggregate = useMemo(() => {
    return !!searchDialogData && typeof searchDialogData === 'object' && Object.keys(searchDialogData).some(k => SYSTEMS.includes(k as SystemKey));
  }, [searchDialogData]);

  // Use toPairs from formatters service
  const toPairsGlobal = toPairs;

  // Static, shared mock guide (same for all employees)
  // Deployment-time toggle: env overrides features when provided
  const educateEnabled = useMemo(() => {
    const envVal = (process.env.NEXT_PUBLIC_EDUCATE_GUIDE || "").toString().trim().toLowerCase();
    if (envVal) return ["1", "true", "on", "yes", "enabled"].includes(envVal);
    return features?.employeeEducateGuideEnabled ?? true; // default ON if not specified
  }, [features]);

  useEffect(() => {
    // init theme from localStorage (done in useTheme hook now)
    // Just apply the theme to the DOM
    if (typeof window !== 'undefined' && theme) {
      let classes = '';
      if (theme === 'light') {
        classes = '';
      } else if (theme === 'dark') {
        classes = 'dark';
      } else if (theme === 'navy') {
        classes = 'dark navy';
      }
      document.documentElement.className = classes;
    }
  }, [theme]);

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/config/features`);
        if (res.ok) {
          const f = await res.json();
          setFeatures(f);
        } else {
          setFeatures({
            credentialSource: "env",
            useMocks: true,
            useMockAuth: true,
            systems: SYSTEMS.reduce((acc, s) => ({ ...acc, [s]: true }), {} as Record<string, boolean>),
          });
        }
      } catch {
        setFeatures({
          credentialSource: "env",
          useMocks: true,
          useMockAuth: true,
          systems: SYSTEMS.reduce((acc, s) => ({ ...acc, [s]: true }), {} as Record<string, boolean>),
        });
      }
    };
    run();
  }, [token]);

  // userToggles initialization is now handled by useUserToggles hook

  const enabled = useMemo(() => {
    const all = features?.systems || {};
    return SYSTEMS.reduce((acc, s) => ({ ...acc, [s]: !!all[s] }), {} as Record<SystemKey, boolean>);
  }, [features]);

  // Determine the order of system cards based on features.systemsOrder (if provided)
  const orderedSystems = useMemo<SystemKey[]>(() => {
    const order = features?.systemsOrder || [];
    const valid = order.filter((s): s is SystemKey => (SYSTEMS as string[]).includes(s as string));
    const remaining = SYSTEMS.filter((s) => !valid.includes(s));
    return [...valid, ...remaining];
  }, [features]);

  const anyEnabled = useMemo(() => Object.values(enabled).some(Boolean), [enabled]);

  const visibleSystems = useMemo(() => {
    const result = orderedSystems.filter((sys: SystemKey) => 
      enabled[sys] && 
      userToggles[sys] && 
      (role !== "ops" || hasSearched)
    );
    console.log('👁️ [VISIBLE SYSTEMS] Calculated visible systems:', result);
    console.log('👁️ [VISIBLE SYSTEMS] Filters - role:', role, 'hasSearched:', hasSearched);
    return result;
  }, [orderedSystems, enabled, userToggles, role, hasSearched]);

  const qaEnabledTabs = useMemo(() => ({
    ...enabled,
    ...(features?.quickActionsTabs || {})
  }), [enabled, features]);

  const splunkUrl = "https://splunk.company.com";
  const cloudwatchUrl = "https://console.aws.amazon.com/cloudwatch/home";

  // FIXED: Remove searchKey state - just use resolveUserKey directly
  const resolveUserKey = useMemo(() => {
    console.log('🔑 [RESOLVE KEY] Starting - hasSearched:', hasSearched, 'hasResults:', !!searchResults, 'search:', search);
    
    // Only resolve user key for ALL roles if search was performed
    if (!hasSearched || !searchResults) {
      console.log('🔑 [RESOLVE KEY] No search performed yet, returning undefined');
      return undefined;
    }
    
    const q = String(search || '').trim().toLowerCase();
    console.log('🔑 [RESOLVE KEY] Search query (lowercase):', q);
    
    const pd = Array.isArray(searchResults?.["ping-directory"]) ? searchResults["ping-directory"] : [];
    console.log('🔑 [RESOLVE KEY] Ping Directory results:', pd);
    
    const exact = pd.find((u: any) => 
      String(u?.email || '').toLowerCase() === q || 
      String(u?.userId || '').toLowerCase() === q
    );
    
    if (exact?.userId || exact?.email) {
      const resolved = exact.userId || exact.email;
      console.log('🔑 [RESOLVE KEY] Found exact match:', resolved);
      return resolved;
    }
    
    if (pd[0]?.userId || pd[0]?.email) {
      const resolved = pd[0].userId || pd[0].email;
      console.log('🔑 [RESOLVE KEY] Using first result:', resolved);
      return resolved;
    }
    
    console.log('🔑 [RESOLVE KEY] Falling back to search query:', q);
    return q || undefined;
  }, [search, searchResults, hasSearched]);

  console.log('🎯 [MAIN RENDER] resolveUserKey:', resolveUserKey, 'hasSearched:', hasSearched);

  // Clear currentUserKey when search empties (ops only)
  // Remove old searchKey useEffects - no longer needed

  const loadRecentFailures = async () => {
    if (!token || role !== "ops") return;
    setOpsLoading(true);
    setOpsError(null);
    try {
      const [fedRes, mfaRes] = await Promise.all([
        fetch(`${API_BASE}/api/ops-failures?system=ping-federate&minutes=${minutes}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/ops-failures?system=ping-mfa&minutes=${minutes}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const fedJson = await fedRes.json().catch(() => ({ data: [] }));
      const mfaJson = await mfaRes.json().catch(() => ({ data: [] }));
      let fed = Array.isArray(fedJson?.data) ? fedJson.data : [];
      let mfa = Array.isArray(mfaJson?.data) ? mfaJson.data : [];
      // Provide test data if backend has none
      if ((!fed || fed.length === 0) && (!mfa || mfa.length === 0)) {
        const now = Date.now();
        const mkTs = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();
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
      if (!fedRes.ok || !mfaRes.ok) {
        setOpsError("Failure feeds not available (mock backend may not implement /api/ops-failures)");
      }
    } catch (e: any) {
      setOpsError(e?.message || "Failed to load failures");
      setFailFed([]);
      setFailMfa([]);
    } finally {
      setOpsLoading(false);
    }
  };

  // Load recent failures on ops login
  useEffect(() => {
    if (token && role === "ops") {
      // do not auto-load all users; show recent failures panel instead
      loadRecentFailures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  if (!token) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onShowSnowTickets={openSnowDialog}
        snowTicketsCount={snowCount ?? undefined}
        educateEnabled={educateEnabled}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Settings Dialog */}
        <SettingsDialog
          open={ui.settingsOpen}
          onOpenChange={(open) => setUIState('settingsOpen', open)}
          enabled={enabled}
          userToggles={userToggles}
          onToggleSystem={toggleSystem}
          onResetToggles={resetToggles}
        />

        {/* Educate Guide Dialog */}
        <EducateGuideDialog
          open={ui.educateOpen}
          onOpenChange={(open) => setUIState('educateOpen', open)}
          email={email}
        />

                {/* Search Section */}
        <SearchSection
          token={token!}
          role={role}
          originalRole={originalRole}
          email={email}
          search={search}
          onSearchChange={setSearch}
          onDoSearch={doSearch}
          searchResults={searchResults}
          searchError={searchError}
          hasSearched={hasSearched}
          enabled={enabled}
          features={features}
        />

        {/* Ops Quick Actions (tabs) - independent card below Search, visible after successful search */}
        {role === "ops" && hasSearched && (
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
                          onClick={() => setQaActive(s)}
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
                      <Button size="sm" variant="secondary" onClick={loadPfUserInfo} title="User information">
                        <User className="h-4 w-4 mr-1" />
                        User Info
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadPfOidc} title="OIDC connections">
                        <Globe className="h-4 w-4 mr-1" />
                        OIDC
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadPfConnections} title="SAML connections">
                        <Shield className="h-4 w-4 mr-1" />
                        SAML
                      </Button>
                    </div>
                  )}

                  {qaActive === "ping-directory" && qaEnabledTabs["ping-directory"] && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button size="sm" variant="secondary" onClick={loadPdProfile} title="Profile">
                        <Database className="h-4 w-4 mr-1" />
                        Profile
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadPdGroups} title="Groups">
                        <Users className="h-4 w-4 mr-1" />
                        Groups
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadPdAudit} title="Audit">
                        <History className="h-4 w-4 mr-1" />
                        Audit
                      </Button>
                    </div>
                  )}

                  {qaActive === "ping-mfa" && qaEnabledTabs["ping-mfa"] && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button size="sm" variant="secondary" onClick={loadMfaStatus} title="Status">
                        <Status className="h-4 w-4 mr-1" />
                        Status
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadMfaDevices} title="Devices">
                        <Device className="h-4 w-4 mr-1" />
                        Devices
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadMfaEvents} title="Events">
                        <Event className="h-4 w-4 mr-1" />
                        Events
                      </Button>
                    </div>
                  )}

                  {qaActive === "azure-ad" && qaEnabledTabs["azure-ad"] && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button size="sm" variant="secondary" onClick={loadAadUser} title="User">
                        <User className="h-4 w-4 mr-1" />
                        User
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadAadGroups} title="Groups">
                        <Users className="h-4 w-4 mr-1" />
                        Groups
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadAadSignins} title="Sign-ins">
                        <Signin className="h-4 w-4 mr-1" />
                        Sign-ins
                      </Button>
                    </div>
                  )}

                  {qaActive === "cyberark" && qaEnabledTabs["cyberark"] && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button size="sm" variant="secondary" onClick={loadCyberarkSafes} title="Safes">
                        <Vault className="h-4 w-4 mr-1" />
                        Safes
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadCyberarkAccounts} title="Accounts">
                        <Users className="h-4 w-4 mr-1" />
                        Accounts
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadCyberarkActivity} title="Activity">
                        <Activity className="h-4 w-4 mr-1" />
                        Activity
                      </Button>
                    </div>
                  )}

                  {qaActive === "saviynt" && qaEnabledTabs["saviynt"] && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button size="sm" variant="secondary" onClick={loadSaviyhtRoles} title="Roles">
                        <Role className="h-4 w-4 mr-1" />
                        Roles
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadSaviyhtEntitlements} title="Entitlements">
                        <Entitlement className="h-4 w-4 mr-1" />
                        Entitlements
                      </Button>
                      <Button size="sm" variant="secondary" onClick={loadSaviynt} title="Requests">
                        <Request className="h-4 w-4 mr-1" />
                        Requests
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* SNOW incidents dialog */}
        <SnowIncidentsDialog
          open={snowOpen}
          onOpenChange={setSnowOpen}
          snowEmail={snowEmail}
          snowCount={snowCount}
          snowItems={snowItems}
          snowLoading={snowLoading}
          snowError={snowError}
          onRefresh={openSnowDialog}
        />

        {/* OPS: Ping Federate quick actions dialog */}
        <PfOpsDialog
          open={pfOpsOpen}
          onOpenChange={setPfOpsOpen}
          title={pfOpsTitle || 'Ping Federate'}
          data={pfOpsData}
          loading={pfOpsLoading}
        />

        {/* Ops Recent Failures Panel */}
        {role === "ops" && (
          <RecentFailuresPanel
            minutes={minutes}
            onMinutesChange={setMinutes}
            onRefresh={loadRecentFailures}
            loading={opsLoading}
            error={opsError}
            failFed={failFed}
            failMfa={failMfa}
          />
        )}

        {/* System Cards (hide by default for ops) */}
        <section>
          <SystemCardsGrid
            visibleSystems={visibleSystems}
            enabled={enabled}
            token={token!}
            role={role!}
            email={email!}
            userKey={resolveUserKey}
            anyEnabled={anyEnabled}
          />
        </section>

        {/* All Users feature removed as requested */}
      </main>

      {/* Dashboard Footer */}
      <footer className="border-t bg-background/80 backdrop-blur py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">Privacy Policy</button>
            <span className="text-border">•</span>
            <button className="hover:text-foreground transition-colors">Support</button>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Identity Sphere. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}