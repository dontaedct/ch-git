# Database Migration Strategy
## HT-036.3.1: Comprehensive Migration Strategy for Schema Unification

**Status:** ✅ COMPLETED
**Date:** 2025-09-24
**Version:** 1.0
**Migration Type:** Zero-Downtime, Incremental

---

## Executive Summary

This document outlines the comprehensive migration strategy for integrating all HT-035 systems (Orchestration, Modules, Marketplace, Handover) with existing agency toolkit infrastructure. The strategy ensures zero downtime, data integrity, and seamless rollback capabilities.

---

## 1. Migration Philosophy

### 1.1 Core Principles

- **Zero Downtime:** All migrations execute without service interruption
- **Incremental Approach:** Changes applied in small, reversible steps
- **Data Integrity First:** Comprehensive validation at every stage
- **Rollback Ready:** Every phase has tested rollback procedures
- **Performance Conscious:** Minimize impact on production operations

### 1.2 Risk Mitigation

- **Staging Environment Testing:** All migrations tested in staging before production
- **Backup Strategy:** Complete backups before each migration phase
- **Monitoring:** Real-time monitoring during migration execution
- **Communication Plan:** Clear stakeholder communication throughout process

---

## 2. Pre-Migration Requirements

### 2.1 Environment Preparation

#### **Database Backup**
```bash
# Create full database backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f backup_pre_migration_$(date +%Y%m%d_%H%M%S).dump

# Verify backup integrity
pg_restore --list backup_pre_migration_*.dump | wc -l
```

#### **Staging Environment Setup**
1. Clone production database to staging
2. Apply migrations to staging
3. Run comprehensive tests
4. Validate performance metrics
5. Document any issues or optimizations

#### **Monitoring Setup**
- Database query performance metrics
- Connection pool utilization
- Error rate tracking
- API response times
- Resource utilization (CPU, Memory, Disk I/O)

### 2.2 Team Preparation

#### **Roles & Responsibilities**
- **Migration Lead:** Oversees entire migration process
- **Database Administrator:** Executes SQL migrations, monitors database
- **Backend Engineers:** Validate application integration
- **QA Engineers:** Execute test plans and validation
- **DevOps Engineers:** Monitor infrastructure and performance
- **Product Owner:** Approve go/no-go decisions at checkpoints

#### **Communication Plan**
- Pre-migration briefing (24 hours before)
- Migration status updates (every 30 minutes during execution)
- Post-migration summary (within 1 hour of completion)
- Issue escalation procedures

---

## 3. Migration Phases

### 3.1 Phase 1: Pre-Migration Validation (30 minutes)

#### **Objectives**
- Verify all prerequisites are met
- Validate current system state
- Create comprehensive backups

#### **Steps**
1. **Verify Table Existence**
   - Check all required tables exist
   - Validate table schemas
   - Confirm indexes are in place

2. **Data Integrity Check**
   ```sql
   -- Run integrity checks
   SELECT COUNT(*) FROM clients_enhanced;
   SELECT COUNT(*) FROM marketplace_modules;
   SELECT COUNT(*) FROM module_installations;
   SELECT COUNT(*) FROM client_app_overrides;
   ```

3. **Create Backups**
   ```sql
   -- Backup critical tables
   CREATE TABLE migration_backup_client_app_overrides AS
   SELECT * FROM client_app_overrides;

   CREATE TABLE migration_backup_clients_enhanced AS
   SELECT * FROM clients_enhanced;
   ```

4. **Check for Orphaned Records**
   ```sql
   -- Identify orphaned records before migration
   SELECT COUNT(*) FROM client_app_overrides cao
   WHERE NOT EXISTS (
     SELECT 1 FROM clients_enhanced WHERE id = cao.client_id
   );
   ```

#### **Success Criteria**
- ✅ All required tables exist
- ✅ No critical data integrity issues
- ✅ Backups created and verified
- ✅ Team ready and monitoring in place

#### **Rollback Procedure**
If validation fails, address issues before proceeding. No rollback needed at this stage.

---

### 3.2 Phase 2: Schema Extension (1 hour)

#### **Objectives**
- Extend existing tables with new columns
- Create new integration tables
- Add indexes for performance

#### **Steps**

1. **Extend client_app_overrides**
   ```sql
   ALTER TABLE client_app_overrides
     ADD COLUMN IF NOT EXISTS marketplace_module_id UUID,
     ADD COLUMN IF NOT EXISTS installation_id UUID,
     ADD COLUMN IF NOT EXISTS activation_status VARCHAR(50) DEFAULT 'pending',
     ADD COLUMN IF NOT EXISTS activation_metadata JSONB DEFAULT '{}';
   ```

