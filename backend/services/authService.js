/**
 * Auth Service
 * ============
 * 
 * Backend authentication service that handles auth mode switching
 * and delegates to appropriate auth strategy.
 * 
 * @module backend/services/auth
 */

import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load configuration
const featuresPath = path.join(__dirname, '../config/features.json');
const features = JSON.parse(fs.readFileSync(featuresPath, 'utf8'));

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

// ============================================================================
// AUTH MODE
// ============================================================================

/**
 * Get current auth mode from configuration
 */
function getAuthMode() {
  return features.authMode || 'USE_MOCK_AUTH';
}

/**
 * Check if using mock auth
 */
function isMockAuth() {
  return getAuthMode() === 'USE_MOCK_AUTH';
}

/**
 * Check if using MFA/SAML auth
 */
function isMfaAuth() {
  return getAuthMode() === 'USE_MFA_AUTH';
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Generate JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Decode JWT token without verification (for inspection)
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

// ============================================================================
// GROUP TO ROLE MAPPING
// ============================================================================

/**
 * Get group-to-role mapping from configuration
 */
function getGroupRoleMapping() {
  return features.groupRoleMapping || {};
}

/**
 * Map user groups to application roles
 */
function mapGroupsToRoles(groups) {
  const mapping = getGroupRoleMapping();
  const roles = new Set();

  for (const group of groups || []) {
    const mappedRoles = mapping[group];
    if (mappedRoles) {
      mappedRoles.forEach(role => roles.add(role));
    }
  }

  // Default role if no matches
  if (roles.size === 0) {
    roles.add('employee');
  }

  return Array.from(roles);
}

// ============================================================================
// SAML CONFIGURATION
// ============================================================================

/**
 * Get SAML/MFA configuration
 */
function getMfaAuthConfig() {
  return features.mfaAuth || {
    enabled: false,
    serviceProvider: {},
    identityProvider: {},
    attributeMapping: {}
  };
}

/**
 * Get Service Provider configuration
 */
function getSpConfig() {
  const mfaAuth = getMfaAuthConfig();
  return mfaAuth.serviceProvider || {};
}

/**
 * Get Identity Provider configuration
 */
function getIdpConfig() {
  const mfaAuth = getMfaAuthConfig();
  return mfaAuth.identityProvider || {};
}

/**
 * Get attribute mapping configuration
 */
function getAttributeMapping() {
  const mfaAuth = getMfaAuthConfig();
  return mfaAuth.attributeMapping || {
    userId: 'uid',
    email: 'mail',
    displayName: 'displayName',
    groups: 'memberOf'
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Auth mode
  getAuthMode,
  isMockAuth,
  isMfaAuth,
  
  // Token management
  generateToken,
  verifyToken,
  decodeToken,
  JWT_SECRET,
  JWT_EXPIRY,
  
  // Role mapping
  getGroupRoleMapping,
  mapGroupsToRoles,
  
  // SAML config
  getMfaAuthConfig,
  getSpConfig,
  getIdpConfig,
  getAttributeMapping,
};
