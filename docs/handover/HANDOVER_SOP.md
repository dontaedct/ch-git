# Handover SOP (Standard Operating Procedure)

Purpose: Provide a clear, reliable runbook for operations, support, and on-call engineers to manage, monitor, and recover this micro‑app in all environments.

## Contacts & Ownership
- Owner: <TEAM/OWNER NAME>
- Escalation: <ON‑CALL ROTATION OR CHANNEL>
- Issue tracker: <LINK TO PROJECT BOARD>

## Environments
- Local: http://localhost:3000
- Staging: <STAGING_URL>
- Production: <PRODUCTION_URL>

## Access & Roles
- Admin UI: `/operability/diagnostics`, `/operability/flags`
- API (admin): `/api/admin/diagnostics`, `/api/weekly-recap`
- RBAC: Admin/Staff roles managed in Supabase (see “RBAC Management” below)

## Daily Ops Checklist
- Diagnostics: visit `/operability/diagnostics` (Summary → Detailed). Verify status: OK/Warning/Critical.
- Errors: check logs and recent error rate (Sentry if enabled; otherwise application logs).
- Queues/Jobs: verify weekly recap endpoint health and recent job logs.
- Flags/Tiers: review feature flags at `/operability/flags` for unexpected changes.

## Weekly Ops Checklist
- Review performance at `/operability/diagnostics?mode=full`.
- Verify backups/export procedures (DB snapshot or Supabase backups).
- Trigger/validate the weekly recap job (see Background Jobs).

## Health & Diagnostics
- UI: `GET /operability/diagnostics`
- API: `GET /api/admin/diagnostics?mode=summary|detailed|full`
- What to check:
  - Environment: Required variables present and valid (env doctor embedded in diagnostics).
  - Performance: recent server timings and request latency.
  - Benchmarks: basic server actions speed.
  - Status: overall health: ok/warning/critical with notes.

## Background Jobs (Weekly Digest)
- Endpoint: `POST /api/weekly-recap` with header `x-cron-secret: <CRON_SECRET>`
- Configure env var: `CRON_SECRET` (server only; set in Vercel/host and `.env.local` for local testing).
- Dry‑run (local):
  1) Ensure `CRON_SECRET` is set.
  2) `curl -X POST -H "x-cron-secret: $CRON_SECRET" http://localhost:3000/api/weekly-recap`
  3) Check response JSON and logs.
- Notes:
  - Job respects tiering; Pro+ only recipients get emails.
  - Missing recipients or tier causes safe no‑op with warnings in logs.

## RBAC Management (Admin/Staff)
- Roles are stored in Supabase; ensure policies and role fields are present per migrations.
- To promote a user to Admin:
  1) Create/login the user via normal auth.
  2) In Supabase, set role field to `admin` for that user (or use admin panel/tooling if present).
  3) Confirm access by visiting `/operability/diagnostics`.
- Staff users should have limited access; verify guards via app navigation.

## Incident Response (P0/P1)
1) Check diagnostics: `/operability/diagnostics` → if Critical, open Detailed/Full.
2) Review server logs for error code patterns (rate‑limit, auth, upstream).
3) Validate environment: ensure all required env vars exist and are sane.
4) If only admin APIs failing, hit `GET /api/admin/diagnostics?mode=summary` to isolate.
5) If job failures, re‑run weekly recap with `x-cron-secret` to reproduce.
6) Communicate status in the incident channel; capture timeline.

## Recovery Procedures
- Auto‑save: The app supports intelligent form auto‑save and recovery. If users report lost data:
  1) Identify the affected form/page.
  2) Have the user revisit the same page logged into the same account.
  3) Data should repopulate from storage; confirm via diagnostics logs.
- Database:
  - Staging: reset/restore from latest snapshot if needed.
  - Production: follow Supabase backup restore process (point‑in‑time if enabled). Announce maintenance windows.

## Deployments
- Local: `npm install && npm run dev`
- CI: `npm run ci` (lint, typecheck, tests)
- Prod: Vercel (recommended). Configure env vars in dashboard; verify post‑deploy diagnostics.

## Security Controls
- Security headers and rate‑limiting active for admin and sensitive routes.
- Secrets: Never expose `SUPABASE_SERVICE_ROLE_KEY` or `CRON_SECRET` to client.
- Webhooks: ensure HMAC verification when adding new webhooks (see docs/webhooks/).

## Useful Links
- Diagnostics UI: `http(s)://<host>/operability/diagnostics`
- Flags UI: `http(s)://<host>/operability/flags`
- Diagnostics API: `http(s)://<host>/api/admin/diagnostics?mode=summary`
- Weekly Recap API: `http(s)://<host>/api/weekly-recap`
- Env & Doctor: `docs/ops/env.md`, `docs/DOCTOR_SCRIPTS.md`, `docs/GUARDIAN_README.md`

