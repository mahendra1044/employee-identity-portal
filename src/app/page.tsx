"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sun, Moon } from "lucide-react";

const API_BASE = "http://localhost:3001"; // dev: backend server

type Features = {
  credentialSource: string;
  useMocks: boolean;
  useMockAuth: boolean;
  systems: Record<string, boolean>;
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

function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    const e = localStorage.getItem("email");
    if (t && r && e) {
      setToken(t);
      setRole(r);
      setEmail(e);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data: LoginResponse = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("email", data.email);
    setToken(data.token);
    setRole(data.role);
    setEmail(data.email);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
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
}: {
  name: string;
  system: SystemKey;
  enabled: boolean;
  token: string;
}) {
  const [data, setData] = useState<any | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadInitial = async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/own-${system}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const json = await res.json();
      setData(json.data);
    } catch (e: any) {
      setError(e.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/own-${system}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const json = await res.json();
      setDetails(json.data);
      setDetailsOpen(true);
    } catch (e: any) {
      setError(e.message || "Error loading details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, enabled]);

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{name}</span>
            <div className="space-x-2">
              <Button size="sm" variant="secondary" onClick={loadInitial} disabled={!enabled || loading}>
                Refresh
              </Button>
              <Button size="sm" onClick={loadDetails} disabled={!enabled || loading}>
                View Details
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!enabled ? (
            <p className="text-sm text-muted-foreground">Feature not enabled</p>
          ) : loading ? (
            <p className="text-sm animate-pulse">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <div className="space-y-3">
              {data ? (
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No data yet</p>
              )}
              {/* details moved to dialog to keep the page compact */}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{name} — Details</DialogTitle>
          </DialogHeader>
          {loading ? (
            <p className="text-sm animate-pulse">Loading details...</p>
          ) : details ? (
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">No details available</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function LoginCard({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ops@company.com" />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-xs text-muted-foreground">Mock auth: role inferred by email prefix (ops@, management@, else employee).</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomePage() {
  const { token, role, email, login, logout } = useAuth();
  const [features, setFeatures] = useState<Features | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  // removed All Users feature and related state
  const [hasSearched, setHasSearched] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "navy">();
  const [minutes, setMinutes] = useState<number>(10);
  const [failFed, setFailFed] = useState<any[] | null>(null);
  const [failMfa, setFailMfa] = useState<any[] | null>(null);
  const [opsLoading, setOpsLoading] = useState(false);
  const [opsError, setOpsError] = useState<string | null>(null);
  // search result detail dialog
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDialogTitle, setSearchDialogTitle] = useState<string>("");
  const [searchDialogData, setSearchDialogData] = useState<any | null>(null);
  const [searchDialogLoading, setSearchDialogLoading] = useState(false);

  useEffect(() => {
    // init theme from localStorage; default to light regardless of system
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "navy") {
      setTheme(stored);
    } else {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    // reset theme classes first
    root.classList.remove("dark");
    root.classList.remove("navy");
    if (theme === "dark") root.classList.add("dark");
    if (theme === "navy") root.classList.add("navy");
    localStorage.setItem("theme", theme);
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

  const enabled = useMemo(() => {
    const all = features?.systems || {};
    return SYSTEMS.reduce((acc, s) => ({ ...acc, [s]: !!all[s] }), {} as Record<SystemKey, boolean>);
  }, [features]);

  const anyEnabled = useMemo(() => Object.values(enabled || {}).some(Boolean), [enabled]);

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

  const doSearch = async () => {
    if (!token || !search.trim()) return;
    setSearchError(null);
    setSearchResults(null);
    setHasSearched(true);
    try {
      const res = await fetch(`${API_BASE}/api/search-employee/${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Search failed");
      setSearchResults(body);
    } catch (e: any) {
      setSearchError(e.message || "Search failed");
    }
  };

  // removed loadAllUsers (feature deprecated)

  useEffect(() => {
    if (token && role === "ops") {
      // do not auto-load all users; show recent failures panel instead
      loadRecentFailures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  if (!token) {
    return <LoginCard onLogin={login} />;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=64&q=60&auto=format&fit=crop" alt="Logo" className="w-8 h-8 rounded" />
            <div>
              <div className="font-semibold">Identity Portal</div>
              <div className="text-xs text-muted-foreground">Signed in as {email} ({role})</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(prev => prev === "light" ? "dark" : prev === "dark" ? "navy" : "light")}>
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="secondary" onClick={logout}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
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
                />
                <Button onClick={doSearch}>Search</Button>
              </div>
              {!hasSearched && !searchError && (
                <p className="text-xs text-muted-foreground mt-2">Enter a query and click Search to see results.</p>
              )}
              {searchError && <p className="text-sm text-red-600 mt-2">{searchError}</p>}
              {hasSearched && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ping Directory</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const list = Array.isArray(searchResults?.["ping-directory"]) ? searchResults["ping-directory"] : [];
                        const filtered = role === "ops" && search.trim()
                          ? list.filter((u: any) =>
                              u.userId === search.trim() || u.email?.toLowerCase() === search.trim().toLowerCase()
                            )
                          : list;
                        const final = role === "ops" ? filtered.slice(0, 1) : filtered;
                        return final.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>User ID</TableHead>
                                <TableHead className="w-40">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {final.map((u: any) => (
                                <TableRow key={`pd-${u.userId}`}>
                                  <TableCell>{u.name}</TableCell>
                                  <TableCell>{u.email}</TableCell>
                                  <TableCell>{u.userId}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={async () => {
                                          const key = u.userId || u.email;
                                          setSearchDialogTitle(`Ping Directory — ${key || "Details"}`);
                                          setSearchDialogData(null);
                                          setSearchDialogLoading(true);
                                          setSearchDialogOpen(true);
                                          try {
                                            const url = `${API_BASE}/api/search-employee/${encodeURIComponent(String(key))}/details?system=ping-directory`;
                                            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                                            if (res.ok) {
                                              const json = await res.json();
                                              setSearchDialogData(json.data ?? u);
                                            } else {
                                              setSearchDialogData(u);
                                            }
                                          } catch {
                                            setSearchDialogData(u);
                                          } finally {
                                            setSearchDialogLoading(false);
                                          }
                                        }}
                                      >
                                        View Details
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground">No results</p>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ping MFA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const list = Array.isArray(searchResults?.["ping-mfa"]) ? searchResults["ping-mfa"] : [];
                        const filtered = role === "ops" && search.trim()
                          ? list.filter((u: any) => u.userId === search.trim())
                          : list;
                        const final = role === "ops" ? filtered.slice(0, 1) : filtered;
                        return final.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Event</TableHead>
                                <TableHead className="w-40">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {final.map((u: any) => (
                                <TableRow key={`mfa-${u.userId}`}>
                                  <TableCell>{u.userId}</TableCell>
                                  <TableCell>{u.status}</TableCell>
                                  <TableCell>{u.lastEvent}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={async () => {
                                          const key = u.userId || u.email;
                                          setSearchDialogTitle(`Ping MFA — ${u.userId}`);
                                          setSearchDialogData(null);
                                          setSearchDialogLoading(true);
                                          setSearchDialogOpen(true);
                                          try {
                                            const url = `${API_BASE}/api/search-employee/${encodeURIComponent(String(key))}/details?system=ping-mfa`;
                                            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                                            if (res.ok) {
                                              const json = await res.json();
                                              setSearchDialogData(json.data ?? u);
                                            } else {
                                              setSearchDialogData(u);
                                            }
                                          } catch {
                                            setSearchDialogData(u);
                                          } finally {
                                            setSearchDialogLoading(false);
                                          }
                                        }}
                                      >
                                        View Details
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground">No results</p>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Global View All Systems button below the two boxes */}
                  <div className="md:col-span-2">
                    <Button
                      className="w-full md:w-auto"
                      variant="secondary"
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
                        const candidateKeys = (
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
                        )
                          .filter(Boolean)
                          .map((s) => String(s));
                        const displayKey = candidateKeys[0] || "";

                        setSearchDialogTitle(`All Systems — ${displayKey || "Details"}`);
                        setSearchDialogData(null);
                        setSearchDialogLoading(true);
                        setSearchDialogOpen(true);
                        try {
                          const aggregate: Record<string, any> = {};
                          for (const sys of SYSTEMS) {
                            let found: any = undefined;
                            // Try details endpoint with multiple possible identifiers
                            for (const key of candidateKeys) {
                              try {
                                const url = `${API_BASE}/api/search-employee/${encodeURIComponent(String(key))}/details?system=${sys}`;
                                const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                                if (res.ok) {
                                  const json = await res.json();
                                  if (json?.data) {
                                    found = json.data;
                                    break;
                                  }
                                }
                              } catch {
                                // continue trying other keys
                              }
                            }
                            // Fallback to in-memory search results if details not found
                            if (!found) {
                              const arr = Array.isArray(searchResults?.[sys]) ? searchResults[sys] : [];
                              const matched = arr.filter((it: any) =>
                                candidateKeys.some((k) => it.userId === k || it.email?.toLowerCase?.() === String(k).toLowerCase())
                              );
                              if (matched.length > 0) found = matched.length === 1 ? matched[0] : matched;
                            }
                            // Ensure key exists for every system so UI shows all 6 sections
                            aggregate[sys] = found ?? null;
                          }
                          setSearchDialogData(aggregate);
                        } catch {
                          setSearchDialogData({ error: "Unable to load aggregated details" });
                        } finally {
                          setSearchDialogLoading(false);
                        }
                      }}
                    >
                      View All System Details
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Search result details dialog */}
          <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>{searchDialogTitle || "Details"}</DialogTitle>
              </DialogHeader>
              {searchDialogLoading ? (
                <p className="text-sm animate-pulse">Loading details...</p>
              ) : searchDialogData ? (
                typeof searchDialogData === "object" && (searchDialogTitle || "").startsWith("All Systems") ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
                    {SYSTEMS.map((sys) => {
                      const val = (searchDialogData as any)?.[sys] ?? null;
                      return (
                        <div key={sys} className="rounded border p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">
                              {sys.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </div>
                            <span
                              className={
                                `text-[10px] px-2 py-0.5 rounded border ${enabled[sys] ?
                                  'text-green-700 border-green-200 bg-green-50 dark:bg-green-900/20' :
                                  'text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-900/20'}`
                              }
                            >
                              {enabled[sys] ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          {val ? (
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(val, null, 2)}
                            </pre>
                          ) : (
                            <p className="text-xs text-muted-foreground">No details available</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">{JSON.stringify(searchDialogData, null, 2)}</pre>
                )
              ) : (
                <p className="text-sm text-muted-foreground">No details available</p>
              )}
            </DialogContent>
          </Dialog>
        </section>

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
                  <Button size="sm" onClick={loadRecentFailures} disabled={opsLoading}>Refresh</Button>
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
          {role === "ops" ? null : !anyEnabled ? (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SystemCard name="Ping Directory" system="ping-directory" enabled={!!enabled["ping-directory"]} token={token!} />
              <SystemCard name="Ping Federate" system="ping-federate" enabled={!!enabled["ping-federate"]} token={token!} />
              <SystemCard name="CyberArk" system="cyberark" enabled={!!enabled["cyberark"]} token={token!} />
              <SystemCard name="Saviynt" system="saviynt" enabled={!!enabled["saviynt"]} token={token!} />
              <SystemCard name="Azure AD" system="azure-ad" enabled={!!enabled["azure-ad"]} token={token!} />
              <SystemCard name="Ping MFA" system="ping-mfa" enabled={!!enabled["ping-mfa"]} token={token!} />
            </div>
          )}
        </section>

        {/* All Users feature removed as requested */}
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        Read-only demo • Mocks enabled • Local dev
      </footer>
    </div>
  );
}