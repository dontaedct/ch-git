/**
 * @fileoverview Tenant Branding Configuration Database Schema
 * @module supabase/migrations/20250909_tenant_branding_configuration.sql
 * @author OSS Hero System
 * @version 1.0.0
 */

-- Migration: Tenant Branding Configuration System
-- Task: HT-011.1.4 - Design Tenant Branding Configuration Schema
-- Date: 2025-09-09

-- Create tenant_branding_config table for storing tenant-specific branding
CREATE TABLE IF NOT EXISTS tenant_branding_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Brand Identity
  organization_name TEXT NOT NULL DEFAULT 'Your Organization',
  app_name TEXT NOT NULL DEFAULT 'Micro App',
  full_brand TEXT GENERATED ALWAYS AS (organization_name || ' — ' || app_name) STORED,
  short_brand TEXT GENERATED ALWAYS AS (app_name) STORED,
  nav_brand TEXT GENERATED ALWAYS AS (app_name) STORED,
  
  -- Logo Configuration
  logo_src TEXT,
  logo_alt TEXT DEFAULT 'Organization logo',
  logo_width INTEGER DEFAULT 28,
  logo_height INTEGER DEFAULT 28,
  logo_class_name TEXT DEFAULT 'rounded-sm border border-gray-200',
  logo_show_as_image BOOLEAN DEFAULT true,
  logo_initials TEXT DEFAULT 'CH',
  logo_fallback_bg_color TEXT DEFAULT 'from-blue-600 to-indigo-600',
  
  -- Brand Colors (JSONB for flexibility)
  brand_colors JSONB DEFAULT '{
    "primary": "#3b82f6",
    "secondary": "#c47d09",
    "accent": "#10b981",
    "background": "#ffffff",
    "surface": "#f8fafc",
    "text": "#1f2937",
    "textSecondary": "#6b7280"
  }'::jsonb,
  
  -- Typography Configuration
  typography_config JSONB DEFAULT '{
    "fontFamily": "Inter",
    "fontWeights": [300, 400, 500, 600, 700],
    "fontSizes": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    }
  }'::jsonb,
  
  -- Brand Preset Information
  preset_name TEXT DEFAULT 'default',
  is_custom BOOLEAN DEFAULT false,
  
  -- Brand Validation Status
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'warning')),
  validation_errors JSONB DEFAULT '[]'::jsonb,
  validation_warnings JSONB DEFAULT '[]'::jsonb,
  
  -- Brand Configuration Metadata
  brand_description TEXT,
  brand_tags TEXT[],
  brand_version TEXT DEFAULT '1.0.0',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one branding config per tenant
  UNIQUE(tenant_id)
);

-- Create tenant_branding_presets table for storing reusable brand presets
CREATE TABLE IF NOT EXISTS tenant_branding_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  preset_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  
  -- Preset Configuration (same structure as tenant_branding_config)
  organization_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  logo_initials TEXT NOT NULL,
  logo_fallback_bg_color TEXT NOT NULL,
  brand_colors JSONB NOT NULL,
  typography_config JSONB NOT NULL,
  
  -- Preset Metadata
  is_public BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenant_branding_assets table for storing uploaded brand assets
CREATE TABLE IF NOT EXISTS tenant_branding_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'favicon', 'background', 'icon', 'other')),
  asset_name TEXT NOT NULL,
  asset_url TEXT NOT NULL,
  asset_size INTEGER, -- File size in bytes
  asset_mime_type TEXT,
  asset_dimensions JSONB, -- {width: number, height: number}
  
  -- Asset metadata
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  alt_text TEXT,
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique asset names per tenant
  UNIQUE(tenant_id, asset_name)
);

-- Create tenant_branding_history table for tracking brand changes
CREATE TABLE IF NOT EXISTS tenant_branding_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branding_config_id UUID NOT NULL REFERENCES tenant_branding_config(id) ON DELETE CASCADE,
  
  -- Change tracking
  change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'preset_load', 'asset_upload')),
  changed_fields JSONB NOT NULL,
  previous_values JSONB,
  new_values JSONB,
  
  -- Change metadata
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  change_source TEXT DEFAULT 'user', -- 'user', 'admin', 'system', 'preset'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_branding_config_tenant_id ON tenant_branding_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_config_preset_name ON tenant_branding_config(preset_name);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_config_validation_status ON tenant_branding_config(validation_status);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_config_updated_at ON tenant_branding_config(updated_at);

