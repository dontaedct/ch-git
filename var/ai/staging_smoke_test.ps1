# Staging Smoke Test Script
# This script tests the staging environment endpoints and validates responses

param(
    [string]$STAGING_DOMAIN = "staging.example.com",
    [string]$DISABLED_DOMAIN = "",
    [string]$JWT = ""
)

Write-Host "🚀 STAGING SMOKE TEST STARTING" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Create output directory
$outputDir = "./var/ai"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Test 1: Optional disabled 503 guard
if ($DISABLED_DOMAIN) {
    Write-Host "== Disabled env guard @ https://$DISABLED_DOMAIN ==" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "https://$DISABLED_DOMAIN/api/ai/tasks/spec_writer" -Method POST -ContentType "application/json" -Body '{"input":"hello"}' -ErrorAction Stop
        $disabledStatus = "200"
        $response | ConvertTo-Json -Depth 10 | Out-File -FilePath "$outputDir/disabled_resp.json" -Encoding UTF8
    } catch {
        $disabledStatus = $_.Exception.Response.StatusCode.value__
        $_.Exception.Response | ConvertTo-Json -Depth 10 | Out-File -FilePath "$outputDir/disabled_resp.json" -Encoding UTF8
    }
    Write-Host "disabled_status=$disabledStatus" -ForegroundColor Cyan
} else {
    Write-Host "disabled_status=SKIPPED" -ForegroundColor Gray
}

# Test 2: Unauth 401 check (staging)
Write-Host ""
Write-Host "== Staging UNAUTH @ https://$STAGING_DOMAIN ==" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://$STAGING_DOMAIN/api/ai/tasks/spec_writer" -Method POST -ContentType "application/json" -Body '{"input":"test"}' -ErrorAction Stop
    $unauthStatus = "200"
    $response | ConvertTo-Json -Depth 10 | Out-File -FilePath "$outputDir/staging_unauth.json" -Encoding UTF8
} catch {
    $unauthStatus = $_.Exception.Response.StatusCode.value__
    $_.Exception.Response | ConvertTo-Json -Depth 10 | Out-File -FilePath "$outputDir/staging_unauth.json" -Encoding UTF8
}
Write-Host "staging_unauth_status=$unauthStatus" -ForegroundColor Cyan

# Test 3: Optional auth 200 check (requires JWT)
$specShape = "SKIPPED"
$authStatus = "SKIPPED"
if ($JWT) {
    Write-Host ""
    Write-Host "== Staging AUTH (JWT provided; redacted in logs) ==" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "https://$STAGING_DOMAIN/api/ai/tasks/spec_writer" -Method POST -ContentType "application/json" -Headers @{"Authorization" = "Bearer $JWT"} -Body '{"input":"Write a tiny spec for a /profile/notes endpoint: create/read/update, owner-only permissions, basic validation."}' -ErrorAction Stop
        $authStatus = "200"
        $response | ConvertTo-Json -Depth 10 | Out-File -FilePath "$outputDir/staging_auth.json" -Encoding UTF8
        
        # Validate SpecDoc shape
        $specCheck = @{
            ok = $response.ok -eq $true
            ents = $response.data.entities -and $response.data.entities.Count -gt 0 -and $response.data.entities.ForEach({$_.GetType().Name -eq "String"}) -notcontains $false
            eps = $response.data.endpoints -and $response.data.endpoints.Count -gt 0 -and $response.data.endpoints.ForEach({$_.path -and $_.method -and $_.path.Length -gt 0 -and $_.method.Length -gt 0}) -notcontains $false
            ats = $response.data.acceptance_tests -and $response.data.acceptance_tests.Count -gt 0 -and $response.data.acceptance_tests.ForEach({$_.GetType().Name -eq "String"}) -notcontains $false
            rks = $response.data.risks -and $response.data.risks.Count -gt 0 -and $response.data.risks.ForEach({$_.GetType().Name -eq "String"}) -notcontains $false
        }
        $specCheck.pass = $specCheck.ok -and $specCheck.ents -and $specCheck.eps -and $specCheck.ats -and $specCheck.rks
        
        $specCheck | ConvertTo-Json | Out-File -FilePath "$outputDir/specdoc_check.json" -Encoding UTF8
        $specShape = if ($specCheck.pass) { "PASS" } else { "FAIL" }
        
    } catch {
        $authStatus = $_.Exception.Response.StatusCode.value__
        $_.Exception.Response | ConvertTo-Json -Depth 10 | Out-File -FilePath "$outputDir/staging_auth.json" -Encoding UTF8
    }
    Write-Host "staging_auth_status=$authStatus" -ForegroundColor Cyan
}

# Generate summary
Write-Host ""
Write-Host "=== PASS/FAIL TABLE ===" -ForegroundColor Green
Write-Host "disabled_503          $(if ($DISABLED_DOMAIN) { if ($disabledStatus -eq "503") { "PASS" } else { "FAIL" } } else { "SKIPPED" })" -ForegroundColor $(if ($DISABLED_DOMAIN -and $disabledStatus -eq "503") { "Green" } else { "Yellow" }) -NoNewline
Write-Host ""
Write-Host "staging_401           $(if ($unauthStatus -ne "200") { "PASS" } else { "FAIL" })" -ForegroundColor $(if ($unauthStatus -ne "200") { "Green" } else { "Red" })
Write-Host "staging_200           $authStatus" -ForegroundColor $(if ($authStatus -eq "200") { "Green" } elseif ($authStatus -eq "SKIPPED") { "Yellow" } else { "Red" })
Write-Host "specdoc_shape         $specShape" -ForegroundColor $(if ($specShape -eq "PASS") { "Green" } elseif ($specShape -eq "SKIPPED") { "Yellow" } else { "Red" })

# Verdict
Write-Host ""
if ($specShape -eq "PASS" -and $authStatus -eq "200") {
    Write-Host "VERDICT: GO for limited beta smoke." -ForegroundColor Green
} else {
    Write-Host "VERDICT: NO-GO or PARTIAL. If arrays are empty or data is missing, increase AI_MAX_TOKENS to 6000 in staging, redeploy, then re-run." -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Smoke test completed. Check ./var/ai/ for detailed response files." -ForegroundColor Green
