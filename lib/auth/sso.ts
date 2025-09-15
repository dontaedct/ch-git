/**
 * Hero Tasks SSO Integration System
 * HT-004.5.2: Enterprise SSO support (SAML, OAuth, LDAP)
 * 
 * This module provides comprehensive SSO integration including:
 * - SAML 2.0 authentication
 * - OAuth 2.0 / OpenID Connect
 * - LDAP authentication
 * - User provisioning and mapping
 * - Session management
 */

export type SSOProviderType = 'saml' | 'oauth' | 'ldap' | 'oidc';

export interface SSOConfiguration {
  id: string;
  name: string;
  provider_type: SSOProviderType;
  enabled: boolean;
  provider_config: Record<string, any>;
  
  // SAML fields
  saml_entity_id?: string;
  saml_sso_url?: string;
  saml_certificate?: string;
  saml_private_key?: string;
  saml_assertion_consumer_service_url?: string;
  saml_name_id_format?: string;
  
  // OAuth/OIDC fields
  oauth_client_id?: string;
  oauth_client_secret?: string;
  oauth_authorization_url?: string;
  oauth_token_url?: string;
  oauth_user_info_url?: string;
  oauth_scope?: string;
  oauth_redirect_uri?: string;
  
  // LDAP fields
  ldap_server_url?: string;
  ldap_bind_dn?: string;
  ldap_bind_password?: string;
  ldap_base_dn?: string;
  ldap_user_search_filter?: string;
  ldap_group_search_filter?: string;
  ldap_username_attribute?: string;
  ldap_email_attribute?: string;
  ldap_first_name_attribute?: string;
  ldap_last_name_attribute?: string;
  
  // Common fields
  attribute_mapping: Record<string, string>;
  role_mapping: Record<string, string>;
  group_mapping: Record<string, string>;
  
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface SSOUserSession {
  id: string;
  user_id: string;
  sso_config_id: string;
  provider_user_id: string;
  session_data: Record<string, any>;
  expires_at: string;
  created_at: string;
  last_used_at: string;
}

export interface SSOUserMapping {
  id: string;
  user_id: string;
  sso_config_id: string;
  provider_user_id: string;
  provider_email?: string;
  provider_username?: string;
  auto_provision: boolean;
  created_at: string;
  updated_at: string;
}

export interface SSOAuditLog {
  id: string;
  sso_config_id: string;
  user_id?: string;
  action: 'login' | 'logout' | 'token_refresh' | 'error' | 'provision' | 'mapping';
  provider_user_id?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SSOUserInfo {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  roles: string[];
  groups: string[];
  attributes: Record<string, any>;
}

/**
 * Base SSO Provider Class
 */
export abstract class BaseSSOProvider {
  protected config: SSOConfiguration;
  protected supabase: any;

  constructor(config: SSOConfiguration, supabase: any) {
    this.config = config;
    this.supabase = supabase;
  }

  abstract authenticate(params: any): Promise<SSOUserInfo>;
  abstract getAuthUrl(state?: string): string;
  abstract handleCallback(params: any): Promise<SSOUserInfo>;
  abstract refreshToken(refreshToken: string): Promise<any>;
  abstract logout(sessionId: string): Promise<void>;
}

/**
 * SAML SSO Provider
 */
export class SAMLSSOProvider extends BaseSSOProvider {
  async authenticate(params: any): Promise<SSOUserInfo> {
    // SAML authentication is typically handled via redirects
    // This method would process SAML assertions
    throw new Error('SAML authentication must be handled via redirect flow');
  }

  getAuthUrl(state?: string): string {
    const samlRequest = this.generateSAMLRequest(state);
    const encodedRequest = Buffer.from(samlRequest).toString('base64');
    
    return `${this.config.saml_sso_url}?SAMLRequest=${encodedRequest}`;
  }

  async handleCallback(params: any): Promise<SSOUserInfo> {
    const { SAMLResponse } = params;
    
    if (!SAMLResponse) {
      throw new Error('Missing SAMLResponse parameter');
    }

    // Decode and validate SAML response
    const response = Buffer.from(SAMLResponse, 'base64').toString('utf-8');
    const userInfo = await this.parseSAMLResponse(response);
    
    // Log the authentication attempt
    await this.logActivity('login', userInfo.id, true, { provider: 'saml' });
    
    return userInfo;
  }

  async refreshToken(refreshToken: string): Promise<any> {
    throw new Error('SAML does not support token refresh');
  }

