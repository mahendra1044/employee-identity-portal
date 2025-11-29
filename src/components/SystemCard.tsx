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

  const submitSnowTicket = async (description?: string) => {
    if (!email) {
      toast.error("Email not available - please log in again");
      return;
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
        return;
      }
      
      if (res.ok) {
        const { ticketNumber } = result;
        toast.success(`SNOW ticket submitted: ${ticketNumber}`);
        console.info('SNOW Ticket Success:', { ticketNumber, system, userEmail: email, description: ticketDesc, payload });
      } else {
        toast.error(result.error || "Failed to submit SNOW ticket");
        console.warn('SNOW Ticket Failure:', { system, userEmail: email, status: res.status, error: result.error, description: ticketDesc, payload });
      }
    } catch (error) {
      toast.error("Failed to submit SNOW ticket");
      console.error('SNOW Ticket Error:', { system, userEmail: email, error: (error as Error).message, description: ticketDesc, payload });
    }
  };

  const openTicketDialog = () => {
    setDescription("");
    setTicketDialogOpen(true);
  };

  const handleSubmitTicket = () => {
    submitSnowTicket(description);
    setTicketDialogOpen(false);
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
                title="Fetch and view user information from Ping Federate"
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
                title="View OIDC connections in Ping Federate"
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
                title="View SAML connections in Ping Federate"
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

      {/* SNOW Ticket Dialog - custom content, can't use DataDialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create SNOW Ticket for {name}</DialogTitle>
            <DialogDescription>Enter additional details if needed. This will be included in the ticket description.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6">
              <Textarea
                placeholder="Optional: Add more information about the access issue or investigation needed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[120px] resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 p-6 pt-4 border-t flex-shrink-0">
              <Button type="button" variant="outline" onClick={() => setTicketDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmitTicket}>
                Submit Ticket
              </Button>
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
