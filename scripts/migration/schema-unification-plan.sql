-- HT-036.3.1: Database Schema Unification Migration Plan
-- This migration plan ensures zero-downtime integration of all HT-035 systems
-- Created: 2025-09-24
-- Version: 1.0

-- =====================================================================
-- MIGRATION OVERVIEW
-- =====================================================================
-- Phase 1: Pre-Migration Validation (READ-ONLY)
-- Phase 2: Schema Extension (ZERO DOWNTIME)
-- Phase 3: Data Population (INCREMENTAL)
-- Phase 4: Validation & Testing
-- Phase 5: Cleanup & Optimization
-- =====================================================================

-- =====================================================================
-- PHASE 1: PRE-MIGRATION VALIDATION
-- =====================================================================

-- 1.1: Check for required tables
DO $$
BEGIN
    RAISE NOTICE 'Phase 1: Pre-Migration Validation Started';

    -- Check clients_enhanced table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced') THEN
        RAISE EXCEPTION 'Required table clients_enhanced does not exist';
    END IF;

    -- Check marketplace_modules table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marketplace_modules') THEN
        RAISE EXCEPTION 'Required table marketplace_modules does not exist';
    END IF;

    -- Check module_installations table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'module_installations') THEN
        RAISE EXCEPTION 'Required table module_installations does not exist';
    END IF;

    -- Check client_app_overrides table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_app_overrides') THEN
        RAISE EXCEPTION 'Required table client_app_overrides does not exist';
    END IF;

    RAISE NOTICE 'Phase 1: All required tables exist ✓';
END $$;

-- 1.2: Create backup of existing data
CREATE TABLE IF NOT EXISTS migration_backup_client_app_overrides AS
SELECT * FROM client_app_overrides;

RAISE NOTICE 'Phase 1: Backup created for client_app_overrides ✓';

-- 1.3: Check for data integrity issues
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Check for orphaned client references
    SELECT COUNT(*) INTO orphan_count
    FROM client_app_overrides cao
    WHERE NOT EXISTS (SELECT 1 FROM clients_enhanced WHERE id = cao.client_id);

    IF orphan_count > 0 THEN
        RAISE WARNING 'Found % orphaned client references in client_app_overrides', orphan_count;
    ELSE
        RAISE NOTICE 'Phase 1: No orphaned client references found ✓';
    END IF;
END $$;

-- =====================================================================
-- PHASE 2: SCHEMA EXTENSION (ZERO DOWNTIME)
-- =====================================================================

BEGIN;

RAISE NOTICE 'Phase 2: Schema Extension Started';

-- 2.1: Extend client_app_overrides with marketplace integration
ALTER TABLE client_app_overrides
    ADD COLUMN IF NOT EXISTS marketplace_module_id UUID,
    ADD COLUMN IF NOT EXISTS installation_id UUID,
    ADD COLUMN IF NOT EXISTS activation_status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS activation_metadata JSONB DEFAULT '{}';

RAISE NOTICE 'Phase 2: client_app_overrides extended ✓';

-- 2.2: Create orchestration_workflows table
CREATE TABLE IF NOT EXISTS orchestration_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name VARCHAR(255) NOT NULL,
    workflow_type VARCHAR(100) NOT NULL,
    client_id UUID REFERENCES clients_enhanced(id) ON DELETE CASCADE,
    workflow_definition JSONB NOT NULL,
    current_step VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    steps_completed JSONB DEFAULT '[]',
    steps_failed JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    CONSTRAINT check_workflow_status CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    CONSTRAINT check_workflow_type CHECK (workflow_type IN ('client_onboarding', 'module_activation', 'deployment', 'handover', 'custom'))
);

RAISE NOTICE 'Phase 2: orchestration_workflows created ✓';

-- 2.3: Create workflow_executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES orchestration_workflows(id) ON DELETE CASCADE,
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(100) NOT NULL,
    execution_order INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_data JSONB DEFAULT '{}',
    execution_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    CONSTRAINT check_execution_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    CONSTRAINT check_retry_count CHECK (retry_count >= 0 AND retry_count <= max_retries)
);

RAISE NOTICE 'Phase 2: workflow_executions created ✓';

