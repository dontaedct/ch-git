-- Webhook Analytics & Monitoring Schema
-- 
-- This migration creates tables for webhook delivery tracking,
-- analytics, and monitoring functionality.

-- Webhook deliveries table for tracking all webhook attempts
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  status_code INTEGER,
  response_time INTEGER, -- in milliseconds
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  error_code VARCHAR(100),
  request_headers JSONB,
  response_headers JSONB,
  request_body TEXT,
  response_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook idempotency table (already exists, but ensuring it's here)
CREATE TABLE IF NOT EXISTS webhook_idempotency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace VARCHAR(100) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(namespace, event_id)
);

-- Webhook templates table for marketplace
CREATE TABLE IF NOT EXISTS webhook_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  config JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  author_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook integrations table
CREATE TABLE IF NOT EXISTS webhook_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('incoming', 'outgoing', 'bidirectional')),
  requirements JSONB NOT NULL,
  setup_instructions TEXT[] DEFAULT '{}',
  template_id VARCHAR(255),
  documentation_url TEXT,
  support_url TEXT,
  active BOOLEAN DEFAULT true,
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook endpoints configuration table
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  signature_header VARCHAR(100) DEFAULT 'X-Hub-Signature-256',
  signature_prefix VARCHAR(20) DEFAULT 'sha256=',
  max_retries INTEGER DEFAULT 3,
  timeout_ms INTEGER DEFAULT 10000,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook events configuration table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  endpoints TEXT[] DEFAULT '{}',
  payload_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON webhook_deliveries(endpoint);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_success ON webhook_deliveries(success);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_id ON webhook_deliveries(event_id);

CREATE INDEX IF NOT EXISTS idx_webhook_idempotency_namespace_event ON webhook_idempotency(namespace, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_idempotency_expires_at ON webhook_idempotency(expires_at);

CREATE INDEX IF NOT EXISTS idx_webhook_templates_category ON webhook_templates(category);
CREATE INDEX IF NOT EXISTS idx_webhook_templates_provider ON webhook_templates(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_templates_verified ON webhook_templates(verified);

CREATE INDEX IF NOT EXISTS idx_webhook_integrations_provider ON webhook_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_integrations_type ON webhook_integrations(type);
CREATE INDEX IF NOT EXISTS idx_webhook_integrations_active ON webhook_integrations(active);

-- RLS Policies
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role can access all webhook data
CREATE POLICY "Service role can access webhook_deliveries" ON webhook_deliveries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access webhook_idempotency" ON webhook_idempotency
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access webhook_templates" ON webhook_templates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access webhook_integrations" ON webhook_integrations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access webhook_endpoints" ON webhook_endpoints
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access webhook_events" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can read webhook templates and integrations
CREATE POLICY "Authenticated users can read webhook_templates" ON webhook_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read webhook_integrations" ON webhook_integrations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Functions for webhook analytics
CREATE OR REPLACE FUNCTION get_webhook_metrics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_deliveries BIGINT,
  successful_deliveries BIGINT,
  failed_deliveries BIGINT,
  success_rate NUMERIC,
  avg_response_time NUMERIC,
  p95_response_time NUMERIC,
  p99_response_time NUMERIC,
  total_retries BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_deliveries,
    COUNT(*) FILTER (WHERE success = true) as successful_deliveries,
    COUNT(*) FILTER (WHERE success = false) as failed_deliveries,
    ROUND(
      (COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
      2
    ) as success_rate,
    ROUND(AVG(response_time), 2) as avg_response_time,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time), 2) as p95_response_time,
    ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time), 2) as p99_response_time,
    SUM(retry_count) as total_retries
  FROM webhook_deliveries
  WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired idempotency records
CREATE OR REPLACE FUNCTION cleanup_expired_webhook_idempotency()
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

