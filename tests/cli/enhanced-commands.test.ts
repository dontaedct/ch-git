/**
 * Enhanced CLI Commands Test Suite
 * Tests for HT-031.2.1: Enhanced DCT CLI Integration & Advanced Commands
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { enhancedCLICommands, EnhancedCLICommands } from '@/lib/cli/enhanced-commands';
import { intelligentDefaultsEngine } from '@/lib/cli/intelligent-defaults';

describe('Enhanced CLI Commands', () => {
  let cli: EnhancedCLICommands;

  beforeEach(() => {
    cli = new EnhancedCLICommands();
  });

  describe('Command Registry', () => {
    it('should have all required commands', () => {
      const commands = cli.getCommands();
      const commandNames = commands.map(cmd => cmd.name);
      
      expect(commandNames).toContain('init');
      expect(commandNames).toContain('project:create');
      expect(commandNames).toContain('project:status');
      expect(commandNames).toContain('dev:setup');
      expect(commandNames).toContain('dev:validate');
      expect(commandNames).toContain('security:audit');
      expect(commandNames).toContain('analytics:report');
    });

    it('should categorize commands correctly', () => {
      const initCommands = cli.getCommandsByCategory('initialization');
      const projectCommands = cli.getCommandsByCategory('project-management');
      const devCommands = cli.getCommandsByCategory('development');
      const securityCommands = cli.getCommandsByCategory('security');
      const analyticsCommands = cli.getCommandsByCategory('analytics');

      expect(initCommands).toHaveLength(1);
      expect(initCommands[0].name).toBe('init');
      
      expect(projectCommands).toHaveLength(2);
      expect(projectCommands.map(cmd => cmd.name)).toContain('project:create');
      expect(projectCommands.map(cmd => cmd.name)).toContain('project:status');
      
      expect(devCommands).toHaveLength(2);
      expect(devCommands.map(cmd => cmd.name)).toContain('dev:setup');
      expect(devCommands.map(cmd => cmd.name)).toContain('dev:validate');
      
      expect(securityCommands).toHaveLength(1);
      expect(securityCommands[0].name).toBe('security:audit');
      
      expect(analyticsCommands).toHaveLength(1);
      expect(analyticsCommands[0].name).toBe('analytics:report');
    });

    it('should have preset configurations', () => {
      const presets = cli.getPresets();
      
      expect(presets.has('salon-waitlist')).toBe(true);
      expect(presets.has('realtor-listing-hub')).toBe(true);
      expect(presets.has('consultation-engine')).toBe(true);
    });

    it('should get specific preset configuration', () => {
      const salonPreset = cli.getPreset('salon-waitlist');
      
      expect(salonPreset).toBeDefined();
      expect(salonPreset.name).toBe('Salon Waitlist');
      expect(salonPreset.description).toContain('appointment management');
      expect(salonPreset.features).toContain('appointment-booking');
    });
  });

  describe('Command Validation', () => {
    it('should validate init command with required arguments', () => {
      const validArgs = {
        name: 'Test Business',
        preset: 'salon-waitlist',
        tier: 'starter'
      };

      const validation = cli.validateCommand('init', validArgs);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject init command without required name', () => {
      const invalidArgs = {
        preset: 'salon-waitlist',
        tier: 'starter'
      };

      const validation = cli.validateCommand('init', invalidArgs);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Required option 'name' is missing");
    });

    it('should validate tier values', () => {
      const invalidArgs = {
        name: 'Test Business',
        preset: 'salon-waitlist',
        tier: 'invalid-tier'
      };

      const validation = cli.validateCommand('init', invalidArgs);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate preset values', () => {
      const invalidArgs = {
        name: 'Test Business',
        preset: 'invalid-preset',
        tier: 'starter'
      };

      const validation = cli.validateCommand('init', invalidArgs);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate client name length', () => {
      const invalidArgs = {
        name: 'A', // Too short
        preset: 'salon-waitlist',
        tier: 'starter'
      };

      const validation = cli.validateCommand('init', invalidArgs);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Command Execution', () => {
    it('should execute init command successfully', async () => {
      const args = {
        name: 'Test Business',
        preset: 'salon-waitlist',
        tier: 'starter',
        features: ['payments'],
        ci: false,
        verbose: false,
        'dry-run': false
      };

      const context = {
        workingDirectory: '/test',
        environment: 'development' as const,
        verbose: false,
        dryRun: false,
        config: {
          clientName: 'Test Business',
          preset: 'salon-waitlist',
          tier: 'starter' as const,
          features: ['payments'],
          security: [],
          performance: []
        }
      };

      const result = await cli.executeCommand('init', args, context);
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.output).toBeDefined();
      expect(result.output.message).toContain('Test Business');
      expect(result.output.config).toBeDefined();
    });

    it('should execute project:status command', async () => {
      const args = {
        project: '/test-project',
        format: 'json'
      };

      const context = {
        workingDirectory: '/test',
        environment: 'development' as const,
        verbose: false,
        dryRun: false,
        config: {
          clientName: 'Test Business',
          preset: 'salon-waitlist',
          tier: 'starter' as const,
          features: [],
          security: [],
          performance: []
        }
      };

      const result = await cli.executeCommand('project:status', args, context);
      
      expect(result.success).toBe(true);
      expect(result.output.project).toBe('/test-project');
      expect(result.output.format).toBe('json');
    });

    it('should handle command execution errors', async () => {
      const args = {};
      const context = {
        workingDirectory: '/test',
        environment: 'development' as const,
        verbose: false,
        dryRun: false,
        config: {
          clientName: 'Test Business',
          preset: 'salon-waitlist',
          tier: 'starter' as const,
          features: [],
          security: [],
          performance: []
        }
      };

      const result = await cli.executeCommand('invalid-command', args, context);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Intelligent Command Suggestions', () => {
    it('should generate suggestions for starter tier', () => {
      const context = {
        workingDirectory: '/test',
        environment: 'development' as const,
        verbose: false,
        dryRun: false,
        config: {
          clientName: 'Test Business',
          preset: 'salon-waitlist',
          tier: 'starter' as const,
          features: [],
          security: [],
          performance: []
        }
      };

      const suggestions = cli.generateCommandSuggestions(context);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('basic-authentication');
    });

    it('should generate suggestions for advanced tier', () => {
      const context = {
        workingDirectory: '/test',
        environment: 'production' as const,
        verbose: false,
        dryRun: false,
        config: {
          clientName: 'Test Business',
          preset: 'consultation-engine',
          tier: 'advanced' as const,
          features: [],
          security: [],
          performance: []
        }
      };

      const suggestions = cli.generateCommandSuggestions(context);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('guardian'))).toBe(true);
    });
  });
});

describe('Intelligent Defaults Engine', () => {
  describe('Industry Analysis', () => {
    it('should analyze beauty industry client names', () => {
      const result = intelligentDefaultsEngine.analyzeClientName('Bella Salon');
      
      expect(result.suggestedIndustry).toBe('beauty-wellness');
      expect(result.confidence).toBeGreaterThan(50);
      expect(result.reasoning).toContain('salon');
    });

    it('should analyze real estate client names', () => {
      const result = intelligentDefaultsEngine.analyzeClientName('Metro Realty Group');
      
      expect(result.suggestedIndustry).toBe('real-estate');
      expect(result.confidence).toBeGreaterThan(50);
      expect(result.reasoning).toContain('realty');
    });

    it('should analyze professional services client names', () => {
      const result = intelligentDefaultsEngine.analyzeClientName('Legal Consulting Pro');
      
      expect(result.suggestedIndustry).toBe('professional-services');
      expect(result.confidence).toBeGreaterThan(50);
      expect(result.reasoning).toContain('consulting');
    });

    it('should handle generic client names', () => {
      const result = intelligentDefaultsEngine.analyzeClientName('ABC Company');
      
      expect(result.suggestedIndustry).toBe('general');
      expect(result.confidence).toBeLessThan(50);
    });
  });

  describe('Intelligent Defaults Generation', () => {
    it('should generate defaults for salon waitlist preset', () => {
      const defaults = intelligentDefaultsEngine.generateIntelligentDefaults(
        'Bella Salon',
        'salon-waitlist',
        'starter'
      );

      expect(defaults.configuration.features).toContain('appointment-booking');
      expect(defaults.configuration.features).toContain('customer-management');
      expect(defaults.recommendations.length).toBeGreaterThan(0);
      expect(defaults.validations.length).toBeGreaterThan(0);
      expect(defaults.optimizations.length).toBeGreaterThan(0);
    });

    it('should generate different defaults for advanced tier', () => {
      const defaults = intelligentDefaultsEngine.generateIntelligentDefaults(
        'Metro Realty',
        'realtor-listing-hub',
        'advanced'
      );

      expect(defaults.configuration.features).toContain('market-analytics');
      expect(defaults.configuration.security).toContain('guardian');
      expect(defaults.configuration.performance).toContain('monitoring');
    });

    it('should generate contextual recommendations', () => {
      const defaults = intelligentDefaultsEngine.generateIntelligentDefaults(
        'Legal Consulting Pro',
        'consultation-engine',
        'pro'
      );

      const securityRecommendations = defaults.recommendations.filter(
        r => r.type === 'security'
      );
      expect(securityRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Smart Suggestions', () => {
    it('should generate budget-based suggestions', () => {
      const suggestions = intelligentDefaultsEngine.getSmartSuggestions(
        {},
        { budget: 'high', timeline: 'standard', team: 'small', experience: 'advanced', compliance: [] }
      );

      expect(suggestions.some(s => s.includes('advanced'))).toBe(true);
      expect(suggestions.some(s => s.includes('ai-features'))).toBe(true);
    });

    it('should generate timeline-based suggestions', () => {
      const suggestions = intelligentDefaultsEngine.getSmartSuggestions(
        {},
        { budget: 'medium', timeline: 'urgent', team: 'solo', experience: 'intermediate', compliance: [] }
      );

      expect(suggestions.some(s => s.includes('starter'))).toBe(true);
      expect(suggestions.some(s => s.includes('basic-authentication'))).toBe(true);
    });

    it('should generate team-size-based suggestions', () => {
      const suggestions = intelligentDefaultsEngine.getSmartSuggestions(
        {},
        { budget: 'high', timeline: 'standard', team: 'large', experience: 'advanced', compliance: [] }
      );

      expect(suggestions.some(s => s.includes('monitoring'))).toBe(true);
      expect(suggestions.some(s => s.includes('analytics'))).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  it('should integrate CLI commands with intelligent defaults', async () => {
    const args = {
      name: 'Bella Salon',
      preset: 'salon-waitlist',
      tier: 'pro'
    };

    // Generate intelligent defaults
    const defaults = intelligentDefaultsEngine.generateIntelligentDefaults(
      args.name,
      args.preset,
      args.tier
    );

    // Validate command with intelligent suggestions
    const validation = enhancedCLICommands.validateCommand('init', args);
    expect(validation.valid).toBe(true);

    // Execute command with context
    const context = {
      workingDirectory: '/test',
      environment: 'development' as const,
      verbose: false,
      dryRun: false,
      config: {
        clientName: args.name,
        preset: args.preset,
        tier: args.tier,
        features: defaults.configuration.features,
        security: defaults.configuration.security,
        performance: defaults.configuration.performance
      }
    };

    const result = await enhancedCLICommands.executeCommand('init', args, context);
    expect(result.success).toBe(true);
    expect(result.output.config.clientName).toBe('Bella Salon');
  });

  it('should handle complex command execution flow', async () => {
    // Step 1: Initialize project
    const initArgs = {
      name: 'Metro Realty',
      preset: 'realtor-listing-hub',
      tier: 'advanced',
      features: ['payments', 'webhooks'],
      security: ['guardian', 'rls'],
      performance: ['caching', 'monitoring']
    };

    const context = {
      workingDirectory: '/test',
      environment: 'development' as const,
      verbose: false,
      dryRun: false,
      config: {
        clientName: initArgs.name,
        preset: initArgs.preset,
        tier: initArgs.tier,
        features: initArgs.features,
        security: initArgs.security,
        performance: initArgs.performance
      }
    };

    const initResult = await enhancedCLICommands.executeCommand('init', initArgs, context);
    expect(initResult.success).toBe(true);

    // Step 2: Setup development environment
    const devArgs = {
      environment: 'development',
      autoInstall: true,
      configureGit: true
    };

    const devResult = await enhancedCLICommands.executeCommand('dev:setup', devArgs, context);
    expect(devResult.success).toBe(true);

    // Step 3: Validate project
    const validateArgs = {
      strict: true,
      fix: true
    };

    const validateResult = await enhancedCLICommands.executeCommand('dev:validate', validateArgs, context);
    expect(validateResult.success).toBe(true);
  });
});
