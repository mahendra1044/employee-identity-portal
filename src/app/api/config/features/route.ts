/**
 * Features API Route
 * ==================
 * 
 * Returns feature configuration for the frontend.
 * 
 * NOTE: This route provides FRONTEND DEFAULTS.
 * The actual source of truth is backend/config/features.json
 * which is served by the Node.js backend at /api/ops/features
 * 
 * This route exists as a fallback when:
 * - Running frontend in isolation (without backend)
 * - Development/testing scenarios
 */

import { NextResponse } from 'next/server';
import { 
  SYSTEM_DATA_SOURCE, 
  FEATURE_FLAGS 
} from '@/config/features.config';
import { SYSTEM_KEYS } from '@/config/systems.config';

export async function GET() {
  // Build systems object from SYSTEM_KEYS (all enabled by default)
  const systems = SYSTEM_KEYS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);

  // Build quickActionsTabs from SYSTEM_KEYS (all enabled by default)
  const quickActionsTabs = { ...systems };

  const features = {
    credentialSource: "env",
    
    // Global mock override - when true, ignores all systemDataSource settings
    useMocks: true,
    useMockAuth: FEATURE_FLAGS.useMockAuth,
    
    // Per-system-group data source configuration
    // Only effective when useMocks = false
    systemDataSource: SYSTEM_DATA_SOURCE,
    
    // All systems enabled
    systems,
    
    // UI display settings
    opsShowTilesAfterSearch: false,
    employeeSearchSystems: {
      "ping-directory": true,
      "ping-mfa": true,
    },
    systemsOrder: SYSTEM_KEYS,
    employeeEducateGuideEnabled: FEATURE_FLAGS.educateGuideEnabled,
    quickActionsTabs,
    systemCardCloseEnabled: true,
    userSystemsSettingsEnabled: true,
  };

  return NextResponse.json(features);
}