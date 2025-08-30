-- Webhook Idempotency Table
-- Prevents duplicate webhook processing and replay attacks

CREATE TABLE IF NOT EXISTS webhook_idempotency (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace TEXT NOT NULL,
  event_id TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint to prevent duplicate processing
CREATE UNIQUE INDEX IF NOT EXISTS webhook_idempotency_unique 
ON webhook_idempotency (namespace, event_id);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS webhook_idempotency_expires_at 
ON webhook_idempotency (expires_at);

-- Index for namespace queries
CREATE INDEX IF NOT EXISTS webhook_idempotency_namespace 
ON webhook_idempotency (namespace);

-- RLS Policy (only service role can access)
ALTER TABLE webhook_idempotency ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access" ON webhook_idempotency
  FOR ALL USING (auth.role() = 'service_role');

-- No access for authenticated users (webhooks are server-to-server)
CREATE POLICY "No user access" ON webhook_idempotency
  FOR ALL USING (false);

-- Function to clean up expired entries (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_webhook_entries()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_idempotency 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION cleanup_expired_webhook_entries() TO service_role;
