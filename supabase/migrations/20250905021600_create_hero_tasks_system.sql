-- Hero Tasks System Database Schema
-- Created: 2025-09-05T02:16:09.652Z
-- Version: 1.0.0

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE task_status AS ENUM (
  'draft',
  'ready', 
  'in_progress',
  'blocked',
  'completed',
  'cancelled'
);

CREATE TYPE task_priority AS ENUM (
  'critical',
  'high',
  'medium',
  'low'
);

CREATE TYPE task_type AS ENUM (
  'feature',
  'bug_fix',
  'refactor',
  'documentation',
  'test',
  'security',
  'performance',
  'integration',
  'migration',
  'maintenance',
  'research',
  'planning',
  'review',
  'deployment',
  'monitoring'
);

CREATE TYPE workflow_phase AS ENUM (
  'audit',
  'decide',
  'apply',
  'verify'
);

-- Main tasks table
CREATE TABLE hero_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_number VARCHAR(20) UNIQUE NOT NULL, -- HT-001, HT-002, etc.
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'draft',
  priority task_priority DEFAULT 'medium',
  type task_type NOT NULL,
  
  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  
  -- Workflow
  current_phase workflow_phase DEFAULT 'audit',
  estimated_duration_hours INTEGER,
  actual_duration_hours INTEGER,
  
  -- Relationships
  parent_task_id UUID REFERENCES hero_tasks(id) ON DELETE CASCADE,
  assignee_id UUID, -- References auth.users(id)
  created_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Audit trail
  audit_trail JSONB DEFAULT '[]',
  
  CONSTRAINT valid_task_number CHECK (task_number ~ '^HT-\d{3}$'),
  CONSTRAINT valid_dates CHECK (
    (started_at IS NULL OR started_at >= created_at) AND
    (completed_at IS NULL OR completed_at >= COALESCE(started_at, created_at)) AND
    (due_date IS NULL OR due_date >= created_at)
  )
);

-- Subtasks table
CREATE TABLE hero_subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES hero_tasks(id) ON DELETE CASCADE,
  subtask_number VARCHAR(20) NOT NULL, -- HT-001.1, HT-001.2, etc.
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'draft',
  priority task_priority DEFAULT 'medium',
  type task_type NOT NULL,
  
  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  
  -- Workflow
  current_phase workflow_phase DEFAULT 'audit',
  estimated_duration_hours INTEGER,
  actual_duration_hours INTEGER,
  
  -- Relationships
  assignee_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Audit trail
  audit_trail JSONB DEFAULT '[]',
  
  CONSTRAINT valid_subtask_number CHECK (subtask_number ~ '^HT-\d{3}\.\d+$'),
  CONSTRAINT valid_subtask_dates CHECK (
    (started_at IS NULL OR started_at >= created_at) AND
    (completed_at IS NULL OR completed_at >= COALESCE(started_at, created_at)) AND
    (due_date IS NULL OR due_date >= created_at)
  ),
  UNIQUE(task_id, subtask_number)
);

-- Actions table (for detailed steps within subtasks)
CREATE TABLE hero_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subtask_id UUID NOT NULL REFERENCES hero_subtasks(id) ON DELETE CASCADE,
  action_number VARCHAR(20) NOT NULL, -- HT-001.1.1, HT-001.1.2, etc.
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'draft',
  priority task_priority DEFAULT 'medium',
  type task_type NOT NULL,
  
  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  
  -- Workflow
  current_phase workflow_phase DEFAULT 'audit',
  estimated_duration_hours INTEGER,
  actual_duration_hours INTEGER,
  
  -- Relationships
  assignee_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Audit trail
  audit_trail JSONB DEFAULT '[]',
  
  CONSTRAINT valid_action_number CHECK (action_number ~ '^HT-\d{3}\.\d+\.\d+$'),
  CONSTRAINT valid_action_dates CHECK (
    (started_at IS NULL OR started_at >= created_at) AND
    (completed_at IS NULL OR completed_at >= COALESCE(started_at, created_at)) AND
    (due_date IS NULL OR due_date >= created_at)
  ),
  UNIQUE(subtask_id, action_number)
);

