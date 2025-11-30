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
import { Header } from "@/components/Header";
import { LoginForm } from "@/components/LoginForm";
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
// Import role utilities
import { isOpsRole, filterSystemsByRole } from "@/lib/role-utils";
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

  // Simplified usePfOps - now uses actionHandlers map instead of 70+ individual functions
  const {
    pfOpsOpen,
    setPfOpsOpen,
    pfOpsTitle,
    pfOpsLoading,
    pfOpsData,
    qaActive,
    setQaActive,
    actionHandlers,
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
    failures,
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
    let result = orderedSystems.filter((sys: SystemKey) => 
      enabled[sys] && 
      userToggles[sys] && 
      (role !== "ops" || hasSearched)
    );
    
    // Filter systems based on role (applies to ALL roles, not just ops)
    result = filterSystemsByRole(result, role);
    
    console.log('👁️ [VISIBLE SYSTEMS] Calculated visible systems:', result);
    console.log('👁️ [VISIBLE SYSTEMS] Filters - role:', role, 'hasSearched:', hasSearched);
    return result;
  }, [orderedSystems, enabled, userToggles, role, hasSearched]);

  const qaEnabledTabs = useMemo(() => {
    const baseTabs = {
      ...enabled,
      ...(features?.quickActionsTabs || {})
    };
    
    // Filter tabs based on specialized ops role
    if (isOpsRole(role)) {
      const allowedSystems = filterSystemsByRole(SYSTEMS, role);
      return SYSTEMS.reduce((acc, sys) => ({
        ...acc,
        [sys]: baseTabs[sys] && allowedSystems.includes(sys)
      }), {} as Record<SystemKey, boolean>);
    }
    
    return baseTabs;
  }, [enabled, features, role]);

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <Header
        onShowSnowTickets={openSnowDialog}
        snowTicketsCount={snowCount ?? undefined}
        educateEnabled={educateEnabled}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-3 space-y-3">
        {/* All dialogs - rendered as section */}
        <DialogsSection
          settingsOpen={ui.settingsOpen}
          onSettingsOpenChange={(open) => setUIState('settingsOpen', open)}
          enabled={enabled}
          userToggles={userToggles}
          onToggleSystem={(system, enabled) => toggleSystem(system as SystemKey, enabled)}
          onResetToggles={resetToggles}
          role={role}
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

        {/* Ops Quick Actions (tabs) - Refactored to use config-driven actionHandlers */}
        {isOpsRole(role) && hasSearched && (
          <QuickActionsCard
            qaActive={qaActive as SystemKey}
            onSetQaActive={(system) => setQaActive(system)}
            qaEnabledTabs={qaEnabledTabs}
            resolveSnowEmail={resolveSnowEmail}
            search={search}
            actionHandlers={actionHandlers}
            splunkUrl={splunkUrl}
            cloudwatchUrl={cloudwatchUrl}
          />
        )}

        {/* Ops Recent Failures Panel */}
        {isOpsRole(role) && (
          <RecentFailuresPanel
            minutes={minutes}
            onMinutesChange={setMinutes}
            onRefresh={loadFailures}
            loading={opsLoading}
            error={opsError}
            role={role}
            failures={failures}
          />
        )}

        {/* System Cards (hide by default for ops) */}
        <section className="mb-6">
          <div className="mb-2 px-1">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              System Cards
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">View and manage identity data across all integrated systems</p>
          </div>
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
      <footer className="border-t bg-slate-50 dark:bg-slate-900 py-2 mt-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Identity Sphere • 
            <button className="hover:text-foreground transition-colors ml-1">Privacy</button> • 
            <button className="hover:text-foreground transition-colors">Support</button>
          </p>
        </div>
      </footer>
    </div>
  );
}