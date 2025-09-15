/**
 * HT-021 Foundation Architecture: Client Theme Types
 * 
 * Core interfaces for client theming and branding system
 * Part of the foundation layer that supports HT-022 and HT-023
 */

export interface ClientBrandTokens {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface TypographyTokens {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface LogoConfiguration {
  id: string;
  name: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  variant?: 'light' | 'dark' | 'color';
}

export interface ClientTheme {
  id: string;
  name: string;
  colors: ClientBrandTokens;
  fonts: TypographyTokens;
  logo: LogoConfiguration;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface SimpleClientTheme {
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
