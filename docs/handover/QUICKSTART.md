# Project Quickstart

This guide helps new engineers and operators get productive in minutes.

## Prerequisites
- Node.js 18+
- npm 9+
- Supabase project (URL, anon key, service role key)

## Setup
1) Clone and install
```
npm install
```
2) Configure environment
```
cp env.example .env.local
# Edit .env.local with your Supabase credentials
```
3) Run dev server
```
npm run dev
# Open http://localhost:3000
```

## First Checks
- Visit Diagnostics: http://localhost:3000/operability/diagnostics
- Toggle a feature flag (if needed): http://localhost:3000/operability/flags
- Call diagnostics API: http://localhost:3000/api/admin/diagnostics?mode=summary

## Useful Scripts
```
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run test        # Unit tests
npm run test:smoke  # E2E/Smoke (Playwright)
npm run ci          # All of the above
```

## Background Job (Weekly Recap)
1) Set `CRON_SECRET` in `.env.local`
2) Trigger locally:
```
curl -X POST -H "x-cron-secret: $CRON_SECRET" http://localhost:3000/api/weekly-recap
```

## Common Paths
- Diagnostics UI: `/operability/diagnostics`
- Flags UI: `/operability/flags`
- Diagnostics API: `/api/admin/diagnostics`
- Weekly Recap API: `/api/weekly-recap`

## Next Steps
- Read docs/ops/env.md for environment details
- Review docs/GUARDIAN_README.md for route protection & safety
- Skim TEMPLATE_README.md for broader template capabilities

