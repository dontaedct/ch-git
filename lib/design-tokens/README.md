# Design Tokens System

A comprehensive token-driven theming system that provides consistent design language across the application. Follows Apple/Linear/Figma design principles with neutral palettes and a single accent color approach.

## Overview

The design tokens system consists of:
- **Semantic colors** that adapt to light/dark themes
- **Neutral and accent color scales** for brandless theming
- **Typography tokens** for consistent text styling
- **Spacing and layout tokens** for uniform spacing
- **Component-specific tokens** for consistent component styling

## Quick Start

```tsx
import { TokensProvider, useTokens, useSemanticColors } from '@/lib/design-tokens';

// Wrap your app with TokensProvider (already done in layout.tsx)
function App() {
  return (
    <TokensProvider>
      <YourContent />
    </TokensProvider>
  );
}

// Use tokens in components
function MyComponent() {
  const { tokens } = useTokens();
  const colors = useSemanticColors();
  
  return (
    <div style={{ color: colors.primary, padding: tokens.spacing.md }}>
      Themed content
    </div>
  );
}
```

## Token Categories

### 1. Semantic Colors

Theme-aware colors that automatically adapt to light/dark mode:

| Token | Usage | Tailwind Class |
|-------|-------|----------------|
| `primary` | Primary actions, links | `bg-primary`, `text-primary` |
| `secondary` | Secondary backgrounds | `bg-secondary`, `text-secondary` |
| `background` | Main background color | `bg-background` |
| `foreground` | Main text color | `text-foreground` |
| `muted` | Subdued backgrounds | `bg-muted`, `text-muted` |
| `accent` | Accent backgrounds | `bg-accent`, `text-accent` |
| `border` | Border color | `border-border` |
| `destructive` | Error states | `bg-destructive`, `text-destructive` |
| `success` | Success states | `bg-success`, `text-success` |
| `warning` | Warning states | `bg-warning`, `text-warning` |

### 2. Color Scales

#### Neutral Scale (Brandless Gray)
```css
--color-neutral-50   /* Lightest gray */
--color-neutral-100
--color-neutral-200
--color-neutral-300
--color-neutral-400
--color-neutral-500  /* Mid gray */
--color-neutral-600
--color-neutral-700
--color-neutral-800
--color-neutral-900
--color-neutral-950  /* Darkest gray */
```

Tailwind: `bg-neutral-500`, `text-neutral-700`, etc.

#### Accent Scale (Blue)
```css
--color-accent-50    /* Lightest blue */
--color-accent-100
--color-accent-200
--color-accent-300
--color-accent-400
--color-accent-500   /* Mid blue */
--color-accent-600
--color-accent-700
--color-accent-800
--color-accent-900
--color-accent-950   /* Darkest blue */
```

Tailwind: `bg-accent-scale-500`, `text-accent-scale-700`, etc.

### 3. Typography

| Token | CSS Variable | Tailwind Class |
|-------|-------------|----------------|
| `xs` | `--font-size-xs` | `text-token-xs` |
| `sm` | `--font-size-sm` | `text-token-sm` |
| `base` | `--font-size-base` | `text-token-base` |
| `lg` | `--font-size-lg` | `text-token-lg` |
| `xl` | `--font-size-xl` | `text-token-xl` |
| `2xl` | `--font-size-2xl` | `text-token-2xl` |
| `3xl` | `--font-size-3xl` | `text-token-3xl` |
| `4xl` | `--font-size-4xl` | `text-token-4xl` |

**Font Weights:**
- `normal` (400): `font-token-normal`
- `medium` (500): `font-token-medium`
- `semibold` (600): `font-token-semibold`
- `bold` (700): `font-token-bold`

### 4. Spacing

| Token | Value | CSS Variable | Tailwind Class |
|-------|-------|-------------|----------------|
| `xs` | 0.25rem | `--spacing-xs` | `p-token-xs`, `m-token-xs` |
| `sm` | 0.5rem | `--spacing-sm` | `p-token-sm`, `m-token-sm` |
| `md` | 1rem | `--spacing-md` | `p-token-md`, `m-token-md` |
| `lg` | 1.5rem | `--spacing-lg` | `p-token-lg`, `m-token-lg` |
| `xl` | 2rem | `--spacing-xl` | `p-token-xl`, `m-token-xl` |
| `2xl` | 3rem | `--spacing-2xl` | `p-token-2xl`, `m-token-2xl` |
| `3xl` | 4rem | `--spacing-3xl` | `p-token-3xl`, `m-token-3xl` |
| `4xl` | 6rem | `--spacing-4xl` | `p-token-4xl`, `m-token-4xl` |

### 5. Border Radius

| Token | Value | CSS Variable | Tailwind Class |
|-------|-------|-------------|----------------|
| `sm` | 0.125rem | `--border-radius-sm` | `rounded-token-sm` |
| `md` | 0.375rem | `--border-radius-md` | `rounded-token-md` |
| `lg` | 0.5rem | `--border-radius-lg` | `rounded-token-lg` |
| `xl` | 0.75rem | `--border-radius-xl` | `rounded-token-xl` |
| `2xl` | 1rem | `--border-radius-2xl` | `rounded-token-2xl` |
| `full` | 9999px | `--border-radius-full` | `rounded-token-full` |

