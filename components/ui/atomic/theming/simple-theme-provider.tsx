/**
 * @fileoverview HT-022.2.2: Simple Client Theming System
 * @module components/ui/atomic/theming
 * @author Agency Component System
 * @version 1.0.0
 *
 * SIMPLE CLIENT THEMING: Basic theme switching for agency clients
 * Features:
 * - Simple brand color switching
 * - Basic logo customization
 * - Simple typography switching
 * - Client-specific theme persistence
 * - White-labeling support
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { SimpleClientTheme } from '@/lib/foundation';

// Re-export SimpleClientTheme for components that import from this file
export type { SimpleClientTheme };

// Predefined Agency Themes
export const AGENCY_THEMES: SimpleClientTheme[] = [
  {
    id: 'default',
    name: 'Agency Default',
    colors: {
      primary: 'hsl(222, 84%, 4.9%)',
      secondary: 'hsl(210, 40%, 96%)',
      accent: 'hsl(210, 40%, 98%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(222, 84%, 4.9%)'
    },
    logo: {
      alt: 'Agency Logo',
      initials: 'AG'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  },
  {
    id: 'corporate',
    name: 'Corporate Blue',
    colors: {
      primary: 'hsl(221, 83%, 53%)',
      secondary: 'hsl(221, 83%, 93%)',
      accent: 'hsl(221, 83%, 98%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(221, 83%, 13%)'
    },
    logo: {
      alt: 'Corporate Logo',
      initials: 'CB'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingFamily: 'Inter, system-ui, sans-serif'
    }
  },
  {
    id: 'startup',
    name: 'Startup Green',
    colors: {
      primary: 'hsl(142, 76%, 36%)',
      secondary: 'hsl(142, 76%, 93%)',
      accent: 'hsl(142, 76%, 98%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(142, 76%, 6%)'
    },
    logo: {
      alt: 'Startup Logo',
      initials: 'SG'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  },
  {
    id: 'creative',
    name: 'Creative Purple',
    colors: {
      primary: 'hsl(262, 83%, 58%)',
      secondary: 'hsl(262, 83%, 93%)',
      accent: 'hsl(262, 83%, 98%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(262, 83%, 8%)'
    },
    logo: {
      alt: 'Creative Logo',
      initials: 'CP'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  }
];

interface SimpleThemeContextValue {
  currentTheme: SimpleClientTheme;
  availableThemes: SimpleClientTheme[];
  switchTheme: (themeId: string) => void;
  addCustomTheme: (theme: SimpleClientTheme) => void;
  updateTheme: (theme: Partial<SimpleClientTheme>) => void;
  resetTheme: () => void;
  isCustomTheme: boolean;
}

const SimpleThemeContext = createContext<SimpleThemeContextValue | undefined>(undefined);

interface SimpleThemeProviderProps {
  children: React.ReactNode;
  defaultThemeId?: string;
  customThemes?: SimpleClientTheme[];
}

export function SimpleThemeProvider({
  children,
  defaultThemeId = 'default',
  customThemes = []
}: SimpleThemeProviderProps) {
  const [currentThemeId, setCurrentThemeId] = useLocalStorage('agency-theme-id', defaultThemeId);
  const [customThemeList, setCustomThemeList] = useLocalStorage<SimpleClientTheme[]>('agency-custom-themes', customThemes);

  const allThemes = [...AGENCY_THEMES, ...customThemeList];
  const currentTheme = allThemes.find(theme => theme.id === currentThemeId) || AGENCY_THEMES[0];
  const isCustomTheme = currentTheme.isCustom === true;

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // Apply color variables
    root.style.setProperty('--primary', currentTheme.colors.primary);
    root.style.setProperty('--secondary', currentTheme.colors.secondary);
    root.style.setProperty('--accent', currentTheme.colors.accent);
    root.style.setProperty('--background', currentTheme.colors.background);
    root.style.setProperty('--foreground', currentTheme.colors.foreground);

    // Apply typography variables
    root.style.setProperty('--font-family-primary', currentTheme.typography.fontFamily);
    if (currentTheme.typography.headingFamily) {
      root.style.setProperty('--font-family-heading', currentTheme.typography.headingFamily);
    }

    // Set theme data attributes for CSS targeting
    root.setAttribute('data-agency-theme', currentTheme.id);
    root.setAttribute('data-agency-theme-name', currentTheme.name);

  }, [currentTheme]);

  const switchTheme = (themeId: string) => {
    if (allThemes.find(theme => theme.id === themeId)) {
      setCurrentThemeId(themeId);
    }
  };

  const addCustomTheme = (theme: SimpleClientTheme) => {
    const customTheme = {
      ...theme,
      isCustom: true,
      createdAt: new Date()
    };

    const updatedCustomThemes = [...customThemeList, customTheme];
    setCustomThemeList(updatedCustomThemes);

    // Switch to the new theme
    setCurrentThemeId(theme.id);
  };

  const updateTheme = (themeUpdates: Partial<SimpleClientTheme>) => {
    if (isCustomTheme) {
      const updatedThemes = customThemeList.map(theme =>
        theme.id === currentTheme.id
          ? { ...theme, ...themeUpdates }
          : theme
      );
      setCustomThemeList(updatedThemes);
    } else {
      // Create a new custom theme based on current theme
      const newCustomTheme: SimpleClientTheme = {
        ...currentTheme,
        ...themeUpdates,
        id: `${currentTheme.id}-custom-${Date.now()}`,
        name: `${currentTheme.name} (Custom)`,
        isCustom: true,
        createdAt: new Date()
      };
      addCustomTheme(newCustomTheme);
    }
  };

  const resetTheme = () => {
    setCurrentThemeId(defaultThemeId);
  };

  const value: SimpleThemeContextValue = {
    currentTheme,
    availableThemes: allThemes,
    switchTheme,
    addCustomTheme,
    updateTheme,
    resetTheme,
    isCustomTheme
  };

  return (
    <SimpleThemeContext.Provider value={value}>
      {children}
    </SimpleThemeContext.Provider>
  );
}

export function useSimpleTheme() {
  const context = useContext(SimpleThemeContext);
  if (!context) {
    throw new Error('useSimpleTheme must be used within a SimpleThemeProvider');
  }
  return context;
}

// Theme validation utilities
export function validateSimpleTheme(theme: SimpleClientTheme): boolean {
  const requiredFields = ['id', 'name', 'colors', 'logo', 'typography'];
  const requiredColors = ['primary', 'secondary', 'accent', 'background', 'foreground'];
  const requiredLogo = ['alt', 'initials'];
  const requiredTypography = ['fontFamily'];

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in theme)) {
      console.error(`Theme validation failed: missing field '${field}'`);
      return false;
    }
  }

  // Check required colors
  for (const color of requiredColors) {
    if (!(color in theme.colors)) {
      console.error(`Theme validation failed: missing color '${color}'`);
      return false;
    }
  }

  // Check required logo fields
  for (const field of requiredLogo) {
    if (!(field in theme.logo)) {
      console.error(`Theme validation failed: missing logo field '${field}'`);
      return false;
    }
  }

  // Check required typography fields
  for (const field of requiredTypography) {
    if (!(field in theme.typography)) {
      console.error(`Theme validation failed: missing typography field '${field}'`);
      return false;
    }
  }

  return true;
}

// Theme generation utilities
export function createSimpleTheme(
  id: string,
  name: string,
  primaryColor: string,
  logoInitials: string,
  fontFamily: string = 'Inter, system-ui, sans-serif'
): SimpleClientTheme {
  // Generate complementary colors based on primary
  const hsl = primaryColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  let secondary = primaryColor;
  let accent = primaryColor;

  if (hsl) {
    const [, h, s] = hsl;
    secondary = `hsl(${h}, ${s}%, 93%)`;
    accent = `hsl(${h}, ${s}%, 98%)`;
  }

  return {
    id,
    name,
    colors: {
      primary: primaryColor,
      secondary,
      accent,
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(0, 0%, 3.9%)'
    },
    logo: {
      alt: `${name} Logo`,
      initials: logoInitials
    },
    typography: {
      fontFamily
    },
    isCustom: true,
    createdAt: new Date()
  };
}