/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '384px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      maxWidth: {
        grid: 'var(--max-w-grid)',
        'container-prose': 'var(--max-w-container-prose)',
        'container-page': 'var(--max-w-container-page)',
        'container-grid': 'var(--max-w-grid)',
        'container-full': '100%',
      },
      padding: {
        'gutter-xs': 'var(--grid-gutter-xs)',
        'gutter-sm': 'var(--grid-gutter-sm)',
        'gutter-md': 'var(--grid-gutter-md)',
        'gutter-lg': 'var(--grid-gutter-lg)',
        'gutter-xl': 'var(--grid-gutter-xl)',
      },
      spacing: {
        // HT-008.5.5: Enhanced systematic spacing scale
        'section': 'var(--spacing-section)',
        'section-sm': 'var(--spacing-section-sm)',
        'section-lg': 'var(--spacing-section-lg)',
        'section-xl': 'var(--spacing-section-xl)',
        // Micro spacing
        '0.5': '0.125rem',    // 2px
        '1': '0.25rem',       // 4px
        '1.5': '0.375rem',    // 6px
        '2': '0.5rem',        // 8px
        '2.5': '0.625rem',    // 10px
        '3': '0.75rem',       // 12px
        '3.5': '0.875rem',    // 14px
        '4': '1rem',          // 16px
        '5': '1.25rem',       // 20px
        '6': '1.5rem',        // 24px
        '7': '1.75rem',       // 28px
        '8': '2rem',          // 32px
        '9': '2.25rem',       // 36px
        '10': '2.5rem',       // 40px
        '11': '2.75rem',      // 44px
        '12': '3rem',         // 48px
        '14': '3.5rem',       // 56px
        '16': '4rem',         // 64px
        '20': '5rem',         // 80px
        '24': '6rem',         // 96px
        '28': '7rem',         // 112px
        '32': '8rem',         // 128px
        '36': '9rem',         // 144px
        '40': '10rem',        // 160px
        '44': '11rem',        // 176px
        '48': '12rem',        // 192px
        '52': '13rem',        // 208px
        '56': '14rem',        // 224px
        '60': '15rem',        // 240px
        '64': '16rem',        // 256px
        '72': '18rem',        // 288px
        '80': '20rem',        // 320px
        '96': '24rem',        // 384px
      },
      colors: {
        // Vercel-inspired monochromatic palette
        primary: {
          50: '#ffffff',
          100: '#f8f9fa',
          200: '#f1f3f4',
          300: '#e8eaed',
          400: '#dadce0',
          500: '#9aa0a6',
          600: '#5f6368',
          700: '#3c4043',
          800: '#202124',
          900: '#171717',
          950: '#0a0a0a',
        },
        gray: {
          50: '#ffffff',
          100: '#f8f9fa',
          200: '#f1f3f4',
          300: '#e8eaed',
          400: '#dadce0',
          500: '#9aa0a6',
          600: '#5f6368',
          700: '#3c4043',
          800: '#202124',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        // HT-008.5.5: Enhanced font family system
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Inter',
          'sans-serif'
        ],
        serif: [
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif'
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace'
        ],
        display: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
      },
      fontSize: {
        // HT-008.5.5: Enhanced systematic typography scale
        // Display styles
        'display-2xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        
        // Heading styles
        'heading-xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'heading-xs': ['1rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '600' }],
        
        // Body text styles
        'body-xl': ['1.25rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-xs': ['0.75rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        
        // Label styles
        'label-lg': ['1rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-md': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-sm': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-xs': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        
        // Caption styles
        'caption-lg': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption-md': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption-sm': ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        
        // Code styles
        'code-lg': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'code-md': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'code-sm': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        
        // Legacy support
        'xs': ['var(--text-xs)', { lineHeight: 'var(--leading-normal)' }],
        'sm': ['var(--text-sm)', { lineHeight: 'var(--leading-normal)' }],
        'base': ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        'lg': ['var(--text-lg)', { lineHeight: 'var(--leading-normal)' }],
        'xl': ['var(--text-xl)', { lineHeight: 'var(--leading-normal)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-tight)' }],
        '6xl': ['var(--text-6xl)', { lineHeight: 'var(--leading-tight)' }],
        '7xl': ['var(--text-7xl)', { lineHeight: 'var(--leading-tight)' }],
        '8xl': ['var(--text-8xl)', { lineHeight: 'var(--leading-tight)' }],
        '9xl': ['var(--text-9xl)', { lineHeight: 'var(--leading-tight)' }],
        'hero': ['var(--text-hero-size)', { lineHeight: 'var(--text-hero-leading)', letterSpacing: 'var(--text-hero-tracking)' }],
        'display': ['var(--text-display-size)', { lineHeight: 'var(--text-display-leading)', letterSpacing: 'var(--text-display-tracking)' }],
        'heading': ['var(--text-heading-size)', { lineHeight: 'var(--text-heading-leading)', letterSpacing: 'var(--text-heading-tracking)' }],
        'body': ['var(--text-body-size)', { lineHeight: 'var(--text-body-leading)', letterSpacing: 'var(--text-body-tracking)' }],
        'caption': ['var(--text-caption-size)', { lineHeight: 'var(--text-caption-leading)', letterSpacing: 'var(--text-caption-tracking)' }],
      },
      fontWeight: {
        thin: 'var(--font-weight-thin)',
        extralight: 'var(--font-weight-extralight)',
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
        extrabold: 'var(--font-weight-extrabold)',
        black: 'var(--font-weight-black)',
      },
      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight: 'var(--tracking-tight)',
        normal: 'var(--tracking-normal)',
        wide: 'var(--tracking-wide)',
        wider: 'var(--tracking-wider)',
        widest: 'var(--tracking-widest)',
      },
      lineHeight: {
        none: 'var(--leading-none)',
        tight: 'var(--leading-tight)',
        snug: 'var(--leading-snug)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
        loose: 'var(--leading-loose)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        bounceSubtle: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-5px)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(255, 255, 255, 0.15)',
        'glow-lg': '0 0 40px rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
};
