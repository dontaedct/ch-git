#!/usr/bin/env tsx

/**
 * Tripwire: Module System Drift Detection
 * 
 * Detects mixed module patterns that could cause build issues.
 * Fails CI when CommonJS patterns appear in ESM project.
 * 
 * Universal Header Compliance:
 * - Follows AUDIT → DECIDE → APPLY → VERIFY process
 * - Reports findings only when >10 issues detected
 * - Uses @lib/* imports for utilities
 */

import fs from 'node:fs';
import path from 'node:path';
import fastGlob from 'fast-glob';
import picocolors from 'picocolors';

const { glob } = fastGlob;
const { red, green, yellow, blue, cyan } = picocolors;

interface DriftIssue {
  file: string;
  line: number;
  pattern: string;
  severity: 'error' | 'warning';
  message: string;
}

interface ModuleConfig {
  type: 'module' | 'commonjs' | undefined;
  tsModuleResolution: string;
  tsModule: string;
}

class ModuleDriftDetector {
  private issues: DriftIssue[] = [];
  private config: ModuleConfig;

  constructor() {
    this.config = this.loadModuleConfig();
  }

  private loadModuleConfig(): ModuleConfig {
    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Read tsconfig.json
    const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    
    return {
      type: packageJson.type,
      tsModuleResolution: tsConfig.compilerOptions?.moduleResolution || 'node',
      tsModule: tsConfig.compilerOptions?.module || 'commonjs'
    };
  }

  async detectDrift(): Promise<DriftIssue[]> {
    console.log(blue('🔍 Scanning for module system drift...'));
    
    // AUDIT: Check all relevant files
    await this.scanScripts();
    await this.scanAppCode();
    await this.scanConfigFiles();
    
    return this.issues;
  }

  private async scanScripts(): Promise<void> {
    const scriptFiles = await glob('scripts/**/*.{js,ts,mjs,cjs}', {
      ignore: ['**/node_modules/**', '**/*.backup.*']
    });

    for (const file of scriptFiles) {
      await this.scanFile(file, 'script');
    }
  }

  private async scanAppCode(): Promise<void> {
    const appFiles = await glob('{app,components,lib,data}/**/*.{js,ts,tsx}', {
      ignore: ['**/node_modules/**', '**/*.backup.*']
    });

    for (const file of appFiles) {
      await this.scanFile(file, 'app');
    }
  }

  private async scanConfigFiles(): Promise<void> {
    const configFiles = [
      'next.config.ts',
      'next.config.js', 
      'jest.config.js',
      'postcss.config.js',
      'tailwind.config.js'
    ].filter(file => fs.existsSync(file));

    for (const file of configFiles) {
      await this.scanFile(file, 'config');
    }
  }

