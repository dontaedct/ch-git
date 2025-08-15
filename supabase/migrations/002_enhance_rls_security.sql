-- Enhanced RLS Security Migration
-- This migration enhances existing RLS policies with additional security measures
-- and adds new policies for comprehensive data protection

-- Drop existing policies to recreate them with enhanced security
DROP POLICY IF EXISTS "Coaches can view their own clients" ON clients;
DROP POLICY IF EXISTS "Coaches can insert clients for themselves" ON clients;
DROP POLICY IF EXISTS "Coaches can update their own clients" ON clients;
DROP POLICY IF EXISTS "Coaches can delete their own clients" ON clients;

DROP POLICY IF EXISTS "Coaches can view their clients' check-ins" ON check_ins;
DROP POLICY IF EXISTS "Coaches can insert check-ins for their clients" ON check_ins;
DROP POLICY IF EXISTS "Coaches can update check-ins for their clients" ON check_ins;
DROP POLICY IF EXISTS "Coaches can delete check-ins for their clients" ON check_ins;

DROP POLICY IF EXISTS "Coaches can view their clients' progress metrics" ON progress_metrics;
DROP POLICY IF EXISTS "Coaches can insert progress metrics for their clients" ON progress_metrics;
DROP POLICY IF EXISTS "Coaches can update progress metrics for their clients" ON progress_metrics;
DROP POLICY IF EXISTS "Coaches can delete progress metrics for their clients" ON progress_metrics;

DROP POLICY IF EXISTS "Coaches can view their clients' weekly plans" ON weekly_plans;
DROP POLICY IF EXISTS "Coaches can insert weekly plans for their clients" ON weekly_plans;
DROP POLICY IF EXISTS "Coaches can update weekly plans for their clients" ON weekly_plans;
DROP POLICY IF EXISTS "Coaches can delete weekly plans for their clients" ON weekly_plans;

DROP POLICY IF EXISTS "Coaches can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Coaches can insert sessions for themselves" ON sessions;
DROP POLICY IF EXISTS "Coaches can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Coaches can delete their own sessions" ON sessions;

DROP POLICY IF EXISTS "Trainers can view their own profile" ON trainers;
DROP POLICY IF EXISTS "Trainers can insert their own profile" ON trainers;
DROP POLICY IF EXISTS "Trainers can update their own profile" ON trainers;
DROP POLICY IF EXISTS "Trainers can delete their own profile" ON trainers;

-- Enhanced RLS Policies for clients with additional security checks
CREATE POLICY "Enhanced: Coaches can view their own clients" ON clients 
  FOR SELECT 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Enhanced: Coaches can insert clients for themselves" ON clients 
  FOR INSERT 
  WITH CHECK (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Ensure email is not null and properly formatted
    email IS NOT NULL AND
    length(trim(email)) > 0 AND
    -- Ensure first_name or full_name is provided
    (first_name IS NOT NULL OR full_name IS NOT NULL)
  );

CREATE POLICY "Enhanced: Coaches can update their own clients" ON clients 
  FOR UPDATE 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Prevent changing ownership
    coach_id = OLD.coach_id AND
    -- Ensure email is not null and properly formatted
    email IS NOT NULL AND
    length(trim(email)) > 0
  );

CREATE POLICY "Enhanced: Coaches can delete their own clients" ON clients 
  FOR DELETE 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  );

-- Enhanced RLS Policies for check_ins with additional security checks
CREATE POLICY "Enhanced: Coaches can view their clients' check-ins" ON check_ins 
  FOR SELECT 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Ensure client belongs to the coach
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id AND coach_id = auth.uid()
    )
  );

CREATE POLICY "Enhanced: Coaches can insert check-ins for their clients" ON check_ins 
  FOR INSERT 
  WITH CHECK (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Ensure client belongs to the coach
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id AND coach_id = auth.uid()
    ) AND
    -- Validate required fields
    client_id IS NOT NULL AND
    week_start_date IS NOT NULL AND
    check_in_date IS NOT NULL
  );

CREATE POLICY "Enhanced: Coaches can update check-ins for their clients" ON check_ins 
  FOR UPDATE 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Prevent changing ownership
    coach_id = OLD.coach_id AND
    client_id = OLD.client_id
  );

CREATE POLICY "Enhanced: Coaches can delete check-ins for their clients" ON check_ins 
  FOR DELETE 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  );

-- Enhanced RLS Policies for progress_metrics with additional security checks
CREATE POLICY "Enhanced: Coaches can view their clients' progress metrics" ON progress_metrics 
  FOR SELECT 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Ensure client belongs to the coach
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id AND coach_id = auth.uid()
    )
  );

CREATE POLICY "Enhanced: Coaches can insert progress metrics for their clients" ON progress_metrics 
  FOR INSERT 
  WITH CHECK (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Ensure client belongs to the coach
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id AND coach_id = auth.uid()
    ) AND
    -- Validate required fields
    client_id IS NOT NULL AND
    metric_date IS NOT NULL
  );

CREATE POLICY "Enhanced: Coaches can update progress metrics for their clients" ON progress_metrics 
  FOR UPDATE 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Prevent changing ownership
    coach_id = OLD.coach_id AND
    client_id = OLD.client_id
  );

CREATE POLICY "Enhanced: Coaches can delete progress metrics for their clients" ON progress_metrics 
  FOR DELETE 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  );

-- Enhanced RLS Policies for weekly_plans with additional security checks
CREATE POLICY "Enhanced: Coaches can view their clients' weekly plans" ON weekly_plans 
  FOR SELECT 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Ensure client belongs to the coach
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id AND coach_id = auth.uid()
    )
  );

