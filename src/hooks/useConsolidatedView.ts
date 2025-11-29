/**
 * useConsolidatedView Hook
 * 
 * Shared logic for fetching consolidated view data across all systems.
 * Handles the complex candidate key resolution and API fetching.
 * 
 * @module useConsolidatedView
 */

import { useCallback } from "react";
import { API_BASE, SYSTEMS } from "@/lib/constants";
import { buildCandidateKeys } from "@/lib/search-config";
import type { SystemKey, Features, SearchResults } from "@/lib/types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ConsolidatedViewOptions {
  token: string;
  role: string;
  email: string | null;
  search: string;
  searchResults: SearchResults | null;
  orderedSystems: SystemKey[];
  features?: Features;
}

export interface ConsolidatedViewResult {
  aggregate: Record<string, unknown>;
  displayKey: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Safely get system results */
function getSystemResults(results: SearchResults | null, system: string): unknown[] | null {
  if (!results || !(system in results)) return null;
  const data = results[system];
  return Array.isArray(data) ? data : null;
}

/** Validate system key */
function isValidSystemKey(value: unknown): value is SystemKey {
  return typeof value === "string" && (SYSTEMS as readonly string[]).includes(value);
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for fetching consolidated view data
 */
export function useConsolidatedView() {
  /**
   * Fetch consolidated view data for all systems
   */
  const fetchConsolidatedData = useCallback(async (
    options: ConsolidatedViewOptions
  ): Promise<ConsolidatedViewResult> => {
    const { token, role, email, search, searchResults, orderedSystems, features } = options;
    
    // Build candidate keys from search results
    const candidateKeys = buildCandidateKeys(
      searchResults as Record<string, unknown[]> | null, 
      search
    );
    const displayKey = candidateKeys[0] || "";
    
    const aggregate: Record<string, unknown> = {};
    
    // Try to fetch all-users data for fallback
    let allUsers: unknown[] | null = null;
    try {
      const auRes = await fetch(`${API_BASE}/api/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (auRes.ok) {
        const auJson = await auRes.json();
        allUsers = Array.isArray(auJson?.data)
          ? auJson.data
          : Array.isArray(auJson)
          ? auJson
          : null;
      }
    } catch {
      // Ignore errors
    }
    
    // Check employee access permissions
    const isEmployee = role === "employee";
    const isSelfSearch = String(search).trim().toLowerCase() === String(email || "").toLowerCase();
    const allowMap = features?.employeeSearchSystems || {};
    
    // Fetch data for each system
    for (const sys of orderedSystems) {
      // Check employee permissions
      if (isEmployee && !isSelfSearch && allowMap && allowMap[sys] === false) {
        aggregate[sys] = null;
        continue;
      }
      
      let found: unknown = undefined;
      
      // Try fetching details for each candidate key
      for (const key of candidateKeys) {
        try {
          const url = `${API_BASE}/api/search-employee/${encodeURIComponent(key)}/details?system=${sys}`;
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            if (json?.data) {
              found = json.data;
              break;
            }
          }
        } catch {
          // Continue trying other keys
        }
      }
      
      // Fallback to search results
      if (!found) {
        const systemResults = getSystemResults(searchResults, sys);
        const arr = systemResults || [];
        const matched = arr.filter((it: unknown) => {
          const item = it as Record<string, unknown>;
          return candidateKeys.some(
            (k) =>
              item.userId === k ||
              (typeof item.email === "string" && 
               item.email.toLowerCase() === String(k).toLowerCase())
          );
        });
        if (matched.length > 0) {
          found = matched.length === 1 ? matched[0] : matched;
        }
      }
      
      // Fallback to all-users data
      if (!found && allUsers) {
        const matchedUser = allUsers.find((u: unknown) => {
          const user = u as Record<string, unknown>;
          return candidateKeys.some(
            (k) =>
              user?.userId === k ||
              (typeof user?.email === "string" && 
               user.email.toLowerCase() === String(k).toLowerCase())
          );
        });
        if (
          matchedUser &&
          typeof matchedUser === "object" &&
          "systems" in matchedUser &&
          typeof matchedUser.systems === "object" &&
          matchedUser.systems !== null &&
          sys in matchedUser.systems
        ) {
          const systems = matchedUser.systems as Record<string, unknown>;
          found = systems[sys];
        }
      }
      
      aggregate[sys] = found ?? null;
    }
    
    return { aggregate, displayKey };
  }, []);
  
  return { fetchConsolidatedData };
}
