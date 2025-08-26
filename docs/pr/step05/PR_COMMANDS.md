# Step 05 PR Commands - Feature Flags

## Git Commands

### Create and Push Branch
```bash
git checkout -b backfill/step-05-feature-flags-20250825
git add -A
git commit -m "chore(step 05): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-05-feature-flags-20250825
```

## GitHub CLI Commands

### Create PR with GitHub CLI
```bash
gh pr create --base main --head backfill/step-05-feature-flags-20250825 \
  --title "[Backfill Step 05] Feature Flags — 2025-08-25" \
  --body-file docs/pr/step05/PR_BODY.md
```

## Manual GitHub Workflow

### 1. Push Branch
After running the git commands above, GitHub will show a yellow "Compare & pull request" banner.

### 2. Click Banner
Click the "Compare & pull request" button to open the PR creation page.

### 3. Fill PR Details
- **Title**: `[Backfill Step 05] Feature Flags — 2025-08-25`
- **Description**: Copy content from `docs/pr/step05/PR_BODY.md`
- **Base Branch**: `main`
- **Head Branch**: `backfill/step-05-feature-flags-20250825`

### 4. Add Labels
- `backfill`
- `step-05`
- `feature-flags`
- `database`
- `documentation`

### 5. Assign Reviewers
- Assign appropriate team members
- Request review from maintainers

### 6. Create PR
Click "Create pull request" to submit.

## GitLab Commands (Alternative)

### Create and Push Branch
```bash
git checkout -b backfill/step-05-feature-flags-20250825
git add -A
git commit -m "chore(step 05): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-05-feature-flags-20250825
```

### Create MR with GitLab CLI
```bash
glab mr create --base main --head backfill/step-05-feature-flags-20250825 \
  --title "[Backfill Step 05] Feature Flags — 2025-08-25" \
  --description "$(cat docs/pr/step05/PR_BODY.md)"
```

## Post-Creation Steps

### 1. Verify PR Created
- Check that PR appears in repository
- Verify title and description are correct
- Confirm base and head branches are correct

### 2. Run CI Checks
- Wait for CI pipeline to complete
- Verify all checks pass including feature flag tests
- Address any failures

### 3. Add CI Results
- Copy CI output to `docs/pr/step05/checks.txt`
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

### Test Feature Flags
```bash
npm run test
npm run test -- --testNamePattern="feature.*flag"
npm run test -- --testNamePattern="admin.*flag"
npm run test -- --testNamePattern="tenant.*isolation"
```

### Test Database
```bash
npm run test -- --testNamePattern="migration.*flag"
npm run test -- --testNamePattern="rls.*flag"
```

### Test Caching
```bash
npm run test -- --testNamePattern="cache.*flag"
```

## Troubleshooting

### If Branch Already Exists
```bash
git checkout main
git branch -D backfill/step-05-feature-flags-20250825
git checkout -b backfill/step-05-feature-flags-20250825
```

### If Push Fails
```bash
git push --force-with-lease origin backfill/step-05-feature-flags-20250825
```

### If PR Creation Fails
- Check GitHub CLI authentication: `gh auth status`
- Verify repository permissions
- Try manual PR creation via web interface

### If Feature Flag Tests Fail
- Check database connection
- Verify Supabase configuration
- Review migration status
- Ensure RLS policies are active

### If Admin UI Tests Fail
- Check admin role configuration
- Verify authentication setup
- Review UI component dependencies
- Ensure proper permissions

## Database Verification

### Check Migration Status
```bash
# Check if feature_flags table exists
psql -d your_database -c "\dt feature_flags"

# Check RLS policies
psql -d your_database -c "\dp feature_flags"

# Check indexes
psql -d your_database -c "\di *feature_flags*"
```

### Verify Default Flags
```bash
# Check seeded flags
psql -d your_database -c "SELECT * FROM feature_flags LIMIT 10;"
```

## Notes

- This is a documentation-only PR
- No code changes to application behavior
- Focus on feature flag system
- Foundation for subsequent hardening steps
- Enhanced feature management capabilities
