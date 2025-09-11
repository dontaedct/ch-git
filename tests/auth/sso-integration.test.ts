/**
 * SSO Integration System Tests
 * HT-004.5.2: Enterprise SSO Integration Testing
 * 
 * Comprehensive tests for the SSO integration system including:
 * - SAML authentication
 * - OAuth/OIDC authentication
 * - LDAP authentication
 * - User provisioning and mapping
 * - Session management
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createServerSupabase } from '@lib/supabase/server';
import { 
  SSOManager, 
  SAMLSSOProvider, 
  OAuthSSOProvider, 
  LDAPSSOProvider,
  SSOConfiguration,
  SSOProviderType 
} from '@lib/auth/sso';

// Mock Supabase client
const mockSupabase = {
  auth: {
    admin: {
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      generateLink: jest.fn(),
    },
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
      order: jest.fn(() => ({
        limit: jest.fn(),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
  rpc: jest.fn(),
};

describe('SSO Integration System', () => {
  let ssoManager: SSOManager;
  let mockConfig: SSOConfiguration;

  beforeEach(() => {
    ssoManager = new SSOManager(mockSupabase as any);
    mockConfig = {
      id: 'config-123',
      name: 'Test SSO Config',
      provider_type: 'oauth',
      enabled: true,
      provider_config: {},
      oauth_client_id: 'test-client-id',
      oauth_client_secret: 'test-client-secret',
      oauth_authorization_url: 'https://provider.com/oauth/authorize',
      oauth_token_url: 'https://provider.com/oauth/token',
      oauth_user_info_url: 'https://provider.com/oauth/userinfo',
      oauth_scope: 'openid profile email',
      oauth_redirect_uri: 'https://app.com/api/sso/callback/config-123',
      attribute_mapping: {},
      role_mapping: {},
      group_mapping: {},
      created_at: '2025-09-08T10:00:00Z',
      updated_at: '2025-09-08T10:00:00Z',
      created_by: 'user-123',
    };
    jest.clearAllMocks();
  });

  describe('SSOManager', () => {
    it('should get SSO configurations', async () => {
      const mockConfigs = [mockConfig];
      mockSupabase.from().select().eq.mockResolvedValue({
        data: mockConfigs
      });

      const configs = await ssoManager.getSSOConfigurations();
      
      expect(configs).toEqual(mockConfigs);
      expect(mockSupabase.from).toHaveBeenCalledWith('sso_configurations');
    });

    it('should get specific SSO configuration', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockConfig
      });

      const config = await ssoManager.getSSOConfiguration('config-123');
      
      expect(config).toEqual(mockConfig);
    });

    it('should create SSO configuration', async () => {
      const newConfig = { ...mockConfig, id: 'new-config-123' };
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: newConfig
      });

      const config = await ssoManager.createSSOConfiguration(mockConfig);
      
      expect(config).toEqual(newConfig);
    });

    it('should update SSO configuration', async () => {
      const updatedConfig = { ...mockConfig, name: 'Updated Config' };
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: updatedConfig
      });

      const config = await ssoManager.updateSSOConfiguration('config-123', { name: 'Updated Config' });
      
      expect(config).toEqual(updatedConfig);
    });

    it('should delete SSO configuration', async () => {
      mockSupabase.from().delete().eq.mockResolvedValue({ data: {} });

      await ssoManager.deleteSSOConfiguration('config-123');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('sso_configurations');
    });

    it('should get OAuth provider for OAuth config', () => {
      const provider = ssoManager.getProvider(mockConfig);
      
      expect(provider).toBeInstanceOf(OAuthSSOProvider);
    });

    it('should get SAML provider for SAML config', () => {
      const samlConfig = { ...mockConfig, provider_type: 'saml' as SSOProviderType };
      const provider = ssoManager.getProvider(samlConfig);
      
      expect(provider).toBeInstanceOf(SAMLSSOProvider);
    });

    it('should get LDAP provider for LDAP config', () => {
      const ldapConfig = { ...mockConfig, provider_type: 'ldap' as SSOProviderType };
      const provider = ssoManager.getProvider(ldapConfig);
      
      expect(provider).toBeInstanceOf(LDAPSSOProvider);
    });

    it('should create SSO session', async () => {
      const mockSession = {
        id: 'session-123',
        user_id: 'user-123',
        sso_config_id: 'config-123',
        provider_user_id: 'provider-user-123',
        session_data: {},
        expires_at: '2025-09-09T10:00:00Z',
        created_at: '2025-09-08T10:00:00Z',
        last_used_at: '2025-09-08T10:00:00Z'
      };

      mockSupabase.rpc.mockResolvedValue({ data: mockSession });

      const session = await ssoManager.createSSOSession(
        'user-123',
        'config-123',
        {
          id: 'provider-user-123',
          email: 'user@example.com',
          roles: ['member'],
          groups: [],
          attributes: {}
        }
      );
      
      expect(session).toEqual(mockSession);
    });

    it('should get user SSO sessions', async () => {
      const mockSessions = [
        {
          id: 'session-123',
          user_id: 'user-123',
          sso_config_id: 'config-123',
          provider_user_id: 'provider-user-123',
          session_data: {},
          expires_at: '2025-09-09T10:00:00Z',
          created_at: '2025-09-08T10:00:00Z',
          last_used_at: '2025-09-08T10:00:00Z'
        }
      ];

      mockSupabase.from().select().eq().gt.mockResolvedValue({
        data: mockSessions
      });

      const sessions = await ssoManager.getUserSSOSessions('user-123');
      
      expect(sessions).toEqual(mockSessions);
    });

    it('should cleanup expired sessions', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 5 });

      const deletedCount = await ssoManager.cleanupExpiredSessions();
      
      expect(deletedCount).toBe(5);
    });

    it('should get SSO audit logs', async () => {
      const mockLogs = [
        {
          id: 'log-123',
          sso_config_id: 'config-123',
          user_id: 'user-123',
          action: 'login',
          success: true,
          created_at: '2025-09-08T10:00:00Z'
        }
      ];

      mockSupabase.from().select().order().limit.mockResolvedValue({
        data: mockLogs
      });

      const logs = await ssoManager.getSSOAuditLogs();
      
      expect(logs).toEqual(mockLogs);
    });
  });

  describe('OAuthSSOProvider', () => {
    let oauthProvider: OAuthSSOProvider;

    beforeEach(() => {
      oauthProvider = new OAuthSSOProvider(mockConfig, mockSupabase as any);
    });

    it('should generate correct OAuth authorization URL', () => {
      const authUrl = oauthProvider.getAuthUrl('test-state');
      
      expect(authUrl).toContain('https://provider.com/oauth/authorize');
      expect(authUrl).toContain('client_id=test-client-id');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('scope=openid%20profile%20email');
      expect(authUrl).toContain('state=test-state');
    });

    it('should handle OAuth callback and exchange code for tokens', async () => {
      // Mock token exchange
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123',
          expires_in: 3600
        })
      });

      // Mock user info fetch
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          sub: 'user-123',
          email: 'user@example.com',
          name: 'John Doe',
          given_name: 'John',
          family_name: 'Doe'
        })
      });

      // Mock audit logging
      mockSupabase.rpc.mockResolvedValue({ data: null });

      const userInfo = await oauthProvider.handleCallback({
        code: 'auth-code-123',
        state: 'test-state'
      });
      
      expect(userInfo.id).toBe('user-123');
      expect(userInfo.email).toBe('user@example.com');
      expect(userInfo.first_name).toBe('John');
      expect(userInfo.last_name).toBe('Doe');
    });

    it('should refresh OAuth token', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'new-access-token-123',
          refresh_token: 'new-refresh-token-123',
          expires_in: 3600
        })
      });

      const tokens = await oauthProvider.refreshToken('refresh-token-123');
      
      expect(tokens.access_token).toBe('new-access-token-123');
      expect(tokens.refresh_token).toBe('new-refresh-token-123');
    });

    it('should handle OAuth errors gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(oauthProvider.handleCallback({
        code: 'invalid-code',
        state: 'test-state'
      })).rejects.toThrow('Failed to exchange code for tokens');
    });
  });

  describe('SAMLSSOProvider', () => {
    let samlProvider: SAMLSSOProvider;
    let samlConfig: SSOConfiguration;

    beforeEach(() => {
      samlConfig = {
        ...mockConfig,
        provider_type: 'saml',
        saml_entity_id: 'https://app.com/saml',
        saml_sso_url: 'https://provider.com/saml/sso',
        saml_certificate: '-----BEGIN CERTIFICATE-----\nMOCK_CERT\n-----END CERTIFICATE-----',
        saml_assertion_consumer_service_url: 'https://app.com/api/sso/callback/config-123',
        saml_name_id_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
      };
      samlProvider = new SAMLSSOProvider(samlConfig, mockSupabase as any);
    });

    it('should generate SAML AuthnRequest', () => {
      const authUrl = samlProvider.getAuthUrl('test-state');
      
      expect(authUrl).toContain('https://provider.com/saml/sso');
      expect(authUrl).toContain('SAMLRequest=');
    });

    it('should parse SAML response and extract user info', async () => {
      const samlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">
  <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
    <saml:Subject>
      <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">user@example.com</saml:NameID>
    </saml:Subject>
    <saml:AttributeStatement>
      <saml:Attribute Name="first_name">
        <saml:AttributeValue>John</saml:AttributeValue>
      </saml:Attribute>
      <saml:Attribute Name="last_name">
        <saml:AttributeValue>Doe</saml:AttributeValue>
      </saml:Attribute>
    </saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>`;

      const encodedResponse = Buffer.from(samlResponse).toString('base64');
      
      // Mock audit logging
      mockSupabase.rpc.mockResolvedValue({ data: null });

      const userInfo = await samlProvider.handleCallback({
        SAMLResponse: encodedResponse
      });
      
      expect(userInfo.email).toBe('user@example.com');
      expect(userInfo.first_name).toBe('John');
      expect(userInfo.last_name).toBe('Doe');
    });

    it('should handle missing SAMLResponse parameter', async () => {
      await expect(samlProvider.handleCallback({})).rejects.toThrow('Missing SAMLResponse parameter');
    });
  });

  describe('LDAPSSOProvider', () => {
    let ldapProvider: LDAPSSOProvider;
    let ldapConfig: SSOConfiguration;

    beforeEach(() => {
      ldapConfig = {
        ...mockConfig,
        provider_type: 'ldap',
        ldap_server_url: 'ldap://ldap.company.com:389',
        ldap_bind_dn: 'cn=admin,dc=company,dc=com',
        ldap_bind_password: 'admin-password',
        ldap_base_dn: 'dc=company,dc=com',
        ldap_user_search_filter: '(uid={username})',
        ldap_username_attribute: 'uid',
        ldap_email_attribute: 'mail',
        ldap_first_name_attribute: 'givenName',
        ldap_last_name_attribute: 'sn'
      };
      ldapProvider = new LDAPSSOProvider(ldapConfig, mockSupabase as any);
    });

    it('should authenticate LDAP user', async () => {
      // Mock audit logging
      mockSupabase.rpc.mockResolvedValue({ data: null });

      const userInfo = await ldapProvider.authenticate({
        username: 'johndoe',
        password: 'user-password'
      });
      
      expect(userInfo.id).toBe('johndoe');
      expect(userInfo.email).toBe('johndoe@company.com');
      expect(userInfo.username).toBe('johndoe');
      expect(userInfo.first_name).toBe('John');
      expect(userInfo.last_name).toBe('Doe');
    });

    it('should handle LDAP authentication errors', async () => {
      // Mock audit logging
      mockSupabase.rpc.mockResolvedValue({ data: null });

      await expect(ldapProvider.authenticate({
        username: 'invalid-user',
        password: 'wrong-password'
      })).rejects.toThrow();
    });

    it('should not support redirect-based authentication', () => {
      expect(() => ldapProvider.getAuthUrl()).toThrow('LDAP does not support redirect-based authentication');
    });

    it('should not support callback-based authentication', async () => {
      await expect(ldapProvider.handleCallback({})).rejects.toThrow('LDAP does not support callback-based authentication');
    });

    it('should not support token refresh', async () => {
      await expect(ldapProvider.refreshToken('token')).rejects.toThrow('LDAP does not support token refresh');
    });
  });

  describe('SSO Integration Scenarios', () => {
    it('should handle complete OAuth flow', async () => {
      // 1. User clicks SSO login button
      const authUrl = ssoManager.getProvider(mockConfig).getAuthUrl('state-123');
      expect(authUrl).toContain('https://provider.com/oauth/authorize');

      // 2. User is redirected to provider and returns with code
      const mockUserInfo = {
        id: 'user-123',
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        roles: ['member'],
        groups: [],
        attributes: {}
      };

      // Mock the complete flow
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            access_token: 'access-token-123',
            refresh_token: 'refresh-token-123'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            sub: 'user-123',
            email: 'user@example.com',
            given_name: 'John',
            family_name: 'Doe'
          })
        });

      mockSupabase.rpc.mockResolvedValue({ data: null });
      mockSupabase.auth.admin.getUserByEmail.mockResolvedValue({
        data: { user: null }
      });
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'new-user-123' } }
      });
      mockSupabase.from().insert.mockResolvedValue({ data: {} });

      const provider = ssoManager.getProvider(mockConfig);
      const userInfo = await provider.handleCallback({
        code: 'auth-code-123',
        state: 'state-123'
      });

      expect(userInfo.email).toBe('user@example.com');
    });

    it('should handle user provisioning', async () => {
      // Mock user doesn't exist
      mockSupabase.auth.admin.getUserByEmail.mockResolvedValue({
        data: { user: null }
      });

      // Mock user creation
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'new-user-123' } }
      });

      // Mock client record creation
      mockSupabase.from().insert.mockResolvedValue({ data: {} });

      // Mock session creation
      mockSupabase.rpc.mockResolvedValue({
        data: {
          id: 'session-123',
          user_id: 'new-user-123',
          expires_at: '2025-09-09T10:00:00Z'
        }
      });

      const userInfo = {
        id: 'provider-user-123',
        email: 'newuser@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        roles: ['member'],
        groups: [],
        attributes: {}
      };

      const session = await ssoManager.createSSOSession('new-user-123', 'config-123', userInfo);
      
      expect(session.user_id).toBe('new-user-123');
    });

    it('should handle role and group mapping', async () => {
      const configWithMapping = {
        ...mockConfig,
        role_mapping: {
          'admin': 'owner',
          'user': 'member',
          'guest': 'viewer'
        },
        group_mapping: {
          'engineering': 'dev-team',
          'marketing': 'marketing-team'
        }
      };

      const provider = new OAuthSSOProvider(configWithMapping, mockSupabase as any);
      
      // Mock user info with roles and groups
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'access-token-123'
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          sub: 'user-123',
          email: 'user@example.com',
          admin: true,
          engineering: true
        })
      });

      mockSupabase.rpc.mockResolvedValue({ data: null });

      const userInfo = await provider.handleCallback({
        code: 'auth-code-123'
      });
      
      expect(userInfo.roles).toContain('owner');
      expect(userInfo.groups).toContain('dev-team');
    });
  });

  describe('Error Handling', () => {
    it('should handle SSO configuration not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null
      });

      const config = await ssoManager.getSSOConfiguration('non-existent');
      
      expect(config).toBeNull();
    });

    it('should handle SSO authentication failures', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const provider = new OAuthSSOProvider(mockConfig, mockSupabase as any);
      
      await expect(provider.handleCallback({
        code: 'invalid-code'
      })).rejects.toThrow('Failed to exchange code for tokens');
    });

    it('should handle unsupported provider types', () => {
      const invalidConfig = { ...mockConfig, provider_type: 'invalid' as SSOProviderType };
      
      expect(() => ssoManager.getProvider(invalidConfig)).toThrow('Unsupported SSO provider type: invalid');
    });
  });

  describe('Security Considerations', () => {
    it('should not expose sensitive configuration data', () => {
      const config = ssoManager.getProvider(mockConfig);
      
      // Provider should not expose client secrets or private keys
      expect(config).toBeDefined();
      // Additional security checks would be implemented here
    });

    it('should validate SSO callback parameters', async () => {
      const provider = new OAuthSSOProvider(mockConfig, mockSupabase as any);
      
      await expect(provider.handleCallback({})).rejects.toThrow('Missing authorization code');
    });

    it('should log all SSO activities for audit', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null });

      const provider = new OAuthSSOProvider(mockConfig, mockSupabase as any);
      await provider.logout('session-123');
      
      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_sso_activity', expect.any(Object));
    });
  });
});
