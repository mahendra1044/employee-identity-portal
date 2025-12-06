/**
 * Mock IDP Configuration
 * ======================
 * 
 * Configuration for the built-in Mock Identity Provider.
 * Used for testing SAML authentication without a real IDP.
 * 
 * This entire mock-idp folder can be safely deleted when
 * integrating with a real IDP like Ping Federate.
 * 
 * @module backend/mock-idp/config
 */

/**
 * Mock IDP Users
 * These users can "authenticate" at the mock IDP
 * Each user has attributes that will be included in the SAML assertion
 */
export const MOCK_IDP_USERS = {
  'u1001': {
    password: 'demo',
    userId: 'u1001',
    displayName: 'Sarah Chen (Master Admin)',
    email: 'sarah.chen@company.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    groups: [
      'CN=MASTER_OPS,OU=Groups,DC=company,DC=com',
      'CN=ALL_EMPLOYEES,OU=Groups,DC=company,DC=com'
    ]
  },
  'u1002': {
    password: 'demo',
    userId: 'u1002',
    displayName: 'Michael Torres (IAM Engineering)',
    email: 'michael.torres@company.com',
    firstName: 'Michael',
    lastName: 'Torres',
    groups: [
      'CN=SSO_OPS,OU=Groups,DC=company,DC=com',
      'CN=ALL_EMPLOYEES,OU=Groups,DC=company,DC=com'
    ]
  },
  'u1003': {
    password: 'demo',
    userId: 'u1003',
    displayName: 'Jessica Park (IAM Ops)',
    email: 'jessica.park@company.com',
    firstName: 'Jessica',
    lastName: 'Park',
    groups: [
      'CN=PAM_OPS,OU=Groups,DC=company,DC=com',
      'CN=ALL_EMPLOYEES,OU=Groups,DC=company,DC=com'
    ]
  },
  'u1004': {
    password: 'demo',
    userId: 'u1004',
    displayName: 'David Kim (Security Ops)',
    email: 'david.kim@company.com',
    firstName: 'David',
    lastName: 'Kim',
    groups: [
      'CN=IGA_OPS,OU=Groups,DC=company,DC=com',
      'CN=ALL_EMPLOYEES,OU=Groups,DC=company,DC=com'
    ]
  },
  'u1005': {
    password: 'demo',
    userId: 'u1005',
    displayName: 'Emily Watson (IAM Governance)',
    email: 'emily.watson@company.com',
    firstName: 'Emily',
    lastName: 'Watson',
    groups: [
      'CN=ENTRAID_OPS,OU=Groups,DC=company,DC=com',
      'CN=ALL_EMPLOYEES,OU=Groups,DC=company,DC=com'
    ]
  },
  'u1006': {
    password: 'demo',
    userId: 'u1006',
    displayName: 'James Wilson (Audit)',
    email: 'james.wilson@company.com',
    firstName: 'James',
    lastName: 'Wilson',
    groups: [
      'CN=TPAG_OPS,OU=Groups,DC=company,DC=com',
      'CN=ALL_EMPLOYEES,OU=Groups,DC=company,DC=com'
    ]
  },
  'u1007': {
    password: 'demo',
    userId: 'u1007',
    displayName: 'Regular Employee',
    email: 'employee@company.com',
    firstName: 'Regular',
    lastName: 'Employee',
    groups: [
      'CN=ALL_EMPLOYEES,OU=Groups,DC=company,DC=com'
    ]
  }
};

/**
 * Mock IDP Settings
 */
export const MOCK_IDP_CONFIG = {
  // IDP Entity ID
  entityId: 'http://localhost:3001/mock-idp',
  
  // IDP SSO URL
  ssoUrl: 'http://localhost:3001/api/mock-idp/sso',
  
  // IDP SLO URL
  sloUrl: 'http://localhost:3001/api/mock-idp/slo',
  
  // Session duration (for display purposes)
  sessionDuration: '8 hours',
  
  // Simulated MFA delay (ms) - set to 0 to skip
  mfaDelay: 0,
  
  // Show MFA simulation step
  simulateMfa: true,
};

/**
 * SAML Attribute Names (matches what real Ping Federate would send)
 */
export const SAML_ATTRIBUTES = {
  userId: 'uid',
  email: 'mail',
  displayName: 'cn',
  firstName: 'givenName',
  lastName: 'sn',
  groups: 'memberOf',
};
