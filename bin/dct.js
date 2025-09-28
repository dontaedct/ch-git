#!/usr/bin/env node

/**
 * DCT Micro-Apps CLI Initializer - Phase 1, Task 5
 * One-command client setup with intelligent defaults and validation
 * RUN_DATE=2025-08-29T16:31:54.733Z
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

const AVAILABLE_TIERS = ['starter', 'pro', 'advanced'];
const AVAILABLE_PRESETS = ['universal-consultation'];

// =============================================================================
// CLI CONFIGURATION
// =============================================================================

const CLI_CONFIG = {
  name: 'dct',
  version: '1.0.0',
  description: 'DCT Micro-Apps Template Initializer',
  defaultPreset: 'universal-consultation',
  defaultTier: 'advanced',
};

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Colorized console logging
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ Error: ${message}`, colors.red);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function header(message) {
  log(`\n🚀 ${message}`, colors.bright + colors.cyan);
  log('─'.repeat(message.length + 3), colors.dim);
}

/**
 * Create readline interface for prompts
 */
function createPrompt() {
  return createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Async prompt wrapper
 */
function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const rl = createPrompt();
    const displayDefault = defaultValue ? ` (${defaultValue})` : '';
    rl.question(`${question}${displayDefault}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Select from options prompt
 */
function selectPrompt(question, options, defaultIndex = 0) {
  return new Promise((resolve) => {
    const rl = createPrompt();
    
    log(`\n${question}`, colors.bright);
    options.forEach((option, index) => {
      const marker = index === defaultIndex ? '●' : '○';
      const color = index === defaultIndex ? colors.green : colors.dim;
      log(`${color}  ${marker} ${index + 1}. ${option}${colors.reset}`);
    });
    
    rl.question(`\nSelect option (1-${options.length}, default: ${defaultIndex + 1}): `, (answer) => {
      rl.close();
      const choice = parseInt(answer.trim()) || (defaultIndex + 1);
      const validChoice = Math.max(1, Math.min(choice, options.length));
      resolve(options[validChoice - 1]);
    });
  });
}

/**
 * Yes/No prompt
 */
function confirmPrompt(question, defaultValue = true) {
  return new Promise((resolve) => {
    const rl = createPrompt();
    const options = defaultValue ? '[Y/n]' : '[y/N]';
    rl.question(`${question} ${options}: `, (answer) => {
      rl.close();
      const response = answer.trim().toLowerCase();
      if (response === '') resolve(defaultValue);
      else resolve(response === 'y' || response === 'yes');
    });
  });
}

// =============================================================================
// PRESET UTILITIES
// =============================================================================

/**
 * Load preset configuration
 */
function loadPresetConfig(presetName) {
  try {
    const presetPath = join(rootDir, 'packages', 'templates', 'presets', `${presetName}.json`);
    if (!existsSync(presetPath)) {
      warning(`Preset file not found: ${presetPath}`);
      return null;
    }
    const presetContent = readFileSync(presetPath, 'utf-8');
    return JSON.parse(presetContent);
  } catch (err) {
    error(`Failed to load preset "${presetName}": ${err.message}`);
    return null;
  }
}

/**
 * Get preset recommendations based on tier
 */
function getPresetRecommendations(tier) {
  const recommendations = {
    starter: ['salon-waitlist', 'consultation-engine'],
    pro: ['realtor-listing-hub', 'salon-waitlist'],
    advanced: ['realtor-listing-hub', 'consultation-engine'],
  };
  return recommendations[tier] || AVAILABLE_PRESETS;
}

/**
 * Get intelligent defaults based on preset
 */
function getPresetDefaults(presetName) {
  const preset = loadPresetConfig(presetName);
  if (!preset) return {};

  return {
    tier: preset.tier || 'starter',
    enableStripe: preset.features?.payments || false,
    enableScheduler: preset.features?.automation || false,
    clientName: preset.name || 'My Business',
  };
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate input parameters
 */
function validateInputs(config) {
  const errors = [];
  const warnings = [];

  // Validate preset (should always be universal-consultation)
  if (!AVAILABLE_PRESETS.includes(config.preset)) {
    errors.push(`Invalid preset: ${config.preset}. Must be one of: ${AVAILABLE_PRESETS.join(', ')}`);
  }

  // Validate client name
  if (!config.clientName || config.clientName.trim().length === 0) {
    errors.push('Client name is required');
  }

  if (config.clientName && config.clientName.length > 50) {
    warnings.push('Client name is quite long, consider shortening for better display');
  }

  // Validate industry
  const validIndustries = ['technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'consulting', 'education', 'nonprofit', 'other'];
  if (config.industry && !validIndustries.includes(config.industry)) {
    errors.push(`Invalid industry: ${config.industry}. Must be one of: ${validIndustries.join(', ')}`);
  }

  // Validate company size
  const validSizes = ['solo', 'small', 'medium', 'large', 'enterprise'];
  if (config.companySize && !validSizes.includes(config.companySize)) {
    errors.push(`Invalid company size: ${config.companySize}. Must be one of: ${validSizes.join(', ')}`);
  }

  // Validate challenges
  const validChallenges = ['growth', 'efficiency', 'technology', 'team', 'marketing', 'finance', 'competition', 'compliance'];
  if (config.primaryChallenges && !validChallenges.includes(config.primaryChallenges)) {
    errors.push(`Invalid challenges: ${config.primaryChallenges}. Must be one of: ${validChallenges.join(', ')}`);
  }

  // Validate goals
  const validGoals = ['revenue-growth', 'cost-reduction', 'market-expansion', 'product-development', 'team-building', 'automation', 'customer-satisfaction', 'digital-transformation'];
  if (config.primaryGoals && !validGoals.includes(config.primaryGoals)) {
    errors.push(`Invalid goals: ${config.primaryGoals}. Must be one of: ${validGoals.join(', ')}`);
  }

  // Validate budget range
  const validBudgets = ['under-5k', '5k-15k', '15k-50k', '50k-plus'];
  if (config.budgetRange && !validBudgets.includes(config.budgetRange)) {
    errors.push(`Invalid budget range: ${config.budgetRange}. Must be one of: ${validBudgets.join(', ')}`);
  }

  // Validate timeline
  const validTimelines = ['immediately', 'within-month', 'within-quarter', 'planning'];
  if (config.timeline && !validTimelines.includes(config.timeline)) {
    errors.push(`Invalid timeline: ${config.timeline}. Must be one of: ${validTimelines.join(', ')}`);
  }

  return { errors, warnings };
}

/**
 * Perform health checks after configuration
 */
function performHealthChecks(config) {
  const checks = [];

  // Check if preset files exist
  const presetPath = join(rootDir, 'packages', 'templates', 'presets', `${config.preset}.json`);
  checks.push({
    name: 'Preset File',
    status: existsSync(presetPath) ? 'pass' : 'fail',
    message: existsSync(presetPath) ? 'Preset configuration loaded' : `Preset file not found: ${presetPath}`
  });

  // Check if app.config.ts exists
  const appConfigPath = join(rootDir, 'app.config.ts');
  checks.push({
    name: 'App Configuration',
    status: existsSync(appConfigPath) ? 'pass' : 'fail',
    message: existsSync(appConfigPath) ? 'App configuration exists' : 'App configuration file missing'
  });

  // Check if .env.example exists for reference
  const envExamplePath = join(rootDir, '.env.example');
  checks.push({
    name: 'Environment Template',
    status: existsSync(envExamplePath) ? 'pass' : 'warn',
    message: existsSync(envExamplePath) ? 'Environment template available' : 'No .env.example found'
  });

  return checks;
}

// =============================================================================
// CONFIGURATION GENERATION
// =============================================================================

/**
 * Generate app.config.ts content
 */
function generateAppConfig(config) {
  const timestamp = new Date().toISOString();
  
  return `/**
 * Application Configuration - Generated by DCT CLI
 * Created: ${timestamp}
 * Preset: ${config.preset}
 * Tier: ${config.tier}
 */

// Override environment-based configuration with CLI-generated values
process.env.APP_TIER = '${config.tier}';
process.env.APP_PRESET = '${config.preset}';
process.env.APP_NAME = '${config.clientName}';

// Import the main configuration
import config from './app.config.base';

// Export the configuration with CLI overrides
export * from './app.config.base';
export default config;
`;
}

/**
 * Generate .env.local content
 */
function generateEnvLocal(config) {
  const timestamp = new Date().toISOString();
  const preset = loadPresetConfig(config.preset);
  
  let envContent = `# DCT Micro-Apps Environment Configuration
# Generated: ${timestamp}
# Preset: ${config.preset} (${config.tier} tier)
# Client: ${config.clientName}
#
# IMPORTANT: This file contains placeholder values for development.
# Replace with actual values for production deployment.

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================

APP_TIER=${config.tier}
APP_PRESET=${config.preset}
APP_NAME="${config.clientName}"
NODE_ENV=development

# =============================================================================
# DATABASE SETTINGS
# =============================================================================

# Supabase Configuration (replace with your project details)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role_key_here

# Database URL (for migrations and server operations)
DATABASE_URL=placeholder_postgres_connection_string

# =============================================================================
# EMAIL SERVICES
# =============================================================================

# Resend (primary email service)
RESEND_API_KEY=placeholder_resend_api_key_here
`;

  // Add Stripe configuration if enabled
  if (config.enableStripe || (preset?.features?.payments)) {
    envContent += `
# =============================================================================
# PAYMENT PROCESSING
# =============================================================================

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=placeholder_stripe_publishable_key_here
STRIPE_SECRET_KEY=placeholder_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=placeholder_stripe_webhook_secret_here
`;
  }

  // Add webhook configuration if needed
  if (config.tier !== 'starter' || preset?.features?.webhooks) {
    envContent += `
# =============================================================================
# WEBHOOK INTEGRATION
# =============================================================================

# N8N Webhook Configuration
N8N_WEBHOOK_URL=${preset?.integrations?.n8n?.webhookUrl || 'https://webhook.example.com/dct-client'}
N8N_WEBHOOK_SECRET=placeholder_n8n_webhook_secret_here
`;
  }

  // Add scheduling configuration if enabled
  if (config.enableScheduler || preset?.features?.automation) {
    envContent += `
# =============================================================================
# SCHEDULING & AUTOMATION
# =============================================================================

# Calendar/Scheduling Integration
CALENDAR_API_KEY=placeholder_calendar_api_key_here
SCHEDULER_WEBHOOK_URL=placeholder_scheduler_webhook_url_here
`;
  }

  // Add monitoring for pro/advanced tiers
  if (['pro', 'advanced'].includes(config.tier)) {
    envContent += `
# =============================================================================
# MONITORING & OBSERVABILITY
# =============================================================================

# Error Tracking (Sentry)
SENTRY_DSN=placeholder_sentry_dsn_here
SENTRY_AUTH_TOKEN=placeholder_sentry_auth_token_here

# Performance Monitoring
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
`;
  }

  envContent += `
# =============================================================================
# SECURITY SETTINGS
# =============================================================================

# JWT/Session Configuration
JWT_SECRET=placeholder_jwt_secret_minimum_32_characters_here
NEXTAUTH_SECRET=placeholder_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX=${config.tier === 'starter' ? '100' : config.tier === 'pro' ? '1000' : '10000'}
RATE_LIMIT_WINDOW=60000

# =============================================================================
# FEATURE FLAGS
# =============================================================================

# Enable/disable features based on tier and preset
NEXT_PUBLIC_ENABLE_PAYMENTS=${config.enableStripe || (preset?.features?.payments) ? 'true' : 'false'}
NEXT_PUBLIC_ENABLE_WEBHOOKS=${config.tier !== 'starter' ? 'true' : 'false'}
NEXT_PUBLIC_ENABLE_AUTOMATION=${config.enableScheduler || (preset?.features?.automation) ? 'true' : 'false'}
NEXT_PUBLIC_ENABLE_AI_FEATURES=${config.tier === 'advanced' ? 'true' : 'false'}
NEXT_PUBLIC_ENABLE_DEBUG_MODE=${config.tier === 'advanced' ? 'true' : 'false'}

# =============================================================================
# DEVELOPMENT SETTINGS
# =============================================================================

# Development/Debug Settings
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_SHOW_CONFIG_PANEL=true
DEBUG_ROUTES=true

# =============================================================================
# END OF CONFIGURATION
# =============================================================================
# 
# 🎯 NEXT STEPS:
# 1. Replace all placeholder values with actual credentials
# 2. Run 'npm run env:doctor' to check configuration
# 3. Visit http://localhost:3000/admin/diagnostics to verify setup
# 4. Start development with 'npm run dev'
#
# 📚 DOCUMENTATION:
# - Environment setup: /docs/ops/env.md
# - Preset configuration: /packages/templates/presets/${config.preset}.json
# - Feature flags: /lib/flags.ts
#
`;

  return envContent;
}

/**
 * Backup existing app.config.ts if it exists
 */
function backupAppConfig() {
  const appConfigPath = join(rootDir, 'app.config.ts');
  const appConfigBasePath = join(rootDir, 'app.config.base.ts');
  
  if (existsSync(appConfigPath) && !existsSync(appConfigBasePath)) {
    try {
      const content = readFileSync(appConfigPath, 'utf-8');
      writeFileSync(appConfigBasePath, content);
      success('Backed up existing app.config.ts to app.config.base.ts');
      return true;
    } catch (err) {
      error(`Failed to backup app.config.ts: ${err.message}`);
      return false;
    }
  }
  return true;
}

/**
 * Write configuration files
 */
function writeConfigFiles(config) {
  try {
    // Backup existing app.config.ts
    if (!backupAppConfig()) {
      throw new Error('Failed to backup existing configuration');
    }

    // Write app.config.ts
    const appConfigPath = join(rootDir, 'app.config.ts');
    const appConfigContent = generateAppConfig(config);
    writeFileSync(appConfigPath, appConfigContent);
    success('Generated app.config.ts');

    // Write .env.local
    const envLocalPath = join(rootDir, '.env.local');
    const envLocalContent = generateEnvLocal(config);
    writeFileSync(envLocalPath, envLocalContent);
    success('Generated .env.local with placeholder values');

    return true;
  } catch (err) {
    error(`Failed to write configuration files: ${err.message}`);
    return false;
  }
}

// =============================================================================
// REPORTING
// =============================================================================

/**
 * Generate configuration summary
 */
function generateSummary(config) {
  const preset = loadPresetConfig(config.preset);
  const enabledFeatures = [];
  
  if (preset?.features) {
    Object.entries(preset.features).forEach(([feature, enabled]) => {
      if (enabled) enabledFeatures.push(feature);
    });
  }

  if (config.enableStripe) enabledFeatures.push('stripe_payments');
  if (config.enableScheduler) enabledFeatures.push('scheduling');

  return {
    client: config.clientName,
    tier: config.tier,
    preset: config.preset,
    presetName: preset?.name || config.preset,
    enabledFeatures,
    generatedFiles: ['app.config.ts', '.env.local'],
    nextSteps: [
      'Replace placeholder values in .env.local',
      'Run "npm run env:doctor" to check configuration',
      'Visit /admin/diagnostics to verify setup',
      'Start development with "npm run dev"'
    ]
  };
}

/**
 * Display configuration summary
 */
function displaySummary(summary) {
  header('Configuration Summary');
  
  log(`📋 Client Name: ${colors.bright}${summary.client}${colors.reset}`);
  log(`🎯 Tier: ${colors.green}${summary.tier}${colors.reset}`);
  log(`🎨 Preset: ${colors.blue}${summary.preset}${colors.reset} (${summary.presetName})`);
  log(`🔧 Features: ${summary.enabledFeatures.join(', ')}`);
  
  log('\n📁 Generated Files:', colors.bright);
  summary.generatedFiles.forEach(file => {
    log(`   ✅ ${file}`, colors.green);
  });

  log('\n🎯 Next Steps:', colors.bright);
  summary.nextSteps.forEach((step, index) => {
    log(`   ${index + 1}. ${step}`, colors.cyan);
  });
}

/**
 * Open diagnostics page in browser
 */
function openDiagnostics() {
  const diagnosticsUrl = 'http://localhost:3000/admin/diagnostics';
  
  try {
    // Try to open the browser (cross-platform)
    const start = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    
    spawn(start, [diagnosticsUrl], { detached: true, stdio: 'ignore' });
    success(`Opening diagnostics page: ${diagnosticsUrl}`);
  } catch (err) {
    info(`Please visit: ${diagnosticsUrl}`);
  }
}

// =============================================================================
// INTERACTIVE MODE
// =============================================================================

/**
 * Run interactive configuration wizard
 */
async function runInteractiveMode() {
  header('DCT Micro-Apps Template Initializer');
  info('This wizard will help you configure your DCT template for your client.');
  
  try {
    // Step 1: Client Name
    const clientName = await prompt('What is your client\'s business name?', 'My Business');
    
    // Step 2: Industry Selection
    const industryDescriptions = [
      'technology - Technology/Software',
      'healthcare - Healthcare',
      'finance - Financial Services', 
      'retail - Retail/E-commerce',
      'manufacturing - Manufacturing',
      'consulting - Consulting',
      'education - Education',
      'nonprofit - Non-profit',
      'other - Other'
    ];
    const industry = await selectPrompt('What industry is your client in?', industryDescriptions, 0);
    const selectedIndustry = industry.split(' - ')[0]; // Extract industry value
    
    // Step 3: Company Size
    const sizeDescriptions = [
      'solo - Just me (solo)',
      'small - 2-10 employees', 
      'medium - 11-50 employees',
      'large - 51-200 employees',
      'enterprise - 200+ employees'
    ];
    const companySize = await selectPrompt('What size is the company?', sizeDescriptions, 0);
    const selectedSize = companySize.split(' - ')[0]; // Extract size value
    
    // Step 4: Primary Challenges
    const challengeDescriptions = [
      'growth - Scaling/Growth',
      'efficiency - Operational Efficiency',
      'technology - Technology/Digital Transformation',
      'team - Team Management',
      'marketing - Marketing/Customer Acquisition',
      'finance - Financial Management',
      'competition - Competitive Pressure',
      'compliance - Compliance/Regulatory'
    ];
    const challenges = await selectPrompt('What are the primary business challenges?', challengeDescriptions, 0);
    const selectedChallenges = challenges.split(' - ')[0]; // Extract challenge value
    
    // Step 5: Primary Goals
    const goalDescriptions = [
      'revenue-growth - Revenue Growth',
      'cost-reduction - Cost Reduction',
      'market-expansion - Market Expansion',
      'product-development - Product Development',
      'team-building - Team Building',
      'automation - Process Automation',
      'customer-satisfaction - Customer Satisfaction',
      'digital-transformation - Digital Transformation'
    ];
    const goals = await selectPrompt('What are the primary business goals?', goalDescriptions, 0);
    const selectedGoals = goals.split(' - ')[0]; // Extract goal value
    
    // Step 6: Budget Range
    const budgetDescriptions = [
      'under-5k - Under $5,000',
      '5k-15k - $5,000 - $15,000',
      '15k-50k - $15,000 - $50,000',
      '50k-plus - $50,000+'
    ];
    const budget = await selectPrompt('What is the budget range?', budgetDescriptions, 0);
    const selectedBudget = budget.split(' - ')[0]; // Extract budget value
    
    // Step 7: Timeline
    const timelineDescriptions = [
      'immediately - Immediately',
      'within-month - Within 1 month',
      'within-quarter - Within 3 months',
      'planning - Just planning for now'
    ];
    const timeline = await selectPrompt('When would you like to start?', timelineDescriptions, 0);
    const selectedTimeline = timeline.split(' - ')[0]; // Extract timeline value
    
    const config = {
      clientName,
      industry: selectedIndustry,
      companySize: selectedSize,
      primaryChallenges: selectedChallenges,
      primaryGoals: selectedGoals,
      budgetRange: selectedBudget,
      timeline: selectedTimeline,
      preset: 'universal-consultation',
      tier: 'advanced', // Universal consultation template is advanced tier
      mode: 'interactive'
    };
    
    // Validate configuration
    const validation = validateInputs(config);
    
    if (validation.errors.length > 0) {
      error('Configuration validation failed:');
      validation.errors.forEach(err => error(`  - ${err}`));
      process.exit(1);
    }
    
    if (validation.warnings.length > 0) {
      warning('Configuration warnings:');
      validation.warnings.forEach(warn => warning(`  - ${warn}`));
    }
    
    // Confirm before proceeding
    log('\n' + '═'.repeat(60), colors.dim);
    const summary = generateSummary(config);
    displaySummary(summary);
    log('═'.repeat(60), colors.dim);
    
    const confirmed = await confirmPrompt('\nProceed with this configuration?', true);
    if (!confirmed) {
      info('Configuration cancelled.');
      process.exit(0);
    }
    
    return config;
  } catch (err) {
    error(`Interactive mode failed: ${err.message}`);
    process.exit(1);
  }
}

// =============================================================================
// CLI ARGUMENTS PARSING
// =============================================================================

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const config = {
    mode: 'interactive',
    help: false,
    version: false,
    clientName: '',
    industry: '',
    companySize: '',
    primaryChallenges: '',
    primaryGoals: '',
    budgetRange: '',
    timeline: '',
    preset: CLI_CONFIG.defaultPreset,
    tier: 'advanced', // Universal consultation is always advanced
    ci: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        config.help = true;
        break;
        
      case '--version':
      case '-v':
        config.version = true;
        break;
        
      case '--name':
      case '-n':
        config.clientName = args[++i] || '';
        config.mode = 'ci';
        break;
        
      case '--industry':
      case '-i':
        config.industry = args[++i] || '';
        config.mode = 'ci';
        break;
        
      case '--size':
      case '-s':
        config.companySize = args[++i] || '';
        config.mode = 'ci';
        break;
        
      case '--challenges':
      case '-c':
        config.primaryChallenges = args[++i] || '';
        config.mode = 'ci';
        break;
        
      case '--goals':
      case '-g':
        config.primaryGoals = args[++i] || '';
        config.mode = 'ci';
        break;
        
      case '--budget':
      case '-b':
        config.budgetRange = args[++i] || '';
        config.mode = 'ci';
        break;
        
      case '--timeline':
      case '-t':
        config.timeline = args[++i] || '';
        config.mode = 'ci';
        break;
        
      case '--ci':
        config.ci = true;
        config.mode = 'ci';
        break;
        
      case '--verbose':
        config.verbose = true;
        break;
    }
  }

  return config;
}

// =============================================================================
// HELP & VERSION
// =============================================================================

/**
 * Display help information
 */
function showHelp() {
  log(`${colors.bright}${CLI_CONFIG.name} v${CLI_CONFIG.version}${colors.reset}`);
  log(CLI_CONFIG.description);
  log('');
  log('Usage:', colors.bright);
  log('  npx dct init                    # Interactive mode');
  log('  npx dct init [options]          # CI-friendly mode');
  log('');
  log('Options:', colors.bright);
  log('  -n, --name <name>       Client business name');
  log('  -i, --industry <industry> Industry: technology, healthcare, finance, retail, manufacturing, consulting, education, nonprofit, other');
  log('  -s, --size <size>       Company size: solo, small, medium, large, enterprise');
  log('  -c, --challenges <challenges> Primary challenges: growth, efficiency, technology, team, marketing, finance, competition, compliance');
  log('  -g, --goals <goals>     Primary goals: revenue-growth, cost-reduction, market-expansion, product-development, team-building, automation, customer-satisfaction, digital-transformation');
  log('  -b, --budget <budget>   Budget range: under-5k, 5k-15k, 15k-50k, 50k-plus');
  log('  -t, --timeline <timeline> Timeline: immediately, within-month, within-quarter, planning');
  log('      --ci                Non-interactive CI mode');
  log('      --verbose           Verbose output');
  log('  -h, --help              Show help');
  log('  -v, --version           Show version');
  log('');
  log('Examples:', colors.bright);
  log('  npx dct init --name "TechCorp" --industry technology --size medium --challenges growth --goals revenue-growth --budget 15k-50k --timeline within-month');
  log('  npx dct init --name "HealthPlus" --industry healthcare --size large --challenges efficiency --goals automation --budget 50k-plus --timeline immediately');
  log('  npx dct init --ci --name "Consulting Firm" --industry consulting --size small --challenges team --goals team-building --budget 5k-15k --timeline planning');
  log('');
  log('Generated Files:', colors.bright);
  log('  app.config.ts     # Application configuration');
  log('  .env.local        # Environment variables with placeholders');
  log('');
  log('Next Steps:', colors.bright);
  log('  1. Replace placeholder values in .env.local');
  log('  2. Run "npm run env:doctor" to check configuration');
  log('  3. Visit /admin/diagnostics to verify setup');
  log('  4. Start with "npm run dev"');
}

/**
 * Display version information
 */
function showVersion() {
  log(`${CLI_CONFIG.name} v${CLI_CONFIG.version}`);
}

// =============================================================================
// MAIN CLI ENTRY POINT
// =============================================================================

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const config = parseArgs(args);
  
  if (config.help) {
    showHelp();
    return;
  }
  
  if (config.version) {
    showVersion();
    return;
  }
  
  try {
    let finalConfig;
    
    if (config.mode === 'interactive') {
      // Interactive mode
      finalConfig = await runInteractiveMode();
    } else {
      // CI mode
      if (!config.clientName && !config.ci) {
        error('Client name is required in CI mode. Use --name "Your Business Name"');
        process.exit(1);
      }
      
      // Use intelligent defaults if not specified
      if (!config.clientName) {
        const defaults = getPresetDefaults(config.preset);
        config.clientName = defaults.clientName || 'My Business';
      }
      
      finalConfig = config;
    }
    
    // Validate configuration
    const validation = validateInputs(finalConfig);
    
    if (validation.errors.length > 0) {
      error('Configuration validation failed:');
      validation.errors.forEach(err => error(`  - ${err}`));
      process.exit(1);
    }
    
    if (validation.warnings.length > 0 && !finalConfig.ci) {
      warning('Configuration warnings:');
      validation.warnings.forEach(warn => warning(`  - ${warn}`));
    }
    
    // Write configuration files
    const writeSuccess = writeConfigFiles(finalConfig);
    if (!writeSuccess) {
      process.exit(1);
    }
    
    // Perform health checks
    const healthChecks = performHealthChecks(finalConfig);
    let healthPassed = true;
    
    if (finalConfig.verbose || !finalConfig.ci) {
      log('\n🏥 Health Checks:', colors.bright);
      healthChecks.forEach(check => {
        const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
        const color = check.status === 'pass' ? colors.green : check.status === 'warn' ? colors.yellow : colors.red;
        log(`   ${icon} ${check.name}: ${color}${check.message}${colors.reset}`);
        
        if (check.status === 'fail') {
          healthPassed = false;
        }
      });
    }
    
    if (!healthPassed) {
      error('Some health checks failed. Please review the configuration.');
    }
    
    // Display summary
    if (!finalConfig.ci) {
      const summary = generateSummary(finalConfig);
      displaySummary(summary);
      
      // Offer to open diagnostics
      const openBrowser = await confirmPrompt('\nOpen diagnostics page in browser?', true);
      if (openBrowser) {
        openDiagnostics();
      }
    } else {
      // CI mode: brief output
      success(`Configuration generated for "${finalConfig.clientName}" (${finalConfig.tier}/${finalConfig.preset})`);
      info('Files: app.config.ts, .env.local');
      info('Run "npm run env:doctor" to validate configuration');
    }
    
  } catch (err) {
    error(`CLI failed: ${err.message}`);
    if (config.verbose) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (err) => {
  error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  error(`Unhandled rejection: ${err?.message || err}`);
  process.exit(1);
});

// Run the CLI
main();