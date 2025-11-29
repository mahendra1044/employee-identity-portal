/**
 * SearchSection Component
 * 
 * Employee search interface with system-specific result cards
 * and consolidated view functionality.
 * 
 * @module SearchSection
 */
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code, FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/constants";
import { toPairs } from "@/lib/formatters";
import { DataDialog } from "@/components/dialogs/DataDialog";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { useConsolidatedView } from "@/hooks/useConsolidatedView";
import { 
  SEARCH_SYSTEMS, 
  canEmployeeViewSystem,
  buildCandidateKeys 
} from "@/lib/search-config";
import type { SystemKey, Features, SearchResults } from "@/lib/types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Validate system key */
function isValidSystemKey(value: unknown): value is SystemKey {
  return typeof value === "string" && (SYSTEMS as readonly string[]).includes(value);
}

// ============================================================================
// COMPONENT
// ============================================================================

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
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogData, setDialogData] = useState<Record<string, unknown> | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogMode, setDialogMode] = useState<"json" | "html">("html");
  const [isAggregateView, setIsAggregateView] = useState(false);

  // Hooks
  const { fetchConsolidatedData } = useConsolidatedView();

  // Compute ordered systems (all systems for general use)
  const orderedSystems = useMemo<SystemKey[]>(() => {
    const order = features?.systemsOrder || [];
    const valid = order.filter(isValidSystemKey);
    const remaining = SYSTEMS.filter((s) => !valid.includes(s as SystemKey));
    return [...valid, ...remaining] as SystemKey[];
  }, [features]);

  // Search systems - only the systems shown in search cards
  const searchSystemKeys = useMemo<SystemKey[]>(() => {
    return SEARCH_SYSTEMS.map((config) => config.system);
  }, []);

  // isAggregate is now controlled by explicit state, not data detection
  const isAggregate = isAggregateView;

  // Open dialog with title and initial data
  const openDialog = (title: string, data: Record<string, unknown> | null, mode: "json" | "html", aggregate = false) => {
    setDialogTitle(title);
    setDialogData(data);
    setDialogMode(mode);
    setDialogOpen(true);
    setDialogLoading(!data);
    setIsAggregateView(aggregate);
  };

  // Update dialog data and clear loading state
  const updateDialogData = (data: Record<string, unknown>) => {
    setDialogData(data);
    setDialogLoading(false);
  };

  // Handle consolidated view button click
  const handleConsolidatedView = async (mode: "json" | "html") => {
    const candidateKeys = buildCandidateKeys(
      searchResults as Record<string, unknown[]> | null,
      search
    );
    const displayKey = candidateKeys[0] || "";
    
    openDialog(
      `Consolidated View (${mode.toUpperCase()}) — ${displayKey || "Details"}`,
      null,
      mode,
      true // This is an aggregate view
    );
    
    try {
      const result = await fetchConsolidatedData({
        token,
        role,
        email,
        search,
        searchResults,
        orderedSystems: searchSystemKeys, // Only fetch for search card systems
        features,
      });
      setDialogData(result.aggregate);
    } catch {
      setDialogData({ error: "Unable to load aggregated details" });
    } finally {
      setDialogLoading(false);
    }
  };

  // Render aggregate view content
  const renderAggregateContent = () => {
    if (!dialogData) return null;
    
    return (
      <div className="space-y-6 p-4">
        {searchSystemKeys.map((sys) => {
          const rawVal = sys in dialogData ? dialogData[sys] : null;
          const val = rawVal && typeof rawVal === "object" ? rawVal as Record<string, unknown> : null;
          const hasData = val && Object.keys(val).length > 0;
          
          if (!enabled[sys] && !hasData) return null;

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
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    enabled[sys]
                      ? "text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-300 dark:border-blue-700 dark:bg-blue-900/30"
                      : "text-muted-foreground border-border bg-muted/50"
                  }`}>
                    {enabled[sys] ? "Enabled" : "Disabled"}
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
              
              {dialogMode === "html" ? (
                <div className="space-y-3">
                  {val ? (
                    <div className="bg-card border rounded-lg p-4">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {toPairs(val).slice(0, 50).map(({ k, v }, idx) => (
                          <div key={idx} className="space-y-1.5 pb-3 border-b last:border-b-0">
                            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {k}
                            </dt>
                            <dd className="text-sm font-medium break-words leading-relaxed">
                              {typeof v === "string" || typeof v === "number" || typeof v === "boolean"
                                ? String(v)
                                : JSON.stringify(v, null, 2)}
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
              )}
            </div>
          );
        }).filter(Boolean)}
      </div>
    );
  };

  // Render single item view content
  const renderSingleContent = () => {
    if (!dialogData) return null;
    
    if (dialogMode === "html") {
      return (
        <div className="p-4">
          <div className="bg-card border rounded-lg p-5">
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toPairs(dialogData).slice(0, 80).map(({ k, v }, idx) => (
                <div key={idx} className="space-y-1.5 pb-3 border-b last:border-b-0">
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {k}
                  </dt>
                  <dd className="text-sm font-medium break-words leading-relaxed">
                    {typeof v === "string" || typeof v === "number" || typeof v === "boolean"
                      ? String(v)
                      : JSON.stringify(v)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4">
        <div className="bg-card border rounded-lg p-4">
          <pre className="text-xs bg-muted/30 p-3 rounded overflow-auto font-mono leading-relaxed">
            {JSON.stringify(dialogData, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <>
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Employee Search</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search input */}
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
            
            {/* Helper text */}
            {!hasSearched && !searchError && (
              <p className="text-xs text-muted-foreground mt-2">
                Enter a query and click Search to see results.
              </p>
            )}
            
            {/* Error message */}
            {searchError && (
              <p className="text-sm text-red-600 mt-2">{searchError}</p>
            )}
            
            {/* Search results */}
            {hasSearched && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* System cards */}
                {SEARCH_SYSTEMS.map((config) => {
                  // Check employee access
                  if (!canEmployeeViewSystem(config.system, role, search, email, features)) {
                    return null;
                  }
                  
                  const results = Array.isArray(searchResults?.[config.system])
                    ? (searchResults[config.system] as Record<string, unknown>[])
                    : [];
                  
                  return (
                    <SearchResultCard
                      key={config.system}
                      config={config}
                      results={results}
                      role={role}
                      search={search}
                      token={token}
                      onViewDetails={(title, data) => openDialog(title, data, "json")}
                      onSetData={updateDialogData}
                    />
                  );
                })}

                {/* Consolidated view buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-start mt-4 pt-4 border-t col-span-full">
                  <Button
                    className="flex-1 sm:flex-none min-w-0"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleConsolidatedView("json")}
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
                    onClick={() => handleConsolidatedView("html")}
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
        <DataDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={dialogTitle}
          data={dialogData}
          loading={dialogLoading}
          maxWidth="5xl"
          showCopy={!isAggregate}
        >
          {/* Custom content for aggregate and single views */}
          {dialogLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
            </div>
          ) : dialogData ? (
            <div className="flex-1 overflow-auto">
              {/* Mode toggle for non-aggregate */}
              {!isAggregate && (
                <div className="flex justify-end p-4 pb-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialogMode((m) => m === "json" ? "html" : "json")}
                  >
                    {dialogMode === "json" ? "Key/Value" : "JSON"}
                  </Button>
                </div>
              )}
              {isAggregate ? renderAggregateContent() : renderSingleContent()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">No details available</p>
            </div>
          )}
        </DataDialog>
      </section>
    </>
  );
}
