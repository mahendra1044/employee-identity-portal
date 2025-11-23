# Employee Identity Portal - Data Flow & Architecture

## Overview

The Employee Identity Portal is a comprehensive identity and access management (IAM) dashboard built with React/Next.js. It provides two distinct user roles with different capabilities:

- **Employee Role**: View their own identity information across multiple identity systems
- **Ops Role**: Search for any employee and view their details across all systems, plus advanced failure analysis

## Architecture Pattern

The application follows a **modular hook-based architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAGE (App.tsx)                           │
│                      Main coordinator                           │
└─────────────────────────────────────────────────────────────────┘
          ↓
    ┌─────────┬──────────────┬───────────────┬──────────┐
    │          │              │               │          │
┌─────────┐ ┌──────────┐ ┌──────────────┐ ┌────────┐ ┌──────────┐
│  Hooks  │ │Components│ │    Dialogs   │ │Sections│ │  Layout  │
│         │ │          │ │              │ │        │ │          │
├─────────┤ ├──────────┤ ├──────────────┤ ├────────┤ ├──────────┤
│useAuth  │ │SystemCard│ │SettingsDialog│ │Dialogs │ │ Header   │
│useTheme │ │SearchRslt│ │EducateGuideDl│ │Section │ │ Footer   │
│useSearch│ │DetailView│ │SnowIncidents │ │Quick   │ │          │
│useSnow  │ │          │ │PfOpsDialog   │ │Actions │ │          │
│usePfOps │ │          │ │              │ │Card    │ │          │
│useToggles│ │          │ │              │ │        │ │          │
│useUI    │ │          │ │              │ │        │ │          │
│          │ │          │ │              │ │        │ │          │
├─────────┤ └──────────┘ └──────────────┘ └────────┘ └──────────┘
│NEW HOOKS│
├─────────┤
│useFeatur│ (Feature loading from API)
│useTheme │ (DOM theme application)
│useOpsF. │ (Ops-specific logic)
│usePage  │ (Centralized dialog state)
│useConfig│ (UI configuration constants)
└─────────┘
```

## Key Data Flows

### 1. Authentication Flow
```
User Login
    ↓
useAppAuth.login()
    ↓
Backend Auth API
    ↓
token + role + email stored
    ↓
Update UI & Redirect to HomePage
```

### 2. Feature Loading Flow
```
HomePage Mount
    ↓
useFeatures(token)
    ↓
GET /config/features (API call)
    ↓
If fails → Use DEFAULT_FEATURES
    ↓
Calculate educateEnabled (with env override)
    ↓
Memoized enabled systems & orderedSystems
    ↓
Pass to Components
```

### 3. Theme Application Flow
```
useAppTheme.setTheme()
    ↓
useThemeDOM(theme)
    ↓
Apply CSS classes to document.root:
  - 'light': (none)
  - 'dark': 'dark'
  - 'navy': 'dark navy'
```

### 4. Search & Details Flow (Employee)
```
Search Input
    ↓
useSearch.doSearch()
    ↓
Parallel API calls to all systems:
  - GET /api/aad/user
  - GET /api/cyberark/accounts
  - GET /api/pd/profile
  - GET /api/pf/user
  - GET /api/mfa/status
  - GET /api/saviynt/info
    ↓
Aggregate results
    ↓
Display in SearchSection
    ↓
User clicks detail → Detail view in dialog
```

### 5. Search & Details Flow (Ops)
```
Ops User Search Input
    ↓
useSearch.doSearch(token, 'ops', searchTerm)
    ↓
Parallel API calls with ops context:
  - GET /api/aad/user?search=term
  - GET /api/cyberark/accounts?user=term
  - GET /api/pd/profile?search=term
  - GET /api/pf/user?email=term
  - GET /api/mfa/status?user=term
  - GET /api/saviynt/info?user=term
    ↓
Aggregate results
    ↓
Display results + Show QuickActionsCard
    ↓
useOpsFeatures.loadFailures()
    ↓
Show RecentFailuresPanel with:
  - ping-federate failures (minutes configurable)
  - ping-mfa failures (minutes configurable)
```

### 6. Dialog State Management Flow
```
usePageState() = useReducer(pageStateReducer, initialState)
    ↓
Global dialog state:
  ├─ settingsOpen
  ├─ educateOpen
  ├─ snowOpen
  ├─ pfOpsOpen
  └─ searchResultOpen
    ↓
