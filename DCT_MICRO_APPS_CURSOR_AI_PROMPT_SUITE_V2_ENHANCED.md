# DCT Micro‑Apps — CursorAI Prompt Suite v2.0 Enhanced (Strategic Phased Implementation)

> **How to use**: This suite uses a **strategic phased approach** instead of 36 separate branches. Each phase groups related prompts into cohesive, testable increments. Follow the phases sequentially: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6. Every prompt is self‑contained with context, hard rules, explicit deliverables, and verification. Our operating loop is **Audit → Decide → Apply → Verify → Repeat**. Let Cursor be creative in implementation details, but never drift from the goal.

## **STRATEGIC PHASED APPROACH**

### **Phase 1: Foundation & Infrastructure** (Prompts 01-06)
- Baseline, environment, diagnostics, CLI, CI/CD, automation
- **Branch**: `ops/phase-1-foundation`
- **Goal**: Solid foundation for everything else

### **Phase 2: Security & Observability** (Prompts 07-12)  
- Security headers, scans, OpenTelemetry, health, SLOs, performance
- **Branch**: `ops/phase-2-security-observability`
- **Goal**: Production-grade security and monitoring

### **Phase 3: Testing & Quality Assurance** (Prompts 13-17)
- Accessibility, testing pyramid, contract tests, error handling, privacy
- **Branch**: `ops/phase-3-testing-quality`
- **Goal**: Quality that enforces itself

### **Phase 4: Modular Architecture & Blocks** (Prompts 18-25)
- Extract reusable components into packages, build blocks
- **Branch**: `ops/phase-4-blocks-extraction`
- **Goal**: Modular, reusable architecture

### **Phase 5: Presets & Business Logic** (Prompts 26-30)
- RBAC, vertical presets, business workflows, documentation
- **Branch**: `ops/phase-5-presets-integration`
- **Goal**: Vertical-specific implementations

### **Phase 6: Production Readiness & Polish** (Prompts 31-36)
- Release tooling, monorepo optimization, validation, delivery
- **Branch**: `ops/phase-6-final-polish`
- **Goal**: Production-ready delivery

---

## **PHASE 1: FOUNDATION & INFRASTRUCTURE**

### 01) Baseline repo snapshot & risk log
```text
[CONTEXT]
- Date Check: Before doing anything, print the current local date/time in ISO (Node one-liner ok). Include it in your final summary as `RUN_DATE=YYYY-MM-DDTHH:mm:ssZ`.
- Overall Goal: Turn the "DCT Micro‑Apps" template into a production‑grade, config‑driven, modular monolith that can be cloned per client in under an hour, with tier switches, observability, CI/CD, security, and a warn‑but‑run env philosophy.
- This Prompt (#01 of 36): Create a **baseline snapshot** and **risk log** so we always know what changed and why.
- Previous Task: (none — this is the starting point).
- Next Task: #02 Env schema + `env:doctor` CLI to implement our warn‑but‑run environment strategy.

[RULES]
1) Work in branch `ops/phase-1-foundation` - this is the first commit of Phase 1.
2) Never delete code without a backup. If you must move/rename, do in small commits.
3) Detect the repo's package manager and keep using it (npm|pnpm|yarn). Do not switch.
4) Follow our loop: Audit → Decide → Apply → Verify. When uncertain, propose options with tradeoffs and pick one, documenting why in a short ADR.
5) Respect existing coding styles and frameworks. Assume Next.js App Router, Node 22, Supabase, Resend, Vercel unless repo indicates otherwise.
6) Keep the template runnable without secrets. If a feature requires secrets, feature‑flag it off and surface a gentle warning.
7) Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`, `refactor:`, `perf:`, `style:`

