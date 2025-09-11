# HT-006 Design Tokens Guide

**HT-006 Phase 1 Deliverable**  
*DTCG Token System Implementation & Brand Override Architecture*

This guide documents the comprehensive token-driven design system implemented in HT-006 Phase 1, providing step-by-step instructions for brand addition, token management, and system integration.

## Overview

The HT-006 token system implements DTCG (Design Tokens Community Group) compliant tokens with a base + brand override architecture, enabling instant brand switching across multiple verticals while maintaining design consistency and type safety.

### Key Features

- **DTCG Compliance**: Standard-compliant token format with `$type` and `$value` properties
- **Base + Override Architecture**: Foundation tokens with brand-specific customizations
- **Instant Brand Switching**: Seamless theme and brand transitions via CSS variables
- **Type Safety**: Full TypeScript support with processed token interfaces
- **CSS Variable Automation**: Automatic generation and application of CSS custom properties
- **next-themes Integration**: Persistent light/dark mode with brand switching

## File Structure

```
/tokens/
├── base.json                 # Foundation tokens (DTCG format)
├── brands/
│   ├── default.json         # Default tech brand
│   └── salon.json           # Beauty & wellness brand
/lib/tokens/
├── processor.ts             # Token processing and CSS generation
/components-sandbox/providers/
├── TokensProvider.tsx       # React context with token management
/components-sandbox/ui/
├── ModeToggle.tsx          # Light/dark mode toggle
└── BrandToggle.tsx         # Brand switching component
```

## Token Categories

### 1. Base Tokens (`/tokens/base.json`)

Foundation tokens that remain consistent across all brands:

#### Colors
- **Neutral Scale**: 50-950 grayscale for consistent foundations
- **Brand Scale**: 50-950 brand color scale (overridden per brand)
- **Semantic Colors**: Success, warning, danger with 50/500/900 variants

#### Typography
- **Font Sizes**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
- **Font Weights**: light, normal, medium, semibold, bold, extrabold
- **Line Heights**: none, tight, snug, normal, relaxed, loose

#### Spacing
- **Component Spacing**: xs, sm, md, lg, xl, 2xl, 3xl, 4xl
- **Section Spacing**: section, section-sm, section-lg, section-xl

#### Other Tokens
- **Border Radius**: none, sm, md, lg, xl, 2xl, full
- **Shadows**: sm, md, lg, xl with DTCG shadow format

### 2. Brand Override Tokens (`/tokens/brands/`)

Brand-specific customizations that override base tokens:

#### Brand Colors
- `primary`: Main brand color
- `primaryHover`: Hover state for primary
- `accent`: Accent/secondary brand color
- `accentSubtle`: Light accent background

#### Semantic Mappings
- **Light Mode**: Background, foreground, muted, borders, components
- **Dark Mode**: Dark-optimized semantic color assignments

#### Typography Overrides
- `headingFont`: Brand-specific heading typography
- `bodyFont`: Brand-specific body text typography

## Usage Guide

### 1. Basic Token Usage

```tsx
import { useTokens, useThemeTokens } from '@/components-sandbox/providers/TokensProvider'

function MyComponent() {
  const { brand, setBrand } = useTokens()
  const { tokens, mode } = useThemeTokens()
  
  return (
    <div style={{ 
      backgroundColor: tokens.colors['semantic-background'],
      color: tokens.colors['semantic-foreground'],
      padding: tokens.spacing['spacing-md']
    }}>
      Current brand: {brand}, Mode: {mode}
    </div>
  )
}
```

### 2. CSS Variable Usage

All tokens are automatically converted to CSS variables:

```css
.my-component {
  background-color: var(--semantic-background);
  color: var(--semantic-foreground);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}
```

### 3. Tailwind Integration

Tokens integrate with existing Tailwind classes through CSS variables:

```tsx
<div className="bg-background text-foreground p-4 rounded-lg shadow-md">
  Themed content
</div>
```

## Adding New Brands

### Step 1: Create Brand Token File

Create `/tokens/brands/[brand-name].json`:

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "name": "My Brand",
  "description": "Brand description",
  "brand": {
    "colors": {
      "primary": {
        "$type": "color",
        "$value": "#your-brand-color"
      },
      "primaryHover": {
        "$type": "color", 
        "$value": "#hover-variant"
      },
      "accent": {
        "$type": "color",
        "$value": "#accent-color"
      },
      "accentSubtle": {
        "$type": "color",
        "$value": "#light-accent"
      }
    },
    "typography": {
      "headingFont": {
        "$type": "fontFamily",
        "$value": ["Brand Font", "fallback", "sans-serif"]
      },
      "bodyFont": {
        "$type": "fontFamily",
        "$value": ["Brand Font", "fallback", "sans-serif"]
      }
    }
  },
  "semantic": {
    "light": {
      "background": {
        "$type": "color",
        "$value": "{color.neutral.50}"
      },
      // ... full semantic mapping
    },
    "dark": {
      // ... dark mode semantic mapping
    }
  }
}
```

### Step 2: Update Type Definitions

Add new brand to the `Brand` type in `/lib/tokens/processor.ts`:

```typescript
export type Brand = 'default' | 'salon' | 'your-new-brand'
```

### Step 3: Import Brand Tokens

Update `/lib/tokens/processor.ts` imports:

```typescript
import yourBrand from '../../tokens/brands/your-brand.json'

