/**
 * Employee 360° View Types
 * ========================
 * 
 * Type definitions for the Employee 360° View feature.
 * Isolated from other type files for clean separation.
 * 
 * @module components/dialogs/employee-360.types
 */

import type { SystemKey } from '@/config/systems.config';

// ============================================================================
// DATA TYPES
// ============================================================================

/**
 * Employee profile extracted from search results
 */
export interface EmployeeProfile {
  employeeId: string;
  displayName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  title?: string;
  manager?: string;
  location?: string;
  status?: string;
  startDate?: string;
  phone?: string;
}

/**
 * System data for 360° view
 */
export interface SystemData {
  /** System identifier */
  systemKey: SystemKey;
  /** Whether data was successfully fetched */
  hasData: boolean;
  /** Raw data from the system */
  data: Record<string, unknown> | null;
  /** Error if fetch failed */
  error?: string;
}

/**
 * Discrepancy information
 */
export interface Discrepancy {
  /** Field name */
  field: string;
  /** Human-readable field label */
  label: string;
  /** Values from different systems */
  values: Record<string, unknown>;
  /** Description of the discrepancy */
  message: string;
  /** Severity level */
  severity: 'warning' | 'error' | 'info';
}

/**
 * Missing field information
 */
export interface MissingField {
  /** Field name */
  field: string;
  /** Human-readable field label */
  label: string;
  /** Systems where field exists */
  presentIn: string[];
  /** Systems where field is missing */
  missingIn: string[];
}

/**
 * Complete 360° view data
 */
export interface Employee360Data {
  /** Employee profile summary */
  profile: EmployeeProfile;
  /** Data from each system */
  systems: Record<string, SystemData>;
  /** Detected discrepancies */
  discrepancies: Discrepancy[];
  /** Missing fields */
  missingFields: MissingField[];
  /** Timestamp when data was collected */
  collectedAt: Date;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Props for Employee360Dialog
 */
export interface Employee360DialogProps {
  /** Dialog open state */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** 360° view data */
  data: Employee360Data | null;
  /** Loading state */
  loading?: boolean;
}

/**
 * Props for Employee360Section
 */
export interface Employee360SectionProps {
  /** Section ID */
  id: string;
  /** Section title */
  title: string;
  /** Section icon name */
  icon: string;
  /** Section description */
  description: string;
  /** Section data */
  data: Record<string, unknown> | null;
  /** Whether section is expanded */
  defaultExpanded?: boolean;
  /** Discrepancies for this section */
  discrepancies?: Discrepancy[];
  /** Missing fields for this section */
  missingFields?: MissingField[];
  /** Associated system key */
  systemKey?: SystemKey;
}

/**
 * Props for Employee360DataRow
 */
export interface Employee360DataRowProps {
  /** Field label */
  label: string;
  /** Field value */
  value: unknown;
  /** Whether field has discrepancy */
  hasDiscrepancy?: boolean;
  /** Discrepancy message */
  discrepancyMessage?: string;
  /** Whether field is missing expected data */
  isMissing?: boolean;
}

/**
 * Props for Employee360Header
 */
export interface Employee360HeaderProps {
  /** Employee profile */
  profile: EmployeeProfile;
  /** Callback for copy to clipboard */
  onCopy: () => void;
  /** Callback for close */
  onClose: () => void;
  /** Number of discrepancies */
  discrepancyCount: number;
  /** Number of missing fields */
  missingCount: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Section collapse state
 */
export type SectionCollapseState = Record<string, boolean>;

/**
 * Copy format options
 */
export type CopyFormat = 'text' | 'json';