[TASKS]
A. **Audit**: Generate and save to `/docs/ops/baseline/` the following (machine‑readable where possible):
   - `file-tree.md` (top 3 levels) and `routes.md` (Next routes + method summary).
   - `packages.md` listing prod/deps + versions; `scripts.md` capturing npm scripts.
   - `config-inventory.md` for env vars discovered across the codebase.
   - `testing-inventory.md` and current coverage (if configured).
   - `ci-inventory.md` summarizing any existing CI jobs.
   - `security-inventory.md` for auth patterns, RLS policies, and security gaps.
   - `performance-inventory.md` for current bottlenecks and optimization opportunities.
B. **Decide**: Create `docs/adr/0001-baseline-and-risks.md` capturing:
   - Assumed stack, known gaps, risks (env handling, CI, security, perf, a11y, observability).
   - Decision: proceed with the modular monolith + config/presets + feature flags plan.
   - Risk mitigation strategies for each identified gap.
C. **Apply**: Add a tiny internal script `tools/ops/run-date.ts` that prints ISO date; used by future prompts.
D. **Verify**: Repo builds; docs generated; commit history readable.

[DELIVERABLES]
- `/docs/ops/baseline/*` inventories (7 files total)
- `/docs/adr/0001-baseline-and-risks.md`
- `tools/ops/run-date.ts`
- Commit with message: `feat(ops): baseline snapshot, inventories, and risk ADR`

[VERIFICATION]
- Run `node tools/ops/run-date.ts` → prints ISO datetime.
- Open `/docs/ops/baseline/file-tree.md` and confirm content.
- No runtime behavior changes.
- All 7 inventory files are present and contain meaningful data.
- Open a PR titled `[Phase 1] Baseline snapshot & risk log` and attach the inventories as artifacts if CI exists.

[IF ISSUES]
- Roll back only the new docs/scripts; do not touch app code. Re-run with smaller scopes.
- Document any failures in `/docs/ops/baseline/implementation-notes.md`
```

### 02) Environment schema + `env:doctor` (warn‑but‑run)
```text
[CONTEXT]
- Date Check: Print RUN_DATE in ISO; include in summary.
- Overall Goal: Production‑grade template with gentle env warnings and features auto‑disabled when secrets are missing.
- This Prompt (#02 of 36): Implement typed env validation + doctor CLI.
- Previous Task: #01 baseline inventories & risk ADR.
- Next Task: #03 Diagnostics admin route displaying env and health.

[RULES]
1) Continue working in branch `ops/phase-1-foundation` - this is the second commit of Phase 1.
2) Use `zod` for schema validation. No leaking secrets in logs or error messages.
3) If a var is missing, set an explicit placeholder (e.g., `PLACEHOLDER_RESEND_API_KEY`) and **disable** the dependent feature via a feature flag.
4) Add human‑readable warnings in dev console and on the diagnostics page (to be built next).
5) Implement environment variable encryption for sensitive values in production.
6) Add environment variable rotation detection and warnings.

[TASKS]
A. **Audit**: From `config-inventory.md`, enumerate all env vars; classify as REQUIRED|OPTIONAL per feature.
B. **Decide**: Organize into modules: `env.app`, `env.integrations`, `env.security`, `env.observability`.
C. **Apply**: 
   - Create `packages/lib/env.ts` exporting typed, validated env with runtime validation.
   - Create `.env.example` with commented explanations, placeholders, and security notes.
   - Add `npm run env:doctor` → prints a table: Name | Required? | Set? | Using Placeholder? | Feature Impact | Security Level.
   - Wire feature flags: `packages/lib/flags.ts` with `isEnabled('stripe')`, `isTier('pro')`, etc. Defaults safe.
   - Add environment variable encryption utilities for production deployments.
D. **Verify**: Run without real secrets. App should build and run with warnings, not crashes.

[DELIVERABLES]
- `packages/lib/env.ts`, `packages/lib/flags.ts`
- `.env.example`, `scripts/env-doctor.*`
- `packages/lib/env-encryption.ts` for production security
- Docs: `/docs/ops/env.md` describing categories, impacts, and security considerations.
- Commit: `feat(env): typed env schema + env doctor + feature flags + encryption`

