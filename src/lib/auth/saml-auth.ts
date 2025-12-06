/**
 * SAML Authentication Provider
 * ============================
 * 
 * Handles SAML 2.0 authentication with Ping Federate IDP.
 * Implements SP-initiated SSO with MFA enforcement.
 * 
 * USAGE:
 * - Active when authMode = 'USE_MFA_AUTH'
 * - Redirects user to IDP for authentication
 * - Processes SAML assertions from IDP callback
 * 
 * FLOW:
 * 1. User clicks "Sign in with SSO"
 * 2. SP generates AuthnRequest, redirects to IDP
 * 3. User authenticates at IDP (SSO + MFA)
 * 4. IDP POSTs SAML Assertion to SP ACS URL
 * 5. SP validates assertion, extracts attributes
 * 6. SP maps groups to roles, creates session
 * 
 * @module lib/auth/saml-auth
 */

import type { MfaAuthConfig } from '@/config/auth.config';
import type {
  AuthProvider,
  AuthInitParams,
  AuthInitResult,
  AuthCompleteParams,
  AuthCompleteResult,
  AuthLogoutParams,
  AuthLogoutResult,
  AuthUser,
  SamlAttributes,
  SamlAuthResult,
} from './types';
import { RoleMapper, type GroupRoleMapping } from './role-mapper';

// ============================================================================
// SAML AUTH PROVIDER
// ============================================================================

/**
 * SamlAuthProvider
 * Implements AuthProvider interface for SAML SSO authentication
 */
export class SamlAuthProvider implements AuthProvider {
  readonly name = 'saml';
  
  private config: MfaAuthConfig;
  private roleMapper: RoleMapper;

  constructor(config: MfaAuthConfig, groupRoleMapping: GroupRoleMapping, defaultRole: string) {
    this.config = config;
    this.roleMapper = new RoleMapper(groupRoleMapping, defaultRole);
  }

