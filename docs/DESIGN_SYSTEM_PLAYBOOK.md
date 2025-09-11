# Design System Playbook
**Comprehensive Brand-Aware UI Documentation**

**Date:** 2025-09-10  
**Version:** 2.0.0  
**Status:** Production Ready  
**Task:** HT-011.4.7 - Update Design Documentation

---

## Executive Summary

This is the single source of truth for the template's design system. A **brand-aware, accessible, template-quality UI** built with Next.js 15, TypeScript, and Tailwind CSS, featuring comprehensive brand customization capabilities.

### Key Metrics
- **50+ Components** across UI foundation and application layers
- **WCAG 2.1 AA Compliant** with automated testing and brand validation
- **Performance Budget Met** - LCP < 2.5s, CLS < 0.1
- **100% TypeScript** strict mode coverage
- **Brand-Aware by Design** - comprehensive brand customization system
- **Multi-Tenant Support** - isolated brand configurations per tenant
- **Brand Validation Suite** - automated compliance and policy testing

---

## 1. Design Tokens & Visual System

### Brand-Aware Color System
The design system now supports comprehensive brand customization with dynamic color palettes that adapt to each tenant's brand identity.

#### Default Brand Palette (Fallback)
```css
/* Default Palette - Brandless Blue */
--color-accent-500: #3b82f6    /* Primary brand color */
--color-neutral-500: #737373   /* Brandless gray */

/* Semantic Colors (Auto-adapts light/dark) */
--color-primary: var(--accent-600)
--color-background: #ffffff
--color-foreground: var(--neutral-950)
```

#### Dynamic Brand Colors (Per Tenant)
```css
/* Tenant-Specific Brand Colors */
--color-primary: var(--tenant-primary)     /* Custom primary color */
--color-secondary: var(--tenant-secondary) /* Custom secondary color */
--color-accent: var(--tenant-accent)       /* Custom accent color */
--color-neutral: var(--tenant-neutral)     /* Custom neutral color */
--color-success: var(--tenant-success)     /* Custom success color */
--color-warning: var(--tenant-warning)     /* Custom warning color */
--color-error: var(--tenant-error)         /* Custom error color */
--color-info: var(--tenant-info)           /* Custom info color */
```

#### Brand Color Configuration
```typescript
// Tenant brand configuration
interface TenantBrandConfig {
  theme: {
    colors: {
      primary: '#007AFF',      // Custom primary color
      secondary: '#34C759',    // Custom secondary color
      neutral: '#8E8E93',      // Custom neutral color
      accent: '#FF9500',       // Custom accent color
      success: '#34C759',      // Custom success color
      warning: '#FF9500',      // Custom warning color
      error: '#FF3B30',        // Custom error color
      info: '#007AFF',         // Custom info color
    }
  }
}
```

### Brand-Aware Typography System
The typography system supports custom font families and scales per tenant while maintaining accessibility and performance standards.

#### Default Typography Scale
```css
--font-size-xs: 0.75rem      /* 12px - Labels */
--font-size-sm: 0.875rem     /* 14px - Body small */
--font-size-base: 1rem       /* 16px - Body */
--font-size-lg: 1.125rem     /* 18px - Headings */
--font-size-2xl: 1.5rem      /* 24px - Section titles */
--font-size-4xl: 2.25rem     /* 36px - Hero text */
```

#### Dynamic Typography (Per Tenant)
```css
/* Tenant-Specific Typography */
--font-family-primary: var(--tenant-font-family)    /* Custom font family */
--font-weight-normal: var(--tenant-font-weight-normal) /* Custom font weights */
--font-weight-medium: var(--tenant-font-weight-medium)
--font-weight-semibold: var(--tenant-font-weight-semibold)
--font-weight-bold: var(--tenant-font-weight-bold)
```

#### Brand Typography Configuration
```typescript
// Tenant typography configuration
interface TenantTypographyConfig {
  fontFamily: 'Inter, system-ui, sans-serif',  // Custom font family
  fontWeights: [400, 500, 600, 700],          // Available font weights
  fontDisplay: 'swap',                         // Font loading strategy
  scale: {
    xs: '0.75rem',     // Custom scale values
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  }
}
```

### Grid System
```css
--grid-max-width: 1120px     /* Container width */
--grid-gutters-md: 24px      /* Standard gutters */
--section-spacing-lg: 72px   /* Vertical rhythm */
```

