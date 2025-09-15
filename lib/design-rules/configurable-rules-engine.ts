/**
 * @fileoverview Configurable Design Rules Engine
 * @module lib/design-rules/configurable-rules-engine
 * @author OSS Hero System
 * @version 1.0.0
 */

import { BrandValidationContext } from '@/lib/branding/brand-context';

export interface DesignRule {
  /** Unique rule identifier */
  id: string;
  /** Rule name for display */
  name: string;
  /** Rule description */
  description: string;
  /** Rule category */
  category: 'color' | 'typography' | 'spacing' | 'layout' | 'accessibility' | 'import' | 'token';
  /** Rule severity level */
  severity: 'error' | 'warning' | 'info';
  /** Whether this rule is enabled */
  enabled: boolean;
  /** Rule configuration */
  config: Record<string, any>;
  /** ESLint rule definition */
  eslintRule: {
    rule: string;
    options: any[];
  };
  /** File patterns this rule applies to */
  filePatterns: string[];
  /** Brand-specific overrides */
  brandOverrides?: Record<string, Partial<DesignRule>>;
  /** Tenant-specific overrides */
  tenantOverrides?: Record<string, Partial<DesignRule>>;
}

export interface RuleConfiguration {
  /** Configuration name */
  name: string;
  /** Configuration description */
  description: string;
  /** Base rules */
  rules: DesignRule[];
  /** Brand-specific rule sets */
  brandRuleSets: Record<string, DesignRule[]>;
  /** Tenant-specific rule sets */
  tenantRuleSets: Record<string, DesignRule[]>;
  /** Global rule overrides */
  globalOverrides: Record<string, Partial<DesignRule>>;
}

export interface RuleValidationContext {
  /** Current brand context */
  brandContext: BrandValidationContext;
  /** Current tenant ID */
  tenantId?: string;
  /** File being validated */
  filePath: string;
  /** Additional context */
  metadata?: Record<string, any>;
}

/**
 * Configurable Design Rules Engine
 */
export class ConfigurableRulesEngine {
  private configurations: Map<string, RuleConfiguration> = new Map();
  private activeConfiguration: string = 'default';

  constructor() {
    this.initializeDefaultConfiguration();
  }

  /**
   * Initialize default rule configuration
   */
  private initializeDefaultConfiguration(): void {
    const defaultConfig: RuleConfiguration = {
      name: 'default',
      description: 'Default design rules configuration',
      rules: this.getDefaultRules(),
      brandRuleSets: {},
      tenantRuleSets: {},
      globalOverrides: {},
    };

    this.configurations.set('default', defaultConfig);
  }