-- Function to get webhook delivery statistics by event type
CREATE OR REPLACE FUNCTION get_webhook_stats_by_event_type(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  event_type VARCHAR(100),
  total_deliveries BIGINT,
  successful_deliveries BIGINT,
  success_rate NUMERIC,
  avg_response_time NUMERIC,
  most_common_error TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wd.event_type,
    COUNT(*) as total_deliveries,
    COUNT(*) FILTER (WHERE wd.success = true) as successful_deliveries,
    ROUND(
      (COUNT(*) FILTER (WHERE wd.success = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
      2
    ) as success_rate,
    ROUND(AVG(wd.response_time), 2) as avg_response_time,
    (
      SELECT error_message 
      FROM webhook_deliveries wd2 
      WHERE wd2.event_type = wd.event_type 
        AND wd2.success = false 
        AND wd2.error_message IS NOT NULL
        AND wd2.created_at BETWEEN start_date AND end_date
      GROUP BY error_message 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as most_common_error
  FROM webhook_deliveries wd
  WHERE wd.created_at BETWEEN start_date AND end_date
  GROUP BY wd.event_type
  ORDER BY total_deliveries DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample webhook templates
INSERT INTO webhook_templates (template_id, name, description, category, provider, config, tags, verified, author_name, author_email) VALUES
(
  'stripe-payment-success',
  'Stripe Payment Success',
  'Handle successful payment events from Stripe',
  'payment',
  'stripe',
  '{
    "urlPattern": "/api/webhooks/stripe",
    "headers": {"Content-Type": "application/json"},
    "hmac": {
      "headerName": "Stripe-Signature",
      "signaturePrefix": "",
      "algorithm": "sha256"
    },
    "eventTypes": ["payment_intent.succeeded", "payment_intent.payment_failed", "invoice.payment_succeeded"],
    "samplePayload": {
      "id": "evt_1234567890",
      "object": "event",
      "type": "payment_intent.succeeded",
      "data": {
        "object": {
          "id": "pi_1234567890",
          "amount": 2000,
          "currency": "usd",
          "status": "succeeded"
        }
      }
    },
    "validation": {
      "requiredFields": ["id", "type", "data"],
      "optionalFields": ["created", "livemode"],
      "fieldTypes": {
        "id": "string",
        "type": "string",
        "data": "object"
      }
    }
  }',
  ARRAY['payment', 'stripe', 'ecommerce'],
  true,
  'Stripe Team',
  'support@stripe.com'
),
(
  'github-push-event',
  'GitHub Push Event',
  'Handle code push events from GitHub repositories',
  'development',
  'github',
  '{
    "urlPattern": "/api/webhooks/github",
    "headers": {"Content-Type": "application/json", "X-GitHub-Event": "push"},
    "hmac": {
      "headerName": "X-Hub-Signature-256",
      "signaturePrefix": "sha256=",
      "algorithm": "sha256"
    },
    "eventTypes": ["push", "pull_request", "issues"],
    "samplePayload": {
      "ref": "refs/heads/main",
      "repository": {
        "name": "my-repo",
        "full_name": "user/my-repo",
        "html_url": "https://github.com/user/my-repo"
      },
      "commits": [
        {
          "id": "abc123",
          "message": "Fix bug in authentication",
          "author": {
            "name": "John Doe",
            "email": "john@example.com"
          }
        }
      ]
    },
    "validation": {
      "requiredFields": ["ref", "repository", "commits"],
      "optionalFields": ["head_commit", "pusher"],
      "fieldTypes": {
        "ref": "string",
        "repository": "object",
        "commits": "array"
      }
    }
  }',
  ARRAY['github', 'git', 'ci-cd', 'development'],
  true,
  'GitHub Team',
  'support@github.com'
);

-- Insert some sample webhook integrations
INSERT INTO webhook_integrations (integration_id, name, description, provider, type, requirements, setup_instructions, template_id, documentation_url, support_url, active, popularity_score) VALUES
(
  'stripe-payments',
  'Stripe Payments Integration',
  'Complete Stripe payment processing with webhook handling',
  'stripe',
  'incoming',
  '{
    "envVars": ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    "apiKeys": ["stripe_secret_key"],
    "permissions": ["read:payments", "write:payments"]
  }',
  ARRAY[
    '1. Create a Stripe account and get your API keys',
    '2. Set up webhook endpoints in Stripe dashboard',
    '3. Configure environment variables',
    '4. Test webhook delivery'
  ],
  'stripe-payment-success',
  'https://stripe.com/docs/webhooks',
  'https://support.stripe.com',
  true,
  95
),
(
  'github-ci-cd',
  'GitHub CI/CD Integration',
  'Automate deployments and notifications with GitHub webhooks',
  'github',
  'incoming',
  '{
    "envVars": ["GITHUB_WEBHOOK_SECRET"],
    "apiKeys": ["github_personal_token"],
    "permissions": ["repo", "workflow"]
  }',
  ARRAY[
    '1. Create a GitHub personal access token',
    '2. Set up webhook in repository settings',
    '3. Configure webhook secret',
    '4. Test with sample events'
  ],
  'github-push-event',
  'https://docs.github.com/en/webhooks',
  'https://support.github.com',
  true,
  88
);

-- Create a scheduled job to clean up expired idempotency records (if pg_cron is available)
-- SELECT cron.schedule('cleanup-webhook-idempotency', '0 2 * * *', 'SELECT cleanup_expired_webhook_idempotency();');
