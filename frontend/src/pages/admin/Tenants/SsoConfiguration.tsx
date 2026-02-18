import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api/client';

export const SsoConfiguration: React.FC = () => {
  const [config, setConfig] = useState<any>({
    enabled: false,
    provider: 'saml',
    saml: {},
    oauth2: {},
    ldap: {},
  });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSsoConfig();
  }, []);

  const fetchSsoConfig = async () => {
    try {
      const response = await apiClient.get('/api/tenant/sso/config');
      setConfig(response.data.config);
    } catch (error) {
      console.error('Error fetching SSO config:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/api/tenant/sso/config', {
        enabled: config.enabled,
        provider: config.provider,
        config: config[config.provider],
      });
      alert('SSO configuration saved successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await apiClient.post('/api/tenant/sso/test');
      alert(response.data.message);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">SSO Configuration</h1>

      {/* Enable SSO */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="w-5 h-5"
          />
          <span className="font-medium">Enable Single Sign-On (SSO)</span>
        </label>
      </div>

      {config.enabled && (
        <>
          {/* Provider Selection */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">SSO Provider</h2>
            <div className="flex gap-4">
              {['saml', 'oauth2', 'ldap'].map((provider) => (
                <button
                  key={provider}
                  onClick={() => setConfig({ ...config, provider })}
                  className={`px-6 py-3 rounded-lg border-2 ${
                    config.provider === provider
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {provider.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* SAML Configuration */}
          {config.provider === 'saml' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">SAML 2.0 Configuration</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Entry Point URL *</label>
                  <input
                    type="url"
                    value={config.saml.entryPoint || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        saml: { ...config.saml, entryPoint: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://idp.example.com/sso/saml"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Issuer *</label>
                  <input
                    type="text"
                    value={config.saml.issuer || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        saml: { ...config.saml, issuer: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="urn:example:sp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Callback URL *</label>
                  <input
                    type="url"
                    value={config.saml.callbackUrl || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        saml: { ...config.saml, callbackUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://yourdomain.com/api/sso/tenant-slug/saml/callback"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Certificate</label>
                  <textarea
                    value={config.saml.cert || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        saml: { ...config.saml, cert: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                    rows={6}
                    placeholder="-----BEGIN CERTIFICATE-----"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OAuth2 Configuration */}
          {config.provider === 'oauth2' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">OAuth 2.0 Configuration</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Provider</label>
                  <select
                    value={config.oauth2.provider || 'google'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        oauth2: { ...config.oauth2, provider: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="google">Google</option>
                    <option value="microsoft">Microsoft</option>
                    <option value="okta">Okta</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Client ID *</label>
                    <input
                      type="text"
                      value={config.oauth2.clientId || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          oauth2: { ...config.oauth2, clientId: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Client Secret *</label>
                    <input
                      type="password"
                      value={config.oauth2.clientSecret || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          oauth2: { ...config.oauth2, clientSecret: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {config.oauth2.provider === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Authorization URL *
                      </label>
                      <input
                        type="url"
                        value={config.oauth2.authorizationUrl || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            oauth2: { ...config.oauth2, authorizationUrl: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Token URL *</label>
                      <input
                        type="url"
                        value={config.oauth2.tokenUrl || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            oauth2: { ...config.oauth2, tokenUrl: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">User Info URL *</label>
                      <input
                        type="url"
                        value={config.oauth2.userInfoUrl || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            oauth2: { ...config.oauth2, userInfoUrl: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* LDAP Configuration */}
          {config.provider === 'ldap' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">LDAP/Active Directory Configuration</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">LDAP URL *</label>
                  <input
                    type="text"
                    value={config.ldap.url || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ldap: { ...config.ldap, url: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="ldaps://ldap.example.com:636"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bind DN *</label>
                    <input
                      type="text"
                      value={config.ldap.bindDn || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          ldap: { ...config.ldap, bindDn: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="cn=admin,dc=example,dc=com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bind Password *</label>
                    <input
                      type="password"
                      value={config.ldap.bindCredentials || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          ldap: { ...config.ldap, bindCredentials: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Search Base *</label>
                  <input
                    type="text"
                    value={config.ldap.searchBase || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ldap: { ...config.ldap, searchBase: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="ou=users,dc=example,dc=com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Search Filter *</label>
                  <input
                    type="text"
                    value={config.ldap.searchFilter || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ldap: { ...config.ldap, searchFilter: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="(uid={{username}})"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {config.enabled && (
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default SsoConfiguration;
