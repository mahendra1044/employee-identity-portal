"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Copy, RefreshCw, Eye, Code, FileText, ChevronDown, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Globe, Shield } from "lucide-react";
import { API_BASE } from "@/lib/constants";
import { DataDialog } from "@/components/dialogs/DataDialog";
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
  const [data, setData] = useState<SystemData | null>(null);
  const [details, setDetails] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pfOpen, setPfOpen] = useState(false);
  const [pfTitle, setPfTitle] = useState<string>("");
  const [pfLoading, setPfLoading] = useState(false);
  const [pfData, setPfData] = useState<SystemData | null>(null);
  const [description, setDescription] = useState("");
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jsonCollapsed, setJsonCollapsed] = useState(true);

  // Helper: Detect status from data
  const getDataStatus = (data: SystemData | null): 'success' | 'warning' | 'error' | 'loading' | 'empty' => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (!data) return 'empty';
    
    // Check for common status indicators
    const status = String(data?.status || data?.state || data?.enabled || '').toLowerCase();
    if (status.includes('active') || status === 'true' || status === '1') return 'success';
    if (status.includes('inactive') || status.includes('disabled') || status === 'false') return 'warning';
    
    return 'success'; // Default to success if data exists
  };

  // Helper: Extract key metrics from data
  const extractKeyMetrics = (data: SystemData | null): Array<{ icon: string; label: string; value: string }> => {
    if (!data || typeof data !== 'object') return [];
    
    const metrics: Array<{ icon: string; label: string; value: string }> = [];
    const dataObj = data as Record<string, any>;
    
    // Extract common patterns
    if (dataObj.groups || dataObj.memberOf) {
      const groups = Array.isArray(dataObj.groups) ? dataObj.groups : (Array.isArray(dataObj.memberOf) ? dataObj.memberOf : []);
      if (groups.length > 0) metrics.push({ icon: '👥', label: 'Groups', value: String(groups.length) });
    }
    
    if (dataObj.status || dataObj.state) {
      const status = String(dataObj.status || dataObj.state);
      metrics.push({ icon: '🔐', label: 'Status', value: status });
    }
    
    if (dataObj.lastLogin || dataObj.lastSignIn || dataObj.lastActivity) {
      const time = dataObj.lastLogin || dataObj.lastSignIn || dataObj.lastActivity;
      metrics.push({ icon: '📅', label: 'Activity', value: String(time).substring(0, 10) });
    }
    
    if (dataObj.email || dataObj.mail || dataObj.userPrincipalName) {
      const email = dataObj.email || dataObj.mail || dataObj.userPrincipalName;
      metrics.push({ icon: '📧', label: 'Email', value: String(email) });
    }
    
    // Limit to 3 metrics
    return metrics.slice(0, 3);
  };

  const loadInitial = async (showToast = true) => {
    console.log(`🔄 [${system}] loadInitial START - enabled:`, enabled, 'userKey:', userKey, 'token:', !!token);
    
    if (!enabled) {
      console.log(`⏭️ [${system}] SKIP - system not enabled`);
      return;
    }
    
    if (!token) {
      console.log(`⏭️ [${system}] SKIP - no token`);
      return;
    }
    
    let refreshToast;
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
      console.log(`📡 [${system}] FETCH START:`, fullUrl);
      
      const res = await fetch(fullUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log(`📥 [${system}] RESPONSE:`, res.status, res.statusText, res.ok);
      
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
        console.error(`❌ [${system}] FETCH FAILED:`, message);
        throw new Error(message);
      }
      
      const json = await res.json();
      console.log(`✅ [${system}] DATA RECEIVED:`, json);
      
      const extractedData = json.data || json;
      console.log(`💾 [${system}] EXTRACTED DATA:`, extractedData);
      
      setData(extractedData);
      console.log(`🎉 [${system}] STATE UPDATED - data is now set`);
      
      if (showToast) {
        toast.success(`Refreshed ${name}${userKey ? ` for ${userKey}` : ''}`, { id: refreshToast });
      }
    } catch (e: any) {
      console.error(`❌ [${system}] ERROR:`, e.message);
      setError(e.message || "Error loading data");
      if (showToast) {
        toast.error(`Failed to refresh ${name}: ${e.message}`, { id: refreshToast });
      }
    } finally {
      setLoading(false);
      console.log(`🏁 [${system}] loadInitial COMPLETE - loading:false, hasData:${!!data}, hasError:${!!error}`);
    }
  };

  const loadDetails = async () => {
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
        let message = "Failed";
        try {
          const j = await res.json();
          message = j?.error || message;
        } catch {
          try {
            const t = await res.text();
            message = t || message;
          } catch {}
        }
        throw new Error(message);
      }
      const json = await res.json();
      setDetails(json.data || json);
      setDetailsOpen(true);
    } catch (e: any) {
      setError(e.message || "Error loading details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`🔁 [${system}] useEffect TRIGGERED - token:${!!token}, enabled:${enabled}, userKey:"${userKey}"`);
    
    if (userKey !== undefined) {
      console.log(`🔄 [${system}] UserKey changed to "${userKey}", resetting and loading...`);
      setData(null);
      setError(null);
    }
    
    loadInitial(false);
  }, [token, enabled, userKey]);

  // toPairs moved to DataDialog component - no longer needed here

  const submitSnowTicket = async (description?: string): Promise<boolean> => {
    if (!email) {
      toast.error("Email not available - please log in again");
      return false;
    }
    const payload = details || data || {};
    const defaultDesc = `Access issue investigation request for user ${email} in ${system} system. Please review attached payload for details.`;
    const additional = description?.trim() ? `\n\nAdditional information:\n${description.trim()}` : '';
    const ticketDesc = defaultDesc + additional;
    try {
      const res = await fetch("/api/submit-snow-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, payload, userEmail: email, description: ticketDesc }),
      });
      
      let result: any;
      try {
        result = await res.json();
      } catch {
        const text = await res.text();
        console.error('SNOW API returned non-JSON response:', { status: res.status, responseText: text.substring(0, 200) });
        toast.error(`Server error: ${res.status}. Please check server logs.`);
        return false;
      }
      
      if (res.ok) {
        const { ticketNumber } = result;
        toast.success(`SNOW ticket submitted: ${ticketNumber}`);
        console.info('SNOW Ticket Success:', { ticketNumber, system, userEmail: email, description: ticketDesc, payload });
        return true;
      } else {
        toast.error(result.error || "Failed to submit SNOW ticket");
        console.warn('SNOW Ticket Failure:', { system, userEmail: email, status: res.status, error: result.error, description: ticketDesc, payload });
        return false;
      }
    } catch (error) {
      toast.error("Failed to submit SNOW ticket");
      console.error('SNOW Ticket Error:', { system, userEmail: email, error: (error as Error).message, description: ticketDesc, payload });
      return false;
    }
  };

  const openTicketDialog = () => {
    setDescription("");
    setShowPreview(false);
    setTicketDialogOpen(true);
  };

  const handleSubmitTicket = async () => {
    setIsSubmitting(true);
    const success = await submitSnowTicket(description);
    setIsSubmitting(false);
    
    if (success) {
      setTicketDialogOpen(false);
    }
  };

  return (
    <>
      <Card className={`transition-all duration-300 ${
        getDataStatus(data) === 'success' ? 'border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600' :
        getDataStatus(data) === 'warning' ? 'border-2 border-yellow-200 dark:border-yellow-800/50' :
        getDataStatus(data) === 'error' ? 'border-2 border-red-200 dark:border-red-800/50' :
        'border border-slate-200 dark:border-slate-700'
      } bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm`}>
        <CardContent className="p-0">
          {/* Enhanced Header with Status Badge */}
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Status Indicator */}
              {getDataStatus(data) === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
              {getDataStatus(data) === 'warning' && <AlertCircle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />}
              {getDataStatus(data) === 'error' && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
              {getDataStatus(data) === 'loading' && (
                <div className="h-3.5 w-3.5 shrink-0">
                  <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                </div>
              )}
              
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{name}</span>
              {userKey && (
                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded shrink-0">
                  {userKey}
                </span>
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
                    <Button size="sm" variant="ghost" onClick={openTicketDialog} disabled={!enabled} className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <FileText className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Create Ticket</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          
          {/* Key Metrics Row - Phase 2 Lite */}
          {data && !loading && !error && extractKeyMetrics(data).length > 0 && (
            <div className="flex items-center gap-3 px-2 py-1.5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
              {extractKeyMetrics(data).map((metric, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-sm">{metric.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-none">{metric.label}</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none mt-0.5" title={metric.value}>{metric.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                {/* Collapsible JSON Section */}
                <button
                  onClick={() => setJsonCollapsed(!jsonCollapsed)}
                  className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-700 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Code className="h-3 w-3 text-slate-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Raw JSON Data</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">({Object.keys(data).length} fields)</span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${jsonCollapsed ? '' : 'rotate-180'}`} />
                </button>
                
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

      {/* SNOW Ticket Dialog - Redesigned for Better UX */}
      <Dialog open={ticketDialogOpen} onOpenChange={(open) => !isSubmitting && setTicketDialogOpen(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border-2 border-slate-300 dark:border-slate-600 bg-white/95 dark:bg-slate-900/95 shadow-md">
          {/* Compact Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 border-b border-slate-200 dark:border-slate-700">
            <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="text-lg">🎫</span>
              Create ServiceNow Ticket
            </DialogTitle>
          </div>

          {/* Content Area - Reordered Layout */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            <div className="p-4 space-y-3">
              {/* Live Preview Section - Moved to Top */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">👁️</span>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Live Preview
                  </h3>
                  <span className="text-xs text-green-600 dark:text-green-400">● Live</span>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs min-w-[65px]">User:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono text-xs break-all">{email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-semibold text-xs min-w-[65px]">System:</span>
                      <span className="text-slate-700 dark:text-slate-300 text-xs">{system}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-semibold text-xs min-w-[65px]">Payload:</span>
                      <span className="text-slate-700 dark:text-slate-300 text-xs">
                        {details || data ? `${Object.keys(details || data || {}).length} fields included` : 'No data attached'}
                      </span>
                    </div>
                  </div>
                  
                  {description ? (
                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className="text-orange-600 dark:text-orange-400 font-semibold text-xs">Your Note:</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 rounded p-2 border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-700 dark:text-slate-300 text-xs italic leading-relaxed whitespace-pre-wrap break-words">
                          "{description}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-center py-3">
                        <span className="text-xl">✍️</span>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start typing to see your note preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Input - Moved Below Preview */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">📝</span>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Your Description
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500">(Optional)</span>
                </div>
                <Textarea
                  placeholder="Describe the issue or provide additional context...&#x0a;&#x0a;Example: User unable to access application. Need to verify group memberships and authentication logs."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  disabled={isSubmitting}
                  className={`w-full min-h-[140px] resize-none transition-all text-sm ${
                    description.length > 0 ? 'border-blue-300 dark:border-blue-600 ring-1 ring-blue-200 dark:ring-blue-800' : ''
                  } ${description.length > 400 ? 'border-orange-400 dark:border-orange-600 ring-1 ring-orange-200 dark:ring-orange-800' : ''} ${
                    description.length === 500 ? 'border-red-400 dark:border-red-600 ring-1 ring-red-200 dark:ring-red-800' : ''
                  }`}
                />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {description.length === 0 ? '💡 Add context to help resolve faster' : 
                     description.length < 50 ? '✍️ Consider adding more details' : 
                     description.length < 200 ? '✅ Good detail level' : 
                     description.length < 400 ? '🎯 Comprehensive description' : '⚠️ Approaching limit'}
                  </span>
                  <span className={`font-mono font-semibold ${
                    description.length < 200 ? 'text-green-600 dark:text-green-400' : 
                    description.length < 400 ? 'text-blue-600 dark:text-blue-400' : 
                    description.length < 500 ? 'text-orange-600 dark:text-orange-400' : 
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {description.length} / 500
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Footer with Actions */}
          <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Target System:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {name}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTicketDialogOpen(false)}
                disabled={isSubmitting}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                  isSubmitting
                    ? 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed opacity-50'
                    : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitTicket}
                disabled={isSubmitting}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded font-semibold text-xs transition-all ${
                  isSubmitting
                    ? 'bg-green-400 text-white cursor-wait opacity-80'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
