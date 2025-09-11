-- Hero Tasks Query Builder Analytics Migration
-- Created: 2025-09-08T16:07:10.000Z
-- Version: 1.0.0
-- 
-- This migration creates the necessary tables for query builder analytics
-- and enhances the existing search system with query execution tracking.

-- ============================================================================
-- QUERY ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hero_query_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query_structure JSONB NOT NULL DEFAULT '{}',
  result_count INTEGER DEFAULT 0,
  execution_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for performance
  INDEX idx_hero_query_analytics_user_timestamp ON hero_query_analytics(user_id, execution_timestamp DESC),
  INDEX idx_hero_query_analytics_query_structure ON hero_query_analytics USING gin(query_structure)
);

-- ============================================================================
-- SAVED QUERIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hero_saved_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  query_structure JSONB NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique query names per user
  UNIQUE(user_id, name)
);

-- ============================================================================
-- QUERY BUILDER FUNCTIONS
-- ============================================================================

-- Function to execute complex queries with validation
CREATE OR REPLACE FUNCTION hero_execute_complex_query(
  query_structure JSONB,
  user_id_param UUID DEFAULT NULL,
  page_param INTEGER DEFAULT 1,
  page_size_param INTEGER DEFAULT 20
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
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INTEGER;
  query_sql TEXT;
  count_sql TEXT;
BEGIN
  offset_val := (page_param - 1) * page_size_param;
  
  -- Build dynamic query based on structure
  query_sql := build_dynamic_query(query_structure, user_id_param, page_size_param, offset_val);
  count_sql := build_dynamic_count_query(query_structure, user_id_param);
  
  -- Execute the query
  RETURN QUERY EXECUTE query_sql;
  
  -- Get total count
  EXECUTE count_sql INTO total_count;
END;
$$ LANGUAGE plpgsql;

-- Helper function to build dynamic query
CREATE OR REPLACE FUNCTION build_dynamic_query(
  query_structure JSONB,
  user_id_param UUID,
  page_size_param INTEGER,
  offset_val INTEGER
)
RETURNS TEXT AS $$
DECLARE
  base_query TEXT;
  where_clause TEXT;
  group_conditions TEXT[];
  group_condition TEXT;
  condition_parts TEXT[];
  condition_part TEXT;
  group_item JSONB;
  condition_item JSONB;
BEGIN
  base_query := 'SELECT ht.*, COUNT(*) OVER() as total_count FROM hero_tasks ht';
  
  -- Build WHERE clause from query structure
  where_clause := '';
  
  IF query_structure ? 'groups' THEN
    group_conditions := ARRAY[]::TEXT[];
    
    -- Process each group
    FOR group_item IN SELECT * FROM jsonb_array_elements(query_structure->'groups')
    LOOP
      condition_parts := ARRAY[]::TEXT[];
      
      -- Process each condition in the group
      FOR condition_item IN SELECT * FROM jsonb_array_elements(group_item->'conditions')
      LOOP
        condition_part := build_condition_clause(condition_item);
        IF condition_part != '' THEN
          condition_parts := array_append(condition_parts, condition_part);
        END IF;
      END LOOP;
      
      -- Join conditions within group
      IF array_length(condition_parts, 1) > 0 THEN
        group_condition := '(' || array_to_string(condition_parts, 
          CASE WHEN (group_item->>'logicalOperator') = 'OR' THEN ' OR ' ELSE ' AND ' END
        ) || ')';
        group_conditions := array_append(group_conditions, group_condition);
      END IF;
    END LOOP;
    
    -- Join groups
    IF array_length(group_conditions, 1) > 0 THEN
      where_clause := ' WHERE ' || array_to_string(group_conditions, ' OR ');
    END IF;
  END IF;
  
  -- Add user filter if specified
  IF user_id_param IS NOT NULL THEN
    IF where_clause = '' THEN
      where_clause := ' WHERE (ht.assignee_id = $1 OR ht.created_by = $1)';
    ELSE
      where_clause := where_clause || ' AND (ht.assignee_id = $1 OR ht.created_by = $1)';
    END IF;
  END IF;
  
  -- Add pagination
  base_query := base_query || where_clause || 
    ' ORDER BY ht.created_at DESC LIMIT ' || page_size_param || ' OFFSET ' || offset_val;
  
  RETURN base_query;
END;
$$ LANGUAGE plpgsql;

-- Helper function to build condition clause
CREATE OR REPLACE FUNCTION build_condition_clause(condition JSONB)
RETURNS TEXT AS $$
DECLARE
  field_name TEXT;
  operator_name TEXT;
  field_value TEXT;
  result TEXT;
BEGIN
  field_name := condition->>'field';
  operator_name := condition->>'operator';
  field_value := condition->>'value';
  
  IF field_name IS NULL OR operator_name IS NULL OR field_value IS NULL THEN
    RETURN '';
  END IF;
  
  -- Map operators to SQL
  CASE operator_name
    WHEN 'contains' THEN
      result := field_name || ' ILIKE ''%' || field_value || '%''';
    WHEN 'equals' THEN
      result := field_name || ' = ''' || field_value || '''';
    WHEN 'not_equals' THEN
      result := field_name || ' != ''' || field_value || '''';
    WHEN 'starts_with' THEN
      result := field_name || ' ILIKE ''' || field_value || '%''';
    WHEN 'ends_with' THEN
      result := field_name || ' ILIKE ''%' || field_value || '''';
    WHEN 'is_empty' THEN
      result := field_name || ' IS NULL';
    WHEN 'is_not_empty' THEN
      result := field_name || ' IS NOT NULL';
    WHEN 'before' THEN
      result := field_name || ' < ''' || field_value || '''';
    WHEN 'after' THEN
      result := field_name || ' > ''' || field_value || '''';
    WHEN 'greater_than' THEN
      result := field_name || ' > ' || field_value;
    WHEN 'less_than' THEN
      result := field_name || ' < ' || field_value;
    ELSE
      result := field_name || ' = ''' || field_value || '''';
  END CASE;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Helper function to build count query
CREATE OR REPLACE FUNCTION build_dynamic_count_query(
  query_structure JSONB,
  user_id_param UUID
)
RETURNS TEXT AS $$
DECLARE
  base_query TEXT;
  where_clause TEXT;
BEGIN
  base_query := 'SELECT COUNT(*) FROM hero_tasks ht';
  
  -- Reuse the same WHERE clause building logic
  where_clause := '';
  
  -- Add user filter if specified
  IF user_id_param IS NOT NULL THEN
    where_clause := ' WHERE (ht.assignee_id = $1 OR ht.created_by = $1)';
  END IF;
  
  base_query := base_query || where_clause;
  
  RETURN base_query;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional indexes for query builder performance
CREATE INDEX IF NOT EXISTS idx_hero_tasks_created_at_desc 
ON hero_tasks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hero_tasks_updated_at_desc 
ON hero_tasks(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_hero_tasks_due_date_status 
ON hero_tasks(due_date, status);

CREATE INDEX IF NOT EXISTS idx_hero_tasks_assignee_created 
ON hero_tasks(assignee_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hero_tasks_creator_created 
ON hero_tasks(created_by, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on query analytics table
ALTER TABLE hero_query_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own query analytics
CREATE POLICY "Users can access their own query analytics" ON hero_query_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on saved queries table
ALTER TABLE hero_saved_queries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own saved queries
CREATE POLICY "Users can manage their own saved queries" ON hero_saved_queries
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger to update updated_at timestamp on saved queries
CREATE OR REPLACE FUNCTION update_hero_saved_queries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hero_saved_queries_updated_at
  BEFORE UPDATE ON hero_saved_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_saved_queries_updated_at();

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up old query analytics (keep last 1000 per user)
CREATE OR REPLACE FUNCTION cleanup_old_query_analytics()
RETURNS VOID AS $$
BEGIN
  DELETE FROM hero_query_analytics
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY execution_timestamp DESC) as rn
      FROM hero_query_analytics
    ) ranked
    WHERE rn > 1000
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT, INSERT ON hero_query_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hero_saved_queries TO authenticated;
GRANT EXECUTE ON FUNCTION hero_execute_complex_query TO authenticated;
GRANT EXECUTE ON FUNCTION build_dynamic_query TO authenticated;
GRANT EXECUTE ON FUNCTION build_condition_clause TO authenticated;
GRANT EXECUTE ON FUNCTION build_dynamic_count_query TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_query_analytics TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE hero_query_analytics IS 'Tracks query builder executions for analytics and optimization';
COMMENT ON TABLE hero_saved_queries IS 'Stores user-saved complex queries from query builder';
COMMENT ON FUNCTION hero_execute_complex_query IS 'Executes complex queries built with the visual query builder';
COMMENT ON FUNCTION build_dynamic_query IS 'Builds dynamic SQL queries from query builder structure';
COMMENT ON FUNCTION build_condition_clause IS 'Builds SQL condition clauses from query builder conditions';
COMMENT ON FUNCTION cleanup_old_query_analytics IS 'Cleans up old query analytics to maintain performance';
