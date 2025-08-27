# CoachHub Prune Surgery Plan
**Date**: 2025-08-27  
**Objective**: Remove all CoachHub/fitness domain content, preserve OSS Hero core  
**Branch**: `surgery/remove-coachhub-2025-08-27`  
**Tag**: `pre-coachhub-prune-2025-08-27`

## 1. INVENTORY

### File Tree Analysis (Top 2-3 levels)

#### [KEEP] - OSS Hero Core
```
├── app/
│   ├── layout.tsx [KEEP] - Generic layout
│   ├── page.tsx [KEEP] - Generic home
│   ├── error.tsx [KEEP] - Error boundary
│   ├── global-error.tsx [KEEP] - Global error boundary
│   ├── globals.tailwind.css [KEEP] - Global styles
│   ├── api/
│   │   ├── health/ [KEEP] - Health checks
│   │   ├── ping/ [KEEP] - Ping endpoint
│   │   ├── probe/ [KEEP] - System probe
│   │   ├── webhooks/ [KEEP] - Generic webhook handling
│   │   ├── guardian/ [KEEP] - Route protection
│   │   ├── n8n/ [KEEP] - Workflow automation
│   │   ├── admin/ [KEEP] - Admin endpoints
│   │   ├── ai/ [KEEP] - AI integration
│   │   └── v1/ [KEEP] - API versioning
│   ├── login/ [KEEP] - Generic auth
│   ├── intake/ [KEEP] - Generic questionnaire flow
│   ├── status/ [KEEP] - System status
│   └── operability/ [KEEP] - System operations
├── components/
│   ├── ui/ [KEEP] - Shared UI primitives
│   ├── header.tsx [KEEP] - Generic header
│   ├── theme-provider.tsx [KEEP] - Theme system
│   ├── auto-save-recovery.tsx [KEEP] - Auto-save system
│   ├── auto-save-status.tsx [KEEP] - Auto-save status
│   └── empty-states.tsx [KEEP] - Generic empty states
├── lib/ [KEEP] - Core utilities and configurations
├── hooks/ [KEEP] - Shared hooks
├── scripts/ [KEEP] - Build and dev tools
├── tests/ [KEEP] - Test infrastructure
├── docs/ [KEEP] - Documentation
├── design/ [KEEP] - Design system
├── middleware.ts [KEEP] - Request middleware
├── package.json [KEEP] - Dependencies
├── tsconfig.json [KEEP] - TypeScript config
├── next.config.ts [KEEP] - Next.js config
├── tailwind.config.js [KEEP] - Tailwind config
├── eslint.config.js [KEEP] - Linting config
└── supabase/ [KEEP] - Database migrations (core)
```

#### [REMOVE] - CoachHub/Fitness Domain
```
├── app/
│   ├── client-portal/ [REMOVE] - Fitness client portal
│   ├── clients/ [REMOVE] - Client management
│   ├── sessions/ [REMOVE] - Training sessions
│   ├── trainer-profile/ [REMOVE] - Trainer profiles
│   ├── progress/ [REMOVE] - Progress tracking
│   ├── weekly-plans/ [REMOVE] - Weekly workout plans
│   └── api/
│       ├── clients/ [REMOVE] - Client API
│       ├── sessions/ [REMOVE] - Sessions API
│       ├── checkins/ [REMOVE] - Check-in API
│       └── weekly-plans/ [REMOVE] - Weekly plans API
├── components/
│   ├── session-list.tsx [REMOVE] - Session listing
│   ├── session-form.tsx [REMOVE] - Session form
│   ├── progress-dashboard.tsx [REMOVE] - Progress charts
│   ├── guardian-dashboard.tsx [REMOVE] - Guardian dashboard
│   ├── rsvp-panel.tsx [REMOVE] - RSVP functionality
│   └── invite-panel.tsx [REMOVE] - Invite system
├── data/
│   ├── clients.ts [REMOVE] - Client data layer
│   ├── clients.repo.ts [REMOVE] - Client repository
│   ├── sessions.ts [REMOVE] - Session data layer
│   ├── checkins.repo.ts [REMOVE] - Check-in repository
│   ├── progress-metrics.repo.ts [REMOVE] - Progress repository
│   └── weekly-plans.repo.ts [REMOVE] - Weekly plans repository
└── supabase/migrations/
    ├── create_clients_table.sql [REMOVE] - Clients table
    ├── create_progress_metrics_table.sql [REMOVE] - Progress table
    ├── create_check_ins_table.sql [REMOVE] - Check-ins table
    ├── create_weekly_plan_rpc.sql [REMOVE] - Weekly plans RPC
    └── create_client_intake_rpc.sql [REMOVE] - Client intake RPC
```

