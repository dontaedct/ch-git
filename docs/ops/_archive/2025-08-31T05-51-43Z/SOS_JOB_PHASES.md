# SOS JOB PHASES - DCT Micro-Apps Transformation

> **QUICK START**: When starting a new chat, say: `start sos op phase [1-6] task [1-6]`  
> **Example**: `start sos op phase 1 task 3` = Phase 1, Task 3 (Admin Diagnostics route)

## **PHASE OVERVIEW**

| Phase | Branch                               | Focus                         | Status    | Next Task |
| ----- | ------------------------------------ | ----------------------------- | --------- | --------- |
| **1** | `ops/phase-1-foundation`             | Foundation & Infrastructure   | 🟡 Ready  | 01-06     |
| **2** | `ops/phase-2-security-observability` | Security & Observability      | 🔴 Locked | 07-12     |
| **3** | `ops/phase-3-testing-quality`        | Testing & Quality Assurance   | 🔴 Locked | 13-17     |
| **4** | `ops/phase-4-blocks-extraction`      | Modular Architecture & Blocks | 🔴 Locked | 18-25     |
| **5** | `ops/phase-5-presets-integration`    | Presets & Business Logic      | 🔴 Locked | 26-30     |
| **6** | `ops/phase-6-final-polish`           | Production Readiness & Polish | 🔴 Locked | 31-36     |

---

## **PHASE 1: FOUNDATION & INFRASTRUCTURE**

**Branch**: `ops/phase-1-foundation`  
**Goal**: Solid foundation for everything else  
**Status**: 🟡 Ready to Start

### **Task 01: Baseline repo snapshot & risk log**

- **What**: Create baseline snapshot and risk log
- **Branch**: `ops/phase-1-foundation` (first commit)
- **Deliverables**: 8 inventory files + ADR + run-date script
- **Next**: Task 02

### **Task 02: Environment schema + env:doctor**

- **What**: Implement typed env validation + doctor CLI
- **Branch**: `ops/phase-1-foundation` (second commit)
- **Deliverables**: env.ts, flags.ts, env-encryption.ts, env-validation.ts
- **Next**: Task 03

### **Task 03: Admin Diagnostics route**

- **What**: Build protected Diagnostics page with real-time monitoring
- **Branch**: `ops/phase-1-foundation` (third commit)
- **Deliverables**: Diagnostics page + API + real-time updates + benchmarking
- **Next**: Task 04

### **Task 04: Feature tiers + preset wiring**

- **What**: Implement tier logic and load preset JSON
- **Branch**: `ops/phase-1-foundation` (fourth commit)
- **Deliverables**: 3 presets + app.config.ts + migration utilities
- **Next**: Task 05

### **Task 05: CLI initializer npx dct init**

- **What**: Create CLI with intelligent defaults and validation
- **Branch**: `ops/phase-1-foundation` (fifth commit)
- **Deliverables**: CLI + validation + CI mode + templates
- **Next**: Task 06

### **Task 06: CI pipeline scaffold**

- **What**: Add GitHub Actions with optimization and security
- **Branch**: `ops/phase-1-foundation` (final commit)
- **Deliverables**: CI workflow + performance monitoring + security scanning
- **Next**: Phase 2

---

## **PHASE 2: SECURITY & OBSERVABILITY**

**Branch**: `ops/phase-2-security-observability`  
**Goal**: Production-grade security and monitoring  
**Status**: 🔴 Locked (requires Phase 1 completion)

### **Task 07: Renovate (safe auto-updates)**

- **What**: Configure Renovate with security prioritization
- **Branch**: `ops/phase-2-security-observability` (first commit)
- **Deliverables**: renovate.json + health monitoring + vulnerability assessment
- **Next**: Task 08

### **Task 08: Security headers + rate limiting**

- **What**: Add comprehensive security headers and middleware
- **Branch**: `ops/phase-2-security-observability` (second commit)
- **Deliverables**: Security headers + rate limiting + bot detection + logging
- **Next**: Task 09

### **Task 09: SBOM + SAST + dependency scans**

- **What**: Add security scanning to CI pipeline
- **Branch**: `ops/phase-2-security-observability` (third commit)
- **Deliverables**: SBOM + Trivy + CodeQL + compliance reporting
- **Next**: Task 10

### **Task 10: OpenTelemetry + pino logging**

- **What**: Initialize OTel tracing and structured logging
- **Branch**: `ops/phase-2-security-observability` (fourth commit)
- **Deliverables**: OTel init + pino logger + business metrics + profiling
- **Next**: Task 11

### **Task 11: Health/Readiness endpoints + RED metrics**

- **What**: Add comprehensive health monitoring and business metrics
- **Branch**: `ops/phase-2-security-observability` (fifth commit)
- **Deliverables**: Health endpoints + RED metrics + health scoring + monitoring
- **Next**: Task 12

