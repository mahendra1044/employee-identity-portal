/**
 * Employee 360° View Configuration
 * =================================
 * 
 * Configuration for the Employee 360° View feature.
 * Controls which sections are displayed and their order.
 * 
 * To disable a section, set enabled: false
 * To reorder sections, change the order number
 * 
 * @module config/employee-360
 */

import type { SystemKey } from '@/config/systems.config';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Employee360Section {
  /** Unique section identifier */
  id: string;
  /** Whether section is displayed */
  enabled: boolean;
  /** Display order (lower = first) */
  order: number;
  /** Section display label */
  label: string;
  /** Lucide icon name */
  icon: string;
  /** Section description */
  description: string;
  /** Associated system key (if applicable) */
  systemKey?: SystemKey;
}

export interface Employee360Config {
  /** Master enable/disable for the feature */
  enabled: boolean;
  /** Button label in toolbar */
  buttonLabel: string;
  /** Dialog title */
  dialogTitle: string;
  /** Section configurations */
  sections: Record<string, Employee360Section>;
  /** Highlighting options */
  highlighting: {
    /** Highlight mismatched data between systems */
    showDiscrepancies: boolean;
    /** Highlight missing/empty fields */
    showMissingFields: boolean;
  };
  /** Copy to clipboard options */
  copyToClipboard: {
    /** Enable copy button */
    enabled: boolean;
    /** Output format */
    format: 'text' | 'json';
  };
}

// ============================================================================
// DISCREPANCY DETECTION CONFIGURATION
// ============================================================================

/**
 * Fields to compare across systems for discrepancy detection
 */
export const DISCREPANCY_FIELDS: Record<string, { label: string; systems: string[] }> = {
  email: {
    label: 'Email Address',
    systems: ['ping-directory', 'azure-ad', 'saviynt'],
  },
  displayName: {
    label: 'Display Name',
    systems: ['ping-directory', 'azure-ad', 'saviynt'],
  },
  department: {
    label: 'Department',
    systems: ['ping-directory', 'azure-ad', 'saviynt'],
  },
  manager: {
    label: 'Manager',
    systems: ['ping-directory', 'azure-ad'],
  },
  accountStatus: {
    label: 'Account Status',
    systems: ['ping-directory', 'azure-ad', 'cyberark', 'saviynt'],
  },
  employeeId: {
    label: 'Employee ID',
    systems: ['ping-directory', 'azure-ad', 'saviynt', 'cyberark'],
  },
};

/**
 * Field mappings per system for normalization
 * Maps system-specific field names to canonical field names
 */
export const FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  'ping-directory': {
    mail: 'email',
    cn: 'displayName',
    givenName: 'firstName',
    sn: 'lastName',
    departmentNumber: 'department',
    manager: 'manager',
    employeeNumber: 'employeeId',
    userAccountControl: 'accountStatus',
  },
  'azure-ad': {
    userPrincipalName: 'email',
    displayName: 'displayName',
    givenName: 'firstName',
    surname: 'lastName',
    department: 'department',
    manager: 'manager',
    employeeId: 'employeeId',
    accountEnabled: 'accountStatus',
  },
  'saviynt': {
    email: 'email',
    displayname: 'displayName',
    firstname: 'firstName',
    lastname: 'lastName',
    departmentname: 'department',
    manager: 'manager',
    employeeid: 'employeeId',
    status: 'accountStatus',
  },
  'cyberark': {
    userName: 'email',
    displayName: 'displayName',
    firstName: 'firstName',
    lastName: 'lastName',
    department: 'department',
    employeeId: 'employeeId',
    status: 'accountStatus',
  },
};

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const employee360Config: Employee360Config = {
  enabled: true,
  buttonLabel: 'Employee 360° View',
  dialogTitle: 'Employee 360° View',
  
  sections: {
    employeeProfile: {
      id: 'employeeProfile',
      enabled: true,
      order: 1,
      label: 'Employee Profile',
      icon: 'User',
      description: 'Core identity information from search results',
    },
    pingDirectory: {
      id: 'pingDirectory',
      enabled: true,
      order: 2,
      label: 'Ping Directory',
      icon: 'FolderTree',
      description: 'LDAP directory attributes and status',
      systemKey: 'ping-directory',
    },
    pingFederate: {
      id: 'pingFederate',
      enabled: true,
      order: 3,
      label: 'Ping Federate',
      icon: 'Link',
      description: 'Federation and SSO status',
      systemKey: 'ping-federate',
    },
    cyberark: {
      id: 'cyberark',
      enabled: true,
      order: 4,
      label: 'CyberArk PAM',
      icon: 'Shield',
      description: 'Privileged access management',
      systemKey: 'cyberark',
    },
    saviynt: {
      id: 'saviynt',
      enabled: true,
      order: 5,
      label: 'Saviynt IGA',
      icon: 'KeyRound',
      description: 'Identity governance and access',
      systemKey: 'saviynt',
    },
    azureAd: {
      id: 'azureAd',
      enabled: true,
      order: 6,
      label: 'Azure AD / Entra ID',
      icon: 'Cloud',
      description: 'Microsoft cloud identity',
      systemKey: 'azure-ad',
    },
    pingMfa: {
      id: 'pingMfa',
      enabled: true,
      order: 7,
      label: 'Ping MFA',
      icon: 'Smartphone',
      description: 'Multi-factor authentication',
      systemKey: 'ping-mfa',
    },
    pingAccess: {
      id: 'pingAccess',
      enabled: true,
      order: 8,
      label: 'Ping Access',
      icon: 'DoorOpen',
      description: 'Access management policies',
      systemKey: 'ping-access',
    },
    pingAuthorize: {
      id: 'pingAuthorize',
      enabled: true,
      order: 9,
      label: 'Ping Authorize',
      icon: 'Scale',
      description: 'Dynamic authorization',
      systemKey: 'ping-authorize',
    },
    pingIntelligence: {
      id: 'pingIntelligence',
      enabled: true,
      order: 10,
      label: 'Ping Intelligence',
      icon: 'Brain',
      description: 'Threat and risk intelligence',
      systemKey: 'ping-intelligence',
    },
  },
  
  highlighting: {
    showDiscrepancies: true,
    showMissingFields: true,
  },
  
  copyToClipboard: {
    enabled: true,
    format: 'text',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get enabled sections sorted by order
 */
export function getEnabledSections(): Employee360Section[] {
  return Object.values(employee360Config.sections)
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get section by ID
 */
export function getSection(id: string): Employee360Section | undefined {
  return employee360Config.sections[id];
}

/**
 * Check if feature is enabled
 */
export function isEmployee360Enabled(): boolean {
  return employee360Config.enabled;
}

export default employee360Config;
