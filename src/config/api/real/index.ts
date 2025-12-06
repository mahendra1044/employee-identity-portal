/**
 * Real API Configuration Index
 * ============================
 * 
 * Aggregates all real API configurations.
 * Used when SYSTEM_DATA_SOURCE.{group} = 'USE_API'
 * 
 * @module config/api/real
 */

import { SSO_REAL_CONFIG } from './sso.config';
import { PAM_REAL_CONFIG } from './pam.config';
import { IGA_REAL_CONFIG } from './iga.config';
import { ENTRAID_REAL_CONFIG } from './entraid.config';
import { TPAG_REAL_CONFIG } from './tpag.config';
import { OPS_REAL_CONFIG } from './ops.config';
import type { RealApiConfigs } from '../types';

/**
 * All real API configurations by system group
 */
export const realApiConfig: RealApiConfigs = {
  sso: SSO_REAL_CONFIG,
  pam: PAM_REAL_CONFIG,
  iga: IGA_REAL_CONFIG,
  entraId: ENTRAID_REAL_CONFIG,
  tpag: TPAG_REAL_CONFIG,
  ops: OPS_REAL_CONFIG,
};

// Re-export individual configs for direct access
export {
  SSO_REAL_CONFIG,
  PAM_REAL_CONFIG,
  IGA_REAL_CONFIG,
  ENTRAID_REAL_CONFIG,
  TPAG_REAL_CONFIG,
  OPS_REAL_CONFIG,
};