#### [REFACTOR] - Mixed Domain Content
```
├── app/
│   └── intake/ [REFACTOR] - Remove fitness-specific fields
├── components/
│   └── intake-form.tsx [REFACTOR] - Remove fitness fields
└── supabase/migrations/
    └── 001_create_core_tables.sql [REFACTOR] - Remove fitness tables
```

### Database Schema Analysis

#### [REMOVE] - Fitness-Specific Tables
- `clients` - Client profiles linked to coaches
- `check_ins` - Daily client check-ins with fitness metrics
- `progress_metrics` - Weight, body fat, measurements
- `weekly_plans` - Weekly training plans
- `sessions` - Group/private training sessions
- `trainers` - Trainer profile information

#### [KEEP] - Generic Tables
- `auth.users` - Supabase auth users (generic)
- Any system tables for features, flags, etc.

### Routes Analysis

#### [REMOVE] - Fitness Routes
- `/client-portal/*` - Client portal pages
- `/clients/*` - Client management
- `/sessions/*` - Session management
- `/trainer-profile/*` - Trainer profiles
- `/progress/*` - Progress tracking
- `/weekly-plans/*` - Weekly plans
- `/api/clients/*` - Client API
- `/api/sessions/*` - Sessions API
- `/api/checkins/*` - Check-ins API
- `/api/weekly-plans/*` - Weekly plans API

#### [KEEP] - Generic Routes
- `/` - Home page
- `/login` - Authentication
- `/intake` - Generic questionnaire
- `/status` - System status
- `/operability` - System operations
- `/api/health` - Health checks
- `/api/ping` - Ping endpoint
- `/api/probe` - System probe
- `/api/webhooks/*` - Webhook handling
- `/api/guardian/*` - Route protection
- `/api/n8n/*` - Workflow automation
- `/api/admin/*` - Admin endpoints
- `/api/ai/*` - AI integration

### Environment Variables Analysis

#### [REMOVE] - Fitness-Specific
- `DEFAULT_COACH_ID` - Default coach assignment

#### [KEEP] - Generic
- `NODE_ENV` - Runtime environment
- `NEXT_PUBLIC_SUPABASE_URL` - Database URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `SUPABASE_DB_URL` - Database connection
- `RESEND_API_KEY` - Email service
- `RESEND_FROM` - Email sender
- `SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_SENTRY_DSN` - Client error tracking
- `STRIPE_SECRET_KEY` - Payment processing
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_WEBHOOK_SECRET` - Webhook verification
- `N8N_WEBHOOK_URL` - Workflow automation
- `SLACK_WEBHOOK_URL` - Notifications
- `GITHUB_TOKEN` - CI/CD
- `GITHUB_REPO` - Repository identification
- `NEXT_PUBLIC_DEBUG` - Debug mode
- `NEXT_PUBLIC_SAFE_MODE` - Safe mode
- `NEXT_PUBLIC_ENABLE_AI_LIVE` - AI live mode
- `CRON_SECRET` - Cron jobs
- `NEXT_PUBLIC_VERCEL_ENV` - Deployment environment
- `PORT` - Development port
- `AUTO` - Auto-fix mode
- `CI` - CI environment

### Package.json Dependencies Analysis

#### [KEEP] - Generic Dependencies
All current dependencies appear to be generic and reusable:
- Next.js, React, TypeScript
- Supabase client
- UI libraries (Radix UI, Tailwind)
- Form handling (react-hook-form)
- Validation (zod)
- Email (resend)
- Charts (recharts) - Could be used for generic analytics
- Testing (Jest, Playwright)
- Development tools

## 2. SEARCH MATRIX

### Banned Tokens (Post-surgery must be zero hits)
```bash
# CoachHub branding
CoachHub|coach-hub|coach_hub|Coach Hub

# Fitness domain entities
trainer(s)?\b
client(s)?\b
session(s)?\b
workout|meal|progress|check-?in|macro(s)?|reps?|sets?

# Fitness actions
book(ing)?[-_ ]?session(s)?

# Fitness-specific components/routes
TrainerDashboard|ClientPortal|ProgressChart|BookSession
```

### Search Patterns for Grep/Ripgrep
```bash
# File content searches
grep -r "CoachHub\|coach-hub\|coach_hub\|Coach Hub" .
grep -r "trainer\|client\|session\|workout\|meal\|progress\|check-in\|macro\|reps\|sets" .
grep -r "book.*session\|booking.*session" .

# File path searches
find . -name "*trainer*" -o -name "*client*" -o -name "*session*" -o -name "*progress*" -o -name "*workout*" -o -name "*meal*"

