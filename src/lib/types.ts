/**
 * Centralized type definitions for the application
 * This file contains all TypeScript interfaces and types
 */

export type SystemKey =
  | "ping-directory"
  | "ping-federate"
  | "cyberark"
  | "saviynt"
  | "azure-ad"
  | "ping-mfa"
  | "ping-access"
  | "ping-authorize"
  | "ping-intelligence";

export type Features = {
  credentialSource: string;
  useMocks: boolean;
  useMockAuth: boolean;
  systems: Record<string, boolean>;
  opsShowTilesAfterSearch?: boolean;
  employeeSearchSystems?: Partial<Record<SystemKey, boolean>>;
  systemsOrder?: SystemKey[];
  employeeEducateGuideEnabled?: boolean;
  quickActionsTabs?: Partial<Record<SystemKey, boolean>>;
};

export type LoginResponse = {
  token: string;
  role: string;
  email: string;
};

export type SystemData = Record<string, unknown>;

export type SearchResult = {
  userId: string;
  email: string;
  name: string;
  [key: string]: unknown;
};

// Search results by system - each system returns array of results
export type SearchResults = Record<SystemKey | string, SearchResult[] | Record<string, unknown>>;

// PF Ops dialog data structure
export type PfOpsResponse = {
  data?: Record<string, unknown>;
  error?: string;
  status?: number;
} | null;

export type SnowIncident = {
  number: string;
  short_description: string;
  state: string;
  priority: string;
  updatedAt: string;
  assigned_to: string;
};

export type SnowResponse = {
  email: string;
  total: number;
  items: SnowIncident[];
};

export type AuthData = {
  token: string | null;
  role: string | null;
  email: string | null;
};

export type SystemToggleState = Record<SystemKey, boolean>;

export type ApiErrorResponse = {
  error?: string;
  message?: string;
  status?: number;
};

export type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};