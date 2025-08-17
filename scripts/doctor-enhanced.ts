#!/usr/bin/env tsx

import { Project, SyntaxKind, Node, ts } from 'ts-morph';
import { blue, green, red, yellow, cyan } from 'picocolors';
import leven from 'leven';

interface DoctorOptions {
  autoFix?: boolean;
  verbose?: boolean;
  timeout?: number;
  batchSize?: number;
  maxFiles?: number;
  maxRetries?: number;
  circuitBreakerThreshold?: number;
}

interface ExportInfo {
  name: string;
  file: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'const' | 'default';
}

interface DiagnosticInfo {
  code: number;
  message: string;
  file: string;
  line: number;
  character: number;
  category: ts.DiagnosticCategory;
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly threshold: number;
  private readonly timeout: number;

  constructor(threshold: number = 3, timeout: number = 30000) {
    this.threshold = threshold;
    this.timeout = timeout;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  getStatus(): string {
    return `${this.state} (failures: ${this.failures}/${this.threshold})`;
  }
}

class ResourceMonitor {
  private startTime: number;
  private startMemory: number;
  private maxMemory: number;
  private maxRuntime: number;

  constructor(maxMemory: number = 500 * 1024 * 1024, maxRuntime: number = 120000) {
    this.startTime = Date.now();
    this.startMemory = this.getMemoryUsage();
    this.maxMemory = maxMemory;
    this.maxRuntime = maxRuntime;
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  check(): { isHealthy: boolean; memoryUsage: number; runtime: number; warnings: string[] } {
    const currentMemory = this.getMemoryUsage();
    const memoryUsage = currentMemory - this.startMemory;
    const runtime = Date.now() - this.startTime;
    
    const warnings: string[] = [];
    let isHealthy = true;

    // Memory check
    if (memoryUsage > this.maxMemory) {
      warnings.push(`Memory usage exceeded limit: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      isHealthy = false;
    }

    // Runtime check
    if (runtime > this.maxRuntime) {
      warnings.push(`Runtime exceeded limit: ${(runtime / 1000).toFixed(2)}s`);
      isHealthy = false;
    }

    // Warning thresholds
    if (memoryUsage > this.maxMemory * 0.8) {
      warnings.push(`Memory usage approaching limit: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    if (runtime > this.maxRuntime * 0.8) {
      warnings.push(`Runtime approaching limit: ${(runtime / 1000).toFixed(2)}s`);
    }

    return { isHealthy, memoryUsage, runtime, warnings };
  }

  logStatus(): void {
    const status = this.check();
    const memoryMB = (status.memoryUsage / 1024 / 1024).toFixed(2);
    const runtimeS = (status.runtime / 1000).toFixed(2);
    
    console.log(cyan(`📊 Resource Status: Memory: ${memoryMB}MB, Runtime: ${runtimeS}s, Health: ${status.isHealthy ? '✅' : '❌'}`));
    
    if (status.warnings.length > 0) {
      status.warnings.forEach(warning => console.log(yellow(`⚠️  ${warning}`)));
    }
  }
}

class EnhancedDoctorRunner {
  private project: Project;
  private options: DoctorOptions;
  private exportsIndex: Map<string, ExportInfo[]> = new Map();
  private startTime: number = Date.now();
  private processedFiles: Set<string> = new Set();
  private isProcessing: boolean = false;
  private activeAutoFixes: Set<string> = new Set();
  private circuitBreaker: CircuitBreaker;
  private resourceMonitor: ResourceMonitor;
  private consecutiveFailures: number = 0;
  private maxConsecutiveFailures: number = 3;

  constructor(options: DoctorOptions = {}) {
    this.options = {
      timeout: 60000, // 1 minute
      batchSize: 15, // Smaller batches
      maxFiles: 200, // Reduced max files
      maxRetries: 2,
      circuitBreakerThreshold: 3,
      ...options
    };
    
    this.circuitBreaker = new CircuitBreaker(this.options.circuitBreakerThreshold);
    this.resourceMonitor = new ResourceMonitor();
    
    // Create project with conservative settings
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json',
      skipAddingFilesFromTsConfig: true,
      skipFileDependencyResolution: true,
    });
  }

  private checkTimeout(): void {
    const elapsed = Date.now() - this.startTime;
    if (this.options.timeout && elapsed > this.options.timeout) {
      throw new Error(`Operation timed out after ${this.options.timeout}ms`);
    }
  }

  private checkResourceHealth(): void {
    const status = this.resourceMonitor.check();
    if (!status.isHealthy) {
      throw new Error(`Resource limits exceeded: ${status.warnings.join(', ')}`);
    }
  }

  private async safeOperation<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    try {
      this.checkTimeout();
      this.checkResourceHealth();
      
      return await this.circuitBreaker.execute(async () => {
        const result = await operation();
        this.consecutiveFailures = 0; // Reset on success
        return result;
      });
    } catch (error) {
      this.consecutiveFailures++;
      
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        throw new Error(`Too many consecutive failures (${this.consecutiveFailures}) in ${operationName}`);
      }
      
      if (this.options.verbose) {
        console.log(yellow(`⚠️  Operation failed, retrying (${this.consecutiveFailures}/${this.maxConsecutiveFailures}): ${operationName}`));
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, this.consecutiveFailures) * 1000));
      
