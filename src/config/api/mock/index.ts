/**
 * Mock API Configuration Index
 * ============================
 * 
 * Aggregates all mock API configurations.
 * Used when SYSTEM_DATA_SOURCE.{group} = 'USE_MOCK'
 * 
 * @module config/api/mock
 */

import { SSO_MOCK_CONFIG } from './sso.config';
import { PAM_MOCK_CONFIG } from './pam.config';
import { IGA_MOCK_CONFIG } from './iga.config';
import { ENTRAID_MOCK_CONFIG } from './entraid.config';
import { TPAG_MOCK_CONFIG } from './tpag.config';
import { OPS_MOCK_CONFIG } from './ops.config';
import type { MockApiConfigs } from '../types';

/**
 * All mock API configurations by system group
 */
export const mockApiConfig: MockApiConfigs = {
  sso: SSO_MOCK_CONFIG,
  pam: PAM_MOCK_CONFIG,
  iga: IGA_MOCK_CONFIG,
  entraId: ENTRAID_MOCK_CONFIG,
  tpag: TPAG_MOCK_CONFIG,
  ops: OPS_MOCK_CONFIG,
};

// Re-export individual configs for direct access
export {
  SSO_MOCK_CONFIG,
  PAM_MOCK_CONFIG,
  IGA_MOCK_CONFIG,
  ENTRAID_MOCK_CONFIG,
  TPAG_MOCK_CONFIG,
  OPS_MOCK_CONFIG,
};
