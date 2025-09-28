-- HT-034.5.1: Missing Database Tables Design & Creation Strategy
-- Created: 2025-09-22
-- Purpose: Create missing database tables required by HT-033 admin components

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- System Configurations Table
-- Stores global and client-specific configuration settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_configurations') THEN
        CREATE TABLE system_configurations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

            -- Configuration Identification
            configuration_key VARCHAR(255) NOT NULL UNIQUE,
            configuration_category VARCHAR(100) NOT NULL, -- 'global', 'client', 'template', 'deployment'

            -- Configuration Data
            configuration_value JSONB NOT NULL DEFAULT '{}',
            configuration_schema JSONB DEFAULT '{}', -- JSON schema for validation

            -- Metadata
            description TEXT,
            is_encrypted BOOLEAN DEFAULT false,
            is_system BOOLEAN DEFAULT false, -- System configurations cannot be deleted

            -- Scope and Access
            client_id UUID, -- NULL for global configurations
            template_id VARCHAR(255), -- NULL for non-template configurations
            environment VARCHAR(50) DEFAULT 'all', -- 'development', 'staging', 'production', 'all'

            -- Versioning
            version INTEGER DEFAULT 1,
            is_active BOOLEAN DEFAULT true,

            -- Audit Trail
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            created_by UUID,
            updated_by UUID,

            CONSTRAINT fk_configurations_client FOREIGN KEY (client_id) REFERENCES clients_enhanced(id) ON DELETE CASCADE,
            CONSTRAINT fk_configurations_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id),
            CONSTRAINT fk_configurations_updated_by FOREIGN KEY (updated_by) REFERENCES auth.users(id)
        );

        -- Create indexes for performance
        CREATE INDEX idx_system_configurations_key ON system_configurations(configuration_key);
        CREATE INDEX idx_system_configurations_category ON system_configurations(configuration_category);
        CREATE INDEX idx_system_configurations_client_id ON system_configurations(client_id);
        CREATE INDEX idx_system_configurations_template_id ON system_configurations(template_id);
        CREATE INDEX idx_system_configurations_environment ON system_configurations(environment);
        CREATE INDEX idx_system_configurations_active ON system_configurations(is_active);
    END IF;
END $$;

-- Template Configurations Table
-- Stores template-specific configuration options and settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'template_configurations') THEN
        CREATE TABLE template_configurations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

            -- Template Information
            template_id VARCHAR(255) NOT NULL,
            template_name VARCHAR(255) NOT NULL,
            template_version VARCHAR(50) DEFAULT 'latest',

            -- Configuration Structure
            configuration_schema JSONB NOT NULL DEFAULT '{}',
            default_configuration JSONB NOT NULL DEFAULT '{}',
            required_fields TEXT[] DEFAULT '{}',
            optional_fields TEXT[] DEFAULT '{}',

            -- Validation Rules
            validation_rules JSONB DEFAULT '{}',
            validation_enabled BOOLEAN DEFAULT true,

            -- Template Metadata
            category VARCHAR(100),
            tags TEXT[] DEFAULT '{}',
            industry_specific BOOLEAN DEFAULT false,
            supported_industries TEXT[] DEFAULT '{}',

            -- Usage and Performance
            usage_count INTEGER DEFAULT 0,
            last_used_at TIMESTAMPTZ,
            performance_score DECIMAL(3,2) DEFAULT 0.0,

            -- Status and Lifecycle
            status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'deprecated', 'archived'
            is_featured BOOLEAN DEFAULT false,

            -- Audit Trail
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            created_by UUID,

            CONSTRAINT fk_template_configurations_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id)
        );

        -- Create indexes
        CREATE INDEX idx_template_configurations_template_id ON template_configurations(template_id);
        CREATE INDEX idx_template_configurations_status ON template_configurations(status);
        CREATE INDEX idx_template_configurations_category ON template_configurations(category);
        CREATE INDEX idx_template_configurations_featured ON template_configurations(is_featured);
        CREATE INDEX idx_template_configurations_industry ON template_configurations(industry_specific);
    END IF;
END $$;

