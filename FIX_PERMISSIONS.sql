-- Fix permissions for tenant_apps table
-- Run this in your Supabase SQL Editor

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Allow authenticated users to view their own tenant apps" ON tenant_apps;
DROP POLICY IF EXISTS "Allow authenticated users to update their own tenant apps" ON tenant_apps;
DROP POLICY IF EXISTS "Allow system admin to view all tenant apps" ON tenant_apps;
DROP POLICY IF EXISTS "Allow system admin to insert tenant apps" ON tenant_apps;
DROP POLICY IF EXISTS "Allow system admin to update all tenant apps" ON tenant_apps;
DROP POLICY IF EXISTS "Allow system admin to delete all tenant apps" ON tenant_apps;
DROP POLICY IF EXISTS "Allow service role full access" ON tenant_apps;

-- Create simple policies that work
-- Allow service role (your API) to do everything
CREATE POLICY "service_role_access" ON tenant_apps
  FOR ALL TO service_role USING (true);

-- Allow authenticated users to see all apps (we'll add proper user filtering later)
CREATE POLICY "authenticated_read" ON tenant_apps
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert apps
CREATE POLICY "authenticated_insert" ON tenant_apps
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update apps
CREATE POLICY "authenticated_update" ON tenant_apps
  FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete apps
CREATE POLICY "authenticated_delete" ON tenant_apps
  FOR DELETE TO authenticated USING (true);