# Import path searches
grep -r "from.*trainer\|from.*client\|from.*session\|from.*progress" .
grep -r "import.*trainer\|import.*client\|import.*session\|import.*progress" .
```

## 3. DEPENDENCY GRAPH

### Fitness-Only Dependencies
- **None identified** - All current dependencies are generic and reusable

### Shared Dependencies (Keep)
- **recharts** - Used for progress charts, but could be used for generic analytics
- **react-day-picker** - Used for session booking, but could be used for generic date picking
- **All other dependencies** - Generic and reusable

## 4. RISK REGISTER

### High Risk
- **Auth coupling**: `DEFAULT_COACH_ID` env var and coach_id references in database
- **Database foreign keys**: All fitness tables reference `auth.users` via `coach_id`
- **Shared layout assumptions**: Layout may assume fitness context

### Medium Risk
- **Import paths**: Components may import fitness-specific modules
- **Type definitions**: TypeScript types may reference fitness entities
- **API routes**: Generic routes may depend on fitness data

### Low Risk
- **UI components**: Most UI components are generic
- **Utilities**: Most utilities are domain-agnostic
- **Configuration**: Most config is generic

## 5. CUT LIST & PLAN

### Phase 1: Code Removal (Safest Order)
1. **Remove fitness pages/routes**
   - Delete `/app/client-portal/`
   - Delete `/app/clients/`
   - Delete `/app/sessions/`
   - Delete `/app/trainer-profile/`
   - Delete `/app/progress/`
   - Delete `/app/weekly-plans/`

2. **Remove fitness API routes**
   - Delete `/app/api/clients/`
   - Delete `/app/api/sessions/`
   - Delete `/app/api/checkins/`
   - Delete `/app/api/weekly-plans/`

3. **Remove fitness components**
   - Delete `components/session-list.tsx`
   - Delete `components/session-form.tsx`
   - Delete `components/progress-dashboard.tsx`
   - Delete `components/guardian-dashboard.tsx`
   - Delete `components/rsvp-panel.tsx`
   - Delete `components/invite-panel.tsx`

4. **Remove fitness data layer**
   - Delete `data/clients.ts`
   - Delete `data/clients.repo.ts`
   - Delete `data/sessions.ts`
   - Delete `data/checkins.repo.ts`
   - Delete `data/progress-metrics.repo.ts`
   - Delete `data/weekly-plans.repo.ts`

### Phase 2: Database Pruning
1. **Create migration to drop fitness tables**
   - Drop `clients` table
   - Drop `check_ins` table
   - Drop `progress_metrics` table
   - Drop `weekly_plans` table
   - Drop `sessions` table
   - Drop `trainers` table

2. **Remove fitness migrations**
   - Delete `create_clients_table.sql`
   - Delete `create_progress_metrics_table.sql`
   - Delete `create_check_ins_table.sql`
   - Delete `create_weekly_plan_rpc.sql`
   - Delete `create_client_intake_rpc.sql`

### Phase 3: Configuration Cleanup
1. **Remove fitness env vars**
   - Remove `DEFAULT_COACH_ID` from env.example

2. **Update core migration**
   - Remove fitness tables from `001_create_core_tables.sql`

3. **Refactor intake form**
   - Remove fitness-specific fields from `components/intake-form.tsx`
   - Update `app/intake/` to be generic

### Phase 4: Verification
1. **Run build checks**
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`

2. **Run forbidden token scan**
   - Verify zero hits for banned tokens

3. **Run smoke tests**
   - Verify core template boots
   - Verify basic routes respond

## 6. ROLLBACK STRATEGY

### Branch Strategy
- **Working branch**: `surgery/remove-coachhub-2025-08-27`
- **Pre-surgery tag**: `pre-coachhub-prune-2025-08-27`
- **Backup location**: `/backup/coachhub-<timestamp>/`

### Rollback Commands
```bash
# If surgery fails, rollback to pre-surgery state
git checkout pre-coachhub-prune-2025-08-27
git checkout -b surgery/rollback-2025-08-27
git push origin surgery/rollback-2025-08-27

# Restore from backup if needed
cp -r backup/coachhub-<timestamp>/* .
```

## 7. DELIVERABLES CHECKLIST

- [ ] **PLAN.md** (this document, updated)
- [ ] **/scripts/prune_coachhub.ts** (automated removal script)
- [ ] **/tests/smoke/** (basic smoke tests)
- [ ] **Clean build** (lint + typecheck + build pass)
- [ ] **Zero banned tokens** (grep scan returns no results)
- [ ] **PR created** (with summary/test plan/rollback)

## 8. NEXT STEPS

1. Create working branch: `surgery/remove-coachhub-2025-08-27`
2. Create pre-surgery tag: `pre-coachhub-prune-2025-08-27`
3. Generate `/scripts/prune_coachhub.ts` automation script
4. Execute Phase 1-4 removal plan
5. Verify all acceptance criteria
6. Create PR with comprehensive summary
