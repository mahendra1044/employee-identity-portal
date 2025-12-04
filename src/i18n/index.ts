// Main i18n module export
export { I18nProvider, I18nContext } from './provider';
export { useI18n, useTranslation, useLanguage } from './hooks';
export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './config';
export type { LanguageCode, LanguageConfig, I18nContextValue, TranslationObject } from './types';

// Re-export locales for direct access if needed
import en from './locales/en';
import es from './locales/es';

export const locales = { en, es };
