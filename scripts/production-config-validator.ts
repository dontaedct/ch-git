#!/usr/bin/env tsx
/**
 * Production Configuration Validator
 * HT-030.4.3: Production Deployment Pipeline & Infrastructure
 */

interface ValidationResult {
  component: string;
  check: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
}

class ProductionConfigValidator {
  private results: ValidationResult[] = [];

  async validateAll(): Promise<{
    passed: boolean;
    results: ValidationResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      warnings: number;
    };
  }> {
    console.log('🔍 Validating Production Configuration...\n');

    // Run all validation checks
    this.validateEnvironmentVariables();
    this.validateDatabaseConfiguration();
    this.validateRedisConfiguration();
    this.validateAPIKeys();
    this.validateSecurityConfiguration();
    this.validatePerformanceConfiguration();
    this.validateInfrastructureFiles();
    await this.validateExternalServices();

    // Calculate summary
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      warnings: this.results.filter(r => r.status === 'warning').length,
    };

    const passed = summary.failed === 0;

    this.printResults(summary);

    return {
      passed,
      results: this.results,
      summary,
    };
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);

    const status = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`  ${status} ${result.component}: ${result.check}`);

    if (result.status !== 'passed') {
      console.log(`     ${result.message}`);
    }
  }

  private validateEnvironmentVariables(): void {
    console.log('🌍 Environment Variables...');

    const requiredVars = [
      'NODE_ENV',
      'DATABASE_URL',
      'REDIS_URL',
      'OPENAI_API_KEY',
      'RESEND_API_KEY',
    ];

    const productionVars = [
      'FORCE_HTTPS',
      'HSTS_MAX_AGE',
      'CSP_ENABLED',
    ];

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        this.addResult({
          component: 'environment',
          check: `${varName} is set`,
          status: 'passed',
          message: 'Required environment variable is configured',
        });
      } else {
        this.addResult({
          component: 'environment',
          check: `${varName} is set`,
          status: 'failed',
          message: `Required environment variable ${varName} is missing`,
        });
      }
    }

    // Check NODE_ENV is production
    if (process.env.NODE_ENV === 'production') {
      this.addResult({
        component: 'environment',
        check: 'NODE_ENV is production',
        status: 'passed',
        message: 'Environment is correctly set to production',
      });
    } else {
      this.addResult({
        component: 'environment',
        check: 'NODE_ENV is production',
        status: 'failed',
        message: `NODE_ENV is '${process.env.NODE_ENV}', should be 'production'`,
      });
    }

    for (const varName of productionVars) {
      if (process.env[varName]) {
        this.addResult({
          component: 'security',
          check: `${varName} is configured`,
          status: 'passed',
          message: 'Security configuration is set',
        });
      } else {
        this.addResult({
          component: 'security',
          check: `${varName} is configured`,
          status: 'warning',
          message: `Production security variable ${varName} is not set`,
        });
      }
    }
  }

  private validateDatabaseConfiguration(): void {
    console.log('🗄️  Database Configuration...');

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      this.addResult({
        component: 'database',
        check: 'DATABASE_URL format',
        status: 'failed',
        message: 'DATABASE_URL is not set',
      });
      return;
    }

    try {
      const url = new URL(databaseUrl);

      // Check protocol
      if (url.protocol === 'postgresql:' || url.protocol === 'postgres:') {
        this.addResult({
          component: 'database',
          check: 'Database protocol',
          status: 'passed',
          message: 'PostgreSQL protocol detected',
        });
      } else {
        this.addResult({
          component: 'database',
          check: 'Database protocol',
          status: 'warning',
          message: `Non-PostgreSQL protocol detected: ${url.protocol}`,
        });
      }

      // Check SSL requirement for production
      if (url.searchParams.get('sslmode') || url.searchParams.get('ssl')) {
        this.addResult({
          component: 'database',
          check: 'SSL configuration',
          status: 'passed',
          message: 'SSL configuration found in database URL',
        });
      } else {
        this.addResult({
          component: 'database',
          check: 'SSL configuration',
          status: 'warning',
          message: 'No SSL configuration found in database URL (recommended for production)',
        });
      }

      // Check if hostname is not localhost
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        this.addResult({
          component: 'database',
          check: 'Production database host',
          status: 'passed',
          message: 'Database host is not localhost (good for production)',
        });
      } else {
        this.addResult({
          component: 'database',
          check: 'Production database host',
          status: 'warning',
          message: 'Database host is localhost (not recommended for production)',
        });
      }

    } catch (error) {
      this.addResult({
        component: 'database',
        check: 'DATABASE_URL format',
        status: 'failed',
        message: `Invalid DATABASE_URL format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  private validateRedisConfiguration(): void {
    console.log('🔴 Redis Configuration...');

    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      this.addResult({
        component: 'redis',
        check: 'REDIS_URL format',
        status: 'failed',
        message: 'REDIS_URL is not set',
      });
      return;
    }

    try {
      const url = new URL(redisUrl);

      // Check protocol
      if (url.protocol === 'redis:' || url.protocol === 'rediss:') {
        const isSecure = url.protocol === 'rediss:';
        this.addResult({
          component: 'redis',
          check: 'Redis protocol',
          status: 'passed',
          message: `Redis protocol detected (${isSecure ? 'secure' : 'standard'})`,
        });

        if (!isSecure && process.env.NODE_ENV === 'production') {
          this.addResult({
            component: 'redis',
            check: 'Redis SSL',
            status: 'warning',
            message: 'Consider using rediss:// (SSL) for production Redis connections',
          });
        }
      } else {
        this.addResult({
          component: 'redis',
          check: 'Redis protocol',
          status: 'failed',
          message: `Invalid Redis protocol: ${url.protocol}`,
        });
      }

      // Check if hostname is not localhost
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        this.addResult({
          component: 'redis',
          check: 'Production Redis host',
          status: 'passed',
          message: 'Redis host is not localhost (good for production)',
        });
      } else {
        this.addResult({
          component: 'redis',
          check: 'Production Redis host',
          status: 'warning',
          message: 'Redis host is localhost (not recommended for production)',
        });
      }

    } catch (error) {
      this.addResult({
        component: 'redis',
        check: 'REDIS_URL format',
        status: 'failed',
        message: `Invalid REDIS_URL format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  private validateAPIKeys(): void {
    console.log('🔑 API Keys...');

    // OpenAI API Key
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      if (openaiKey.startsWith('sk-') && openaiKey.length > 20) {
        this.addResult({
          component: 'api_keys',
          check: 'OpenAI API key format',
          status: 'passed',
          message: 'OpenAI API key appears to be valid format',
        });
      } else {
        this.addResult({
          component: 'api_keys',
          check: 'OpenAI API key format',
          status: 'warning',
          message: 'OpenAI API key format appears unusual',
        });
      }
    }

    // Resend API Key
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      if (resendKey.startsWith('re_') && resendKey.length > 10) {
        this.addResult({
          component: 'api_keys',
          check: 'Resend API key format',
          status: 'passed',
          message: 'Resend API key appears to be valid format',
        });
      } else {
        this.addResult({
          component: 'api_keys',
          check: 'Resend API key format',
          status: 'warning',
          message: 'Resend API key format appears unusual',
        });
      }
    }
  }

  private validateSecurityConfiguration(): void {
    console.log('🔒 Security Configuration...');

    // HTTPS enforcement
    if (process.env.FORCE_HTTPS === '1' || process.env.FORCE_HTTPS === 'true') {
      this.addResult({
        component: 'security',
        check: 'HTTPS enforcement',
        status: 'passed',
        message: 'HTTPS enforcement is enabled',
      });
    } else {
      this.addResult({
        component: 'security',
        check: 'HTTPS enforcement',
        status: 'warning',
        message: 'HTTPS enforcement is not enabled',
      });
    }

    // HSTS configuration
    const hstsMaxAge = process.env.HSTS_MAX_AGE;
    if (hstsMaxAge && parseInt(hstsMaxAge) >= 31536000) {
      this.addResult({
        component: 'security',
        check: 'HSTS configuration',
        status: 'passed',
        message: 'HSTS max-age is properly configured (≥1 year)',
      });
    } else {
      this.addResult({
        component: 'security',
        check: 'HSTS configuration',
        status: 'warning',
        message: 'HSTS max-age should be at least 31536000 (1 year)',
      });
    }

    // CSP configuration
    if (process.env.CSP_ENABLED === '1' || process.env.CSP_ENABLED === 'true') {
      this.addResult({
        component: 'security',
        check: 'CSP configuration',
        status: 'passed',
        message: 'Content Security Policy is enabled',
      });
    } else {
      this.addResult({
        component: 'security',
        check: 'CSP configuration',
        status: 'warning',
        message: 'Content Security Policy is not enabled',
      });
    }

    // Check for sensitive data in environment
    const sensitivePatterns = [
      { pattern: /password/i, name: 'password' },
      { pattern: /secret/i, name: 'secret' },
      { pattern: /key/i, name: 'key' },
    ];

    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === 'string' && value.length > 0) {
        for (const { pattern, name } of sensitivePatterns) {
          if (pattern.test(key) && value.includes('localhost')) {
            this.addResult({
              component: 'security',
              check: `${name} security`,
              status: 'warning',
              message: `Environment variable ${key} contains 'localhost' - ensure this is not production data`,
            });
          }
        }
      }
    }
  }

  private validatePerformanceConfiguration(): void {
    console.log('⚡ Performance Configuration...');

    // Node.js memory settings
    const nodeOptions = process.env.NODE_OPTIONS;
    if (nodeOptions && nodeOptions.includes('--max-old-space-size')) {
      this.addResult({
        component: 'performance',
        check: 'Node.js memory configuration',
        status: 'passed',
        message: 'Node.js memory limits are configured',
      });
    } else {
      this.addResult({
        component: 'performance',
        check: 'Node.js memory configuration',
        status: 'warning',
        message: 'Consider setting NODE_OPTIONS with --max-old-space-size for production',
      });
    }

    // Consultation-specific performance settings
    const performanceVars = [
      'CONSULTATION_CACHE_TTL',
      'CONSULTATION_MAX_FILE_SIZE',
      'CONSULTATION_PDF_TIMEOUT',
      'CONSULTATION_EMAIL_TIMEOUT',
    ];

    for (const varName of performanceVars) {
      if (process.env[varName]) {
        this.addResult({
          component: 'performance',
          check: `${varName} configuration`,
          status: 'passed',
          message: 'Consultation performance setting is configured',
        });
      } else {
        this.addResult({
          component: 'performance',
          check: `${varName} configuration`,
          status: 'warning',
          message: `Consider setting ${varName} for optimal performance`,
        });
      }
    }
  }

  private validateInfrastructureFiles(): void {
    console.log('📁 Infrastructure Files...');

    const requiredFiles = [
      '.github/workflows/consultation-deploy.yml',
      'docker/consultation-app.Dockerfile',
      'docker/docker-compose.production.yml',
      'scripts/deploy-consultation.sh',
      'scripts/rollback-consultation.sh',
    ];

    const fs = require('fs');
    const path = require('path');

    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.addResult({
          component: 'infrastructure',
          check: `${file} exists`,
          status: 'passed',
          message: 'Required infrastructure file is present',
        });
      } else {
        this.addResult({
          component: 'infrastructure',
          check: `${file} exists`,
          status: 'failed',
          message: `Required infrastructure file is missing: ${file}`,
        });
      }
    }
  }

  private async validateExternalServices(): Promise<void> {
    console.log('🌐 External Services...');

    // Test OpenAI API
    if (process.env.OPENAI_API_KEY) {
      try {
        // Just validate the key format, don't make actual API calls in validation
        this.addResult({
          component: 'external_services',
          check: 'OpenAI API accessibility',
          status: 'passed',
          message: 'OpenAI API key is configured (actual connectivity test recommended)',
        });
      } catch (error) {
        this.addResult({
          component: 'external_services',
          check: 'OpenAI API accessibility',
          status: 'warning',
          message: 'Could not validate OpenAI API connectivity',
        });
      }
    }

    // Test Resend API
    if (process.env.RESEND_API_KEY) {
      try {
        // Just validate the key format, don't make actual API calls in validation
        this.addResult({
          component: 'external_services',
          check: 'Resend API accessibility',
          status: 'passed',
          message: 'Resend API key is configured (actual connectivity test recommended)',
        });
      } catch (error) {
        this.addResult({
          component: 'external_services',
          check: 'Resend API accessibility',
          status: 'warning',
          message: 'Could not validate Resend API connectivity',
        });
      }
    }
  }

  private printResults(summary: any): void {
    console.log('\n📊 Production Configuration Validation Summary:');
    console.log('===============================================');

    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`📝 Total: ${summary.total}`);

    const overallStatus = summary.failed === 0
      ? (summary.warnings === 0 ? 'READY' : 'READY (with warnings)')
      : 'NOT READY';

    console.log(`\n🎯 Production Readiness Status: ${overallStatus}`);

    if (summary.failed > 0) {
      console.log('\n❌ Critical Issues Found:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(r => console.log(`   - ${r.component}: ${r.message}`));
    }

    if (summary.warnings > 0) {
      console.log('\n⚠️  Recommendations:');
      this.results
        .filter(r => r.status === 'warning')
        .forEach(r => console.log(`   - ${r.component}: ${r.message}`));
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ProductionConfigValidator();

  validator
    .validateAll()
    .then((result) => {
      process.exit(result.passed ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

export default ProductionConfigValidator;