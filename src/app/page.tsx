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
import { useOpsActions } from "@/hooks/useOpsActions";
import { useAppAuth } from "@/hooks/useAppAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAppToggles } from "@/hooks/useAppToggles";
import { useAppUI } from "@/hooks/useAppUI";
import { useFeatures } from "@/hooks/useFeatures";
import { useThemeDOM } from "@/hooks/useThemeDOM";
import { useOpsFeatures } from "@/hooks/useOpsFeatures";
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
// Import from constants
import { SYSTEMS, SYSTEM_LABELS, API_BASE } from "@/lib/constants";
// Import from centralized config
import { SPLUNK_CONFIG, CLOUDWATCH_CONFIG } from "@/config";
// Import from services
import { StorageService } from "@/lib/storage";
import { ErrorHandler } from "@/lib/error-handler";
// Import role utilities
import { isOpsRole, filterSystemsByRole } from "@/lib/role-utils";
// Import types
import type { Features, LoginResponse, SystemKey } from "@/lib/types";

export default function HomePage() {
  const { token, role: originalRole, userId, login, logout } = useAppAuth();
  const { theme, setTheme } = useAppTheme();
  const { toggles: userToggles, toggleSystem, resetToggles } = useAppToggles();
  const { ui, setUIState } = useAppUI();

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
  } = useSnow(token, role, search, searchResults, hasSearched, userId);

  // Quick Actions state - uses config-driven actionHandlers map
  const {
    dialogOpen: pfOpsOpen,
    setDialogOpen: setPfOpsOpen,
    dialogTitle: pfOpsTitle,
    dialogLoading: pfOpsLoading,
    dialogData: pfOpsData,
    activeTab: qaActive,
    setActiveTab: setQaActive,
    actionHandlers,
  } = useOpsActions();

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

  // Load features and theme using custom hooks
  const { features, educateEnabled } = useFeatures(token);
  useThemeDOM(theme);

  // userToggles initialization is handled by useAppToggles hook

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

  // External service URLs from centralized config
  const splunkUrl = SPLUNK_CONFIG.baseUrl;
  const cloudwatchUrl = CLOUDWATCH_CONFIG.baseUrl;

  // Resolve the user key for system card queries
  const resolveUserKey = useMemo(() => {
    // Only resolve user key for ALL roles if search was performed
    if (!hasSearched || !searchResults) {
      return undefined;
    }
    
    const q = String(search || '').trim().toLowerCase();
    const pd = Array.isArray(searchResults?.["ping-directory"]) ? searchResults["ping-directory"] : [];
    
    const exact = pd.find((u: any) => 
      String(u?.email || '').toLowerCase() === q || 
      String(u?.userId || '').toLowerCase() === q
    );
    
    if (exact?.userId || exact?.email) {
      return exact.userId || exact.email;
    }
    
    if (pd[0]?.userId || pd[0]?.email) {
      return pd[0].userId || pd[0].email;
    }
    
    return q || undefined;
  }, [search, searchResults, hasSearched]);

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
          email={userId}
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
          email={userId!}
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
          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-slate-300 dark:border-slate-600 shadow-md">
            <CardContent className="pt-0 px-2 pb-2">
              {/* Section Header */}
              <div className="relative pr-2 pb-0.5 mb-1 rounded-md bg-gradient-to-r from-slate-50 to-transparent dark:from-neutral-800/40 [.navy_&]:from-blue-900/50">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-600 dark:bg-neutral-600 [.navy_&]:bg-blue-600 text-white shrink-0">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-50 [.navy_&]:text-blue-50 leading-none">
                      System Cards
                    </h2>
                    <p className="text-[11px] text-slate-600 dark:text-neutral-300 [.navy_&]:text-blue-200 leading-tight mt-0.5">View and manage identity data across all integrated systems</p>
                  </div>
                </div>
              </div>
              <SystemCardsGrid
                visibleSystems={visibleSystems}
                enabled={enabled}
                token={token!}
                role={role!}
                email={userId!}
                userKey={resolveUserKey}
                anyEnabled={anyEnabled}
              />
            </CardContent>
          </Card>
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