-- Natural Language Processing Analytics Database Schema
-- HT-004.4.2: Database tables for NLP features and analytics
-- Created: 2025-09-08T16:17:38.000Z

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- NLP Processing History table
CREATE TABLE IF NOT EXISTS nlp_processing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  parse_result JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  intent_action VARCHAR(50) NOT NULL,
  entities_count INTEGER DEFAULT 0,
  suggestions_count INTEGER DEFAULT 0,
  task_created BOOLEAN DEFAULT false,
  task_id UUID REFERENCES hero_tasks(id) ON DELETE SET NULL,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NLP Entity Patterns table for learning
CREATE TABLE IF NOT EXISTS nlp_entity_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  pattern_text TEXT NOT NULL,
  pattern_regex TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.8 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  usage_count INTEGER DEFAULT 1,
  success_rate DECIMAL(3,2) DEFAULT 0.8 CHECK (success_rate >= 0 AND success_rate <= 1),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NLP Intent Patterns table
CREATE TABLE IF NOT EXISTS nlp_intent_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intent_action VARCHAR(50) NOT NULL,
  pattern_text TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  confidence_score DECIMAL(3,2) DEFAULT 0.8 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  usage_count INTEGER DEFAULT 1,
  success_rate DECIMAL(3,2) DEFAULT 0.8 CHECK (success_rate >= 0 AND success_rate <= 1),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NLP User Preferences table
CREATE TABLE IF NOT EXISTS nlp_user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language VARCHAR(10) DEFAULT 'en',
  auto_create_tasks BOOLEAN DEFAULT false,
  min_confidence_threshold DECIMAL(3,2) DEFAULT 0.7 CHECK (min_confidence_threshold >= 0 AND min_confidence_threshold <= 1),
  enable_suggestions BOOLEAN DEFAULT true,
  enable_entity_extraction BOOLEAN DEFAULT true,
  enable_intent_recognition BOOLEAN DEFAULT true,
  custom_patterns JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NLP Analytics table for tracking usage
CREATE TABLE IF NOT EXISTS nlp_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('parse', 'create_task', 'extract_entities', 'recognize_intent')),
  input_length INTEGER,
  processing_time_ms INTEGER,
  confidence_score DECIMAL(3,2),
  entities_extracted INTEGER DEFAULT 0,
  suggestions_generated INTEGER DEFAULT 0,
  task_created BOOLEAN DEFAULT false,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NLP Feedback table for improving accuracy
CREATE TABLE IF NOT EXISTS nlp_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  processing_id UUID REFERENCES nlp_processing_history(id) ON DELETE CASCADE,
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('correct', 'incorrect', 'partial', 'suggestion')),
  feedback_data JSONB NOT NULL,
  user_corrections JSONB DEFAULT '{}',
  improvement_suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_nlp_history_user_id ON nlp_processing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_nlp_history_created_at ON nlp_processing_history(created_at);
CREATE INDEX IF NOT EXISTS idx_nlp_history_confidence ON nlp_processing_history(confidence_score);
CREATE INDEX IF NOT EXISTS idx_nlp_history_intent ON nlp_processing_history(intent_action);
CREATE INDEX IF NOT EXISTS idx_nlp_history_task_created ON nlp_processing_history(task_created);

CREATE INDEX IF NOT EXISTS idx_nlp_entity_patterns_type ON nlp_entity_patterns(entity_type);
CREATE INDEX IF NOT EXISTS idx_nlp_entity_patterns_usage ON nlp_entity_patterns(usage_count);
CREATE INDEX IF NOT EXISTS idx_nlp_entity_patterns_success ON nlp_entity_patterns(success_rate);
CREATE INDEX IF NOT EXISTS idx_nlp_entity_patterns_last_used ON nlp_entity_patterns(last_used_at);

CREATE INDEX IF NOT EXISTS idx_nlp_intent_patterns_action ON nlp_intent_patterns(intent_action);
CREATE INDEX IF NOT EXISTS idx_nlp_intent_patterns_usage ON nlp_intent_patterns(usage_count);
CREATE INDEX IF NOT EXISTS idx_nlp_intent_patterns_success ON nlp_intent_patterns(success_rate);
CREATE INDEX IF NOT EXISTS idx_nlp_intent_patterns_last_used ON nlp_intent_patterns(last_used_at);

CREATE INDEX IF NOT EXISTS idx_nlp_user_preferences_user_id ON nlp_user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_nlp_analytics_user_id ON nlp_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_nlp_analytics_action_type ON nlp_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_nlp_analytics_created_at ON nlp_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_nlp_analytics_success ON nlp_analytics(success);

