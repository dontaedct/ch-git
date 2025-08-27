# DCT Micro-Apps UI Architecture Specification

**Date:** 2025-08-27  
**Role:** Senior Staff Frontend + Systems Architect  
**Scope:** Universal 3-page DCT Micro-Apps flow with schema-first configuration

## 1) Repo Audit Snapshot

### Project Metadata
- **Framework:** Next.js 15.4.6 + React 19.1.0 + TypeScript 5
- **App Router:** `/app` directory structure with route handlers
- **Build:** ESM modules (`"type": "module"`), strict TypeScript, ESLint + Prettier
- **Environment:** Supabase integration with Zod validation, environment safety checks
- **Scripts:** Comprehensive CI pipeline with typecheck, lint, test, build, security checks
- **Dev Tools:** Husky hooks, Jest testing, Playwright E2E, bundle analysis

### Route Tree (`app/`)
- `/` - Main landing page (`page.tsx`)
- `/intake` - Current intake form (to be evolved into questionnaire)
- `/login` - Authentication
- `/status` - System status page
- `/operability/flags` - Feature flag management
- API routes: `/api/health`, `/api/webhooks/*`, `/api/n8n/*`, etc.

### UI Component Library
**Existing Radix + Tailwind components:**
- Core: Button, Card, Input, Textarea, Select, Checkbox, Switch
- Navigation: Tabs, Accordion, Breadcrumb, Pagination
- Layout: Dialog, Sheet, Drawer, Popover, Tooltip
- Feedback: Toast, Alert, Progress, Skeleton
- **Missing for micro-apps:** Stepper component, Chip/Badge selection, PDF export

### Styling Approach
- **Tailwind CSS** with custom design tokens in `tailwind.config.js`
- Apple-inspired aesthetics: hairline borders, soft shadows, neutral surfaces
- CSS variables + class-variance-authority for component variants
- Motion: Basic fade-in animations, responsive design patterns
- **Tokenization status:** Partial (colors/shadows in Tailwind config, needs expansion)

### Data/AI Integration Points
- **AI Router:** `/lib/ai/` with OpenAI provider, task runners, cost tracking
- **Template System:** Prompt templates in `/lib/ai/prompts/`
- **Validation:** Zod schemas for data validation
- **Current consultation logic:** Not yet implemented for micro-apps

### N8N/Webhook Infrastructure
- **HMAC Verification:** Constant-time signature validation (`lib/webhooks/verifyHmac.ts`)
- **Idempotency:** Database-backed request deduplication (`lib/webhooks/idempotency.ts`)
- **Reliability:** Circuit breaker, DLQ, retry mechanisms (`lib/n8n/reliability.ts`)
- **Endpoints:** Generic webhook handler at `/api/webhooks/generic`

### Build Safety & Quality
- **TypeScript:** Strict mode enabled, comprehensive type checking
- **Testing:** Jest unit tests, Playwright E2E, accessibility testing
- **Security:** CSP headers, HMAC verification, environment validation
- **CI Pipeline:** Lint → typecheck → test → build → security scan
- **Error Boundaries:** Global error handling, structured logging

### Gaps & Risks

**P0 (Critical)**
- No schema-first questionnaire system
- No consultation template engine
- No PDF generation from DOM
- Missing design token system

**P1 (High)**
- No stepper/progress components
- No chip selection components
- No plan catalog data structure
- No theme customization system

**P2 (Medium)**
- Limited animation system (needs 150-200ms motion)
- No accessibility audit for questionnaire flow
- No performance optimization for code-splitting

**Quick Fixes:**
- Extend existing Button/Badge for chip selection
- Use Radix Progress for stepper base
- Add design tokens to existing Tailwind config
- Implement PDF export with html2canvas or similar

## 2) Minimal Types & Config Patterns

### Schema-First Approach
- **Configuration-driven UI:** All questionnaire steps, questions, and plan layouts defined in JSON
- **Runtime validation:** Zod schemas ensure config integrity and type safety
- **Conditional logic:** `visibleIf` rules for dynamic question flow
- **Template injection:** AI content populated from pre-made templates + catalog data
- **Theme overrides:** Per-client token customization without code changes

### Essential Types Overview

