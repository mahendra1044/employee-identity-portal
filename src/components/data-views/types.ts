/**
 * Data Views Types
 * ================
 * 
 * Shared types for data rendering components.
 */

export type { JsonValue, FieldSection } from "@/lib/types";

/** Props for value renderers */
export interface ValueRendererProps {
  value: unknown;
  fieldKey?: string;
  path?: string;
  onCopy?: (key: string, value: unknown) => void;
}

/** Grouped field for HTML display */
export interface GroupedField {
  k: string;
  v: unknown;
}

/** Field group with section metadata */
export interface FieldGroup {
  section: string;
  title: string;
  icon: string;
  gradient: string;
  fields: GroupedField[];
}