### 6. Shadows

| Token | CSS Variable | Tailwind Class |
|-------|-------------|----------------|
| `xs` | `--shadow-xs` | `shadow-token-xs` |
| `sm` | `--shadow-sm` | `shadow-token-sm` |
| `md` | `--shadow-md` | `shadow-token-md` |
| `lg` | `--shadow-lg` | `shadow-token-lg` |
| `xl` | `--shadow-xl` | `shadow-token-xl` |

## Component Token Mappings

### Buttons

| Property | CSS Variable | Usage |
|----------|-------------|--------|
| Height (sm) | `--button-height-sm` | Small buttons |
| Height (md) | `--button-height-md` | Default buttons |
| Height (lg) | `--button-height-lg` | Large buttons |
| Padding (sm) | `--button-padding-sm` | Small button padding |
| Padding (md) | `--button-padding-md` | Default button padding |
| Padding (lg) | `--button-padding-lg` | Large button padding |
| Border radius | `--button-border-radius` | Button corner radius |

**Example:**
```tsx
<button className="h-[var(--button-height-md)] px-[var(--spacing-md)] rounded-[var(--button-border-radius)]">
  Token-styled button
</button>
```

### Cards

| Property | CSS Variable | Usage |
|----------|-------------|--------|
| Border radius | `--card-border-radius` | Card corner radius |
| Padding | `--card-padding` | Card inner spacing |
| Shadow | `--card-shadow` | Card drop shadow |
| Border width | `--card-border-width` | Card border thickness |

**Example:**
```tsx
<div className="p-[var(--card-padding)] rounded-[var(--card-border-radius)] shadow-[var(--card-shadow)]">
  Token-styled card
</div>
```

### Chips/Badges

| Property | CSS Variable | Usage |
|----------|-------------|--------|
| Height | `--chip-height` | Chip height |
| Padding | `--chip-padding` | Chip horizontal padding |
| Border radius | `--chip-border-radius` | Chip corner radius |
| Font size | `--chip-font-size` | Chip text size |

### Tabs

| Property | CSS Variable | Usage |
|----------|-------------|--------|
| Height | `--tabs-height` | Tab container height |
| Border radius | `--tabs-border-radius` | Tab corner radius |
| Padding | `--tabs-padding` | Tab inner padding |

### Stepper

| Property | CSS Variable | Usage |
|----------|-------------|--------|
| Size | `--stepper-size` | Step circle size |
| Border width | `--stepper-border-width` | Step circle border |
| Connector height | `--stepper-connector-height` | Line between steps |

### Toast

| Property | CSS Variable | Usage |
|----------|-------------|--------|
| Border radius | `--toast-border-radius` | Toast corner radius |
| Padding | `--toast-padding` | Toast inner spacing |
| Shadow | `--toast-shadow` | Toast drop shadow |
| Max width | `--toast-max-width` | Toast maximum width |

## Usage Patterns

### 1. Tailwind CSS Classes (Recommended)

```tsx
<div className="bg-primary text-primary-foreground p-token-md rounded-token-lg">
  Semantic colors with token spacing and radius
</div>
```

### 2. CSS Variables

```tsx
<div style={{ 
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-primary-foreground)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--border-radius-lg)'
}}>
  Direct CSS variable usage
</div>
```

### 3. React Hooks

```tsx
function ThemedComponent() {
  const { tokens } = useTokens();
  const colors = useSemanticColors();
  
  return (
    <div style={{ 
      color: colors.primary,
      padding: tokens.spacing.md,
      borderRadius: tokens.borderRadius.lg
    }}>
      Programmatic token access
    </div>
  );
}
```

### 4. Component Token Classes

```tsx
<button className="h-[var(--button-height-md)] text-[var(--button-font-size-md)]">
  Component-specific tokens
</button>
```

## Customization

### Custom Token Values

```tsx
import { TokensProvider, designTokens } from '@/lib/design-tokens';

const customTokens = {
  ...designTokens,
  accent: {
    ...designTokens.accent,
    500: '#10b981', // Custom accent color
  }
};

function App() {
  return (
    <TokensProvider customTokens={customTokens}>
      <YourApp />
    </TokensProvider>
  );
}
```

### Adding New Tokens

1. Update `tokens.ts` with new token definitions
2. Update `provider.tsx` to set CSS variables
3. Update `tailwind.config.js` to expose Tailwind classes
4. Update this documentation

## Best Practices

1. **Prefer semantic colors** over specific color values
2. **Use Tailwind classes** when possible for better performance
3. **Stick to the token system** - avoid hardcoded values
4. **Test both light and dark modes** when using semantic colors
5. **Use component tokens** for consistent component styling
6. **Document any custom token additions** for team clarity

## Development

To preview all tokens and their usage, visit: `/tokens-preview`

This hidden route shows:
- All color scales and semantic colors
- Typography examples
- Spacing demonstrations
- Component usage examples
- Code examples for different usage patterns

## Integration Notes

- Tokens are automatically applied when `TokensProvider` wraps the app
- CSS variables are updated automatically on theme changes
- All tokens work with both light and dark themes
- The system is designed to be brandless by default
- Tailwind classes are prefixed with `token-` to avoid conflicts