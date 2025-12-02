/**
 * PaginatedResultsTable Component
 * ================================
 * 
 * Displays search results in a paginated table format.
 * Shows pagination controls when results exceed the configured threshold.
 * Supports row click to view details.
 * 
 * @module PaginatedResultsTable
 */
"use client";

import React, { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { usePagination } from "@/hooks/usePagination";
import {
  SEARCH_RESULTS_CONFIG,
  TABLE_DISPLAY_CONFIG,
  UI_CONFIG,
} from "@/config/search-results.config";
import type { SearchSystemConfig } from "@/lib/search-config";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PaginatedResultsTableProps {
  /** System configuration */
  config: SearchSystemConfig;
  /** All results data */
  results: Record<string, unknown>[];
  /** Callback when user clicks on a row */
  onRowClick?: (item: Record<string, unknown>, index: number) => void;
  /** Callback when user clicks View Details button (first row) */
  onViewDetails?: () => void;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Truncate text to max length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Format cell value for display
 */
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  const strValue = String(value);
  return truncateText(strValue, TABLE_DISPLAY_CONFIG.maxCellTextLength);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PaginatedResultsTable({
  config,
  results,
  onRowClick,
  onViewDetails,
  className = "",
}: PaginatedResultsTableProps) {
  // Pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    showPagination,
    paginatedData,
    rangeText,
    pageSizeOptions,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    hasNextPage,
    hasPrevPage,
  } = usePagination(results);

  // Get columns from config
  const columns = config.columns;

  // Handle row click
  const handleRowClick = useCallback(
    (item: Record<string, unknown>, index: number) => {
      if (TABLE_DISPLAY_CONFIG.enableRowClick && onRowClick) {
        // Calculate actual index in full results array
        const actualIndex = (currentPage - 1) * pageSize + index;
        onRowClick(item, actualIndex);
      }
    },
    [currentPage, pageSize, onRowClick]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, item: Record<string, unknown>, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleRowClick(item, index);
      }
    },
    [handleRowClick]
  );

  // If no results, show empty state
  if (results.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-muted-foreground">No results found</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Table */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 dark:border-slate-700">
              {/* Row number column */}
              {TABLE_DISPLAY_CONFIG.showRowNumber && (
                <TableHead className="w-10 h-7 px-2 text-xs font-semibold text-center">
                  #
                </TableHead>
              )}
              {/* Data columns */}
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="h-7 px-2 text-xs font-semibold"
                >
                  {col.header}
                </TableHead>
              ))}
              {/* Action column */}
              {TABLE_DISPLAY_CONFIG.enableRowClick && (
                <TableHead className="w-10 h-7 px-2 text-xs font-semibold text-center">
                  
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, idx) => {
              const actualRowNumber = (currentPage - 1) * pageSize + idx + 1;
              const rowKey = `${config.system}-${item[config.rowKey] || idx}`;

              return (
                <TableRow
                  key={rowKey}
                  className={`
                    ${UI_CONFIG.highlightOnHover ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/70" : ""}
                    ${UI_CONFIG.animatePageTransition ? "transition-colors duration-150" : ""}
                    ${idx % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-slate-50/50 dark:bg-slate-800/30"}
                    border-b border-slate-100 dark:border-slate-800
                  `}
                  onClick={() => handleRowClick(item, idx)}
                  onKeyDown={(e) => handleKeyDown(e, item, idx)}
                  tabIndex={TABLE_DISPLAY_CONFIG.enableRowClick ? 0 : undefined}
                  role={TABLE_DISPLAY_CONFIG.enableRowClick ? "button" : undefined}
                  aria-label={TABLE_DISPLAY_CONFIG.enableRowClick ? `View details for row ${actualRowNumber}` : undefined}
                >
                  {/* Row number */}
                  {TABLE_DISPLAY_CONFIG.showRowNumber && (
                    <TableCell className="py-1.5 px-2 text-xs text-center text-muted-foreground font-mono">
                      {actualRowNumber}
                    </TableCell>
                  )}
                  {/* Data cells */}
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`py-1.5 px-2 text-xs ${UI_CONFIG.compactMode ? "" : "py-2"}`}
                    >
                      {col.accessor
                        ? formatCellValue(col.accessor(item))
                        : formatCellValue(item[col.key])}
                    </TableCell>
                  ))}
                  {/* Row action indicator */}
                  {TABLE_DISPLAY_CONFIG.enableRowClick && (
                    <TableCell className="py-1.5 px-2 text-center">
                      <Eye className="h-3 w-3 text-muted-foreground opacity-50" />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls - only show if needed */}
      {showPagination && (
        <div
          className={`
            flex items-center justify-between gap-2 px-2 py-1.5 
            border-t border-slate-200 dark:border-slate-700 
            bg-slate-50/50 dark:bg-slate-800/50
            ${UI_CONFIG.animatePageTransition ? "animate-in fade-in duration-200" : ""}
          `}
        >
          {/* Results range text */}
          {UI_CONFIG.showResultsRange && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {rangeText}
            </span>
          )}

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            {/* First page */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={firstPage}
                  disabled={!hasPrevPage}
                  className="h-6 w-6 p-0"
                >
                  <ChevronsLeft className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>First page</p></TooltipContent>
            </Tooltip>

            {/* Previous page */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Previous page</p></TooltipContent>
            </Tooltip>

            {/* Page indicator */}
            <span className="text-[10px] text-muted-foreground px-2 whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next page */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Next page</p></TooltipContent>
            </Tooltip>

            {/* Last page */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={lastPage}
                  disabled={!hasNextPage}
                  className="h-6 w-6 p-0"
                >
                  <ChevronsRight className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Last page</p></TooltipContent>
            </Tooltip>
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              Per page:
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => setPageSize(Number(val))}
            >
              <SelectTrigger className="h-6 w-14 text-[10px] px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
