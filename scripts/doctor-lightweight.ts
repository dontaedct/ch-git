#!/usr/bin/env tsx

import { Project, ts } from 'ts-morph';
import { blue, green, red, yellow, cyan } from 'picocolors';

interface DoctorOptions {
  autoFix?: boolean;
  verbose?: boolean;
  timeout?: number;
}

interface DiagnosticInfo {
  code: number;
  message: string;
  file: string;
  line: number;
  character: number;
  category: ts.DiagnosticCategory;
}

class LightweightDoctorRunner {
  private project: Project;
  private options: DoctorOptions;
  private startTime: number = Date.now();

  constructor(options: DoctorOptions = {}) {
    this.options = {
      timeout: 30000, // 30 second timeout
      ...options
    };
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json',
    });
  }

  private checkTimeout(): void {
    const elapsed = Date.now() - this.startTime;
    if (this.options.timeout && elapsed > this.options.timeout) {
      throw new Error(`Operation timed out after ${this.options.timeout}ms`);
    }
  }

  async run(): Promise<void> {
    console.log(blue('🔍 Running lightweight TypeScript doctor...'));
    console.log(blue('  (Skipping exports index for faster processing)'));
    
    try {
      // Run TypeScript diagnostics directly
      const diagnostics = await this.runTypeScriptDiagnostics();
      
      if (diagnostics.length === 0) {
        console.log(green('✅ No TypeScript errors found!'));
        return;
      }

      console.log(red(`❌ Found ${diagnostics.length} TypeScript errors:`));
      
      // Show all errors without complex analysis
      diagnostics.forEach((error, index) => {
        console.log(`\n  ${index + 1}. ${error.file}:${error.line}:${error.character}`);
        console.log(`     ${error.message}`);
        console.log(`     Code: ${error.code}`);
      });

      // Summary
      console.log(cyan(`\n💡 Run 'npm run doctor:fix' for full analysis and auto-fix`));
      console.log(cyan(`💡 Or use 'npm run doctor:lightweight' for faster processing`));
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        console.error(red(`❌ Operation timed out. This might indicate:`));
        console.error(red(`   - Complex TypeScript compilation issues`));
        console.error(red(`   - System resource constraints`));
        console.error(red(`\n💡 Try running 'npm run doctor:fast' for minimal processing`));
      } else {
        console.error(red(`❌ Error: ${error}`));
      }
      process.exit(1);
    }
  }

  private async runTypeScriptDiagnostics(): Promise<DiagnosticInfo[]> {
    console.log(blue('  Running TypeScript diagnostics...'));
    
    this.checkTimeout();
    
    const diagnostics: DiagnosticInfo[] = [];
    
    try {
      // Run TypeScript compiler diagnostics with timeout
      const program = this.project.getProgram();
      
      // Add timeout wrapper for getSemanticDiagnostics
      const diagnosticsPromise = new Promise<ts.Diagnostic[]>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('TypeScript diagnostics timed out'));
        }, 15000); // 15 second timeout for diagnostics
        
        try {
          const allDiagnostics = program.getSemanticDiagnostics();
          clearTimeout(timeout);
          resolve(allDiagnostics);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });
      
      const allDiagnostics = await diagnosticsPromise;
      
      console.log(blue(`    Found ${allDiagnostics.length} total diagnostics`));
      
      // Process only error diagnostics (skip warnings)
      let errorCount = 0;
      for (const diagnostic of allDiagnostics) {
        this.checkTimeout();
        
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
            errorCount++;
            
            if (errorCount % 50 === 0) {
              console.log(blue(`    Processed ${errorCount} errors...`));
            }
          }
        }
      }
      
      console.log(blue(`    ✅ Found ${errorCount} error diagnostics`));
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        console.log(yellow('    ⚠️  TypeScript diagnostics timed out, showing partial results'));
        return diagnostics;
      }
      throw error;
    }
    
    return diagnostics;
  }

  private getRelativePath(absolutePath: string): string {
    const cwd = process.cwd();
    return absolutePath.replace(cwd, '').replace(/^[\\\/]/, '');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  const options: DoctorOptions = {
    autoFix: process.env.AUTO === '1' || args.includes('--auto-fix'),
    verbose: args.includes('--verbose'),
    timeout: args.includes('--timeout') ? parseInt(args[args.indexOf('--timeout') + 1]) || 30000 : 30000,
  };

  const runner = new LightweightDoctorRunner(options);

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
