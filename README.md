# Coach Hub (Minimal)
- Routes: /sessions (authed), /intake (public)
- Supabase: Auth, Postgres (RLS by coach_id), Storage (bucket `media`)
- Emails: Resend (transactional only)
- Cron: /api/weekly-recap with ?secret=CRON_SECRET
- Env: see .env.local keys

## Setup
1. Copy `.env.example` to `.env` and configure your environment variables
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Dev
npm run dev

## Deploy
- Set env vars on Vercel
- Create Storage bucket `media`
- Add RLS policies ensuring coach_id = auth.uid() on tables
- Deploy Supabase RPC functions (see `supabase/README.md`)

## Architecture

### Database Operations
For any multi-table write sequence, we use Supabase RPC functions that execute atomically:

- **Intake Flow**: `create_client_intake()` handles client upsert + email logging
- **Weekly Plans**: `create_weekly_plan()` handles plan creation + task insertion
- **Sessions**: Future RPC functions for session creation + client invitations

This ensures data consistency and eliminates partial state failures.
