#!/usr/bin/env node

/**
 * Help script for OSS Hero - lists minimal developer flows and available commands
 * 
 * This script provides a clean, organized view of the most important commands
 * for daily development work, with additional tool commands available under tool:*
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagePath = join(__dirname, '..', 'package.json');

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const scripts = packageJson.scripts;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

function printSection(title, commands) {
  console.log(`\n${colorize(title, colors.bright + colors.cyan)}`);
  console.log('─'.repeat(title.length));
  
  commands.forEach(([cmd, desc]) => {
    console.log(`  ${colorize(cmd, colors.green)}`);
    console.log(`    ${desc}`);
  });
}

console.log(colorize('🚀 OSS Hero - Developer Commands', colors.bright + colors.magenta));
console.log(colorize('================================', colors.magenta));

// Essential development flows
const essential = [
  ['npm run dev', 'Start development server with full tooling'],
  ['npm run build', 'Build production application'],
  ['npm run start', 'Start production server'],
  ['npm run lint', 'Run ESLint for code quality'],
  ['npm run typecheck', 'Run TypeScript type checking'],
  ['npm run test', 'Run all tests'],
  ['npm run ci', 'Run complete CI pipeline (lint + typecheck + tests + build)']
];

// Common tool commands
const commonTools = [
  ['npm run tool:check', 'Quick check: lint + typecheck'],
  ['npm run tool:test:watch', 'Run tests in watch mode'],
  ['npm run tool:doctor', 'Run system health check'],
  ['npm run tool:doctor:fix', 'Auto-fix system issues'],
  ['npm run tool:security:secrets', 'Check for secret leaks'],
  ['npm run tool:security:bundle', 'Analyze bundle for security issues'],
  ['npm run tool:check:env', 'Validate environment configuration']
];

// Development management
const devManagement = [
  ['npm run tool:dev:status', 'Show development server status'],
  ['npm run tool:dev:kill', 'Kill all development processes'],
  ['npm run tool:dev:clean', 'Clean development artifacts'],
  ['npm run tool:dev:ports', 'Show port usage']
];

// Renaming and refactoring
const refactoring = [
  ['npm run tool:rename:symbol', 'Rename symbol across codebase'],
  ['npm run tool:rename:import', 'Rename import path'],
  ['npm run tool:rename:route', 'Rename route path'],
  ['npm run tool:rename:table', 'Rename database table'],
  ['npm run tool:rename:safe', 'Safe rename with validation']
];

// Testing and quality
const testing = [
  ['npm run tool:test:policy', 'Run policy tests'],
  ['npm run tool:test:rls', 'Run RLS security tests'],
  ['npm run tool:test:webhooks', 'Run webhook tests'],
  ['npm run tool:test:guardian', 'Run guardian tests'],
  ['npm run tool:test:csp', 'Run CSP tests'],
  ['npm run tool:test:smoke', 'Run smoke tests']
];

// UI and design
const uiDesign = [
  ['npm run tool:ui:contracts', 'Check UI component contracts'],
  ['npm run tool:ui:a11y', 'Run accessibility tests'],
  ['npm run tool:ui:visual', 'Run visual regression tests'],
  ['npm run tool:ui:perf', 'Run performance tests'],
  ['npm run tool:design:check', 'Run all design checks']
];

printSection('🎯 Essential Development Flows', essential);
printSection('🔧 Common Tools', commonTools);
printSection('⚙️  Development Management', devManagement);
printSection('🔄 Refactoring & Renaming', refactoring);
printSection('🧪 Testing & Quality', testing);
printSection('🎨 UI & Design', uiDesign);

console.log(`\n${colorize('📚 Additional Commands', colors.bright + colors.yellow)}`);
console.log('─'.repeat(20));
console.log('All commands prefixed with `tool:` are available for advanced usage.');
console.log('Run `npm run` to see the complete list of available commands.');

console.log(`\n${colorize('💡 Quick Start', colors.bright + colors.green)}`);
console.log('─'.repeat(12));
console.log('1. Copy .env.example to .env.local and configure');
console.log('2. npm install');
console.log('3. npm run dev');
console.log('4. Open http://localhost:3000');

console.log(`\n${colorize('🔍 Troubleshooting', colors.bright + colors.red)}`);
console.log('─'.repeat(18));
console.log('• ESM errors: Ensure all .js files use .mjs extension');
console.log('• Missing envs: Run npm run tool:check:env');
console.log('• System issues: Run npm run tool:doctor');
console.log('• Security concerns: Run npm run tool:security:secrets');

console.log(`\n${colorize('📖 Documentation', colors.bright + colors.blue)}`);
console.log('─'.repeat(16));
console.log('• README.md - Quick start and setup');
console.log('• TEMPLATE_README.md - Template usage guide');
console.log('• docs/ - Comprehensive documentation');
console.log('• UNIVERSAL_HEADER.md - Development rules');

console.log(`\n${colorize('🎉 Happy coding!', colors.bright + colors.magenta)}\n`);
