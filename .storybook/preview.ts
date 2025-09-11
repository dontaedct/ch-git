/**
 * @fileoverview HT-008.10.3: Storybook Preview Configuration
 * @module .storybook/preview.ts
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.3 - Comprehensive Design System Documentation
 * Focus: Storybook preview configuration with themes and global parameters
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system documentation)
 */

import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import { TokensProvider } from '../lib/design-tokens/provider';
import '../styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.light,
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0a0a0a',
        },
        {
          name: 'neutral-50',
          value: '#fafafa',
        },
        {
          name: 'neutral-100',
          value: '#f5f5f5',
        },
        {
          name: 'neutral-900',
          value: '#171717',
        },
        {
          name: 'neutral-950',
          value: '#0a0a0a',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        wide: {
          name: 'Wide',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'keyboard-navigation',
            enabled: true,
          },
          {
            id: 'focus-management',
            enabled: true,
          },
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <TokensProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Story />
        </div>
      </TokensProvider>
    ),
  ],
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;