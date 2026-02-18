import { Request, Response } from 'express';
import { Tenant } from '../../models/Tenant';
import { User } from '../../models/User';
import { Session } from '../../models/Session';
import { AuditLog } from '../../models/AuditLog';
import { SsoService } from '../../services/sso';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Get SSO login URL
 */
export const getSsoLoginUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantSlug } = req.params;
    const { returnUrl } = req.query;

    const tenant = await Tenant.findOne({ slug: tenantSlug, status: { $ne: 'deleted' } });

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    if (!SsoService.isSsoEnabled(tenant)) {
      res.status(400).json({ error: 'SSO not enabled for this tenant' });
      return;
    }

    const loginUrl = SsoService.getLoginUrl(tenant, returnUrl as string);

    res.json({ loginUrl });
  } catch (error) {
    console.error('Error getting SSO login URL:', error);
    res.status(500).json({ error: 'Failed to get SSO login URL' });
  }
};

/**
 * Handle SAML callback
 */
export const handleSamlCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantSlug } = req.params;
    const { SAMLResponse, RelayState } = req.body;

    const tenant = await Tenant.findOne({ slug: tenantSlug });

    if (!tenant || tenant.ssoConfig.provider !== 'saml') {
      res.status(400).json({ error: 'Invalid SAML configuration' });
      return;
    }

    // Handle SAML callback
    const profile = await SsoService.handleCallback(tenant, { SAMLResponse });

    // Find or create user
    const user = await findOrCreateSsoUser(tenant, profile, 'saml');

    // Create session
    const token = await createUserSession(user, req);

    // Log successful login
    await AuditLog.create({
      tenantId: tenant._id,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'auth.sso.login',
      category: 'auth',
      severity: 'info',
      resource: 'session',
      metadata: { provider: 'saml', ssoId: profile.ssoId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    // Redirect to app with token
    const redirectUrl = RelayState || `/dashboard?token=${token}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('SAML callback error:', error);

    // Log failed login
    const { tenantSlug } = req.params;
    const tenant = await Tenant.findOne({ slug: tenantSlug });

    if (tenant) {
      await AuditLog.create({
        tenantId: tenant._id,
        userId: null as any,
        userEmail: 'unknown',
        userRole: 'unknown',
        action: 'auth.sso.failed',
        category: 'auth',
        severity: 'error',
        resource: 'session',
        metadata: { provider: 'saml' },
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'failure',
      });
    }

    res.status(500).json({ error: 'SAML authentication failed' });
  }
};

/**
 * Handle OAuth2 callback
 */
export const handleOAuth2Callback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantSlug } = req.params;
    const { code, state } = req.query;

    const tenant = await Tenant.findOne({ slug: tenantSlug });

    if (!tenant || tenant.ssoConfig.provider !== 'oauth2') {
      res.status(400).json({ error: 'Invalid OAuth2 configuration' });
      return;
    }

    // Handle OAuth2 callback
    const profile = await SsoService.handleCallback(tenant, { code, state });

    // Find or create user
    const user = await findOrCreateSsoUser(tenant, profile, 'oauth2');

    // Create session
    const token = await createUserSession(user, req);

    // Log successful login
    await AuditLog.create({
      tenantId: tenant._id,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'auth.sso.login',
      category: 'auth',
      severity: 'info',
      resource: 'session',
      metadata: { provider: 'oauth2', ssoId: profile.ssoId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    // Redirect to app with token
    res.redirect(`/dashboard?token=${token}`);
  } catch (error) {
    console.error('OAuth2 callback error:', error);
    res.status(500).json({ error: 'OAuth2 authentication failed' });
  }
};

/**
 * Handle LDAP login
 */
export const handleLdapLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantSlug } = req.params;
    const { username, password } = req.body;

    const tenant = await Tenant.findOne({ slug: tenantSlug });

    if (!tenant || tenant.ssoConfig.provider !== 'ldap') {
      res.status(400).json({ error: 'Invalid LDAP configuration' });
      return;
    }

    // Authenticate with LDAP
    const result = await SsoService.authenticate(tenant, { username, password });

    if (!result.success || !result.user) {
      res.status(401).json({ error: result.error || 'LDAP authentication failed' });
      return;
    }

    // Find or create user
    const user = await findOrCreateSsoUser(tenant, result.user, 'ldap');

    // Create session
    const token = await createUserSession(user, req);

    // Log successful login
    await AuditLog.create({
      tenantId: tenant._id,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'auth.sso.login',
      category: 'auth',
      severity: 'info',
      resource: 'session',
      metadata: { provider: 'ldap', ssoId: result.user.ssoId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('LDAP login error:', error);
    res.status(500).json({ error: 'LDAP authentication failed' });
  }
};

/**
 * Get SAML metadata
 */
export const getSamlMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantSlug } = req.params;

    const tenant = await Tenant.findOne({ slug: tenantSlug });

    if (!tenant || tenant.ssoConfig.provider !== 'saml') {
      res.status(400).json({ error: 'SAML not configured for this tenant' });
      return;
    }

    const metadata = SsoService.getSamlMetadata(tenant);

    res.set('Content-Type', 'application/xml');
    res.send(metadata);
  } catch (error) {
    console.error('Error getting SAML metadata:', error);
    res.status(500).json({ error: 'Failed to get SAML metadata' });
  }
};

/**
 * Helper: Find or create SSO user
 */
async function findOrCreateSsoUser(
  tenant: any,
  profile: any,
  provider: string
): Promise<any> {
  // Try to find existing user by SSO ID
  let user = await User.findOne({
    tenantId: tenant._id,
    ssoProvider: provider,
    ssoId: profile.ssoId,
  });

  // If not found, try by email
  if (!user) {
    user = await User.findOne({
      tenantId: tenant._id,
      email: profile.email,
    });

    // Update existing user with SSO info
    if (user) {
      user.ssoProvider = provider;
      user.ssoId = profile.ssoId;
      await user.save();
    }
  }

  // Create new user if not exists
  if (!user) {
    user = await User.create({
      tenantId: tenant._id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
      role: 'student',
      tenantRole: 'member',
      isEmailVerified: true,
      ssoProvider: provider,
      ssoId: profile.ssoId,
      status: 'active',
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return user;
}

/**
 * Helper: Create user session
 */
async function createUserSession(user: any, req: Request): Promise<string> {
  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Create session record
  await Session.create({
    userId: user._id,
    tenantId: user.tenantId,
    token,
    ipAddress: req.ip,
    userAgent: req.get('user-agent') || '',
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    lastActivityAt: new Date(),
  });

  return token;
}
