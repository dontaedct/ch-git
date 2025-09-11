-- GitHub Integration Database Schema
-- HT-004.4.3: Database tables for GitHub integration with PR/commit/issue linking
-- Created: 2025-09-08T16:17:38.000Z

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- GitHub Integrations table
CREATE TABLE IF NOT EXISTS github_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_owner VARCHAR(255) NOT NULL,
  repository_name VARCHAR(255) NOT NULL,
  github_token TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_id BIGINT,
  is_active BOOLEAN DEFAULT true,
  sync_settings JSONB NOT NULL DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, repository_owner, repository_name)
);

-- GitHub Links table for tracking linked items
CREATE TABLE IF NOT EXISTS github_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES hero_tasks(id) ON DELETE CASCADE,
  github_type VARCHAR(50) NOT NULL CHECK (github_type IN ('pull_request', 'issue', 'commit')),
  github_id VARCHAR(255) NOT NULL,
  github_number INTEGER,
  github_url TEXT NOT NULL,
  github_title TEXT NOT NULL,
  github_state VARCHAR(50) NOT NULL,
  github_author VARCHAR(255) NOT NULL,
  github_assignees TEXT[] DEFAULT '{}',
  github_labels TEXT[] DEFAULT '{}',
  github_body TEXT,
  github_created_at TIMESTAMPTZ,
  github_updated_at TIMESTAMPTZ,
  github_closed_at TIMESTAMPTZ,
  github_merged_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status VARCHAR(50) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
  sync_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, github_type, github_id)
);

-- GitHub Sync History table for tracking sync operations
CREATE TABLE IF NOT EXISTS github_sync_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES github_integrations(id) ON DELETE CASCADE,
  task_id UUID REFERENCES hero_tasks(id) ON DELETE CASCADE,
  github_type VARCHAR(50) NOT NULL,
  github_id VARCHAR(255) NOT NULL,
  sync_action VARCHAR(50) NOT NULL CHECK (sync_action IN ('created', 'updated', 'linked', 'synced', 'unlinked')),
  sync_direction VARCHAR(50) NOT NULL CHECK (sync_direction IN ('github_to_task', 'task_to_github', 'bidirectional')),
  changes JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GitHub Webhook Events table for debugging and analytics
