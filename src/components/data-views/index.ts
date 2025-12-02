/**
 * Data Views - Barrel Export
 * ==========================
 * 
 * Shared components for rendering data in different formats.
 * Used by SearchSection, DataDialog, and other data display components.
 * 
 * @example
 * import { SmartValueRenderer, JsonTreeRenderer, GroupedFieldsRenderer } from '@/components/data-views';
 */

export { SmartValueRenderer } from './SmartValueRenderer';
export { JsonTreeRenderer } from './JsonTreeRenderer';
export { GroupedFieldsRenderer } from './GroupedFieldsRenderer';
export type { ValueRendererProps, GroupedField, FieldGroup } from './types';
