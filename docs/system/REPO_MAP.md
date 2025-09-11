# Repository Architecture Map

**HT-006 Phase 0 Deliverable**  
**Generated**: 2025-09-06T20:32:00.000Z  
**Purpose**: Comprehensive codebase mapping for token-driven design system implementation  

---

## Executive Summary

This document provides a complete architectural map of the DCT Micro-Apps repository, focusing on design system components, styling infrastructure, and development patterns essential for HT-006 token-driven transformation.

## Core Architecture

### Framework Foundation
- **Next.js Version**: 14.2.0 (App Router)
- **React Version**: 18.2.0
- **TypeScript**: 5.x (strict mode)
- **Node.js**: 20+ (from @types/node)

### Directory Structure Overview

```
my-app/
├── app/                    # Next.js App Router pages and API routes
│   ├── _sandbox/          # 🎯 HT-006 sandbox development area
│   ├── api/               # API routes (v1 versioned + legacy)
│   ├── dashboard/         # Protected dashboard pages
│   ├── design/            # Existing design system demo pages
│   ├── examples/          # Component examples and demos
│   └── [routes]/          # Application pages
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── hero-tasks/       # Hero tasks system components
│   └── [app-specific]/   # Application-specific components
├── lib/                   # Utility libraries and configurations
│   ├── design-tokens/    # 🎯 Existing token system (to be enhanced)
│   ├── auth/             # Authentication utilities
│   ├── config/           # Configuration management
│   └── [utilities]/      # Various utility modules
├── styles/               # Global styles and CSS
├── types/                # TypeScript type definitions
├── docs/                 # Documentation
└── [config files]        # Various configuration files
```

---

## Design System Infrastructure

### Current Styling Architecture

#### 1. Tailwind CSS Configuration (`tailwind.config.cjs`)
- **Version**: 3.4.17
- **Mode**: Class-based dark mode
- **Custom Properties**: Extensive CSS variable integration
- **Extensions**: Custom color scales, typography, spacing, animations

**Key Features**:
- Vercel-inspired monochromatic palette
- CSS variable integration for design tokens
- Custom screen breakpoints (xs: 320px → 2xl: 1536px)
- Comprehensive typography scale with CSS variables
- Motion system with custom animations

#### 2. Global Styles (`styles/globals.css`)
- **OKLCH Color Space**: Modern color definitions
- **CSS Variables**: Comprehensive token system already in place
- **Dark Mode**: Full light/dark theme support
- **Semantic Tokens**: Primary, secondary, accent, destructive, etc.

**Existing Token Categories**:
- Colors: Primary, neutral, accent scales
- Typography: Font sizes, weights, line heights
- Spacing: Section spacing, component spacing
- Shadows: Elevation system (--elevation-0 through --elevation-4)
- Border radius: Consistent rounding system

#### 3. Design Tokens System (`lib/design-tokens/`)
- **Provider**: React context for token management
- **Architecture**: Base tokens + semantic color mapping
- **Theme Integration**: next-themes compatibility
- **CSS Variable Output**: Automatic CSS custom property generation

---

## Component Architecture

### UI Component Library (`components/ui/`)

**Foundation Components**:
- **Radix UI**: Comprehensive primitive library
- **shadcn/ui**: Pre-styled component implementations
- **CVA Integration**: class-variance-authority for variant management

**Key Components** (45+ total):
- Form controls: Button, Input, Select, Checkbox, Radio
- Layout: Card, Sheet, Dialog, Popover, Tooltip
- Navigation: Tabs, Navigation Menu, Breadcrumb
- Data: Table, Charts (Recharts), Progress
- Feedback: Toast, Alert, Badge, Skeleton

**Current CVA Usage**:
- Button: Variants, sizes, states
- Badge: Colors, sizes
- Input: Validation states
- Limited implementation - significant expansion needed for HT-006

### Application Components (`components/`)

**Core Systems**:
- **QuestionnaireEngine**: Multi-step form with validation
- **ConsultationEngine**: AI consultation display and PDF generation
- **ModulesEditor**: Client-specific module configuration
- **AutoSave**: Form state persistence and recovery

**Theme System**:
- **ThemeProvider**: next-themes integration
- **MotionProvider**: Reduced motion preference handling

---