-- Deployment Configurations Table
-- Stores deployment-specific settings and environment configurations
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'deployment_configurations') THEN
        CREATE TABLE deployment_configurations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

            -- Deployment Reference
            deployment_id UUID,
            client_id UUID NOT NULL,

            -- Environment Settings
            environment VARCHAR(50) NOT NULL, -- 'development', 'staging', 'production'
            deployment_name VARCHAR(255) NOT NULL,

            -- Infrastructure Configuration
            hosting_provider VARCHAR(100) DEFAULT 'vercel',
            region VARCHAR(100) DEFAULT 'us-east-1',
            instance_type VARCHAR(100),
            scaling_config JSONB DEFAULT '{}',

            -- Application Configuration
            environment_variables JSONB DEFAULT '{}',
            feature_flags JSONB DEFAULT '{}',
            application_config JSONB DEFAULT '{}',

            -- Security Configuration
            ssl_config JSONB DEFAULT '{}',
            cors_config JSONB DEFAULT '{}',
            security_headers JSONB DEFAULT '{}',

            -- Performance Configuration
            caching_config JSONB DEFAULT '{}',
            cdn_config JSONB DEFAULT '{}',
            monitoring_config JSONB DEFAULT '{}',

            -- Custom Domain Configuration
            custom_domain VARCHAR(255),
            subdomain VARCHAR(255),
            domain_verification JSONB DEFAULT '{}',

            -- Backup and Recovery
            backup_config JSONB DEFAULT '{}',
            recovery_config JSONB DEFAULT '{}',

            -- Status and Validation
            status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'validated', 'applied', 'failed'
            validation_results JSONB DEFAULT '{}',

            -- Audit Trail
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            applied_at TIMESTAMPTZ,
            created_by UUID,
            applied_by UUID,

            CONSTRAINT fk_deployment_configurations_client FOREIGN KEY (client_id) REFERENCES clients_enhanced(id) ON DELETE CASCADE,
            CONSTRAINT fk_deployment_configurations_deployment FOREIGN KEY (deployment_id) REFERENCES client_deployments(id) ON DELETE CASCADE,
            CONSTRAINT fk_deployment_configurations_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id),
            CONSTRAINT fk_deployment_configurations_applied_by FOREIGN KEY (applied_by) REFERENCES auth.users(id)
        );

        -- Create indexes
        CREATE INDEX idx_deployment_configurations_deployment_id ON deployment_configurations(deployment_id);
        CREATE INDEX idx_deployment_configurations_client_id ON deployment_configurations(client_id);
        CREATE INDEX idx_deployment_configurations_environment ON deployment_configurations(environment);
        CREATE INDEX idx_deployment_configurations_status ON deployment_configurations(status);
        CREATE INDEX idx_deployment_configurations_provider ON deployment_configurations(hosting_provider);
    END IF;
END $$;

-- Client Billing Information Table
-- Stores billing details and subscription information for clients
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_billing_info') THEN
        CREATE TABLE client_billing_info (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL UNIQUE,

            -- Subscription Information
            subscription_tier VARCHAR(50) DEFAULT 'basic', -- 'basic', 'standard', 'premium', 'enterprise'
            subscription_status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'cancelled', 'trial'
            subscription_start_date TIMESTAMPTZ,
            subscription_end_date TIMESTAMPTZ,
            trial_end_date TIMESTAMPTZ,

            -- Billing Details
            billing_email VARCHAR(255),
            billing_frequency VARCHAR(50) DEFAULT 'monthly', -- 'monthly', 'yearly', 'one-time'
            currency VARCHAR(3) DEFAULT 'USD',

            -- Payment Information (encrypted)
            payment_method_id VARCHAR(255), -- Stripe payment method ID
            payment_provider VARCHAR(100) DEFAULT 'stripe',
            payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'valid', 'failed', 'expired'

            -- Billing Address
            billing_address JSONB DEFAULT '{}',
            tax_id VARCHAR(255),
            vat_number VARCHAR(255),

            -- Usage and Limits
            usage_limits JSONB DEFAULT '{}',
            current_usage JSONB DEFAULT '{}',
            overage_charges DECIMAL(10,2) DEFAULT 0.00,

            -- Invoice Information
            last_invoice_date TIMESTAMPTZ,
            next_invoice_date TIMESTAMPTZ,
            invoice_amount DECIMAL(10,2) DEFAULT 0.00,

            -- Credit and Balance
            account_balance DECIMAL(10,2) DEFAULT 0.00,
            credit_balance DECIMAL(10,2) DEFAULT 0.00,

            -- Dunning and Collections
            payment_retry_count INTEGER DEFAULT 0,
            last_payment_attempt TIMESTAMPTZ,
            dunning_status VARCHAR(50) DEFAULT 'none', -- 'none', 'soft', 'hard', 'final'

            -- Audit Trail
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            created_by UUID,

            CONSTRAINT fk_client_billing_client FOREIGN KEY (client_id) REFERENCES clients_enhanced(id) ON DELETE CASCADE,
            CONSTRAINT fk_client_billing_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id)
        );

        -- Create indexes
        CREATE INDEX idx_client_billing_client_id ON client_billing_info(client_id);
        CREATE INDEX idx_client_billing_subscription_status ON client_billing_info(subscription_status);
        CREATE INDEX idx_client_billing_tier ON client_billing_info(subscription_tier);
        CREATE INDEX idx_client_billing_payment_status ON client_billing_info(payment_status);
        CREATE INDEX idx_client_billing_next_invoice ON client_billing_info(next_invoice_date);
    END IF;
