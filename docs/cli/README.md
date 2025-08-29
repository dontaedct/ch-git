# DCT CLI: `npx dct init`

**Phase 1, Task 5 - CLI Initializer with Intelligent Defaults and CI Support**

The DCT CLI is a powerful one-command client setup tool that configures your DCT Micro-Apps template for specific client projects with intelligent defaults, validation, and both interactive and CI-friendly modes.

## 🚀 Quick Start

```bash
# Interactive mode (recommended for first-time users)
npx dct init

# CI-friendly mode (for automated deployments)
npx dct init --name "My Business" --preset salon-waitlist --tier starter
```

## 📋 Table of Contents

- [Installation & Usage](#installation--usage)
- [Interactive Mode](#interactive-mode)
- [CI Mode](#ci-mode)
- [Command Line Options](#command-line-options)
- [Presets](#presets)
- [Tiers](#tiers)
- [Generated Files](#generated-files)
- [Configuration Templates](#configuration-templates)
- [Validation & Health Checks](#validation--health-checks)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## 🛠 Installation & Usage

### Prerequisites

- Node.js 18+ 
- npm/pnpm/yarn
- DCT Micro-Apps template (this repository)

### Basic Usage

The CLI can be run in two modes:

1. **Interactive Mode**: Guides you through configuration with prompts
2. **CI Mode**: Non-interactive mode for automated setups

```bash
# Show help
npx dct init --help

# Show version
npx dct init --version

# Interactive mode (default)
npx dct init

# CI mode with options
npx dct init --name "Client Name" --preset salon-waitlist --tier starter
```

## 🎯 Interactive Mode

Interactive mode provides a guided setup experience with intelligent defaults:

```bash
npx dct init
```

### Interactive Flow

1. **Client Name**: Enter your client's business name
2. **Tier Selection**: Choose from starter, pro, or advanced
3. **Preset Selection**: Select from available presets with recommendations
4. **Feature Configuration**: Enable/disable specific features
5. **Confirmation**: Review and confirm configuration
6. **File Generation**: Creates configuration files
7. **Health Check**: Validates setup
8. **Diagnostics**: Option to open admin diagnostics page

### Example Interactive Session

```
🚀 DCT Micro-Apps Template Initializer
──────────────────────────────────────────

What is your client's business name? (My Business): Bella Salon

Select your tier:
  ● 1. starter - Basic features, perfect for simple websites
  ○ 2. pro - Advanced features with payments and automation  
  ○ 3. advanced - All features including AI and enterprise tools

Select your preset:
  ⭐ 1. salon-waitlist - Salon/Med-Spa Waitlist Management
  ⭐ 2. consultation-engine - Professional consultation engine
     3. realtor-listing-hub - Real estate listing management

Enable Stripe payments? (N/y): n
Enable scheduling/calendar features? (N/y): y

════════════════════════════════════════════════════════════

📋 Configuration Summary
Client Name: Bella Salon
🎯 Tier: starter
🎨 Preset: salon-waitlist (Salon/Med-Spa Waitlist Management)
🔧 Features: database, email, notifications, health_checks, scheduling

📁 Generated Files:
   ✅ app.config.ts
   ✅ .env.local

🎯 Next Steps:
   1. Replace placeholder values in .env.local
   2. Run "npm run env:doctor" to check configuration
   3. Visit /admin/diagnostics to verify setup
   4. Start development with "npm run dev"

════════════════════════════════════════════════════════════

Proceed with this configuration? (Y/n): y
```

## 🤖 CI Mode

CI mode is designed for automated deployments and non-interactive environments:

```bash
npx dct init --ci --name "Business Name" --preset salon-waitlist --tier starter
```

### CI Mode Features

- ✅ **Non-interactive**: No prompts, uses provided options
- ✅ **Validation**: Full input validation with error reporting
- ✅ **Health Checks**: Automated configuration verification
- ✅ **Verbose Output**: Optional detailed logging with `--verbose`
- ✅ **Exit Codes**: Proper exit codes for CI/CD integration

### CI Mode Output

```bash
✅ Generated app.config.ts
✅ Generated .env.local with placeholder values
✅ Configuration generated for "Business Name" (starter/salon-waitlist)
ℹ️  Files: app.config.ts, .env.local
ℹ️  Run "npm run env:doctor" to validate configuration
```

## 📚 Command Line Options

| Option | Alias | Description | Example |
|--------|-------|-------------|---------|
| `--name <name>` | `-n` | Client business name | `--name "Bella Salon"` |
| `--tier <tier>` | `-t` | Tier: starter, pro, advanced | `--tier pro` |
| `--preset <preset>` | `-p` | Preset configuration | `--preset salon-waitlist` |
| `--stripe` | | Enable Stripe payments | `--stripe` |
| `--scheduler` | | Enable scheduling features | `--scheduler` |
| `--ci` | | Non-interactive CI mode | `--ci` |
| `--verbose` | | Verbose output | `--verbose` |
| `--help` | `-h` | Show help | `--help` |
| `--version` | `-v` | Show version | `--version` |

## 🎨 Presets

Presets are pre-configured templates for specific business types:

### Available Presets

| Preset | Description | Recommended Tier | Features |
|--------|-------------|------------------|----------|
| `salon-waitlist` | Salon/Med-Spa Waitlist Management | starter | Appointments, notifications, client intake |
| `realtor-listing-hub` | Real Estate Listing Management | pro | Property listings, lead capture, CRM |
| `consultation-engine` | Professional Consultation Engine | starter/pro | Intake forms, consultation generation |

### Preset Features

Each preset includes:
- **Theme Configuration**: Colors, typography, spacing
- **Questionnaire**: Pre-built intake forms
- **Catalog**: Service/product templates
- **Modules**: Feature modules for the preset
- **Integrations**: Webhook and API configurations

### Intelligent Defaults

The CLI uses intelligent defaults based on your preset selection:

```bash
# Salon preset defaults
✅ Tier: starter
✅ Features: appointments, notifications
✅ Theme: Beauty-focused colors
✅ Client Name: Based on preset

# Realtor preset defaults  
✅ Tier: pro
✅ Features: payments, webhooks, automation
✅ Theme: Professional blue/gray
```

## 🏆 Tiers

Tiers control feature availability and resource allocation:

### Starter Tier

**Best for**: Simple websites, basic functionality
- ✅ Database access
- ✅ Email functionality  
- ✅ Health checks
- ✅ Safe mode
- ❌ Payments
- ❌ Advanced automation

**Resource Limits**:
- Database connections: 5
- Rate limit: 100 req/min
- Upload size: 10MB

### Pro Tier

**Best for**: Business websites with advanced features
- ✅ All Starter features
- ✅ Stripe payments
- ✅ Webhook integration
- ✅ Notifications
- ✅ Error tracking
- ✅ Performance monitoring

**Resource Limits**:
- Database connections: 20
- Rate limit: 1,000 req/min  
- Upload size: 50MB

### Advanced Tier

**Best for**: Enterprise applications
- ✅ All Pro features
- ✅ AI features
- ✅ Admin operations
- ✅ Debug mode
- ✅ Advanced automation

**Resource Limits**:
- Database connections: 50
- Rate limit: 10,000 req/min
- Upload size: 200MB

## 📁 Generated Files

The CLI generates two main configuration files:

### `app.config.ts`

Generated application configuration that overrides environment settings:

```typescript
/**
 * Application Configuration - Generated by DCT CLI
 * Created: 2025-08-29T16:31:54.733Z
 * Preset: salon-waitlist
 * Tier: starter
 */

// Override environment-based configuration with CLI-generated values
process.env.APP_TIER = 'starter';
process.env.APP_PRESET = 'salon-waitlist';
process.env.APP_NAME = 'Bella Salon';

// Import the main configuration
import config from './app.config.base';

// Export the configuration with CLI overrides
export * from './app.config.base';
export default config;
```

### `.env.local`

Environment configuration with placeholders and intelligent defaults:

```bash
# DCT Micro-Apps Environment Configuration
# Generated: 2025-08-29T16:31:54.733Z
# Preset: salon-waitlist (starter tier)
# Client: Bella Salon

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================

APP_TIER=starter
APP_PRESET=salon-waitlist
APP_NAME="Bella Salon"
NODE_ENV=development

# =============================================================================
# DATABASE SETTINGS
# =============================================================================

# Supabase Configuration (replace with your project details)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role_key_here

# ... (more configuration sections)
```

## 🔧 Configuration Templates

### Preset-Specific Configuration

Each preset provides intelligent configuration:

#### Salon Waitlist
- **Webhook URL**: `https://webhook.example.com/salon-waitlist`
- **Email Template**: Beauty/wellness focused
- **Features**: Appointments, notifications, client intake
- **Rate Limits**: Conservative for starter tier

#### Realtor Hub
- **Webhook URL**: `https://webhook.example.com/realtor-hub` 
- **Payment Features**: Enabled by default
- **Features**: Lead capture, property management
- **Rate Limits**: Higher for pro tier

#### Consultation Engine
- **AI Features**: Enabled for advanced tier
- **Form Templates**: Professional consultation intake
- **Features**: Document generation, client management

### Feature Flag Templates

Based on tier and preset selection:

```bash
# Starter Tier
NEXT_PUBLIC_ENABLE_PAYMENTS=false
NEXT_PUBLIC_ENABLE_WEBHOOKS=false
NEXT_PUBLIC_ENABLE_AI_FEATURES=false

# Pro Tier  
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_WEBHOOKS=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=false

# Advanced Tier
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_WEBHOOKS=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
```

## ✅ Validation & Health Checks

### Input Validation

The CLI validates all inputs:

- **Tier**: Must be `starter`, `pro`, or `advanced`
- **Preset**: Must be an available preset
- **Client Name**: Required, reasonable length
- **Cross-validation**: Preset compatibility with selected tier

### Health Checks

After configuration generation:

```bash
🏥 Health Checks:
   ✅ Preset File: Preset configuration loaded
   ✅ App Configuration: App configuration exists
   ✅ Environment Template: Environment template available
```

### Integration with env:doctor

The CLI integrates with the existing environment doctor:

```bash
# After CLI generation
npm run env:doctor

# Shows placeholder status and recommendations
🏥 ENVIRONMENT DOCTOR REPORT
Environment: development
Current Tier: STARTER
Overall Health: ✗ CRITICAL (expected - placeholders in use)
Placeholders in Use: 12
```

## 📖 Examples

### Basic Salon Setup

```bash
# Interactive mode
npx dct init
# Follow prompts: "Bella Salon", starter, salon-waitlist

# CI mode
npx dct init --name "Bella Salon" --preset salon-waitlist --tier starter
```

### Advanced Realty Setup

```bash  
# With all features
npx dct init \
  --name "Premier Realty Group" \
  --preset realtor-listing-hub \
  --tier advanced \
  --stripe \
  --scheduler \
  --ci
```

### Consultation Engine

```bash
# Professional services
npx dct init \
  --name "Wellness Consulting" \
  --preset consultation-engine \
  --tier pro \
  --verbose
```

### Development/Testing

```bash
# Quick development setup
npx dct init --ci --name "Dev Test" --preset salon-waitlist --tier starter

# Test all presets
for preset in salon-waitlist realtor-listing-hub consultation-engine; do
  npx dct init --ci --name "Test $preset" --preset "$preset" --tier starter
  echo "✅ Tested $preset"
done
```

## 🐛 Troubleshooting

### Common Issues

#### CLI Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Check file permissions
chmod +x bin/dct.js

# Run directly
node bin/dct.js --help
```

#### Configuration Generation Fails
```bash
# Check file permissions
ls -la app.config.ts .env.local

# Backup existing files
mv app.config.ts app.config.backup.ts
mv .env.local .env.backup.local

# Try again
npx dct init --ci --name "Test" --preset salon-waitlist --tier starter
```

#### Preset Not Found
```bash
# List available presets
ls packages/templates/presets/

# Verify preset exists
npx dct init --help  # Shows available presets
```

#### Health Checks Fail
```bash
# Run with verbose output
npx dct init --verbose

# Check individual components
npm run env:doctor
```

### Validation Errors

Common validation errors and solutions:

| Error | Solution |
|-------|----------|
| `Invalid tier: xyz` | Use `starter`, `pro`, or `advanced` |
| `Invalid preset: xyz` | Check available presets with `--help` |
| `Client name is required` | Provide `--name "Business Name"` |
| `Failed to load preset` | Verify preset file exists and is valid JSON |

### Environment Issues

If environment doctor shows unexpected results:

```bash
# Regenerate configuration
npx dct init --ci --name "Same Name" --preset same-preset --tier same-tier

# Clear and regenerate
rm .env.local app.config.ts
npx dct init

# Check backup files
ls -la *.backup.* app.config.base.ts
```

## 🔄 Integration Workflow

### Development Workflow

1. **Initialize**: `npx dct init`
2. **Validate**: `npm run env:doctor`
3. **Configure**: Replace placeholders in `.env.local`
4. **Verify**: Visit `/admin/diagnostics`
5. **Develop**: `npm run dev`

### CI/CD Integration

```yaml
# .github/workflows/setup.yml
- name: Initialize DCT Configuration
  run: |
    npx dct init \
      --ci \
      --name "${{ env.CLIENT_NAME }}" \
      --preset "${{ env.PRESET }}" \
      --tier "${{ env.TIER }}"
    
- name: Validate Configuration
  run: npm run env:doctor
```

### Team Handoff

```bash
# Generate configuration for handoff
npx dct init \
  --name "$CLIENT_NAME" \
  --preset "$PRESET" \
  --tier "$TIER" \
  --ci

# Package for deployment
tar -czf client-config.tar.gz app.config.ts .env.local

# Document setup
echo "Client: $CLIENT_NAME" > SETUP.md
echo "Preset: $PRESET" >> SETUP.md
echo "Tier: $TIER" >> SETUP.md
```

## 📝 Configuration Reference

### Environment Variables Set by CLI

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_TIER` | Selected tier | `starter`, `pro`, `advanced` |
| `APP_PRESET` | Selected preset | `salon-waitlist` |
| `APP_NAME` | Client business name | `"Bella Salon"` |

### Files Modified/Created

| File | Action | Purpose |
|------|--------|---------|
| `app.config.ts` | Created/Updated | Application configuration |
| `app.config.base.ts` | Created (backup) | Original configuration backup |
| `.env.local` | Created/Updated | Environment variables |
| `.env.backup.local` | Created (if exists) | Original env backup |

---

## 🎯 Next Steps After CLI Setup

1. **Replace Placeholders**: Update `.env.local` with real values
2. **Run Health Check**: `npm run env:doctor`
3. **Start Development**: `npm run dev`
4. **Visit Diagnostics**: `http://localhost:3000/admin/diagnostics`
5. **Customize Preset**: Modify preset JSON if needed
6. **Deploy**: Follow deployment documentation

---

**Generated**: 2025-08-29T16:31:54.733Z  
**Phase**: 1, Task 5 - CLI initializer npx dct init  
**RUN_DATE**: 2025-08-29T16:31:54.733Z