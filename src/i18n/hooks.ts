/**
 * i18n React Hooks
 * ================
 * 
 * Custom hooks for accessing translations and language settings.
 * 
 * @module i18n/hooks
 */

'use client';

import { useContext } from 'react';
import { I18nContext } from './provider';
import type { I18nContextValue, TranslationObject, TranslationParams, LanguageCode } from './types';

/**
 * Main i18n hook - provides full access to i18n context
 * 
 * @throws Error if used outside I18nProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, language, setLanguage, translate, isEnabled } = useI18n();
 *   return <h1>{t.header.title}</h1>;
 * }
 * ```
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error(
      'useI18n must be used within an I18nProvider. ' +
      'Make sure your component is wrapped with <I18nProvider>.'
    );
  }
  
  return context;
}

/**
 * Convenience hook for translations only
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, translate } = useTranslation();
 *   return <p>{translate(t.common.copy.copiedData, { name: 'JSON' })}</p>;
 * }
 * ```
 */
export function useTranslation(): {
  t: TranslationObject;
  translate: (template: string, params?: TranslationParams) => string;
} {
  const { t, translate } = useI18n();
  return { t, translate };
}

/**
 * Convenience hook for language management
 * 
 * @example
 * ```tsx
 * function LanguagePicker() {
 *   const { language, setLanguage, isEnabled } = useLanguage();
 *   if (!isEnabled) return null;
 *   return <select value={language} onChange={e => setLanguage(e.target.value)} />;
 * }
 * ```
 */
export function useLanguage(): {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isEnabled: boolean;
} {
  const { language, setLanguage, isEnabled } = useI18n();
  return { language, setLanguage, isEnabled };
}

/**
 * Hook to get a specific translation section
 * Useful when a component only needs one section
 * 
 * @example
 * ```tsx
 * function Header() {
 *   const header = useTranslationSection('header');
 *   return <h1>{header.title}</h1>;
 * }
 * ```
 */
