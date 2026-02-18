import { ITenant } from '../../models/Tenant';
import { IUser } from '../../models/User';

export interface SsoProvider {
  name: string;
  type: 'saml' | 'oauth2' | 'ldap';
  authenticate(
    tenant: ITenant,
    credentials: any
  ): Promise<{
    success: boolean;
    user?: {
      email: string;
      firstName: string;
      lastName: string;
      ssoId: string;
    };
    error?: string;
  }>;
  getLoginUrl(tenant: ITenant, returnUrl?: string): string;
  handleCallback(tenant: ITenant, callbackData: any): Promise<any>;
}

export interface SsoUserProfile {
  email: string;
  firstName: string;
  lastName: string;
  ssoId: string;
  attributes?: Record<string, any>;
}

export class BaseSsoProvider {
  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected extractNameFromEmail(email: string): { firstName: string; lastName: string } {
    const localPart = email.split('@')[0];
    const parts = localPart.split('.');

    if (parts.length >= 2) {
      return {
        firstName: this.capitalize(parts[0]),
        lastName: this.capitalize(parts[parts.length - 1]),
      };
    }

    return {
      firstName: this.capitalize(localPart),
      lastName: 'User',
    };
  }

  protected capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
