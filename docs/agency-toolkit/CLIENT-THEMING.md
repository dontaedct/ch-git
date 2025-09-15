# Agency Toolkit - Client Theming Patterns

**Version:** 1.0.0
**Last Updated:** September 14, 2025
**HT-021.4.4:** Agency Toolkit Documentation & Solo Developer Experience

## Overview

Client theming is a core feature of the agency toolkit that enables rapid customization of micro-apps with client-specific branding, colors, typography, and styling while maintaining consistency and performance.

## Core Theming System

### 🎨 Theme Structure

```typescript
interface ClientThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    unit: number; // Base spacing unit in pixels
    scale: number[]; // Spacing scale multipliers
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}
```

### 🏗️ Theme Application Flow

```
Client Request → Security Validation → Theme Resolution → CSS Generation → Component Styling → Response
```

## Basic Theming Patterns

### 1. Default Theme Setup

```typescript
// Default theme for rapid deployment
export const DEFAULT_THEME: ClientThemeConfig = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#7c3aed',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f8fafc',
    border: '#e2e8f0',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    unit: 4,
    scale: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64],
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
};
```

### 2. Client-Specific Theme Creation

```typescript
// Create branded theme for specific client
function createClientTheme(brandConfig: ClientBrandConfig): ClientThemeConfig {
  return {
    ...DEFAULT_THEME,
    colors: {
      primary: brandConfig.primaryColor || DEFAULT_THEME.colors.primary,
      secondary: brandConfig.secondaryColor || DEFAULT_THEME.colors.secondary,
      accent: brandConfig.accentColor || DEFAULT_THEME.colors.accent,
      background: brandConfig.backgroundColor || DEFAULT_THEME.colors.background,
      foreground: brandConfig.textColor || DEFAULT_THEME.colors.foreground,
      muted: brandConfig.mutedColor || DEFAULT_THEME.colors.muted,
      border: brandConfig.borderColor || DEFAULT_THEME.colors.border,
    },
    typography: {
      ...DEFAULT_THEME.typography,
      fontFamily: brandConfig.fontFamily || DEFAULT_THEME.typography.fontFamily,
    }
  };
}

// Example: Tech company theme
const TECH_COMPANY_THEME = createClientTheme({
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#06b6d4',
  fontFamily: 'Inter, system-ui, sans-serif'
});

// Example: Beauty brand theme
const BEAUTY_BRAND_THEME = createClientTheme({
  primaryColor: '#d97706',
  secondaryColor: '#a3a3a3',
  accentColor: '#f59e0b',
  backgroundColor: '#fef7f0',
  fontFamily: 'Playfair Display, serif'
});
```

## Theme Integration Patterns

### 🎯 React Hook Integration

```typescript
// Using brand-aware styling hook
function ClientComponent() {
  const { getBrandColor, getBrandClasses, cssProperties } = useBrandStyling();

  return (
    <div
      className={getBrandClasses('rounded-lg p-4')}
      style={{
        backgroundColor: getBrandColor('primary'),
        color: getBrandColor('background'),
        ...cssProperties
      }}
    >
      <h1 style={{ color: getBrandColor('foreground') }}>
        Client Dashboard
      </h1>
    </div>
  );
}
```

### 🎨 CSS Variable Generation

```typescript
// Automatic CSS variable generation
function generateThemeCSS(theme: ClientThemeConfig): string {
  const css: string[] = [':root {'];

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    css.push(`  --color-${key}: ${value};`);
  });

  // Typography
  css.push(`  --font-family: ${theme.typography.fontFamily};`);
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    css.push(`  --font-size-${key}: ${value};`);
  });

  // Spacing
  theme.spacing.scale.forEach((value, index) => {
    css.push(`  --spacing-${index}: ${theme.spacing.unit * value}px;`);
  });

  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    css.push(`  --border-radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    css.push(`  --shadow-${key}: ${value};`);
  });

  css.push('}');
  return css.join('\n');
}
```

### 🔄 Dynamic Theme Switching

```typescript
// Runtime theme switching
function useThemeSwitching() {
  const applyTheme = useCallback((theme: ClientThemeConfig) => {
    const root = document.documentElement;

    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-family', theme.typography.fontFamily);

    // Apply spacing
    theme.spacing.scale.forEach((value, index) => {
      root.style.setProperty(`--spacing-${index}`, `${theme.spacing.unit * value}px`);
    });

    // Apply border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    // Apply shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }, []);

  return { applyTheme };
}

// Theme switching component
function ThemeSelector({ availableThemes, currentTheme, onThemeChange }) {
  return (
    <select
      value={currentTheme}
      onChange={(e) => onThemeChange(e.target.value)}
    >
      {availableThemes.map((theme) => (
        <option key={theme.id} value={theme.id}>
          {theme.name}
        </option>
      ))}
    </select>
  );
}
```

## Common Theming Patterns

### 1. Brand Color Variations

```typescript
// Generate color variations automatically
function generateColorVariations(baseColor: string) {
  // Using color manipulation library (e.g., polished)
  return {
    50: lighten(0.4, baseColor),
    100: lighten(0.3, baseColor),
    200: lighten(0.2, baseColor),
    300: lighten(0.1, baseColor),
    400: lighten(0.05, baseColor),
    500: baseColor, // Base color
    600: darken(0.05, baseColor),
    700: darken(0.1, baseColor),
    800: darken(0.2, baseColor),
    900: darken(0.3, baseColor),
  };
}

// Use in theme
const CLIENT_THEME_WITH_VARIATIONS = {
  ...DEFAULT_THEME,
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#2563eb',
    primaryVariations: generateColorVariations('#2563eb')
  }
};
```

### 2. Dark/Light Mode Support

```typescript
// Theme with dark mode support
interface ExtendedThemeConfig extends ClientThemeConfig {
  mode: 'light' | 'dark';
  darkColors?: Partial<ClientThemeConfig['colors']>;
}

function createDualModeTheme(baseTheme: ClientThemeConfig): ExtendedThemeConfig {
  return {
    ...baseTheme,
    mode: 'light',
    darkColors: {
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#1e293b',
      border: '#334155',
    }
  };
}

// Dark mode hook
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const { applyTheme } = useThemeSwitching();

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => {
      const newMode = !prev;
      const theme = newMode ? DARK_THEME : LIGHT_THEME;
      applyTheme(theme);
      return newMode;
    });
  }, [applyTheme]);

  return { isDark, toggleDarkMode };
}
```

### 3. Component-Specific Theming

```typescript
// Component with theme-aware props
interface ThemedButtonProps {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ variant = 'primary', size = 'md', children, ...props }, ref) => {
    const { getBrandColor, getBrandClasses } = useBrandStyling();

