-- AI Task Intelligence Analytics Database Schema
-- HT-004.4.1: Database tables for AI intelligence features
-- Created: 2025-09-08T16:17:38.000Z

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- AI Task Suggestions table
CREATE TABLE IF NOT EXISTS ai_task_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context TEXT NOT NULL,
  suggestion_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Dependency Suggestions table
CREATE TABLE IF NOT EXISTS ai_dependency_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES hero_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES hero_tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) NOT NULL CHECK (dependency_type IN ('blocks', 'relates_to', 'conflicts_with')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT NOT NULL,
  evidence TEXT[] DEFAULT '{}',
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id),
  UNIQUE(task_id, depends_on_task_id, dependency_type)
);

-- AI Priority Suggestions table
CREATE TABLE IF NOT EXISTS ai_priority_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES hero_tasks(id) ON DELETE CASCADE,
  suggested_priority VARCHAR(20) NOT NULL CHECK (suggested_priority IN ('critical', 'high', 'medium', 'low')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT NOT NULL,
  factors JSONB NOT NULL DEFAULT '[]',
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(task_id, created_at::date)
);

-- AI Learning Patterns table
CREATE TABLE IF NOT EXISTS ai_learning_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN ('title', 'description', 'tags', 'workflow', 'completion')),
  pattern_data JSONB NOT NULL,
  frequency INTEGER DEFAULT 1,
  success_rate DECIMAL(3,2) DEFAULT 0.5 CHECK (success_rate >= 0 AND success_rate <= 1),
  avg_duration_hours DECIMAL(5,2),
  common_outcomes TEXT[] DEFAULT '{}',
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analytics table for tracking AI feature usage
CREATE TABLE IF NOT EXISTS ai_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type VARCHAR(50) NOT NULL CHECK (feature_type IN ('suggestions', 'dependencies', 'priority', 'learning')),
  action VARCHAR(50) NOT NULL CHECK (action IN ('generated', 'applied', 'dismissed', 'learned')),
  context_data JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Configuration table for user preferences
