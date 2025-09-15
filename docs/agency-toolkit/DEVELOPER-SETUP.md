# Agency Toolkit - Solo Developer Setup Guide

**Version:** 1.0.0
**Last Updated:** September 14, 2025
**HT-021.4.4:** Agency Toolkit Documentation & Solo Developer Experience

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ and npm/yarn
- Git for version control
- VS Code (recommended) or your preferred editor

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd my-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### 2. Essential Environment Variables

```env
# Required for agency toolkit
NEXT_PUBLIC_CLIENT_MODE=agency
NEXT_PUBLIC_AGENCY_TOOLKIT_ENABLED=true

# Database (Supabase recommended)
DATABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Optional: Performance monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 3. Verify Installation

Visit `http://localhost:3000` and check:
- ✅ App loads without errors
- ✅ Agency toolkit components render
- ✅ Performance monitoring active
- ✅ No TypeScript errors in console

## Detailed Setup

### IDE Configuration (VS Code)

Install recommended extensions:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

### TypeScript Configuration

The project uses strict TypeScript. Key settings:

```json
// tsconfig.json highlights
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Development Scripts

```bash
# Development
npm run dev          # Start dev server
npm run dev:debug    # Start with debug logging

# Building
npm run build        # Production build
npm run build:analyze # Build with bundle analyzer

# Testing
npm test            # Run tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report

# Code Quality
npm run lint        # ESLint
npm run type-check  # TypeScript check
npm run format      # Prettier formatting

# Design Tokens
npm run tokens:build # Build design tokens

# Performance
node scripts/performance-test.mjs # Run performance tests
```

## Agency Toolkit Development

### 1. Creating a New Client Template

```typescript
// lib/agency-toolkit/templates/my-template.ts
import { ClientTemplate, DEFAULT_THEME } from '../template-system';

export const MY_TEMPLATE: Omit<ClientTemplate, 'id' | 'client' | 'createdAt' | 'updatedAt'> = {
  name: 'My Custom Template',
  description: 'Description of your template',
  category: 'custom',
  layout: {
    type: 'single-page',
    header: {
      enabled: true,
      title: 'My Template',
      navigation: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' }
      ]
    },
    footer: {
      enabled: true,
      content: 'Powered by Agency Toolkit'
    },
    content: {
      padding: 'lg',
      maxWidth: 'lg',
      center: true
    }
  },
  theme: DEFAULT_THEME,
  components: {}
};
```

### 2. Adding Custom Integration Hooks

```typescript
// lib/agency-toolkit/hooks/my-integration.ts
import { IntegrationHook } from '../integration-hooks';

export async function createMyIntegrationHook(
  clientId: string,
  config: MyIntegrationConfig
): Promise<IntegrationHook> {
  return await integrationManager.registerHook({
    name: 'My Custom Integration',
    type: 'custom',
    clientId,
    config: {
      endpoint: config.apiEndpoint,
      auth: {
        type: 'apikey',
        credentials: { key: config.apiKey }
      },
      parameters: config.parameters
    },
    enabled: true,
    priority: 1
  });
}
```

### 3. Custom Security Policies

```typescript
// lib/agency-toolkit/security/custom-policy.ts
import { SecurityPolicy } from '../client-security';

export const CUSTOM_SECURITY_POLICY: SecurityPolicy = {
  id: 'custom-policy',
  name: 'Custom Security Policy',
  type: 'custom',
  enabled: true,
  priority: 10,
  rules: [
    {
      id: 'custom-rule',
      condition: 'request.customField === "value"',
      action: 'allow',
      parameters: { customParam: 'customValue' }
    }
  ]
};
```

## Development Workflow

### 1. Client Onboarding Workflow

```typescript
// Example: Complete client setup
import { agencyToolkit } from '@/lib/agency-toolkit';

async function onboardNewClient() {
  const client = await agencyToolkit.initializeClient(
    'new-client-id',
    'New Client Name',
    {
      template: 'DASHBOARD',
      securityTier: 'STANDARD',
      theme: {
        colors: {
          primary: '#your-brand-color'
        }
      },
      hooks: [
        {
          name: 'Payment Processing',
          type: 'payment',
          config: { /* payment config */ },
          enabled: true,
          priority: 1
        }
      ]
    }
  );

  const deployment = await agencyToolkit.deployClient(
    client.template.id,
    'preview'
  );

  console.log(`Client deployed: ${deployment.url}`);
}
```

### 2. Testing Your Changes

```bash
# Run component tests
npm run test -- --testPathPattern="agency-toolkit"

