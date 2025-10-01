-- Migration: Alter tenant_apps to support templates
-- Description: Adds template reference and customization progress tracking
-- Date: 2025-10-01

-- Add template-related columns to tenant_apps
ALTER TABLE tenant_apps
  ADD COLUMN IF NOT EXISTS active_template_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS template_applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customization_progress JSONB DEFAULT '{
    "template_selected": false,
    "branding_completed": false,
    "content_completed": false,
    "preview_viewed": false,
    "deployed": false
  }'::jsonb;

-- Create index for template lookups
CREATE INDEX IF NOT EXISTS idx_tenant_apps_template ON tenant_apps(active_template_id);

-- Comments for documentation
COMMENT ON COLUMN tenant_apps.active_template_id IS 'Currently active template for this client app';
COMMENT ON COLUMN tenant_apps.template_applied_at IS 'Timestamp when template was first applied';
COMMENT ON COLUMN tenant_apps.customization_progress IS 'Tracks completion of customization workflow steps';
