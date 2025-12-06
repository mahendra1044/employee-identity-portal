# REQ-Employee-360-View

## Employee 360° View Feature

**Document Version:** 1.0  
**Created:** December 6, 2025  
**Status:** Approved for Implementation

---

## 1. Executive Summary

The Employee 360° View is a comprehensive popup dialog that consolidates all fetched employee data from multiple identity systems into a single, elegant encyclopedia-style view. This feature enables operations teams to quickly understand an employee's complete identity footprint across all systems for efficient troubleshooting.

### Key Principles
- **Zero Additional API Calls** - Reuse existing fetched data
- **Complete Isolation** - All code in dedicated files
- **Configurable Sections** - Enable/disable via config file
- **Discrepancy Highlighting** - Surface data inconsistencies

---

## 2. Feature Specifications

### 2.1 Trigger Button

| Specification | Requirement |
|---------------|-------------|
| **Location** | Toolbar above search results |
| **Label** | "Employee 360° View" |
| **Icon** | `Users` or `Scan` icon (Lucide) |
| **Visibility** | Only when search results exist |
| **Data Selection** | First record if multiple results |

### 2.2 Popup Dialog

| Specification | Requirement |
|---------------|-------------|
| **Width** | 90% of viewport (max: 1400px) |
| **Height** | 85% of viewport (max: 900px) |
| **Theme** | Match Educate Me / Settings popups |
| **Scroll** | Internal scrolling within dialog |
| **Close Actions** | X button, ESC key, Click outside |

### 2.3 Data Source

| Specification | Requirement |
|---------------|-------------|
| **API Calls** | **ZERO** - No additional API calls |
| **Source** | Existing search results + system card data |
| **Loading** | No loading states (data pre-fetched) |
| **Caching** | Use already cached/fetched data |

### 2.4 Section Behavior

| Specification | Requirement |
|---------------|-------------|
| **Default State** | All sections expanded |
| **Collapse** | Individually collapsible |
| **Animation** | Smooth expand/collapse transitions |
| **Memory** | Collapse state not persisted |

### 2.5 Copy to Clipboard

| Specification | Requirement |
|---------------|-------------|
| **Scope** | Entire 360° view data |
| **Format** | Formatted text (readable) |
| **Button** | Copy icon in dialog header |
| **Feedback** | Toast notification on copy |

### 2.6 Discrepancy Highlighting

| Specification | Requirement |
|---------------|-------------|
| **Cross-System Discrepancies** | Highlight mismatched data between systems |
| **Missing Data** | Highlight empty/null fields |
| **Visual Indicator** | Warning icon + colored background |
| **Tooltip** | Explanation of the discrepancy |

---

## 3. Content Sections

### 3.1 Section Overview

| # | Section ID | Display Name | Data Source | Content |
|---|------------|--------------|-------------|---------|
| 1 | `employeeProfile` | Employee Profile | Search Result | Core identity info |
| 2 | `pingDirectory` | Ping Directory | System Card | Directory attributes |
| 3 | `pingFederate` | Ping Federate | System Card | Federation/SSO status |
| 4 | `cyberark` | CyberArk PAM | System Card | Privileged accounts |
| 5 | `saviynt` | Saviynt IGA | System Card | Entitlements, access |
| 6 | `azureAd` | Azure AD / Entra ID | System Card | Cloud identity |
| 7 | `pingMfa` | Ping MFA | System Card | MFA devices, status |
| 8 | `pingAccess` | Ping Access | System Card | Access policies |
| 9 | `pingAuthorize` | Ping Authorize | System Card | Authorization rules |
| 10 | `pingIntelligence` | Ping Intelligence | System Card | Risk/threat data |

### 3.2 Section Content Details

#### Employee Profile
```
- Employee ID
- Full Name
- Email Address
- Department
- Job Title
- Manager
- Location
- Employment Status
- Start Date
```

#### Ping Directory
```
- DN (Distinguished Name)
- Object Classes
- Account Status (enabled/disabled)
- Last Login
- Password Expiry
- Group Memberships
- Custom Attributes
```

#### Ping Federate
```
- Federation Status
- SSO Connections
- Session Info
- OAuth Grants
- Last Authentication
```

#### CyberArk PAM
```
- Privileged Accounts
- Safe Memberships
- Account Status
- Last Password Change
- Check-out History
```

#### Saviynt IGA
```
- Entitlements
- Access Certifications
- Role Assignments
- Pending Requests
- Risk Score
```

#### Azure AD / Entra ID
```
- UPN (User Principal Name)
- Object ID
- Account Enabled
- MFA Status
- License Assignments
- Group Memberships
- Last Sign-in
```

#### Ping MFA
```
- MFA Enabled
- Enrolled Devices
- Preferred Method
- Bypass Status
- Last MFA Challenge
```