-- 2.4: Create handover_packages table
CREATE TABLE IF NOT EXISTS handover_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients_enhanced(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES orchestration_workflows(id) ON DELETE SET NULL,
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(100) DEFAULT 'complete',
    installed_modules JSONB DEFAULT '[]',
    module_configurations JSONB DEFAULT '{}',
    system_configs UUID[] DEFAULT '{}',
    deployment_configs UUID[] DEFAULT '{}',
    sop_documents JSONB DEFAULT '[]',
    tutorial_videos JSONB DEFAULT '[]',
    admin_credentials JSONB DEFAULT '{}',
    walkthrough_content JSONB DEFAULT '{}',
    delivery_status VARCHAR(50) DEFAULT 'pending',
    delivery_method VARCHAR(100),
    delivered_at TIMESTAMPTZ,
    delivery_confirmation JSONB DEFAULT '{}',
    delivery_recipient VARCHAR(255),
    package_metadata JSONB DEFAULT '{}',
    package_size_mb DECIMAL(10,2),
    checksum VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_delivery_status CHECK (delivery_status IN ('pending', 'preparing', 'ready', 'delivering', 'delivered', 'failed')),
    CONSTRAINT check_package_type CHECK (package_type IN ('complete', 'incremental', 'update', 'rollback'))
);

RAISE NOTICE 'Phase 2: handover_packages created ✓';

-- 2.5: Create integration_events table
CREATE TABLE IF NOT EXISTS integration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(100) NOT NULL,
    event_target VARCHAR(100),
    event_payload JSONB NOT NULL,
    event_metadata JSONB DEFAULT '{}',
    processed BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(50) DEFAULT 'pending',
    processing_error TEXT,
    processed_at TIMESTAMPTZ,
    processed_by VARCHAR(255),
    correlation_id UUID,
    causation_id UUID,
    aggregate_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_event_source CHECK (event_source IN ('orchestration', 'marketplace', 'modules', 'handover', 'configuration', 'system')),
    CONSTRAINT check_processing_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'retrying'))
);

RAISE NOTICE 'Phase 2: integration_events created ✓';

-- 2.6: Add indexes
CREATE INDEX IF NOT EXISTS idx_cao_marketplace_module ON client_app_overrides(marketplace_module_id);
CREATE INDEX IF NOT EXISTS idx_cao_installation ON client_app_overrides(installation_id);
CREATE INDEX IF NOT EXISTS idx_cao_activation_status ON client_app_overrides(activation_status);

CREATE INDEX IF NOT EXISTS idx_orchestration_workflows_client ON orchestration_workflows(client_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_workflows_status ON orchestration_workflows(status);
CREATE INDEX IF NOT EXISTS idx_orchestration_workflows_type ON orchestration_workflows(workflow_type);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);

CREATE INDEX IF NOT EXISTS idx_handover_packages_client ON handover_packages(client_id);
CREATE INDEX IF NOT EXISTS idx_handover_packages_workflow ON handover_packages(workflow_id);
CREATE INDEX IF NOT EXISTS idx_handover_packages_status ON handover_packages(delivery_status);

CREATE INDEX IF NOT EXISTS idx_integration_events_type ON integration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_integration_events_source ON integration_events(event_source);
CREATE INDEX IF NOT EXISTS idx_integration_events_processed ON integration_events(processed);
CREATE INDEX IF NOT EXISTS idx_integration_events_correlation ON integration_events(correlation_id);

RAISE NOTICE 'Phase 2: Indexes created ✓';

COMMIT;

RAISE NOTICE 'Phase 2: Schema Extension Completed Successfully ✓';

-- =====================================================================
-- PHASE 3: DATA POPULATION (INCREMENTAL)
-- =====================================================================

BEGIN;

RAISE NOTICE 'Phase 3: Data Population Started';

-- 3.1: Link existing client_app_overrides to marketplace modules (where applicable)
WITH module_mapping AS (
    SELECT
        cao.id as override_id,
        mm.id as marketplace_module_id,
        mi.id as installation_id
    FROM client_app_overrides cao
    LEFT JOIN marketplace_modules mm ON cao.app_name = mm.name
    LEFT JOIN module_installations mi ON mm.id = mi.module_id AND cao.client_id = mi.tenant_id
)
UPDATE client_app_overrides cao
SET
    marketplace_module_id = mm.marketplace_module_id,
    installation_id = mm.installation_id,
    activation_status = CASE
        WHEN cao.enabled = true THEN 'active'
        ELSE 'inactive'
    END
FROM module_mapping mm
WHERE cao.id = mm.override_id
AND mm.marketplace_module_id IS NOT NULL;

RAISE NOTICE 'Phase 3: Linked client_app_overrides to marketplace modules ✓';

-- 3.2: Create initial orchestration workflows for existing clients
INSERT INTO orchestration_workflows (
    workflow_name,
    workflow_type,
    client_id,
    workflow_definition,
    status,
    created_at
)
SELECT
    'Client Setup - ' || c.name,
    'client_onboarding',
    c.id,
    jsonb_build_object(
        'steps', jsonb_build_array(
            jsonb_build_object('name', 'configure_modules', 'status', 'completed'),
            jsonb_build_object('name', 'setup_deployment', 'status', 'completed'),
            jsonb_build_object('name', 'prepare_handover', 'status', 'pending')
        )
    ),
    'in_progress',
    c.created_at