END $$;

-- Global Deployment Templates Table
-- Stores reusable deployment configuration templates
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'deployment_templates') THEN
        CREATE TABLE deployment_templates (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

            -- Template Information
            template_name VARCHAR(255) NOT NULL,
            template_type VARCHAR(100) NOT NULL, -- 'basic', 'standard', 'enterprise', 'custom'
            description TEXT,

            -- Configuration Template
            configuration_template JSONB NOT NULL DEFAULT '{}',
            required_variables TEXT[] DEFAULT '{}',
            optional_variables TEXT[] DEFAULT '{}',

            -- Environment Specifications
            supported_environments TEXT[] DEFAULT '{development,staging,production}',
            default_environment VARCHAR(50) DEFAULT 'production',

            -- Provider Specifications
            supported_providers TEXT[] DEFAULT '{vercel,netlify,aws,gcp}',
            default_provider VARCHAR(100) DEFAULT 'vercel',

            -- Template Metadata
            category VARCHAR(100),
            tags TEXT[] DEFAULT '{}',
            use_cases TEXT[] DEFAULT '{}',

            -- Usage Statistics
            usage_count INTEGER DEFAULT 0,
            success_rate DECIMAL(5,2) DEFAULT 0.0,
            last_used_at TIMESTAMPTZ,

            -- Status
            status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'deprecated'
            is_system_template BOOLEAN DEFAULT false,
            is_featured BOOLEAN DEFAULT false,

            -- Audit Trail
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            created_by UUID,

            CONSTRAINT fk_deployment_templates_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id)
        );

        -- Create indexes
        CREATE INDEX idx_deployment_templates_type ON deployment_templates(template_type);
        CREATE INDEX idx_deployment_templates_status ON deployment_templates(status);
        CREATE INDEX idx_deployment_templates_category ON deployment_templates(category);
        CREATE INDEX idx_deployment_templates_featured ON deployment_templates(is_featured);
    END IF;
END $$;

-- Row Level Security (RLS) Policies
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_billing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_configurations
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'system_configurations' AND policyname = 'system_configurations_select_policy') THEN
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
    END IF;
END $$;

-- RLS Policies for template_configurations
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'template_configurations' AND policyname = 'template_configurations_select_policy') THEN
        CREATE POLICY template_configurations_select_policy ON template_configurations
            FOR SELECT USING (
                auth.role() = 'authenticated' AND
                (status = 'active' OR
                 EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')))
            );
    END IF;
END $$;

-- RLS Policies for deployment_configurations
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'deployment_configurations' AND policyname = 'deployment_configurations_select_policy') THEN
        CREATE POLICY deployment_configurations_select_policy ON deployment_configurations
            FOR SELECT USING (
                auth.role() = 'authenticated' AND
                client_id IN (
                    SELECT id FROM clients_enhanced WHERE
                    auth.uid() = created_by OR auth.uid() = assigned_manager OR
                    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
                )
            );
    END IF;
END $$;

-- RLS Policies for client_billing_info
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'client_billing_info' AND policyname = 'client_billing_info_select_policy') THEN
        CREATE POLICY client_billing_info_select_policy ON client_billing_info
            FOR SELECT USING (
                auth.role() = 'authenticated' AND
                client_id IN (
                    SELECT id FROM clients_enhanced WHERE
                    auth.uid() = created_by OR auth.uid() = assigned_manager OR
                    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
                )
            );
    END IF;
END $$;

