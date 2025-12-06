/**
 * useEmployee360 Hook
 * ===================
 * 
 * Hook for aggregating employee data from existing search results
 * and system card data for the 360° view.
 * 
 * IMPORTANT: This hook does NOT make additional API calls.
 * It reuses data already fetched by the search and system cards.
 * 
 * @module hooks/useEmployee360
 */

import { useCallback, useMemo } from 'react';
import { 
  employee360Config, 
  getEnabledSections,
  DISCREPANCY_FIELDS,
  FIELD_MAPPINGS,
} from '@/config/employee-360.config';
import type { SystemKey } from '@/config/systems.config';
import type { SearchResults } from '@/lib/types';
import type { 
  Employee360Data, 
  EmployeeProfile, 
  SystemData, 
  Discrepancy,
  MissingField,
} from '@/components/dialogs/employee-360/employee-360.types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface UseEmployee360Options {
  /** Search results from useSearch hook */
  searchResults: SearchResults | null;
  /** System card data (aggregated) */
  systemData?: Record<string, Record<string, unknown> | null>;
  /** Current search term */
  searchTerm?: string;
}

interface UseEmployee360Return {
  /** Aggregated 360° data */
  data: Employee360Data | null;
  /** Whether data is available */
  hasData: boolean;
  /** Check if feature is enabled */
  isEnabled: boolean;
  /** Get enabled sections */
  sections: ReturnType<typeof getEnabledSections>;
  /** Format data for clipboard */
  formatForClipboard: (format: 'text' | 'json') => string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract employee profile from search results
 */
function extractProfile(searchResults: SearchResults | null, searchTerm?: string): EmployeeProfile {
  const profile: EmployeeProfile = {
    employeeId: searchTerm || 'Unknown',
    displayName: 'Unknown',
    email: '',
  };

  if (!searchResults) return profile;

  // Try to extract from Ping Directory first
  const pingDir = searchResults['ping-directory'];
  if (Array.isArray(pingDir) && pingDir.length > 0) {
    const pd = pingDir[0] as Record<string, unknown>;
    profile.employeeId = String(pd.employeeNumber || pd.uid || profile.employeeId);
    profile.displayName = String(pd.cn || pd.displayName || profile.displayName);
    profile.email = String(pd.mail || pd.email || '');
    profile.firstName = String(pd.givenName || '');
    profile.lastName = String(pd.sn || '');
    profile.department = String(pd.department || pd.departmentNumber || '');
    profile.title = String(pd.title || '');
    profile.manager = String(pd.manager || '');
  }

  // Supplement with Azure AD if available
  const azureAd = searchResults['azure-ad'];
  if (Array.isArray(azureAd) && azureAd.length > 0) {
    const ad = azureAd[0] as Record<string, unknown>;
    if (!profile.email) profile.email = String(ad.userPrincipalName || ad.mail || '');
    if (profile.displayName === 'Unknown') profile.displayName = String(ad.displayName || profile.displayName);
    if (!profile.department) profile.department = String(ad.department || '');
    if (!profile.title) profile.title = String(ad.jobTitle || '');
    profile.location = String(ad.officeLocation || ad.city || '');
  }

  // Supplement with Saviynt if available
  const saviynt = searchResults['saviynt'];
  if (Array.isArray(saviynt) && saviynt.length > 0) {
    const sv = saviynt[0] as Record<string, unknown>;
    if (!profile.employeeId || profile.employeeId === 'Unknown') {
      profile.employeeId = String(sv.employeeid || sv.username || profile.employeeId);
    }
    if (profile.displayName === 'Unknown') {
      profile.displayName = String(sv.displayname || sv.firstname + ' ' + sv.lastname || profile.displayName);
    }
    profile.status = String(sv.status || sv.statuskey || '');
    profile.startDate = String(sv.startdate || sv.createdate || '');
  }

  return profile;
}

/**
 * Extract system data from search results
 */
function extractSystemData(
  searchResults: SearchResults | null,
  systemData: Record<string, Record<string, unknown> | null> | undefined,
  systemKey: SystemKey
): SystemData {
  const result: SystemData = {
    systemKey,
    hasData: false,
    data: null,
  };

  // First try search results
  if (searchResults && searchResults[systemKey]) {
    const data = searchResults[systemKey];
    if (Array.isArray(data) && data.length > 0) {
      result.hasData = true;
      result.data = data[0] as Record<string, unknown>;
      return result;
    }
  }

  // Then try system card data
  if (systemData && systemData[systemKey]) {
    result.hasData = true;
    result.data = systemData[systemKey];
    return result;
  }

  return result;
}

/**
 * Get normalized field value from system data
 */
function getNormalizedValue(
  data: Record<string, unknown> | null,
  systemKey: string,
  canonicalField: string
): unknown {
  if (!data) return undefined;

  const mappings = FIELD_MAPPINGS[systemKey];
  if (!mappings) {
    // Try direct field access
    return data[canonicalField];
  }

  // Find the system-specific field name
  for (const [systemField, canonical] of Object.entries(mappings)) {
    if (canonical === canonicalField && data[systemField] !== undefined) {
      return data[systemField];
    }
  }

  // Fallback to direct field access
  return data[canonicalField];
}

/**
 * Detect discrepancies between systems
 */
function detectDiscrepancies(
  systems: Record<string, SystemData>
): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];

  if (!employee360Config.highlighting.showDiscrepancies) {
    return discrepancies;
  }

  for (const [fieldKey, fieldConfig] of Object.entries(DISCREPANCY_FIELDS)) {
    const values: Record<string, unknown> = {};
    const nonEmptyValues: unknown[] = [];

    for (const systemKey of fieldConfig.systems) {
      const systemData = systems[systemKey];
      if (systemData?.hasData && systemData.data) {
        const value = getNormalizedValue(systemData.data, systemKey, fieldKey);
        if (value !== undefined && value !== null && value !== '') {
          values[systemKey] = value;
          nonEmptyValues.push(String(value).toLowerCase().trim());
        }
      }
    }

    // Check if there are different values across systems
    const uniqueValues = new Set(nonEmptyValues);
    if (uniqueValues.size > 1) {
      discrepancies.push({
        field: fieldKey,
        label: fieldConfig.label,
        values,
        message: `${fieldConfig.label} differs across systems`,
        severity: 'warning',
      });
    }
  }

  return discrepancies;
}

