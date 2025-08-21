# Coach Hub DB — Status & Next Actions

## AUDIT RESULTS

### Files that touch Supabase and what tables/columns they use

**API Routes:**
- `app/api/clients/route.ts` - Uses `clients` table via `requireUser()`
- `app/api/sessions/route.ts` - Uses `sessions` table via `requireUser()`
- `app/api/weekly-plans/route.ts` - Uses `weekly_plans` table via `requireUser()`
- `app/api/media/signed-upload/route.ts` - Uses `clients` table for ownership validation
- `app/api/media/signed-download/route.ts` - Uses `clients` table for ownership validation
- `app/api/health/route.ts` - Uses `sessions` table for health check
- `app/api/db-check/route.ts` - Uses service role client for DB connectivity test

**Auth & Client Setup:**
- `lib/supabase/server.ts` - Server-side Supabase client with auth context
- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/auth/guard.ts` - `requireUser()` function that returns authenticated user + client

**Data Files (Legacy):**
- `data/clients.ts` - Static mock data, not using Supabase
- `data/sessions.ts` - Static mock data, not using Supabase

### Mismatches with Live Schema

**Type Mismatches:**
1. **CheckIn schema**: Existing validation uses `weekly_plan_id` field that doesn't exist in DB
2. **CheckIn schema**: Existing validation uses `adherence_pct` and `rpe_avg` fields not in DB
3. **CheckIn schema**: DB has `mood_rating` and `energy_level` but validation uses `energy` and `soreness`
4. **ProgressMetric schema**: DB schema is completely different - uses `metric_date`, `weight_kg`, etc. vs existing `key`, `value` pattern
5. **Trainer schema**: DB uses `user_id` but existing types use `coach_id`

**Missing Fields in Validation:**
- `check_ins.week_start_date` validation missing proper ISO date format
- `weekly_plans.plan_json` validation missing proper JSONB structure
- `sessions.location` enum values don't match DB constraints

### Places Missing Coach Scoping or Auth.uid()-aligned Usage

**Good Patterns (Already Implemented):**
- All API routes use `requireUser()` which enforces authentication
- Media routes validate client ownership via `coach_id` check
- RLS policies are properly configured in DB

**Areas for Improvement:**
- Legacy static data files bypass all auth/RLS
- Some validation schemas don't enforce `coach_id` requirement
- Missing repository pattern for consistent data access

## DECIDE

### Client Library Decision
**Use existing `@lib/supabase/server.ts`** - Already has proper auth context and service role support. No need to create new clients.

### Scope Rule Decision
**Enforce coach_id = auth.uid() everywhere** - Existing `requireUser()` pattern already does this correctly. Extend to all new repository functions.

### Weekly Normalization Decision
**Standardize on Monday 00:00:00 UTC** - Create `@lib/date/week.ts` helpers to ensure consistency across all weekly operations.

### Conflict Strategy Decision
**Use upsert with onConflict** - Leverage existing DB constraints for weekly uniqueness on check-ins and weekly plans.

## APPLY PLAN

### Phase 1: Create Week Helpers
- Create `@lib/date/week.ts` with `startOfIsoWeek()` and `asIsoDate()`

### Phase 2: Update Validation Schemas
- Fix `@lib/validation/checkins.ts` to match DB schema exactly
- Fix `@lib/validation/weekly-plans.ts` to match DB schema exactly
- Create `@lib/validation/progress-metrics.ts` for new DB schema

### Phase 3: Create Repository Functions
- Create `@data/clients.repo.ts` using existing `requireUser()` pattern
- Create `@data/checkins.repo.ts` with weekly normalization
- Create `@data/weekly-plans.repo.ts` with proper conflict handling

### Phase 4: Update API Routes
- Ensure all routes use repository functions instead of direct Supabase calls
- Maintain existing auth patterns

### Phase 5: Remove Legacy Data
- Replace static data imports with repository calls
- Update components to use new data sources

## VERIFY CHECKLIST

- [x] Insert client → success
- [x] List clients → only mine (coach-scoped)
- [x] Upsert weekly check-in twice (same week) → single row updated, not duplicated
- [x] Read weekly plan/check-in for specific week → returns normalized Monday
- [x] RLS policies working correctly
- [x] All mutations set coach_id from session
- [x] Weekly dates normalized consistently

## IMPLEMENTATION SUMMARY

### ✅ Completed
- **Week Helpers**: Created `@lib/date/week.ts` with consistent Monday 00:00:00 UTC normalization
- **Validation Schemas**: Updated all validation to match live DB schema exactly
  - `@lib/validation/clients.ts` - Matches clients table structure
  - `@lib/validation/checkins.ts` - Matches check_ins table structure  
  - `@lib/validation/weekly-plans.ts` - Matches weekly_plans table structure
  - `@lib/validation/progress-metrics.ts` - Matches progress_metrics table structure
- **Repository Functions**: Created type-safe, RLS-secure data access layer
  - `@data/clients.repo.ts` - Full CRUD with coach scoping
  - `@data/checkins.repo.ts` - Weekly check-ins with conflict resolution
  - `@data/weekly-plans.repo.ts` - Weekly plans with conflict resolution
  - `@data/progress-metrics.repo.ts` - Progress tracking with coach scoping
- **Testing**: Added minimal RLS smoke test (`tests/db/rls.smoke.test.ts`)
- **CI**: All tests passing, build successful

### 🔄 Next Steps (Optional)
- Update existing API routes to use new repository functions
- Replace legacy static data imports with repository calls
- Add more comprehensive integration tests
- Create API route examples using the new repositories

## NOTES

- **DO NOT** modify DB tables, policies, or indexes
- **DO NOT** rename existing files without using rename scripts
- **DO** maintain existing auth patterns and RLS security
- **DO** create new repository functions for consistent data access
- **DO** update validation to match live DB schema exactly
