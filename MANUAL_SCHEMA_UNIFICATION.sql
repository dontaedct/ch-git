-- ==============================================================================
-- HT-034.6.1: MANUAL DATABASE SCHEMA UNIFICATION IMPLEMENTATION
-- ==============================================================================
-- CRITICAL: Execute this script in Supabase SQL Editor step by step
-- Date: 2025-09-22
-- Purpose: Unify database schema conflicts between clients and clients_enhanced
--
-- INSTRUCTIONS:
-- 1. Execute each section separately in Supabase SQL Editor
-- 2. Verify results after each section before proceeding
-- 3. Create backup before starting
-- ==============================================================================

-- SECTION 1: BACKUP EXISTING DATA
-- ==============================================================================
-- Create backup of existing clients table before any changes
DO $$
BEGIN
    -- Only create backup if clients table exists and backup doesn't
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients')
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_backup_20250922') THEN

        CREATE TABLE clients_backup_20250922 AS SELECT * FROM clients;
        ALTER TABLE clients_backup_20250922 ADD COLUMN backup_created_at TIMESTAMPTZ DEFAULT NOW();

        RAISE NOTICE 'Backup created: clients_backup_20250922 with % rows',
                     (SELECT COUNT(*) FROM clients_backup_20250922);
    ELSE
        RAISE NOTICE 'Backup already exists or clients table not found';
    END IF;
END $$;

-- SECTION 2: CREATE CLIENTS_ENHANCED TABLE
-- ==============================================================================
-- Create the enhanced clients table with all required fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced') THEN
        CREATE TABLE clients_enhanced (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            -- Basic Information
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

            CONSTRAINT fk_clients_enhanced_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id),
            CONSTRAINT fk_clients_enhanced_assigned_manager FOREIGN KEY (assigned_manager) REFERENCES auth.users(id)
        );

        -- Create performance indexes
        CREATE INDEX idx_clients_enhanced_email ON clients_enhanced(email);
        CREATE INDEX idx_clients_enhanced_status ON clients_enhanced(status);
        CREATE INDEX idx_clients_enhanced_tier ON clients_enhanced(tier);
        CREATE INDEX idx_clients_enhanced_created_at ON clients_enhanced(created_at);
        CREATE INDEX idx_clients_enhanced_manager ON clients_enhanced(assigned_manager);
        CREATE INDEX idx_clients_enhanced_company ON clients_enhanced(company_name);

        RAISE NOTICE 'clients_enhanced table created successfully';
    ELSE
        RAISE NOTICE 'clients_enhanced table already exists';
    END IF;
END $$;

-- SECTION 3: MIGRATE DATA FROM CLIENTS TO CLIENTS_ENHANCED
-- ==============================================================================
-- Migrate existing data if clients table exists and has data
DO $$
DECLARE
    client_record RECORD;
    migrated_count INTEGER := 0;
BEGIN
    -- Check if clients table has data and clients_enhanced is empty
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients')
       AND EXISTS (SELECT 1 FROM clients LIMIT 1)
       AND NOT EXISTS (SELECT 1 FROM clients_enhanced LIMIT 1) THEN

        -- Migrate each client record
        FOR client_record IN SELECT * FROM clients LOOP
            INSERT INTO clients_enhanced (
                id,
                name,
                email,
                created_at,
                updated_at
            ) VALUES (
                client_record.id,
                COALESCE(client_record.email, 'Unknown Client'), -- Use email as name if no name field
                client_record.email,
                client_record.created_at,
                client_record.updated_at
            );
            migrated_count := migrated_count + 1;
        END LOOP;

        RAISE NOTICE 'Migrated % client records successfully', migrated_count;
    ELSE
        RAISE NOTICE 'No data to migrate or clients_enhanced already has data';
    END IF;
END $$;

-- SECTION 4: ENABLE ROW LEVEL SECURITY
-- ==============================================================================
-- Enable RLS and create security policies
ALTER TABLE clients_enhanced ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS clients_enhanced_select_policy ON clients_enhanced;
DROP POLICY IF EXISTS clients_enhanced_insert_policy ON clients_enhanced;
DROP POLICY IF EXISTS clients_enhanced_update_policy ON clients_enhanced;

-- Create comprehensive RLS policies
CREATE POLICY clients_enhanced_select_policy ON clients_enhanced
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (auth.uid() = created_by OR
         auth.uid() = assigned_manager OR
         EXISTS (SELECT 1 FROM auth.users
                 WHERE id = auth.uid()
                 AND raw_user_meta_data->>'role' IN ('admin', 'super_admin', 'staff')))
    );

CREATE POLICY clients_enhanced_insert_policy ON clients_enhanced
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        (auth.uid() = created_by OR
         EXISTS (SELECT 1 FROM auth.users
                 WHERE id = auth.uid()
                 AND raw_user_meta_data->>'role' IN ('admin', 'super_admin', 'staff')))
    );

CREATE POLICY clients_enhanced_update_policy ON clients_enhanced
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        (auth.uid() = created_by OR
         auth.uid() = assigned_manager OR
         EXISTS (SELECT 1 FROM auth.users
                 WHERE id = auth.uid()
                 AND raw_user_meta_data->>'role' IN ('admin', 'super_admin', 'staff')))
    );

-- SECTION 5: CREATE UPDATE TRIGGER
-- ==============================================================================
-- Create or update the trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Create trigger for clients_enhanced
DROP TRIGGER IF EXISTS update_clients_enhanced_updated_at ON clients_enhanced;
CREATE TRIGGER update_clients_enhanced_updated_at
    BEFORE UPDATE ON clients_enhanced
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- SECTION 6: CREATE SUPPORTING TABLES (MISSING TABLES FROM HT-034.5.1)
-- ==============================================================================

