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
import EDUCATE_CONFIG from "@/lib/educate-config.json";
import { Header, LoginForm } from "@/components/layout-index";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001"; // Backend API base for auth/search/own/config calls

type Features = {
  credentialSource: string;
  useMocks: boolean;
  useMockAuth: boolean;
  systems: Record<string, boolean>;
  // Optional config additions
  opsShowTilesAfterSearch?: boolean;
  employeeSearchSystems?: Partial<Record<SystemKey, boolean>>;
  systemsOrder?: SystemKey[]; // NEW: optional preferred order for system cards
  // Employee educate guide (optional, can be toggled at deploy time)
  employeeEducateGuideEnabled?: boolean;
  // Ops Quick Actions tabs enable/disable per system (deployment-time configurable)
  quickActionsTabs?: Partial<Record<SystemKey, boolean>>;
};

type LoginResponse = { token: string; role: string; email: string };

type SystemKey =
  | "ping-directory"
  | "ping-federate"
  | "cyberark"
  | "saviynt"
  | "azure-ad"
  | "ping-mfa";

const SYSTEMS: SystemKey[] = [
  "ping-directory",
  "ping-federate",
  "cyberark",
  "saviynt",
  "azure-ad",
  "ping-mfa",
];

// Human-readable labels for systems
const SYSTEM_LABELS: Record<SystemKey, string> = {
  "ping-directory": "Ping Directory",
  "ping-federate": "Ping Federate",
  "cyberark": "CyberArk",
  "saviynt": "Saviynt",
  "azure-ad": "Azure AD",
  "ping-mfa": "Ping MFA",
};

// Helper function to format role names professionally
function formatRoleName(role: string): string {
  const roleMap: Record<string, string> = {
    "ops": "Operations Team",
    "employee": "Employee Access",
    "management": "Management",
  };
  return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
}

// Helper function to get role icon
function getRoleIcon(role: string) {
  if (role === "ops") return <Users className="h-3 w-3" />;
  if (role === "employee") return <User className="h-3 w-3" />;
  return <User className="h-3 w-3" />;
}

function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem("token");
      const r = localStorage.getItem("role");
      const e = localStorage.getItem("email");
      if (t && r && e) {
        setToken(t);
        setRole(r);
        setEmail(e);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // FIXED: Use Next.js API route instead of backend directly
    const res = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data: LoginResponse = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);
    }
    setToken(data.token);
    setRole(data.role);
    setEmail(data.email);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
    }
    setToken(null);
    setRole(null);
    setEmail(null);
  };

  return { token, role, email, login, logout };
}

