-- HT-004.5.4: Database Optimization Migration
-- Advanced indexing, caching layer (Redis), and query optimization
-- Created: 2025-09-08T18:10:48.000Z

-- =============================================================================
-- ADVANCED INDEXING STRATEGIES
-- =============================================================================

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_tasks_status_priority_created 
ON hero_tasks(status, priority, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_tasks_assignee_status_due 
ON hero_tasks(assignee_id, status, due_date) 
WHERE assignee_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_tasks_type_status_phase 
ON hero_tasks(type, status, current_phase);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_tasks_parent_status 
ON hero_tasks(parent_task_id, status) 
WHERE parent_task_id IS NOT NULL;

-- Partial indexes for active tasks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_tasks_active 
ON hero_tasks(created_at DESC, priority) 
WHERE status IN ('ready', 'in_progress', 'blocked');

-- Partial indexes for completed tasks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_tasks_completed 
ON hero_tasks(completed_at DESC, type) 
WHERE status = 'completed';

-- Partial indexes for overdue tasks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_tasks_overdue 
ON hero_tasks(due_date, priority) 
WHERE due_date < NOW() AND status NOT IN ('completed', 'cancelled');

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_tasks_title_search 
ON hero_tasks USING GIN(to_tsvector('english', title));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_tasks_description_search 
ON hero_tasks USING GIN(to_tsvector('english', description));

-- Composite indexes for subtasks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_subtasks_task_status_priority 
ON hero_subtasks(task_id, status, priority);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_subtasks_assignee_status 
ON hero_subtasks(assignee_id, status) 
WHERE assignee_id IS NOT NULL;

-- Composite indexes for actions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_actions_subtask_status_priority 
ON hero_actions(subtask_id, status, priority);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_actions_assignee_status 
ON hero_actions(assignee_id, status) 
WHERE assignee_id IS NOT NULL;

-- Optimized indexes for dependencies
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_dependencies_blocking 
ON hero_task_dependencies(depends_on_task_id, dependency_type) 
WHERE dependency_type = 'blocks';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_dependencies_blocked 
ON hero_task_dependencies(dependent_task_id, dependency_type) 
WHERE dependency_type = 'blocks';

-- Optimized indexes for workflow history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_workflow_recent 
ON hero_workflow_history(created_at DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hero_workflow_task_recent 
ON hero_workflow_history(task_id, created_at DESC) 
WHERE task_id IS NOT NULL AND created_at > NOW() - INTERVAL '30 days';

-- =============================================================================
-- DATABASE PARTITIONING FOR SCALABILITY
-- =============================================================================

-- Partition hero_workflow_history by month for better performance
CREATE TABLE IF NOT EXISTS hero_workflow_history_partitioned (
  LIKE hero_workflow_history INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create partitions for the next 12 months
DO $$
DECLARE
  start_date DATE := DATE_TRUNC('month', NOW());
  end_date DATE;
  partition_name TEXT;
BEGIN
  FOR i IN 0..11 LOOP
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'hero_workflow_history_' || TO_CHAR(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF hero_workflow_history_partitioned 
                    FOR VALUES FROM (%L) TO (%L)', 
                   partition_name, start_date, end_date);
    
    start_date := end_date;
  END LOOP;
END $$;

-- Partition hero_task_comments by month
CREATE TABLE IF NOT EXISTS hero_task_comments_partitioned (
  LIKE hero_task_comments INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create partitions for comments
DO $$
DECLARE
  start_date DATE := DATE_TRUNC('month', NOW());
  end_date DATE;
  partition_name TEXT;
BEGIN
  FOR i IN 0..11 LOOP
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'hero_task_comments_' || TO_CHAR(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF hero_task_comments_partitioned 
                    FOR VALUES FROM (%L) TO (%L)', 
                   partition_name, start_date, end_date);
    
    start_date := end_date;
  END LOOP;
END $$;

-- =============================================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- =============================================================================

-- Function to get task statistics efficiently
CREATE OR REPLACE FUNCTION get_task_statistics()
RETURNS TABLE (
  total_tasks BIGINT,
  active_tasks BIGINT,
  completed_tasks BIGINT,
  overdue_tasks BIGINT,
  avg_completion_time INTERVAL,
  tasks_by_status JSONB,
  tasks_by_priority JSONB,
  tasks_by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status IN ('ready', 'in_progress', 'blocked')) as active,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed', 'cancelled')) as overdue,
      AVG(completed_at - started_at) FILTER (WHERE completed_at IS NOT NULL AND started_at IS NOT NULL) as avg_time
    FROM hero_tasks
  ),
  status_stats AS (
    SELECT jsonb_object_agg(status, count) as status_data
    FROM (
      SELECT status, COUNT(*) as count
      FROM hero_tasks
      GROUP BY status
    ) s
  ),
  priority_stats AS (
    SELECT jsonb_object_agg(priority, count) as priority_data
    FROM (
      SELECT priority, COUNT(*) as count
      FROM hero_tasks
      GROUP BY priority
    ) p
  ),
  type_stats AS (
    SELECT jsonb_object_agg(type, count) as type_data
    FROM (
      SELECT type, COUNT(*) as count
      FROM hero_tasks
      GROUP BY type
    ) t
  )
  SELECT 
    s.total,
    s.active,
    s.completed,
    s.overdue,
    s.avg_time,
    ss.status_data,
    ps.priority_data,
    ts.type_data
  FROM stats s, status_stats ss, priority_stats ps, type_stats ts;
END;
$$ LANGUAGE plpgsql;

-- Function to get user task summary efficiently
CREATE OR REPLACE FUNCTION get_user_task_summary(user_id UUID)
RETURNS TABLE (
  assigned_tasks BIGINT,
  created_tasks BIGINT,
  completed_tasks BIGINT,
  overdue_tasks BIGINT,
  avg_completion_time INTERVAL,
  recent_activity JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE assignee_id = user_id) as assigned,
      COUNT(*) FILTER (WHERE created_by = user_id) as created,
      COUNT(*) FILTER (WHERE assignee_id = user_id AND status = 'completed') as completed,
      COUNT(*) FILTER (WHERE assignee_id = user_id AND due_date < NOW() AND status NOT IN ('completed', 'cancelled')) as overdue,
      AVG(completed_at - started_at) FILTER (WHERE assignee_id = user_id AND completed_at IS NOT NULL AND started_at IS NOT NULL) as avg_time
    FROM hero_tasks
  ),
  recent_activity AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'task_id', task_id,
        'action', 'status_change',
        'from_status', from_status,
        'to_status', to_status,
        'created_at', created_at
      ) ORDER BY created_at DESC
    ) as activity_data
    FROM hero_workflow_history
    WHERE created_by = user_id
    AND created_at > NOW() - INTERVAL '7 days'
    LIMIT 10
  )
  SELECT 
    us.assigned,
    us.created,
    us.completed,
    us.overdue,
    us.avg_time,
    COALESCE(ra.activity_data, '[]'::jsonb)
  FROM user_stats us, recent_activity ra;
