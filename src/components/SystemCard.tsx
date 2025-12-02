"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Eye, Code, FileText, ChevronDown, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Globe, Shield } from "lucide-react";
import { API_BASE } from "@/lib/constants";
import { DataDialog } from "@/components/dialogs/DataDialog";
import { SnowTicketDialog } from "@/components/dialogs/SnowTicketDialog";
import { getDataStatus, extractKeyMetrics } from "@/lib/system-card-utils";
import { ErrorHandler } from "@/lib/error-handler";
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
  const loadInitial = useCallback(async (showToast = true) => {
    if (!enabled || !token) {
      return;
    }
    
    let refreshToast: string | number | undefined;
    if (showToast) {
      refreshToast = toast.loading(`Refreshing ${name}${userKey ? ` for ${userKey}` : ''}...`);
    }
    
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      let endpoint;
      if (userKey) {
        endpoint = `/api/search-employee/${encodeURIComponent(userKey)}/details?system=${system}`;
      } else {
        endpoint = `/api/own-${system}`;
      }
      
      const fullUrl = userKey ? endpoint : `${API_BASE}${endpoint}`;
      
      const res = await fetch(fullUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          message = j?.error || j?.message || message;
        } catch {
          try {
            const t = await res.text();
            message = t || message;
          } catch {}
        }
        throw new Error(message);
      }
      
      const json = await res.json();
      const extractedData = json.data || json;
      setData(extractedData);
      
      if (showToast) {
        toast.success(`Refreshed ${name}${userKey ? ` for ${userKey}` : ''}`, { id: refreshToast });
      }
    } catch (e: unknown) {
      const errorMessage = ErrorHandler.parseError(e);
      setError(errorMessage);
      if (showToast) {
        toast.error(`Failed to refresh ${name}: ${ErrorHandler.getUserFriendlyMessage(e)}`, { id: refreshToast });
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
      let endpoint;
      if (userKey) {
        endpoint = `/api/search-employee/${encodeURIComponent(userKey)}/details?system=${system}`;
      } else {
        endpoint = `/api/own-${system}/details`;
      }
      const fullUrl = userKey ? endpoint : `${API_BASE}${endpoint}`;
      const res = await fetch(fullUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMessage = await ErrorHandler.parseResponseError(res);
        throw new Error(errorMessage);
      }
      const json = await res.json();
      setDetails(json.data || json);
      setDetailsOpen(true);
    } catch (e: unknown) {
      setError(ErrorHandler.parseError(e));
    } finally {
      setLoading(false);
    }
  }, [system, token, userKey]);

  useEffect(() => {
    if (userKey !== undefined) {
      setData(null);
      setError(null);
    }
    
    loadInitial(false);
  }, [token, enabled, userKey]);

  return (
    <>
      <Card className={`transition-all duration-300 ${
        status === 'success' ? 'border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600' :
        status === 'warning' ? 'border-2 border-yellow-200 dark:border-yellow-800/50' :
        status === 'error' ? 'border-2 border-red-200 dark:border-red-800/50' :
        'border border-slate-200 dark:border-slate-700'
      } bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm`}>
        <CardContent className="p-0">
          {/* Enhanced Header with Status Badge */}
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Status Indicator */}
              {status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
              {status === 'warning' && <AlertCircle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />}
              {status === 'error' && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
              {status === 'loading' && (
                <div className="h-3.5 w-3.5 shrink-0">
                  <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                </div>
              )}
              
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{name}</span>
              {userKey && (
                <div className="inline-flex items-stretch shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-l border border-blue-200 dark:border-blue-800/50">
                    <span className="text-[10px]">👤</span>
                    {userKey}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(userKey);
                          toast.success(`Copied User ID: ${userKey}`);
                        }}
                        className="inline-flex items-center justify-center px-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-r border border-l-0 border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>Copy User ID</p></TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
            
            {/* Grouped Action Buttons */}
            <div className="flex gap-1 shrink-0">
              {/* Primary Actions */}
              <div className="flex gap-0.5 pr-1 border-r border-slate-300 dark:border-slate-600">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" onClick={() => loadInitial(true)} disabled={!enabled || loading} className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Refresh</p></TooltipContent>
                </Tooltip>
                {data && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                        toast.success(`Copied ${name} JSON`);
                      }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Copy JSON</p></TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              {/* View Actions */}
              <div className="flex gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" onClick={loadDetails} disabled={!enabled || loading} className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Details</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" onClick={() => setTicketDialogOpen(true)} disabled={!enabled} className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <FileText className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Create Ticket</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          
          {system === "ping-federate" && role === "employee" && (
            <div className="flex flex-wrap gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  setPfTitle("Ping Federate — User Info");
                  setPfOpen(true);
                  setPfLoading(true);
                  try {
                    const res = await fetch("/api/pf/userinfo");
                    const j = await res.json().catch(() => ({}));
                    setPfData(j?.data ?? j);
                  } catch {
                    setPfData({ error: "Failed to load User Info" });
                  } finally {
                    setPfLoading(false);
                  }
                }}
              >
                <User className="h-4 w-4 mr-1" />
                User Info
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  setPfTitle("Ping Federate — OIDC Connections");
                  setPfOpen(true);
                  setPfLoading(true);
                  try {
                    const res = await fetch("/api/pf/oidc");
                    const j = await res.json().catch(() => ({}));
                    setPfData(j?.data ?? j);
                  } catch {
                    setPfData({ error: "Failed to load OIDC connections" });
                  } finally {
                    setPfLoading(false);
                  }
                }}
              >
                <Globe className="h-4 w-4 mr-1" />
                OIDC
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  setPfTitle("Ping Federate — SAML Connections");
                  setPfOpen(true);
                  setPfLoading(true);
                  try {
                    const res = await fetch("/api/pf/saml");
                    const j = await res.json().catch(() => ({}));
                    setPfData(j?.data ?? j);
                  } catch {
                    setPfData({ error: "Failed to load SAML connections" });
                  } finally {
                    setPfLoading(false);
                  }
                }}
              >
                <Shield className="h-4 w-4 mr-1" />
                SAML
              </Button>
            </div>
          )}
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 px-2 space-y-2">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Loading {name} data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-6 px-2 space-y-3">
                <XCircle className="h-10 w-10 text-red-500" />
                <p className="text-xs text-red-600 dark:text-red-400 text-center max-w-[250px]">{error}</p>
                <Button size="sm" variant="outline" onClick={() => loadInitial(true)} className="h-7 text-xs hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            ) : data ? (
              <div>
                {/* Combined Metrics + JSON Toggle Row */}
                <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
                  {/* LEFT: Key metrics (max 2 items to prevent overlap) */}
                  <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                    {metrics.length > 0 ? (
                      metrics.slice(0, 2).map((metric, idx) => (
                        <div key={idx} className="flex items-center gap-1 min-w-0">
                          <span className="text-xs shrink-0">{metric.icon}</span>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" title={`${metric.label}: ${metric.value}`}>
                            {metric.value}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Data loaded</span>
                    )}
                  </div>
                  
                  {/* RIGHT: Compact JSON toggle */}
                  <button
                    onClick={() => setJsonCollapsed(!jsonCollapsed)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                  >
                    <Code className="h-3 w-3 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">JSON</span>
                    <span className="text-[10px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                      {Object.keys(data).length}
                    </span>
                    <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${jsonCollapsed ? '' : 'rotate-180'}`} />
                  </button>
                </div>
                
                {/* Collapsible JSON Content */}
                <div className={`transition-all duration-300 ${jsonCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-96'}`}>
                  <div className="h-full max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                    <pre className="text-sm font-mono p-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                </div>
                
                {/* Quick Action for collapsed state */}
                {jsonCollapsed && (
                  <div className="px-2 py-2 text-center">
                    <button
                      onClick={() => setJsonCollapsed(false)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Expand to view full JSON ↓
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-2 space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Code className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">No data available</p>
                <Button size="sm" variant="outline" onClick={() => loadInitial(true)} disabled={!enabled} className="h-7 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Load Data
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
