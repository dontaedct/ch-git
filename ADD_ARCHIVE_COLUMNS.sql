-- Add archive functionality to tenant_apps table
-- Run this in your Supabase SQL Editor

-- Add archived column (boolean, default false)
ALTER TABLE tenant_apps ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add archived_at column (timestamp, nullable)
ALTER TABLE tenant_apps ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for archived status for better query performance
CREATE INDEX IF NOT EXISTS idx_tenant_apps_archived ON tenant_apps(archived);

-- Update any existing apps to have archived = false if null
UPDATE tenant_apps SET archived = false WHERE archived IS NULL;