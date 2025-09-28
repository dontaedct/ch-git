-- Tenant Apps Migration
-- Multi-tenant application management system

-- Create tenant_apps table
CREATE TABLE IF NOT EXISTS tenant_apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  admin_email TEXT NOT NULL,
  status TEXT DEFAULT 'sandbox' NOT NULL, -- 'sandbox', 'production', 'disabled'
  template_id TEXT DEFAULT 'default' NOT NULL,
  admin_url TEXT,
  public_url TEXT,
  submissions_count INT DEFAULT 0,
  documents_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_apps_slug ON tenant_apps(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_admin_email ON tenant_apps(admin_email);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_status ON tenant_apps(status);

-- Enable RLS
ALTER TABLE tenant_apps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to view their own tenant apps
CREATE POLICY "Allow authenticated users to view their own tenant apps" ON tenant_apps
  FOR SELECT USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = admin_email));

-- Allow authenticated users to update their own tenant apps
CREATE POLICY "Allow authenticated users to update their own tenant apps" ON tenant_apps
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = admin_email));

-- Allow system admin to view all tenant apps
CREATE POLICY "Allow system admin to view all tenant apps" ON tenant_apps
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'system_admin'));

-- Allow system admin to insert tenant apps
CREATE POLICY "Allow system admin to insert tenant apps" ON tenant_apps
  FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'system_admin'));

-- Allow system admin to update all tenant apps
CREATE POLICY "Allow system admin to update all tenant apps" ON tenant_apps
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'system_admin'));

-- Allow system admin to delete all tenant apps
CREATE POLICY "Allow system admin to delete all tenant apps" ON tenant_apps
  FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'system_admin'));

-- Create function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(input_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Create function to create tenant app
CREATE OR REPLACE FUNCTION create_tenant_app(
  p_name TEXT,
  p_admin_email TEXT,
  p_template_id TEXT DEFAULT 'default'
)
RETURNS tenant_apps AS $$
DECLARE
  app_slug TEXT;
  new_app tenant_apps;
BEGIN
  -- Generate unique slug
  app_slug := generate_slug(p_name);
  
  -- Ensure slug is unique
  WHILE EXISTS (SELECT 1 FROM tenant_apps WHERE slug = app_slug) LOOP
    app_slug := app_slug || '-' || extract(epoch from now())::int;
  END LOOP;
  
  -- Insert new tenant app
  INSERT INTO tenant_apps (name, slug, admin_email, template_id, admin_url, public_url)
  VALUES (
    p_name,
    app_slug,
    p_admin_email,
    p_template_id,
    '/admin/' || app_slug,
    '/' || app_slug
  )
  RETURNING * INTO new_app;
  
  RETURN new_app;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to duplicate tenant app
CREATE OR REPLACE FUNCTION duplicate_tenant_app(
  p_source_id UUID,
  p_new_name TEXT,
  p_new_admin_email TEXT
)
RETURNS tenant_apps AS $$
DECLARE
  source_app tenant_apps;
  new_app tenant_apps;
  app_slug TEXT;
BEGIN
  -- Get source app
  SELECT * INTO source_app FROM tenant_apps WHERE id = p_source_id;
  
  IF source_app IS NULL THEN
    RAISE EXCEPTION 'Source app not found';
  END IF;
  
  -- Generate unique slug for new app
  app_slug := generate_slug(p_new_name);
  
  -- Ensure slug is unique
  WHILE EXISTS (SELECT 1 FROM tenant_apps WHERE slug = app_slug) LOOP
    app_slug := app_slug || '-' || extract(epoch from now())::int;
  END LOOP;
  
  -- Insert duplicated app
  INSERT INTO tenant_apps (name, slug, admin_email, template_id, admin_url, public_url, status)
  VALUES (
    p_new_name,
    app_slug,
    p_new_admin_email,
    source_app.template_id,
    '/admin/' || app_slug,
    '/' || app_slug,
    'sandbox'
  )
  RETURNING * INTO new_app;
  
  RETURN new_app;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to toggle app status
CREATE OR REPLACE FUNCTION toggle_tenant_app_status(
  p_app_id UUID,
  p_new_status TEXT
)
RETURNS tenant_apps AS $$
DECLARE
  updated_app tenant_apps;
BEGIN
  -- Validate status
  IF p_new_status NOT IN ('sandbox', 'production', 'disabled') THEN
    RAISE EXCEPTION 'Invalid status: %', p_new_status;
  END IF;
  
  -- Update app status
  UPDATE tenant_apps 
  SET status = p_new_status, updated_at = NOW()
  WHERE id = p_app_id
  RETURNING * INTO updated_app;
  
  IF updated_app IS NULL THEN
    RAISE EXCEPTION 'App not found';
  END IF;
  
  RETURN updated_app;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get tenant app stats
CREATE OR REPLACE FUNCTION get_tenant_app_stats()
RETURNS TABLE (
  total_apps BIGINT,
  active_apps BIGINT,
  sandbox_apps BIGINT,
  disabled_apps BIGINT,
  total_submissions BIGINT,
  total_documents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_apps,
    COUNT(*) FILTER (WHERE status = 'production') as active_apps,
    COUNT(*) FILTER (WHERE status = 'sandbox') as sandbox_apps,
    COUNT(*) FILTER (WHERE status = 'disabled') as disabled_apps,
    COALESCE(SUM(submissions_count), 0) as total_submissions,
    COALESCE(SUM(documents_count), 0) as total_documents
  FROM tenant_apps;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample data for testing
INSERT INTO tenant_apps (name, slug, admin_email, template_id, status, admin_url, public_url, submissions_count, documents_count)
VALUES 
  ('Sample Lead Form', 'sample-lead-form', 'admin@example.com', 'lead-form-pdf', 'sandbox', '/admin/sample-lead-form', '/sample-lead-form', 15, 8),
  ('Client Portal Demo', 'client-portal-demo', 'demo@example.com', 'client-portal', 'production', '/admin/client-portal-demo', '/client-portal-demo', 42, 23),
  ('Test Application', 'test-application', 'test@example.com', 'default', 'disabled', '/admin/test-application', '/test-application', 0, 0)
ON CONFLICT (slug) DO NOTHING;


