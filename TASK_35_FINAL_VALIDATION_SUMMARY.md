**SOS Operation Phase 6 Task 35 - COMPLETED** ✅

Title: Final validation — clean clone dry-run

Deliverables implemented:

- Automation script: `scripts/validate-clean-clone.mjs`.
- NPM scripts: `validate:clean-clone` (fast) and `validate:clean-clone:full` (includes perf).
- Runbook: `docs/ops/sos/phase-6/task-35.md` with goals, steps, and success criteria.

What it does:

- Clones repo into a temporary directory without hardlinks.
- Runs `npm ci`, `typecheck`, `lint`, and `build`.
- Best-effort unit tests and Playwright smoke tests.
- Optional LHCI perf run and validation in `--full` mode.

How to use:

- Fast path: `npm run validate:clean-clone`
- Full validation: `npm run validate:clean-clone:full`

Notes:

- Smoke/perf steps are tolerant and may warn if browsers or LHCI prerequisites are absent.
- This complements CI (`npm run ci`) and focuses on first-time contributor experience.
