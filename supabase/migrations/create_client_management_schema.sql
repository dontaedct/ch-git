-- Client Management Schema for HT-033.3.1
-- Enhanced database schema for client data, customizations, and deployment tracking

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table enhancement
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients_enhanced') THEN
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
    END IF;
END $$;

-- Client Customizations table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_customizations') THEN
        CREATE TABLE client_customizations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL,

            -- Template Information
            template_id VARCHAR(100) NOT NULL,
            template_version VARCHAR(50) DEFAULT 'latest',

            -- Customization Data
            customization_config JSONB NOT NULL DEFAULT '{}',
            branding_config JSONB DEFAULT '{}',
            feature_config JSONB DEFAULT '{}',
            integration_config JSONB DEFAULT '{}',

            -- AI Generated Customizations
            ai_generated_customizations JSONB DEFAULT '{}',
            ai_customization_prompts TEXT[],
            ai_customization_metadata JSONB DEFAULT '{}',

            -- Visual Customizations
            theme_config JSONB DEFAULT '{}',
            layout_config JSONB DEFAULT '{}',
            component_overrides JSONB DEFAULT '{}',
            css_customizations TEXT,

            -- Content Customizations
            content_overrides JSONB DEFAULT '{}',
            copy_customizations JSONB DEFAULT '{}',
            image_assets JSONB DEFAULT '{}',

            -- Status and Versioning
            status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'in_review', 'approved', 'deployed'
            version INTEGER DEFAULT 1,
            is_active BOOLEAN DEFAULT false,

            -- Metadata
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            created_by UUID,
            approved_by UUID,
            approved_at TIMESTAMPTZ,

            CONSTRAINT fk_client_customizations_client FOREIGN KEY (client_id) REFERENCES clients_enhanced(id) ON DELETE CASCADE,
            CONSTRAINT fk_customizations_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id),
            CONSTRAINT fk_customizations_approved_by FOREIGN KEY (approved_by) REFERENCES auth.users(id)
        );

        -- Create indexes
        CREATE INDEX idx_client_customizations_client_id ON client_customizations(client_id);
        CREATE INDEX idx_client_customizations_template_id ON client_customizations(template_id);
        CREATE INDEX idx_client_customizations_status ON client_customizations(status);
        CREATE INDEX idx_client_customizations_active ON client_customizations(is_active);
    END IF;
END $$;

-- Client Deployments table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_deployments') THEN
        CREATE TABLE client_deployments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL,
            customization_id UUID NOT NULL,

            -- Deployment Information
            deployment_name VARCHAR(255) NOT NULL,
            deployment_type VARCHAR(50) DEFAULT 'production', -- 'development', 'staging', 'production'
            deployment_url VARCHAR(500),
            custom_domain VARCHAR(255),

            -- Infrastructure Details
            hosting_provider VARCHAR(100) DEFAULT 'vercel',
            region VARCHAR(100),
            environment_config JSONB DEFAULT '{}',

            -- Build Information
            build_id VARCHAR(255),
            commit_hash VARCHAR(255),
            build_artifacts JSONB DEFAULT '{}',
            build_logs TEXT,

            -- Status and Health
            status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'building', 'deploying', 'deployed', 'failed', 'maintenance'
            health_status VARCHAR(50) DEFAULT 'unknown', -- 'healthy', 'warning', 'critical', 'unknown'
            last_health_check TIMESTAMPTZ,

            -- Performance Metrics
            performance_metrics JSONB DEFAULT '{}',
            uptime_percentage DECIMAL(5,2),
            response_time_avg DECIMAL(8,2),

            -- Configuration
            feature_flags JSONB DEFAULT '{}',
            environment_variables JSONB DEFAULT '{}',
            ssl_enabled BOOLEAN DEFAULT true,
            cdn_enabled BOOLEAN DEFAULT true,

            -- Metadata
            deployed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deployed_by UUID,

            CONSTRAINT fk_client_deployments_client FOREIGN KEY (client_id) REFERENCES clients_enhanced(id) ON DELETE CASCADE,
            CONSTRAINT fk_client_deployments_customization FOREIGN KEY (customization_id) REFERENCES client_customizations(id) ON DELETE CASCADE,
            CONSTRAINT fk_deployments_deployed_by FOREIGN KEY (deployed_by) REFERENCES auth.users(id)
        );

        -- Create indexes
        CREATE INDEX idx_client_deployments_client_id ON client_deployments(client_id);
        CREATE INDEX idx_client_deployments_customization_id ON client_deployments(customization_id);
        CREATE INDEX idx_client_deployments_status ON client_deployments(status);
        CREATE INDEX idx_client_deployments_health ON client_deployments(health_status);
        CREATE INDEX idx_client_deployments_deployed_at ON client_deployments(deployed_at);
    END IF;