#### Ping Access
```
- Applications
- Access Rules
- Session Policies
- Last Access Time
```

#### Ping Authorize
```
- Authorization Policies
- Decision History
- Attribute Sources
```

#### Ping Intelligence
```
- Risk Score
- Threat Indicators
- Behavioral Analysis
- Anomalies Detected
```

---

## 4. Configuration

### 4.1 Config File Location

```
src/config/employee-360.config.ts
```

### 4.2 Configuration Structure

```typescript
export interface Employee360Section {
  id: string;
  enabled: boolean;
  order: number;
  label: string;
  icon: string;
  description: string;
}

export interface Employee360Config {
  enabled: boolean;
  buttonLabel: string;
  dialogTitle: string;
  sections: Record<string, Employee360Section>;
  highlighting: {
    showDiscrepancies: boolean;
    showMissingFields: boolean;
  };
  copyToClipboard: {
    enabled: boolean;
    format: 'text' | 'json';
  };
}
```

### 4.3 Default Configuration

```typescript
export const employee360Config: Employee360Config = {
  enabled: true,
  buttonLabel: "Employee 360° View",
  dialogTitle: "Employee 360° View",
  sections: {
    employeeProfile: {
      id: "employeeProfile",
      enabled: true,
      order: 1,
      label: "Employee Profile",
      icon: "User",
      description: "Core identity information"
    },
    pingDirectory: {
      id: "pingDirectory",
      enabled: true,
      order: 2,
      label: "Ping Directory",
      icon: "FolderTree",
      description: "LDAP directory attributes"
    },
    pingFederate: {
      id: "pingFederate",
      enabled: true,
      order: 3,
      label: "Ping Federate",
      icon: "Link",
      description: "Federation and SSO status"
    },
    cyberark: {
      id: "cyberark",
      enabled: true,
      order: 4,
      label: "CyberArk PAM",
      icon: "Shield",
      description: "Privileged access management"
    },
    saviynt: {
      id: "saviynt",
      enabled: true,
      order: 5,
      label: "Saviynt IGA",
      icon: "KeyRound",
      description: "Identity governance and access"
    },
    azureAd: {
      id: "azureAd",
      enabled: true,
      order: 6,
      label: "Azure AD / Entra ID",
      icon: "Cloud",
      description: "Microsoft cloud identity"
    },
    pingMfa: {
      id: "pingMfa",
      enabled: true,
      order: 7,
      label: "Ping MFA",
      icon: "Smartphone",
      description: "Multi-factor authentication"
    },
    pingAccess: {
      id: "pingAccess",
      enabled: true,
      order: 8,
      label: "Ping Access",
      icon: "DoorOpen",
      description: "Access management policies"
    },
    pingAuthorize: {
      id: "pingAuthorize",
      enabled: true,
      order: 9,
      label: "Ping Authorize",
      icon: "Scale",
      description: "Dynamic authorization"
    },
    pingIntelligence: {
      id: "pingIntelligence",
      enabled: true,
      order: 10,
      label: "Ping Intelligence",
      icon: "Brain",
      description: "Threat and risk intelligence"
    }
  },
  highlighting: {
    showDiscrepancies: true,
    showMissingFields: true
  },
  copyToClipboard: {
    enabled: true,
    format: 'text'
  }
};
```

### 4.4 Disabling a Section

To disable a section, set `enabled: false`:

```typescript
saviynt: {
  id: "saviynt",
  enabled: false,  // This section will not appear
  order: 5,
  // ...
}
```

---

## 5. File Structure

### 5.1 New Files (Complete Isolation)

```
src/
├── components/
│   └── dialogs/
│       ├── Employee360Dialog.tsx           # Main dialog component
│       ├── Employee360Dialog.module.css    # Isolated styles (CSS Module)
│       ├── employee-360.types.ts           # Type definitions
│       └── employee-360/
│           ├── Employee360Header.tsx       # Dialog header with copy button
│           ├── Employee360Section.tsx      # Reusable section component
│           ├── Employee360Content.tsx      # Content layout
│           ├── Employee360DataRow.tsx      # Data row with highlighting
│           └── index.ts                    # Barrel exports
├── config/
│   └── employee-360.config.ts              # Configuration file
└── hooks/
    └── useEmployee360.ts                   # Data aggregation hook
```

### 5.2 Modified Files (Minimal Changes)

| File | Change |
|------|--------|
| `src/components/search/SearchToolbar.tsx` | Add 360° View button |
| `src/hooks/index.ts` | Export new hook |

---

## 6. Discrepancy Detection

### 6.1 Cross-System Field Mapping

