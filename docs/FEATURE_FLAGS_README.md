# Feature Flags System

## Overview

The feature flags system provides runtime toggles for enabling/disabling system features across different environments. All user-visible changes are shipped behind flags to ensure safe deployment and rollback capabilities.

## Architecture

### Core Components

- **`lib/registry/flags.ts`** - Centralized feature flag definitions and logic
- **`lib/registry/FlagsProvider.tsx`** - React context provider for feature flags
- **`components/ui/FeatureGate.tsx`** - Component wrapper for conditional rendering
- **`__tests__/smoke.preview.test.ts`** - Preview deployment smoke tests

### Environment Support

The system automatically detects the environment using:
1. `VERCEL_ENV` (provided by Vercel)
2. `NEXT_PUBLIC_ENV` (custom environment variable)
3. `NODE_ENV` (fallback)

## Usage

### Basic Feature Gate

```tsx
import { FeatureGate } from '@ui/FeatureGate';

export default function MyPage() {
  return (
    <FeatureGate flag="my-feature">
      <div>This content is only visible when my-feature is enabled</div>
    </FeatureGate>
  );
}
```

### Using the Hook

```tsx
import { useFeatureFlag } from '@lib/registry/FlagsProvider';

export default function MyComponent() {
  const isEnabled = useFeatureFlag('my-feature');
  
  if (!isEnabled) {
    return <div>Feature not available</div>;
  }
  
  return <div>Feature enabled!</div>;
}
```

### Direct Flag Checking

```tsx
import { isEnabled } from '@lib/registry/flags';

export function myFunction() {
  if (isEnabled('my-feature')) {
    // Feature-specific logic
  }
}
```

## Flag Behavior by Environment

### Production (`production`)
- Flags are **OFF** unless explicitly set to `true`
- Maximum safety - no unexpected features enabled

### Preview (`preview`)
- Flags may default **ON** for changed routes
- Allows testing of new features before production

### Development (`development`)
- Flags may default **ON** for changed routes
- Developer-friendly for local testing

## Adding New Flags

1. **Define the flag** in `lib/registry/flags.ts`:
   ```typescript
   features: {
     'my-new-feature': false, // Default to OFF for safety
   }
   ```

2. **Wrap your component** with `FeatureGate`:
   ```tsx
   <FeatureGate flag="my-new-feature">
     <YourComponent />
   </FeatureGate>
   ```

3. **Enable the flag** in your environment:
   ```bash
   # For development
   NEXT_PUBLIC_ENV=development npm run dev
   
   # For preview deployments
   # The flag will be evaluated based on VERCEL_ENV
   ```

## Preview Deployment Checks

### Automatic Testing

Every pull request automatically triggers:
1. **Vercel Preview Deployment** - Creates a preview URL
2. **Smoke Tests** - Verifies feature flag gating works
3. **Status Check** - Reports results in the PR

### Manual Testing

Run preview tests locally:
```bash
# Set preview URL and run tests
PREVIEW_URL=https://your-preview.vercel.app npm run test:preview
```

### Test Requirements

The smoke tests verify:
- ✅ Sentinel check route is accessible
- ✅ Feature flag gating works correctly
- ✅ Preview deployment is healthy

## CI/CD Integration

### Required Checks

The `sentinel-preview` check must pass before merging:
- Runs on all pull requests
- Tests against Vercel preview deployments
- Verifies feature flag functionality
- Provides detailed feedback in PR comments

### Failure Handling

If the preview check fails:
1. Review the logs for specific errors
2. Verify feature flags are properly configured
3. Check that routes use `FeatureGate` components
4. Re-run the check after fixes

## Security & Best Practices

### Never Weaken RLS
- Feature flags should not bypass security controls
- Always maintain proper authentication and authorization

### Environment Variables
- Use `NEXT_PUBLIC_*` for client-side flags
- Keep sensitive flag logic server-side only

### Flag Naming
- Use kebab-case: `my-feature-name`
- Be descriptive: `advanced-analytics` not `analytics`
- Group related flags with prefixes

## Troubleshooting

### Flag Not Working
1. Check if the flag is defined in `lib/registry/flags.ts`
2. Verify the environment detection is correct
3. Ensure `FeatureGate` is properly imported and used

### Preview Tests Failing
1. Check the preview URL is accessible
2. Verify feature flags are enabled for preview environment
3. Review the smoke test logs for specific errors

### Environment Detection Issues
1. Check `VERCEL_ENV` is set correctly
2. Verify `NEXT_PUBLIC_ENV` if using custom environment
3. Fallback to `NODE_ENV` should work for local development

## Examples

### Complete Page Example

```tsx
import { FeatureGate } from '@ui/FeatureGate';

export default function NewFeaturePage() {
  return (
    <FeatureGate flag="new-feature">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold">New Feature</h1>
        <p>This page is only visible when new-feature is enabled.</p>
        
        {/* Your feature content here */}
      </div>
    </FeatureGate>
  );
}
```

### Conditional Component Example

```tsx
import { useFeatureFlag } from '@lib/registry/FlagsProvider';

export function MyComponent() {
  const showAdvanced = useFeatureFlag('advanced-features');
  const showBeta = useFeatureFlag('beta-features');
  
  return (
    <div>
      <h2>Basic Features</h2>
      {/* Always visible */}
      
      {showAdvanced && (
        <div>
          <h3>Advanced Features</h3>
          {/* Advanced features */}
        </div>
      )}
      
      {showBeta && (
        <div>
          <h3>Beta Features</h3>
          {/* Beta features */}
        </div>
      )}
    </div>
  );
}
```

## Migration Notes

### From Old System

If you were using the old feature flag system:
1. Replace direct flag checks with `isEnabled(flag)`
2. Wrap components with `FeatureGate` instead of manual conditionals
3. Use `useFeatureFlag` hook for dynamic flag checking

### Backward Compatibility

The system maintains backward compatibility:
- Old `isFeatureEnabled()` functions still work
- Existing `FeatureGate` usage continues to function
- Gradual migration is supported