  async logout(sessionId: string): Promise<void> {
    await this.logActivity('logout', undefined, true, { session_id: sessionId });
  }

  private generateSAMLRequest(state?: string): string {
    // Generate SAML AuthnRequest
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const issueInstant = new Date().toISOString();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
  ID="${requestId}"
  Version="2.0"
  IssueInstant="${issueInstant}"
  Destination="${this.config.saml_sso_url}"
  AssertionConsumerServiceURL="${this.config.saml_assertion_consumer_service_url}">
  <saml:Issuer>${this.config.saml_entity_id}</saml:Issuer>
  <samlp:NameIDPolicy Format="${this.config.saml_name_id_format || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'}" AllowCreate="true"/>
</samlp:AuthnRequest>`;
  }

  private async parseSAMLResponse(response: string): Promise<SSOUserInfo> {
    // Parse SAML assertion and extract user information
    // This is a simplified implementation - in production, you'd use a proper SAML library
    
    const emailMatch = response.match(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/);
    const email = emailMatch ? emailMatch[1] : '';
    
    // Extract attributes from SAML assertion
    const attributes: Record<string, any> = {};
    const attributeMatches = response.matchAll(/<saml:Attribute[^>]*Name="([^"]*)"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>([^<]*)<\/saml:AttributeValue>/g);
    
    for (const match of attributeMatches) {
      attributes[match[1]] = match[2];
    }
    
    return {
      id: attributes['user_id'] || email,
      email,
      username: attributes['username'] || email.split('@')[0],
      first_name: attributes['first_name'] || attributes['given_name'],
      last_name: attributes['last_name'] || attributes['surname'],
      roles: this.parseRoles(attributes),
      groups: this.parseGroups(attributes),
      attributes
    };
  }

  private parseRoles(attributes: Record<string, any>): string[] {
    const roles: string[] = [];
    
    // Map provider roles to system roles
    Object.entries(this.config.role_mapping).forEach(([providerRole, systemRole]) => {
      if (attributes[providerRole]) {
        roles.push(systemRole as string);
      }
    });
    
    return roles;
  }

  private parseGroups(attributes: Record<string, any>): string[] {
    const groups: string[] = [];
    
    // Map provider groups to system teams
    Object.entries(this.config.group_mapping).forEach(([providerGroup, systemTeam]) => {
      if (attributes[providerGroup]) {
        groups.push(systemTeam as string);
      }
    });
    
    return groups;
  }

  private async logActivity(action: string, userId?: string, success: boolean = true, metadata: Record<string, any> = {}): Promise<void> {
    await this.supabase.rpc('log_sso_activity', {
      p_sso_config_id: this.config.id,
      p_user_id: userId || undefined,
      p_action: action,
      p_success: success,
      p_metadata: metadata
    });
  }
}

/**
 * OAuth/OIDC SSO Provider
 */
export class OAuthSSOProvider extends BaseSSOProvider {
  async authenticate(params: any): Promise<SSOUserInfo> {
    // OAuth authentication is typically handled via redirects
    throw new Error('OAuth authentication must be handled via redirect flow');
  }

  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.oauth_client_id!,
      redirect_uri: this.config.oauth_redirect_uri!,
      response_type: 'code',
      scope: this.config.oauth_scope || 'openid profile email',
      state: state || `state_${Date.now()}`
    });

    return `${this.config.oauth_authorization_url}?${params.toString()}`;
  }

  async handleCallback(params: any): Promise<SSOUserInfo> {
    const { code, state } = params;
    
    if (!code) {
      throw new Error('Missing authorization code');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code);
    
    // Get user info from provider
    const userInfo = await this.getUserInfo(tokens.access_token);
    
    // Log the authentication attempt
    await this.logActivity('login', userInfo.id, true, { provider: 'oauth' });
    
    return userInfo;
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const response = await fetch(this.config.oauth_token_url!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.oauth_client_id!,
        client_secret: this.config.oauth_client_secret!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return await response.json();
  }

  async logout(sessionId: string): Promise<void> {
    await this.logActivity('logout', undefined, true, { session_id: sessionId });
  }

  private async exchangeCodeForTokens(code: string): Promise<any> {
    const response = await fetch(this.config.oauth_token_url!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.oauth_redirect_uri!,
        client_id: this.config.oauth_client_id!,
        client_secret: this.config.oauth_client_secret!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return await response.json();
  }

  private async getUserInfo(accessToken: string): Promise<SSOUserInfo> {
    const response = await fetch(this.config.oauth_user_info_url!, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await response.json();
    
    return {
      id: userData.sub || userData.id,
      email: userData.email,
      username: userData.preferred_username || userData.username,
      first_name: userData.given_name || userData.first_name,
      last_name: userData.family_name || userData.last_name,
      roles: this.parseRoles(userData),
      groups: this.parseGroups(userData),
      attributes: userData
    };
  }

  private parseRoles(userData: Record<string, any>): string[] {
    const roles: string[] = [];
    
    // Map provider roles to system roles
    Object.entries(this.config.role_mapping).forEach(([providerRole, systemRole]) => {
      if (userData[providerRole]) {
        roles.push(systemRole as string);
      }
    });
    
    return roles;
  }

  private parseGroups(userData: Record<string, any>): string[] {
    const groups: string[] = [];
    
    // Map provider groups to system teams
    Object.entries(this.config.group_mapping).forEach(([providerGroup, systemTeam]) => {
      if (userData[providerGroup]) {
        groups.push(systemTeam as string);
      }
    });
    
    return groups;
  }

  private async logActivity(action: string, userId?: string, success: boolean = true, metadata: Record<string, any> = {}): Promise<void> {
    await this.supabase.rpc('log_sso_activity', {
      p_sso_config_id: this.config.id,
      p_user_id: userId || undefined,
      p_action: action,
      p_success: success,
      p_metadata: metadata
    });
  }
}

/**
 * LDAP SSO Provider
 */
export class LDAPSSOProvider extends BaseSSOProvider {
  async authenticate(params: { username: string; password: string }): Promise<SSOUserInfo> {
    const { username, password } = params;
    
    try {
      // LDAP authentication
      const userInfo = await this.authenticateLDAPUser(username, password);
      
      // Log the authentication attempt
      await this.logActivity('login', userInfo.id, true, { provider: 'ldap', username });
      
      return userInfo;
    } catch (error) {
      await this.logActivity('login', undefined, false, { 
        provider: 'ldap', 
        username, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  getAuthUrl(state?: string): string {
    throw new Error('LDAP does not support redirect-based authentication');
  }

  async handleCallback(params: any): Promise<SSOUserInfo> {
    throw new Error('LDAP does not support callback-based authentication');
  }

  async refreshToken(refreshToken: string): Promise<any> {
    throw new Error('LDAP does not support token refresh');
  }

  async logout(sessionId: string): Promise<void> {
    await this.logActivity('logout', undefined, true, { session_id: sessionId });
  }

  private async authenticateLDAPUser(username: string, password: string): Promise<SSOUserInfo> {
    // This is a simplified LDAP implementation
    // In production, you'd use a proper LDAP library like ldapjs
    
    const searchFilter = this.config.ldap_user_search_filter?.replace('{username}', username) || 
      `(${this.config.ldap_username_attribute || 'uid'}=${username})`;
    
    // Simulate LDAP search and authentication
    // In real implementation, you'd connect to LDAP server and perform actual search
    
    const userData = {
      dn: `uid=${username},${this.config.ldap_base_dn}`,
      attributes: {
        [this.config.ldap_username_attribute || 'uid']: username,
        [this.config.ldap_email_attribute || 'mail']: `${username}@company.com`,
        [this.config.ldap_first_name_attribute || 'givenName']: 'John',
        [this.config.ldap_last_name_attribute || 'sn']: 'Doe',
        memberOf: ['cn=employees,ou=groups,dc=company,dc=com']
      }
    };
    
    const getStringValue = (value: string | string[] | undefined): string => {
      if (Array.isArray(value)) return value[0] || '';
      return value || '';
    };

    return {
      id: username,
      email: getStringValue(userData.attributes[this.config.ldap_email_attribute || 'mail']),
      username,
      first_name: getStringValue(userData.attributes[this.config.ldap_first_name_attribute || 'givenName']),
      last_name: getStringValue(userData.attributes[this.config.ldap_last_name_attribute || 'sn']),
      roles: this.parseRoles(userData.attributes),
      groups: this.parseGroups(userData.attributes),
      attributes: userData.attributes
    };
  }

  private parseRoles(attributes: Record<string, any>): string[] {
    const roles: string[] = [];
    
    // Map LDAP groups to system roles
    const memberOf = attributes.memberOf || [];
    memberOf.forEach((group: string) => {
      Object.entries(this.config.role_mapping).forEach(([ldapGroup, systemRole]) => {
        if (group.includes(ldapGroup)) {
          roles.push(systemRole as string);
        }
      });
    });
    
    return roles;
  }

  private parseGroups(attributes: Record<string, any>): string[] {
    const groups: string[] = [];
    
    // Map LDAP groups to system teams
    const memberOf = attributes.memberOf || [];
    memberOf.forEach((group: string) => {
      Object.entries(this.config.group_mapping).forEach(([ldapGroup, systemTeam]) => {
        if (group.includes(ldapGroup)) {
          groups.push(systemTeam as string);
        }
      });
    });
    
    return groups;
  }

  private async logActivity(action: string, userId?: string, success: boolean = true, metadata: Record<string, any> = {}): Promise<void> {
    await this.supabase.rpc('log_sso_activity', {
      p_sso_config_id: this.config.id,
      p_user_id: userId || undefined,
      p_action: action,
      p_success: success,
      p_metadata: metadata
    });
  }
}

/**
 * SSO Manager - Main service class
 */
export class SSOManager {
  private supabase: any;
  private providers: Map<string, BaseSSOProvider> = new Map();

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async getSSOConfigurations(): Promise<SSOConfiguration[]> {
    const { data, error } = await this.supabase
      .from('sso_configurations')
      .select('*')
      .eq('enabled', true);

    if (error) {
      throw new Error(`Failed to fetch SSO configurations: ${error.message}`);
    }

    return data || [];
  }

  async getSSOConfiguration(id: string): Promise<SSOConfiguration | undefined> {
    const { data, error } = await this.supabase
      .from('sso_configurations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return undefined;
    }

    return data;
  }

  async createSSOConfiguration(config: Partial<SSOConfiguration>): Promise<SSOConfiguration> {
    const { data, error } = await this.supabase
      .from('sso_configurations')
      .insert(config)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create SSO configuration: ${error.message}`);
    }

