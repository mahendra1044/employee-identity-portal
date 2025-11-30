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
import { Copy, RefreshCw, Eye, Code, FileText } from "lucide-react";
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
  const [htmlOpen, setHtmlOpen] = useState(false);
  const [pfOpen, setPfOpen] = useState(false);
  const [pfTitle, setPfTitle] = useState<string>("");
  const [pfLoading, setPfLoading] = useState(false);
  const [pfData, setPfData] = useState<SystemData | null>(null);
  const [description, setDescription] = useState("");
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openHtmlView = async () => {
    if (!details && !data && enabled && !loading) {
      try {
        await loadInitial();
      } catch {}
    }
    setHtmlOpen(true);
  };

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
      <Card className="shadow-sm relative">
        {userKey && (
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded opacity-90">
            For: {userKey}
          </div>
        )}
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="secondary" onClick={() => loadInitial(true)} disabled={!enabled || loading}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh system data</p>
              </TooltipContent>
            </Tooltip>
            {data && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                      toast.success(`Copied ${name} JSON to clipboard`);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy JSON to clipboard</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={loadDetails} disabled={!enabled || loading}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View detailed information</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={openHtmlView} disabled={!enabled || loading}>
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View in readable format</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={openTicketDialog} disabled={!enabled}>
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create ServiceNow ticket</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {system === "ping-federate" && role === "employee" && (
            <div className="flex flex-wrap gap-2 justify-center p-3 bg-muted/50 rounded-lg">
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
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground animate-pulse">Loading data...</p>
                {userKey && <p className="text-xs text-muted-foreground mt-1">Fetching data for {userKey}</p>}
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-600">{error}</p>
                <Button size="sm" variant="outline" onClick={() => loadInitial(true)} className="mt-2">
                  Retry
                </Button>
              </div>
            ) : data ? (
              <div>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-96">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No data yet</p>
                {userKey && <p className="text-xs text-muted-foreground mt-1">Expected data for {userKey}</p>}
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

      {/* HTML View Dialog - uses DataDialog with html mode */}
      <DataDialog
        open={htmlOpen}
        onOpenChange={setHtmlOpen}
        title={`${name} — HTML View`}
        data={details || data}
        mode="html"
        maxWidth="5xl"
        showCopy={false}
      />

      {/* SNOW Ticket Dialog - Enhanced Design */}
      <Dialog open={ticketDialogOpen} onOpenChange={(open) => !isSubmitting && setTicketDialogOpen(open)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border-2 border-white/20 dark:border-white/10 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 shadow-2xl">
          {/* Phase 1: Enhanced Header with Gradient */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-blue-50/30 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-start gap-4">
              <div className="text-4xl mt-1">🎫</div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Create ServiceNow Ticket
                </DialogTitle>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">System:</span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                    {name}
                  </span>
                </div>
                <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                  Enter additional details if needed. This will be included in the ticket description.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Content Area with Pattern Background */}
          <div className="flex-1 overflow-y-auto relative bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-950/50">
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}></div>
            
            <div className="relative p-6 space-y-4">
              {/* Phase 2: Smart Textarea */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📝</span>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Additional Information <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
                  </h3>
                </div>
                <Textarea
                  placeholder="Example: User reports access denied when trying to authenticate. Need to investigate group memberships..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  disabled={isSubmitting}
                  className={`w-full min-h-[120px] resize-none transition-colors ${
                    description.length > 0 ? 'border-blue-300 dark:border-blue-600' : ''
                  } ${description.length > 400 ? 'border-orange-400 dark:border-orange-500' : ''} ${
                    description.length === 500 ? 'border-red-400 dark:border-red-500' : ''
                  }`}
                />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {description.length === 0 ? 'Provide context to help resolve faster' : 
                     description.length < 50 ? 'Add more details' : 
                     description.length < 200 ? 'Good detail' : 'Comprehensive'}
                  </span>
                  <span className={`font-mono font-medium ${
                    description.length < 200 ? 'text-green-600 dark:text-green-400' : 
                    description.length < 400 ? 'text-yellow-600 dark:text-yellow-400' : 
                    description.length < 500 ? 'text-orange-600 dark:text-orange-400' : 
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {description.length} / 500
                  </span>
                </div>
              </div>

              {/* Phase 3: Preview Section */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white/80 dark:bg-slate-800/80">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👁️</span>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ticket Preview</h3>
                  </div>
                  <svg className={`h-4 w-4 text-slate-500 transition-transform ${showPreview ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showPreview && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded p-3 space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-medium min-w-[70px]">User:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{email}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-purple-600 dark:text-purple-400 font-medium min-w-[70px]">System:</span>
                        <span className="text-slate-700 dark:text-slate-300">{system}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-green-600 dark:text-green-400 font-medium min-w-[70px]">Payload:</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {details || data ? `${Object.keys(details || data || {}).length} fields` : 'No data'}
                        </span>
                      </div>
                      {description && (
                        <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-orange-600 dark:text-orange-400 font-medium min-w-[70px]">Note:</span>
                          <span className="text-slate-700 dark:text-slate-300 italic text-xs">
                            "{description.substring(0, 80)}{description.length > 80 ? '...' : ''}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phase 4 & 5: Enhanced Buttons with Submit Flow */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={() => setTicketDialogOpen(false)}
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-lg text-sm font-medium border shadow-sm transition-all ${
                isSubmitting
                  ? 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed opacity-50'
                  : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitTicket}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm shadow-lg transition-all ${
                isSubmitting
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white cursor-wait'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Ticket
                </>
              )}
            </button>
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
