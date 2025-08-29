# PHASE 1: FOUNDATION & INFRASTRUCTURE - DETAILED TASKS

**Branch**: `ops/phase-1-foundation`  
**Goal**: Solid foundation for everything else  
**Status**: 🟡 Ready to Start

---

## **TASK 01: Baseline repo snapshot & risk log**

### **CONTEXT**
- **Date Check**: Before doing anything, print the current local date/time in ISO (Node one-liner ok). Include it in your final summary as `RUN_DATE=YYYY-MM-DDTHH:mm:ssZ`.
- **Overall Goal**: Turn the "DCT Micro‑Apps" template into a production‑grade, config‑driven, modular monolith that can be cloned per client in under an hour, with tier switches, observability, CI/CD, security, and a warn‑but‑run env philosophy.
- **This Task**: Create a **baseline snapshot** and **risk log** so we always know what changed and why.
- **Previous Task**: (none — this is the starting point).
- **Next Task**: #02 Env schema + `env:doctor` CLI to implement our warn‑but‑run environment strategy.

### **RULES**
1) Work in branch `ops/phase-1-foundation` - this is the first commit of Phase 1.
2) Never delete code without a backup. If you must move/rename, do in small commits.
3) Detect the repo's package manager and keep using it (npm|pnpm|yarn). Do not switch.
4) Follow our loop: Audit → Decide → Apply → Verify. When uncertain, propose options with tradeoffs and pick one, documenting why in a short ADR.
5) Respect existing coding styles and frameworks. Assume Next.js App Router, Node 22, Supabase, Resend, Vercel unless repo indicates otherwise.
6) Keep the template runnable without secrets. If a feature requires secrets, feature‑flag it off and surface a gentle warning.
7) Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`, `refactor:`, `perf:`, `style:`

### **TASKS**
A. **Audit**: Generate and save to `/docs/ops/baseline/` the following (machine‑readable where possible):
   - `file-tree.md` (top 3 levels) and `routes.md` (Next routes + method summary).
   - `packages.md` listing prod/deps + versions; `scripts.md` capturing npm scripts.
   - `config-inventory.md` for env vars discovered across the codebase.
   - `testing-inventory.md` and current coverage (if configured).
   - `ci-inventory.md` summarizing any existing CI jobs.
   - `security-inventory.md` for auth patterns, RLS policies, and security gaps.
   - `performance-inventory.md` for current bottlenecks and optimization opportunities.
   - `accessibility-inventory.md` for current a11y patterns and gaps.
B. **Decide**: Create `docs/adr/0001-baseline-and-risks.md` capturing:
   - Assumed stack, known gaps, risks (env handling, CI, security, perf, a11y, observability).
   - Decision: proceed with the modular monolith + config/presets + feature flags plan.
   - Risk mitigation strategies for each identified gap.
   - Technology stack validation and compatibility matrix.
C. **Apply**: Add a tiny internal script `tools/ops/run-date.ts` that prints ISO date; used by future prompts.
D. **Verify**: Repo builds; docs generated; commit history readable.

### **DELIVERABLES**
- `/docs/ops/baseline/*` inventories (8 files total)
- `/docs/adr/0001-baseline-and-risks.md`
- `tools/ops/run-date.ts`
- Commit with message: `feat(ops): baseline snapshot, inventories, and risk ADR`

### **VERIFICATION**
- Run `node tools/ops/run-date.ts` → prints ISO datetime.
- Open `/docs/ops/baseline/file-tree.md` and confirm content.
- No runtime behavior changes.
- All 8 inventory files are present and contain meaningful data.
- Open a PR titled `[Phase 1] Baseline snapshot & risk log` and attach the inventories as artifacts if CI exists.

### **IF ISSUES**
- Roll back only the new docs/scripts; do not touch app code. Re-run with smaller scopes.
- Document any failures in `/docs/ops/baseline/implementation-notes.md`

---

## **TASK 02: Environment schema + env:doctor (warn‑but‑run)**

### **CONTEXT**
- **Date Check**: Print RUN_DATE in ISO; include in summary.
- **Overall Goal**: Production‑grade template with gentle env warnings and features auto‑disabled when secrets are missing.
- **This Task**: Implement typed env validation + doctor CLI.
- **Previous Task**: #01 baseline inventories & risk ADR.
- **Next Task**: #03 Diagnostics admin route displaying env and health.

### **RULES**
1) Continue working in branch `ops/phase-1-foundation` - this is the second commit of Phase 1.
2) Use `zod` for schema validation. No leaking secrets in logs or error messages.
3) If a var is missing, set an explicit placeholder (e.g., `PLACEHOLDER_RESEND_API_KEY`) and **disable** the dependent feature via a feature flag.
4) Add human‑readable warnings in dev console and on the diagnostics page (to be built next).
5) Implement environment variable encryption for sensitive values in production.
6) Add environment variable rotation detection and warnings.
7) Include environment variable validation and sanitization.

### **TASKS**
A. **Audit**: From `config-inventory.md`, enumerate all env vars; classify as REQUIRED|OPTIONAL per feature.
B. **Decide**: Organize into modules: `env.app`, `env.integrations`, `env.security`, `env.observability`.
C. **Apply**: 
   - Create `packages/lib/env.ts` exporting typed, validated env with runtime validation.
   - Create `.env.example` with commented explanations, placeholders, and security notes.
   - Add `npm run env:doctor` → prints a table: Name | Required? | Set? | Using Placeholder? | Feature Impact | Security Level.
   - Wire feature flags: `packages/lib/flags.ts` with `isEnabled('stripe')`, `isTier('pro')`, etc. Defaults safe.
   - Add environment variable encryption utilities for production deployments.
   - Implement environment variable validation and sanitization.
D. **Verify**: Run without real secrets. App should build and run with warnings, not crashes.

### **DELIVERABLES**
- `packages/lib/env.ts`, `packages/lib/flags.ts`
- `.env.example`, `scripts/env-doctor.*`
- `packages/lib/env-encryption.ts` for production security
- `packages/lib/env-validation.ts` for validation and sanitization
- Docs: `/docs/ops/env.md` describing categories, impacts, and security considerations.
- Commit: `feat(env): typed env schema + env doctor + feature flags + encryption + validation`

### **VERIFICATION**
- `npm run env:doctor` shows table with accurate statuses and security levels.
- Starting dev server shows warnings but app remains usable.
- Unit tests for `env.ts` (missing/invalid → fallback + disabled features).
- Environment encryption works in production mode.
- Feature flags properly disable features when secrets are missing.
- Environment validation prevents invalid values.

---

## **TASK 03: Admin Diagnostics route (`/admin/diagnostics`)**

### **CONTEXT**
- **Date Check**: Print RUN_DATE.
- **Overall Goal**: Make the template self‑diagnosing and production-ready.
- **This Task**: Build a protected Diagnostics page surfacing env status, feature flags, health checks.
- **Previous Task**: #02 env schema + doctor.
- **Next Task**: #04 Feature tiers & presets integration.

### **RULES**
1) Continue working in branch `ops/phase-1-foundation` - this is the third commit of Phase 1.
2) Protect route: admin‑only (basic auth or existing auth system).
3) Never render secrets; only statuses and metadata.
4) Status colors: green (ok), yellow (placeholder used/feature off), red (misconfig or runtime error).
5) Add real-time monitoring capabilities and alert thresholds.
6) Implement diagnostic export functionality for support teams.
7) Include performance benchmarking and trend analysis.

### **TASKS**
A. **Audit**: Identify current admin/auth pattern and security requirements.
B. **Decide**: Use a lightweight card grid with sections: Env, Flags, Routes, Webhooks, Queues, Performance, Security.
C. **Apply**: 
   - Add `app/admin/diagnostics/page.tsx` fetching from `api/diagnostics` server route.
   - Implement real-time health monitoring with WebSocket updates.
   - Add diagnostic export to JSON/CSV for support purposes.
   - Create performance dashboards with historical data.
   - Include performance benchmarking and trend analysis.
   - Add automated health scoring and recommendations.
D. **Verify**: With empty env, page shows mostly yellow, app still runs, real-time updates work.

### **DELIVERABLES**
- Diagnostics page + API route with real-time capabilities
- Performance monitoring dashboard with benchmarking
- Diagnostic export functionality
- Automated health scoring and recommendations
- Tests (snapshot + server route unit test + integration tests)
- Docs: `/docs/ops/diagnostics.md`
- Commit: `feat(ops): admin diagnostics route with env/flags/health statuses + real-time monitoring + benchmarking`

### **VERIFICATION**
- Diagnostics page loads and shows accurate statuses.
- Real-time updates work without page refresh.
- Export functionality generates valid diagnostic reports.
- Performance dashboard displays meaningful metrics and trends.
- Health scoring provides actionable recommendations.
- All tests pass including new real-time functionality.

---

## **TASK 04: Feature tiers (Starter/Pro/Advanced) + preset wiring**

### **CONTEXT**
- **Date Check**: Print RUN_DATE.
- **Overall Goal**: One template, multiple offerings via flags with seamless tier switching.
- **This Task**: Implement tier logic and load preset JSON to autowire pages/blocks.
- **Previous Task**: #03 diagnostics route.
- **Next Task**: #05 CLI `npx dct init` to set tier/preset quickly.

### **RULES**
1) Continue working in branch `ops/phase-1-foundation` - this is the fourth commit of Phase 1.
2) Zero hard‑coded tier checks in UI; rely on `flags.ts` and dynamic configuration.
3) Implement tier-based feature gating with graceful degradation.
4) Add tier upgrade/downgrade capabilities with data migration support.
5) Include tier-based performance optimization and resource allocation.

### **TASKS**
A. **Audit**: Enumerate current features by tier and identify upgrade paths.
B. **Decide**: Define `packages/templates/presets/*.json` (e.g., `salon-waitlist.json`, `realtor-listing-hub.json`, `consultation-engine.json`).
C. **Apply**: 
   - Add `app.config.ts` shape `{ tier: 'starter'|'pro'|'advanced', preset: string, features: FeatureConfig }` consumed at build.
   - Implement dynamic feature loading based on tier configuration.
   - Add tier migration utilities for seamless upgrades.
   - Create tier comparison matrix for sales/marketing.
   - Include tier-based performance optimization.
   - Add resource allocation and scaling policies.
D. **Verify**: Toggle tiers and see sections appear/disappear without errors, migrations work smoothly.

### **DELIVERABLES**
- `packages/templates/presets/*` (at least 3 comprehensive presets)
- `app.config.ts` with types and tier management
- Tier migration utilities and data integrity checks
- Tier comparison matrix and upgrade guides
- Tier-based performance optimization
- Resource allocation and scaling policies
- Tests for `flags.isTier()` and preset loading
- Commit: `feat(core): tiers + preset autowiring + migration support + performance optimization`

### **VERIFICATION**
- All three tiers work without hard-coded checks.
- Preset switching is seamless and fast.
- Tier migrations preserve data integrity.
- Comparison matrix accurately reflects capabilities.
- Performance remains consistent across all tiers.
- Resource allocation scales appropriately with tier changes.

---

## **TASK 05: CLI initializer `npx dct init`**

### **CONTEXT**
- **Date Check**: Print RUN_DATE.
- **Overall Goal**: One‑command client setup with intelligent defaults and validation.
- **This Task**: Create a minimal CLI that asks for Client Name, Tier, Preset, Scheduler (link/embed), Stripe (y/n) and writes `app.config.ts` + `.env.local` placeholders, then opens `/admin/diagnostics`.
- **Previous Task**: #04 tiers + presets.
- **Next Task**: #06 CI pipeline scaffold.

### **RULES**
1) Continue working in branch `ops/phase-1-foundation` - this is the fifth commit of Phase 1.
2) No external heavy deps; use Node + prompts library already in repo if any.
3) Implement intelligent defaults based on preset selection.
4) Add validation and error handling for all inputs.
5) Include interactive mode and non-interactive (CI-friendly) mode.
6) Add configuration validation and health checks.

### **TASKS**
A. **Audit**: Confirm repo structure and where to place CLI (`tools/cli`).
B. **Decide**: CLI UX, idempotency (re‑run safe), and validation rules.
C. **Apply**: 
   - Implement `bin/dct.js` (or ts) and add `npx dct init` script via `package.json` bin.
   - Add intelligent defaults and preset-specific configurations.
   - Implement input validation with helpful error messages.
   - Add CI-friendly mode for automated deployments.
   - Include configuration validation and health checks.
   - Add configuration templates and customization options.
D. **Verify**: Run end‑to‑end on a clean checkout, test all presets, validate CI mode.

### **DELIVERABLES**
- CLI files + comprehensive README with examples
- Configuration validation and health checks
- CI-friendly mode for automated deployments
- Preset-specific intelligent defaults
- Configuration templates and customization
- Commit: `feat(cli): npx dct init with intelligent defaults and CI support + templates`

### **VERIFICATION**
- CLI works end-to-end on clean checkout.
- All presets generate valid configurations.
- CI mode works without user interaction.
- Configuration validation catches common errors.
- Health checks confirm successful setup.
- Templates provide useful customization options.

---

## **TASK 06: CI pipeline scaffold (lint → typecheck → test → build)**

### **CONTEXT**
- **Date Check**: Print RUN_DATE.
- **Overall Goal**: Tight quality gates without friction, with intelligent caching and parallelization.
- **This Task**: Add GitHub Actions workflow for lint, typecheck, unit/integration tests, and build with advanced optimization.
- **Previous Task**: #05 CLI init.
- **Next Task**: #07 Renovate automation.

### **RULES**
1) Continue working in branch `ops/phase-1-foundation` - this is the final commit of Phase 1.
2) Cache dependencies aggressively; matrix Node LTS with intelligent job distribution.
3) Implement parallel testing and build optimization.
4) Add performance monitoring and regression detection.
5) Include security scanning in the pipeline.
6) Add automated dependency updates and vulnerability scanning.

### **TASKS**
A. **Audit**: Detect ESLint/TS/test runner and identify optimization opportunities.
B. **Decide**: Name jobs and artifacts; minimal secrets; parallelization strategy.
C. **Apply**: 
   - `.github/workflows/ci.yml` with optimized steps and parallel execution.
   - Upload test coverage artifact with trend analysis.
   - Add performance regression detection.
   - Implement intelligent caching strategies.
   - Include security scanning (SAST, dependency checks).
   - Add automated dependency updates and vulnerability scanning.
   - Include performance benchmarking and optimization suggestions.
D. **Verify**: CI passes on PR with improved performance metrics.

### **DELIVERABLES**
- CI workflow file(s) with advanced optimization
- Performance monitoring and regression detection
- Security scanning integration
- Caching optimization documentation
- Automated dependency management
- Performance benchmarking and optimization
- Commit: `ci: advanced pipeline with optimization, security, and performance monitoring + dependency management`

### **VERIFICATION**
- CI passes on PR with all checks.
- Performance metrics are captured and analyzed.
- Security scans run and report findings.
- Caching reduces build times significantly.
- Parallel execution improves overall pipeline speed.
- Dependency updates are automated and secure.
- Performance benchmarking provides actionable insights.

---

## **PHASE 1 COMPLETION CHECKLIST**

### **All Tasks Must Be Completed Before Phase 2**
- [ ] **Task 01**: Baseline repo snapshot & risk log
- [ ] **Task 02**: Environment schema + env:doctor
- [ ] **Task 03**: Admin Diagnostics route
- [ ] **Task 04**: Feature tiers + preset wiring
- [ ] **Task 05**: CLI initializer npx dct init
- [ ] **Task 06**: CI pipeline scaffold

### **Phase 1 Completion Steps**
1. **Create PR**: `[Phase 1] Foundation & Infrastructure Complete`
2. **Merge to main** after thorough testing
3. **Tag as** `v0.1.0-foundation` for reference
4. **Update** `/docs/ops/phase-completion-checklist.md`
5. **Unlock Phase 2** for development

### **Next Phase Preparation**
- Phase 2 will be unlocked after Phase 1 completion
- Create new branch: `ops/phase-2-security-observability`
- Begin with Task 07: Renovate (safe auto-updates)
