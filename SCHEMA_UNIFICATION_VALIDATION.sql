-- ==============================================================================
-- HT-034.6.1: SCHEMA UNIFICATION VALIDATION AND ROLLBACK PROCEDURES
-- ==============================================================================
-- Purpose: Validate schema unification and provide rollback capabilities
-- Date: 2025-09-22
-- Execute after running MANUAL_SCHEMA_UNIFICATION.sql
-- ==============================================================================

-- VALIDATION QUERIES
-- ==============================================================================

-- 1. Check all tables exist
SELECT 'Tables Check' as validation_type,
       table_name,
       CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (VALUES
    ('clients_enhanced'),
    ('clients_backup_20250922'),
    ('system_configurations'),
    ('client_billing_info')
) AS expected_tables(table_name)
LEFT JOIN information_schema.tables t ON t.table_name = expected_tables.table_name;

-- 2. Check foreign key relationships
SELECT 'Foreign Keys Check' as validation_type,
       constraint_name,
       table_name,
       column_name,
       foreign_table_name,
       foreign_column_name
FROM information_schema.key_column_usage k
JOIN information_schema.referential_constraints r ON k.constraint_name = r.constraint_name
JOIN information_schema.key_column_usage f ON r.unique_constraint_name = f.constraint_name
WHERE k.table_name IN ('clients_enhanced', 'system_configurations', 'client_billing_info');

-- 3. Check RLS policies
SELECT 'RLS Policies Check' as validation_type,
       tablename,
       policyname,
       cmd,
       qual
FROM pg_policies
WHERE tablename IN ('clients_enhanced', 'system_configurations', 'client_billing_info');

-- 4. Check indexes
SELECT 'Indexes Check' as validation_type,
       tablename,
       indexname,
       indexdef
FROM pg_indexes
WHERE tablename IN ('clients_enhanced', 'system_configurations', 'client_billing_info')
ORDER BY tablename, indexname;

-- 5. Data integrity check
DO $$
DECLARE
    backup_count INTEGER;
    enhanced_count INTEGER;
    config_count INTEGER;
    billing_count INTEGER;
BEGIN
    -- Get counts
    SELECT COALESCE((SELECT COUNT(*) FROM clients_backup_20250922), 0) INTO backup_count;
    SELECT COALESCE((SELECT COUNT(*) FROM clients_enhanced), 0) INTO enhanced_count;
    SELECT COALESCE((SELECT COUNT(*) FROM system_configurations), 0) INTO config_count;
    SELECT COALESCE((SELECT COUNT(*) FROM client_billing_info), 0) INTO billing_count;

    RAISE NOTICE '=== DATA INTEGRITY CHECK ===';
    RAISE NOTICE 'Backup clients: %', backup_count;
    RAISE NOTICE 'Enhanced clients: %', enhanced_count;
    RAISE NOTICE 'System configurations: %', config_count;
    RAISE NOTICE 'Billing info records: %', billing_count;

    IF enhanced_count >= backup_count THEN
        RAISE NOTICE 'DATA MIGRATION: SUCCESS';
    ELSE
        RAISE WARNING 'DATA MIGRATION: POTENTIAL LOSS DETECTED';
    END IF;
END $$;

-- 6. Test data access with RLS
DO $$
DECLARE
    test_result TEXT;
BEGIN
    BEGIN
        SELECT 'RLS TEST: ' || COUNT(*)::TEXT INTO test_result FROM clients_enhanced;
        RAISE NOTICE '%', test_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'RLS TEST FAILED: %', SQLERRM;
    END;
END $$;

-- ==============================================================================
-- COMPREHENSIVE VALIDATION FUNCTION
-- ==============================================================================

CREATE OR REPLACE FUNCTION comprehensive_schema_validation()
RETURNS TABLE (
    check_category TEXT,
    check_name TEXT,
    status TEXT,
    details TEXT,
    action_required TEXT
) LANGUAGE plpgsql AS $$
DECLARE
    backup_count INTEGER;
    enhanced_count INTEGER;
    policies_count INTEGER;
    fk_count INTEGER;
