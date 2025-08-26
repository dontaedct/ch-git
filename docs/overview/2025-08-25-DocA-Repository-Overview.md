# Repository Overview & Structure
**Date: 2025-08-25**

## Purpose & High-Level Summary

This is a **Universal Micro-App Template Platform** - a robust, industry-agnostic foundation for building multi-tenant micro-applications. The platform provides a complete foundation including authentication, user management, file handling, payment processing, and workflow automation, all built with industry best practices and security standards.

The template is designed to be cloned and customized for any client project, providing a complete foundation that can be extended with domain-specific features for any industry or business domain.

## Quick Repository Structure (Top 2-3 Levels)

```
my-app/
├── app/                    # Next.js 15 app directory (App Router)
├── components/             # Reusable UI components
├── lib/                    # Core utilities and business logic
├── scripts/                # Development and automation scripts
├── docs/                   # Project documentation
├── n8n/                    # Workflow automation exports
├── supabase/               # Database schema and migrations
├── tests/                  # Test suites and configurations
├── bin/                    # CLI tools and development utilities
├── config/                 # Configuration files
├── hooks/                  # React hooks
├── types/                  # TypeScript type definitions
├── middleware.ts           # Next.js middleware
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── env.example            # Environment variables template
```

## Key Directories Explained

### `app/` - Next.js App Router
- **Purpose**: Contains all application routes, pages, and API endpoints using Next.js 15 App Router
- **Structure**: Organized by feature with dynamic routing support
- **Key Files**: `layout.tsx` (root layout), `page.tsx` (home page), `global-error.tsx` (error boundary)

### `components/` - Reusable UI Components
- **Purpose**: Houses all React components organized by domain and reusability
- **Structure**: Includes UI primitives, feature components, and layout components
- **Key Subdirs**: `ui/` (design system), domain-specific component folders

### `lib/` - Core Utilities & Business Logic
- **Purpose**: Contains core business logic, utilities, and service integrations
- **Structure**: Organized by domain (auth, database, email, etc.)
- **Key Files**: Database clients, authentication helpers, utility functions

### `scripts/` - Development & Automation
- **Purpose**: Houses all development tools, build scripts, and automation utilities
- **Structure**: Organized by function (dev-support, system-admin, project-management)
- **Key Features**: Code quality checks, deployment helpers, health monitoring

### `n8n/` - Workflow Automation
- **Purpose**: Contains n8n workflow exports and documentation for business process automation
- **Structure**: JSON workflow files with comprehensive README documentation
- **Key Workflows**: Error handling, notification systems, payment processing

### `supabase/` - Database & Backend
- **Purpose**: Database schema, migrations, and backend configuration
- **Structure**: SQL files for table creation, RLS policies, and data seeding
- **Key Features**: Multi-tenant architecture with Row Level Security

## Routes Overview

### App Router Structure (`app/`)
- **`/`** - Home page with project overview and navigation
- **`/login`** - Authentication page (placeholder)
- **`/guardian-demo`** - Guardian backup system demonstration
- **`/auto-save-demo`** - Auto-save functionality demonstration
- **`/design-system`** - UI component library showcase
- **`/status`** - System health and status information
- **`/probe`** - System probing and diagnostics
- **`/rollouts`** - Feature rollout management
- **`/safe-releases`** - Safe release management system
- **`/operability`** - System operability dashboard
- **`/test-*`** - Various testing and debugging routes

### API Routes (`app/api/`)
- **`/health`** - Health check endpoints
- **`/webhooks`** - Webhook handlers for external services
- **`/guardian`** - Guardian backup system API
- **`/rollouts`** - Feature rollout management API
- **`/operability`** - System operability API
- **`/automations`** - Workflow automation API
- **`/admin`** - Administrative functions
- **`/v1`** - Version 1 API endpoints

## Notable Domain Modules/Features

### 1. **Multi-Tenant Architecture**
- **Purpose**: Complete data isolation between tenants with Row Level Security (RLS)
- **Location**: `supabase/` (database schema), `lib/supabase/` (client utilities)
- **Entry Points**: Database policies, authentication middleware, tenant context providers
- **Key Features**: Automatic tenant isolation, shared infrastructure, scalable architecture

### 2. **OSS Hero Security Framework**
- **Purpose**: Comprehensive security system with Guardian backup, policy enforcement, and automated safety checks
- **Location**: `scripts/oss-hero-*.mjs`, `app/guardian-demo/`, `app/api/guardian/`
- **Entry Points**: Guardian dashboard, automated health checks, policy enforcement scripts
- **Key Features**: Continuous monitoring, automatic backups, security vulnerability detection, emergency recovery

### 3. **Workflow Automation (n8n)**
- **Purpose**: Business process automation with comprehensive error handling and monitoring
- **Location**: `n8n/` directory with JSON exports and documentation
- **Entry Points**: Webhook endpoints, cron triggers, external service integrations
- **Key Features**: Global error handling, notification gap-filling, payment processing, CRM integration

### 4. **Auto-Save & JIT Systems**
- **Purpose**: Automatic data persistence and just-in-time processing for user experience
- **Location**: `app/auto-save-demo/`, `scripts/` (auto-save related)
- **Entry Points**: Auto-save hooks, JIT processing scripts, user interaction handlers
- **Key Features**: Real-time saving, conflict resolution, offline support

### 5. **Feature Rollout Management**
- **Purpose**: Safe, controlled feature deployment with canary releases and rollback capabilities
- **Location**: `app/rollouts/`, `app/safe-releases/`, `scripts/oss-hero-rollouts.mjs`
- **Entry Points**: Rollout dashboard, deployment gates, feature flag management
- **Key Features**: Blue-green deployments, canary releases, automatic rollback, health monitoring

## Important Third-Party Services

### **Supabase (Database & Auth)**
- **Configuration**: `lib/supabase/` (client setup), `supabase/` (schema)
- **Usage**: Primary database, authentication, real-time subscriptions, storage
- **Key Files**: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `supabase/migrations/`

### **Stripe (Payments)**
- **Configuration**: Environment variables, webhook handlers
- **Usage**: Payment processing, subscription management, webhook handling
- **Key Files**: `n8n/stripe-receipt-crm-mirror.json`, webhook endpoints

### **Resend (Email)**
- **Configuration**: Environment variables, email templates
- **Usage**: Transactional emails, notifications, receipts
- **Key Files**: `lib/email.ts`, email-related API endpoints

### **n8n (Workflow Automation)**
- **Configuration**: `n8n/` directory with workflow exports
- **Usage**: Business process automation, error handling, external integrations
- **Key Files**: `n8n/global-error-workflow.json`, `n8n/notify-10-gap-fill.json`

### **Vercel (Hosting)**
- **Configuration**: `vercel.json`, deployment scripts
- **Usage**: Production hosting, preview deployments, CI/CD
- **Key Files**: `vercel.json`, deployment-related scripts

### **Sentry (Error Monitoring)**
- **Configuration**: `sentry.client.config.ts`, `sentry.server.config.ts`
- **Usage**: Error tracking, performance monitoring, crash reporting
- **Key Files**: Sentry configuration files, error boundary components

## Architecture Principles

- **Multi-tenant by design**: Complete data isolation between tenants
- **Security first**: RLS, authentication, authorization, Guardian backup system
- **Scalable**: Built for growth and performance with modular architecture
- **Maintainable**: Clean code, comprehensive testing, automated quality checks
- **Extensible**: Modular design for easy customization and feature addition
- **OSS Hero compliant**: Follows strict security and safety protocols
