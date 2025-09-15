/**
 * SSO Management UI Components
 * HT-004.5.2: Enterprise SSO Integration UI
 * 
 * Provides React components for managing SSO configurations and authentication
 */

import React, { useState, useEffect } from 'react';
import { createServerSupabase } from '@lib/supabase/server';
import { SSOConfiguration, SSOManager, SSOProviderType } from '@lib/auth/sso';

interface SSOConfigurationManagerProps {
  onConfigurationChange?: () => void;
}

export function SSOConfigurationManager({ onConfigurationChange }: SSOConfigurationManagerProps) {
  const [supabase] = useState(() => createServerSupabase());
  const [configurations, setConfigurations] = useState<SSOConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SSOConfiguration | null>(null);

  const ssoManager = new SSOManager(supabase);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const configs = await ssoManager.getSSOConfigurations();
      setConfigurations(configs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfiguration = async (configData: Partial<SSOConfiguration>) => {
    try {
      await ssoManager.createSSOConfiguration(configData);
      await loadConfigurations();
      setShowCreateForm(false);
      onConfigurationChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create configuration');
    }
  };

  const handleUpdateConfiguration = async (id: string, updates: Partial<SSOConfiguration>) => {
    try {
      await ssoManager.updateSSOConfiguration(id, updates);
      await loadConfigurations();
      setEditingConfig(null);
      onConfigurationChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
    }
  };

  const handleDeleteConfiguration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SSO configuration?')) {
      return;
    }

    try {
      await ssoManager.deleteSSOConfiguration(id);
      await loadConfigurations();
      onConfigurationChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete configuration');
    }
  };

  const toggleConfiguration = async (id: string, enabled: boolean) => {
    try {
      await ssoManager.updateSSOConfiguration(id, { enabled });
      await loadConfigurations();
      onConfigurationChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle configuration');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">SSO Configurations</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add SSO Provider
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Configurations List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {configurations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No SSO configurations found.</p>
            <p className="mt-2">Click "Add SSO Provider" to create your first configuration.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {configurations.map((config) => (
              <div key={config.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        config.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {config.provider_type.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Created {new Date(config.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleConfiguration(config.id, !config.enabled)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        config.enabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {config.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => setEditingConfig(config)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConfiguration(config.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Forms */}
      {showCreateForm && (
        <SSOConfigurationForm
          onSave={handleCreateConfiguration}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingConfig && (
        <SSOConfigurationForm
          configuration={editingConfig}
          onSave={(updates) => handleUpdateConfiguration(editingConfig.id, updates)}
          onCancel={() => setEditingConfig(null)}
        />
      )}
    </div>
  );
}

interface SSOConfigurationFormProps {
  configuration?: SSOConfiguration;
  onSave: (config: Partial<SSOConfiguration>) => void;
  onCancel: () => void;
}

function SSOConfigurationForm({ configuration, onSave, onCancel }: SSOConfigurationFormProps) {
  const [formData, setFormData] = useState<Partial<SSOConfiguration>>({
    name: '',
    provider_type: 'oauth',
    enabled: false,
    provider_config: {},
    attribute_mapping: {},
    role_mapping: {},
    group_mapping: {},
    ...configuration
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...((prev[parentField as keyof SSOConfiguration] as Record<string, any>) || {}),
        [field]: value
      }
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {configuration ? 'Edit SSO Configuration' : 'Create SSO Configuration'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Configuration Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider Type
            </label>
            <select
              value={formData.provider_type || 'oauth'}
              onChange={(e) => handleInputChange('provider_type', e.target.value as SSOProviderType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="oauth">OAuth 2.0</option>
              <option value="oidc">OpenID Connect</option>
              <option value="saml">SAML 2.0</option>
              <option value="ldap">LDAP</option>
            </select>
          </div>
        </div>

        {/* Provider-specific Configuration */}
        {formData.provider_type === 'oauth' || formData.provider_type === 'oidc' ? (
          <OAuthConfigurationForm
            formData={formData}
            onChange={handleNestedInputChange}
          />
        ) : formData.provider_type === 'saml' ? (
          <SAMLConfigurationForm
            formData={formData}
            onChange={handleNestedInputChange}
          />
        ) : formData.provider_type === 'ldap' ? (
          <LDAPConfigurationForm
            formData={formData}
            onChange={handleNestedInputChange}
          />
        ) : null}

        {/* Attribute Mapping */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attribute Mapping
          </label>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Provider Attribute"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="System Field"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Mapping
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {configuration ? 'Update' : 'Create'} Configuration
          </button>
        </div>
      </form>
    </div>
  );
}

interface ProviderFormProps {
  formData: Partial<SSOConfiguration>;
  onChange: (parentField: string, field: string, value: any) => void;
}

function OAuthConfigurationForm({ formData, onChange }: ProviderFormProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-900">OAuth Configuration</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client ID
          </label>
          <input
            type="text"
            value={formData.oauth_client_id || ''}
            onChange={(e) => onChange('', 'oauth_client_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Secret
          </label>
          <input
            type="password"
            value={formData.oauth_client_secret || ''}
            onChange={(e) => onChange('', 'oauth_client_secret', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Authorization URL
          </label>
          <input
            type="url"
            value={formData.oauth_authorization_url || ''}
            onChange={(e) => onChange('', 'oauth_authorization_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token URL
          </label>
          <input
            type="url"
            value={formData.oauth_token_url || ''}
            onChange={(e) => onChange('', 'oauth_token_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Info URL
          </label>
          <input
            type="url"
            value={formData.oauth_user_info_url || ''}
            onChange={(e) => onChange('', 'oauth_user_info_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scope
          </label>
          <input
            type="text"
            value={formData.oauth_scope || ''}
            onChange={(e) => onChange('', 'oauth_scope', e.target.value)}
            placeholder="openid profile email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function SAMLConfigurationForm({ formData, onChange }: ProviderFormProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-900">SAML Configuration</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entity ID
          </label>
          <input
            type="text"
            value={formData.saml_entity_id || ''}
            onChange={(e) => onChange('', 'saml_entity_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SSO URL
          </label>
          <input
            type="url"
            value={formData.saml_sso_url || ''}
            onChange={(e) => onChange('', 'saml_sso_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certificate
          </label>
          <textarea
            value={formData.saml_certificate || ''}
            onChange={(e) => onChange('', 'saml_certificate', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ACS URL
          </label>
          <input
            type="url"
            value={formData.saml_assertion_consumer_service_url || ''}
            onChange={(e) => onChange('', 'saml_assertion_consumer_service_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name ID Format
          </label>
          <select
            value={formData.saml_name_id_format || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'}
            onChange={(e) => onChange('', 'saml_name_id_format', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">Email Address</option>
            <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">Persistent</option>
            <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:transient">Transient</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function LDAPConfigurationForm({ formData, onChange }: ProviderFormProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-900">LDAP Configuration</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Server URL
          </label>
          <input
            type="url"
            value={formData.ldap_server_url || ''}
            onChange={(e) => onChange('', 'ldap_server_url', e.target.value)}
            placeholder="ldap://ldap.company.com:389"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bind DN
          </label>
          <input
            type="text"
            value={formData.ldap_bind_dn || ''}
            onChange={(e) => onChange('', 'ldap_bind_dn', e.target.value)}
            placeholder="cn=admin,dc=company,dc=com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bind Password
          </label>
          <input
            type="password"
            value={formData.ldap_bind_password || ''}
            onChange={(e) => onChange('', 'ldap_bind_password', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base DN
          </label>
          <input
            type="text"
            value={formData.ldap_base_dn || ''}
            onChange={(e) => onChange('', 'ldap_base_dn', e.target.value)}
            placeholder="dc=company,dc=com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Search Filter
          </label>
          <input
            type="text"
            value={formData.ldap_user_search_filter || ''}
            onChange={(e) => onChange('', 'ldap_user_search_filter', e.target.value)}
            placeholder="(uid={username})"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username Attribute
          </label>
          <input
            type="text"
            value={formData.ldap_username_attribute || 'uid'}
            onChange={(e) => onChange('', 'ldap_username_attribute', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Attribute
          </label>
          <input
            type="text"
            value={formData.ldap_email_attribute || 'mail'}
            onChange={(e) => onChange('', 'ldap_email_attribute', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name Attribute
          </label>
          <input
            type="text"
            value={formData.ldap_first_name_attribute || 'givenName'}
            onChange={(e) => onChange('', 'ldap_first_name_attribute', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * SSO Login Button Component
 */
interface SSOLoginButtonProps {
  configId: string;
  configName: string;
  providerType: SSOProviderType;
  onLogin?: () => void;
}

export function SSOLoginButton({ configId, configName, providerType, onLogin }: SSOLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSSOLogin = async () => {
    try {
      setLoading(true);
      
      // Get SSO authentication URL
      const response = await fetch(`/api/sso/auth/${configId}/url`);
      const data = await response.json();
      
      if (data.auth_url) {
        // Redirect to SSO provider
        window.location.href = data.auth_url;
        onLogin?.();
      } else {
        throw new Error(data.error || 'Failed to get SSO URL');
      }
    } catch (error) {
      console.error('SSO login failed:', error);
      alert('SSO login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (type: SSOProviderType) => {
    switch (type) {
      case 'oauth':
      case 'oidc':
        return '🔐';
      case 'saml':
        return '🏢';
      case 'ldap':
        return '📁';
      default:
        return '🔑';
    }
  };

  return (
    <button
      onClick={handleSSOLogin}
      disabled={loading}
      className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-lg">{getProviderIcon(providerType)}</span>
      <span className="text-sm font-medium text-gray-700">
        {loading ? 'Connecting...' : `Login with ${configName}`}
      </span>
    </button>
  );
}

export default SSOConfigurationManager;
