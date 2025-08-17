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

// Helper function to convert diagnostic message to string
function diagnosticToString(d: ts.Diagnostic): string {
  if (typeof d.messageText === 'string') {
    return d.messageText;
  }
  if (typeof d.messageText === 'object' && d.messageText !== null) {
    // Handle DiagnosticMessageChain
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

class DoctorRunner {
  private project: Project;
  private options: DoctorOptions;
  private exportsIndex: Map<string, ExportInfo[]> = new Map();
  private startTime: number = Date.now();
  private processedFiles: Set<string> = new Set();
  private isProcessing: boolean = false;
  private activeAutoFixes: Set<string> = new Set(); // Track active auto-fixes

  constructor(options: DoctorOptions = {}) {
    this.options = {
      timeout: 120000, // 2 minutes
      batchSize: 20, // Smaller batches
      maxFiles: 400, // Reduced max files
      ...options
    };
    
    // Create project with more conservative settings
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json',
      skipAddingFilesFromTsConfig: true, // Don't auto-add all files
      skipFileDependencyResolution: true, // Skip dependency resolution
    });
  }

  private checkTimeout(): void {
    const elapsed = Date.now() - this.startTime;
    if (this.options.timeout && elapsed > this.options.timeout) {
      throw new Error(`Operation timed out after ${this.options.timeout}ms`);
    }
  }

  async run(): Promise<void> {
    console.log(blue('🔍 Running TypeScript doctor...'));
    
    try {
      // Add source files manually to avoid memory issues
      await this.addSourceFilesSafely();
      
      // Build exports index with better error handling
      await this.buildExportsIndexSafely();
      
      // Check import path compliance
      const importCompliance = this.checkImportPathCompliance();
      
      // Run diagnostics with aggressive timeout protection
      const diagnostics = await this.runDiagnosticsSafely();
      
      // Fail if import compliance violations exist
      if (importCompliance.hasViolations) {
        this.displayImportViolations(importCompliance.violations);
        console.error(red('\n❌ Build failed due to import compliance violations!'));
        console.error(red('   Fix all import violations before proceeding.'));
        process.exit(1);
      }
      
      if (diagnostics.length === 0) {
        console.log(green('✅ No TypeScript errors found!'));
        return;
      }

      console.log(red(`❌ Found ${diagnostics.length} TypeScript errors:`));
      
      // Process errors in very small chunks
      await this.processErrorsSafely(diagnostics);

      console.log(cyan(`\n💡 Run 'npm run doctor:fix' to automatically apply suggested fixes`));
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        console.error(red(`❌ Operation timed out. This might indicate:`));
        console.error(red(`   - Complex TypeScript compilation issues`));
        console.error(red(`   - System resource constraints`));
        console.error(red(`\n💡 Try running 'npm run doctor:ultra-light' for minimal processing`));
      } else {
        console.error(red(`❌ Error: ${error}`));
      }
      process.exit(1);
    }
  }

  private async addSourceFilesSafely(): Promise<void> {
    console.log(blue('  Adding source files...'));
    
    try {
      // Use glob to find TypeScript files more efficiently
      const glob = (await import('fast-glob')).default;
      const patterns = [
        'app/**/*.ts',
        'app/**/*.tsx', 
        'components/**/*.ts',
        'components/**/*.tsx',
        'lib/**/*.ts',
        'hooks/**/*.ts',
        'types/**/*.ts',
        'scripts/**/*.ts',
        '*.ts' // Include root-level TypeScript files
      ];
      
      const files = await glob(patterns, {
        ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**'],
        absolute: true
      });
      
      const limitedFiles = files.slice(0, this.options.maxFiles!);
      console.log(blue(`    Found ${files.length} TypeScript files, limiting to ${limitedFiles.length}`));
      
      // Add files one by one with error handling
      for (const file of limitedFiles) {
        try {
          this.project.addSourceFileAtPath(file);
        } catch (error) {
          if (this.options.verbose) {
            console.log(yellow(`    Warning: Could not add ${file}: ${error}`));
          }
        }
      }
      
      console.log(green(`    ✅ Added ${this.project.getSourceFiles().length} source files`));
    } catch (error) {
      console.log(yellow(`    ⚠️  Failed to add source files: ${error}`));
      console.log(yellow(`    Continuing with existing files...`));
    }
  }

  private async buildExportsIndexSafely(): Promise<void> {
    console.log(blue('  Building exports index...'));
    
    try {
      const sourceFiles = this.project.getSourceFiles();
      const totalFiles = Math.min(sourceFiles.length, this.options.maxFiles!);
      
      console.log(blue(`    Processing ${totalFiles} files in batches of ${this.options.batchSize}`));
      
      let processedCount = 0;
      const batchSize = this.options.batchSize!;
      
      for (let i = 0; i < totalFiles; i += batchSize) {
        this.checkTimeout();
        
        const batch = sourceFiles.slice(i, i + batchSize);
        const batchEnd = Math.min(i + batchSize, totalFiles);
        
        console.log(blue(`    Processing batch ${Math.floor(i/batchSize) + 1}: files ${i + 1}-${batchEnd}`));
        
        try {
          await this.processBatchSafely(batch);
          processedCount += batch.length;
          console.log(blue(`    ✅ Batch complete. Total processed: ${processedCount}/${totalFiles}`));
        } catch (error) {
          console.log(yellow(`    ⚠️  Batch failed: ${error}`));
          console.log(yellow(`    Continuing with next batch...`));
        }
        
        // Longer delay between batches
        if (i + batchSize < totalFiles) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      console.log(green(`    ✅ Exports index built with ${this.exportsIndex.size} unique exports`));
    } catch (error) {
      console.log(yellow(`    ⚠️  Failed to build exports index: ${error}`));
      console.log(yellow(`    Continuing with empty index...`));
    }
  }

  private async processBatchSafely(files: any[]): Promise<void> {
    for (const file of files) {
      this.checkTimeout();
      
      try {
        const filePath = file.getFilePath();
        const relativePath = this.getRelativePath(filePath);
        
        if (this.processedFiles.has(relativePath)) {
          continue;
        }

        // Get exports with timeout protection
        const exports = await this.getExportsWithTimeout(file);
        
        for (const [name, declarations] of exports) {
          if (declarations && declarations.length > 0) {
            const declaration = declarations[0];
            if (!declaration) continue;
            
            let type: ExportInfo['type'] = 'const';
            
            try {
              const kind = declaration.getKind();
              if (kind === SyntaxKind.FunctionDeclaration) type = 'function';
              else if (kind === SyntaxKind.ClassDeclaration) type = 'class';
              else if (kind === SyntaxKind.InterfaceDeclaration) type = 'interface';
              else if (kind === SyntaxKind.TypeAliasDeclaration) type = 'type';
              else if (kind === SyntaxKind.VariableDeclaration) type = 'const';
            } catch (error) {
              continue;
            }
            
            const exportInfo: ExportInfo = {
              name: String(name),
              file: relativePath,
              type
            };

            if (!this.exportsIndex.has(String(name))) {
              this.exportsIndex.set(String(name), []);
            }
            this.exportsIndex.get(String(name))!.push(exportInfo);
          }
        }
        
        this.processedFiles.add(relativePath);
      } catch (error) {
        if (this.options.verbose) {
          console.log(yellow(`    Warning: Could not process file: ${error}`));
        }
        continue;
      }
    }
  }

  private async getExportsWithTimeout(file: any): Promise<Map<string, any[]>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('File processing timed out'));
      }, 5000); // 5 second timeout per file
      
      try {
        const exports = file.getExportedDeclarations();
        clearTimeout(timeout);
        resolve(exports);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private async runDiagnosticsSafely(): Promise<DiagnosticInfo[]> {
    console.log(blue('  Running TypeScript diagnostics...'));
    
    const diagnostics: DiagnosticInfo[] = [];
    
    try {
      // Get program with timeout
      const program = await this.getProgramWithTimeout();
      
      // Get diagnostics with aggressive timeout
      const allDiagnostics = await this.getDiagnosticsWithTimeout(program);
      
      console.log(blue(`    Found ${allDiagnostics.length} total diagnostics`));
      
      // Process only error diagnostics in very small chunks
      let errorCount = 0;
      const chunkSize = 25; // Very small chunks
      
      for (let i = 0; i < allDiagnostics.length; i += chunkSize) {
        this.checkTimeout();
        
        const chunk = allDiagnostics.slice(i, i + chunkSize);
        
        for (const diagnostic of chunk) {
          if (diagnostic.category === ts.DiagnosticCategory.Error) {
            try {
              const file = diagnostic.file;
              if (file && diagnostic.start !== undefined) {
                const startPos = diagnostic.start;
                const { line, character } = ts.getLineAndCharacterOfPosition(file, startPos);
                
                diagnostics.push({
                  code: diagnostic.code,
                  message: diagnosticToString(diagnostic),
                  file: this.getRelativePath(file.fileName),
                  line: line + 1,
                  character: character + 1,
                  category: diagnostic.category
                });
                
                errorCount++;
              }
            } catch (error) {
              continue;
            }
          }
        }
        
        if (i + chunkSize < allDiagnostics.length) {
          console.log(blue(`    Processed ${Math.min(i + chunkSize, allDiagnostics.length)}/${allDiagnostics.length} diagnostics...`));
        }
        
        // Delay between chunks
        if (i + chunkSize < allDiagnostics.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log(blue(`    ✅ Found ${errorCount} error diagnostics`));
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        console.log(yellow('    ⚠️  Diagnostics timed out, showing partial results'));
        return diagnostics;
      }
      throw error;
    }
    
    return diagnostics;
  }

  private async getProgramWithTimeout(): Promise<ts.Program> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Program creation timed out'));
      }, 10000); // 10 second timeout
      
      try {
        const program = this.project.getProgram();
        clearTimeout(timeout);
        resolve(program);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private async getDiagnosticsWithTimeout(program: ts.Program): Promise<ts.Diagnostic[]> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Diagnostics collection timed out'));
      }, 20000); // 20 second timeout
      
      try {
        const allDiagnostics = program.getSemanticDiagnostics();
        clearTimeout(timeout);
        resolve(allDiagnostics);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private async processErrorsSafely(diagnostics: DiagnosticInfo[]): Promise<void> {
    // Group errors by type
    const moduleErrors = diagnostics.filter(d => d.code === 2307);
    const exportErrors = diagnostics.filter(d => d.code === 2724);
    const otherErrors = diagnostics.filter(d => d.code !== 2307 && d.code !== 2724);

    // Process each type in very small chunks
    if (moduleErrors.length > 0) {
      console.log(cyan(`\n📦 Module resolution errors (${moduleErrors.length}):`));
      await this.processErrorChunks(moduleErrors, 'module');
    }

    if (exportErrors.length > 0) {
      console.log(cyan(`\n📤 Export member errors (${exportErrors.length}):`));
      await this.processErrorChunks(exportErrors, 'export');
    }

    if (otherErrors.length > 0) {
      console.log(cyan(`\n⚠️  Other errors (${otherErrors.length}):`));
      await this.processErrorChunks(otherErrors, 'other');
    }
  }

  private async processErrorChunks(errors: DiagnosticInfo[], type: string): Promise<void> {
    const chunkSize = 5; // Very small chunks
    
    for (let i = 0; i < errors.length; i += chunkSize) {
      this.checkTimeout();
      
      const chunk = errors.slice(i, i + chunkSize);
      
      for (const error of chunk) {
        console.log(`\n  ${error.file}:${error.line}:${error.character}`);
        console.log(`    ${error.message}`);
        
        if (type === 'module') {
          await this.processModuleError(error);
        } else if (type === 'export') {
          await this.processExportError(error);
        }
      }
      
      // Delay between chunks
      if (i + chunkSize < errors.length) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }
  }

  private async processModuleError(error: DiagnosticInfo): Promise<void> {
    const moduleMatch = error.message.match(/Cannot find module '([^']+)'/);
    if (moduleMatch) {
      const moduleName = moduleMatch[1];
      const suggestions = this.findModuleSuggestions(moduleName);
      
      if (suggestions.length > 0) {
        console.log(`    💡 Suggested fix:`);
        suggestions.forEach(suggestion => {
          console.log(`      npm run rename:import -- ${moduleName} ${suggestion}`);
        });
        
        if (this.options.autoFix && suggestions.length === 1) {
          const fixKey = `import:${moduleName}:${suggestions[0]}`;
          if (!this.activeAutoFixes.has(fixKey)) {
            console.log(`    🔧 Auto-fixing...`);
            // Run auto-fix in background to prevent freezing
            this.activeAutoFixes.add(fixKey);
            this.autoFixImport(moduleName, suggestions[0])
              .catch(err => {
                console.log(`    ❌ Auto-fix failed: ${err}`);
              })
              .finally(() => {
                this.activeAutoFixes.delete(fixKey);
              });
          } else {
            console.log(`    ⏳ Auto-fix already in progress for this module`);
          }
        }
      }
    }
  }

  private async processExportError(error: DiagnosticInfo): Promise<void> {
    const exportMatch = error.message.match(/has no exported member '([^']+)'/);
    if (exportMatch) {
      const exportName = exportMatch[1];
      const suggestions = this.findExportSuggestions(exportName);
      
      if (suggestions.length > 0) {
        console.log(`    💡 Suggested fix:`);
        suggestions.forEach(suggestion => {
          console.log(`      npm run rename:symbol -- ${exportName} ${suggestion}`);
        });
        
        if (this.options.autoFix && suggestions.length === 1) {
          const fixKey = `export:${exportName}:${suggestions[0]}`;
          if (!this.activeAutoFixes.has(fixKey)) {
            console.log(`    🔧 Auto-fixing...`);
            // Run auto-fix in background to prevent freezing
            this.activeAutoFixes.add(fixKey);
            this.autoFixExport(exportName, suggestions[0])
              .catch(err => {
                console.log(`    ❌ Auto-fix failed: ${err}`);
              })
              .finally(() => {
                this.activeAutoFixes.delete(fixKey);
              });
          } else {
            console.log(`    ⏳ Auto-fix already in progress for this export`);
          }
        }
      }
    }
  }

  private findModuleSuggestions(moduleName: string): string[] {
    try {
      const suggestions: Array<{ name: string; distance: number }> = [];
      
      // Check for similar module names in the exports index
      for (const [name, exports] of this.exportsIndex) {
        const distance = leven(moduleName, name);
        if (distance <= 3) {
          suggestions.push({ name, distance });
        }
      }
      
      return suggestions
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .map(s => s.name);
    } catch (error) {
      return [];
    }
  }

  private findExportSuggestions(exportName: string): string[] {
    try {
      const suggestions: Array<{ name: string; distance: number }> = [];
      
      for (const [name, exports] of this.exportsIndex) {
        const distance = leven(exportName, name);
        if (distance <= 3) {
          suggestions.push({ name, distance });
        }
      }
      
      return suggestions
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .map(s => s.name);
    } catch (error) {
      return [];
    }
  }

  private async autoFixImport(oldPath: string, newPath: string): Promise<void> {
    try {
      // Use a more robust approach with better timeout handling
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Auto-fix timed out'));
        }, 15000); // 15 second timeout
        
        const child = spawn('npm', ['run', 'rename:import', '--', oldPath, newPath], {
          stdio: 'pipe',
          shell: true,
          timeout: 15000
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
        
        child.on('close', (code: number) => {
          clearTimeout(timeout);
          if (code === 0) {
            console.log(`    ✅ Auto-fix completed successfully`);
            resolve();
          } else {
            reject(new Error(`Auto-fix failed with code ${code}: ${stderr}`));
          }
        });
        
        child.on('error', (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        });
        
        child.on('timeout', () => {
          child.kill();
          reject(new Error('Auto-fix process timed out'));
        });
      });
    } catch (error) {
      console.log(`    ❌ Auto-fix failed: ${error}`);
      throw error;
    }
  }

  private async autoFixExport(oldName: string, newName: string): Promise<void> {
    try {
      // Use a more robust approach with better timeout handling
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Auto-fix timed out'));
        }, 15000); // 15 second timeout
        
        const child = spawn('npm', ['run', 'rename:symbol', '--', oldName, newName], {
          stdio: 'pipe',
          shell: true,
          timeout: 15000
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
        
        child.on('close', (code: number) => {
          clearTimeout(timeout);
          if (code === 0) {
            console.log(`    ✅ Auto-fix completed successfully`);
            resolve();
          } else {
            reject(new Error(`Auto-fix failed with code ${code}: ${stderr}`));
          }
        });
        
        child.on('error', (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        });
        
        child.on('timeout', () => {
          child.kill();
          reject(new Error('Auto-fix process timed out'));
        });
      });
    } catch (error) {
      console.log(`    ❌ Auto-fix failed: ${error}`);
      throw error;
    }
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

  private checkImportPathCompliance(): { violations: Array<{ file: string; line: number; importPath: string; message: string }>; hasViolations: boolean } {
    console.log(blue('  Checking import path compliance...'));
    
    const violations: Array<{ file: string; line: number; importPath: string; message: string }> = [];
    const sourceFiles = this.project.getSourceFiles();
    
    // Regex patterns for non-compliant imports
    const nonCompliantPatterns = [
      { pattern: /from\s+['"]\.\.\/[^'"]*['"]/, message: 'Deep relative import (../) not allowed' },
      { pattern: /from\s+['"]\.\.\/\.\.\/[^'"]*['"]/, message: 'Deep relative import (../../) not allowed' },
      { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/[^'"]*['"]/, message: 'Deep relative import (../../../) not allowed' },
      { pattern: /from\s+['"]src\/[^'"]*['"]/, message: 'Raw src/* import not allowed' },
      { pattern: /import\s+['"]\.\.\/[^'"]*['"]/, message: 'Deep relative import (../) not allowed' },
      { pattern: /import\s+['"]\.\.\/\.\.\/[^'"]*['"]/, message: 'Deep relative import (../../) not allowed' },
      { pattern: /import\s+['"]\.\.\/\.\.\/\.\.\/[^'"]*['"]/, message: 'Deep relative import (../../../) not allowed' },
      { pattern: /import\s+['"]src\/[^'"]*['"]/, message: 'Raw src/* import not allowed' }
    ];

    // Special check for debug imports in root files
    const rootDebugPatterns = [
      { pattern: /^\s*from\s+['"]@app\/debug[^'"]*['"]/, message: 'Debug imports not allowed in root files - navigate to /debug/bulletproof instead' },
      { pattern: /^\s*from\s+['"]@app\/_debug[^'"]*['"]/, message: 'Debug imports not allowed in root files - navigate to /debug/bulletproof instead' },
      { pattern: /^\s*import\s+['"]@app\/debug[^'"]*['"]/, message: 'Debug imports not allowed in root files - navigate to /debug/bulletproof instead' },
      { pattern: /^\s*import\s+['"]@app\/_debug[^'"]*['"]/, message: 'Debug imports not allowed in root files - navigate to /debug/bulletproof instead' }
    ];

    let filesChecked = 0;
    const totalFiles = Math.min(sourceFiles.length, this.options.maxFiles!);

    for (const file of sourceFiles) {
      if (filesChecked >= totalFiles) break;
      
      try {
        const filePath = file.getFilePath();
        const relativePath = this.getRelativePath(filePath);
        const fileText = file.getFullText();
        
        // Check each line for non-compliant imports
        const lines = fileText.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNumber = i + 1;
          
          // Check for debug imports in root files
          if (relativePath === 'app/page.tsx' || relativePath === 'app/layout.tsx') {
            for (const { pattern, message } of rootDebugPatterns) {
              if (pattern.test(line)) {
                violations.push({
                  file: relativePath,
                  line: lineNumber,
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
                line: lineNumber,
                importPath: line.trim(),
                message
              });
            }
          }
        }
        
        filesChecked++;
      } catch (error) {
        if (this.options.verbose) {
          console.log(yellow(`    Warning: Could not check file for import compliance: ${error}`));
        }
        continue;
      }
    }
    
    console.log(blue(`    ✅ Checked ${filesChecked} files for import compliance`));
    
    if (violations.length > 0) {
      console.log(red(`    ❌ Found ${violations.length} import compliance violations`));
    } else {
      console.log(green(`    ✅ No import compliance violations found`));
    }
    
    return { violations, hasViolations: violations.length > 0 };
  }

  private displayImportViolations(violations: Array<{ file: string; line: number; importPath: string; message: string }>): void {
    console.log(red(`\n🚫 Import Compliance Violations (${violations.length}):`));
    console.log(red(`   Imports must use ONLY: @app/* @data/* @lib/* @ui/* @registry/* @compat/*`));
    console.log(red(`   Never use: ../, ../../, ../../../, or src/*`));
    
    // Group violations by file for better readability
    const violationsByFile = new Map<string, Array<{ line: number; importPath: string; message: string }>>();
    
    for (const violation of violations) {
      if (!violationsByFile.has(violation.file)) {
        violationsByFile.set(violation.file, []);
      }
      violationsByFile.get(violation.file)!.push({
        line: violation.line,
        importPath: violation.importPath,
        message: violation.message
      });
    }
    
    for (const [file, fileViolations] of violationsByFile) {
      console.log(red(`\n  📁 ${file}:`));
      
      for (const violation of fileViolations) {
        console.log(red(`    Line ${violation.line}: ${violation.message}`));
        console.log(yellow(`      ${violation.importPath}`));
      }
    }
    
    console.log(red(`\n💡 Fix these violations by replacing with proper alias imports:`));
    console.log(red(`   - Use @app/* for app directory imports`));
    console.log(red(`   - Use @lib/* for lib directory imports`));
    console.log(red(`   - Use @ui/* for UI component imports`));
    console.log(red(`   - Use @registry/* for registry imports`));
    console.log(red(`   - Use @compat/* for compatibility imports`));
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  const options: DoctorOptions = {
    autoFix: process.env.AUTO === '1' || args.includes('--auto-fix'),
    verbose: args.includes('--verbose'),
    timeout: args.includes('--timeout') ? parseInt(args[args.indexOf('--timeout') + 1]) || 120000 : 120000,
    batchSize: args.includes('--batch-size') ? parseInt(args[args.indexOf('--batch-size') + 1]) || 20 : 20,
    maxFiles: args.includes('--max-files') ? parseInt(args[args.indexOf('--max-files') + 1]) || 400 : 400,
  };

  const runner = new DoctorRunner(options);

  try {
    await runner.run();
  } catch (error) {
    console.error(red(`❌ Fatal error: ${error}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
