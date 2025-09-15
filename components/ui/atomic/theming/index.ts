/**
 * @fileoverview HT-022.2.2: Simple Client Theming System - Main Export
 * @module components/ui/atomic/theming
 * @author Agency Component System
 * @version 1.0.0
 *
 * SIMPLE CLIENT THEMING SYSTEM: Complete theming solution
 *
 * Features:
 * - Simple theme provider with local storage persistence
 * - Predefined agency themes (Default, Corporate, Startup, Creative)
 * - Client theme switcher component
 * - Brand customization interface
 * - Theme validation and quality scoring
 * - White-labeling capabilities
 * - Design token integration
 *
 * Usage:
 * ```tsx
 * import { SimpleThemeProvider, useSimpleTheme, ThemeSwitcher } from '@/components/ui/atomic/theming'
 *
 * function App() {
 *   return (
 *     <SimpleThemeProvider>
 *       <ThemeSwitcher />
 *       <YourApp />
 *     </SimpleThemeProvider>
 *   )
 * }
 * ```
 */

// Core theming exports
export {
  SimpleThemeProvider,
  useSimpleTheme,
  AGENCY_THEMES,
  validateSimpleTheme,
  createSimpleTheme
} from './simple-theme-provider';

// UI Components
export { ThemeSwitcher } from './theme-switcher';
export { BrandCustomizer } from './brand-customizer';

// Validation utilities
export {
  validateTheme,
  quickValidateTheme,
  getValidationSummary,
  getThemeQuality,
  type ThemeValidationError,
  type ThemeValidationResult
} from './theme-validator';

// Helper utilities
import { SimpleClientTheme } from '@/lib/foundation';

export function getThemeCSS(theme: SimpleClientTheme): string {
  return `
    :root[data-agency-theme="${theme.id}"] {
      --primary: ${theme.colors.primary};
      --secondary: ${theme.colors.secondary};
      --accent: ${theme.colors.accent};
      --background: ${theme.colors.background};
      --foreground: ${theme.colors.foreground};
      --font-family-primary: ${theme.typography.fontFamily};
      ${theme.typography.headingFamily ? `--font-family-heading: ${theme.typography.headingFamily};` : ''}
    }
  `;
}

export function injectThemeCSS(theme: SimpleClientTheme): void {
  const styleId = `theme-${theme.id}`;
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = getThemeCSS(theme);
}

// Theme management utilities
export const THEMING_CONFIG = {
  storageKey: 'agency-theme-id',
  customThemesKey: 'agency-custom-themes',
  maxCustomThemes: 10,
  version: '1.0.0'
} as const;