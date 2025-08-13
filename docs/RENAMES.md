# Rename Playbook — Scripts Only

Never rename or move files/symbols/routes/tables directly. Use these commands so compat, registries, tests, and CI stay coherent.

## Pre-checks

1) Scan for where the thing is used (exports, API, registry keys, routes, table names).

2) Decide the target name/path and whether a compat re-export is needed.

3) Open /docs/CHANGE_JOURNAL.md (append in the same commit if registries/public API change).

## Commands

- Symbol: npm run rename:symbol -- OldName NewName  

  (Safe identifier rename; adds deprecated re-export in @compat/* if needed.)

- Import path: npm run rename:import -- @data/old @data/new  

  (Updates import specifiers; add compat if needed.)

- Route key: npm run rename:route -- oldKey newKey  

  (Updates src/registry/routes.ts first, then usages.)

- Table name: npm run rename:table -- old_table new_table  

  (Updates src/registry/tables.ts; follow-up SQL migration may be required.)

## Required steps (each rename)

1) Run the appropriate command above.  

2) VERIFY: npm run doctor && npm run ci → fix-forward to green.  

3) CHANGE_JOURNAL: if src/registry/* or any public API changed, append entry (what/why/scope/migration/date).  

4) Tests: update/extend registry contract + affected modules.  

5) Compat: keep @compat/* deprecated exports until all consumers migrate.  

## Commit template

chore(rename): <old> → <new> via script

- Command: npm run rename:<symbol|import|route|table> -- ...

- Compat: <kept|added|not required>

- Journal: updated /docs/CHANGE_JOURNAL.md

## What the policy enforcer blocks

- Imports using src/* or deep relatives across modules.

- Changes under src/registry/* without a CHANGE_JOURNAL entry in the same commit.

- Deletes/moves without rename scripts/compat updates.

## Verification checklist

- Aliases only; no deep relatives

- Script used (not manual)

- Doctor clean; CI green

- CHANGE_JOURNAL updated (if registry/public)

- Compat present (until migration complete)
