# Tooling, Build, Config & Environment
**Date: 2025-08-25**

## Package.json Scripts

| Script | Command | What it does | When to use |
|--------|---------|--------------|-------------|
| `dev` | `npm run dev` | Starts development server with CLI wrapper | Local development |
| `build` | `npm run build` | Builds production application | Before deployment |
| `start` | `npm start` | Starts production server | Production deployment |
| `lint` | `npm run lint` | Runs ESLint code quality checks | Code review, CI |
| `typecheck` | `npm run typecheck` | Runs TypeScript type checking | Code review, CI |
| `check` | `npm run check` | Runs lint + typecheck together | Pre-commit, CI |
| `test` | `npm test` | Runs all test suites | Development, CI |
| `test:unit` | `npm run test:unit` | Runs unit tests only | Development |
| `test:integration` | `npm run test:integration` | Runs integration tests | Development, CI |
| `test:e2e` | `npm run test:e2e` | Runs end-to-end tests | Pre-deployment |
| `test:coverage` | `npm run test:coverage` | Generates test coverage report | Quality assessment |
| `test:mutation` | `npm run test:mutation` | Runs mutation testing | Quality assurance |
| `doctor` | `npm run doctor` | Runs comprehensive health checks | Troubleshooting |
| `ci` | `npm run ci` | Runs CI pipeline checks | Continuous integration |
| `quality` | `npm run quality` | Runs code quality analysis | Code review |
| `ui:defense` | `npm run ui:defense` | Runs UI safety tests | Pre-deployment |
| `security:test` | `npm run security:test` | Runs security scans | Security audit |
| `operability:health` | `npm run operability:health` | Checks system health | Monitoring |
| `guard:test` | `npm run guard:test` | Tests route guards | Security validation |

### Rename Scripts (OSS Hero Compliant)
| Script | Command | What it does | When to use |
|--------|---------|--------------|-------------|
| `rename:symbol` | `npm run rename:symbol -- OldName NewName` | Renames symbols safely | Refactoring |
| `rename:import` | `npm run rename:import -- @data/old @data/new` | Updates import paths | Module restructuring |
| `rename:route` | `npm run rename:route -- oldKey newKey` | Renames routes safely | Route changes |
| `rename:table` | `npm run rename:table -- old_table new_table` | Renames database tables | Schema changes |

### Development Tools
| Script | Command | What it does | When to use |
|--------|---------|--------------|-------------|
| `dev:status` | `npm run dev:status` | Shows development environment status | Troubleshooting |
| `dev:clean` | `npm run dev:clean` | Cleans development artifacts | Reset environment |
| `dev:ports` | `npm run dev:ports` | Shows port usage | Port conflicts |
| `tool:analyze` | `npm run tool:analyze` | Analyzes project structure | Project assessment |
| `tool:quality` | `npm run tool:quality` | Runs quality analysis tools | Code review |

## Dependencies vs DevDependencies

### Key Production Dependencies
- **Next.js 15.4.6**: React framework with App Router
- **React 19.1.0**: Latest React with concurrent features
- **Supabase**: Database, auth, and real-time subscriptions
- **Stripe**: Payment processing and webhooks
- **Resend**: Transactional email service
- **n8n**: Workflow automation (via webhooks)
- **Zod**: Runtime type validation and schemas
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

### Key Development Dependencies
- **TypeScript 5**: Static type checking
- **Jest**: Testing framework
- **Playwright**: End-to-end testing
- **ESLint**: Code quality and linting
- **Stryker**: Mutation testing
- **Husky**: Git hooks for pre-commit checks
- **tsx**: TypeScript execution for scripts

### Unusual/Pinned Versions
- **Node 20.19.4**: Specific Node.js version for stability
- **npm 10.8.2**: Specific npm version for consistency
- **React 19.1.0**: Latest React with breaking changes
- **Next.js 15.4.6**: Latest Next.js with App Router

## Build/Dev Scripts

### Development CLI (`bin/dev-cli.mjs`)
- **Purpose**: Centralized development command runner
- **Features**: Unified interface for all dev operations
- **Commands**: `dev`, `build`, `lint`, `typecheck`, `test`, `doctor`, `ci`

### Code Quality Scripts (`scripts/dev-support/`)
- **`code-quality-checker.mjs`**: Comprehensive code analysis
- **`project-analyzer.mjs`**: Project structure analysis
- **`dependency-manager.mjs`**: Dependency management utilities
- **`build-optimizer.mjs`**: Build optimization tools

### System Administration (`scripts/system-admin/`)
- **`health-monitor.mjs`**: System health monitoring
- **`performance-analyzer.mjs`**: Performance analysis tools
- **`security-checker.mjs`**: Security validation tools
- **`backup-manager.mjs`**: Backup and recovery tools

### Project Management (`scripts/project-management/`)
- **`task-tracker.mjs`**: Task tracking and management
- **`milestone-manager.mjs`**: Milestone and release management
- **`resource-allocator.mjs`**: Resource allocation tools
- **`progress-reporter.mjs`**: Progress reporting and metrics

## TypeScript Configuration

### Compiler Options (`tsconfig.json`)
- **Target**: ES2022 for modern JavaScript features
- **Module**: ESNext for latest module syntax
- **Strict**: Enabled for type safety
- **NoImplicitAny**: Disabled for flexibility during development
- **SkipLibCheck**: Enabled for faster builds
- **BaseUrl**: "." for absolute imports
- **Paths**: Comprehensive alias mapping for clean imports

### Path Aliases
```json
{
  "@app/*": ["src/app/*", "app/*"],
  "@data/*": ["src/data/*", "data/*"],
  "@lib/*": ["src/lib/*", "lib/*"],
  "@ui/*": ["components/ui/*", "src/components/ui/*"],
  "@registry/*": ["src/registry/*", "registry/*"],
  "@compat/*": ["src/compat/*", "compat/*"]
}
```