  private async scanFile(filePath: string, context: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // DECIDE: Check for problematic patterns based on project type
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for CommonJS in ESM project
      if (this.config.type === 'module') {
        this.checkCommonJSInESM(filePath, lineNum, line, context);
      }
      
      // Check for mixed patterns regardless of config
      this.checkMixedPatterns(filePath, lineNum, line, context);
      
      // Check for dangerous patterns
      this.checkDangerousPatterns(filePath, lineNum, line, context);
    });
  }

  private checkCommonJSInESM(filePath: string, lineNum: number, line: string, context: string): void {
    // CommonJS require in ESM project
    if (/^\s*(const|let|var)\s+.+\s*=\s*require\s*\(/.test(line)) {
      // Allow in .cjs files
      if (!filePath.endsWith('.cjs')) {
        this.addIssue(filePath, lineNum, line.trim(), 'error', 
          'CommonJS require() in ESM project - convert to import');
      }
    }

    // module.exports in ESM project  
    if (/^\s*module\.exports\s*=/.test(line)) {
      if (!filePath.endsWith('.cjs')) {
        this.addIssue(filePath, lineNum, line.trim(), 'error',
          'CommonJS module.exports in ESM project - convert to export');
      }
    }

    // __dirname/__filename without ESM polyfill
    if (/__dirname|__filename/.test(line) && !filePath.endsWith('.cjs')) {
      const hasPolyfill = fs.readFileSync(filePath, 'utf8').includes('fileURLToPath');
      if (!hasPolyfill) {
        this.addIssue(filePath, lineNum, line.trim(), 'warning',
          '__dirname/__filename requires ESM polyfill (fileURLToPath)');
      }
    }
  }

  private checkMixedPatterns(filePath: string, lineNum: number, line: string, context: string): void {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Mixed import/require in same file
    const hasImport = /^\s*import\s/.test(content);
    const hasRequire = /^\s*(const|let|var)\s+.+\s*=\s*require\s*\(/.test(content);
    
    if (hasImport && hasRequire && /^\s*import\s/.test(line)) {
      this.addIssue(filePath, lineNum, line.trim(), 'warning',
        'Mixed import/require patterns in same file');
    }
  }

  private checkDangerousPatterns(filePath: string, lineNum: number, line: string, context: string): void {
    // Relative imports that bypass path mapping
    if (/import.*from\s+['"]\.\.\/\.\.\//.test(line) && context === 'app') {
      this.addIssue(filePath, lineNum, line.trim(), 'warning',
        'Deep relative import - use @lib/* or @app/* aliases');
    }

    // Non-Node prefixed imports for Node modules
    if (/import.*from\s+['"](?:fs|path|os|util|crypto|events)['"]/.test(line)) {
      this.addIssue(filePath, lineNum, line.trim(), 'warning',
        'Use node: prefix for Node.js modules (e.g., "node:fs")');
    }
  }

  private addIssue(file: string, line: number, pattern: string, severity: 'error' | 'warning', message: string): void {
    this.issues.push({ file, line, pattern, severity, message });
  }

  generateReport(): boolean {
    const errors = this.issues.filter(issue => issue.severity === 'error');
    const warnings = this.issues.filter(issue => issue.severity === 'warning');

    console.log(cyan('\n📊 Module System Drift Report'));
    console.log('='.repeat(50));
    
    console.log(`Project Configuration:`);
    console.log(`  Type: ${this.config.type || 'commonjs'} (package.json)`);
    console.log(`  TS Module: ${this.config.tsModule} (tsconfig.json)`);
    console.log(`  TS Resolution: ${this.config.tsModuleResolution} (tsconfig.json)`);

    if (this.issues.length === 0) {
      console.log(green('\n✅ No module system drift detected'));
      return true;
    }

    // Report only if >10 issues (Universal Header rule)
    if (this.issues.length > 10) {
      console.log(yellow(`\n⚠️  Found ${this.issues.length} issues (reporting due to >10 threshold)`));
      
      // Group by file
      const byFile = new Map<string, DriftIssue[]>();
      this.issues.forEach(issue => {
        if (!byFile.has(issue.file)) byFile.set(issue.file, []);
        byFile.get(issue.file)!.push(issue);
      });

      byFile.forEach((issues, file) => {
        console.log(cyan(`\n📄 ${file}`));
        issues.forEach(issue => {
          const icon = issue.severity === 'error' ? '❌' : '⚠️';
          console.log(`  ${icon} Line ${issue.line}: ${issue.message}`);
          console.log(`     Pattern: ${issue.pattern}`);
        });
      });
    } else {
      console.log(`\n✅ Found ${this.issues.length} minor issues (under reporting threshold)`);
    }

    // APPLY: Fail CI on errors
    if (errors.length > 0) {
      console.log(red(`\n💥 FAILED: ${errors.length} errors must be fixed`));
      console.log('Run: node scripts/codemods/convert-to-esm.mjs --dry-run');
      return false;
    }

    if (warnings.length > 5) {
      console.log(yellow(`\n⚠️  WARNING: ${warnings.length} warnings detected`));
      console.log('Consider running: node scripts/codemods/convert-to-esm.mjs');
    }

    return true;
  }
}

// VERIFY: CLI execution
async function main(): Promise<void> {
  try {
    const detector = new ModuleDriftDetector();
    await detector.detectDrift();
    const success = detector.generateReport();
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(red('❌ Tripwire failed:'), error.message);
    process.exit(1);
  }
}

// Always run main when executed directly
main();

export { ModuleDriftDetector };
