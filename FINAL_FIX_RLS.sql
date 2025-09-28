-- Final fix for RLS policies
-- Run this in your Supabase SQL Editor

-- Drop all existing policies
DROP POLICY IF EXISTS "service_role_access" ON tenant_apps;
DROP POLICY IF EXISTS "authenticated_read" ON tenant_apps;
DROP POLICY IF EXISTS "authenticated_insert" ON tenant_apps;
DROP POLICY IF EXISTS "authenticated_update" ON tenant_apps;
DROP POLICY IF EXISTS "authenticated_delete" ON tenant_apps;

-- Disable RLS temporarily to allow service role access
ALTER TABLE tenant_apps DISABLE ROW LEVEL SECURITY;

-- We'll re-enable proper RLS later once we have user authentication working
-- For now, this allows your API to work with the service role key