### Type Checking Behavior
- **Strict Mode**: Enabled for maximum type safety
- **Incremental**: Enabled for faster rebuilds
- **AllowJs**: Enabled for mixed JavaScript/TypeScript
- **Plugin Support**: Next.js plugin for framework integration

## Next.js Configuration

### Key Flags (`next.config.ts`)
- **ESLint**: Enabled during builds for code quality
- **TypeScript**: Temporarily disabled for OSS Hero migration
- **Bundle Analysis**: Configurable via `ANALYZE` environment variable
- **Transpile Packages**: Supabase packages for compatibility

### Security Headers
- **Content Security Policy**: Configured for preview builds
- **X-Content-Type-Options**: `nosniff` for security
- **Referrer Policy**: `strict-origin-when-cross-origin`
- **Environment-Specific**: Different CSP for preview vs production

### Redirects & Rewrites
- **OSS Hero Migration**: Redirects from old routes to new structure
- **Permanent Redirects**: 308 status for SEO-friendly redirects
- **Path Preservation**: Maintains URL structure during migration

## Environment Configuration

### Environment Variables (`env.example`)

#### Supabase Configuration
- **`NEXT_PUBLIC_SUPABASE_URL`**: Supabase project URL for client-side access
  - **Used in**: `lib/supabase/client.ts`, `lib/supabase/server.ts`
  - **How consumed**: Database connection and authentication
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Supabase anonymous key for client authentication
  - **Used in**: `lib/supabase/client.ts`, `lib/supabase/server.ts`
  - **How consumed**: Client-side database operations
- **`SUPABASE_SERVICE_ROLE_KEY`**: Supabase service role for server-side operations
  - **Used in**: `lib/supabase/server.ts`, API routes
  - **How consumed**: Server-side database operations with elevated privileges

#### Email Service
- **`RESEND_API_KEY`**: Resend API key for transactional emails
  - **Used in**: `lib/email.ts`, n8n workflows
  - **How consumed**: Email delivery service integration

#### Payment Processing
- **`STRIPE_SECRET_KEY`**: Stripe secret key for payment operations
  - **Used in**: n8n workflows, payment API routes
  - **How consumed**: Payment processing and webhook handling
- **`STRIPE_WEBHOOK_SECRET`**: Stripe webhook signature verification
  - **Used in**: Webhook handlers, n8n workflows
  - **How consumed**: Webhook security and validation

#### n8n Workflow Integration
- **`OSS_HERO_N8N_HMAC_SECRET`**: HMAC secret for n8n webhook security
  - **Used in**: n8n workflows, webhook validation
  - **How consumed**: Webhook authentication and security
- **`N8N_WEBHOOK_BASE_URL`**: Base URL for n8n webhook endpoints
  - **Used in**: n8n workflow configuration
  - **How consumed**: Workflow endpoint configuration
- **`N8N_CALLBACK_BASE_URL`**: Base URL for n8n callback operations
  - **Used in**: n8n workflow callbacks
  - **How consumed**: Workflow completion notifications

#### Cron Job Security
- **`CRON_SECRET`**: Secret for cron job authentication
  - **Used in**: Cron job handlers, scheduled tasks
  - **How consumed**: Scheduled task security

#### Feature Flags
- **`NEXT_PUBLIC_DEBUG`**: Debug mode toggle
  - **Used in**: Client-side debugging, development tools
  - **How consumed**: Feature flag system
- **`NEXT_PUBLIC_SAFE_MODE`**: Safe mode feature toggle
  - **Used in**: Safety systems, Guardian backup
  - **How consumed**: Emergency mode activation

#### Organization Configuration
- **`NEXT_PUBLIC_ORG_NAME`**: Organization name for branding
  - **Used in**: UI components, email templates
  - **How consumed**: Dynamic branding and customization
- **`NEXT_PUBLIC_BRAND_SLUG`**: Brand slug for routing
  - **Used in**: Routing, URL generation
  - **How consumed**: Multi-tenant routing
- **`DEFAULT_SENDER`**: Default email sender address
  - **Used in**: Email service, notification system
  - **How consumed**: Email sender configuration

### Missing/Referenced Environment Variables
- **`SENTRY_DSN`**: Referenced in Sentry config but not in env.example
- **`NEXT_PUBLIC_SENTRY_DSN`**: Referenced in Sentry config but not in env.example
- **`SLACK_WEBHOOK_URL`**: Referenced in n8n workflows but not in env.example
- **`GITHUB_TOKEN`**: Referenced in n8n workflows but not in env.example
- **`GITHUB_REPO`**: Referenced in n8n workflows but not in env.example

## Local Dev vs Preview vs Production

### Local Development
- **Environment**: `NODE_ENV=development`
- **Features**: Hot reloading, debug tools, local database
- **Security**: Relaxed CSP, development-specific headers
- **Database**: Local Supabase instance or development database

### Preview Environment
- **Environment**: `VERCEL_ENV=preview`
- **Features**: Staging data, preview deployments, testing
- **Security**: Preview-specific CSP with `unsafe-inline`
- **Database**: Preview/staging database instance

### Production Environment
- **Environment**: `VERCEL_ENV=production`
- **Features**: Production optimizations, CDN, monitoring
- **Security**: Strict CSP, production security headers
- **Database**: Production database with full RLS policies

### Environment-Specific Considerations
- **CSP Headers**: Different Content Security Policy per environment
- **Database**: Separate instances for data isolation
- **Monitoring**: Enhanced monitoring in production
- **Error Handling**: Different error handling strategies per environment
- **Feature Flags**: Environment-specific feature toggles
