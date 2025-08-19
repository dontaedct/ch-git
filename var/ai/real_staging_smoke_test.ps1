# Real Staging Smoke Test Script
# This script makes actual network calls to test staging endpoints

param(
    [Parameter(Mandatory=$true)]
    [string]$STAGING_DOMAIN,
    [Parameter(Mandatory=$false)]
    [string]$DISABLED_DOMAIN = "",
    [Parameter(Mandatory=$false)]
    [string]$JWT = ""
)

Write-Host "🚀 REAL STAGING SMOKE TEST STARTING" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Create output directory
$outputDir = "./var/ai"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Function to redact JWT in logs
function Redact-JWT {
    param([string]$text)
    return $text -replace '(Authorization: Bearer )[A-Za-z0-9\.\-\_]+', '$1[REDACTED]'
}

# Test 1: Optional disabled 503 guard
if ($DISABLED_DOMAIN -and $DISABLED_DOMAIN.Trim() -ne "") {
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

# Test 2: Staging UNAUTH (expect 401)
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

# Test 3: Staging AUTH (expect 200) if JWT provided
$specShape = "SKIPPED"
$authStatus = "SKIPPED"
if ($JWT -and $JWT.Trim() -ne "") {
    Write-Host ""
    Write-Host "== Staging AUTH (JWT provided; redacted in logs) ==" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "https://$STAGING_DOMAIN/api/ai/tasks/spec_writer" -Method POST -ContentType "application/json" -Headers @{"Authorization" = "Bearer $JWT"} -Body '{"input":"Write a tiny spec for a /profile/notes endpoint: create/read/update, owner-only permissions, basic validation."}' -ErrorAction Stop
        $authStatus = "200"
        $response | ConvertTo-Json -Depth 10 | Out-File -FilePath "$outputDir/staging_auth.json" -Encoding UTF8
        
        # Validate SpecDoc shape with Node
        $nodeScript = @"
const fs = require('fs');
const p = './var/ai/staging_auth.json';
try {
    const b = JSON.parse(fs.readFileSync(p, 'utf8'));
    const ok = b && b.ok === true;
    const d = b && b.data || {};
    const ents = Array.isArray(d.entities) && d.entities.length > 0 && d.entities.every(x => typeof x === 'string');
    const eps = Array.isArray(d.endpoints) && d.endpoints.length > 0 && d.endpoints.every(e => e && typeof e.path === 'string' && e.path.length > 0 && typeof e.method === 'string' && e.method.length > 0);
    const ats = Array.isArray(d.acceptance_tests) && d.acceptance_tests.length > 0 && d.acceptance_tests.every(x => typeof x === 'string');
    const rks = Array.isArray(d.risks) && d.risks.length > 0 && d.risks.every(x => typeof x === 'string');
    const pass = ok && ents && eps && ats && rks;
    const firstFail = ok ? (!ents ? 'entities_present' : (!eps ? 'endpoints_present' : (!ats ? 'acceptance_tests_present' : (!rks ? 'risks_present' : 'endpoints_shape_valid')))) : 'ok_field';
    fs.writeFileSync('./var/ai/specdoc_check.json', JSON.stringify({ok, ents, eps, ats, rks, pass, firstFail}, null, 2));
} catch(e) { 
    fs.writeFileSync('./var/ai/specdoc_check.json', JSON.stringify({parse_error: true, pass: false, firstFail: 'parse_error'})); 
}
"@
        
        $nodeScript | Out-File -FilePath "$outputDir/temp_node_script.js" -Encoding UTF8
        node "$outputDir/temp_node_script.js"
        Remove-Item "$outputDir/temp_node_script.js" -Force
        
        $specCheck = Get-Content "$outputDir/specdoc_check.json" | ConvertFrom-Json
        $specShape = if ($specCheck.pass) { "PASS" } else { "FAIL" }
        
    } catch {
        $authStatus = $_.Exception.Response.StatusCode.value__
        $_.Exception.Response | ConvertTo-Json -Depth 10 | Out-File -FilePath "$outputDir/staging_auth.json" -Encoding UTF8
    }
    Write-Host "staging_auth_status=$authStatus" -ForegroundColor Cyan
}

# Generate summary table
Write-Host ""
Write-Host "=== PASS/FAIL TABLE ===" -ForegroundColor Green

# disabled_503
$disabled503Result = if ($DISABLED_DOMAIN -and $DISABLED_DOMAIN.Trim() -ne "") { 
    if (Test-Path "$outputDir/disabled_resp.json") {
        $content = Get-Content "$outputDir/disabled_resp.json" -Raw
        if ($content -match 'AI disabled' -or $content -match '503') { "PASS" } else { "FAIL" }
    } else { "FAIL" }
} else { "SKIPPED" }
Write-Host "disabled_503          $disabled503Result" -ForegroundColor $(if ($disabled503Result -eq "PASS") { "Green" } elseif ($disabled503Result -eq "SKIPPED") { "Yellow" } else { "Red" })

# staging_401
$staging401Result = if ($unauthStatus -eq "401") { "PASS" } else { "FAIL($unauthStatus)" }
Write-Host "staging_401           $staging401Result" -ForegroundColor $(if ($staging401Result -eq "PASS") { "Green" } else { "Red" })

# staging_200
$staging200Result = if ($JWT -and $JWT.Trim() -ne "") { 
    if ($authStatus -eq "200") { "PASS" } else { "FAIL($authStatus)" }
} else { "SKIPPED" }
Write-Host "staging_200           $staging200Result" -ForegroundColor $(if ($staging200Result -eq "PASS") { "Green" } elseif ($staging200Result -eq "SKIPPED") { "Yellow" } else { "Red" })

# specdoc_shape
Write-Host "specdoc_shape         $specShape" -ForegroundColor $(if ($specShape -eq "PASS") { "Green" } elseif ($specShape -eq "SKIPPED") { "Yellow" } else { "Red" })

# Verdict
Write-Host ""
if ($specShape -eq "PASS" -and $authStatus -eq "200") {
    Write-Host "VERDICT: GO for limited beta smoke." -ForegroundColor Green
} else {
    # Offer hint if data looks thin
    if (Test-Path "$outputDir/staging_auth.json") {
        if (Test-Path "$outputDir/specdoc_check.json") {
            $check = Get-Content "$outputDir/specdoc_check.json" | ConvertFrom-Json
            if (-not $check.pass) {
                Write-Host "Hint: raise AI_MAX_TOKENS to 6000 in staging env, redeploy, then re-run." -ForegroundColor Yellow
            }
        }
    }
    Write-Host "VERDICT: NO-GO or PARTIAL. Fix above failures and re-run." -ForegroundColor Red
}

Write-Host ""
Write-Host "Artifacts: ./var/ai/{staging_unauth.json,staging_auth.json?,specdoc_check.json,disabled_resp.json?}" -ForegroundColor Cyan
Write-Host "✅ Real smoke test completed with actual network calls." -ForegroundColor Green
