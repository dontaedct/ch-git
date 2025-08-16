# Database Migration Safety System

## Overview

The Database Migration Safety System enforces safe database schema changes by implementing the **Expand/Contract Pattern** with automated safety checks. This system prevents unsafe operations like dropping columns or tables without proper planning and phase markers.

## 🚨 Why This Matters

Unsafe database migrations can cause:
- **Data Loss**: Dropping columns or tables with live data
- **Service Outages**: Breaking changes that crash applications
- **Rollback Failures**: Inability to recover from failed migrations
- **Compliance Violations**: Loss of audit trails or required data

## 🔄 Expand/Contract Pattern

The system enforces a three-phase migration workflow:

### Phase 1: EXPAND
- **Goal**: Add new schema elements without removing old ones
- **Operations**: `CREATE`, `ADD COLUMN`, `ADD TABLE`, `ADD INDEX`
- **Safety**: ✅ Always safe, no data loss risk
- **Marker**: `#expand` in migration file

### Phase 2: DUAL-READ/WRITE
- **Goal**: Support both old and new schemas simultaneously
- **Operations**: Update application code to handle both schemas
- **Safety**: ✅ Safe when properly implemented
- **Marker**: `#dual-read-write` or `#dual_read_write` in migration file

### Phase 3: CONTRACT
- **Goal**: Remove deprecated schema elements
- **Operations**: `DROP COLUMN`, `DROP TABLE`, `DROP INDEX`
- **Safety**: ⚠️ Requires proper planning and phase markers
- **Marker**: `#contract` in migration file

## 🛡️ Safety Enforcement

### Automatic Detection
The system automatically detects unsafe operations:
- `DROP` statements (tables, columns, indexes, constraints)
- `RENAME` operations
- Type constraint tightening (`ALTER TYPE ... SET`)
- Function signature changes
- Default value removals

### Enforcement Rules
1. **Expand Phase**: All operations allowed
2. **Contract Phase**: Requires `#contract` marker + Plan ID
3. **Unknown Phase**: Unsafe operations blocked
4. **Missing Markers**: Blocked until phase markers added

## 📋 Usage

### 1. Adding Phase Markers

```sql
-- Migration: 001_add_user_profile.sql
-- #expand
-- #plan: user-profile-enhancement

ALTER TABLE users ADD COLUMN profile_data JSONB;
CREATE INDEX idx_users_profile ON users USING GIN (profile_data);
```

```sql
-- Migration: 002_remove_old_profile.sql
-- #contract
-- #plan: user-profile-enhancement

DROP COLUMN users.old_profile_text;
DROP INDEX idx_users_old_profile;
```

### 2. Plan ID Format

Use consistent plan IDs to group related migrations:
- `#plan: user-profile-enhancement`
- `#plan: auth-system-upgrade`
- `#plan: billing-v2-migration`

### 3. GitHub Actions Integration

The system automatically runs on:
- Pull requests (opened, synchronized, reopened)
- Pushes to main branch

## 🚀 GitHub Actions Workflow

### Workflow: `.github/workflows/sentinel-db.yml`

**Features:**
- Shadow database testing
- Migration safety analysis
- Automatic artifact uploads
- Clear failure reporting

**Steps:**
1. **Setup**: Node.js + PostgreSQL service container
2. **Shadow DB**: Creates test database with current schema
3. **Migration Test**: Applies PR migrations to shadow DB
4. **Safety Check**: Analyzes for unsafe operations
5. **Artifacts**: Uploads migration safety report

### Example Output

```bash
✅ MIGRATION SAFETY CHECK PASSED
All migrations are safe for production deployment.

=== MIGRATION SAFETY REPORT ===
Status: ✅ SAFE
Phase: EXPAND
Risk Level: LOW

=== END REPORT ===
```

## 🛠️ Local Development

### Running Sentinel DB Enforcer

```bash
# Analyze specific migration files
tsx scripts/sentinel-db-enforcer.ts supabase/migrations/001_test.sql

# Analyze multiple files
tsx scripts/sentinel-db-enforcer.ts supabase/migrations/*.sql
```

### Example Output

