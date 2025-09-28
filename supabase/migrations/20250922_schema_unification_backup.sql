-- HT-034.6.1: Database Schema Unification Implementation
-- Phase 1: Database Backup and Schema Unification
-- Created: 2025-09-22
-- Purpose: Backup existing clients table and unify with clients_enhanced schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create backup table for existing clients data
DO $$
BEGIN
    -- Backup existing clients table data
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients')
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_backup_20250922') THEN

        CREATE TABLE clients_backup_20250922 AS SELECT * FROM clients;

        -- Add timestamp for when backup was created
        ALTER TABLE clients_backup_20250922 ADD COLUMN backup_created_at TIMESTAMPTZ DEFAULT NOW();

        -- Log backup creation
        RAISE NOTICE 'Backup table clients_backup_20250922 created with % rows', (SELECT COUNT(*) FROM clients_backup_20250922);
    END IF;
END $$;

-- Step 2: Migrate existing clients data to clients_enhanced if it exists and clients_enhanced doesn't exist
DO $$
DECLARE
    client_record RECORD;
    new_client_id UUID;
BEGIN
    -- Check if clients table exists and has data, and clients_enhanced doesn't exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients')
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced')
       AND EXISTS (SELECT 1 FROM clients LIMIT 1) THEN

        -- Create clients_enhanced table first (from the create_client_management_schema.sql)
        CREATE TABLE clients_enhanced (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            company_name VARCHAR(255),
            industry VARCHAR(100),
            website_url VARCHAR(500),
            phone VARCHAR(50),
            address JSONB,

            -- Business Information
            business_size VARCHAR(50), -- 'startup', 'small', 'medium', 'enterprise'
            annual_revenue DECIMAL(15,2),
            target_audience TEXT,
            business_goals TEXT[],

            -- Technical Requirements
            technical_requirements JSONB DEFAULT '{}',
            preferred_integrations TEXT[],
            compliance_requirements TEXT[],

            -- Branding Information
            brand_guidelines JSONB DEFAULT '{}',
            color_palette JSONB DEFAULT '{}',
            typography_preferences JSONB DEFAULT '{}',
            logo_assets JSONB DEFAULT '{}',
            visual_identity JSONB DEFAULT '{}',

            -- Project Information
            project_type VARCHAR(100),
            project_scope TEXT,
            budget_range VARCHAR(50),
            timeline_requirements VARCHAR(100),

            -- Client Status and Management
            status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended', 'churned'
            tier VARCHAR(50) DEFAULT 'standard', -- 'basic', 'standard', 'premium', 'enterprise'
            acquisition_source VARCHAR(100),

            -- Metadata
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            created_by UUID,
            assigned_manager UUID,

            -- Audit Trail
            last_contact_date TIMESTAMPTZ,
            contract_start_date DATE,
            contract_end_date DATE,
            renewal_date DATE,

            CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id),
            CONSTRAINT fk_assigned_manager FOREIGN KEY (assigned_manager) REFERENCES auth.users(id)
        );

        -- Create indexes for performance
        CREATE INDEX idx_clients_enhanced_email ON clients_enhanced(email);
        CREATE INDEX idx_clients_enhanced_status ON clients_enhanced(status);
        CREATE INDEX idx_clients_enhanced_tier ON clients_enhanced(tier);
        CREATE INDEX idx_clients_enhanced_created_at ON clients_enhanced(created_at);
        CREATE INDEX idx_clients_enhanced_manager ON clients_enhanced(assigned_manager);

        -- Migrate data from clients to clients_enhanced
        FOR client_record IN SELECT * FROM clients LOOP
            INSERT INTO clients_enhanced (
                id,
                name,
                email,
                created_at,
                updated_at
            ) VALUES (
                client_record.id,
                COALESCE(client_record.email, 'Unknown'), -- Use email as name if no name field
                client_record.email,
                client_record.created_at,
                client_record.updated_at
            );
        END LOOP;

        RAISE NOTICE 'Migrated % rows from clients to clients_enhanced', (SELECT COUNT(*) FROM clients);

    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced') THEN
        RAISE NOTICE 'clients_enhanced table already exists, skipping migration';
    ELSE
        RAISE NOTICE 'No clients data to migrate or clients_enhanced already exists';
    END IF;
