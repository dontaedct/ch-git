# Configuration Inventory - Environment Variables & Settings

Generated on: 2025-08-29T03:53:00Z

## Environment Variable Categories

### Core Application Configuration
- **NODE_ENV**: Runtime environment detection (development/production)
- **PORT**: Development server port (default: 3000)
- **CI**: CI environment detection (auto-set)

### Supabase Configuration
- **NEXT_PUBLIC_SUPABASE_URL**: Public database connection URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Client-side database access key
- **SUPABASE_SERVICE_ROLE_KEY**: Server-side database operations (private)
- **SUPABASE_DB_URL**: Direct database connection for scripts (private)

### Authentication & User Management
- **No additional auth configuration required for basic template**

### Email Services (Resend)
- **RESEND_API_KEY**: Email sending service API key (private)
- **RESEND_FROM**: Default sender email address (private)

### Monitoring & Error Tracking (Sentry)
- **SENTRY_DSN**: Server-side error tracking (private)
- **NEXT_PUBLIC_SENTRY_DSN**: Client-side error tracking (public)

### Payment Processing (Stripe)
- **STRIPE_SECRET_KEY**: Payment processing secret key (private)
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Client-side payment forms (public)
- **STRIPE_WEBHOOK_SECRET**: Webhook signature verification (private)

### Automation & Workflows (n8n)
- **N8N_WEBHOOK_URL**: Workflow automation triggers (private)
- **N8N_WEBHOOK_SECRET**: HMAC signing for webhook security (private)
- **N8N_WEBHOOK_TIMEOUT**: Request timeout in milliseconds (private)
- **N8N_WEBHOOK_MAX_RETRIES**: Maximum retry attempts (private)

### Notifications & Alerts
- **SLACK_WEBHOOK_URL**: Slack notifications and alerts (private)

### CI/CD & Deployment
- **GITHUB_TOKEN**: GitHub API access for CI/CD (private)
- **GITHUB_REPO**: Repository identification for CI/CD (private)

### Development & Debugging
- **NEXT_PUBLIC_DEBUG**: Enable debug logging in development (public)
- **NEXT_PUBLIC_SAFE_MODE**: Enable safe mode features (public)
- **NEXT_PUBLIC_ENABLE_AI_LIVE**: Enable AI live features (public)
- **AUTO**: Enable automatic fixes in scripts (development)

### Security & Cron Jobs
- **CRON_SECRET**: Secure cron job execution (private)

### Deployment Platform
- **NEXT_PUBLIC_VERCEL_ENV**: Deployment environment detection (public)

## Configuration Files

### Environment Files
- **env.example**: Template with all possible environment variables
- **.env.local**: Local development environment (gitignored)
- **.env.production**: Production environment (gitignored)

### Next.js Configuration
- **next.config.ts**: Next.js framework configuration
- **tsconfig.json**: TypeScript configuration
- **tailwind.config.js**: Tailwind CSS configuration
- **postcss.config.js**: PostCSS configuration

### Build & Development
- **jest.config.js**: Jest testing configuration
- **jest.setup.js**: Jest setup and configuration
- **playwright.config.ts**: Playwright E2E testing configuration
- **eslint.config.js**: ESLint configuration

### Supabase Configuration
- **supabase/config.toml**: Supabase project configuration
- **supabase/migrations/**: Database migration files

## Security Classification

### Public Variables (NEXT_PUBLIC_*)
- **Safe for client exposure**: Database URLs, publishable keys, feature flags
- **Used in**: Client-side components, public APIs, browser environment
- **Security level**: Low - no sensitive data

### Private Variables (Server-only)
- **Never exposed to client**: API keys, secrets, database credentials
- **Used in**: Server-side code, API routes, scripts
- **Security level**: High - contains sensitive data

### Development Variables
- **Local development only**: Debug flags, development ports, auto-fix modes
- **Used in**: Development scripts, local testing
- **Security level**: Medium - development-specific settings

## Configuration Dependencies

### Required for Basic Functionality
- **NEXT_PUBLIC_SUPABASE_URL**: Database connection
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Client database access
- **NODE_ENV**: Environment detection

### Required for Email Functionality
- **RESEND_API_KEY**: Email service
- **RESEND_FROM**: Sender address

### Required for Payment Processing
- **STRIPE_SECRET_KEY**: Payment processing
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Client payment forms
- **STRIPE_WEBHOOK_SECRET**: Webhook security

### Required for Monitoring
- **SENTRY_DSN**: Error tracking
- **NEXT_PUBLIC_SENTRY_DSN**: Client error tracking

### Optional Features
- **N8N_WEBHOOK_***: Workflow automation
- **SLACK_WEBHOOK_URL**: Notifications
- **GITHUB_***: CI/CD integration

## Configuration Validation

### Environment Validation
- **lib/env.ts**: Runtime environment validation
- **scripts/check-env.ts**: Environment variable checking
- **npm run tool:check:env**: Environment validation script

### Security Validation
- **scripts/security-secrets.ts**: Secrets scanning
- **npm run tool:security:secrets**: Security validation script

### Configuration Health
- **scripts/doctor.ts**: System health check including configuration
- **npm run tool:doctor**: Configuration health check

## Configuration Patterns

### Feature Flags
- **NEXT_PUBLIC_DEBUG**: Debug mode toggle
- **NEXT_PUBLIC_SAFE_MODE**: Safe mode features
- **NEXT_PUBLIC_ENABLE_AI_LIVE**: AI features toggle

### Environment Detection
- **NODE_ENV**: Runtime environment
- **CI**: CI/CD environment
- **NEXT_PUBLIC_VERCEL_ENV**: Deployment platform

### Service Integration
- **Supabase**: Database and authentication
- **Resend**: Email services
- **Stripe**: Payment processing
- **Sentry**: Error monitoring
- **n8n**: Workflow automation

## Configuration Management

### Development Workflow
1. Copy `env.example` to `.env.local`
2. Fill in required values
3. Use `npm run tool:check:env` for validation
4. Use `npm run tool:doctor` for health check

### Production Deployment
1. Set environment variables in deployment platform
2. Ensure all required variables are configured
3. Validate configuration with health checks
4. Monitor for configuration-related errors

### Security Best Practices
- Never commit `.env.local` or production environment files
- Use different keys for development and production
- Rotate secrets regularly
- Monitor for exposed secrets in logs
- Use environment-specific configurations