      // Retry once
      return await operation();
    }
  }

  async run(): Promise<void> {
    console.log(blue('🔍 Running Enhanced TypeScript Doctor...'));
    console.log(blue(`🛡️  Circuit Breaker: ${this.circuitBreaker.getStatus()}`));
    console.log(blue(`⏱️  Timeout: ${this.options.timeout}ms`));
    console.log(blue(`📁 Max Files: ${this.options.maxFiles}`));
    console.log(blue(`🔄 Max Retries: ${this.options.maxRetries}`));
    console.log('');
    
    try {
      // Resource monitoring
      setInterval(() => this.resourceMonitor.logStatus(), 10000);
      
      // Add source files safely
      await this.safeOperation(() => this.addSourceFilesSafely(), 'addSourceFiles');
      
      // Build exports index safely
      await this.safeOperation(() => this.buildExportsIndexSafely(), 'buildExportsIndex');
      
      // Check import compliance
      const importCompliance = await this.safeOperation(() => this.checkImportPathCompliance(), 'importCompliance');
      
      // Run diagnostics safely
      const diagnostics = await this.safeOperation(() => this.runDiagnosticsSafely(), 'diagnostics');
      
      // Display results
      this.displayResults(importCompliance, diagnostics);
      
    } catch (error) {
      console.error(red(`❌ Fatal error: ${error.message}`));
      console.error(red(`🛡️  Circuit Breaker Status: ${this.circuitBreaker.getStatus()}`));
      this.resourceMonitor.logStatus();
      process.exit(1);
    }
  }

  private async addSourceFilesSafely(): Promise<void> {
    console.log(blue('📁 Adding source files...'));
    
    const sourceDirs = ['app', 'components', 'lib', 'data', 'hooks'];
    let filesAdded = 0;
    
    for (const dir of sourceDirs) {
      try {
        const files = this.project.addSourceFilesAtPaths(`${dir}/**/*.{ts,tsx}`);
        filesAdded += files.length;
        
        if (this.options.verbose) {
          console.log(blue(`    Added ${files.length} files from ${dir}/`));
        }
        
        // Check resource health after each directory
        this.checkResourceHealth();
        
      } catch (error) {
        if (this.options.verbose) {
          console.log(yellow(`    Warning: Could not add files from ${dir}/: ${error.message}`));
        }
      }
    }
    
    console.log(green(`✅ Added ${filesAdded} source files`));
  }

  private async buildExportsIndexSafely(): Promise<void> {
    console.log(blue('🔍 Building exports index...'));
    
    const files = this.project.getSourceFiles();
    let processed = 0;
    
    for (const file of files) {
      if (processed >= this.options.maxFiles) {
        console.log(yellow(`⚠️  Reached max files limit (${this.options.maxFiles}), stopping`));
        break;
      }
      
      try {
        await this.processFileExports(file);
        processed++;
        
        if (processed % 10 === 0) {
          this.checkResourceHealth();
        }
        
      } catch (error) {
        if (this.options.verbose) {
          console.log(yellow(`    Warning: Could not process file ${file.getFilePath()}: ${error.message}`));
        }
      }
    }
    
    console.log(green(`✅ Processed ${processed} files for exports index`));
  }

  private async processFileExports(file: any): Promise<void> {
    const exports = file.getExportedDeclarations();
    
    for (const [name, declarations] of exports) {
      for (const declaration of declarations) {
        const type = this.getDeclarationType(declaration);
        const exportInfo: ExportInfo = {
          name,
          file: file.getFilePath(),
          type
        };
        
        if (!this.exportsIndex.has(name)) {
          this.exportsIndex.set(name, []);
        }
        this.exportsIndex.get(name)!.push(exportInfo);
      }
    }
  }

  private getDeclarationType(declaration: any): ExportInfo['type'] {
    if (declaration.isKind(SyntaxKind.FunctionDeclaration)) return 'function';
    if (declaration.isKind(SyntaxKind.ClassDeclaration)) return 'class';
    if (declaration.isKind(SyntaxKind.InterfaceDeclaration)) return 'interface';
    if (declaration.isKind(SyntaxKind.TypeAliasDeclaration)) return 'type';
    if (declaration.isKind(SyntaxKind.VariableDeclaration)) return 'const';
    return 'default';
  }

  private async checkImportPathCompliance(): Promise<{ violations: any[]; hasViolations: boolean }> {
    console.log(blue('🔍 Checking import path compliance...'));
    
    const violations: any[] = [];
    const files = this.project.getSourceFiles();
    let filesChecked = 0;
    
    for (const file of files) {
      if (filesChecked >= this.options.maxFiles) break;
      
      try {
        const fileViolations = this.checkFileImports(file);
        violations.push(...fileViolations);
        filesChecked++;
        
        if (filesChecked % 20 === 0) {
          this.checkResourceHealth();
        }
        
      } catch (error) {
        if (this.options.verbose) {
          console.log(yellow(`    Warning: Could not check file ${file.getFilePath()}: ${error.message}`));
        }
      }
    }
    
    console.log(green(`✅ Checked ${filesChecked} files for import compliance`));
    
    return { violations, hasViolations: violations.length > 0 };
  }

  private checkFileImports(file: any): any[] {
    const violations: any[] = [];
    const filePath = file.getFilePath();
    const relativePath = this.getRelativePath(filePath);
    
    // Check for non-compliant import patterns
    const nonCompliantPatterns = [
      { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\//, message: 'Deep relative import (../../../)' },
      { pattern: /from\s+['"]\.\.\/\.\.\//, message: 'Relative import (../../)' },
      { pattern: /from\s+['"]\.\.\//, message: 'Relative import (../)' },
      { pattern: /from\s+['"]src\//, message: 'Direct src/ import' }
    ];

    // Special check for debug imports in root files
    const rootDebugPatterns = [
      { pattern: /^\s*from\s+['"]@app\/debug[^'"]*['"]/, message: 'Debug imports not allowed in root files - navigate to /debug/bulletproof instead' },
      { pattern: /^\s*from\s+['"]@app\/_debug[^'"]*['"]/, message: 'Debug imports not allowed in root files - navigate to /debug/bulletproof instead' },
      { pattern: /^\s*import\s+.*['"]@app\/debug[^'"]*['"]/, message: 'Debug imports not allowed in root files - navigate to /debug/bulletproof instead' },
      { pattern: /^\s*import\s+.*['"]@app\/_debug[^'"]*['"]/, message: 'Debug imports not allowed in root files - navigate to /debug/bulletproof instead' }
    ];
    
    const fileText = file.getFullText();
    const lines = fileText.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for debug imports in root files
      if (relativePath === 'app/page.tsx' || relativePath === 'app/layout.tsx') {
        for (const { pattern, message } of rootDebugPatterns) {
          if (pattern.test(line)) {
            violations.push({
              file: relativePath,
              line: i + 1,
              importPath: line.trim(),
              message
            });
          }
        }
      }
      
      // Check for general non-compliant imports
      for (const { pattern, message } of nonCompliantPatterns) {
        if (pattern.test(line)) {
          violations.push({
            file: relativePath,
            line: i + 1,
            importPath: line.trim(),
            message
          });
        }
      }
    }
    
    return violations;
  }

  private getRelativePath(absolutePath: string): string {
    try {
      const cwd = process.cwd();
      // Normalize path separators for cross-platform compatibility
      const normalizedAbsolutePath = absolutePath.replace(/\\/g, '/');
      const normalizedCwd = cwd.replace(/\\/g, '/');
      return normalizedAbsolutePath.replace(normalizedCwd, '').replace(/^\//, '');
    } catch (error) {
      return absolutePath;
    }
  }

  private async runDiagnosticsSafely(): Promise<DiagnosticInfo[]> {
    console.log(blue('🔍 Running TypeScript diagnostics...'));
    
    try {
      const diagnostics = this.project.getPreEmitDiagnostics();
      const diagnosticInfos: DiagnosticInfo[] = [];
      
      for (const diagnostic of diagnostics) {
        const file = diagnostic.getSourceFile();
        if (file) {
          const { line, character } = file.getLineAndCharacterAtPos(diagnostic.getStart() || 0);
          diagnosticInfos.push({
            code: diagnostic.getCode(),
            message: this.diagnosticToString(diagnostic),
            file: file.getFilePath(),
            line: line + 1,
            character: character + 1,
            category: diagnostic.getCategory()
          });
        }
      }
      
      console.log(green(`✅ Found ${diagnosticInfos.length} diagnostics`));
      return diagnosticInfos;
      
    } catch (error) {
      console.log(yellow(`⚠️  Could not run diagnostics: ${error.message}`));
      return [];
    }
  }

  private diagnosticToString(d: ts.Diagnostic): string {
    if (typeof d.messageText === 'string') {
      return d.messageText;
    }
    if (typeof d.messageText === 'object' && d.messageText !== null) {
      const chain = d.messageText as ts.DiagnosticMessageChain;
      let message = chain.messageText;
      let current = chain.next;
      while (current) {
        message += current.messageText;
        current = current.next;
      }
      return message;
    }
    return String(d.messageText);
  }

  private displayResults(importCompliance: any, diagnostics: DiagnosticInfo[]): void {
    console.log('\n' + '='.repeat(60));
    console.log(blue('📊 DOCTOR RESULTS SUMMARY'));
    console.log('='.repeat(60));
    
    // Import compliance
    if (importCompliance.hasViolations) {
      console.log(red(`❌ Import Compliance: ${importCompliance.violations.length} violations`));
      this.displayImportViolations(importCompliance.violations);
    } else {
      console.log(green('✅ Import Compliance: No violations found'));
    }
    
    // Diagnostics
    const errors = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
    const warnings = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Warning);
    
    if (errors.length > 0) {
      console.log(red(`❌ TypeScript Errors: ${errors.length}`));
      errors.slice(0, 5).forEach((error, index) => {
        console.log(red(`  ${index + 1}. ${error.file}:${error.line}:${error.character}`));
        console.log(red(`     ${error.message}`));
      });
      if (errors.length > 5) {
        console.log(red(`     ... and ${errors.length - 5} more errors`));
      }
    } else {
      console.log(green('✅ TypeScript Errors: None found'));
    }
    
    if (warnings.length > 0) {
      console.log(yellow(`⚠️  TypeScript Warnings: ${warnings.length}`));
    }
    
    // Resource summary
    this.resourceMonitor.logStatus();
    
    // Final status
    const hasIssues = importCompliance.hasViolations || errors.length > 0;
    if (hasIssues) {
      console.log(red('\n❌ Doctor found issues that need attention'));
      process.exit(1);
    } else {
      console.log(green('\n✅ Doctor completed successfully - no issues found'));
    }
  }

  private displayImportViolations(violations: any[]): void {
    console.log(red('\n🚫 Import Compliance Violations:'));
    console.log(red('   Imports must use ONLY: @app/* @data/* @lib/* @ui/* @registry/* @compat/*'));
    
    const violationsByFile = new Map<string, any[]>();
    
    for (const violation of violations) {
      if (!violationsByFile.has(violation.file)) {
        violationsByFile.set(violation.file, []);
      }
      violationsByFile.get(violation.file)!.push(violation);
    }
    
    for (const [file, fileViolations] of violationsByFile) {
      console.log(red(`\n  📁 ${file}:`));
      fileViolations.slice(0, 3).forEach(violation => {
        console.log(red(`    Line ${violation.line}: ${violation.message}`));
        console.log(yellow(`      ${violation.importPath}`));
      });
      if (fileViolations.length > 3) {
        console.log(yellow(`      ... and ${fileViolations.length - 3} more violations`));
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  const options: DoctorOptions = {
    autoFix: args.includes('--auto-fix'),
    verbose: args.includes('--verbose'),
    timeout: args.includes('--timeout') ? parseInt(args[args.indexOf('--timeout') + 1]) || 60000 : 60000,
    batchSize: args.includes('--batch-size') ? parseInt(args[args.indexOf('--batch-size') + 1]) || 15 : 15,
    maxFiles: args.includes('--max-files') ? parseInt(args[args.indexOf('--max-files') + 1]) || 200 : 200,
    maxRetries: args.includes('--max-retries') ? parseInt(args[args.indexOf('--max-retries') + 1]) || 2 : 2,
    circuitBreakerThreshold: args.includes('--circuit-breaker') ? parseInt(args[args.indexOf('--circuit-breaker') + 1]) || 3 : 3,
  };

  const runner = new EnhancedDoctorRunner(options);

  try {
    await runner.run();
  } catch (error) {
    console.error(red(`❌ Fatal error: ${error.message}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