### **Task 12: SLOs + CI guardrails**

- **What**: Define SLOs and implement automated monitoring
- **Branch**: `ops/phase-2-security-observability` (final commit)
- **Deliverables**: SLO monitoring + error budget tracking + business impact + remediation
- **Next**: Phase 3

---

## **PHASE 3: TESTING & QUALITY ASSURANCE**

**Branch**: `ops/phase-3-testing-quality`  
**Goal**: Quality that enforces itself  
**Status**: 🔴 Locked (requires Phase 2 completion)

### **Task 13: Lighthouse CI + performance budgets**

- **What**: Wire Lighthouse CI with performance budgets
- **Branch**: `ops/phase-3-testing-quality` (first commit)
- **Deliverables**: LHCI config + budgets + performance gates
- **Next**: Task 14

### **Task 14: Accessibility (axe + Storybook a11y)**

- **What**: Add automated accessibility testing
- **Branch**: `ops/phase-3-testing-quality` (second commit)
- **Deliverables**: a11y tests + CI integration + compliance reporting
- **Next**: Task 15

### **Task 15: Testing pyramid foundation**

- **What**: Establish comprehensive testing framework
- **Branch**: `ops/phase-3-testing-quality` (third commit)
- **Deliverables**: Unit + integration + e2e tests + coverage gates
- **Next**: Task 16

### **Task 16: Contract tests for integrations**

- **What**: Create mocks and contract tests for external services
- **Branch**: `ops/phase-3-testing-quality` (fourth commit)
- **Deliverables**: Contract tests + mocks + integration validation
- **Next**: Task 17

### **Task 17: Unified error handling + user-safe messages**

- **What**: Introduce AppError types and error mapper
- **Branch**: `ops/phase-3-testing-quality` (final commit)
- **Deliverables**: Error types + handlers + UI notifications + correlation IDs
- **Next**: Phase 4

---

## **PHASE 4: MODULAR ARCHITECTURE & BLOCKS**

**Branch**: `ops/phase-4-blocks-extraction`  
**Goal**: Modular, reusable architecture  
**Status**: 🔴 Locked (requires Phase 3 completion)

### **Task 18: Privacy/consent + audit log**

- **What**: Add consent text and lightweight audit logging
- **Branch**: `ops/phase-4-blocks-extraction` (first commit)
- **Deliverables**: Consent components + audit log + privacy compliance
- **Next**: Task 19

### **Task 19: Supabase RLS policies + tests**

- **What**: Review RLS and add isolation tests
- **Branch**: `ops/phase-4-blocks-extraction` (second commit)
- **Deliverables**: RLS tests + policy fixes + data isolation validation
- **Next**: Task 20

### **Task 20: Block: Form → Table → CSV**

- **What**: Extract universal form-table-csv package
- **Branch**: `ops/phase-4-blocks-extraction` (third commit)
- **Deliverables**: Package + schema + server action + tests + Storybook
- **Next**: Task 21

### **Task 21: Block: Email helper (Resend)**

- **What**: Create emailer package with templates
- **Branch**: `ops/phase-4-blocks-extraction` (fourth commit)
- **Deliverables**: Email helper + templates + contract tests
- **Next**: Task 22

### **Task 22: Block: Uploads & storage**

- **What**: Build safe uploads with RLS-safe storage
- **Branch**: `ops/phase-4-blocks-extraction` (fifth commit)
- **Deliverables**: Upload block + guards + audit logging + validation
- **Next**: Task 23

### **Task 23: Block: Export as PDF**

- **What**: Build DOM-consistent PDF export
- **Branch**: `ops/phase-4-blocks-extraction` (sixth commit)
- **Deliverables**: PDF block + server action + performance testing
- **Next**: Task 24

### **Task 24: Block: Scheduler (link/embed)**

- **What**: Create scheduler supporting link and embed modes
- **Branch**: `ops/phase-4-blocks-extraction` (seventh commit)
- **Deliverables**: Scheduler components + tier-based features + validation
- **Next**: Task 25

### **Task 25: Block: Stripe checkout**

- **What**: Build Stripe checkout with graceful fallbacks
- **Branch**: `ops/phase-4-blocks-extraction` (final commit)
- **Deliverables**: Stripe block + server actions + contract tests + fallbacks
- **Next**: Phase 5

---

## **PHASE 5: PRESETS & BUSINESS LOGIC**

**Branch**: `ops/phase-5-presets-integration`  
**Goal**: Vertical-specific implementations  
**Status**: 🔴 Locked (requires Phase 4 completion)

### **Task 26: Background jobs (weekly digest, Pro+)**

