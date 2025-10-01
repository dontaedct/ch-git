# DCT Micro-Apps Platform - MVP Requirements & Implementation Guide

**Version:** 1.0
**Date:** October 1, 2025
**Status:** Production-Ready MVP Specification

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [MVP Scope Definition](#mvp-scope-definition)
3. [Client/App Creation Process](#clientapp-creation-process)
4. [Technical Requirements](#technical-requirements)
5. [Database Schema](#database-schema)
6. [Implementation Checklist](#implementation-checklist)
7. [Success Criteria](#success-criteria)

---

## Executive Summary

### What is the MVP?

A **production-ready platform** that enables agencies to create, customize, and deploy branded micro-apps for clients in ≤7 days using pre-built templates.

### Core Value Proposition

- **Create** clients/apps with simple intake form
- **Select** from industry-specific templates (fitness, home services, real estate, funeral home)
- **Customize** branding (colors, fonts, logo) and content (text, images)
- **Preview** changes in real-time
- **Deploy** to production or export as standalone codebase

### MVP Completion Status: **35%**

**What Works:** ✅ Client management, Database schema, UI framework
**What's Missing:** ❌ Template system, Customization UI, Export functionality

**Estimated Effort to Complete MVP:** 7 focused days

---

## MVP Scope Definition

### In Scope (MVP Must-Haves)

#### 1. Client/App Management ✅ COMPLETE
- Create new clients through intake form
- List all clients in dashboard
- View individual client details
- Edit client information
- Delete clients
- **Status:** Fully functional with real Supabase integration

#### 2. Template System ❌ NOT IMPLEMENTED
- **Storage:** Store 4 base templates (fitness coach, home services, real estate, funeral home)
- **Selection:** Browse and select template for client
- **Application:** Apply template to client as starting point
- **Preview:** View template before applying

**Required Work:**
- Create `template_storage` database table
- Build 4 base templates in JSON format
- Create template selection UI
- Build template application API

#### 3. Brand Customization ❌ NOT IMPLEMENTED
- **Colors:** Change primary and secondary brand colors
- **Logo:** Upload and apply client logo
- **Typography:** Select font family
- **Preview:** See changes in real-time

**Required Work:**
- Build brand customization UI (`/clients/[clientId]/customize/theming`)
- Create color picker component
- Implement logo upload (Supabase Storage)
- Build branding API endpoints

#### 4. Content Customization ❌ NOT IMPLEMENTED
- **Text Editing:** Edit headings, paragraphs, button labels
- **Image Replacement:** Replace template images with client images
- **Page Customization:** Edit content on all template pages
- **Save/Load:** Persist all changes to database

**Required Work:**
- Build content editor UI (`/clients/[clientId]/customize/content`)
- Create WYSIWYG text editor component
- Implement image upload/replacement
- Build content API endpoints

#### 5. Preview System ❌ NOT IMPLEMENTED
- **Real-time Preview:** See all customizations applied live
- **Responsive Preview:** Test desktop/tablet/mobile views
- **Accurate Rendering:** Preview matches final deployment

**Required Work:**
- Build preview page (`/clients/[clientId]/preview`)
- Create template rendering engine
- Apply branding and content customizations dynamically

#### 6. Graduation/Export System ⚠️ PARTIAL
- **Manual Export (MVP):** Download client app files as ZIP
- **Deployment Guide:** Step-by-step instructions for client
- **Configuration Files:** Generate deployment config

**Required Work:**
- Build basic export functionality
- Generate deployment package
- Create deployment instructions
- *Note: Automated deployment is post-MVP*

### Out of Scope (Post-MVP)

**Defer to Future Releases:**
- ❌ Automated deployment to Vercel/Netlify
- ❌ Advanced form builder client-scoping
- ❌ Workflow automation (n8n integration)
- ❌ AI-powered features
- ❌ Advanced analytics dashboards
- ❌ Multi-language support
- ❌ Complex permission systems
- ❌ Advanced monitoring/observability
- ❌ Hero tasks system
- ❌ Module marketplace

**Code to Remove:** ~40% of current codebase is non-essential for MVP

---

## Client/App Creation Process

### Complete End-to-End Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: CREATE CLIENT                     │
│  Location: /clients → "New Client" or /intake               │
│                                                               │
│  Actions:                                                     │
│  • Fill out client intake form                               │
│    - Business name                                           │
│    - Contact information (email, phone)                      │
│    - Industry type (technology, healthcare, etc.)            │
│    - Company size                                            │
│    - Primary goals                                           │
│    - Budget range                                            │
│    - Timeline                                                │
│  • Submit form                                               │
│                                                               │
│  Result: Client record created in tenant_apps table          │
│          Client ID generated: e.g., client-abc123            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: ACCESS CLIENT WORKSPACE                 │
│  Location: /clients/[clientId]                               │
│                                                               │
│  View:                                                        │
│  • Client overview dashboard                                 │
│  • Project progress indicators                               │
│  • Quick action buttons:                                     │
│    [Select Template] [Customize Brand] [Edit Content]        │
│    [Preview App] [Deploy App]                                │
│                                                               │
│  Result: Client workspace loaded with navigation             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  STEP 3: SELECT TEMPLATE                     │
│  Location: /clients/[clientId]/templates                     │
│                                                               │
│  Actions:                                                     │
│  • Browse available templates:                               │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│    │ Fitness Coach│  │ Home Services│  │ Real Estate  │    │
│    │              │  │              │  │              │    │
│    │   [Preview]  │  │   [Preview]  │  │   [Preview]  │    │
│    │   [Select]   │  │   [Select]   │  │   [Select]   │    │
│    └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                               │
│    ┌──────────────┐                                          │
│    │ Funeral Home │                                          │
│    │              │                                          │
│    │   [Preview]  │                                          │
│    │   [Select]   │                                          │
│    └──────────────┘                                          │
│                                                               │
│  • Click "Preview" to see template details                   │
│  • Click "Select" to apply template to client                │
│                                                               │
│  Result: Template copied to client_templates table           │
│          Client now has base template with default content   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               STEP 4: CUSTOMIZE BRANDING                     │
│  Location: /clients/[clientId]/customize/theming             │
│                                                               │
│  Actions:                                                     │
│  • Upload client logo                                        │
│    - PNG, SVG, or JPG (max 2MB)                              │
│    - Transparent background recommended                      │
│                                                               │
│  • Select brand colors:                                      │
│    Primary Color:   [#3B82F6] 🎨 (Color Picker)             │
│    Secondary Color: [#10B981] 🎨 (Color Picker)             │
│    Accent Color:    [#F59E0B] 🎨 (Color Picker)             │
│                                                               │
│  • Choose typography:                                        │
│    Font Family: [Inter ▼]                                   │
│    - Options: Inter, Roboto, Open Sans, Lato, Poppins       │
│                                                               │
│  • Real-time preview on right side of screen                 │
│                                                               │
│  • Click "Save Changes"                                      │
│                                                               │
│  Result: Branding saved to client_templates.custom_branding  │
│          All pages will use new colors and fonts             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               STEP 5: CUSTOMIZE CONTENT                      │
│  Location: /clients/[clientId]/customize/content             │
│                                                               │
│  Actions:                                                     │
│  • Select page to edit:                                      │
│    [Home] [About] [Services] [Contact]                       │
│                                                               │
│  • Edit text content:                                        │
│    ┌─────────────────────────────────────────────┐          │
│    │ Heading: [Transform Your Health Today ____] │          │
│    │                                             │          │
│    │ Description:                                │          │
│    │ [Our certified trainers provide ________]  │          │
│    │ [________________________________]          │          │
│    └─────────────────────────────────────────────┘          │
│                                                               │
│  • Replace images:                                           │
│    Current Image: [trainer-stock.jpg] 🖼️                    │
│    [Upload New Image] or [Choose from Library]               │
│                                                               │
│  • Edit service listings, team bios, testimonials, etc.      │
│                                                               │
│  • Click "Save Changes"                                      │
│                                                               │
│  Result: Content saved to client_templates.custom_content    │
│          Template now reflects client's business             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    STEP 6: PREVIEW APP                       │
│  Location: /clients/[clientId]/preview                       │
│                                                               │
│  View:                                                        │
│  • Full app preview with all customizations applied          │
│  • Device toggles:                                           │
│    [💻 Desktop] [📱 Tablet] [📱 Mobile]                      │
│  • Navigation works as it will in production                 │
│  • Test all pages and functionality                          │
│                                                               │
│  Actions:                                                     │
│  • Click through all pages                                   │
│  • Verify branding is correct                                │
│  • Check content accuracy                                    │
│  • Test forms and interactive elements                       │
│  • If changes needed, go back to customize                   │
│                                                               │
│  Result: Confidence that app is ready for deployment         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 7: DEPLOY OR EXPORT APP                    │
│  Location: /clients/[clientId]/deploy                        │
│                                                               │
│  Option A: Export as Standalone (MVP)                        │
│  ────────────────────────────────────────                    │
│  • Click "Generate Export Package"                           │
│  • System creates ZIP file containing:                       │
│    - All app files with customizations applied               │
│    - Configuration files (next.config.js, etc.)              │
│    - Environment template (.env.example)                     │
│    - Deployment instructions (README.md)                     │
│                                                               │
│  • Download ZIP file                                         │
│  • Follow deployment guide to deploy to:                     │
│    - Vercel (recommended)                                    │
│    - Netlify                                                 │
│    - Client's own hosting                                    │
│                                                               │
│  Option B: Keep in Shared Environment (Default)              │
│  ────────────────────────────────────────────                │
│  • App stays in multi-tenant platform                        │
│  • Access via subdomain: clientname.youragency.app           │
│  • Managed by agency, client has dashboard access            │
│  • Can graduate later if needed                              │
│                                                               │
│  Result: Client app is live and accessible                   │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    STEP 8: HANDOVER                          │
│  Location: /clients/[clientId]/handover                      │
│                                                               │
│  Deliverables:                                               │
│  • Client dashboard access credentials                       │
│  • User documentation PDF                                    │
│  • Admin training video links                                │
│  • Support contact information                               │
│  • Maintenance schedule                                      │
│                                                               │
│  Actions:                                                     │
│  • Generate handover package                                 │
│  • Email credentials to client                               │
│  • Schedule training session                                 │
│  • Mark project as "Delivered"                               │
│                                                               │
│  Result: Client has full access and documentation            │
│          Project status: COMPLETE ✅                          │
└─────────────────────────────────────────────────────────────┘
```

### Time Estimate per Step

| Step | Description | Estimated Time |
|------|-------------|----------------|
| 1 | Create Client | 5 minutes |
| 2 | Access Workspace | 1 minute |
| 3 | Select Template | 5 minutes |
| 4 | Customize Branding | 15-30 minutes |
| 5 | Customize Content | 1-2 hours |
| 6 | Preview App | 10-15 minutes |
| 7 | Deploy/Export | 10-20 minutes |
| 8 | Handover | 30 minutes |
| **TOTAL** | **End-to-End** | **≤3 hours** |

**Note:** Content customization time varies based on template complexity and amount of custom content needed.

---

## Technical Requirements

### Technology Stack (MVP)

**Frontend:**
- Next.js 14.2 (App Router)
- React 18.2
- TypeScript 5
- Tailwind CSS 3.4
- shadcn/ui components
- Framer Motion (minimal use)

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL database)
- Supabase Auth (authentication)
- Supabase Storage (file uploads)

**Development:**
- npm package manager
- ESLint + Prettier
- Git version control

**Deployment:**
- Vercel (primary)
- Docker (alternative)

### Remove from Codebase (Non-Essential)

**Directories to Archive/Remove:**
- `/app/hero-tasks` - Hero tasks system
- `/app/test-ai` - AI testing features
- `/app/consultation` - Advanced consultation (can add back later)
- `/app/marketplace` - Module marketplace (separate from templates)
- `/app/state-management` - State management pages
- `/lib/observability` - Advanced monitoring
- Complex workflow automation code
- Advanced analytics infrastructure

**Configuration to Simplify:**
- Remove OpenTelemetry setup
- Remove Sentry integration (use simple logging)
- Simplify error handling
- Remove unused dependencies

### Core Services Needed

**lib/templates/**
- `storage.ts` - CRUD for template_storage table
- `engine.ts` - Template rendering with customizations
- `types.ts` - Template type definitions

**lib/branding/**
- `service.ts` - Brand customization logic
- `theme-generator.ts` - Generate CSS from brand config
- `types.ts` - Brand type definitions

**lib/content/**
- `editor.ts` - Content editing utilities
- `validator.ts` - Content validation
- `types.ts` - Content structure types

**lib/graduation/**
- `export.ts` - Generate standalone app package
- `deployment.ts` - Deployment configuration generator

---

## Database Schema

### New Tables Required

#### 1. template_storage (CRITICAL)

Stores the actual template files and metadata.

```sql
CREATE TABLE template_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(255) NOT NULL UNIQUE,
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL,
  -- Values: 'fitness-coach', 'home-services', 'real-estate', 'funeral-home'

  -- Template Structure
  template_files JSONB NOT NULL,
  -- Structure:
  -- {
  --   "pages": {
  --     "home": { "components": [...], "layout": "..." },
  --     "about": { "components": [...], "layout": "..." },
  --     "services": { "components": [...], "layout": "..." },
  --     "contact": { "components": [...], "layout": "..." }
  --   },
  --   "components": {
  --     "Hero": { "props": {...}, "defaultContent": {...} },
  --     "Services": { "props": {...}, "defaultContent": {...} }
  --   },
  --   "styles": {
  --     "global": "...",
  --     "theme": {...}
  --   }
  -- }

  default_content JSONB NOT NULL,
  -- Structure:
  -- {
  --   "home": {
  --     "hero": {
  --       "heading": "Transform Your Health Today",
  --       "subheading": "Expert fitness coaching...",
  --       "ctaText": "Get Started",
  --       "backgroundImage": "/templates/fitness/hero.jpg"
  --     },
  --     "services": [
  --       {
  --         "title": "Personal Training",
  --         "description": "One-on-one coaching...",
  --         "icon": "dumbbell"
  --       }
  --     ]
  --   }
  -- }

  customizable_fields JSONB NOT NULL,
  -- Structure:
  -- {
  --   "home.hero.heading": { "type": "text", "maxLength": 100 },
  --   "home.hero.backgroundImage": { "type": "image", "aspect": "16:9" },
  --   "services": { "type": "array", "max": 10 }
  -- }

  brand_options JSONB NOT NULL,
  -- Structure:
  -- {
  --   "colors": {
  --     "primary": { "default": "#3B82F6", "editable": true },
  --     "secondary": { "default": "#10B981", "editable": true }
  --   },
  --   "fonts": {
  --     "heading": { "default": "Inter", "options": ["Inter", "Roboto", "Poppins"] },
  --     "body": { "default": "Inter", "options": ["Inter", "Roboto", "Open Sans"] }
  --   }
  -- }

  preview_image TEXT,
  description TEXT,
  version VARCHAR(50) DEFAULT '1.0.0',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_template_storage_type ON template_storage(template_type);
CREATE INDEX idx_template_storage_status ON template_storage(status);
```

#### 2. client_templates (CRITICAL)

Links clients to templates and stores all customizations.

```sql
CREATE TABLE client_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_app_id UUID NOT NULL REFERENCES tenant_apps(id) ON DELETE CASCADE,
  template_id VARCHAR(255) NOT NULL REFERENCES template_storage(template_id),

  -- Client-Specific Customizations
  custom_content JSONB DEFAULT '{}',
  -- Structure: Same as template_storage.default_content
  -- Only stores CHANGED values, merges with defaults at runtime
  -- {
  --   "home.hero.heading": "ABC Fitness - Your Journey Starts Here",
  --   "home.hero.backgroundImage": "/uploads/abc-fitness/hero.jpg"
  -- }

  custom_branding JSONB DEFAULT '{}',
  -- Structure:
  -- {
  --   "logo": "/uploads/abc-fitness/logo.png",
  --   "colors": {
  --     "primary": "#FF5733",
  --     "secondary": "#33C3FF"
  --   },
  --   "fonts": {
  --     "heading": "Poppins",
  --     "body": "Open Sans"
  --   }
  -- }

  custom_pages JSONB DEFAULT '{}',
  -- For future: page-level customizations
  -- {
  --   "home": { "enabled": true, "order": 1 },
  --   "custom-page": { "enabled": true, "order": 5, "slug": "pricing" }
  -- }

  -- Metadata
  status VARCHAR(50) DEFAULT 'draft',
  -- Values: 'draft', 'active', 'published', 'archived'

  published_at TIMESTAMPTZ,
  deployed_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_client_template UNIQUE(tenant_app_id, template_id)
);

-- Indexes
CREATE INDEX idx_client_templates_tenant ON client_templates(tenant_app_id);
CREATE INDEX idx_client_templates_template ON client_templates(template_id);
CREATE INDEX idx_client_templates_status ON client_templates(status);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_client_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_templates_updated_at
BEFORE UPDATE ON client_templates
FOR EACH ROW
EXECUTE FUNCTION update_client_templates_updated_at();
```

#### 3. client_graduations (MEDIUM PRIORITY)

Tracks export/graduation events.

```sql
CREATE TABLE client_graduations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_app_id UUID NOT NULL REFERENCES tenant_apps(id) ON DELETE CASCADE,

  -- Export Details
  export_type VARCHAR(50) NOT NULL,
  -- Values: 'manual-zip', 'vercel-auto', 'github-repo', 'docker-image'

  export_status VARCHAR(50) DEFAULT 'pending',
  -- Values: 'pending', 'processing', 'completed', 'failed'

  export_url TEXT,
  repository_url TEXT,
  deployment_url TEXT,

  -- Export Package Metadata
  exported_files JSONB,
  -- List of included files

  deployment_config JSONB,
  -- Environment variables and config needed for deployment

  export_notes TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_graduations_tenant ON client_graduations(tenant_app_id);
CREATE INDEX idx_graduations_status ON client_graduations(export_status);
```

### Modified Tables

#### tenant_apps - Add Template Reference

```sql
ALTER TABLE tenant_apps
  ADD COLUMN IF NOT EXISTS active_template_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS template_applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customization_progress JSONB DEFAULT '{}';
  -- customization_progress structure:
  -- {
  --   "template_selected": true,
  --   "branding_completed": false,
  --   "content_completed": false,
  --   "preview_viewed": false,
  --   "deployed": false
  -- }

-- Add foreign key after template_storage exists
-- ALTER TABLE tenant_apps
--   ADD CONSTRAINT fk_tenant_apps_template
--   FOREIGN KEY (active_template_id)
--   REFERENCES template_storage(template_id);
```

---

## Implementation Checklist

### Phase 1: Foundation (Days 1-2)

#### Day 1: Database & Template Storage

**Morning (4 hours):**
- [ ] Create database migration files
  - [ ] `001_create_template_storage.sql`
  - [ ] `002_create_client_templates.sql`
  - [ ] `003_alter_tenant_apps.sql`
  - [ ] `004_create_client_graduations.sql`
- [ ] Run migrations in Supabase
- [ ] Verify tables created correctly
- [ ] Set up Row Level Security (RLS) policies

**Afternoon (4 hours):**
- [ ] Create `lib/templates/types.ts` with TypeScript types
- [ ] Create `lib/templates/storage.ts` service
  - [ ] `getAllTemplates()` - Fetch all templates
  - [ ] `getTemplateById(id)` - Fetch single template
  - [ ] `createTemplate(data)` - Admin function
  - [ ] `updateTemplate(id, data)` - Admin function
- [ ] Create 4 base templates in JSON format
  - [ ] Fitness Coach template
  - [ ] Home Services template
  - [ ] Real Estate Agent template
  - [ ] Funeral Home template
- [ ] Seed templates into database

#### Day 2: Template Selection & Application

**Morning (4 hours):**
- [ ] Create API endpoint: `GET /api/templates`
- [ ] Create API endpoint: `POST /api/templates/apply`
- [ ] Build `/app/clients/[clientId]/templates/page.tsx`
  - [ ] Template gallery component
  - [ ] Template preview modal
  - [ ] Apply template button
- [ ] Test template selection workflow

**Afternoon (4 hours):**
- [ ] Create `lib/templates/engine.ts` rendering service
  - [ ] `renderTemplate(templateId, customizations)` - Merge template with customizations
  - [ ] `validateCustomizations(template, customizations)` - Validate edits
- [ ] Update client workspace dashboard
  - [ ] Show template status
  - [ ] Add "Select Template" button when no template
  - [ ] Show customization progress
- [ ] Test end-to-end template application

### Phase 2: Customization (Days 3-5)

#### Day 3: Brand Customization

**Morning (4 hours):**
- [ ] Create `lib/branding/types.ts`
- [ ] Create `lib/branding/service.ts`
  - [ ] `getBranding(tenantAppId)` - Get current branding
  - [ ] `updateBranding(tenantAppId, branding)` - Save branding
  - [ ] `generateThemeCSS(branding)` - Generate CSS variables
- [ ] Create API endpoint: `GET /api/clients/[id]/branding`
- [ ] Create API endpoint: `PUT /api/clients/[id]/branding`

**Afternoon (4 hours):**
- [ ] Build `/app/clients/[clientId]/customize/theming/page.tsx`
  - [ ] Logo upload component (Supabase Storage)
  - [ ] Color picker for primary/secondary colors
  - [ ] Font selector dropdown
  - [ ] Real-time preview panel
  - [ ] Save button with loading states
- [ ] Test branding customization workflow
- [ ] Verify changes persist correctly

#### Day 4: Content Customization

**Morning (4 hours):**
- [ ] Create `lib/content/types.ts`
- [ ] Create `lib/content/editor.ts`
  - [ ] `getContent(tenantAppId)` - Get current content
  - [ ] `updateContent(tenantAppId, content)` - Save content
  - [ ] `validateContent(template, content)` - Validate edits
- [ ] Create API endpoint: `GET /api/clients/[id]/content`
- [ ] Create API endpoint: `PUT /api/clients/[id]/content`

**Afternoon (4 hours):**
- [ ] Build `/app/clients/[clientId]/customize/content/page.tsx`
  - [ ] Page selector (Home, About, Services, Contact)
  - [ ] Text editor for headings/paragraphs
  - [ ] Image upload/replacement component
  - [ ] Editable field list based on template
  - [ ] Save button with auto-save
- [ ] Test content editing workflow
- [ ] Verify changes persist correctly

#### Day 5: Preview System

**Morning (4 hours):**
- [ ] Create `components/templates/TemplateRenderer.tsx`
  - [ ] Load template structure
  - [ ] Apply branding customizations (CSS variables)
  - [ ] Apply content customizations (merge with defaults)
  - [ ] Render pages dynamically
- [ ] Create API endpoint: `GET /api/clients/[id]/preview`
  - [ ] Fetch template
  - [ ] Fetch customizations
  - [ ] Return merged preview data

**Afternoon (4 hours):**
- [ ] Build `/app/clients/[clientId]/preview/page.tsx`
  - [ ] Device selector (Desktop/Tablet/Mobile)
  - [ ] Iframe or full-page preview
  - [ ] Navigation between pages
  - [ ] "Back to Edit" button
- [ ] Test preview accuracy
- [ ] Verify all customizations render correctly

### Phase 3: Integration & Polish (Days 6-7)

#### Day 6: Workflow Integration

**Morning (4 hours):**
- [ ] Update `/app/intake/page.tsx`
  - [ ] Add "Select Template" step (optional)
  - [ ] Redirect to client workspace after creation
- [ ] Update `/app/clients/[clientId]/page.tsx`
  - [ ] Show progress checklist
  - [ ] Add quick action buttons
  - [ ] Display template preview thumbnail
- [ ] Create navigation flow
  - [ ] Template → Branding → Content → Preview → Deploy

**Afternoon (4 hours):**
- [ ] Implement progress tracking
  - [ ] Update `customization_progress` in tenant_apps
  - [ ] Show completion percentage
- [ ] Add helpful tooltips and guidance
- [ ] Test complete workflow end-to-end
- [ ] Fix any UX issues

#### Day 7: Graduation & Final Testing

**Morning (4 hours):**
- [ ] Create `lib/graduation/export.ts`
  - [ ] `generateExportPackage(tenantAppId)` - Create ZIP
  - [ ] `generateDeploymentGuide(tenantAppId)` - Create README
  - [ ] `generateEnvTemplate(tenantAppId)` - Create .env.example
- [ ] Create API endpoint: `POST /api/clients/[id]/export`
- [ ] Build `/app/clients/[clientId]/deploy/page.tsx`
  - [ ] "Generate Export" button
  - [ ] Download ZIP functionality
  - [ ] Deployment instructions display
  - [ ] Mark as deployed option

**Afternoon (4 hours):**
- [ ] End-to-end testing
  - [ ] Create test client
  - [ ] Select template
  - [ ] Customize branding
  - [ ] Customize content
  - [ ] Preview app
  - [ ] Export package
  - [ ] Verify export contents
- [ ] Bug fixes
- [ ] Documentation updates
- [ ] Create deployment checklist

---

## Success Criteria

### Functional Requirements ✅

**Must Work End-to-End:**
- [ ] User can create new client in < 5 minutes
- [ ] User can select from 4 templates
- [ ] User can change brand colors (primary, secondary)
- [ ] User can upload and apply client logo
- [ ] User can edit text content on all template pages
- [ ] User can replace template images with client images
- [ ] User can preview changes in real-time
- [ ] Preview accurately reflects all customizations
- [ ] User can export client app as ZIP file
- [ ] Export contains all necessary files and instructions

### Data Persistence ✅

- [ ] Client data saves correctly to tenant_apps
- [ ] Template selection saves to client_templates
- [ ] Brand customizations save to custom_branding JSONB
- [ ] Content customizations save to custom_content JSONB
- [ ] All changes reload correctly on page refresh
- [ ] No data loss during workflow

### Performance Targets ✅

- [ ] Client workspace loads in < 2 seconds
- [ ] Template selection page loads in < 2 seconds
- [ ] Brand customization saves in < 1 second
- [ ] Content editing auto-saves in < 1 second
- [ ] Preview renders in < 3 seconds
- [ ] Export generation completes in < 10 seconds

### UI/UX Quality ✅

- [ ] Navigation is clear and intuitive
- [ ] All forms have proper validation
- [ ] Loading states are shown for async operations
- [ ] Error messages are helpful and specific
- [ ] Success confirmations are clear
- [ ] Mobile-responsive (works on tablet/phone)
- [ ] Accessible (keyboard navigation, screen readers)

### Build & Deployment ✅

- [ ] TypeScript compilation succeeds with no errors
- [ ] ESLint passes with no blocking errors
- [ ] Production build completes in < 5 minutes
- [ ] Build size is < 10 MB
- [ ] No memory errors during build
- [ ] Vercel deployment succeeds

---

## Post-MVP Roadmap

### Phase 2: Automation (Weeks 2-3)

- [ ] Automated deployment to Vercel (one-click)
- [ ] GitHub repository auto-creation
- [ ] Continuous deployment pipeline
- [ ] Automated testing for client apps
- [ ] Template version management

### Phase 3: Advanced Features (Month 2)

- [ ] Template marketplace with community templates
- [ ] Advanced form builder integration
- [ ] Workflow automation (n8n)
- [ ] Client analytics dashboards
- [ ] Multi-language support
- [ ] White-label agency branding

### Phase 4: Scale (Month 3+)

- [ ] AI-powered content suggestions
- [ ] Advanced customization options
- [ ] Template inheritance/variations
- [ ] Collaboration features (team editing)
- [ ] Client portal with self-service
- [ ] API for third-party integrations

---

## Appendix A: Template Structure Example

### Fitness Coach Template JSON

```json
{
  "template_id": "fitness-coach-v1",
  "template_name": "Fitness Coach Pro",
  "template_type": "fitness-coach",
  "pages": {
    "home": {
      "sections": [
        {
          "id": "hero",
          "component": "Hero",
          "content": {
            "heading": "Transform Your Health Today",
            "subheading": "Expert fitness coaching tailored to your goals",
            "ctaText": "Get Started",
            "ctaLink": "/contact",
            "backgroundImage": "/templates/fitness/hero.jpg"
          },
          "customizable": ["heading", "subheading", "ctaText", "backgroundImage"]
        },
        {
          "id": "services",
          "component": "ServicesGrid",
          "content": {
            "heading": "Our Services",
            "services": [
              {
                "title": "Personal Training",
                "description": "One-on-one coaching sessions designed for your unique fitness journey",
                "icon": "dumbbell",
                "image": "/templates/fitness/service-1.jpg"
              },
              {
                "title": "Nutrition Coaching",
                "description": "Customized meal plans to fuel your body and reach your goals",
                "icon": "apple",
                "image": "/templates/fitness/service-2.jpg"
              },
              {
                "title": "Group Classes",
                "description": "High-energy group workouts that build community and results",
                "icon": "users",
                "image": "/templates/fitness/service-3.jpg"
              }
            ]
          },
          "customizable": ["heading", "services"]
        }
      ]
    },
    "about": {
      "sections": [
        {
          "id": "story",
          "component": "AboutStory",
          "content": {
            "heading": "Our Story",
            "body": "We started with a simple mission: make fitness accessible...",
            "image": "/templates/fitness/about.jpg"
          },
          "customizable": ["heading", "body", "image"]
        }
      ]
    }
  },
  "brand_options": {
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#10B981",
      "accent": "#F59E0B"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    }
  }
}
```

---

## Appendix B: API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/templates` | List all available templates |
| GET | `/api/templates/[id]` | Get single template details |
| POST | `/api/templates/apply` | Apply template to client |
| GET | `/api/clients/[id]/branding` | Get client branding |
| PUT | `/api/clients/[id]/branding` | Update client branding |
| GET | `/api/clients/[id]/content` | Get client content |
| PUT | `/api/clients/[id]/content` | Update client content |
| GET | `/api/clients/[id]/preview` | Get preview data |
| POST | `/api/clients/[id]/export` | Generate export package |

---

## Appendix C: File Structure

```
my-app/
├── app/
│   ├── clients/
│   │   ├── page.tsx                          # Client list
│   │   └── [clientId]/
│   │       ├── page.tsx                      # Client workspace dashboard
│   │       ├── templates/
│   │       │   └── page.tsx                  # Template selection
│   │       ├── customize/
│   │       │   ├── theming/
│   │       │   │   └── page.tsx              # Brand customization
│   │       │   └── content/
│   │       │       └── page.tsx              # Content editor
│   │       ├── preview/
│   │       │   └── page.tsx                  # App preview
│   │       └── deploy/
│   │           └── page.tsx                  # Export/deployment
│   ├── intake/
│   │   └── page.tsx                          # Client intake form
│   └── api/
│       ├── templates/
│       │   ├── route.ts                      # Template CRUD
│       │   └── apply/route.ts                # Apply template
│       └── clients/
│           └── [id]/
│               ├── branding/route.ts         # Branding API
│               ├── content/route.ts          # Content API
│               ├── preview/route.ts          # Preview API
│               └── export/route.ts           # Export API
├── lib/
│   ├── templates/
│   │   ├── types.ts                          # Template types
│   │   ├── storage.ts                        # Template CRUD service
│   │   └── engine.ts                         # Template rendering
│   ├── branding/
│   │   ├── types.ts                          # Branding types
│   │   └── service.ts                        # Branding logic
│   ├── content/
│   │   ├── types.ts                          # Content types
│   │   └── editor.ts                         # Content editing
│   └── graduation/
│       └── export.ts                         # Export/graduation
├── components/
│   ├── templates/
│   │   ├── TemplateRenderer.tsx              # Template rendering
│   │   ├── TemplateGallery.tsx               # Template selection
│   │   └── TemplatePreview.tsx               # Template preview
│   ├── branding/
│   │   ├── ColorPicker.tsx                   # Color selection
│   │   ├── FontSelector.tsx                  # Font selection
│   │   └── LogoUpload.tsx                    # Logo upload
│   └── content/
│       ├── ContentEditor.tsx                 # Content editing
│       └── ImageUpload.tsx                   # Image replacement
└── supabase/
    └── migrations/
        ├── 001_create_template_storage.sql
        ├── 002_create_client_templates.sql
        ├── 003_alter_tenant_apps.sql
        └── 004_create_client_graduations.sql
```

---

**End of MVP Requirements Document**

*This document should be treated as the source of truth for MVP development. All features not listed here are out of scope and should be deferred to post-MVP phases.*