END $$;

-- Step 3: Enable RLS on clients_enhanced if it was just created
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced') THEN
        ALTER TABLE clients_enhanced ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies if they don't exist
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'clients_enhanced' AND policyname = 'clients_enhanced_select_policy') THEN
            CREATE POLICY clients_enhanced_select_policy ON clients_enhanced
                FOR SELECT USING (
                    auth.role() = 'authenticated' AND
                    (auth.uid() = created_by OR auth.uid() = assigned_manager OR
                     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')))
                );
        END IF;

        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'clients_enhanced' AND policyname = 'clients_enhanced_insert_policy') THEN
            CREATE POLICY clients_enhanced_insert_policy ON clients_enhanced
                FOR INSERT WITH CHECK (
                    auth.role() = 'authenticated' AND
                    (auth.uid() = created_by OR
                     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')))
                );
        END IF;

        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'clients_enhanced' AND policyname = 'clients_enhanced_update_policy') THEN
            CREATE POLICY clients_enhanced_update_policy ON clients_enhanced
                FOR UPDATE USING (
                    auth.role() = 'authenticated' AND
                    (auth.uid() = created_by OR auth.uid() = assigned_manager OR
                     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')))
                );
        END IF;
    END IF;
END $$;

-- Step 4: Create update trigger for clients_enhanced
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_clients_enhanced_updated_at') THEN
        CREATE TRIGGER update_clients_enhanced_updated_at
            BEFORE UPDATE ON clients_enhanced
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Step 5: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON clients_enhanced TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 6: Create a view for backward compatibility
CREATE OR REPLACE VIEW clients_unified AS
SELECT
    id,
    name as name,
    email,
    created_at,
    updated_at,
    company_name,
    status,
    tier
FROM clients_enhanced;

-- Grant view permissions
GRANT SELECT ON clients_unified TO authenticated;

-- Create validation function to check data integrity
CREATE OR REPLACE FUNCTION validate_schema_unification()
RETURNS TABLE (
    validation_step TEXT,
    status TEXT,
    details TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    -- Check if backup was created
    RETURN QUERY SELECT
        'backup_created'::TEXT,
        CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_backup_20250922')
             THEN 'SUCCESS' ELSE 'FAILED' END::TEXT,
        'Backup table exists: ' || EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_backup_20250922')::TEXT;

    -- Check if clients_enhanced exists
    RETURN QUERY SELECT
        'clients_enhanced_exists'::TEXT,
        CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced')
             THEN 'SUCCESS' ELSE 'FAILED' END::TEXT,
        'clients_enhanced table exists: ' || EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced')::TEXT;

    -- Check data consistency
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced')
       AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_backup_20250922') THEN
        RETURN QUERY SELECT
            'data_consistency'::TEXT,
            CASE WHEN (SELECT COUNT(*) FROM clients_enhanced) >= (SELECT COUNT(*) FROM clients_backup_20250922)
                 THEN 'SUCCESS' ELSE 'WARNING' END::TEXT,
            'Enhanced: ' || (SELECT COUNT(*) FROM clients_enhanced)::TEXT || ', Backup: ' || (SELECT COUNT(*) FROM clients_backup_20250922)::TEXT;
    END IF;

    -- Check RLS policies
    RETURN QUERY SELECT
        'rls_policies'::TEXT,
        CASE WHEN EXISTS (SELECT FROM pg_policies WHERE tablename = 'clients_enhanced')
             THEN 'SUCCESS' ELSE 'FAILED' END::TEXT,
        'RLS policies count: ' || (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'clients_enhanced')::TEXT;
END $$;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Schema unification backup phase completed successfully';
    RAISE NOTICE 'Run SELECT * FROM validate_schema_unification() to verify the migration';
END $$;