-- Dependencies table
CREATE TABLE hero_task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dependent_task_id UUID NOT NULL REFERENCES hero_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES hero_tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) DEFAULT 'blocks', -- blocks, relates_to, conflicts_with
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT no_self_dependency CHECK (dependent_task_id != depends_on_task_id),
  UNIQUE(dependent_task_id, depends_on_task_id, dependency_type)
);

-- Subtask dependencies
CREATE TABLE hero_subtask_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dependent_subtask_id UUID NOT NULL REFERENCES hero_subtasks(id) ON DELETE CASCADE,
  depends_on_subtask_id UUID NOT NULL REFERENCES hero_subtasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) DEFAULT 'blocks',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT no_self_subtask_dependency CHECK (dependent_subtask_id != depends_on_subtask_id),
  UNIQUE(dependent_subtask_id, depends_on_subtask_id, dependency_type)
);

-- Action dependencies
CREATE TABLE hero_action_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dependent_action_id UUID NOT NULL REFERENCES hero_actions(id) ON DELETE CASCADE,
  depends_on_action_id UUID NOT NULL REFERENCES hero_actions(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) DEFAULT 'blocks',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT no_self_action_dependency CHECK (dependent_action_id != depends_on_action_id),
  UNIQUE(dependent_action_id, depends_on_action_id, dependency_type)
);

-- Attachments table
CREATE TABLE hero_task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES hero_tasks(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES hero_subtasks(id) ON DELETE CASCADE,
  action_id UUID REFERENCES hero_actions(id) ON DELETE CASCADE,
  attachment_type VARCHAR(50) NOT NULL, -- file, link, screenshot, document
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_path TEXT, -- For file attachments
  file_size BIGINT,
  file_type VARCHAR(100),
  external_url TEXT, -- For links
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT attachment_belongs_to_one CHECK (
    (task_id IS NOT NULL AND subtask_id IS NULL AND action_id IS NULL) OR
    (task_id IS NULL AND subtask_id IS NOT NULL AND action_id IS NULL) OR
    (task_id IS NULL AND subtask_id IS NULL AND action_id IS NOT NULL)
  )
);

-- Comments table
CREATE TABLE hero_task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES hero_tasks(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES hero_subtasks(id) ON DELETE CASCADE,
  action_id UUID REFERENCES hero_actions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type VARCHAR(50) DEFAULT 'comment', -- comment, decision, note, question
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT comment_belongs_to_one CHECK (
    (task_id IS NOT NULL AND subtask_id IS NULL AND action_id IS NULL) OR
    (task_id IS NULL AND subtask_id IS NOT NULL AND action_id IS NULL) OR
    (task_id IS NULL AND subtask_id IS NULL AND action_id IS NOT NULL)
  )
);