    const baseClasses = 'rounded font-medium focus:outline-none focus:ring-2';
    const variantClasses = {
      primary: 'text-white focus:ring-opacity-50',
      secondary: 'border focus:ring-opacity-50',
      accent: 'text-white focus:ring-opacity-50'
    };
    const sizeClasses = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const combinedClasses = getBrandClasses(
      `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`
    );

    const variantStyles = {
      primary: {
        backgroundColor: getBrandColor('primary'),
        borderColor: getBrandColor('primary')
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: getBrandColor('border'),
        color: getBrandColor('foreground')
      },
      accent: {
        backgroundColor: getBrandColor('accent'),
        borderColor: getBrandColor('accent')
      }
    };

    return (
      <button
        ref={ref}
        className={combinedClasses}
        style={variantStyles[variant]}
        {...props}
      >
        {children}
      </button>
    );
  }
);
```

## Advanced Theming Patterns

### 1. Theme Inheritance

```typescript
// Base theme with inheritance
class ThemeInheritance {
  static extendTheme(
    baseTheme: ClientThemeConfig,
    overrides: Partial<ClientThemeConfig>
  ): ClientThemeConfig {
    return {
      colors: { ...baseTheme.colors, ...overrides.colors },
      typography: {
        ...baseTheme.typography,
        ...overrides.typography,
        fontSize: { ...baseTheme.typography.fontSize, ...overrides.typography?.fontSize },
        fontWeight: { ...baseTheme.typography.fontWeight, ...overrides.typography?.fontWeight }
      },
      spacing: { ...baseTheme.spacing, ...overrides.spacing },
      borderRadius: { ...baseTheme.borderRadius, ...overrides.borderRadius },
      shadows: { ...baseTheme.shadows, ...overrides.shadows }
    };
  }

  static createBrandVariation(
    baseTheme: ClientThemeConfig,
    brandName: string,
    brandOverrides: Partial<ClientThemeConfig>
  ): ClientThemeConfig & { brandName: string } {
    return {
      ...this.extendTheme(baseTheme, brandOverrides),
      brandName
    };
  }
}

// Usage
const CORPORATE_BASE = ThemeInheritance.extendTheme(DEFAULT_THEME, {
  colors: {
    primary: '#1f2937',
    secondary: '#6b7280'
  },
  typography: {
    fontFamily: 'Inter, sans-serif'
  }
});

const ACME_CORP_THEME = ThemeInheritance.createBrandVariation(
  CORPORATE_BASE,
  'Acme Corporation',
  {
    colors: {
      primary: '#dc2626',
      accent: '#f59e0b'
    }
  }
);
```

### 2. Responsive Theming

```typescript
// Responsive theme configuration
interface ResponsiveThemeConfig extends ClientThemeConfig {
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  responsive: {
    typography: {
      [key in keyof ClientThemeConfig['typography']['fontSize']]: {
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
      };
    };
    spacing: {
      [key: string]: {
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
      };
    };
  };
}

