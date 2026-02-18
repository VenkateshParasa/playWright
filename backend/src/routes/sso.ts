import express from 'express';
import * as ssoController from '../controllers/ssoController';

const router = express.Router();

// Get SSO login URL
router.get('/:tenantSlug/login-url', ssoController.getSsoLoginUrl);

// SAML endpoints
router.post('/:tenantSlug/saml/callback', ssoController.handleSamlCallback);
router.get('/:tenantSlug/saml/metadata', ssoController.getSamlMetadata);

// OAuth2 endpoints
router.get('/:tenantSlug/oauth2/callback', ssoController.handleOAuth2Callback);

// LDAP endpoints
router.post('/:tenantSlug/ldap/login', ssoController.handleLdapLogin);

export default router;
