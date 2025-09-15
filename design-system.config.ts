/**
 * @fileoverview HT-008.10.5: Design System Configuration
 * @module design-system.config.ts
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.5 - Design System Automation and Versioning
 * Focus: Centralized configuration for design system automation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system automation)
 */

export interface DesignSystemConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository: {
    type: string;
    url: string;
  };
  homepage: string;
  keywords: string[];
  engines: {
    node: string;
    npm: string;
  };
  designSystem: {
    tokens: {
      enabled: boolean;
      path: string;
      format: 'css' | 'scss' | 'js' | 'ts';
    };
    components: {
      enabled: boolean;
      path: string;
      framework: 'react' | 'vue' | 'angular' | 'svelte';
      typescript: boolean;
    };
    documentation: {
      enabled: boolean;
      path: string;
      storybook: boolean;
      docusaurus: boolean;
    };
    testing: {
      enabled: boolean;
      unit: boolean;
      integration: boolean;
      visual: boolean;
      accessibility: boolean;
      performance: boolean;
    };
    automation: {
      enabled: boolean;
      versioning: boolean;
      changelog: boolean;
      releases: boolean;
      deployment: boolean;
    };
  };
  paths: {
    components: string;
    tokens: string;
    docs: string;
    tests: string;
    stories: string;
    reports: string;
  };
  quality: {
    bundleSize: {
      max: string;
      warning: string;
    };
    performance: {
      lighthouse: {
        performance: number;
        accessibility: number;
        bestPractices: number;
        seo: number;
      };
    };
    accessibility: {
      wcag: 'A' | 'AA' | 'AAA';
      colorContrast: number;
    };
  };
  release: {
    strategy: 'semantic' | 'calendar' | 'manual';
    channels: string[];
    prerelease: {
      enabled: boolean;
      suffix: string;
    };
  };
}

export const designSystemConfig: DesignSystemConfig = {
  name: 'my-app-design-system',
  version: '2.0.0',
  description: 'Enterprise-grade design system with comprehensive component library',
  author: 'OSS Hero System',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/your-org/your-repo.git',
  },
  homepage: 'https://your-org.github.io/your-repo',
  keywords: [
    'design-system',
    'ui-components',
    'react',
    'typescript',
    'tailwind',
    'storybook',
    'enterprise',
    'accessibility',
    'wcag',
    'design-tokens',
  ],
  engines: {
    node: '>=18.0.0',
    npm: '>=9.0.0',
  },
  designSystem: {
    tokens: {
      enabled: true,
      path: 'lib/design-tokens',
      format: 'ts',
    },
    components: {
      enabled: true,
      path: 'components/ui',
      framework: 'react',
      typescript: true,
    },
    documentation: {
      enabled: true,
      path: 'docs',
      storybook: true,
      docusaurus: false,
    },
    testing: {
      enabled: true,
      unit: true,
      integration: true,
      visual: true,
      accessibility: true,
      performance: true,
    },
    automation: {
      enabled: true,
      versioning: true,
      changelog: true,
      releases: true,
      deployment: true,
    },
  },
  paths: {
    components: 'components/ui',
    tokens: 'lib/design-tokens',
    docs: 'docs',
    tests: 'tests/design-system',
    stories: '.storybook',
    reports: 'reports',
  },
  quality: {
    bundleSize: {
      max: '100KB',
      warning: '80KB',
    },
    performance: {
      lighthouse: {
        performance: 95,
        accessibility: 100,
        bestPractices: 95,
        seo: 90,
      },
    },
    accessibility: {
      wcag: 'AAA',
      colorContrast: 4.5,
    },
  },
  release: {
    strategy: 'semantic',
    channels: ['npm', 'github'],
    prerelease: {
      enabled: true,
      suffix: 'beta',
    },
  },
};

export default designSystemConfig;
