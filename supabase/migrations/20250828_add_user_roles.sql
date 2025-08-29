-- Add roles to clients table
-- This migration adds role-based access control to the clients table

-- Create enum type for user roles
CREATE TYPE user_role AS ENUM ('owner', 'member', 'viewer');

-- Add role column to clients table
ALTER TABLE clients 
ADD COLUMN role user_role NOT NULL DEFAULT 'viewer';

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_clients_role ON clients(role);

-- Update RLS policies to include role-based access

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own client record" ON clients;
DROP POLICY IF EXISTS "Users can update own client record" ON clients;
DROP POLICY IF EXISTS "Service role can insert clients" ON clients;

-- Create new role-aware policies
-- Users can read their own record
CREATE POLICY "Users can read own client record" ON clients
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Users can update their own record (except role changes)
CREATE POLICY "Users can update own client record" ON clients
    FOR UPDATE USING (auth.jwt() ->> 'email' = email)
    WITH CHECK (
        auth.jwt() ->> 'email' = email AND
        role = OLD.role  -- Prevent role self-modification
    );

-- Only owners can manage other users' roles
CREATE POLICY "Owners can manage users" ON clients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'owner'
        )
    );

-- Service role can insert new client records
CREATE POLICY "Service role can insert clients" ON clients
    FOR INSERT WITH CHECK (true);

-- Add comment for role column
COMMENT ON COLUMN clients.role IS 'User role: owner (full access), member (read/write), viewer (read-only)';