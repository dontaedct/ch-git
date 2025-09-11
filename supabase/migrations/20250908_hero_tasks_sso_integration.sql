-- Hero Tasks SSO Integration Database Schema
-- HT-004.5.2: Enterprise SSO support (SAML, OAuth, LDAP)
-- Created: 2025-09-08T18:35:00.000Z

-- Create SSO provider types
CREATE TYPE sso_provider_type AS ENUM (
  'saml',
  'oauth',
  'ldap',
  'oidc'
);

-- Create SSO configuration table
CREATE TABLE sso_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  provider_type sso_provider_type NOT NULL,
  enabled BOOLEAN DEFAULT false,
  
  -- Provider-specific configuration (JSON)
  provider_config JSONB NOT NULL DEFAULT '{}',
  
  -- SAML-specific fields
  saml_entity_id VARCHAR(500),
  saml_sso_url TEXT,
  saml_certificate TEXT,
  saml_private_key TEXT,
  saml_assertion_consumer_service_url TEXT,
  saml_name_id_format VARCHAR(100),
  
  -- OAuth/OIDC-specific fields
  oauth_client_id VARCHAR(255),
  oauth_client_secret TEXT,
  oauth_authorization_url TEXT,
  oauth_token_url TEXT,
  oauth_user_info_url TEXT,
  oauth_scope VARCHAR(500),
  oauth_redirect_uri TEXT,
  
  -- LDAP-specific fields
  ldap_server_url TEXT,
  ldap_bind_dn TEXT,
  ldap_bind_password TEXT,
  ldap_base_dn TEXT,
  ldap_user_search_filter VARCHAR(500),
  ldap_group_search_filter VARCHAR(500),
  ldap_username_attribute VARCHAR(100),
  ldap_email_attribute VARCHAR(100),
  ldap_first_name_attribute VARCHAR(100),
  ldap_last_name_attribute VARCHAR(100),
  
  -- Common fields
  attribute_mapping JSONB DEFAULT '{}', -- Map provider attributes to user fields
  role_mapping JSONB DEFAULT '{}',      -- Map provider roles to system roles
  group_mapping JSONB DEFAULT '{}',     -- Map provider groups to system teams
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_saml_config CHECK (
    provider_type != 'saml' OR (
      saml_entity_id IS NOT NULL AND
      saml_sso_url IS NOT NULL AND
      saml_certificate IS NOT NULL
    )
  ),
  CONSTRAINT valid_oauth_config CHECK (
    provider_type NOT IN ('oauth', 'oidc') OR (
      oauth_client_id IS NOT NULL AND
      oauth_client_secret IS NOT NULL AND
      oauth_authorization_url IS NOT NULL AND
      oauth_token_url IS NOT NULL
    )
  ),
  CONSTRAINT valid_ldap_config CHECK (
    provider_type != 'ldap' OR (
      ldap_server_url IS NOT NULL AND
      ldap_bind_dn IS NOT NULL AND
      ldap_base_dn IS NOT NULL
    )
  )
);

-- Create SSO user sessions table
CREATE TABLE sso_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sso_config_id UUID REFERENCES sso_configurations(id) ON DELETE CASCADE,
  provider_user_id VARCHAR(255) NOT NULL, -- User ID from the SSO provider
  session_data JSONB DEFAULT '{}',        -- Provider-specific session data
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(sso_config_id, provider_user_id)
);

-- Create SSO audit log table
CREATE TABLE sso_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sso_config_id UUID REFERENCES sso_configurations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- login, logout, token_refresh, error
  provider_user_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create SSO user mappings table (for linking existing users to SSO)
CREATE TABLE sso_user_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sso_config_id UUID REFERENCES sso_configurations(id) ON DELETE CASCADE,
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  provider_username VARCHAR(255),
  auto_provision BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(sso_config_id, provider_user_id),
  UNIQUE(user_id, sso_config_id)
);

-- Create indexes for performance
CREATE INDEX idx_sso_configurations_provider_type ON sso_configurations(provider_type);
CREATE INDEX idx_sso_configurations_enabled ON sso_configurations(enabled);
CREATE INDEX idx_sso_configurations_created_by ON sso_configurations(created_by);

CREATE INDEX idx_sso_user_sessions_user_id ON sso_user_sessions(user_id);
CREATE INDEX idx_sso_user_sessions_sso_config_id ON sso_user_sessions(sso_config_id);
CREATE INDEX idx_sso_user_sessions_provider_user_id ON sso_user_sessions(provider_user_id);
CREATE INDEX idx_sso_user_sessions_expires_at ON sso_user_sessions(expires_at);

