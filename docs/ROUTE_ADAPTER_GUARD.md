# Route & Adapter Invariants Guard

## Overview

The Route & Adapter Invariants Guard is a GitHub Actions workflow step that prevents accidental coupling between UI changes and data layer modifications. It enforces the separation of concerns principle by ensuring UI-only PRs don't inadvertently modify protected areas.

## Purpose

- **Prevent Accidental Coupling**: Stop UI PRs from accidentally changing routes, adapters, or database layers
- **Enforce Separation of Concerns**: Keep UI changes isolated from data layer changes
- **Improve PR Quality**: Ensure focused, single-responsibility PRs
- **Reduce Review Complexity**: Separate technical concerns for easier code review

## How It Works

The guard runs automatically on all PRs that modify files under `components/ui/**`. It checks if the PR also modifies any of these protected areas:

### Protected Areas

1. **Route Segments** (`app/**`)
   - Page components, layouts, route handlers
   - API endpoints, middleware

2. **Adapters** (`app/adapters/**`)
   - Data transformation layers
   - External service integrations

3. **Database Layer** (`lib/db/**`)
   - Database models, repositories
   - Query builders, migrations

4. **Supabase Configuration** (`supabase/**`)
   - Database migrations
   - RLS policies, functions

5. **Supabase Client Layer** (`lib/supabase/**`)
   - Client configuration
   - Type definitions, RPC calls

## Guard Behavior

### ✅ Passes When
- **UI-only changes**: Only `components/ui/**` files are modified
- **Non-UI changes**: No UI components are touched (guard skips)

### ❌ Fails When
- **Mixed changes**: UI components + any protected area
- **Clear error message** with specific violations
- **Instructions** for fixing the issue

## Error Messages

When violations are detected, the guard provides:

```
❌ ROUTE & ADAPTER INVARIANTS VIOLATION DETECTED!

🚨 UI-only PRs cannot modify the following protected areas:
- Route segments (app/**)
- Adapters (app/adapters/**)

📋 To fix this:
1. Open a SEPARATE PR for the protected area changes
2. Keep this PR focused ONLY on UI components
3. Use proper rename scripts if needed:
   - npm run rename:route -- oldKey newKey
   - npm run rename:table -- old_table new_table

🔒 This guard prevents accidental coupling between UI and data layer changes.
```

## Usage Examples

### ✅ Valid UI-Only PR
```bash
# Only UI components changed
components/ui/button.tsx
components/ui/card.tsx
components/ui/form.tsx
```

### ❌ Invalid Mixed PR
```bash
# UI + Route changes (will fail)
components/ui/button.tsx
app/sessions/page.tsx  # ← Protected area!
```

### ❌ Invalid Mixed PR
```bash
# UI + Database changes (will fail)
components/ui/button.tsx
lib/db/sessions.ts     # ← Protected area!
```

## Fixing Violations

### Option 1: Split into Separate PRs (Recommended)
1. **UI PR**: Keep only `components/ui/**` changes
2. **Data PR**: Handle protected area changes separately
3. **Merge order**: Data PR first, then UI PR

### Option 2: Use Rename Scripts
If you need to rename routes or tables:

```bash
# For route changes
npm run rename:route -- oldKey newKey

# For table changes  
npm run rename:table -- old_table new_table
```

### Option 3: Remove UI Changes
If the UI changes are incidental, remove them and focus on the protected area changes.

## Configuration

The guard is configured in `.github/workflows/design-safety.yml`:

```yaml
- name: Route & Adapter Invariants Guard
  run: |
    # Guard logic implementation
    # Checks for UI changes and protected area violations
```

## Testing

Test the guard logic locally:

```bash
# Run the test suite
node scripts/test-route-guard.mjs

# Test specific scenarios
node -e "
import('./scripts/test-route-guard.mjs').then(m => {
  const result = m.simulateGitDiff([
    'components/ui/button.tsx',
    'app/sessions/page.tsx'
  ]);
  console.log(result);
});
"
```

## Benefits

1. **Architecture Integrity**: Maintains clean separation between UI and data layers
2. **Code Review Efficiency**: Focused PRs are easier to review and approve
3. **Risk Reduction**: Prevents accidental breaking changes to data layer
4. **Team Coordination**: Clear boundaries for different types of changes
5. **CI/CD Safety**: Automated enforcement of architectural principles

## Related Documentation

- [Universal Header](../UNIVERSAL_HEADER.md) - Project conventions and rules
- [AI Rules](../docs/AI_RULES.md) - AI assistant guidelines
- [Renames](../docs/RENAMES.md) - Safe rename procedures
- [Design Guardian](../docs/DESIGN_GUARDIAN_IMPLEMENTATION_SUMMARY.md) - Overall design safety system

## Troubleshooting

### Guard Skipping Unexpectedly
- Ensure your PR actually modifies `components/ui/**` files
- Check that the workflow is triggered on the correct paths

### False Positives
- If the guard incorrectly blocks a valid change, review the protected area definitions
- Consider if the change actually violates separation of concerns

### Workflow Failures
- Check the GitHub Actions logs for detailed error messages
- Verify the guard script syntax and logic
