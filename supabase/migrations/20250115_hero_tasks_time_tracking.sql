-- Migration: Create Hero Tasks Time Tracking Schema
-- HT-004.2.4: Time Tracking System
-- Date: 2025-09-15

-- Create time_entries table for tracking time spent on tasks
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES hero_tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  is_manual BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Create time_tracking_sessions table for active tracking sessions
CREATE TABLE IF NOT EXISTS time_tracking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES hero_tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create time_tracking_settings table for user preferences
CREATE TABLE IF NOT EXISTS time_tracking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  auto_tracking_enabled BOOLEAN DEFAULT true,
  idle_timeout_minutes INTEGER DEFAULT 15,
  break_reminder_minutes INTEGER DEFAULT 60,
  daily_goal_hours DECIMAL(4,2) DEFAULT 8.0,
  weekly_goal_hours DECIMAL(4,2) DEFAULT 40.0,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create time_tracking_reports table for generated reports
CREATE TABLE IF NOT EXISTS time_tracking_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
  report_period_start TIMESTAMPTZ NOT NULL,
  report_period_end TIMESTAMPTZ NOT NULL,
  total_hours DECIMAL(6,2) DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  tasks_tracked INTEGER DEFAULT 0,
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_end_time ON time_entries(end_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_is_active ON time_entries(is_active);
CREATE INDEX IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at);

CREATE INDEX IF NOT EXISTS idx_time_tracking_sessions_task_id ON time_tracking_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_sessions_user_id ON time_tracking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_sessions_is_active ON time_tracking_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_time_tracking_sessions_start_time ON time_tracking_sessions(start_time);

CREATE INDEX IF NOT EXISTS idx_time_tracking_settings_user_id ON time_tracking_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_time_tracking_reports_user_id ON time_tracking_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_reports_type ON time_tracking_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_time_tracking_reports_period ON time_tracking_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_time_tracking_reports_created_at ON time_tracking_reports(created_at);

-- Enable Row Level Security
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own time entries" ON time_entries;
CREATE POLICY "Users can insert their own time entries" ON time_entries
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
CREATE POLICY "Users can update their own time entries" ON time_entries
  FOR UPDATE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own time entries" ON time_entries;
CREATE POLICY "Users can delete their own time entries" ON time_entries
  FOR DELETE USING (user_id = auth.uid()::text);

-- RLS Policies for time_tracking_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON time_tracking_sessions;
CREATE POLICY "Users can view their own sessions" ON time_tracking_sessions
  FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own sessions" ON time_tracking_sessions;
CREATE POLICY "Users can insert their own sessions" ON time_tracking_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own sessions" ON time_tracking_sessions;
CREATE POLICY "Users can update their own sessions" ON time_tracking_sessions
  FOR UPDATE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own sessions" ON time_tracking_sessions;
CREATE POLICY "Users can delete their own sessions" ON time_tracking_sessions
  FOR DELETE USING (user_id = auth.uid()::text);

-- RLS Policies for time_tracking_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON time_tracking_settings;
CREATE POLICY "Users can view their own settings" ON time_tracking_settings
  FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own settings" ON time_tracking_settings;
CREATE POLICY "Users can insert their own settings" ON time_tracking_settings
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own settings" ON time_tracking_settings;
CREATE POLICY "Users can update their own settings" ON time_tracking_settings
  FOR UPDATE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own settings" ON time_tracking_settings;
CREATE POLICY "Users can delete their own settings" ON time_tracking_settings
  FOR DELETE USING (user_id = auth.uid()::text);

-- RLS Policies for time_tracking_reports
DROP POLICY IF EXISTS "Users can view their own reports" ON time_tracking_reports;
CREATE POLICY "Users can view their own reports" ON time_tracking_reports
  FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own reports" ON time_tracking_reports;
CREATE POLICY "Users can insert their own reports" ON time_tracking_reports
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own reports" ON time_tracking_reports;
CREATE POLICY "Users can update their own reports" ON time_tracking_reports
  FOR UPDATE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own reports" ON time_tracking_reports;
CREATE POLICY "Users can delete their own reports" ON time_tracking_reports
  FOR DELETE USING (user_id = auth.uid()::text);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON time_entries;
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_tracking_sessions_updated_at ON time_tracking_sessions;
CREATE TRIGGER update_time_tracking_sessions_updated_at
  BEFORE UPDATE ON time_tracking_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_tracking_settings_updated_at ON time_tracking_settings;
CREATE TRIGGER update_time_tracking_settings_updated_at
  BEFORE UPDATE ON time_tracking_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_tracking_reports_updated_at ON time_tracking_reports;
CREATE TRIGGER update_time_tracking_reports_updated_at
  BEFORE UPDATE ON time_tracking_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate duration automatically
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic duration calculation
DROP TRIGGER IF EXISTS calculate_duration_trigger ON time_entries;
CREATE TRIGGER calculate_duration_trigger
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION calculate_time_entry_duration();

-- Create function to stop inactive sessions
CREATE OR REPLACE FUNCTION stop_inactive_sessions()
RETURNS void AS $$
DECLARE
  session_record RECORD;
  idle_timeout_minutes INTEGER := 15; -- Default idle timeout
