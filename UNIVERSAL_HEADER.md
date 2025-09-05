UNIVERSAL HEADER



- Read & obey: /docs/AI_RULES.md and /docs/RENAMES.md, then open /AI_ENTRYPOINT.md.

- Never rename/move directly; use ONLY:

  npm run rename:symbol -- OldName NewName

  npm run rename:import -- @data/old @data/new

  npm run rename:route -- oldKey newKey

  npm run rename:table -- old_table new_table

- Imports must use ONLY: @app/* @data/* @lib/* @ui/* @registry/* @compat/* (no ../ or src/*).

- Process: AUDIT → DECIDE (state reasons) → APPLY minimal diffs → VERIFY:

  run npm run doctor && npm run ci and fix-forward until green; do not commit if red.

- Registries: If touching src/registry/*, append an entry to /docs/CHANGE_JOURNAL.md in the SAME commit.

- Security: Never weaken RLS or expose secrets/keys/env.

- Reporting: Only if findings > 10 or multi-area; keep ≤200 lines under /reports/.

- Task intake: Accept any format. Extract Objective, Constraints, Scope (in/out), Deliverables, DoD.

  If info is missing, proceed with explicit assumptions and make minimal diffs.

- COMPREHENSIVE SEARCH PROTOCOL: Before making claims about system completeness, automatically run:
  
  npm run hero:tasks:verify  # Verify all hero tasks
  
  Then use codebase_search with broad queries, glob_file_search for patterns, then read specific files.
  
  Never assume partial data represents complete systems. Always verify completeness before conclusions.

Ack exactly one:

"Master rules loaded; standing by for <TASK_ID>."  OR  "Master rules loaded; proceeding with <TASK_ID>."
