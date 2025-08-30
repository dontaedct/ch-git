# Runbooks — Operational Procedures

## Overview
This document provides operational runbooks for common tasks, safety procedures, and incident response in the repository.

## Universal Header Compliance
- **File**: `docs/RUNBOOKS.md`
- **Purpose**: Provide operational procedures and safety checklists
- **Status**: Universal header compliant

## Guardian Backup & Restore

### Pre-Change Backup
```bash
# 1. Create Guardian backup
npm run guardian:backup -- --name "pre-change-$(date +%Y%m%d-%H%M%S)"

# 2. Verify backup integrity
npm run guardian:verify -- --backup <backup-name>

# 3. Store backup metadata
echo "Backup: <backup-name>" > .guardian-backup-status
echo "Created: $(date)" >> .guardian-backup-status
echo "Purpose: <change-description>" >> .guardian-backup-status
```

### Post-Change Verification
```bash
# 1. Run health checks
npm run doctor
npm run ci

# 2. Verify Guardian status
npm run guardian:status

# 3. Test critical functionality
npm run test:critical
```

### Emergency Restore
```bash
# 1. Stop all services
npm run stop:all

# 2. Restore from Guardian backup
npm run guardian:restore -- --backup <backup-name>

# 3. Verify restore integrity
npm run guardian:verify -- --backup <backup-name>

# 4. Restart services
npm run start:all

# 5. Run post-restore checks
npm run doctor
npm run ci
```

## Safety Checklists

### Pre-Change Checklist
```markdown
## Pre-Change Safety Checklist

**Environment Preparation**
- [ ] Development environment is clean and up-to-date
- [ ] All tests passing: `npm run doctor && npm run ci`
- [ ] No uncommitted changes in working directory
- [ ] Guardian backup created and verified
- [ ] Change plan documented and reviewed

**Risk Assessment**
- [ ] Risk level determined (Low/Medium/High)
- [ ] Rollback plan documented and tested
- [ ] Impact assessment completed
- [ ] Stakeholder notification sent (if required)

**Technical Preparation**
- [ ] Required dependencies installed
- [ ] Database migrations tested (if applicable)
- [ ] API changes documented (if applicable)
- [ ] UI changes previewed (if applicable)
- [ ] Performance impact assessed

**Safety Measures**
- [ ] No forbidden surfaces will be touched
- [ ] Import paths use only allowed aliases
- [ ] RLS policies remain secure
- [ ] No secrets or environment variables exposed
- [ ] Registry updates planned (if applicable)
```

### Post-Change Checklist
```markdown
## Post-Change Safety Checklist

**Immediate Verification**
- [ ] All tests passing: `npm run doctor && npm run ci`
- [ ] No new linting errors
- [ ] No new TypeScript errors
- [ ] Bundle size within acceptable limits
- [ ] Guardian status healthy

**Functional Testing**
- [ ] Critical user flows tested
- [ ] API endpoints working correctly
- [ ] UI components rendering properly
- [ ] Database operations successful
- [ ] Authentication flows working

**Performance & Security**
- [ ] No performance regressions
- [ ] Security checks passing
- [ ] No new vulnerabilities introduced
- [ ] Rate limiting working correctly
- [ ] Error handling functioning

**Documentation & Cleanup**
- [ ] Changes documented in appropriate files
- [ ] CHANGE_JOURNAL.md updated (if registries touched)
- [ ] README files updated (if needed)
- [ ] Commit message follows conventions
- [ ] Working directory clean
```

## Incident Response

### Critical Issue Detection
```bash
# 1. Immediate assessment
npm run doctor
npm run ci

# 2. Check Guardian status
npm run guardian:status

# 3. Identify affected components
npm run test:affected

# 4. Check recent changes
git log --oneline -10
```

### Emergency Rollback Procedure
```bash
# 1. Stop affected services
npm run stop:affected

# 2. Revert to last known good commit
git revert HEAD --no-edit

# 3. Force push if necessary (emergency only)
git push --force-with-lease origin main

# 4. Restore from Guardian backup
npm run guardian:restore -- --backup <last-good-backup>

# 5. Restart services
npm run start:all

# 6. Verify recovery
npm run doctor
npm run ci
npm run test:critical
```

