# Coach Hub (Minimal)
- Routes: /sessions (authed), /intake (public)
- Supabase: Auth, Postgres (RLS by coach_id), Storage (bucket `media`)
- Emails: Resend (transactional only)
- Cron: /api/weekly-recap with ?secret=CRON_SECRET
- Env: see .env.local keys
- TypeScript: Full type safety with 0 compilation errors

## Quick Start

### One-Command Development Setup
```bash
# 1. Clone and install
git clone <your-repo>
cd my-app
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development
npm run dev
```

That's it! Your development server will be running at http://localhost:3000 with:
- Hot reload enabled
- TypeScript checking
- ESLint validation
- Auto-save recovery
- Security headers
- Bundle analysis

### Essential Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run all tests
npm run ci           # Run complete CI pipeline
npm run help         # Show all available commands
```

### Common Development Tasks
```bash
npm run tool:check           # Quick check: lint + typecheck
npm run tool:doctor          # System health check
npm run tool:doctor:fix      # Auto-fix system issues
npm run tool:security:secrets # Check for secret leaks
npm run tool:check:env       # Validate environment config
```

## Troubleshooting

### ESM/CommonJS Errors
**Error**: `SyntaxError: Cannot use import statement outside a module`
**Solution**: 
- Ensure all `.js` files use `.mjs` extension for ESM
- Convert `require()` to `import` statements
- Run `npm run tool:doctor:fix` to auto-fix issues

### Missing Environment Variables
**Error**: `Missing required environment variable: SUPABASE_URL`
**Solution**:
```bash
npm run tool:check:env    # Check what's missing
cp .env.example .env.local # Copy template
# Edit .env.local with your values
```

### TypeScript Errors
**Error**: `Type error in file.tsx`
**Solution**:
```bash
npm run typecheck         # Check for type errors
npm run tool:doctor       # System health check
npm run tool:doctor:fix   # Auto-fix issues
```

### Development Server Issues
**Problem**: Port already in use or server won't start
**Solution**:
```bash
npm run tool:dev:kill     # Kill all dev processes
npm run tool:dev:ports    # Check port usage
npm run tool:dev:clean    # Clean artifacts
npm run dev               # Restart
```

### Security Concerns
**Problem**: Worried about secret leaks or security issues
**Solution**:
```bash
npm run tool:security:secrets  # Check for secret leaks
npm run tool:security:bundle # Analyze bundle security
npm run tool:doctor          # Full system check
```

### Database Issues
**Problem**: Supabase connection or RLS errors
**Solution**:
- Verify `.env.local` has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check Supabase dashboard for RLS policies
- Run `npm run tool:check:env` to validate config

## Architecture

### Database Operations
For any multi-table write sequence, we use Supabase RPC functions that execute atomically:

- **Intake Flow**: `create_client_intake()` handles client upsert + email logging
- **Weekly Plans**: `create_weekly_plan()` handles plan creation + task insertion
- **Sessions**: Future RPC functions for session creation + client invitations

This ensures data consistency and eliminates partial state failures.

### Development Workflow
1. **Start**: `npm run dev` - Full development environment
2. **Check**: `npm run tool:check` - Quick validation
3. **Test**: `npm run test` - Run test suite
4. **Build**: `npm run build` - Production build
5. **Deploy**: Follow deployment guide below

## Deploy
- Set env vars on Vercel
- Create Storage bucket `media`
- Add RLS policies ensuring coach_id = auth.uid() on tables
- Deploy Supabase RPC functions (see `supabase/README.md`)

## Getting Help
- Run `npm run help` for complete command reference
- Check `docs/` directory for detailed documentation
- Review `UNIVERSAL_HEADER.md` for development rules
- Use `npm run tool:doctor` for system diagnostics