### Motion System
```css
--duration-fast: 150ms       /* Micro-interactions */
--duration-normal: 200ms     /* Component transitions */
--easing-spring: cubic-bezier(0.2, 0.8, 0.2, 1)
```

---

## 2. Brand Customization System

### Brand Configuration Architecture
The design system supports comprehensive brand customization through a multi-layered configuration system:

#### Tenant Brand Configuration
```typescript
interface TenantBrandConfig {
  tenantId: string;
  brand: {
    id: string;
    name: string;
    description: string;
    isCustom: boolean;
  };
  theme: {
    colors: BrandColorPalette;
    typography: BrandTypographyConfig;
    logo: BrandLogoConfig;
    spacing: BrandSpacingConfig;
  };
  isActive: boolean;
  validationStatus: 'valid' | 'invalid' | 'pending';
}
```

#### Brand Policy Enforcement
The system includes comprehensive brand policy enforcement with:
- **Accessibility Compliance**: WCAG 2.1 AA standards validation
- **Usability Standards**: UX best practices enforcement
- **Design Consistency**: Brand guideline compliance
- **Performance Standards**: Font loading and color contrast optimization

#### Brand Validation Testing
Automated brand validation testing suite includes:
- **Compliance Testing**: Accessibility and usability validation
- **Policy Testing**: Brand-specific design policy enforcement
- **Integration Testing**: Component integration validation
- **Stress Testing**: Performance under load testing

### Brand Customization Features

#### 1. Dynamic Color Palettes
- **Primary Colors**: Custom primary, secondary, and accent colors
- **Semantic Colors**: Success, warning, error, and info color customization
- **Neutral Colors**: Custom neutral color scales
- **Accessibility Validation**: Automatic contrast ratio checking

#### 2. Custom Typography
- **Font Families**: Support for custom font families
- **Font Weights**: Configurable font weight scales
- **Font Display**: Optimized font loading strategies
- **Typography Scales**: Custom size scales per tenant

#### 3. Logo Management
- **Logo Assets**: Custom logo upload and management
- **Logo Variants**: Multiple logo formats and sizes
- **Fallback Options**: Initials and background color fallbacks
- **Accessibility**: Alt text and screen reader support

#### 4. Spacing Customization
- **Spacing Scales**: Custom spacing values per tenant
- **Component Spacing**: Consistent spacing across components
- **Layout Spacing**: Custom layout and section spacing

---

## 3. Component Gallery & Usage

### Core UI Components (`components/ui/`)

#### Form Controls
- **Button** - Primary actions with variants (`button.tsx`)
- **Input/Textarea** - Form inputs with validation (`input.tsx`, `textarea.tsx`)
- **Select/Checkbox** - Selection controls (`select.tsx`, `checkbox.tsx`)
- **Chip Group** - Multi-selection chips (`chip-group.tsx`)

#### Layout & Navigation
- **Card** - Content containers (`card.tsx`)
- **Tabs** - Navigation with underline variant (`tabs.tsx`, `tabs-underline.tsx`)
- **Stepper** - Progress indicators (`stepper.tsx`)
- **Breadcrumb** - Navigation hierarchy (`breadcrumb.tsx`)

#### Feedback & Status
- **Alert** - Status messages (`alert.tsx`)
- **Toast** - Auto-dismissing notifications (`toast.tsx`, `toast-auto.tsx`)
- **Progress** - Loading indicators (`progress.tsx`)
- **Skeleton** - Loading placeholders (`skeleton.tsx`, `skeletons/`)

### Application Components (`components/`)

#### Core Engines
- **QuestionnaireEngine** - Multi-step form with validation
- **ConsultationEngine** - AI consultation display with PDF export
- **ModulesEditor** - Configuration management
- **SettingsForm** - Admin settings interface

#### Navigation & Layout
- **Header** - Application navigation
- **ProtectedNav/PublicNav** - Role-based navigation
- **ThemeProvider** - Design token context

---

## 3. Navigation Map & Page Compositions

### Route Structure
```
/                           # Landing page
/questionnaire             # Multi-step form
/consultation              # Results & PDF download
/dashboard                 # Admin overview
├── /catalog              # Plan management
├── /modules              # Feature configuration  
└── /settings             # System settings

/design/tokens            # Token preview (dev)
/examples/states-demo     # State showcase (dev)
```

### Page Compositions

#### Landing Page (`/`)
- Hero section with CTA
- "How it works" flow
- Responsive 3-column layout

