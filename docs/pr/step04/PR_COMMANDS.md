# Step 04 PR Commands - Webhook Security

## Git Commands

### Create and Push Branch
```bash
git checkout -b backfill/step-04-webhook-security-20250825
git add -A
git commit -m "chore(step 04): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-04-webhook-security-20250825
```

## GitHub CLI Commands

### Create PR with GitHub CLI
```bash
gh pr create --base main --head backfill/step-04-webhook-security-20250825 \
  --title "[Backfill Step 04] Webhook Security — 2025-08-25" \
  --body-file docs/pr/step04/PR_BODY.md
```

## Manual GitHub Workflow

### 1. Push Branch
After running the git commands above, GitHub will show a yellow "Compare & pull request" banner.

### 2. Click Banner
Click the "Compare & pull request" button to open the PR creation page.

### 3. Fill PR Details
- **Title**: `[Backfill Step 04] Webhook Security — 2025-08-25`
- **Description**: Copy content from `docs/pr/step04/PR_BODY.md`
- **Base Branch**: `main`
- **Head Branch**: `backfill/step-04-webhook-security-20250825`

### 4. Add Labels
- `backfill`
- `step-04`
- `webhooks`
- `security`
- `documentation`

### 5. Assign Reviewers
- Assign appropriate team members
- Request review from maintainers

### 6. Create PR
Click "Create pull request" to submit.

## GitLab Commands (Alternative)

### Create and Push Branch
```bash
git checkout -b backfill/step-04-webhook-security-20250825
git add -A
git commit -m "chore(step 04): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-04-webhook-security-20250825
```

### Create MR with GitLab CLI
```bash
glab mr create --base main --head backfill/step-04-webhook-security-20250825 \
  --title "[Backfill Step 04] Webhook Security — 2025-08-25" \
  --description "$(cat docs/pr/step04/PR_BODY.md)"
```

## Post-Creation Steps

### 1. Verify PR Created
- Check that PR appears in repository
- Verify title and description are correct
- Confirm base and head branches are correct

### 2. Run CI Checks
- Wait for CI pipeline to complete
- Verify all checks pass including webhook security tests
- Address any failures

### 3. Add CI Results
- Copy CI output to `docs/pr/step04/checks.txt`
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

### Test Webhook Security
```bash
npm run test:webhooks
npm run test:webhooks -- --testNamePattern="verifyHmac"
npm run test:webhooks -- --testNamePattern="idempotency"
npm run test:webhooks -- --testNamePattern="replay"
```

### Test Integration
```bash
npm run test:webhooks -- --testNamePattern="integration"
```

## Troubleshooting

### If Branch Already Exists
```bash
git checkout main
git branch -D backfill/step-04-webhook-security-20250825
git checkout -b backfill/step-04-webhook-security-20250825
```

### If Push Fails
```bash
git push --force-with-lease origin backfill/step-04-webhook-security-20250825
```

### If PR Creation Fails
- Check GitHub CLI authentication: `gh auth status`
- Verify repository permissions
- Try manual PR creation via web interface

### If Webhook Tests Fail
- Check test configuration
- Verify webhook test files exist
- Review test output for specific failures
- Ensure all dependencies are installed

## Notes

- This is a documentation-only PR
- No code changes to application behavior
- Focus on webhook security
- Foundation for subsequent hardening steps
- Enhanced security posture
