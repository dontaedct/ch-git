# Database Schema Unification Design
## HT-036.3.1: Database Schema Unification & Migration Design

**Status:** ✅ COMPLETED
**Date:** 2025-09-24
**Author:** Integration Team
**Version:** 1.0

---

## Executive Summary

This document outlines the unified database schema design for integrating all HT-035 systems (Orchestration, Modules, Marketplace, Handover) with existing agency toolkit infrastructure. The design ensures seamless data flow, maintains referential integrity, and provides a solid foundation for production deployment.

---

## 1. Current State Analysis

### 1.1 Existing Schema Systems

#### **Core Tables (Existing)**
- `clients_enhanced` - Enhanced client management
- `client_app_overrides` - Basic module configurations
- `client_deployments` - Deployment tracking
- `client_customizations` - Template customizations
- `auth.users` - User authentication

#### **Consultation System** (HT-030)
- `consultation_sessions` - Lead capture and consultation tracking
- `questionnaire_submissions` - Survey responses
- `consultation_generations` - AI-generated recommendations
- `consultation_analytics` - Performance metrics

#### **Configuration System** (HT-034)
- `system_configurations` - Global and client configs
- `template_configurations` - Template settings
- `deployment_configurations` - Deployment settings
- `client_billing_info` - Billing and subscription data
- `deployment_templates` - Reusable deployment templates

#### **Marketplace System** (HT-035)
- `marketplace_modules` - Module catalog
- `module_installations` - Installation tracking
- `module_reviews` - Ratings and reviews
- `module_licenses` - License management
- `module_payments` - Payment tracking
- `module_submissions` - Moderation queue
- `moderation_actions` - Moderation history
- `module_validations` - Quality assurance
- `publishing_pipelines` - Publishing automation
- `developer_stats` - Developer analytics
- `revenue_analytics` - Revenue tracking
- `marketplace_categories` - Module categories

---

## 2. Integration Requirements

### 2.1 Key Integration Points

#### **Module System Unification**
- **CONFLICT:** `client_app_overrides` (basic) vs `marketplace_modules` + `module_installations` (comprehensive)
- **SOLUTION:** Extend `client_app_overrides` with marketplace references, maintain backward compatibility

#### **Configuration Consolidation**
- **OVERLAP:** Multiple configuration tables serving similar purposes
- **SOLUTION:** Create unified configuration layer with proper namespacing

#### **Orchestration Data Flow**
- **REQUIREMENT:** Orchestration system needs to trigger module activations, marketplace installations, and handover processes
- **SOLUTION:** Create event-driven integration tables

#### **Handover Automation**
- **REQUIREMENT:** Complete package assembly referencing modules, configurations, and deployments
- **SOLUTION:** Unified handover package schema with proper foreign keys

---

## 3. Unified Schema Design

### 3.1 Core Integration Tables

#### **Module Registry (Unified)**
```sql
-- Extends client_app_overrides with marketplace integration
ALTER TABLE client_app_overrides ADD COLUMN IF NOT EXISTS marketplace_module_id UUID REFERENCES marketplace_modules(id);
ALTER TABLE client_app_overrides ADD COLUMN IF NOT EXISTS installation_id UUID REFERENCES module_installations(id);
ALTER TABLE client_app_overrides ADD COLUMN IF NOT EXISTS activation_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE client_app_overrides ADD COLUMN IF NOT EXISTS activation_metadata JSONB DEFAULT '{}';
```

#### **Orchestration Workflows**
```sql
CREATE TABLE orchestration_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name VARCHAR(255) NOT NULL,
    workflow_type VARCHAR(100) NOT NULL, -- 'client_onboarding', 'module_activation', 'deployment', 'handover'
    client_id UUID REFERENCES clients_enhanced(id),
    workflow_definition JSONB NOT NULL,
    current_step VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    steps_completed JSONB DEFAULT '[]',
    steps_failed JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);
```

#### **Workflow Executions**
```sql
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES orchestration_workflows(id),
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(100) NOT NULL,
    execution_order INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_data JSONB DEFAULT '{}',
    execution_time_ms INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3
);
```