CREATE INDEX IF NOT EXISTS idx_tenant_branding_presets_preset_name ON tenant_branding_presets(preset_name);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_presets_category ON tenant_branding_presets(category);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_presets_is_public ON tenant_branding_presets(is_public);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_presets_is_system ON tenant_branding_presets(is_system);

CREATE INDEX IF NOT EXISTS idx_tenant_branding_assets_tenant_id ON tenant_branding_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_assets_asset_type ON tenant_branding_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_assets_is_active ON tenant_branding_assets(is_active);

CREATE INDEX IF NOT EXISTS idx_tenant_branding_history_tenant_id ON tenant_branding_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_history_config_id ON tenant_branding_history(branding_config_id);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_history_change_type ON tenant_branding_history(change_type);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_history_created_at ON tenant_branding_history(created_at);

-- Enable Row Level Security
ALTER TABLE tenant_branding_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_branding_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_branding_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_branding_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant_branding_config
-- Tenants can read only their own branding config
CREATE POLICY "Tenants can view their own branding config" ON tenant_branding_config 
  FOR SELECT USING (tenant_id = auth.uid());

-- Tenants can insert branding config for themselves
CREATE POLICY "Tenants can insert their own branding config" ON tenant_branding_config 
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- Tenants can update their own branding config
CREATE POLICY "Tenants can update their own branding config" ON tenant_branding_config 
  FOR UPDATE USING (tenant_id = auth.uid());

-- Tenants can delete their own branding config
CREATE POLICY "Tenants can delete their own branding config" ON tenant_branding_config 
  FOR DELETE USING (tenant_id = auth.uid());

-- RLS Policies for tenant_branding_presets
-- Everyone can read public presets
CREATE POLICY "Anyone can view public presets" ON tenant_branding_presets 
  FOR SELECT USING (is_public = true);

-- System presets are readable by everyone
CREATE POLICY "Anyone can view system presets" ON tenant_branding_presets 
  FOR SELECT USING (is_system = true);

-- Only admins can manage presets (this would need admin role checking)
-- CREATE POLICY "Admins can manage presets" ON tenant_branding_presets 
--   FOR ALL USING (is_admin_user());

-- RLS Policies for tenant_branding_assets
-- Tenants can read only their own assets
CREATE POLICY "Tenants can view their own assets" ON tenant_branding_assets 
  FOR SELECT USING (tenant_id = auth.uid());

-- Tenants can insert assets for themselves
CREATE POLICY "Tenants can insert their own assets" ON tenant_branding_assets 
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- Tenants can update their own assets
CREATE POLICY "Tenants can update their own assets" ON tenant_branding_assets 
  FOR UPDATE USING (tenant_id = auth.uid());

-- Tenants can delete their own assets
CREATE POLICY "Tenants can delete their own assets" ON tenant_branding_assets 
  FOR DELETE USING (tenant_id = auth.uid());

-- RLS Policies for tenant_branding_history
-- Tenants can read only their own branding history
CREATE POLICY "Tenants can view their own branding history" ON tenant_branding_history 
  FOR SELECT USING (tenant_id = auth.uid());

-- System can insert history records
CREATE POLICY "System can insert branding history" ON tenant_branding_history 
  FOR INSERT WITH CHECK (true);

-- Create functions for brand validation
CREATE OR REPLACE FUNCTION validate_brand_colors(colors JSONB)
RETURNS JSONB AS $$
DECLARE
  errors JSONB := '[]'::jsonb;
  warnings JSONB := '[]'::jsonb;
  color TEXT;
BEGIN
  -- Check required colors
  IF NOT (colors ? 'primary') THEN
    errors := errors || '{"field": "primary", "message": "Primary color is required"}'::jsonb;
  END IF;
  
  -- Validate color format (basic hex check)
  FOR color IN SELECT jsonb_array_elements_text(jsonb_object_keys(colors))
  LOOP
    IF colors->>color !~ '^#[0-9A-Fa-f]{6}$' THEN
      errors := errors || jsonb_build_object('field', color, 'message', 'Invalid color format. Use hex format (#RRGGBB)');
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object('isValid', jsonb_array_length(errors) = 0, 'errors', errors, 'warnings', warnings);
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tenant_branding_config_updated_at
  BEFORE UPDATE ON tenant_branding_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_branding_presets_updated_at
  BEFORE UPDATE ON tenant_branding_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_branding_assets_updated_at
  BEFORE UPDATE ON tenant_branding_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system presets
