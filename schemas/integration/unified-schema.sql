-- Unified Database Schema for HT-036 Integration
-- Complete unified schema integrating all HT-035 systems with existing infrastructure
-- Created: 2025-09-24
-- Version: 1.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- SECTION 1: MODULE SYSTEM UNIFICATION
-- =====================================================================

-- Extend client_app_overrides with marketplace integration
ALTER TABLE client_app_overrides
    ADD COLUMN IF NOT EXISTS marketplace_module_id UUID,
    ADD COLUMN IF NOT EXISTS installation_id UUID,
    ADD COLUMN IF NOT EXISTS activation_status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS activation_metadata JSONB DEFAULT '{}';

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_cao_marketplace_module'
    ) THEN
        ALTER TABLE client_app_overrides
            ADD CONSTRAINT fk_cao_marketplace_module
            FOREIGN KEY (marketplace_module_id) REFERENCES marketplace_modules(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_cao_installation'
    ) THEN
        ALTER TABLE client_app_overrides
            ADD CONSTRAINT fk_cao_installation
            FOREIGN KEY (installation_id) REFERENCES module_installations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for module integration
CREATE INDEX IF NOT EXISTS idx_cao_marketplace_module ON client_app_overrides(marketplace_module_id);
CREATE INDEX IF NOT EXISTS idx_cao_installation ON client_app_overrides(installation_id);
CREATE INDEX IF NOT EXISTS idx_cao_activation_status ON client_app_overrides(activation_status);

-- =====================================================================
-- SECTION 2: ORCHESTRATION SYSTEM
-- =====================================================================

-- Orchestration Workflows Table
CREATE TABLE IF NOT EXISTS orchestration_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name VARCHAR(255) NOT NULL,
    workflow_type VARCHAR(100) NOT NULL,
    client_id UUID REFERENCES clients_enhanced(id) ON DELETE CASCADE,

    -- Workflow Definition
    workflow_definition JSONB NOT NULL,
    current_step VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',

    -- Progress Tracking
    steps_completed JSONB DEFAULT '[]',
    steps_failed JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT check_workflow_status CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    CONSTRAINT check_workflow_type CHECK (workflow_type IN ('client_onboarding', 'module_activation', 'deployment', 'handover', 'custom'))
);

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES orchestration_workflows(id) ON DELETE CASCADE,

    -- Step Information
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(100) NOT NULL,
    execution_order INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',

    -- Execution Data
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_data JSONB DEFAULT '{}',
    execution_time_ms INTEGER,

    -- Retry Logic
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT check_execution_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    CONSTRAINT check_retry_count CHECK (retry_count >= 0 AND retry_count <= max_retries)
);

-- Create orchestration indexes
CREATE INDEX IF NOT EXISTS idx_orchestration_workflows_client ON orchestration_workflows(client_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_workflows_status ON orchestration_workflows(status);
CREATE INDEX IF NOT EXISTS idx_orchestration_workflows_type ON orchestration_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_orchestration_workflows_created ON orchestration_workflows(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_order ON workflow_executions(workflow_id, execution_order);

-- =====================================================================
-- SECTION 3: HANDOVER AUTOMATION SYSTEM
-- =====================================================================

-- Handover Packages Table
CREATE TABLE IF NOT EXISTS handover_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients_enhanced(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES orchestration_workflows(id) ON DELETE SET NULL,

    -- Package Information
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(100) DEFAULT 'complete',

    -- Module References
    installed_modules JSONB DEFAULT '[]',
    module_configurations JSONB DEFAULT '{}',

    -- Configuration References
    system_configs UUID[] DEFAULT '{}',
    deployment_configs UUID[] DEFAULT '{}',

    -- Documentation
    sop_documents JSONB DEFAULT '[]',
    tutorial_videos JSONB DEFAULT '[]',
    admin_credentials JSONB DEFAULT '{}',
    walkthrough_content JSONB DEFAULT '{}',

    -- Delivery
    delivery_status VARCHAR(50) DEFAULT 'pending',
    delivery_method VARCHAR(100),
    delivered_at TIMESTAMPTZ,
    delivery_confirmation JSONB DEFAULT '{}',
    delivery_recipient VARCHAR(255),

    -- Package Metadata
    package_metadata JSONB DEFAULT '{}',
    package_size_mb DECIMAL(10,2),
    checksum VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_delivery_status CHECK (delivery_status IN ('pending', 'preparing', 'ready', 'delivering', 'delivered', 'failed')),
    CONSTRAINT check_package_type CHECK (package_type IN ('complete', 'incremental', 'update', 'rollback'))
);

-- Create handover indexes
CREATE INDEX IF NOT EXISTS idx_handover_packages_client ON handover_packages(client_id);
CREATE INDEX IF NOT EXISTS idx_handover_packages_workflow ON handover_packages(workflow_id);
CREATE INDEX IF NOT EXISTS idx_handover_packages_status ON handover_packages(delivery_status);
CREATE INDEX IF NOT EXISTS idx_handover_packages_created ON handover_packages(created_at DESC);

-- =====================================================================
-- SECTION 4: INTEGRATION EVENT SYSTEM
-- =====================================================================

-- Integration Events Table
CREATE TABLE IF NOT EXISTS integration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(100) NOT NULL,
    event_target VARCHAR(100),

    -- Event Data
    event_payload JSONB NOT NULL,
    event_metadata JSONB DEFAULT '{}',

    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(50) DEFAULT 'pending',
    processing_error TEXT,
    processed_at TIMESTAMPTZ,
    processed_by VARCHAR(255),

    -- Event Correlation
    correlation_id UUID,
    causation_id UUID,
    aggregate_id UUID,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_event_source CHECK (event_source IN ('orchestration', 'marketplace', 'modules', 'handover', 'configuration', 'system')),
    CONSTRAINT check_processing_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'retrying'))
);

