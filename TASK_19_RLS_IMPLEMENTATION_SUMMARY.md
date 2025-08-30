# Task 19: Supabase RLS Policies + Tests

Goal: Validate tenant data isolation using Supabase Row-Level Security. Added Jest-based RLS tests that run against a configured Supabase project.

What I added
- Tests: `tests/rls/rls.policies.test.ts` covering:
  - feature_flags: isolation by `tenant_id` (auth.uid())
  - client_app_overrides: isolation by linked `clients` row
  - clients: prevent self role-escalation via WITH CHECK
  - audit_log and consent_records: users read only their own records

How tests work
- Uses service role to create two test users and seed rows (bypasses RLS for setup only).
- Signs in as each user to exercise SELECT/UPDATE paths under RLS.
- Skips automatically unless these env vars are set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

Notes and gaps
- Core tables (check_ins, weekly_plans, sessions, trainers, progress_metrics) have RLS enabled in `supabase/migrations/001_create_core_tables.sql` but policies are not defined there yet. Add explicit policies when those tables are created to extend coverage.
- Current `clients` policies rely on email matching. Consider migrating to `auth.uid()` foreign keys to be resilient to email changes.

Run locally
- Ensure the three Supabase env vars are set (see `env.example`).
- Run: `npm run tool:test:rls`

Artifacts reviewed
- Policies in migrations:
  - `supabase/migrations/20250828_create_clients_table.sql`
  - `supabase/migrations/20250828_add_user_roles.sql`
  - `supabase/migrations/20250828_create_client_app_overrides.sql`
  - `supabase/migrations/20250825_feature_flags.sql`
  - `supabase/migrations/20250127_audit_log_privacy.sql`

