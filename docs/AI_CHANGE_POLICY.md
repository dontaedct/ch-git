# AI Change Policy

## Overview
This document codifies "how AI is allowed to change this repo" and establishes the required artifacts and safety measures for any AI-generated changes.

## Universal Header Compliance
- **File**: `docs/AI_CHANGE_POLICY.md`
- **Purpose**: Codify AI change permissions and requirements
- **Status**: Universal header compliant

## Forbidden Surfaces

### Absolute No-Go Zones
AI is **NEVER** allowed to modify:

1. **Scripts & CI**
   - `scripts/` directory (build, deployment, CI scripts)
   - `.github/workflows/` (GitHub Actions)
   - `package.json` scripts section
   - Build configuration files

2. **Database & Migrations**
   - `supabase/migrations/` (schema changes)
   - Database connection strings
   - RLS policies without explicit approval

3. **Secrets & Environment**
   - `.env*` files
   - API keys, tokens, passwords
   - Service account credentials
   - Environment variable definitions

4. **Security & Authentication**
   - `middleware.ts` (auth logic)
   - `lib/auth/` (authentication flows)
   - RLS policies in database
   - Session management

5. **Infrastructure**
   - `vercel.json`
   - `next.config.ts`
   - `tailwind.config.js`
   - Deployment configurations

## Required Artifacts for AI PRs

### 1. Change Plan Document
Every AI PR must include a plan document with:

```markdown
## Change Plan

**Objective**: [Clear statement of what this change accomplishes]
**Scope**: [What files/components are affected]
**Risk Assessment**: [Low/Medium/High with justification]
**Testing Strategy**: [How changes will be validated]
**Rollback Plan**: [How to undo if needed]
```

### 2. Diff Analysis
- **Before/After**: Clear before/after state documentation
- **Impact Assessment**: List of affected components
- **Breaking Changes**: Any API or interface changes
- **Migration Steps**: Required actions for existing data/users

### 3. Safety Checks
- **npm run doctor**: Must pass with no critical issues
- **npm run ci**: All tests must pass
- **Linting**: No new linting errors
- **Type Safety**: No new TypeScript errors
- **Bundle Analysis**: No significant size increases

### 4. Rollback Strategy
- **Quick Rollback**: Steps to revert in <5 minutes
- **Data Preservation**: How to preserve user data during rollback
- **Service Impact**: Expected downtime during rollback

## PR Template Requirements

### Mandatory Checkboxes
```markdown
## AI Change Compliance Checklist

- [ ] **Change Plan**: Complete plan document attached
- [ ] **Safety Checks**: `npm run doctor && npm run ci` both pass
- [ ] **No Forbidden Surfaces**: No scripts/CI/migrations/secrets touched
- [ ] **Registry Updates**: If touching registries, CHANGE_JOURNAL.md updated
- [ ] **Import Compliance**: Only @app/* @data/* @lib/* @ui/* @registry/* @compat/*
- [ ] **Rename Scripts**: Used npm run rename:* if applicable
- [ ] **Rollback Plan**: Documented rollback procedure
- [ ] **Testing**: Changes tested in development environment
- [ ] **Documentation**: Updated relevant documentation
- [ ] **Security Review**: No RLS/auth weakening, no secret exposure
```

### Required Sections
1. **Summary**: One-line description of change
2. **Change Plan**: Link to detailed plan document
3. **Testing**: What was tested and how
4. **Rollback**: Step-by-step rollback procedure
5. **Impact**: Who/what is affected by this change

## Change Approval Process

### Automatic Approval (Low Risk)
- Documentation updates
- UI component styling changes
- Test additions/modifications
- Non-breaking API enhancements

### Manual Review Required (Medium Risk)
- New API endpoints
- Database schema changes
- Authentication flow modifications
- Performance optimizations

### Senior Review Required (High Risk)
- Security-related changes
- Breaking API changes
- Infrastructure modifications
- Database migrations

## Safety Enforcement

### Pre-commit Hooks
- `npm run doctor` validation
- `npm run ci` test execution
- Linting and type checking
- Import path validation

### Post-commit Verification
- Automated testing in CI/CD
- Security scanning
- Performance regression detection
- Dependency vulnerability checks

## Incident Response

### Change Rollback
1. **Immediate**: Revert commit if critical issue detected
2. **Investigation**: Document what went wrong
3. **Root Cause**: Identify why safety checks failed
4. **Prevention**: Update policy to prevent recurrence

### Policy Violations
1. **Detection**: Automated tools flag violations
2. **Blocking**: PR blocked until compliance achieved
3. **Review**: Manual review of policy violation
4. **Documentation**: Update policy based on findings

## Continuous Improvement

### Policy Updates
- Review policy quarterly
- Update based on incident learnings
- Incorporate new safety tools
- Refine approval thresholds

### Tool Integration
- Automated compliance checking
- Risk scoring algorithms
- Change impact prediction
- Rollback automation

## Compliance Monitoring

### Metrics
- Policy violation rate
- Change success rate
- Rollback frequency
- Time to compliance

### Reporting
- Monthly compliance reports
- Quarterly policy review
- Annual risk assessment
- Incident trend analysis

## Contact & Escalation

### Policy Questions
- **Primary**: Repository maintainers
- **Escalation**: Security team
- **Emergency**: DevOps on-call

### Compliance Issues
- **Immediate**: Block PR, notify maintainers
- **Investigation**: 24-hour response time
- **Resolution**: 48-hour fix timeline
- **Documentation**: Update policy as needed