```bash
🛡️ Sentinel DB Enforcer Starting...
📁 Analyzing 1 changed files...
🚨 Database migrations detected - performing safety analysis...

=== DATABASE MIGRATION SAFETY REPORT ===
Status: ❌ UNSAFE
Phase: UNKNOWN
Risk Level: HIGH

🚨 UNSAFE OPERATIONS DETECTED:
  1. Column removal (DROP COLUMN)

💡 RECOMMENDATIONS:
  1. Add phase marker to supabase/migrations/001_test.sql
  2. Follow expand→dual-read/write→contract workflow

⚠️  PHASE MARKERS REQUIRED:
  - Add #expand for additive changes
  - Add #dual-read-write for transition phase
  - Add #contract for removal phase

=== END REPORT ===

❌ UNSAFE MIGRATION DETECTED - BLOCKING CHANGES
```

## 📝 PR Template Integration

### Required Checklist

The PR template automatically includes:

```markdown
## Database Changes Checklist
**⚠️ REQUIRED for any database schema changes**

- [ ] DB changes follow expand→dual-read/write→contract workflow
- [ ] Plan ID: `<enter_plan_id_here>`
- [ ] Phase: `<expand|contract|dual-read-write>`
- [ ] Migration artifacts uploaded and linked below
- [ ] Shadow migration test passed ✅
```

## 🔧 Configuration

### Environment Variables

```bash
# Database connection for shadow testing
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=shadow_db
```

### Customization

Modify `scripts/sentinel/db-migration.ts` to:
- Add new unsafe operation patterns
- Customize phase marker detection
- Adjust risk scoring algorithms

## 🚨 Troubleshooting

### Common Issues

1. **"Migration analysis not available"**
   - Ensure migration files are readable
   - Check file permissions
   - Verify file paths

2. **"Unsafe operations detected"**
   - Add appropriate phase markers
   - Follow expand/contract workflow
   - Include plan ID for contract phase

3. **"Shadow migration test failed"**
   - Check PostgreSQL service container
   - Verify database connection
   - Review migration SQL syntax

### Debug Mode

Enable verbose logging:
```bash
DEBUG=sentinel:* tsx scripts/sentinel-db-enforcer.ts <files>
```

## 📚 Best Practices

### 1. Always Use Phase Markers
```sql
-- Good
-- #expand
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Bad
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
```

### 2. Group Related Migrations
```sql
-- Migration 1: Add new column
-- #expand
-- #plan: user-verification

-- Migration 2: Remove old column
-- #contract
-- #plan: user-verification
```

### 3. Test in Shadow Database
- Always test migrations locally first
- Use `supabase db reset` for clean testing
- Verify rollback procedures

### 4. Document Migration Plans
- Include plan description in PR
- Link to design documents
- Specify rollback procedures

## 🔗 Integration Points

### Sentinel System
- Integrates with existing Sentinel Gate
- Enhances risk assessment
- Provides migration-specific blocking

### CI/CD Pipeline
- Blocks unsafe migrations automatically
- Provides clear failure reasons
- Generates actionable reports

### Development Workflow
- Enforces best practices
- Prevents common mistakes
- Improves migration quality

## 📊 Metrics and Monitoring

### Success Metrics
- Migration failure rate reduction
- Rollback frequency decrease
- Production incident reduction

### Monitoring Points
- GitHub Actions workflow success rate
- Migration safety check pass rate
- Phase marker compliance rate

## 🚀 Future Enhancements

### Planned Features
- Migration dependency analysis
- Rollback plan validation
- Performance impact assessment
- Compliance reporting

### Integration Opportunities
- Database schema visualization
- Migration timeline tracking
- Automated rollback procedures
- Performance regression detection

## 📞 Support

### Getting Help
1. Check this documentation
2. Review GitHub Actions logs
3. Run local Sentinel DB enforcer
4. Consult team database experts

### Contributing
1. Follow existing patterns
2. Add tests for new features
3. Update documentation
4. Submit PR with proper phase markers

---

**Remember**: The goal is not to block progress, but to ensure database changes are safe, planned, and reversible. When in doubt, use the expand phase and iterate safely.
