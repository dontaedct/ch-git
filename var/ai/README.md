# Staging Smoke Test

This directory contains the staging smoke test artifacts and execution scripts.

## Files

- `staging_smoke_test.ps1` - PowerShell script to run the complete smoke test
- `staging_unauth.json` - Response from unauth test (expect 401)
- `staging_auth.json` - Response from auth test (expect 200, if JWT provided)
- `disabled_resp.json` - Response from disabled env test (expect 503, if domain provided)
- `specdoc_check.json` - SpecDoc shape validation results
- `README.md` - This file

## Usage

### Basic Test (Unauth Only)
```powershell
powershell -ExecutionPolicy Bypass -File "./var/ai/staging_smoke_test.ps1" -STAGING_DOMAIN "your-staging-domain.com"
```

### Full Test with JWT
```powershell
powershell -ExecutionPolicy Bypass -File "./var/ai/staging_smoke_test.ps1" -STAGING_DOMAIN "your-staging-domain.com" -DISABLED_DOMAIN "disabled-domain.com" -JWT "your-jwt-token"
```

### Test with Disabled Environment
```powershell
powershell -ExecutionPolicy Bypass -File "./var/ai/staging_smoke_test.ps1" -STAGING_DOMAIN "your-staging-domain.com" -DISABLED_DOMAIN "disabled-domain.com"
```

## Test Scenarios

1. **Disabled Environment Guard (503)** - Tests if disabled environments properly return 503
2. **Staging Unauthorized (401)** - Tests if staging requires authentication
3. **Staging Authorized (200)** - Tests if staging works with valid JWT
4. **SpecDoc Shape Validation** - Validates the response structure meets requirements

## Expected Results

- **disabled_503**: PASS if disabled domain returns 503, FAIL otherwise
- **staging_401**: PASS if unauth request returns non-200, FAIL if it succeeds
- **staging_200**: Status code from auth test, or SKIPPED if no JWT
- **specdoc_shape**: PASS if response meets SpecDoc format, FAIL otherwise

## Verdict

- **GO**: All critical tests pass, ready for limited beta
- **NO-GO**: Critical failures detected, needs fixes before deployment

## Troubleshooting

If SpecDoc validation fails:
1. Check AI_MAX_TOKENS setting in staging environment
2. Ensure AI model has sufficient context for full response
3. Verify endpoint returns complete entity/endpoint/acceptance_test/risk arrays