CREATE TABLE IF NOT EXISTS ai_user_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  enable_suggestions BOOLEAN DEFAULT true,
  enable_dependency_detection BOOLEAN DEFAULT true,
  enable_priority_scoring BOOLEAN DEFAULT true,
  min_confidence_threshold DECIMAL(3,2) DEFAULT 0.7 CHECK (min_confidence_threshold >= 0 AND min_confidence_threshold <= 1),
  max_suggestions_per_task INTEGER DEFAULT 5 CHECK (max_suggestions_per_task > 0),
  learning_enabled BOOLEAN DEFAULT true,
  preferred_task_types TEXT[] DEFAULT '{}',
  preferred_priorities TEXT[] DEFAULT '{}',
  custom_patterns JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_task_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_created_at ON ai_task_suggestions(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_applied ON ai_task_suggestions(applied);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_confidence ON ai_task_suggestions(confidence_score);

CREATE INDEX IF NOT EXISTS idx_ai_dependencies_task_id ON ai_dependency_suggestions(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_dependencies_depends_on ON ai_dependency_suggestions(depends_on_task_id);
CREATE INDEX IF NOT EXISTS idx_ai_dependencies_user_id ON ai_dependency_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_dependencies_applied ON ai_dependency_suggestions(applied);
CREATE INDEX IF NOT EXISTS idx_ai_dependencies_confidence ON ai_dependency_suggestions(confidence_score);

CREATE INDEX IF NOT EXISTS idx_ai_priority_task_id ON ai_priority_suggestions(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_priority_user_id ON ai_priority_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_priority_applied ON ai_priority_suggestions(applied);
CREATE INDEX IF NOT EXISTS idx_ai_priority_confidence ON ai_priority_suggestions(confidence_score);

CREATE INDEX IF NOT EXISTS idx_ai_patterns_type ON ai_learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_frequency ON ai_learning_patterns(frequency);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_success_rate ON ai_learning_patterns(success_rate);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_last_seen ON ai_learning_patterns(last_seen_at);

CREATE INDEX IF NOT EXISTS idx_ai_analytics_user_id ON ai_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_feature_type ON ai_analytics(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_action ON ai_analytics(action);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_created_at ON ai_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_config_user_id ON ai_user_config(user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_ai_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_ai_suggestions_updated_at 
  BEFORE UPDATE ON ai_task_suggestions 
  FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at_column();

CREATE TRIGGER update_ai_dependencies_updated_at 
  BEFORE UPDATE ON ai_dependency_suggestions 
  FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at_column();

CREATE TRIGGER update_ai_priority_updated_at 
  BEFORE UPDATE ON ai_priority_suggestions 
  FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at_column();

CREATE TRIGGER update_ai_patterns_updated_at 
  BEFORE UPDATE ON ai_learning_patterns 
  FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at_column();

CREATE TRIGGER update_ai_config_updated_at 
  BEFORE UPDATE ON ai_user_config 
  FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at_column();

-- Function to update pattern learning
CREATE OR REPLACE FUNCTION update_pattern_learning(
  p_pattern_type VARCHAR(50),
  p_pattern_data JSONB,
  p_success BOOLEAN,
  p_duration_hours DECIMAL(5,2) DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  existing_pattern ai_learning_patterns%ROWTYPE;
BEGIN
  -- Try to find existing pattern
  SELECT * INTO existing_pattern
  FROM ai_learning_patterns
  WHERE pattern_type = p_pattern_type
    AND pattern_data = p_pattern_data
  LIMIT 1;

  IF FOUND THEN
    -- Update existing pattern
    UPDATE ai_learning_patterns
    SET frequency = frequency + 1,
        success_rate = CASE 
          WHEN p_success THEN 
            (success_rate * frequency + 1.0) / (frequency + 1)
          ELSE 
            (success_rate * frequency) / (frequency + 1)
        END,
        avg_duration_hours = CASE 
          WHEN p_duration_hours IS NOT NULL THEN
            (avg_duration_hours * frequency + p_duration_hours) / (frequency + 1)
          ELSE avg_duration_hours
        END,
        last_seen_at = NOW(),
        updated_at = NOW()
    WHERE id = existing_pattern.id;
  ELSE
    -- Insert new pattern
    INSERT INTO ai_learning_patterns (
      pattern_type,
      pattern_data,
      frequency,
      success_rate,
      avg_duration_hours,
      last_seen_at
    ) VALUES (
      p_pattern_type,
      p_pattern_data,
      1,
      CASE WHEN p_success THEN 1.0 ELSE 0.0 END,
      p_duration_hours,
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get AI suggestions analytics
CREATE OR REPLACE FUNCTION get_ai_suggestions_analytics(
  p_user_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  feature_type VARCHAR(50),
  total_generated BIGINT,
  total_applied BIGINT,
  application_rate DECIMAL(5,2),
  avg_confidence DECIMAL(5,2),
  most_common_patterns JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH suggestion_stats AS (
    SELECT 
      'suggestions'::VARCHAR(50) as feature_type,
      COUNT(*) as total_generated,
      COUNT(*) FILTER (WHERE applied = true) as total_applied,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE applied = true)::DECIMAL / COUNT(*)) * 100
        ELSE 0 
      END as application_rate,
      AVG(confidence_score) as avg_confidence,
      jsonb_agg(DISTINCT jsonb_build_object(
        'pattern', suggestion_data->>'title',
        'frequency', 1
      )) as most_common_patterns
    FROM ai_task_suggestions
    WHERE (p_user_id IS NULL OR user_id = p_user_id)
      AND created_at >= NOW() - INTERVAL '1 day' * p_days
  ),
  dependency_stats AS (
    SELECT 
      'dependencies'::VARCHAR(50) as feature_type,
      COUNT(*) as total_generated,
      COUNT(*) FILTER (WHERE applied = true) as total_applied,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE applied = true)::DECIMAL / COUNT(*)) * 100
        ELSE 0 
      END as application_rate,
      AVG(confidence_score) as avg_confidence,
      jsonb_agg(DISTINCT jsonb_build_object(
        'type', dependency_type,
        'frequency', 1
      )) as most_common_patterns
    FROM ai_dependency_suggestions
    WHERE (p_user_id IS NULL OR user_id = p_user_id)
      AND created_at >= NOW() - INTERVAL '1 day' * p_days
  ),
  priority_stats AS (
    SELECT 
      'priority'::VARCHAR(50) as feature_type,
      COUNT(*) as total_generated,
      COUNT(*) FILTER (WHERE applied = true) as total_applied,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE applied = true)::DECIMAL / COUNT(*)) * 100
        ELSE 0 
      END as application_rate,
      AVG(confidence_score) as avg_confidence,
      jsonb_agg(DISTINCT jsonb_build_object(
        'priority', suggested_priority,
        'frequency', 1
      )) as most_common_patterns
    FROM ai_priority_suggestions
    WHERE (p_user_id IS NULL OR user_id = p_user_id)
      AND created_at >= NOW() - INTERVAL '1 day' * p_days
  )
  SELECT * FROM suggestion_stats
  UNION ALL
  SELECT * FROM dependency_stats
  UNION ALL
  SELECT * FROM priority_stats;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE ai_task_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_dependency_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_priority_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI suggestions
CREATE POLICY "Users can view own AI suggestions" ON ai_task_suggestions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI suggestions" ON ai_task_suggestions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI suggestions" ON ai_task_suggestions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI suggestions" ON ai_task_suggestions 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for AI dependencies
CREATE POLICY "Users can view own AI dependencies" ON ai_dependency_suggestions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI dependencies" ON ai_dependency_suggestions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI dependencies" ON ai_dependency_suggestions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI dependencies" ON ai_dependency_suggestions 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for AI priority
CREATE POLICY "Users can view own AI priority suggestions" ON ai_priority_suggestions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI priority suggestions" ON ai_priority_suggestions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI priority suggestions" ON ai_priority_suggestions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI priority suggestions" ON ai_priority_suggestions 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for AI patterns (read-only for users)
CREATE POLICY "Users can view AI patterns" ON ai_learning_patterns 
  FOR SELECT USING (true);

-- RLS Policies for AI analytics
CREATE POLICY "Users can view own AI analytics" ON ai_analytics 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI analytics" ON ai_analytics 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for AI config
CREATE POLICY "Users can view own AI config" ON ai_user_config 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI config" ON ai_user_config 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI config" ON ai_user_config 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI config" ON ai_user_config 
  FOR DELETE USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE ai_task_suggestions IS 'AI-generated task suggestions with confidence scores';
COMMENT ON TABLE ai_dependency_suggestions IS 'AI-detected task dependencies and relationships';
COMMENT ON TABLE ai_priority_suggestions IS 'AI-suggested task priorities with reasoning';
COMMENT ON TABLE ai_learning_patterns IS 'AI learning patterns from task completion data';
COMMENT ON TABLE ai_analytics IS 'Analytics data for AI feature usage and performance';
COMMENT ON TABLE ai_user_config IS 'User-specific AI configuration and preferences';

COMMENT ON COLUMN ai_task_suggestions.confidence_score IS 'AI confidence score (0.0 to 1.0)';
COMMENT ON COLUMN ai_dependency_suggestions.evidence IS 'Evidence supporting the dependency suggestion';
COMMENT ON COLUMN ai_priority_suggestions.factors IS 'JSON array of priority factors and weights';
COMMENT ON COLUMN ai_learning_patterns.pattern_data IS 'JSON data representing the learned pattern';
COMMENT ON COLUMN ai_user_config.min_confidence_threshold IS 'Minimum confidence threshold for AI suggestions';