-- System Configurations Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_configurations') THEN
        CREATE TABLE system_configurations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            configuration_key VARCHAR(255) NOT NULL UNIQUE,
            configuration_category VARCHAR(100) NOT NULL,
            configuration_value JSONB NOT NULL DEFAULT '{}',
            configuration_schema JSONB DEFAULT '{}',
            description TEXT,
            is_encrypted BOOLEAN DEFAULT false,
            is_system BOOLEAN DEFAULT false,
            client_id UUID,
            template_id VARCHAR(255),
            environment VARCHAR(50) DEFAULT 'all',
            version INTEGER DEFAULT 1,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            created_by UUID,
            updated_by UUID,

            CONSTRAINT fk_system_configurations_client FOREIGN KEY (client_id) REFERENCES clients_enhanced(id) ON DELETE CASCADE,
            CONSTRAINT fk_system_configurations_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id),
            CONSTRAINT fk_system_configurations_updated_by FOREIGN KEY (updated_by) REFERENCES auth.users(id)
        );

        CREATE INDEX idx_system_configurations_key ON system_configurations(configuration_key);
        CREATE INDEX idx_system_configurations_category ON system_configurations(configuration_category);
        CREATE INDEX idx_system_configurations_client_id ON system_configurations(client_id);

        RAISE NOTICE 'system_configurations table created';
    END IF;
END $$;

-- Client Billing Information Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_billing_info') THEN
        CREATE TABLE client_billing_info (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID NOT NULL UNIQUE,
            subscription_tier VARCHAR(50) DEFAULT 'basic',
            subscription_status VARCHAR(50) DEFAULT 'active',
            subscription_start_date TIMESTAMPTZ,
            subscription_end_date TIMESTAMPTZ,
            trial_end_date TIMESTAMPTZ,
            billing_email VARCHAR(255),
            billing_frequency VARCHAR(50) DEFAULT 'monthly',
            currency VARCHAR(3) DEFAULT 'USD',
            payment_method_id VARCHAR(255),
            payment_provider VARCHAR(100) DEFAULT 'stripe',
            payment_status VARCHAR(50) DEFAULT 'pending',
            billing_address JSONB DEFAULT '{}',
            tax_id VARCHAR(255),
            vat_number VARCHAR(255),
            usage_limits JSONB DEFAULT '{}',
            current_usage JSONB DEFAULT '{}',
            overage_charges DECIMAL(10,2) DEFAULT 0.00,
            last_invoice_date TIMESTAMPTZ,
            next_invoice_date TIMESTAMPTZ,
            invoice_amount DECIMAL(10,2) DEFAULT 0.00,
            account_balance DECIMAL(10,2) DEFAULT 0.00,
            credit_balance DECIMAL(10,2) DEFAULT 0.00,
            payment_retry_count INTEGER DEFAULT 0,
            last_payment_attempt TIMESTAMPTZ,
            dunning_status VARCHAR(50) DEFAULT 'none',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            created_by UUID,

            CONSTRAINT fk_client_billing_client FOREIGN KEY (client_id) REFERENCES clients_enhanced(id) ON DELETE CASCADE,
            CONSTRAINT fk_client_billing_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id)
        );

        CREATE INDEX idx_client_billing_client_id ON client_billing_info(client_id);
        CREATE INDEX idx_client_billing_subscription_status ON client_billing_info(subscription_status);

        RAISE NOTICE 'client_billing_info table created';
    END IF;
END $$;

-- SECTION 7: ENABLE RLS FOR NEW TABLES
-- ==============================================================================
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_billing_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_configurations
DROP POLICY IF EXISTS system_configurations_select_policy ON system_configurations;
CREATE POLICY system_configurations_select_policy ON system_configurations
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (client_id IS NULL OR client_id IN (
            SELECT id FROM clients_enhanced WHERE
            auth.uid() = created_by OR auth.uid() = assigned_manager OR
            EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
        )) OR
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
    );

-- RLS Policies for client_billing_info
DROP POLICY IF EXISTS client_billing_info_select_policy ON client_billing_info;
CREATE POLICY client_billing_info_select_policy ON client_billing_info
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        client_id IN (
            SELECT id FROM clients_enhanced WHERE
            auth.uid() = created_by OR auth.uid() = assigned_manager OR
            EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
        )
    );

-- SECTION 8: GRANT PERMISSIONS
-- ==============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON clients_enhanced TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON system_configurations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_billing_info TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- SECTION 9: CREATE VALIDATION FUNCTION
-- ==============================================================================
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

    -- Check supporting tables
    RETURN QUERY SELECT
        'supporting_tables'::TEXT,
        CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_configurations')
              AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_billing_info')
             THEN 'SUCCESS' ELSE 'FAILED' END::TEXT,
        'Supporting tables created: ' ||
        EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_configurations')::TEXT || ', ' ||
        EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_billing_info')::TEXT;
END $$;

-- SECTION 10: CREATE BACKWARD COMPATIBILITY VIEW
-- ==============================================================================
CREATE OR REPLACE VIEW clients_unified AS
SELECT
    id,
    name,
    email,
    created_at,
    updated_at,
    company_name,
    status,
    tier
FROM clients_enhanced;

GRANT SELECT ON clients_unified TO authenticated;

-- ==============================================================================
-- COMPLETION MESSAGE
-- ==============================================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCHEMA UNIFICATION COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Run the following to validate:';
    RAISE NOTICE 'SELECT * FROM validate_schema_unification();';
    RAISE NOTICE '========================================';
END $$;