#### Questionnaire (`/questionnaire`)
- Multi-step form with progress stepper
- Chip-based multi-selection
- Auto-save functionality
- ARIA live regions for screen readers

#### Dashboard (`/dashboard`)
- Card-based overview layout
- Tab navigation for sections
- Empty states with clear CTAs
- Data tables with sorting

---

## 4. Edge States Catalog

### Empty States (`components/empty-states.tsx`)
- **DashboardEmptyState** - First-time user experience
- **ConsultationsEmptyState** - No consultations created
- **ModulesEmptyState** - Configuration needed
- **SearchEmptyState** - No search results
- **FirstRunEmptyState** - Onboarding experience

### Loading States (`components/ui/skeletons/`)
- **SkeletonShimmer** - Basic shimmer animation
- **CardSkeleton** - Card layout placeholder
- **DashboardSkeleton** - Full dashboard loading
- **ConsultationSkeleton** - Consultation page loading

### Error States (`components/ui/error-block.tsx`)
- **NetworkErrorBlock** - Connection issues
- **ServerErrorBlock** - 500 errors
- **AuthErrorBlock** - Authentication failures
- **ValidationErrorBlock** - Form validation
- **NotFoundErrorBlock** - 404 errors

**Demo Route:** `/examples/states-demo` showcases all states

---

## 5. Accessibility Status

### WCAG 2.1 AA Compliance ✅
- **Keyboard Navigation** - Full keyboard operation
- **Screen Reader Support** - ARIA labels and live regions
- **Color Contrast** - 4.5:1 ratio minimum
- **Focus Management** - Visible focus indicators
- **Motion Preferences** - Respects `prefers-reduced-motion`

### Testing Implementation
```bash
npm run ui:a11y              # Playwright + axe-core tests
npm run ui:keyboard-flows    # Keyboard navigation tests
```

### Key Features
- Tab order management in multi-step forms
- ARIA live announcements for progress updates
- Skip links for main content
- High contrast focus indicators

---

## 6. Performance Budgets & Metrics

### Current Performance ✅
| Metric | Target | Status | Implementation |
|--------|--------|--------|---------------|
| LCP | < 2.5s | ✅ Met | Code splitting + lazy loading |
| CLS | < 0.1 | ✅ Met | Consistent loading states |
| TBT | Reasonable | ✅ Met | Deferred heavy components |
| Bundle Size | Optimized | ✅ Met | Tree-shaking + selective imports |

### Optimization Strategies
- **Code Splitting** - QuestionnaireEngine and ConsultationEngine lazy loaded
- **Tree Shaking** - Radix UI components imported individually
- **Icon Optimization** - Lucide icons with granular imports
- **Image Optimization** - Next.js Image component

---

## 8. Operator Guide: Brand Customization

### 🎨 Brand Color Customization
The system now supports comprehensive brand color customization through multiple methods:

#### Method 1: Environment Variables (Global)
```bash
# Set global brand colors (restart required)
export NEXT_PUBLIC_PRIMARY_COLOR="#FF6B35"
export NEXT_PUBLIC_SECONDARY_COLOR="#34C759"
export NEXT_PUBLIC_ACCENT_COLOR="#FF9500"
```

#### Method 2: Tenant-Specific Configuration
```typescript
// In tenant brand configuration
{
  "tenantId": "client-123",
  "theme": {
    "colors": {
      "primary": "#FF6B35",
      "secondary": "#34C759", 
      "accent": "#FF9500",
      "success": "#34C759",
      "warning": "#FF9500",
      "error": "#FF3B30",
      "info": "#007AFF"
    }
  }
}
```

#### Method 3: Brand Management API
```typescript
// Programmatic brand configuration
await brandService.updateTenantBrand('client-123', {
  theme: {
    colors: {
      primary: '#FF6B35',
      secondary: '#34C759'
    }
  }
});
```

### 🔤 Typography Customization
```typescript
// Custom typography configuration
{
  "theme": {
    "typography": {
      "fontFamily": "Inter, system-ui, sans-serif",
      "fontWeights": [400, 500, 600, 700],
      "fontDisplay": "swap",
      "scale": {
        "xs": "0.75rem",
        "sm": "0.875rem", 
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem"
      }
    }
  }
}
```