CREATE INDEX IF NOT EXISTS idx_nlp_feedback_user_id ON nlp_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_nlp_feedback_processing_id ON nlp_feedback(processing_id);
CREATE INDEX IF NOT EXISTS idx_nlp_feedback_type ON nlp_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_nlp_feedback_created_at ON nlp_feedback(created_at);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_nlp_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_nlp_history_updated_at 
  BEFORE UPDATE ON nlp_processing_history 
  FOR EACH ROW EXECUTE FUNCTION update_nlp_updated_at_column();

CREATE TRIGGER update_nlp_entity_patterns_updated_at 
  BEFORE UPDATE ON nlp_entity_patterns 
  FOR EACH ROW EXECUTE FUNCTION update_nlp_updated_at_column();

CREATE TRIGGER update_nlp_intent_patterns_updated_at 
  BEFORE UPDATE ON nlp_intent_patterns 
  FOR EACH ROW EXECUTE FUNCTION update_nlp_updated_at_column();

CREATE TRIGGER update_nlp_user_preferences_updated_at 
  BEFORE UPDATE ON nlp_user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_nlp_updated_at_column();

-- Function to update pattern learning
CREATE OR REPLACE FUNCTION update_nlp_pattern_learning(
  p_pattern_type VARCHAR(50),
  p_pattern_text TEXT,
  p_entity_type VARCHAR(50) DEFAULT NULL,
  p_intent_action VARCHAR(50) DEFAULT NULL,
  p_success BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
DECLARE
  existing_pattern RECORD;
BEGIN
  IF p_pattern_type = 'entity' AND p_entity_type IS NOT NULL THEN
    -- Update entity pattern
    SELECT * INTO existing_pattern
    FROM nlp_entity_patterns
    WHERE entity_type = p_entity_type
      AND pattern_text = p_pattern_text
    LIMIT 1;

    IF FOUND THEN
      UPDATE nlp_entity_patterns
      SET usage_count = usage_count + 1,
          success_rate = CASE 
            WHEN p_success THEN 
              (success_rate * usage_count + 1.0) / (usage_count + 1)
            ELSE 
              (success_rate * usage_count) / (usage_count + 1)
          END,
          last_used_at = NOW(),
          updated_at = NOW()
      WHERE id = existing_pattern.id;
    ELSE
      INSERT INTO nlp_entity_patterns (
        entity_type,
        pattern_text,
        usage_count,
        success_rate,
        last_used_at
      ) VALUES (
        p_entity_type,
        p_pattern_text,
        1,
        CASE WHEN p_success THEN 1.0 ELSE 0.0 END,
        NOW()
      );
    END IF;
  ELSIF p_pattern_type = 'intent' AND p_intent_action IS NOT NULL THEN
    -- Update intent pattern
    SELECT * INTO existing_pattern
    FROM nlp_intent_patterns
    WHERE intent_action = p_intent_action
      AND pattern_text = p_pattern_text
    LIMIT 1;

    IF FOUND THEN
      UPDATE nlp_intent_patterns
      SET usage_count = usage_count + 1,
          success_rate = CASE 
            WHEN p_success THEN 
              (success_rate * usage_count + 1.0) / (usage_count + 1)
            ELSE 
              (success_rate * usage_count) / (usage_count + 1)
          END,
          last_used_at = NOW(),
          updated_at = NOW()
      WHERE id = existing_pattern.id;
    ELSE
      INSERT INTO nlp_intent_patterns (
        intent_action,
        pattern_text,
        usage_count,
        success_rate,
        last_used_at
      ) VALUES (
        p_intent_action,
        p_pattern_text,
        1,
        CASE WHEN p_success THEN 1.0 ELSE 0.0 END,
        NOW()
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get NLP analytics
CREATE OR REPLACE FUNCTION get_nlp_analytics(
  p_user_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  action_type VARCHAR(50),
  total_requests BIGINT,
  success_rate DECIMAL(5,2),
  avg_confidence DECIMAL(5,2),
  avg_processing_time_ms DECIMAL(10,2),
  avg_entities_extracted DECIMAL(5,2),
  avg_suggestions_generated DECIMAL(5,2),
  task_creation_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    na.action_type,
    COUNT(*) as total_requests,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE na.success = true)::DECIMAL / COUNT(*)) * 100
      ELSE 0 
    END as success_rate,
    AVG(na.confidence_score) as avg_confidence,
    AVG(na.processing_time_ms) as avg_processing_time_ms,
    AVG(na.entities_extracted) as avg_entities_extracted,
    AVG(na.suggestions_generated) as avg_suggestions_generated,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE na.task_created = true)::DECIMAL / COUNT(*)) * 100
      ELSE 0 
    END as task_creation_rate
  FROM nlp_analytics na
  WHERE (p_user_id IS NULL OR na.user_id = p_user_id)
    AND na.created_at >= NOW() - INTERVAL '1 day' * p_days
  GROUP BY na.action_type
  ORDER BY total_requests DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get NLP pattern effectiveness
