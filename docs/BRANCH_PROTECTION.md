# Branch Protection Settings

This document provides the exact GitHub settings to configure branch protection for the repository. These settings must be applied manually through the GitHub UI.

## Overview

Branch protection rules enforce safety gates to prevent unsafe commits and merges from landing in critical branches. This complements the local pre-commit hooks and CI Safety Gate workflow.

## Settings for `main` branch

Navigate to: Repository Settings → Branches → Add protection rule for `main`

### Protect matching branches
- **Branch name pattern**: `main`

### Restrict pushes that create files
- ☑️ **Restrict pushes that create files**

### Require a pull request before merging
- ☑️ **Require a pull request before merging**
  - ☑️ **Require approvals**: `1` (minimum)
  - ☑️ **Dismiss stale reviews when new commits are pushed**
  - ☑️ **Require review from code owners**
  - ☑️ **Restrict reviews to users with explicit read or higher access**
  - ☑️ **Allow specified actors to bypass required pull requests**: (leave empty for maximum security)

### Require status checks to pass before merging
- ☑️ **Require status checks to pass before merging**
  - ☑️ **Require branches to be up to date before merging**
  - **Status checks that are required**:
    - `Safety Gate` (from safety-gate.yml workflow)
    - `test` (from ci.yml workflow)
    - Any other CI checks you want to require

### Require conversation resolution before merging
- ☑️ **Require conversation resolution before merging**

### Require signed commits
- ☑️ **Require signed commits** (recommended for enhanced security)

### Require linear history
- ☑️ **Require linear history** (prevents merge commits, enforces rebase)

### Require merge queue
- ☐ **Require merge queue** (optional, for high-traffic repos)

### Require deployments to succeed before merging
- ☐ **Require deployments to succeed before merging** (optional)

### Lock branch
- ☐ **Lock branch** (only for emergency freezes)

### Do not allow bypassing the above settings
- ☑️ **Do not allow bypassing the above settings**
- **Restrict pushes that create files**: (optional)

### Rules applied to everyone including administrators
- ☑️ **Rules applied to everyone including administrators**

## Settings for `develop` branch (if used)

Apply the same settings as `main` but with these modifications:
- **Branch name pattern**: `develop`
- **Require approvals**: `1` (can be same or lower than main)
- **Require review from code owners**: ☑️ (recommended)

## Additional Repository Settings

### General Settings
Navigate to: Repository Settings → General

#### Pull Requests
- ☑️ **Allow merge commits**
- ☑️ **Allow squash merging** (recommended as default)
- ☑️ **Allow rebase merging**
- ☑️ **Always suggest updating pull request branches**
- ☑️ **Allow auto-merge**
- ☑️ **Automatically delete head branches**

#### Security and analysis
- ☑️ **Dependency graph**
- ☑️ **Dependabot alerts**
- ☑️ **Dependabot security updates**
- ☑️ **Secret scanning**
- ☑️ **Push protection** (prevents secrets in commits)

## Verification Steps

After applying these settings:

1. **Test local pre-commit**: 
   ```bash
   # Make a trivial change and commit
   echo "test" > test-commit.txt
   git add test-commit.txt
   git commit -m "test: verify pre-commit hooks"
   ```

2. **Test PR requirements**:
   - Create a test branch
   - Push changes
   - Open a PR to main
   - Verify that Safety Gate checks run
   - Verify that CODEOWNERS approval is required for protected files

3. **Test force-push protection**:
   ```bash
   # This should fail on main branch
   git push --force-with-lease origin main
   ```

## Rollback Instructions

If these settings cause issues:

1. **Emergency bypass**: 
   - Repository admins can temporarily disable "Do not allow bypassing"
   - Make critical fixes
   - Re-enable protection immediately

2. **Partial rollback**:
   - Disable specific rules (e.g., required status checks)
   - Keep PR requirements and review requirements
   - Fix issues and re-enable

3. **Full rollback**:
   - Delete the branch protection rule
   - Fix underlying issues
   - Re-apply protection with tested settings

## Notes

- **CODEOWNERS file**: Ensure the CODEOWNERS file exists and contains valid GitHub usernames/teams
- **Status check names**: Must match the job names in your GitHub Actions workflows exactly
- **Team permissions**: Ensure reviewers have appropriate repository access levels
- **Emergency procedures**: Document how to handle urgent fixes when protection blocks legitimate changes

## Related Files

- `.husky/pre-commit` - Local commit validation
- `.github/workflows/safety-gate.yml` - CI safety checks
- `CODEOWNERS` - Required reviewers for critical files
