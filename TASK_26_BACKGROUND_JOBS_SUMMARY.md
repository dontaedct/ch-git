# Task 26: Background Jobs (Weekly Digest, Pro+)

## What was implemented

- Job runner utility with structured logging and timeouts.
- Weekly KPI Digest job that compiles tier/preset, enabled features, and environment health into an HTML summary.
- Secure API trigger at `/api/weekly-recap` that validates `CRON_SECRET`, supports `?ping=1` reachability checks, and `?dryRun=1` preview mode.
- Pro+ gating: Job executes only when `APP_TIER` is `pro` or `advanced`.

## Files changed

- `app/api/weekly-recap/route.ts`: Upgraded to run the weekly digest job with logging, error handling, ping/dry-run modes.
- `lib/jobs/runner.ts`: Minimal job framework with timeout and structured results.
- `lib/jobs/weekly-digest.ts`: Digest builder and sender using existing email service.
- `lib/env.ts`: Added optional `DIGEST_RECIPIENTS` to environment schema.

## Configuration

- `CRON_SECRET`: Required to authorize the endpoint. Requests must include `?secret=...`.
- `APP_TIER`: Must be `pro` or `advanced` to send digests.
- `RESEND_API_KEY` and `RESEND_FROM`: Enable email sending; if missing, emails are safely skipped.
- `DIGEST_RECIPIENTS` (optional): Comma-separated list of recipient emails. Falls back to `RESEND_FROM` when unset.

## Usage

- Reachability: `GET /api/weekly-recap?secret=...&ping=1`
- Dry run (no email): `GET /api/weekly-recap?secret=...&dryRun=1`
- Execute: `GET /api/weekly-recap?secret=...`

Response includes job status, duration, and send counts.

## Verification checklist

- With valid `CRON_SECRET`, `?ping=1` returns 200 and `{ ok: true }`.
- With `APP_TIER=pro` and proper email config, calling without `dryRun` increments `sentCount` and returns 200.
- With missing recipients, endpoint returns 200 with `skippedReason: "NO_RECIPIENTS"`.
- With invalid secret, endpoint returns 403.

## Notes

- The digest content uses existing configuration and environment health. Extend with real business metrics when available.
- Endpoint runtime is Node.js; OpenTelemetry logs/trace IDs enrich logs when enabled.
