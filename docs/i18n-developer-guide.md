# Internationalization (i18n) Developer Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Implementation Details](#implementation-details)
5. [How It Works](#how-it-works)
6. [Usage Patterns](#usage-patterns)
7. [Adding New Languages](#adding-new-languages)
8. [Best Practices](#best-practices)

---

## Overview

The Employee Identity Portal implements a custom React Context-based internationalization (i18n) system that provides:

- **Multi-language support**: Currently English (en) and Spanish (es)
- **Feature-flagged**: Can be enabled/disabled via backend configuration
- **Type-safe**: Full TypeScript support with fallback patterns
- **Modular translations**: Organized by feature/component domain
- **Specialized hooks**: Purpose-built hooks for different UI sections

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Component  │    │  Component  │    │  Component  │         │
│  │  (Header)   │    │  (Search)   │    │  (Dialogs)  │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              useTranslation() Hook                   │       │
│  │         (or specialized hooks like useSnowT)         │       │
│  └─────────────────────────┬───────────────────────────┘       │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              I18nContext (React Context)             │       │
│  │  ┌─────────────────────────────────────────────┐    │       │
│  │  │  • t: TranslationObject                     │    │       │
│  │  │  • language: 'en' | 'es'                    │    │       │
│  │  │  • setLanguage: (lang) => void              │    │       │
│  │  │  • translate: (template, params) => string  │    │       │
│  │  │  • isEnabled: boolean                       │    │       │
│  │  └─────────────────────────────────────────────┘    │       │
│  └─────────────────────────┬───────────────────────────┘       │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              I18nProvider Component                  │       │
│  │  • Loads translations for current language           │       │
│  │  • Persists language preference to localStorage      │       │
│  │  • Merges all translation modules                    │       │
│  └─────────────────────────┬───────────────────────────┘       │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────┐       │
│  │           Translation Files (JSON)                   │       │
│  │  ┌──────────────┐  ┌──────────────┐                 │       │
│  │  │  locales/en/ │  │  locales/es/ │                 │       │
│  │  │  ├─common    │  │  ├─common    │                 │       │
│  │  │  ├─header    │  │  ├─header    │                 │       │
│  │  │  ├─search    │  │  ├─search    │                 │       │
│  │  │  └─...       │  │  └─...       │                 │       │
│  │  └──────────────┘  └──────────────┘                 │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/i18n/
├── index.ts              # Main exports (public API)
├── provider.tsx          # I18nProvider React component & context
├── hooks.ts              # All i18n hooks (useTranslation, specialized hooks)
├── types.ts              # TypeScript type definitions
├── config.ts             # Configuration (supported languages, defaults)
└── locales/
    ├── en/               # English translations
    │   ├── index.ts      # Aggregates all EN modules
    │   ├── common.json   # Common buttons, status, errors
    │   ├── header.json   # Header/navigation strings
    │   ├── login.json    # Login form strings
    │   ├── search.json   # Search section strings
    │   ├── settings.json # Settings dialog strings
    │   ├── snow.json     # ServiceNow tickets/incidents
    │   ├── educate.json  # Educate guide dialog
    │   ├── failures.json # Recent failures panel
    │   ├── quick-actions.json
    │   ├── data-viewer.json
    │   ├── json-viewer.json
    │   ├── system-cards.json
    │   ├── role-switcher.json
    │   ├── language-switcher.json
    │   ├── pagination.json
    │   ├── accessibility.json
    │   └── errors.json
    └── es/               # Spanish translations (same structure)
        ├── index.ts
        ├── common.json
        ├── header.json
        └── ... (mirrors EN structure)
```

---

## Implementation Details

### 1. Type Definitions (`types.ts`)

```typescript
// Supported language codes
export type LanguageCode = 'en' | 'es';

// Translation object structure (merged from all JSON files)
export interface TranslationObject {
  common: CommonTranslations;
  header: HeaderTranslations;
  login: LoginTranslations;
  search: SearchTranslations;
  // ... other sections
}

// Context value provided to components
export interface I18nContextValue {
  t: TranslationObject;           // All translations
  language: LanguageCode;         // Current language
  setLanguage: (lang: LanguageCode) => void;
  translate: (template: string, params?: TranslationParams) => string;
  isEnabled: boolean;             // Feature flag
}

// For string interpolation: "Hello {name}" → "Hello John"
export type TranslationParams = Record<string, string | number>;
```

### 2. Configuration (`config.ts`)

```typescript
export const I18N_CONFIG = {
  defaultLanguage: 'en' as LanguageCode,
  supportedLanguages: ['en', 'es'] as LanguageCode[],
  storageKey: 'app-language',
  fallbackLanguage: 'en' as LanguageCode,
};

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Español',
};
```

### 3. Provider (`provider.tsx`)

The `I18nProvider` is the core component that:

```typescript
export function I18nProvider({ 
  children, 
  enabled = true 
}: I18nProviderProps) {
  // 1. Initialize language from localStorage or default
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(I18N_CONFIG.storageKey);
      if (stored && I18N_CONFIG.supportedLanguages.includes(stored as LanguageCode)) {
        return stored as LanguageCode;
      }
    }
    return I18N_CONFIG.defaultLanguage;
  });

  // 2. Load translations for current language
  const translations = useMemo(() => {
    return language === 'es' ? esTranslations : enTranslations;
  }, [language]);

  // 3. Language setter with persistence
  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(I18N_CONFIG.storageKey, lang);
    }
  }, []);

  // 4. String interpolation function
  const translate = useCallback((template: string, params?: TranslationParams) => {
    if (!params) return template;
    return Object.entries(params).reduce(
      (str, [key, value]) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
      template
    );
  }, []);

  // 5. Provide context to children
  return (
    <I18nContext.Provider value={{ t: translations, language, setLanguage, translate, isEnabled: enabled }}>
      {children}
    </I18nContext.Provider>
  );
}
```

### 4. Hooks (`hooks.ts`)

**Primary Hook:**

```typescript
export function useTranslation(): {
  t: TranslationObject;
  translate: (template: string, params?: TranslationParams) => string;
} {
  const { t, translate } = useI18n();
  return { t, translate };
}
```

**Specialized Hooks for cleaner code:**

```typescript
// SNOW tickets & incidents
export function useSnowTranslations() {
  const { t, translate } = useI18n();
  const snow = createSectionAccessor(t.snow);
  
  return {
    snow,
    ticket: createSectionAccessor(getNestedT(t.snow, 'ticket', {})),
    incidents: createSectionAccessor(getNestedT(t.snow, 'incidents', {})),
    status: snow.getRecord('status'),
    priority: snow.getRecord('priority'),
    translate,
  };
}