## Page Architecture

### Current Routes (Live Pages - DO NOT MODIFY)

**Public Routes**:
- `/` - Home page
- `/questionnaire` - Main questionnaire flow
- `/consultation` - AI consultation results
- `/privacy` - Privacy policy
- `/consent` - User consent management

**Protected Routes**:
- `/dashboard` - Main dashboard
- `/dashboard/modules` - Module configuration
- `/dashboard/catalog` - Catalog overrides
- `/dashboard/settings` - User settings
- `/login` - Authentication

**Demo/Development Routes**:
- `/design/*` - Design system demos
- `/examples/*` - Component examples
- `/operability/*` - System diagnostics
- `/tokens-preview` - Token preview page

**API Routes**:
- `/api/v1/*` - Versioned API endpoints
- `/api/*` - Legacy API routes
- Comprehensive health, metrics, and webhook endpoints

### Sandbox Area (`app/_sandbox/`)
- **Status**: Partially initialized
- **Current**: Empty tokens directory
- **Planned**: Full isolation for HT-006 development

---

## Build System & Tooling

### Development Scripts
- **Core**: `dev`, `build`, `start`, `lint`, `typecheck`
- **Testing**: Jest, Playwright, Storybook
- **Quality**: ESLint, Prettier, Husky, Commitlint
- **Tooling**: Hero tasks, rename scripts, policy enforcement

### Dependencies Analysis

**Design System Stack**:
- **Styling**: tailwindcss@3.4.17, @tailwindcss/forms@0.5.10
- **Components**: 25+ @radix-ui packages
- **Variants**: class-variance-authority@0.7.1
- **Utilities**: tailwind-merge@3.3.1, clsx@2.1.1
- **Theming**: next-themes@0.4.6

**Development Tools**:
- **TypeScript**: ts-morph@26.0.0 (for where-used analysis)
- **Validation**: zod@3.22.4 (for content schemas)
- **Motion**: framer-motion@12.23.12
- **Testing**: @storybook/*@8.6.14, @playwright/test@1.55.0

---

## Critical Findings for HT-006

### ✅ Strengths (Ready for Enhancement)

1. **Solid Foundation**:
   - Modern Next.js App Router architecture
   - Comprehensive Radix UI + shadcn/ui component library
   - Existing CSS variables and token system
   - Class-based dark mode implementation

2. **Development Infrastructure**:
   - TypeScript strict mode
   - Comprehensive testing setup (Jest + Playwright + Storybook)
   - Hero tasks system for project management
   - Policy enforcement and safety scripts

3. **Existing Patterns**:
   - CVA usage in some components
   - Design tokens provider system
   - Sandbox directory structure started
   - Documentation culture established

### ⚠️ Enhancement Opportunities

1. **Token System**:
   - Limited DTCG compliance
   - No brand override architecture
   - CSS variables need expansion for full token coverage

2. **Component Variants**:
   - CVA implementation incomplete across component library
   - No comprehensive variant documentation
   - Token binding inconsistent

3. **Block Architecture**:
   - No JSON-driven page composition system
   - Missing Zod validation for content schemas
   - No block registry or renderer infrastructure

4. **Refactoring Tools**:
   - Basic rename scripts exist but limited
   - No where-used analysis for components
   - No automated codemods for safe transformations

### 🎯 Sandbox Isolation Requirements

**Critical for Zero Risk**:
- All HT-006 development in `app/_sandbox/`
- No imports from sandbox to production code
- Separate component namespaces (`components-sandbox/`, `blocks-sandbox/`)
- Independent routing and navigation
- Visual distinction ("TEST AREA" banners)

---

## Next Steps for HT-006

### Phase 1 Readiness
- ✅ Tailwind configuration supports CSS variables
- ✅ next-themes provider available
- ✅ Sandbox directory structure initiated
- ✅ Component library foundation solid

### Implementation Strategy
1. **Enhance token system** with DTCG structure
2. **Expand CVA usage** across all components
3. **Build block architecture** with Zod validation
4. **Create refactoring toolkit** with ts-morph
5. **Establish visual regression** testing

---

*This repository map serves as the foundation for HT-006's token-driven design system transformation, ensuring comprehensive understanding of the current architecture while planning safe, isolated development in the sandbox environment.*