-- RLS Policies for deployment_templates
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'deployment_templates' AND policyname = 'deployment_templates_select_policy') THEN
        CREATE POLICY deployment_templates_select_policy ON deployment_templates
            FOR SELECT USING (
                auth.role() = 'authenticated' AND
                (status = 'active' OR
                 EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')))
            );
    END IF;
END $$;

-- Update triggers for updated_at fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_system_configurations_updated_at') THEN
        CREATE TRIGGER update_system_configurations_updated_at
            BEFORE UPDATE ON system_configurations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_template_configurations_updated_at') THEN
        CREATE TRIGGER update_template_configurations_updated_at
            BEFORE UPDATE ON template_configurations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_deployment_configurations_updated_at') THEN
        CREATE TRIGGER update_deployment_configurations_updated_at
            BEFORE UPDATE ON deployment_configurations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_client_billing_info_updated_at') THEN
        CREATE TRIGGER update_client_billing_info_updated_at
            BEFORE UPDATE ON client_billing_info
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_deployment_templates_updated_at') THEN
        CREATE TRIGGER update_deployment_templates_updated_at
            BEFORE UPDATE ON deployment_templates
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create helpful views for easier data access
CREATE OR REPLACE VIEW client_configuration_summary AS
SELECT
    c.id as client_id,
    c.name as client_name,
    c.company_name,
    COUNT(DISTINCT sc.id) as system_configurations_count,
    COUNT(DISTINCT dc.id) as deployment_configurations_count,
    cb.subscription_tier,
    cb.subscription_status,
    cb.next_invoice_date,
    c.status as client_status
FROM clients_enhanced c
LEFT JOIN system_configurations sc ON c.id = sc.client_id
LEFT JOIN deployment_configurations dc ON c.id = dc.client_id
LEFT JOIN client_billing_info cb ON c.id = cb.client_id
GROUP BY c.id, c.name, c.company_name, cb.subscription_tier, cb.subscription_status, cb.next_invoice_date, c.status;

CREATE OR REPLACE VIEW template_usage_summary AS
SELECT
    tc.template_id,
    tc.template_name,
    tc.category,
    tc.status,
    tc.usage_count,
    tc.performance_score,
    COUNT(DISTINCT cc.id) as active_customizations,
    COUNT(DISTINCT cd.id) as active_deployments,
    tc.last_used_at
FROM template_configurations tc
LEFT JOIN client_customizations cc ON tc.template_id = cc.template_id
LEFT JOIN client_deployments cd ON cc.id = cd.customization_id AND cd.status = 'deployed'
GROUP BY tc.id, tc.template_id, tc.template_name, tc.category, tc.status, tc.usage_count, tc.performance_score, tc.last_used_at;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON system_configurations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON template_configurations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON deployment_configurations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_billing_info TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON deployment_templates TO authenticated;
GRANT SELECT ON client_configuration_summary TO authenticated;
GRANT SELECT ON template_usage_summary TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert initial system configurations
INSERT INTO system_configurations (configuration_key, configuration_category, configuration_value, description, is_system, created_by)
VALUES
    ('default_deployment_provider', 'global', '{"provider": "vercel", "region": "us-east-1"}', 'Default deployment provider settings', true, '00000000-0000-0000-0000-000000000000'),
    ('default_template_settings', 'global', '{"theme": "modern", "responsive": true, "ssl": true}', 'Default template configuration settings', true, '00000000-0000-0000-0000-000000000000'),
    ('billing_settings', 'global', '{"currency": "USD", "trial_days": 14, "grace_period_days": 7}', 'Global billing configuration', true, '00000000-0000-0000-0000-000000000000');

-- Insert initial deployment templates
INSERT INTO deployment_templates (template_name, template_type, description, configuration_template, category, is_system_template, created_by)
VALUES
    ('Basic Vercel Deployment', 'basic', 'Basic deployment template for Vercel', '{"provider": "vercel", "environment": "production", "ssl": true, "region": "us-east-1"}', 'hosting', true, '00000000-0000-0000-0000-000000000000'),
    ('Enterprise AWS Deployment', 'enterprise', 'Enterprise-grade AWS deployment with auto-scaling', '{"provider": "aws", "environment": "production", "scaling": {"min": 2, "max": 10}, "monitoring": true}', 'hosting', true, '00000000-0000-0000-0000-000000000000'),
    ('Development Environment', 'basic', 'Development environment deployment template', '{"provider": "vercel", "environment": "development", "ssl": false, "region": "us-east-1"}', 'development', true, '00000000-0000-0000-0000-000000000000');