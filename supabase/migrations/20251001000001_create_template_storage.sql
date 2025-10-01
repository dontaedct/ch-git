-- Migration: Create template_storage table for MVP
-- Description: Stores template files, metadata, and customization options
-- Date: 2025-10-01

CREATE TABLE IF NOT EXISTS template_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(255) NOT NULL UNIQUE,
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL,
  -- Values: 'fitness-coach', 'home-services', 'real-estate', 'funeral-home'

  -- Template Structure (stored as JSONB for flexibility)
  template_files JSONB NOT NULL DEFAULT '{}',
  -- Structure:
  -- {
  --   "pages": {
  --     "home": { "sections": [...] },
  --     "about": { "sections": [...] },
  --     "services": { "sections": [...] },
  --     "contact": { "sections": [...] }
  --   },
  --   "components": { "Hero": {...}, "Services": {...} },
  --   "styles": { "global": "...", "theme": {...} }
  -- }

  default_content JSONB NOT NULL DEFAULT '{}',
  -- Default content values that can be customized per client
  -- Structure: page.section.field hierarchy

  customizable_fields JSONB NOT NULL DEFAULT '{}',
  -- Defines which fields clients can customize
  -- { "home.hero.heading": { "type": "text", "maxLength": 100 } }

  brand_options JSONB NOT NULL DEFAULT '{}',
  -- Default branding options
  -- {
  --   "colors": { "primary": "#3B82F6", "secondary": "#10B981" },
  --   "fonts": { "heading": "Inter", "body": "Inter" }
  -- }

  -- Metadata
  preview_image TEXT,
  description TEXT,
  version VARCHAR(50) DEFAULT '1.0.0',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT template_type_check CHECK (template_type IN (
    'fitness-coach',
    'home-services',
    'real-estate',
    'funeral-home',
    'custom'
  )),
  CONSTRAINT status_check CHECK (status IN ('active', 'draft', 'archived'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_storage_type ON template_storage(template_type);
CREATE INDEX IF NOT EXISTS idx_template_storage_status ON template_storage(status);
CREATE INDEX IF NOT EXISTS idx_template_storage_created ON template_storage(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_template_storage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER template_storage_updated_at
BEFORE UPDATE ON template_storage
FOR EACH ROW
EXECUTE FUNCTION update_template_storage_updated_at();

-- Row Level Security (RLS)
ALTER TABLE template_storage ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read active templates
CREATE POLICY "Templates are viewable by everyone"
  ON template_storage FOR SELECT
  USING (status = 'active');

-- Policy: Only authenticated users with admin role can insert/update/delete
CREATE POLICY "Only admins can manage templates"
  ON template_storage FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Comments for documentation
COMMENT ON TABLE template_storage IS 'Stores reusable templates for client micro-apps';
COMMENT ON COLUMN template_storage.template_id IS 'Unique identifier for the template (e.g., fitness-coach-v1)';
COMMENT ON COLUMN template_storage.template_files IS 'Complete template structure including pages, components, and styles';
COMMENT ON COLUMN template_storage.default_content IS 'Default content values that clients can customize';
COMMENT ON COLUMN template_storage.customizable_fields IS 'Defines which fields can be edited by clients';
COMMENT ON COLUMN template_storage.brand_options IS 'Default branding settings (colors, fonts, etc.)';