// Similar hooks exist for:
// - useDataViewerTranslations()
// - useCommonTranslations()
// - useSettingsTranslations()
// - useSearchTranslations()
// - useEducateTranslations()
// - useQuickActionsTranslations()
// - useJsonViewerTranslations()
```

**Utility Functions:**

```typescript
// Safe nested path access
export function getNestedT<T = string>(
  obj: Record<string, unknown> | undefined,
  path: string,  // e.g., "ticket.dialogTitle"
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

// Section accessor factory
export function createSectionAccessor(section: Record<string, unknown> | undefined) {
  return {
    get: (path: string, fallback: string = ''): string => 
      getNestedT(section, path, fallback),
    getRecord: (path: string): Record<string, string> => 
      getNestedT(section, path, {}),
    getSection: (path: string): Record<string, unknown> => 
      getNestedT(section, path, {}),
    raw: section || {},
  };
}
```

---

## How It Works

### Flow Diagram

```
1. App Initialization
   └─► I18nProvider mounts
       └─► Checks localStorage for saved language
           └─► Falls back to 'en' if not found
               └─► Loads appropriate translation module

2. Component Rendering
   └─► Component calls useTranslation()
       └─► Gets { t, translate } from context
           └─► Accesses translations: t.header.buttons.signOut
               └─► Renders with fallback: {t.header.buttons.signOut || 'Sign out'}

3. Language Change
   └─► User clicks language switcher
       └─► setLanguage('es') called
           └─► State updates, localStorage persisted
               └─► Provider re-renders with new translations
                   └─► All components using useTranslation() re-render
```

### Example Component Usage

```tsx
function Header() {
  const { t, translate } = useTranslation();
  
  // Type-safe access to translations
  const header = t.header as Record<string, unknown>;
  const buttons = header?.buttons as Record<string, string> || {};
  const tooltips = header?.tooltips as Record<string, unknown> || {};

  return (
    <header>
      <Button onClick={logout}>
        {buttons.signOut || 'Sign out'}
      </Button>
      <Tooltip>
        {translate(
          (tooltips.snowCount as string) || '{count} incidents', 
          { count: 5 }
        )}
      </Tooltip>
    </header>
  );
}
```

### With Specialized Hook (Cleaner)

```tsx
function SnowTicketDialog() {
  const { ticket, translate } = useSnowTranslations();
  const { buttons } = useCommonTranslations();

  return (
    <Dialog>
      <DialogTitle>
        {ticket.get('dialogTitle', 'Create Ticket')}
      </DialogTitle>
      <Button>{buttons.submit || 'Submit'}</Button>
      <Button>{buttons.cancel || 'Cancel'}</Button>
    </Dialog>
  );
}
```

---

## Adding New Languages

### Step-by-Step Guide

Follow these steps to add support for a new language (e.g., French - `fr`):

#### Step 1: Update Type Definitions

**File: `src/i18n/types.ts`**

```typescript
// Before
export type LanguageCode = 'en' | 'es';

// After
export type LanguageCode = 'en' | 'es' | 'fr';
```

#### Step 2: Update Configuration

**File: `src/i18n/config.ts`**

```typescript
// Before
export const I18N_CONFIG = {
  defaultLanguage: 'en' as LanguageCode,
  supportedLanguages: ['en', 'es'] as LanguageCode[],
  // ...
};

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Español',
};

