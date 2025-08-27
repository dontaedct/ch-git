# Cleanup Candidates Report - 2025-08-27

## Files/Directories Likely Removable

### High Confidence
- `test-simple.js` - Simple test file, likely unused
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: No imports found, appears to be leftover test file

- `test-husky.txt` - Husky test file
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: No references found, appears to be test artifact

- `test-commit.txt` - Commit test file
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: No references found, appears to be test artifact

- `test-guard-trigger.md` - Guard trigger test
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: No references found, appears to be test artifact

- `tash list` - Appears to be typo/leftover
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: No clear purpose, likely typo of "task list"

- `tatus` - Appears to be typo/leftover
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: No clear purpose, likely typo of "status"

- `tatus --porcelain` - Appears to be typo/leftover
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: No clear purpose, likely typo of "status --porcelain"

- `h --force-with-lease` - Git command artifact
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: Appears to be git command output artifact

- `e --abbrev-ref HEAD` - Git command artifact
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: Appears to be git command output artifact

- `e --short HEAD` - Git command artifact
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: Appears to be git command output artifact

- `5` - Unknown file with just "5" content
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: No clear purpose, appears to be artifact

### Medium Confidence
- `tsconfig.backup.aliases.json` - Backup config file
  - **Tool**: Manual inspection
  - **Confidence**: Medium
  - **Reason**: Backup file, may be needed for reference

- `tsconfig.backup.json` - Backup config file
  - **Tool**: Manual inspection
  - **Confidence**: Medium
  - **Reason**: Backup file, may be needed for reference

- `tsconfig.ai.json` - AI-specific config
  - **Tool**: Manual inspection
  - **Confidence**: Medium
  - **Reason**: May be used by AI tools, needs verification

## Unused Exports (High Confidence)

### From ts-prune analysis:
- `lib/ai/tools/cost.ts:24 - CostEstimator` - Unused cost estimator
- `lib/ai/tools/retry.ts:57 - RetryManager` - Unused retry manager
- `lib/ai/tools/safety.ts:21 - SafetyTools` - Unused safety tools
- `lib/ai/tools/schema.ts:39 - createSchema` - Unused schema creator
- `lib/ai/tools/schema.ts:30 - IncidentReportType` - Unused type
- `lib/ai/tools/schema.ts:31 - SpecDocType` - Unused type
- `lib/ai/tools/schema.ts:52 - AITaskSchema` - Unused schema
- `lib/ai/tools/schema.ts:53 - AIInputSchema` - Unused schema
- `lib/ai/tools/schema.ts:54 - AIOutputSchema` - Unused schema
- `lib/ai/tools/trace.ts:103 - tracer` - Unused tracer
- `lib/ai/tools/trace.ts:104 - trace` - Unused trace function
- `lib/ai/tools/trace.ts:105 - traceAI` - Unused AI trace function
- `lib/ai/tools/trace.ts:108 - traceAIFlagTransition` - Unused flag transition trace

## Unused Dependencies (High Confidence)

### From depcheck analysis:
- `@supabase/auth-helpers-nextjs` - Unused auth helpers
- `stripe` - Unused Stripe dependency
- `uuid` - Unused UUID dependency

### Unused devDependencies:
- `@testing-library/react` - Unused testing library
- `@testing-library/user-event` - Unused user event testing
- `@types/jest` - Unused Jest types
- `@types/uuid` - Unused UUID types
- `autoprefixer` - Unused autoprefixer
- `depcheck` - Analysis tool (can be removed after cleanup)
- `eslint-plugin-unused-imports` - Analysis tool (can be removed after cleanup)
- `jest-environment-jsdom` - Unused Jest environment
- `knip` - Analysis tool (can be removed after cleanup)
- `postcss` - Unused PostCSS
- `ts-prune` - Analysis tool (can be removed after cleanup)

### Extraneous Dependencies:
- `@emnapi/runtime` - Marked as extraneous by npm

## Unused NPM Scripts (Medium Confidence)

### High Confidence:
- `help` - Help script, likely unused in CI
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: No references in CI or other scripts

### Medium Confidence:
- `tool:test:watch` - Watch mode test script
  - **Tool**: Manual inspection
  - **Confidence**: Medium
  - **Reason**: Development-only script, may be useful for devs

- `tool:ai:evaluate` - AI evaluation script
  - **Tool**: Manual inspection
  - **Confidence**: Medium
  - **Reason**: No configured evaluations, may be placeholder

- `tool:ai:eval:ci` - AI CI evaluation script
  - **Tool**: Manual inspection
  - **Confidence**: Medium
  - **Reason**: No configured CI evaluations, may be placeholder

## Large Binary Assets

### High Confidence:
- `tsconfig.tsbuildinfo` (428KB) - TypeScript build info cache
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: Generated cache file, can be regenerated

- `.tsbuildinfo` (421KB) - TypeScript build info cache
  - **Tool**: Manual inspection
  - **Confidence**: High
  - **Reason**: Generated cache file, can be regenerated

## Protected Areas (Never Auto-Delete)

The following areas are protected and should never be automatically deleted:
- `/app/**` (Next.js routes)
- `/lib/**` (core libraries)
- `/supabase/**` (database)
- `/n8n/**` (workflows)
- `/tests/**` (test files)
- `/examples/**` (example code)
- `/config/**` (configuration)
- CI workflows
- Database migrations

## Next Steps

1. **Phase A**: Quarantine high-confidence files
2. **Phase B**: Remove unused dependencies
3. **Phase C**: Clean up npm scripts
4. **Phase D**: Archive old reports
5. **Validation**: Run full CI pipeline to ensure nothing breaks
