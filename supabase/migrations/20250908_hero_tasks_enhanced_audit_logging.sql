-- Enhanced Audit Logging System for Hero Tasks
-- HT-004.5.3: Comprehensive audit trail for all task changes and user actions
-- Created: 2025-09-08T19:20:00.000Z

-- Create enhanced audit log table for comprehensive tracking
CREATE TABLE IF NOT EXISTS hero_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User and session information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  
  -- Action details
  action VARCHAR(100) NOT NULL, -- create, read, update, delete, login, logout, etc.
  resource_type VARCHAR(100) NOT NULL, -- task, subtask, action, user, team, etc.
  resource_id UUID,
  resource_name VARCHAR(500), -- Human-readable resource identifier
  
  -- Change tracking
  old_values JSONB, -- Previous values for updates
  new_values JSONB, -- New values for creates/updates
  changed_fields TEXT[], -- Array of field names that changed
  
  -- Context and metadata
  context JSONB DEFAULT '{}', -- Additional context (request ID, trace ID, etc.)
  metadata JSONB DEFAULT '{}', -- Additional metadata
  severity VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
  
  -- Compliance and security
  compliance_category VARCHAR(50), -- gdpr, sox, hipaa, pci, etc.
  data_classification VARCHAR(20) DEFAULT 'internal', -- public, internal, confidential, restricted
  retention_period INTEGER DEFAULT 2555, -- Days (7 years default)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ GENERATED ALWAYS AS (created_at + (retention_period || ' days')::INTERVAL) STORED,
  
  -- Performance optimization
  partition_key DATE GENERATED ALWAYS AS (created_at::DATE) STORED
);

-- Create audit log categories table for better organization
CREATE TABLE IF NOT EXISTS audit_log_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  severity_default VARCHAR(20) DEFAULT 'info',
  retention_period_default INTEGER DEFAULT 2555,
  compliance_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit log filters table for saved queries
CREATE TABLE IF NOT EXISTS audit_log_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filter_criteria JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit log reports table for scheduled reports
CREATE TABLE IF NOT EXISTS audit_log_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_config JSONB NOT NULL, -- Query, format, schedule, etc.
  is_scheduled BOOLEAN DEFAULT false,
  schedule_cron VARCHAR(100), -- Cron expression for scheduled reports
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_hero_audit_log_user_id ON hero_audit_log(user_id);
CREATE INDEX idx_hero_audit_log_action ON hero_audit_log(action);
CREATE INDEX idx_hero_audit_log_resource_type ON hero_audit_log(resource_type);
CREATE INDEX idx_hero_audit_log_resource_id ON hero_audit_log(resource_id);
CREATE INDEX idx_hero_audit_log_created_at ON hero_audit_log(created_at);
CREATE INDEX idx_hero_audit_log_severity ON hero_audit_log(severity);
CREATE INDEX idx_hero_audit_log_compliance_category ON hero_audit_log(compliance_category);
CREATE INDEX idx_hero_audit_log_partition_key ON hero_audit_log(partition_key);
CREATE INDEX idx_hero_audit_log_expires_at ON hero_audit_log(expires_at);

-- Composite indexes for common queries
CREATE INDEX idx_hero_audit_log_user_action ON hero_audit_log(user_id, action);
CREATE INDEX idx_hero_audit_log_resource_action ON hero_audit_log(resource_type, resource_id, action);
CREATE INDEX idx_hero_audit_log_date_severity ON hero_audit_log(created_at, severity);
CREATE INDEX idx_hero_audit_log_compliance_date ON hero_audit_log(compliance_category, created_at);

-- Indexes for audit log filters and reports
CREATE INDEX idx_audit_log_filters_user_id ON audit_log_filters(user_id);
CREATE INDEX idx_audit_log_filters_shared ON audit_log_filters(is_shared);
CREATE INDEX idx_audit_log_reports_user_id ON audit_log_reports(user_id);
CREATE INDEX idx_audit_log_reports_scheduled ON audit_log_reports(is_scheduled, next_run_at);
CREATE INDEX idx_audit_log_reports_active ON audit_log_reports(is_active);