  /**
   * Initiate SAML authentication
   * Generates AuthnRequest and returns redirect URL to IDP
   */
  async initiateAuth(params: AuthInitParams): Promise<AuthInitResult> {
    try {
      const { returnUrl } = params;
      
      // Generate unique request ID
      const requestId = this.generateRequestId();
      
      // Build AuthnRequest XML
      const authnRequest = this.buildAuthnRequest(requestId);
      
      // Encode request for redirect
      const encodedRequest = this.encodeRequest(authnRequest);
      
      // Build redirect URL
      const redirectUrl = this.buildRedirectUrl(encodedRequest, returnUrl);

      return {
        success: true,
        redirectUrl,
        samlRequest: encodedRequest,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initiate SAML auth';
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Complete SAML authentication
   * Validates assertion and extracts user attributes
   */
  async completeAuth(params: AuthCompleteParams): Promise<AuthCompleteResult> {
    try {
      const { samlResponse } = params;

      if (!samlResponse) {
        return {
          success: false,
          error: 'SAML Response is required',
        };
      }

      // Validate and parse SAML assertion
      const authResult = await this.validateAssertion(samlResponse);
      
      if (!authResult.success || !authResult.attributes) {
        return {
          success: false,
          error: authResult.error || 'SAML assertion validation failed',
        };
      }

      const { attributes } = authResult;

      // Map groups to roles
      const roleMapping = this.roleMapper.mapGroupsToRoles(attributes.groups);

      // Create authenticated user
      const user: AuthUser = {
        userId: attributes.userId,
        email: attributes.email,
        displayName: attributes.displayName,
        roles: roleMapping.roles,
        groups: attributes.groups,
        authMethod: 'saml',
        authenticatedAt: new Date(),
      };

      return {
        success: true,
        user,
        availableRoles: roleMapping.availableRoles,
        activeRole: roleMapping.activeRole,
        isMaster: roleMapping.isMaster,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete SAML auth';
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Initiate SAML Single Logout
   */
  async logout(params: AuthLogoutParams): Promise<AuthLogoutResult> {
    try {
      const { returnUrl } = params;

      // Build SLO request
      const logoutRequestId = this.generateRequestId();
      const logoutRequest = this.buildLogoutRequest(logoutRequestId, params.userId);
      const encodedRequest = this.encodeRequest(logoutRequest);
      
      // Build SLO redirect URL
      const sloUrl = this.config.identityProvider.sloUrl;
      const redirectUrl = `${sloUrl}?SAMLRequest=${encodeURIComponent(encodedRequest)}${returnUrl ? `&RelayState=${encodeURIComponent(returnUrl)}` : ''}`;

      return {
        success: true,
        redirectUrl,
      };
    } catch (error) {
      // If SLO fails, still return success (local logout is enough)
      console.warn('SAML SLO failed:', error);
      return {
        success: true,
      };
    }
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Build SAML AuthnRequest XML
   */
  private buildAuthnRequest(requestId: string): string {
    const sp = this.config.serviceProvider;
    const idp = this.config.identityProvider;
    const issueInstant = new Date().toISOString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="${requestId}"
    Version="2.0"
    IssueInstant="${issueInstant}"
    Destination="${idp.ssoUrl}"
    AssertionConsumerServiceURL="${sp.assertionConsumerServiceUrl}"
    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
    <saml:Issuer>${sp.entityId}</saml:Issuer>
    <samlp:NameIDPolicy
        Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
        AllowCreate="true"/>
</samlp:AuthnRequest>`;
  }

  /**
   * Build SAML LogoutRequest XML
   */
  private buildLogoutRequest(requestId: string, userId?: string): string {
    const sp = this.config.serviceProvider;
    const idp = this.config.identityProvider;
    const issueInstant = new Date().toISOString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:LogoutRequest
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="${requestId}"
    Version="2.0"
    IssueInstant="${issueInstant}"
    Destination="${idp.sloUrl}">
    <saml:Issuer>${sp.entityId}</saml:Issuer>
    ${userId ? `<saml:NameID>${userId}</saml:NameID>` : ''}
</samlp:LogoutRequest>`;
  }

  /**
   * Encode SAML request for redirect binding
   */
  private encodeRequest(request: string): string {
    // For browser environments, we'll handle encoding in the API route
    // This is a placeholder that returns base64
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(request).toString('base64');
    }
    // Browser fallback
    return btoa(request);
  }

  /**
   * Build redirect URL to IDP
   */
  private buildRedirectUrl(encodedRequest: string, relayState?: string): string {
    const ssoUrl = this.config.identityProvider.ssoUrl;
    let url = `${ssoUrl}?SAMLRequest=${encodeURIComponent(encodedRequest)}`;
    
    if (relayState) {
      url += `&RelayState=${encodeURIComponent(relayState)}`;
    }
    
    return url;
  }

  /**
   * Validate SAML assertion
   * NOTE: This is a simplified implementation. In production, use a proper SAML library
   * like @node-saml/passport-saml for full validation including:
   * - Signature verification
   * - Certificate validation
   * - Audience restriction
   * - Time conditions (NotBefore, NotOnOrAfter)
   * - Replay prevention
   */
  private async validateAssertion(samlResponse: string): Promise<SamlAuthResult> {
    try {
      // Decode the SAML response
      let decoded: string;
      if (typeof Buffer !== 'undefined') {
        decoded = Buffer.from(samlResponse, 'base64').toString('utf-8');
      } else {
        decoded = atob(samlResponse);
      }

      // Parse attributes from assertion
      // NOTE: This is a simplified parser. Use proper XML parsing in production.
      const attributes = this.parseAttributes(decoded);

      if (!attributes) {
        return {
          success: false,
          error: 'Failed to parse SAML attributes',
        };
      }

      return {
        success: true,
        attributes,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'SAML validation failed';
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Parse attributes from SAML assertion XML
   * NOTE: Simplified implementation - use proper XML library in production
   */
  private parseAttributes(assertionXml: string): SamlAttributes | null {
    try {
      const mapping = this.config.attributeMapping;
      
      // Extract attribute values using regex (simplified)
      const userId = this.extractAttributeValue(assertionXml, mapping.userId);
      const email = this.extractAttributeValue(assertionXml, mapping.email);
      const displayName = this.extractAttributeValue(assertionXml, mapping.displayName);
      const groups = this.extractMultiValueAttribute(assertionXml, mapping.groups);

      if (!userId) {
        return null;
      }

      return {
        userId,
        email: email || `${userId}@company.com`,
        displayName: displayName || userId,
        groups,
      };
    } catch {
      return null;
    }
  }

  /**
   * Extract single attribute value from SAML XML
   */
  private extractAttributeValue(xml: string, attributeName: string): string | null {
    // Look for <Attribute Name="attributeName"><AttributeValue>value</AttributeValue></Attribute>
    const regex = new RegExp(
      `<(?:saml:)?Attribute[^>]*Name=["']${attributeName}["'][^>]*>\\s*<(?:saml:)?AttributeValue[^>]*>([^<]*)</(?:saml:)?AttributeValue>`,
      'i'
    );
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract multi-value attribute from SAML XML
   */
  private extractMultiValueAttribute(xml: string, attributeName: string): string[] {
    const values: string[] = [];
    
    // Find the attribute block
    const attrRegex = new RegExp(
      `<(?:saml:)?Attribute[^>]*Name=["']${attributeName}["'][^>]*>([\\s\\S]*?)</(?:saml:)?Attribute>`,
      'gi'
    );
    const attrMatch = xml.match(attrRegex);
    
    if (attrMatch) {
      // Extract all AttributeValue elements
      const valueRegex = /<(?:saml:)?AttributeValue[^>]*>([^<]*)<\/(?:saml:)?AttributeValue>/gi;
      let valueMatch;
      while ((valueMatch = valueRegex.exec(attrMatch[0])) !== null) {
        values.push(valueMatch[1].trim());
      }
    }
    
    return values;
  }
}

// ============================================================================
// FACTORY & EXPORTS
// ============================================================================

/**
 * Create a SAML auth provider instance
 */
export function createSamlAuthProvider(
  config: MfaAuthConfig,
  groupRoleMapping: GroupRoleMapping,
  defaultRole: string
): SamlAuthProvider {
  return new SamlAuthProvider(config, groupRoleMapping, defaultRole);
}

/**
 * Generate SP Metadata XML for IDP configuration
 * Use this to provide metadata to Ping Federate
 */
export function generateSamlSpMetadata(
  entityId: string,
  acsUrl: string,
  sloUrl?: string,
  signingCert?: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor 
    xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
    entityID="${entityId}">
  <md:SPSSODescriptor 
      AuthnRequestsSigned="false"
      WantAssertionsSigned="true"
      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</md:NameIDFormat>
    <md:AssertionConsumerService 
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="${acsUrl}"
        index="0"
        isDefault="true"/>
    ${sloUrl ? `<md:SingleLogoutService 
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        Location="${sloUrl}"/>` : ''}
    ${signingCert ? `<md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>${signingCert}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>` : ''}
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
}

/**
 * Validate a SAML response (placeholder for full validation)
 * NOTE: For production, use @node-saml/passport-saml library
 */
export async function validateSamlResponse(
  _samlResponse: string,
  _config: MfaAuthConfig
): Promise<SamlAuthResult> {
  // This is a placeholder - real validation happens in SamlAuthProvider
  // For production, this should use a proper SAML library
  return {
    success: false,
    error: 'Use SamlAuthProvider.completeAuth() for validation',
  };
}

/**
 * Extract user attributes from SAML assertion
 * Convenience function for testing
 */
export function extractUserFromAssertion(
  assertionXml: string,
  attributeMapping: MfaAuthConfig['attributeMapping']
): SamlAttributes | null {
  try {
    const extractValue = (xml: string, attrName: string): string | null => {
      const regex = new RegExp(
        `<(?:saml:)?Attribute[^>]*Name=["']${attrName}["'][^>]*>\\s*<(?:saml:)?AttributeValue[^>]*>([^<]*)</(?:saml:)?AttributeValue>`,
        'i'
      );
      const match = xml.match(regex);
      return match ? match[1].trim() : null;
    };

    const extractMultiValue = (xml: string, attrName: string): string[] => {
      const values: string[] = [];
      const attrRegex = new RegExp(
        `<(?:saml:)?Attribute[^>]*Name=["']${attrName}["'][^>]*>([\\s\\S]*?)</(?:saml:)?Attribute>`,
        'gi'
      );
      const attrMatch = xml.match(attrRegex);
      
      if (attrMatch) {
        const valueRegex = /<(?:saml:)?AttributeValue[^>]*>([^<]*)<\/(?:saml:)?AttributeValue>/gi;
        let valueMatch;
        while ((valueMatch = valueRegex.exec(attrMatch[0])) !== null) {
          values.push(valueMatch[1].trim());
        }
      }
      return values;
    };

    const userId = extractValue(assertionXml, attributeMapping.userId);
    if (!userId) return null;

    return {
      userId,
      email: extractValue(assertionXml, attributeMapping.email) || `${userId}@company.com`,
      displayName: extractValue(assertionXml, attributeMapping.displayName) || userId,
      groups: extractMultiValue(assertionXml, attributeMapping.groups),
    };
  } catch {
    return null;
  }
}