CREATE INDEX idx_sso_audit_log_sso_config_id ON sso_audit_log(sso_config_id);
CREATE INDEX idx_sso_audit_log_user_id ON sso_audit_log(user_id);
CREATE INDEX idx_sso_audit_log_action ON sso_audit_log(action);
CREATE INDEX idx_sso_audit_log_created_at ON sso_audit_log(created_at);
CREATE INDEX idx_sso_audit_log_success ON sso_audit_log(success);

CREATE INDEX idx_sso_user_mappings_user_id ON sso_user_mappings(user_id);
CREATE INDEX idx_sso_user_mappings_sso_config_id ON sso_user_mappings(sso_config_id);
CREATE INDEX idx_sso_user_mappings_provider_user_id ON sso_user_mappings(provider_user_id);

-- Enable RLS
ALTER TABLE sso_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_user_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sso_configurations
CREATE POLICY "Admins can manage SSO configurations" ON sso_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view enabled SSO configurations" ON sso_configurations
  FOR SELECT USING (enabled = true);

-- RLS Policies for sso_user_sessions
CREATE POLICY "Users can view their own SSO sessions" ON sso_user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own SSO sessions" ON sso_user_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can manage SSO sessions" ON sso_user_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for sso_audit_log
CREATE POLICY "Admins can view SSO audit logs" ON sso_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "System can insert SSO audit logs" ON sso_audit_log
  FOR INSERT WITH CHECK (true);

-- RLS Policies for sso_user_mappings
CREATE POLICY "Users can view their own SSO mappings" ON sso_user_mappings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage SSO mappings" ON sso_user_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- Functions for SSO operations
CREATE OR REPLACE FUNCTION create_sso_session(
  p_user_id UUID,
  p_sso_config_id UUID,
  p_provider_user_id VARCHAR(255),
  p_session_data JSONB DEFAULT '{}',
  p_expires_in_hours INTEGER DEFAULT 24
) RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  INSERT INTO sso_user_sessions (
    user_id,
    sso_config_id,
    provider_user_id,
    session_data,
    expires_at
  ) VALUES (
    p_user_id,
    p_sso_config_id,
    p_provider_user_id,
    p_session_data,
    NOW() + (p_expires_in_hours || ' hours')::INTERVAL
  ) RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_sso_activity(
  p_sso_config_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_action VARCHAR(100),
  p_provider_user_id VARCHAR(255) DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO sso_audit_log (
    sso_config_id,
    user_id,
    action,
    provider_user_id,
    ip_address,
    user_agent,
    success,
    error_message,
    metadata
  ) VALUES (
    p_sso_config_id,
    p_user_id,
    p_action,
    p_provider_user_id,
    p_ip_address,
    p_user_agent,
    p_success,
    p_error_message,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_expired_sso_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sso_user_sessions 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_sso_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_sso_configurations_updated_at 
  BEFORE UPDATE ON sso_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_sso_updated_at_column();

CREATE TRIGGER update_sso_user_mappings_updated_at 
  BEFORE UPDATE ON sso_user_mappings 
  FOR EACH ROW EXECUTE FUNCTION update_sso_updated_at_column();

-- Trigger to update last_used_at on session access
CREATE OR REPLACE FUNCTION update_sso_session_last_used()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sso_user_sessions_last_used 
  BEFORE UPDATE ON sso_user_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_sso_session_last_used();

-- Comments
COMMENT ON TABLE sso_configurations IS 'SSO provider configurations for SAML, OAuth, OIDC, and LDAP';
COMMENT ON TABLE sso_user_sessions IS 'Active SSO user sessions with provider-specific data';
COMMENT ON TABLE sso_audit_log IS 'Audit trail for all SSO activities and authentication events';
COMMENT ON TABLE sso_user_mappings IS 'Mappings between system users and SSO provider users';

COMMENT ON COLUMN sso_configurations.provider_config IS 'Provider-specific configuration stored as JSON';
COMMENT ON COLUMN sso_configurations.attribute_mapping IS 'Mapping of provider attributes to user fields';
COMMENT ON COLUMN sso_configurations.role_mapping IS 'Mapping of provider roles to system roles';
COMMENT ON COLUMN sso_configurations.group_mapping IS 'Mapping of provider groups to system teams';

COMMENT ON FUNCTION create_sso_session IS 'Create a new SSO user session';
COMMENT ON FUNCTION log_sso_activity IS 'Log SSO activity for audit purposes';
COMMENT ON FUNCTION cleanup_expired_sso_sessions IS 'Clean up expired SSO sessions';