  /**
   * Get default design rules
   */
  private getDefaultRules(): DesignRule[] {
    return [
      {
        id: 'no-raw-hex-colors',
        name: 'No Raw Hex Colors',
        description: 'Prevent use of raw hex colors in favor of design tokens',
        category: 'color',
        severity: 'error',
        enabled: true,
        config: {
          allowCustomColors: false,
          allowedColors: [],
        },
        eslintRule: {
          rule: 'no-restricted-syntax',
          options: [
            'error',
            {
              selector: 'Literal[value=/^#[0-9a-fA-F]{6}$/]',
              message: 'Raw hex colors are not allowed. Use brand color variables or Tailwind classes.',
            },
          ],
        },
        filePatterns: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
        brandOverrides: {
          custom: {
            config: {
              allowCustomColors: true,
            },
            severity: 'warning',
          },
        },
      },
      {
        id: 'no-inline-styles',
        name: 'No Inline Styles',
        description: 'Prevent inline styles in favor of CSS classes',
        category: 'layout',
        severity: 'error',
        enabled: true,
        config: {
          allowExceptions: true,
          exceptionComment: 'eslint-disable-next-line react/forbid-component-props',
        },
        eslintRule: {
          rule: 'react/forbid-component-props',
          options: [
            'error',
            {
              forbid: [
                {
                  propName: 'style',
                  message: 'Avoid inline styles. Use Tailwind utilities or CSS classes.',
                },
              ],
            },
          ],
        },
        filePatterns: ['**/*.tsx', '**/*.jsx'],
      },
      {
        id: 'enforce-icon-system',
        name: 'Enforce Icon System',
        description: 'Enforce single icon system (Lucide)',
        category: 'import',
        severity: 'error',
        enabled: true,
        config: {
          allowedIconLibrary: 'lucide-react',
          forbiddenLibraries: ['react-icons', '@heroicons', '@mui/icons-material'],
        },
        eslintRule: {
          rule: 'no-restricted-imports',
          options: [
            'error',
            {
              patterns: [
                {
                  group: ['react-icons/*', '@heroicons/*', '@mui/icons-material/*'],
                  message: 'Use Lucide React icons only. Import from lucide-react.',
                },
              ],
            },
          ],
        },
        filePatterns: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
      },
      {
        id: 'enforce-font-system',
        name: 'Enforce Font System',
        description: 'Enforce brand-aware font system',
        category: 'typography',
        severity: 'error',
        enabled: true,
        config: {
          allowCustomFonts: false,
          brandFonts: ['system-ui', 'sans-serif', 'Geist'],
        },
        eslintRule: {
          rule: 'no-restricted-imports',
          options: [
            'error',
            {
              patterns: [
                {
                  group: ['@fontsource/*'],
                  message: 'Use brand-aware font system. Import fonts through the brand configuration system.',
                },
              ],
            },
          ],
        },
        filePatterns: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
      },
      {
        id: 'enforce-import-boundaries',
        name: 'Enforce Import Boundaries',
        description: 'Prevent UI components from importing data layer directly',
        category: 'import',
        severity: 'error',
        enabled: true,
        config: {
          forbiddenPaths: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*'],
          allowedPaths: ['@/hooks/*', '@/lib/adapters/*'],
        },
        eslintRule: {
          rule: 'no-restricted-imports',
          options: [
            'error',
            {
              patterns: [
                {
                  group: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*'],
                  message: 'UI components must use adapters, not direct data imports.',
                },
              ],
            },
          ],
        },
        filePatterns: ['components/ui/**/*', 'components/**/*.tsx', 'components/**/*.ts'],
      },
      {
        id: 'enforce-design-tokens',
        name: 'Enforce Design Tokens',
        description: 'Ensure use of design tokens instead of custom CSS',
        category: 'token',
        severity: 'warning',
        enabled: true,
        config: {
          strictMode: false,
          allowedCustomProperties: [],
        },
        eslintRule: {
          rule: 'no-restricted-properties',
          options: [
            'warning',
            {
              object: 'className',
              property: 'includes',
              message: 'Use design token variables instead of direct CSS custom properties',
            },
          ],
        },
        filePatterns: ['**/*.tsx', '**/*.ts', '**/*.css', '**/*.scss'],
      },
    ];
  }

  /**
   * Add or update rule configuration
   */
  addConfiguration(name: string, configuration: RuleConfiguration): void {
    this.configurations.set(name, configuration);
  }

  /**
   * Set active configuration
   */
  setActiveConfiguration(name: string): void {
    if (!this.configurations.has(name)) {
      throw new Error(`Configuration '${name}' not found`);
    }
    this.activeConfiguration = name;
  }

  /**
   * Get active configuration
   */
  getActiveConfiguration(): RuleConfiguration {
    return this.configurations.get(this.activeConfiguration)!;
  }

  /**
   * Get rules for specific context
   */
  getRulesForContext(context: RuleValidationContext): DesignRule[] {
    const config = this.getActiveConfiguration();
    let rules = [...config.rules];

    // Apply brand-specific overrides
    if (context.brandContext.brandConfig.isCustom) {
      const customBrandRules = config.brandRuleSets.custom || [];
      rules = this.mergeRules(rules, customBrandRules);
    }

    // Apply tenant-specific overrides
    if (context.tenantId && config.tenantRuleSets[context.tenantId]) {
      const tenantRules = config.tenantRuleSets[context.tenantId];
      rules = this.mergeRules(rules, tenantRules);
    }

    // Apply global overrides
    rules = rules.map(rule => ({
      ...rule,
      ...config.globalOverrides[rule.id],
    }));

    // Filter rules based on file path
    return rules.filter(rule => 
      rule.enabled && 
      this.matchesFilePattern(context.filePath, rule.filePatterns)
    );
  }

