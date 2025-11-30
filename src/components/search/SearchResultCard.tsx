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

  return (
    <Card>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-base font-semibold">
          {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-end gap-2">
          {displayResults.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={handleViewDetails}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View detailed information for primary result</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {displayResults.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {config.columns.map((col) => (
                  <TableHead key={col.key}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayResults.map((item, idx) => (
                <TableRow key={`${config.system}-${item[config.rowKey] || idx}`}>
                  {config.columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.accessor 
                        ? col.accessor(item) 
                        : String(item[col.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No results</p>
        )}
      </CardContent>
    </Card>
  );
}
