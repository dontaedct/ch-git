#!/usr/bin/env tsx
/**
 * Tripwire: Client-Server Boundary Enforcement
 * 
 * Detects and prevents client→server leakage violations:
 * - process.env usage in client components
 * - Node.js built-in imports in client files
 * - Server-only code in client entrypoints
 * 
 * Universal Header: @scripts/checks/tripwire-client-boundary
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

interface Violation {
  file: string;
  line: number;
  column: number;
  type: 'process_env' | 'node_builtin' | 'server_import';
  message: string;
  code: string;
}

const NODE_BUILTINS = [
  'fs', 'path', 'child_process', 'crypto', 'os', 'process',
  'node:fs', 'node:path', 'node:child_process', 'node:crypto', 'node:os', 'node:process'
];

const CLIENT_PATTERNS = [
  'app/**/page.tsx',
  'app/**/layout.tsx', 
  'components/**/*.tsx',
  'components/**/*.ts'
];

const SERVER_PATTERNS = [
  'app/api/**/*',
  '**/*.actions.ts',
  '**/actions.ts',
  'app/**/route.ts',
  'middleware.ts',
  'scripts/**/*',
  '**/*.server.ts'
];

const DEBUG_PATTERNS = [
  'app/_debug/**/*',
  '**/*.debug.ts',
  '**/*.test.ts',
  '**/*.spec.ts'
];

const ALLOWED_ENV_FILES = [
  'lib/env-client.ts',
  '**/env-client.ts'
];

class ClientBoundaryTripwire {
  private violations: Violation[] = [];
  private processedFiles = 0;
  private startTime = Date.now();

  async run(): Promise<void> {
    console.log('🔍 Running client-server boundary tripwire...\n');

    const clientFiles = this.getClientFiles();
    console.log(`📁 Scanning ${clientFiles.length} client files...\n`);

    for (const file of clientFiles) {
      this.scanFile(file);
    }

    this.reportResults();
    
    if (this.violations.length > 0) {
      process.exit(1);
    }
  }

  private getClientFiles(): string[] {
    const files = new Set<string>();
    
    // Add client pattern files
    for (const pattern of CLIENT_PATTERNS) {
      const matches = globSync(pattern, { ignore: ['node_modules/**'] });
      matches.forEach(file => files.add(file));
    }

    // Remove server files
    for (const pattern of SERVER_PATTERNS) {
      const matches = globSync(pattern, { ignore: ['node_modules/**'] });
      matches.forEach(file => files.delete(file));
    }

    // Remove debug files  
    for (const pattern of DEBUG_PATTERNS) {
      const matches = globSync(pattern, { ignore: ['node_modules/**'] });
      matches.forEach(file => files.delete(file));
    }

    // Remove allowed env files
    for (const pattern of ALLOWED_ENV_FILES) {
      const matches = globSync(pattern, { ignore: ['node_modules/**'] });
      matches.forEach(file => files.delete(file));
    }

    return Array.from(files);
  }

  private scanFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      this.processedFiles++;

      lines.forEach((line, index) => {
        this.checkProcessEnvUsage(filePath, line, index + 1);
        this.checkNodeBuiltinImports(filePath, line, index + 1);
      });

    } catch (error) {
      console.warn(`⚠️  Could not read file ${filePath}: ${error}`);
    }
  }

  private checkProcessEnvUsage(filePath: string, line: string, lineNumber: number): void {
    // Match process.env usage patterns
    const processEnvRegex = /\bprocess\.env\b/g;
    let match;

    while ((match = processEnvRegex.exec(line)) !== null) {
      this.violations.push({
        file: filePath,
        line: lineNumber,
        column: match.index + 1,
        type: 'process_env',
        message: 'Direct process.env access not allowed in client components. Use @lib/env-client utilities.',
        code: line.trim()
      });
    }
  }

  private checkNodeBuiltinImports(filePath: string, line: string, lineNumber: number): void {
    // Match import statements
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(line)) !== null) {
      const importPath = match[1];
      
      if (NODE_BUILTINS.includes(importPath)) {
        this.violations.push({
          file: filePath,
          line: lineNumber,
          column: match.index + 1,
          type: 'node_builtin',
          message: `Node.js built-in '${importPath}' not allowed in client components. Use server actions or Web APIs.`,
          code: line.trim()
        });
      }
    }

    // Match require statements
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(line)) !== null) {
      const requirePath = match[1];
      
      if (NODE_BUILTINS.includes(requirePath)) {
        this.violations.push({
          file: filePath,
          line: lineNumber, 
          column: match.index + 1,
          type: 'node_builtin',
          message: `Node.js built-in '${requirePath}' not allowed in client components. Use server actions or Web APIs.`,
          code: line.trim()
        });
      }
    }
  }

  private reportResults(): void {
    const duration = Date.now() - this.startTime;

    console.log(`\n📊 Tripwire Results:`);
    console.log(`   Files scanned: ${this.processedFiles}`);
    console.log(`   Violations found: ${this.violations.length}`);
    console.log(`   Duration: ${duration}ms\n`);

    if (this.violations.length === 0) {
      console.log('✅ No client-server boundary violations detected!\n');
      return;
    }

    console.log('❌ Client-Server Boundary Violations:\n');

    // Group violations by file
    const violationsByFile = this.violations.reduce((acc, violation) => {
      if (!acc[violation.file]) {
        acc[violation.file] = [];
      }
      acc[violation.file].push(violation);
      return acc;
    }, {} as Record<string, Violation[]>);

    for (const [file, violations] of Object.entries(violationsByFile)) {
      console.log(`📄 ${file}:`);
      
      for (const violation of violations) {
        const icon = violation.type === 'process_env' ? '🌍' : '📦';
        console.log(`   ${icon} Line ${violation.line}:${violation.column} - ${violation.message}`);
        console.log(`      Code: ${violation.code}`);
      }
      console.log();
    }

    console.log('🔧 Fix these violations by:');
    console.log('   • Using @lib/env-client utilities instead of direct process.env');
    console.log('   • Moving Node.js built-in usage to server components or API routes');
    console.log('   • Wrapping server logic in server actions\n');
  }
}

// Main execution - Always run when imported as module
const tripwire = new ClientBoundaryTripwire();
tripwire.run().catch(error => {
  console.error('💥 Tripwire failed:', error);
  process.exit(1);
});

export { ClientBoundaryTripwire };