[VERIFICATION]
- `npm run env:doctor` shows table with accurate statuses and security levels.
- Starting dev server shows warnings but app remains usable.
- Unit tests for `env.ts` (missing/invalid → fallback + disabled features).
- Environment encryption works in production mode.
- Feature flags properly disable features when secrets are missing.
```

### 03) Admin Diagnostics route (`/admin/diagnostics`)
```text
[CONTEXT]
- Date Check: Print RUN_DATE.
- Overall Goal: Make the template self‑diagnosing and production-ready.
- This Prompt (#03 of 36): Build a protected Diagnostics page surfacing env status, feature flags, health checks.
- Previous Task: #02 env schema + doctor.
- Next Task: #04 Feature tiers & presets integration.

[RULES]
1) Continue working in branch `ops/phase-1-foundation` - this is the third commit of Phase 1.
2) Protect route: admin‑only (basic auth or existing auth system).
3) Never render secrets; only statuses and metadata.
4) Status colors: green (ok), yellow (placeholder used/feature off), red (misconfig or runtime error).
5) Add real-time monitoring capabilities and alert thresholds.
6) Implement diagnostic export functionality for support teams.

[TASKS]
A. **Audit**: Identify current admin/auth pattern and security requirements.
B. **Decide**: Use a lightweight card grid with sections: Env, Flags, Routes, Webhooks, Queues, Performance, Security.
C. **Apply**: 
   - Add `app/admin/diagnostics/page.tsx` fetching from `api/diagnostics` server route.
   - Implement real-time health monitoring with WebSocket updates.
   - Add diagnostic export to JSON/CSV for support purposes.
   - Create performance dashboards with historical data.
D. **Verify**: With empty env, page shows mostly yellow, app still runs, real-time updates work.

[DELIVERABLES]
- Diagnostics page + API route with real-time capabilities
- Performance monitoring dashboard
- Diagnostic export functionality
- Tests (snapshot + server route unit test + integration tests)
- Docs: `/docs/ops/diagnostics.md`
- Commit: `feat(ops): admin diagnostics route with env/flags/health statuses + real-time monitoring`

[VERIFICATION]
- Diagnostics page loads and shows accurate statuses.
- Real-time updates work without page refresh.
- Export functionality generates valid diagnostic reports.
- Performance dashboard displays meaningful metrics.
- All tests pass including new real-time functionality.
```

### 04) Feature tiers (Starter/Pro/Advanced) + preset wiring
```text
[CONTEXT]
- Date Check: Print RUN_DATE.
- Overall Goal: One template, multiple offerings via flags with seamless tier switching.
- This Prompt (#04 of 36): Implement tier logic and load preset JSON to autowire pages/blocks.
- Previous Task: #03 diagnostics route.
- Next Task: #05 CLI `npx dct init` to set tier/preset quickly.

[RULES]
1) Continue working in branch `ops/phase-1-foundation` - this is the fourth commit of Phase 1.
2) Zero hard‑coded tier checks in UI; rely on `flags.ts` and dynamic configuration.
3) Implement tier-based feature gating with graceful degradation.
4) Add tier upgrade/downgrade capabilities with data migration support.

[TASKS]
A. **Audit**: Enumerate current features by tier and identify upgrade paths.
B. **Decide**: Define `packages/templates/presets/*.json` (e.g., `salon-waitlist.json`, `realtor-listing-hub.json`, `consultation-engine.json`).
C. **Apply**: 
   - Add `app.config.ts` shape `{ tier: 'starter'|'pro'|'advanced', preset: string, features: FeatureConfig }` consumed at build.
   - Implement dynamic feature loading based on tier configuration.
   - Add tier migration utilities for seamless upgrades.
   - Create tier comparison matrix for sales/marketing.
D. **Verify**: Toggle tiers and see sections appear/disappear without errors, migrations work smoothly.