export function useTranslationSection<K extends keyof TranslationObject>(
  section: K
): TranslationObject[K] {
  const { t } = useI18n();
  return t[section];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely get a nested translation value by dot-notation path
 * Returns the value at the path or the fallback if not found
 * 
 * @example
 * ```tsx
 * const title = getNestedT(t.snow, 'ticket.dialogTitle', 'Create Ticket');
 * const buttons = getNestedT(t.common, 'buttons', {});
 * ```
 */
export function getNestedT<T = string>(
  obj: Record<string, unknown> | undefined,
  path: string,
  fallback: T
): T {
  if (!obj) return fallback;
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return fallback;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return (current as T) ?? fallback;
}

/**
 * Type-safe accessor for a translation section
 * Returns an object with getters for common patterns
 * 
 * @example
 * ```tsx
 * const snow = createSectionAccessor(t.snow);
 * const title = snow.get('ticket.dialogTitle', 'Create Ticket');
 * const buttons = snow.getRecord('ticket.buttons');
 * ```
 */
export function createSectionAccessor(section: Record<string, unknown> | undefined) {
  return {
    /** Get a string value at path */
    get: (path: string, fallback: string = ''): string => 
      getNestedT(section, path, fallback),
    
    /** Get a nested object as Record<string, string> */
    getRecord: (path: string): Record<string, string> => 
      getNestedT(section, path, {} as Record<string, string>),
    
    /** Get a nested object as Record<string, unknown> */
    getSection: (path: string): Record<string, unknown> => 
      getNestedT(section, path, {} as Record<string, unknown>),
    
    /** Get a nested object with nested records (for emptyStates, etc.) */
    getNestedRecord: (path: string): Record<string, Record<string, string>> => 
      getNestedT(section, path, {} as Record<string, Record<string, string>>),
    
    /** Raw section access */
    raw: section || {},
  };
}

// ============================================================================
// SPECIALIZED SECTION HOOKS
// ============================================================================

/**
 * Hook for SNOW-related translations (tickets, incidents)
 * 
 * @example
 * ```tsx
 * const { ticket, incidents, status, translate } = useSnowTranslations();
 * return <span>{ticket.get('dialogTitle', 'Create Ticket')}</span>;
 * ```
 */
export function useSnowTranslations() {
  const { t, translate } = useI18n();
  const snow = createSectionAccessor(t.snow as Record<string, unknown>);
  
  return {
    snow,
    ticket: createSectionAccessor(getNestedT(t.snow as Record<string, unknown>, 'ticket', {})),
    incidents: createSectionAccessor(getNestedT(t.snow as Record<string, unknown>, 'incidents', {})),
    status: snow.getRecord('status'),
    priority: snow.getRecord('priority'),
    filters: snow.getRecord('filters'),
    tooltips: snow.getRecord('tooltips'),
    table: snow.getRecord('table'),
    footer: snow.getRecord('footer'),
    emptyStates: snow.getNestedRecord('emptyStates'),
    translate,
  };
}

/**
 * Hook for Data Viewer dialog translations
 * 
 * @example
 * ```tsx
 * const { buttons, tooltips, copy, translate } = useDataViewerTranslations();
 * ```
 */
export function useDataViewerTranslations() {
  const { t, translate } = useI18n();
  const dataViewer = createSectionAccessor(t.dataViewer as Record<string, unknown>);
  
  return {
    dataViewer,
    buttons: dataViewer.getRecord('buttons'),
    tooltips: dataViewer.getRecord('tooltips'),
    badges: dataViewer.getRecord('badges'),
    footer: dataViewer.getRecord('footer'),
    copy: dataViewer.getRecord('copy'),
    loading: dataViewer.getRecord('loading'),
    translate,
  };
}

/**
 * Hook for Common translations (buttons, status, etc.)
 * 
 * @example
 * ```tsx
 * const { buttons, status } = useCommonTranslations();
 * return <button>{buttons.cancel}</button>;
 * ```
 */
export function useCommonTranslations() {
  const { t, translate } = useI18n();
  const common = createSectionAccessor(t.common as Record<string, unknown>);
  
  return {
    common,
    buttons: common.getRecord('buttons'),
    status: common.getRecord('status'),
    errors: common.getRecord('errors'),
    copy: common.getRecord('copy'),
    tooltips: common.getRecord('tooltips'),
    labels: common.getRecord('labels'),
    translate,
  };
}

/**
 * Hook for Settings dialog translations
 */
export function useSettingsTranslations() {
  const { t, translate } = useI18n();
  const settings = createSectionAccessor(t.settings as Record<string, unknown>);
  
  return {
    settings,
    title: settings.get('title', 'Settings'),
    sections: settings.getSection('sections'),
    buttons: settings.getRecord('buttons'),
    messages: settings.getRecord('messages'),
    hints: settings.getRecord('hints'),
    emptyStates: settings.getNestedRecord('emptyStates'),
    translate,
  };
}

/**
 * Hook for Search section translations
 */
export function useSearchTranslations() {
  const { t, translate } = useI18n();
  const search = createSectionAccessor(t.search as Record<string, unknown>);
  
  return {
    search,
    title: search.get('title', 'Search'),
    placeholder: search.get('placeholder', 'Search...'),
    placeholders: search.getRecord('placeholders'),
    buttons: search.getRecord('buttons'),
    tooltips: search.getRecord('tooltips'),
    badges: search.getRecord('badges'),
    emptyState: search.getRecord('emptyState'),
    results: search.getRecord('results'),
    errors: search.getRecord('errors'),
    translate,
  };
}

/**
 * Hook for JSON Viewer translations
 */
export function useJsonViewerTranslations() {
  const { t } = useI18n();
  const jsonViewer = createSectionAccessor(t.jsonViewer as Record<string, unknown>);
  
  return {
    jsonViewer,
    types: jsonViewer.getRecord('types'),
    buttons: jsonViewer.getRecord('buttons'),
    counts: jsonViewer.getRecord('counts'),
  };
}

/**
 * Hook for Educate Guide dialog translations
 */
export function useEducateTranslations() {
  const { t, translate } = useI18n();
  const educate = createSectionAccessor(t.educate as Record<string, unknown>);
  
  return {
    educate,
    title: educate.get('title', 'Educate Me'),
    subtitle: educate.get('subtitle', ''),
    stats: educate.get('stats', '{tips} tips · {systems} systems'),
    placeholder: educate.get('placeholder', 'Search tips...'),
    buttons: educate.getRecord('buttons'),
    filters: educate.getRecord('filters'),
    badges: educate.getRecord('badges'),
    emptyStates: educate.getNestedRecord('emptyStates'),
    footer: educate.getRecord('footer'),
    translate,
  };
}

/**
 * Hook for Quick Actions translations
 */
export function useQuickActionsTranslations() {
  const { t } = useI18n();
  const quickActions = createSectionAccessor(t.quickActions as Record<string, unknown>);
  
  return {
    quickActions,
    title: quickActions.get('title', 'Quick Actions'),
    description: quickActions.get('description', ''),
    external: quickActions.getRecord('external'),
    target: quickActions.getRecord('target'),
    labels: quickActions.getRecord('labels'),
  };
}