2. **Create Orchestration Tables**
   ```sql
   -- Create orchestration_workflows
   CREATE TABLE IF NOT EXISTS orchestration_workflows (...);

   -- Create workflow_executions
   CREATE TABLE IF NOT EXISTS workflow_executions (...);
   ```

3. **Create Integration Tables**
   ```sql
   -- Create handover_packages
   CREATE TABLE IF NOT EXISTS handover_packages (...);

   -- Create integration_events
   CREATE TABLE IF NOT EXISTS integration_events (...);
   ```

4. **Add Indexes**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_cao_marketplace_module
   ON client_app_overrides(marketplace_module_id);

   CREATE INDEX IF NOT EXISTS idx_cao_installation
   ON client_app_overrides(installation_id);

   -- Additional indexes...
   ```

#### **Validation Checkpoints**
- Verify all columns added successfully
- Confirm all tables created
- Validate all indexes created and active
- Check no errors in database logs

#### **Success Criteria**
- ✅ Schema extensions complete
- ✅ New tables created
- ✅ All indexes in place
- ✅ No application errors
- ✅ Performance metrics stable

#### **Rollback Procedure**
```sql
-- Drop new columns (if needed)
ALTER TABLE client_app_overrides
  DROP COLUMN IF EXISTS marketplace_module_id CASCADE,
  DROP COLUMN IF EXISTS installation_id CASCADE,
  DROP COLUMN IF EXISTS activation_status CASCADE,
  DROP COLUMN IF EXISTS activation_metadata CASCADE;

-- Drop new tables
DROP TABLE IF EXISTS integration_events CASCADE;
DROP TABLE IF EXISTS handover_packages CASCADE;
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS orchestration_workflows CASCADE;
```

---

### 3.3 Phase 3: Data Population (2 hours)

#### **Objectives**
- Link existing data to new structures
- Create initial orchestration workflows
- Generate handover packages for completed deployments

#### **Steps**

1. **Link Modules to Marketplace**
   ```sql
   WITH module_mapping AS (
     SELECT
       cao.id as override_id,
       mm.id as marketplace_module_id,
       mi.id as installation_id
     FROM client_app_overrides cao
     LEFT JOIN marketplace_modules mm ON cao.app_name = mm.name
     LEFT JOIN module_installations mi
       ON mm.id = mi.module_id AND cao.client_id = mi.tenant_id
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
   ```

2. **Create Orchestration Workflows**
   ```sql
   INSERT INTO orchestration_workflows (
     workflow_name, workflow_type, client_id,
     workflow_definition, status, created_at
   )
   SELECT
     'Client Setup - ' || c.name,
     'client_onboarding',
     c.id,
     jsonb_build_object('steps', jsonb_build_array(...)),
     'in_progress',
     c.created_at
   FROM clients_enhanced c
   WHERE NOT EXISTS (
     SELECT 1 FROM orchestration_workflows WHERE client_id = c.id
   );
   ```

3. **Generate Handover Packages**
   ```sql
   INSERT INTO handover_packages (
     client_id, workflow_id, package_name,
     installed_modules, module_configurations
   )
   SELECT
     c.id,
     ow.id,
     'Handover Package - ' || c.name,
     -- Aggregate installed modules
     (...),
     -- Aggregate configurations
     (...)
   FROM clients_enhanced c
   JOIN orchestration_workflows ow ON c.id = ow.client_id
   WHERE EXISTS (
     SELECT 1 FROM client_deployments
     WHERE client_id = c.id AND status = 'deployed'
   );
   ```

4. **Create Integration Events**
   ```sql
   INSERT INTO integration_events (
     event_type, event_source, event_payload, correlation_id
   )
   SELECT
     'module_installed',
     'modules',
     jsonb_build_object(...),
     mi.id
   FROM module_installations mi
   WHERE mi.installed_at >= NOW() - INTERVAL '7 days';
   ```

#### **Validation Checkpoints**
- Verify data linkage accuracy
- Confirm workflow creation logic
- Validate handover package generation
- Check integration events created

#### **Success Criteria**
- ✅ Module linkages established
- ✅ Orchestration workflows created
- ✅ Handover packages generated
- ✅ Integration events populated
- ✅ Data integrity maintained

#### **Rollback Procedure**
```sql
-- Clear populated data
DELETE FROM integration_events
WHERE created_at >= '[MIGRATION_START_TIME]';

DELETE FROM handover_packages
WHERE created_at >= '[MIGRATION_START_TIME]';

DELETE FROM workflow_executions
WHERE workflow_id IN (
  SELECT id FROM orchestration_workflows
  WHERE created_at >= '[MIGRATION_START_TIME]'
);

DELETE FROM orchestration_workflows
WHERE created_at >= '[MIGRATION_START_TIME]';

-- Reset module linkages
UPDATE client_app_overrides
SET marketplace_module_id = NULL,
    installation_id = NULL,
    activation_status = 'pending',
    activation_metadata = '{}'
WHERE updated_at >= '[MIGRATION_START_TIME]';
```

---

### 3.4 Phase 4: Add Foreign Keys & Constraints (30 minutes)

#### **Objectives**
- Add foreign key constraints
- Enable referential integrity enforcement

#### **Steps**

1. **Add Foreign Keys**
   ```sql
   ALTER TABLE client_app_overrides
     ADD CONSTRAINT fk_cao_marketplace_module
     FOREIGN KEY (marketplace_module_id)
     REFERENCES marketplace_modules(id) ON DELETE SET NULL;

   ALTER TABLE client_app_overrides
     ADD CONSTRAINT fk_cao_installation
     FOREIGN KEY (installation_id)
     REFERENCES module_installations(id) ON DELETE CASCADE;
   ```

2. **Validate Constraints**
   ```sql
   -- Check constraint violations
   SELECT COUNT(*) FROM client_app_overrides cao
   WHERE marketplace_module_id IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM marketplace_modules WHERE id = cao.marketplace_module_id
   );
   ```

#### **Success Criteria**
- ✅ All foreign keys added successfully
- ✅ No constraint violations
- ✅ Referential integrity enforced

#### **Rollback Procedure**
```sql
ALTER TABLE client_app_overrides
  DROP CONSTRAINT IF EXISTS fk_cao_marketplace_module,
  DROP CONSTRAINT IF EXISTS fk_cao_installation;