// After
export const I18N_CONFIG = {
  defaultLanguage: 'en' as LanguageCode,
  supportedLanguages: ['en', 'es', 'fr'] as LanguageCode[],  // Add 'fr'
  // ...
};

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',  // Add French name
};
```

#### Step 3: Create Translation Files

Create the entire folder structure for the new language:

```
src/i18n/locales/fr/
├── index.ts
├── accessibility.json
├── common.json
├── data-viewer.json
├── educate.json
├── errors.json
├── failures.json
├── header.json
├── json-viewer.json
├── language-switcher.json
├── login.json
├── pagination.json
├── quick-actions.json
├── role-switcher.json
├── search.json
├── settings.json
├── snow.json
└── system-cards.json
```

**Tip:** Copy the `en` folder as a starting point:

```powershell
# From project root
Copy-Item -Recurse src/i18n/locales/en src/i18n/locales/fr
```

#### Step 4: Create the Index File

**File: `src/i18n/locales/fr/index.ts`**

```typescript
/**
 * French Translations Index
 * Aggregates all French translation modules
 */

import accessibility from './accessibility.json';
import common from './common.json';
import dataViewer from './data-viewer.json';
import educate from './educate.json';
import errors from './errors.json';
import failures from './failures.json';
import header from './header.json';
import jsonViewer from './json-viewer.json';
import languageSwitcher from './language-switcher.json';
import login from './login.json';
import pagination from './pagination.json';
import quickActions from './quick-actions.json';
import roleSwitcher from './role-switcher.json';
import search from './search.json';
import settings from './settings.json';
import snow from './snow.json';
import systemCards from './system-cards.json';

const frTranslations = {
  accessibility,
  common,
  dataViewer,
  educate,
  errors,
  failures,
  header,
  jsonViewer,
  languageSwitcher,
  login,
  pagination,
  quickActions,
  roleSwitcher,
  search,
  settings,
  snow,
  systemCards,
};

export default frTranslations;
```

#### Step 5: Update Provider to Load New Language

**File: `src/i18n/provider.tsx`**

```typescript
// Add import
import frTranslations from './locales/fr';

