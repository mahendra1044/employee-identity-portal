"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Code, FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import { SYSTEMS, SYSTEM_LABELS, API_BASE } from "@/lib/constants";
import { toPairs } from "@/lib/formatters";
import type { SystemKey, Features, SearchResults } from "@/lib/types";

interface SearchSectionProps {
  token: string;
  role: string;
  originalRole: string;
  email: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onDoSearch: () => void;
  searchResults: SearchResults | null;
  searchError: string | null;
  hasSearched: boolean;
  enabled: Record<string, boolean>;
  features?: Features;
}

// Helper function to safely get system results
const getSystemResults = (results: SearchResults | null, system: string): unknown[] | null => {
  if (!results || !(system in results)) return null;
  const data = results[system];
  return Array.isArray(data) ? data : null;
};

// Helper function to validate system key
const isValidSystemKey = (value: unknown): value is SystemKey => {
  return typeof value === 'string' && (SYSTEMS as readonly string[]).includes(value);
};

export function SearchSection({
  token,
  role,
  email,
  search,
  onSearchChange,
  onDoSearch,
  searchResults,
  searchError,
  hasSearched,
  enabled,
  features,
}: SearchSectionProps) {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDialogTitle, setSearchDialogTitle] = useState("");
  const [searchDialogData, setSearchDialogData] = useState<Record<string, unknown> | null>(null);
  const [searchDialogLoading, setSearchDialogLoading] = useState(false);
  const [searchDialogMode, setSearchDialogMode] = useState<"json" | "html">("html");

  const orderedSystems = useMemo<SystemKey[]>(() => {
    const order = features?.systemsOrder || [];
    const valid = order.filter(isValidSystemKey);
    const remaining = SYSTEMS.filter((s) => !valid.includes(s as SystemKey));
    return [...valid, ...remaining] as SystemKey[];
  }, [features]);

  const isAggregate = useMemo(() => {
    return (
      !!searchDialogData &&
      typeof searchDialogData === "object" &&
      Object.keys(searchDialogData).some((k) =>
        isValidSystemKey(k)
      )
    );
  }, [searchDialogData]);

  const openSearchDialog = (
    title: string,
    data: any,
    mode: "json" | "html"
  ) => {
    setSearchDialogTitle(title);
    setSearchDialogData(data);
    setSearchDialogMode(mode);
    setSearchDialogOpen(true);
    setSearchDialogLoading(false);
  };

  return (
    <>
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
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search employees"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onDoSearch();
                }}
              />
              <Button onClick={onDoSearch}>Search</Button>
            </div>
            {!hasSearched && !searchError && (
              <p className="text-xs text-muted-foreground mt-2">
                Enter a query and click Search to see results.
              </p>
            )}
            {searchError && (
              <p className="text-sm text-red-600 mt-2">{searchError}</p>
            )}
            {hasSearched && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Ping Directory card */}
                {(() => {
                  const isEmployee = role === "employee";
                  const isSelf =
                    String(search).trim().toLowerCase() ===
                    String(email || "").toLowerCase();
                  const allowPD =
                    features?.employeeSearchSystems?.["ping-directory"] ??
                    true;
                  if (isEmployee && !isSelf && !allowPD) return null;
                  return (
                    <Card key="pd">
                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-base font-semibold">
                          Ping Directory
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(() => {
                          const list = Array.isArray(
                            searchResults?.["ping-directory"]
                          )
                            ? searchResults["ping-directory"]
                            : [];
                          const filtered =
                            role === "ops" && search.trim()
                              ? list.filter(
                                  (u: any) =>
                                    u.userId === search.trim() ||
                                    u.email?.toLowerCase?.() ===
                                      search.trim().toLowerCase()
                                )
                              : list;
                          const finalList =
                            role === "ops"
                              ? filtered.slice(0, 1)
                              : filtered;
                          return (
                            <>
                              <div className="flex justify-end gap-2">
                                {finalList.length > 0 && (
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      const firstUser = finalList[0];
                                      const key =
                                        firstUser.userId ||
                                        firstUser.email;
                                      openSearchDialog(
                                        `Ping Directory — ${key || "Details"}`,
                                        null,
                                        "json"
                                      );
                                      try {
                                        const url = `${API_BASE}/api/search-employee/${encodeURIComponent(
                                          String(key)
                                        )}/details?system=ping-directory`;
                                        const res = await fetch(url, {
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        });
                                        if (res.ok) {
                                          const json = await res.json();
                                          setSearchDialogData(
                                            json.data ?? firstUser
                                          );
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
                                      <TableRow
                                        key={`pd-${u.userId}`}
                                      >
                                        <TableCell>{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{u.userId}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No results
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Ping MFA card */}
                {(() => {
                  const isEmployee = role === "employee";
                  const isSelf =
                    String(search).trim().toLowerCase() ===
                    String(email || "").toLowerCase();
                  const allowMFA =
                    features?.employeeSearchSystems?.["ping-mfa"] ?? true;
                  if (isEmployee && !isSelf && !allowMFA) return null;
                  return (
                    <Card key="mfa">
                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-base font-semibold">
                          Ping MFA
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(() => {
                          const list = Array.isArray(searchResults?.["ping-mfa"])
                            ? searchResults["ping-mfa"]
                            : [];
                          const filtered =
                            role === "ops" && search.trim()
                              ? list.filter(
                                  (u: any) =>
                                    u.userId === search.trim() ||
                                    u.email?.toLowerCase?.() ===
                                      search.trim().toLowerCase()
                                )
                              : list;
                          const finalList =
                            role === "ops"
                              ? filtered.slice(0, 1)
                              : filtered;
                          return (
                            <>
                              <div className="flex justify-end gap-2">
                                {finalList.length > 0 && (
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      const firstUser = finalList[0];
                                      const key =
                                        firstUser.userId ||
                                        firstUser.email;
                                      openSearchDialog(
                                        `Ping MFA — ${firstUser.userId}`,
                                        null,
                                        "json"
                                      );
                                      try {
                                        const url = `${API_BASE}/api/search-employee/${encodeURIComponent(
                                          String(key)
                                        )}/details?system=ping-mfa`;
                                        const res = await fetch(url, {
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        });
                                        if (res.ok) {
                                          const json = await res.json();
                                          setSearchDialogData(
                                            json.data ?? firstUser
                                          );
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
                                <p className="text-sm text-muted-foreground">
                                  No results
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Consolidated buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-start mt-4 pt-4 border-t col-span-full">
                  <Button
                    className="flex-1 sm:flex-none min-w-0"
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      const pd = Array.isArray(
                        searchResults?.["ping-directory"]
                      )
                        ? searchResults["ping-directory"]
                        : [];
                      const mfa = Array.isArray(searchResults?.["ping-mfa"])
                        ? searchResults["ping-mfa"]
                        : [];
                      const q = String(search).trim().toLowerCase();
                      const exactPd = pd.find(
                        (u: any) =>
                          u?.email?.toLowerCase?.() === q ||
                          u?.userId === search.trim()
                      );
                      const exactMfa = mfa.find(
                        (u: any) => u?.userId === search.trim()
                      );
                      const firstPd = pd?.[0];
                      const firstMfa = mfa?.[0];
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
                      )
                        .filter(Boolean)
                        .map((s) => String(s));
                      const candidateKeys = Array.from(
                        new Set([
                          ...baseCandidates,
                          ...baseCandidates.map((k) => k.toLowerCase()),
                          ...baseCandidates.map((k) => k.toUpperCase()),
                        ])
                      );
                      const displayKey = candidateKeys[0] || "";

                      openSearchDialog(
                        `Consolidated View (JSON) — ${displayKey || "Details"}`,
                        null,
                        "json"
                      );
                      try {
                        const aggregate: Record<string, unknown> = {};
                        let allUsers: unknown[] | null = null;
                        try {
                          const auRes = await fetch(
                            `${API_BASE}/api/all-users`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );
                          if (auRes.ok) {
                            const auJson = await auRes.json();
                            allUsers = Array.isArray(auJson?.data)
                              ? auJson.data
                              : Array.isArray(auJson)
                              ? auJson
                              : null;
                          }
                        } catch {}

                        const isEmployee = role === "employee";
                        const isSelfSearch =
                          String(search).trim().toLowerCase() ===
                          String(email || "").toLowerCase();
                        const allowMap =
                          features?.employeeSearchSystems || {};

                        for (const sys of orderedSystems) {
                          if (
                            isEmployee &&
                            !isSelfSearch &&
                            allowMap &&
                            allowMap[sys] === false
                          ) {
                            aggregate[sys] = null;
                            continue;
                          }
                          let found: unknown = undefined;
                          for (const key of candidateKeys) {
                            try {
                              const url = `${API_BASE}/api/search-employee/${encodeURIComponent(
                                String(key)
                              )}/details?system=${sys}`;
                              const res = await fetch(url, {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              });
                              if (res.ok) {
                                const json = await res.json();
                                if (json?.data) {
                                  found = json.data;
                                  break;
                                }
                              }
                            } catch {}
                          }
                          if (!found) {
                            const systemResults = getSystemResults(searchResults, sys);
                            const arr = systemResults || [];
                            const matched = arr.filter((it: unknown) => {
                              const item = it as Record<string, unknown>;
                              return candidateKeys.some(
                                (k) =>
                                  item.userId === k ||
                                  (typeof item.email === 'string' && item.email.toLowerCase() === String(k).toLowerCase())
                              );
                            });
                            if (matched.length > 0)
                              found =
                                matched.length === 1
                                  ? matched[0]
                                  : matched;
                          }
                          if (!found && allUsers) {
                            const matchedUser = allUsers.find((u: unknown) => {
                              const user = u as Record<string, unknown>;
                              return candidateKeys.some(
                                (k) =>
                                  user?.userId === k ||
                                  (typeof user?.email === 'string' && user.email.toLowerCase() === String(k).toLowerCase())
                              );
                            });
                            if (
                              matchedUser &&
                              typeof matchedUser === 'object' &&
                              'systems' in matchedUser &&
                              typeof matchedUser.systems === 'object' &&
                              matchedUser.systems !== null &&
                              sys in matchedUser.systems
                            ) {
                              const systems = matchedUser.systems as Record<string, unknown>;
                              found = systems[sys];
                            }
                          }
                          aggregate[sys] = found ?? null;
                        }
                        setSearchDialogData(aggregate);
                      } catch {
                        setSearchDialogData({
                          error:
                            "Unable to load aggregated details",
                        });
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
                      const pd = Array.isArray(
                        searchResults?.["ping-directory"]
                      )
                        ? searchResults["ping-directory"]
                        : [];
                      const mfa = Array.isArray(searchResults?.["ping-mfa"])
                        ? searchResults["ping-mfa"]
                        : [];
                      const q = String(search).trim().toLowerCase();
                      const exactPd = pd.find(
                        (u: any) =>
                          u?.email?.toLowerCase?.() === q ||
                          u?.userId === search.trim()
                      );
                      const exactMfa = mfa.find(
                        (u: any) => u?.userId === search.trim()
                      );
                      const firstPd = pd?.[0];
                      const firstMfa = mfa?.[0];
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
                      )
                        .filter(Boolean)
                        .map((s) => String(s));
                      const candidateKeys = Array.from(
                        new Set([
                          ...baseCandidates,
                          ...baseCandidates.map((k) => k.toLowerCase()),
                          ...baseCandidates.map((k) => k.toUpperCase()),
                        ])
                      );
                      const displayKey = candidateKeys[0] || "";

                      openSearchDialog(
                        `Consolidated View (HTML) — ${displayKey || "Details"}`,
                        null,
                        "html"
                      );

                      try {
                        const aggregate: Record<string, unknown> = {};
                        let allUsers: unknown[] | null = null;
                        try {
                          const auRes = await fetch(
                            `${API_BASE}/api/all-users`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );
                          if (auRes.ok) {
                            const auJson = await auRes.json();
                            allUsers = Array.isArray(auJson?.data)
                              ? auJson.data
                              : Array.isArray(auJson)
                              ? auJson
                              : null;
                          }
                        } catch {}

                        for (const sys of orderedSystems) {
                          let found: unknown = undefined;
                          for (const key of candidateKeys) {
                            try {
                              const url = `${API_BASE}/api/search-employee/${encodeURIComponent(
                                String(key)
                              )}/details?system=${sys}`;
                              const res = await fetch(url, {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              });
                              if (res.ok) {
                                const json = await res.json();
                                if (json?.data) {
                                  found = json.data;
                                  break;
                                }
                              }
                            } catch {}
                          }
                          if (!found) {
                            const systemResults = getSystemResults(searchResults, sys);
                            const arr = systemResults || [];
                            const matched = arr.filter((it: unknown) => {
                              const item = it as Record<string, unknown>;
                              return candidateKeys.some(
                                (k) =>
                                  item.userId === k ||
                                  (typeof item.email === 'string' && item.email.toLowerCase() === String(k).toLowerCase())
                              );
                            });
                            if (matched.length > 0)
                              found =
                                matched.length === 1
                                  ? matched[0]
                                  : matched;
                          }
                          if (!found && allUsers) {
                            const matchedUser = allUsers.find((u: unknown) => {
                              const user = u as Record<string, unknown>;
                              return candidateKeys.some(
                                (k) =>
                                  user?.userId === k ||
                                  (typeof user?.email === 'string' && user.email.toLowerCase() === String(k).toLowerCase())
                              );
                            });
                            if (
                              matchedUser &&
                              typeof matchedUser === 'object' &&
                              'systems' in matchedUser &&
                              typeof matchedUser.systems === 'object' &&
                              matchedUser.systems !== null &&
                              sys in matchedUser.systems
                            ) {
                              const systems = matchedUser.systems as Record<string, unknown>;
                              found = systems[sys];
                            }
                          }
                          aggregate[sys] = found ?? null;
                        }
                        setSearchDialogData(aggregate);
                      } catch {
                        setSearchDialogData({
                          error:
                            "Unable to load aggregated details",
                        });
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
                      onClick={() =>
                        setSearchDialogMode((m) =>
                          m === "json" ? "html" : "json"
                        )
                      }
                    >
                      {searchDialogMode === "json"
                        ? "Key/Value"
                        : "JSON"}
                    </Button>
                  )}
                  {searchDialogData && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          JSON.stringify(searchDialogData, null, 2)
                        )
                      }
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
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading...
                  </p>
                </div>
              ) : searchDialogData ? (
                (() => {
                  if (isAggregate) {
                    return (
                      <div className="space-y-6 p-4">
                        {orderedSystems.map((sys) => {
                          const rawVal = (typeof searchDialogData === 'object' && searchDialogData !== null && sys in searchDialogData) 
                            ? (searchDialogData as Record<string, unknown>)[sys] 
                            : null;
                          const val = (rawVal && typeof rawVal === 'object') ? rawVal : null;
                          const hasData =
                            val && typeof val === 'object' && Object.keys(val).length > 0;
                          if (!enabled[sys] && !hasData) return null;

                          const content =
                            searchDialogMode === "html" ? (
                              <div className="space-y-3">
                                {val ? (
                                  <div className="bg-card border rounded-lg p-4">
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {toPairs(val as Record<string, unknown>)
                                        .slice(0, 50)
                                        .map(({ k, v }, idx) => (
                                          <div
                                            key={idx}
                                            className="space-y-1.5 pb-3 border-b last:border-b-0"
                                          >
                                            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                              {k}
                                            </dt>
                                            <dd className="text-sm font-medium break-words leading-relaxed">
                                              {typeof v ===
                                              "string" ||
                                              typeof v ===
                                                "number" ||
                                              typeof v ===
                                                "boolean"
                                                ? String(v)
                                                : JSON.stringify(
                                                    v,
                                                    null,
                                                    2
                                                  )}
                                            </dd>
                                          </div>
                                        ))}
                                    </dl>
                                  </div>
                                ) : (
                                  <div className="bg-muted/30 border border-dashed rounded-lg p-6 text-center">
                                    <p className="text-sm text-muted-foreground italic">
                                      No data available
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-card border rounded-lg p-4">
                                <pre className="text-xs bg-muted/30 p-3 rounded overflow-auto font-mono leading-relaxed">
                                  {String(JSON.stringify(val, null, 2))}
                                </pre>
                              </div>
                            );

                          return (
                            <div key={sys} className="space-y-3">
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
                                  <span
                                    className={`
                                      text-xs px-2.5 py-1 rounded-full border font-medium
                                      ${
                                        enabled[sys]
                                          ? "text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-300 dark:border-blue-700 dark:bg-blue-900/30"
                                          : "text-muted-foreground border-border bg-muted/50"
                                      }
                                    `}
                                  >
                                    {enabled[sys]
                                      ? "Enabled"
                                      : "Disabled"}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        JSON.stringify(val, null, 2)
                                      );
                                      toast.success(
                                        `Copied ${SYSTEM_LABELS[sys]} data to clipboard`
                                      );
                                    }}
                                    title="Copy system data"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
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
                            {toPairs(searchDialogData)
                              .slice(0, 80)
                              .map(({ k, v }, idx) => (
                                <div
                                  key={idx}
                                  className="space-y-1.5 pb-3 border-b last:border-b-0"
                                >
                                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    {k}
                                  </dt>
                                  <dd className="text-sm font-medium break-words leading-relaxed">
                                    {typeof v === "string" ||
                                    typeof v === "number" ||
                                    typeof v === "boolean"
                                      ? String(v)
                                      : JSON.stringify(v)}
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
                  <p className="text-sm text-muted-foreground">
                    No details available
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </>
  );
}
