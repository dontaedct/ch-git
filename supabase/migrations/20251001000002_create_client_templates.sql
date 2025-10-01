-- Migration: Create client_templates table for MVP
-- Description: Links clients to templates and stores all customizations
-- Date: 2025-10-01

CREATE TABLE IF NOT EXISTS client_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_app_id UUID NOT NULL REFERENCES tenant_apps(id) ON DELETE CASCADE,
  template_id VARCHAR(255) NOT NULL,
  -- References template_storage.template_id (FK added after template_storage exists)

  -- Client-Specific Customizations (stored as JSONB for flexibility)
  custom_content JSONB DEFAULT '{}',
  -- Stores only CHANGED values, merged with template defaults at runtime
  -- Structure: Same hierarchy as template_storage.default_content
  -- Example: { "home.hero.heading": "ABC Fitness - Start Today" }

  custom_branding JSONB DEFAULT '{}',
  -- Client-specific branding overrides
  -- {
  --   "logo": "/uploads/client-123/logo.png",
  --   "colors": { "primary": "#FF5733", "secondary": "#33C3FF" },
  --   "fonts": { "heading": "Poppins", "body": "Open Sans" }
  -- }

  custom_pages JSONB DEFAULT '{}',
  -- For future: page-level customizations and custom pages
  -- { "pricing": { "enabled": true, "order": 5, "slug": "pricing" } }

  -- Status and Metadata
  status VARCHAR(50) DEFAULT 'draft',
  -- Values: 'draft', 'active', 'published', 'archived'

  published_at TIMESTAMPTZ,
  deployed_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_client_template UNIQUE(tenant_app_id, template_id),
  CONSTRAINT status_check CHECK (status IN ('draft', 'active', 'published', 'archived'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_templates_tenant ON client_templates(tenant_app_id);
CREATE INDEX IF NOT EXISTS idx_client_templates_template ON client_templates(template_id);
CREATE INDEX IF NOT EXISTS idx_client_templates_status ON client_templates(status);
CREATE INDEX IF NOT EXISTS idx_client_templates_created ON client_templates(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_client_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_templates_updated_at
BEFORE UPDATE ON client_templates
FOR EACH ROW
EXECUTE FUNCTION update_client_templates_updated_at();

-- Row Level Security (RLS)
ALTER TABLE client_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own client templates
CREATE POLICY "Users can view their own client templates"
  ON client_templates FOR SELECT
  USING (
    tenant_app_id IN (
      SELECT id FROM tenant_apps
      WHERE created_by = auth.uid()
      OR auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Policy: Users can insert/update/delete their own client templates
CREATE POLICY "Users can manage their own client templates"
  ON client_templates FOR ALL
  USING (
    tenant_app_id IN (
      SELECT id FROM tenant_apps
      WHERE created_by = auth.uid()
      OR auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Comments for documentation
COMMENT ON TABLE client_templates IS 'Links clients to templates and stores all customizations';
COMMENT ON COLUMN client_templates.tenant_app_id IS 'References the client/app this template belongs to';
COMMENT ON COLUMN client_templates.template_id IS 'References the base template being customized';
COMMENT ON COLUMN client_templates.custom_content IS 'Client-specific content changes (only changed values)';
COMMENT ON COLUMN client_templates.custom_branding IS 'Client-specific branding (colors, fonts, logo)';
COMMENT ON COLUMN client_templates.custom_pages IS 'Custom page configurations';
COMMENT ON COLUMN client_templates.status IS 'Template status: draft, active, published, archived';