FROM clients_enhanced c
WHERE NOT EXISTS (
    SELECT 1 FROM orchestration_workflows WHERE client_id = c.id
)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Phase 3: Created orchestration workflows for existing clients ✓';

-- 3.3: Create handover packages for completed deployments
INSERT INTO handover_packages (
    client_id,
    workflow_id,
    package_name,
    package_type,
    installed_modules,
    module_configurations,
    delivery_status,
    created_at
)
SELECT
    c.id,
    ow.id,
    'Handover Package - ' || c.name,
    'complete',
    (
        SELECT jsonb_agg(jsonb_build_object(
            'module_id', mi.module_id,
            'installation_id', mi.id,
            'module_name', mm.name,
            'version', mi.installed_version
        ))
        FROM module_installations mi
        JOIN marketplace_modules mm ON mi.module_id = mm.id
        WHERE mi.tenant_id = c.id AND mi.status = 'active'
    ),
    (
        SELECT jsonb_object_agg(cao.app_name, cao.override_settings)
        FROM client_app_overrides cao
        WHERE cao.client_id = c.id AND cao.enabled = true
    ),
    'pending',
    NOW()
FROM clients_enhanced c
JOIN orchestration_workflows ow ON c.id = ow.client_id
WHERE EXISTS (
    SELECT 1 FROM client_deployments
    WHERE client_id = c.id AND status = 'deployed'
)
AND NOT EXISTS (
    SELECT 1 FROM handover_packages WHERE client_id = c.id
)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Phase 3: Created handover packages for completed deployments ✓';

-- 3.4: Create integration events for recent activities
INSERT INTO integration_events (
    event_type,
    event_source,
    event_payload,
    processed,
    correlation_id,
    created_at
)
SELECT
    'module_installed',
    'modules',
    jsonb_build_object(
        'module_id', mi.module_id,
        'tenant_id', mi.tenant_id,
        'installation_id', mi.id,
        'version', mi.installed_version
    ),
    true,
    mi.id,
    mi.installed_at
FROM module_installations mi
WHERE mi.installed_at >= NOW() - INTERVAL '7 days'
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Phase 3: Created integration events for recent activities ✓';

COMMIT;

RAISE NOTICE 'Phase 3: Data Population Completed Successfully ✓';

-- =====================================================================
-- PHASE 4: ADD FOREIGN KEY CONSTRAINTS
-- =====================================================================

BEGIN;

RAISE NOTICE 'Phase 4: Adding Foreign Key Constraints';

-- Add FK constraints with proper error handling
DO $$
BEGIN
    -- FK for marketplace_module_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_cao_marketplace_module'
    ) THEN
        ALTER TABLE client_app_overrides
            ADD CONSTRAINT fk_cao_marketplace_module
            FOREIGN KEY (marketplace_module_id)
            REFERENCES marketplace_modules(id)
            ON DELETE SET NULL;
        RAISE NOTICE 'Phase 4: FK fk_cao_marketplace_module added ✓';
    END IF;

    -- FK for installation_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_cao_installation'
    ) THEN
        ALTER TABLE client_app_overrides
            ADD CONSTRAINT fk_cao_installation
            FOREIGN KEY (installation_id)
            REFERENCES module_installations(id)
            ON DELETE CASCADE;
        RAISE NOTICE 'Phase 4: FK fk_cao_installation added ✓';
    END IF;
END $$;

COMMIT;

RAISE NOTICE 'Phase 4: Foreign Key Constraints Added Successfully ✓';

-- =====================================================================
-- PHASE 5: CREATE VIEWS
-- =====================================================================

BEGIN;

RAISE NOTICE 'Phase 5: Creating Integration Views';

-- Create unified_client_dashboard view
CREATE OR REPLACE VIEW unified_client_dashboard AS
SELECT
    c.id as client_id,
    c.name as client_name,
    c.company_name,
    c.status as client_status,
    COUNT(DISTINCT mi.id) FILTER (WHERE mi.status = 'active') as active_modules,
    COUNT(DISTINCT cao.id) as configured_apps,
    ow.workflow_name as current_workflow,
    ow.status as workflow_status,
    hp.package_name as handover_package,
    hp.delivery_status,
    c.created_at,
    c.updated_at
FROM clients_enhanced c
LEFT JOIN module_installations mi ON c.id = mi.tenant_id
LEFT JOIN client_app_overrides cao ON c.id = cao.client_id
LEFT JOIN orchestration_workflows ow ON c.id = ow.client_id
    AND ow.id = (SELECT id FROM orchestration_workflows WHERE client_id = c.id ORDER BY created_at DESC LIMIT 1)
