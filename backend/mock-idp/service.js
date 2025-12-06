/**
 * Mock IDP Service
 * ================
 * 
 * Generates mock SAML responses for testing.
 * Simulates what a real IDP like Ping Federate would return.
 * 
 * This entire mock-idp folder can be safely deleted when
 * integrating with a real IDP.
 * 
 * @module backend/mock-idp/service
 */

import { MOCK_IDP_USERS, MOCK_IDP_CONFIG, SAML_ATTRIBUTES } from './config.js';

/**
 * Validate user credentials against mock user database
 * 
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function validateMockUser(userId, password) {
  const user = MOCK_IDP_USERS[userId];
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (user.password !== password) {
    return { success: false, error: 'Invalid password' };
  }
  
  return { success: true, user };
}

/**
 * Get all available mock users (for login page display)
 * 
 * @returns {Array<{ userId: string, displayName: string, email: string, groups: string[], groupCount: number }>}
 */
export function getMockUsers() {
  return Object.entries(MOCK_IDP_USERS).map(([userId, user]) => ({
    userId,
    displayName: user.displayName,
    email: user.email,
    groups: user.groups,
    groupCount: user.groups.length,
  }));
}

/**
 * Generate a mock SAML Response
 * This simulates what Ping Federate would return after authentication
 * 
 * @param {object} user - Authenticated user object
 * @param {string} requestId - Original SAML request ID
 * @param {string} acsUrl - Assertion Consumer Service URL
 * @param {string} audienceUri - SP Entity ID
 * @returns {string} Base64 encoded SAML Response
 */
export function generateMockSamlResponse(user, requestId, acsUrl, audienceUri) {
  const now = new Date();
  const notBefore = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
  const notOnOrAfter = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
  const sessionNotOnOrAfter = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours
  
  const responseId = `_${generateId()}`;
  const assertionId = `_${generateId()}`;
  
  // Build SAML Response XML
  const samlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:Response
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="${responseId}"
    Version="2.0"
    IssueInstant="${now.toISOString()}"
    Destination="${acsUrl}"
    InResponseTo="${requestId}">
    <saml:Issuer>${MOCK_IDP_CONFIG.entityId}</saml:Issuer>
    <samlp:Status>
        <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </samlp:Status>
    <saml:Assertion
        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
        ID="${assertionId}"
        Version="2.0"
        IssueInstant="${now.toISOString()}">
        <saml:Issuer>${MOCK_IDP_CONFIG.entityId}</saml:Issuer>
        <saml:Subject>
            <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">${user.userId}</saml:NameID>
            <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                <saml:SubjectConfirmationData
                    InResponseTo="${requestId}"
                    NotOnOrAfter="${notOnOrAfter.toISOString()}"
                    Recipient="${acsUrl}"/>
            </saml:SubjectConfirmation>
        </saml:Subject>
        <saml:Conditions NotBefore="${notBefore.toISOString()}" NotOnOrAfter="${notOnOrAfter.toISOString()}">
            <saml:AudienceRestriction>
                <saml:Audience>${audienceUri}</saml:Audience>
            </saml:AudienceRestriction>
        </saml:Conditions>
        <saml:AuthnStatement AuthnInstant="${now.toISOString()}" SessionIndex="${assertionId}" SessionNotOnOrAfter="${sessionNotOnOrAfter.toISOString()}">
            <saml:AuthnContext>
                <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
            </saml:AuthnContext>
        </saml:AuthnStatement>
        <saml:AttributeStatement>
            <saml:Attribute Name="${SAML_ATTRIBUTES.userId}" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue>${user.userId}</saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="${SAML_ATTRIBUTES.email}" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue>${user.email}</saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="${SAML_ATTRIBUTES.displayName}" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue>${user.displayName}</saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="${SAML_ATTRIBUTES.firstName}" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue>${user.firstName}</saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="${SAML_ATTRIBUTES.lastName}" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue>${user.lastName}</saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="${SAML_ATTRIBUTES.groups}" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                ${user.groups.map(group => `<saml:AttributeValue>${group}</saml:AttributeValue>`).join('\n                ')}
            </saml:Attribute>
        </saml:AttributeStatement>
    </saml:Assertion>
</samlp:Response>`;

  // Base64 encode the response
  return Buffer.from(samlResponse).toString('base64');
}

/**
 * Generate Mock IDP Metadata XML
 * 
 * @returns {string} IDP Metadata XML
 */
export function generateMockIdpMetadata() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor
    xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
    entityID="${MOCK_IDP_CONFIG.entityId}">
    <md:IDPSSODescriptor
        WantAuthnRequestsSigned="false"
        protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</md:NameIDFormat>
        <md:SingleSignOnService
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
            Location="${MOCK_IDP_CONFIG.ssoUrl}"/>
        <md:SingleSignOnService
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
            Location="${MOCK_IDP_CONFIG.ssoUrl}"/>
        <md:SingleLogoutService
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
            Location="${MOCK_IDP_CONFIG.sloUrl}"/>
    </md:IDPSSODescriptor>
</md:EntityDescriptor>`;
}

/**
 * Generate a random ID for SAML elements
 */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Parse SAML AuthnRequest to extract request ID and other info
 * (Simplified parser for mock purposes)
 * 
 * @param {string} samlRequest - Base64 encoded SAML AuthnRequest
 * @returns {{ requestId: string, issuer: string, acsUrl: string } | null}
 */
export function parseSamlRequest(samlRequest) {
  try {
    const decoded = Buffer.from(samlRequest, 'base64').toString('utf-8');
    
    // Extract ID
    const idMatch = decoded.match(/ID="([^"]+)"/);
    const requestId = idMatch ? idMatch[1] : `_${generateId()}`;
    
    // Extract Issuer
    const issuerMatch = decoded.match(/<saml:Issuer>([^<]+)<\/saml:Issuer>/);
    const issuer = issuerMatch ? issuerMatch[1] : 'unknown';
    
    // Extract ACS URL
    const acsMatch = decoded.match(/AssertionConsumerServiceURL="([^"]+)"/);
    const acsUrl = acsMatch ? acsMatch[1] : 'http://localhost:3001/api/saml/acs';
    
    return { requestId, issuer, acsUrl };
  } catch (error) {
    console.error('[MockIDP] Failed to parse SAML request:', error);
    return null;
  }
}
