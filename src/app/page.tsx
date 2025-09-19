"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
            {details && (
              <div>
                <div className="text-sm font-medium mb-1">Details</div>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
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
  const [allUsers, setAllUsers] = useState<{ total: number; limit: number; offset: number; results: any[] } | null>(null);
  const [offset, setOffset] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

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

  const doSearch = async () => {
    if (!token || !search.trim()) return;
    setSearchError(null);
    setSearchResults(null);
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

  const loadAllUsers = async (newOffset = 0) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/all-users?limit=50&offset=${newOffset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed");
      setAllUsers(body);
      setOffset(newOffset);
    } catch (e: any) {
      setAllUsers({ total: 0, limit: 50, offset: 0, results: [] });
    }
  };

  useEffect(() => {
    if (token && role === "ops") {
      loadAllUsers(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  if (!token) {
    return <LoginCard onLogin={login} />;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=64&q=60&auto=format&fit=crop" alt="Logo" className="w-8 h-8 rounded" />
            <div>
              <div className="font-semibold">Identity Portal</div>
              <div className="text-xs text-muted-foreground">Signed in as {email} ({role})</div>
            </div>
          </div>
          <Button variant="secondary" onClick={logout}>Sign out</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Search Section (employee and ops if enabled) */}
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
              {searchError && <p className="text-sm text-red-600 mt-2">{searchError}</p>}
              {searchResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ping Directory</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(searchResults["ping-directory"]) && searchResults["ping-directory"].length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>User ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {searchResults["ping-directory"].map((u: any) => (
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
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ping MFA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(searchResults["ping-mfa"]) && searchResults["ping-mfa"].length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User ID</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Last Event</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {searchResults["ping-mfa"].map((u: any) => (
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
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* System Cards */}
        <section>
          {!anyEnabled ? (
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

        {/* Ops All Users */}
        {role === "ops" && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>All Users (Ops)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ping Dir Dept</TableHead>
                        <TableHead>Ping MFA Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers?.results?.map((u: any) => (
                        <TableRow
                          key={u.userId}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedUser(u);
                            setModalOpen(true);
                          }}
                        >
                          <TableCell>{u.userId}</TableCell>
                          <TableCell>{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.systems?.["ping-directory"]?.department || "-"}</TableCell>
                          <TableCell>{u.systems?.["ping-mfa"]?.status || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <div>
                    Showing {allUsers ? allUsers.results.length : 0} of {allUsers?.total || 0}
                  </div>
                  <div className="space-x-2">
                    <Button variant="secondary" onClick={() => loadAllUsers(Math.max(0, offset - 50))} disabled={!allUsers || offset === 0}>
                      Previous
                    </Button>
                    <Button variant="default" onClick={() => loadAllUsers(offset + 50)} disabled={!allUsers || offset + 50 >= (allUsers?.total || 0)}>
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                </DialogHeader>
                {selectedUser ? (
                  <div className="space-y-4">
                    <div className="text-sm">
                      <div><span className="font-medium">Name:</span> {selectedUser.name}</div>
                      <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
                      <div><span className="font-medium">User ID:</span> {selectedUser.userId}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SYSTEMS.map((s) => (
                        <Card key={s}>
                          <CardHeader>
                            <CardTitle className="text-sm capitalize">{s.replace("-", " ")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{JSON.stringify(selectedUser.systems?.[s as SystemKey] || { note: "Details per user are not available in this mock" }, null, 2)}
                            </pre>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </section>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        Read-only demo • Mocks enabled • Local dev
      </footer>
    </div>
  );
}