BEGIN
    -- Table existence checks
    RETURN QUERY SELECT
        'table_existence'::TEXT,
        'clients_enhanced'::TEXT,
        CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced')
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Core enhanced clients table'::TEXT,
        CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced')
             THEN 'None' ELSE 'Execute schema unification script' END::TEXT;

    RETURN QUERY SELECT
        'table_existence'::TEXT,
        'backup_table'::TEXT,
        CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_backup_20250922')
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Backup safety table'::TEXT,
        CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_backup_20250922')
             THEN 'None' ELSE 'Critical: Backup missing' END::TEXT;

    -- Data consistency checks
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced')
       AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_backup_20250922') THEN

        SELECT COUNT(*) INTO backup_count FROM clients_backup_20250922;
        SELECT COUNT(*) INTO enhanced_count FROM clients_enhanced;

        RETURN QUERY SELECT
            'data_consistency'::TEXT,
            'migration_completeness'::TEXT,
            CASE WHEN enhanced_count >= backup_count THEN 'PASS' ELSE 'FAIL' END::TEXT,
            'Backup: ' || backup_count::TEXT || ', Enhanced: ' || enhanced_count::TEXT,
            CASE WHEN enhanced_count >= backup_count THEN 'None' ELSE 'Review migration process' END::TEXT;
    END IF;

    -- Security checks
    SELECT COUNT(*) INTO policies_count FROM pg_policies WHERE tablename = 'clients_enhanced';
    RETURN QUERY SELECT
        'security'::TEXT,
        'rls_policies'::TEXT,
        CASE WHEN policies_count >= 3 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || policies_count::TEXT || ' policies (need 3+)'::TEXT,
        CASE WHEN policies_count >= 3 THEN 'None' ELSE 'Create missing RLS policies' END::TEXT;

    -- Foreign key integrity
    SELECT COUNT(*) INTO fk_count FROM information_schema.referential_constraints
    WHERE constraint_schema = 'public' AND
          (constraint_name LIKE '%clients_enhanced%' OR
           constraint_name LIKE '%system_configurations%' OR
           constraint_name LIKE '%client_billing%');

    RETURN QUERY SELECT
        'integrity'::TEXT,
        'foreign_keys'::TEXT,
        CASE WHEN fk_count >= 2 THEN 'PASS' ELSE 'WARN' END::TEXT,
        'Found ' || fk_count::TEXT || ' foreign key constraints'::TEXT,
        CASE WHEN fk_count >= 2 THEN 'None' ELSE 'Review foreign key setup' END::TEXT;

    -- Performance checks
    RETURN QUERY SELECT
        'performance'::TEXT,
        'indexes'::TEXT,
        CASE WHEN EXISTS (SELECT FROM pg_indexes WHERE tablename = 'clients_enhanced' AND indexname LIKE '%email%')
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Email index on clients_enhanced'::TEXT,
        CASE WHEN EXISTS (SELECT FROM pg_indexes WHERE tablename = 'clients_enhanced' AND indexname LIKE '%email%')
             THEN 'None' ELSE 'Create performance indexes' END::TEXT;

END $$;

-- ==============================================================================
-- ROLLBACK PROCEDURES
-- ==============================================================================

CREATE OR REPLACE FUNCTION rollback_schema_unification()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    result_message TEXT := '';
BEGIN
    -- Check if backup exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_backup_20250922') THEN
        RETURN 'ROLLBACK FAILED: No backup table found (clients_backup_20250922)';
    END IF;

    -- Start rollback process
    result_message := 'ROLLBACK STARTED: ';

    -- Drop new tables (in reverse dependency order)
    BEGIN
        DROP TABLE IF EXISTS client_billing_info CASCADE;
        result_message := result_message || 'client_billing_info dropped, ';
    EXCEPTION WHEN OTHERS THEN
        result_message := result_message || 'client_billing_info drop failed, ';
    END;

    BEGIN
        DROP TABLE IF EXISTS system_configurations CASCADE;
        result_message := result_message || 'system_configurations dropped, ';
    EXCEPTION WHEN OTHERS THEN
        result_message := result_message || 'system_configurations drop failed, ';
    END;

    -- Restore original clients table if clients_enhanced exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced') THEN
        BEGIN
            -- Drop clients_enhanced
            DROP TABLE clients_enhanced CASCADE;
            result_message := result_message || 'clients_enhanced dropped, ';

            -- Recreate clients from backup
            CREATE TABLE clients AS SELECT id, email, created_at, updated_at FROM clients_backup_20250922;

            -- Restore original constraints and triggers
            ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

            CREATE POLICY "Users can read own client record" ON clients
                FOR SELECT USING (auth.jwt() ->> 'email' = email);

            CREATE POLICY "Users can update own client record" ON clients
                FOR UPDATE USING (auth.jwt() ->> 'email' = email);

            CREATE POLICY "Service role can insert clients" ON clients
                FOR INSERT WITH CHECK (true);

            result_message := result_message || 'clients table restored, ';

        EXCEPTION WHEN OTHERS THEN
            result_message := result_message || 'clients restoration failed: ' || SQLERRM;
        END;
    END IF;

    result_message := result_message || 'ROLLBACK COMPLETED';
    RETURN result_message;
END $$;

-- ==============================================================================
-- USAGE INSTRUCTIONS
-- ==============================================================================

-- Run comprehensive validation
-- SELECT * FROM comprehensive_schema_validation();

-- Run quick validation
-- SELECT * FROM validate_schema_unification();

-- Emergency rollback (only if needed)
-- SELECT rollback_schema_unification();

-- ==============================================================================
-- FINAL STATUS CHECK
-- ==============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SCHEMA UNIFICATION VALIDATION READY';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Execute: SELECT * FROM comprehensive_schema_validation();';
    RAISE NOTICE 'For emergency rollback: SELECT rollback_schema_unification();';
    RAISE NOTICE '============================================';
END $$;