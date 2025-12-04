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