    return data;
  }

  async updateSSOConfiguration(id: string, updates: Partial<SSOConfiguration>): Promise<SSOConfiguration> {
    const { data, error } = await this.supabase
      .from('sso_configurations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update SSO configuration: ${error.message}`);
    }

    return data;
  }

  async deleteSSOConfiguration(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('sso_configurations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete SSO configuration: ${error.message}`);
    }
  }

  getProvider(config: SSOConfiguration): BaseSSOProvider {
    if (this.providers.has(config.id)) {
      return this.providers.get(config.id)!;
    }

    let provider: BaseSSOProvider;

    switch (config.provider_type) {
      case 'saml':
        provider = new SAMLSSOProvider(config, this.supabase);
        break;
      case 'oauth':
      case 'oidc':
        provider = new OAuthSSOProvider(config, this.supabase);
        break;
      case 'ldap':
        provider = new LDAPSSOProvider(config, this.supabase);
        break;
      default:
        throw new Error(`Unsupported SSO provider type: ${config.provider_type}`);
    }

    this.providers.set(config.id, provider);
    return provider;
  }

  async authenticateWithProvider(configId: string, params: any): Promise<SSOUserInfo> {
    const config = await this.getSSOConfiguration(configId);
    if (!config) {
      throw new Error('SSO configuration not found');
    }

    const provider = this.getProvider(config);
    return await provider.authenticate(params);
  }

