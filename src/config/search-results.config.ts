/**
 * Search Results Configuration
 * ============================
 * 
 * Centralized configuration for search results display and pagination.
 * All pagination, table, and UI settings are configurable here.
 * 
 * @module search-results.config
 */

// ============================================================================
// PAGINATION CONFIGURATION
// ============================================================================

export interface PaginationConfig {
  /** Enable/disable pagination feature */
  enabled: boolean;
  /** Default number of rows per page */
  defaultPageSize: number;
  /** Available page size options in dropdown */
  pageSizeOptions: number[];
  /** Show pagination controls only when results exceed this threshold */
  showPaginationThreshold: number;
}

export const PAGINATION_CONFIG: PaginationConfig = {
  enabled: true,
  defaultPageSize: 5,
  pageSizeOptions: [5, 10, 25, 50],
  showPaginationThreshold: 5,
};

// ============================================================================
// TABLE DISPLAY CONFIGURATION
// ============================================================================

export interface TableDisplayConfig {
  /** Maximum number of columns to show in table */
  maxVisibleColumns: number;
  /** Priority columns to always show first (if they exist in data) */
  priorityColumns: string[];
  /** Enable clicking on row to view details */
  enableRowClick: boolean;
  /** Show row numbers in first column */
  showRowNumber: boolean;
  /** Truncate long text values at this length */
  maxCellTextLength: number;
}

export const TABLE_DISPLAY_CONFIG: TableDisplayConfig = {
  maxVisibleColumns: 5,
  priorityColumns: ['displayName', 'name', 'email', 'userId', 'status', 'upn'],
  enableRowClick: true,
  showRowNumber: true,
  maxCellTextLength: 50,
};

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export interface UIConfig {
  /** Animate page transitions */
  animatePageTransition: boolean;
  /** Highlight rows on hover */
  highlightOnHover: boolean;
  /** Use compact table mode (smaller padding) */
  compactMode: boolean;
  /** Show total count in header */
  showTotalCount: boolean;
  /** Show "Showing X-Y of Z" text */
  showResultsRange: boolean;
}

export const UI_CONFIG: UIConfig = {
  animatePageTransition: true,
  highlightOnHover: true,
  compactMode: true,
  showTotalCount: true,
  showResultsRange: true,
};

// ============================================================================
// COMBINED CONFIGURATION
// ============================================================================

export interface SearchResultsConfig {
  pagination: PaginationConfig;
  table: TableDisplayConfig;
  ui: UIConfig;
}

/**
 * Complete search results configuration
 * Import this to access all settings
 */
export const SEARCH_RESULTS_CONFIG: SearchResultsConfig = {
  pagination: PAGINATION_CONFIG,
  table: TABLE_DISPLAY_CONFIG,
  ui: UI_CONFIG,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if pagination should be shown based on result count
 */
export function shouldShowPagination(resultCount: number): boolean {
  return (
    PAGINATION_CONFIG.enabled &&
    resultCount > PAGINATION_CONFIG.showPaginationThreshold
  );
}

/**
 * Get the default page size
 */
export function getDefaultPageSize(): number {
  return PAGINATION_CONFIG.defaultPageSize;
}

/**
 * Validate and return a valid page size
 */
export function validatePageSize(size: number): number {
  if (PAGINATION_CONFIG.pageSizeOptions.includes(size)) {
    return size;
  }
  return PAGINATION_CONFIG.defaultPageSize;
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Get paginated slice of data
 */
export function getPaginatedData<T>(
  data: T[],
  currentPage: number,
  pageSize: number
): T[] {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}

/**
 * Get range text for display (e.g., "Showing 1-5 of 12")
 */
export function getResultsRangeText(
  currentPage: number,
  pageSize: number,
  totalItems: number
): string {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  return `Showing ${startItem}-${endItem} of ${totalItems}`;
}
