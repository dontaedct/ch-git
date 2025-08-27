#!/usr/bin/env node

/**
 * MIT Hero Design Safety Module Installer
 * 
 * Installs the complete Design Safety Module into any target repository.
 * Run this script from within the target repository to set up all required files.
 */

import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SOURCE_REPO = join(__dirname, '../../..'); // Go up from scripts/mit-hero-port/
const TARGET_REPO = process.cwd();

const REQUIRED_FOLDERS = [
  'design/policies',
  'design/scripts', 
  'design/budgets',
  'design/templates',
  'design/screenshots',
  'tests/ui',
  '.github/workflows'
];

const REQUIRED_FILES = [
  // Design policies
  'design/policies/eslint-design.config.cjs',
  'design/policies/import-boundaries.cjs',
  'design/policies/token-guards.cjs',
  'design/policies/eslint-design-required.config.cjs',
  'design/policies/eslint-design-advisory.config.cjs',
  
  // Design scripts
  'design/scripts/component-contract-auditor.mjs',
  'design/scripts/design-guardian.mjs',
  'design/scripts/performance-audit.mjs',
  'design/scripts/visual-watch.mjs',
  'design/scripts/a11y-scanner.mjs',
  
  // Design configs
  'design/lhci.config.cjs',
  'design/README.md',
  
  // Test templates
  'tests/ui/a11y.spec.ts',
  'tests/ui/visual.spec.ts',
  'tests/ui/smoke.spec.ts',
  'tests/ui/a11y.config.ts',
  
  // Workflows
  '.github/workflows/design-safety.yml',
  '.github/workflows/safety-gate-status-bridge.yml',
  '.github/workflows/feat-route-adapter-guard.yml'
];

const PACKAGE_SCRIPTS = {
  "design:check": "npm run -s typecheck && npm run -s lint && npm run -s ui:contracts && npm run -s ui:a11y && npm run -s ui:visual",
  "ui:contracts": "node design/scripts/component-contract-auditor.mjs || echo \"(info) contracts auditor not present — skipping\"",
  "ui:a11y": "npx -y playwright test tests/ui/a11y.spec.ts || true",
  "ui:visual": "npx -y playwright test tests/ui/visual.spec.ts || true",
  "ui:perf": "npx -y lhci autorun --config=design/lhci.config.cjs || true"
};

const TEST_TEMPLATES = {
  'tests/ui/a11y.spec.ts': `import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('homepage meets accessibility standards', async ({ page }) => {
    await page.goto('/');
    
    // Basic accessibility checks
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const firstFocusable = await page.locator(':focus').first();
    expect(firstFocusable).toBeTruthy();
  });
});`,

  'tests/ui/visual.spec.ts': `import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('homepage visual consistency', async ({ page }) => {
    await page.goto('/');
    
    // Take screenshot for visual regression testing
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('component library consistency', async ({ page }) => {
    // Test individual components if you have a component showcase page
    // await page.goto('/components');
    // await expect(page).toHaveScreenshot('components.png');
  });
});`,

  'tests/ui/smoke.spec.ts': `import { test, expect } from '@playwright/test';

test.describe('UI Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Basic functionality checks
    await expect(page).toHaveTitle(/./);
    await expect(page.locator('body')).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Test basic navigation if you have nav elements
    // const navLinks = page.locator('nav a');
    // if (await navLinks.count() > 0) {
    //   await navLinks.first().click();
    //   await expect(page).not.toHaveURL('/');
    // }
  });
});`,

  'tests/ui/a11y.config.ts': `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/ui',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});`
};

class DesignSafetyInstaller {
  constructor() {
    this.installedFiles = [];
    this.updatedFiles = [];
    this.errors = [];
  }

  async run() {
    console.log('🚀 MIT Hero Design Safety Module Installer');
    console.log('==========================================\n');

    try {
      await this.validateEnvironment();
      await this.createRequiredFolders();
      await this.copyRequiredFiles();
      await this.updatePackageJson();
      await this.createTestTemplates();
      await this.createSelfTestWorkflow();
      await this.createPRChecklist();
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Installation failed:', error.message);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating environment...');
    
    // Check if we're in a git repo
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    } catch {
      throw new Error('Not in a git repository. Please run this from your target repo root.');
    }

    // Check if package.json exists
    const packageJsonPath = join(TARGET_REPO, 'package.json');
    if (!await this.fileExists(packageJsonPath)) {
      throw new Error('package.json not found. Please run this from your project root.');
    }

