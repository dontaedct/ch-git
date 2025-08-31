# SOS Ops — Phase 6 / Task 32

## Intake

- Task ID: sos-op-phase-6-task-32
- Status: completed
- Created: 2025-08-31
- Owner: Automation

## Objective

Establish the SOS Ops runbook structure and index for Phase 6, Task 32 so future tasks have a consistent, discoverable template. Success = new runbook created under `docs/ops/sos/phase-6/`, linked from an SOS index, and repository health verified for doc-only change.

## Constraints

- Technical: Documentation-only; no functional code changes; minimal diffs.
- Operational: Keep within existing repo conventions and Universal Header.
- Compliance/Safety: Do not alter security posture or expose secrets.

## Scope

- In scope: Create task runbook file; add SOS index entry; validate with doctor/check.
- Out of scope: CI pipeline changes, production configuration, app behavior modifications.

## Deliverables

- `docs/ops/sos/phase-6/task-32.md` (this runbook)
- `docs/ops/sos/README.md` (index linking Phase 6 → Task 32)

## Definition of Done

- Runbook scaffold written and populated with objective, scope, constraints, DoD, risks, evidence placeholders.
- SOS index added with a direct link to this task.
- `npm run tool:doctor` and `npm run tool:check` pass locally for this doc-only change.
- No updates required to `docs/CHANGE_JOURNAL.md` (no registry/public contract touched).

## Steps

1. Create runbook template under `docs/ops/sos/phase-6/`.
2. Add SOS index with link to Task 32.
3. Validate repository with `tool:doctor` and `tool:check`.
4. Mark task status as completed; await next task.

## Risks & Mitigations

- Risk: Doc location not easily discoverable.
  - Mitigation: Add `docs/ops/sos/README.md` index and clear path naming.
- Risk: CI impact from doc changes.
  - Mitigation: Limit to docs; validate with doctor/check locally.

## Evidence

- Files:
  - `docs/ops/sos/phase-6/task-32.md`
  - `docs/ops/sos/README.md`
- Validation:
  - `npm run tool:doctor` → OK
  - `npm run tool:check` (lint+typecheck) → OK (warnings only; no failures)

---

Note: If a future change for this task touches registries or public contracts, update `docs/CHANGE_JOURNAL.md` in the same commit per Universal Header.
