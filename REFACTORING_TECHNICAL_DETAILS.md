# Refactoring Examples & Technical Details

## SCOPE 1: Remove Inline Auth - Code Example

### ❌ CURRENT (Problematic)
```tsx
// In page.tsx lines 41-80
function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const auth = StorageService.getAuth();
    if (auth.token && auth.role && auth.email) {
      setToken(auth.token);
      setRole(auth.role);
      setEmail(auth.email);
    }
  }, []);

  const login = async (emailInput: string, password: string) => {
    // ... 20 lines of login logic
  };

  const logout = () => {
    StorageService.clearAuth();
    setToken(null);
    setRole(null);
    setEmail(null);
  };

  return { token, role, email, login, logout };
}

export default function HomePage() {
  const { token, role: originalRole, email, login, logout } = useAuth(); // ❌ Wrong hook!
  // ...rest of code
}
```

**Problems:**
- Duplicates what `useAppAuth` does
- Harder to understand which auth hook to use
- Logic spread across two hooks
- Confusing for new developers

### ✅ AFTER (Clean)
```tsx
// In page.tsx
import { useAppAuth } from '@/hooks/useAppAuth';

export default function HomePage() {
  // Use the proper context-based hook
  const { token, role: originalRole, email, login, logout } = useAppAuth();
  // ...rest of code
}
```

**Benefits:**
- Single source of truth for auth
- Uses context properly (recommended pattern)
- Saves 40 lines from page.tsx
- Clear which hook to use

---

## SCOPE 2: Extract Feature & Theme Logic - Code Example

### ❌ CURRENT (Scattered Effects)
```tsx
// page.tsx lines 150-220
const [features, setFeatures] = useState<Features | null>(null);

// Theme effect
useEffect(() => {
  if (typeof window !== 'undefined' && theme) {
    let classes = '';
    if (theme === 'light') {
      classes = '';
    } else if (theme === 'dark') {
      classes = 'dark';
    } else if (theme === 'navy') {
      classes = 'dark navy';
    }
    document.documentElement.className = classes;
  }
}, [theme]);

// Feature loading effect
useEffect(() => {
  if (!token) return;
  const run = async () => {
    try {
      const res = await fetch(`${API_BASE}/config/features`);
      if (res.ok) {
        const f = await res.json();
        setFeatures(f);
      } else {
        setFeatures({
          credentialSource: "env",
          useMocks: true,
          useMockAuth: true,
          systems: SYSTEMS.reduce((acc, s) => ({ ...acc, [s]: true }), {}),
        });
      }
    } catch {
      setFeatures({
        credentialSource: "env",
        useMocks: true,
        useMockAuth: true,
      });
    }
  };
  run();
}, [token]);
```

### ✅ AFTER (Custom Hooks)
```tsx
// src/hooks/useFeatures.ts (NEW FILE)
export function useFeatures(token: string | null) {
  const [features, setFeatures] = useState<Features | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchFeatures = async () => {
      try {
        const res = await fetch(`${API_BASE}/config/features`);
        setFeatures(res.ok ? await res.json() : DEFAULT_FEATURES);
      } catch {
        setFeatures(DEFAULT_FEATURES);
      }
    };
    fetchFeatures();
  }, [token]);

  return { features };
}

// src/hooks/useThemeDOM.ts (NEW FILE)
export function useThemeDOM(theme: string) {
  useEffect(() => {
    if (typeof window === 'undefined' || !theme) return;
    const classMap = {
      'light': '',
      'dark': 'dark',
      'navy': 'dark navy',
    };
    document.documentElement.className = classMap[theme] || '';
  }, [theme]);
}

// In page.tsx (CLEANER)
const { features } = useFeatures(token);
useThemeDOM(theme);
```

**Benefits:**
- Logic isolated in testable hooks
- Easy to modify theme behavior
- Clear responsibility separation
- Saves 70+ lines from page.tsx

---

## SCOPE 3: Extract Ops Features - Code Example

### ❌ CURRENT (Scattered)
```tsx
// page.tsx - ops logic scattered everywhere
const [minutes, setMinutes] = useState<number>(10);
const [failFed, setFailFed] = useState<any[]>([]);
const [failMfa, setFailMfa] = useState<any[]>([]);
const [opsLoading, setOpsLoading] = useState(false);
const [opsError, setOpsError] = useState<string | null>(null);

const qaEnabledTabs = useMemo(() => ({
  ...enabled,
  ...(features?.quickActionsTabs || {})
}), [enabled, features]);

// Lines 250+: Complex ops-specific rendering
{role === "ops" && hasSearched && (
  <section>
    <Card>
      {/* 50+ lines of quick actions UI */}
    </Card>
  </section>
)}

{role === "ops" && (
  <RecentFailuresPanel
    minutes={minutes}
    onMinutesChange={setMinutes}
    failFed={failFed}
    failMfa={failMfa}
    // ...more props
  />
)}
```