/**
 * Detect missing fields
 */
function detectMissingFields(
  systems: Record<string, SystemData>
): MissingField[] {
  const missingFields: MissingField[] = [];

  if (!employee360Config.highlighting.showMissingFields) {
    return missingFields;
  }

  for (const [fieldKey, fieldConfig] of Object.entries(DISCREPANCY_FIELDS)) {
    const presentIn: string[] = [];
    const missingIn: string[] = [];

    for (const systemKey of fieldConfig.systems) {
      const systemData = systems[systemKey];
      if (systemData?.hasData && systemData.data) {
        const value = getNormalizedValue(systemData.data, systemKey, fieldKey);
        if (value !== undefined && value !== null && value !== '') {
          presentIn.push(systemKey);
        } else {
          missingIn.push(systemKey);
        }
      }
    }

    // Only report if field exists somewhere but missing elsewhere
    if (presentIn.length > 0 && missingIn.length > 0) {
      missingFields.push({
        field: fieldKey,
        label: fieldConfig.label,
        presentIn,
        missingIn,
      });
    }
  }

  return missingFields;
}

/**
 * Format 360° data for clipboard
 */
function formatForClipboardText(data: Employee360Data): string {
  const lines: string[] = [];
  const divider = '═'.repeat(60);
  const sectionDivider = '─'.repeat(40);

  lines.push(divider);
  lines.push(`  EMPLOYEE 360° VIEW`);
  lines.push(`  ${data.profile.displayName} (${data.profile.employeeId})`);
  lines.push(divider);
  lines.push('');

  // Profile section
  lines.push('▼ EMPLOYEE PROFILE');
  lines.push(sectionDivider);
  lines.push(`  Employee ID:   ${data.profile.employeeId}`);
  lines.push(`  Display Name:  ${data.profile.displayName}`);
  lines.push(`  Email:         ${data.profile.email}`);
  if (data.profile.department) lines.push(`  Department:    ${data.profile.department}`);
  if (data.profile.title) lines.push(`  Title:         ${data.profile.title}`);
  if (data.profile.manager) lines.push(`  Manager:       ${data.profile.manager}`);
  if (data.profile.status) lines.push(`  Status:        ${data.profile.status}`);
  lines.push('');

  // System sections
  const enabledSections = getEnabledSections();
  for (const section of enabledSections) {
    if (section.id === 'employeeProfile') continue;
    
    const systemData = section.systemKey ? data.systems[section.systemKey] : null;
    lines.push(`▼ ${section.label.toUpperCase()}`);
    lines.push(sectionDivider);
    
    if (systemData?.hasData && systemData.data) {
      for (const [key, value] of Object.entries(systemData.data)) {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        lines.push(`  ${key}: ${displayValue}`);
      }
    } else {
      lines.push('  No data available');
    }
    lines.push('');
  }

  // Discrepancies
  if (data.discrepancies.length > 0) {
    lines.push('⚠️ DISCREPANCIES DETECTED');
    lines.push(sectionDivider);
    for (const d of data.discrepancies) {
      lines.push(`  ${d.label}:`);
      for (const [sys, val] of Object.entries(d.values)) {
        lines.push(`    - ${sys}: ${val}`);
      }
    }
    lines.push('');
  }

  // Missing fields
  if (data.missingFields.length > 0) {
    lines.push('❌ MISSING FIELDS');
    lines.push(sectionDivider);
    for (const m of data.missingFields) {
      lines.push(`  ${m.label}: missing in ${m.missingIn.join(', ')}`);
    }
    lines.push('');
  }

  lines.push(divider);
  lines.push(`  Generated: ${data.collectedAt.toISOString()}`);
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useEmployee360(options: UseEmployee360Options): UseEmployee360Return {
  const { searchResults, systemData, searchTerm } = options;

  const sections = useMemo(() => getEnabledSections(), []);
  const isEnabled = employee360Config.enabled;

  const data = useMemo<Employee360Data | null>(() => {
    if (!searchResults || Object.keys(searchResults).length === 0) {
      return null;
    }

    // Extract profile
    const profile = extractProfile(searchResults, searchTerm);

    // Extract system data for each enabled section
    const systems: Record<string, SystemData> = {};
    for (const section of sections) {
      if (section.systemKey) {
        systems[section.systemKey] = extractSystemData(
          searchResults,
          systemData,
          section.systemKey
        );
      }
    }

    // Detect discrepancies and missing fields
    const discrepancies = detectDiscrepancies(systems);
    const missingFields = detectMissingFields(systems);

    return {
      profile,
      systems,
      discrepancies,
      missingFields,
      collectedAt: new Date(),
    };
  }, [searchResults, systemData, searchTerm, sections]);

  const hasData = data !== null;

  const formatForClipboard = useCallback((format: 'text' | 'json'): string => {
    if (!data) return '';

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    return formatForClipboardText(data);
  }, [data]);

  return {
    data,
    hasData,
    isEnabled,
    sections,
    formatForClipboard,
  };
}

export default useEmployee360;
