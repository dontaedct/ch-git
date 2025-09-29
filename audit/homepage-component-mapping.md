# Homepage Component Mapping for Preview Harness
**Generated:** 2025-09-17
**Source:** `/app/page.tsx` analysis
**Purpose:** Canonical component references for manifest renderer

## Component Architecture Overview

The homepage demonstrates a sophisticated component hierarchy using:
- **Framer Motion** for animations
- **Tailwind CSS** with custom design tokens
- **Responsive design** with mobile-first approach
- **Theme switching** (light/dark mode)
- **Glass morphism effects** and premium styling

## Canonical Components for Manifest System

### 1. Header Component
```typescript
// Reference: app/page.tsx:86-130
interface HeaderManifest {
  type: 'header';
  props: {
    logo: {
      type: 'icon' | 'text' | 'image';
      content: string;
      size: 'sm' | 'md' | 'lg';
    };
    navigation: NavigationItem[];
    showThemeToggle: boolean;
    sticky: boolean;
    background: 'transparent' | 'glass' | 'solid';
  };
}
```
**Implementation Notes:**
- Fixed positioning with backdrop blur
- Responsive mobile menu
- Theme-aware styling
- Professional branding area

### 2. Hero Component
```typescript
// Reference: app/page.tsx:200-350
interface HeroManifest {
  type: 'hero';
  props: {
    title: string;
    subtitle?: string;
    description?: string;
    cta: {
      primary?: CTAAction;
      secondary?: CTAAction;
    };
    background: 'gradient' | 'mesh' | 'solid' | 'image';
    layout: 'centered' | 'left' | 'right' | 'split';
    animation: boolean;
  };
}
```
**Implementation Notes:**
- Responsive typography with clamp()
- Premium gradient backgrounds
- Call-to-action button groups
- Framer Motion animations

### 3. Feature Grid Component
```typescript
// Reference: app/page.tsx:500-700
interface FeatureGridManifest {
  type: 'feature_grid';
  props: {
    title?: string;
    description?: string;
    features: FeatureItem[];
    columns: 1 | 2 | 3 | 4;
    layout: 'cards' | 'icons' | 'text';
    spacing: 'tight' | 'normal' | 'relaxed';
  };
}

interface FeatureItem {
  icon: string; // Lucide icon name
  title: string;
  description: string;
  badge?: string;
}
```
**Implementation Notes:**
- Responsive grid layout
- Card hover effects
- Icon integration (Lucide React)
- Glass morphism styling

### 4. Card Component
```typescript
// Reference: app/page.tsx:800-950
interface CardManifest {
  type: 'card';
  props: {
    title?: string;
    description?: string;
    content: string | ComponentManifest[];
    style: 'glass' | 'solid' | 'outline' | 'elevated';
    padding: 'sm' | 'md' | 'lg' | 'xl';
    rounded: 'sm' | 'md' | 'lg' | 'xl';
    hover: boolean;
  };
}
```
**Implementation Notes:**
- Multiple card styles
- Premium hover effects
- Nested content support
- Backdrop filter effects

### 5. CTA Section Component
```typescript
// Reference: app/page.tsx:1100-1200
interface CTASectionManifest {
  type: 'cta_section';
  props: {
    title: string;
    description?: string;
    buttons: CTAAction[];
    background: 'gradient' | 'solid' | 'transparent';
    alignment: 'left' | 'center' | 'right';
    spacing: 'sm' | 'md' | 'lg';
  };
}

interface CTAAction {
  label: string;
  action: {
    type: 'navigate' | 'open_form' | 'download' | 'external';
    target: string;
  };
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
}
```

### 6. Form Component
```typescript
// Based on existing form builders
interface FormManifest {
  type: 'form';
  props: {
    title?: string;
    description?: string;
    fields: FormField[];
    submission: {
      type: 'webhook' | 'email' | 'database';
      target: string;
      method?: 'POST' | 'PUT';
    };
    validation: boolean;
    layout: 'vertical' | 'horizontal' | 'grid';
  };
}
```

## Design Token Integration

### Color System
```css
/* Light theme */
--primary: #000000
--background: #ffffff
--text: #0b0b0b
--glass-bg: rgba(255, 255, 255, 0.7)

/* Dark theme */
--primary: #fafafa
--background: #000000
--text: #ffffff
--glass-bg: rgba(15, 23, 42, 0.8)
```

### Typography Scale
```css
--text-hero: clamp(4rem, 10vw, 6rem)
--text-display: clamp(2.5rem, 6vw, 3.5rem)
--text-heading: clamp(2rem, 5vw, 2.5rem)
--text-body: clamp(1rem, 2.5vw, 1.125rem)
```

### Spacing System
```css
--spacing-xs: 0.5rem
--spacing-sm: 0.75rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem
--spacing-section: 4rem
```

## Animation Patterns

### Entrance Animations
```typescript
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

### Hover Effects
```css
.premium-hover {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-hover:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--glass-shadow-strong);
}
```

## Responsive Breakpoints
```typescript
const breakpoints = {
  xs: '320px',
  sm: '384px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};
```

## Component File References

### Primary Components (for extraction)
- **Header**: `app/page.tsx:86-130`
- **Hero**: `app/page.tsx:200-350`
- **Feature Grid**: `app/page.tsx:500-700`
- **Cards**: `app/page.tsx:800-950`
- **CTA Sections**: `app/page.tsx:1100-1200`

### Supporting Systems
- **Theme Provider**: `lib/design-tokens/provider.tsx`
- **Design Tokens**: `design-tokens.json`
- **CSS Variables**: `app/globals.css`
- **Tailwind Config**: `tailwind.config.cjs`

## Preview Harness Implementation Strategy

1. **Extract canonical components** from homepage
2. **Create component library** using existing patterns
3. **Implement manifest renderer** that maps manifest props to components
4. **Preserve existing styling** and animation patterns
5. **Maintain responsive behavior** and theme switching
6. **Support glass morphism** and premium effects

This mapping provides the foundation for creating a preview harness that renders manifests using the same high-quality components demonstrated on the homepage.