### ✅ AFTER (Custom Hook)
```tsx
// src/hooks/useOpsFeatures.ts (NEW FILE)
export function useOpsFeatures(role: string | null, token: string | null) {
  const [minutes, setMinutes] = useState<number>(10);
  const [failFed, setFailFed] = useState<any[]>([]);
  const [failMfa, setFailMfa] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'ops' || !token) return;
    
    const loadFailures = async () => {
      setLoading(true);
      try {
        const [fedRes, mfaRes] = await Promise.all([
          fetch(`/api/ops-failures?system=ping-federate&minutes=${minutes}`),
          fetch(`/api/ops-failures?system=ping-mfa&minutes=${minutes}`),
        ]);
        const [fedData, mfaData] = await Promise.all([
          fedRes.json(),
          mfaRes.json(),
        ]);
        setFailFed(fedData?.data || []);
        setFailMfa(mfaData?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFailures();
  }, [role, token, minutes]);

  return {
    minutes,
    setMinutes,
    failFed,
    failMfa,
    loading,
    error,
    isOps: role === 'ops',
  };
}

// In page.tsx (CLEANER)
const opsFeatures = useOpsFeatures(role, token);

// Render only if ops
{opsFeatures.isOps && (
  <>
    <QuickActionsSection qaEnabledTabs={qaEnabledTabs} />
    <RecentFailuresPanel {...opsFeatures} />
  </>
)}
```

**Benefits:**
- Ops logic contained in one hook
- Easy to enable/disable ops features
- Reusable in other pages
- Clear separation from employee logic

---

## SCOPE 4: Extract Layout Components - Code Example

### ❌ CURRENT (300+ lines of JSX)
```tsx
return (
  <div className="min-h-screen flex flex-col">
    <Header ... />
    <main className="flex-1 max-w-7xl mx-auto px-4 py-6 space-y-8">
      
      {/* Settings Dialog - 30 lines */}
      <SettingsDialog ... />
      
      {/* Educate Dialog - 30 lines */}
      <EducateGuideDialog ... />
      
      {/* Search Section - 50 lines */}
      <SearchSection ... />
      
      {/* Quick Actions - 80 lines */}
      {role === "ops" && hasSearched && (
        <section>
          <Card>
            {/* ... many lines of content ... */}
          </Card>
        </section>
      )}
      
      {/* More content below... */}
      
    </main>
    <footer>...</footer>
  </div>
);
```

**Problem:** Can't see structure at a glance

### ✅ AFTER (Extracted Components)
```tsx
// src/components/DialogsSection.tsx (NEW)
export function DialogsSection({
  settingsOpen,
  onSettingsChange,
  educateOpen,
  onEducateChange,
  snowOpen,
  onSnowChange,
  pfOpsOpen,
  onPfOpsChange,
}) {
  return (
    <>
      <SettingsDialog open={settingsOpen} onOpenChange={onSettingsChange} />
      <EducateGuideDialog open={educateOpen} onOpenChange={onEducateChange} />
      <SnowIncidentsDialog open={snowOpen} onOpenChange={onSnowChange} />
      <PfOpsDialog open={pfOpsOpen} onOpenChange={onPfOpsChange} />
    </>
  );
}

// src/components/SearchAndQuickActions.tsx (NEW)
export function SearchAndQuickActions({
  role,
  hasSearched,
  opsFeatures,
  qaEnabledTabs,
}) {
  return (
    <>
      <SearchSection ... />
      {role === "ops" && hasSearched && (
        <QuickActionsCard {...opsFeatures} qaEnabledTabs={qaEnabledTabs} />
      )}
    </>
  );
}

// src/components/SystemCardsSection.tsx (NEW)
export function SystemCardsSection({
  visibleSystems,
  enabled,
  opsFeatures,
}) {
  return (
    <>
      {role === "ops" && (
        <RecentFailuresPanel {...opsFeatures} />
      )}
      <SystemCardsGrid visibleSystems={visibleSystems} />
    </>
  );
}

// In page.tsx (MUCH CLEANER)
return (
  <>
    <DialogsSection 
      settingsOpen={state.settingsOpen}
      onSettingsChange={(open) => dispatch({ type: 'SET_SETTINGS_OPEN', open })}
      {/* ... other dialog props ... */}
    />
    <SearchAndQuickActions 
      role={role}
      hasSearched={hasSearched}
      opsFeatures={opsFeatures}
    />
    <SystemCardsSection 
      visibleSystems={visibleSystems}
      opsFeatures={opsFeatures}
    />
  </>
);
```

**Benefits:**
- Page structure immediately clear
- Each section can be understood independently
- Easy to modify sections without touching others
- Reusable sections

---

## SCOPE 5: usePageState Reducer - Code Example