[DELIVERABLES]
- `packages/templates/presets/*` (at least 3 comprehensive presets)
- `app.config.ts` with types and tier management
- Tier migration utilities and data integrity checks
- Tier comparison matrix and upgrade guides
- Tests for `flags.isTier()` and preset loading
- Commit: `feat(core): tiers + preset autowiring + migration support`

[VERIFICATION]
- All three tiers work without hard-coded checks.
- Preset switching is seamless and fast.
- Tier migrations preserve data integrity.
- Comparison matrix accurately reflects capabilities.
- Performance remains consistent across all tiers.
```

### 05) CLI initializer `npx dct init`
```text
[CONTEXT]
- Date Check: Print RUN_DATE.
- Overall Goal: One‑command client setup with intelligent defaults and validation.
- This Prompt (#05 of 36): Create a minimal CLI that asks for Client Name, Tier, Preset, Scheduler (link/embed), Stripe (y/n) and writes `app.config.ts` + `.env.local` placeholders, then opens `/admin/diagnostics`.
- Previous Task: #04 tiers + presets.
- Next Task: #06 CI pipeline scaffold.

[RULES]
1) Continue working in branch `ops/phase-1-foundation` - this is the fifth commit of Phase 1.
2) No external heavy deps; use Node + prompts library already in repo if any.
3) Implement intelligent defaults based on preset selection.
4) Add validation and error handling for all inputs.
5) Include interactive mode and non-interactive (CI-friendly) mode.

[TASKS]
A. **Audit**: Confirm repo structure and where to place CLI (`tools/cli`).
B. **Decide**: CLI UX, idempotency (re‑run safe), and validation rules.
C. **Apply**: 
   - Implement `bin/dct.js` (or ts) and add `npx dct init` script via `package.json` bin.
   - Add intelligent defaults and preset-specific configurations.
   - Implement input validation with helpful error messages.
   - Add CI-friendly mode for automated deployments.
   - Include configuration validation and health checks.
D. **Verify**: Run end‑to‑end on a clean checkout, test all presets, validate CI mode.

[DELIVERABLES]
- CLI files + comprehensive README with examples
- Configuration validation and health checks
- CI-friendly mode for automated deployments
- Preset-specific intelligent defaults
- Commit: `feat(cli): npx dct init with intelligent defaults and CI support`

[VERIFICATION]
- CLI works end-to-end on clean checkout.
- All presets generate valid configurations.
- CI mode works without user interaction.
- Configuration validation catches common errors.
- Health checks confirm successful setup.
```

### 06) CI pipeline scaffold (lint → typecheck → test → build)
```text
[CONTEXT]
- Date Check: Print RUN_DATE.
- Overall Goal: Tight quality gates without friction, with intelligent caching and parallelization.
- This Prompt (#06 of 36): Add GitHub Actions workflow for lint, typecheck, unit/integration tests, and build with advanced optimization.
- Previous Task: #05 CLI init.
- Next Task: #07 Renovate automation.

[RULES]
1) Continue working in branch `ops/phase-1-foundation` - this is the final commit of Phase 1.
2) Cache dependencies aggressively; matrix Node LTS with intelligent job distribution.
3) Implement parallel testing and build optimization.
4) Add performance monitoring and regression detection.
5) Include security scanning in the pipeline.

[TASKS]
A. **Audit**: Detect ESLint/TS/test runner and identify optimization opportunities.
B. **Decide**: Name jobs and artifacts; minimal secrets; parallelization strategy.
C. **Apply**: 
   - `.github/workflows/ci.yml` with optimized steps and parallel execution.
   - Upload test coverage artifact with trend analysis.
   - Add performance regression detection.
   - Implement intelligent caching strategies.
   - Include security scanning (SAST, dependency checks).
D. **Verify**: CI passes on PR with improved performance metrics.

[DELIVERABLES]
- CI workflow file(s) with advanced optimization
- Performance monitoring and regression detection
- Security scanning integration
- Caching optimization documentation
- Commit: `ci: advanced pipeline with optimization, security, and performance monitoring`

