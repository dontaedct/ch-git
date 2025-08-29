-- Create client_app_overrides table for storing module and configuration overrides
-- This allows clients to toggle modules and customize their consultation experience

CREATE TABLE IF NOT EXISTS client_app_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- JSON configuration fields
    modules_enabled JSONB NOT NULL DEFAULT '[]'::jsonb,
    theme_overrides JSONB DEFAULT '{}'::jsonb,
    consultation_config JSONB DEFAULT '{}'::jsonb,
    plan_catalog_overrides JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_client_app_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_app_overrides_updated_at
    BEFORE UPDATE ON client_app_overrides
    FOR EACH ROW
    EXECUTE FUNCTION update_client_app_overrides_updated_at();

-- Enable Row Level Security
ALTER TABLE client_app_overrides ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own overrides
CREATE POLICY "Users can read own overrides" ON client_app_overrides
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Users can insert their own overrides
CREATE POLICY "Users can insert own overrides" ON client_app_overrides
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Users can update their own overrides
CREATE POLICY "Users can update own overrides" ON client_app_overrides
    FOR UPDATE USING (
        client_id IN (
            SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Users can delete their own overrides
CREATE POLICY "Users can delete own overrides" ON client_app_overrides
    FOR DELETE USING (
        client_id IN (
            SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_app_overrides_client_id ON client_app_overrides(client_id);
CREATE INDEX IF NOT EXISTS idx_client_app_overrides_modules_enabled ON client_app_overrides USING gin(modules_enabled);

-- Add unique constraint to ensure one override record per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_app_overrides_unique_client ON client_app_overrides(client_id);

-- Add table comment
COMMENT ON TABLE client_app_overrides IS 'Client-specific configuration overrides for modules and consultation settings';

-- Add column comments
COMMENT ON COLUMN client_app_overrides.modules_enabled IS 'Array of enabled module IDs for this client';
COMMENT ON COLUMN client_app_overrides.theme_overrides IS 'Client-specific theme customizations';
COMMENT ON COLUMN client_app_overrides.consultation_config IS 'Custom consultation template settings';
COMMENT ON COLUMN client_app_overrides.plan_catalog_overrides IS 'Client-specific plan modifications';