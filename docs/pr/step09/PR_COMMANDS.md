# Step 09: Seeds Tests - PR Commands

## GitHub Commands

```bash
# Create and push the branch
git checkout -b backfill/step-09-seeds-tests-20250825
git add -A
git commit -m "chore(step 09): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-09-seeds-tests-20250825

# Create PR via GitHub CLI (if available)
gh pr create --title "Step 09: Seeds Tests - Comprehensive Test Coverage" --body-file docs/pr/step09/PR_BODY.md --base main --head backfill/step-09-seeds-tests-20250825

# Or create PR manually via GitHub web interface
# 1. Go to: https://github.com/your-org/your-repo/compare/main...backfill/step-09-seeds-tests-20250825
# 2. Use title: "Step 09: Seeds Tests - Comprehensive Test Coverage"
# 3. Use body from: docs/pr/step09/PR_BODY.md
```

## GitLab Commands

```bash
# Create and push the branch
git checkout -b backfill/step-09-seeds-tests-20250825
git add -A
git commit -m "chore(step 09): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-09-seeds-tests-20250825

# Create MR via GitLab CLI (if available)
glab mr create --title "Step 09: Seeds Tests - Comprehensive Test Coverage" --description-file docs/pr/step09/PR_BODY.md --target-branch main --source-branch backfill/step-09-seeds-tests-20250825

# Or create MR manually via GitLab web interface
# 1. Go to: https://gitlab.com/your-org/your-repo/-/merge_requests/new?merge_request[source_branch]=backfill/step-09-seeds-tests-20250825&merge_request[target_branch]=main
# 2. Use title: "Step 09: Seeds Tests - Comprehensive Test Coverage"
# 3. Use description from: docs/pr/step09/PR_BODY.md
```

## Manual PR Creation

### GitHub Web Interface
1. Navigate to: `https://github.com/your-org/your-repo/compare/main...backfill/step-09-seeds-tests-20250825`
2. **Title**: `Step 09: Seeds Tests - Comprehensive Test Coverage`
3. **Description**: Copy content from `docs/pr/step09/PR_BODY.md`
4. **Base branch**: `main`
5. **Head branch**: `backfill/step-09-seeds-tests-20250825`
6. **Labels**: `documentation`, `testing`, `security`, `step-09`
7. **Reviewers**: Assign appropriate reviewers
8. **Assignees**: Assign yourself
9. Click "Create pull request"

### GitLab Web Interface
1. Navigate to: `https://gitlab.com/your-org/your-repo/-/merge_requests/new?merge_request[source_branch]=backfill/step-09-seeds-tests-20250825&merge_request[target_branch]=main`
2. **Title**: `Step 09: Seeds Tests - Comprehensive Test Coverage`
3. **Description**: Copy content from `docs/pr/step09/PR_BODY.md`
4. **Source branch**: `backfill/step-09-seeds-tests-20250825`
5. **Target branch**: `main`
6. **Labels**: `documentation`, `testing`, `security`, `step-09`
7. **Assignees**: Assign yourself
8. **Reviewers**: Assign appropriate reviewers
9. Click "Create merge request"

## PR Template Usage

The PR will automatically use the template from `.github/pull_request_template.md` which includes:
- ✅ **Type**: Documentation
- ✅ **Scope**: Step 09 - Seeds Tests
- ✅ **Description**: Comprehensive test coverage establishment
- ✅ **Testing**: All test suites validated
- ✅ **Security**: Security testing implemented
- ✅ **Documentation**: Complete documentation provided

## Validation Commands

After creating the PR, run these commands to validate:

```bash
# Verify all test files exist
ls -la tests/policy/import-alias.test.ts
ls -la tests/rls/tenant-isolation.test.ts
ls -la tests/guardian/heartbeat-throttling.test.ts
ls -la tests/playwright/smoke.spec.ts
ls -la tests/playwright/security-headers.spec.ts
ls -la tests/webhooks/verifyHmac.test.ts
ls -la tests/csp/security-headers.test.ts

# Verify test data files
ls -la data/sessions.ts
ls -la data/clients.ts

# Verify test scripts
ls -la scripts/security-headers.mjs

# Run test validation
npm test
npm run test:policy
npm run test:rls
npm run test:guardian
npm run test:smoke
npm run test:csp
npm run test:webhooks
npm run security:headers
```

## Expected PR Content

The PR should include:
- ✅ **7 test files** with comprehensive test coverage
- ✅ **2 test data files** with mock data
- ✅ **1 test script** for security header validation
- ✅ **Complete documentation** in `docs/pr/step09/`
- ✅ **Evidence file** with detailed test coverage
- ✅ **Validation checks** confirming all requirements met
- ✅ **PR commands** for easy PR creation

## Review Checklist

When reviewing this PR, verify:
- ✅ All test files are present and functional
- ✅ Test coverage includes all required areas
- ✅ Security tests are comprehensive
- ✅ UI tests cover critical functionality
- ✅ Documentation is complete and accurate
- ✅ CI integration is working
- ✅ No breaking changes introduced
- ✅ All tests pass successfully
