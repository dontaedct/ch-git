/**
 * @fileoverview HT-008.10.3: Storybook Configuration
 * @module .storybook/main.ts
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.3 - Comprehensive Design System Documentation
 * Focus: Storybook configuration for interactive component documentation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system documentation)
 */

import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../lib/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../app/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-backgrounds',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
    '@storybook/addon-toolbars',
    '@storybook/addon-highlight',
    '@storybook/addon-actions',
    '@storybook/addon-jest',
    '@storybook/addon-coverage',
    '@storybook/addon-storysource',
    '@storybook/addon-design-tokens',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    // Handle CSS imports
    config.module?.rules?.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader', 'postcss-loader'],
    });

    // Handle SVG imports
    config.module?.rules?.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default config;