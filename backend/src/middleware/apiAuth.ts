import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/apiKeyService.js';
import { OAuth2Service } from '../services/oauth2Service.js';
import { IApiKey } from '../models/ApiKey.js';

// Extend Express Request to include API auth data
declare global {
  namespace Express {
    interface Request {
      apiKey?: IApiKey;
      oauth?: {
        userId: string;
        clientId: string;
        scopes: string[];
      };
      apiUserId?: string;
    }
  }
}

/**
 * Middleware to authenticate API requests using API keys
 */
export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get API key from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'API key is required. Provide it in the Authorization header as "Bearer YOUR_API_KEY"',
        },
      });
      return;
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify API key
    const apiKeyDoc = await ApiKeyService.verifyApiKey(apiKey);
    if (!apiKeyDoc) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid or expired API key',
        },
      });
      return;
    }

    // Check IP whitelist if configured
    const clientIp = req.ip || req.socket.remoteAddress || '';
    if (!ApiKeyService.validateIpAddress(apiKeyDoc, clientIp)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'IP_NOT_ALLOWED',
          message: 'Your IP address is not whitelisted for this API key',
        },
      });
      return;
    }

    // Attach API key to request
    req.apiKey = apiKeyDoc;
    req.apiUserId = apiKeyDoc.userId.toString();

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while authenticating your request',
      },
    });
  }
};

/**
 * Middleware to authenticate API requests using OAuth2 access tokens
 */
export const authenticateOAuth2 = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get access token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token is required. Provide it in the Authorization header as "Bearer YOUR_ACCESS_TOKEN"',
        },
      });
      return;
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify access token
    const tokenData = await OAuth2Service.verifyAccessToken(accessToken);
    if (!tokenData) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired access token',
        },
      });
      return;
    }

    // Attach OAuth data to request
    req.oauth = tokenData;
    req.apiUserId = tokenData.userId;

    next();
  } catch (error) {
    console.error('OAuth2 authentication error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while authenticating your request',
      },
    });
  }
};

/**
 * Middleware to authenticate using either API key or OAuth2
 */
export const authenticateApi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Provide an API key or access token in the Authorization header.',
      },
    });
    return;
  }

  const token = authHeader.substring(7);

  // Try API key first
  try {
    const apiKeyDoc = await ApiKeyService.verifyApiKey(token);
    if (apiKeyDoc) {
      const clientIp = req.ip || req.socket.remoteAddress || '';
      if (ApiKeyService.validateIpAddress(apiKeyDoc, clientIp)) {
        req.apiKey = apiKeyDoc;
        req.apiUserId = apiKeyDoc.userId.toString();
        return next();
      }
    }
  } catch (error) {
    console.error('API key verification error:', error);
  }

  // Try OAuth2 token
  try {
    const tokenData = await OAuth2Service.verifyAccessToken(token);
    if (tokenData) {
      req.oauth = tokenData;
      req.apiUserId = tokenData.userId;
      return next();
    }
  } catch (error) {
    console.error('OAuth2 verification error:', error);
  }

  // Neither worked
  res.status(401).json({
    success: false,
    error: {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid API key or access token',
    },
  });
};

/**
 * Middleware to check if API key or OAuth token has required scope
 */
export const requireScope = (scope: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check API key scopes
    if (req.apiKey) {
      if (ApiKeyService.hasScope(req.apiKey, scope)) {
        return next();
      }
    }

    // Check OAuth scopes
    if (req.oauth) {
      if (req.oauth.scopes.includes(scope) || req.oauth.scopes.includes('*')) {
        return next();
      }
    }

    res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `This endpoint requires the '${scope}' scope`,
      },
    });
  };
};

/**
 * Middleware to check if request has any of the required scopes
 */
export const requireAnyScope = (scopes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check API key scopes
    if (req.apiKey) {
      const hasScope = scopes.some(scope => ApiKeyService.hasScope(req.apiKey!, scope));
      if (hasScope) {
        return next();
      }
    }

    // Check OAuth scopes
    if (req.oauth) {
      const hasScope = scopes.some(
        scope => req.oauth!.scopes.includes(scope) || req.oauth!.scopes.includes('*')
      );
      if (hasScope) {
        return next();
      }
    }

    res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `This endpoint requires one of the following scopes: ${scopes.join(', ')}`,
      },
    });
  };
};