  /**
   * Generate ESLint configuration for context
   */
  generateESLintConfig(context: RuleValidationContext): any {
    const rules = this.getRulesForContext(context);
    const eslintConfig: any = {
      rules: {},
      overrides: [],
    };

    // Group rules by file patterns
    const ruleGroups: Record<string, DesignRule[]> = {};
    
    rules.forEach(rule => {
      rule.filePatterns.forEach(pattern => {
        if (!ruleGroups[pattern]) {
          ruleGroups[pattern] = [];
        }
        ruleGroups[pattern].push(rule);
      });
    });

    // Generate ESLint rules
    Object.entries(ruleGroups).forEach(([pattern, patternRules]) => {
      const override: any = {
        files: [pattern],
        rules: {},
      };

      patternRules.forEach(rule => {
        override.rules[rule.eslintRule.rule] = rule.eslintRule.options;
      });

      eslintConfig.overrides.push(override);
    });

    return eslintConfig;
  }

  /**
   * Validate rule configuration
   */
  validateRuleConfiguration(config: RuleConfiguration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate rule IDs are unique
    const ruleIds = new Set<string>();
    config.rules.forEach(rule => {
      if (ruleIds.has(rule.id)) {
        errors.push(`Duplicate rule ID: ${rule.id}`);
      }
      ruleIds.add(rule.id);
    });

    // Validate rule configurations
    config.rules.forEach(rule => {
      if (!rule.id || !rule.name || !rule.description) {
        errors.push(`Rule ${rule.id} is missing required fields`);
      }
      
      if (!['error', 'warning', 'info'].includes(rule.severity)) {
        errors.push(`Rule ${rule.id} has invalid severity: ${rule.severity}`);
      }
      
      if (!rule.eslintRule || !rule.eslintRule.rule) {
        errors.push(`Rule ${rule.id} is missing ESLint rule definition`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge rules arrays, with later rules overriding earlier ones
   */
  private mergeRules(baseRules: DesignRule[], overrideRules: DesignRule[]): DesignRule[] {
    const mergedRules = new Map<string, DesignRule>();
    
    // Add base rules
    baseRules.forEach(rule => {
      mergedRules.set(rule.id, rule);
    });
    
    // Apply overrides
    overrideRules.forEach(rule => {
      const existingRule = mergedRules.get(rule.id);
      if (existingRule) {
        mergedRules.set(rule.id, { ...existingRule, ...rule });
      } else {
        mergedRules.set(rule.id, rule);
      }
    });
    
    return Array.from(mergedRules.values());
  }

  /**
   * Check if file path matches any of the patterns
   */
  private matchesFilePattern(filePath: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      // Simple glob pattern matching
      const regex = new RegExp(
        pattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\?/g, '.')
      );
      return regex.test(filePath);
    });
  }

  /**
   * Get available configurations
   */
  getAvailableConfigurations(): string[] {
    return Array.from(this.configurations.keys());
  }

  /**
   * Export configuration
   */
  exportConfiguration(name: string): string {
    const config = this.configurations.get(name);
    if (!config) {
      throw new Error(`Configuration '${name}' not found`);
    }
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration
   */
  importConfiguration(name: string, configJson: string): boolean {
    try {
      const config = JSON.parse(configJson) as RuleConfiguration;
      const validation = this.validateRuleConfiguration(config);
      
      if (!validation.valid) {
        console.error('Invalid rule configuration:', validation.errors);
        return false;
      }

      this.configurations.set(name, config);
      return true;
    } catch (error) {
      console.error('Error importing rule configuration:', error);
      return false;
    }
  }
}

/**
 * Global configurable rules engine instance
 */
export const configurableRulesEngine = new ConfigurableRulesEngine();