#### **Handover Packages (Unified)**
```sql
CREATE TABLE handover_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients_enhanced(id),
    workflow_id UUID REFERENCES orchestration_workflows(id),
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(100) DEFAULT 'complete',

    -- Module References
    installed_modules JSONB DEFAULT '[]', -- Array of module installation IDs
    module_configurations JSONB DEFAULT '{}',

    -- Configuration References
    system_configs UUID[] DEFAULT '{}', -- Array of system_configuration IDs
    deployment_configs UUID[] DEFAULT '{}', -- Array of deployment_configuration IDs

    -- Documentation
    sop_documents JSONB DEFAULT '[]',
    tutorial_videos JSONB DEFAULT '[]',
    admin_credentials JSONB DEFAULT '{}',

    -- Delivery
    delivery_status VARCHAR(50) DEFAULT 'pending',
    delivery_method VARCHAR(100),
    delivered_at TIMESTAMPTZ,
    delivery_confirmation JSONB DEFAULT '{}',

    -- Metadata
    package_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Integration Events**
```sql
CREATE TABLE integration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(100) NOT NULL, -- 'orchestration', 'marketplace', 'modules', 'handover'
    event_target VARCHAR(100),

    -- Event Data
    event_payload JSONB NOT NULL,
    event_metadata JSONB DEFAULT '{}',

    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(50) DEFAULT 'pending',
    processing_error TEXT,
    processed_at TIMESTAMPTZ,

    -- Correlation
    correlation_id UUID,
    causation_id UUID,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Cross-System Views

#### **Unified Client Dashboard View**
```sql
CREATE VIEW unified_client_dashboard AS
SELECT
    c.id as client_id,
    c.name as client_name,
    c.company_name,
    c.status as client_status,

    -- Module Information
    COUNT(DISTINCT mi.id) FILTER (WHERE mi.status = 'active') as active_modules,
    COUNT(DISTINCT cao.id) as configured_apps,

    -- Orchestration Status
    ow.workflow_name as current_workflow,
    ow.status as workflow_status,
    ow.current_step,

    -- Handover Status
    hp.package_name as handover_package,
    hp.delivery_status,

    -- Configuration Summary
    COUNT(DISTINCT sc.id) as system_configurations,
    COUNT(DISTINCT dc.id) as deployment_configurations,

    -- Billing
    cb.subscription_tier,
    cb.subscription_status,

    -- Timestamps
    c.created_at,
    c.updated_at
FROM clients_enhanced c
LEFT JOIN module_installations mi ON c.id = mi.tenant_id
LEFT JOIN client_app_overrides cao ON c.id = cao.client_id
LEFT JOIN orchestration_workflows ow ON c.id = ow.client_id AND ow.status IN ('in_progress', 'pending')
LEFT JOIN handover_packages hp ON c.id = hp.client_id AND hp.delivery_status != 'delivered'
LEFT JOIN system_configurations sc ON c.id = sc.client_id
LEFT JOIN deployment_configurations dc ON c.id = dc.client_id
LEFT JOIN client_billing_info cb ON c.id = cb.client_id
GROUP BY c.id, c.name, c.company_name, c.status, ow.workflow_name, ow.status, ow.current_step,
         hp.package_name, hp.delivery_status, cb.subscription_tier, cb.subscription_status,
         c.created_at, c.updated_at;
```

#### **Module Integration View**
```sql
CREATE VIEW module_integration_view AS
SELECT
    mm.id as module_id,
    mm.name as module_name,
    mm.version,
    mm.category,

    -- Installation Data
    mi.id as installation_id,
    mi.tenant_id as client_id,
    mi.status as installation_status,

    -- Override Configuration
    cao.id as override_id,
    cao.enabled,
    cao.override_settings,

    -- Marketplace Data
    mm.rating_average,
    mm.install_count,
    mm.pricing_model,

    -- License Data
    ml.license_key,
    ml.expires_at,

    -- Timestamps
    mi.installed_at,
    mm.updated_at
FROM marketplace_modules mm
LEFT JOIN module_installations mi ON mm.id = mi.module_id
LEFT JOIN client_app_overrides cao ON mi.id = cao.installation_id
LEFT JOIN module_licenses ml ON mm.id = ml.module_id AND mi.tenant_id = ml.tenant_id;
```

---

## 4. Data Integrity Constraints

### 4.1 Foreign Key Relationships

