# Policy-as-Code with OPA/Rego

This directory contains Open Policy Agent (OPA) policies written in Rego that enforce safety rules and compliance requirements for the codebase.

## Overview

The Policy-as-Code system provides:
- **Hard safety rules** encoded as versioned policies
- **Automated enforcement** through the OPA runner
- **Risk scoring** for changes based on multiple factors
- **Integration** with Sentinel and other CI/CD systems

## Policies

### 1. `db_contract.rego` - Database Contract Enforcement
**Risk Score: +4**

Blocks dangerous schema changes (DROP, RENAME, TYPE-tightening) unless:
- PR has `expand-contract` label OR branch contains `expand-contract/`
- SQL files contain `#expand` and `#contract` markers
- Change is in the expand phase

**Example blocked change:**
```sql
DROP TABLE users;  -- ❌ BLOCKED without proper marking
```

**Example allowed change:**
```sql
-- #expand
-- #contract
DROP TABLE users;  -- ✅ ALLOWED with proper marking
```

### 2. `feature_flags.rego` - Feature Flag Enforcement
**Risk Score: +1**

Blocks new/modified routes under `/app` without feature flag wrappers:
- Must use `FeatureGate` component
- Must use `isEnabled('flag')` wrapper
- Must implement conditional rendering

**Example blocked route:**
```tsx
export default function NewPage() {  // ❌ BLOCKED
  return <div>New Feature</div>;
}
```

**Example allowed route:**
```tsx
export default function NewPage() {  // ✅ ALLOWED
  return (
    <FeatureGate flag="new-feature">
      <div>New Feature</div>
    </FeatureGate>
  );
}
```

### 3. `owners.rego` - Code Ownership Enforcement
**Risk Score: +3**

Blocks changes to sensitive paths without proper ownership:
- `/db/migrations` - Database schema changes
- `/app/(core)` - Core application logic
- `/lib/supabase` - Database client code
- `/scripts` - System automation scripts

**Requirements:**
- CODEOWNERS file coverage
- Required reviewer approval
- Authorized user changes
- Emergency mode override

### 4. `risk_score.rego` - Risk Assessment
**Risk Score: Additive**

Computes overall risk based on multiple factors:
- Schema contraction: +4
- Environment changes: +3
- Major dependency bumps: +3
- Cross-module changes: +2
- New routes: +1

**Risk Levels:**
- **LOW**: 0-2 (Standard review)
- **MEDIUM**: 3-6 (Additional review)
- **HIGH**: 7-9 (Staging deployment)
- **CRITICAL**: 10+ (Senior review + maintenance window)

## Usage

### Running Policies

```bash
# Evaluate policies with JSON input
echo '{"changes": [], "changed_files": []}' | npm run opa:run

# Evaluate policies from file
npm run opa:run -- --file policies/__fixtures__/sample_input.json
```

### Testing Policies

```bash
# Run all policy tests
npm run test:policies

# Run specific test
npm run opa:test
```

### Integration with Sentinel

The OPA runner is designed to integrate seamlessly with Sentinel:

```typescript
import { OPARunner } from './scripts/run-opa';

const runner = new OPARunner();
const decision = await runner.evaluatePolicies(input);

if (!decision.allow) {
  console.error('Policy violations:', decision.reasons);
  console.error('Suggested fixes:', decision.suggestedFixes);
  process.exit(1);
}
```

## Input Schema

The policies expect input in this format:

```json
{
  "changes": [
    {
      "operation": "CREATE|DROP|RENAME|ALTER_TYPE",
      "table": "table_name",
      "sql_content": "SQL statement",
      "risk_level": "tightening|expansion"
    }
  ],
  "changed_files": [
    {
      "path": "file/path.tsx",
      "status": "added|modified|deleted",
      "content": "file contents"
    }
  ],
  "pr": {
    "labels": ["label1", "label2"]
  },
  "branch": "branch-name",
  "author": "username",
  "codeowners": [
    {
      "path": "path/pattern",
      "owners": ["owner1", "owner2"]
    }
  ],
  "required_reviewers": [
    {
      "name": "reviewer",
      "approved": true
    }
  ],
  "authorized_users": ["user1", "user2"],
  "emergency_mode": false,
  "dependency_changes": [
    {
      "name": "package",
      "old_version": "1.0.0",
      "new_version": "2.0.0",
      "change_type": "major|minor|patch"
    }
  ]
}
```

## Output Schema

The policies return decisions in this format:

```json
{
  "allow": true,
  "reasons": ["Reason 1", "Reason 2"],
  "suggestedFixes": ["Fix 1", "Fix 2"],
  "riskScore": 5,
  "policyResults": {
    "db_contract": {
      "allow": true,
      "deny": [],
      "riskScore": 0
    },
    "feature_flags": {
      "allow": false,
      "deny": ["Missing feature flag wrapper"],
      "riskScore": 1
    }
  }
}
```

## Installation

### OPA Installation

The runner automatically installs OPA on Linux/macOS:

```bash
# Manual installation
curl -L -o opa https://openpolicyagent.org/downloads/latest/opa_linux_amd64
chmod +x opa
sudo mv opa /usr/local/bin/
```

### Windows

On Windows, the runner falls back to WASM bundle or provides clear installation instructions.

## Development

### Adding New Policies

1. Create `policies/new_policy.rego`
2. Add test fixtures in `policies/__fixtures__/`
3. Update `scripts/run-opa.ts` to include the new policy
4. Add tests and validate behavior

### Policy Structure

```rego
package new_policy

import future.keywords.if
import future.keywords.in

# Default allow - only deny if explicitly blocked
default allow = true

# Define deny conditions
deny[msg] {
    # Policy logic here
    msg := "Policy violation message"
}

# Provide risk score
risk_score = 5
```

### Testing

```bash
# Create test fixture
echo '{"input": {...}, "expected": {...}}' > policies/__fixtures__/new_policy_test.json

# Run tests
npm run test:policies
```

## Troubleshooting

### Common Issues

1. **OPA not found**: Install OPA manually or check PATH
2. **Policy syntax errors**: Validate Rego syntax with `opa check policies/*.rego`
3. **Test failures**: Check fixture format and expected outputs

### Debug Mode

```bash
# Enable verbose logging
DEBUG=1 npm run opa:run < input.json
```

## Security Notes

- Policies are versioned and auditable
- No secrets or keys are exposed
- RLS policies are never weakened
- Emergency overrides require explicit flags

## Contributing

When modifying policies:
1. Update tests to cover new scenarios
2. Document policy changes
3. Ensure backward compatibility
4. Test with real-world inputs
