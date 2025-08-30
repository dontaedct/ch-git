-- Migration: Add audit logging and privacy features
-- Task 18: Privacy/consent + audit log
-- Date: 2025-01-27

-- Create audit_log table for tracking user actions and consent
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  coach_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  consent_given BOOLEAN DEFAULT false,
  consent_type TEXT,
  consent_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create consent_records table for tracking consent history
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_text TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add consent fields to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_consent_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS consent_version TEXT DEFAULT '1.0';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_coach_id ON audit_log(coach_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_coach_id ON consent_records(coach_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON consent_records(consent_type);

-- Enable Row Level Security
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_log
CREATE POLICY "Users can view their own audit logs" ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage audit logs" ON audit_log
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for consent_records
CREATE POLICY "Users can view their own consent records" ON consent_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage consent records" ON consent_records
  FOR ALL USING (auth.role() = 'service_role');

-- Add table comments
COMMENT ON TABLE audit_log IS 'Audit trail for user actions and consent tracking';
COMMENT ON TABLE consent_records IS 'Historical record of user consent decisions';
COMMENT ON COLUMN audit_log.action IS 'Action performed (e.g., login, consent_given, data_access)';
COMMENT ON COLUMN audit_log.resource_type IS 'Type of resource affected (e.g., client, session, profile)';
COMMENT ON COLUMN audit_log.consent_given IS 'Whether consent was given for this action';
COMMENT ON COLUMN audit_log.consent_type IS 'Type of consent (marketing, privacy, analytics)';
COMMENT ON COLUMN audit_log.consent_version IS 'Version of consent text when given';

-- Add column comments
COMMENT ON COLUMN clients.marketing_consent IS 'User consent for marketing communications';
COMMENT ON COLUMN clients.privacy_consent IS 'User consent for privacy policy';
COMMENT ON COLUMN clients.consent_version IS 'Version of consent text when consent was given';

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID DEFAULT NULL,
  p_coach_id TEXT DEFAULT NULL,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_consent_given BOOLEAN DEFAULT false,
  p_consent_type TEXT DEFAULT NULL,
  p_consent_version TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO audit_log (
    user_id, coach_id, action, resource_type, resource_id, 
    details, ip_address, user_agent, consent_given, 
    consent_type, consent_version
  ) VALUES (
    p_user_id, p_coach_id, p_action, p_resource_type, p_resource_id,
    p_details, p_ip_address, p_user_agent, p_consent_given,
    p_consent_type, p_consent_version
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record consent
CREATE OR REPLACE FUNCTION record_consent(
  p_user_id UUID DEFAULT NULL,
  p_coach_id TEXT,
  p_consent_type TEXT,
  p_consent_version TEXT,
  p_consent_given BOOLEAN,
  p_consent_text TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_consent_id UUID;
BEGIN
  INSERT INTO consent_records (
    user_id, coach_id, consent_type, consent_version, 
    consent_given, consent_text, ip_address, user_agent
  ) VALUES (
    p_user_id, p_coach_id, p_consent_type, p_consent_version,
    p_consent_given, p_consent_text, p_ip_address, p_user_agent
  ) RETURNING id INTO v_consent_id;
  
  -- Also log as audit event
  PERFORM log_audit_event(
    p_user_id, p_coach_id, 'consent_recorded', 'consent', v_consent_id,
    jsonb_build_object(
      'consent_type', p_consent_type,
      'consent_version', p_consent_version,
      'consent_given', p_consent_given
    ),
    p_ip_address, p_user_agent, p_consent_given, p_consent_type, p_consent_version
  );
  
  RETURN v_consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
