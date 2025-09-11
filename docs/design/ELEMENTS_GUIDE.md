# HT-006 Elements Guide

**HT-006 Phase 2 Deliverable**  
*Token-Driven UI Elements with CVA Variants*

---

## Overview

This guide documents the comprehensive token-driven UI elements implemented in HT-006 Phase 2, providing developers with complete reference for the Button, Input, Card, and Badge components with their CVA variant systems and accessibility features.

## Architecture

### Token-Driven Design

All elements are built using CSS variables generated from the design token system, ensuring:

- **Brand consistency**: Instant theme switching across all components
- **Type safety**: Full TypeScript support with variant props
- **Performance**: CSS variable optimization for runtime efficiency
- **Accessibility**: WCAG 2.1 AA compliance across all variants

### CVA Integration

Components use `class-variance-authority` for:
- Type-safe variant props
- Compound variant combinations
- Default variant management
- Scalable styling architecture

---

## Components

### Button

**Location**: `components-sandbox/ui/button.tsx`

#### Variants

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  tone?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger'
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}
```

#### Usage Examples

```tsx
// Primary CTA
<Button variant="primary" size="lg" tone="brand">
  Get Started
</Button>

// Secondary action with icon
<Button variant="secondary" icon={<Download />} iconPosition="left">
  Download PDF
</Button>

// Loading state
<Button loading={true}>
  Processing...
</Button>

// Full width
<Button fullWidth variant="primary">
  Continue
</Button>
```

#### Token Bindings

| Property | Token Variable | Example |
|----------|----------------|---------|
| Primary Color | `--brand-primary` | Brand-specific primary color |
| Focus Ring | `--button-focus-ring` | Tone-specific focus indicator |
| Border Radius | `--button-border-radius` | Size-specific radius |
| Text Size | `--button-text-size` | Size-specific typography |
| Font Weight | `--button-font-weight` | Size-specific weight |

#### Accessibility Features

- **Keyboard Navigation**: Full Tab/Enter/Space support
- **Screen Readers**: Proper ARIA labels and state announcements
- **Loading States**: Screen reader announcements for loading
- **Focus Indicators**: High contrast focus rings
- **Disabled States**: Proper `aria-disabled` attributes

---

### Input

**Location**: `components-sandbox/ui/input.tsx`

#### Variants

```tsx
interface InputProps {
  variant?: 'outline' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  state?: 'default' | 'invalid' | 'success' | 'warning'
  label?: string
  helper?: string
  error?: string
  success?: string
  warning?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  required?: boolean
}
```

#### Usage Examples

```tsx
// Basic input with label
<Input 
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  required
/>

// Input with validation
<Input 
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  required
/>

// Input with icon
<Input 
  label="Search"
  placeholder="Search products..."
  icon={<Search />}
  iconPosition="left"
/>

// Success state
<Input 
  label="Username"
  value="john_doe"
  success="Username is available!"
  readOnly
/>
```

#### Token Bindings

| Property | Token Variable | Example |
|----------|----------------|---------|
| Border Color | `--input-border-color` | State-specific border |
| Focus Ring | `--input-focus-ring` | State-specific focus |
| Text Size | `--input-text-size` | Size-specific typography |
| Border Radius | `--input-border-radius` | Size-specific radius |
| Background | `--semantic-background` | Theme-aware background |

#### Accessibility Features

- **Label Association**: Proper `htmlFor` and `id` relationships
- **Required Indicators**: Visual and semantic required markers
- **Validation Messages**: Screen reader announcements for errors
- **Helper Text**: Proper `aria-describedby` associations
- **Error States**: `aria-invalid` and role="alert" for errors

---

### Card

**Location**: `components-sandbox/ui/card.tsx`

#### Variants

```tsx
interface CardProps {
  variant?: 'default' | 'outlined' | 'filled'
  elevation?: 'none' | 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}
```

#### Components

- `Card`: Main container
- `CardHeader`: Header section with title/description
- `CardTitle`: Semantic heading
- `CardDescription`: Supporting text
- `CardContent`: Main content area
- `CardFooter`: Footer actions

#### Usage Examples

```tsx
// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Interactive card with hover elevation
<Card elevation="sm" className="hover:shadow-[--shadow-lg] transition-shadow">
  <CardContent>
    <h3>Hover for elevation change</h3>
  </CardContent>
</Card>
```

#### Token Bindings

| Property | Token Variable | Example |
|----------|----------------|---------|
| Background | `--semantic-card` | Theme-aware card background |
| Border | `--semantic-border` | Theme-aware border color |
| Border Radius | `--card-border-radius` | Consistent border radius |
| Shadow | `--shadow-{size}` | Elevation-specific shadows |
| Padding | `--spacing-{size}` | Size-specific padding |

---

### Badge

**Location**: `components-sandbox/ui/badge.tsx`

#### Variants

```tsx
interface BadgeProps {
  variant?: 'solid' | 'soft' | 'outline'
  tone?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}
