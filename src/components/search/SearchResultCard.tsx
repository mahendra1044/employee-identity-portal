/**
 * SearchResultCard Component
 * 
 * Reusable card component for displaying search results from a single system.
 * Renders a table with configurable columns and a "View Details" button.
 * 
 * @module SearchResultCard
 */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Eye } from "lucide-react";
import { API_BASE } from "@/lib/constants";
import type { SearchSystemConfig } from "@/lib/search-config";
import { filterSearchResults, getDetailKey } from "@/lib/search-config";

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
  // Filter results based on role
  const filteredResults = filterSearchResults(results, role, search);
  
  // For ops, show only first result
  const displayResults = role === "ops" ? filteredResults.slice(0, 1) : filteredResults;

  const handleViewDetails = async () => {
    if (displayResults.length === 0) return;
    
    const firstItem = displayResults[0];
    const detailKey = getDetailKey(firstItem, config);
    
    // Open dialog immediately with loading state
    onViewDetails(`${config.label} — ${detailKey || "Details"}`, null);
    
    try {
      const url = `${API_BASE}/api/search-employee/${encodeURIComponent(detailKey)}/details?system=${config.system}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const json = await res.json();
        onSetData(json.data ?? firstItem);
      } else {
        onSetData(firstItem);
      }
    } catch {
      onSetData(firstItem);
    }
  };

  const hasManyResults = displayResults.length > 10;
  const hasSomeResults = displayResults.length > 0;
  
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{config.label}</span>
            <span className={hasManyResults ? "text-xs px-1.5 py-0.5 rounded bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium" : "text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}>
              {displayResults.length}
            </span>
          </div>
          {displayResults.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={handleViewDetails} className="h-5 w-5 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>View details</p></TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {displayResults.length > 0 ? (
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  {config.columns.map((col) => (
                    <TableHead key={col.key} className="h-7 px-2 text-xs">{col.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayResults.map((item, idx) => (
                  <TableRow key={`${config.system}-${item[config.rowKey] || idx}`}>
                    {config.columns.map((col) => (
                      <TableCell key={col.key} className="py-1.5 px-2 text-xs">
                        {col.accessor 
                          ? col.accessor(item) 
                          : String(item[col.key] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-2 text-center">
            <p className="text-xs text-muted-foreground">No results found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
