/**
 * usePagination Hook
 * ==================
 * 
 * Reusable pagination hook for managing paginated data.
 * Provides page navigation, page size control, and data slicing.
 * 
 * @module usePagination
 */

import { useState, useMemo, useCallback } from "react";
import {
  PAGINATION_CONFIG,
  calculateTotalPages,
  getPaginatedData,
  getResultsRangeText,
  shouldShowPagination,
  validatePageSize,
} from "@/config/search-results.config";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UsePaginationOptions {
  /** Initial page size (defaults to config value) */
  initialPageSize?: number;
  /** Initial page number (defaults to 1) */
  initialPage?: number;
}

export interface UsePaginationResult<T> {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Current page size */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Whether pagination should be shown */
  showPagination: boolean;
  /** Paginated data for current page */
  paginatedData: T[];
  /** Range text (e.g., "Showing 1-5 of 12") */
  rangeText: string;
  /** Available page size options */
  pageSizeOptions: number[];
  /** Go to a specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to last page */
  lastPage: () => void;
  /** Change page size */
  setPageSize: (size: number) => void;
  /** Check if has next page */
  hasNextPage: boolean;
  /** Check if has previous page */
  hasPrevPage: boolean;
  /** Reset to first page */
  reset: () => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing pagination state and logic
 * 
 * @example
 * ```tsx
 * const {
 *   paginatedData,
 *   currentPage,
 *   totalPages,
 *   nextPage,
 *   prevPage,
 *   setPageSize,
 * } = usePagination(allResults);
 * ```
 */
export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const {
    initialPageSize = PAGINATION_CONFIG.defaultPageSize,
    initialPage = 1,
  } = options;

  // State
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(validatePageSize(initialPageSize));

  // Computed values
  const totalItems = data.length;
  const totalPages = useMemo(
    () => calculateTotalPages(totalItems, pageSize),
    [totalItems, pageSize]
  );
  const showPagination = useMemo(
    () => shouldShowPagination(totalItems),
    [totalItems]
  );

  // Ensure current page is valid when data or pageSize changes
  const validCurrentPage = useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      return totalPages;
    }
    if (currentPage < 1) {
      return 1;
    }
    return currentPage;
  }, [currentPage, totalPages]);

  // Update current page if it became invalid
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }

  // Get paginated data
  const paginatedData = useMemo(
    () => getPaginatedData(data, validCurrentPage, pageSize),
    [data, validCurrentPage, pageSize]
  );

  // Range text
  const rangeText = useMemo(
    () => getResultsRangeText(validCurrentPage, pageSize, totalItems),
    [validCurrentPage, pageSize, totalItems]
  );

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (validCurrentPage < totalPages) {
      setCurrentPage(validCurrentPage + 1);
    }
  }, [validCurrentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (validCurrentPage > 1) {
      setCurrentPage(validCurrentPage - 1);
    }
  }, [validCurrentPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    const validSize = validatePageSize(size);
    setPageSizeState(validSize);
    // Reset to first page when changing page size
    setCurrentPage(1);
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setPageSizeState(validatePageSize(initialPageSize));
  }, [initialPageSize]);

  // Check navigation availability
  const hasNextPage = validCurrentPage < totalPages;
  const hasPrevPage = validCurrentPage > 1;

  return {
    currentPage: validCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    showPagination,
    paginatedData,
    rangeText,
    pageSizeOptions: PAGINATION_CONFIG.pageSizeOptions,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    hasNextPage,
    hasPrevPage,
    reset,
  };
}
