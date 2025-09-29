# PowerShell Pre-commit Hook - Template Validation
#
# Automatically validates any template-related changes before commit
# Prevents broken templates from being committed to the repository

Write-Host "🔍 Checking template changes..." -ForegroundColor Cyan

# Check if any template files were modified
$templateFiles = git diff --cached --name-only | Where-Object { $_ -match "(template|preset)" -and $_ -match "\.json$" }

if (-not $templateFiles) {
    Write-Host "✅ No template changes detected" -ForegroundColor Green
    exit 0
}

Write-Host "📁 Template files changed:" -ForegroundColor Yellow
$templateFiles | ForEach-Object { Write-Host "  $_" }

# Extract template IDs from changed files
$templateIds = @()
foreach ($file in $templateFiles) {
    if ($file -match "templates/") {
        # Extract template ID from filename
        $templateId = [System.IO.Path]::GetFileNameWithoutExtension($file)
        $templateIds += $templateId
    }
}

# Remove duplicates
$templateIds = $templateIds | Sort-Object -Unique

if (-not $templateIds) {
    Write-Host "⚠️ Could not extract template IDs from changed files" -ForegroundColor Yellow
    exit 0
}

Write-Host "🎯 Validating templates: $($templateIds -join ', ')" -ForegroundColor Cyan

# Validate each template
$validationFailed = $false

foreach ($templateId in $templateIds) {
    Write-Host "🔍 Validating template: $templateId" -ForegroundColor Cyan
    
    $result = node tools/template-validator.js validate $templateId
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Template $templateId passed validation" -ForegroundColor Green
    } else {
        Write-Host "❌ Template $templateId failed validation" -ForegroundColor Red
        $validationFailed = $true
    }
}

if ($validationFailed) {
    Write-Host ""
    Write-Host "❌ Template validation failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix automatically, run:" -ForegroundColor Yellow
    foreach ($templateId in $templateIds) {
        Write-Host "  node tools/template-validator.js register $templateId" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Or fix manually based on the validation errors above." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ All template validations passed!" -ForegroundColor Green
exit 0