### Incident Documentation
```markdown
## Incident Report Template

**Incident Summary**
- **Date/Time**: [When incident occurred]
- **Severity**: [Critical/High/Medium/Low]
- **Affected Services**: [List of impacted components]
- **User Impact**: [Number of users affected, downtime]

**Root Cause Analysis**
- **What Happened**: [Description of the incident]
- **Why It Happened**: [Root cause identification]
- **How It Was Detected**: [Detection method and timing]
- **Response Time**: [Time from detection to resolution]

**Resolution Steps**
- **Immediate Actions**: [What was done to stop the incident]
- **Recovery Steps**: [How services were restored]
- **Verification**: [How recovery was confirmed]

**Lessons Learned**
- **What Went Wrong**: [Specific failures identified]
- **What Went Well**: [Successful response elements]
- **Prevention Measures**: [How to prevent recurrence]
- **Process Improvements**: [Changes to procedures]

**Follow-up Actions**
- [ ] Update relevant documentation
- [ ] Modify safety checklists
- [ ] Enhance monitoring/alerting
- [ ] Schedule post-incident review
- [ ] Update runbooks if needed
```

## Operational Procedures

### Daily Health Checks
```bash
# 1. System status
npm run guardian:status
npm run doctor

# 2. Test critical paths
npm run test:smoke

# 3. Check performance metrics
npm run perf:check

# 4. Verify Guardian backups
npm run guardian:list
```

### Weekly Maintenance
```bash
# 1. Update dependencies
npm run update:deps

# 2. Run full test suite
npm run ci

# 3. Performance analysis
npm run perf:analyze

# 4. Guardian backup rotation
npm run guardian:rotate
```

### Monthly Review
```bash
# 1. Security audit
npm run security:audit

# 2. Performance review
npm run perf:report

# 3. Guardian backup verification
npm run guardian:verify:all

# 4. Policy compliance check
npm run compliance:check
```

## Troubleshooting

### Common Issues

#### Tests Failing
```bash
# 1. Check for environment issues
npm run doctor

# 2. Clear caches
npm run clean:cache

# 3. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 4. Check for conflicting changes
git status
git diff
```

#### Guardian Issues
```bash
# 1. Check Guardian configuration
npm run guardian:config

# 2. Verify backup integrity
npm run guardian:verify:all

# 3. Check Guardian logs
npm run guardian:logs

# 4. Restart Guardian service
npm run guardian:restart
```

#### Performance Issues
```bash
# 1. Run performance analysis
npm run perf:analyze

# 2. Check resource usage
npm run perf:resources

# 3. Identify bottlenecks
npm run perf:bottlenecks

# 4. Generate optimization report
npm run perf:report
```

### Emergency Contacts

#### Primary Contacts
- **Repository Maintainers**: [@maintainers]
- **DevOps Team**: [@devops]
- **Security Team**: [@security]

#### Escalation Path
1. **Level 1**: Repository maintainers (immediate)
2. **Level 2**: DevOps team (15 minutes)
3. **Level 3**: Security team (30 minutes)
4. **Level 4**: Management (1 hour)

#### Communication Channels
- **Slack**: #repo-ops (primary)
- **Email**: ops@company.com (backup)
- **PagerDuty**: [on-call rotation]
- **Phone**: [emergency hotline]

## Recovery Procedures

### Data Recovery
```bash
# 1. Identify lost data
npm run data:audit

# 2. Check Guardian backups
npm run guardian:list

# 3. Restore specific data
npm run guardian:restore:data -- --table <table> --backup <backup>

# 4. Verify data integrity
npm run data:verify
```

### Service Recovery
```bash
# 1. Stop all services
npm run stop:all

# 2. Clear corrupted state
npm run clean:state

# 3. Restore from Guardian
npm run guardian:restore

# 4. Restart services
npm run start:all

# 5. Verify recovery
npm run health:check
```

### Configuration Recovery
```bash
# 1. Backup current config
npm run config:backup

# 2. Restore known good config
npm run config:restore -- --backup <backup>

# 3. Verify configuration
npm run config:verify

# 4. Restart affected services
npm run restart:affected
```

## Monitoring & Alerting

### Key Metrics
- **System Health**: Guardian status, test results
- **Performance**: Response times, throughput
- **Security**: Vulnerability scans, access logs
- **Reliability**: Uptime, error rates

### Alert Thresholds
- **Critical**: Tests failing, Guardian unhealthy
- **High**: Performance degradation >20%
- **Medium**: Security warnings, dependency updates
- **Low**: Documentation updates, minor improvements

### Response Times
- **Critical**: Immediate (0-5 minutes)
- **High**: 15 minutes
- **Medium**: 1 hour
- **Low**: 4 hours
