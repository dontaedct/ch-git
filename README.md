# Coach Hub (Minimal)
- Routes: /sessions (authed), /intake (public)
- Supabase: Auth, Postgres (RLS by coach_id), Storage (bucket `media`)
- Emails: Resend (transactional only)
- Cron: /api/weekly-recap with ?secret=CRON_SECRET
- Env: see .env.local keys

## Setup
1. Copy `.env.example` to `.env` and configure your environment variables
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Dev
npm run dev

## Deploy
- Set env vars on Vercel
- Create Storage bucket `media`
- Add RLS policies ensuring coach_id = auth.uid() on tables
- Deploy Supabase RPC functions (see `supabase/README.md`)

## Architecture

### Database Operations
For any multi-table write sequence, we use Supabase RPC functions that execute atomically:

- **Intake Flow**: `create_client_intake()` handles client upsert + email logging
- **Weekly Plans**: `create_weekly_plan()` handles plan creation + task insertion
- **Sessions**: Future RPC functions for session creation + client invitations

This ensures data consistency and eliminates partial state failures.

## Redirect Chain Prevention

This application includes middleware-level protection against redirect chains to prevent infinite redirect loops. The system works as follows:

### How It Works

1. **Detection**: The middleware detects potential redirect loops by monitoring referer headers and same-path requests
2. **Cookie Marker**: When a redirect is detected, a `__redirect_guard` cookie is set with a 30-second TTL
3. **Chain Prevention**: Subsequent requests with the redirect guard cookie skip middleware processing
4. **Cleanup**: The cookie is automatically cleared in destination routes

### Implementation

- **Middleware**: `middleware.ts` handles the detection and prevention logic
- **Utility**: `lib/utils.ts` provides `clearRedirectGuardCookie()` for manual cleanup
- **Cookie Name**: `__redirect_guard` (30s TTL for loops, 10s for rate limits)

### Usage in Routes

```typescript
import { clearRedirectGuardCookie } from '@lib/utils';
import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ data: 'success' });
  return clearRedirectGuardCookie(response);
}
```

This system ensures that redirect chains are automatically prevented while maintaining the security and functionality of the middleware.