```

---

### 3.5 Phase 5: Create Views & Enable RLS (30 minutes)

#### **Objectives**
- Create unified dashboard views
- Enable row-level security
- Grant appropriate permissions

#### **Steps**

1. **Create Views**
   ```sql
   CREATE OR REPLACE VIEW unified_client_dashboard AS ...;
   CREATE OR REPLACE VIEW module_integration_view AS ...;
   CREATE OR REPLACE VIEW workflow_progress_view AS ...;
   ```

2. **Enable RLS**
   ```sql
   ALTER TABLE orchestration_workflows ENABLE ROW LEVEL SECURITY;
   ALTER TABLE handover_packages ENABLE ROW LEVEL SECURITY;

   CREATE POLICY orchestration_client_isolation ...;
   CREATE POLICY handover_client_isolation ...;
   ```

3. **Grant Permissions**
   ```sql
   GRANT SELECT, INSERT, UPDATE, DELETE ON orchestration_workflows TO authenticated;
   GRANT SELECT ON unified_client_dashboard TO authenticated;
   ```

#### **Success Criteria**
- ✅ All views created successfully
- ✅ RLS policies active
- ✅ Permissions granted correctly

---

### 3.6 Phase 6: Final Validation & Testing (1 hour)

#### **Objectives**
- Run comprehensive data integrity validation
- Test cross-system queries
- Validate application integration
- Verify performance metrics

#### **Steps**

1. **Run Data Integrity Validator**
   ```typescript
   import { validateDataIntegrity } from '@/lib/integration/data-integrity-validator';

   const report = await validateDataIntegrity();
   console.log('Validation Report:', report);
   ```

2. **Test Cross-System Queries**
   ```sql
   -- Test unified dashboard view
   SELECT * FROM unified_client_dashboard LIMIT 10;

   -- Test module integration view
   SELECT * FROM module_integration_view LIMIT 10;

   -- Test workflow progress view
   SELECT * FROM workflow_progress_view WHERE workflow_status = 'in_progress';
   ```

3. **Application Integration Testing**
   - Test module activation workflows
   - Verify handover package generation
   - Check integration event processing
   - Validate API endpoints

4. **Performance Validation**
   - Query execution times < 2 seconds (p95)
   - Connection pool utilization < 80%
   - No memory leaks detected
   - Error rates within normal ranges

#### **Success Criteria**
- ✅ Data integrity validation passed
- ✅ All cross-system queries functional
- ✅ Application integration verified
- ✅ Performance metrics within targets

---

## 4. Post-Migration Activities

### 4.1 Cleanup Tasks

1. **Remove Backup Tables** (after 7 days)
   ```sql
   DROP TABLE IF EXISTS migration_backup_client_app_overrides;
   DROP TABLE IF EXISTS migration_backup_clients_enhanced;
   ```

2. **Optimize Database**
   ```sql
   VACUUM ANALYZE orchestration_workflows;
   VACUUM ANALYZE workflow_executions;
   VACUUM ANALYZE handover_packages;
   VACUUM ANALYZE integration_events;
   ```

3. **Update Documentation**
   - Update schema documentation
   - Update API documentation
   - Update user guides

### 4.2 Monitoring & Observability

#### **Key Metrics to Monitor** (first 48 hours)
- Database query performance
- Integration event processing rate
- Workflow execution success rate
- Handover package delivery rate
- Error rates and types
- Resource utilization trends

#### **Alerting Thresholds**
- Query response time > 2 seconds (p95)
- Error rate > 1%
- Event processing lag > 5 minutes
- Connection pool utilization > 85%

### 4.3 User Communication

#### **Migration Completion Announcement**
```
Subject: HT-036 Integration Complete - Enhanced Agency Toolkit Now Live

