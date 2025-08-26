# Step 08 PR Commands - CSP/Headers

## Git Commands

### Create and Push Branch
```bash
git checkout -b backfill/step-08-csp-headers-20250825
git add -A
git commit -m "chore(step 08): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-08-csp-headers-20250825
```

## GitHub CLI Commands

### Create PR with GitHub CLI
```bash
gh pr create --base main --head backfill/step-08-csp-headers-20250825 \
  --title "[Backfill Step 08] CSP/Headers — 2025-08-25" \
  --body-file docs/pr/step08/PR_BODY.md
```

## Manual GitHub Workflow

### 1. Push Branch
After running the git commands above, GitHub will show a yellow "Compare & pull request" banner.

### 2. Click Banner
Click the "Compare & pull request" button to open the PR creation page.

### 3. Fill PR Details
- **Title**: `[Backfill Step 08] CSP/Headers — 2025-08-25`
- **Description**: Copy content from `docs/pr/step08/PR_BODY.md`
- **Base Branch**: `main`
- **Head Branch**: `backfill/step-08-csp-headers-20250825`

### 4. Add Labels
- `backfill`
- `step-08`
- `csp`
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
git checkout -b backfill/step-08-csp-headers-20250825
git add -A
git commit -m "chore(step 08): backfill PR docs & evidence (2025-08-25)"
git push -u origin backfill/step-08-csp-headers-20250825
```

### Create MR with GitLab CLI
```bash
glab mr create --base main --head backfill/step-08-csp-headers-20250825 \
  --title "[Backfill Step 08] CSP/Headers — 2025-08-25" \
  --description "$(cat docs/pr/step08/PR_BODY.md)"
```

## Post-Creation Steps

### 1. Verify PR Created
- Check that PR appears in repository
- Verify title and description are correct
- Confirm base and head branches are correct

### 2. Run CI Checks
- Wait for CI pipeline to complete
- Verify all checks pass including CSP/headers tests
- Address any failures

### 3. Add CI Results
- Copy CI output to `docs/pr/step08/checks.txt`
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

### Test CSP and Security Headers
```bash
npm run test:csp
npm run security:headers
npm run security:headers:test
```

### Test CSP Violations
```bash
npm run test -- --testNamePattern="csp.*violation"
npm run test -- --testNamePattern="nonce.*generation"
npm run test -- --testNamePattern="environment.*csp"
```

### Test Route Headers
```bash
npm run test -- --testNamePattern="route.*header"
```

## Troubleshooting

### If Branch Already Exists
```bash
git checkout main
git branch -D backfill/step-08-csp-headers-20250825
git checkout -b backfill/step-08-csp-headers-20250825
```

### If Push Fails
```bash
git push --force-with-lease origin backfill/step-08-csp-headers-20250825
```

### If PR Creation Fails
- Check GitHub CLI authentication: `gh auth status`
- Verify repository permissions
- Try manual PR creation via web interface

### If CSP Tests Fail
- Check CSP configuration
- Verify nonce generation
- Review security header setup
- Ensure environment detection working

### If Security Header Tests Fail
- Check middleware configuration
- Verify header implementation
- Review route coverage
- Ensure validation script working

## CSP Verification

### Test CSP Configuration
```bash
# Test production CSP
curl -I http://localhost:3000/ | grep -i content-security-policy

# Test preview CSP
curl -I http://localhost:3000/ | grep -i content-security-policy-report-only
```

### Test Security Headers
```bash
# Test all security headers
curl -I http://localhost:3000/ | grep -E "(x-content-type-options|x-frame-options|x-xss-protection|referrer-policy|permissions-policy)"
```

### Test Route Coverage
```bash
# Test critical routes
for route in / /login /operability /api/env-check; do
  echo "Testing $route:"
  curl -I http://localhost:3000$route | grep -E "(content-security-policy|x-content-type-options|x-frame-options)"
done
```

## Security Header Validation

### Manual Header Check
```bash
# Check specific headers
curl -I http://localhost:3000/ | grep -i "x-content-type-options"
curl -I http://localhost:3000/ | grep -i "x-frame-options"
curl -I http://localhost:3000/ | grep -i "x-xss-protection"
curl -I http://localhost:3000/ | grep -i "referrer-policy"
curl -I http://localhost:3000/ | grep -i "permissions-policy"
```

### CSP Content Validation
```bash
# Check CSP content
curl -I http://localhost:3000/ | grep -i "content-security-policy" | head -1
```

## Nonce Generation Testing

### Test Nonce Generation
```bash
# Test nonce generation script
node -e "
const crypto = require('crypto');
const nonce = crypto.randomBytes(16).toString('base64');
console.log('Generated nonce:', nonce);
console.log('Nonce length:', nonce.length);
"
```

### Test CSP with Nonces
```bash
# Check if CSP includes nonce directive
curl -I http://localhost:3000/ | grep -i "content-security-policy" | grep -i "nonce"
```

## Notes

- This is a documentation-only PR
- No code changes to application behavior
- Focus on CSP and security headers
- Foundation for subsequent hardening steps
- Enhanced security posture
