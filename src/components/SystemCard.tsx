"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Eye, Code, FileText, ChevronDown, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Globe, Shield } from "lucide-react";
import { DataDialog } from "@/components/dialogs/DataDialog";
import { SnowTicketDialog } from "@/components/dialogs/SnowTicketDialog";
import { getDataStatus, extractKeyMetrics } from "@/lib/system-card-utils";
import { ErrorHandler } from "@/lib/error-handler";
import { api } from "@/lib/api-client";
import { labels, t } from "@/config/labels";
import type { SystemKey, SystemData } from "@/lib/types";

interface SystemCardProps {
  name: string;
  system: SystemKey;
  enabled: boolean;
  token: string;
  role: string;
  email: string;
  userKey?: string;
}

export function SystemCard({
  name,
  system,
  enabled,
  token,
  role,
  email,
  userKey,
}: SystemCardProps) {
  // Data state
  const [data, setData] = useState<SystemData | null>(null);
  const [details, setDetails] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [jsonCollapsed, setJsonCollapsed] = useState(true);
  
  // Ping Federate specific state
  const [pfOpen, setPfOpen] = useState(false);
  const [pfTitle, setPfTitle] = useState<string>("");
  const [pfLoading, setPfLoading] = useState(false);
  const [pfData, setPfData] = useState<SystemData | null>(null);

  // Use memoized utility results for status detection
  const status = useMemo(() => getDataStatus(data, loading, error), [data, loading, error]);
  const metrics = useMemo(() => extractKeyMetrics(data), [data]);

  // Memoized load function to prevent unnecessary re-renders
  // Uses api client for deduplication and caching
  const loadInitial = useCallback(async (showToast = true, skipCache = false) => {
    if (!enabled || !token) {
      return;
    }
    
    let refreshToast: string | number | undefined;
    if (showToast) {
      const msg = userKey 
        ? t(labels.systemCards.messages.refreshingForUser, { name, userKey })
        : t(labels.systemCards.messages.refreshing, { name });
      refreshToast = toast.loading(msg);
    }
    
    setLoading(true);
    setError(null);
    if (skipCache) {
      setData(null);
    }
    
    try {
      let endpoint;
      if (userKey) {
        endpoint = `/api/search-employee/${encodeURIComponent(userKey)}/details?system=${system}`;
      } else {
        endpoint = `/api/own-${system}`;
      }
      
      // Use api client for deduplication and caching
      const response = await api.get<SystemData>(endpoint, {
        token,
        skipCache,
        cacheTtl: 30000, // 30 second cache
      });
      
      if (!response.ok) {
        throw new Error(response.error || `HTTP ${response.status}`);
      }
      
      setData(response.data || null);
      
      if (showToast) {
        const msg = userKey 
          ? t(labels.systemCards.messages.refreshedForUser, { name, userKey })
          : t(labels.systemCards.messages.refreshed, { name });
        toast.success(msg, { id: refreshToast });
      }
    } catch (e: unknown) {
      const errorMessage = ErrorHandler.parseError(e);
      setError(errorMessage);
      if (showToast) {
        toast.error(t(labels.systemCards.messages.refreshFailed, { name, error: ErrorHandler.getUserFriendlyMessage(e) }), { id: refreshToast });
      }
    } finally {
      setLoading(false);
    }
  }, [enabled, name, system, token, userKey]);

  // Memoized details loader
  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (userKey) {
        response = await api.ops.search.systemDetails(userKey, system, { token });
      } else {
        response = await api.get<SystemData>(`/api/own-${system}/details`, { token });
      }
      
      if (!response.ok) {
        throw new Error(response.error || 'Failed to load details');
      }
      
      const data = response.data as SystemData & { data?: SystemData };
      setDetails(data?.data || data);
      setDetailsOpen(true);
    } catch (e: unknown) {
      setError(ErrorHandler.parseError(e));
    } finally {
      setLoading(false);
    }
  }, [system, token, userKey]);

  // Load data immediately when component mounts - UI is always visible
  // Data populates in as it arrives from the backend
  useEffect(() => {
    if (userKey !== undefined) {
      setData(null);
      setError(null);
    }
    
    // Load immediately - no staggering, UI skeleton is always visible
    loadInitial(false);
  }, [token, enabled, userKey, loadInitial]);

  return (
    <>
      <div className={`rounded-lg border overflow-hidden transition-all duration-200 ${
        status === 'success' ? 'border-slate-200 dark:border-border/40 hover:border-slate-300 dark:hover:border-border/60' :
        status === 'warning' ? 'border-yellow-400 dark:border-yellow-500/30' :
        status === 'error' ? 'border-red-400 dark:border-red-500/30' :
        'border-slate-200 dark:border-border/40'
      } bg-gradient-to-br from-background via-background to-slate-50 dark:to-muted/10 shadow-sm`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-muted/20 border-b border-slate-200 dark:border-border/30">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Status Indicator */}
            {status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
            {status === 'warning' && <AlertCircle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />}
            {status === 'error' && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
            {status === 'loading' && (
              <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin shrink-0" />
            )}
            
            <span className="text-xs font-medium text-foreground truncate">{name}</span>
            {userKey && (
              <div className="inline-flex items-stretch shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-l border border-blue-500/20">
                  <span className="text-[9px]">👤</span>
                  {userKey}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(userKey);
                        toast.success(t(labels.systemCards.messages.copiedUserId, { userId: userKey }));
                      }}
                      className="inline-flex items-center justify-center px-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-r border border-l-0 border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>{labels.systemCards.tooltips.copyUserId}</p></TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-0.5 shrink-0">
            <div className="flex gap-0.5 pr-1.5 border-r border-border/30">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={() => loadInitial(true, true)} disabled={!enabled || loading} className="h-6 w-6 p-0 hover:bg-muted/80">
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{labels.systemCards.tooltips.refresh}</p></TooltipContent>
              </Tooltip>
              {data && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-muted/80" onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                      toast.success(t(labels.systemCards.messages.copiedJson, { name }));
                    }}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{labels.systemCards.tooltips.copyJson}</p></TooltipContent>
                </Tooltip>
              )}
            </div>
            
            <div className="flex gap-0.5 pl-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={loadDetails} disabled={!enabled || loading} className="h-6 w-6 p-0 hover:bg-muted/80">
                    <Eye className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{labels.systemCards.tooltips.viewDetails}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={() => setTicketDialogOpen(true)} disabled={!enabled} className="h-6 w-6 p-0 hover:bg-muted/80">
                    <FileText className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{labels.systemCards.tooltips.createTicket}</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
          
          {system === "ping-federate" && role === "employee" && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-slate-50/50 dark:bg-muted/10 border-t border-slate-200 dark:border-border/20">
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  setPfTitle(labels.systemCards.pingFederate.userInfo.title);
                  setPfOpen(true);
                  setPfLoading(true);
                  try {
                    const response = await api.sso.pingFederate.getUserInfo({ token });
                    setPfData(response.ok ? (response.data as SystemData) : { error: response.error });
                  } catch {
                    setPfData({ error: labels.systemCards.pingFederate.userInfo.error });
                  } finally {
                    setPfLoading(false);
                  }
                }}
                className="h-7 text-[11px]"
              >
                <User className="h-3.5 w-3.5 mr-1" />
                {labels.systemCards.pingFederate.userInfo.button}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  setPfTitle(labels.systemCards.pingFederate.oidc.title);
                  setPfOpen(true);
                  setPfLoading(true);
                  try {
                    const response = await api.sso.pingFederate.getOidcConfig({ token });
                    setPfData(response.ok ? (response.data as SystemData) : { error: response.error });
                  } catch {
                    setPfData({ error: labels.systemCards.pingFederate.oidc.error });
                  } finally {
                    setPfLoading(false);
                  }
                }}
                className="h-7 text-[11px]"
              >
                <Globe className="h-3.5 w-3.5 mr-1" />
                {labels.systemCards.pingFederate.oidc.button}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  setPfTitle(labels.systemCards.pingFederate.saml.title);
                  setPfOpen(true);
                  setPfLoading(true);
                  try {
                    const response = await api.sso.pingFederate.getSamlConfig({ token });
                    setPfData(response.ok ? (response.data as SystemData) : { error: response.error });
                  } catch {
                    setPfData({ error: labels.systemCards.pingFederate.saml.error });
                  } finally {
                    setPfLoading(false);
                  }
                }}
                className="h-7 text-[11px]"
              >
                <Shield className="h-3.5 w-3.5 mr-1" />
                {labels.systemCards.pingFederate.saml.button}
              </Button>
            </div>
          )}
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-6 px-3 space-y-2">
                <div className="p-2 rounded-full bg-muted/50">
                  <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                </div>
                <p className="text-[11px] text-muted-foreground">{t(labels.systemCards.loading, { name })}</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-6 px-3 space-y-2">
                <div className="p-2 rounded-full bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-[11px] text-red-600 dark:text-red-400 text-center max-w-[220px]">{error}</p>
                <Button size="sm" variant="outline" onClick={() => loadInitial(true, true)} className="h-6 text-[11px] border-border/50">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {labels.systemCards.buttons.retry}
                </Button>
              </div>
            ) : data ? (
              <div>
                {/* Metrics + JSON Toggle */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50/50 dark:bg-muted/10 border-b border-slate-200 dark:border-border/20">
                  <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                    {metrics.length > 0 ? (
                      metrics.slice(0, 2).map((metric, idx) => (
                        <div key={idx} className="flex items-center gap-1 min-w-0">
                          <span className="text-[11px] shrink-0">{metric.icon}</span>
                          <span className="text-[11px] font-medium text-foreground truncate" title={`${metric.label}: ${metric.value}`}>
                            {metric.value}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] font-medium text-muted-foreground">{labels.systemCards.status.loaded}</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setJsonCollapsed(!jsonCollapsed)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/80 transition-colors shrink-0"
                  >
                    <Code className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-foreground whitespace-nowrap">{labels.systemCards.labels.json}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                      {Object.keys(data).length}
                    </span>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${jsonCollapsed ? '' : 'rotate-180'}`} />
                  </button>
                </div>
                
                {/* Collapsible JSON Content */}
                <div className={`transition-all duration-300 ${jsonCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-80'}`}>
                  <div className="h-full max-h-80 overflow-y-auto bg-muted/20 custom-scrollbar">
                    <pre className="text-[11px] font-mono p-3 text-foreground/80 whitespace-pre-wrap break-words">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                </div>
                
                {/* Quick Action for collapsed state */}
                {jsonCollapsed && (
                  <div className="px-3 py-2 text-center">
                    <button
                      onClick={() => setJsonCollapsed(false)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {labels.systemCards.labels.expandJson}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 px-3 space-y-2">
                <div className="p-2 rounded-full bg-muted/50">
                  <Code className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground">{labels.systemCards.emptyState}</p>
                <Button size="sm" variant="outline" onClick={() => loadInitial(true, true)} disabled={!enabled} className="h-6 text-[11px] border-border/50">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {labels.systemCards.buttons.loadData}
                </Button>
              </div>
            )}
          </div>
      </div>

      {/* Details Dialog - uses DataDialog with JSON mode */}
      <DataDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={`${name} — Details`}
        data={details}
        loading={loading}
        mode="json"
        maxWidth="4xl"
      />

      {/* SNOW Ticket Dialog - Extracted to separate component */}
      <SnowTicketDialog
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
        systemName={name}
        systemKey={system}
        email={email}
        payload={details || data}
      />

      {/* Ping Federate Dialog - uses DataDialog with auto table/json mode */}
      <DataDialog
        open={pfOpen}
        onOpenChange={setPfOpen}
        title={pfTitle || "Ping Federate"}
        data={pfData}
        loading={pfLoading}
        mode={Array.isArray(pfData) ? "table" : "json"}
        maxWidth="5xl"
      />
    </>
  );
}