```sql
-- Module Integration FK
ALTER TABLE client_app_overrides
    ADD CONSTRAINT fk_cao_marketplace_module
    FOREIGN KEY (marketplace_module_id) REFERENCES marketplace_modules(id) ON DELETE SET NULL;

ALTER TABLE client_app_overrides
    ADD CONSTRAINT fk_cao_installation
    FOREIGN KEY (installation_id) REFERENCES module_installations(id) ON DELETE CASCADE;

-- Orchestration FK
ALTER TABLE workflow_executions
    ADD CONSTRAINT fk_execution_workflow
    FOREIGN KEY (workflow_id) REFERENCES orchestration_workflows(id) ON DELETE CASCADE;

-- Handover FK
ALTER TABLE handover_packages
    ADD CONSTRAINT fk_handover_client
    FOREIGN KEY (client_id) REFERENCES clients_enhanced(id) ON DELETE CASCADE;

ALTER TABLE handover_packages
    ADD CONSTRAINT fk_handover_workflow
    FOREIGN KEY (workflow_id) REFERENCES orchestration_workflows(id) ON DELETE SET NULL;
```

### 4.2 Data Validation Constraints

```sql
-- Status validation
ALTER TABLE orchestration_workflows
    ADD CONSTRAINT check_workflow_status
    CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled'));

ALTER TABLE workflow_executions
    ADD CONSTRAINT check_execution_status
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped'));

ALTER TABLE handover_packages
    ADD CONSTRAINT check_delivery_status
    CHECK (delivery_status IN ('pending', 'preparing', 'ready', 'delivering', 'delivered', 'failed'));

-- Retry limits
ALTER TABLE workflow_executions
    ADD CONSTRAINT check_retry_count
    CHECK (retry_count >= 0 AND retry_count <= max_retries);
```

---

## 5. Indexing Strategy

### 5.1 Performance Indexes

```sql
-- Orchestration indexes
CREATE INDEX idx_orchestration_workflows_client ON orchestration_workflows(client_id);
CREATE INDEX idx_orchestration_workflows_status ON orchestration_workflows(status);
CREATE INDEX idx_orchestration_workflows_type ON orchestration_workflows(workflow_type);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

-- Handover indexes
CREATE INDEX idx_handover_packages_client ON handover_packages(client_id);
CREATE INDEX idx_handover_packages_workflow ON handover_packages(workflow_id);
CREATE INDEX idx_handover_packages_status ON handover_packages(delivery_status);

-- Integration events indexes
CREATE INDEX idx_integration_events_type ON integration_events(event_type);
CREATE INDEX idx_integration_events_source ON integration_events(event_source);
CREATE INDEX idx_integration_events_processed ON integration_events(processed);
CREATE INDEX idx_integration_events_correlation ON integration_events(correlation_id);
CREATE INDEX idx_integration_events_created ON integration_events(created_at);

-- Module integration indexes
CREATE INDEX idx_cao_marketplace_module ON client_app_overrides(marketplace_module_id);
CREATE INDEX idx_cao_installation ON client_app_overrides(installation_id);
CREATE INDEX idx_cao_activation_status ON client_app_overrides(activation_status);
```

---

## 6. Migration Considerations

### 6.1 Data Migration Strategy

#### **Phase 1: Schema Extension (Zero Downtime)**
1. Add new columns to existing tables
2. Create new integration tables
3. Create views for unified access
4. No data loss, backward compatible

#### **Phase 2: Data Population**
1. Migrate existing `client_app_overrides` to include marketplace references
2. Create orchestration workflows for existing clients
3. Generate handover packages for completed deployments
4. Populate integration events from historical data

#### **Phase 3: Validation**
1. Verify all foreign keys
2. Validate data integrity constraints
3. Test cross-system queries
4. Validate view performance

### 6.2 Rollback Procedures

```sql
-- Rollback script (if needed)
ALTER TABLE client_app_overrides DROP COLUMN IF EXISTS marketplace_module_id CASCADE;
ALTER TABLE client_app_overrides DROP COLUMN IF EXISTS installation_id CASCADE;
ALTER TABLE client_app_overrides DROP COLUMN IF EXISTS activation_status CASCADE;
ALTER TABLE client_app_overrides DROP COLUMN IF EXISTS activation_metadata CASCADE;

DROP TABLE IF EXISTS integration_events CASCADE;
DROP TABLE IF EXISTS handover_packages CASCADE;
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS orchestration_workflows CASCADE;

DROP VIEW IF EXISTS unified_client_dashboard CASCADE;
DROP VIEW IF EXISTS module_integration_view CASCADE;
```

---

## 7. Performance Optimization

### 7.1 Query Optimization

