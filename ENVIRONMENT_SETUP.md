# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following content:

```bash
# Debug and Safe Mode Configuration
# Set to '1' to enable debug features (development only)
# WARNING: Never set DEBUG=1 in production builds
NEXT_PUBLIC_DEBUG=0

# Set to '1' to enable safe mode (development only)
# WARNING: SAFE_MODE=1 will be blocked in production builds
NEXT_PUBLIC_SAFE_MODE=0

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Important Notes

1. **Debug Mode**: Set `NEXT_PUBLIC_DEBUG=0` for normal operation, `=1` for development debugging
2. **Safe Mode**: Set `NEXT_PUBLIC_SAFE_MODE=0` for normal operation, `=1` for development bypass
3. **Production Safety**: Both flags are automatically blocked in production builds
4. **File Location**: Place `.env.local` in your project root (same directory as package.json)

## Verification

After creating the file:
1. Restart your development server
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Verify no debug overlays are visible
4. Verify normal authentication flow works

## Production Deployment

The build system will automatically:
- Block SAFE_MODE=1 in production builds
- Warn about DEBUG=1 in production builds
- Ensure debug UI remains hidden behind environment checks