function SystemCard({
  name,
  system,
  enabled,
  token,
  role,
  email,
  userKey,
}: {
  name: string;
  system: SystemKey;
  enabled: boolean;
  token: string;
  role: string;
  email: string;
  userKey?: string;
}) {
  const [data, setData] = useState<any | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [htmlOpen, setHtmlOpen] = useState(false);
  // PF employee popup state
  const [pfOpen, setPfOpen] = useState(false);
  const [pfTitle, setPfTitle] = useState<string>("");
  const [pfLoading, setPfLoading] = useState(false);
  const [pfData, setPfData] = useState<any>(null);
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
    setData(null); // Clear previous data
    
    try {
      let endpoint;
      if (userKey) {
        // FIXED: Use relative URL for Next.js API routes (search-employee exists only in Next.js, not Express backend)
        endpoint = `/api/search-employee/${encodeURIComponent(userKey)}/details?system=${system}`;
      } else {
        // Use backend for own-* endpoints
        endpoint = `/api/own-${system}`;
      }
      
      // FIXED: Only use API_BASE for backend endpoints (own-*), not Next.js routes (search-employee)
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
        // FIXED: Use relative URL for Next.js API routes
        endpoint = `/api/search-employee/${encodeURIComponent(userKey)}/details?system=${system}`;
      } else {
        endpoint = `/api/own-${system}/details`;
      }
      // FIXED: Only use API_BASE for backend (own-*) endpoints
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
    
    // Reset state when userKey changes
    if (userKey !== undefined) {
      console.log(`🔄 [${system}] UserKey changed to "${userKey}", resetting and loading...`);
      setData(null);
      setError(null);
    }
    
    loadInitial(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, enabled, userKey]);

  // helper to flatten JSON into key/value pairs for readable HTML view
  const toPairs = (obj: any): Array<{ k: string; v: any }> => {
    const out: Array<{ k: string; v: any }> = [];
    const walk = (val: any, prefix = "") => {
      if (val === null || val === undefined) {
        out.push({ k: prefix || "value", v: String(val) });
        return;
      }
      if (Array.isArray(val)) {
        if (val.length === 0) {
          out.push({ k: prefix, v: "[]" });
        } else {
          val.forEach((item, idx) => walk(item, prefix ? `${prefix}[${idx}]` : `[${idx}]`));
        }
        return;
      }
      if (typeof val === "object") {
        const keys = Object.keys(val);
        if (keys.length === 0) {
          out.push({ k: prefix, v: "{}" });
        } else {
          keys.forEach((key) => walk(val[key], prefix ? `${prefix}.${key}` : key));
        }
        return;
      }
      out.push({ k: prefix || "value", v: val });
    };
    walk(obj);
    return out;
  };

  const openHtmlView = async () => {
    // ensure we have something to show; try initial if nothing loaded yet
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
      const result = await res.json();
      if (res.ok) {
        const { ticketNumber } = result;
        toast.success(`SNOW ticket submitted: ${ticketNumber}`);
        console.info('SNOW Ticket Success:', { ticketNumber, system, userEmail: email, description: ticketDesc, payload });
      } else {
        toast.error(result.error || "Failed to submit SNOW ticket");
        console.warn('SNOW Ticket Failure:', { system, userEmail: email, status: res.status, error: result.error || await res.text(), description: ticketDesc, payload });
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between w-full pr-12">
              <span>{name} — Details</span>
              {details && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(details, null, 2))}
                  title="Copy JSON to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {loading ? (
            <p className="text-sm animate-pulse">Loading details...</p>
          ) : details ? (
            <pre className="flex-1 text-xs bg-muted p-2 rounded overflow-auto m-0">
              {JSON.stringify(details, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">No details available</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={htmlOpen} onOpenChange={setHtmlOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="pr-12">{name} — HTML View</DialogTitle>
          </DialogHeader>
          {(() => {
            const payload = details || data;
            if (!payload) return <p className="text-sm text-muted-foreground">No data available to display</p>;
            const pairs = toPairs(payload).slice(0, 1000); // safety cap
            return (
              <div className="flex-1 overflow-auto pr-1">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                  {pairs.map(({ k, v }) => (
                    <div key={k} className="flex flex-col py-1 border-b last:border-b-0 border-border/60">
                      <dt className="text-xs font-medium text-muted-foreground truncate">{k}</dt>
                      <dd className="text-sm break-words">
                        {typeof v === "string" || typeof v === "number" || typeof v === "boolean"
                          ? String(v)
                          : JSON.stringify(v)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Ticket Dialog */}
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

      {/* PF Employee Dialog */}
      <Dialog open={pfOpen} onOpenChange={setPfOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between w-full pr-12">
              <span>{pfTitle || "Ping Federate"}</span>
              {pfData && (
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(JSON.stringify(pfData, null, 2))} title="Copy JSON to clipboard">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {pfLoading ? (
            <p className="text-sm animate-pulse">Loading...</p>
          ) : Array.isArray(pfData) ? (
            <div className="flex-1 overflow-auto pr-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(pfData[0] || {}).map((k) => (
                      <TableHead key={k} className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pfData.map((row: any, idx: number) => (
                    <TableRow key={idx}>
                      {Object.keys(pfData[0] || {}).map((k) => (
                        <TableCell key={k} className="text-sm break-words">{String(row[k])}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : pfData ? (
            <pre className="flex-1 text-xs bg-muted p-2 rounded overflow-auto m-0">
              {JSON.stringify(pfData, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">No data available</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}



export default function HomePage() {
  const { token, role: originalRole, email, login, logout } = useAuth();
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
  const [theme, setTheme] = useState<"light" | "dark" | "navy">();
  const [minutes, setMinutes] = useState<number>(10);
  const [failFed, setFailFed] = useState<any[] | null>(null);
  const [failMfa, setFailMfa] = useState<any[] | null>(null);
  const [opsLoading, setOpsLoading] = useState(false);
  const [opsError, setOpsError] = useState<string | null>(null);
  // search-related state now managed by `useSearch`
  const [snowOpen, setSnowOpen] = useState(false);
  const [snowLoading, setSnowLoading] = useState(false);
  const [snowError, setSnowError] = useState<string | null>(null);
  const [snowCount, setSnowCount] = useState<number | null>(null);
  const [snowItems, setSnowItems] = useState<any[] | null>(null);
  const [snowEmail, setSnowEmail] = useState<string | null>(null);
  const [educateOpen, setEducateOpen] = useState(false);
  const [pfOpsOpen, setPfOpsOpen] = useState(false);
  const [pfOpsTitle, setPfOpsTitle] = useState<string>("");
  const [pfOpsLoading, setPfOpsLoading] = useState(false);
  const [pfOpsData, setPfOpsData] = useState<any>(null);
  const [qaActive, setQaActive] = useState<SystemKey>("ping-federate");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userToggles, setUserToggles] = useState<Record<SystemKey, boolean>>({} as Record<SystemKey, boolean>);

  // Role toggle state - effective role for UI rendering (resets on refresh)
  const [effectiveRole, setEffectiveRole] = useState<string | null>(null);

  // Initialize effective role when originalRole changes (on login or refresh)
  useEffect(() => {
    setEffectiveRole(originalRole);
  }, [originalRole]);

  // Current role for UI rendering (effectiveRole if set, otherwise originalRole)
  const role = effectiveRole || originalRole;

  // Toggle between ops and employee mode (only available for original ops users)
  const toggleRole = () => {
    if (originalRole !== "ops") return;
    
    const newRole = effectiveRole === "ops" ? "employee" : "ops";
    setEffectiveRole(newRole);
    toast.success(`Switched to ${newRole} mode`);
  };

  // Initialize user toggles from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("systemToggles");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserToggles(parsed);
        } catch {
          // Invalid JSON, reset to empty
          localStorage.removeItem("systemToggles");
          setUserToggles({} as Record<SystemKey, boolean>);
        }
      }
    }
  }, []);

  // Apply theme class to root element and persist to localStorage
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
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const isAggregate = useMemo(() => {
    return !!searchDialogData && typeof searchDialogData === 'object' && Object.keys(searchDialogData).some(k => SYSTEMS.includes(k as SystemKey));
  }, [searchDialogData]);

  // helper for HTML view in search dialog (global)
  const toPairsGlobal = (obj: any): Array<{ k: string; v: any }> => {
    const out: Array<{ k: string; v: any }> = [];
    const walk = (val: any, prefix = "") => {
      if (val === null || val === undefined) {
        out.push({ k: prefix || "value", v: String(val) });
        return;
      }
      if (Array.isArray(val)) {
        if (val.length === 0) {
          out.push({ k: prefix, v: "[]" });
        } else {
          val.forEach((item, idx) => walk(item, prefix ? `${prefix}[${idx}]` : `[${idx}]`));
        }
        return;
      }
      if (typeof val === "object") {
        const keys = Object.keys(val);
        if (keys.length === 0) {
          out.push({ k: prefix, v: "{}" });
        } else {
          keys.forEach((key) => walk(val[key], prefix ? `${prefix}.${key}` : key));
        }
        return;
      }
      out.push({ k: prefix || "value", v: val });
    };
    walk(obj);
    return out;
  };

  // Static, shared mock guide (same for all employees)
  const EDUCATE_GUIDE = useMemo(() => ({
    "ping-directory": {
      title: "Ping Directory",
      summary: "",
    },
    "ping-federate": {
      title: "Ping Federate",
      summary: "",
    },
    "cyberark": {
      title: "CyberArk",
      summary: "",
    },
    "saviynt": {
      title: "Saviynt",
      summary: "",
    },
    "azure-ad": {
      title: "Azure AD",
      summary: "",
    },
    "ping-mfa": {
      title: "Ping MFA",
      summary: "",
    },
  }), [email]);

  // Deployment-time toggle: env overrides features when provided
  const educateEnabled = useMemo(() => {
    const envVal = (process.env.NEXT_PUBLIC_EDUCATE_GUIDE || "").toString().trim().toLowerCase();
    if (envVal) return ["1", "true", "on", "yes", "enabled"].includes(envVal);
    return features?.employeeEducateGuideEnabled ?? true; // default ON if not specified
  }, [features]);

  useEffect(() => {
    // init theme from localStorage; default to light regardless of system
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark" || stored === "navy") {
        setTheme(stored);
      } else {
        setTheme("light");
      }
    } else {
      setTheme("light");
    }
  }, []);

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

  // Initialize user toggles to defaults after features load
  useEffect(() => {
    if (!features || !token) return;
    const defaults = SYSTEMS.reduce((acc, s) => ({ ...acc, [s]: !!(features.systems[s] ?? false) }), {} as Record<SystemKey, boolean>);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("systemToggles");
      const parsed = stored ? JSON.parse(stored) : {};
      const updatedToggles = { ...defaults, ...parsed };
      setUserToggles(updatedToggles);
      localStorage.setItem("systemToggles", JSON.stringify(updatedToggles));
    } else {
      setUserToggles(defaults);
    }
  }, [features, token]);

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
  // Helper: decide which email to use for SNOW incidents based on role/search
  const resolveSnowEmail = (): string | null => {
    const self = String(email || (typeof window !== 'undefined' ? localStorage.getItem("email") : '') || '').toLowerCase();
    if (role === 'ops') {
      // Only after a search should ops see/incidents for a user
      if (!hasSearched) return null;
      const q = String(search || '').trim().toLowerCase();
      // If the query itself looks like an email, prefer it
      if (q && q.includes('@') && q.includes('.')) return q;
      // Otherwise try first Ping Directory result's email
      const pd = Array.isArray((searchResults as any)?.["ping-directory"]) ? (searchResults as any)["ping-directory"] : [];
      const exact = pd.find((u: any) => String(u?.email || '').toLowerCase() === q || String(u?.userId || '') === String(search || '').trim());
      if (exact?.email) return String(exact.email).toLowerCase();
      if (pd[0]?.email) return String(pd[0].email).toLowerCase();
      return null;
    }
    return self || null;
  };

  // Open SNOW dialog and fetch incidents
  const openSnowDialog = async () => {
    if (!token) return;
    const target = resolveSnowEmail();
    // Only block when ops has no valid searched target; employees can proceed (backend uses self email)
    if (role === 'ops' && !target) {
      toast.error('No target user found for SNOW incidents');
      return;
    }
    setSnowOpen(true);
    setSnowLoading(true);
    setSnowError(null);
    setSnowItems(null);
    // For employees, prefer server-returned email; prefill with best-known fallback
    const selfFallback = (typeof window !== 'undefined' ? localStorage.getItem('email') : '') || email || '';
    setSnowEmail(role === 'ops' ? target : (target || String(selfFallback).toLowerCase()))
    try {
      const base = `${API_BASE}/api/snow/incidents`;
      const url = role === 'ops' ? `${base}?email=${encodeURIComponent(String(target))}` : base;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to load incidents');
      // Ensure dialog shows the actual email resolved by the server
      if (json?.email) {
        setSnowEmail(String(json.email));
      }
      const items = Array.isArray(json?.items) ? json.items : [];
      // Fallback demo incidents on empty payloads (helps employee role in mock mode)
      const mkDemo = () => {
        const now = Date.now();
        const iso = (ms: number) => new Date(ms).toISOString();
        const assigned = String(json?.email || target || selfFallback).toLowerCase();
        return [
          { number: `INC-DEMO-${Math.floor(Math.random()*1_000_000).toString().padStart(6,'0')}`, short_description: 'Demo: Access issue with corporate app', state: 'open', priority: '3 - Moderate', updatedAt: iso(now), assigned_to: assigned },
          { number: `INC-DEMO-${Math.floor(Math.random()*1_000_000).toString().padStart(6,'0')}`, short_description: 'Demo: MFA verification pending', state: 'in_progress', priority: '2 - High', updatedAt: iso(now - 60*60*1000), assigned_to: assigned },
          { number: `INC-DEMO-${Math.floor(Math.random()*1_000_000).toString().padStart(6,'0')}`, short_description: 'Demo: Password reset completed', state: 'closed', priority: '4 - Low', updatedAt: iso(now - 24*60*60*1000), assigned_to: assigned },
        ];
      };
      const finalItems = items.length > 0 ? items : mkDemo();
      setSnowItems(finalItems);
      const computedCount = finalItems.reduce((acc: number, it: any) => {
        const st = String(it.state || '').toLowerCase();
        if (st === 'open' || st.includes('progress')) return acc + 1;
        return acc;
      }, 0);
      setSnowCount(
        typeof json?.open === 'number' && typeof json?.in_progress === 'number'
          ? Number(json.open) + Number(json.in_progress)
          : computedCount
      );
    } catch (e: any) {
      setSnowError(e.message || 'Failed to load incidents');
      setSnowItems([]);
      setSnowCount(0);
    } finally {
      setSnowLoading(false);
    }
  };

  // Reset SNOW context on ops search changes to avoid stale counts/targets
  useEffect(() => {
    if (role === 'ops') {
      setSnowCount(null);
      setSnowEmail(null);
      setSnowItems(null);
    }
  }, [role, hasSearched, search]);

  // removed loadAllUsers (feature deprecated)

  useEffect(() => {
    if (token && role === "ops") {
      // do not auto-load all users; show recent failures panel instead
      loadRecentFailures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  // Handle logout: clear toggles
  const handleLogout = () => {
    localStorage.removeItem("systemToggles");
    setUserToggles({} as Record<SystemKey, boolean>);
    logout();
  };

  // Handle toggle change
  const handleToggleChange = (system: SystemKey, checked: boolean) => {
    const updated = { ...userToggles, [system]: checked };
    setUserToggles(updated);
    localStorage.setItem("systemToggles", JSON.stringify(updated));
  };

  if (!token) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        email={email}
        role={role}
        originalRole={originalRole}
        theme={theme as any}
        onThemeChange={(t) => setTheme(t)}
        onRoleToggle={toggleRole}
        onLogout={handleLogout}
        onShowSnowTickets={openSnowDialog}
        snowTicketsCount={snowCount ?? undefined}
        onShowSettings={() => setSettingsOpen(true)}
        onShowEducate={() => setEducateOpen(true)}
        educateEnabled={educateEnabled}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>System Card Visibility</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Toggle which system cards to display. Defaults reset on logout/login.</p>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {SYSTEMS.map((sys) => (
                  <div key={sys} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">{SYSTEM_LABELS[sys]}</label>
                      <p className="text-xs text-muted-foreground">
                        {enabled[sys] ? "Enabled" : "Disabled by admin"}
                      </p>
                    </div>
                    <Checkbox
                      checked={userToggles[sys] ?? false}
                      onCheckedChange={(checked) => handleToggleChange(sys, !!checked)}
                      disabled={!enabled[sys]}
                    />
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={() => {
                const defaults = SYSTEMS.reduce((acc, s) => ({ ...acc, [s]: enabled[s] }), {} as Record<SystemKey, boolean>);
                setUserToggles(defaults);
                localStorage.setItem("systemToggles", JSON.stringify(defaults));
                toast.success("Reset to defaults");
              }} className="w-full">
                Reset to Defaults
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Educate Guide Dialog */}
        <Dialog open={educateOpen} onOpenChange={setEducateOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Educational Guides — By System</DialogTitle>
            </DialogHeader>
            <div className="space-y-0">
              <Accordion type="single" collapsible className="w-full">
                {SYSTEMS.map((sys) => {
                  const points = EDUCATE_CONFIG[sys as keyof typeof EDUCATE_CONFIG] || [];
                  const guide = EDUCATE_GUIDE[sys as SystemKey];
                  return (
                    <AccordionItem key={sys} value={sys}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{SYSTEM_LABELS[sys as SystemKey]}</span>
                          <span className="text-xs px-2 py-0.5 rounded border bg-muted ml-auto whitespace-nowrap">{sys.replace(/-/g, ' ').toUpperCase()}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-3">
                        {points.length > 0 ? (
                          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            {points.map((point: string, idx: number) => (
                              <li key={idx} className="text-sm">{point}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No educational points configured for this system.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </DialogContent>
        </Dialog>

        {/* Search Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Employee Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Search by name, email, or ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search employees"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doSearch();
                  }}
                />
                <Button onClick={doSearch}>Search</Button>
              </div>
              {!hasSearched && !searchError && (
                <p className="text-xs text-muted-foreground mt-2">Enter a query and click Search to see results.</p>
              )}
              {searchError && <p className="text-sm text-red-600 mt-2">{searchError}</p>}
              {hasSearched && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Ping Directory card (respect employee search config when not self) */}
                  {(() => {
                    const isEmployee = role === "employee";
                    const isSelf = String(search).trim().toLowerCase() === String(email || "").toLowerCase();
                    const allowPD = features?.employeeSearchSystems?.["ping-directory"] ?? true;
                    if (isEmployee && !isSelf && !allowPD) return null;
                    return (
                      <Card>
                        <CardHeader className="text-center pb-2">
                          <CardTitle className="text-base font-semibold">Ping Directory</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {(() => {
                            const list = Array.isArray(searchResults?.["ping-directory"]) ? searchResults["ping-directory"] : [];
                            const filtered = role === "ops" && search.trim()
                              ? list.filter((u: any) =>
                                  u.userId === search.trim() || u.email?.toLowerCase() === search.trim().toLowerCase()
                                )
                              : list;
                            const finalList = role === "ops" ? filtered.slice(0, 1) : filtered;
                            return (
                              <>
                                <div className="flex justify-end gap-2">
                                  {finalList.length > 0 && (
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        const firstUser = finalList[0];
                                        const key = firstUser.userId || firstUser.email;
                                        openSearchDialog(`Ping Directory — ${key || "Details"}`, null, "json");
                                        try {
                                          const url = `${API_BASE}/api/search-employee/${encodeURIComponent(String(key))}/details?system=ping-directory`;
                                          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                                          if (res.ok) {
                                            const json = await res.json();
                                            setSearchDialogData(json.data ?? firstUser);
                                          } else {
                                            setSearchDialogData(firstUser);
                                          }
                                        } catch {
                                          setSearchDialogData(firstUser);
                                        }
                                      }}
                                      title="View detailed information for primary result"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>
                                  )}
                                </div>
                                {finalList.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>User ID</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {finalList.map((u: any) => (
                                        <TableRow key={`pd-${u.userId}`}>
                                          <TableCell>{u.name}</TableCell>
                                          <TableCell>{u.email}</TableCell>
                                          <TableCell>{u.userId}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No results</p>
                                )}
                              </>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Ping MFA card (respect employee search config when not self) */}
                  {(() => {
                    const isEmployee = role === "employee";
                    const isSelf = String(search).trim().toLowerCase() === String(email || "").toLowerCase();
                    const allowMFA = features?.employeeSearchSystems?.["ping-mfa"] ?? true;
                    if (isEmployee && !isSelf && !allowMFA) return null;
                    return (
                      <Card>
                        <CardHeader className="text-center pb-2">
                          <CardTitle className="text-base font-semibold">Ping MFA</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {(() => {
                            const list = Array.isArray(searchResults?.["ping-mfa"]) ? searchResults["ping-mfa"] : [];
                            const filtered = role === "ops" && search.trim()
                              ? list.filter((u: any) => u.userId === search.trim() || u.email?.toLowerCase() === search.trim().toLowerCase())
                              : list;
                            const finalList = role === "ops" ? filtered.slice(0, 1) : filtered;
                            return (
                              <>
                                <div className="flex justify-end gap-2">
                                  {finalList.length > 0 && (
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        const firstUser = finalList[0];
                                        const key = firstUser.userId || firstUser.email;
                                        openSearchDialog(`Ping MFA — ${firstUser.userId}`, null, "json");
                                        try {
                                          const url = `${API_BASE}/api/search-employee/${encodeURIComponent(String(key))}/details?system=ping-mfa`;
                                          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                                          if (res.ok) {
                                            const json = await res.json();
                                            setSearchDialogData(json.data ?? firstUser);
                                          } else {
                                            setSearchDialogData(firstUser);
                                          }
                                        } catch {
                                          setSearchDialogData(firstUser);
                                        }
                                      }}
                                      title="View detailed information for primary result"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>
                                  )}
                                </div>
                                {finalList.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Event</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {finalList.map((u: any) => (
                                        <TableRow key={`mfa-${u.userId}`}>
                                          <TableCell>{u.userId}</TableCell>
                                          <TableCell>{u.status}</TableCell>
                                          <TableCell>{u.lastEvent}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No results</p>
                                )}
                              </>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    );
                  })()}

                  <div className="flex flex-col sm:flex-row gap-2 justify-start mt-4 pt-4 border-t">
                    <Button
                      className="flex-1 sm:flex-none min-w-0"
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        // Determine the best key candidates from search results
                        const pd = Array.isArray(searchResults?.["ping-directory"]) ? searchResults["ping-directory"] : [];
                        const mfa = Array.isArray(searchResults?.["ping-mfa"]) ? searchResults["ping-mfa"] : [];
                        const q = String(search).trim().toLowerCase();
                        const exactPd = pd.find((u: any) => u?.email?.toLowerCase?.() === q || u?.userId === search.trim());
                        const exactMfa = mfa.find((u: any) => u?.userId === search.trim());
                        const firstPd = pd?.[0];
                        const firstMfa = mfa?.[0];
                        // Build candidate identifiers to try per-system (email + userId variants)
                        const baseCandidates = (
                          [
                            exactPd?.email,
                            exactPd?.userId,
                            exactMfa?.userId,
                            firstPd?.email,
                            firstPd?.userId,
                            firstMfa?.userId,
                            firstMfa?.email,
                            search,
                          ] as Array<string | undefined | null>
                        ).filter(Boolean).map((s) => String(s));
                        const candidateKeys = Array.from(new Set([
                          ...baseCandidates,
                          ...baseCandidates.map((k) => k.toLowerCase()),
                          ...baseCandidates.map((k) => k.toUpperCase()),
                        ]));
                        const displayKey = candidateKeys[0] || "";

                        openSearchDialog(`Consolidated View (JSON) — ${displayKey || "Details"}`, null, "json");
                        try {
                          const aggregate: Record<string, any> = {};
                          // fetch all-users once as a fallback source for per-system data
                          let allUsers: any[] | null = null;
                          try {
                            const auRes = await fetch(`${API_BASE}/api/all-users`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (auRes.ok) {
                              const auJson = await auRes.json();
                              allUsers = Array.isArray(auJson?.data) ? auJson.data : Array.isArray(auJson) ? auJson : null;
                            }
                          } catch {}

                          const isEmployee = role === "employee";
                          const isSelfSearch = String(search).trim().toLowerCase() === String(email || "").toLowerCase();
                          const allowMap = features?.employeeSearchSystems || {};

                          for (const sys of orderedSystems) {
                            // Employee searching others: respect config by skipping disallowed systems
                            if (isEmployee && !isSelfSearch && allowMap && allowMap[sys] === false) {
                              aggregate[sys] = null;
                              continue;
                            }
                            let found: any = undefined;
                            // Try details endpoint with multiple possible identifiers
                            for (const key of candidateKeys) {
                              try {
                                const url = `${API_BASE}/api/search-employee/${encodeURIComponent(String(key))}/details?system=${sys}`;
                                const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                                if (res.ok) {
                                  const json = await res.json();
                                  if (json?.data) { found = json.data; break; }
                                }
                              } catch {}
                            }
                            // Fallback to in-memory search results if details not found
                            if (!found) {
                              const arr = Array.isArray((searchResults as any)?.[sys]) ? (searchResults as any)[sys] : [];
                              const matched = arr.filter((it: any) =>
                                candidateKeys.some((k) => it.userId === k || it.email?.toLowerCase?.() === String(k).toLowerCase())
                              );
                              if (matched.length > 0) found = matched.length === 1 ? matched[0] : matched;
                            }
                            // Fallback to all-users systems map
                            if (!found && allUsers) {
                              const matchedUser = allUsers.find((u: any) =>
                                candidateKeys.some(
                                  (k) => u?.userId === k || u?.email?.toLowerCase?.() === String(k).toLowerCase()
                                )
                              );
                              if (matchedUser && matchedUser.systems && sys in matchedUser.systems) {
                                found = matchedUser.systems[sys];
                              }
                            }
                            aggregate[sys] = found ?? null;
                          }
                          setSearchDialogData(aggregate);
                        } catch {
                          setSearchDialogData({ error: "Unable to load aggregated details" });
                        } finally {
                          setSearchDialogLoading(false);
                        }
                      }}
                      title="View all system data in JSON format"
                    >
                      <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="hidden sm:inline">Consolidated View</span>
                      <span className="sm:hidden">View All</span>
                    </Button>
                    <Button
                      className="flex-1 sm:flex-none min-w-0"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        // Determine the best key candidates from search results
                        const pd = Array.isArray(searchResults?.["ping-directory"]) ? searchResults["ping-directory"] : [];
                        const mfa = Array.isArray(searchResults?.["ping-mfa"]) ? searchResults["ping-mfa"] : [];
                        const q = String(search).trim().toLowerCase();
                        const exactPd = pd.find((u: any) => u?.email?.toLowerCase?.() === q || u?.userId === search.trim());
                        const exactMfa = mfa.find((u: any) => u?.userId === search.trim());
                        const firstPd = pd?.[0];
                        const firstMfa = mfa?.[0];
                        // Build candidate identifiers to try per-system (email + userId variants)
                        const baseCandidates = (
                          [
                            exactPd?.email,
                            exactPd?.userId,
                            exactMfa?.userId,
                            firstPd?.email,
                            firstPd?.userId,
                            firstMfa?.userId,
                            firstMfa?.email,
                            search,
                          ] as Array<string | undefined | null>
                        ).filter(Boolean).map((s) => String(s));
                        const candidateKeys = Array.from(new Set([
                          ...baseCandidates,
                          ...baseCandidates.map((k) => k.toLowerCase()),
                          ...baseCandidates.map((k) => k.toUpperCase()),
                        ]));
                        const displayKey = candidateKeys[0] || "";

                        openSearchDialog(`Consolidated View (HTML) — ${displayKey || "Details"}`, null, "html");

                        try {
                          const aggregate: Record<string, any> = {};
                          let allUsers: any[] | null = null;
                          try {
                            const auRes = await fetch(`${API_BASE}/api/all-users`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (auRes.ok) {
                              const auJson = await auRes.json();
                              allUsers = Array.isArray(auJson?.data) ? auJson.data : Array.isArray(auJson) ? auJson : null;
                            }
                          } catch {}

                          for (const sys of orderedSystems) {
                            let found: any = undefined;
                            for (const key of candidateKeys) {
                              try {
                                const url = `${API_BASE}/api/search-employee/${encodeURIComponent(String(key))}/details?system=${sys}`;
                                const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                                if (res.ok) {
                                  const json = await res.json();
                                  if (json?.data) { found = json.data; break; }
                                }
                              } catch {}
                            }
                            if (!found) {
                              const arr = Array.isArray((searchResults as any)?.[sys]) ? (searchResults as any)[sys] : [];
                              const matched = arr.filter((it: any) =>
                                candidateKeys.some((k) => it.userId === k || it.email?.toLowerCase?.() === String(k).toLowerCase())
                              );
                              if (matched.length > 0) found = matched.length === 1 ? matched[0] : matched;
                            }
                            if (!found && allUsers) {
                              const matchedUser = allUsers.find((u: any) =>
                                candidateKeys.some(
                                  (k) => u?.userId === k || u?.email?.toLowerCase?.() === String(k).toLowerCase()
                                )
                              );
                              if (matchedUser && matchedUser.systems && sys in matchedUser.systems) {
                                found = matchedUser.systems[sys];
                              }
                            }
                            aggregate[sys] = found ?? null;
                          }
                          setSearchDialogData(aggregate);
                        } catch {
                          setSearchDialogData({ error: "Unable to load aggregated details" });
                        } finally {
                          setSearchDialogLoading(false);
                        }
                      }}
                      title="View data in structured, human-readable format"
                    >
                      <Code className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="hidden sm:inline">Readable Layout</span>
                      <span className="sm:hidden">Format</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Search result details dialog */}
          <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
            <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
              <DialogHeader className="pb-3 flex-shrink-0">
                <DialogTitle className="flex items-center justify-between w-full pr-8 text-base">
                  <span>{searchDialogTitle || "Details"}</span>
                  <div className="flex items-center gap-2">
                    {!isAggregate && searchDialogData && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSearchDialogMode((m) => (m === "json" ? "html" : "json"))}
                      >
                        {searchDialogMode === "json" ? "Key/Value" : "JSON"}
                      </Button>
                    )}
                    {searchDialogData && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(searchDialogData, null, 2))}
                        title="Copy JSON to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto">
                {searchDialogLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
                  </div>
                ) : searchDialogData ? (
                  (() => {
                    if (isAggregate) {
                      return (
                        <div className="space-y-6 p-4">
                          {orderedSystems.map((sys) => {
                            const val = (searchDialogData as any)?.[sys] ?? null;
                            const hasData = val && Object.keys(val).length > 0;
                            if (!enabled[sys] && !hasData) return null;
                            
                            const content = searchDialogMode === "html" ? (
                              <div className="space-y-3">
                                {val ? (
                                  <div className="bg-card border rounded-lg p-4">
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {toPairsGlobal(val).slice(0, 50).map(({ k, v }, idx) => (
                                        <div key={idx} className="space-y-1.5 pb-3 border-b last:border-b-0">
                                          <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            {k}
                                          </dt>
                                          <dd className="text-sm font-medium break-words leading-relaxed">
                                            {typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' 
                                              ? String(v) 
                                              : JSON.stringify(v, null, 2)
                                            }
                                          </dd>
                                        </div>
                                      ))}
                                    </dl>
                                  </div>
                                ) : (
                                  <div className="bg-muted/30 border border-dashed rounded-lg p-6 text-center">
                                    <p className="text-sm text-muted-foreground italic">No data available</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-card border rounded-lg p-4">
                                <pre className="text-xs bg-muted/30 p-3 rounded overflow-auto font-mono leading-relaxed">
                                  {JSON.stringify(val, null, 2)}
                                </pre>
                              </div>
                            );
                            
                            return (
                              <div key={sys} className="space-y-3">
                                {/* System Header */}
                                <div className="flex items-center justify-between border-b pb-3">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-foreground">
                                      {SYSTEM_LABELS[sys]}
                                    </h3>
                                    {hasData && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                                        Data Available
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`
                                      text-xs px-2.5 py-1 rounded-full border font-medium
                                      ${enabled[sys] 
                                        ? 'text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-300 dark:border-blue-700 dark:bg-blue-900/30' 
                                        : 'text-muted-foreground border-border bg-muted/50'
                                      }
                                    `}>
                                      {enabled[sys] ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 px-2" 
                                      onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(val, null, 2));
                                        toast.success(`Copied ${SYSTEM_LABELS[sys]} data to clipboard`);
                                      }}
                                      title="Copy system data"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                {/* System Content */}
                                {content}
                              </div>
                            );
                          }).filter(Boolean)}
                        </div>
                      );
                    } else {
                      return searchDialogMode === "html" ? (
                        <div className="p-4">
                          <div className="bg-card border rounded-lg p-5">
                            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {toPairsGlobal(searchDialogData).slice(0, 80).map(({ k, v }, idx) => (
                                <div key={idx} className="space-y-1.5 pb-3 border-b last:border-b-0">
                                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    {k}
                                  </dt>
                                  <dd className="text-sm font-medium break-words leading-relaxed">
                                    {typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' 
                                      ? String(v) 
                                      : JSON.stringify(v)
                                    }
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="bg-card border rounded-lg p-4">
                            <pre className="text-xs bg-muted/30 p-3 rounded overflow-auto font-mono leading-relaxed">
                              {JSON.stringify(searchDialogData, null, 2)}
                            </pre>
                          </div>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-muted-foreground">No details available</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </section>

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
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Ping Federate — User Info"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/pf/userinfo"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j); } catch { setPfOpsData({ error: "Failed to load User Info" }); } finally { setPfOpsLoading(false); }
                      }} title="User information">
                        <User className="h-4 w-4 mr-1" />
                        User Info
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Ping Federate — OIDC Connections"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/pf/oidc"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j); } catch { setPfOpsData({ error: "Failed to load OIDC connections" }); } finally { setPfOpsLoading(false); }
                      }} title="OIDC connections">
                        <Globe className="h-4 w-4 mr-1" />
                        OIDC
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Ping Federate — SAML Connections"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/pf/saml"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j); } catch { setPfOpsData({ error: "Failed to load SAML connections" }); } finally { setPfOpsLoading(false); }
                      }} title="SAML connections">
                        <Shield className="h-4 w-4 mr-1" />
                        SAML
                      </Button>
                    </div>
                  )}

                  {qaActive === "ping-directory" && qaEnabledTabs["ping-directory"] && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Ping Directory — Profile"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/pd/profile"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load profile" }); } finally { setPfOpsLoading(false);} 
                      }} title="Profile">
                        <Database className="h-4 w-4 mr-1" />
                        Profile
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Ping Directory — Groups"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/pd/groups"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load groups" }); } finally { setPfOpsLoading(false);} 
                      }} title="Groups">
                        <Users className="h-4 w-4 mr-1" />
                        Groups
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Ping Directory — Audit"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/pd/audit"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load audit" }); } finally { setPfOpsLoading(false);} 
                      }} title="Audit">
                        <History className="h-4 w-4 mr-1" />
                        Audit
                      </Button>
                    </div>
                  )}

                  {qaActive === "ping-mfa" && qaEnabledTabs["ping-mfa"] && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Ping MFA — Status"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/mfa/status"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load status" }); } finally { setPfOpsLoading(false);} 
                      }} title="Status">
                        <Status className="h-4 w-4 mr-1" />
                        Status
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Ping MFA — Devices"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/mfa/devices"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load devices" }); } finally { setPfOpsLoading(false);} 
                      }} title="Devices">
                        <Device className="h-4 w-4 mr-1" />
                        Devices
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Ping MFA — Events"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/mfa/events"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load events" }); } finally { setPfOpsLoading(false);} 
                      }} title="Events">
                        <Event className="h-4 w-4 mr-1" />
                        Events
                      </Button>
                    </div>
                  )}

                  {qaActive === "azure-ad" && qaEnabledTabs["azure-ad"] && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Azure AD — User"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/aad/user"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load user" }); } finally { setPfOpsLoading(false);} 
                      }} title="User">
                        <User className="h-4 w-4 mr-1" />
                        User
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Azure AD — Groups"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/aad/groups"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load groups" }); } finally { setPfOpsLoading(false);} 
                      }} title="Groups">
                        <Users className="h-4 w-4 mr-1" />
                        Groups
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Azure AD — Sign-ins"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/aad/signins"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load sign-ins" }); } finally { setPfOpsLoading(false);} 
                      }} title="Sign-ins">
                        <Signin className="h-4 w-4 mr-1" />
                        Sign-ins
                      </Button>
                    </div>
                  )}

                  {qaActive === "cyberark" && qaEnabledTabs["cyberark"] && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("CyberArk — Safes"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/cyberark/safes"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load safes" }); } finally { setPfOpsLoading(false);} 
                      }} title="Safes">
                        <Vault className="h-4 w-4 mr-1" />
                        Safes
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("CyberArk — Accounts"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/cyberark/accounts"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load accounts" }); } finally { setPfOpsLoading(false);} 
                      }} title="Accounts">
                        <Users className="h-4 w-4 mr-1" />
                        Accounts
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("CyberArk — Activity"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/cyberark/activity"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load activity" }); } finally { setPfOpsLoading(false);} 
                      }} title="Activity">
                        <Activity className="h-4 w-4 mr-1" />
                        Activity
                      </Button>
                    </div>
                  )}

                  {qaActive === "saviynt" && qaEnabledTabs["saviynt"] && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Saviynt — Roles"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/saviynt/roles"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load roles" }); } finally { setPfOpsLoading(false);} 
                      }} title="Roles">
                        <Role className="h-4 w-4 mr-1" />
                        Roles
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Saviynt — Entitlements"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/saviynt/entitlements"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load entitlements" }); } finally { setPfOpsLoading(false);} 
                      }} title="Entitlements">
                        <Entitlement className="h-4 w-4 mr-1" />
                        Entitlements
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => {
                        setPfOpsTitle("Saviynt — Requests"); setPfOpsOpen(true); setPfOpsLoading(true);
                        try { const r = await fetch("/api/saviynt/requests"); const j = await r.json().catch(() => ({})); setPfOpsData(j?.data ?? j);} catch { setPfOpsData({ error: "Failed to load requests" }); } finally { setPfOpsLoading(false);} 
                      }} title="Requests">
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
        <Dialog open={snowOpen} onOpenChange={setSnowOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col space-y-4">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="pr-12">
                ServiceNow Incidents{snowEmail ? ` — ${snowEmail}` : ''}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs">
                {typeof snowCount === 'number' && (
                  <span className="inline-flex items-center rounded border px-2 py-0.5">Open/In-Progress: {snowCount}</span>
                )}
                {(snowItems?.length || 0) > 0 && (
                  <span className="inline-flex items-center rounded border px-2 py-0.5">Total: {snowItems!.length}</span>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={openSnowDialog} disabled={snowLoading} title="Refresh incidents">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {snowLoading ? (
              <p className="text-sm animate-pulse">Loading incidents...</p>
            ) : snowError ? (
              <p className="text-sm text-red-600">{snowError}</p>
            ) : (snowItems?.length || 0) > 0 ? (
              <div className="flex-1 space-y-3 overflow-auto pr-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snowItems!.map((it: any) => (
                      <TableRow key={it.number}>
                        <TableCell className="font-mono text-xs">{it.number}</TableCell>
                        <TableCell className="text-sm whitespace-normal break-words">{it.short_description}</TableCell>
                        <TableCell>
                          <span className={
                            `text-[11px] px-2 py-0.5 rounded border ` +
                            (String(it.state).toLowerCase() === 'open'
                              ? 'text-blue-700 border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                              : String(it.state).toLowerCase().includes('progress')
                              ? 'text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-900/20'
                              : 'text-green-700 border-green-200 bg-green-50 dark:bg-green-900/20')
                          }>
                            {it.state}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{it.priority}</TableCell>
                        <TableCell className="text-xs break-words">{it.updatedAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No incidents found</p>
            )}
          </DialogContent>
        </Dialog>

        {/* OPS: Ping Federate quick actions dialog */}
        <Dialog open={pfOpsOpen} onOpenChange={setPfOpsOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center justify-between w-full pr-12">
                <span>{pfOpsTitle || 'Ping Federate'}</span>
                {pfOpsData && (
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(JSON.stringify(pfOpsData, null, 2))} title="Copy JSON to clipboard">
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </DialogTitle>
            </DialogHeader>
            {pfOpsLoading ? (
              <p className="text-sm animate-pulse">Loading...</p>
            ) : Array.isArray(pfOpsData) ? (
              <div className="flex-1 overflow-auto pr-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(pfOpsData[0] || {}).map((k) => (
                        <TableHead key={k} className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pfOpsData.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        {Object.keys(pfOpsData[0] || {}).map((k) => (
                          <TableCell key={k} className="text-sm break-words">{String(row[k])}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : pfOpsData ? (
              <pre className="flex-1 text-xs bg-muted p-2 rounded overflow-auto m-0">
                {JSON.stringify(pfOpsData, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </DialogContent>
        </Dialog>

        {/* Ops Recent Failures Panel */}
        {role === "ops" && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Recent Failures (last {minutes} min)</CardTitle>
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
                      onChange={(e) => setMinutes(Math.max(1, Number(e.target.value)))}
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={loadRecentFailures} disabled={opsLoading} title="Refresh recent failures data">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {opsError && <span className="text-xs text-red-600">{opsError}</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ping Federate – Login Failures</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {opsLoading ? (
                        <p className="text-sm animate-pulse">Loading...</p>
                      ) : (failFed?.length || 0) > 0 ? (
                        <ul className="text-sm list-disc pl-4 space-y-1">
                          {failFed!.slice(0, 25).map((it: any, idx: number) => (
                            <li key={`fed-${idx}`}>
                              {it.userId || it.email || "unknown"} — {it.reason || it.error || "failure"} — {it.time || it.timestamp || ""}
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
                      {opsLoading ? (
                        <p className="text-sm animate-pulse">Loading...</p>
                      ) : (failMfa?.length || 0) > 0 ? (
                        <ul className="text-sm list-disc pl-4 space-y-1">
                          {failMfa!.slice(0, 25).map((it: any, idx: number) => (
                            <li key={`mfa-${idx}`}>
                              {it.userId || it.email || "unknown"} — {it.reason || it.error || "failure"} — {it.time || it.timestamp || ""}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No failures in window</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* System Cards (hide by default for ops) */}
        <section>
          {(() => {
            console.log('🎨 [CARDS RENDER] anyEnabled:', anyEnabled, 'visibleSystems:', visibleSystems.length, 'resolveUserKey:', resolveUserKey);
            
            if (!anyEnabled) {
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>No systems enabled</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Feature not enabled. Please contact your administrator or update features.json.
                    </p>
                  </CardContent>
                </Card>
              );
            }
            
            if (visibleSystems.length === 0) {
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>No cards visible</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {role === "ops" 
                        ? "System cards appear after a successful search." 
                        : "All system cards are hidden via settings. Open Settings to enable some."
                      }
                    </p>
                  </CardContent>
                </Card>
              );
            }
            
            console.log('🎴 [CARDS RENDER] Rendering', visibleSystems.length, 'cards with userKey:', resolveUserKey);
            
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleSystems.map((sys) => {
                  console.log(`🎴 [CARD RENDER] ${sys} - key: ${sys}-${resolveUserKey || 'own'}, userKey: ${resolveUserKey}`);
                  return (
                    <SystemCard
                      key={`${sys}-${resolveUserKey || 'own'}`}
                      name={SYSTEM_LABELS[sys]}
                      system={sys}
                      enabled={!!enabled[sys]}
                      token={token!}
                      role={role!}
                      email={email!}
                      userKey={resolveUserKey}
                    />
                  );
                })}
              </div>
            );
          })()}
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