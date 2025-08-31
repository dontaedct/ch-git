# SOS Ops — Phase 6 / Task 35

Final validation: clean clone dry-run

## Goal

Validate that a contributor can clone the repo cleanly, install, build, and run essential checks/smoke tests in under 60 minutes on a typical machine.

## What’s Included

- Clean-clone validation script (`scripts/validate-clean-clone.mjs`).
- NPM scripts: `validate:clean-clone` and `validate:clean-clone:full`.
- Optional performance validation via Lighthouse CI in `--full` mode.

## Quick Start

- Fast path:
  - `npm run validate:clean-clone`
- Full (includes LHCI perf run):
  - `npm run validate:clean-clone:full`

## What It Does

1. Clones the repository into a temporary directory without local hardlinks.
2. Runs `npm ci` for reproducible dependency installs.
3. Runs `typecheck` and `lint` to ensure baseline health.
4. Builds the app via `next build`.
5. Runs unit tests (best effort).
6. Runs Playwright smoke tests (best effort) if available.
7. (Full mode) Runs Lighthouse CI and validates budgets if configured.

Best-effort steps do not fail the entire run; they warn and continue to provide signal even on machines lacking browsers.

## Success Criteria

- Clone + install + typecheck + lint + build all succeed.
- Unit tests pass (if configured/available).
- Smoke test passes (if Playwright/browsers are available locally).
- (Full mode) LHCI completes and budgets validate.

## Notes

- The script leaves the cloned artifacts in your temp directory (printed at the end) so you can inspect them.
- Use `--full` when you want performance validation. It will take longer and require a Chrome-compatible environment.
- CI still runs the full suite (`npm run ci`). This task is for local validation and contributor experience.