- **Materialized Views** for complex dashboard queries
- **Partial Indexes** for status-based filtering
- **JSONB Indexes** for frequently queried JSON fields
- **Connection Pooling** for high-concurrency scenarios

### 7.2 Caching Strategy

- **Query Results:** Cache unified dashboard views (5-minute TTL)
- **Module Data:** Cache marketplace module listings (15-minute TTL)
- **Client Configs:** Cache client-specific configurations (30-minute TTL)
- **Static Data:** Cache categories, templates (1-hour TTL)

---

## 8. Security Considerations

### 8.1 Row Level Security (RLS)

```sql
-- Orchestration workflows - client isolation
CREATE POLICY orchestration_client_isolation ON orchestration_workflows
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients_enhanced WHERE
            auth.uid() = created_by OR auth.uid() = assigned_manager OR
            EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
        )
    );

-- Handover packages - client isolation
CREATE POLICY handover_client_isolation ON handover_packages
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients_enhanced WHERE
            auth.uid() = created_by OR auth.uid() = assigned_manager OR
            EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
        )
    );
```

### 8.2 Data Encryption

- **Sensitive Fields:** Encrypt `admin_credentials`, `payment_method_id`, `license_key`
- **At Rest:** Enable PostgreSQL transparent data encryption
- **In Transit:** Enforce SSL/TLS for all database connections

---

## 9. Monitoring & Observability

### 9.1 Metrics to Track

- **Integration Events:** Processing rate, failure rate
- **Workflow Executions:** Average execution time, retry rates
- **Handover Packages:** Delivery success rate, time to delivery
- **Database Performance:** Query execution times, connection pool usage

### 9.2 Alerting Thresholds

- **Event Processing Lag:** > 5 minutes
- **Workflow Failure Rate:** > 5%
- **Database Connection Pool:** > 80% utilization
- **Query Response Time:** > 2 seconds (p95)

---

## 10. Success Criteria

### 10.1 Technical Validation

- ✅ All foreign keys validated
- ✅ Data integrity constraints enforced
- ✅ Query performance < 2 seconds (p95)
- ✅ Zero data loss during migration
- ✅ Rollback procedures tested

### 10.2 Business Validation

- ✅ Unified dashboard shows real-time client status
- ✅ Module installations tracked across all systems
- ✅ Orchestration workflows trigger handover automation
- ✅ Configuration changes propagate to all integrated systems
- ✅ Historical data preserved and accessible

---

## 11. Next Steps

1. **HT-036.3.2:** Implement cross-system data flow integration
2. **HT-036.3.3:** Develop API integration layer
3. **HT-036.3.4:** Conduct comprehensive system integration testing
4. **HT-036.4.1:** Prepare production deployment

---

## Appendix A: Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        UNIFIED SCHEMA ARCHITECTURE               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐         ┌────────────────────┐            │
│  │ clients_enhanced│◄────────┤orchestration_wrkflw│            │
│  └────────┬────────┘         └──────────┬─────────┘            │
│           │                              │                       │
│           │                              ▼                       │
│           │                  ┌────────────────────┐             │
│           │                  │workflow_executions │             │
│           │                  └────────────────────┘             │
│           │                                                      │
│           │                  ┌────────────────────┐             │
│           ├─────────────────►│handover_packages   │             │
│           │                  └────────────────────┘             │
│           │                                                      │
│           │  ┌────────────────────┐    ┌──────────────────┐    │
│           ├─►│client_app_overrides│◄───┤module_installats │    │
│           │  └──────────┬─────────┘    └─────────┬────────┘    │
│           │             │                         │             │
│           │             └────────────┬────────────┘             │
│           │                          ▼                          │
│           │              ┌────────────────────┐                 │
│           │              │marketplace_modules │                 │
│           │              └────────────────────┘                 │
│           │                                                      │
│           │  ┌─────────────────────┐                            │
│           ├─►│system_configurations│                            │
│           │  └─────────────────────┘                            │
│           │                                                      │
│           │  ┌──────────────────────────┐                       │
│           └─►│deployment_configurations │                       │
│              └──────────────────────────┘                       │
│                                                                   │
│              ┌─────────────────────┐                            │
│              │integration_events   │                            │
│              └─────────────────────┘                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

**Document Status:** ✅ COMPLETED
**Review Date:** 2025-09-24
**Approved By:** Integration Team
**Version:** 1.0