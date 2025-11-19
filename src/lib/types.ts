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
  | "ping-mfa";

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

export type SystemData = Record<string, any>;

export type SearchResult = {
  userId: string;
  email: string;
  name: string;
  [key: string]: any;
};

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
