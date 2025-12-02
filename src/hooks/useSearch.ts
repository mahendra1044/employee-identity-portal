"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api-client";

export function useSearch(token: string | null, role: string | null) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDialogTitle, setSearchDialogTitle] = useState<string>("");
  const [searchDialogData, setSearchDialogData] = useState<any | null>(null);
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
      setSearchResults(response.data);
      setHasSearched(true);
    } catch (e: any) {
      setSearchError(e?.message || "Search failed");
    }
  }, [search, token]);

  const openSearchDialog = (title: string, data: any, mode: "json" | "html" = "json") => {
    setSearchDialogTitle(title);
    setSearchDialogData(data);
    setSearchDialogMode(mode);
    setSearchDialogOpen(true);
  };

  const closeSearchDialog = () => setSearchDialogOpen(false);

  const updateSearchDialogData = (data: any) => {
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
