-- Feature Flags Migration - Single Source of Truth for Feature Flags
-- This migration creates the feature_flags table with RLS policies for tenant-based access control

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique flag per tenant
  UNIQUE(tenant_id, key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_tenant_id ON feature_flags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_tenant_key ON feature_flags(tenant_id, key);

-- Enable Row Level Security
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_flags
-- Tenants can read only their own flags
CREATE POLICY "Tenants can view their own feature flags" ON feature_flags 
  FOR SELECT USING (tenant_id = auth.uid());

-- Tenants can insert flags for themselves
CREATE POLICY "Tenants can insert their own feature flags" ON feature_flags 
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- Tenants can update their own flags
CREATE POLICY "Tenants can update their own feature flags" ON feature_flags 
  FOR UPDATE USING (tenant_id = auth.uid());

-- Tenants can delete their own flags
CREATE POLICY "Tenants can delete their own feature flags" ON feature_flags 
  FOR DELETE USING (tenant_id = auth.uid());

-- Admins can read/write all flags (using a custom function to check admin role)
-- Note: This assumes you have an admin role system. Adjust as needed.
CREATE POLICY "Admins can view all feature flags" ON feature_flags 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can insert all feature flags" ON feature_flags 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update all feature flags" ON feature_flags 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete all feature flags" ON feature_flags 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_feature_flags_updated_at 
  BEFORE UPDATE ON feature_flags 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add table and column comments
COMMENT ON TABLE feature_flags IS 'Centralized feature flags with tenant-based access control';
COMMENT ON COLUMN feature_flags.tenant_id IS 'User ID of the tenant (coach) who owns this flag';
COMMENT ON COLUMN feature_flags.key IS 'Unique flag identifier within tenant scope';
COMMENT ON COLUMN feature_flags.enabled IS 'Whether the feature flag is enabled for this tenant';
COMMENT ON COLUMN feature_flags.payload IS 'Additional configuration data for the feature flag';

-- Seed some default feature flags (disabled by default)
-- These will be created for each existing tenant
INSERT INTO feature_flags (tenant_id, key, enabled, payload)
SELECT 
  u.id as tenant_id,
  flag_key,
  false as enabled,
  '{}' as payload
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('guardian_enabled'),
    ('stripe_receipt_flow'),
    ('advanced_analytics'),
    ('ai_coaching'),
    ('mobile_app'),
    ('social_features'),
    ('beta_features'),
    ('performance_monitoring')
) AS flags(flag_key)
WHERE NOT EXISTS (
  SELECT 1 FROM feature_flags ff 
  WHERE ff.tenant_id = u.id AND ff.key = flags.flag_key
);

-- Create a function to get all flags for a tenant (useful for caching)
CREATE OR REPLACE FUNCTION get_tenant_flags(tenant_uuid UUID)
RETURNS TABLE (
  key TEXT,
  enabled BOOLEAN,
  payload JSONB,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ff.key,
    ff.enabled,
    ff.payload,
    ff.updated_at
  FROM feature_flags ff
  WHERE ff.tenant_id = tenant_uuid
  ORDER BY ff.key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_tenant_flags(UUID) TO authenticated;

-- Create a function to check if a specific flag is enabled for a tenant
CREATE OR REPLACE FUNCTION is_flag_enabled(tenant_uuid UUID, flag_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  flag_enabled BOOLEAN;
BEGIN
  SELECT enabled INTO flag_enabled
  FROM feature_flags
  WHERE tenant_id = tenant_uuid AND key = flag_key;
  
  RETURN COALESCE(flag_enabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_flag_enabled(UUID, TEXT) TO authenticated;
