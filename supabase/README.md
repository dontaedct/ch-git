# Supabase RPC Functions

This directory contains SQL migrations for Supabase RPC functions that provide atomic database operations.

## Deployment

### Option 1: Supabase Dashboard (Recommended for development)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/create_client_intake_rpc.sql`
4. Click "Run" to execute the migration

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

## Functions

### `create_client_intake`

**Purpose**: Atomic intake flow that handles both client creation/update and email logging in a single transaction.

**Parameters**:
- `p_coach_id` (UUID): The coach's ID
- `p_email` (TEXT): Client's email address
- `p_first_name` (TEXT): Client's first name
- `p_last_name` (TEXT): Client's last name
- `p_phone` (TEXT, optional): Client's phone number

**What it does**:
1. Upserts client record (inserts new or updates existing)
2. Logs email activity in email_logs table
3. All operations execute atomically - if any fail, all are rolled back

**Security**: Uses `SECURITY DEFINER` to run with elevated privileges, but only allows authenticated users and service role to execute.

## Benefits

- **Atomicity**: All database operations succeed or fail together
- **Performance**: Single database round-trip instead of multiple
- **Reliability**: No partial state if operations fail
- **Maintainability**: Business logic centralized in database function
