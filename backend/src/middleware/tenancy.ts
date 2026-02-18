import { Request, Response, NextFunction } from 'express';
import { Tenant, ITenant } from '../models/Tenant';
import { SecurityPolicy } from '../models/SecurityPolicy';

// Extend Express Request to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: ITenant;
      tenantId?: string;
    }
  }
}

/**
 * Tenant Resolution Middleware
 *
 * Resolves tenant from:
 * 1. Custom domain (e.g., acme.learningplatform.com)
 * 2. Subdomain (e.g., acme.app.com)
 * 3. Tenant slug in path (e.g., /t/acme/...)
 * 4. Tenant ID in header (X-Tenant-ID)
 */
export const resolveTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let tenant: ITenant | null = null;

    // 1. Try custom domain resolution
    const host = req.hostname;
    tenant = await Tenant.findOne({ domain: host, status: { $ne: 'deleted' } });

    // 2. Try subdomain resolution
    if (!tenant) {
      const subdomain = extractSubdomain(host);
      if (subdomain && !['www', 'api', 'app'].includes(subdomain)) {
        tenant = await Tenant.findOne({ slug: subdomain, status: { $ne: 'deleted' } });
      }
    }

    // 3. Try path-based tenant (/t/:tenantSlug/...)
    if (!tenant && req.path.startsWith('/t/')) {
      const pathParts = req.path.split('/');
      const tenantSlug = pathParts[2];
      if (tenantSlug) {
        tenant = await Tenant.findOne({ slug: tenantSlug, status: { $ne: 'deleted' } });
      }
    }

    // 4. Try tenant ID from header
    if (!tenant) {
      const tenantId = req.headers['x-tenant-id'] as string;
      if (tenantId) {
        tenant = await Tenant.findById(tenantId);
        if (tenant?.status === 'deleted') {
          tenant = null;
        }
      }
    }

    // Attach tenant to request
    if (tenant) {
      req.tenant = tenant;
      req.tenantId = tenant._id.toString();

      // Check tenant status
      if (tenant.status === 'suspended') {
        res.status(403).json({
          error: 'Tenant suspended',
          message: 'This tenant account has been suspended. Please contact support.',
        });
        return;
      }

      // Check trial expiration
      if (tenant.status === 'trial' && tenant.trialEndsAt && tenant.trialEndsAt < new Date()) {
        res.status(402).json({
          error: 'Trial expired',
          message: 'Your trial period has expired. Please upgrade to continue.',
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Error resolving tenant:', error);
    res.status(500).json({ error: 'Failed to resolve tenant' });
  }
};

/**
 * Require tenant middleware
 * Ensures a tenant is resolved before proceeding
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.tenant) {
    res.status(400).json({
      error: 'Tenant required',
      message: 'No tenant context found. Please access through a valid tenant domain.',
    });
    return;
  }

  next();
};

/**
 * Tenant isolation middleware
 * Ensures all database queries are scoped to the current tenant
 */
export const enforceTenantIsolation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.tenant && req.user && (req.user as any).role !== 'super_admin') {
    res.status(403).json({
      error: 'Access denied',
      message: 'No tenant context available',
    });
    return;
  }

  // Attach tenant filter for queries
  if (req.tenant) {
    (req as any).tenantFilter = { tenantId: req.tenant._id };
  }

  next();
};

/**
 * Check tenant feature access
 */
export const requireTenantFeature = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.tenant) {
      res.status(400).json({ error: 'Tenant required' });
      return;
    }

    if (!req.tenant.hasFeature(feature)) {
      res.status(403).json({
        error: 'Feature not available',
        message: `The feature '${feature}' is not available in your current plan.`,
        upgrade: true,
      });
      return;
    }

    next();
  };
};

/**
 * Check tenant quota
 */
export const checkTenantQuota = (quotaType: 'users' | 'storage' | 'apiCalls') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.tenant) {
      res.status(400).json({ error: 'Tenant required' });
      return;
    }

    if (req.tenant.isQuotaExceeded(quotaType)) {
      res.status(429).json({
        error: 'Quota exceeded',
        message: `Your ${quotaType} quota has been exceeded. Please upgrade your plan.`,
        quotaType,
        limit: req.tenant.quotas[quotaType === 'users' ? 'maxUsers' : quotaType === 'storage' ? 'maxStorage' : 'maxApiCallsPerHour'],
        upgrade: true,
      });
      return;
    }

    // Increment API call counter
    if (quotaType === 'apiCalls') {
      const now = new Date();
      const lastReset = req.tenant.usage?.lastApiCallReset || now;
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

      if (hoursSinceReset >= 1) {
        // Reset counter
        req.tenant.usage = {
          ...req.tenant.usage,
          apiCallsThisHour: 1,
          lastApiCallReset: now,
        } as any;
      } else {
        // Increment counter
        req.tenant.usage = {
          ...req.tenant.usage,
          apiCallsThisHour: (req.tenant.usage?.apiCallsThisHour || 0) + 1,
        } as any;
      }

      await req.tenant.save();
    }

    next();
  };
};

/**
 * IP whitelist middleware
 */
export const enforceIpWhitelist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.tenant) {
    next();
    return;
  }

  try {
    // Get security policy for tenant
    const securityPolicy = await SecurityPolicy.findOne({ tenantId: req.tenant._id });

    if (!securityPolicy) {
      next();
      return;
    }

    // Get client IP
    const clientIp = getClientIp(req);

    // Check if IP is allowed
    if (!securityPolicy.isIpAllowed(clientIp)) {
      res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not authorized to access this tenant',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking IP whitelist:', error);
    next(); // Allow request to proceed on error
  }
};

/**
 * Tenant branding middleware
 * Injects tenant branding into response
 */
export const injectTenantBranding = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.tenant) {
    // Make branding available to response
    res.locals.branding = req.tenant.branding;
    res.locals.tenantName = req.tenant.name;
  }

  next();
};

/**
 * Helper: Extract subdomain from hostname
 */
function extractSubdomain(hostname: string): string | null {
  const parts = hostname.split('.');

  // localhost or IP address
  if (parts.length <= 1 || hostname === 'localhost') {
    return null;
  }

  // Has subdomain (e.g., acme.example.com)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

/**
 * Helper: Get client IP address
 */
function getClientIp(req: Request): string {
  // Try different headers in order of preference
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return ips[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return typeof realIp === 'string' ? realIp : realIp[0];
  }

  return req.socket.remoteAddress || '0.0.0.0';
}
