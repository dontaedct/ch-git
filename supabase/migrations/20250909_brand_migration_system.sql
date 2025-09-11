/**
 * @fileoverview Brand Migration System Database Schema
 * @module supabase/migrations/20250909_brand_migration_system.sql
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.6: Create Brand Migration System
 * Database schema for brand migration tracking and management.
 */

-- Migration: Brand Migration System
-- Task: HT-011.2.6 - Create Brand Migration System
-- Date: 2025-09-09

-- Create brand_migration_plans table for storing migration plans
CREATE TABLE IF NOT EXISTS brand_migration_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL,
  description TEXT,
  from_version TEXT NOT NULL,
  to_version TEXT NOT NULL,
  
  -- Migration configuration
  estimated_duration INTEGER DEFAULT 15, -- minutes
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  rollbackable BOOLEAN DEFAULT true,
  
  -- Migration steps (JSONB for flexibility)
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  validation_config JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique plan names
  UNIQUE(plan_name)
);

-- Create brand_migration_status table for tracking migration execution
CREATE TABLE IF NOT EXISTS brand_migration_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES brand_migration_plans(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Migration status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'rolled_back')),
  current_step TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Execution details
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Migration result
  steps_completed JSONB DEFAULT '[]'::jsonb,
  steps_failed JSONB DEFAULT '[]'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  warnings JSONB DEFAULT '[]'::jsonb,
  duration INTEGER, -- milliseconds
  rollback_available BOOLEAN DEFAULT false,
  
  -- Migration metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one active migration per tenant
  UNIQUE(tenant_id, status) WHERE status IN ('pending', 'running')
);