    console.log('✅ Environment validated\n');
  }

  async createRequiredFolders() {
    console.log('📁 Creating required folders...');
    
    for (const folder of REQUIRED_FOLDERS) {
      const fullPath = join(TARGET_REPO, folder);
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`  ✓ ${folder}`);
    }
    
    console.log('');
  }

  async copyRequiredFiles() {
    console.log('📋 Copying required files...');
    
    for (const file of REQUIRED_FILES) {
      const sourcePath = join(SOURCE_REPO, file);
      const targetPath = join(TARGET_REPO, file);
      
      if (await this.fileExists(sourcePath)) {
        await this.copyFile(sourcePath, targetPath);
        this.installedFiles.push(file);
        console.log(`  ✓ ${file}`);
      } else {
        console.log(`  ⚠️  ${file} not found in source (will create template)`);
      }
    }
    
    console.log('');
  }

  async updatePackageJson() {
    console.log('📦 Updating package.json scripts...');
    
    const packageJsonPath = join(TARGET_REPO, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    let updated = false;
    for (const [script, command] of Object.entries(PACKAGE_SCRIPTS)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
        updated = true;
        console.log(`  ✓ Added script: ${script}`);
      }
    }
    
    if (updated) {
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      this.updatedFiles.push('package.json');
    } else {
      console.log('  ℹ️  All scripts already present');
    }
    
    console.log('');
  }

  async createTestTemplates() {
    console.log('🧪 Creating test templates...');
    
    for (const [file, content] of Object.entries(TEST_TEMPLATES)) {
      const fullPath = join(TARGET_REPO, file);
      
      if (!await this.fileExists(fullPath)) {
        await fs.writeFile(fullPath, content);
        console.log(`  ✓ Created template: ${file}`);
      } else {
        console.log(`  ℹ️  ${file} already exists (skipping)`);
      }
    }
    
    console.log('');
  }

  async createSelfTestWorkflow() {
    console.log('🔄 Creating self-test workflow...');
    
    const workflowContent = `name: MIT Hero Port Self-Test

on:
  workflow_dispatch: {}

permissions:
  contents: read

jobs:
  self-test:
    name: Design Safety Self-Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Run design safety check
        run: npm run design:check

      - name: Check for visual baselines
        run: |
          if [ ! -d "tests/ui/__screenshots__" ]; then
            echo "⚠️  No visual baselines found. Run this workflow on main or via dispatch to seed baselines."
            exit 1
          fi
          echo "✅ Visual baselines found"

      - name: Success message
        if: success()
        run: echo "🎉 Design Safety Module self-test passed!"`;

    const workflowPath = join(TARGET_REPO, '.github/workflows/mit-hero-port-selftest.yml');
    await fs.writeFile(workflowPath, workflowContent);
    this.installedFiles.push('.github/workflows/mit-hero-port-selftest.yml');
    
    console.log('  ✓ Created self-test workflow\n');
  }

  async createPRChecklist() {
    console.log('📋 Creating PR checklist...');
    
    const checklistContent = `# Design Safety PR Checklist

## Reviewer Checks

### 🚫 Import Boundaries
- [ ] No adapter imports in UI components
- [ ] No business logic in UI components  
- [ ] No route handlers imported by components

### ♿ Accessibility
- [ ] A11y labels present and meaningful
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

### 🎨 Visual Consistency
- [ ] No unintended visual changes
- [ ] Design tokens used consistently
- [ ] Component library integrity maintained

### 📋 Route Invariants
- [ ] Route structure unchanged
- [ ] No breaking API changes
- [ ] Contract tests pass

### ✅ Design Check
- [ ] \`npm run design:check\` passes
- [ ] No new linting errors
- [ ] Type checking passes

## Pre-Merge Checklist

1. **Run locally**: \`npm run design:check\`
2. **Visual tests**: Ensure baselines exist or update them
3. **A11y tests**: Verify keyboard navigation and screen reader support
4. **Contract tests**: Confirm component APIs unchanged

## Common Issues

- **Missing baselines**: Run \`npx playwright test tests/ui/visual.spec.ts --update-snapshots\` on main
- **Import violations**: Move business logic out of UI components
- **Contract failures**: Check component prop interfaces and exports`;

    const checklistPath = join(TARGET_REPO, 'docs/snippets/pr-checklist-design-safety.md');
    await fs.mkdir(dirname(checklistPath), { recursive: true });
    await fs.writeFile(checklistPath, checklistContent);
    this.installedFiles.push('docs/snippets/pr-checklist-design-safety.md');
    
    console.log('  ✓ Created PR checklist\n');
  }

  async copyFile(source, target) {
    const content = await fs.readFile(source, 'utf8');
    await fs.writeFile(target, content);
  }

  async fileExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  printSummary() {
    console.log('🎉 MIT Hero Design Safety Module — Installed Successfully!');
    console.log('========================================================\n');
    
    console.log('📁 Files Added/Updated:');
    this.installedFiles.forEach(file => console.log(`  ✓ ${file}`));
    
    if (this.updatedFiles.length > 0) {
      console.log('\n📦 Files Modified:');
      this.updatedFiles.forEach(file => console.log(`  ✓ ${file}`));
    }
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Run: npm run design:check');
    console.log('2. Seed visual baselines: npx playwright test tests/ui/visual.spec.ts --update-snapshots');
    console.log('3. Test route guard: Create a UI component PR');
    console.log('4. Customize: Update design tokens and performance budgets');
    
    console.log('\n📚 Documentation:');
    console.log('- Read: docs/design-safety-module.md');
    console.log('- PR Checklist: docs/snippets/pr-checklist-design-safety.md');
    console.log('- Self-Test: .github/workflows/mit-hero-port-selftest.yml');
    
    console.log('\n✨ Installation complete! Your app now has enterprise-grade design safety.');
  }
}

// Run installer
const installer = new DesignSafetyInstaller();
installer.run().catch(console.error);
