# Technical Baseline Documentation

**HT-006 Phase 0 Deliverable**  
**Generated**: 2025-09-06T20:32:00.000Z  
**Purpose**: Current technical stack documentation for design system transformation  

---

## Executive Summary

This document establishes the technical baseline for HT-006's token-driven design system implementation, documenting current versions, configurations, and architectural decisions that will guide the transformation.

---

## Framework Stack

### Core Framework
- **Next.js**: 14.2.0
  - App Router architecture (confirmed)
  - Server components enabled
  - API routes with versioning (/api/v1)
  - Advanced routing with dynamic segments

- **React**: 18.2.0
  - Concurrent features enabled
  - Suspense and lazy loading in use
  - Context providers for theming

- **TypeScript**: 5.x
  - Strict mode enabled
  - Custom paths configured (@/*)
  - Comprehensive type definitions

---

## Styling & Design System

### CSS Framework
- **Tailwind CSS**: 3.4.17
  - **Configuration**: `tailwind.config.cjs`
  - **Mode**: Class-based dark mode (`darkMode: ["class"]`)
  - **Content Sources**: `./app/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`

**Key Extensions**:
```javascript
// Custom breakpoints
screens: {
  'xs': '320px',
  'sm': '384px', 
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px'
}

// CSS variable integration
fontSize: {
  'xs': ['var(--text-xs)', { lineHeight: 'var(--leading-normal)' }],
  'hero': ['var(--text-hero-size)', { 
    lineHeight: 'var(--text-hero-leading)', 
    letterSpacing: 'var(--text-hero-tracking)' 
  }]
}
```

### Design Tokens Architecture

#### Current Token System (`lib/design-tokens/`)
- **Provider**: React context with next-themes integration
- **Base Tokens**: Foundational design decisions
- **Semantic Colors**: Theme-aware color mapping
- **CSS Variables**: Automatic generation and DOM injection

**Token Categories**:
- Colors: Neutral scale, accent scale, semantic roles
- Typography: Font sizes, weights, line heights, tracking
- Spacing: Component and layout spacing
- Border Radius: Consistent rounding system
- Shadows: Elevation system (--elevation-0 to --elevation-4)

#### CSS Variables System (`styles/globals.css`)
- **Color Space**: OKLCH for modern color definitions
- **Semantic Mapping**: Primary, secondary, accent, destructive, etc.
- **Dark Mode**: Comprehensive variable redefinition
- **Component Tokens**: Button, card, sidebar, chart-specific variables

**Example Structure**:
```css
:root {
  /* Semantic colors */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  
  /* Component tokens */
  --radius: 0.625rem;
  --chip-height: 2rem;
  
  /* Elevation system */
  --elevation-1: 0px 1px 2px rgba(0, 0, 0, 0.05);
  --elevation-4: 0px 16px 32px rgba(0, 0, 0, 0.15);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... comprehensive dark mode overrides */
}
```

---

## Component Architecture

### UI Library Foundation
- **Radix UI**: 25+ primitive packages
  - Latest versions (1.x and 2.x)
  - Comprehensive accessibility features
  - Headless component architecture

- **shadcn/ui**: Pre-styled implementations
  - Built on top of Radix primitives
  - CVA (class-variance-authority) integration
  - Tailwind CSS styling

### Component Variant System
- **CVA Version**: 0.7.1
- **Current Usage**: Limited to Button, Badge, some form controls
- **Pattern**:
```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        secondary: "secondary-classes"
      },
      size: {
        sm: "small-classes",
        lg: "large-classes"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)
```

### Theme Provider Integration
- **next-themes**: 0.4.6
  - System theme detection
  - Persistence across sessions
  - Theme switching animations
  - Provider composition with custom token system

**Current Implementation**:
```typescript
// components/theme-provider.tsx
export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}

