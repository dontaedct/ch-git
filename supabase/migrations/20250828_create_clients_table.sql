-- Create clients table for authentication
-- This migration creates a minimal clients table that works with Supabase Auth

-- Create clients table with minimal fields
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_clients_updated_at();

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
-- Users can read their own record
CREATE POLICY "Users can read own client record" ON clients
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Users can update their own record
CREATE POLICY "Users can update own client record" ON clients
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Service role can insert new client records (for auth flows)
CREATE POLICY "Service role can insert clients" ON clients
    FOR INSERT WITH CHECK (true);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Add table comment
COMMENT ON TABLE clients IS 'Client accounts linked to Supabase Auth users';