- **What**: Add job runner for weekly KPI digest
- **Branch**: `ops/phase-5-presets-integration` (first commit)
- **Deliverables**: Job runner + error handling + logging + Pro+ features
- **Next**: Task 27

### **Task 27: Role-based access control (admin/staff)**

- **What**: Introduce simple RBAC with guards
- **Branch**: `ops/phase-5-presets-integration` (second commit)
- **Deliverables**: RBAC guards + UI conditionals + tests + documentation
- **Next**: Task 28

### **Task 28: Preset: Salon/Med-Spa Waitlist**

- **What**: Build salon waitlist preset with blocks
- **Branch**: `ops/phase-5-presets-integration` (third commit)
- **Deliverables**: Preset JSON + pages + content + smoke tests
- **Next**: Task 29

### **Task 29: Preset: Realtor Listing Hub**

- **What**: Create realtor listing hub preset
- **Branch**: `ops/phase-5-presets-integration` (fourth commit)
- **Deliverables**: Preset + pages + tests + tier validation
- **Next**: Task 30

### **Task 30: Docs: Handover SOP + Quickstart**

- **What**: Create delivery documentation and quickstart guides
- **Branch**: `ops/phase-5-presets-integration` (final commit)
- **Deliverables**: SOP + Quickstart + Loom script + diagnostics links
- **Next**: Phase 6

---

## **PHASE 6: PRODUCTION READINESS & POLISH**

**Branch**: `ops/phase-6-final-polish`  
**Goal**: Production-ready delivery  
**Status**: 🔴 Locked (requires Phase 5 completion)

### **Task 31: Release: versioning + changelog**

- **What**: Add changesets and version management
- **Branch**: `ops/phase-6-final-polish` (first commit)
- **Deliverables**: Release config + changelog + git tags + automation
- **Next**: Task 32

### **Task 32: Monorepo tooling optimization**

- **What**: Ensure npm workspaces and optimize tooling
- **Branch**: `ops/phase-6-final-polish` (second commit)
- **Deliverables**: Workspace config + scripts + caching + performance
- **Next**: Task 33

### **Task 33: Pre-commit hooks + commitlint**

- **What**: Add pre-commit hooks and commit message validation
- **Branch**: `ops/phase-6-final-polish` (third commit)
- **Deliverables**: Husky + commitlint + lint-staged + validation
- **Next**: Task 34

### **Task 34: Optional: Sentry integration**

- **What**: Add optional error reporting behind feature flag
- **Branch**: `ops/phase-6-final-polish` (fourth commit)
- **Deliverables**: Sentry integration + DSN config + graceful disable
- **Next**: Task 35

### **Task 35: Final validation: clean clone dry-run**

- **What**: Validate template clones in under 60 minutes
- **Branch**: `ops/phase-6-final-polish` (fifth commit)
- **Deliverables**: Validation checklist + smoke tests + performance validation
- **Next**: Task 36

### **Task 36: Post-mortem + backlog + roadmap**

- **What**: Capture lessons learned and plan v1.1
- **Branch**: `ops/phase-6-final-polish` (final commit)
- **Deliverables**: Postmortem + roadmap + GitHub issues + final documentation
- **Next**: COMPLETE

---

## **QUICK COMMAND REFERENCE**

### **Start a New Task**

```
start sos op phase [1-6] task [1-6]
```

### **Examples**

- `start sos op phase 1 task 1` = Baseline snapshot & risk log
- `start sos op phase 2 task 8` = Security headers + rate limiting
- `start sos op phase 3 task 15` = Testing pyramid foundation
- `start sos op phase 4 task 20` = Form → Table → CSV block
- `start sos op phase 5 task 28` = Salon waitlist preset
- `start sos op phase 6 task 35` = Final validation dry-run

### **Phase Status Commands**

- `show phase [1-6] status` = Show phase completion status
- `show phase [1-6] tasks` = List all tasks in a phase
- `show next task` = Show what should be done next
- `show dependencies` = Show phase dependencies

---

## **DEPENDENCY CHAIN**

```
Phase 1 (Foundation) → Phase 2 (Security) → Phase 3 (Testing) → Phase 4 (Blocks) → Phase 5 (Presets) → Phase 6 (Polish)
```

**Each phase must be completed and merged before starting the next phase.**

---

## **COMPLETION CHECKLIST**

- [ ] **Phase 1**: Foundation & Infrastructure (6/6 tasks)
- [ ] **Phase 2**: Security & Observability (6/6 tasks)
- [ ] **Phase 3**: Testing & Quality Assurance (5/5 tasks)
- [ ] **Phase 4**: Modular Architecture & Blocks (8/8 tasks)
- [ ] **Phase 5**: Presets & Business Logic (5/5 tasks)
- [ ] **Phase 6**: Production Readiness & Polish (6/6 tasks)

**Total Progress**: 0/36 tasks completed (0%)
