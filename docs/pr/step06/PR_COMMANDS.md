# Step 06 PR Commands - Scheduling Optimization

## Git Commands

### Create and Push Branch
```bash
git checkout -b backfill/step-06-scheduling-optimization-20250825
git add -A
git commit -m "chore(step 06): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-06-scheduling-optimization-20250825
```

## GitHub CLI Commands

### Create PR with GitHub CLI
```bash
gh pr create --base main --head backfill/step-06-scheduling-optimization-20250825 \
  --title "[Backfill Step 06] Scheduling Optimization — 2025-08-25" \
  --body-file docs/pr/step06/PR_BODY.md
```

## Manual GitHub Workflow

### 1. Push Branch
After running the git commands above, GitHub will show a yellow "Compare & pull request" banner.

### 2. Click Banner
Click the "Compare & pull request" button to open the PR creation page.

### 3. Fill PR Details
- **Title**: `[Backfill Step 06] Scheduling Optimization — 2025-08-25`
- **Description**: Copy content from `docs/pr/step06/PR_BODY.md`
- **Base Branch**: `main`
- **Head Branch**: `backfill/step-06-scheduling-optimization-20250825`

### 4. Add Labels
- `backfill`
- `step-06`
- `scheduling`
- `performance`
- `documentation`

### 5. Assign Reviewers
- Assign appropriate team members
- Request review from maintainers

### 6. Create PR
Click "Create pull request" to submit.

## GitLab Commands (Alternative)

### Create and Push Branch
```bash
git checkout -b backfill/step-06-scheduling-optimization-20250825
git add -A
git commit -m "chore(step 06): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-06-scheduling-optimization-20250825
```

### Create MR with GitLab CLI
```bash
glab mr create --base main --head backfill/step-06-scheduling-optimization-20250825 \
  --title "[Backfill Step 06] Scheduling Optimization — 2025-08-25" \
  --description "$(cat docs/pr/step06/PR_BODY.md)"
```

## Post-Creation Steps

### 1. Verify PR Created
- Check that PR appears in repository
- Verify title and description are correct
- Confirm base and head branches are correct

### 2. Run CI Checks
- Wait for CI pipeline to complete
- Verify all checks pass including scheduling optimization tests
- Address any failures

### 3. Add CI Results
- Copy CI output to `docs/pr/step06/checks.txt`
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

### Test Scheduling Optimization
```bash
npm run test
npm run test -- --testNamePattern="scheduling.*optimization"
npm run test -- --testNamePattern="cron.*endpoint"
npm run test -- --testNamePattern="n8n.*reliability"
```

### Test Performance
```bash
npm run test -- --testNamePattern="performance.*scheduling"
```

### Test n8n Integration
```bash
npm run test -- --testNamePattern="workflow.*n8n"
npm run test -- --testNamePattern="circuit.*breaker"
npm run test -- --testNamePattern="dlq.*dead.*letter"
```

## Troubleshooting

### If Branch Already Exists
```bash
git checkout main
git branch -D backfill/step-06-scheduling-optimization-20250825
git checkout -b backfill/step-06-scheduling-optimization-20250825
```

### If Push Fails
```bash
git push --force-with-lease origin backfill/step-06-scheduling-optimization-20250825
```

### If PR Creation Fails
- Check GitHub CLI authentication: `gh auth status`
- Verify repository permissions
- Try manual PR creation via web interface

### If Scheduling Tests Fail
- Check cron endpoint configuration
- Verify n8n integration setup
- Review environment variables
- Ensure reliability controls are active

### If Performance Tests Fail
- Check resource usage metrics
- Verify timer removal
- Review endpoint performance
- Ensure optimization is working

## Endpoint Verification

### Test Cron Endpoint
```bash
# Test endpoint reachability
curl -X GET "http://localhost:3000/api/weekly-recap?secret=your-secret"

# Expected response
{"ok":true,"message":"cron reachable"}
```

### Test n8n Integration
```bash
# Check n8n reliability status
curl -X GET /api/n8n/reliability/status

# Check circuit breaker status
curl -X GET /api/n8n/reliability/circuit-breaker

# View DLQ contents
curl -X GET /api/n8n/reliability/dlq
```

## Performance Verification

### Resource Usage
```bash
# Check memory usage
ps aux | grep node

# Check CPU usage
top -p $(pgrep node)

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/weekly-recap?secret=your-secret"
```

### Load Testing
```bash
# Simple load test
for i in {1..100}; do
  curl -s "http://localhost:3000/api/weekly-recap?secret=your-secret" &
done
wait
```

## Notes

- This is a documentation-only PR
- No code changes to application behavior
- Focus on scheduling optimization
- Foundation for subsequent hardening steps
- Enhanced performance and reliability