**Core Configuration Types:**
- `ThemeTokens` - Color palette, typography, spacing, motion timing
- `QuestionnaireConfig` - Steps, questions, validation rules, conditional visibility
- `ConsultationTemplate` - Section structure, plan deck configuration, content templates
- `PlanCatalog` - Available plans with eligibility rules and feature sets
- `ModuleRegistry` - Feature/service modules with tier restrictions

**Theme System Example:**
```json
{
  "colors": {
    "primary": "#007AFF",
    "neutral": { "50": "#FAFAFA", "900": "#171717" }
  },
  "typography": {
    "fontFamily": "SF Pro Display, system-ui, sans-serif",
    "scales": { "display": "2.5rem", "body": "1rem" }
  },
  "motion": { "duration": "150ms", "easing": "cubic-bezier(.2,.8,.2,1)" }
}
```

**Plan Catalog Example:**
```json
{
  "plans": [
    {
      "id": "foundation",
      "title": "Foundation Plan",
      "priceBand": "$2,000-4,000",
      "includes": ["Initial consultation", "Basic strategy", "30-day support"],
      "eligibleIf": { "company_size": ["startup", "small"] }
    },
    {
      "id": "growth",
      "title": "Growth Acceleration",
      "priceBand": "$5,000-10,000",
      "includes": ["Comprehensive audit", "Custom strategy", "90-day implementation"],
      "eligibleIf": { "company_size": ["medium", "large"] }
    }
  ]
}
```

## 3) Page Specifications

### Landing/Home Page
**Structure:** Hero section, social proof strip, "How it works" (3 steps), FAQ accordion, sticky CTA
**Configuration:** All copy, images, and CTA text driven by config
**Accessibility:** Semantic HTML, accordion ARIA states, keyboard navigation
**Performance:** Prefetch questionnaire route, optimized images, LCP < 2.5s
**Motion:** Subtle fade-in animations on scroll, respecting `prefers-reduced-motion`

### Questionnaire (Single Page)
**Multi-step UI:** Show 2-3 questions at a time with thin progress bar
**Navigation:** Previous/Next buttons, step completion validation
**Question Types:** chips, chips-multi, select, short-text, long-text, toggle
**State Management:** Autosave to localStorage, restore on page refresh
**Accessibility:** Focus management, aria-live progress updates, keyboard chip selection
**Validation:** Real-time inline validation, normalized answer object output

### Consultation Results
**Consultation Card:** Fixed section structure from config template
**Plan Display:** Tabbed interface (1 primary + up to N alternates)
**Section Order:** whatYouGet, whyThisFits, timeline, priceBand (optional), nextSteps
**Actions:** Download PDF (same DOM), Email copy, Book meeting (external link)
**PDF Generation:** Single DOM template for both screen and PDF output
**Accessibility:** Keyboard-navigable tabs, focus indicators, screen reader support

## 4) Visual System (Apple/Linear/Figma Inspiration)

