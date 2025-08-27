# Step 12: Template Isolation & Packaging

**Date**: 2025-08-25  
**Branch**: `hardening/step12-template-isolation-20250825`  
**Previous**: Step 11 - Secret/Bundle Guards  
**Next**: Step 13 - Developer Ergonomics  

## Objective

Isolate demo routes from the core template and create a minimal, reusable template for new micro applications.

## Changes Made

### 1. Demo Route Isolation

Moved demo routes to `examples/` directory:
- `app/auto-save-demo/` → `examples/auto-save-demo/`
- `app/guardian-demo/` → `examples/guardian-demo/`
- `app/design-system/` → `examples/design-system/`
- `app/ai/live/` → `examples/ai-live/`
- `app/test/` → `examples/test-routes/test.tsx`
- `app/test-probe/` → `examples/test-routes/test-probe.tsx`
- `app/test-simple/` → `examples/test-routes/test-simple.tsx`

Removed debug routes:
- `app/debug/`
- `app/_debug/`

### 2. Minimal Template Structure

Core template now includes only essential routes:
- `/login` - Authentication
- `/operability` - Admin interface
- `/api/health` - Health check
- `/api/ping` - Basic ping
- `/api/webhooks/*` - Webhook handlers

### 3. Scaffold Script

Created `bin/create-micro-app.mjs`:
- Copies minimal template files
- Updates package.json with new app name
- Removes demo-specific scripts
- Creates comprehensive README
- Generates .gitignore

### 4. Documentation

- `TEMPLATE_README.md` - Quickstart guide
- `docs/hardening/STEP12_TEMPLATE.md` - This document

## Usage

### Creating New Micro App

```bash
# From template directory
node bin/create-micro-app.mjs my-new-app
cd my-new-app

# Setup environment
cp env.example .env.local
# Edit .env.local with Supabase credentials

# Install and run
npm install
npm run dev
```

### Template Features

**Core Infrastructure**:
- Supabase Auth with protected routes
- PostgreSQL with Row Level Security
- Feature flags system
- shadcn/ui + Tailwind CSS
- Full TypeScript coverage
- Jest + Playwright testing
- Security headers and CSP
- Sentry error tracking
- Vercel deployment ready

**Minimal Structure**:
```
app/
├── login/          # Authentication
├── operability/    # Admin interface
└── api/           # API routes
    ├── health/    # Health check
    ├── ping/      # Basic ping
    └── webhooks/  # Webhook handlers

components/
├── ui/            # UI components
├── header.tsx     # Main header
├── ProtectedNav.tsx  # Auth nav
└── PublicNav.tsx  # Public nav

lib/
├── supabase/      # Supabase config
├── auth/          # Auth utilities
├── flags/         # Feature flags
└── registry/      # App registries
```

## Security Considerations

- RLS policies configured for all tables
- Service role key only used server-side
- Environment variables properly secured
- CSP headers configured
- Input validation implemented
- Bundle analysis for security

## Testing

```bash
# Run full CI pipeline
npm run ci

# Individual checks
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run test          # Unit tests
npm run test:smoke    # E2E tests
```

## Database Setup

Template includes basic migrations:
```sql
-- Users table with RLS
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags table
CREATE TABLE feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) NOT NULL,
  key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
```

## Examples

The `examples/` directory contains:
- `auto-save-demo/` - Auto-save functionality
- `guardian-demo/` - Security guardian demo
- `design-system/` - UI component showcase
- `ai-live/` - AI integration example
- `test-routes/` - Testing patterns

## Next Steps

Step 13 will focus on developer ergonomics:
- Script improvements
- ESM/CJS hygiene
- Tool namespace organization
- Development workflow optimization

## Verification

```bash
# Ensure template works
node bin/create-micro-app.mjs test-template
cd test-template
npm install
npm run ci  # Should pass all checks
```

## Files Changed

### Added
- `bin/create-micro-app.mjs`
- `TEMPLATE_README.md`
- `docs/hardening/STEP12_TEMPLATE.md`
- `examples/auto-save-demo/page.tsx`
- `examples/guardian-demo/page.tsx`
- `examples/design-system/page.tsx`
- `examples/ai-live/page.tsx`
- `examples/test-routes/test.tsx`
- `examples/test-routes/test-probe.tsx`
- `examples/test-routes/test-simple.tsx`

### Removed
- `app/auto-save-demo/`
- `app/guardian-demo/`
- `app/design-system/`
- `app/ai/`
- `app/test/`
- `app/test-probe/`
- `app/test-simple/`
- `app/debug/`
- `app/_debug/`

## Impact

- **Reduced Complexity**: Core template is now minimal and focused
- **Improved Reusability**: Easy to create new micro apps
- **Better Organization**: Demos separated from core functionality
- **Enhanced Security**: Template includes security best practices
- **Developer Experience**: Clear documentation and setup process
