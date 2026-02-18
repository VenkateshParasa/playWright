import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import axios from 'axios';

export interface LTIConfiguration {
  platformUrl: string;
  clientId: string;
  deploymentId: string;
  keysetUrl: string;
  tokenUrl: string;
  authUrl: string;
  privateKey: string;
  publicKey: string;
}

export interface LTIPlatform {
  id: string;
  name: string;
  url: string;
  clientId: string;
  deploymentIds: string[];
  keysetUrl: string;
  tokenUrl: string;
  authUrl: string;
  publicKey: string;
  active: boolean;
  createdAt: Date;
}

export interface LTILaunchRequest {
  messageType: 'LtiResourceLinkRequest' | 'LtiDeepLinkingRequest';
  version: '1.3.0';
  deploymentId: string;
  targetLinkUri: string;
  resourceLink?: {
    id: string;
    title?: string;
    description?: string;
  };
  roles: string[];
  context?: {
    id: string;
    type: string[];
    label?: string;
    title?: string;
  };
  launchPresentation?: {
    documentTarget: 'iframe' | 'window';
    returnUrl?: string;
    locale?: string;
  };
  custom?: { [key: string]: string };
  lis?: {
    personNameGiven?: string;
    personNameFamily?: string;
    personNameFull?: string;
    personContactEmailPrimary?: string;
  };
  [key: string]: any;
}

export interface LTIDeepLinkingSettings {
  deepLinkReturnUrl: string;
  acceptTypes: string[];
  acceptPresentationDocumentTargets: string[];
  acceptMultiple?: boolean;
  autoCreate?: boolean;
  title?: string;
  text?: string;
  data?: string;
}

export interface LTIContentItem {
  type: 'link' | 'ltiResourceLink' | 'file' | 'html' | 'image';
  title?: string;
  text?: string;
  url?: string;
  icon?: {
    url: string;
    width?: number;
    height?: number;
  };
  thumbnail?: {
    url: string;
    width?: number;
    height?: number;
  };
  custom?: { [key: string]: string };
  lineItem?: {
    scoreMaximum?: number;
    label?: string;
    resourceId?: string;
    tag?: string;
  };
}

export interface LTILineItem {
  id: string;
  scoreMaximum: number;
  label: string;
  resourceId?: string;
  resourceLinkId?: string;
  tag?: string;
  startDateTime?: string;
  endDateTime?: string;
}

export interface LTIScore {
  userId: string;
  scoreGiven: number;
  scoreMaximum: number;
  comment?: string;
  timestamp: string;
  activityProgress: 'Initialized' | 'Started' | 'InProgress' | 'Submitted' | 'Completed';
  gradingProgress: 'FullyGraded' | 'Pending' | 'PendingManual' | 'Failed' | 'NotReady';
}

/**
 * LTI 1.3 (LTI Advantage) Provider Implementation
 */
export class LTIProvider {
  private platforms: Map<string, LTIPlatform> = new Map();
  private nonces: Set<string> = new Set();
  private privateKey: string;
  private publicKey: string;

  constructor(privateKey?: string, publicKey?: string) {
    this.privateKey = privateKey || this.generateKeyPair().privateKey;
    this.publicKey = publicKey || this.generateKeyPair().publicKey;
  }

  /**
   * Register an LTI platform
   */
  registerPlatform(platform: Omit<LTIPlatform, 'id' | 'createdAt'>): LTIPlatform {
    const id = this.generateId();
    const registeredPlatform: LTIPlatform = {
      ...platform,
      id,
      createdAt: new Date()
    };

    this.platforms.set(id, registeredPlatform);
    return registeredPlatform;
  }

  /**
   * Get platform by client ID
   */
  getPlatformByClientId(clientId: string): LTIPlatform | undefined {
    return Array.from(this.platforms.values()).find(p => p.clientId === clientId);
  }

  /**
   * Validate LTI 1.3 launch request
   */
  async validateLaunchRequest(idToken: string, state: string): Promise<LTILaunchRequest> {
    try {
      // Decode without verification first to get the issuer
      const decoded = jwt.decode(idToken, { complete: true }) as any;

      if (!decoded) {
        throw new Error('Invalid token');
      }

      // Get platform by issuer (URL)
      const platform = Array.from(this.platforms.values()).find(
        p => p.url === decoded.payload.iss
      );

      if (!platform) {
        throw new Error('Unknown platform');
      }

      // Get platform's public key
      const publicKey = await this.getPlatformPublicKey(platform);

      // Verify token
      const payload = jwt.verify(idToken, publicKey, {
        algorithms: ['RS256'],
        audience: platform.clientId
      }) as any;

      // Validate nonce
      if (this.nonces.has(payload.nonce)) {
        throw new Error('Nonce already used');
      }
      this.nonces.add(payload.nonce);

      // Validate message type
      const messageType = payload['https://purl.imsglobal.org/spec/lti/claim/message_type'];
      if (!['LtiResourceLinkRequest', 'LtiDeepLinkingRequest'].includes(messageType)) {
        throw new Error('Invalid message type');
      }

      // Validate version
      const version = payload['https://purl.imsglobal.org/spec/lti/claim/version'];
      if (version !== '1.3.0') {
        throw new Error('Unsupported LTI version');
      }

      // Extract launch data
      const launchRequest: LTILaunchRequest = {
        messageType,
        version,
        deploymentId: payload['https://purl.imsglobal.org/spec/lti/claim/deployment_id'],
        targetLinkUri: payload['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'],
        resourceLink: payload['https://purl.imsglobal.org/spec/lti/claim/resource_link'],
        roles: payload['https://purl.imsglobal.org/spec/lti/claim/roles'] || [],
        context: payload['https://purl.imsglobal.org/spec/lti/claim/context'],
        launchPresentation: payload['https://purl.imsglobal.org/spec/lti/claim/launch_presentation'],
        custom: payload['https://purl.imsglobal.org/spec/lti/claim/custom'],
        lis: payload['https://purl.imsglobal.org/spec/lti/claim/lis']
      };

      // Deep Linking settings
      if (messageType === 'LtiDeepLinkingRequest') {
        launchRequest.deepLinkingSettings =
          payload['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'];
      }

      // AGS (Assignment and Grade Services) endpoint
      launchRequest.ags =
        payload['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'];

      // NRPS (Names and Role Provisioning Services) endpoint
      launchRequest.nrps =
        payload['https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'];

      return launchRequest;
    } catch (error) {
      throw new Error(`Failed to validate launch request: ${error.message}`);
    }
  }

