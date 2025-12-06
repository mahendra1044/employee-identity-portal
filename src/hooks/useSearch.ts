"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api-client";
import type { SearchResults } from "@/lib/types";

/**
 * Hook for managing search state and operations
 * @param token - Authentication token for API calls
 * @param _role - Role parameter (reserved for future role-based search filtering)
 */
export function useSearch(token: string | null, _role?: string | null) {
  const [search, setSearch] = useState("");
  // Note: SearchResults type - the API response is cast as the actual structure varies
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDialogTitle, setSearchDialogTitle] = useState<string>("");
  const [searchDialogData, setSearchDialogData] = useState<Record<string, unknown> | null>(null);
  const [searchDialogLoading, setSearchDialogLoading] = useState(false);
  const [searchDialogMode, setSearchDialogMode] = useState<"json" | "html">("json");

  const doSearch = useCallback(async () => {
    if (!token || !search.trim()) return;
    setSearchError(null);
    setSearchResults(null);
    setHasSearched(false);
    try {
      const response = await api.ops.search.employee(search, { token });
      if (!response.ok) throw new Error(response.error || "Search failed");
      // Cast through unknown - API type is narrower than actual response shape
      setSearchResults(response.data as unknown as SearchResults);
      setHasSearched(true);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Search failed";
      setSearchError(errorMessage);
    }
  }, [search, token]);

  const openSearchDialog = (title: string, data: Record<string, unknown>, mode: "json" | "html" = "json") => {
    setSearchDialogTitle(title);
    setSearchDialogData(data);
    setSearchDialogMode(mode);
    setSearchDialogOpen(true);
  };

  const closeSearchDialog = () => setSearchDialogOpen(false);

  const updateSearchDialogData = (data: Record<string, unknown>) => {
    setSearchDialogData(data);
  };

  return {
    search,
    setSearch,
    searchResults,
    searchError,
    hasSearched,
    doSearch,
    searchDialogOpen,
    setSearchDialogOpen,
    searchDialogTitle,
    setSearchDialogTitle,
    searchDialogData,
    setSearchDialogData,
    searchDialogLoading,
    setSearchDialogLoading,
    searchDialogMode,
    setSearchDialogMode,
    openSearchDialog,
    closeSearchDialog,
    updateSearchDialogData,
  } as const;
}

export default useSearch;