# Performance validation
node scripts/performance-test.mjs

# Security validation
npm run security-audit

# Build test
npm run build
```

### 3. Local Development Best Practices

#### Hot Reloading
The development server supports hot reloading for:
- ✅ React components
- ✅ TypeScript files
- ✅ Tailwind CSS classes
- ✅ Design tokens (with tokens:build)

#### Component Development

```typescript
// Use React DevTools for debugging
// Install React Developer Tools browser extension

// Debug performance
import { usePerformanceMonitorService } from '@/lib/monitoring';

function MyComponent() {
  const { measureComponent } = usePerformanceMonitorService();

  useEffect(() => {
    const endMeasure = measureComponent('MyComponent');
    return () => endMeasure('mount');
  }, []);

  return <div>My Component</div>;
}
```

#### State Management

```typescript
// Use Zustand for state
import { useAppStore } from '@/lib/state';

function MyComponent() {
  const { user, setUser } = useAppStore();

  return (
    <div>
      <p>User: {user?.name}</p>
      <button onClick={() => setUser({ name: 'New User' })}>
        Update User
      </button>
    </div>
  );
}
```

## Common Development Tasks

### Adding New Routes

```typescript
// app/my-route/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Route',
  description: 'Description of my route'
};

export default function MyRoutePage() {
  return (
    <div>
      <h1>My Route</h1>
    </div>
  );
}
```

### Creating API Endpoints

```typescript
// app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your API logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Your POST logic

  return NextResponse.json({ success: true });
}
```

### Custom Components

```typescript
// components/my-component.tsx
import { useBrandStyling } from '@/lib/branding';

interface MyComponentProps {
  title: string;
  children?: React.ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  const { getBrandClasses, getBrandColor } = useBrandStyling();

  return (
    <div className={getBrandClasses('p-4 rounded-lg')}>
      <h2 style={{ color: getBrandColor('primary') }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
```

## Debugging Guide

### Common Issues

#### 1. TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Common fixes:
# - Add proper type imports
# - Check tsconfig.json paths
# - Verify interface definitions
```

#### 2. Build Failures
```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# Check for:
# - Missing environment variables
# - Import path issues
# - TypeScript errors
```

#### 3. Performance Issues
```bash
# Run performance diagnostics
node scripts/performance-test.mjs

# Check:
# - Bundle size with npm run build:analyze
# - Component render times
# - Memory usage patterns
```

### Development Tools

#### Browser DevTools
- **React DevTools**: Component debugging
- **Performance Tab**: Core Web Vitals monitoring
- **Network Tab**: API call monitoring
- **Console**: Error tracking and logging

#### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## Deployment

### Local Preview Build

```bash
# Test production build locally
npm run build
npm run start

# Verify:
# - All routes work correctly
# - Performance metrics are good
# - No console errors
```

### Environment-Specific Builds

```bash
# Development
NEXT_PUBLIC_ENV=development npm run build

# Staging
NEXT_PUBLIC_ENV=staging npm run build

# Production
NEXT_PUBLIC_ENV=production npm run build
```

## Getting Help

### Documentation
- [Architecture Guide](./ARCHITECTURE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Performance Guide](./PERFORMANCE.md)

### Code Examples
Check the `examples/` directory for:
- Template implementations
- Integration patterns
- Security configurations
- Performance optimizations

### Development Commands Quick Reference

```bash
# Essential commands
npm run dev              # Start development
npm run build            # Production build
npm run test             # Run tests
npm run type-check       # TypeScript validation
npm run lint             # Code linting

# Agency toolkit specific
node scripts/performance-test.mjs  # Performance tests
npm run tokens:build              # Rebuild design tokens
npm run security-audit           # Security validation

# Debugging
npm run build:analyze    # Bundle analysis
npm run dev:debug       # Debug mode
```

This setup guide should get you productive with the agency toolkit in minutes. For specific issues, refer to the troubleshooting guide or check the examples directory.