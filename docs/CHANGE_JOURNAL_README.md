# 🗂️ Sentinel Change Journal System

## Overview

The Sentinel Change Journal system provides comprehensive evidence logging for every decision made by the Sentinel gate. It creates an immutable audit trail that persists WHY changes were allowed/blocked and includes all supporting evidence (policies, tests, preview checks, DB shadow reports).

## Features

- **JSON Evidence Logs**: Machine-readable decision data with complete context
- **Markdown Summaries**: Human-readable summaries for PR comments and audits
- **CI Integration**: Automatic artifact uploads and environment variable extraction
- **PR Comment Bot**: Single, up-to-date comment summarizing gate decisions
- **Audit Trail**: Complete history of all Sentinel decisions with timestamps

## Architecture

```
.sentinel/
└── journal/
    ├── <commit-sha>.json    # Machine-readable evidence log
    └── <commit-sha>.md      # Human-readable summary
```

## Components

### 1. Sentinel Report Script (`scripts/sentinel-report.ts`)

The core script that generates Change Journal entries:

```bash
# From CI (automated)
node scripts/sentinel-report.ts

# Direct usage
node scripts/sentinel-report.ts --from-env
```

**Key Features:**
- Extracts decision data from environment variables
- Generates comprehensive evidence logs
- Creates both JSON and Markdown outputs
- Integrates with Git and CI context

### 2. CI Integration

All Sentinel workflows now automatically:
- Generate Change Journal entries
- Upload artifacts under `sentinel-artifacts`
- Include comprehensive evidence logging

**Workflows Updated:**
- `sentinel-db.yml` - Database migration safety checks
- `sentinel-preview.yml` - Preview deployment validation
- `sentinel-branch-guard.yml` - Main Sentinel check

### 3. PR Comment Bot

The system automatically creates/updates a single PR comment titled "🛡️ Sentinel Gate — Decision & Evidence" containing:
- Decision summary (ALLOW/FIX-APPLIED/BLOCK)
- Risk score and reasons
- Applied policies and risk factors
- Test results and artifacts
- Links to CI artifacts and workflow runs

## Evidence Collection

### Environment Variables

The system automatically extracts evidence from these CI environment variables:

```bash
# Decision Context
SENTINEL_DECISION          # JSON decision data (if available)
HAS_DB_MIGRATIONS         # Database changes detected
HAS_SECURITY_CHANGES      # Security-sensitive files modified
HAS_BREAKING_CHANGES      # Potential breaking changes

# Test Results
DB_SHADOW_REPORT          # Database shadow test results
PREVIEW_TEST_RESULTS      # Preview deployment test results
LINT_RESULTS             # Code quality check results

# CI Context
GITHUB_ACTOR             # User who triggered the workflow
GITHUB_REPOSITORY        # Repository name
GITHUB_RUN_ID           # Workflow run ID
PREVIEW_URL              # Preview deployment URL
```

### Risk Assessment

The system automatically calculates risk scores based on:
- Database schema changes (+3 points)
- Security-sensitive modifications (+4 points)
- Potential breaking changes (+2 points)
- Test failures (+2 points)
- Lint errors (+1 point)

**Risk Thresholds:**
- 0-4: **ALLOW** - Low risk, proceed normally
- 5-7: **FIX-APPLIED** - Medium risk, apply fixes then re-check
- 8-10: **BLOCK** - High risk, manual review required

## Usage Examples

### 1. Manual Decision Logging

```bash
# Set environment variables
export HAS_DB_MIGRATIONS=true
export HAS_SECURITY_CHANGES=false
export DB_SHADOW_REPORT="All migrations applied successfully"

# Generate journal entry
node scripts/sentinel-report.ts
```

### 2. CI Integration

The system automatically runs in all Sentinel workflows:

```yaml
- name: Generate Change Journal Entry
  env:
    HAS_DB_MIGRATIONS: 'true'
    DB_SHADOW_REPORT: ${{ steps.shadow-test.outputs.safe }}
  run: |
    node scripts/sentinel-report.ts
```

### 3. Artifact Upload

All workflows automatically upload Change Journal artifacts:

```yaml
- name: Upload Change Journal Artifacts
  uses: actions/upload-artifact@v4
  with:
    name: sentinel-artifacts
    path: |
      .sentinel/journal/
```

## Output Formats

### JSON Journal Entry

```json
{
  "decision": {
    "decision": "ALLOW",
    "reasons": ["Standard CI validation passed"],
    "riskScore": 2,
    "mode": "check",
    "timestamp": "2025-08-15T19:54:54.123Z"
  },
  "context": {
    "commitSha": "abc123def456",
    "branch": "feature/new-feature",
    "actor": "username",
    "timestamp": "2025-08-15T19:54:54.123Z"
  },
  "evidence": {
    "policies": ["Standard Policy: Low risk changes allowed"],
    "tests": {
      "dbShadowReport": "true",
      "previewTests": "All smoke tests passed successfully"
    },
    "riskFactors": ["No significant risk factors identified"]
  },
  "ci": {
    "workflowRunId": "1234567890",
    "environment": "production"
  }
}
```

### Markdown Summary

The Markdown output includes:
- Decision summary with emojis
- Risk score and context
- Decision reasons
- Applied policies
- Risk factors
- Test results
- CI information and artifacts
- Links to workflow runs

## Benefits

### 1. Instant Postmortems

Every decision is logged with complete context:
- What was changed
- Why it was allowed/blocked
- What tests were run
- What policies were applied
- Who made the decision
- When it happened

### 2. Comprehensive Auditing

Complete evidence trail for compliance:
- Policy compliance verification
- Risk assessment documentation
- Test result preservation
- Decision rationale preservation

### 3. Improved Collaboration

PR comments provide:
- Single source of truth for decisions
- Clear reasoning for all stakeholders
- Links to all relevant artifacts
- Historical decision context

### 4. Automated Compliance

CI integration ensures:
- No decisions are missed
- All evidence is automatically captured
- Artifacts are properly preserved
- Audit trail is complete

## Troubleshooting

### Common Issues

1. **Journal directory not created**
   - Ensure the script has write permissions
   - Check that `.sentinel/journal/` path is accessible

2. **Environment variables not detected**
   - Verify CI workflow environment variable setup
   - Check for typos in variable names

3. **Git context extraction failed**
   - Ensure running in a Git repository
   - Check Git command availability in CI environment

### Debug Mode

Enable verbose logging by setting:

```bash
export DEBUG_SENTINEL_JOURNAL=true
node scripts/sentinel-report.ts
```

## Future Enhancements

- **Web Dashboard**: Visual interface for browsing Change Journal entries
- **Analytics**: Risk trend analysis and decision pattern recognition
- **Integration**: Connect with external audit and compliance systems
- **Notifications**: Real-time alerts for high-risk decisions
- **Export**: Support for various compliance report formats

## Contributing

To extend the Change Journal system:

1. **Add new evidence types** in `scripts/sentinel-report.ts`
2. **Update CI workflows** to capture additional context
3. **Enhance risk scoring** algorithms
4. **Improve output formats** for better readability

## Support

For questions or issues with the Change Journal system:
- Check the CI workflow logs
- Review the generated journal files
- Consult the Sentinel system documentation
- Open an issue in the repository