const brands = {
  default: defaultBrand,
  salon: salonBrand,
  'your-brand': yourBrand
}
```

### Step 4: Update Brand Labels

Add display labels in `/components-sandbox/ui/BrandToggle.tsx`:

```typescript
const brandLabels: Record<Brand, string> = {
  default: 'Tech',
  salon: 'Salon',
  'your-brand': 'Your Brand'
}

const brandDescriptions: Record<Brand, string> = {
  default: 'Modern tech aesthetic',
  salon: 'Beauty & wellness theme',
  'your-brand': 'Your brand description'
}
```

### Step 5: Test Brand Switching

1. Navigate to `/sandbox/tokens`
2. Use brand toggle to switch between brands
3. Verify colors, typography, and spacing adapt correctly
4. Test both light and dark modes

## Token Reference Resolution

The system supports DTCG token references using `{token.path}` syntax:

```json
{
  "primary": {
    "$type": "color",
    "$value": "{color.brand.600}"
  }
}
```

References are automatically resolved during processing, enabling:
- Brand inheritance from base tokens
- Semantic color mappings
- Consistent spacing relationships

## CSS Variable Generation

Tokens are automatically converted to CSS variables with consistent naming:

| Token Path | CSS Variable | Example |
|------------|--------------|---------|
| `color.neutral.500` | `--color-neutral-500` | `#9aa0a6` |
| `spacing.md` | `--spacing-md` | `1rem` |
| `borderRadius.lg` | `--border-radius-lg` | `0.5rem` |
| `semantic.background` | `--semantic-background` | `#ffffff` |

## Development Workflow

### 1. Token Development

1. Modify tokens in JSON files
2. Tokens automatically reload in development
3. Use `/sandbox/tokens` page to preview changes
4. Test across brands and themes

### 2. Component Integration

1. Use `useTokens()` hook for dynamic values
2. Reference CSS variables in styles
3. Ensure components work across all brands
4. Test responsive behavior

### 3. Production Deployment

1. Tokens compile to static CSS variables
2. Brand switching updates CSS custom properties
3. Performance optimized with minimal runtime overhead
4. Fallbacks provided for missing tokens

## Best Practices

### Token Naming

- Use semantic names for component-level tokens
- Maintain consistent scale relationships
- Follow DTCG naming conventions
- Document token purposes and usage

### Brand Development

- Start with color and typography overrides
- Ensure sufficient contrast ratios
- Test accessibility across all themes
- Maintain visual hierarchy

### Component Integration

- Prefer CSS variables over direct token access
- Use semantic tokens for component styling
- Provide fallbacks for missing tokens
- Test token switching transitions

## Migration from Existing Tokens

### Phase 1: Shadow Integration

Current design tokens in `/lib/design-tokens/` continue to work alongside the new system. Components can gradually adopt the new token system:

```tsx
// Old approach (still works)
import { useSemanticColors } from '@/lib/design-tokens/provider'

// New approach (recommended)
import { useThemeTokens } from '@/components-sandbox/providers/TokensProvider'
```

### Phase 2: Component Migration

1. Update components to use CSS variables
2. Replace hardcoded values with token references
3. Test brand switching functionality
4. Migrate to sandbox provider

### Phase 3: System Unification

Future phases will unify token systems and migrate production components to the new architecture.

## Troubleshooting

### Token Not Updating

1. Check JSON syntax in token files
2. Verify token reference paths
3. Clear browser cache
4. Check console for parsing errors

### Brand Not Switching

1. Verify brand import in processor
2. Check type definitions
3. Ensure CSS variables are applied
4. Test TokensProvider integration

### CSS Variables Missing

1. Check processor token filtering
2. Verify CSS variable generation
3. Ensure proper provider setup
4. Check token reference resolution

## Future Enhancements

### Phase 2: Component Elements

- Token-driven UI elements (Button, Input, Card)
- CVA variant system integration
- Accessibility token validation

### Phase 3: Block Architecture

- JSON-driven page composition
- Block-level token customization
- Content schema validation

### Phase 10: Production Templates

- Client brand pack templates
- Automated brand generation
- Migration tooling

---

*This guide serves as the comprehensive reference for HT-006's token-driven design system, enabling confident development and seamless brand switching across multiple verticals.*
