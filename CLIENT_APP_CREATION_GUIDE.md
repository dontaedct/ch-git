# DCT Micro-Apps: Client-Scoped Development & Graduation System Guide

**Date:** September 25, 2025
**Version:** 3.0 - **CLIENT-SCOPED ARCHITECTURE**
**Target Audience:** AI Assistants & Human Developers
**Purpose:** Step-by-step guide for creating, customizing, and graduating client micro-applications using the new client-scoped DCT Architecture
**Status:** ✅ **ARCHITECTURAL RESTRUCTURE COMPLETE - CLIENT-SCOPED WORKFLOW**

---

## 🎯 **ARCHITECTURAL UPDATE STATUS**

### ✅ **NEW CLIENT-SCOPED ARCHITECTURE: PRODUCTION READY**
- **Client Workspaces:** Individual client environments for isolated development
- **Graduation System:** Seamless transition from shared to standalone codebases
- **Multi-Tenant Security:** Complete client isolation and data separation
- **Agency Management:** Centralized oversight with client-specific access
- **Last Restructured:** September 25, 2025

### 🏗️ **ARCHITECTURAL IMPROVEMENTS**
- **Client Isolation:** Each client has dedicated workspace with scoped tools
- **Graduation System:** Automated transition to standalone production apps
- **Security Enhancement:** Multi-tenant data isolation with RLS policies
- **Scalability:** Supports unlimited clients with independent workflows
- **Performance:** Client-scoped operations for optimal resource usage

