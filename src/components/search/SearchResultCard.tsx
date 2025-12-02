/**
 * SearchResultCard Component
 * 
 * Reusable card component for displaying search results from a single system.
 * Renders a paginated table when results exceed threshold.
 * Supports clicking on individual rows to view their details.
 * 
 * @module SearchResultCard
 */
"use client";

import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { API_BASE } from "@/lib/constants";
import type { SearchSystemConfig } from "@/lib/search-config";
import { filterSearchResults, getDetailKey } from "@/lib/search-config";
import { PaginatedResultsTable } from "./PaginatedResultsTable";
import { shouldShowPagination } from "@/config/search-results.config";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SearchResultCardProps {
  /** Configuration for this search system */
  config: SearchSystemConfig;
  /** Raw results array from search */
  results: Record<string, unknown>[];
  /** User role */
  role: string;
  /** Current search term */
  search: string;
  /** Auth token for API calls */
  token: string;
  /** Callback when user clicks View Details */
  onViewDetails: (title: string, data: Record<string, unknown> | null) => void;
  /** Callback to set dialog data after fetch */
  onSetData: (data: Record<string, unknown>) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SearchResultCard({
  config,
  results,
  role,
  search,
  token,
  onViewDetails,
  onSetData,
}: SearchResultCardProps) {
  // Filter results based on role (now consistent for all roles)
  const displayResults = filterSearchResults(results, role, search);

  // Fetch and display details for a specific item
  const fetchAndShowDetails = useCallback(async (item: Record<string, unknown>, title?: string) => {
    const detailKey = getDetailKey(item, config);
    const dialogTitle = title || `${config.label} — ${detailKey || "Details"}`;
    
    // Open dialog immediately with loading state
    onViewDetails(dialogTitle, null);
    
    try {
      const url = `${API_BASE}/api/search-employee/${encodeURIComponent(detailKey)}/details?system=${config.system}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const json = await res.json();
        onSetData(json.data ?? item);
      } else {
        onSetData(item);
      }
    } catch {
      onSetData(item);
    }
  }, [config, token, onViewDetails, onSetData]);

  // Handle View Details button click (always shows first row)
  const handleViewDetails = useCallback(async () => {
    if (displayResults.length === 0) return;
    await fetchAndShowDetails(displayResults[0]);
  }, [displayResults, fetchAndShowDetails]);

  // Handle row click (shows details for clicked row)
  const handleRowClick = useCallback(async (item: Record<string, unknown>, index: number) => {
    const detailKey = getDetailKey(item, config);
    await fetchAndShowDetails(item, `${config.label} — Row ${index + 1}: ${detailKey || "Details"}`);
  }, [config, fetchAndShowDetails]);

  const hasManyResults = displayResults.length > 10;
  const showPagination = shouldShowPagination(displayResults.length);
  
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{config.label}</span>
            <span className={hasManyResults ? "text-xs px-1.5 py-0.5 rounded bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium" : "text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}>
              {displayResults.length}
            </span>
            {showPagination && (
              <span className="text-[10px] text-muted-foreground">(paginated)</span>
            )}
          </div>
          {displayResults.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={handleViewDetails} className="h-5 w-5 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>View first row details</p></TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {displayResults.length > 0 ? (
          <PaginatedResultsTable
            config={config}
            results={displayResults}
            onRowClick={handleRowClick}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <div className="p-2 text-center">
            <p className="text-xs text-muted-foreground">No results found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