// Separate motion provider
export function MotionProvider({ children }) {
  const reducedMotion = useReducedMotion()
  // Motion preference handling
}
```

---

## Build System & Development Tools

### Package Management
- **Manager**: npm
- **Type**: ESM (module)
- **Node.js**: 20+ (inferred from @types/node)

### Development Dependencies
- **ESLint**: 8.57.0 + Next.js config
- **TypeScript**: 5.x with strict mode
- **Prettier**: 3.3.3 with lint-staged
- **Husky**: 9.1.7 for git hooks
- **Commitlint**: Conventional commits enforced

### Testing Infrastructure
- **Unit Testing**: Jest 30.0.5 + jsdom environment
- **E2E Testing**: Playwright 1.55.0
- **Visual Testing**: Storybook 8.6.14 with a11y addon
- **Accessibility**: @axe-core/playwright integration

### Quality Assurance Tools
- **Bundle Analysis**: Custom scripts for size monitoring
- **Security Scanning**: Vulnerability scanner with dashboard
- **Performance**: Lighthouse CI integration
- **Policy Enforcement**: Custom policy enforcer scripts

---

## Database & Backend

### Database
- **Supabase**: PostgreSQL with Row Level Security
- **Client**: @supabase/supabase-js 2.54.0
- **SSR**: @supabase/ssr 0.7.0 for Next.js integration

### Authentication
- **Provider**: Supabase Auth
- **Implementation**: Custom guard functions (`requireClient`)
- **Safe Mode**: Environment-based bypass for development

### API Architecture
- **Versioning**: `/api/v1/*` with backward compatibility
- **Health Checks**: Comprehensive monitoring endpoints
- **Webhooks**: Generic and Stripe-specific handlers
- **Rate Limiting**: Security headers and middleware

---

## Development Workflow

### Scripts & Automation
- **Hero Tasks**: Custom task management system
- **Rename Tools**: Safe symbol, import, route, table renaming
- **Policy Enforcement**: Automated compliance checking
- **Environment Management**: Doctor scripts for health checks

### Code Quality Pipeline
```bash
# Full CI pipeline
npm run ci # Includes:
# - lint + typecheck
# - security tests
# - policy enforcement
# - comprehensive test suite
# - build verification
# - bundle analysis
```

### Feature Flags & Configuration
- **Config System**: JSON-based with override architecture
- **Feature Flags**: Environment-driven enablement
- **Safe Mode**: Development bypass for missing dependencies

---

## Current Design System State

### ✅ Strengths
1. **Modern Foundation**: Next.js 14 + React 18 + TypeScript 5
2. **Comprehensive Component Library**: 45+ components across categories
3. **CSS Variable Integration**: Extensive custom property usage
4. **Dark Mode Support**: Complete light/dark theme system
5. **Development Tools**: Robust testing and quality assurance
6. **Documentation Culture**: Established patterns for documentation

### ⚠️ Areas for Enhancement (HT-006 Targets)
1. **Token Architecture**: Limited DTCG compliance, no brand overrides
2. **CVA Coverage**: Incomplete variant implementation across components
3. **Block System**: No JSON-driven page composition
4. **Refactoring Tools**: Basic rename scripts, no where-used analysis
5. **Visual Regression**: No automated screenshot testing

---

## Compatibility Assessment for HT-006

### ✅ Ready for Implementation
- **Tailwind 3.4.17**: Full CSS variable support
- **CVA 0.7.1**: Latest variant API
- **next-themes 0.4.6**: Stable theming foundation
- **ts-morph 26.0.0**: Available for where-used analysis
- **Zod 3.22.4**: Ready for content schema validation
- **Storybook 8.6.14**: Visual testing infrastructure

### 🔄 Requires Enhancement
- **Token Structure**: Expand to DTCG specification
- **Component Variants**: Systematic CVA implementation
- **Block Architecture**: Build from scratch with Zod
- **Visual Testing**: Establish baseline and diff workflows

### 🛡️ Safety Considerations
- **Sandbox Isolation**: Existing `app/_sandbox/` directory
- **Import Guards**: Need implementation to prevent production contamination
- **Rollback Procedures**: Establish for each phase
- **Windows Compatibility**: All scripts must work on Windows environment

---

## Performance Baseline

### Current Metrics
- **Bundle Size**: Monitoring scripts in place
- **Core Web Vitals**: Lighthouse CI integration available
- **Load Times**: Sub-3s target mentioned in documentation
- **Accessibility**: WCAG 2.1 AA compliance automation

### Monitoring Infrastructure
- **Health Endpoints**: `/api/health`, `/api/ready`, `/api/probe`
- **Metrics Collection**: `/api/metrics` with SLO tracking
- **Error Tracking**: Sentry integration available

---

## Conclusion

The technical baseline provides a robust foundation for HT-006's token-driven design system transformation. The combination of modern React/Next.js architecture, comprehensive component libraries, and existing design token infrastructure creates an ideal launching point for sandbox-first development.

Key readiness indicators:
- ✅ **Modern stack** with latest stable versions
- ✅ **CSS variable foundation** ready for token expansion
- ✅ **Component library** prepared for CVA enhancement
- ✅ **Development tools** supporting safe iteration
- ✅ **Quality assurance** infrastructure for validation

The path forward involves systematic enhancement rather than replacement, ensuring zero disruption to the production application while building a comprehensive design system transformation.

---

*This technical baseline serves as the reference point for all HT-006 implementation decisions, ensuring compatibility and leveraging existing strengths while addressing identified enhancement opportunities.*
