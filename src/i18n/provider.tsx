/**
 * i18n React Context Provider
 * ===========================
 * 
 * Provides translation context to the entire application.
 * Handles language switching and persistence.
 * 
 * @module i18n/provider
 */

'use client';

import React, { createContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { LanguageCode, I18nContextValue, TranslationParams, TranslationObject } from './types';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, isLanguageSupported } from './config';

// Import all locale files
import en from './locales/en';
import es from './locales/es';

/**
 * All available locales
 */
const locales: Record<LanguageCode, TranslationObject> = { en, es };

/**
 * i18n Context - null when outside provider
 */
export const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Props for I18nProvider
 */
interface I18nProviderProps {
  children: React.ReactNode;
  /** Whether language switching is enabled (from features config) */
  enabled?: boolean;
  /** Initial/default language */
  defaultLang?: LanguageCode;
}

/**
 * I18nProvider Component
 * 
 * Wraps the application to provide translation context.
 * When disabled, always uses the default language.
 * 
 * @example
 * ```tsx
 * <I18nProvider enabled={features.languageSwitcher}>
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider({ 
  children, 
  enabled = true, 
  defaultLang = DEFAULT_LANGUAGE 
}: I18nProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLang);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved language preference on mount (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    
    if (enabled && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && isLanguageSupported(saved)) {
          setLanguageState(saved);
          document.documentElement.lang = saved;
        }
      } catch {
        // localStorage not available, use default
      }
    }
  }, [enabled]);

  // Set language and persist to localStorage
  const setLanguage = useCallback((lang: LanguageCode) => {
    if (!enabled) return; // Don't allow changes when disabled
    
    if (isLanguageSupported(lang)) {
      setLanguageState(lang);
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
          document.documentElement.lang = lang;
        } catch {
          // localStorage not available
        }
      }
    }
  }, [enabled]);

  // Template string interpolation function
  const translate = useCallback((template: string, params?: TranslationParams): string => {
    if (!params) return template;
    
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: locales[language],
    translate,
    isEnabled: enabled,
  }), [language, setLanguage, translate, enabled]);

  // During SSR or before hydration, use default language
  // This prevents hydration mismatch
  const effectiveValue = useMemo<I18nContextValue>(() => {
    if (!isHydrated) {
      return {
        language: defaultLang,
        setLanguage,
        t: locales[defaultLang],
        translate,
        isEnabled: enabled,
      };
    }
    return value;
  }, [isHydrated, defaultLang, setLanguage, translate, enabled, value]);

  return (
    <I18nContext.Provider value={effectiveValue}>
      {children}
    </I18nContext.Provider>
  );
}

export default I18nProvider;
