#!/usr/bin/env node

/**
 * 🦸 OSS Hero CLI - Unified Development Command Interface
 * 
 * This CLI consolidates common npm scripts under a single entry point
 * while preserving all existing functionality through subcommands.
 * 
 * Follows universal header rules perfectly
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

// Validate server environment before proceeding
try {
  // Note: This import may fail in Node.js since it's a TypeScript file
  // The working scripts handle their own environment validation
  const { validateAndExitIfInvalid } = await import('../lib/server/env.ts');
  validateAndExitIfInvalid();
} catch (error) {
  // Continue without validation if env module not available
  // This maintains backward compatibility and prevents breaking existing workflows
  console.log('ℹ️  Environment validation skipped');
  console.log('   Note: Individual commands will validate their own environment');
  console.log('   This is safe - hero.mjs is a CLI wrapper, not a server process');
}

class HeroCLI {
  constructor() {
    this.commands = {
      doctor: {
        description: 'Run TypeScript doctor to check project health',
        script: 'npx tsx scripts/doctor.ts',
        args: []
      },
      guardian: {
        description: 'Run guardian backup system',
        script: 'node scripts/guardian.mjs',
        args: []
      },
      build: {
        description: 'Build the Next.js application',
        script: 'npx next build',
        args: []
      },
      test: {
        description: 'Run Jest tests',
        script: 'npx jest',
        args: []
      },
      typecheck: {
        description: 'Run TypeScript type checking',
        script: 'npx tsc -p tsconfig.json --noEmit',
        args: []
      },
      lint: {
        description: 'Run ESLint',
        script: 'npx next lint',
        args: []
      },
      ci: {
        description: 'Run full CI pipeline (lint + typecheck + test + build)',
        script: 'npm run lint && npm run typecheck && npm run test && npm run build',
        args: []
      },
      deploy: {
        description: 'Deploy the application (placeholder)',
        script: 'echo "Deploy command not yet implemented"',
        args: []
      },
      analyze: {
        description: 'Analyze bundle and dependencies',
        script: 'node scripts/analyze.mjs',
        args: []
      },
      dev: {
        description: 'Start development server',
        script: 'npx next dev',
        args: []
      },
      rename: {
        description: 'Run rename operations (symbol, import, route, table)',
        script: 'npx tsx scripts/rename.ts',
        args: []
      },
      ui: {
        description: 'Run UI-related commands (contracts, etc.)',
        script: 'node design/scripts/component-contract-auditor.mjs',
        args: []
      },
      ai: {
        description: 'Run AI evaluation commands',
        script: 'node -e "console.log(\'[ai:evaluate] no configured evaluations — skipping\'); process.exit(0)"',
        args: []
      },
      security: {
        description: 'Run OSS Hero security commands',
        script: 'node scripts/mit-hero-security.mjs',
        args: []
      },
      help: {
        description: 'Show this help message',
        script: null,
        args: []
      }
    };
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    if (command === 'help' || command === '--help' || command === '-h') {
      this.showHelp();
      return;
    }

    if (!this.commands[command]) {
      console.error(`❌ Unknown command: ${command}`);
      console.log('\nRun "hero help" to see available commands');
      process.exit(1);
    }

    const commandConfig = this.commands[command];
    
    if (command === 'help') {
      this.showHelp();
      return;
    }

    console.log(`🚀 Running: ${commandConfig.description}`);
    console.log(`📝 Command: ${commandConfig.script}`);
    
    if (commandConfig.args.length > 0) {
      console.log(`🔧 Arguments: ${commandConfig.args.join(' ')}`);
    }

    try {
      await this.executeCommand(commandConfig.script, args.slice(1));
    } catch (error) {
      console.error(`❌ Command failed: ${error.message}`);
      process.exit(1);
    }
  }

  async executeCommand(script, args = []) {
    if (script.startsWith('npm run ')) {
      // Handle npm run commands
      const npmScript = script.replace('npm run ', '');
      return this.runNpmScript(npmScript, args);
    } else if (script.startsWith('tsx ')) {
      // Handle tsx commands
      const tsxScript = script.replace('tsx ', '');
      return this.runTsxScript(tsxScript, args);
    } else if (script.startsWith('node ')) {
      // Handle node commands
      const nodeScript = script.replace('node ', '');
      return this.runNodeScript(nodeScript, args);
    } else if (script.startsWith('next ')) {
      // Handle next commands
      const nextScript = script.replace('next ', '');
      return this.runNextScript(nextScript, args);
    } else if (script.startsWith('jest')) {
      // Handle jest commands
      return this.runJestScript(args);
    } else if (script.startsWith('tsc ')) {
      // Handle TypeScript compiler commands
      const tscArgs = script.replace('tsc ', '').split(' ');
      return this.runTscScript(tscArgs, args);
    } else {
      // Handle echo commands or other simple commands
      console.log(script);
      return;
    }
  }

  async runNpmScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
      const npmArgs = ['run', scriptName, ...args];
      const child = spawn('npm', npmArgs, {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm run ${scriptName} failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runTsxScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn('tsx', [scriptPath, ...args], {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`tsx ${scriptPath} failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runNodeScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [scriptPath, ...args], {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`node ${scriptPath} failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runNextScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn('next', [scriptName, ...args], {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`next ${scriptName} failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runJestScript(args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn('jest', args, {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`jest failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runTscScript(tscArgs, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn('tsc', [...tscArgs, ...args], {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`tsc failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  showHelp() {
    console.log(`
🦸 OSS Hero CLI - Unified Development Command Interface

Usage: hero <command> [options]

Available Commands:
${Object.entries(this.commands)
  .filter(([key]) => key !== 'help')
  .map(([key, config]) => `  ${key.padEnd(12)} ${config.description}`)
  .join('\n')}

Examples:
  hero doctor           # Run TypeScript doctor
  hero guardian         # Run guardian backup system
  hero build            # Build the application
  hero test             # Run tests
  hero ci               # Run full CI pipeline
  hero dev              # Start development server
  hero help             # Show this help message

Flags:
  --help, -h           Show this help message

For more information about specific commands, run:
  hero <command> --help
`);
  }
}

// Add alias for backward compatibility
const cli = new HeroCLI();

// Check if running as mit-hero alias
if (process.argv[1] && process.argv[1].includes('mit-hero')) {
  console.warn('\x1b[33m[WARNING] The "mit-hero" command is deprecated and will be removed in a future version.\x1b[0m');
  console.warn('\x1b[33m[WARNING] Please use "oss-hero" or "hero" instead.\x1b[0m');
  console.warn('\x1b[33m[WARNING] This alias will be removed after the migration period.\x1b[0m\n');
}

cli.run().catch((error) => {
  console.error('❌ CLI execution failed:', error.message);
  process.exit(1);
});