| Field | Systems to Compare |
|-------|-------------------|
| Email | Directory, Azure AD, Saviynt |
| Display Name | Directory, Azure AD, Saviynt |
| Employee ID | All systems |
| Department | Directory, Azure AD, Saviynt |
| Manager | Directory, Azure AD |
| Account Status | All systems |

### 6.2 Discrepancy Types

| Type | Visual | Description |
|------|--------|-------------|
| **Mismatch** | 🟡 Yellow background | Same field, different values across systems |
| **Missing** | 🔴 Red text | Field exists in one system but null in another |
| **Inconsistent** | 🟠 Orange border | Data format differs (e.g., date formats) |

### 6.3 Highlighting Rules

```typescript
// Example: Email discrepancy detection
const emailDiscrepancy = {
  field: 'email',
  systems: {
    pingDirectory: 'john.doe@company.com',
    azureAd: 'johndoe@company.com',  // Different!
    saviynt: 'john.doe@company.com'
  },
  hasDiscrepancy: true,
  message: 'Email differs between Ping Directory and Azure AD'
};
```

---

## 7. UI/UX Design

### 7.1 Dialog Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 👤 Employee 360° View                    [📋 Copy] [✕]   │  │
│  │     John Doe (E12345)                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  ▼ Employee Profile                                       │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ Employee ID    E12345                               │  │  │
│  │  │ Full Name      John Doe                             │  │  │
│  │  │ Email          john.doe@company.com                 │  │  │
│  │  │ Department     Engineering                          │  │  │
│  │  │ Manager        Jane Smith                           │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ▼ Ping Directory                                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ DN             cn=jdoe,ou=users,dc=company          │  │  │
│  │  │ Status         ✅ Active                             │  │  │
│  │  │ Last Login     2025-12-05 14:32:00                  │  │  │
│  │  │ Email          john.doe@company.com      ⚠️ Mismatch │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ▶ Ping Federate (collapsed)                              │  │
│  │                                                           │  │
│  │  ▶ CyberArk PAM (collapsed)                               │  │
│  │                                                           │  │
│  │  ... more sections ...                                    │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Header Background | `bg-primary` | Dialog header |
| Section Header | `bg-muted` | Collapsible section headers |
| Normal Row | `bg-background` | Data rows |
| Discrepancy Row | `bg-yellow-50` | Mismatched data |
| Missing Data | `text-destructive` | Null/empty fields |
| Success Indicator | `text-green-600` | Verified/matched data |

### 7.3 Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| Desktop (>1200px) | Full 90% width, 2-column data layout |
| Tablet (768-1200px) | 95% width, 1-column layout |
| Mobile (<768px) | Full screen modal, stacked layout |

---

## 8. Implementation Phases

### Phase 1: Foundation
- [ ] Create config file (`employee-360.config.ts`)
- [ ] Create types file (`employee-360.types.ts`)
- [ ] Create base dialog component shell

### Phase 2: Data Aggregation
- [ ] Create `useEmployee360` hook
- [ ] Implement data collection from existing sources
- [ ] Implement discrepancy detection logic

### Phase 3: UI Components
- [ ] Create section components
- [ ] Implement collapsible behavior
- [ ] Add highlighting for discrepancies

### Phase 4: Integration
- [ ] Add button to search toolbar
- [ ] Connect to existing search state
- [ ] Implement copy to clipboard

### Phase 5: Polish
- [ ] Add animations
- [ ] Responsive design
- [ ] Testing and refinement

---

## 9. Technical Notes

### 9.1 Data Flow

```
SearchResults (existing state)
       │
       ▼
useEmployee360 Hook
       │
       ├── Aggregates data from multiple sources
       ├── Detects discrepancies
       ├── Formats for display
       │
       ▼
Employee360Dialog
       │
       ├── Renders sections based on config
       ├── Applies highlighting
       └── Handles copy to clipboard
```

### 9.2 Performance Considerations

- No API calls - data already in memory
- Lazy render sections (only expanded ones)
- Memoize discrepancy calculations
- Virtual scrolling if data is large

### 9.3 Isolation Guarantee

All new code will be in dedicated files:
- Existing dialog components remain untouched
- Existing styles remain untouched
- Only minimal integration point in search toolbar

---

## 10. Acceptance Criteria

- [ ] Button appears only when search results exist
- [ ] Dialog opens with all sections expanded
- [ ] Sections are individually collapsible
- [ ] Discrepancies are visually highlighted
- [ ] Missing fields are marked
- [ ] Copy to clipboard works
- [ ] Sections can be enabled/disabled via config
- [ ] No additional API calls made
- [ ] All code in isolated files
- [ ] Existing functionality unaffected

---

## 11. Dependencies

- Existing search functionality
- Existing system card data
- shadcn/ui Dialog component (base)
- Lucide icons

---

**Document Approved By:** [Pending]  
**Implementation Start:** [Pending]
