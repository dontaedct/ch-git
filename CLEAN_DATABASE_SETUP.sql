-- Create tenant_apps table (main table for client apps)
CREATE TABLE IF NOT EXISTS tenant_apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  admin_email TEXT NOT NULL,
  status TEXT DEFAULT 'sandbox' NOT NULL,
  template_id TEXT DEFAULT 'default' NOT NULL,
  admin_url TEXT,
  public_url TEXT,
  submissions_count INT DEFAULT 0,
  documents_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_apps_slug ON tenant_apps(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_admin_email ON tenant_apps(admin_email);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_status ON tenant_apps(status);

-- Enable Row Level Security
ALTER TABLE tenant_apps ENABLE ROW LEVEL SECURITY;

-- Create policies for security
CREATE POLICY "Allow authenticated users to view their own tenant apps" ON tenant_apps
  FOR SELECT USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = admin_email));

CREATE POLICY "Allow authenticated users to update their own tenant apps" ON tenant_apps
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = admin_email));

-- Allow service role to do everything (for API operations)
CREATE POLICY "Allow service role full access" ON tenant_apps
  FOR ALL TO service_role USING (true);

-- Helper function to generate slugs
CREATE OR REPLACE FUNCTION generate_slug(input_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(input_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Insert test data
INSERT INTO tenant_apps (name, slug, admin_email, template_id, status, admin_url, public_url, submissions_count, documents_count)
VALUES
  ('Sample Lead Form', 'sample-lead-form', 'admin@example.com', 'lead-form-pdf', 'sandbox', '/admin/sample-lead-form', '/sample-lead-form', 15, 8),
  ('Client Portal Demo', 'client-portal-demo', 'demo@example.com', 'client-portal', 'production', '/admin/client-portal-demo', '/client-portal-demo', 42, 23),
  ('Test Application', 'test-application', 'test@example.com', 'default', 'disabled', '/admin/test-application', '/test-application', 0, 0)
ON CONFLICT (slug) DO NOTHING;