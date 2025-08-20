#!/usr/bin/env tsx

import { Project, SyntaxKind, Node, ts } from 'ts-morph';
import { glob } from 'fast-glob';
import picocolors from 'picocolors';

const { blue, green, red, yellow, cyan } = picocolors;
import leven from 'leven';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface DoctorOptions {
  autoFix?: boolean;
  verbose?: boolean;
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

class DoctorRunner {
  private project: Project;
  private options: DoctorOptions;
  private exportsIndex: Map<string, ExportInfo[]> = new Map();

  constructor(options: DoctorOptions = {}) {
    this.options = options;
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json',
    });
  }

  async run(): Promise<void> {
    console.log(blue('🔍 Running TypeScript doctor...'));
    
    // Build exports index
    await this.buildExportsIndex();
    
    // Run TypeScript diagnostics
    const diagnostics = await this.runTypeScriptDiagnostics();
    
    if (diagnostics.length === 0) {
      console.log(green('✅ No TypeScript errors found!'));
      return;
    }

    console.log(red(`❌ Found ${diagnostics.length} TypeScript errors:`));
    
    // Group diagnostics by type
    const moduleErrors = diagnostics.filter(d => d.code === 2307);
    const exportErrors = diagnostics.filter(d => d.code === 2724);
    const otherErrors = diagnostics.filter(d => d.code !== 2307 && d.code !== 2724);

    // Process module errors (TS2307)
    if (moduleErrors.length > 0) {
      console.log(cyan(`\n📦 Module resolution errors (${moduleErrors.length}):`));
      await this.processModuleErrors(moduleErrors);
    }

    // Process export errors (TS2724)
    if (exportErrors.length > 0) {
      console.log(cyan(`\n📤 Export member errors (${exportErrors.length}):`));
      await this.processExportErrors(exportErrors);
    }

    // Show other errors
    if (otherErrors.length > 0) {
      console.log(cyan(`\n⚠️  Other errors (${otherErrors.length}):`));
      otherErrors.forEach(error => {
        console.log(`  ${error.file}:${error.line}:${error.character} - ${error.message}`);
      });
    }

    // Summary
    console.log(cyan(`\n💡 Run 'npm run doctor:fix' to automatically apply suggested fixes`));
    
    // Check dev script for double-start pattern
    await this.checkDevScript();
  }

  private async buildExportsIndex(): Promise<void> {
    console.log(blue('  Building exports index...'));
    
    const sourceFiles = this.project.getSourceFiles();
    
    for (const file of sourceFiles) {
      const filePath = file.getFilePath();
      const relativePath = this.getRelativePath(filePath);
      
      // Skip node_modules and generated files
      if (relativePath.includes('node_modules') || relativePath.includes('.next')) {
        continue;
      }

      try {
        // Get all exports from the file
        const exports = file.getExportedDeclarations();
        
        for (const [name, declarations] of exports) {
          if (declarations && declarations.length > 0) {
            const declaration = declarations[0];
            if (!declaration) continue;
            
            let type: ExportInfo['type'] = 'const';
            
            if (declaration.getKind() === SyntaxKind.FunctionDeclaration) type = 'function';
            else if (declaration.getKind() === SyntaxKind.ClassDeclaration) type = 'class';
            else if (declaration.getKind() === SyntaxKind.InterfaceDeclaration) type = 'interface';
            else if (declaration.getKind() === SyntaxKind.TypeAliasDeclaration) type = 'type';
            else if (declaration.getKind() === SyntaxKind.VariableDeclaration) type = 'const';
            
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
      } catch (error) {
        // Skip files that can't be processed
        continue;
      }
    }
  }

  private async runTypeScriptDiagnostics(): Promise<DiagnosticInfo[]> {
    const diagnostics: DiagnosticInfo[] = [];
    
    // Run TypeScript compiler diagnostics
    const program = this.project.getProgram();
    const allDiagnostics = program.getSemanticDiagnostics();
    
    for (const diagnostic of allDiagnostics) {
      if (diagnostic.getCategory() === ts.DiagnosticCategory.Error) {
        const file = diagnostic.getSourceFile();
        if (file && diagnostic.getStart()) {
          const startPos = diagnostic.getStart()!;
          const { line, character } = ts.getLineAndCharacterOfPosition(file.compilerNode, startPos);
          diagnostics.push({
            code: diagnostic.getCode(),
            message: diagnostic.getMessageText() as string,
            file: this.getRelativePath(file.getFilePath()),
            line: line + 1,
            character: character + 1,
            category: diagnostic.getCategory()
          });
        }
      }
    }
    
    return diagnostics;
  }

  private async processModuleErrors(errors: DiagnosticInfo[]): Promise<void> {
    for (const error of errors) {
      console.log(`\n  ${error.file}:${error.line}:${error.character}`);
      console.log(`    ${error.message}`);
      
      // Extract module name from error message
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
            console.log(`    🔧 Auto-fixing...`);
            await this.autoFixImport(moduleName, suggestions[0]);
          }
        }
      }
    }
  }

  private async processExportErrors(errors: DiagnosticInfo[]): Promise<void> {
    for (const error of errors) {
      console.log(`\n  ${error.file}:${error.line}:${error.character}`);
      console.log(`    ${error.message}`);
      
      // Extract export name from error message
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
            console.log(`    🔧 Auto-fixing...`);
            await this.autoFixExport(exportName, suggestions[0]);
          }
        }
      }
    }
  }

  private findModuleSuggestions(moduleName: string): string[] {
    const suggestions: Array<{ name: string; distance: number }> = [];
    
    // Check if it's a relative import that should be absolute
    if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
      // Suggest converting to absolute import
      const absolutePath = this.convertToAbsolutePath(moduleName);
      if (absolutePath) {
        suggestions.push({ name: absolutePath, distance: 0 });
      }
    }
    
    // Check for similar module names in the exports index
    for (const [name, exports] of this.exportsIndex) {
      const distance = leven(moduleName, name);
      if (distance <= 3) { // Threshold for similarity
        suggestions.push({ name, distance });
      }
    }
    
    // Sort by distance and return top suggestions
    return suggestions
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(s => s.name);
  }

  private findExportSuggestions(exportName: string): string[] {
    const suggestions: Array<{ name: string; distance: number }> = [];
    
    for (const [name, exports] of this.exportsIndex) {
      const distance = leven(exportName, name);
      if (distance <= 3) { // Threshold for similarity
        suggestions.push({ name, distance });
      }
    }
    
    // Sort by distance and return top suggestions
    return suggestions
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(s => s.name);
  }

  private convertToAbsolutePath(relativePath: string): string | null {
    // Simple conversion logic - this could be enhanced
    if (relativePath.startsWith('./')) {
      return relativePath.substring(2);
    }
    if (relativePath.startsWith('../')) {
      // Count ../ and suggest appropriate absolute path
      const depth = (relativePath.match(/\.\.\//g) || []).length;
      if (depth === 1) {
        return relativePath.substring(3);
      }
    }
    return null;
  }

  private async autoFixImport(oldPath: string, newPath: string): Promise<void> {
    try {
      const { execSync } = await import('node:child_process');
      const command = `npm run rename:import -- ${oldPath} ${newPath}`;
      console.log(`    Running: ${command}`);
      execSync(command, { stdio: 'inherit' });
      console.log(`    ✅ Auto-fix completed`);
    } catch (error) {
      console.log(`    ❌ Auto-fix failed: ${error}`);
    }
  }

  private async autoFixExport(oldName: string, newName: string): Promise<void> {
    try {
      const { execSync } = await import('node:child_process');
      const command = `npm run rename:symbol -- ${oldName} ${newName}`;
      console.log(`    Running: ${command}`);
      execSync(command, { stdio: 'inherit' });
      console.log(`    ✅ Auto-fix completed`);
    } catch (error) {
      console.log(`    ❌ Auto-fix failed: ${error}`);
    }
  }

  private getRelativePath(absolutePath: string): string {
    const cwd = process.cwd();
    return absolutePath.replace(cwd, '').replace(/^[\\\/]/, '');
  }

  private async checkDevScript(): Promise<void> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const devScript = packageJson.scripts?.dev;
      
      if (!devScript) {
        console.log(red('❌ No "dev" script found in package.json'));
        return;
      }
      
      // Check for double-start patterns
      if (devScript.includes('&& next dev') || devScript.includes('&&next dev') || 
          (devScript.match(/next dev/g) || []).length > 1) {
        throw new Error('Doctor: dev script must be single-launch (node scripts/dev-bootstrap.js). Remove \'&& next dev ...\'.');
      }
      
      // Check for correct single-launcher pattern
      if (!devScript.includes('node scripts/dev-bootstrap.js')) {
        console.log(yellow('⚠️  Dev script should use single launcher: "dev": "node scripts/dev-bootstrap.js"'));
      } else {
        console.log(green('✅ Dev script uses single launcher'));
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Doctor:')) {
        throw error;
      }
      console.log(yellow('⚠️  Could not verify dev script (package.json read error)'));
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  const options: DoctorOptions = {
    autoFix: process.env.AUTO === '1' || args.includes('--auto-fix'),
    verbose: args.includes('--verbose'),
  };

  const runner = new DoctorRunner(options);

  try {
    await runner.run();
  } catch (error) {
    console.error(red(`❌ Error: ${error}`));
    process.exit(1);
  }
}

// ESM equivalent of require.main === module
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}