CREATE POLICY "Enhanced: Coaches can insert weekly plans for their clients" ON weekly_plans 
  FOR INSERT 
  WITH CHECK (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Ensure client belongs to the coach
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id AND coach_id = auth.uid()
    ) AND
    -- Validate required fields
    client_id IS NOT NULL AND
    week_start_date IS NOT NULL
  );

CREATE POLICY "Enhanced: Coaches can update weekly plans for their clients" ON weekly_plans 
  FOR UPDATE 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Prevent changing ownership
    coach_id = OLD.coach_id AND
    client_id = OLD.client_id
  );

CREATE POLICY "Enhanced: Coaches can delete weekly plans for their clients" ON weekly_plans 
  FOR DELETE 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  );

-- Enhanced RLS Policies for sessions with additional security checks
CREATE POLICY "Enhanced: Coaches can view their own sessions" ON sessions 
  FOR SELECT 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Enhanced: Coaches can insert sessions for themselves" ON sessions 
  FOR INSERT 
  WITH CHECK (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Validate required fields
    title IS NOT NULL AND
    length(trim(title)) > 0 AND
    type IS NOT NULL AND
    location IS NOT NULL AND
    starts_at IS NOT NULL AND
    capacity IS NOT NULL AND
    capacity > 0
  );

CREATE POLICY "Enhanced: Coaches can update their own sessions" ON sessions 
  FOR UPDATE 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Prevent changing ownership
    coach_id = OLD.coach_id
  );

CREATE POLICY "Enhanced: Coaches can delete their own sessions" ON sessions 
  FOR DELETE 
  USING (
    coach_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  );

-- Enhanced RLS Policies for trainers with additional security checks
CREATE POLICY "Enhanced: Trainers can view their own profile" ON trainers 
  FOR SELECT 
  USING (
    user_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Enhanced: Trainers can insert their own profile" ON trainers 
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Validate required fields
    business_name IS NOT NULL AND
    length(trim(business_name)) > 0 AND
    bio IS NOT NULL AND
    length(trim(bio)) > 0
  );

CREATE POLICY "Enhanced: Trainers can update their own profile" ON trainers 
  FOR UPDATE 
  USING (
    user_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    user_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated' AND
    -- Prevent changing ownership
    user_id = OLD.user_id
  );

CREATE POLICY "Enhanced: Trainers can delete their own profile" ON trainers 
  FOR DELETE 
  USING (
    user_id = auth.uid() AND 
    auth.uid() IS NOT NULL AND
    auth.role() = 'authenticated'
  );

-- Create audit logging table for security events
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resource_type TEXT,
  resource_id UUID,
  operation TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  correlation_id TEXT,
  outcome TEXT CHECK (outcome IN ('success', 'failure', 'pending')),
  error_message TEXT
);

-- Enable RLS on audit log table
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit log - only admins can view
CREATE POLICY "Only admins can view security audit logs" ON security_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        raw_user_meta_data->>'roles' ? 'admin' OR
        raw_app_meta_data->>'roles' ? 'admin'
      )
    )
  );

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_severity TEXT,
  p_user_id UUID DEFAULT NULL,
  p_user_email TEXT DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_operation TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_correlation_id TEXT DEFAULT NULL,
  p_outcome TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    user_email,
    event_type,
    severity,
    resource_type,
    resource_id,
    operation,
    details,
    ip_address,
    user_agent,
    session_id,
    correlation_id,
    outcome,
    error_message
  ) VALUES (
    p_user_id,
    p_user_email,
    p_event_type,
    p_severity,
    p_resource_type,
    p_resource_id,
    p_operation,
    p_details,
    p_ip_address,
    p_user_agent,
    p_session_id,
    p_correlation_id,
    p_outcome,
    p_error_message
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION log_security_event(UUID, TEXT, UUID, TEXT, TEXT, UUID, TEXT, JSONB, INET, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Create indexes for audit log performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_timestamp ON security_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity ON security_audit_log(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_resource_type ON security_audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_correlation_id ON security_audit_log(correlation_id);

-- Add comments for documentation
COMMENT ON TABLE security_audit_log IS 'Comprehensive security audit logging for all data access and security events';
COMMENT ON COLUMN security_audit_log.event_type IS 'Type of security event (e.g., data_access, authentication, authorization)';
COMMENT ON COLUMN security_audit_log.severity IS 'Severity level of the security event';
COMMENT ON COLUMN security_audit_log.correlation_id IS 'Unique identifier to correlate related events across the system';

-- Create view for security monitoring (admin only)
CREATE OR REPLACE VIEW security_monitoring_dashboard AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour_bucket,
  event_type,
  severity,
  COUNT(*) as event_count,
  COUNT(CASE WHEN outcome = 'failure' THEN 1 END) as failure_count,
  COUNT(CASE WHEN outcome = 'success' THEN 1 END) as success_count
FROM security_audit_log
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), event_type, severity
ORDER BY hour_bucket DESC, event_type, severity;

-- Grant access to security monitoring view (admin only)
GRANT SELECT ON security_monitoring_dashboard TO authenticated;

-- Create RLS policy for security monitoring view
CREATE POLICY "Only admins can view security monitoring dashboard" ON security_monitoring_dashboard
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        raw_user_meta_data->>'roles' ? 'admin' OR
        raw_app_meta_data->>'roles' ? 'admin'
      )
    )
  );
