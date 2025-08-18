# 🚀 REAL STAGING SMOKE TEST

This directory contains the **real staging smoke test** that makes actual network calls to validate staging environment endpoints.

## 🎯 **WHAT THIS DOES**

The real smoke test performs **actual HTTP requests** to:
1. **Test disabled environment guard** (503 expected)
2. **Test staging unauthorized access** (401 expected) 
3. **Test staging authorized access** (200 expected, if JWT provided)
4. **Validate SpecDoc JSON structure** (if auth test succeeds)

## 📁 **FILES**

- `real_staging_smoke_test.ps1` - **Main executable script** (PowerShell)
- `staging_unauth.json` - Real response from unauth test
- `staging_auth.json` - Real response from auth test (if JWT provided)
- `specdoc_check.json` - SpecDoc validation results (if auth test performed)
- `disabled_resp.json` - Response from disabled env test (if domain provided)
- `real_smoke_test_summary.json` - Comprehensive test summary

## 🚀 **QUICK START**

### Basic Test (Unauth Only)
```powershell
powershell -ExecutionPolicy Bypass -File "./var/ai/real_staging_smoke_test.ps1" -STAGING_DOMAIN "your-staging-domain.com"
```

### Full Test with JWT
```powershell
powershell -ExecutionPolicy Bypass -File "./var/ai/real_staging_smoke_test.ps1" `
  -STAGING_DOMAIN "your-staging-domain.com" `
  -DISABLED_DOMAIN "disabled-domain.com" `
  -JWT "your-jwt-token"
```

### Test with Disabled Environment
```powershell
powershell -ExecutionPolicy Bypass -File "./var/ai/real_staging_smoke_test.ps1" `
  -STAGING_DOMAIN "your-staging-domain.com" `
  -DISABLED_DOMAIN "disabled-domain.com"
```

## 🔑 **OBTAINING A JWT TOKEN**

### For Supabase-based staging:
1. Log into your staging environment in the browser
2. Open browser console (F12)
3. Run this command:
```javascript
await supabase.auth.getSession().then(r => r.data.session?.access_token)
```
4. Copy the returned token (starts with `eyJ...`)
5. Use it in the `-JWT` parameter

### For other auth systems:
- Check your staging environment documentation
- Use a regular user token (not service-role)
- Rotate the token if it gets exposed

## 📊 **EXPECTED RESULTS**

| Test | Expected | Success Criteria |
|------|----------|------------------|
| **disabled_503** | 503 status | Returns 503 or contains "AI disabled" |
| **staging_401** | 401 status | Unauthorized request properly rejected |
| **staging_200** | 200 status | Authenticated request succeeds |
| **specdoc_shape** | Valid format | Response meets SpecDoc requirements |

## 🎯 **VERDICT SYSTEM**

- **GO**: All critical tests pass, ready for limited beta
- **NO-GO**: Critical failures detected, needs fixes
- **PARTIAL**: Some tests pass, others skipped or failed

## 🛠️ **TROUBLESHOOTING**

### If SpecDoc validation fails:
1. **Check AI_MAX_TOKENS** in staging environment
2. **Increase to 6000** if arrays are empty
3. **Redeploy** staging environment
4. **Re-run** the smoke test

### If you get connection errors:
1. Verify staging domain is correct
2. Check network connectivity
3. Ensure staging environment is running
4. Verify firewall/security group settings

### If JWT auth fails:
1. Ensure token is valid and not expired
2. Check token permissions (regular user, not service-role)
3. Verify staging environment accepts the token format
4. Check auth middleware configuration

## 🔒 **SECURITY NOTES**

- **Never commit JWT tokens** to version control
- **Rotate tokens** if they get exposed
- **Use regular user tokens** (not service-role)
- **Test in staging only** (never production)
- **Redact sensitive data** in logs and artifacts

## 📈 **PRODUCTION DEPLOYMENT**

Before deploying to production:
1. ✅ Run smoke test on staging
2. ✅ Verify all tests pass
3. ✅ Validate SpecDoc format
4. ✅ Check error handling
5. ✅ Confirm security measures

## 🎉 **SUCCESS INDICATORS**

- **Real network calls** made and captured
- **Proper HTTP status codes** returned
- **Full response details** saved to artifacts
- **SpecDoc validation** passes
- **All security checks** working correctly

---

**Ready to test your staging environment? Run the script with your actual staging domain!** 🚀
