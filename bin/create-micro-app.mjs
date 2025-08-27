#!/usr/bin/env node

/**
 * Micro App Scaffolder
 * 
 * Creates a new micro app from the minimal template
 * Usage: node bin/create-micro-app.mjs <app-name>
 */

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Minimal template directories to copy
const MINIMAL_DIRS = [
  'app/login',
  'app/operability',
  'app/api/health',
  'app/api/webhooks',
  'app/api/ping',
  'components/ui',
  'components/header.tsx',
  'components/ProtectedNav.tsx',
  'components/PublicNav.tsx',
  'components/theme-provider.tsx',
  'lib/supabase',
  'lib/auth',
  'lib/flags',
  'lib/registry',
  'lib/utils.ts',
  'lib/validations.ts',
  'hooks/use-toast.ts',
  'hooks/use-mobile.ts',
  'data',
  'types',
  'supabase',
  'middleware.ts',
  'next.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json',
  'eslint.config.js',
  'jest.config.js',
  'jest.setup.js',
  'playwright.config.ts',
  'sentry.client.config.ts',
  'sentry.server.config.ts',
  'vercel.json',
  'UNIVERSAL_HEADER.md',
  'AI_ENTRYPOINT.md',
  'env.example'
];

// Files to exclude from copying
const EXCLUDE_FILES = [
  'node_modules',
  '.git',
  '.vercel',
  'logs',
  'test-results',
  'playwright-report',
  'artifacts',
  'reports',
  'var',
  'examples',
  'attic',
  'packages',
  'design',
  'scripts',
  'tests',
  'docs',
  'components/auto-save-recovery.tsx',
  'components/auto-save-status.tsx',
  'components/empty-states.tsx',
  'components/guardian-dashboard.tsx',
  'components/intake-form.tsx',
  'components/invite-panel.tsx',
  'components/progress-dashboard.tsx',
  'components/rsvp-panel.tsx',
  'components/session-form.tsx',
  'components/session-list.tsx',
  'hooks/use-auto-save.ts',
  'app/clients',
  'app/client-portal',
  'app/sessions',
  'app/progress',
  'app/trainer-profile',
  'app/weekly-plans',
  'app/intake',
  'app/status',
  'app/probe',
  'app/api/clients',
  'app/api/sessions',
  'app/api/checkins',
  'app/api/weekly-plans',
  'app/api/weekly-recap',
  'app/api/ai',
  'app/api/guardian',
  'app/api/n8n',
  'app/api/admin',
  'app/api/v1',
  'app/api/test-email',
  'app/api/probe',
  'app/api/media',
  'app/api/email-smoke',
  'app/api/env-check',
  'app/api/db-check',
  'app/api/debug-env',
  'app/adapters',
  'data/clients.repo.ts',
  'data/checkins.repo.ts',
  'data/progress-metrics.repo.ts',
  'data/weekly-plans.repo.ts'
];

function copyDir(src, dest) {
  try {
    mkdirSync(dest, { recursive: true });
    const entries = readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error(`Error copying ${src}:`, error.message);
  }
}

function readdirSync(path, options) {
  // Simple implementation for Node.js compatibility
  const fs = require('fs');
  return fs.readdirSync(path, options);
}

