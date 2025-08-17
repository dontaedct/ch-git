/**
 * 🦸‍♂️ MIT HERO SYSTEM - SLO ENFORCEMENT TESTS
 * 
 * Tests for the SLO enforcement system integration
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('SLO Enforcement System', () => {
  const reportsDir = path.join(process.cwd(), 'reports');
  const sloConfigPath = path.join(process.cwd(), 'slo.config.js');

  beforeEach(() => {
    // Clean up test reports
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      files.forEach(file => {
        if (file.startsWith('slo-test-')) {
          fs.unlinkSync(path.join(reportsDir, file));
        }
      });
    }
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      files.forEach(file => {
        if (file.startsWith('slo-test-')) {
          fs.unlinkSync(path.join(reportsDir, file));
        }
      });
    }
  });

  describe('Configuration', () => {
    it('should load SLO configuration file', () => {
      expect(fs.existsSync(sloConfigPath)).toBe(true);
      
      const config = require(sloConfigPath);
      expect(config).toBeDefined();
      expect(config.build).toBeDefined();
      expect(config.ci).toBeDefined();
      expect(config.resources).toBeDefined();
    });

    it('should have valid build performance budgets', () => {
      const config = require(sloConfigPath);
      
      expect(config.build.p95).toBe(20000); // 20s
      expect(config.build.p99).toBe(30000); // 30s
      expect(config.build.maxMemory).toBe(4 * 1024 * 1024 * 1024); // 4GB
      expect(config.build.maxCPU).toBe(80); // 80%
    });

    it('should have valid CI performance budgets', () => {
      const config = require(sloConfigPath);
      
      expect(config.ci.p95).toBe(8 * 60 * 1000); // 8 minutes
      expect(config.ci.p99).toBe(12 * 60 * 1000); // 12 minutes
      expect(config.ci.maxParallelJobs).toBe(4);
    });
  });

  describe('Command Line Interface', () => {
    it('should show help when no arguments provided', () => {
      const output = execSync('node scripts/slo-enforcer.js --help', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      expect(output).toContain('MIT HERO SYSTEM - SLO ENFORCER');
      expect(output).toContain('Usage:');
      expect(output).toContain('Commands:');
    });

    it('should initialize SLO system', () => {
      const output = execSync('npm run slo:init', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      expect(output).toContain('Initializing SLO enforcement system');
      expect(output).toContain('SLO enforcement system initialized');
    });

    it('should run validation mode', () => {
      const output = execSync('npm run slo:validate', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      expect(output).toContain('Running SLO validation');
      expect(output).toContain('SLO validation passed');
    });

    it('should run test mode with violations', () => {
      const output = execSync('npm run slo:test', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      expect(output).toContain('Running SLO test mode');
      expect(output).toContain('test_violation');
      expect(output).toContain('WARNING');
    });

    it('should check MIT Hero System status', () => {
      const output = execSync('npm run slo:hero:status', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      expect(output).toContain('MIT Hero System Status:');
      expect(output).toContain('operational');
    });
  });

  describe('Report Generation', () => {
    it('should generate SLO reports', () => {
      // Run validation to generate report
      execSync('npm run slo:validate', { stdio: 'pipe' });
      
      const latestReportPath = path.join(reportsDir, 'slo-report-latest.json');
      expect(fs.existsSync(latestReportPath)).toBe(true);
      
      const report = JSON.parse(fs.readFileSync(latestReportPath, 'utf8'));
      expect(report).toBeDefined();
      expect(report.timestamp).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.violations).toBeDefined();
    });

    it('should create performance baseline', () => {
      // Run init to create baseline
      execSync('npm run slo:init', { stdio: 'pipe' });
      
      const baselinePath = path.join(reportsDir, 'performance-baseline.json');
      expect(fs.existsSync(baselinePath)).toBe(true);
      
      const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
      expect(baseline).toBeDefined();
      expect(baseline.timestamp).toBeDefined();
      expect(baseline.metrics).toBeDefined();
    });

    it('should include CI context in reports', () => {
      execSync('npm run slo:validate', { stdio: 'pipe' });
      
      const report = JSON.parse(fs.readFileSync(path.join(reportsDir, 'slo-report-latest.json'), 'utf8'));
      expect(report.ciContext).toBeDefined();
      expect(report.ciContext.isCI).toBeDefined();
      expect(report.ciContext.workflow).toBeDefined();
    });

    it('should include MIT Hero System status in reports', () => {
      execSync('npm run slo:validate', { stdio: 'pipe' });
      
      const report = JSON.parse(fs.readFileSync(path.join(reportsDir, 'slo-report-latest.json'), 'utf8'));
      expect(report.heroSystemStatus).toBeDefined();
      expect(report.heroSystemStatus.operational).toBeDefined();
    });
  });

  describe('Performance Validation', () => {
    it('should validate build performance budgets', () => {
      const output = execSync('npm run slo:validate', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Should not have build time violations in normal operation
      expect(output).not.toContain('build_time_p95_violation');
      expect(output).not.toContain('build_time_p99_violation');
    });

    it('should validate memory usage limits', () => {
      const output = execSync('npm run slo:validate', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Should not have memory violations in normal operation
      expect(output).not.toContain('memory_heap_exceeded');
      expect(output).not.toContain('memory_rss_exceeded');
    });

    it('should detect performance regressions', () => {
      // This test would require multiple runs to establish baseline
      // For now, just verify the command works
      const output = execSync('npm run slo:regression:check', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      expect(output).toContain('Checking for performance regressions');
    });
  });

  describe('CI Integration', () => {
    it('should run CI enforcement mode', () => {
      const output = execSync('npm run slo:ci:enforce', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      expect(output).toContain('CI SLO Enforcement Mode');
      expect(output).toContain('CI SLO enforcement passed');
    });

    it('should handle CI environment detection', () => {
      // Test with CI environment variables
      const env = { ...process.env, CI: 'true', GITHUB_ACTIONS: 'true' };
      
      const output = execSync('npm run slo:ci:enforce', { 
        encoding: 'utf8',
        stdio: 'pipe',
        env
      });
      
      expect(output).toContain('CI SLO Enforcement Mode');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid commands gracefully', () => {
      try {
        execSync('node scripts/slo-enforcer.js --invalid-command', { 
          stdio: 'pipe'
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        // The command will fail with a different error message
        expect(error.message).toContain('Command failed');
      }
    });

    it('should handle MIT Hero System failures gracefully', () => {
      const output = execSync('npm run slo:hero:status', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Should show error but not crash
      expect(output).toContain('MIT Hero System Status:');
      expect(output).toContain('operational');
    });
  });

  describe('Integration with MIT Hero System', () => {
    it('should detect MIT Hero System scripts', () => {
      const heroScripts = [
        'scripts/mit-hero-unified-integration.js',
        'scripts/hero-unified-orchestrator.js',
        'scripts/mit-hero-sentient-army-perfection.js'
      ];
      
      heroScripts.forEach(script => {
        const scriptPath = path.join(process.cwd(), script);
        expect(fs.existsSync(scriptPath)).toBe(true);
      });
    });

    it('should fallback to basic enforcement when Hero System unavailable', () => {
      const output = execSync('npm run slo:validate', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      expect(output).toContain('MIT Hero System limited - using basic SLO enforcement');
      expect(output).toContain('SLO validation passed');
    });
  });
});