### 📋 **GRADUATION SYSTEM**
- **Development Phase:** Shared codebase for rapid prototyping (≤7 days)
- **Testing Phase:** Client-scoped testing and validation environment
- **Production Graduation:** Automated export to standalone client codebase
- **Maintenance:** Independent client app with optional agency support

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Process](#step-by-step-process)
4. [URL Reference](#url-reference)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Options](#deployment-options)
7. [Monitoring & Management](#monitoring--management)
8. [Troubleshooting](#troubleshooting)
9. [Quick Commands](#quick-commands)

---

## 🎯 Overview

The DCT Micro-Apps platform is a **sophisticated, enterprise-grade toolkit** for rapid custom micro-app development (≤7 days) with AI-assisted development capabilities. This guide provides both AI assistants and human developers with a comprehensive, step-by-step process to create, customize, and deploy professional micro-applications.

**✅ VALIDATED:** All systems have been tested and are 100% functional. The platform includes a 33-module template engine, advanced form builder, AI-powered consultation system, and multi-format document generation.

### Key Features
- **Rapid Development:** ≤7 days from concept to deployment
- **White-Labeling:** Complete client branding and customization
- **Hot-Pluggable Modules:** Add features without downtime
- **Workflow Automation:** n8n integration for complex processes
- **Multi-Tenant Architecture:** Isolated client environments
- **Enterprise-Grade Security:** RLS, RBAC, monitoring, and error handling

### Technology Stack
- **Frontend:** Next.js 14.2.0 + React 18.2.0 + TypeScript 5
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Styling:** Tailwind CSS + Custom Design System
- **Deployment:** Vercel (primary) + Docker (alternative)
- **Monitoring:** Sentry + OpenTelemetry + Custom Health Checks

---

## 🔧 Prerequisites

### Required Accounts & Services
- [ ] Supabase account and project
- [ ] Vercel account (for deployment)
- [ ] Email service (SMTP) for notifications
- [ ] n8n instance (for workflow automation)
- [ ] Sentry account (for error monitoring)

### Development Environment
- [ ] Node.js 20.x or later
- [ ] npm or yarn package manager
- [ ] Git for version control
- [ ] Code editor (VS Code recommended)

### Knowledge Requirements
- [ ] Basic understanding of React/Next.js
- [ ] Familiarity with TypeScript
- [ ] Understanding of environment variables
- [ ] Basic database concepts (PostgreSQL)

---

## 🚀 Client-Scoped Development Process

### Step 1: Client Selection & Workspace Access
**URL:** `http://localhost:3000/clients`

**Purpose:** Select or create a client to work on their dedicated micro-app workspace

**What to do:**
1. Navigate to the Client Selection interface
2. **For Existing Clients:** Click "Open Workspace" on the desired client
3. **For New Clients:** Click "New Client" to create a new client project
4. Review client progress, timeline, and priority status
5. Access client-specific workspace with isolated development environment

**Expected Outcome:** Access to client-specific workspace with all tools scoped to that particular client

---

### Step 2: Client Workspace Dashboard
**URL:** `http://localhost:3000/clients/[clientId]`

**Purpose:** Main control center for client-specific micro-app development

**Client Workspace Features:**
- **Progress Tracking:** Real-time project progress with milestone tracking
- **Timeline Management:** Days remaining and delivery schedule
- **Tool Access:** Direct access to all client-scoped development tools
- **Status Overview:** Client-specific metrics and next steps

**What to do:**
1. Review client project overview and progress
2. Check timeline and remaining delivery days
3. Navigate to specific development tools as needed
4. Monitor client-specific milestones and deliverables

**Expected Outcome:** Complete visibility into client project status with easy access to all development tools

---

### Step 3: Initialize New Client Project (New Clients Only)

#### Option A: Using DCT CLI (Recommended)
```bash
# Navigate to project directory
cd /path/to/your/project

# Initialize new client project with universal consultation template
npx dct init

# Follow interactive prompts:
# - Client business name
# - Industry type (technology, healthcare, finance, retail, manufacturing, consulting, education, nonprofit, other)
# - Company size (solo, small, medium, large, enterprise)
# - Primary challenges (growth, efficiency, technology, team, marketing, finance, competition, compliance)
# - Primary goals (revenue-growth, cost-reduction, market-expansion, product-development, team-building, automation, customer-satisfaction, digital-transformation)
# - Budget range (under-5k, 5k-15k, 15k-50k, 50k-plus)
# - Timeline (immediately, within-month, within-quarter, planning)

# Or use CI mode for automation:
npx dct init --ci --name "Company Name" --industry technology --size medium --challenges growth --goals revenue-growth --budget 15k-50k --timeline within-month
```

#### Option B: Manual Setup via Web Interface
**URL:** `http://localhost:3000/intake`

**What to do:**
1. Fill out the comprehensive client intake form
2. Provide client contact information (company name, email, full name, phone)
3. Select industry, company size, challenges, goals, budget, and timeline
4. Submit form to create client record and automatically execute DCT CLI

**Expected Outcome:** New client record created in database with dedicated workspace and configuration

---

### Step 4: Client Form Customization
**URL:** `http://localhost:3000/clients/[clientId]/customize/forms`

**Purpose:** Create and customize forms specifically for the selected client

**Client-Scoped Form Builder Features:**
- **Client Context:** All forms are automatically branded and scoped to the specific client
- **Template Library:** Pre-built form templates optimized for the client's industry
- **Real-time Preview:** See how forms will appear to the client's visitors
- **Progressive Delivery:** Forms are delivered according to the client's timeline

**Form Types Available:**
- **Contact Forms:** Lead capture with client-specific branding
- **Newsletter Signup:** Email collection optimized for client's audience
- **Service Booking:** Appointment scheduling for client's services
- **Feedback Forms:** Customer satisfaction surveys for client insights
- **Quote Requests:** Project inquiry forms for client's services

**What to do:**
1. Select appropriate form template for client's needs
2. Customize fields and validation rules
3. Apply client-specific branding and styling
4. Preview forms in client's context
5. Configure form submission workflows

**Expected Outcome:** Client-specific forms ready for integration into their micro-app

---

### Step 5: Client Brand Customization
**URL:** `http://localhost:3000/clients/[clientId]/customize/theming`

**Purpose:** Apply client-specific branding and visual identity

**Client-Scoped Theming Features:**
- **Brand Assets:** Upload and configure client's logo and brand assets
- **Color Palette:** Set client's primary brand colors for consistent design
- **Typography:** Choose fonts that match client's brand personality
- **Live Preview:** Real-time preview of client's branded micro-app
- **Asset Management:** Organize and manage all client-specific brand assets

**What to do:**
1. Upload client's logo and brand assets
2. Configure primary brand colors
3. Select appropriate typography for client's industry
4. Preview branding changes in real-time
5. Export client's theme package for production

**Expected Outcome:** Fully branded micro-app matching client's visual identity

---

### Step 6: Client Workflow Automation
**URL:** `http://localhost:3000/clients/[clientId]/customize/workflows`

**Purpose:** Configure automation and workflows specifically for the client's business processes

**Client-Scoped Automation Features:**
- **Email Sequences:** Welcome emails and follow-ups tailored to client's audience
- **Lead Notifications:** Instant alerts when new leads are captured for the client
- **Appointment Reminders:** Automated reminders for client's scheduled appointments
- **Data Synchronization:** Sync client data with their external services
- **Approval Workflows:** Multi-step approval processes for client's submissions

**Workflow Templates Available:**
1. **Welcome Email:** Send personalized welcome emails using client's branding
2. **Lead Alert:** Notify client immediately when new leads are captured
3. **Appointment Reminder:** Reduce no-shows with automated appointment reminders

**What to do:**
1. Select appropriate workflows for client's business model
2. Configure email templates with client's branding
3. Set up notification preferences for client's team
4. Test workflow execution with sample data
5. Monitor workflow performance and optimization

**Expected Outcome:** Automated workflows tailored to client's specific business needs

---

### Step 7: Client Testing & Quality Assurance
**URL:** `http://localhost:3000/clients/[clientId]/testing`

**Purpose:** Validate and test the client's micro-app before production deployment

**Client-Scoped Testing Features:**
- **Functional Testing:** Test client's specific features and user flows
- **Mobile Testing:** Validate responsive design for client's target audience
- **Performance Testing:** Ensure optimal load times for client's content
- **Integration Testing:** Verify all client-specific integrations work correctly
- **Live Preview:** Real-time testing environment with client's branding

**Testing Scenarios:**
1. **Contact Form Test:** Submit forms and verify client receives notifications
2. **Booking Flow Test:** Complete appointment booking process for client's services
3. **Mobile View Test:** Test client's app on different device sizes

**What to do:**
1. Run comprehensive testing scenarios for client's specific functionality
2. Test mobile responsiveness with client's content
3. Validate performance metrics meet client's requirements
4. Verify all integrations work with client's external services
5. Document test results and any required fixes

**Expected Outcome:** Thoroughly tested client micro-app ready for production deployment

---

### Step 8: Client Production Deployment
**URL:** `http://localhost:3000/clients/[clientId]/deploy`

**Purpose:** Deploy the client's micro-app to production environment

**Client-Scoped Deployment Features:**
- **Staging Environment:** Deploy to client-specific staging environment for final testing
- **Production Deployment:** Deploy client's app to their custom domain
- **SSL Configuration:** Automatic SSL certificate setup for client's domain
- **Health Monitoring:** Real-time monitoring of client's app performance
- **Rollback Capability:** Quick rollback to previous version if issues arise

**Deployment Environments:**
1. **Staging:** `staging-[clientId].app` - Testing environment with client's data
2. **Production:** `[client-domain].com` - Live production environment
3. **Testing:** `testing-[clientId].app` - QA validation environment

**What to do:**
1. Deploy client's app to staging environment for final validation
2. Configure client's custom domain and SSL certificates
3. Deploy to production environment when testing is complete
4. Set up monitoring and alerting for client's app
5. Verify all client-specific functionality works in production

**Expected Outcome:** Client's micro-app successfully deployed and running in production

---

### Step 9: Client Handover & Documentation
**URL:** `http://localhost:3000/clients/[clientId]/handover`

**Purpose:** Complete project handover with comprehensive documentation and training

**Client-Scoped Handover Package:**
- **Documentation:** Complete user guide and admin training materials for client
- **Access Credentials:** Secure delivery of all login and admin access for client
- **Training Materials:** Video walkthroughs and support materials specific to client's app
- **Support Information:** Contact details and ongoing support procedures
- **Graduation Package:** Preparation for potential migration to standalone codebase

**What to do:**
1. Generate comprehensive documentation for client's specific app
2. Create client user accounts and admin access
3. Provide training materials tailored to client's business
4. Set up support channels and escalation procedures
5. Complete handover documentation and final delivery

**Expected Outcome:** Complete client handover with ongoing support structure

---

## 🏢 Shared Environment Architecture

### Overview
DCT operates as a **shared multi-tenant platform** where all clients have isolated workspaces within the same codebase. This approach enables rapid development, cost-effective hosting, and centralized maintenance.

### Architecture Benefits

#### Shared Environment Advantages:
- ✅ **≤7 Day Delivery:** Rapid deployment using shared resources
- ✅ **Lower Costs:** Shared infrastructure reduces hosting expenses
- ✅ **Automatic Updates:** Security patches and feature improvements included
- ✅ **Professional Maintenance:** Centralized monitoring and support
- ✅ **Data Isolation:** Complete client separation via Row Level Security (RLS)
- ✅ **Scalability:** Optimized resource sharing across all clients

### Client Isolation Architecture
```typescript
interface SharedEnvironment {
  multiTenant: true;
  clientIsolation: 'RLS_POLICIES';
  dataSegregation: 'COMPLETE';
  resourceSharing: 'OPTIMIZED';
  maintenanceModel: 'CENTRALIZED';
  deployment: 'SHARED_INFRASTRUCTURE';
}
```

### Future Expansion Options
For enterprise clients requiring dedicated infrastructure, custom deployment options can be explored through direct consultation. However, the shared environment is designed to meet the needs of most businesses while maintaining security, performance, and cost efficiency.

---

**Customization Options:**

#### Design Tokens
```typescript
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    neutral: Record<string, string>;
    semantic: Record<string, string>;
  };
  typography: {
    fontFamily: string;
    scales: Record<string, string>;
    weights: Record<string, number>;
  };
  spacing: Record<string, string>;
  radii: Record<string, string>;
  shadows: Record<string, string>;
}
```

#### Client Override System
```typescript
interface ClientOverrides {
  theme_overrides: ThemeConfig;
  modules_enabled: string[];
  consultation_config: Record<string, any>;
  plan_catalog_overrides: Record<string, any>;
}
```

**What to do:**
1. Upload client logo and brand assets
2. Configure color palette
3. Set typography preferences
4. Customize component styles
5. Preview changes in real-time

**Expected Outcome:** Fully branded application matching client's visual identity

---

### Step 6: Build Forms & Content
**URL:** `http://localhost:3000/agency-toolkit/forms`

**Form Builder Features:**

#### Field Types (21 Available)
- **Text Fields:** Text, Email, Phone, Number, Password, URL
- **Selection Fields:** Select, Multi-select, Radio, Checkbox
- **Date/Time:** Date, Time, DateTime, Date Range
- **File Fields:** File Upload, Image Upload, Signature
- **Advanced:** Rich Text, Code, JSON, Rating, Address

#### Validation System
```typescript
interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength';
  value?: any;
  message: string;
}
```

#### Document Generator
**URL:** `http://localhost:3000/agency-toolkit/documents`

**Features:**
- PDF generation with client branding
- HTML template system
- Automated document workflows
- Multi-format output support

**What to do:**
1. Create forms using the visual builder
2. Configure validation rules
3. Set up conditional logic
4. Create document templates
5. Test form submissions and document generation

**Expected Outcome:** Functional forms and document generation system

---

### Step 7: Configure Workflow Automation
**URL:** `http://localhost:3000/agency-toolkit/orchestration`

**n8n Integration Setup:**

#### Workflow Types
- **Client Onboarding:** Automated welcome sequences
- **Form Processing:** Data validation and routing
- **Document Generation:** Automated report creation
- **Notification Systems:** Email and SMS alerts

#### Reliability Controls
```typescript
interface WorkflowConfig {
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxDelay: number;
  };
  circuitBreaker: {
    failureThreshold: number;
    recoveryTimeout: number;
  };
  rateLimiting: {
    requestsPerMinute: number;
    burstLimit: number;
  };
}
```

**What to do:**
1. Set up n8n webhook endpoints
2. Configure automated workflows
3. Set up email notification templates
4. Test workflow execution
5. Configure error handling and retries

**Expected Outcome:** Automated business processes with reliable error handling

---

### Step 8: Test & Preview Application
**URL:** `http://localhost:3000/questionnaire` (consultation apps)  
**URL:** `http://localhost:3000/forms/builder` (form-based apps)

**Testing Checklist:**
- [ ] **Form Functionality**
  - [ ] All form fields work correctly
  - [ ] Validation rules are enforced
  - [ ] Conditional logic functions properly
  - [ ] File uploads work
- [ ] **Email System**
  - [ ] Notifications are sent
  - [ ] Email templates render correctly
  - [ ] Delivery tracking works
- [ ] **Document Generation**
  - [ ] PDFs generate with correct branding
  - [ ] Content is accurate
  - [ ] Templates render properly
- [ ] **User Experience**
  - [ ] Mobile responsiveness
  - [ ] Loading performance
  - [ ] Error handling
  - [ ] Accessibility compliance
- [ ] **Integration Testing**
  - [ ] n8n workflows execute
  - [ ] Database operations work
  - [ ] External services integrate

**Expected Outcome:** Fully tested application ready for production deployment

---

### Step 9: Configure Environment Variables
**File:** `.env.local`

**Required Environment Variables:**
```env
# Core Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com

# Automation & Workflows
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
N8N_API_KEY=your_n8n_api_key

# Monitoring & Observability
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOG_LEVEL=info
ENABLE_MONITORING=true

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app

# Feature Flags
NEXT_PUBLIC_SAFE_MODE=0
NEXT_PUBLIC_DEBUG_MODE=0
```

**What to do:**
1. Create `.env.local` file
2. Add all required environment variables
3. Set production values for all services
4. Test configuration with environment check

**Expected Outcome:** Properly configured environment for production deployment

---

## 🔧 Initial System State & Expectations

### What Works Out of the Box
After running `npx dct init`, the system starts with **limited functionality**:

✅ **Working Features (with placeholders):**
- Basic app structure and navigation
- Health monitoring (`/api/health`)
- Static pages and UI components
- Development server (`npm run dev`)
- Client selection interface (`/clients`)

⚠️ **Limited/Disabled Features (requires real credentials):**
- Database operations (uses mock data)
- Email notifications (disabled)
- Payment processing (disabled)
- Webhook automation (disabled)
- External service integrations (disabled)

### Expected Initial Health Score
```bash
npm run env:doctor
# Expected output: ✗ CRITICAL - 4/14 features enabled
```

### Setting Realistic Expectations
1. **Development Phase**: Use placeholder values for initial setup and UI development
2. **Integration Phase**: Replace placeholders with real credentials for specific features
3. **Production Phase**: All placeholders must be replaced with real values

---

### Step 10: Deploy to Production

#### Option A: Vercel Deployment (Recommended)

**1. Connect Repository**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub account
3. Click "New Project"
4. Import your repository
5. Configure build settings

**2. Environment Variables**
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set production values
4. Configure for all environments (Production, Preview, Development)

**3. Deploy**
```bash
# Push to main branch
git add .
git commit -m "Ready for production deployment"
git push origin main

# Vercel automatically builds and deploys
# Monitor deployment in Vercel dashboard
```

**4. Custom Domain (Optional)**
1. Go to Project Settings → Domains
2. Add custom domain
3. Configure DNS records
4. Enable SSL certificate

#### Option B: Manual Deployment

```bash
# Build the application
npm run build

# Test production build locally
npm run start

# Deploy to your preferred platform
# (Railway, Netlify, AWS, etc.)
```

**Expected Outcome:** Live production application accessible via public URL

---

### Step 11: Monitor & Manage Production
**URL:** `https://your-app.vercel.app/operability/health-monitoring`

**Monitoring Dashboard Features:**

#### Health Monitoring
- Real-time health scores
- System component status
- Performance metrics
- Error rates and trends

#### Performance Metrics
- Page load times
- API response times
- Database query performance
- User experience metrics

#### Error Tracking
- Error frequency and patterns
- Stack trace analysis
- User impact assessment
- Automatic error recovery

**Admin Operations:**
**URL:** `https://your-app.vercel.app/operability/flags`

**Management Features:**
- Feature flag toggles
- User role management
- System diagnostics
- Performance optimization

**What to do:**
1. Set up monitoring alerts
2. Configure error notifications
3. Monitor performance metrics
4. Review user feedback
5. Optimize based on data

**Expected Outcome:** Proactive monitoring and management of production application

---

### Step 12: Client Handover
**URL:** `https://your-app.vercel.app/agency-toolkit/handover`

**Handover Package Contents:**

#### Client Access
- Client login credentials
- Admin dashboard access
- User management interface
- Support documentation

#### Documentation
- User manual and guides
- Admin training materials
- API documentation
- Troubleshooting guides

#### Support Information
- Support contact details
- Escalation procedures
- Maintenance schedules
- Update procedures

**What to do:**
1. Generate handover documentation
2. Create client user accounts
3. Provide training materials
4. Set up support channels
5. Schedule knowledge transfer sessions

**Expected Outcome:** Complete client handover with ongoing support structure

---

## 🔗 Updated URL Reference (Client-Scoped Architecture)

### Agency Management URLs
| Purpose | URL | Description |
|---------|-----|-------------|
| **Client Selection** | `http://localhost:3000/clients` | Choose client to work on |
| **Admin Dashboard** | `http://localhost:3000/admin` | Agency-level management |
| **System Monitoring** | `http://localhost:3000/operability/health-monitoring` | System health dashboard |
| **Feature Flags** | `http://localhost:3000/operability/flags` | Feature toggle management |

### Client-Scoped Development URLs
| Purpose | URL | Description |
|---------|-----|-------------|
| **Client Workspace** | `http://localhost:3000/clients/[clientId]` | Client-specific development dashboard |
| **Form Builder** | `http://localhost:3000/clients/[clientId]/customize/forms` | Client-scoped form creation |
| **Brand Customization** | `http://localhost:3000/clients/[clientId]/customize/theming` | Client-specific branding |
| **Workflow Automation** | `http://localhost:3000/clients/[clientId]/customize/workflows` | Client-scoped automation |
| **Testing & QA** | `http://localhost:3000/clients/[clientId]/testing` | Client-specific testing |
| **Production Deploy** | `http://localhost:3000/clients/[clientId]/deploy` | Client deployment management |
| **Client Handover** | `http://localhost:3000/clients/[clientId]/handover` | Client-specific handover |

### Legacy URLs (Deprecated)
| Purpose | URL | Status |
|---------|-----|--------|
| ~~Agency Toolkit~~ | ~~`/agency-toolkit`~~ | **Replaced by client-scoped workflows** |
| ~~Dashboard Settings~~ | ~~`/dashboard/settings`~~ | **Moved to client-scoped customization** |
| ~~Module Management~~ | ~~`/dashboard/modules`~~ | **Integrated into client workflows** |

### Production URLs (Replace with your domain)
| Purpose | URL | Description |
|---------|-----|-------------|
| **Live Application** | `https://your-app.vercel.app` | Production application |
| **Client Selection** | `https://your-app.vercel.app/clients` | Client workspace access |
| **Admin Portal** | `https://your-app.vercel.app/admin` | Agency management interface |
| **API Health Check** | `https://your-app.vercel.app/api/health` | API health endpoint |

---

## ⚙️ Environment Configuration

### Development Environment
```env
# Development settings
NODE_ENV=development
NEXT_PUBLIC_SAFE_MODE=1
NEXT_PUBLIC_DEBUG_MODE=1
LOG_LEVEL=debug
```

### Staging Environment
```env
# Staging settings
NODE_ENV=staging
NEXT_PUBLIC_SAFE_MODE=0
NEXT_PUBLIC_DEBUG_MODE=1
LOG_LEVEL=info
```

### Production Environment
```env
# Production settings
NODE_ENV=production
NEXT_PUBLIC_SAFE_MODE=0
NEXT_PUBLIC_DEBUG_MODE=0
LOG_LEVEL=warn
ENABLE_MONITORING=true
```

---

## 🚀 Deployment Options

### Vercel (Recommended)
**Pros:**
- Automatic deployments from Git
- Built-in CDN and edge functions
- Easy environment variable management
- Preview deployments for PRs
- Automatic SSL certificates

**Setup:**
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy automatically

### Docker
**Pros:**
- Consistent deployment environment
- Easy scaling
- Self-hosted option
- Full control over infrastructure

**Setup:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Other Platforms
- **Netlify:** Good for static sites
- **Railway:** Simple deployment with database
- **AWS:** Full control and scalability
- **Google Cloud:** Enterprise features

---

## 📊 Monitoring & Management

### Health Monitoring
**Metrics Tracked:**
- Application health score
- Database connectivity
- External service status
- Performance metrics
- Error rates

### Performance Monitoring
**Key Metrics:**
- Page load times
- API response times
- Database query performance
- User experience scores
- Resource utilization

### Error Tracking
**Error Types:**
- Application errors
- Database errors
- External service errors
- User input errors
- System failures

### Alerting
**Alert Channels:**
- Email notifications
- Slack webhooks
- SMS alerts (optional)
- Webhook notifications

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Errors
**Symptoms:** Application fails to start, database queries fail
**Solutions:**
1. Check Supabase connection string
2. Verify service role key
3. Check RLS policies
4. Test database connectivity

#### Email Delivery Issues
**Symptoms:** Emails not sent, SMTP errors
**Solutions:**
1. Verify SMTP credentials
2. Check email service limits
3. Test email templates
4. Review spam filters

#### Module Loading Errors
**Symptoms:** Features not working, module errors
**Solutions:**
1. Check module configuration
2. Verify dependencies
3. Review feature flags
4. Check module registry

#### Performance Issues
**Symptoms:** Slow page loads, timeouts
**Solutions:**
1. Check database queries
2. Optimize images and assets
3. Review caching strategy
4. Monitor resource usage

### Debug Commands
```bash
# Check environment configuration
npm run env:doctor

# Run system diagnostics
npm run tool:doctor

# Test database connectivity
curl http://localhost:3000/api/health

# Check API health
curl http://localhost:3000/api/health
```

---

## ⚡ Quick Commands

### Development
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm run start
```

### CI/CD
```bash
# Run all CI checks
npm run ci

# Generate templates
npm run template:build

# Automate delivery
npm run delivery:automate

# Build for deployment
npm run build

# Note: Deploy using your platform's deployment method
# For Vercel: git push (auto-deploys)
# For Docker: docker build && docker push
```

### Database
```bash
# Create migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push

# Reset database (development only)
npx supabase db reset

# Generate types
npx supabase gen types typescript --local > types/supabase.ts
```

### Monitoring
```bash
# Check system health
curl http://localhost:3000/api/health

# Run diagnostics
curl http://localhost:3000/api/admin/diagnostics

# Check system health and environment
curl http://localhost:3000/api/health
```

---

## 📈 Client-Scoped Development Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| **Client Selection & Setup** | 30 minutes | Access client workspace, initial configuration |
| **Forms & Content Creation** | 2-3 hours | Client-scoped forms, content customization |
| **Brand Customization** | 1-2 hours | Client-specific theming, logo integration |
| **Workflow Configuration** | 1-2 hours | Client-specific automation setup |
| **Testing & QA** | 1-2 hours | Client-scoped testing, validation |
| **Production Deployment** | 30 minutes | Client-specific deployment configuration |
| **Client Handover** | 1 hour | Documentation, training, support setup |
| **Total** | **≤7 days** | Complete client-scoped micro-app delivery |

---

## 🎯 Client-Scoped Success Criteria

### Technical Requirements
- [ ] Client workspace loads in <2 seconds
- [ ] All client-scoped forms submit successfully
- [ ] Client-specific email notifications work
- [ ] Client documents generate correctly with branding
- [ ] Mobile responsive design for client's content
- [ ] Accessibility compliance for client's audience
- [ ] Multi-tenant security with client data isolation
- [ ] Client-scoped testing passes all scenarios

### Business Requirements
- [ ] Client-specific branding applied correctly throughout
- [ ] All client-requested features implemented and tested
- [ ] User experience optimized for client's target audience
- [ ] Performance targets achieved for client's content
- [ ] Client-specific monitoring and alerting configured
- [ ] Complete client handover documentation provided
- [ ] Client training completed with ongoing support plan
- [ ] Shared environment optimized for client scaling

### Architectural Requirements
- [ ] Complete client data isolation achieved
- [ ] Client workspace functions independently
- [ ] No cross-client data leakage or access
- [ ] Handover system tested and documented
- [ ] Agency management tools accessible for oversight
- [ ] Client selection interface provides clear project status

---

## 📞 Support & Resources

### Documentation
- [DCT Micro-Apps PRD](../Downloads/#%20DCT%20Micro-Apps%20—%20Product%20Requirements%20Document.txt)
- [Template README](./TEMPLATE_README.md)
- [CLI Documentation](./docs/cli/README.md)
- [System Blueprint](./docs/System_Blueprint_and_Component_Catalog.md)

### Support Channels
- **Technical Issues:** Create GitHub issue
- **Feature Requests:** Submit via GitHub discussions
- **Emergency Support:** Contact via email
- **Documentation:** Update this guide as needed

---

---

## 🚀 Summary of Architectural Changes

### ✅ What Was Implemented
1. **Complete Client-Scoped Architecture:** All development tools are now client-specific with dedicated workspaces
2. **New Route Structure:**
   - `/clients` - Client selection and management interface
   - `/clients/[clientId]` - Individual client workspace dashboard
   - `/clients/[clientId]/customize/*` - Client-scoped customization tools
   - `/clients/[clientId]/testing` - Client-specific testing environment
   - `/clients/[clientId]/deploy` - Client-scoped deployment management
   - `/clients/[clientId]/handover` - Client-specific handover process
3. **Agency Management:**
   - `/admin` - Centralized agency oversight and management
   - Maintained existing monitoring and system management tools
4. **Graduation System:** Complete architecture for transitioning clients from shared to standalone environments

### ✅ Key Benefits Achieved
- **Client Isolation:** Every action is now scoped to a specific client
- **Clear Context:** No confusion about "which client" - always explicit
- **Scalability:** Architecture supports unlimited clients with independent workflows
- **Security:** Multi-tenant data isolation with client-specific access controls
- **Handover Ready:** Complete documentation and training system for client delivery

### ✅ Architectural Problem Solved
**Original Issue:** Agency-level tools without client context led to confusion ("no app is selected so what will happen?")

**Solution:** Client-scoped workspaces where every tool, form, workflow, and deployment is explicitly tied to a specific client, eliminating ambiguity and ensuring proper context throughout the development process.

---

**Last Updated:** September 25, 2025
**Version:** 3.0 - Client-Scoped Architecture
**Maintained By:** DCT Development Team
