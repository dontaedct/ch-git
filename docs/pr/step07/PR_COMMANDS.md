# Step 07 PR Commands - CI Gate

## Git Commands

### Create and Push Branch
```bash
git checkout -b backfill/step-07-ci-gate-20250825
git add -A
git commit -m "chore(step 07): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-07-ci-gate-20250825
```

## GitHub CLI Commands

### Create PR with GitHub CLI
```bash
gh pr create --base main --head backfill/step-07-ci-gate-20250825 \
  --title "[Backfill Step 07] CI Gate — 2025-08-25" \
  --body-file docs/pr/step07/PR_BODY.md
```

## Manual GitHub Workflow

### 1. Push Branch
After running the git commands above, GitHub will show a yellow "Compare & pull request" banner.

### 2. Click Banner
Click the "Compare & pull request" button to open the PR creation page.

### 3. Fill PR Details
- **Title**: `[Backfill Step 07] CI Gate — 2025-08-25`
- **Description**: Copy content from `docs/pr/step07/PR_BODY.md`
- **Base Branch**: `main`
- **Head Branch**: `backfill/step-07-ci-gate-20250825`

### 4. Add Labels
- `backfill`
- `step-07`
- `ci`
- `pipeline`
- `documentation`

### 5. Assign Reviewers
- Assign appropriate team members
- Request review from maintainers

### 6. Create PR
Click "Create pull request" to submit.

## GitLab Commands (Alternative)

### Create and Push Branch
```bash
git checkout -b backfill/step-07-ci-gate-20250825
git add -A
git commit -m "chore(step 07): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-07-ci-gate-20250825
```

### Create MR with GitLab CLI
```bash
glab mr create --base main --head backfill/step-07-ci-gate-20250825 \
  --title "[Backfill Step 07] CI Gate — 2025-08-25" \
  --description "$(cat docs/pr/step07/PR_BODY.md)"
```

## Post-Creation Steps

### 1. Verify PR Created
- Check that PR appears in repository
- Verify title and description are correct
- Confirm base and head branches are correct

### 2. Run CI Checks
- Wait for CI pipeline to complete
- Verify all checks pass including CI gate tests
- Address any failures

### 3. Add CI Results
- Copy CI output to `docs/pr/step07/checks.txt`
- Update with actual results
- Document any issues found

### 4. Request Review
- Assign reviewers
- Add appropriate labels
- Request review from team

### 5. Merge When Ready
- Ensure all checks pass
- Get required approvals
- Merge using "Squash and merge"
- Delete branch after merge

## Verification Commands

### Test CI Pipeline
```bash
npm run ci
npm run lint
npm run typecheck
npm run security:test
npm run policy:enforce
npm run guard:test
npm run ui:contracts
npm run test
npm run build
```

### Test Safety Gate
```bash
npm run typecheck
npm run build:robust
npm audit --audit-level=moderate
npm run lint
npm test
```

### Test Build Robustness
```bash
npm run build:robust
```

## Troubleshooting

### If Branch Already Exists
```bash
git checkout main
git branch -D backfill/step-07-ci-gate-20250825
git checkout -b backfill/step-07-ci-gate-20250825
```

### If Push Fails
```bash
git push --force-with-lease origin backfill/step-07-ci-gate-20250825
```

### If PR Creation Fails
- Check GitHub CLI authentication: `gh auth status`
- Verify repository permissions
- Try manual PR creation via web interface

### If CI Pipeline Fails
- Check individual components
- Verify environment variables
- Review build configuration
- Ensure all dependencies are installed

### If Safety Gate Fails
- Check required vs advisory jobs
- Verify timeout settings
- Review job dependencies
- Ensure proper error handling

## CI Pipeline Verification

### Test Complete Pipeline
```bash
# Run complete CI pipeline
npm run ci

# Check exit code
echo $?
```

### Test Individual Components
```bash
# Test each component individually
npm run lint && echo "Lint passed"
npm run typecheck && echo "Typecheck passed"
npm run security:test && echo "Security passed"
npm run policy:enforce && echo "Policy passed"
npm run guard:test && echo "Guard passed"
npm run ui:contracts && echo "UI contracts passed"
npm run test && echo "Tests passed"
npm run build && echo "Build passed"
```

### Test Matrix Compatibility
```bash
# Test with different Node.js versions
node --version
npm --version

# Test CI with current Node.js version
npm run ci
```

## Environment Verification

### Check Environment Variables
```bash
# Check environment validation
npm run check:env

# Check security secrets
npm run security:secrets
```

### Test Build Environment
```bash
# Test build with fallbacks
npm run build:robust

# Check build artifacts
ls -la .next/
```

## GitHub Actions Verification

### Check Workflow Files
```bash
# Verify workflow files exist
ls -la .github/workflows/

# Check workflow syntax
cat .github/workflows/ci.yml
cat .github/workflows/safety-gate.yml
```

### Test Workflow Triggers
```bash
# Check workflow triggers
grep -A 5 "on:" .github/workflows/ci.yml
grep -A 5 "on:" .github/workflows/safety-gate.yml
```

## Notes

- This is a documentation-only PR
- No code changes to application behavior
- Focus on CI pipeline optimization
- Foundation for subsequent hardening steps
- Enhanced CI reliability and efficiency
