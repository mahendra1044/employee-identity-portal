/**
 * i18n Configuration
 * ==================
 * 
 * Language configuration and constants for the i18n system.
 * 
 * @module i18n/config
 */

import type { LanguageCode, LanguageConfig } from './types';

/**
 * Supported languages with their configurations
 */
export const SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
  },
};

/**
 * Default language when no preference is set
 */
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

/**
 * LocalStorage key for persisting language preference
 */
export const LANGUAGE_STORAGE_KEY = 'app-language';

/**
 * Get language config by code
 */
export function getLanguageConfig(code: LanguageCode): LanguageConfig {
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
}

/**
 * Check if a language code is supported
 */
export function isLanguageSupported(code: string): code is LanguageCode {
  return code in SUPPORTED_LANGUAGES;
}

/**
 * Get all supported language codes
 */
export function getSupportedLanguageCodes(): LanguageCode[] {
  return Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
}
