# Database Setup - Copy & Paste Instructions

## Quick Setup (2 minutes)

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Find your project: `arczonwbczqbouwstmbs`
3. Click on your project name

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### Step 3: Copy & Paste This SQL
**Copy everything below and paste it into the SQL editor:**

```sql
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
```

### Step 4: Run the SQL
1. Click the **"Run"** button (or press Ctrl+Enter)
2. You should see "Success. No rows returned" or similar

### Step 5: Verify Success
You should see:
- ✅ "Success" message
- ✅ New table `tenant_apps` in your database
- ✅ 3 test records inserted

## What This Creates

- **`tenant_apps` table**: Stores all your client applications
- **Security policies**: Only authorized users can access their data
- **Test data**: 3 sample client apps to test with
- **Indexes**: For fast queries
- **Helper functions**: For generating slugs from names

## Next Steps

Once you've run this SQL:
1. Tell Claude "Done - I ran the SQL"
2. Claude will test your API endpoints
3. You can start creating real client apps!

## Troubleshooting

**If you get an error:**
- Make sure you're in the correct project
- Try running just the `CREATE TABLE` part first
- Check that you have admin permissions

**Need help?** Just paste any error message to Claude.