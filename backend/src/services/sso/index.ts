import { ITenant } from '../../models/Tenant';
import { SsoProvider } from './BaseSsoProvider';
import { SamlSsoProvider } from './SamlSsoProvider';
import { OAuth2SsoProvider } from './OAuth2SsoProvider';
import { LdapSsoProvider } from './LdapSsoProvider';

/**
 * SSO Service Factory
 * Manages different SSO providers and provides unified interface
 */
export class SsoService {
  private static providers: Map<string, SsoProvider> = new Map([
    ['saml', new SamlSsoProvider()],
    ['oauth2', new OAuth2SsoProvider()],
    ['ldap', new LdapSsoProvider()],
  ]);

  /**
   * Get SSO provider for tenant
   */
  static getProvider(tenant: ITenant): SsoProvider | null {
    if (!tenant.ssoConfig.enabled || !tenant.ssoConfig.provider) {
      return null;
    }

    const provider = this.providers.get(tenant.ssoConfig.provider);

    if (!provider) {
      throw new Error(`Unknown SSO provider: ${tenant.ssoConfig.provider}`);
    }

    return provider;
  }

  /**
   * Check if SSO is enabled for tenant
   */
  static isSsoEnabled(tenant: ITenant): boolean {
    return tenant.ssoConfig.enabled && tenant.ssoConfig.provider !== undefined;
  }

  /**
   * Get SSO login URL for tenant
   */
  static getLoginUrl(tenant: ITenant, returnUrl?: string): string {
    const provider = this.getProvider(tenant);

    if (!provider) {
      throw new Error('SSO not enabled for this tenant');
    }

    return provider.getLoginUrl(tenant, returnUrl);
  }

  /**
   * Handle SSO callback
   */
  static async handleCallback(tenant: ITenant, callbackData: any) {
    const provider = this.getProvider(tenant);

    if (!provider) {
      throw new Error('SSO not enabled for this tenant');
    }

    return provider.handleCallback(tenant, callbackData);
  }

  /**
   * Authenticate user via SSO
   */
  static async authenticate(tenant: ITenant, credentials: any) {
    const provider = this.getProvider(tenant);

    if (!provider) {
      throw new Error('SSO not enabled for this tenant');
    }

    return provider.authenticate(tenant, credentials);
  }

  /**
   * Validate SSO configuration
   */
  static validateConfig(tenant: ITenant): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!tenant.ssoConfig.enabled) {
      return { valid: true, errors: [] };
    }

    if (!tenant.ssoConfig.provider) {
      errors.push('SSO provider not specified');
      return { valid: false, errors };
    }

    const { provider } = tenant.ssoConfig;

    // Validate provider-specific configuration
    switch (provider) {
      case 'saml':
        if (!tenant.ssoConfig.saml) {
          errors.push('SAML configuration missing');
        } else {
          const { entryPoint, issuer, callbackUrl } = tenant.ssoConfig.saml;
          if (!entryPoint) errors.push('SAML entry point URL required');
          if (!issuer) errors.push('SAML issuer required');
          if (!callbackUrl) errors.push('SAML callback URL required');
        }
        break;

      case 'oauth2':
        if (!tenant.ssoConfig.oauth2) {
          errors.push('OAuth2 configuration missing');
        } else {
          const {
            clientId,
            clientSecret,
            authorizationUrl,
            tokenUrl,
            userInfoUrl,
            callbackUrl,
          } = tenant.ssoConfig.oauth2;

          if (!clientId) errors.push('OAuth2 client ID required');
          if (!clientSecret) errors.push('OAuth2 client secret required');
          if (!authorizationUrl) errors.push('OAuth2 authorization URL required');
          if (!tokenUrl) errors.push('OAuth2 token URL required');
          if (!userInfoUrl) errors.push('OAuth2 user info URL required');
          if (!callbackUrl) errors.push('OAuth2 callback URL required');
        }
        break;

      case 'ldap':
        if (!tenant.ssoConfig.ldap) {
          errors.push('LDAP configuration missing');
        } else {
          const { url, bindDn, bindCredentials, searchBase, searchFilter } =
            tenant.ssoConfig.ldap;

          if (!url) errors.push('LDAP URL required');
          if (!bindDn) errors.push('LDAP bind DN required');
          if (!bindCredentials) errors.push('LDAP bind credentials required');
          if (!searchBase) errors.push('LDAP search base required');
          if (!searchFilter) errors.push('LDAP search filter required');
        }
        break;

      default:
        errors.push(`Unknown SSO provider: ${provider}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Test SSO configuration
   */
  static async testConfig(tenant: ITenant): Promise<{ success: boolean; message: string }> {
    const validation = this.validateConfig(tenant);

    if (!validation.valid) {
      return {
        success: false,
        message: `Configuration invalid: ${validation.errors.join(', ')}`,
      };
    }

    // For LDAP, test connection
    if (tenant.ssoConfig.provider === 'ldap') {
      const ldapProvider = this.providers.get('ldap') as LdapSsoProvider;
      return ldapProvider.testConnection(tenant);
    }

    // For other providers, configuration validation is sufficient
    return {
      success: true,
      message: 'SSO configuration valid',
    };
  }

  /**
   * Get SSO metadata for SAML
   */
  static getSamlMetadata(tenant: ITenant): string {
    if (tenant.ssoConfig.provider !== 'saml') {
      throw new Error('Not a SAML tenant');
    }

    const { issuer, callbackUrl } = tenant.ssoConfig.saml!;

    return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="${issuer}">
  <md:SPSSODescriptor
      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="${callbackUrl}"
        index="0"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
  }
}

export { SamlSsoProvider, OAuth2SsoProvider, LdapSsoProvider };