CREATE OR REPLACE FUNCTION get_nlp_pattern_effectiveness(
  p_pattern_type VARCHAR(50) DEFAULT 'entity'
)
RETURNS TABLE (
  pattern_identifier VARCHAR(50),
  pattern_text TEXT,
  usage_count INTEGER,
  success_rate DECIMAL(5,2),
  last_used_at TIMESTAMPTZ
) AS $$
BEGIN
  IF p_pattern_type = 'entity' THEN
    RETURN QUERY
    SELECT 
      nep.entity_type as pattern_identifier,
      nep.pattern_text,
      nep.usage_count,
      nep.success_rate * 100 as success_rate,
      nep.last_used_at
    FROM nlp_entity_patterns nep
    ORDER BY nep.usage_count DESC, nep.success_rate DESC;
  ELSIF p_pattern_type = 'intent' THEN
    RETURN QUERY
    SELECT 
      nip.intent_action as pattern_identifier,
      nip.pattern_text,
      nip.usage_count,
      nip.success_rate * 100 as success_rate,
      nip.last_used_at
    FROM nlp_intent_patterns nip
    ORDER BY nip.usage_count DESC, nip.success_rate DESC;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE nlp_processing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlp_entity_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlp_intent_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlp_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlp_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlp_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for NLP processing history
CREATE POLICY "Users can view own NLP history" ON nlp_processing_history 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create NLP history" ON nlp_processing_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own NLP history" ON nlp_processing_history 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own NLP history" ON nlp_processing_history 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for NLP patterns (read-only for users)
CREATE POLICY "Users can view NLP entity patterns" ON nlp_entity_patterns 
  FOR SELECT USING (true);

CREATE POLICY "Users can view NLP intent patterns" ON nlp_intent_patterns 
  FOR SELECT USING (true);

-- RLS Policies for NLP user preferences
CREATE POLICY "Users can view own NLP preferences" ON nlp_user_preferences 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create NLP preferences" ON nlp_user_preferences 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own NLP preferences" ON nlp_user_preferences 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own NLP preferences" ON nlp_user_preferences 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for NLP analytics
CREATE POLICY "Users can view own NLP analytics" ON nlp_analytics 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create NLP analytics" ON nlp_analytics 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for NLP feedback
CREATE POLICY "Users can view own NLP feedback" ON nlp_feedback 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create NLP feedback" ON nlp_feedback 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own NLP feedback" ON nlp_feedback 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own NLP feedback" ON nlp_feedback 
  FOR DELETE USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE nlp_processing_history IS 'History of natural language processing requests and results';
COMMENT ON TABLE nlp_entity_patterns IS 'Learned patterns for entity extraction from natural language';
COMMENT ON TABLE nlp_intent_patterns IS 'Learned patterns for intent recognition from natural language';
COMMENT ON TABLE nlp_user_preferences IS 'User-specific NLP configuration and preferences';
COMMENT ON TABLE nlp_analytics IS 'Analytics data for NLP feature usage and performance';
COMMENT ON TABLE nlp_feedback IS 'User feedback for improving NLP accuracy';

COMMENT ON COLUMN nlp_processing_history.confidence_score IS 'Overall confidence score for the NLP parsing result';
COMMENT ON COLUMN nlp_processing_history.parse_result IS 'Complete JSON result from NLP processing';
COMMENT ON COLUMN nlp_processing_history.processing_time_ms IS 'Time taken to process the natural language input';
COMMENT ON COLUMN nlp_entity_patterns.pattern_text IS 'Text pattern for entity recognition';
COMMENT ON COLUMN nlp_intent_patterns.pattern_text IS 'Text pattern for intent recognition';
COMMENT ON COLUMN nlp_user_preferences.min_confidence_threshold IS 'Minimum confidence threshold for NLP suggestions';
COMMENT ON COLUMN nlp_feedback.feedback_data IS 'JSON data containing user feedback details';
