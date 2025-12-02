/**
 * SearchSection Component
 * 
 * Employee search interface with system-specific result cards
 * and consolidated view functionality.
 * 
 * @module SearchSection
 */
"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Code, FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/constants";
import { DataDialog } from "@/components/dialogs/DataDialog";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { useConsolidatedView } from "@/hooks/useConsolidatedView";
import { 
  SEARCH_SYSTEMS, 
  canEmployeeViewSystem,
  buildCandidateKeys 
} from "@/lib/search-config";
import { getSystemIcon } from "@/lib/data-display-utils";
import {
  GroupedFieldsRenderer,
  JsonTreeRenderer,
} from "@/components/data-views";
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

  // Render aggregate view content using shared components
  const renderAggregateContent = () => {
    if (!dialogData) return null;
    
    return (
      <div className="space-y-3 p-3">
        {searchSystemKeys.map((sys) => {
          const rawVal = sys in dialogData ? dialogData[sys] : null;
          const val = rawVal && typeof rawVal === "object" ? rawVal as Record<string, unknown> : null;
          const hasData = val && Object.keys(val).length > 0;
          
          if (!enabled[sys] && !hasData) return null;

          return (
            <div key={sys} className="space-y-2">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{getSystemIcon(sys)}</span>
                  <h3 className="text-sm font-semibold text-foreground">
                    {SYSTEM_LABELS[sys]}
                  </h3>
                  {hasData && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                      Active
                    </span>
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="h-6 w-6 p-0 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(val, null, 2));
                        toast.success(`Copied ${SYSTEM_LABELS[sys]} data`);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy {SYSTEM_LABELS[sys]} data</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {dialogMode === "html" ? (
                val ? (
                  <GroupedFieldsRenderer data={val} className="p-0" />
                ) : (
                  <div className="bg-muted/30 border border-dashed rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground italic">No data available</p>
                  </div>
                )
              ) : (
                <JsonTreeRenderer data={val} />
              )}
            </div>
          );
        }).filter(Boolean)}
      </div>
    );
  };

  // Render single content view using shared components
  const renderSingleContent = () => {
    if (!dialogData) return null;
    
    if (dialogMode === "html") {
      return <GroupedFieldsRenderer data={dialogData} />;
    }
    
    return (
      <div className="p-2">
        <JsonTreeRenderer data={dialogData} />
      </div>
    );
  };

  return (
    <>
      <section className="mb-4">
        <div className="rounded-lg border border-border/40 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 shadow-sm overflow-hidden">
          <div className="px-4 py-3">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-sm">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-foreground leading-none">
                  Employee Search
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Search across all connected identity systems</p>
              </div>
            </div>
            
            {/* Search Input */}
            <div className="mb-3">
              <div className="relative">
                <Input
                  placeholder={!hasSearched && !searchError ? "Search by name, email, or ID - press Enter or click search" : "Search by name, email, or ID"}
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  aria-label="Search employees"
                  className="pr-24 h-9 border-border/50 bg-background/50 focus-visible:ring-1 focus-visible:ring-violet-500/50 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onDoSearch();
                  }}
                />
                {search && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <Button 
                  onClick={onDoSearch} 
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white transition-all px-3"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Button>
              </div>
            </div>
            
            {/* Error message */}
            {searchError && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-2">{searchError}</p>
            )}
            
            {/* Consolidated actions - shown when results exist */}
            {hasSearched && searchResults && Object.keys(searchResults).length > 0 && (
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
                <span className="text-[11px] text-muted-foreground">View all data:</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConsolidatedView("json")}
                      className="h-6 px-2 text-[11px] hover:bg-muted/80"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      JSON
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>View all systems as JSON</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConsolidatedView("html")}
                      className="h-6 px-2 text-[11px] hover:bg-muted/80"
                    >
                      <Code className="h-3 w-3 mr-1" />
                      Formatted
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>View formatted layout</p></TooltipContent>
                </Tooltip>
              </div>
            )}
            
            {/* Search results */}
            <div className="w-full min-h-[100px]">
              {hasSearched ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                  {SEARCH_SYSTEMS.map((config) => {
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
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed border-border/40 bg-muted/20">
                  <div className="p-2.5 rounded-full bg-muted/50 mb-2">
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a name, email, or ID to search across identity systems
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search result details dialog */}
        <DataDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={dialogTitle}
          data={dialogData}
          loading={dialogLoading}
          maxWidth="5xl"
          showCopy={!isAggregate}
          externalMode={dialogMode}
          onModeChange={(mode) => {
            if (mode === 'json' || mode === 'html') {
              setDialogMode(mode);
            }
          }}
          showModeToggle={!isAggregate}
        >
          {/* Custom content for aggregate and single views */}
          {dialogLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
            </div>
          ) : dialogData ? (
            <div className="flex-1 overflow-auto">
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
