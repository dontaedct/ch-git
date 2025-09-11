-- Hero Tasks Granular Permissions System
-- HT-004.5.1: Implement role-based access control with task-level permissions
-- Created: 2025-09-08T17:50:00.000Z

-- Create task permission types
CREATE TYPE task_permission AS ENUM (
  'read',
  'write', 
  'delete',
  'assign',
  'comment',
  'attach',
  'manage_dependencies',
  'change_status',
  'manage_metadata'
);

-- Create task access level enum
CREATE TYPE task_access_level AS ENUM (
  'public',      -- Anyone can see
  'team',        -- Team members only
  'private',     -- Creator and assignees only
  'restricted'   -- Custom permissions only
);

-- Add access control columns to hero_tasks table
ALTER TABLE hero_tasks 
ADD COLUMN access_level task_access_level DEFAULT 'team',
ADD COLUMN owner_id UUID REFERENCES auth.users(id),
ADD COLUMN team_id UUID, -- For team-based access
ADD COLUMN custom_permissions JSONB DEFAULT '{}';

-- Add access control columns to hero_subtasks table  
ALTER TABLE hero_subtasks
ADD COLUMN access_level task_access_level DEFAULT 'team',
ADD COLUMN owner_id UUID REFERENCES auth.users(id),
ADD COLUMN team_id UUID,
ADD COLUMN custom_permissions JSONB DEFAULT '{}';

-- Add access control columns to hero_actions table
ALTER TABLE hero_actions
ADD COLUMN access_level task_access_level DEFAULT 'team', 
ADD COLUMN owner_id UUID REFERENCES auth.users(id),
ADD COLUMN team_id UUID,
ADD COLUMN custom_permissions JSONB DEFAULT '{}';

-- Create task permissions table for custom permissions
CREATE TABLE hero_task_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES hero_tasks(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES hero_subtasks(id) ON DELETE CASCADE,
  action_id UUID REFERENCES hero_actions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID, -- For role-based permissions
  permission task_permission NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  CONSTRAINT permission_belongs_to_one CHECK (
    (task_id IS NOT NULL AND subtask_id IS NULL AND action_id IS NULL) OR
    (task_id IS NULL AND subtask_id IS NOT NULL AND action_id IS NULL) OR
    (task_id IS NULL AND subtask_id IS NULL AND action_id IS NOT NULL)
  ),
  CONSTRAINT no_duplicate_permissions UNIQUE (task_id, subtask_id, action_id, user_id, permission)
);

-- Create team memberships table
CREATE TABLE hero_team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  
  UNIQUE(team_id, user_id)
);

-- Create teams table
CREATE TABLE hero_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB DEFAULT '{}'
);

-- Add foreign key constraint for team_id
ALTER TABLE hero_tasks ADD CONSTRAINT fk_hero_tasks_team 
  FOREIGN KEY (team_id) REFERENCES hero_teams(id) ON DELETE SET NULL;
ALTER TABLE hero_subtasks ADD CONSTRAINT fk_hero_subtasks_team 
  FOREIGN KEY (team_id) REFERENCES hero_teams(id) ON DELETE SET NULL;
