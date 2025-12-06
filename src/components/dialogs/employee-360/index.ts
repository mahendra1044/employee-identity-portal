/**
 * Employee 360° View Module
 * =========================
 * 
 * Barrel exports for the Employee 360° View feature.
 * Import from this file for cleaner imports.
 * 
 * @example
 * import { Employee360Dialog, useEmployee360 } from '@/components/dialogs/employee-360';
 * 
 * @module components/dialogs/employee-360
 */

// Main dialog component
export { Employee360Dialog } from './Employee360Dialog';
export { default as Employee360DialogDefault } from './Employee360Dialog';

// Section component
export { Employee360Section } from './Employee360Section';
export { default as Employee360SectionDefault } from './Employee360Section';

// Types
export type {
  Employee360Data,
  EmployeeProfile,
  SystemData,
  Discrepancy,
  MissingField,
  Employee360DialogProps,
  Employee360SectionProps,
  Employee360DataRowProps,
  Employee360HeaderProps,
  SectionCollapseState,
  CopyFormat,
} from './employee-360.types';