[VERIFICATION]
- CI passes on PR with all checks.
- Performance metrics are captured and analyzed.
- Security scans run and report findings.
- Caching reduces build times significantly.
- Parallel execution improves overall pipeline speed.

[PHASE 1 COMPLETION]
- All 6 prompts completed in `ops/phase-1-foundation` branch
- Create PR: `[Phase 1] Foundation & Infrastructure Complete`
- Merge to main after thorough testing
- Tag as `v0.1.0-foundation` for reference
```

---

## **PHASE 2: SECURITY & OBSERVABILITY**

### 07) Renovate (safe auto‑updates)
```text
[CONTEXT]
- Date Check: Print RUN_DATE.
- Overall Goal: Keep deps fresh automatically with intelligent grouping and risk assessment.
- This Prompt (#07 of 36): Configure Renovate with weekly window, automerge for safe updates, grouping rules, and security-focused prioritization.
- Previous Task: #06 CI base.
- Next Task: #08 Security headers + rate limiting.

[RULES]
1) Create new branch `ops/phase-2-security-observability` - this is the first commit of Phase 2.
2) Avoid noisy PRs; group devDeps and minor patches intelligently.
3) Prioritize security updates over feature updates.
4) Implement dependency vulnerability scanning and reporting.
5) Add automated dependency health scoring.

[TASKS]
A. **Audit**: Current deps risk (outdated major versions, known vulnerabilities).
B. **Decide**: Policy for automerge, security thresholds, and update windows.
C. **Apply**: 
   - `renovate.json` with intelligent grouping and security prioritization.
   - Dependency health monitoring and scoring system.
   - Automated vulnerability assessment and reporting.
   - Onboarding docs with security best practices.
D. **Verify**: Dry‑run config, security scanning works, dependency health is tracked.

[DELIVERABLES]
- `renovate.json` with security-focused configuration
- Dependency health monitoring system
- Vulnerability assessment automation
- Security-focused onboarding documentation
- Commit: `feat(deps): configure Renovate with security prioritization and health monitoring`

[VERIFICATION]
- Renovate configuration is valid and secure.
- Security updates are prioritized appropriately.
- Dependency health scoring works accurately.
- Vulnerability reporting is comprehensive and actionable.
- Update grouping reduces PR noise significantly.
```

### 08) Security headers + rate limiting middleware
```text
[CONTEXT]
- Date Check: Print RUN_DATE.
- Overall Goal: Quietly elite security by default with comprehensive protection.
- This Prompt (#08 of 36): Add strict security headers, per‑IP rate limiting, and advanced security middleware.
- Previous Task: #07 Renovate.
- Next Task: #09 SBOM + SAST + dependency scans.

[RULES]
1) Continue working in branch `ops/phase-2-security-observability` - this is the second commit of Phase 2.
2) CSP should be strict but compatible with Next/Image and analytics flag.
3) Implement advanced rate limiting with IP reputation tracking.
4) Add security event logging and alerting.
5) Include bot detection and protection.

[TASKS]
A. **Audit**: Existing headers, middleware, and security patterns.
B. **Decide**: Helmet‑style headers without heavy deps; implement native Next config.
C. **Apply**: 
   - Add middleware for rate limits on `/api/*`, `/admin/*` with IP reputation.
   - Implement comprehensive security headers with CSP, HSTS, etc.
   - Add bot detection and protection mechanisms.
   - Create security event logging and alerting system.
   - Include security testing and validation tools.
D. **Verify**: Headers present, 429 on flood, bot protection works, security events logged.

[DELIVERABLES]
- `next.config.*` updates, middleware, security tests
- Advanced rate limiting with IP reputation
- Bot detection and protection
- Security event logging and alerting
- Security testing and validation tools
- Commit: `feat(security): comprehensive security headers + advanced rate limiting + bot protection`