ALTER TABLE hero_actions ADD CONSTRAINT fk_hero_actions_team 
  FOREIGN KEY (team_id) REFERENCES hero_teams(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_hero_tasks_access_level ON hero_tasks(access_level);
CREATE INDEX idx_hero_tasks_owner_id ON hero_tasks(owner_id);
CREATE INDEX idx_hero_tasks_team_id ON hero_tasks(team_id);
CREATE INDEX idx_hero_tasks_custom_permissions ON hero_tasks USING GIN(custom_permissions);

CREATE INDEX idx_hero_subtasks_access_level ON hero_subtasks(access_level);
CREATE INDEX idx_hero_subtasks_owner_id ON hero_subtasks(owner_id);
CREATE INDEX idx_hero_subtasks_team_id ON hero_subtasks(team_id);
CREATE INDEX idx_hero_subtasks_custom_permissions ON hero_subtasks USING GIN(custom_permissions);

CREATE INDEX idx_hero_actions_access_level ON hero_actions(access_level);
CREATE INDEX idx_hero_actions_owner_id ON hero_actions(owner_id);
CREATE INDEX idx_hero_actions_team_id ON hero_actions(team_id);
CREATE INDEX idx_hero_actions_custom_permissions ON hero_actions USING GIN(custom_permissions);

CREATE INDEX idx_hero_task_permissions_task ON hero_task_permissions(task_id);
CREATE INDEX idx_hero_task_permissions_subtask ON hero_task_permissions(subtask_id);
CREATE INDEX idx_hero_task_permissions_action ON hero_task_permissions(action_id);
CREATE INDEX idx_hero_task_permissions_user ON hero_task_permissions(user_id);
CREATE INDEX idx_hero_task_permissions_permission ON hero_task_permissions(permission);

CREATE INDEX idx_hero_team_memberships_team ON hero_team_memberships(team_id);
CREATE INDEX idx_hero_team_memberships_user ON hero_team_memberships(user_id);
CREATE INDEX idx_hero_team_memberships_role ON hero_team_memberships(role);

CREATE INDEX idx_hero_teams_owner ON hero_teams(owner_id);

-- Enable RLS on new tables
ALTER TABLE hero_task_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hero_task_permissions
CREATE POLICY "Users can view their own permissions" ON hero_task_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Task owners can manage permissions" ON hero_task_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM hero_tasks 
      WHERE id = hero_task_permissions.task_id 
      AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM hero_subtasks 
      WHERE id = hero_task_permissions.subtask_id 
      AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM hero_actions 
      WHERE id = hero_task_permissions.action_id 
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for hero_team_memberships
CREATE POLICY "Team members can view team memberships" ON hero_team_memberships
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM hero_team_memberships htm2 
      WHERE htm2.team_id = hero_team_memberships.team_id 
      AND htm2.user_id = auth.uid() 
      AND htm2.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners can manage memberships" ON hero_team_memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM hero_teams 
      WHERE id = hero_team_memberships.team_id 
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for hero_teams
CREATE POLICY "Team members can view teams" ON hero_teams
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM hero_team_memberships 
      WHERE team_id = hero_teams.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage teams" ON hero_teams
  FOR ALL USING (owner_id = auth.uid());

-- Function to check if user has permission on a task
CREATE OR REPLACE FUNCTION has_task_permission(
  p_user_id UUID,
  p_task_id UUID DEFAULT NULL,
  p_subtask_id UUID DEFAULT NULL, 
  p_action_id UUID DEFAULT NULL,
  p_permission task_permission
) RETURNS BOOLEAN AS $$
DECLARE
  task_access task_access_level;
  task_owner UUID;
  task_team UUID;
  user_role user_role;
  has_custom_permission BOOLEAN := FALSE;
BEGIN
  -- Get task details
  IF p_task_id IS NOT NULL THEN
    SELECT access_level, owner_id, team_id INTO task_access, task_owner, task_team
    FROM hero_tasks WHERE id = p_task_id;
  ELSIF p_subtask_id IS NOT NULL THEN
    SELECT access_level, owner_id, team_id INTO task_access, task_owner, task_team
    FROM hero_subtasks WHERE id = p_subtask_id;
  ELSIF p_action_id IS NOT NULL THEN
    SELECT access_level, owner_id, team_id INTO task_access, task_owner, task_team
    FROM hero_actions WHERE id = p_action_id;
  ELSE
    RETURN FALSE;
  END IF;

  -- Owner always has all permissions
  IF task_owner = p_user_id THEN
    RETURN TRUE;
  END IF;

  -- Check custom permissions first
  SELECT EXISTS (
    SELECT 1 FROM hero_task_permissions 
    WHERE (task_id = p_task_id OR subtask_id = p_subtask_id OR action_id = p_action_id)
    AND user_id = p_user_id 
    AND permission = p_permission
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO has_custom_permission;

  IF has_custom_permission THEN
    RETURN TRUE;
  END IF;

  -- Check team membership if task is team-scoped
  IF task_access = 'team' AND task_team IS NOT NULL THEN
    SELECT role INTO user_role
    FROM hero_team_memberships 
    WHERE team_id = task_team AND user_id = p_user_id;
    
    IF user_role IS NOT NULL THEN
      -- Apply role-based permissions
      CASE user_role
        WHEN 'owner', 'admin' THEN RETURN TRUE;
        WHEN 'member', 'staff' THEN 
          RETURN p_permission IN ('read', 'write', 'comment', 'attach', 'change_status');
        WHEN 'viewer' THEN 
          RETURN p_permission = 'read';
        ELSE RETURN FALSE;
      END CASE;
    END IF;
  END IF;

  -- Check global user role for public tasks
  IF task_access = 'public' THEN
    SELECT role INTO user_role
    FROM clients 
    WHERE email = (SELECT email FROM auth.users WHERE id = p_user_id);
    
    IF user_role IS NOT NULL THEN
      CASE user_role
        WHEN 'owner', 'admin' THEN RETURN TRUE;
        WHEN 'member', 'staff' THEN 
          RETURN p_permission IN ('read', 'write', 'comment', 'attach', 'change_status');
        WHEN 'viewer' THEN 
          RETURN p_permission = 'read';
        ELSE RETURN FALSE;
      END CASE;
    END IF;
  END IF;

  -- Private tasks only accessible to owner and assignees
  IF task_access = 'private' THEN
    -- Check if user is assignee
    IF p_task_id IS NOT NULL THEN
      RETURN EXISTS (SELECT 1 FROM hero_tasks WHERE id = p_task_id AND assignee_id = p_user_id);
    ELSIF p_subtask_id IS NOT NULL THEN
      RETURN EXISTS (SELECT 1 FROM hero_subtasks WHERE id = p_subtask_id AND assignee_id = p_user_id);
    ELSIF p_action_id IS NOT NULL THEN
      RETURN EXISTS (SELECT 1 FROM hero_actions WHERE id = p_action_id AND assignee_id = p_user_id);
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant permission to a user
CREATE OR REPLACE FUNCTION grant_task_permission(
  p_task_id UUID DEFAULT NULL,
  p_subtask_id UUID DEFAULT NULL,
  p_action_id UUID DEFAULT NULL,
  p_user_id UUID,
  p_permission task_permission,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  task_owner UUID;
BEGIN
  -- Verify the grantor has permission to grant permissions
  IF p_task_id IS NOT NULL THEN
    SELECT owner_id INTO task_owner FROM hero_tasks WHERE id = p_task_id;
  ELSIF p_subtask_id IS NOT NULL THEN
    SELECT owner_id INTO task_owner FROM hero_subtasks WHERE id = p_subtask_id;
  ELSIF p_action_id IS NOT NULL THEN
    SELECT owner_id INTO task_owner FROM hero_actions WHERE id = p_action_id;
  ELSE
    RETURN FALSE;
  END IF;

  -- Only task owner or admin can grant permissions
  IF task_owner != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM clients 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role IN ('owner', 'admin')
  ) THEN
    RETURN FALSE;
  END IF;

  -- Insert or update permission
  INSERT INTO hero_task_permissions (
    task_id, subtask_id, action_id, user_id, permission, granted_by, expires_at
  ) VALUES (
    p_task_id, p_subtask_id, p_action_id, p_user_id, p_permission, auth.uid(), p_expires_at
  )
  ON CONFLICT (task_id, subtask_id, action_id, user_id, permission) 
  DO UPDATE SET 
    granted_by = auth.uid(),
    granted_at = NOW(),
    expires_at = p_expires_at;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke permission from a user
CREATE OR REPLACE FUNCTION revoke_task_permission(
  p_task_id UUID DEFAULT NULL,
  p_subtask_id UUID DEFAULT NULL,
  p_action_id UUID DEFAULT NULL,
  p_user_id UUID,
  p_permission task_permission
) RETURNS BOOLEAN AS $$
DECLARE
  task_owner UUID;
BEGIN
  -- Verify the revoker has permission to revoke permissions
  IF p_task_id IS NOT NULL THEN
    SELECT owner_id INTO task_owner FROM hero_tasks WHERE id = p_task_id;
  ELSIF p_subtask_id IS NOT NULL THEN
    SELECT owner_id INTO task_owner FROM hero_subtasks WHERE id = p_subtask_id;
  ELSIF p_action_id IS NOT NULL THEN
    SELECT owner_id INTO task_owner FROM hero_actions WHERE id = p_action_id;
  ELSE
    RETURN FALSE;
  END IF;

  -- Only task owner or admin can revoke permissions
  IF task_owner != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM clients 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND role IN ('owner', 'admin')
  ) THEN
    RETURN FALSE;
  END IF;

  -- Delete permission
  DELETE FROM hero_task_permissions 
  WHERE (task_id = p_task_id OR subtask_id = p_subtask_id OR action_id = p_action_id)
  AND user_id = p_user_id 
  AND permission = p_permission;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing RLS policies to use the new permission system
DROP POLICY IF EXISTS "Users can view all tasks" ON hero_tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON hero_tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON hero_tasks;
DROP POLICY IF EXISTS "Users can delete tasks" ON hero_tasks;

DROP POLICY IF EXISTS "Users can view all subtasks" ON hero_subtasks;
DROP POLICY IF EXISTS "Users can create subtasks" ON hero_subtasks;
DROP POLICY IF EXISTS "Users can update subtasks" ON hero_subtasks;
DROP POLICY IF EXISTS "Users can delete subtasks" ON hero_subtasks;

DROP POLICY IF EXISTS "Users can view all actions" ON hero_actions;
DROP POLICY IF EXISTS "Users can create actions" ON hero_actions;
DROP POLICY IF EXISTS "Users can update actions" ON hero_actions;
DROP POLICY IF EXISTS "Users can delete actions" ON hero_actions;

-- New granular RLS policies for hero_tasks
CREATE POLICY "Users can view tasks they have read permission for" ON hero_tasks
  FOR SELECT USING (has_task_permission(auth.uid(), id, NULL, NULL, 'read'));

CREATE POLICY "Users can create tasks" ON hero_tasks
  FOR INSERT WITH CHECK (true); -- Anyone can create, but access_level defaults to 'team'

CREATE POLICY "Users can update tasks they have write permission for" ON hero_tasks
  FOR UPDATE USING (has_task_permission(auth.uid(), id, NULL, NULL, 'write'));

CREATE POLICY "Users can delete tasks they have delete permission for" ON hero_tasks
  FOR DELETE USING (has_task_permission(auth.uid(), id, NULL, NULL, 'delete'));

-- New granular RLS policies for hero_subtasks
CREATE POLICY "Users can view subtasks they have read permission for" ON hero_subtasks
  FOR SELECT USING (has_task_permission(auth.uid(), NULL, id, NULL, 'read'));

CREATE POLICY "Users can create subtasks" ON hero_subtasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update subtasks they have write permission for" ON hero_subtasks
  FOR UPDATE USING (has_task_permission(auth.uid(), NULL, id, NULL, 'write'));

CREATE POLICY "Users can delete subtasks they have delete permission for" ON hero_subtasks
  FOR DELETE USING (has_task_permission(auth.uid(), NULL, id, NULL, 'delete'));

-- New granular RLS policies for hero_actions
CREATE POLICY "Users can view actions they have read permission for" ON hero_actions
  FOR SELECT USING (has_task_permission(auth.uid(), NULL, NULL, id, 'read'));

CREATE POLICY "Users can create actions" ON hero_actions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update actions they have write permission for" ON hero_actions
  FOR UPDATE USING (has_task_permission(auth.uid(), NULL, NULL, id, 'write'));

CREATE POLICY "Users can delete actions they have delete permission for" ON hero_actions
  FOR DELETE USING (has_task_permission(auth.uid(), NULL, NULL, id, 'delete'));

-- Update other table policies to respect task permissions
DROP POLICY IF EXISTS "Users can view all comments" ON hero_task_comments;
DROP POLICY IF EXISTS "Users can create comments" ON hero_task_comments;
DROP POLICY IF EXISTS "Users can update comments" ON hero_task_comments;
DROP POLICY IF EXISTS "Users can delete comments" ON hero_task_comments;

CREATE POLICY "Users can view comments on tasks they can read" ON hero_task_comments
  FOR SELECT USING (
    (task_id IS NOT NULL AND has_task_permission(auth.uid(), task_id, NULL, NULL, 'read')) OR
    (subtask_id IS NOT NULL AND has_task_permission(auth.uid(), NULL, subtask_id, NULL, 'read')) OR
    (action_id IS NOT NULL AND has_task_permission(auth.uid(), NULL, NULL, action_id, 'read'))
  );

CREATE POLICY "Users can create comments on tasks they can comment on" ON hero_task_comments
  FOR INSERT WITH CHECK (
    (task_id IS NOT NULL AND has_task_permission(auth.uid(), task_id, NULL, NULL, 'comment')) OR
    (subtask_id IS NOT NULL AND has_task_permission(auth.uid(), NULL, subtask_id, NULL, 'comment')) OR
    (action_id IS NOT NULL AND has_task_permission(auth.uid(), NULL, NULL, action_id, 'comment'))
  );

CREATE POLICY "Users can update their own comments" ON hero_task_comments
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own comments" ON hero_task_comments
  FOR DELETE USING (created_by = auth.uid());

-- Update attachments policies
DROP POLICY IF EXISTS "Users can view all attachments" ON hero_task_attachments;
DROP POLICY IF EXISTS "Users can create attachments" ON hero_task_attachments;
DROP POLICY IF EXISTS "Users can update attachments" ON hero_task_attachments;
DROP POLICY IF EXISTS "Users can delete attachments" ON hero_task_attachments;

CREATE POLICY "Users can view attachments on tasks they can read" ON hero_task_attachments
  FOR SELECT USING (
    (task_id IS NOT NULL AND has_task_permission(auth.uid(), task_id, NULL, NULL, 'read')) OR
    (subtask_id IS NOT NULL AND has_task_permission(auth.uid(), NULL, subtask_id, NULL, 'read')) OR
    (action_id IS NOT NULL AND has_task_permission(auth.uid(), NULL, NULL, action_id, 'read'))
  );

CREATE POLICY "Users can create attachments on tasks they can attach to" ON hero_task_attachments
  FOR INSERT WITH CHECK (
    (task_id IS NOT NULL AND has_task_permission(auth.uid(), task_id, NULL, NULL, 'attach')) OR
    (subtask_id IS NOT NULL AND has_task_permission(auth.uid(), NULL, subtask_id, NULL, 'attach')) OR
    (action_id IS NOT NULL AND has_task_permission(auth.uid(), NULL, NULL, action_id, 'attach'))
  );

CREATE POLICY "Users can update attachments they created" ON hero_task_attachments
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete attachments they created" ON hero_task_attachments
  FOR DELETE USING (created_by = auth.uid());

-- Comments
COMMENT ON TABLE hero_task_permissions IS 'Granular permissions for individual users on specific tasks';
COMMENT ON TABLE hero_team_memberships IS 'Team membership and roles for collaborative task management';
COMMENT ON TABLE hero_teams IS 'Teams for organizing users and tasks';

COMMENT ON COLUMN hero_tasks.access_level IS 'Access control level: public, team, private, or restricted';
COMMENT ON COLUMN hero_tasks.owner_id IS 'User who owns this task and has full control';
COMMENT ON COLUMN hero_tasks.team_id IS 'Team this task belongs to for team-based access';
COMMENT ON COLUMN hero_tasks.custom_permissions IS 'JSON object with custom permission overrides';

COMMENT ON FUNCTION has_task_permission IS 'Check if a user has a specific permission on a task/subtask/action';
COMMENT ON FUNCTION grant_task_permission IS 'Grant a specific permission to a user on a task';
COMMENT ON FUNCTION revoke_task_permission IS 'Revoke a specific permission from a user on a task';
