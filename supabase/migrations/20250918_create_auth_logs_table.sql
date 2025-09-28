-- Create auth_logs table for security monitoring and audit trail
-- Part of Phase 1.1 Authentication Infrastructure

CREATE TABLE IF NOT EXISTS auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_logs_email ON auth_logs(email);
CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON auth_logs(action);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_logs_ip_address ON auth_logs(ip_address);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_auth_logs_email_action ON auth_logs(email, action);
CREATE INDEX IF NOT EXISTS idx_auth_logs_email_created_at ON auth_logs(email, created_at);

-- Enable RLS
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only service role can insert auth logs (for security)
CREATE POLICY "Service role can insert auth logs" ON auth_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Only service role can read auth logs (for security monitoring)
CREATE POLICY "Service role can read auth logs" ON auth_logs
  FOR SELECT USING (auth.role() = 'service_role');

-- No updates or deletes allowed (immutable audit trail)
CREATE POLICY "No updates allowed on auth logs" ON auth_logs
  FOR UPDATE USING (false);

CREATE POLICY "No deletes allowed on auth logs" ON auth_logs
  FOR DELETE USING (false);

-- Add comments for documentation
COMMENT ON TABLE auth_logs IS 'Audit trail for authentication events and security monitoring';
COMMENT ON COLUMN auth_logs.email IS 'Email address associated with the auth event';
COMMENT ON COLUMN auth_logs.action IS 'Type of authentication action (e.g., magic_link_sent, callback_success, logout_success)';
COMMENT ON COLUMN auth_logs.metadata IS 'Additional context data for the auth event';
COMMENT ON COLUMN auth_logs.ip_address IS 'IP address of the client making the request';
COMMENT ON COLUMN auth_logs.user_agent IS 'User agent string from the client request';
COMMENT ON COLUMN auth_logs.created_at IS 'Timestamp when the auth event occurred';
