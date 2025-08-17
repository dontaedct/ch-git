/**
 * @dct/mit-hero-core
 * MIT Hero Core Module - Comprehensive Unit Tests
 * 
 * Tests all main API functions, utilities, and core functionality
 * 
 * MIT-HERO-MOD: tests added; legacy removed
 */

import {
  createHeroCore,
  createHeroSystem,
  preflightRepo,
  preflightCsv,
  prepublishCms,
  applyFixes,
  rollback,
  generateReport,
  orchestrator,
  HeroCore,
  HeroSystem
} from '../src/index';

describe('MIT Hero Core - Core Types and Interfaces', () => {
  describe('HeroCore interface', () => {
    it('should create a valid HeroCore instance', () => {
      const hero = createHeroCore('TestHero', '1.0.0');
      
      expect(hero).toHaveProperty('id');
      expect(hero).toHaveProperty('name', 'TestHero');
      expect(hero).toHaveProperty('version', '1.0.0');
      expect(hero).toHaveProperty('status', 'active');
      expect(hero.id).toMatch(/^hero-\d+$/);
    });

    it('should generate valid hero IDs', () => {
      const hero1 = createHeroCore('Hero1', '1.0.0');
      const hero2 = createHeroCore('Hero2', '1.0.0');
      
      // Check that IDs follow the expected pattern
      expect(hero1.id).toMatch(/^hero-\d+$/);
      expect(hero2.id).toMatch(/^hero-\d+$/);
      
      // Check that IDs are strings
      expect(typeof hero1.id).toBe('string');
      expect(typeof hero2.id).toBe('string');
    });
  });

  describe('HeroSystem interface', () => {
    it('should create a valid HeroSystem instance', () => {
      const system = createHeroSystem('1.0.0');
      
      expect(system).toHaveProperty('heroes');
      expect(system).toHaveProperty('version', '1.0.0');
      expect(system).toHaveProperty('status', 'operational');
      expect(Array.isArray(system.heroes)).toBe(true);
      expect(system.heroes).toHaveLength(0);
    });
  });
});

describe('MIT Hero Core - Main API Functions', () => {
  describe('preflightRepo', () => {
    it('should return successful preflight result', () => {
      const result = preflightRepo();
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations).toContain('Repository health check completed');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('preflightCsv', () => {
    it('should return successful CSV preflight result', () => {
      const csvPath = '/path/to/test.csv';
      const result = preflightCsv(csvPath);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations).toContain(`CSV validation completed for ${csvPath}`);
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle different CSV paths', () => {
      const result1 = preflightCsv('/path1/file1.csv');
      const result2 = preflightCsv('/path2/file2.csv');
      
      expect(result1.recommendations[0]).toContain('/path1/file1.csv');
      expect(result2.recommendations[0]).toContain('/path2/file2.csv');
    });
  });

  describe('prepublishCms', () => {
    it('should return successful CMS prepublish result', () => {
      const cmsPath = '/path/to/cms';
      const result = prepublishCms(cmsPath);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations).toContain(`CMS validation completed for ${cmsPath}`);
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('applyFixes', () => {
    it('should return successful fix application result', () => {
      const issues = ['issue1', 'issue2', 'issue3'];
      const result = applyFixes(issues);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('appliedFixes');
      expect(result).toHaveProperty('failedFixes');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.appliedFixes)).toBe(true);
      expect(Array.isArray(result.failedFixes)).toBe(true);
      expect(result.appliedFixes).toEqual(issues);
      expect(result.failedFixes).toHaveLength(0);
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle empty issues array', () => {
      const result = applyFixes([]);
      
      expect(result.success).toBe(true);
      expect(result.appliedFixes).toHaveLength(0);
      expect(result.failedFixes).toHaveLength(0);
    });
  });

  describe('rollback', () => {
    it('should return successful rollback result', () => {
      const result = rollback();
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('rolledBackChanges');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.rolledBackChanges)).toBe(true);
      expect(result.rolledBackChanges).toContain('System restored to previous state');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('generateReport', () => {
    it('should return comprehensive system report', () => {
      const result = generateReport();
      
      expect(result).toHaveProperty('systemHealth');
      expect(result).toHaveProperty('performanceMetrics');
      expect(result).toHaveProperty('recentOperations');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('timestamp');
      expect(result.systemHealth).toBe('operational');
      expect(result.performanceMetrics).toBe('optimal');
      expect(Array.isArray(result.recentOperations)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recentOperations).toContain('All systems operational');
      expect(result.recommendations).toContain('Continue monitoring');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });
});

describe('MIT Hero Core - Orchestrator Instance', () => {
  describe('orchestrator', () => {
    it('should have correct properties', () => {
      expect(orchestrator).toHaveProperty('status');
      expect(orchestrator).toHaveProperty('version');
      expect(orchestrator).toHaveProperty('getStatus');
      expect(typeof orchestrator.getStatus).toBe('function');
    });

    it('should return correct status', () => {
      const status = orchestrator.getStatus();
      
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('version');
      expect(status.status).toBe('operational');
      expect(status.version).toBe('0.2.0');
    });

    it('should have operational status', () => {
      expect(orchestrator.status).toBe('operational');
    });

    it('should have correct version', () => {
      expect(orchestrator.version).toBe('0.2.0');
    });
  });
});

describe('MIT Hero Core - Integration Tests', () => {
  it('should work together as a complete system', () => {
    // Create a hero system
    const system = createHeroSystem('1.0.0');
    
    // Add heroes to the system
    const hero1 = createHeroCore('Hero1', '1.0.0');
    const hero2 = createHeroCore('Hero2', '1.0.0');
    
    // Simulate system operations
    const preflightResult = preflightRepo();
    const csvResult = preflightCsv('/test.csv');
    const cmsResult = prepublishCms('/test/cms');
    
    // Verify all operations succeeded
    expect(preflightResult.success).toBe(true);
    expect(csvResult.success).toBe(true);
    expect(cmsResult.success).toBe(true);
    
    // Generate final report
    const report = generateReport();
    expect(report.systemHealth).toBe('operational');
  });

  it('should handle error scenarios gracefully', () => {
    // Test with problematic inputs
    const result = applyFixes(['invalid-issue']);
    expect(result.success).toBe(true);
    expect(result.appliedFixes).toContain('invalid-issue');
  });
});

describe('MIT Hero Core - Performance Tests', () => {
  it('should create heroes quickly', () => {
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      createHeroCore(`Hero${i}`, '1.0.0');
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Should complete in under 100ms
    expect(duration).toBeLessThan(100);
  });

  it('should generate reports efficiently', () => {
    const start = performance.now();
    
    for (let i = 0; i < 50; i++) {
      generateReport();
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Should complete in under 50ms
    expect(duration).toBeLessThan(50);
  });
});