function updatePackageJson(appName, appPath) {
  const packageJsonPath = join(appPath, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.name = appName;
  packageJson.version = '0.1.0';
  
  // Remove demo-specific scripts
  delete packageJson.scripts['test:guardian'];
  delete packageJson.scripts['tool:ai:evaluate'];
  delete packageJson.scripts['tool:ai:eval:ci'];
  
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function createReadme(appName, appPath) {
  const readmeContent = `# ${appName}

A minimal Next.js application with Supabase integration, authentication, and feature flags.

## Quick Start

1. Copy \`env.example\` to \`.env.local\` and fill in your Supabase credentials
2. Install dependencies: \`npm install\`
3. Run the development server: \`npm run dev\`
4. Open [http://localhost:3000](http://localhost:3000)

## Features

- 🔐 Authentication with Supabase Auth
- 🚩 Feature flags system
- 🎨 Tailwind CSS + shadcn/ui components
- 📱 Responsive design
- 🔒 Row Level Security (RLS) enabled
- 🧪 Testing setup with Jest and Playwright
- 📊 Sentry error tracking
- 🚀 Vercel deployment ready

## Project Structure

\`\`\`
app/
├── login/          # Authentication pages
├── operability/    # Admin/ops pages
└── api/           # API routes
    ├── health/    # Health check endpoint
    ├── ping/      # Basic ping endpoint
    └── webhooks/  # Webhook handlers

components/
├── ui/            # Reusable UI components
├── header.tsx     # Main header component
├── ProtectedNav.tsx  # Navigation for authenticated users
└── PublicNav.tsx  # Navigation for public users

lib/
├── supabase/      # Supabase client configuration
├── auth/          # Authentication utilities
├── flags/         # Feature flags system
└── registry/      # Application registries

data/              # Data access layer
types/             # TypeScript type definitions
supabase/          # Database migrations and config
\`\`\`

## Environment Variables

Copy \`env.example\` to \`.env.local\` and configure:

- \`NEXT_PUBLIC_SUPABASE_URL\`: Your Supabase project URL
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`: Your Supabase anonymous key
- \`SUPABASE_SERVICE_ROLE_KEY\`: Your Supabase service role key (server-side only)
- \`SENTRY_DSN\`: Sentry DSN for error tracking (optional)

## Development

- \`npm run dev\`: Start development server
- \`npm run build\`: Build for production
- \`npm run lint\`: Run ESLint
- \`npm run typecheck\`: Run TypeScript checks
- \`npm run test\`: Run tests
- \`npm run ci\`: Run full CI pipeline

## Deployment

This app is configured for Vercel deployment. Simply connect your repository and deploy.

## Security

- Row Level Security (RLS) is enabled on all tables
- Service role key is only used server-side
- Environment variables are properly secured
- CSP headers are configured

## License

MIT
`;

  writeFileSync(join(appPath, 'README.md'), readmeContent);
}

function main() {
  const appName = process.argv[2];
  
  if (!appName) {
    console.error('Usage: node bin/create-micro-app.mjs <app-name>');
    process.exit(1);
  }
  
  if (!/^[a-z0-9-]+$/.test(appName)) {
    console.error('App name must contain only lowercase letters, numbers, and hyphens');
    process.exit(1);
  }
  
  const appPath = join(process.cwd(), appName);
  
  console.log(`Creating micro app: ${appName}`);
  console.log(`Target directory: ${appPath}`);
  
  // Create app directory
  mkdirSync(appPath, { recursive: true });
  
  // Copy minimal template files
  for (const dir of MINIMAL_DIRS) {
    const srcPath = join(projectRoot, dir);
    const destPath = join(appPath, dir);
    
    if (existsSync(srcPath)) {
      if (statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  }
  
  // Copy package.json and update it
  copyFileSync(join(projectRoot, 'package.json'), join(appPath, 'package.json'));
  updatePackageJson(appName, appPath);
  
  // Create README
  createReadme(appName, appPath);
  
  // Create .gitignore
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo

# Testing
coverage/
test-results/
playwright-report/

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
`;

  writeFileSync(join(appPath, '.gitignore'), gitignoreContent);
  
  console.log('\n✅ Micro app created successfully!');
  console.log('\nNext steps:');
  console.log(`1. cd ${appName}`);
  console.log('2. cp env.example .env.local');
  console.log('3. Edit .env.local with your Supabase credentials');
  console.log('4. npm install');
  console.log('5. npm run dev');
  console.log('\nHappy coding! 🚀');
}

// Helper functions
function existsSync(path) {
  try {
    const fs = require('fs');
    return fs.existsSync(path);
  } catch {
    return false;
  }
}

function statSync(path) {
  const fs = require('fs');
  return fs.statSync(path);
}

main();