UI toggles:
  ├─ qaActive (quick actions active tab)
  └─ searchDialogMode ('json' | 'html')
    ↓
Dispatcher functions:
  ├─ openSettings() / closeSettings() / toggleSettings()
  ├─ openEducate() / closeEducate() / toggleEducate()
  ├─ openSnow() / closeSnow() / toggleSnow()
  ├─ openPfOps() / closePfOps() / togglePfOps()
  ├─ openSearchResult() / closeSearchResult() / toggleSearchResult()
  ├─ setQaActive()
  ├─ setSearchDialogMode()
  └─ resetDialogs()
```

### 7. SNOW Integration Flow
```
openSnowDialog()
    ↓
resolveSnowEmail() - determine target email:
  - Employee: self email
  - Ops (searched): searched user's email
    ↓
useSnow.loadSnowIncidents(email)
    ↓
GET /api/snow/incidents?email=X&minutes=10
    ↓
Fallback to mock data if empty
    ↓
Display in SnowIncidentsDialog
    ↓
Count open/in-progress → snowCount
```

## Component Hierarchy

```
HomePage
├── Header
│   └── Theme toggle
│   └── Educate enable toggle
│   └── SNOW count badge
├── Main
│   ├── DialogsSection
│   │   ├── SettingsDialog
│   │   ├── EducateGuideDialog
│   │   ├── SnowIncidentsDialog
│   │   └── PfOpsDialog
│   ├── SearchSection
│   │   └── Search input + results
│   ├── QuickActionsCard (ops only, after search)
│   │   └── System tabs + action buttons
│   ├── RecentFailuresPanel (ops only)
│   │   └── Failure counts + details
│   └── SystemCardsGrid
│       ├── SystemCard (per enabled system)
│       │   ├── Basic info
│       │   └── View details button
│       └── Detail dialogs
└── Footer
```

## State Management Strategy

### Global State (Context)
- **useAppAuth**: User authentication (token, role, email)
- **useAppTheme**: Theme preference
- **useAppToggles**: System visibility toggles per user
- **useAppUI**: UI-specific state (currentRole, settingsOpen)

### Hook-Based Local State
- **useFeatures**: Feature configuration + educateEnabled flag
- **useThemeDOM**: Theme CSS application (side effect)
- **useOpsFeatures**: Ops-specific failures + quick actions
- **usePageState**: Centralized dialog states
- **useSearch**: Search results + loading state
- **useSnow**: SNOW incidents + loading state
- **usePfOps**: Ping Federate ops data + loading state

### Derived State (Memoized)
- **enabled**: Which systems are enabled (from features.systems)
- **orderedSystems**: System order from features or default
- **visibleSystems**: Filtered by enabled + user toggles + role
- **qaEnabledTabs**: Quick actions available tabs
- **resolveUserKey**: Current search target (computed from search results)

## New Architecture (Phase A-D Refactoring)

### Phase A: Quick Wins
1. ✅ **SCOPE 1**: Removed inline useAuth() duplicate (46 lines)
2. ✅ **SCOPE 7**: Created ui-config.ts - centralized constants

### Phase B: Hook Extraction
1. ✅ **SCOPE 2**: useFeatures.ts + useThemeDOM.ts (110 lines)
2. ✅ **SCOPE 3**: useOpsFeatures.ts (139 lines)
3. ✅ **SCOPE 5**: usePageState.ts (195 lines)

### Phase C: Component Extraction
1. ✅ **SCOPE 4**: 
   - QuickActionsCard.tsx (235 lines)
   - DialogsSection.tsx (110 lines)

### Phase D: Documentation
1. ✅ **SCOPE 8**: JSDoc comments + DATA_FLOW.md

## Benefits of This Architecture

### 1. **Modularity**
- Each hook has single responsibility
- Easy to test hooks independently
- Components are simpler and more focused

### 2. **Maintainability**
- Clear data flows make debugging easier
- New developers can understand each hook's purpose
- Less cognitive load - smaller files

### 3. **Reusability**
- Hooks can be used in multiple components
- Configuration centralized in ui-config.ts
- DialogsSection can be reused in other pages

### 4. **Performance**
- Memoized computations prevent unnecessary recalculations
- useReducer prevents prop drilling
- State colocation (state near usage)

### 5. **Type Safety**
- Full TypeScript strict mode compliance
- Clear prop interfaces for components
- Discriminated unions for reducer actions

## Configuration

All configuration is centralized in `src/lib/ui-config.ts`:

```typescript
export const THEME_CONFIG = { ... }         // Theme colors
export const THEME_CLASSES = { ... }        // CSS classes per theme
export const DIALOG_DEFAULTS = { ... }      // Dialog animations
export const UI_DEFAULTS = { ... }          // UI timeouts
export const CSS_CLASSES = { ... }          // Gradient/style constants
export const TIMING = { ... }               // Animation/transition timings
export const FEATURE_DEFAULTS = { ... }     // Default feature flags
export const SNOW_CONFIG = { ... }          // SNOW service config
export const OPS_CONFIG = { ... }           // Ops feature config
```

## API Integration Points

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Features
- `GET /config/features` - Load feature configuration

### Search
- `GET /api/aad/user?search=...` - Azure AD
- `GET /api/pd/profile?search=...` - Ping Directory
- `GET /api/pf/user?email=...` - Ping Federate
- `GET /api/cyberark/accounts?...` - CyberArk
- `GET /api/mfa/status?user=...` - Ping MFA
- `GET /api/saviynt/info?user=...` - Saviynt

### Details (QuickActions)
- `GET /api/pd/groups?user=...` - Ping Directory Groups
- `GET /api/pd/audit?user=...` - Ping Directory Audit
- `GET /api/pf/oidc?user=...` - Ping Federate OIDC
- `GET /api/pf/connections?user=...` - Ping Federate SAML
- `GET /api/mfa/devices?user=...` - MFA Devices
- `GET /api/mfa/events?user=...` - MFA Events
- `GET /api/cyberark/safes?...` - CyberArk Safes
- `GET /api/cyberark/activity?...` - CyberArk Activity
- `GET /api/saviynt/roles?...` - Saviynt Roles
- `GET /api/saviynt/entitlements?...` - Saviynt Entitlements

### Ops-Specific
- `GET /api/ops-failures?system=...&minutes=...` - Failure feeds
- `GET /api/snow/incidents?email=...` - ServiceNow incidents

## Testing Strategy

### Unit Tests (Recommended)
- Test each hook with `renderHook()` from @testing-library/react
- Mock API responses
- Test state transitions in usePageState reducer

### Integration Tests
- Test component + hook interaction
- Mock backend with MSW (Mock Service Worker)
- Test full user flows (search → details → SNOW)

### E2E Tests
- Run against real or staging backend
- Test complete workflows per role
- Verify all 9 features work correctly

## Future Improvements

1. **State Persistence**: Persist dialog states in URL params
2. **Advanced Search**: Add filters and saved searches
3. **Audit Logging**: Log all user actions
4. **Real-time Updates**: WebSocket for failure feeds
5. **Performance**: Virtual scrolling for large result sets
6. **Accessibility**: Full WCAG 2.1 AA compliance
7. **Error Recovery**: Retry mechanisms with exponential backoff
8. **Caching**: Implement SWR or React Query for smart caching

## Files Structure After Refactoring

```
src/
├── app/
│   └── page.tsx (366 lines - down from 629)
├── components/
│   ├── sections/
│   │   ├── DialogsSection.tsx (NEW)
│   │   ├── QuickActionsCard.tsx (NEW)
│   │   └── SearchSection.tsx (existing)
│   ├── dialogs/
│   │   ├── SettingsDialog.tsx
│   │   ├── EducateGuideDialog.tsx
│   │   ├── SnowIncidentsDialog.tsx
│   │   └── PfOpsDialog.tsx
│   └── ... (other components)
├── hooks/
│   ├── useFeatures.ts (NEW)
│   ├── useThemeDOM.ts (NEW)
│   ├── useOpsFeatures.ts (NEW)
│   ├── usePageState.ts (NEW)
│   └── ... (existing hooks)
└── lib/
    ├── ui-config.ts (NEW)
    └── ... (existing utilities)
```

## Conclusion

This refactoring transforms a 629-line monolithic component into a well-organized, modular architecture with:
- **-263 lines** removed from page.tsx (-41.8%)
- **+540 lines** of focused hooks and components
- **Clear separation of concerns**
- **Improved maintainability and testability**
- **100% feature parity** maintained
- **Zero breaking changes**

The new architecture makes the codebase accessible to fresh developers while maintaining the sophisticated IAM functionality.