### ❌ CURRENT (15+ useState calls)
```tsx
const [features, setFeatures] = useState<Features | null>(null);
const [minutes, setMinutes] = useState<number>(10);
const [failFed, setFailFed] = useState<any[]>([]);
const [failMfa, setFailMfa] = useState<any[]>([]);
const [opsLoading, setOpsLoading] = useState(false);
const [opsError, setOpsError] = useState<string | null>(null);
const [searchDialogOpen, setSearchDialogOpen] = useState(false);
const [snowOpen, setSnowOpen] = useState(false);
const [pfOpsOpen, setPfOpsOpen] = useState(false);
const [qaActive, setQaActive] = useState<SystemKey>("ping-federate");
// ... and more
```

### ✅ AFTER (Single useReducer)
```tsx
// src/hooks/usePageState.ts (NEW)
type PageState = {
  dialogs: {
    settings: boolean;
    educate: boolean;
    snow: boolean;
    pfOps: boolean;
    searchResult: boolean;
  };
  ui: {
    qaActive: SystemKey;
    minutes: number;
  };
};

type PageAction = 
  | { type: 'OPEN_DIALOG'; dialog: keyof PageState['dialogs'] }
  | { type: 'CLOSE_DIALOG'; dialog: keyof PageState['dialogs'] }
  | { type: 'SET_QA_ACTIVE'; system: SystemKey }
  | { type: 'SET_MINUTES'; minutes: number };

const initialState: PageState = {
  dialogs: {
    settings: false,
    educate: false,
    snow: false,
    pfOps: false,
    searchResult: false,
  },
  ui: {
    qaActive: 'ping-federate',
    minutes: 10,
  },
};

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'OPEN_DIALOG':
      return {
        ...state,
        dialogs: { ...state.dialogs, [action.dialog]: true },
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        dialogs: { ...state.dialogs, [action.dialog]: false },
      };
    case 'SET_QA_ACTIVE':
      return {
        ...state,
        ui: { ...state.ui, qaActive: action.system },
      };
    case 'SET_MINUTES':
      return {
        ...state,
        ui: { ...state.ui, minutes: action.minutes },
      };
    default:
      return state;
  }
}

export function usePageState() {
  const [state, dispatch] = useReducer(pageReducer, initialState);

  return {
    state,
    dispatch,
    // Helper functions for common operations
    openDialog: (dialog: keyof PageState['dialogs']) =>
      dispatch({ type: 'OPEN_DIALOG', dialog }),
    closeDialog: (dialog: keyof PageState['dialogs']) =>
      dispatch({ type: 'CLOSE_DIALOG', dialog }),
    setQaActive: (system: SystemKey) =>
      dispatch({ type: 'SET_QA_ACTIVE', system }),
    setMinutes: (minutes: number) =>
      dispatch({ type: 'SET_MINUTES', minutes }),
  };
}

// In page.tsx (CLEANER)
const { state, dispatch, openDialog, closeDialog, setQaActive, setMinutes } = usePageState();

// Usage:
<SettingsDialog
  open={state.dialogs.settings}
  onOpenChange={(open) => open ? openDialog('settings') : closeDialog('settings')}
/>

<Button onClick={() => setQaActive('azure-ad')} />
```

**Benefits:**
- All UI state in one place
- Easy to see all possible states
- Predictable state transitions
- Easier to debug
- No prop drilling for state setters

---

## Summary Table

| Scope | Files to Create | Files to Modify | Impact |
|-------|-----------------|-----------------|--------|
| 1 | - | page.tsx | -40 lines |
| 2 | useFeatures.ts, useThemeDOM.ts | page.tsx | -70 lines |
| 3 | useOpsFeatures.ts | page.tsx | -80 lines |
| 4 | DialogsSection.tsx, SearchAndQuickActions.tsx, SystemCardsSection.tsx | page.tsx | -120 lines |
| 5 | usePageState.ts | page.tsx | -50 lines |
| 6 | SearchResultsDialog.tsx, DetailViewDialog.tsx | page.tsx | -100 lines |
| 7 | ui-config.ts | page.tsx | -20 lines |
| 8 | DATA_FLOW.md | - | Docs |

**Total Impact:** 629 lines → 350-400 lines (saves ~230-250 lines)

---

## Testing Strategy

After each scope:
1. ✅ Run `npm run dev`
2. ✅ Check no console errors
3. ✅ Test each feature:
   - Login/Logout
   - Theme toggle
   - Search
   - System card clicks
   - Role toggle
   - Ops features (if applicable)
4. ✅ Verify all dialogs open/close
5. ✅ Check all buttons work

---

## Rollback Plan

Each phase can be rolled back independently:
```bash
# If needed
git reset --hard HEAD
# Or revert specific commits
git revert <commit-hash>
```

**No risk of permanent damage** since changes are code-structure only.
