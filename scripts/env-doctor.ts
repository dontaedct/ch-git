#!/usr/bin/env tsx
/**
 * Environment Doctor CLI - Phase 1, Task 2
 * Provides comprehensive environment variable diagnostics
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

import { getEnv, getAllVariableStatus, checkEnvironmentHealth, isPlaceholder, SECURITY_LEVELS } from '../lib/env';
import { validateAndSanitizeEnvironment } from '../lib/env-validation';
import { getAllFeatureStatuses, getTierMatrix, getCurrentTier } from '../lib/flags';

// =============================================================================
// CLI UTILITIES
// =============================================================================

function colorize(text: string, color: 'red' | 'yellow' | 'green' | 'blue' | 'cyan' | 'gray'): string {
  const colors = {
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
  };
  const reset = '\x1b[0m';
  return `${colors[color]}${text}${reset}`;
}

function formatStatus(status: boolean | string, type: 'boolean' | 'health' = 'boolean'): string {
  if (type === 'health') {
    switch (status) {
      case 'healthy': return colorize('✓ HEALTHY', 'green');
      case 'warning': return colorize('⚠ WARNING', 'yellow');
      case 'critical': return colorize('✗ CRITICAL', 'red');
      default: return colorize('? UNKNOWN', 'gray');
    }
  }
  
  return status ? colorize('✓ YES', 'green') : colorize('✗ NO', 'red');
}

function formatSecurityLevel(level: string): string {
  switch (level) {
    case 'PUBLIC': return colorize(level, 'green');
    case 'PRIVATE': return colorize(level, 'yellow');
    case 'CRITICAL': return colorize(level, 'red');
    default: return colorize(level, 'gray');
  }
}

function printTable(headers: string[], rows: string[][]) {
  const colWidths = headers.map((header, i) => 
    Math.max(header.length, ...rows.map(row => (row[i] || '').replace(/\x1b\[[0-9;]*m/g, '').length))
  );
  
  // Print header
  const headerRow = headers.map((header, i) => header.padEnd(colWidths[i])).join(' | ');
  console.log(headerRow);
  console.log(colWidths.map(w => '-'.repeat(w)).join('-|-'));
  
  // Print rows
  rows.forEach(row => {
    const formattedRow = row.map((cell, i) => {
      const cleanCell = (cell || '').replace(/\x1b\[[0-9;]*m/g, '');
      const padding = colWidths[i] - cleanCell.length;
      return cell + ' '.repeat(Math.max(0, padding));
    }).join(' | ');
    console.log(formattedRow);
  });
}

// =============================================================================
// REPORT FUNCTIONS
// =============================================================================

function printHeader(title: string) {
  console.log('\n' + colorize('='.repeat(80), 'blue'));
  console.log(colorize(`  ${title.toUpperCase()}`, 'blue'));
  console.log(colorize('='.repeat(80), 'blue') + '\n');
}

function printEnvironmentOverview() {
  printHeader('Environment Overview');
  
  const env = getEnv();
  const health = checkEnvironmentHealth();
  const currentTier = getCurrentTier();
  
  console.log(`Environment: ${colorize(env.NODE_ENV || 'development', 'cyan')}`);
  console.log(`Current Tier: ${colorize(currentTier.toUpperCase(), 'cyan')}`);
  console.log(`Overall Health: ${formatStatus(health.status, 'health')}`);
  console.log(`Critical Missing: ${health.criticalMissing.length}`);
  console.log(`Optional Missing: ${health.optionalMissing.length}`);
  console.log(`Validation Warnings: ${health.warnings.length}`);
  console.log(`Placeholders in Use: ${health.placeholdersInUse.length}`);
}

function printEnvironmentVariables() {
  printHeader('Environment Variables Status');
  
  const status = getAllVariableStatus();
  
  const headers = ['Variable', 'Set?', 'Required?', 'Using Placeholder?', 'Security Level', 'Feature Impact'];
  const rows = status.map(var_status => [
    var_status.key,
    var_status.value ? colorize('YES', 'green') : colorize('NO', 'red'),
    var_status.required ? colorize('YES', 'red') : colorize('NO', 'gray'),
    var_status.usingPlaceholder ? colorize('YES', 'yellow') : colorize('NO', 'green'),
    formatSecurityLevel(var_status.securityLevel),
    var_status.featureImpact
  ]);
  
  printTable(headers, rows);
}

function printFeatureFlags() {
  printHeader('Feature Flags Status');
  
  const features = getAllFeatureStatuses();
  
  const headers = ['Feature', 'Enabled?', 'Available?', 'Tier Supported?', 'Fallback'];
  const rows = features.map(feature => [
    feature.feature,
    formatStatus(feature.enabled),
    formatStatus(feature.available),
    formatStatus(feature.tierSupported),
    feature.fallback
  ]);
  
  printTable(headers, rows);
}

function printTierMatrix() {
  printHeader('Tier Feature Matrix');
  
  const matrix = getTierMatrix();
  
  matrix.forEach(tier => {
    console.log(`\n${colorize(tier.tier.toUpperCase(), 'cyan')} (${tier.featureCount} features):`);
    tier.features.forEach(feature => {
      const enabled = getAllFeatureStatuses().find(f => f.feature === feature)?.enabled;
      const status = enabled ? colorize('✓', 'green') : colorize('✗', 'red');
      console.log(`  ${status} ${feature}`);
    });
  });
}

function printValidationResults() {
  printHeader('Environment Validation');
  
  const env = getEnv();
  const validation = validateAndSanitizeEnvironment(env);
  
  if (validation.environmentErrors.length > 0) {
    console.log(colorize('\nEnvironment Errors:', 'red'));
    validation.environmentErrors.forEach(error => {
      console.log(colorize(`  ✗ ${error}`, 'red'));
    });
  }
  
  if (validation.environmentWarnings.length > 0) {
    console.log(colorize('\nEnvironment Warnings:', 'yellow'));
    validation.environmentWarnings.forEach(warning => {
      console.log(colorize(`  ⚠ ${warning}`, 'yellow'));
    });
  }
  
  if (validation.rotationWarnings.length > 0) {
    console.log(colorize('\nRotation Warnings:', 'yellow'));
    validation.rotationWarnings.forEach(warning => {
      console.log(colorize(`  🔄 ${warning}`, 'yellow'));
    });
  }
  
  if (validation.environmentErrors.length === 0 && validation.environmentWarnings.length === 0) {
    console.log(colorize('✓ All environment variables pass validation', 'green'));
  }
}

function printRecommendations() {
  printHeader('Recommendations');
  
  const health = checkEnvironmentHealth();
  const features = getAllFeatureStatuses();
  const currentTier = getCurrentTier();
  
  const recommendations: string[] = [];
  
  // Critical missing variables
  if (health.criticalMissing.length > 0) {
    recommendations.push(`🚨 Configure critical variables: ${health.criticalMissing.join(', ')}`);
  }
  
  // Optional features
  const availableFeatures = features.filter(f => f.available && !f.enabled).length;
  if (availableFeatures > 0) {
    recommendations.push(`⬆️ Consider upgrading from ${currentTier} tier to unlock ${availableFeatures} available features`);
  }
  
  // Development environment
  if (getEnv().NODE_ENV === 'development') {
    const placeholderCount = health.placeholdersInUse.length;
    if (placeholderCount > 3) {
      recommendations.push(`🔧 ${placeholderCount} placeholders in use - consider setting up more integrations for testing`);
    }
  }
  
  // Production environment
  if (getEnv().NODE_ENV === 'production') {
    if (health.placeholdersInUse.length > 0) {
      recommendations.push(`⚠️ ${health.placeholdersInUse.length} placeholders still in use in production`);
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Environment configuration looks good!');
  }
  
  recommendations.forEach(rec => console.log(`  ${rec}`));
}

function printSummaryLine() {
  const health = checkEnvironmentHealth();
  const features = getAllFeatureStatuses();
  const enabledFeatures = features.filter(f => f.enabled).length;
  const totalFeatures = features.length;
  
  console.log('\n' + colorize('='.repeat(80), 'blue'));
  console.log(colorize('SUMMARY', 'blue') + ': ' +
    `Status: ${formatStatus(health.status, 'health')} | ` +
    `Features: ${enabledFeatures}/${totalFeatures} enabled | ` +
    `Tier: ${colorize(getCurrentTier().toUpperCase(), 'cyan')}`
  );
  console.log(colorize('='.repeat(80), 'blue') + '\n');
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

function main() {
  const args = process.argv.slice(2);
  
  // Handle command line arguments
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Environment Doctor - Comprehensive Environment Variable Diagnostics

Usage: npm run env:doctor [options]

Options:
  --help, -h          Show this help message
  --overview, -o      Show only environment overview
  --variables, -v     Show only environment variables
  --features, -f      Show only feature flags
  --tiers, -t         Show only tier matrix
  --validation        Show only validation results
  --recommendations   Show only recommendations
  --json              Output in JSON format (machine readable)

Examples:
  npm run env:doctor                    # Full report
  npm run env:doctor --overview         # Quick overview only
  npm run env:doctor --json             # JSON output for CI/CD
`);
    return;
  }
  
  // JSON output for machine consumption
  if (args.includes('--json')) {
    const data = {
      overview: {
        environment: getEnv().NODE_ENV,
        tier: getCurrentTier(),
        health: checkEnvironmentHealth(),
      },
      variables: getAllVariableStatus(),
      features: getAllFeatureStatuses(),
      tiers: getTierMatrix(),
      validation: validateAndSanitizeEnvironment(getEnv()),
      timestamp: new Date().toISOString(),
    };
    
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  
  // Selective reporting
  if (args.includes('--overview') || args.includes('-o')) {
    printEnvironmentOverview();
    return;
  }
  
  if (args.includes('--variables') || args.includes('-v')) {
    printEnvironmentVariables();
    return;
  }
  
  if (args.includes('--features') || args.includes('-f')) {
    printFeatureFlags();
    return;
  }
  
  if (args.includes('--tiers') || args.includes('-t')) {
    printTierMatrix();
    return;
  }
  
  if (args.includes('--validation')) {
    printValidationResults();
    return;
  }
  
  if (args.includes('--recommendations')) {
    printRecommendations();
    return;
  }
  
  // Full report (default)
  console.log(colorize('🏥 ENVIRONMENT DOCTOR REPORT', 'blue'));
  console.log(colorize('Generated at: ' + new Date().toISOString(), 'gray'));
  
  printEnvironmentOverview();
  printEnvironmentVariables();
  printFeatureFlags();
  printTierMatrix();
  printValidationResults();
  printRecommendations();
  printSummaryLine();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('env-doctor')) {
  try {
    main();
  } catch (error) {
    console.error(colorize('Error running env:doctor:', 'red'), error);
    process.exit(1);
  }
}