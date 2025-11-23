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
import { useFeatures } from "@/hooks/useFeatures";
import { useThemeDOM } from "@/hooks/useThemeDOM";
import { useOpsFeatures } from "@/hooks/useOpsFeatures";
import { usePageState } from "@/hooks/usePageState";
import { Header, LoginForm } from "@/components/layout-index";
import { EducateGuideDialog } from "@/components/dialogs/EducateGuideDialog";
import { SettingsDialog } from "@/components/dialogs/SettingsDialog";
import { SearchSection } from "@/components/sections/SearchSection";
import { SystemCard } from "@/components/SystemCard";
import { SnowIncidentsDialog } from "@/components/dialogs/SnowIncidentsDialog";
import { PfOpsDialog } from "@/components/dialogs/PfOpsDialog";
import { RecentFailuresPanel } from "@/components/RecentFailuresPanel";
import { SystemCardsGrid } from "@/components/SystemCardsGrid";
import { DialogsSection } from "@/components/sections/DialogsSection";
import { QuickActionsCard } from "@/components/sections/QuickActionsCard";
// Import from formatters
import { toPairs, formatRoleName, getRoleIconType } from "@/lib/formatters";
// Import from constants
import { SYSTEMS, SYSTEM_LABELS, API_BASE } from "@/lib/constants";
// Import from services
import { StorageService } from "@/lib/storage";
import { ErrorHandler } from "@/lib/error-handler";
// Import types
import type { Features, LoginResponse, SystemKey } from "@/lib/types";

export default function HomePage() {
  const { token, role: originalRole, email, login, logout } = useAppAuth();
  const { theme, setTheme } = useAppTheme();
  const { toggles: userToggles, toggleSystem, resetToggles } = useAppToggles();
  const { ui, setUIState, toggleRole } = useAppUI();

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
    loadSaviynt_Roles,
    loadSaviynt_Entitlements,
  } = usePfOps();

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

  // Load features and theme using custom hooks
  const { features, educateEnabled } = useFeatures(token);
  useThemeDOM(theme);

  // Create page-level state for all dialogs and UI toggles
  const pageState = usePageState();

  // userToggles initialization is now handled by useUserToggles hook

  const enabled = useMemo(() => {
    const all = features?.systems || {};
    return SYSTEMS.reduce((acc, s) => ({ ...acc, [s]: !!all[s] }), {} as Record<SystemKey, boolean>);
  }, [features]);

  // Ops-specific state and logic
  const {
    minutes,
    setMinutes,
    failFed,
    failMfa,
    loading: opsLoading,
    error: opsError,
    loadFailures,
  } = useOpsFeatures(role, token, features, enabled);

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
        {/* All dialogs - rendered as section */}
        <DialogsSection
          settingsOpen={ui.settingsOpen}
          onSettingsOpenChange={(open) => setUIState('settingsOpen', open)}
          enabled={enabled}
          userToggles={userToggles}
          onToggleSystem={(system, enabled) => toggleSystem(system as SystemKey, enabled)}
          onResetToggles={resetToggles}
          educateOpen={ui.educateOpen}
          onEducateOpenChange={(open) => setUIState('educateOpen', open)}
          email={email}
          snowOpen={snowOpen}
          onSnowOpenChange={setSnowOpen}
          snowEmail={snowEmail}
          snowCount={snowCount}
          snowItems={snowItems}
          snowLoading={snowLoading}
          snowError={snowError}
          onSnowRefresh={openSnowDialog}
          pfOpsOpen={pfOpsOpen}
          onPfOpsOpenChange={setPfOpsOpen}
          pfOpsTitle={pfOpsTitle}
          pfOpsData={pfOpsData}
          pfOpsLoading={pfOpsLoading}
        />

        {/* Search Section */}
        <SearchSection
          token={token!}
          role={role!}
          originalRole={originalRole!}
          email={email!}
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
          <QuickActionsCard
            qaActive={qaActive as SystemKey}
            onSetQaActive={(system) => setQaActive(system)}
            qaEnabledTabs={qaEnabledTabs}
            resolveSnowEmail={resolveSnowEmail}
            search={search}
            onLoadPfUserInfo={loadPfUserInfo}
            onLoadPfOidc={loadPfOidc}
            onLoadPfConnections={loadPfConnections}
            onLoadPdProfile={loadPdProfile}
            onLoadPdGroups={loadPdGroups}
            onLoadPdAudit={loadPdAudit}
            onLoadMfaStatus={loadMfaStatus}
            onLoadMfaDevices={loadMfaDevices}
            onLoadMfaEvents={loadMfaEvents}
            onLoadAadUser={loadAadUser}
            onLoadAadGroups={loadAadGroups}
            onLoadAadSignins={loadAadSignins}
            onLoadCyberarkSafes={loadCyberarkSafes}
            onLoadCyberarkAccounts={loadCyberarkAccounts}
            onLoadCyberarkActivity={loadCyberarkActivity}
            onLoadSaviynt={loadSaviynt}
            onLoadSaviynt_Roles={loadSaviynt_Roles}
            onLoadSaviynt_Entitlements={loadSaviynt_Entitlements}
            splunkUrl={splunkUrl}
            cloudwatchUrl={cloudwatchUrl}
          />
        )}

        {/* Ops Recent Failures Panel */}
        {role === "ops" && (
          <RecentFailuresPanel
            minutes={minutes}
            onMinutesChange={setMinutes}
            onRefresh={loadFailures}
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