### Design Tokens → Components
- **Colors:** Neutral surfaces (#FAFAFA to #171717), single accent color system
- **Typography:** SF Pro Display scale, tight line heights, subtle letter spacing
- **Borders:** 1px hairline borders, 8px base radius with XL/2XL variants
- **Shadows:** Subtle depth with `0 1px 3px rgba(0,0,0,0.1)` base shadow
- **Spacing:** 8px base scale, 72px vertical rhythm for section breaks

### Motion System
- **Duration:** 150-200ms for micro-interactions
- **Easing:** `cubic-bezier(.2,.8,.2,1)` for natural feel
- **Respect:** `prefers-reduced-motion: reduce` media query
- **Targets:** Button states, tab transitions, stepper progress, modal entry/exit

### Component Mapping
- **Button/Chip:** Soft shadows, subtle hover states, focus rings
- **Cards:** Hairline borders, minimal drop shadows, clean padding
- **Tabs:** Underline indicators, smooth transitions
- **Stepper:** Thin progress line, discrete step numbers
- **Toast:** Slide-up from bottom, auto-dismiss timing

### Grid & Layout
- **Max Width:** ~1120px for content containers
- **Breakpoints:** Mobile-first responsive design
- **Spacing:** Consistent 8px grid alignment
- **Vertical Rhythm:** 72px between major sections

## 5) Integration Points (N8N Webhooks)

### Webhook Events & Payloads

**lead_started_questionnaire**
```json
{ "event": "lead_started_questionnaire", "timestamp": "2025-08-27T10:00:00Z", "session_id": "uuid", "questionnaire_id": "base" }
```
*Fired when user clicks "Start" on questionnaire*

**lead_completed_questionnaire**
```json
{ "event": "lead_completed_questionnaire", "timestamp": "2025-08-27T10:05:00Z", "session_id": "uuid", "answers": {...}, "completion_time_seconds": 300 }
```
*Fired when final question answered and validated*

**consultation_generated**
```json
{ "event": "consultation_generated", "timestamp": "2025-08-27T10:06:00Z", "session_id": "uuid", "consultation_id": "uuid", "recommended_plans": ["foundation"], "alternate_plans": ["growth"] }
```
*Fired when AI consultation created and displayed*

**pdf_downloaded**
```json
{ "event": "pdf_downloaded", "timestamp": "2025-08-27T10:10:00Z", "session_id": "uuid", "consultation_id": "uuid", "file_size_bytes": 245760 }
```
*Fired when user downloads PDF*

**email_copy_requested**
```json
{ "event": "email_copy_requested", "timestamp": "2025-08-27T10:12:00Z", "session_id": "uuid", "consultation_id": "uuid", "email": "user@example.com" }
```
*Fired when user requests email copy*

### Technical Implementation
- **HMAC Signing:** SHA-256 signatures with configurable secret keys
- **Retry Logic:** Exponential backoff, 3 attempts, DLQ for failures
- **Environment Variables:** `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `N8N_RETRY_ATTEMPTS`
- **Configuration:** Endpoint URLs and secrets swappable via config keys

## 6) Acceptance Criteria & Mini Tests

### Must Pass Requirements

1. **Config-Driven Changes**
   - Editing `/configs/microapps/base.microapp.json` changes steps/questions without code
   - Adding/removing questions dynamically updates UI flow
   - Plan count changes (1→2 recommendations) reflect immediately

2. **Template System**
   - Consultation renders from template structure
   - Section reordering in config updates UI layout
   - Content injection from answers + catalog works correctly

3. **Plan Catalog Integration**
   - Swapping plan catalog changes card content (titles, features, pricing)
   - Eligibility rules filter available plans based on answers
   - Zero code changes required for catalog updates

4. **Theme Propagation**
   - Color tokens update global palette
   - Typography scales affect all text elements
   - Motion timing respects reduced-motion preferences

5. **PDF Generation**
   - Same DOM renders to screen and PDF
   - All styling preserved in PDF output
   - Download triggers proper analytics event

6. **Accessibility Compliance**
   - Keyboard navigation through chips, tabs, stepper
   - Screen reader support with aria-live progress
   - Focus management during step transitions

7. **Performance Targets**
   - LCP < 2.5s on mobile 4G
   - CLS < 0.1 across all interactions
   - Code-split questionnaire and consultation routes

### Mini Test Scenarios

**Schema Validation Test**
- Invalid config JSON fails gracefully with helpful errors
- `visibleIf` logic correctly shows/hides questions
- Required field validation prevents progression

**Navigation & Persistence Test**
- Back/Next buttons maintain form state
- Browser refresh restores progress from localStorage
- Invalid answers block progression with clear messaging

**PDF Generation Test**
- Happy path: PDF matches screen layout exactly
- Error handling: Network failures show user-friendly message
- Edge case: Long content properly paginated

**Accessibility & Motion Test**
- Tab key navigates all interactive elements
- Space/Enter activate chips and buttons
- Reduced motion disables animations appropriately

**Configuration Flexibility Test**
- Change 3→4 steps: UI adapts without code changes
- Change 1→2 plan recommendations: Layout adjusts correctly
- Theme color change: All components reflect new palette

## File Creation Summary

**Created/Modified Files:**
1. `/docs/microapps-ui-spec.md` - This consolidated specification
2. `/types/config.d.ts` - Essential TypeScript type definitions (pending)
3. `/configs/microapps/base.microapp.json` - Example configuration (pending)

**Migration Notes:**
- Extend existing Radix UI components rather than replace
- Leverage current Tailwind config and add design tokens
- Build on existing webhook infrastructure for n8n integration
- Use established patterns from `/lib/ai/` for consultation generation