// Update the translations loading logic
const translations = useMemo(() => {
  switch (language) {
    case 'es':
      return esTranslations;
    case 'fr':
      return frTranslations;  // Add French case
    default:
      return enTranslations;
  }
}, [language]);
```

#### Step 6: Translate All JSON Files

Translate each JSON file. Example for `common.json`:

**File: `src/i18n/locales/fr/common.json`**

```json
{
  "buttons": {
    "submit": "Soumettre",
    "cancel": "Annuler",
    "close": "Fermer",
    "save": "Enregistrer",
    "refresh": "Actualiser",
    "retry": "Réessayer",
    "viewDetails": "Voir les détails",
    "search": "Rechercher",
    "clear": "Effacer"
  },
  "status": {
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès",
    "noData": "Aucune donnée disponible"
  }
}
```

#### Step 7: Update Language Switcher Display (Optional)

**File: `src/i18n/locales/fr/language-switcher.json`**

```json
{
  "label": "Langue",
  "languages": {
    "en": "Anglais",
    "es": "Espagnol",
    "fr": "Français"
  },
  "current": "Langue actuelle: {language}"
}
```

Also update EN and ES files to include the French language name.

#### Step 8: Test the Implementation

1. Build the project:
   ```powershell
   npm run build
   ```

2. Start the dev server:
   ```powershell
   npm run dev
   ```

3. Test language switching in the UI
4. Verify all strings are translated
5. Check localStorage persistence works

---

### Quick Reference: Files to Modify

| File | Change Required |
|------|-----------------|
| `src/i18n/types.ts` | Add new language code to `LanguageCode` type |
| `src/i18n/config.ts` | Add to `supportedLanguages` array and `LANGUAGE_NAMES` |
| `src/i18n/provider.tsx` | Import new translations, add case to switch statement |
| `src/i18n/locales/{lang}/index.ts` | Create new aggregation file |
| `src/i18n/locales/{lang}/*.json` | Create all 17 translation files |

### Translation File Checklist

When creating a new language, ensure you translate ALL these files:

- [ ] `accessibility.json` - Screen reader & accessibility strings
- [ ] `common.json` - Shared buttons, status, errors
- [ ] `data-viewer.json` - Data viewer dialog
- [ ] `educate.json` - Educational guide dialog
- [ ] `errors.json` - Error messages and boundaries
- [ ] `failures.json` - Recent failures panel
- [ ] `header.json` - Header, navigation, user info
- [ ] `json-viewer.json` - JSON tree viewer
- [ ] `language-switcher.json` - Language selector
- [ ] `login.json` - Login form
- [ ] `pagination.json` - Pagination controls
- [ ] `quick-actions.json` - Quick actions panel
- [ ] `role-switcher.json` - RBAC role switcher
- [ ] `search.json` - Search section
- [ ] `settings.json` - Settings dialog
- [ ] `snow.json` - ServiceNow tickets/incidents
- [ ] `system-cards.json` - System card components

---

## Best Practices

### 1. Always Use Fallbacks

```tsx
// ✅ Good - has fallback
{buttons.submit || 'Submit'}

// ❌ Bad - no fallback, could render undefined
{buttons.submit}
```

### 2. Use Specialized Hooks When Available

```tsx
// ✅ Cleaner with specialized hook
const { ticket } = useSnowTranslations();
const title = ticket.get('dialogTitle', 'Create Ticket');

// ⚠️ Works but verbose
const { t } = useTranslation();
const snowT = t.snow as Record<string, unknown>;
const ticketT = snowT?.ticket as Record<string, string>;
const title = ticketT?.dialogTitle || 'Create Ticket';
```

### 3. Keep Translation Keys Organized

```json
// ✅ Good - organized by feature
{
  "ticket": {
    "dialogTitle": "Create Ticket",
    "buttons": {
      "submit": "Submit",
      "cancel": "Cancel"
    }
  }
}

// ❌ Bad - flat structure
{
  "ticketDialogTitle": "Create Ticket",
  "ticketSubmitButton": "Submit",
  "ticketCancelButton": "Cancel"
}
```

### 4. Use Interpolation for Dynamic Values

```tsx
// ✅ Good - uses interpolation
translate('{count} items selected', { count: 5 })
// Output: "5 items selected"

// ❌ Bad - concatenation breaks translations
`${count} items selected`
```

### 5. Keep Translations DRY

Use `common.json` for repeated strings:

```tsx
// ✅ Good - reuse common translations
const { buttons } = useCommonTranslations();
<Button>{buttons.cancel}</Button>  // Used in multiple dialogs

// ❌ Bad - duplicating in each file
// snow.json: { "cancelButton": "Cancel" }
// settings.json: { "cancelButton": "Cancel" }
```

---

## Troubleshooting

### Common Issues

1. **Translation not updating**: Clear localStorage and refresh
   ```javascript
   localStorage.removeItem('app-language');
   ```

2. **TypeScript errors**: Ensure type definitions match JSON structure

3. **Missing translations**: Check browser console for undefined keys

4. **Build errors**: Verify all JSON files are valid JSON (no trailing commas)

---

## Summary

The i18n system provides a robust, type-safe internationalization solution with:

- ✅ React Context-based architecture
- ✅ Modular JSON translation files
- ✅ Specialized hooks for cleaner code
- ✅ Safe fallback patterns
- ✅ localStorage persistence
- ✅ Feature flag support
- ✅ Easy extensibility for new languages

For questions or issues, contact the development team.
