/**
 * Data transformation and business logic utilities
 */

import type { SnowIncident, SystemData, SearchResult, SystemKey } from "./types";

export class DataService {
  /**
   * Filter SNOW incidents by assigned email
   */
  static filterSnowByEmail(
    incidents: SnowIncident[],
    email: string
  ): SnowIncident[] {
    return incidents.filter((incident) => incident.assigned_to === email);
  }

  /**
   * Count SNOW incidents by state
   */
  static countSnowByState(incidents: SnowIncident[]) {
    return incidents.reduce(
      (acc, incident) => {
        const state = String(incident.state || "").toLowerCase();
        if (state === "open") acc.open += 1;
        else if (
          state === "in_progress" ||
          state === "in progress"
        )
          acc.in_progress += 1;
        else if (state === "closed" || state === "resolved") acc.closed += 1;
        acc.total += 1;
        return acc;
      },
      { open: 0, in_progress: 0, closed: 0, total: 0 }
    );
  }

  /**
   * Get SNOW incident count for display
   */
  static getSnowDisplayCount(incidents: SnowIncident[]): number {
    return incidents.reduce((acc, incident) => {
      const state = String(incident.state || "").toLowerCase();
      if (state === "open" || state.includes("progress")) return acc + 1;
      return acc;
    }, 0);
  }

  /**
   * Map system data for display with metadata
   */
  static mapSystemDataForDisplay(
    data: SystemData,
    system: SystemKey
  ): SystemData {
    return {
      ...data,
      _system: system,
      _timestamp: new Date().toISOString(),
    };
  }

  /**
   * Merge system data with defaults
   */
  static mergeWithDefaults(
    data: SystemData,
    defaults: Record<string, any>
  ): SystemData {
    return {
      ...defaults,
      ...data,
    };
  }

  /**
   * Extract system-specific data from multi-system response
   */
  static extractSystemData(
    response: any,
    system: SystemKey
  ): SystemData | null {
    if (!response) return null;

    // If response has a 'data' field, extract it
    if (response.data) return response.data;

    // If response is the data itself, return it
    if (response[system]) return response[system];

    return response;
  }

  /**
   * Format search results for display
   */
  static formatSearchResults(results: SearchResult[]): SearchResult[] {
    return results.map((result) => ({
      ...result,
      displayName: result.name || result.email || result.userId,
    }));
  }

  /**
   * Filter search results by email domain
   */
  static filterResultsByDomain(
    results: SearchResult[],
    domain: string
  ): SearchResult[] {
    return results.filter((result) =>
      result.email?.toLowerCase().endsWith(`@${domain.toLowerCase()}`)
    );
  }

  /**
   * Sort results by relevance to query
   */
  static sortByRelevance(
    results: SearchResult[],
    query: string
  ): SearchResult[] {
    const lowerQuery = query.toLowerCase();
    return results.sort((a, b) => {
      const aName = (a.name || a.email || "").toLowerCase();
      const bName = (b.name || b.email || "").toLowerCase();

      // Exact match first
      if (aName === lowerQuery) return -1;
      if (bName === lowerQuery) return 1;

      // Starts with query
      if (aName.startsWith(lowerQuery) && !bName.startsWith(lowerQuery))
        return -1;
      if (bName.startsWith(lowerQuery) && !aName.startsWith(lowerQuery))
        return 1;

      // Contains query
      if (aName.includes(lowerQuery) && !bName.includes(lowerQuery)) return -1;
      if (bName.includes(lowerQuery) && !aName.includes(lowerQuery)) return 1;

      // Alphabetical
      return aName.localeCompare(bName);
    });
  }

  /**
   * Aggregate multi-system data
   */
  static aggregateSystemData(
    data: Record<SystemKey, any>
  ): Record<string, any> {
    const result: Record<string, any> = {};
    Object.entries(data).forEach(([system, systemData]) => {
      if (systemData) {
        result[system] = systemData;
      }
    });
    return result;
  }

  /**
   * Check if data is empty or null
   */
  static isEmpty(data: any): boolean {
    if (data === null || data === undefined) return true;
    if (typeof data === "object") {
      return Object.keys(data).length === 0;
    }
    if (typeof data === "string") {
      return data.trim() === "";
    }
    return false;
  }

  /**
   * Safely get nested property
   */
  static getNestedProperty(obj: any, path: string): any {
    try {
      return path.split(".").reduce((current, prop) => current?.[prop], obj);
    } catch {
      return undefined;
    }
  }

  /**
   * Flatten nested object for display
   */
  static flattenObject(
    obj: any,
    prefix = ""
  ): Record<string, any> {
    const result: Record<string, any> = {};

    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        Object.assign(result, this.flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    });

    return result;
  }
}