END $$;

-- Deployment Tracking Events table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'deployment_tracking_events') THEN
        CREATE TABLE deployment_tracking_events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            deployment_id UUID NOT NULL,

            -- Event Information
            event_type VARCHAR(100) NOT NULL, -- 'build_started', 'build_completed', 'deploy_started', 'deploy_completed', 'health_check', 'error', 'rollback'
            event_status VARCHAR(50) NOT NULL, -- 'success', 'failure', 'warning', 'info'
            event_message TEXT,
            event_details JSONB DEFAULT '{}',

            -- Timing
            event_timestamp TIMESTAMPTZ DEFAULT NOW(),
            duration_ms INTEGER,

            -- Context
            triggered_by VARCHAR(100), -- 'user', 'system', 'webhook', 'schedule'
            triggered_by_user UUID,

            -- Metadata
            metadata JSONB DEFAULT '{}',

            CONSTRAINT fk_deployment_events_deployment FOREIGN KEY (deployment_id) REFERENCES client_deployments(id) ON DELETE CASCADE,
            CONSTRAINT fk_deployment_events_user FOREIGN KEY (triggered_by_user) REFERENCES auth.users(id)
        );

        -- Create indexes
        CREATE INDEX idx_deployment_events_deployment_id ON deployment_tracking_events(deployment_id);
        CREATE INDEX idx_deployment_events_type ON deployment_tracking_events(event_type);
        CREATE INDEX idx_deployment_events_timestamp ON deployment_tracking_events(event_timestamp);
    END IF;
END $$;

-- Client Analytics table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_analytics') THEN
        CREATE TABLE client_analytics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL,
            deployment_id UUID,

            -- Analytics Period
            analytics_date DATE NOT NULL,
            analytics_period VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'monthly'

            -- Traffic Metrics
            page_views INTEGER DEFAULT 0,
            unique_visitors INTEGER DEFAULT 0,
            sessions INTEGER DEFAULT 0,
            bounce_rate DECIMAL(5,2),
            avg_session_duration DECIMAL(8,2),

            -- Performance Metrics
            avg_load_time DECIMAL(8,2),
            core_web_vitals JSONB DEFAULT '{}',
            error_rate DECIMAL(5,2),

            -- Business Metrics
            conversions INTEGER DEFAULT 0,
            conversion_rate DECIMAL(5,2),
            revenue DECIMAL(15,2) DEFAULT 0,

            -- Engagement Metrics
            engagement_metrics JSONB DEFAULT '{}',
            user_behavior JSONB DEFAULT '{}',

            -- Metadata
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),

            CONSTRAINT fk_client_analytics_client FOREIGN KEY (client_id) REFERENCES clients_enhanced(id) ON DELETE CASCADE,
            CONSTRAINT fk_client_analytics_deployment FOREIGN KEY (deployment_id) REFERENCES client_deployments(id) ON DELETE SET NULL,
            CONSTRAINT unique_client_analytics UNIQUE (client_id, deployment_id, analytics_date, analytics_period)
        );

        -- Create indexes
        CREATE INDEX idx_client_analytics_client_id ON client_analytics(client_id);
        CREATE INDEX idx_client_analytics_deployment_id ON client_analytics(deployment_id);
        CREATE INDEX idx_client_analytics_date ON client_analytics(analytics_date);
        CREATE INDEX idx_client_analytics_period ON client_analytics(analytics_period);
    END IF;