INSERT INTO tenant_branding_presets (preset_name, display_name, description, category, organization_name, app_name, logo_initials, logo_fallback_bg_color, brand_colors, typography_config, is_system, is_public) VALUES
(
  'default',
  'Default Blue',
  'Professional blue theme with clean typography',
  'professional',
  'Your Organization',
  'Micro App',
  'CH',
  'from-blue-600 to-indigo-600',
  '{
    "primary": "#3b82f6",
    "secondary": "#c47d09",
    "accent": "#10b981",
    "background": "#ffffff",
    "surface": "#f8fafc",
    "text": "#1f2937",
    "textSecondary": "#6b7280"
  }'::jsonb,
  '{
    "fontFamily": "Inter",
    "fontWeights": [300, 400, 500, 600, 700],
    "fontSizes": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    }
  }'::jsonb,
  true,
  true
),
(
  'tech',
  'Tech Green',
  'Modern tech green theme for innovative companies',
  'technology',
  'Tech Company',
  'Tech App',
  'TC',
  'from-green-600 to-emerald-600',
  '{
    "primary": "#10b981",
    "secondary": "#059669",
    "accent": "#3b82f6",
    "background": "#ffffff",
    "surface": "#f0fdf4",
    "text": "#064e3b",
    "textSecondary": "#047857"
  }'::jsonb,
  '{
    "fontFamily": "Geist",
    "fontWeights": [300, 400, 500, 600, 700],
    "fontSizes": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    }
  }'::jsonb,
  true,
  true
),
(
  'corporate',
  'Corporate Purple',
  'Professional purple theme for corporate environments',
  'corporate',
  'Corporate Inc',
  'Corporate App',
  'CO',
  'from-purple-600 to-violet-600',
  '{
    "primary": "#8b5cf6",
    "secondary": "#7c3aed",
    "accent": "#06b6d4",
    "background": "#ffffff",
    "surface": "#faf5ff",
    "text": "#581c87",
    "textSecondary": "#7c3aed"
  }'::jsonb,
  '{
    "fontFamily": "Inter",
    "fontWeights": [300, 400, 500, 600, 700],
    "fontSizes": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    }
  }'::jsonb,
  true,
  true
),
(
  'startup',
  'Startup Orange',
  'Energetic orange theme for startup companies',
  'startup',
  'Startup Co',
  'Startup App',
  'ST',
  'from-orange-600 to-red-600',
  '{
    "primary": "#f59e0b",
    "secondary": "#d97706",
    "accent": "#ef4444",
    "background": "#ffffff",
    "surface": "#fffbeb",
    "text": "#92400e",
    "textSecondary": "#b45309"
  }'::jsonb,
  '{
    "fontFamily": "Poppins",
    "fontWeights": [300, 400, 500, 600, 700],
    "fontSizes": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    }
  }'::jsonb,
  true,
  true
);

-- Add table comments
COMMENT ON TABLE tenant_branding_config IS 'Stores tenant-specific branding configuration including logos, colors, and typography';
COMMENT ON TABLE tenant_branding_presets IS 'Stores reusable brand presets for quick tenant onboarding';
COMMENT ON TABLE tenant_branding_assets IS 'Stores uploaded brand assets like logos and icons';
COMMENT ON TABLE tenant_branding_history IS 'Tracks changes to tenant branding configuration for audit purposes';

-- Add column comments for key fields
COMMENT ON COLUMN tenant_branding_config.tenant_id IS 'References auth.users(id) - the tenant/user this branding config belongs to';
COMMENT ON COLUMN tenant_branding_config.brand_colors IS 'JSONB object containing all brand colors (primary, secondary, accent, etc.)';
COMMENT ON COLUMN tenant_branding_config.typography_config IS 'JSONB object containing typography settings (font family, weights, sizes)';
COMMENT ON COLUMN tenant_branding_config.validation_status IS 'Current validation status of the brand configuration';
COMMENT ON COLUMN tenant_branding_config.validation_errors IS 'JSONB array of validation errors if any';
COMMENT ON COLUMN tenant_branding_config.validation_warnings IS 'JSONB array of validation warnings if any';