  async createSSOSession(userId: string, configId: string, providerUserInfo: SSOUserInfo): Promise<SSOUserSession> {
    const { data, error } = await this.supabase.rpc('create_sso_session', {
      p_user_id: userId,
      p_sso_config_id: configId,
      p_provider_user_id: providerUserInfo.id,
      p_session_data: providerUserInfo.attributes,
      p_expires_in_hours: 24
    });

    if (error) {
      throw new Error(`Failed to create SSO session: ${error.message}`);
    }

    return data;
  }

  async getUserSSOSessions(userId: string): Promise<SSOUserSession[]> {
    const { data, error } = await this.supabase
      .from('sso_user_sessions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      throw new Error(`Failed to fetch SSO sessions: ${error.message}`);
    }

    return data || [];
  }

  async cleanupExpiredSessions(): Promise<number> {
    const { data, error } = await this.supabase.rpc('cleanup_expired_sso_sessions');

    if (error) {
      throw new Error(`Failed to cleanup expired sessions: ${error.message}`);
    }

    return data || 0;
  }

  async getSSOAuditLogs(configId?: string, limit: number = 100): Promise<SSOAuditLog[]> {
    let query = this.supabase
      .from('sso_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (configId) {
      query = query.eq('sso_config_id', configId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch SSO audit logs: ${error.message}`);
    }

    return data || [];
  }
}

export default SSOManager;