```

#### Usage Examples

```tsx
// Status badges
<Badge tone="success" variant="soft">Active</Badge>
<Badge tone="warning" variant="outline">Pending</Badge>
<Badge tone="danger" variant="solid">Error</Badge>

// Different sizes
<Badge size="sm" tone="brand">New</Badge>
<Badge size="md" tone="neutral">Beta</Badge>
<Badge size="lg" tone="success">Verified</Badge>

// With icons
<Badge tone="success" variant="soft">
  <CheckCircle className="w-3 h-3" />
  Verified
</Badge>
```

#### Token Bindings

| Property | Token Variable | Example |
|----------|----------------|---------|
| Brand Color | `--brand-primary` | Brand-specific colors |
| Success Color | `--color-success-500` | Semantic success color |
| Text Size | `--badge-text-size` | Size-specific typography |
| Border Radius | `--badge-border-radius` | Size-specific radius |
| Padding | `--badge-padding-{x/y}` | Size-specific padding |

---

## Migration Guide

### From Production Components

When migrating from production components to sandbox elements:

1. **Import Path Changes**:
   ```tsx
   // Before
   import { Button } from '@/components/ui/button'
   
   // After
   import { Button } from '@/components-sandbox/ui/button'
   ```

2. **Prop Updates**:
   ```tsx
   // Before (production)
   <Button variant="default" size="default">

   // After (sandbox)
   <Button variant="primary" size="md">
   ```

3. **Token Dependencies**:
   - Ensure TokensProvider is available in component tree
   - Verify CSS variables are generated and applied
   - Test theme switching functionality

### Breaking Changes

| Component | Old Prop | New Prop | Notes |
|-----------|----------|----------|-------|
| Button | `variant="default"` | `variant="primary"` | Semantic naming |
| Button | `size="default"` | `size="md"` | Explicit sizing |
| Input | Validation via className | `state` prop | Type-safe validation |
| Card | Fixed padding | `padding` prop | Configurable spacing |
| Badge | Limited variants | `tone` + `variant` | Comprehensive system |

---

## Token Reference

### CSS Variables Used

```css
/* Typography */
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-weight-medium: 500;
--font-weight-semibold: 600;

/* Colors */
--semantic-primary: theme-aware primary color;
--semantic-background: theme-aware background;
--semantic-foreground: theme-aware text color;
--brand-primary: brand-specific primary color;
--color-success-500: semantic success color;

/* Spacing */
--spacing-xs: 0.5rem;
--spacing-sm: 0.75rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;

/* Borders */
--border-radius-sm: 0.125rem;
--border-radius-md: 0.375rem;
--border-radius-lg: 0.5rem;

/* Shadows */
--shadow-sm: subtle shadow;
--shadow-md: medium shadow;
--shadow-lg: large shadow;
```

---

## Testing Guidelines

### Visual Testing

1. **Theme Switching**: Test all components in light/dark modes
2. **Brand Switching**: Verify brand color consistency
3. **Responsive Behavior**: Test across different screen sizes
4. **Hover States**: Verify interactive feedback

### Accessibility Testing

1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Reader**: Test with screen reader software
3. **Color Contrast**: Verify WCAG AA compliance
4. **Focus Indicators**: Ensure visible focus states

### Integration Testing

```tsx
// Test token switching
const { setBrand } = useBrand()
setBrand('salon')
// Verify all components update colors

// Test theme switching
const { setTheme } = useTheme()
setTheme('dark')
// Verify semantic colors adapt
```

---

## Best Practices

### Component Usage

1. **Consistent Sizing**: Use the same size variants across related components
2. **Semantic Variants**: Choose variants based on semantic meaning, not appearance
3. **Accessibility First**: Always include proper labels and ARIA attributes
4. **Token Binding**: Never use hardcoded colors or spacing

### Performance

1. **CSS Variables**: Leverage CSS variables for runtime theme changes
2. **Bundle Size**: Use tree-shaking with selective imports
3. **Rendering**: Minimize re-renders with proper prop design

### Development

1. **TypeScript**: Always use TypeScript for variant prop safety
2. **Testing**: Test all variant combinations
3. **Documentation**: Document custom usage patterns
4. **Consistency**: Follow established naming conventions

---

## Troubleshooting

### Common Issues

1. **Missing Tokens**: Ensure TokensProvider is in component tree
2. **CSS Variables Not Applying**: Check token generation and CSS inclusion
3. **TypeScript Errors**: Verify variant prop types match interface
4. **Theme Not Switching**: Confirm next-themes configuration

### Debug Commands

```bash
# Check token generation
npm run tokens:build

# Validate component structure
npm run lint

# Test accessibility
npm run a11y:test
```

---

*This guide serves as the comprehensive reference for HT-006 Phase 2 elements, enabling confident development with token-driven, accessible UI components.*