[VERIFICATION]
- All security headers are present and properly configured.
- Rate limiting works effectively with IP reputation tracking.
- Bot detection prevents automated attacks.
- Security events are logged and can trigger alerts.
- Security tests validate all protection mechanisms.
```

### 09) SBOM, SAST, dep scans (Trivy/CodeQL)
```text
[CONTEXT]
- Date Check: Print RUN_DATE.
- Overall Goal: Supply‑chain hygiene with continuous monitoring and automated response.
- This Prompt (#09 of 36): Add SBOM generation, security scans, and automated vulnerability response to CI.
- Previous Task: #08 security headers.
- Next Task: #10 OpenTelemetry + pino setup.

[RULES]
1) Continue working in branch `ops/phase-2-security-observability` - this is the third commit of Phase 2.
2) Fail CI on HIGH vulns; warn on MEDIUM with automated triage.
3) Implement automated vulnerability assessment and reporting.
4) Add dependency provenance tracking and verification.
5) Include security policy enforcement and compliance reporting.

[TASKS]
A. **Audit**: Existing CI, security tools, and compliance requirements.
B. **Decide**: Which scanners fit current stack and security requirements.
C. **Apply**: 
   - Add SBOM generation with provenance tracking.
   - Implement Trivy (or similar) with automated triage.
   - Enable GitHub CodeQL with custom security policies.
   - Add automated vulnerability assessment and reporting.
   - Include compliance reporting and policy enforcement.
D. **Verify**: CI runs, artifacts published, security policies enforced, compliance reports generated.

[DELIVERABLES]
- CI jobs with security scanning and compliance
- SBOM generation with provenance tracking
- Automated vulnerability assessment
- Security policy enforcement
- Compliance reporting and documentation
- Commit: `ci(security): comprehensive SBOM + Trivy/CodeQL + compliance + automated response`

[VERIFICATION]
- All security scans run successfully in CI.
- SBOM includes complete provenance information.
- Vulnerability assessment is automated and accurate.
- Security policies are enforced consistently.
- Compliance reports meet regulatory requirements.
```

### 10) OpenTelemetry + pino logging
```text
[CONTEXT]
- Date Check: Print RUN_DATE.
- Overall Goal: First‑class observability with correlation and business metrics.
- This Prompt (#10 of 36): Initialize OTel tracing/metrics and structured logging with correlation IDs and business context.
- Previous Task: #09 security scans.
- Next Task: #11 Health/readiness endpoints + RED metrics.

[RULES]
1) Continue working in branch `ops/phase-2-security-observability` - this is the fourth commit of Phase 2.
2) Default to head‑based 1% sampling, 100% on errors and business-critical flows.
3) Implement business metrics and KPIs alongside technical metrics.
4) Add correlation across all system boundaries.
5) Include performance profiling and bottleneck detection.

[TASKS]
A. **Audit**: Where server entrypoints are and what business metrics matter.
B. **Decide**: Minimal vendor‑agnostic setup with business context.
C. **Apply**: 
   - `packages/observability/*` with comprehensive OTel initialization.
   - `logger.ts` using pino with business context and correlation.
   - Business metrics and KPI tracking system.
   - Performance profiling and bottleneck detection.
   - Correlation across all system boundaries.
D. **Verify**: Traces/logs emitted locally, no runtime perf regression, business metrics captured.

[DELIVERABLES]
- OTel init + pino logger with business context
- Business metrics and KPI tracking
- Performance profiling and bottleneck detection
- Cross-boundary correlation system
- Comprehensive observability documentation
- Commit: `feat(obs): OpenTelemetry + pino logging + business metrics + performance profiling`