BEGIN
  -- Get sessions that have been inactive for more than the timeout period
  FOR session_record IN 
    SELECT s.*, ts.idle_timeout_minutes
    FROM time_tracking_sessions s
    LEFT JOIN time_tracking_settings ts ON s.user_id = ts.user_id
    WHERE s.is_active = true 
      AND s.last_activity < NOW() - INTERVAL '1 minute' * COALESCE(ts.idle_timeout_minutes, idle_timeout_minutes)
  LOOP
    -- Create time entry for the session
    INSERT INTO time_entries (
      task_id, 
      user_id, 
      description, 
      start_time, 
      end_time, 
      is_active, 
      is_manual,
      created_by
    ) VALUES (
      session_record.task_id,
      session_record.user_id,
      'Auto-tracked session (inactive timeout)',
      session_record.start_time,
      session_record.last_activity,
      false,
      false,
      session_record.user_id
    );
    
    -- Mark session as inactive
    UPDATE time_tracking_sessions 
    SET is_active = false, updated_at = NOW()
    WHERE id = session_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to get active session for user
CREATE OR REPLACE FUNCTION get_active_session(user_id_param TEXT)
RETURNS TABLE (
  id UUID,
  task_id UUID,
  start_time TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,
  duration_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.task_id,
    s.start_time,
    s.last_activity,
    EXTRACT(EPOCH FROM (NOW() - s.start_time)) / 60 AS duration_minutes
  FROM time_tracking_sessions s
  WHERE s.user_id = user_id_param 
    AND s.is_active = true
  ORDER BY s.start_time DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to get time tracking summary
CREATE OR REPLACE FUNCTION get_time_tracking_summary(
  user_id_param TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_hours DECIMAL(6,2),
  total_entries INTEGER,
  tasks_tracked INTEGER,
  average_session_hours DECIMAL(4,2),
  most_active_day TEXT,
  most_active_task_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(te.duration_minutes) / 60.0, 0) AS total_hours,
    COUNT(te.id) AS total_entries,
    COUNT(DISTINCT te.task_id) AS tasks_tracked,
    COALESCE(AVG(te.duration_minutes) / 60.0, 0) AS average_session_hours,
    TO_CHAR(te.start_time, 'Day') AS most_active_day,
    te.task_id AS most_active_task_id
  FROM time_entries te
  WHERE te.user_id = user_id_param
    AND te.start_time >= start_date
    AND te.start_time <= end_date
    AND te.is_active = false
  GROUP BY te.task_id, TO_CHAR(te.start_time, 'Day')
  ORDER BY SUM(te.duration_minutes) DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Insert sample time tracking settings
INSERT INTO time_tracking_settings (user_id, auto_tracking_enabled, idle_timeout_minutes, break_reminder_minutes, daily_goal_hours, weekly_goal_hours, timezone) VALUES
  ('developer1', true, 15, 60, 8.0, 40.0, 'UTC'),
  ('developer2', true, 20, 90, 7.5, 37.5, 'UTC')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample time entries
INSERT INTO time_entries (task_id, user_id, description, start_time, end_time, duration_minutes, is_active, is_manual, created_by) VALUES
  ((SELECT id FROM hero_tasks WHERE title = 'Setup Analytics Dashboard'), 'developer1', 'Initial setup and configuration', NOW() - INTERVAL '12 days' + INTERVAL '2 hours', NOW() - INTERVAL '12 days' + INTERVAL '4 hours', 120, false, true, 'developer1'),
  ((SELECT id FROM hero_tasks WHERE title = 'Setup Analytics Dashboard'), 'developer1', 'Testing and debugging', NOW() - INTERVAL '11 days' + INTERVAL '1 hour', NOW() - INTERVAL '11 days' + INTERVAL '2 hours', 60, false, true, 'developer1'),
  ((SELECT id FROM hero_tasks WHERE title = 'Create Burndown Charts'), 'developer2', 'Chart implementation', NOW() - INTERVAL '10 days' + INTERVAL '3 hours', NOW() - INTERVAL '10 days' + INTERVAL '5 hours', 120, false, true, 'developer2'),
  ((SELECT id FROM hero_tasks WHERE title = 'Implement Velocity Tracking'), 'developer1', 'Velocity calculations', NOW() - INTERVAL '9 days' + INTERVAL '2 hours', NOW() - INTERVAL '9 days' + INTERVAL '4 hours', 120, false, true, 'developer1'),
  ((SELECT id FROM hero_tasks WHERE title = 'Add Productivity Insights'), 'developer2', 'Insights algorithm development', NOW() - INTERVAL '6 days' + INTERVAL '1 hour', NOW() - INTERVAL '6 days' + INTERVAL '3 hours', 120, false, true, 'developer2'),
  ((SELECT id FROM hero_tasks WHERE title = 'Add Productivity Insights'), 'developer2', 'UI integration', NOW() - INTERVAL '5 days' + INTERVAL '2 hours', NOW() - INTERVAL '5 days' + INTERVAL '4 hours', 120, false, true, 'developer2')
ON CONFLICT DO NOTHING;

-- Add table comments
COMMENT ON TABLE time_entries IS 'Time tracking entries for tasks';
COMMENT ON TABLE time_tracking_sessions IS 'Active time tracking sessions';
COMMENT ON TABLE time_tracking_settings IS 'User preferences for time tracking';
COMMENT ON TABLE time_tracking_reports IS 'Generated time tracking reports';

-- Add column comments
COMMENT ON COLUMN time_entries.duration_minutes IS 'Duration in minutes, calculated automatically';
COMMENT ON COLUMN time_entries.is_active IS 'Whether this is an active tracking session';
COMMENT ON COLUMN time_entries.is_manual IS 'Whether this entry was manually created';
COMMENT ON COLUMN time_tracking_sessions.last_activity IS 'Last recorded activity timestamp';
COMMENT ON COLUMN time_tracking_settings.idle_timeout_minutes IS 'Minutes of inactivity before auto-stop';
COMMENT ON COLUMN time_tracking_settings.break_reminder_minutes IS 'Minutes between break reminders';
COMMENT ON COLUMN time_tracking_reports.report_data IS 'Detailed report data in JSON format';