CREATE TABLE IF NOT EXISTS github_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES github_integrations(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  github_id VARCHAR(255) NOT NULL,
  github_number INTEGER,
  repository_owner VARCHAR(255) NOT NULL,
  repository_name VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GitHub Repository Stats table for analytics
CREATE TABLE IF NOT EXISTS github_repository_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES github_integrations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  prs_opened INTEGER DEFAULT 0,
  prs_closed INTEGER DEFAULT 0,
  prs_merged INTEGER DEFAULT 0,
  issues_opened INTEGER DEFAULT 0,
  issues_closed INTEGER DEFAULT 0,
  commits_pushed INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  tasks_linked INTEGER DEFAULT 0,
  sync_operations INTEGER DEFAULT 0,
  sync_errors INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integration_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_github_integrations_user_id ON github_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_github_integrations_repository ON github_integrations(repository_owner, repository_name);
CREATE INDEX IF NOT EXISTS idx_github_integrations_active ON github_integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_github_integrations_last_sync ON github_integrations(last_sync_at);

CREATE INDEX IF NOT EXISTS idx_github_links_task_id ON github_links(task_id);
CREATE INDEX IF NOT EXISTS idx_github_links_github_type ON github_links(github_type);
CREATE INDEX IF NOT EXISTS idx_github_links_github_id ON github_links(github_id);
CREATE INDEX IF NOT EXISTS idx_github_links_github_state ON github_links(github_state);
CREATE INDEX IF NOT EXISTS idx_github_links_sync_status ON github_links(sync_status);
CREATE INDEX IF NOT EXISTS idx_github_links_last_synced ON github_links(last_synced_at);

CREATE INDEX IF NOT EXISTS idx_github_sync_history_integration_id ON github_sync_history(integration_id);
CREATE INDEX IF NOT EXISTS idx_github_sync_history_task_id ON github_sync_history(task_id);
CREATE INDEX IF NOT EXISTS idx_github_sync_history_github_type ON github_sync_history(github_type);
CREATE INDEX IF NOT EXISTS idx_github_sync_history_sync_action ON github_sync_history(sync_action);
CREATE INDEX IF NOT EXISTS idx_github_sync_history_created_at ON github_sync_history(created_at);
CREATE INDEX IF NOT EXISTS idx_github_sync_history_success ON github_sync_history(success);

CREATE INDEX IF NOT EXISTS idx_github_webhook_events_integration_id ON github_webhook_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_github_webhook_events_event_type ON github_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_github_webhook_events_action ON github_webhook_events(action);
CREATE INDEX IF NOT EXISTS idx_github_webhook_events_github_id ON github_webhook_events(github_id);
CREATE INDEX IF NOT EXISTS idx_github_webhook_events_repository ON github_webhook_events(repository_owner, repository_name);
CREATE INDEX IF NOT EXISTS idx_github_webhook_events_processed ON github_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_github_webhook_events_created_at ON github_webhook_events(created_at);

CREATE INDEX IF NOT EXISTS idx_github_repo_stats_integration_id ON github_repository_stats(integration_id);
CREATE INDEX IF NOT EXISTS idx_github_repo_stats_date ON github_repository_stats(date);
CREATE INDEX IF NOT EXISTS idx_github_repo_stats_integration_date ON github_repository_stats(integration_id, date);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_github_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_github_integrations_updated_at 
  BEFORE UPDATE ON github_integrations 
  FOR EACH ROW EXECUTE FUNCTION update_github_updated_at_column();

CREATE TRIGGER update_github_links_updated_at 
  BEFORE UPDATE ON github_links 
  FOR EACH ROW EXECUTE FUNCTION update_github_updated_at_column();

CREATE TRIGGER update_github_repo_stats_updated_at 
  BEFORE UPDATE ON github_repository_stats 
  FOR EACH ROW EXECUTE FUNCTION update_github_updated_at_column();

-- Function to log GitHub sync operations
CREATE OR REPLACE FUNCTION log_github_sync(
  p_integration_id UUID,
  p_task_id UUID,
  p_github_type VARCHAR(50),
  p_github_id VARCHAR(255),
  p_sync_action VARCHAR(50),
  p_sync_direction VARCHAR(50),
  p_changes JSONB DEFAULT '{}',
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_processing_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO github_sync_history (
    integration_id,
    task_id,
    github_type,
    github_id,
    sync_action,
    sync_direction,
    changes,
    success,
    error_message,
    processing_time_ms
  ) VALUES (
    p_integration_id,
    p_task_id,
    p_github_type,
    p_github_id,
    p_sync_action,
    p_sync_direction,
    p_changes,
    p_success,
    p_error_message,
    p_processing_time_ms
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update repository stats
CREATE OR REPLACE FUNCTION update_github_repository_stats(
  p_integration_id UUID,
  p_date DATE,
  p_prs_opened INTEGER DEFAULT 0,
  p_prs_closed INTEGER DEFAULT 0,
  p_prs_merged INTEGER DEFAULT 0,
  p_issues_opened INTEGER DEFAULT 0,
  p_issues_closed INTEGER DEFAULT 0,
  p_commits_pushed INTEGER DEFAULT 0,
  p_tasks_created INTEGER DEFAULT 0,
  p_tasks_linked INTEGER DEFAULT 0,
  p_sync_operations INTEGER DEFAULT 0,
  p_sync_errors INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO github_repository_stats (
    integration_id,
    date,
    prs_opened,
    prs_closed,
    prs_merged,
    issues_opened,
    issues_closed,
    commits_pushed,
    tasks_created,
    tasks_linked,
    sync_operations,
    sync_errors
  ) VALUES (
    p_integration_id,
    p_date,
    p_prs_opened,
    p_prs_closed,
    p_prs_merged,
    p_issues_opened,
    p_issues_closed,
    p_commits_pushed,
    p_tasks_created,
    p_tasks_linked,
    p_sync_operations,
    p_sync_errors
  )
  ON CONFLICT (integration_id, date)
  DO UPDATE SET
    prs_opened = github_repository_stats.prs_opened + p_prs_opened,
    prs_closed = github_repository_stats.prs_closed + p_prs_closed,
    prs_merged = github_repository_stats.prs_merged + p_prs_merged,
    issues_opened = github_repository_stats.issues_opened + p_issues_opened,
    issues_closed = github_repository_stats.issues_closed + p_issues_closed,
    commits_pushed = github_repository_stats.commits_pushed + p_commits_pushed,
    tasks_created = github_repository_stats.tasks_created + p_tasks_created,
    tasks_linked = github_repository_stats.tasks_linked + p_tasks_linked,
    sync_operations = github_repository_stats.sync_operations + p_sync_operations,
    sync_errors = github_repository_stats.sync_errors + p_sync_errors,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get GitHub integration analytics
CREATE OR REPLACE FUNCTION get_github_integration_analytics(
  p_integration_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  integration_id UUID,
  repository_name TEXT,
  total_prs BIGINT,
  total_issues BIGINT,
  total_commits BIGINT,
  total_tasks_linked BIGINT,
  sync_success_rate DECIMAL(5,2),
  avg_sync_time_ms DECIMAL(10,2),
  last_sync_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gi.id as integration_id,
    CONCAT(gi.repository_owner, '/', gi.repository_name) as repository_name,
    COALESCE(SUM(grs.prs_opened + grs.prs_closed + grs.prs_merged), 0) as total_prs,
    COALESCE(SUM(grs.issues_opened + grs.issues_closed), 0) as total_issues,
    COALESCE(SUM(grs.commits_pushed), 0) as total_commits,
    COALESCE(SUM(grs.tasks_linked), 0) as total_tasks_linked,
    CASE 
      WHEN SUM(grs.sync_operations) > 0 THEN 
        ((SUM(grs.sync_operations) - SUM(grs.sync_errors))::DECIMAL / SUM(grs.sync_operations)) * 100
      ELSE 0 
    END as sync_success_rate,
    AVG(gsh.processing_time_ms) as avg_sync_time_ms,
    gi.last_sync_at
  FROM github_integrations gi
  LEFT JOIN github_repository_stats grs ON gi.id = grs.integration_id
    AND grs.date >= CURRENT_DATE - INTERVAL '1 day' * p_days
  LEFT JOIN github_sync_history gsh ON gi.id = gsh.integration_id
    AND gsh.created_at >= NOW() - INTERVAL '1 day' * p_days
  WHERE (p_integration_id IS NULL OR gi.id = p_integration_id)
    AND gi.is_active = true
  GROUP BY gi.id, gi.repository_owner, gi.repository_name, gi.last_sync_at
  ORDER BY total_tasks_linked DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get GitHub links for a task
CREATE OR REPLACE FUNCTION get_task_github_links(p_task_id UUID)
RETURNS TABLE (
  id UUID,
  github_type VARCHAR(50),
  github_number INTEGER,
  github_url TEXT,
  github_title TEXT,
  github_state VARCHAR(50),
  github_author VARCHAR(255),
  github_assignees TEXT[],
  github_labels TEXT[],
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gl.id,
    gl.github_type,
    gl.github_number,
    gl.github_url,
    gl.github_title,
    gl.github_state,
    gl.github_author,
    gl.github_assignees,
    gl.github_labels,
    gl.sync_status,
    gl.last_synced_at,
    gl.created_at
  FROM github_links gl
  WHERE gl.task_id = p_task_id
  ORDER BY gl.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_repository_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for GitHub integrations
CREATE POLICY "Users can view own GitHub integrations" ON github_integrations 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create GitHub integrations" ON github_integrations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GitHub integrations" ON github_integrations 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GitHub integrations" ON github_integrations 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for GitHub links
CREATE POLICY "Users can view GitHub links for their tasks" ON github_links 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM hero_tasks ht 
      WHERE ht.id = github_links.task_id 
      AND ht.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create GitHub links for their tasks" ON github_links 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM hero_tasks ht 
      WHERE ht.id = github_links.task_id 
      AND ht.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update GitHub links for their tasks" ON github_links 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM hero_tasks ht 
      WHERE ht.id = github_links.task_id 
      AND ht.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete GitHub links for their tasks" ON github_links 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM hero_tasks ht 
      WHERE ht.id = github_links.task_id 
      AND ht.created_by = auth.uid()
    )
  );

-- RLS Policies for GitHub sync history
CREATE POLICY "Users can view GitHub sync history for their integrations" ON github_sync_history 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM github_integrations gi 
      WHERE gi.id = github_sync_history.integration_id 
      AND gi.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create GitHub sync history for their integrations" ON github_sync_history 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM github_integrations gi 
      WHERE gi.id = github_sync_history.integration_id 
      AND gi.user_id = auth.uid()
    )
  );

-- RLS Policies for GitHub webhook events
CREATE POLICY "Users can view GitHub webhook events for their integrations" ON github_webhook_events 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM github_integrations gi 
      WHERE gi.id = github_webhook_events.integration_id 
      AND gi.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create GitHub webhook events for their integrations" ON github_webhook_events 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM github_integrations gi 
      WHERE gi.id = github_webhook_events.integration_id 
      AND gi.user_id = auth.uid()
    )
  );

