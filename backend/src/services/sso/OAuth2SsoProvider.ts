import { BaseSsoProvider, SsoProvider, SsoUserProfile } from './BaseSsoProvider';
import { ITenant } from '../../models/Tenant';
import crypto from 'crypto';

/**
 * OAuth 2.0 / OpenID Connect SSO Provider
 *
 * Supports multiple OAuth2 providers:
 * - Google
 * - Microsoft Azure AD
 * - Okta
 * - Custom OAuth2 providers
 */
export class OAuth2SsoProvider extends BaseSsoProvider implements SsoProvider {
  name = 'OAuth 2.0';
  type: 'oauth2' = 'oauth2';

  /**
   * Generate OAuth2 authorization URL
   */
  getLoginUrl(tenant: ITenant, returnUrl?: string): string {
    if (!tenant.ssoConfig.oauth2) {
      throw new Error('OAuth2 configuration not found');
    }

    const {
      authorizationUrl,
      clientId,
      callbackUrl,
      scopes = ['openid', 'email', 'profile'],
    } = tenant.ssoConfig.oauth2;

    const state = this.generateState();
    const nonce = this.generateNonce();

    // Store state and nonce for validation (in production, use Redis or session store)
    // this.storeStateData(state, { nonce, returnUrl });

    const loginUrl = new URL(authorizationUrl);
    loginUrl.searchParams.append('client_id', clientId);
    loginUrl.searchParams.append('response_type', 'code');
    loginUrl.searchParams.append('redirect_uri', callbackUrl);
    loginUrl.searchParams.append('scope', scopes.join(' '));
    loginUrl.searchParams.append('state', state);
    loginUrl.searchParams.append('nonce', nonce);

    return loginUrl.toString();
  }

  /**
   * Handle OAuth2 callback
   */
  async handleCallback(tenant: ITenant, callbackData: any): Promise<SsoUserProfile> {
    const { code, state } = callbackData;

    if (!code) {
      throw new Error('Authorization code not found in callback');
    }

    // Validate state parameter (CSRF protection)
    // In production, retrieve and validate stored state
    // this.validateState(state);

    // Exchange code for access token
    const tokenData = await this.exchangeCodeForToken(tenant, code);

    // Get user info
    const userProfile = await this.getUserInfo(tenant, tokenData.access_token);

    return userProfile;
  }

  /**
   * Authenticate user via OAuth2
   */
  async authenticate(tenant: ITenant, credentials: any): Promise<{
    success: boolean;
    user?: {
      email: string;
      firstName: string;
      lastName: string;
      ssoId: string;
    };
    error?: string;
  }> {
    try {
      const profile = await this.handleCallback(tenant, credentials);

      return {
        success: true,
        user: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          ssoId: profile.ssoId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth2 authentication failed',
      };
    }
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(
    tenant: ITenant,
    code: string
  ): Promise<{ access_token: string; id_token?: string; refresh_token?: string }> {
    if (!tenant.ssoConfig.oauth2) {
      throw new Error('OAuth2 configuration not found');
    }

    const { tokenUrl, clientId, clientSecret, callbackUrl } = tenant.ssoConfig.oauth2;

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl,
      client_id: clientId,
      client_secret: clientSecret,
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokenData = await response.json();
      return tokenData;
    } catch (error) {
      throw new Error(
        `Failed to exchange code for token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get user information from OAuth2 provider
   */
  private async getUserInfo(tenant: ITenant, accessToken: string): Promise<SsoUserProfile> {
    if (!tenant.ssoConfig.oauth2) {
      throw new Error('OAuth2 configuration not found');
    }

    const { userInfoUrl, provider } = tenant.ssoConfig.oauth2;

    try {
      const response = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData = await response.json();

      // Parse user data based on provider
      return this.parseUserInfo(userData, provider);
    } catch (error) {
      throw new Error(
        `Failed to get user info: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse user info based on OAuth2 provider
   */
  private parseUserInfo(userData: any, provider: string): SsoUserProfile {
    let email: string;
    let firstName: string;
    let lastName: string;
    let ssoId: string;

    switch (provider) {
      case 'google':
        email = userData.email;
        firstName = userData.given_name || '';
        lastName = userData.family_name || '';
        ssoId = userData.sub;
        break;

      case 'microsoft':
        email = userData.userPrincipalName || userData.mail;
        firstName = userData.givenName || '';
        lastName = userData.surname || '';
        ssoId = userData.id;
        break;

      case 'okta':
        email = userData.email;
        firstName = userData.given_name || '';
        lastName = userData.family_name || '';
        ssoId = userData.sub;
        break;

      case 'custom':
      default:
        // Generic OIDC parsing
        email = userData.email || userData.preferred_username;
        firstName = userData.given_name || userData.name?.split(' ')[0] || '';
        lastName = userData.family_name || userData.name?.split(' ').slice(1).join(' ') || '';
        ssoId = userData.sub || userData.id;
        break;
    }

    if (!email || !this.validateEmail(email)) {
      throw new Error('Valid email not found in OAuth2 user info');
    }

    // Fallback to email-based names if not provided
    if (!firstName || !lastName) {
      const extracted = this.extractNameFromEmail(email);
      firstName = firstName || extracted.firstName;
      lastName = lastName || extracted.lastName;
    }

    return {
      email,
      firstName,
      lastName,
      ssoId,
      attributes: userData,
    };
  }

  /**
   * Generate state parameter for CSRF protection
   */
  private generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate nonce for OIDC
   */
  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Get provider-specific configuration
   */
  static getProviderDefaults(provider: 'google' | 'microsoft' | 'okta'): {
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    scopes: string[];
  } {
    switch (provider) {
      case 'google':
        return {
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
          scopes: ['openid', 'email', 'profile'],
        };

      case 'microsoft':
        return {
          authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
          scopes: ['openid', 'email', 'profile', 'User.Read'],
        };

      case 'okta':
        return {
          authorizationUrl: '', // Must be configured per Okta domain
          tokenUrl: '', // Must be configured per Okta domain
          userInfoUrl: '', // Must be configured per Okta domain
          scopes: ['openid', 'email', 'profile'],
        };

      default:
        throw new Error('Unknown OAuth2 provider');
    }
  }
}
