-- n8n Reliability Controls Database Schema
-- 
-- This migration creates tables for n8n workflow reliability controls including:
-- - Dead Letter Queue (DLQ) for failed messages
-- - Stripe event ledger for replay protection
-- - Circuit breaker state tracking
-- - Concurrency limit tracking

-- Dead Letter Queue (DLQ) for failed n8n workflow messages
CREATE TABLE IF NOT EXISTS n8n_dlq (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for DLQ queries
CREATE INDEX IF NOT EXISTS idx_n8n_dlq_tenant_id ON n8n_dlq(tenant_id);
CREATE INDEX IF NOT EXISTS idx_n8n_dlq_workflow_name ON n8n_dlq(workflow_name);
CREATE INDEX IF NOT EXISTS idx_n8n_dlq_created_at ON n8n_dlq(created_at);
CREATE INDEX IF NOT EXISTS idx_n8n_dlq_expires_at ON n8n_dlq(expires_at);
CREATE INDEX IF NOT EXISTS idx_n8n_dlq_retry_count ON n8n_dlq(retry_count);

-- Stripe Event Ledger for replay protection
CREATE TABLE IF NOT EXISTS stripe_event_ledger (
  tenant_id TEXT PRIMARY KEY,
  last_processed_event_id TEXT NOT NULL,
  last_processed_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for Stripe event ledger queries
CREATE INDEX IF NOT EXISTS idx_stripe_event_ledger_tenant_id ON stripe_event_ledger(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stripe_event_ledger_last_processed_at ON stripe_event_ledger(last_processed_at);

-- Circuit Breaker State Tracking (optional - can be in-memory)
CREATE TABLE IF NOT EXISTS n8n_circuit_breaker_state (
  tenant_id TEXT PRIMARY KEY,
  state TEXT NOT NULL CHECK (state IN ('CLOSED', 'OPEN', 'HALF_OPEN')),
  failures INTEGER DEFAULT 0,
  last_failure_time TIMESTAMPTZ,
  last_success_time TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for circuit breaker queries
CREATE INDEX IF NOT EXISTS idx_n8n_circuit_breaker_state ON n8n_circuit_breaker_state(state);
CREATE INDEX IF NOT EXISTS idx_n8n_circuit_breaker_updated_at ON n8n_circuit_breaker_state(updated_at);

-- Concurrency Limit Tracking (optional - can be in-memory)
CREATE TABLE IF NOT EXISTS n8n_concurrency_limits (
  tenant_id TEXT PRIMARY KEY,
  max_concurrent INTEGER NOT NULL DEFAULT 5,
  active_executions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for concurrency limit queries
CREATE INDEX IF NOT EXISTS idx_n8n_concurrency_limits_tenant_id ON n8n_concurrency_limits(tenant_id);

-- Tenant Configuration for n8n reliability settings
CREATE TABLE IF NOT EXISTS n8n_tenant_config (
  tenant_id TEXT PRIMARY KEY,
  concurrency_limit INTEGER DEFAULT 5,
  circuit_breaker_threshold INTEGER DEFAULT 10,
  circuit_breaker_window_ms INTEGER DEFAULT 600000, -- 10 minutes
  circuit_breaker_recovery_ms INTEGER DEFAULT 300000, -- 5 minutes
  retry_max_retries INTEGER DEFAULT 3,
  retry_base_delay_ms INTEGER DEFAULT 1000,
  retry_max_delay_ms INTEGER DEFAULT 30000,
  retry_jitter_factor DECIMAL(3,2) DEFAULT 0.1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for tenant config queries
CREATE INDEX IF NOT EXISTS idx_n8n_tenant_config_tenant_id ON n8n_tenant_config(tenant_id);

-- RLS Policies for tenant isolation
ALTER TABLE n8n_dlq ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_event_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_circuit_breaker_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_concurrency_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_tenant_config ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own tenant data
CREATE POLICY "Users can access own tenant n8n data" ON n8n_dlq
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can access own tenant stripe events" ON stripe_event_ledger
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can access own tenant circuit breaker state" ON n8n_circuit_breaker_state
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can access own tenant concurrency limits" ON n8n_concurrency_limits
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can access own tenant config" ON n8n_tenant_config
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id' OR auth.jwt() ->> 'role' = 'admin');

-- Service role can access all data (for system operations)
CREATE POLICY "Service role can access all n8n data" ON n8n_dlq
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all stripe events" ON stripe_event_ledger
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all circuit breaker state" ON n8n_circuit_breaker_state
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all concurrency limits" ON n8n_concurrency_limits
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all tenant config" ON n8n_tenant_config
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Functions for cleanup and maintenance

-- Function to cleanup expired DLQ messages
CREATE OR REPLACE FUNCTION cleanup_expired_n8n_dlq()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM n8n_dlq 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup activity
  INSERT INTO n8n_dlq (tenant_id, workflow_name, payload, error_message, error_code, expires_at)
  VALUES ('system', 'cleanup', 
          jsonb_build_object('deleted_count', deleted_count, 'cleanup_time', NOW()),
          'DLQ cleanup completed', 'CLEANUP', NOW() + INTERVAL '1 hour');
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get DLQ statistics
CREATE OR REPLACE FUNCTION get_n8n_dlq_stats(tenant_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  tenant_id TEXT,
  total_messages BIGINT,
  messages_by_workflow JSONB,
  oldest_message TIMESTAMPTZ,
  newest_message TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dlq.tenant_id,
    COUNT(*) as total_messages,
    jsonb_object_agg(dlq.workflow_name, workflow_count.count) as messages_by_workflow,
    MIN(dlq.created_at) as oldest_message,
    MAX(dlq.created_at) as newest_message
  FROM n8n_dlq dlq
  JOIN (
    SELECT tenant_id, workflow_name, COUNT(*) as count
    FROM n8n_dlq
    GROUP BY tenant_id, workflow_name
  ) workflow_count ON dlq.tenant_id = workflow_count.tenant_id
  WHERE (tenant_filter IS NULL OR dlq.tenant_id = tenant_filter)
  GROUP BY dlq.tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset circuit breaker for a tenant
CREATE OR REPLACE FUNCTION reset_circuit_breaker(tenant_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE n8n_circuit_breaker_state 
  SET 
    state = 'CLOSED',
    failures = 0,
    last_failure_time = NULL,
    last_success_time = NOW(),
    updated_at = NOW()
  WHERE tenant_id = tenant_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get circuit breaker statistics
CREATE OR REPLACE FUNCTION get_circuit_breaker_stats()
RETURNS TABLE (
  tenant_id TEXT,
  state TEXT,
  failures INTEGER,
  last_failure_time TIMESTAMPTZ,
  last_success_time TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cbs.tenant_id,
    cbs.state,
    cbs.failures,
    cbs.last_failure_time,
    cbs.last_success_time,
    cbs.updated_at
  FROM n8n_circuit_breaker_state cbs
  ORDER BY cbs.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get concurrency statistics
CREATE OR REPLACE FUNCTION get_concurrency_stats()
RETURNS TABLE (
  tenant_id TEXT,
  max_concurrent INTEGER,
  active_executions INTEGER,
  utilization_percent DECIMAL(5,2),
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.tenant_id,
    cl.max_concurrent,
    cl.active_executions,
    CASE 
      WHEN cl.max_concurrent > 0 THEN (cl.active_executions::DECIMAL / cl.max_concurrent::DECIMAL) * 100
      ELSE 0
    END as utilization_percent,
    cl.updated_at
  FROM n8n_concurrency_limits cl
  ORDER BY cl.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to cleanup expired DLQ messages (if pg_cron is available)
-- This would typically be set up in the application or via a cron job
-- SELECT cron.schedule('cleanup-n8n-dlq', '0 * * * *', 'SELECT cleanup_expired_n8n_dlq();');

-- Insert default tenant configurations for common tenants
INSERT INTO n8n_tenant_config (tenant_id, concurrency_limit, circuit_breaker_threshold)
VALUES 
  ('default-tenant', 5, 10),
  ('high-volume-tenant', 20, 15),
  ('low-volume-tenant', 2, 5)
ON CONFLICT (tenant_id) DO NOTHING;

-- Create views for easier querying

-- View for DLQ messages with readable format
CREATE OR REPLACE VIEW n8n_dlq_view AS
SELECT 
  id,
  tenant_id,
  workflow_name,
  payload,
  error_message,
  error_code,
  retry_count,
  created_at,
  expires_at,
  EXTRACT(EPOCH FROM (expires_at - NOW())) / 3600 as hours_until_expiry
FROM n8n_dlq
ORDER BY created_at DESC;

-- View for circuit breaker status
CREATE OR REPLACE VIEW n8n_circuit_breaker_view AS
SELECT 
  tenant_id,
  state,
  failures,
  last_failure_time,
  last_success_time,
  updated_at,
  CASE 
    WHEN state = 'OPEN' THEN 'Circuit breaker is OPEN - requests blocked'
    WHEN state = 'HALF_OPEN' THEN 'Circuit breaker is HALF_OPEN - testing recovery'
    ELSE 'Circuit breaker is CLOSED - normal operation'
  END as status_description
FROM n8n_circuit_breaker_state
ORDER BY updated_at DESC;

-- View for concurrency utilization
CREATE OR REPLACE VIEW n8n_concurrency_view AS
SELECT 
  tenant_id,
  max_concurrent,
  active_executions,
  (active_executions::DECIMAL / max_concurrent::DECIMAL) * 100 as utilization_percent,
  updated_at,
  CASE 
    WHEN active_executions >= max_concurrent THEN 'AT_LIMIT'
    WHEN active_executions >= max_concurrent * 0.8 THEN 'HIGH_UTILIZATION'
    ELSE 'NORMAL'
  END as utilization_status
FROM n8n_concurrency_limits
ORDER BY utilization_percent DESC;

-- Grant permissions for service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant read permissions for authenticated users
GRANT SELECT ON n8n_dlq_view TO authenticated;
GRANT SELECT ON n8n_circuit_breaker_view TO authenticated;
GRANT SELECT ON n8n_concurrency_view TO authenticated;
GRANT SELECT ON n8n_tenant_config TO authenticated;

-- Comments for documentation
COMMENT ON TABLE n8n_dlq IS 'Dead Letter Queue for failed n8n workflow messages with TTL-based cleanup';
COMMENT ON TABLE stripe_event_ledger IS 'Stripe event replay protection ledger per tenant';
COMMENT ON TABLE n8n_circuit_breaker_state IS 'Circuit breaker state tracking for tenant isolation';
COMMENT ON TABLE n8n_concurrency_limits IS 'Concurrency limit tracking per tenant';
COMMENT ON TABLE n8n_tenant_config IS 'Tenant-specific n8n reliability configuration';

COMMENT ON FUNCTION cleanup_expired_n8n_dlq() IS 'Cleans up expired DLQ messages and returns count of deleted records';
COMMENT ON FUNCTION get_n8n_dlq_stats(TEXT) IS 'Returns DLQ statistics optionally filtered by tenant';
COMMENT ON FUNCTION reset_circuit_breaker(TEXT) IS 'Resets circuit breaker state for specified tenant';
COMMENT ON FUNCTION get_circuit_breaker_stats() IS 'Returns circuit breaker statistics for all tenants';
COMMENT ON FUNCTION get_concurrency_stats() IS 'Returns concurrency utilization statistics for all tenants';