  /**
   * Generate OIDC login response
   */
  generateOIDCLoginResponse(
    issuer: string,
    clientId: string,
    deploymentId: string,
    targetLinkUri: string,
    loginHint: string,
    ltiMessageHint?: string
  ): {
    authUrl: string;
    params: { [key: string]: string };
  } {
    const platform = this.getPlatformByClientId(clientId);
    if (!platform) {
      throw new Error('Platform not found');
    }

    const state = this.generateState();
    const nonce = this.generateNonce();

    const params = {
      scope: 'openid',
      response_type: 'id_token',
      response_mode: 'form_post',
      client_id: clientId,
      redirect_uri: targetLinkUri,
      login_hint: loginHint,
      state,
      nonce,
      prompt: 'none'
    };

    if (ltiMessageHint) {
      params['lti_message_hint'] = ltiMessageHint;
    }

    return {
      authUrl: platform.authUrl,
      params
    };
  }

  /**
   * Generate deep linking response
   */
  generateDeepLinkingResponse(
    platform: LTIPlatform,
    deploymentId: string,
    contentItems: LTIContentItem[],
    deepLinkingSettings: LTIDeepLinkingSettings,
    data?: string
  ): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: platform.clientId,
      aud: platform.url,
      exp: now + 3600,
      iat: now,
      nonce: this.generateNonce(),
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id': deploymentId,
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': contentItems,
      'https://purl.imsglobal.org/spec/lti-dl/claim/data': data || deepLinkingSettings.data
    };

    return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
  }

  /**
   * Get access token for platform services
   */
  async getAccessToken(platform: LTIPlatform, scopes: string[]): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    const assertion = jwt.sign(
      {
        iss: platform.clientId,
        sub: platform.clientId,
        aud: platform.tokenUrl,
        exp: now + 300,
        iat: now,
        jti: this.generateId()
      },
      this.privateKey,
      { algorithm: 'RS256' }
    );

    try {
      const response = await axios.post(
        platform.tokenUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: assertion,
          scope: scopes.join(' ')
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  /**
   * Get line items from platform (AGS)
   */
  async getLineItems(
    platform: LTIPlatform,
    lineItemsUrl: string
  ): Promise<LTILineItem[]> {
    const accessToken = await this.getAccessToken(platform, [
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly'
    ]);

    try {
      const response = await axios.get(lineItemsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.ims.lis.v2.lineitemcontainer+json'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get line items: ${error.message}`);
    }
  }

  /**
   * Create a line item (AGS)
   */
  async createLineItem(
    platform: LTIPlatform,
    lineItemsUrl: string,
    lineItem: Omit<LTILineItem, 'id'>
  ): Promise<LTILineItem> {
    const accessToken = await this.getAccessToken(platform, [
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem'
    ]);

    try {
      const response = await axios.post(lineItemsUrl, lineItem, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create line item: ${error.message}`);
    }
  }

  /**
   * Send score to platform (AGS)
   */
  async sendScore(
    platform: LTIPlatform,
    scoresUrl: string,
    score: LTIScore
  ): Promise<void> {
    const accessToken = await this.getAccessToken(platform, [
      'https://purl.imsglobal.org/spec/lti-ags/scope/score'
    ]);

    try {
      await axios.post(scoresUrl, score, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.ims.lis.v1.score+json'
        }
      });
    } catch (error) {
      throw new Error(`Failed to send score: ${error.message}`);
    }
  }

  /**
   * Get public JWK set (for platform to verify our tokens)
   */
  getPublicJWKS(): any {
    const key = crypto.createPublicKey(this.publicKey);
    const jwk = key.export({ format: 'jwk' });

    return {
      keys: [
        {
          ...jwk,
          kid: this.generateKeyId(),
          alg: 'RS256',
          use: 'sig'
        }
      ]
    };
  }

  // Private helper methods

  private async getPlatformPublicKey(platform: LTIPlatform): Promise<string> {
    if (platform.publicKey) {
      return platform.publicKey;
    }

    // Fetch from keyset URL
    try {
      const response = await axios.get(platform.keysetUrl);
      const jwks = response.data;

      // Convert JWK to PEM (simplified - use a library like jwk-to-pem in production)
      const jwk = jwks.keys[0];
      return this.jwkToPem(jwk);
    } catch (error) {
      throw new Error(`Failed to fetch platform public key: ${error.message}`);
    }
  }

  private generateKeyPair(): { privateKey: string; publicKey: string } {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    return { privateKey, publicKey };
  }

  private generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateState(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateKeyId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  private jwkToPem(jwk: any): string {
    // Simplified JWK to PEM conversion
    // In production, use a library like jwk-to-pem
    return jwk.x5c ? `-----BEGIN CERTIFICATE-----\n${jwk.x5c[0]}\n-----END CERTIFICATE-----` : '';
  }
}

export const ltiProvider = new LTIProvider();