-- Workflow history table
CREATE TABLE hero_workflow_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES hero_tasks(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES hero_subtasks(id) ON DELETE CASCADE,
  action_id UUID REFERENCES hero_actions(id) ON DELETE CASCADE,
  from_status task_status,
  to_status task_status NOT NULL,
  from_phase workflow_phase,
  to_phase workflow_phase,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT workflow_belongs_to_one CHECK (
    (task_id IS NOT NULL AND subtask_id IS NULL AND action_id IS NULL) OR
    (task_id IS NULL AND subtask_id IS NOT NULL AND action_id IS NULL) OR
    (task_id IS NULL AND subtask_id IS NULL AND action_id IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_hero_tasks_status ON hero_tasks(status);
CREATE INDEX idx_hero_tasks_priority ON hero_tasks(priority);
CREATE INDEX idx_hero_tasks_type ON hero_tasks(type);
CREATE INDEX idx_hero_tasks_assignee ON hero_tasks(assignee_id);
CREATE INDEX idx_hero_tasks_created_by ON hero_tasks(created_by);
CREATE INDEX idx_hero_tasks_parent ON hero_tasks(parent_task_id);
CREATE INDEX idx_hero_tasks_tags ON hero_tasks USING GIN(tags);
CREATE INDEX idx_hero_tasks_metadata ON hero_tasks USING GIN(metadata);
CREATE INDEX idx_hero_tasks_task_number ON hero_tasks(task_number);
CREATE INDEX idx_hero_tasks_created_at ON hero_tasks(created_at);
CREATE INDEX idx_hero_tasks_due_date ON hero_tasks(due_date);

CREATE INDEX idx_hero_subtasks_task_id ON hero_subtasks(task_id);
CREATE INDEX idx_hero_subtasks_status ON hero_subtasks(status);
CREATE INDEX idx_hero_subtasks_priority ON hero_subtasks(priority);
CREATE INDEX idx_hero_subtasks_type ON hero_subtasks(type);
CREATE INDEX idx_hero_subtasks_assignee ON hero_subtasks(assignee_id);
CREATE INDEX idx_hero_subtasks_tags ON hero_subtasks USING GIN(tags);
CREATE INDEX idx_hero_subtasks_subtask_number ON hero_subtasks(subtask_number);

CREATE INDEX idx_hero_actions_subtask_id ON hero_actions(subtask_id);
CREATE INDEX idx_hero_actions_status ON hero_actions(status);
CREATE INDEX idx_hero_actions_priority ON hero_actions(priority);
CREATE INDEX idx_hero_actions_type ON hero_actions(type);
CREATE INDEX idx_hero_actions_assignee ON hero_actions(assignee_id);
CREATE INDEX idx_hero_actions_tags ON hero_actions USING GIN(tags);
CREATE INDEX idx_hero_actions_action_number ON hero_actions(action_number);

CREATE INDEX idx_hero_dependencies_dependent ON hero_task_dependencies(dependent_task_id);
CREATE INDEX idx_hero_dependencies_depends_on ON hero_task_dependencies(depends_on_task_id);

CREATE INDEX idx_hero_subtask_dependencies_dependent ON hero_subtask_dependencies(dependent_subtask_id);
CREATE INDEX idx_hero_subtask_dependencies_depends_on ON hero_subtask_dependencies(depends_on_subtask_id);

CREATE INDEX idx_hero_action_dependencies_dependent ON hero_action_dependencies(dependent_action_id);
CREATE INDEX idx_hero_action_dependencies_depends_on ON hero_action_dependencies(depends_on_action_id);

CREATE INDEX idx_hero_attachments_task ON hero_task_attachments(task_id);
CREATE INDEX idx_hero_attachments_subtask ON hero_task_attachments(subtask_id);
CREATE INDEX idx_hero_attachments_action ON hero_task_attachments(action_id);

CREATE INDEX idx_hero_comments_task ON hero_task_comments(task_id);
CREATE INDEX idx_hero_comments_subtask ON hero_task_comments(subtask_id);
CREATE INDEX idx_hero_comments_action ON hero_task_comments(action_id);
CREATE INDEX idx_hero_comments_created_at ON hero_task_comments(created_at);

CREATE INDEX idx_hero_workflow_task ON hero_workflow_history(task_id);
CREATE INDEX idx_hero_workflow_subtask ON hero_workflow_history(subtask_id);
CREATE INDEX idx_hero_workflow_action ON hero_workflow_history(action_id);
CREATE INDEX idx_hero_workflow_created_at ON hero_workflow_history(created_at);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_hero_tasks_updated_at BEFORE UPDATE ON hero_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_subtasks_updated_at BEFORE UPDATE ON hero_subtasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_actions_updated_at BEFORE UPDATE ON hero_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_comments_updated_at BEFORE UPDATE ON hero_task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate next task number
CREATE OR REPLACE FUNCTION generate_next_task_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(task_number FROM 'HT-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM hero_tasks
  WHERE task_number ~ '^HT-\d+$';
  
  RETURN 'HT-' || LPAD(next_number::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate next subtask number
CREATE OR REPLACE FUNCTION generate_next_subtask_number(task_id UUID)
RETURNS TEXT AS $$
DECLARE
  parent_number TEXT;
  next_subtask INTEGER;
BEGIN
  -- Get parent task number
  SELECT task_number INTO parent_number
  FROM hero_tasks
  WHERE id = task_id;
  
  -- Get next subtask number
  SELECT COALESCE(MAX(CAST(SUBSTRING(subtask_number FROM 'HT-\d+\.(\d+)') AS INTEGER)), 0) + 1
  INTO next_subtask
  FROM hero_subtasks
  WHERE hero_subtasks.task_id = generate_next_subtask_number.task_id;
  
  RETURN parent_number || '.' || next_subtask;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next action number
CREATE OR REPLACE FUNCTION generate_next_action_number(subtask_id UUID)
RETURNS TEXT AS $$
DECLARE
  parent_number TEXT;
  next_action INTEGER;
BEGIN
  -- Get parent subtask number
  SELECT subtask_number INTO parent_number
  FROM hero_subtasks
  WHERE id = subtask_id;
  
  -- Get next action number
  SELECT COALESCE(MAX(CAST(SUBSTRING(action_number FROM 'HT-\d+\.\d+\.(\d+)') AS INTEGER)), 0) + 1
  INTO next_action
  FROM hero_actions
  WHERE hero_actions.subtask_id = generate_next_action_number.subtask_id;
  
  RETURN parent_number || '.' || next_action;
END;
$$ LANGUAGE plpgsql;

-- Function to log workflow changes
CREATE OR REPLACE FUNCTION log_workflow_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO hero_workflow_history (
      task_id, subtask_id, action_id,
      from_status, to_status,
      from_phase, to_phase,
      reason,
      created_by
    ) VALUES (
      CASE WHEN TG_TABLE_NAME = 'hero_tasks' THEN NEW.id ELSE NULL END,
      CASE WHEN TG_TABLE_NAME = 'hero_subtasks' THEN NEW.id ELSE NULL END,
      CASE WHEN TG_TABLE_NAME = 'hero_actions' THEN NEW.id ELSE NULL END,
      OLD.status, NEW.status,
      OLD.current_phase, NEW.current_phase,
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      NEW.assignee_id
    );
  END IF;
  
  -- Log phase change
  IF OLD.current_phase IS DISTINCT FROM NEW.current_phase THEN
    INSERT INTO hero_workflow_history (
      task_id, subtask_id, action_id,
      from_status, to_status,
      from_phase, to_phase,
      reason,
      created_by
    ) VALUES (
      CASE WHEN TG_TABLE_NAME = 'hero_tasks' THEN NEW.id ELSE NULL END,
      CASE WHEN TG_TABLE_NAME = 'hero_subtasks' THEN NEW.id ELSE NULL END,
      CASE WHEN TG_TABLE_NAME = 'hero_actions' THEN NEW.id ELSE NULL END,
      NEW.status, NEW.status,
      OLD.current_phase, NEW.current_phase,
      'Phase changed from ' || OLD.current_phase || ' to ' || NEW.current_phase,
      NEW.assignee_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for workflow logging
CREATE TRIGGER log_hero_tasks_workflow AFTER UPDATE ON hero_tasks FOR EACH ROW EXECUTE FUNCTION log_workflow_change();
CREATE TRIGGER log_hero_subtasks_workflow AFTER UPDATE ON hero_subtasks FOR EACH ROW EXECUTE FUNCTION log_workflow_change();
CREATE TRIGGER log_hero_actions_workflow AFTER UPDATE ON hero_actions FOR EACH ROW EXECUTE FUNCTION log_workflow_change();

-- Row Level Security (RLS) policies
ALTER TABLE hero_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_subtask_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_action_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_workflow_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - can be customized based on your auth requirements)
CREATE POLICY "Users can view all tasks" ON hero_tasks FOR SELECT USING (true);
CREATE POLICY "Users can create tasks" ON hero_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update tasks" ON hero_tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete tasks" ON hero_tasks FOR DELETE USING (true);

CREATE POLICY "Users can view all subtasks" ON hero_subtasks FOR SELECT USING (true);
CREATE POLICY "Users can create subtasks" ON hero_subtasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update subtasks" ON hero_subtasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete subtasks" ON hero_subtasks FOR DELETE USING (true);

CREATE POLICY "Users can view all actions" ON hero_actions FOR SELECT USING (true);
CREATE POLICY "Users can create actions" ON hero_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update actions" ON hero_actions FOR UPDATE USING (true);
CREATE POLICY "Users can delete actions" ON hero_actions FOR DELETE USING (true);

CREATE POLICY "Users can view all dependencies" ON hero_task_dependencies FOR SELECT USING (true);
CREATE POLICY "Users can create dependencies" ON hero_task_dependencies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update dependencies" ON hero_task_dependencies FOR UPDATE USING (true);
CREATE POLICY "Users can delete dependencies" ON hero_task_dependencies FOR DELETE USING (true);

CREATE POLICY "Users can view all subtask dependencies" ON hero_subtask_dependencies FOR SELECT USING (true);
CREATE POLICY "Users can create subtask dependencies" ON hero_subtask_dependencies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update subtask dependencies" ON hero_subtask_dependencies FOR UPDATE USING (true);
CREATE POLICY "Users can delete subtask dependencies" ON hero_subtask_dependencies FOR DELETE USING (true);

CREATE POLICY "Users can view all action dependencies" ON hero_action_dependencies FOR SELECT USING (true);
CREATE POLICY "Users can create action dependencies" ON hero_action_dependencies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update action dependencies" ON hero_action_dependencies FOR UPDATE USING (true);
CREATE POLICY "Users can delete action dependencies" ON hero_action_dependencies FOR DELETE USING (true);

CREATE POLICY "Users can view all attachments" ON hero_task_attachments FOR SELECT USING (true);
CREATE POLICY "Users can create attachments" ON hero_task_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update attachments" ON hero_task_attachments FOR UPDATE USING (true);
CREATE POLICY "Users can delete attachments" ON hero_task_attachments FOR DELETE USING (true);

CREATE POLICY "Users can view all comments" ON hero_task_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON hero_task_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update comments" ON hero_task_comments FOR UPDATE USING (true);
CREATE POLICY "Users can delete comments" ON hero_task_comments FOR DELETE USING (true);

CREATE POLICY "Users can view all workflow history" ON hero_workflow_history FOR SELECT USING (true);
CREATE POLICY "Users can create workflow history" ON hero_workflow_history FOR INSERT WITH CHECK (true);

-- Comments
COMMENT ON TABLE hero_tasks IS 'Main tasks in the Hero Tasks system';
COMMENT ON TABLE hero_subtasks IS 'Subtasks that belong to main tasks';
COMMENT ON TABLE hero_actions IS 'Detailed actions within subtasks';
COMMENT ON TABLE hero_task_dependencies IS 'Dependencies between main tasks';
COMMENT ON TABLE hero_subtask_dependencies IS 'Dependencies between subtasks';
COMMENT ON TABLE hero_action_dependencies IS 'Dependencies between actions';
COMMENT ON TABLE hero_task_attachments IS 'Files, links, and other attachments for tasks';
COMMENT ON TABLE hero_task_comments IS 'Comments and notes on tasks';
COMMENT ON TABLE hero_workflow_history IS 'Audit trail of status and phase changes';

COMMENT ON COLUMN hero_tasks.task_number IS 'Unique task identifier in format HT-001, HT-002, etc.';
COMMENT ON COLUMN hero_tasks.current_phase IS 'Current phase in audit-decide-apply-verify workflow';
COMMENT ON COLUMN hero_tasks.audit_trail IS 'JSON array of audit trail entries';
COMMENT ON COLUMN hero_tasks.metadata IS 'Additional structured data for the task';
COMMENT ON COLUMN hero_tasks.tags IS 'Array of tags for categorization and filtering';
