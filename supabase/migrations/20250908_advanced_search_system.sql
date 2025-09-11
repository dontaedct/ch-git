-- Hero Tasks Advanced Search System Migration
-- Created: 2025-09-08T16:07:10.000Z
-- Version: 1.0.0
-- 
-- This migration creates the necessary tables and functions for the advanced search system
-- including saved filters, search analytics, and full-text search capabilities.

-- ============================================================================
-- SAVED FILTERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hero_saved_filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique filter names per user
  UNIQUE(user_id, name)
);

-- ============================================================================
-- SEARCH ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hero_search_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_text TEXT,
  filters_applied TEXT[] DEFAULT '{}',
  result_count INTEGER DEFAULT 0,
  search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for performance
  INDEX idx_hero_search_analytics_user_timestamp ON hero_search_analytics(user_id, search_timestamp DESC),
  INDEX idx_hero_search_analytics_search_text ON hero_search_analytics(search_text)
);

-- ============================================================================
-- FULL-TEXT SEARCH CONFIGURATION
-- ============================================================================

-- Create full-text search configuration for tasks
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS hero_tasks_search (COPY = english);

-- Add custom dictionary for task-specific terms
CREATE TEXT SEARCH DICTIONARY IF NOT EXISTS hero_tasks_dict (
  TEMPLATE = simple,
  STOPWORDS = ''
);

-- ============================================================================
-- SEARCH FUNCTIONS
-- ============================================================================

-- Function to perform full-text search on tasks
CREATE OR REPLACE FUNCTION hero_tasks_fulltext_search(
  search_query TEXT,
  user_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  task_number VARCHAR(20),
  title TEXT,
  description TEXT,
  status VARCHAR(20),
  priority VARCHAR(20),
  type VARCHAR(30),
  current_phase VARCHAR(20),
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ht.id,
    ht.task_number,
    ht.title,
    ht.description,
    ht.status,
    ht.priority,
    ht.type,
    ht.current_phase,
    ts_rank(
      to_tsvector('hero_tasks_search', 
        COALESCE(ht.title, '') || ' ' || 
        COALESCE(ht.description, '') || ' ' || 
        COALESCE(array_to_string(ht.tags, ' '), '')
      ),
      plainto_tsquery('hero_tasks_search', search_query)
    ) as rank
  FROM hero_tasks ht
  WHERE (
    user_id_param IS NULL OR ht.assignee_id = user_id_param OR ht.created_by = user_id_param
  )
  AND to_tsvector('hero_tasks_search', 
    COALESCE(ht.title, '') || ' ' || 
    COALESCE(ht.description, '') || ' ' || 
    COALESCE(array_to_string(ht.tags, ' '), '')
  ) @@ plainto_tsquery('hero_tasks_search', search_query)
  ORDER BY rank DESC, ht.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get search suggestions
CREATE OR REPLACE FUNCTION hero_tasks_search_suggestions(
  user_id_param UUID,
  query_param TEXT DEFAULT '',
  limit_param INTEGER DEFAULT 10
)
RETURNS TABLE (
  suggestion TEXT,
  suggestion_type VARCHAR(20),
  usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_searches AS (
    SELECT DISTINCT search_text as suggestion, 'recent'::VARCHAR(20) as suggestion_type, 0 as usage_count
    FROM hero_search_analytics
    WHERE user_id = user_id_param 
      AND search_text IS NOT NULL
      AND (query_param = '' OR search_text ILIKE '%' || query_param || '%')
    ORDER BY search_timestamp DESC
    LIMIT 5
  ),
  popular_searches AS (
    SELECT DISTINCT search_text as suggestion, 'popular'::VARCHAR(20) as suggestion_type, COUNT(*) as usage_count
    FROM hero_search_analytics
    WHERE search_text IS NOT NULL
      AND (query_param = '' OR search_text ILIKE '%' || query_param || '%')
    GROUP BY search_text
    ORDER BY usage_count DESC
    LIMIT 10
  ),
  task_keywords AS (
    SELECT DISTINCT unnest(string_to_array(LOWER(title || ' ' || COALESCE(description, '')), ' ')) as suggestion, 'keyword'::VARCHAR(20) as suggestion_type, 0 as usage_count
    FROM hero_tasks
    WHERE (query_param = '' OR LOWER(title || ' ' || COALESCE(description, '')) ILIKE '%' || query_param || '%')
    AND LENGTH(unnest(string_to_array(LOWER(title || ' ' || COALESCE(description, '')), ' '))) > 2
    LIMIT 20
  )
  SELECT * FROM recent_searches
  UNION ALL
  SELECT * FROM popular_searches
  WHERE suggestion NOT IN (SELECT suggestion FROM recent_searches)
  UNION ALL
  SELECT * FROM task_keywords
  WHERE suggestion NOT IN (SELECT suggestion FROM recent_searches UNION SELECT suggestion FROM popular_searches)
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_hero_tasks_fulltext 
ON hero_tasks USING gin(to_tsvector('hero_tasks_search', 
  COALESCE(title, '') || ' ' || 
  COALESCE(description, '') || ' ' || 
  COALESCE(array_to_string(tags, ' '), '')
));

-- Additional indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_hero_tasks_title_trgm 
ON hero_tasks USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_hero_tasks_description_trgm 
ON hero_tasks USING gin(description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_hero_tasks_tags_gin 
ON hero_tasks USING gin(tags);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_hero_tasks_status_priority 
ON hero_tasks(status, priority);

CREATE INDEX IF NOT EXISTS idx_hero_tasks_assignee_status 
ON hero_tasks(assignee_id, status);

CREATE INDEX IF NOT EXISTS idx_hero_tasks_due_date_status 
ON hero_tasks(due_date, status);

CREATE INDEX IF NOT EXISTS idx_hero_tasks_created_at_status 
ON hero_tasks(created_at, status);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on saved filters table
ALTER TABLE hero_saved_filters ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own saved filters
CREATE POLICY "Users can manage their own saved filters" ON hero_saved_filters
  FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on search analytics table
ALTER TABLE hero_search_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own search analytics
CREATE POLICY "Users can access their own search analytics" ON hero_search_analytics
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger to update updated_at timestamp on saved filters
CREATE OR REPLACE FUNCTION update_hero_saved_filters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hero_saved_filters_updated_at
  BEFORE UPDATE ON hero_saved_filters
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_saved_filters_updated_at();

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up old search analytics (keep last 1000 per user)
CREATE OR REPLACE FUNCTION cleanup_old_search_analytics()
RETURNS VOID AS $$
BEGIN
  DELETE FROM hero_search_analytics
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY search_timestamp DESC) as rn
      FROM hero_search_analytics
    ) ranked
    WHERE rn > 1000
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON hero_saved_filters TO authenticated;
GRANT SELECT, INSERT ON hero_search_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION hero_tasks_fulltext_search TO authenticated;
GRANT EXECUTE ON FUNCTION hero_tasks_search_suggestions TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_search_analytics TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE hero_saved_filters IS 'Stores user-saved search filters for quick access';
COMMENT ON TABLE hero_search_analytics IS 'Tracks search queries for analytics and suggestions';
COMMENT ON FUNCTION hero_tasks_fulltext_search IS 'Performs full-text search on tasks with ranking';
COMMENT ON FUNCTION hero_tasks_search_suggestions IS 'Provides intelligent search suggestions based on user history';
COMMENT ON FUNCTION cleanup_old_search_analytics IS 'Cleans up old search analytics to maintain performance';