### 🖼️ Logo Customization
```typescript
// Logo configuration
{
  "theme": {
    "logo": {
      "src": "/logos/client-logo.svg",
      "alt": "Client Company Logo",
      "width": 120,
      "height": 40,
      "initials": "CC",
      "fallbackBgColor": "#FF6B35"
    }
  }
}
```

### 🧪 Brand Validation Testing
```bash
# Run comprehensive brand validation tests
npm run test:brand-validation

# Run with verbose output
npm run test:brand-validation:verbose

# Generate HTML report
npm run test:brand-validation:html

# Run compliance-focused tests
npm run test:brand-validation:compliance
```

### 📝 Modify Content
```json
// In base.microapp.json
"questionnaire": {
  "steps": [
    {
      "id": "step1",
      "title": "Getting Started",
      "questions": [
        {
          "id": "company-size",
          "text": "How large is your company?",
          "type": "chips",
          "options": [
            { "value": "startup", "label": "Startup (1-10)" },
            { "value": "small", "label": "Small (11-50)" }
          ]
        }
      ]
    }
  ]
}
```

### 🔗 Update Integration Settings
```bash
# N8N Webhook
export N8N_WEBHOOK_URL="https://your-n8n.com/webhook/events"
export N8N_WEBHOOK_SECRET="your-signing-key"

# Booking CTA
export NEXT_PUBLIC_BOOKING_URL="https://calendly.com/yourcompany"
```

### 🛠️ Feature Toggles
```bash
# Safe mode for testing
export NEXT_PUBLIC_SAFE_MODE=1

# Debug mode
export NEXT_PUBLIC_DEBUG_MODE=1
```

---

## 8. File Structure & Implementation Status

### ✅ Core Implementation Files
```
components/ui/               # 45+ UI components
├── button.tsx              # Primary actions
├── input.tsx               # Form inputs  
├── chip-group.tsx          # Multi-selection
├── stepper.tsx             # Progress indicator
├── tabs-underline.tsx      # Enhanced tabs
└── skeletons/              # Loading states

components/                 # Application components
├── questionnaire-engine.tsx # Multi-step forms
├── consultation-engine.tsx  # AI consultation display
├── empty-states.tsx        # 15+ empty state variants
└── theme-provider.tsx      # Design token context

app/                        # Next.js App Router
├── page.tsx                # Landing page
├── questionnaire/page.tsx  # Multi-step form
├── consultation/           # Results display
├── dashboard/              # Admin interface
└── design/                 # Token preview pages

lib/design-tokens/          # Design system core
├── tokens.ts               # Token definitions
├── provider.tsx            # Theme context
└── README.md               # Usage guide
```

### 🎯 Brandless Defaults Confirmed
- **Colors:** Neutral gray scale + single blue accent
- **Typography:** System fonts (no custom font loading)
- **Spacing:** Consistent 8px grid system
- **Components:** Generic labeling, no brand-specific copy
- **Icons:** Lucide React (universal icon set)

---

## 9. Development & Testing

### Build Commands
```bash
npm run build              # Production build
npm run lint              # ESLint + Prettier
npm run typecheck         # TypeScript validation
npm run test              # Jest unit tests
npm run ui:a11y           # Accessibility tests
```

### Quality Gates
- **TypeScript Strict** - 100% type coverage
- **ESLint + Prettier** - Code formatting
- **Accessibility Testing** - Automated WCAG compliance
- **Performance Budgets** - Lighthouse CI integration

### Preview Routes
- `/tokens-preview` - Design token showcase
- `/design/tokens` - Color system preview
- `/design/type` - Typography samples
- `/design/motion` - Animation examples
- `/examples/states-demo` - State management showcase

---

## 10. Next Steps & Roadmap

### Immediate (Ready to Deploy)
- ✅ All components implemented and tested
- ✅ Accessibility compliance verified
- ✅ Performance targets met
- ✅ Documentation complete

### Future Enhancements
- **Advanced Animations** - Page transitions and micro-interactions
- **Dark Mode** - Full dark theme implementation (foundation ready)
- **i18n Support** - Multi-language capability
- **Advanced PDF Layouts** - More customizable consultation outputs

---

## Summary

This design system provides a production-ready, template-quality foundation with:
- **Comprehensive component library** with consistent design language
- **Accessible by default** with WCAG 2.1 AA compliance
- **Performance optimized** with code splitting and lazy loading  
- **Operator-friendly** with no-code customization options
- **Developer experience** optimized with TypeScript and modern tooling

**Status: ✅ COMPLETE** - Ready for production use and template distribution.