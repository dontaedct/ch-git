-- Migration: Create Hero Tasks Analytics Schema
-- HT-004.2.3: Advanced Analytics Dashboard
-- Date: 2025-01-15

-- Create hero_tasks table for task management
CREATE TABLE IF NOT EXISTS hero_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee TEXT,
  tags TEXT[] DEFAULT '{}',
  story_points INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL
);

-- Create sprints table for sprint management
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics_cache table for performance optimization
CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hero_tasks_status ON hero_tasks(status);
CREATE INDEX IF NOT EXISTS idx_hero_tasks_assignee ON hero_tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_hero_tasks_priority ON hero_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_hero_tasks_created_at ON hero_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_hero_tasks_completed_at ON hero_tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_hero_tasks_due_date ON hero_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_hero_tasks_sprint_id ON hero_tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_hero_tasks_tags ON hero_tasks USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_sprints_active ON sprints(is_active);
CREATE INDEX IF NOT EXISTS idx_sprints_dates ON sprints(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE hero_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hero_tasks (allow all operations for now - can be restricted later)
DROP POLICY IF EXISTS "Allow all operations on hero_tasks" ON hero_tasks;
CREATE POLICY "Allow all operations on hero_tasks" ON hero_tasks
  FOR ALL USING (true);

-- RLS Policies for sprints
DROP POLICY IF EXISTS "Allow all operations on sprints" ON sprints;
CREATE POLICY "Allow all operations on sprints" ON sprints
  FOR ALL USING (true);

-- RLS Policies for analytics_cache
DROP POLICY IF EXISTS "Allow all operations on analytics_cache" ON analytics_cache;
CREATE POLICY "Allow all operations on analytics_cache" ON analytics_cache
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_hero_tasks_updated_at ON hero_tasks;
CREATE TRIGGER update_hero_tasks_updated_at
  BEFORE UPDATE ON hero_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sprints_updated_at ON sprints;
CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired analytics cache
CREATE OR REPLACE FUNCTION cleanup_expired_analytics_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to get analytics cache
CREATE OR REPLACE FUNCTION get_analytics_cache(cache_key_param TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT data INTO result 
  FROM analytics_cache 
  WHERE cache_key = cache_key_param 
    AND expires_at > NOW();
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to set analytics cache
CREATE OR REPLACE FUNCTION set_analytics_cache(
  cache_key_param TEXT,
  data_param JSONB,
  ttl_hours INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  INSERT INTO analytics_cache (cache_key, data, expires_at)
  VALUES (cache_key_param, data_param, NOW() + INTERVAL '1 hour' * ttl_hours)
  ON CONFLICT (cache_key) 
  DO UPDATE SET 
    data = EXCLUDED.data,
    expires_at = EXCLUDED.expires_at;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO sprints (name, description, start_date, end_date, total_points, is_active) VALUES
  ('Sprint 1', 'Initial sprint for testing', NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days', 20, false),
  ('Sprint 2', 'Current active sprint', NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days', 25, true),
  ('Sprint 3', 'Future sprint', NOW() + INTERVAL '7 days', NOW() + INTERVAL '21 days', 30, false)
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO hero_tasks (title, description, status, priority, assignee, story_points, sprint_id, created_at, completed_at) VALUES
  ('Setup Analytics Dashboard', 'Implement the analytics dashboard UI', 'completed', 'high', 'developer1', 5, (SELECT id FROM sprints WHERE name = 'Sprint 1'), NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days'),
  ('Create Burndown Charts', 'Build burndown chart visualization', 'completed', 'high', 'developer2', 3, (SELECT id FROM sprints WHERE name = 'Sprint 1'), NOW() - INTERVAL '11 days', NOW() - INTERVAL '9 days'),
  ('Implement Velocity Tracking', 'Add velocity metrics calculation', 'completed', 'medium', 'developer1', 4, (SELECT id FROM sprints WHERE name = 'Sprint 1'), NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'),
  ('Add Productivity Insights', 'Generate productivity recommendations', 'in_progress', 'high', 'developer2', 5, (SELECT id FROM sprints WHERE name = 'Sprint 2'), NOW() - INTERVAL '6 days', NULL),
  ('Mobile Optimization', 'Optimize dashboard for mobile devices', 'pending', 'medium', 'developer1', 3, (SELECT id FROM sprints WHERE name = 'Sprint 2'), NOW() - INTERVAL '5 days', NULL),
  ('Performance Testing', 'Test dashboard performance with large datasets', 'pending', 'low', 'developer2', 2, (SELECT id FROM sprints WHERE name = 'Sprint 2'), NOW() - INTERVAL '4 days', NULL),
  ('User Feedback Integration', 'Add user feedback collection', 'pending', 'medium', 'developer1', 4, (SELECT id FROM sprints WHERE name = 'Sprint 3'), NOW() - INTERVAL '3 days', NULL),
  ('Advanced Filtering', 'Implement advanced filtering options', 'pending', 'low', 'developer2', 3, (SELECT id FROM sprints WHERE name = 'Sprint 3'), NOW() - INTERVAL '2 days', NULL)
ON CONFLICT DO NOTHING;

-- Add table comments
COMMENT ON TABLE hero_tasks IS 'Hero Tasks system for task management and analytics';
COMMENT ON TABLE sprints IS 'Sprint management for agile development';
COMMENT ON TABLE analytics_cache IS 'Cache for analytics data to improve performance';

-- Add column comments
COMMENT ON COLUMN hero_tasks.story_points IS 'Story points for velocity tracking';
COMMENT ON COLUMN hero_tasks.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN sprints.is_active IS 'Whether this sprint is currently active';
COMMENT ON COLUMN analytics_cache.cache_key IS 'Unique key for cache lookup';
COMMENT ON COLUMN analytics_cache.data IS 'Cached analytics data in JSON format';
COMMENT ON COLUMN analytics_cache.expires_at IS 'When this cache entry expires';