We've successfully completed the HT-036 integration, bringing you:

✅ Unified dashboard with real-time client status
✅ Enhanced module management with marketplace integration
✅ Automated orchestration workflows
✅ Streamlined handover automation

All systems are fully operational with improved performance and capabilities.

For questions or issues, contact: [support@agency.com]
```

---

## 5. Emergency Procedures

### 5.1 Full Rollback Procedure

#### **When to Execute Full Rollback**
- Critical data integrity violations detected
- Unrecoverable application errors
- Performance degradation > 50%
- Business-critical functionality broken

#### **Rollback Steps**
```sql
BEGIN;

-- 1. Drop new foreign keys
ALTER TABLE client_app_overrides
  DROP CONSTRAINT IF EXISTS fk_cao_marketplace_module CASCADE,
  DROP CONSTRAINT IF EXISTS fk_cao_installation CASCADE;

-- 2. Drop new views
DROP VIEW IF EXISTS unified_client_dashboard CASCADE;
DROP VIEW IF EXISTS module_integration_view CASCADE;
DROP VIEW IF EXISTS workflow_progress_view CASCADE;

-- 3. Drop new tables
DROP TABLE IF EXISTS integration_events CASCADE;
DROP TABLE IF EXISTS handover_packages CASCADE;
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS orchestration_workflows CASCADE;

-- 4. Remove new columns
ALTER TABLE client_app_overrides
  DROP COLUMN IF EXISTS marketplace_module_id CASCADE,
  DROP COLUMN IF EXISTS installation_id CASCADE,
  DROP COLUMN IF EXISTS activation_status CASCADE,
  DROP COLUMN IF EXISTS activation_metadata CASCADE;

-- 5. Restore from backup if needed
-- (Restore commands based on backup method)

COMMIT;
```

### 5.2 Partial Rollback Procedures

#### **Rollback Data Population Only**
```sql
-- Keep schema changes, rollback data only
DELETE FROM integration_events WHERE created_at >= '[MIGRATION_START_TIME]';
DELETE FROM handover_packages WHERE created_at >= '[MIGRATION_START_TIME]';
DELETE FROM orchestration_workflows WHERE created_at >= '[MIGRATION_START_TIME]';

UPDATE client_app_overrides
SET marketplace_module_id = NULL,
    installation_id = NULL,
    activation_status = 'pending'
WHERE updated_at >= '[MIGRATION_START_TIME]';
```

---

## 6. Success Metrics

### 6.1 Technical Success Indicators
- ✅ Zero downtime during migration
- ✅ All data integrity checks passed
- ✅ Query performance < 2 seconds (p95)
- ✅ Error rate < 0.1%
- ✅ 100% of existing functionality preserved
- ✅ All new integration features operational

### 6.2 Business Success Indicators
- ✅ Unified dashboard accessible to all users
- ✅ Module installations tracked across systems
- ✅ Orchestration workflows executing successfully
- ✅ Handover automation reducing delivery time
- ✅ User satisfaction > 95%

---

## 7. Lessons Learned & Continuous Improvement

### 7.1 Post-Migration Review

**Schedule:** Within 7 days of migration completion

**Agenda:**
1. Review migration execution timeline
2. Discuss challenges encountered and solutions
3. Analyze performance impact
4. Gather team feedback
5. Document lessons learned
6. Identify process improvements

### 7.2 Documentation Updates

- Update migration playbook with lessons learned
- Enhance rollback procedures based on experience
- Document any edge cases discovered
- Update troubleshooting guides

---

## 8. Approval & Sign-off

### Pre-Migration Approval

- [ ] Database Administrator: ___________________ Date: ___________
- [ ] Backend Lead: ___________________ Date: ___________
- [ ] DevOps Lead: ___________________ Date: ___________
- [ ] Product Owner: ___________________ Date: ___________

### Post-Migration Sign-off

- [ ] Migration Successful: ___________________ Date: ___________
- [ ] Data Integrity Verified: ___________________ Date: ___________
- [ ] Performance Validated: ___________________ Date: ___________
- [ ] Production Certified: ___________________ Date: ___________

---

**Document Status:** ✅ COMPLETED
**Last Updated:** 2025-09-24
**Next Review:** Post-Migration (within 7 days)
**Version:** 1.0