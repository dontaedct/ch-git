# Step 5: Single Source of Truth for Feature Flags (Supabase)

## Overview

This step consolidates all feature flags into a single Supabase-managed system, replacing file-based and ad-hoc flag management with a centralized, tenant-aware solution.

## Implementation

### Database Schema

**Table: `feature_flags`**
```sql
CREATE TABLE feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);
```

**Key Features:**
- Tenant-based isolation (each coach has their own flags)
- JSONB payload for additional configuration
- Automatic timestamps with triggers
- Unique constraint per tenant+key combination

### Row Level Security (RLS)

**Tenant Access:**
- Tenants can read/write only their own flags
- Uses `tenant_id = auth.uid()` for isolation

**Admin Access:**
- Admins can read/write all flags
- Uses `raw_user_meta_data->>'role' = 'admin'` check
- Allows system-wide flag management

### Server Utilities (`lib/flags/server.ts`)

**Core Functions:**
- `getFlag(tenantId, key)` - Get single flag with caching
- `getAllFlags(tenantId)` - Get all flags for tenant
- `getFlagsMap(tenantId)` - Get flags as key-value map
- `setFlag(tenantId, key, enabled, payload)` - Set single flag (admin)
- `setFlags(tenantId, flags[])` - Bulk set flags (admin)

**Caching:**
- In-memory cache with configurable TTL (default: 5 minutes)
- Automatic cache invalidation on updates
- Edge-safe functions for serverless environments

**Edge Safety:**
- `getFlagEdge()` - Direct database query without caching
- Suitable for edge functions and serverless environments
- Never leaks server keys to client

### Admin UI (`/app/operability/flags`)

**Features:**
- View all tenants and their flag states
- Toggle flags per tenant with real-time updates
- Admin authentication required
- Responsive design with status indicators

**Components:**
- `FlagManagementInterface` - Main admin interface
- `TenantFlagCard` - Per-tenant flag display
- `FlagToggleForm` - Individual flag toggle controls

### API Endpoints

**`/api/admin/flags`**
- `PUT` - Update single flag (admin only)
- `GET` - Get flags for specific tenant (admin only)
- Includes admin authentication checks

## Migration

### From File-Based Flags

**Legacy Files:**
- `lib/registry/flags.ts` - Marked as deprecated
- `lib/ai/flags.ts` - Environment-based flags

**Migration Script:**
```bash
npx tsx scripts/migrate-flags.ts
```

**Process:**
1. Reads existing file-based flags
2. Creates Supabase entries for all tenants
3. Preserves existing flag states
4. Adds migration metadata to payload

### Default Flags

The migration seeds these default flags (all disabled):
- `guardian_enabled` - AI Guardian system
- `stripe_receipt_flow` - Enhanced payment receipts
- `advanced_analytics` - Advanced reporting features
- `ai_coaching` - AI-powered coaching features
- `mobile_app` - Mobile application features
- `social_features` - Social sharing and community
- `beta_features` - Beta feature access
- `performance_monitoring` - Enhanced performance tracking

## Usage Examples

### Server-Side Flag Access

```typescript
import { getFlag, getAllFlags } from '@lib/flags/server';

// Get single flag
const guardianEnabled = await getFlag(userId, 'guardian_enabled');

// Get all flags
const allFlags = await getAllFlags(userId);

// Get flags as map
const flagsMap = await getFlagsMap(userId);
if (flagsMap['ai_coaching']) {
  // Enable AI coaching features
}
```

### Edge Function Usage

```typescript
import { getFlagEdge } from '@lib/flags/server';

export default async function handler(req: Request) {
  const guardianEnabled = await getFlagEdge(userId, 'guardian_enabled');
  
  if (guardianEnabled) {
    // Apply Guardian protections
  }
}
```

### Admin Flag Management

```typescript
import { setFlag, setFlags } from '@lib/flags/server';

// Set single flag
await setFlag(tenantId, 'ai_coaching', true, { 
  model: 'gpt-4', 
  maxTokens: 1000 
});

// Bulk set flags
await setFlags(tenantId, [
  { key: 'guardian_enabled', enabled: true },
  { key: 'beta_features', enabled: false }
]);
```

## Security Considerations

### Access Control
- RLS policies enforce tenant isolation
- Admin role required for system-wide changes
- No client-side flag exposure

### Caching Security
- Server-only cache (never exposed to client)
- Automatic invalidation on updates
- Edge-safe alternatives available

### Data Protection
- No sensitive data in flag payloads
- Audit trail via `updated_at` timestamps
- Cascade delete on tenant removal

## Performance

### Caching Strategy
- 5-minute TTL for flag queries
- In-memory cache for fast access
- Automatic cache warming on first access

### Database Optimization
- Indexes on `tenant_id`, `key`, and `enabled`
- Composite index on `(tenant_id, key)`
- Efficient RLS policy execution

### Edge Compatibility
- Direct database queries for edge functions
- No caching dependencies in serverless environments
- Minimal latency for flag checks

## Monitoring

### Cache Statistics
```typescript
import { getCacheStats } from '@lib/flags/server';

const stats = getCacheStats();
console.log(`Cache size: ${stats.size}, Entries: ${stats.entries}`);
```

### Database Functions
- `get_tenant_flags(tenant_uuid)` - Get all flags for tenant
- `is_flag_enabled(tenant_uuid, flag_key)` - Check specific flag

## Testing

### Unit Tests
- Flag retrieval and caching
- Admin access controls
- Edge function compatibility

### Integration Tests
- RLS policy enforcement
- Cache invalidation
- Admin UI functionality

### Security Tests
- Tenant isolation verification
- Admin privilege escalation prevention
- Client-side flag exposure prevention

## Rollback Plan

If issues arise:
1. Disable new flag system via environment variable
2. Fall back to file-based flags temporarily
3. Use migration script to restore previous state
4. Investigate and fix issues before re-enabling

## Future Enhancements

### Planned Features
- Flag change audit logging
- A/B testing framework integration
- Flag dependency management
- Real-time flag updates via WebSockets

### Scalability Considerations
- Redis cache backend for multi-instance deployments
- Flag change notifications
- Bulk flag operations optimization
- Tenant flag templates
