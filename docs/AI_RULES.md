# AI Rules — Repo Guardrails

## Purpose

Make every AI session safe and consistent. Memory lives in the repo, not the chat.

## Hard Rules

1) No manual renames/moves. Use ONLY:

   - npm run rename:symbol -- OldName NewName

   - npm run rename:import -- @data/old @data/new

   - npm run rename:route -- oldKey newKey

   - npm run rename:table -- old_table new_table

2) Imports = aliases only: @app/* @data/* @lib/* @ui/* @registry/* @compat/*  

   - Never deep relatives like ../ across modules; never raw src/*.

3) Registries are sources of truth (routes, tables, emails, flags under src/registry/*).  

   - Update related tests AND append to /docs/CHANGE_JOURNAL.md in the SAME commit.

4) Security: Never weaken RLS/authz/validation; never expose secrets/keys/env.

5) Compat required: keep deprecated re-exports in @compat/* during migrations.

6) Validate boundaries: use Zod (or equivalent) for external inputs/outputs.

7) VERIFY loop every time:  

   - npm run doctor → apply suggested fixes  

   - npm run ci → fix-forward until green  

   - Do NOT commit if red.

8) Policy fences (ESLint/hooks/policy enforcer) may block unsafe diffs; follow messages exactly.

9) Reports: only if findings > 10 or span multiple areas; keep ≤ 200 lines under /reports/.

10) Task intake: Accept any format. Extract Objective, Constraints, Scope (in/out), Deliverables, Definition of Done.  

    If info is missing, proceed with explicit assumptions and make minimal diffs.

## Workflow

AUDIT → DECIDE (state reasons) → APPLY minimal diffs → VERIFY (doctor & ci) → Commit.

### Commit checklist

- Aliases only

- Rename scripts used (if applicable)

- CHANGE_JOURNAL updated (if touching registries/public API)

- CI green

## Required Acknowledgement (for chat AIs)

Reply with exactly one:

- "Master rules loaded; standing by for <TASK_ID>."

- "Master rules loaded; proceeding with <TASK_ID>."