// Generate responsive CSS
function generateResponsiveCSS(theme: ResponsiveThemeConfig): string {
  let css = generateThemeCSS(theme);

  // Add responsive typography
  Object.entries(theme.breakpoints).forEach(([breakpoint, size]) => {
    css += `\n@media (min-width: ${size}) {`;
    css += '\n  :root {';

    Object.entries(theme.responsive.typography).forEach(([key, responsive]) => {
      if (responsive[breakpoint as keyof typeof responsive]) {
        css += `\n    --font-size-${key}: ${responsive[breakpoint as keyof typeof responsive]};`;
      }
    });

    css += '\n  }';
    css += '\n}';
  });

  return css;
}
```

### 3. Theme Validation

```typescript
// Theme validation utilities
class ThemeValidator {
  static validateColors(colors: ClientThemeConfig['colors']): string[] {
    const errors: string[] = [];

    Object.entries(colors).forEach(([key, value]) => {
      if (!this.isValidColor(value)) {
        errors.push(`Invalid color value for ${key}: ${value}`);
      }
    });

    // Check contrast ratios
    const contrastRatio = this.calculateContrastRatio(colors.foreground, colors.background);
    if (contrastRatio < 4.5) {
      errors.push(`Insufficient contrast ratio: ${contrastRatio.toFixed(2)} (minimum: 4.5)`);
    }

    return errors;
  }

  static validateTypography(typography: ClientThemeConfig['typography']): string[] {
    const errors: string[] = [];

    if (!typography.fontFamily) {
      errors.push('Font family is required');
    }

    // Validate font sizes
    Object.entries(typography.fontSize).forEach(([key, value]) => {
      if (!this.isValidSize(value)) {
        errors.push(`Invalid font size for ${key}: ${value}`);
      }
    });

    return errors;
  }

  static isValidColor(color: string): boolean {
    // Basic color validation (hex, rgb, hsl, named colors)
    const colorRegex = /^(#[0-9a-f]{6}|#[0-9a-f]{3}|rgb\([^)]+\)|hsl\([^)]+\)|[a-z]+)$/i;
    return colorRegex.test(color);
  }

  static isValidSize(size: string): boolean {
    // Validate CSS size values
    const sizeRegex = /^(\d+(\.\d+)?(px|em|rem|%|vh|vw)|\d+)$/;
    return sizeRegex.test(size);
  }

  static calculateContrastRatio(foreground: string, background: string): number {
    // Simplified contrast ratio calculation
    // In production, use a proper color library like chroma.js
    return 4.5; // Placeholder
  }

  static validateTheme(theme: ClientThemeConfig): { isValid: boolean; errors: string[] } {
    const errors = [
      ...this.validateColors(theme.colors),
      ...this.validateTypography(theme.typography)
    ];

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Usage in template creation
async function createValidatedTemplate(
  templateConfig: Omit<ClientTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ClientTemplate> {
  const validation = ThemeValidator.validateTheme(templateConfig.theme);

  if (!validation.isValid) {
    throw new Error(`Theme validation failed: ${validation.errors.join(', ')}`);
  }

  return await templateSystem.createTemplate(templateConfig);
}
```

## Theme Performance Optimization

### 🚀 CSS-in-JS Performance

```typescript
// Optimized theme provider
const ThemeProvider = memo(({ theme, children }: ThemeProviderProps) => {
  // Memoize CSS generation
  const themeCSS = useMemo(() => generateThemeCSS(theme), [theme]);

  // Use style injection for better performance than CSS-in-JS runtime
  useEffect(() => {
    const styleId = 'client-theme-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = themeCSS;
  }, [themeCSS]);

  return <>{children}</>;
});
```

### 📦 Theme Caching

```typescript
// Theme caching for repeated use
class ThemeCache {
  private static cache = new Map<string, string>();

  static getCachedCSS(theme: ClientThemeConfig): string {
    const themeKey = JSON.stringify(theme);

    if (this.cache.has(themeKey)) {
      return this.cache.get(themeKey)!;
    }

    const css = generateThemeCSS(theme);
    this.cache.set(themeKey, css);

    // Limit cache size
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    return css;
  }

  static clearCache(): void {
    this.cache.clear();
  }
}
```

## Client Theming Best Practices

### ✅ Do's

1. **Use CSS Variables**: Enable runtime theme switching
2. **Validate Colors**: Ensure accessibility compliance
3. **Cache Themes**: Optimize performance for repeated use
4. **Provide Fallbacks**: Graceful degradation for unsupported features
5. **Test Across Devices**: Ensure consistency across different screens
6. **Brand Guidelines**: Follow client brand guidelines strictly

### ❌ Don'ts

1. **Hardcode Colors**: Always use theme system
2. **Skip Validation**: Always validate theme configurations
3. **Ignore Performance**: Monitor theme application performance
4. **Break Accessibility**: Maintain contrast ratios and readability
5. **Overcomplicate**: Keep theme structure simple and maintainable

### 🎯 Quick Setup Checklist

- [ ] Define base theme structure
- [ ] Create client-specific theme variations
- [ ] Implement theme validation
- [ ] Set up CSS variable generation
- [ ] Test theme switching performance
- [ ] Validate accessibility compliance
- [ ] Document theme customization options

Client theming is designed to be both powerful and performant, enabling rapid customization while maintaining consistency and brand integrity across all client micro-apps.