[VERIFICATION]
- All traces and logs include proper correlation IDs.
- Business metrics are captured and meaningful.
- Performance profiling identifies bottlenecks accurately.
- Correlation works across all system boundaries.
- No performance regression from observability overhead.
```

### 11) Health/Readiness endpoints + RED metrics
```text
[CONTEXT]
- Date Check: Print RUN_DATE.
- Overall Goal: Operate like pros with comprehensive health monitoring and business metrics.
- This Prompt (#11 of 36): Add `/health`, `/ready`, and comprehensive RED metrics with business context.
- Previous Task: #10 OTel + pino.
- Next Task: #12 SLOs + error budget gates in CI.

[RULES]
1) Continue working in branch `ops/phase-2-security-observability` - this is the fifth commit of Phase 2.
2) Health checks should not hit external deps; readiness can include dependency checks.
3) Implement business metrics alongside technical metrics.
4) Add automated health scoring and trend analysis.
5) Include capacity planning and resource utilization metrics.

[TASKS]
A. **Audit**: Existing endpoints, business flows, and critical dependencies.
B. **Decide**: Health checks that provide business value and operational insight.
C. **Apply**: 
   - Implement comprehensive health and readiness endpoints.
   - Add RED metrics with business context and correlation.
   - Create automated health scoring and trend analysis.
   - Include capacity planning and resource utilization metrics.
   - Add business flow monitoring and alerting.
D. **Verify**: Endpoints respond correctly, metrics are meaningful, health scoring works.

[DELIVERABLES]
- Health and readiness endpoints with business context
- Comprehensive RED metrics system
- Automated health scoring and trend analysis
- Capacity planning and resource utilization metrics
- Business flow monitoring and alerting
- Commit: `feat(ops): comprehensive health/ready endpoints + RED metrics + business monitoring`

[VERIFICATION]
- All health endpoints respond correctly and quickly.
- RED metrics include business context and correlation.
- Health scoring provides meaningful operational insight.
- Capacity planning metrics are accurate and actionable.
- Business flow monitoring detects issues proactively.
```

### 12) SLOs + CI guardrails
```text
[CONTEXT]
- Date Check: Print RUN_DATE.
- Overall Goal: Quality that enforces itself with automated SLO monitoring and enforcement.
- This Prompt (#12 of 36): Define SLOs, implement automated monitoring, and add CI checks that fail if budgets repeatedly burn.
- Previous Task: #11 health/metrics.
- Next Task: #13 Lighthouse budgets.

[RULES]
1) Continue working in branch `ops/phase-2-security-observability` - this is the final commit of Phase 2.
2) Implement automated SLO monitoring and alerting.
3) Add error budget tracking and trend analysis.
4) Include business impact assessment and prioritization.
5) Create automated remediation suggestions and workflows.

[TASKS]
A. **Audit**: Current metrics availability and business impact assessment.
B. **Decide**: Targets: 99.9% avail, P95<500ms, error<0.1%, business impact scoring.
C. **Apply**: 
   - Define comprehensive SLOs with business context.
   - Implement automated SLO monitoring and alerting.
   - Add error budget tracking and trend analysis.
   - Include business impact assessment and prioritization.
   - Create automated remediation suggestions and workflows.
D. **Verify**: SLO monitoring works, error budgets tracked, business impact assessed, remediation suggested.

[DELIVERABLES]
- Comprehensive SLO definitions and monitoring
- Automated SLO monitoring and alerting system
- Error budget tracking and trend analysis
- Business impact assessment and prioritization
- Automated remediation suggestions and workflows
- Commit: `ci(ops): comprehensive SLO monitoring + error budget tracking + business impact + automated remediation`

[VERIFICATION]
- All SLOs are monitored automatically and accurately.
- Error budgets are tracked with trend analysis.
- Business impact assessment provides actionable insights.
- Remediation suggestions are relevant and implementable.
- CI gates enforce SLO compliance effectively.

[PHASE 2 COMPLETION]
- All 6 prompts completed in `ops/phase-2-security-observability` branch
- Create PR: `[Phase 2] Security & Observability Complete`
- Merge to main after thorough testing
- Tag as `v0.2.0-security-observability` for reference
```
