# Branch Protection Setup

## One-Click Script (Recommended)

Run the PowerShell script to automatically enable branch protection:

```powershell
.\scripts\branch-protect.ps1
```

## Manual UI Setup (Fallback)

If the script fails, follow these exact steps in GitHub:

1. **Settings** → Click "Settings" tab in your repository
2. **Branches** → Click "Branches" in left sidebar  
3. **Branch protection rules** → Click "Add rule" button
4. **Branch name pattern** → Type: `main`
5. **Require a pull request before merging** → ✅ Check this box
6. **Require status checks to pass** → ✅ Check this box
7. **Select "ci"** → Choose "ci" from the dropdown
8. **Save changes** → Click green "Create" button

## What Gets Enabled

- ✅ Pull request required before merging
- ✅ Status checks must pass (ci workflow)
- ✅ Linear history: OFF (simpler workflow)
- ✅ Stale reviews can be dismissed
- ✅ Force pushes blocked
- ✅ Branch deletion blocked