-- Create brand_migration_logs table for detailed migration logging
CREATE TABLE IF NOT EXISTS brand_migration_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  migration_id UUID NOT NULL REFERENCES brand_migration_status(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  step_name TEXT NOT NULL,
  
  -- Log details
  log_level TEXT NOT NULL CHECK (log_level IN ('info', 'warn', 'error', 'debug')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  
  -- Execution context
  execution_time INTEGER, -- milliseconds
  success BOOLEAN,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brand_migration_backups table for storing migration backups
CREATE TABLE IF NOT EXISTS brand_migration_backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  migration_id UUID NOT NULL REFERENCES brand_migration_status(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Backup details
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'config_only')),
  backup_name TEXT NOT NULL,
  backup_description TEXT,
  
  -- Backup data
  backup_data JSONB NOT NULL,
  backup_size INTEGER, -- bytes
  
  -- Backup metadata
  backup_version TEXT DEFAULT '1.0.0',
  compression_used BOOLEAN DEFAULT false,
  encryption_used BOOLEAN DEFAULT false,
  
  -- Retention
  retention_days INTEGER DEFAULT 30,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique backup names per migration
  UNIQUE(migration_id, backup_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_migration_plans_plan_name ON brand_migration_plans(plan_name);
CREATE INDEX IF NOT EXISTS idx_brand_migration_plans_from_version ON brand_migration_plans(from_version);
CREATE INDEX IF NOT EXISTS idx_brand_migration_plans_to_version ON brand_migration_plans(to_version);
CREATE INDEX IF NOT EXISTS idx_brand_migration_plans_is_active ON brand_migration_plans(is_active);

CREATE INDEX IF NOT EXISTS idx_brand_migration_status_plan_id ON brand_migration_status(plan_id);
CREATE INDEX IF NOT EXISTS idx_brand_migration_status_tenant_id ON brand_migration_status(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brand_migration_status_status ON brand_migration_status(status);
CREATE INDEX IF NOT EXISTS idx_brand_migration_status_started_at ON brand_migration_status(started_at);
CREATE INDEX IF NOT EXISTS idx_brand_migration_status_completed_at ON brand_migration_status(completed_at);

CREATE INDEX IF NOT EXISTS idx_brand_migration_logs_migration_id ON brand_migration_logs(migration_id);
CREATE INDEX IF NOT EXISTS idx_brand_migration_logs_step_id ON brand_migration_logs(step_id);
CREATE INDEX IF NOT EXISTS idx_brand_migration_logs_log_level ON brand_migration_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_brand_migration_logs_created_at ON brand_migration_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_brand_migration_backups_migration_id ON brand_migration_backups(migration_id);
CREATE INDEX IF NOT EXISTS idx_brand_migration_backups_tenant_id ON brand_migration_backups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brand_migration_backups_backup_type ON brand_migration_backups(backup_type);
CREATE INDEX IF NOT EXISTS idx_brand_migration_backups_expires_at ON brand_migration_backups(expires_at);

-- Enable Row Level Security
ALTER TABLE brand_migration_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_migration_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_migration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_migration_backups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_migration_plans
-- Everyone can read migration plans
CREATE POLICY "Anyone can view migration plans" ON brand_migration_plans 
  FOR SELECT USING (true);

-- Only admins can manage migration plans
-- CREATE POLICY "Admins can manage migration plans" ON brand_migration_plans 
--   FOR ALL USING (is_admin_user());

-- RLS Policies for brand_migration_status
-- Tenants can view only their own migration status
CREATE POLICY "Tenants can view their own migration status" ON brand_migration_status 
  FOR SELECT USING (tenant_id = auth.uid());

-- System can insert/update migration status
CREATE POLICY "System can manage migration status" ON brand_migration_status 
  FOR ALL USING (true);

-- RLS Policies for brand_migration_logs
-- Tenants can view logs for their own migrations
CREATE POLICY "Tenants can view their own migration logs" ON brand_migration_logs 
  FOR SELECT USING (
    migration_id IN (
      SELECT id FROM brand_migration_status WHERE tenant_id = auth.uid()
    )
  );

-- System can insert migration logs
CREATE POLICY "System can insert migration logs" ON brand_migration_logs 
  FOR INSERT WITH CHECK (true);

-- RLS Policies for brand_migration_backups
-- Tenants can view backups for their own migrations
CREATE POLICY "Tenants can view their own migration backups" ON brand_migration_backups 
  FOR SELECT USING (tenant_id = auth.uid());

-- System can manage migration backups
CREATE POLICY "System can manage migration backups" ON brand_migration_backups 
  FOR ALL USING (true);

-- Create functions for migration management
CREATE OR REPLACE FUNCTION create_migration_plan(
  p_plan_name TEXT,
  p_description TEXT,
  p_from_version TEXT,
  p_to_version TEXT,
  p_steps JSONB,
  p_prerequisites JSONB DEFAULT '[]'::jsonb,
  p_validation_config JSONB DEFAULT '{}'::jsonb,
  p_estimated_duration INTEGER DEFAULT 15,
  p_risk_level TEXT DEFAULT 'low',
  p_rollbackable BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  plan_id UUID;
BEGIN
  INSERT INTO brand_migration_plans (
    plan_name, description, from_version, to_version, steps, prerequisites,
    validation_config, estimated_duration, risk_level, rollbackable, created_by
  ) VALUES (
    p_plan_name, p_description, p_from_version, p_to_version, p_steps, p_prerequisites,
    p_validation_config, p_estimated_duration, p_risk_level, p_rollbackable, auth.uid()
  ) RETURNING id INTO plan_id;
  
  RETURN plan_id;
END;
$$ LANGUAGE plpgsql;

-- Function to start migration
CREATE OR REPLACE FUNCTION start_migration(
  p_plan_id UUID,
  p_tenant_id UUID
)
RETURNS UUID AS $$
DECLARE
  migration_id UUID;
BEGIN
  INSERT INTO brand_migration_status (
    plan_id, tenant_id, status, started_at
  ) VALUES (
    p_plan_id, p_tenant_id, 'running', NOW()
  ) RETURNING id INTO migration_id;
  
  RETURN migration_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update migration progress
CREATE OR REPLACE FUNCTION update_migration_progress(
  p_migration_id UUID,
  p_current_step TEXT,
  p_progress INTEGER,
  p_steps_completed JSONB DEFAULT NULL,
  p_steps_failed JSONB DEFAULT NULL,
  p_errors JSONB DEFAULT NULL,
  p_warnings JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE brand_migration_status SET
    current_step = p_current_step,
    progress = p_progress,
    steps_completed = COALESCE(p_steps_completed, steps_completed),
    steps_failed = COALESCE(p_steps_failed, steps_failed),
    errors = COALESCE(p_errors, errors),
    warnings = COALESCE(p_warnings, warnings),
    updated_at = NOW()
  WHERE id = p_migration_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete migration
CREATE OR REPLACE FUNCTION complete_migration(
  p_migration_id UUID,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_duration INTEGER DEFAULT NULL,
  p_rollback_available BOOLEAN DEFAULT false,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
  UPDATE brand_migration_status SET
    status = CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
    completed_at = NOW(),
    error_message = p_error_message,
    duration = p_duration,
    rollback_available = p_rollback_available,
    metadata = p_metadata,
    updated_at = NOW()
  WHERE id = p_migration_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log migration step
CREATE OR REPLACE FUNCTION log_migration_step(
  p_migration_id UUID,
  p_step_id TEXT,
  p_step_name TEXT,
  p_log_level TEXT,
  p_message TEXT,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_execution_time INTEGER DEFAULT NULL,
  p_success BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO brand_migration_logs (
    migration_id, step_id, step_name, log_level, message, details,
    execution_time, success
  ) VALUES (
    p_migration_id, p_step_id, p_step_name, p_log_level, p_message, p_details,
    p_execution_time, p_success
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create migration backup
CREATE OR REPLACE FUNCTION create_migration_backup(
  p_migration_id UUID,
  p_tenant_id UUID,
  p_backup_type TEXT,
  p_backup_name TEXT,
  p_backup_description TEXT,
  p_backup_data JSONB,
  p_retention_days INTEGER DEFAULT 30
)
RETURNS UUID AS $$
DECLARE
  backup_id UUID;
BEGIN
  INSERT INTO brand_migration_backups (
    migration_id, tenant_id, backup_type, backup_name, backup_description,
    backup_data, backup_size, retention_days, expires_at
  ) VALUES (
    p_migration_id, p_tenant_id, p_backup_type, p_backup_name, p_backup_description,
    p_backup_data, pg_column_size(p_backup_data), p_retention_days,
    NOW() + INTERVAL '1 day' * p_retention_days
  ) RETURNING id INTO backup_id;
  
  RETURN backup_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired backups
CREATE OR REPLACE FUNCTION cleanup_expired_backups()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM brand_migration_backups 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_brand_migration_plans_updated_at
  BEFORE UPDATE ON brand_migration_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_migration_status_updated_at
  BEFORE UPDATE ON brand_migration_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default migration plans
INSERT INTO brand_migration_plans (
  plan_name, description, from_version, to_version, steps, prerequisites,
  validation_config, estimated_duration, risk_level, rollbackable, is_system, is_active
) VALUES (
  'brand-system-upgrade',
  'Upgrade existing deployment to support new branding capabilities',
  '1.0.0',
  '2.0.0',
  '[
    {
      "id": "backup_existing_config",
      "name": "Backup Existing Configuration",
      "description": "Create backup of current brand configuration",
      "type": "database",
      "required": true,
      "estimatedTime": 2,
      "rollbackable": false,
      "dependencies": [],
      "config": {
        "backupTable": "tenant_branding_config_backup",
        "includeAssets": true
      }
    },
    {
      "id": "create_brand_tables",
      "name": "Create Brand Configuration Tables",
      "description": "Create new brand configuration tables if they do not exist",
      "type": "database",
      "required": true,
      "estimatedTime": 3,
      "rollbackable": true,
      "dependencies": ["backup_existing_config"],
      "config": {
        "tables": [
          "tenant_branding_config",
          "tenant_branding_presets",
          "tenant_branding_assets",
          "tenant_branding_history"
        ]
      }
    },
    {
      "id": "migrate_existing_brand",
      "name": "Migrate Existing Brand Configuration",
      "description": "Migrate existing brand settings to new schema",
      "type": "config",
      "required": true,
      "estimatedTime": 5,
      "rollbackable": true,
      "dependencies": ["create_brand_tables"],
      "config": {
        "sourceTable": "tenant_branding_config_backup",
        "targetTable": "tenant_branding_config",
        "preserveIds": false
      }
    },
    {
      "id": "create_default_presets",
      "name": "Create Default Brand Presets",
      "description": "Create default brand presets for new installations",
      "type": "config",
      "required": false,
      "estimatedTime": 2,
      "rollbackable": true,
      "dependencies": ["migrate_existing_brand"],
      "config": {
        "presets": ["default", "tech", "corporate", "startup"]
      }
    },
    {
      "id": "validate_migration",
      "name": "Validate Migration",
      "description": "Validate that migration was successful",
      "type": "validation",
      "required": true,
      "estimatedTime": 2,
      "rollbackable": false,
      "dependencies": ["create_default_presets"],
      "config": {
        "checks": ["schema_integrity", "data_consistency", "asset_accessibility"]
      }
    },
    {
      "id": "cleanup_backup",
      "name": "Cleanup Backup Data",
      "description": "Remove temporary backup data after successful migration",
      "type": "cleanup",
      "required": false,
      "estimatedTime": 1,
      "rollbackable": false,
      "dependencies": ["validate_migration"],
      "config": {
        "keepBackup": false,
        "backupRetentionDays": 0
      }
    }
  ]'::jsonb,
  '[
    "Database backup completed",
    "Application in maintenance mode",
    "All users logged out"
  ]'::jsonb,
  '{
    "checks": [
      {
        "id": "schema_integrity",
        "name": "Schema Integrity Check",
        "description": "Verify all brand tables exist and have correct structure",
        "type": "schema",
        "query": "SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE ''tenant_branding_%''",
        "expectedResult": 4,
        "critical": true
      },
      {
        "id": "data_consistency",
        "name": "Data Consistency Check",
        "description": "Verify brand configuration data is consistent",
        "type": "data",
        "query": "SELECT COUNT(*) FROM tenant_branding_config WHERE tenant_id = $1",
        "expectedResult": 1,
        "critical": true
      }
    ],
    "dataIntegrity": [
      "tenant_branding_config.tenant_id references auth.users(id)",
      "tenant_branding_config.brand_colors is valid JSON",
      "tenant_branding_config.typography_config is valid JSON"
    ],
    "performance": [
      {
        "metric": "migration_duration",
        "threshold": 300000,
        "unit": "milliseconds",
        "critical": true
      }
    ]
  }'::jsonb,
  15,
  'low',
  true,
  true,
  true
);

-- Add table comments
COMMENT ON TABLE brand_migration_plans IS 'Stores brand migration plans for upgrading existing deployments';
COMMENT ON TABLE brand_migration_status IS 'Tracks the execution status of brand migrations';
COMMENT ON TABLE brand_migration_logs IS 'Detailed logs for brand migration execution steps';
COMMENT ON TABLE brand_migration_backups IS 'Backups created during brand migrations for rollback purposes';

-- Add column comments for key fields
COMMENT ON COLUMN brand_migration_plans.steps IS 'JSONB array of migration steps with configuration';
COMMENT ON COLUMN brand_migration_plans.prerequisites IS 'JSONB array of prerequisites that must be met before migration';
COMMENT ON COLUMN brand_migration_plans.validation_config IS 'JSONB object containing validation configuration';
COMMENT ON COLUMN brand_migration_status.steps_completed IS 'JSONB array of completed step IDs';
COMMENT ON COLUMN brand_migration_status.steps_failed IS 'JSONB array of failed step IDs';
COMMENT ON COLUMN brand_migration_status.errors IS 'JSONB array of migration errors';
COMMENT ON COLUMN brand_migration_status.warnings IS 'JSONB array of migration warnings';
COMMENT ON COLUMN brand_migration_logs.details IS 'JSONB object containing additional log details';
COMMENT ON COLUMN brand_migration_backups.backup_data IS 'JSONB object containing the actual backup data';