END $$;

-- Row Level Security (RLS) Policies
ALTER TABLE clients_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients_enhanced
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'clients_enhanced' AND policyname = 'clients_enhanced_select_policy') THEN
        CREATE POLICY clients_enhanced_select_policy ON clients_enhanced
            FOR SELECT USING (
                auth.role() = 'authenticated' AND
                (auth.uid() = created_by OR auth.uid() = assigned_manager OR
                 EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')))
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'clients_enhanced' AND policyname = 'clients_enhanced_insert_policy') THEN
        CREATE POLICY clients_enhanced_insert_policy ON clients_enhanced
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' AND
                (auth.uid() = created_by OR
                 EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')))
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'clients_enhanced' AND policyname = 'clients_enhanced_update_policy') THEN
        CREATE POLICY clients_enhanced_update_policy ON clients_enhanced
            FOR UPDATE USING (
                auth.role() = 'authenticated' AND
                (auth.uid() = created_by OR auth.uid() = assigned_manager OR
                 EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')))
            );
    END IF;
END $$;

-- Similar RLS policies for other tables (abbreviated for brevity)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'client_customizations' AND policyname = 'client_customizations_select_policy') THEN
        CREATE POLICY client_customizations_select_policy ON client_customizations
            FOR SELECT USING (
                auth.role() = 'authenticated' AND
                EXISTS (SELECT 1 FROM clients_enhanced WHERE id = client_id AND
                        (auth.uid() = created_by OR auth.uid() = assigned_manager OR
                         EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin'))))
            );
    END IF;
END $$;

-- Update triggers for updated_at fields
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
END $$;

-- Create triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_clients_enhanced_updated_at') THEN
        CREATE TRIGGER update_clients_enhanced_updated_at
            BEFORE UPDATE ON clients_enhanced
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_client_customizations_updated_at') THEN
        CREATE TRIGGER update_client_customizations_updated_at
            BEFORE UPDATE ON client_customizations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_client_deployments_updated_at') THEN
        CREATE TRIGGER update_client_deployments_updated_at
            BEFORE UPDATE ON client_deployments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Views for simplified access
CREATE OR REPLACE VIEW client_summary AS
SELECT
    c.id,
    c.name,
    c.email,
    c.company_name,
    c.status,
    c.tier,
    COUNT(DISTINCT cu.id) as customizations_count,
    COUNT(DISTINCT d.id) as deployments_count,
    COUNT(DISTINCT CASE WHEN d.status = 'deployed' THEN d.id END) as active_deployments,
    c.created_at,
    c.last_contact_date,
    c.assigned_manager
FROM clients_enhanced c
LEFT JOIN client_customizations cu ON c.id = cu.client_id
LEFT JOIN client_deployments d ON c.id = d.client_id
GROUP BY c.id, c.name, c.email, c.company_name, c.status, c.tier, c.created_at, c.last_contact_date, c.assigned_manager;

CREATE OR REPLACE VIEW deployment_status_summary AS
SELECT
    d.id,
    d.client_id,
    c.name as client_name,
    d.deployment_name,
    d.deployment_type,
    d.status,
    d.health_status,
    d.deployment_url,
    d.deployed_at,
    d.last_health_check,
    d.performance_metrics->>'avg_response_time' as avg_response_time,
    d.uptime_percentage
FROM client_deployments d
JOIN clients_enhanced c ON d.client_id = c.id;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON clients_enhanced TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_customizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_deployments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON deployment_tracking_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_analytics TO authenticated;
GRANT SELECT ON client_summary TO authenticated;
GRANT SELECT ON deployment_status_summary TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;