END;
$$ LANGUAGE plpgsql;

-- Function to get task dependencies efficiently
CREATE OR REPLACE FUNCTION get_task_dependencies(task_id UUID)
RETURNS TABLE (
  dependency_type TEXT,
  dependent_task_id UUID,
  depends_on_task_id UUID,
  dependent_title TEXT,
  depends_on_title TEXT,
  dependent_status task_status,
  depends_on_status task_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.dependency_type,
    d.dependent_task_id,
    d.depends_on_task_id,
    dt.title as dependent_title,
    dot.title as depends_on_title,
    dt.status as dependent_status,
    dot.status as depends_on_status
  FROM hero_task_dependencies d
  JOIN hero_tasks dt ON d.dependent_task_id = dt.id
  JOIN hero_tasks dot ON d.depends_on_task_id = dot.id
  WHERE d.dependent_task_id = task_id OR d.depends_on_task_id = task_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- =============================================================================

-- Function to analyze slow queries
CREATE OR REPLACE FUNCTION analyze_slow_queries()
RETURNS TABLE (
  query_text TEXT,
  calls BIGINT,
  total_time DOUBLE PRECISION,
  mean_time DOUBLE PRECISION,
  rows BIGINT,
  shared_blks_hit BIGINT,
  shared_blks_read BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    shared_blks_hit,
    shared_blks_read
  FROM pg_stat_statements
  WHERE mean_time > 100 -- queries taking more than 100ms on average
  ORDER BY mean_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION get_table_statistics()
RETURNS TABLE (
  table_name TEXT,
  row_count BIGINT,
  total_size TEXT,
  index_size TEXT,
  table_size TEXT,
  bloat_factor DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    n_tup_ins - n_tup_del as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    CASE 
      WHEN n_tup_ins > 0 THEN (n_tup_del::float / n_tup_ins::float) * 100
      ELSE 0
    END as bloat_factor
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CONNECTION POOLING CONFIGURATION
-- =============================================================================

-- Create connection pool configuration table
CREATE TABLE IF NOT EXISTS db_connection_pool_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_name TEXT NOT NULL UNIQUE,
  min_connections INTEGER DEFAULT 5,
  max_connections INTEGER DEFAULT 20,
  connection_timeout_ms INTEGER DEFAULT 30000,
  idle_timeout_ms INTEGER DEFAULT 600000,
  max_lifetime_ms INTEGER DEFAULT 3600000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default connection pool configurations
INSERT INTO db_connection_pool_config (pool_name, min_connections, max_connections, connection_timeout_ms, idle_timeout_ms, max_lifetime_ms) VALUES
('hero_tasks_read', 5, 15, 30000, 600000, 3600000),
('hero_tasks_write', 3, 10, 30000, 600000, 3600000),
('hero_tasks_analytics', 2, 5, 60000, 1200000, 7200000)
ON CONFLICT (pool_name) DO NOTHING;

-- =============================================================================
-- CACHING CONFIGURATION
-- =============================================================================

-- Create cache configuration table
CREATE TABLE IF NOT EXISTS db_cache_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  cache_type TEXT NOT NULL CHECK (cache_type IN ('redis', 'memory', 'database')),
  ttl_seconds INTEGER DEFAULT 3600,
  max_size_mb INTEGER DEFAULT 100,
  eviction_policy TEXT DEFAULT 'lru' CHECK (eviction_policy IN ('lru', 'fifo', 'ttl')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default cache configurations
INSERT INTO db_cache_config (cache_key, cache_type, ttl_seconds, max_size_mb, eviction_policy) VALUES
('task_statistics', 'redis', 300, 10, 'ttl'),
('user_task_summary', 'redis', 600, 50, 'lru'),
('task_dependencies', 'redis', 1800, 20, 'lru'),
('workflow_history', 'memory', 60, 5, 'lru'),
('task_search_results', 'redis', 300, 30, 'ttl')
ON CONFLICT (cache_key) DO NOTHING;

-- =============================================================================
-- AUTOMATIC MAINTENANCE FUNCTIONS
-- =============================================================================

-- Function to update table statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS VOID AS $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE 'hero_%'
  LOOP
    EXECUTE format('ANALYZE %I.%I', table_record.schemaname, table_record.tablename);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old workflow history
CREATE OR REPLACE FUNCTION cleanup_old_workflow_history()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM hero_workflow_history 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old comments
CREATE OR REPLACE FUNCTION cleanup_old_comments()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM hero_task_comments 
  WHERE created_at < NOW() - INTERVAL '2 years'
  AND comment_type = 'comment'; -- Keep important comments longer
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PERFORMANCE MONITORING VIEWS
-- =============================================================================

-- View for monitoring query performance
CREATE OR REPLACE VIEW v_query_performance AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  shared_blks_hit,
  shared_blks_read,
  shared_blks_hit::float / NULLIF(shared_blks_hit + shared_blks_read, 0) as hit_ratio
FROM pg_stat_statements
WHERE mean_time > 10 -- queries taking more than 10ms
ORDER BY mean_time DESC;

-- View for monitoring table performance
CREATE OR REPLACE VIEW v_table_performance AS
SELECT 
  schemaname||'.'||tablename as table_name,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- View for monitoring index usage
CREATE OR REPLACE VIEW v_index_usage AS
SELECT 
  schemaname||'.'||tablename as table_name,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  CASE 
    WHEN idx_tup_read > 0 THEN idx_tup_fetch::float / idx_tup_read::float
    ELSE 0
  END as efficiency_ratio
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant permissions for performance monitoring
GRANT SELECT ON v_query_performance TO authenticated;
GRANT SELECT ON v_table_performance TO authenticated;
GRANT SELECT ON v_index_usage TO authenticated;

-- Grant execute permissions for utility functions
GRANT EXECUTE ON FUNCTION get_task_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_task_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_dependencies(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_slow_queries() TO service_role;
GRANT EXECUTE ON FUNCTION get_table_statistics() TO service_role;
GRANT EXECUTE ON FUNCTION update_table_statistics() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_workflow_history() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_comments() TO service_role;

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON FUNCTION get_task_statistics() IS 'Efficiently retrieves comprehensive task statistics';
COMMENT ON FUNCTION get_user_task_summary(UUID) IS 'Gets user-specific task summary with recent activity';
COMMENT ON FUNCTION get_task_dependencies(UUID) IS 'Retrieves task dependencies with status information';
COMMENT ON FUNCTION analyze_slow_queries() IS 'Analyzes slow queries for performance optimization';
COMMENT ON FUNCTION get_table_statistics() IS 'Provides table size and performance statistics';
COMMENT ON FUNCTION update_table_statistics() IS 'Updates table statistics for query optimization';
COMMENT ON FUNCTION cleanup_old_workflow_history() IS 'Cleans up workflow history older than 1 year';
COMMENT ON FUNCTION cleanup_old_comments() IS 'Cleans up old comments to maintain performance';

COMMENT ON TABLE db_connection_pool_config IS 'Configuration for database connection pooling';
COMMENT ON TABLE db_cache_config IS 'Configuration for database caching strategies';

COMMENT ON VIEW v_query_performance IS 'View for monitoring query performance';
COMMENT ON VIEW v_table_performance IS 'View for monitoring table performance';
COMMENT ON VIEW v_index_usage IS 'View for monitoring index usage efficiency';
