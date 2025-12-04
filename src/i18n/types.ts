/**
 * i18n Type Definitions
 * =====================
 * 
 * Core TypeScript types for the internationalization system.
 * 
 * @module i18n/types
 */

/**
 * Supported language codes
 */
export type LanguageCode = 'en' | 'es';

/**
 * Configuration for a single language
 */
export interface LanguageConfig {
  /** ISO language code */
  code: LanguageCode;
  /** English name of the language */
  name: string;
  /** Native name of the language */
  nativeName: string;
  /** Flag emoji for display */
  flag: string;
  /** Text direction */
  direction: 'ltr' | 'rtl';
}

/**
 * i18n feature configuration from features.json
 */
export interface I18nFeatureConfig {
  /** Whether language switching is enabled */
  languageSwitcher: boolean;
  /** Default language code */
  defaultLanguage: LanguageCode;
  /** List of supported language codes */
  supportedLanguages: LanguageCode[];
}

/**
 * Translation interpolation parameters
 */
export type TranslationParams = Record<string, string | number>;

/**
 * Context value provided by I18nProvider
 */
export interface I18nContextValue {
  /** Current language code */
  language: LanguageCode;
  /** Set the current language */
  setLanguage: (lang: LanguageCode) => void;
  /** Translation object for current language */
  t: TranslationObject;
  /** Interpolate template string with parameters */
  translate: (template: string, params?: TranslationParams) => string;
  /** Whether language switching is enabled */
  isEnabled: boolean;
}

/**
 * Base translation object structure
 * This mirrors the JSON structure of translation files
 * Using 'unknown' for nested structures to allow flexibility
 */
export interface TranslationObject {
  common: Record<string, unknown>;
  header: Record<string, unknown>;
  search: Record<string, unknown>;
  snow: Record<string, unknown>;
  settings: Record<string, unknown>;
  educate: Record<string, unknown>;
  errors: Record<string, unknown>;
  pagination: Record<string, unknown>;
  systemCards: Record<string, unknown>;
  failures: Record<string, unknown>;
  quickActions: Record<string, unknown>;
  dataViewer: Record<string, unknown>;
  jsonViewer: Record<string, unknown>;
  roleSwitcher: Record<string, unknown>;
  accessibility: Record<string, unknown>;
  languageSwitcher: Record<string, unknown>;
  login: Record<string, unknown>;
}

// Individual translation section types
export interface CommonTranslations {
  buttons: Record<string, string>;
  status: Record<string, string>;
  errors: Record<string, string>;
  copy: Record<string, string>;
  tooltips: Record<string, string>;
  labels: Record<string, string>;
}

export interface HeaderTranslations {
  welcome: string;
  title: string;
  subtitle: string;
  userInfo: Record<string, string>;
  tooltips: Record<string, string>;
  buttons: Record<string, string>;
}

export interface SearchTranslations {
  title: string;
  description: string;
  placeholder: string;
  placeholders: Record<string, string>;
  viewAllData: string;
  buttons: Record<string, string>;
  tooltips: Record<string, string>;
  aria: Record<string, string>;
  emptyState: Record<string, string>;
  badges: Record<string, string>;
  noData: string;
  results: Record<string, string>;
  consolidatedView: Record<string, string>;
  errors: Record<string, string>;
}

export interface SnowTranslations {
  incidents: Record<string, string>;
  tooltips: Record<string, string>;
  filters: Record<string, string>;
  status: Record<string, string>;
  priority: Record<string, string>;
  emptyStates: Record<string, Record<string, string>>;
  ticket: Record<string, unknown>;
  table: Record<string, string>;
}

export interface SettingsTranslations {
  title: string;
  sections: Record<string, Record<string, string>>;
  systems: Record<string, string>;
  buttons: Record<string, string>;
  messages: Record<string, string>;
  hints: Record<string, string>;
}

export interface EducateTranslations {
  title: string;
  subtitle: string;
  buttons: Record<string, string>;
  emptyStates: Record<string, Record<string, string>>;
  stats: string;
  tips: Record<string, string>;
  footer: Record<string, string>;
}

export interface ErrorTranslations {
  boundary: Record<string, string>;
  notFound: Record<string, string>;
  network: Record<string, string>;
  auth: Record<string, string>;
}

export interface PaginationTranslations {
  emptyState: string;
  columns: Record<string, string>;
  tooltips: Record<string, string>;
  pageIndicator: string;
  labels: Record<string, string>;
  status: Record<string, string>;
  aria: Record<string, string>;
}

export interface SystemCardsTranslations {
  section: Record<string, string>;
  loading: string;
  emptyState: string;
  buttons: Record<string, string>;
  status: Record<string, string>;
  labels: Record<string, string>;
  links: Record<string, string>;
  dialog: Record<string, string>;
  fallbackTitle: string;
  tooltips: Record<string, string>;
  messages: Record<string, string>;
  pingFederate: Record<string, Record<string, string>>;
}

export interface FailuresTranslations {
  title: string;
  subtitle: string;
  emptyState: Record<string, string>;
  categories: Record<string, Record<string, string>>;
  labels: Record<string, string>;
}

export interface QuickActionsTranslations {
  title: string;
  subtitle: string;
  labels: Record<string, string>;
  external: Record<string, unknown>;
  target: Record<string, string>;
  noActions: string;
}

export interface DataViewerTranslations {
  title: string;
  buttons: Record<string, string>;
  tabs: Record<string, string>;
  emptyState: string;
  messages: Record<string, string>;
}

export interface JsonViewerTranslations {
  types: Record<string, unknown>;
  buttons: Record<string, string>;
  counts: Record<string, string>;
}

export interface RoleSwitcherTranslations {
  placeholder: string;
  headers: Record<string, string>;
  hints: Record<string, string>;
  tooltips: Record<string, string>;
  roles: Record<string, string>;
}

export interface AccessibilityTranslations {
  skipToContent: string;
  mainNavigation: string;
  searchResults: string;
  closeDialog: string;
  expandSection: string;
  collapseSection: string;
}

export interface LanguageSwitcherTranslations {
  label: string;
  tooltip: string;
  languages: Record<string, string>;
}
