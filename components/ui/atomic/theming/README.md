# Simple Client Theming System

**HT-022.2.2: Simple Client Theming System Implementation**

## Overview

A lightweight, flexible theming system designed for agency micro-app development with simple client customization and basic white-labeling capabilities.

## Features

✅ **Simple Theme Switching** - Runtime theme changes <100ms
✅ **Basic Design Token Integration** - CSS custom properties
✅ **Client Brand Customization** - Logo, colors, typography
✅ **White-labeling Support** - Complete brand transformation
✅ **Theme Validation** - Quality scoring and error detection
✅ **Persistence** - Local storage theme saving
✅ **Predefined Themes** - 4 professional theme options

## Quick Start

### 1. Setup Theme Provider

```tsx
import { SimpleThemeProvider } from '@/components/ui/atomic/theming';

function App() {
  return (
    <SimpleThemeProvider defaultThemeId="default">
      <YourApp />
    </SimpleThemeProvider>
  );
}
```

### 2. Add Theme Switcher

```tsx
import { ThemeSwitcher } from '@/components/ui/atomic/theming';

function SettingsPage() {
  return (
    <div>
      <h2>Theme Settings</h2>
      <ThemeSwitcher showCustomization={true} />
    </div>
  );
}
```

### 3. Use Theme in Components

```tsx
import { useSimpleTheme } from '@/components/ui/atomic/theming';

function CustomComponent() {
  const { currentTheme } = useSimpleTheme();

  return (
    <div style={{
      backgroundColor: currentTheme.colors.primary,
      fontFamily: currentTheme.typography.fontFamily
    }}>
      Themed Content
    </div>
  );
}
```

## Predefined Themes

### Agency Default
- **Colors**: Neutral grays with blue accent
- **Use Case**: General agency work
- **Target**: Professional services

### Corporate Blue
- **Colors**: Professional blue palette
- **Use Case**: Enterprise clients
- **Target**: Corporate websites

### Startup Green
- **Colors**: Growth-focused green theme
- **Use Case**: Startup clients
- **Target**: Tech companies

### Creative Purple
- **Colors**: Creative purple aesthetic
- **Use Case**: Creative agencies
- **Target**: Design-focused clients

## Brand Customization

### Basic Customization
```tsx
import { BrandCustomizer } from '@/components/ui/atomic/theming';

function BrandingPage() {
  return (
    <BrandCustomizer
      onSave={(theme) => console.log('New theme saved:', theme)}
    />
  );
}
```

### Programmatic Theme Creation
```tsx
import { createSimpleTheme } from '@/components/ui/atomic/theming';

const customTheme = createSimpleTheme(
  'client-brand',
  'Client Brand Name',
  '#ff6b35', // Primary color
  'CB',      // Logo initials
  'Roboto, sans-serif' // Font family
);
```

## Theme Validation

### Validate Theme Quality
```tsx
import { validateTheme, getThemeQuality } from '@/components/ui/atomic/theming';

const result = validateTheme(customTheme);
const quality = getThemeQuality(result.score);

console.log(`Theme quality: ${quality.rating} (${result.score}/100)`);
console.log(`Issues: ${result.errors.length} errors, ${result.warnings.length} warnings`);
```

### Validation Rules
- **Colors**: Valid hex/hsl format, sufficient contrast
- **Logo**: Alt text required, initials ≤2 characters
- **Typography**: Font family with fallbacks
- **Structure**: All required fields present

## CSS Integration

### Import Theme Styles
```css
@import '@/components/ui/atomic/theming/theme.css';
```

### Use CSS Variables
```css
.custom-component {
  background-color: var(--primary);
  color: var(--foreground);
  font-family: var(--font-family-primary);
  transition: var(--theme-transition);
}
```

### Theme-Aware Styling
```css
[data-agency-theme="corporate"] .special-element {
  border-color: var(--primary);
}

[data-agency-theme="startup"] .special-element {
  box-shadow: 0 4px 12px var(--primary);
}
```

## White-labeling Workflow

### 1. Client Onboarding
```tsx
// Collect client brand information
const clientBrand = {
  name: 'Client Company',
  primaryColor: '#ff6b35',
  logoUrl: 'https://client.com/logo.png',
  fontFamily: 'Client Font, sans-serif'
};
```

### 2. Theme Generation
```tsx
const clientTheme = createSimpleTheme(
  `client-${clientId}`,
  clientBrand.name,
  clientBrand.primaryColor,
  clientBrand.name.substring(0, 2).toUpperCase(),
  clientBrand.fontFamily
);

// Add logo if provided
if (clientBrand.logoUrl) {
  clientTheme.logo.src = clientBrand.logoUrl;
}
```

### 3. Theme Application
```tsx
const { addCustomTheme, switchTheme } = useSimpleTheme();
addCustomTheme(clientTheme);
switchTheme(clientTheme.id);
```

## Performance Targets

- ✅ **Theme Switch Time**: <100ms
- ✅ **Theme Validation**: <50ms
- ✅ **Storage Persistence**: <10ms
- ✅ **CSS Variable Update**: <16ms (1 frame)

## API Reference

### SimpleThemeProvider
```tsx
interface SimpleThemeProviderProps {
  children: React.ReactNode;
  defaultThemeId?: string;
  customThemes?: SimpleClientTheme[];
}
```

### useSimpleTheme Hook
```tsx
interface SimpleThemeContextValue {
  currentTheme: SimpleClientTheme;
  availableThemes: SimpleClientTheme[];
  switchTheme: (themeId: string) => void;
  addCustomTheme: (theme: SimpleClientTheme) => void;
  updateTheme: (theme: Partial<SimpleClientTheme>) => void;
  resetTheme: () => void;
  isCustomTheme: boolean;
}
```

### Theme Structure
```tsx
interface SimpleClientTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  logo: {
    src?: string;
    alt: string;
    initials: string;
  };
  typography: {
    fontFamily: string;
    headingFamily?: string;
  };
  createdAt?: Date;
  isCustom?: boolean;
}
```

## Client Customization Time

- **Basic Color Change**: ~5 minutes
- **Logo Upload**: ~10 minutes
- **Typography Selection**: ~5 minutes
- **Complete Rebrand**: ~30 minutes
- **Quality Validation**: ~5 minutes

**Total Client Customization**: ≤60 minutes (target: ≤120 minutes)

## Next Steps

1. **HT-022.2.3**: Basic Accessibility & Performance Optimization
2. **HT-022.2.4**: Basic Component Testing & Documentation
3. **HT-022.3.1**: Basic Module Registry & Management System

## Support

For advanced customization or technical support, refer to the agency component toolkit documentation.