UNIVERSAL HEADER 

SCOPE & AUTODETECT (no manual edits)
- Repo context: If a Git repo + package.json exist, treat process.cwd() as repo root; else operate in "projectless" mode (skip Git-only steps).
- Frameworks: Detect Next.js by checking package.json dependencies for "next". Detect monorepo via package.json.workspaces or pnpm/yarn workspaces.
- Aliases: Read tsconfig.json/tsconfig.*.json compilerOptions.paths. Use those as the ONLY allowed import aliases. If none, allow relative imports but prefer one-hop (./, ../) only.
- Rename tools: If package.json has scripts rename:* use them; else generate minimal codemods (tsserver/jscodeshift) and print unified diffs first.
- Config profile: If .promptops.json exists, read timeouts/paths/policies from it. If absent, use safe defaults below without asking for edits.
- CI mode: Detect via CI env vars; mirror pre-push steps exactly but with CI-safe flags.

GOVERNANCE (Audit → Decide → Apply → Verify)
- AUDIT: Extract Objective, Constraints, In/Out of Scope, Deliverables, DoD. If info is missing, proceed with explicit assumptions + smallest diffs.
- DECIDE: Prefer provable, deterministic changes; never speculative ML orchestration.
- APPLY: Smallest possible diffs; never weaken RLS, auth, or expose secrets. Print unified diffs for file replacements/moves; if too large, write to .backups/_patches/<ts>.diff.
- VERIFY: If repo present, run npm run doctor && npm run ci (or their detected equivalents). Fix-forward until green. Do not commit if red.

RUNTIME & SECRETS (auto-guard)
- Any step touching secrets, service-role keys, child_process, or filesystem backups:
  - Force Node runtime only. If Next.js app detected, then for any route touched add: `export const runtime = 'nodejs'` (never Edge).
- Secret detectors (deny in client/edge bundles): service-role/administrative Supabase keys, raw SMTP creds, Resend/SendGrid tokens, JWT signing keys, OAuth client secrets.
- Backups default **off-repo** (e.g., OS user data dir). Inside repo only keep tiny JSON pointers ring buffer at `.backups/meta/` (git-ignored).

ACCESSIBILITY BASELINE (always-on)
- Never introduce clickable <div> or <span> for actions. Use <button> (actions) or <a>/<Link> (navigation).
- If ESLint present, enable/extend a11y rules to enforce buttons/anchors over divs; auto-fix where safe.

TIMEOUTS (hard caps; auto-configurable)
- Defaults (overridable by .promptops.json or package.json.config.promptops):
  lint 30s, typecheck 60s, build 120s, policy 60s, validators 30s, backups 60s, orchestrator as configured.
- Abort steps cleanly on timeout; print reason + next steps.

LOGGING, REPORTS, TELEMETRY (bounded noise)
- Step line (exactly one per step): `STEP <name> <ms> <ok|fail>`
- Reports: only if findings > 10 or multi-area; cap at 200 lines; strip PII; save under /reports/.
- Telemetry (if pre-push/CI): one final compact JSON: 
  {"pipeline":"<prepush|ci>","steps":[{"n":"lint","ms":...,"ok":true},...],"commit":"<sha>","ts":"<iso8601>"}

ORCHESTRATION & EXCLUSIVITY (portable)
- Single orchestrator entrypoint if present: prefer scripts/orchestrator.(ts|cjs|js). Create exclusive lock `.automation.lock` via O_EXCL; refuse if locked.
- Always cleanup lock + kill children on SIGINT/SIGTERM/exit.
- Keep total console output ≤ 200 lines per run (truncate tails).

RENAME & IMPORT DISCIPLINE (auto-detect)
- If rename scripts exist, use ONLY:
  npm run rename:symbol -- OldName NewName
  npm run rename:import -- <fromAlias> <toAlias>
  npm run rename:route  -- oldKey newKey
  npm run rename:table  -- old_table new_table
- Otherwise: generate codemods using current tsconfig paths; apply minimal diffs; show unified diff; proceed only if doctor+ci go green.

CROSS-TOOL IGNORES (auto-apply if repo)
- Ensure Git/TS/ESLint/Jest ignore the following if paths exist: .backups/, exports/, tmp/ics/, reports/, .next/, coverage/, *.cache. 
- Verify with: `tsc --listFilesOnly` contains none of the ignored trees.

PRE-PUSH / CI SINGLE GATE (if repo)
- One gate mirrored in CI; run with spawnSync, shell:false, cwd=repoRoot, per-step timeouts, friendly summaries.
- Sequence (skip non-existent gracefully): lint → typecheck → build → test → policy → validators → (optional) rls → (optional) backup.
- Abort on first failure; print exit code; no subsequent steps.

POLICY ENFORCER (if policy script present)
- Run `npm run policy` (or node scripts/policy-enforcer.(cjs|js)) and fail on:
  - secret exposure in client/edge bundles
  - server-only imports used from client files (AST)
  - Next.js routes that spawn processes but lack `export const runtime = 'nodejs'`

RLS SMOKE (if Supabase + tests present)
- Run minimal two-tenant RLS tests; assert A↛B and A→A; same for B; signed URL isolation; fail with rule ID + path only.

CRON PARITY (if Next + Vercel or cron config)
- Map cron routes → orchestrator groups via scripts/cron-runner.(cjs|js); ensure local `node scripts/cron-runner` matches deployed schedule.

CSV/ICS VALIDATORS (if exports exist)
- CSV: header whitelist, UTF-8, row count > 0, no forbidden PII fields.
- ICS: UID/DTSTART/DTEND/TZ/summary sanity + size bounds.

ROLLBACK POLICY (non-interactive safe)
- Print unified diffs before large changes. If interactive ACK isn't possible, apply changes in a new branch `safety/<ts>` and leave diffs at `.backups/_patches/<ts>.diff` for review.

DOC DISCIPLINE (optional but supported)
- If docs exist (COACH_HUB.md, AI_RULES.md, RENAMES.md), read and follow. If not, fall back to README/CONTRIBUTING if present. If none, proceed with conservative defaults.

ACK (consistent handoff)
- Respond with exactly one:
  "Master rules loaded; standing by for <TASK_ID>." 
  OR 
  "Master rules loaded; proceeding with <TASK_ID>."