LEFT JOIN handover_packages hp ON c.id = hp.client_id
    AND hp.id = (SELECT id FROM handover_packages WHERE client_id = c.id ORDER BY created_at DESC LIMIT 1)
GROUP BY c.id, c.name, c.company_name, c.status, ow.workflow_name, ow.status,
         hp.package_name, hp.delivery_status, c.created_at, c.updated_at;

RAISE NOTICE 'Phase 5: unified_client_dashboard view created ✓';

-- Create module_integration_view
CREATE OR REPLACE VIEW module_integration_view AS
SELECT
    mm.id as module_id,
    mm.name as module_name,
    mm.version,
    mi.id as installation_id,
    mi.tenant_id as client_id,
    cao.id as override_id,
    cao.enabled,
    cao.activation_status,
    mm.rating_average,
    mm.install_count,
    mi.installed_at
FROM marketplace_modules mm
LEFT JOIN module_installations mi ON mm.id = mi.module_id
LEFT JOIN client_app_overrides cao ON mi.id = cao.installation_id;

RAISE NOTICE 'Phase 5: module_integration_view created ✓';

COMMIT;

RAISE NOTICE 'Phase 5: Integration Views Created Successfully ✓';

-- =====================================================================
-- PHASE 6: ENABLE ROW LEVEL SECURITY
-- =====================================================================

BEGIN;

RAISE NOTICE 'Phase 6: Enabling Row Level Security';

-- Enable RLS
ALTER TABLE orchestration_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY orchestration_client_isolation ON orchestration_workflows
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients_enhanced WHERE
            auth.uid() = created_by OR auth.uid() = assigned_manager OR
            EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
        )
    );

CREATE POLICY handover_client_isolation ON handover_packages
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients_enhanced WHERE
            auth.uid() = created_by OR auth.uid() = assigned_manager OR
            EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
        )
    );

COMMIT;

RAISE NOTICE 'Phase 6: Row Level Security Enabled Successfully ✓';

-- =====================================================================
-- PHASE 7: GRANT PERMISSIONS
-- =====================================================================

BEGIN;

RAISE NOTICE 'Phase 7: Granting Permissions';

GRANT SELECT, INSERT, UPDATE, DELETE ON orchestration_workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_executions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON handover_packages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_events TO authenticated;

GRANT SELECT ON unified_client_dashboard TO authenticated;
GRANT SELECT ON module_integration_view TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;

RAISE NOTICE 'Phase 7: Permissions Granted Successfully ✓';

-- =====================================================================
-- PHASE 8: VALIDATION & TESTING
-- =====================================================================

DO $$
DECLARE
    table_count INTEGER;
    view_count INTEGER;
    data_count INTEGER;
BEGIN
    RAISE NOTICE 'Phase 8: Running Validation Tests';

    -- Check tables exist
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_name IN (
        'orchestration_workflows',
        'workflow_executions',
        'handover_packages',
        'integration_events'
    );

    IF table_count = 4 THEN
        RAISE NOTICE 'Phase 8: All tables created ✓';
    ELSE
        RAISE EXCEPTION 'Phase 8: Expected 4 tables, found %', table_count;
    END IF;

    -- Check views exist
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views
    WHERE table_name IN ('unified_client_dashboard', 'module_integration_view');

    IF view_count = 2 THEN
        RAISE NOTICE 'Phase 8: All views created ✓';
    ELSE
        RAISE EXCEPTION 'Phase 8: Expected 2 views, found %', view_count;
    END IF;

    -- Check data populated
    SELECT COUNT(*) INTO data_count FROM orchestration_workflows;
    RAISE NOTICE 'Phase 8: Found % orchestration workflows', data_count;

    SELECT COUNT(*) INTO data_count FROM handover_packages;
    RAISE NOTICE 'Phase 8: Found % handover packages', data_count;

    RAISE NOTICE 'Phase 8: Validation Completed Successfully ✓';
END $$;

-- =====================================================================
-- MIGRATION SUMMARY
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'HT-036.3.1 DATABASE MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '- Extended client_app_overrides with marketplace integration';
    RAISE NOTICE '- Created orchestration_workflows system';
    RAISE NOTICE '- Created workflow_executions tracking';
    RAISE NOTICE '- Created handover_packages automation';
    RAISE NOTICE '- Created integration_events system';
    RAISE NOTICE '- Created unified dashboard views';
    RAISE NOTICE '- Enabled row level security';
    RAISE NOTICE '- Granted appropriate permissions';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '- Run data integrity validation (see validation script)';
    RAISE NOTICE '- Test cross-system queries';
    RAISE NOTICE '- Verify application integration';
    RAISE NOTICE '- Monitor performance metrics';
    RAISE NOTICE '====================================================';
END $$;