-- Performance Monitoring System Migration
-- HT-004.2.5: Performance Monitoring Implementation
-- Created: 2025-09-08

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  client JSONB NOT NULL DEFAULT '{}',
  server JSONB NOT NULL DEFAULT '{}',
  database JSONB NOT NULL DEFAULT '{}',
  environment TEXT NOT NULL DEFAULT 'development',
  version TEXT NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance_alerts table
CREATE TABLE IF NOT EXISTS performance_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('response_time', 'memory_usage', 'cpu_usage', 'error_rate', 'throughput')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'warning', 'critical')),
  message TEXT NOT NULL,
  threshold DECIMAL NOT NULL,
  actual_value DECIMAL NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance_reports table
CREATE TABLE IF NOT EXISTS performance_reports (
  id TEXT PRIMARY KEY,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL,
  summary JSONB NOT NULL DEFAULT '{}',
  trends JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_environment ON performance_metrics(environment);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_timestamp ON performance_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_processed ON performance_alerts(processed);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON performance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_performance_reports_date_range ON performance_reports(start_date, end_date);

-- Create RLS policies
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for performance_metrics
CREATE POLICY "Users can view performance metrics" ON performance_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service can insert performance metrics" ON performance_metrics
  FOR INSERT WITH CHECK (true);

-- RLS policies for performance_alerts
CREATE POLICY "Users can view performance alerts" ON performance_alerts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service can insert performance alerts" ON performance_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update performance alerts" ON performance_alerts
  FOR UPDATE USING (true);

-- RLS policies for performance_reports
CREATE POLICY "Users can view performance reports" ON performance_reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service can insert performance reports" ON performance_reports
  FOR INSERT WITH CHECK (true);

-- Create function to clean up old metrics
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM performance_metrics 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  DELETE FROM performance_alerts 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  DELETE FROM performance_reports 
  WHERE generated_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to get performance summary
CREATE OR REPLACE FUNCTION get_performance_summary(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_metrics', COUNT(*),
    'average_response_time', AVG((client->>'responseTime')::DECIMAL),
    'average_memory_usage', AVG((client->>'memoryUsage')::DECIMAL),
    'average_error_rate', AVG((client->>'errorRate')::DECIMAL),
    'peak_response_time', MAX((client->>'responseTime')::DECIMAL),
    'peak_memory_usage', MAX((client->>'memoryUsage')::DECIMAL),
    'total_alerts', (
      SELECT COUNT(*) FROM performance_alerts 
      WHERE timestamp BETWEEN start_date AND end_date
    )
  ) INTO result
  FROM performance_metrics
  WHERE timestamp BETWEEN start_date AND end_date;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Create function to get performance trends
CREATE OR REPLACE FUNCTION get_performance_trends(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'hour', hour_bucket,
      'average_response_time', AVG((client->>'responseTime')::DECIMAL),
      'average_memory_usage', AVG((client->>'memoryUsage')::DECIMAL),
      'metric_count', COUNT(*)
    )
  ) INTO result
  FROM (
    SELECT 
      DATE_TRUNC('hour', timestamp) as hour_bucket,
      client
    FROM performance_metrics
    WHERE timestamp BETWEEN start_date AND end_date
  ) hourly_data
  GROUP BY hour_bucket
  ORDER BY hour_bucket;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clean up old data
CREATE OR REPLACE FUNCTION trigger_cleanup_performance_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up old metrics every 1000 inserts
  IF (SELECT COUNT(*) FROM performance_metrics) % 1000 = 0 THEN
    PERFORM cleanup_old_performance_metrics();
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_performance_metrics
  AFTER INSERT ON performance_metrics
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_performance_data();

-- Insert initial configuration
INSERT INTO performance_reports (id, start_date, end_date, generated_at, summary, trends, recommendations)
VALUES (
  'initial_config',
  NOW() - INTERVAL '1 day',
  NOW(),
  NOW(),
  '{"total_metrics": 0, "average_response_time": 0, "average_memory_usage": 0, "average_error_rate": 0, "peak_response_time": 0, "peak_memory_usage": 0, "total_alerts": 0}',
  '[]',
  '["Performance monitoring system initialized", "Configure alert thresholds based on your application needs", "Review performance metrics regularly for optimization opportunities"]'
) ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON performance_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON performance_alerts TO authenticated;
GRANT SELECT, INSERT ON performance_reports TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_performance_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_performance_summary(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_performance_trends(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
