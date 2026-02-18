# SSO Configuration Guide

## Overview

This guide provides detailed instructions for configuring Single Sign-On (SSO) with various identity providers.

## Table of Contents

1. [SAML 2.0 Configuration](#saml-20-configuration)
2. [OAuth 2.0 / OIDC Configuration](#oauth-20--oidc-configuration)
3. [LDAP / Active Directory Configuration](#ldap--active-directory-configuration)
4. [Testing SSO](#testing-sso)
5. [Troubleshooting](#troubleshooting)

## SAML 2.0 Configuration

### Supported Identity Providers

- Okta
- Azure AD
- OneLogin
- Auth0
- Google Workspace
- Any SAML 2.0 compliant IdP

### Step-by-Step Setup

#### 1. Platform Configuration

1. Login as tenant admin
2. Navigate to **Settings** > **SSO Configuration**
3. Enable SSO and select **SAML 2.0**
4. Fill in the following fields:

| Field | Description | Example |
|-------|-------------|---------|
| Entry Point URL | IdP's SAML SSO URL | `https://idp.example.com/sso/saml` |
| Issuer | Service Provider Entity ID | `urn:acme:learning-platform` |
| Callback URL | Assertion Consumer Service URL | `https://acme.platform.com/api/sso/acme/saml/callback` |
| Certificate | IdP's x509 certificate | `-----BEGIN CERTIFICATE-----...` |

#### 2. IdP-Specific Configurations

##### Okta

1. In Okta Admin Console, go to **Applications** > **Create App Integration**
2. Select **SAML 2.0**
3. Enter application name
4. Configure SAML settings:
   - **Single sign on URL**: `https://your-platform.com/api/sso/{tenant-slug}/saml/callback`
   - **Audience URI (SP Entity ID)**: Your configured issuer
   - **Attribute Statements**:
     - `email`: `user.email`
     - `firstName`: `user.firstName`
     - `lastName`: `user.lastName`
5. Download the certificate
6. Copy the **Identity Provider metadata** URL

##### Azure AD

1. In Azure Portal, go to **Azure Active Directory** > **Enterprise Applications**
2. Click **New application** > **Create your own application**
3. Select **Integrate any other application you don't find in the gallery (Non-gallery)**
4. Go to **Single sign-on** > **SAML**
5. Configure:
   - **Identifier (Entity ID)**: Your configured issuer
   - **Reply URL (ACS URL)**: `https://your-platform.com/api/sso/{tenant-slug}/saml/callback`
6. In **User Attributes & Claims**:
   - `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`: `user.mail`
   - `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname`: `user.givenname`
   - `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname`: `user.surname`
7. Download **Certificate (Base64)**
8. Copy **Login URL** (use as Entry Point)

##### OneLogin

1. Go to **Applications** > **Add App** > **SAML Test Connector (IdP)**
2. Configure:
   - **Audience (EntityID)**: Your configured issuer
   - **Recipient**: `https://your-platform.com/api/sso/{tenant-slug}/saml/callback`
   - **ACS (Consumer) URL**: Same as Recipient
3. In **Parameters**, map:
   - `Email`: Email
   - `FirstName`: First Name
   - `LastName`: Last Name
4. In **SSO** tab, copy:
   - **SAML 2.0 Endpoint (HTTP)**: Use as Entry Point
   - **X.509 Certificate**: Use as Certificate

#### 3. Metadata Exchange

**Export your SP metadata**:

```bash
curl https://your-platform.com/api/sso/{tenant-slug}/saml/metadata
```

Provide this to your IdP administrator or import it directly if supported.

### SAML Assertion Requirements

Your IdP must return these attributes in the SAML response:

```xml
<saml:Attribute Name="email">
  <saml:AttributeValue>user@example.com</saml:AttributeValue>
</saml:Attribute>
<saml:Attribute Name="firstName">
  <saml:AttributeValue>John</saml:AttributeValue>
</saml:Attribute>
<saml:Attribute Name="lastName">
  <saml:AttributeValue>Doe</saml:AttributeValue>
</saml:Attribute>
```

Alternative: Include email in `NameID`:

```xml
<saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
  user@example.com
</saml:NameID>
```

## OAuth 2.0 / OIDC Configuration

### Google OAuth 2.0

#### 1. Create OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Authorized JavaScript origins**: `https://your-platform.com`
   - **Authorized redirect URIs**: `https://your-platform.com/api/sso/{tenant-slug}/oauth2/callback`
7. Copy **Client ID** and **Client Secret**

#### 2. Platform Configuration

```json
{
  "provider": "google",
  "clientId": "123456789.apps.googleusercontent.com",
  "clientSecret": "your-client-secret",
  "callbackUrl": "https://your-platform.com/api/sso/acme/oauth2/callback",
  "scopes": ["openid", "email", "profile"]
}
```

### Microsoft Azure AD OAuth 2.0

#### 1. Register Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: Your application name
   - **Supported account types**: Choose appropriate option
   - **Redirect URI**: `https://your-platform.com/api/sso/{tenant-slug}/oauth2/callback`
5. Copy **Application (client) ID**
6. Go to **Certificates & secrets** > **New client secret**
7. Copy the secret value

#### 2. Platform Configuration

```json
{
  "provider": "microsoft",
  "clientId": "your-application-id",
  "clientSecret": "your-client-secret",
  "callbackUrl": "https://your-platform.com/api/sso/acme/oauth2/callback",
  "scopes": ["openid", "email", "profile", "User.Read"]
}
```

### Okta OAuth 2.0

#### 1. Create App Integration

1. In Okta Admin Console, go to **Applications** > **Applications**
2. Click **Create App Integration**
3. Select **OIDC - OpenID Connect**
4. Select **Web Application**
5. Configure:
   - **App integration name**: Your app name
   - **Sign-in redirect URIs**: `https://your-platform.com/api/sso/{tenant-slug}/oauth2/callback`
   - **Sign-out redirect URIs**: `https://your-platform.com/logout`
6. Copy **Client ID** and **Client Secret**
7. Note your Okta domain

#### 2. Platform Configuration

```json
{
  "provider": "okta",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "authorizationUrl": "https://your-domain.okta.com/oauth2/v1/authorize",
  "tokenUrl": "https://your-domain.okta.com/oauth2/v1/token",
  "userInfoUrl": "https://your-domain.okta.com/oauth2/v1/userinfo",
  "callbackUrl": "https://your-platform.com/api/sso/acme/oauth2/callback",
  "scopes": ["openid", "email", "profile"]
}
```

### Custom OAuth 2.0 Provider

For any OIDC-compliant provider:

```json
{
  "provider": "custom",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "authorizationUrl": "https://provider.com/oauth2/authorize",
  "tokenUrl": "https://provider.com/oauth2/token",
  "userInfoUrl": "https://provider.com/oauth2/userinfo",
  "callbackUrl": "https://your-platform.com/api/sso/acme/oauth2/callback",
  "scopes": ["openid", "email", "profile"]
}
```

## LDAP / Active Directory Configuration

### Prerequisites

- LDAP server accessible from your platform
- Service account with read access
- TLS/SSL enabled (recommended)

### LDAP Configuration

```json
{
  "url": "ldaps://ldap.example.com:636",
  "bindDn": "cn=admin,dc=example,dc=com",
  "bindCredentials": "service-account-password",
  "searchBase": "ou=users,dc=example,dc=com",
  "searchFilter": "(uid={{username}})",
  "usernameField": "uid",
  "emailField": "mail"
}
```

### Active Directory Configuration

```json
{
  "url": "ldaps://ad.example.com:636",
  "bindDn": "CN=Service Account,OU=Service Accounts,DC=example,DC=com",
  "bindCredentials": "service-account-password",
  "searchBase": "OU=Users,DC=example,DC=com",
  "searchFilter": "(sAMAccountName={{username}})",
  "usernameField": "sAMAccountName",
  "emailField": "mail"
}
```

### Search Filter Examples

| Use Case | Filter |
|----------|--------|
| Username login | `(uid={{username}})` |
| Email login | `(mail={{username}})` |
| AD account name | `(sAMAccountName={{username}})` |
| Either username or email | `(|(uid={{username}})(mail={{username}}))` |
| User with specific group | `(&(uid={{username}})(memberOf=cn=users,ou=groups,dc=example,dc=com))` |

### Testing LDAP Connection

Use ldapsearch to test:

```bash
ldapsearch -x -H ldaps://ldap.example.com:636 \
  -D "cn=admin,dc=example,dc=com" \
  -w "password" \
  -b "ou=users,dc=example,dc=com" \
  "(uid=testuser)"
```

## Testing SSO

### Via Platform UI

1. Navigate to **Settings** > **SSO Configuration**
2. Click **Test Connection**
3. Review test results

### Manual Testing

#### SAML

1. Get SSO login URL:
   ```bash
   curl https://your-platform.com/api/sso/{tenant-slug}/login-url
   ```

2. Open URL in browser
3. Complete IdP login
4. Verify successful redirect

#### OAuth2

1. Get SSO login URL (same as SAML)
2. Complete OAuth flow
3. Verify successful redirect

#### LDAP

```bash
curl -X POST https://your-platform.com/api/sso/{tenant-slug}/ldap/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass"
  }'
```

## Troubleshooting

### SAML Issues

#### Invalid SAML Response

**Symptom**: "SAML Response not found" or "Invalid SAML response"

**Solutions**:
- Verify callback URL matches exactly in IdP and platform
- Check IdP is sending response to correct ACS URL
- Verify certificate is correctly formatted
- Check for clock skew between servers

#### Certificate Validation Failed

**Symptom**: "Signature validation failed"

**Solutions**:
- Ensure certificate includes `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`
- Verify certificate hasn't expired
- Check certificate matches the IdP's current certificate

#### Missing Attributes

**Symptom**: "Valid email not found in SAML response"

**Solutions**:
- Verify attribute mapping in IdP
- Check SAML response contains required attributes
- Try using NameID as email fallback

### OAuth2 Issues

#### Redirect URI Mismatch

**Symptom**: "redirect_uri_mismatch" error

**Solutions**:
- Verify callback URL matches exactly in OAuth provider
- Check for trailing slashes
- Ensure HTTPS is used in production

#### Invalid Client

**Symptom**: "invalid_client" error

**Solutions**:
- Verify Client ID and Secret are correct
- Check if credentials were regenerated in provider
- Ensure client is active/enabled

#### Scope Not Granted

**Symptom**: "insufficient_scope" error

**Solutions**:
- Request appropriate scopes for user info
- Grant consent in OAuth provider
- Check provider supports requested scopes

### LDAP Issues

#### Connection Failed

**Symptom**: "LDAP connection timeout" or "Connection refused"

**Solutions**:
- Verify LDAP server is accessible
- Check firewall rules
- Confirm correct port (389 for LDAP, 636 for LDAPS)
- Test with ldapsearch from server

#### Bind Failed

**Symptom**: "Invalid credentials" during bind

**Solutions**:
- Verify bind DN format
- Check service account password
- Confirm service account has read permissions
- Test bind with ldapsearch

#### User Not Found

**Symptom**: "User not found" during search

**Solutions**:
- Verify search base is correct
- Check search filter syntax
- Confirm user exists in directory
- Test search with ldapsearch

## Security Recommendations

1. **Always use HTTPS/TLS** in production
2. **Validate SAML signatures** using certificates
3. **Implement CSRF protection** for OAuth state parameter
4. **Use LDAPS** instead of plain LDAP
5. **Rotate client secrets** regularly
6. **Monitor SSO failures** via audit logs
7. **Implement rate limiting** on SSO endpoints
8. **Test SSO regularly** to catch certificate expirations

## Production Checklist

- [ ] SSO configuration tested successfully
- [ ] Callback URLs use HTTPS
- [ ] Certificates are valid and current
- [ ] Attribute mapping verified
- [ ] Test users can authenticate
- [ ] Audit logging enabled
- [ ] Error handling tested
- [ ] Backup authentication method available
- [ ] Documentation provided to users
- [ ] Support team trained on SSO issues

## Support Resources

- SAML specification: http://docs.oasis-open.org/security/saml/
- OAuth 2.0 RFC: https://tools.ietf.org/html/rfc6749
- OpenID Connect: https://openid.net/specs/openid-connect-core-1_0.html
- LDAP RFC: https://tools.ietf.org/html/rfc4511

For technical support: support@learningplatform.com
