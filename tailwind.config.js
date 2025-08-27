/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      // Design token integration via CSS variables
      colors: {
        // Semantic colors
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primaryForeground)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondaryForeground)',
        },
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-mutedForeground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accentForeground)',
        },
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          foreground: 'var(--color-destructiveForeground)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-successForeground)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warningForeground)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          foreground: 'var(--color-infoForeground)',
        },
        // Color scales
        neutral: {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
          950: 'var(--color-neutral-950)',
        },
        'accent-scale': {
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
          950: 'var(--color-accent-950)',
        },
      },
      borderRadius: {
        'token-sm': 'var(--border-radius-sm)',
        'token-md': 'var(--border-radius-md)',
        'token-lg': 'var(--border-radius-lg)',
        'token-xl': 'var(--border-radius-xl)',
        'token-2xl': 'var(--border-radius-2xl)',
        'token-full': 'var(--border-radius-full)',
        // Legacy values
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'token-xs': 'var(--shadow-xs)',
        'token-sm': 'var(--shadow-sm)',
        'token-md': 'var(--shadow-md)',
        'token-lg': 'var(--shadow-lg)',
        'token-xl': 'var(--shadow-xl)',
        // Legacy values
        'apple-button': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'apple-button-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
      },
      fontSize: {
        'token-xs': 'var(--font-size-xs)',
        'token-sm': 'var(--font-size-sm)',
        'token-base': 'var(--font-size-base)',
        'token-lg': 'var(--font-size-lg)',
        'token-xl': 'var(--font-size-xl)',
        'token-2xl': 'var(--font-size-2xl)',
        'token-3xl': 'var(--font-size-3xl)',
        'token-4xl': 'var(--font-size-4xl)',
        // Legacy values
        'display': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.5' }],
      },
      fontWeight: {
        'token-normal': 'var(--font-weight-normal)',
        'token-medium': 'var(--font-weight-medium)',
        'token-semibold': 'var(--font-weight-semibold)',
        'token-bold': 'var(--font-weight-bold)',
      },
      lineHeight: {
        'token-tight': 'var(--line-height-tight)',
        'token-normal': 'var(--line-height-normal)',
        'token-relaxed': 'var(--line-height-relaxed)',
      },
      spacing: {
        'token-xs': 'var(--spacing-xs)',
        'token-sm': 'var(--spacing-sm)',
        'token-md': 'var(--spacing-md)',
        'token-lg': 'var(--spacing-lg)',
        'token-xl': 'var(--spacing-xl)',
        'token-2xl': 'var(--spacing-2xl)',
        'token-3xl': 'var(--spacing-3xl)',
        'token-4xl': 'var(--spacing-4xl)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      container: {
        center: true,
        padding: "1.5rem",
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};