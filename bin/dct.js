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
const AVAILABLE_PRESETS = ['salon-waitlist', 'realtor-listing-hub', 'consultation-engine'];

// =============================================================================
// CLI CONFIGURATION
// =============================================================================

const CLI_CONFIG = {
  name: 'dct',
  version: '1.0.0',
  description: 'DCT Micro-Apps Template Initializer',
  defaultPreset: 'salon-waitlist',
  defaultTier: 'starter',
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

  // Validate tier
  if (!AVAILABLE_TIERS.includes(config.tier)) {
    errors.push(`Invalid tier: ${config.tier}. Must be one of: ${AVAILABLE_TIERS.join(', ')}`);
  }

  // Validate preset
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

  // Cross-validation: Check if preset supports selected tier
  const preset = loadPresetConfig(config.preset);
  if (preset && preset.tier && preset.tier !== config.tier) {
    warnings.push(`Preset "${config.preset}" is designed for tier "${preset.tier}" but you selected "${config.tier}"`);
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
    
    // Step 2: Tier Selection
    const tierDescriptions = [
      'starter - Basic features, perfect for simple websites',
      'pro - Advanced features with payments and automation',
      'advanced - All features including AI and enterprise tools'
    ];
    const tier = await selectPrompt('Select your tier:', tierDescriptions, 0);
    const selectedTier = tier.split(' ')[0]; // Extract tier name
    
    // Step 3: Preset Selection (with recommendations)
    const recommendedPresets = getPresetRecommendations(selectedTier);
    const presetDescriptions = AVAILABLE_PRESETS.map(preset => {
      const config = loadPresetConfig(preset);
      const isRecommended = recommendedPresets.includes(preset);
      const mark = isRecommended ? '⭐' : '  ';
      return `${mark} ${preset} - ${config?.name || preset}`;
    });
    
    const presetSelection = await selectPrompt('Select your preset:', presetDescriptions, 0);
    const preset = presetSelection.replace(/^[⭐\s]*/, '').split(' ')[0]; // Extract preset name
    
    // Get intelligent defaults based on preset
    const defaults = getPresetDefaults(preset);
    
    // Step 4: Feature toggles
    const enableStripe = await confirmPrompt('Enable Stripe payments?', defaults.enableStripe);
    const enableScheduler = await confirmPrompt('Enable scheduling/calendar features?', defaults.enableScheduler);
    
    const config = {
      clientName,
      tier: selectedTier,
      preset,
      enableStripe,
      enableScheduler,
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
    tier: CLI_CONFIG.defaultTier,
    preset: CLI_CONFIG.defaultPreset,
    enableStripe: false,
    enableScheduler: false,
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
        
      case '--tier':
      case '-t':
        config.tier = args[++i] || CLI_CONFIG.defaultTier;
        config.mode = 'ci';
        break;
        
      case '--preset':
      case '-p':
        config.preset = args[++i] || CLI_CONFIG.defaultPreset;
        config.mode = 'ci';
        break;
        
      case '--stripe':
        config.enableStripe = true;
        config.mode = 'ci';
        break;
        
      case '--scheduler':
        config.enableScheduler = true;
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
  log('  -t, --tier <tier>       Tier: starter, pro, advanced');
  log('  -p, --preset <preset>   Preset: salon-waitlist, realtor-listing-hub, consultation-engine');
  log('      --stripe            Enable Stripe payments');
  log('      --scheduler         Enable scheduling features');
  log('      --ci                Non-interactive CI mode');
  log('      --verbose           Verbose output');
  log('  -h, --help              Show help');
  log('  -v, --version           Show version');
  log('');
  log('Examples:', colors.bright);
  log('  npx dct init --name "Bella Salon" --preset salon-waitlist --tier starter');
  log('  npx dct init --name "Premier Realty" --preset realtor-listing-hub --tier pro --stripe');
  log('  npx dct init --ci --name "Wellness Center" --preset consultation-engine --tier advanced');
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