-- Create integration events indexes
CREATE INDEX IF NOT EXISTS idx_integration_events_type ON integration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_integration_events_source ON integration_events(event_source);
CREATE INDEX IF NOT EXISTS idx_integration_events_processed ON integration_events(processed);
CREATE INDEX IF NOT EXISTS idx_integration_events_correlation ON integration_events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_causation ON integration_events(causation_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_aggregate ON integration_events(aggregate_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_created ON integration_events(created_at DESC);

-- =====================================================================
-- SECTION 5: CROSS-SYSTEM VIEWS
-- =====================================================================

-- Unified Client Dashboard View
CREATE OR REPLACE VIEW unified_client_dashboard AS
SELECT
    c.id as client_id,
    c.name as client_name,
    c.company_name,
    c.status as client_status,
    c.industry,

    -- Module Information
    COUNT(DISTINCT mi.id) FILTER (WHERE mi.status = 'active') as active_modules,
    COUNT(DISTINCT cao.id) as configured_apps,
    COUNT(DISTINCT mm.id) as marketplace_modules_available,

    -- Orchestration Status
    ow.id as current_workflow_id,
    ow.workflow_name as current_workflow,
    ow.status as workflow_status,
    ow.current_step,
    COALESCE(jsonb_array_length(ow.steps_completed), 0) as steps_completed_count,

    -- Handover Status
    hp.id as handover_package_id,
    hp.package_name as handover_package,
    hp.delivery_status,
    hp.delivered_at,

    -- Configuration Summary
    COUNT(DISTINCT sc.id) as system_configurations,
    COUNT(DISTINCT dc.id) as deployment_configurations,

    -- Billing
    cb.subscription_tier,
    cb.subscription_status,
    cb.next_invoice_date,
    cb.account_balance,

    -- Timestamps
    c.created_at,
    c.updated_at,
    ow.started_at as workflow_started_at,
    ow.completed_at as workflow_completed_at
FROM clients_enhanced c
LEFT JOIN module_installations mi ON c.id = mi.tenant_id
LEFT JOIN client_app_overrides cao ON c.id = cao.client_id
LEFT JOIN marketplace_modules mm ON cao.marketplace_module_id = mm.id
LEFT JOIN orchestration_workflows ow ON c.id = ow.client_id
    AND ow.status IN ('in_progress', 'pending')
    AND ow.id = (
        SELECT id FROM orchestration_workflows
        WHERE client_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
    )
LEFT JOIN handover_packages hp ON c.id = hp.client_id
    AND hp.delivery_status != 'delivered'
    AND hp.id = (
        SELECT id FROM handover_packages
        WHERE client_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
    )
LEFT JOIN system_configurations sc ON c.id = sc.client_id
LEFT JOIN deployment_configurations dc ON c.id = dc.client_id
LEFT JOIN client_billing_info cb ON c.id = cb.client_id
GROUP BY
    c.id, c.name, c.company_name, c.status, c.industry,
    ow.id, ow.workflow_name, ow.status, ow.current_step, ow.steps_completed,
    hp.id, hp.package_name, hp.delivery_status, hp.delivered_at,
    cb.subscription_tier, cb.subscription_status, cb.next_invoice_date, cb.account_balance,
    c.created_at, c.updated_at, ow.started_at, ow.completed_at;

-- Module Integration View
CREATE OR REPLACE VIEW module_integration_view AS
SELECT
    mm.id as module_id,
    mm.name as module_name,
    mm.display_name,
    mm.version,
    mm.category,
    mm.status as module_status,

    -- Installation Data
    mi.id as installation_id,
    mi.tenant_id as client_id,
    mi.status as installation_status,
    mi.installed_at,
    mi.license_key,

    -- Override Configuration
    cao.id as override_id,
    cao.enabled,
    cao.override_settings,
    cao.activation_status,
    cao.activation_metadata,

    -- Marketplace Data
    mm.rating_average,
    mm.rating_count,
    mm.install_count,
    mm.pricing_model,
    mm.price_amount,
    mm.price_currency,

    -- License Data
    ml.id as license_id,
    ml.license_type,
    ml.status as license_status,
    ml.expires_at,
    ml.features as license_features,

    -- Client Info
    c.name as client_name,
    c.company_name,

    -- Timestamps
    mm.created_at as module_created_at,
    mm.updated_at as module_updated_at
FROM marketplace_modules mm
LEFT JOIN module_installations mi ON mm.id = mi.module_id
LEFT JOIN client_app_overrides cao ON mi.id = cao.installation_id
LEFT JOIN module_licenses ml ON mm.id = ml.module_id AND mi.tenant_id = ml.tenant_id
LEFT JOIN clients_enhanced c ON mi.tenant_id = c.id;

-- Workflow Progress View
CREATE OR REPLACE VIEW workflow_progress_view AS
SELECT
    ow.id as workflow_id,
    ow.workflow_name,
    ow.workflow_type,
    ow.client_id,
    c.name as client_name,
    ow.status as workflow_status,
    ow.current_step,

    -- Execution Stats
    COUNT(we.id) as total_steps,
    COUNT(we.id) FILTER (WHERE we.status = 'completed') as completed_steps,
    COUNT(we.id) FILTER (WHERE we.status = 'failed') as failed_steps,
    COUNT(we.id) FILTER (WHERE we.status = 'pending') as pending_steps,

    -- Progress Percentage
    CASE
        WHEN COUNT(we.id) > 0 THEN
            ROUND((COUNT(we.id) FILTER (WHERE we.status = 'completed')::DECIMAL / COUNT(we.id)) * 100, 2)
        ELSE 0
    END as progress_percentage,

    -- Timing
    ow.started_at,
    ow.completed_at,
    EXTRACT(EPOCH FROM (COALESCE(ow.completed_at, NOW()) - ow.started_at)) as duration_seconds,

    -- Latest Step
    (SELECT step_name FROM workflow_executions
     WHERE workflow_id = ow.id
     ORDER BY execution_order DESC
     LIMIT 1) as latest_step,

    -- Timestamps
    ow.created_at,
    ow.updated_at
FROM orchestration_workflows ow
LEFT JOIN workflow_executions we ON ow.id = we.workflow_id
LEFT JOIN clients_enhanced c ON ow.client_id = c.id
GROUP BY ow.id, ow.workflow_name, ow.workflow_type, ow.client_id, c.name,
         ow.status, ow.current_step, ow.started_at, ow.completed_at,
         ow.created_at, ow.updated_at;

-- Handover Package Details View
CREATE OR REPLACE VIEW handover_package_details AS
SELECT
    hp.id as package_id,
    hp.package_name,
    hp.package_type,
    hp.client_id,
    c.name as client_name,
    c.company_name,

    -- Workflow Association
    hp.workflow_id,
    ow.workflow_name,
    ow.status as workflow_status,

    -- Module Information
    jsonb_array_length(hp.installed_modules) as module_count,
    array_length(hp.system_configs, 1) as system_config_count,
    array_length(hp.deployment_configs, 1) as deployment_config_count,

    -- Documentation
    jsonb_array_length(hp.sop_documents) as sop_document_count,
    jsonb_array_length(hp.tutorial_videos) as tutorial_video_count,

    -- Delivery Information
    hp.delivery_status,
    hp.delivery_method,
    hp.delivery_recipient,
    hp.delivered_at,
    hp.package_size_mb,

    -- Timestamps
    hp.created_at,
    hp.updated_at,
    EXTRACT(EPOCH FROM (COALESCE(hp.delivered_at, NOW()) - hp.created_at)) as preparation_time_seconds
FROM handover_packages hp
LEFT JOIN clients_enhanced c ON hp.client_id = c.id
LEFT JOIN orchestration_workflows ow ON hp.workflow_id = ow.id;

-- =====================================================================
-- SECTION 6: TRIGGERS AND FUNCTIONS
-- =====================================================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DROP TRIGGER IF EXISTS update_orchestration_workflows_updated_at ON orchestration_workflows;
CREATE TRIGGER update_orchestration_workflows_updated_at
    BEFORE UPDATE ON orchestration_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_handover_packages_updated_at ON handover_packages;
CREATE TRIGGER update_handover_packages_updated_at
    BEFORE UPDATE ON handover_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create integration event on workflow status change
CREATE OR REPLACE FUNCTION create_workflow_status_event()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO integration_events (
            event_type,
            event_source,
            event_payload,
            correlation_id,
            aggregate_id
        ) VALUES (
            'workflow_status_changed',
            'orchestration',
            jsonb_build_object(
                'workflow_id', NEW.id,
                'workflow_name', NEW.workflow_name,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'client_id', NEW.client_id,
                'timestamp', NOW()
            ),
            NEW.id,
            NEW.client_id
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS workflow_status_change_event ON orchestration_workflows;
CREATE TRIGGER workflow_status_change_event
    AFTER UPDATE ON orchestration_workflows
    FOR EACH ROW EXECUTE FUNCTION create_workflow_status_event();

-- =====================================================================
-- SECTION 7: ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS on integration tables
ALTER TABLE orchestration_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orchestration_workflows
DROP POLICY IF EXISTS orchestration_client_isolation ON orchestration_workflows;
CREATE POLICY orchestration_client_isolation ON orchestration_workflows
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients_enhanced WHERE
            auth.uid() = created_by OR
            auth.uid() = assigned_manager OR
            EXISTS (
                SELECT 1 FROM auth.users
                WHERE id = auth.uid()
                AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
            )
        )
    );

-- RLS Policies for workflow_executions
DROP POLICY IF EXISTS workflow_executions_access ON workflow_executions;
CREATE POLICY workflow_executions_access ON workflow_executions
    FOR ALL USING (
        workflow_id IN (
            SELECT id FROM orchestration_workflows WHERE
            client_id IN (
                SELECT id FROM clients_enhanced WHERE
                auth.uid() = created_by OR
                auth.uid() = assigned_manager OR
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE id = auth.uid()
                    AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
                )
            )
        )
    );

