/**
 * Application-wide constants
 * ==========================
 * 
 * This file re-exports system constants from the centralized config.
 * Import from here for backward compatibility with existing code.
 * 
 * SINGLE SOURCE OF TRUTH: @/config/systems.config.ts
 */

// Re-export system constants from centralized config
export { 
  SYSTEM_KEYS as SYSTEMS,
  SYSTEM_LABELS,
  SYSTEM_GROUPS,
} from '@/config/systems.config';

// Re-export system group arrays from centralized config
import { SYSTEM_GROUPS } from '@/config/systems.config';

// Convenience exports for system groups (for backward compatibility)
export const PING_SYSTEMS = SYSTEM_GROUPS.sso;
export const ORIGINAL_SYSTEMS = SYSTEM_GROUPS.core;
export const PAM_SYSTEMS = SYSTEM_GROUPS.pam;
export const IGA_SYSTEMS = SYSTEM_GROUPS.iga;
export const ENTRAID_SYSTEMS = SYSTEM_GROUPS.entraId;
export const TPAG_SYSTEMS = SYSTEM_GROUPS.tpag;

// API configuration
export const API_BASE = 
  typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001"
    : "http://localhost:3001";