-- RLS Policies for GitHub repository stats
CREATE POLICY "Users can view GitHub repository stats for their integrations" ON github_repository_stats 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM github_integrations gi 
      WHERE gi.id = github_repository_stats.integration_id 
      AND gi.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create GitHub repository stats for their integrations" ON github_repository_stats 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM github_integrations gi 
      WHERE gi.id = github_repository_stats.integration_id 
      AND gi.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update GitHub repository stats for their integrations" ON github_repository_stats 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM github_integrations gi 
      WHERE gi.id = github_repository_stats.integration_id 
      AND gi.user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE github_integrations IS 'GitHub repository integrations for Hero Tasks';
COMMENT ON TABLE github_links IS 'Links between Hero Tasks and GitHub items (PRs, issues, commits)';
COMMENT ON TABLE github_sync_history IS 'History of GitHub sync operations';
COMMENT ON TABLE github_webhook_events IS 'GitHub webhook events for debugging and analytics';
COMMENT ON TABLE github_repository_stats IS 'Daily statistics for GitHub repositories';

COMMENT ON COLUMN github_integrations.sync_settings IS 'JSON configuration for sync behavior';
COMMENT ON COLUMN github_integrations.webhook_secret IS 'Secret for verifying GitHub webhook signatures';
COMMENT ON COLUMN github_links.github_type IS 'Type of GitHub item: pull_request, issue, or commit';
COMMENT ON COLUMN github_links.sync_status IS 'Current sync status: synced, pending, or error';
COMMENT ON COLUMN github_sync_history.sync_direction IS 'Direction of sync: github_to_task, task_to_github, or bidirectional';
COMMENT ON COLUMN github_webhook_events.payload IS 'Complete webhook payload from GitHub';
COMMENT ON COLUMN github_repository_stats.date IS 'Date for which statistics are recorded';