-- RLS Policies for handover_packages
DROP POLICY IF EXISTS handover_client_isolation ON handover_packages;
CREATE POLICY handover_client_isolation ON handover_packages
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients_enhanced WHERE
            auth.uid() = created_by OR
            auth.uid() = assigned_manager OR
            EXISTS (
                SELECT 1 FROM auth.users
                WHERE id = auth.uid()
                AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
            )
        )
    );

-- RLS Policies for integration_events
DROP POLICY IF EXISTS integration_events_admin_only ON integration_events;
CREATE POLICY integration_events_admin_only ON integration_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- =====================================================================
-- SECTION 8: GRANTS AND PERMISSIONS
-- =====================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON orchestration_workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_executions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON handover_packages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_events TO authenticated;

-- Grant view access
GRANT SELECT ON unified_client_dashboard TO authenticated;
GRANT SELECT ON module_integration_view TO authenticated;
GRANT SELECT ON workflow_progress_view TO authenticated;
GRANT SELECT ON handover_package_details TO authenticated;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================================
-- SECTION 9: INITIAL DATA POPULATION
-- =====================================================================

-- Insert sample workflow types for reference
INSERT INTO orchestration_workflows (
    workflow_name,
    workflow_type,
    client_id,
    workflow_definition,
    status
) VALUES
    ('Sample Client Onboarding', 'client_onboarding', NULL, '{"steps": []}', 'pending'),
    ('Sample Module Activation', 'module_activation', NULL, '{"steps": []}', 'pending'),
    ('Sample Deployment', 'deployment', NULL, '{"steps": []}', 'pending'),
    ('Sample Handover', 'handover', NULL, '{"steps": []}', 'pending')
ON CONFLICT DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE orchestration_workflows IS 'Central orchestration system managing all workflow executions across the platform';
COMMENT ON TABLE workflow_executions IS 'Individual step executions within orchestration workflows with retry logic';
COMMENT ON TABLE handover_packages IS 'Complete client handover packages including modules, configs, and documentation';
COMMENT ON TABLE integration_events IS 'Event sourcing table for cross-system integration and auditing';

COMMENT ON VIEW unified_client_dashboard IS 'Comprehensive client dashboard view aggregating data from all integrated systems';
COMMENT ON VIEW module_integration_view IS 'Unified view of module installations, configurations, and marketplace data';
COMMENT ON VIEW workflow_progress_view IS 'Real-time workflow progress tracking with completion percentages';
COMMENT ON VIEW handover_package_details IS 'Detailed handover package information with delivery tracking';

-- =====================================================================
-- END OF UNIFIED SCHEMA
-- =====================================================================