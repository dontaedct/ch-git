-- Migration: Create client_graduations table for MVP
-- Description: Tracks export/graduation events for standalone deployments
-- Date: 2025-10-01

CREATE TABLE IF NOT EXISTS client_graduations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_app_id UUID NOT NULL REFERENCES tenant_apps(id) ON DELETE CASCADE,

  -- Export Details
  export_type VARCHAR(50) NOT NULL DEFAULT 'manual-zip',
  -- Values: 'manual-zip', 'vercel-auto', 'github-repo', 'docker-image'

  export_status VARCHAR(50) DEFAULT 'pending',
  -- Values: 'pending', 'processing', 'completed', 'failed'

  -- URLs and Locations
  export_url TEXT,
  -- URL to download the exported package

  repository_url TEXT,
  -- GitHub repository URL (if applicable)

  deployment_url TEXT,
  -- Live deployment URL (if deployed)

  -- Export Package Metadata
  exported_files JSONB DEFAULT '[]',
  -- List of included files in the export
  -- ["app/page.tsx", "components/Hero.tsx", ...]

  deployment_config JSONB DEFAULT '{}',
  -- Environment variables and configuration needed for deployment
  -- { "env": { "NEXT_PUBLIC_APP_NAME": "..." }, "build": {...} }

  -- Notes and Errors
  export_notes TEXT,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT export_type_check CHECK (export_type IN (
    'manual-zip',
    'vercel-auto',
    'github-repo',
    'docker-image'
  )),
  CONSTRAINT export_status_check CHECK (export_status IN (
    'pending',
    'processing',
    'completed',
    'failed'
  ))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_graduations_tenant ON client_graduations(tenant_app_id);
CREATE INDEX IF NOT EXISTS idx_graduations_status ON client_graduations(export_status);
CREATE INDEX IF NOT EXISTS idx_graduations_created ON client_graduations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_graduations_created_by ON client_graduations(created_by);

-- Row Level Security (RLS)
ALTER TABLE client_graduations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own graduations
CREATE POLICY "Users can view their own graduations"
  ON client_graduations FOR SELECT
  USING (
    tenant_app_id IN (
      SELECT id FROM tenant_apps
      WHERE created_by = auth.uid()
      OR auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Policy: Users can create graduations for their own clients
CREATE POLICY "Users can create graduations for their clients"
  ON client_graduations FOR INSERT
  WITH CHECK (
    tenant_app_id IN (
      SELECT id FROM tenant_apps
      WHERE created_by = auth.uid()
      OR auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Comments for documentation
COMMENT ON TABLE client_graduations IS 'Tracks export/graduation events for standalone deployments';
COMMENT ON COLUMN client_graduations.export_type IS 'Type of export: manual-zip, vercel-auto, github-repo, docker-image';
COMMENT ON COLUMN client_graduations.export_status IS 'Current status: pending, processing, completed, failed';
COMMENT ON COLUMN client_graduations.exported_files IS 'List of files included in the export package';
COMMENT ON COLUMN client_graduations.deployment_config IS 'Configuration needed for deployment (env vars, build config)';
