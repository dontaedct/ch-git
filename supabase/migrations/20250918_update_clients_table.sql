-- Update clients table to include role and additional fields
-- Part of Phase 1.2 Database Schema & State Management
-- Adds role field and other fields referenced by the authentication system

-- Add role field to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer'));

-- Add additional fields for user management
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_logout_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_clients_role ON clients(role);

-- Create index for last login tracking
CREATE INDEX IF NOT EXISTS idx_clients_last_login_at ON clients(last_login_at);

-- Update RLS policies to include role-based access
DROP POLICY IF EXISTS "Users can read own client record" ON clients;
DROP POLICY IF EXISTS "Users can update own client record" ON clients;
DROP POLICY IF EXISTS "Service role can insert clients" ON clients;

-- Users can read their own record
CREATE POLICY "Users can read own client record" ON clients
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Users can update their own record
CREATE POLICY "Users can update own client record" ON clients
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Service role can insert new client records (for auth flows)
CREATE POLICY "Service role can insert clients" ON clients
    FOR INSERT WITH CHECK (true);

-- Service role can manage all client records
CREATE POLICY "Service role can manage all clients" ON clients
    FOR ALL USING (auth.role() = 'service_role');

-- Add column comments
COMMENT ON COLUMN clients.role IS 'User role in the system (admin, editor, viewer)';
COMMENT ON COLUMN clients.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN clients.last_logout_at IS 'Timestamp of last logout';
COMMENT ON COLUMN clients.metadata IS 'Additional user metadata and settings';
COMMENT ON COLUMN clients.preferences IS 'User preferences and configuration';
