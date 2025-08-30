# AI Evaluations (Optional)

**What:** Optional CI lane that runs only when:
- PR has label **`ai-evals`**, or
- Manually triggered via *Actions → AI Evaluations → Run workflow*.

**How it runs:** Looks for `npm run ai:eval:ci` (preferred) or `npm run ai:evaluate`.  
If neither exists, it posts a friendly skip comment and exits 0.  
Any files under `artifacts/ai-evals/**` are uploaded as CI artifacts.

**Typical uses:**
- LLM prompt regression checks
- E2E golden-answer comparisons
- Offline scoring on generated content

**Add real evals:**
- Implement `ai:eval:ci` in `package.json` (call your runner).
- Save outputs to `artifacts/ai-evals/`.
- Label the PR with **`ai-evals`**.

## Setup

1. **Bootstrap labels:** Run *Actions → Label Bootstrap → Run workflow* once
2. **Test:** Add `ai-evals` label to any PR to trigger evaluations
3. **Customize:** Replace stub scripts in `package.json` with your evaluation logic

## Workflow Behavior

- **PR without `ai-evals` label:** Skips with explanatory comment
- **PR with `ai-evals` label:** Runs evaluations if scripts exist
- **Manual trigger:** Always attempts to run (bypasses label check)
- **Artifacts:** Uploads `artifacts/ai-evals/**` if present
- **Comments:** Provides feedback on PR about what happened