-- Enable RLS
ALTER TABLE hero_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hero_audit_log
CREATE POLICY "Admins can view all audit logs" ON hero_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view their own audit logs" ON hero_audit_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON hero_audit_log
  FOR INSERT WITH CHECK (true);

-- RLS Policies for audit_log_categories
CREATE POLICY "Admins can manage audit categories" ON audit_log_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view audit categories" ON audit_log_categories
  FOR SELECT USING (true);

-- RLS Policies for audit_log_filters
CREATE POLICY "Users can manage their own filters" ON audit_log_filters
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view shared filters" ON audit_log_filters
  FOR SELECT USING (is_shared = true);

-- RLS Policies for audit_log_reports
CREATE POLICY "Users can manage their own reports" ON audit_log_reports
  FOR ALL USING (user_id = auth.uid());

-- Functions for audit logging
CREATE OR REPLACE FUNCTION log_hero_audit_event(
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(100),
  p_resource_id UUID DEFAULT NULL,
  p_resource_name VARCHAR(500) DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_changed_fields TEXT[] DEFAULT NULL,
  p_context JSONB DEFAULT '{}',
  p_metadata JSONB DEFAULT '{}',
  p_severity VARCHAR(20) DEFAULT 'info',
  p_compliance_category VARCHAR(50) DEFAULT NULL,
  p_data_classification VARCHAR(20) DEFAULT 'internal',
  p_retention_period INTEGER DEFAULT 2555,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO hero_audit_log (
    user_id, session_id, action, resource_type, resource_id, resource_name,
    old_values, new_values, changed_fields, context, metadata, severity,
    compliance_category, data_classification, retention_period,
    ip_address, user_agent
  ) VALUES (
    p_user_id, p_session_id, p_action, p_resource_type, p_resource_id, p_resource_name,
    p_old_values, p_new_values, p_changed_fields, p_context, p_metadata, p_severity,
    p_compliance_category, p_data_classification, p_retention_period,
    p_ip_address, p_user_agent
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit log summary
CREATE OR REPLACE FUNCTION get_audit_log_summary(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW(),
  p_user_id UUID DEFAULT NULL,
  p_action VARCHAR(100) DEFAULT NULL,
  p_resource_type VARCHAR(100) DEFAULT NULL,
  p_severity VARCHAR(20) DEFAULT NULL
) RETURNS TABLE (
  action VARCHAR(100),
  resource_type VARCHAR(100),
  count BIGINT,
  last_occurrence TIMESTAMPTZ,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.action,
    al.resource_type,
    COUNT(*) as count,
    MAX(al.created_at) as last_occurrence,
    COUNT(DISTINCT al.user_id) as unique_users
  FROM hero_audit_log al
  WHERE al.created_at BETWEEN p_start_date AND p_end_date
    AND (p_user_id IS NULL OR al.user_id = p_user_id)
    AND (p_action IS NULL OR al.action = p_action)
    AND (p_resource_type IS NULL OR al.resource_type = p_resource_type)
    AND (p_severity IS NULL OR al.severity = p_severity)
  GROUP BY al.action, al.resource_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired audit logs
CREATE OR REPLACE FUNCTION cleanup_expired_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM hero_audit_log 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
) RETURNS TABLE (
  action VARCHAR(100),
  count BIGINT,
  last_activity TIMESTAMPTZ,
  resource_types TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.action,
    COUNT(*) as count,
    MAX(al.created_at) as last_activity,
    ARRAY_AGG(DISTINCT al.resource_type) as resource_types
  FROM hero_audit_log al
  WHERE al.user_id = p_user_id
    AND al.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY al.action
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
  p_hours INTEGER DEFAULT 24,
  p_threshold INTEGER DEFAULT 100
) RETURNS TABLE (
  user_id UUID,
  action VARCHAR(100),
  count BIGINT,
  severity VARCHAR(20),
  first_occurrence TIMESTAMPTZ,
  last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.user_id,
    al.action,
    COUNT(*) as count,
    CASE 
      WHEN COUNT(*) > p_threshold * 2 THEN 'critical'
      WHEN COUNT(*) > p_threshold THEN 'warning'
      ELSE 'info'
    END as severity,
    MIN(al.created_at) as first_occurrence,
    MAX(al.created_at) as last_occurrence
  FROM hero_audit_log al
  WHERE al.created_at >= NOW() - (p_hours || ' hours')::INTERVAL
    AND al.user_id IS NOT NULL
  GROUP BY al.user_id, al.action
  HAVING COUNT(*) > p_threshold
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_audit_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_audit_log_filters_updated_at 
  BEFORE UPDATE ON audit_log_filters 
  FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at_column();

CREATE TRIGGER update_audit_log_reports_updated_at 
  BEFORE UPDATE ON audit_log_reports 
  FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at_column();

-- Insert default audit categories
INSERT INTO audit_log_categories (name, description, severity_default, retention_period_default, compliance_categories) VALUES
('authentication', 'User authentication and authorization events', 'info', 2555, ARRAY['gdpr', 'sox']),
('data_access', 'Data access and viewing events', 'info', 2555, ARRAY['gdpr', 'hipaa']),
('data_modification', 'Data creation, update, and deletion events', 'warning', 2555, ARRAY['gdpr', 'sox', 'hipaa']),
('system_events', 'System-level events and configuration changes', 'warning', 2555, ARRAY['sox']),
('security_events', 'Security-related events and violations', 'error', 2555, ARRAY['gdpr', 'sox', 'hipaa', 'pci']),
('compliance_events', 'Compliance-related events and actions', 'info', 2555, ARRAY['gdpr', 'sox', 'hipaa', 'pci']),
('user_management', 'User account management and role changes', 'warning', 2555, ARRAY['gdpr', 'sox']),
('task_management', 'Task creation, modification, and completion', 'info', 2555, ARRAY['sox']),
('file_operations', 'File upload, download, and management', 'info', 2555, ARRAY['gdpr', 'hipaa']),
('api_usage', 'API calls and external integrations', 'info', 2555, ARRAY['sox']);

-- Comments
COMMENT ON TABLE hero_audit_log IS 'Comprehensive audit trail for all user actions and system events';
COMMENT ON TABLE audit_log_categories IS 'Predefined categories for organizing audit events';
COMMENT ON TABLE audit_log_filters IS 'Saved filter configurations for audit log queries';
COMMENT ON TABLE audit_log_reports IS 'Scheduled audit log reports and exports';

COMMENT ON COLUMN hero_audit_log.old_values IS 'Previous values for update operations';
COMMENT ON COLUMN hero_audit_log.new_values IS 'New values for create/update operations';
COMMENT ON COLUMN hero_audit_log.changed_fields IS 'Array of field names that were modified';
COMMENT ON COLUMN hero_audit_log.context IS 'Additional context information (request ID, trace ID, etc.)';
COMMENT ON COLUMN hero_audit_log.metadata IS 'Additional metadata for the audit event';
COMMENT ON COLUMN hero_audit_log.compliance_category IS 'Compliance framework category (gdpr, sox, hipaa, pci)';
COMMENT ON COLUMN hero_audit_log.data_classification IS 'Data sensitivity classification';
COMMENT ON COLUMN hero_audit_log.retention_period IS 'Number of days to retain this audit log entry';
COMMENT ON COLUMN hero_audit_log.expires_at IS 'Computed expiration date based on retention period';

COMMENT ON FUNCTION log_hero_audit_event IS 'Log a comprehensive audit event with full context';
COMMENT ON FUNCTION get_audit_log_summary IS 'Get summary statistics for audit logs within a date range';
COMMENT ON FUNCTION cleanup_expired_audit_logs IS 'Remove expired audit log entries';
COMMENT ON FUNCTION get_user_activity_summary IS 'Get activity summary for a specific user';
COMMENT ON FUNCTION detect_suspicious_activity IS 'Detect potentially suspicious user activity patterns';
