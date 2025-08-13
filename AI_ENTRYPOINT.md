# AI Entrypoint — Coach Hub

## 🚨 MANDATORY CHECKLIST (10 lines)

1. ✅ Read & obey: `/docs/COACH_HUB.md` and `/docs/AI_RULES.md` and `/docs/RENAMES.md`
2. ✅ Never rename/move directly; use ONLY rename scripts (npm run rename:*)
3. ✅ Imports must use ONLY: `@app/*` `@data/*` `@lib/*` `@ui/*` `@registry/*` `@compat/*`
4. ✅ Process: AUDIT → DECIDE (state reasons) → APPLY minimal diffs → VERIFY
5. ✅ Run `npm run doctor && npm run ci` and fix-forward until green; do not commit if red
6. ✅ If touching `src/registry/*`, append entry to `/docs/CHANGE_JOURNAL.md` in SAME commit
7. ✅ Security: Never weaken RLS or expose secrets/keys/env
8. ✅ Reports: Only if findings > 10 or multi-area; keep ≤200 lines under `/reports/`
9. ✅ Task intake: Extract Objective, Constraints, Scope (in/out), Deliverables, DoD
10. ✅ If info missing, proceed with explicit assumptions and make minimal diffs

## 🚀 Quick Commands for Common Tasks

### Create New Page/Route
```bash
# Add to registry first, then create page
npm run rename:route -- newRouteKey
# Create: app/new-route/page.tsx
# Update: lib/registry/routes.ts
```

### Add Email Template
```bash
# Add to email registry
# Update: lib/registry/emails.ts
# Create: lib/registry/emails/new-template.ts
# Append: docs/CHANGE_JOURNAL.md
```

### Create Session Component
```bash
# Use existing patterns from components/session-*.tsx
# Import from: @ui/* @lib/* @data/*
# Test with: npm run doctor && npm run ci
```

### Database Changes
```bash
# Update table registry
npm run rename:table -- old_table new_table
# Update: lib/registry/tables.ts
# Create: supabase/migrations/*.sql
# Append: docs/CHANGE_JOURNAL.md
```

### Component Library
```bash
# Add to: components/ui/*.tsx
# Import from: @ui/*
# Test with: npm run doctor
```

## 🔒 Security Reminders

- RLS enforced everywhere: `coach_id = auth.uid()`
- Service role key only server-side for public intake
- Signed URLs for file access after ownership validation
- Never expose environment variables or secrets

## 📋 Before Every Commit

```bash
npm run doctor    # Fix any issues
npm run ci        # Ensure tests pass
# Only commit if both are green
```

## 🎯 Registry Locations

- **Routes**: `lib/registry/routes.ts`
- **Tables**: `lib/registry/tables.ts`
- **Emails**: `lib/registry/emails.ts`
- **Flags**: `lib/registry/flags.ts`

**Remember**: If you touch any registry, update `/docs/CHANGE_JOURNAL.md` in the same commit!
