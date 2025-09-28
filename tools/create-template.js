#!/usr/bin/env node

/**
 * Template Creation Workflow
 * 
 * Interactive tool to create new templates with all required files and registrations.
 * Ensures zero-configuration deployment and prevents integration issues.
 * 
 * Usage:
 *   node tools/create-template.js
 *   node tools/create-template.js --template-id my-template --name "My Template"
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { TemplateValidator } from './template-validator.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TemplateCreator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.validator = new TemplateValidator();
  }

  async createTemplate(options = {}) {
    console.log('🎨 Template Creation Wizard');
    console.log('=' .repeat(50));

    // Collect template information
    const templateInfo = await this.collectTemplateInfo(options);
    
    // Validate template ID is unique
    await this.validateUniqueId(templateInfo.id);
    
    // Create all required files
    await this.createTemplateFiles(templateInfo);
    
    // Register in all systems
    await this.registerTemplate(templateInfo);
    
    // Validate everything works
    await this.validateAndTest(templateInfo.id);
    
    console.log('\n✅ Template creation completed successfully!');
    console.log(`🚀 Your template '${templateInfo.id}' is ready for use.`);
    
    this.rl.close();
    return templateInfo;
  }

  async collectTemplateInfo(options) {
    const info = {};

    // Template ID
    info.id = options.templateId || await this.prompt('Template ID (kebab-case): ');
    if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(info.id)) {
      throw new Error('Template ID must be kebab-case (e.g., my-template)');
    }

    // Template Name
    info.name = options.name || await this.prompt('Template Name (human-readable): ');
    
    // Description
    info.description = options.description || await this.prompt('Description: ');
    
    // Category
    const categories = ['consultation', 'landing-page', 'form', 'dashboard', 'e-commerce', 'portfolio', 'other'];
    info.category = options.category || await this.promptChoice('Category', categories);
    
    // Icon (emoji or icon name)
    info.icon = options.icon || await this.prompt('Icon (emoji or name) [🎯]: ') || '🎯';
    
    // Features
    info.features = options.features || await this.collectFeatures();
    
    // Premium template?
    info.isPremium = options.isPremium !== undefined ? options.isPremium : 
      await this.promptYesNo('Is this a premium template?', false);

    // Version
    info.version = options.version || '1.0.0';

    return info;
  }

  async collectFeatures() {
    const availableFeatures = [
      'AI-powered generation',
      'Multi-step workflow',
      'PDF generation',
      'Email automation',
      'Payment processing',
      'User authentication',
      'Database integration',
      'API integration',
      'Real-time updates',
      'Mobile responsive',
      'Analytics tracking',
      'SEO optimization'
    ];

    console.log('\nSelect features (enter numbers separated by commas):');
    availableFeatures.forEach((feature, i) => {
      console.log(`  ${i + 1}. ${feature}`);
    });

    const selection = await this.prompt('Features [1,2,3]: ');
    const indices = selection.split(',').map(s => parseInt(s.trim()) - 1);
    
    return indices
      .filter(i => i >= 0 && i < availableFeatures.length)
      .map(i => availableFeatures[i]);
  }

  async validateUniqueId(templateId) {
    const existingFiles = [
      `lib/template-storage/templates/${templateId}.json`,
      `packages/templates/presets/${templateId}.json`
    ];

    for (const file of existingFiles) {
      if (fs.existsSync(file)) {
        throw new Error(`Template '${templateId}' already exists: ${file}`);
      }
    }

    // Check registry
    const tenantAppsPath = 'types/tenant-apps.ts';
    if (fs.existsSync(tenantAppsPath)) {
      const content = fs.readFileSync(tenantAppsPath, 'utf8');
      if (content.includes(`id: '${templateId}'`)) {
        throw new Error(`Template '${templateId}' already registered in tenant apps`);
      }
    }
  }

  async createTemplateFiles(info) {
    console.log('\n📁 Creating template files...');

    // 1. Template manifest
    await this.createTemplateManifest(info);
    
    // 2. Preset configuration  
    await this.createPresetConfig(info);
    
    // 3. Copy to public directory
    await this.copyToPublic(info.id);

    console.log('✅ Template files created');
  }

  async createTemplateManifest(info) {
    const manifest = {
      id: info.id,
      name: info.name,
      slug: info.id,
      description: info.description,
      category: info.category,
      version: info.version,
      components: [
        {
          id: "header-1",
          type: "header",
          version: "1.0.0",
          props: {
            logo: info.name,
            navigation: [
              { text: "Home", url: "#home" },
              { text: "About", url: "#about" },
              { text: "Contact", url: "#contact" }
            ],
            ctaText: "Get Started",
            ctaUrl: "#cta"
          }
        },
        {
          id: "hero-1",
          type: "hero",
          version: "1.0.0",
          props: {
            title: `Welcome to ${info.name}`,
            subtitle: info.description,
            backgroundImage: "/api/placeholder/1200/600",
            ctaText: "Start Now",
            ctaUrl: "#get-started"
          }
        },
        {
          id: "footer-1",
          type: "footer",
          version: "1.0.0",
          props: {
            companyName: info.name,
            links: [
              { text: "Privacy", url: "/privacy" },
              { text: "Terms", url: "/terms" }
            ]
          }
        }
      ],
      meta: {
        version: info.version,
        created: new Date().toISOString(),
        author: "Template Creator",
        tags: [info.category, ...info.features.slice(0, 3)]
      },
      styles: {
        theme: "modern",
        primaryColor: "#3B82F6",
        fontFamily: "Inter, sans-serif"
      }
    };

    const filePath = `lib/template-storage/templates/${info.id}.json`;
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
    console.log(`📄 Created template manifest: ${filePath}`);
  }

  async createPresetConfig(info) {
    const preset = {
      id: `${info.id}-preset`,
      name: info.name,
      version: info.version,
      description: info.description,
      tier: info.isPremium ? "premium" : "standard",
      preset: info.id,
      features: {
        database: info.features.includes('Database integration'),
        email: info.features.includes('Email automation'),
        payments: info.features.includes('Payment processing'),
        webhooks: true,
        automation: info.features.includes('AI-powered generation'),
        notifications: true,
        error_tracking: true,
        admin_operations: true,
        ai_features: info.features.includes('AI-powered generation'),
        debug_mode: false,
        safe_mode: true,
        performance_monitoring: true,
        health_checks: true,
        white_labeling: true,
        multi_tenant: true,
        service_packages: info.category === 'consultation',
        pdf_generation: info.features.includes('PDF generation'),
        questionnaire_engine: info.features.includes('Multi-step workflow'),
        consultation_engine: info.category === 'consultation'
      },
      routing: {
        landing_page: `/${info.id}`,
        admin_panel: `/${info.id}/admin`,
        api_base: `/api/${info.id}`
      },
      branding: {
        primary_color: "#3B82F6",
        logo_path: "/logo.svg",
        company_name: info.name
      },
      dependencies: {
        supabase: "^2.0.0",
        nextjs: "^14.0.0",
        tailwind: "^3.0.0"
      }
    };

    const filePath = `packages/templates/presets/${info.id}.json`;
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(preset, null, 2));
    console.log(`⚙️ Created preset config: ${filePath}`);
  }

  async copyToPublic(templateId) {
    const sourceFile = `lib/template-storage/templates/${templateId}.json`;
    const targetFile = `public/lib/template-storage/templates/${templateId}.json`;
    
    // Ensure directory exists
    const dir = path.dirname(targetFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.copyFileSync(sourceFile, targetFile);
    console.log(`🌐 Copied to public: ${targetFile}`);
  }

  async registerTemplate(info) {
    console.log('\n📋 Registering template...');

    // 1. Register in tenant apps
    await this.registerInTenantApps(info);
    
    // 2. Register in presets
    await this.registerInPresets(info.id);

    console.log('✅ Template registered');
  }

  async registerInTenantApps(info) {
    const filePath = 'types/tenant-apps.ts';
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Tenant apps file not found: ${filePath}`);
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Create template object
    const templateObj = `  {
    id: '${info.id}',
    name: '${info.name}',
    description: '${info.description}',
    icon: '${info.icon}',
    category: '${info.category}',
    features: [
${info.features.map(f => `      '${f}'`).join(',\n')}
    ],
    is_premium: ${info.isPremium}
  }`;

    // Find the TENANT_APP_TEMPLATES array and add the new template
    const arrayRegex = /(export const TENANT_APP_TEMPLATES[^=]*=\s*\[)([\s\S]*?)(\]\s*as const;)/;
    const match = content.match(arrayRegex);
    
    if (!match) {
      throw new Error('Could not find TENANT_APP_TEMPLATES array');
    }

    const [, start, middle, end] = match;
    const newMiddle = middle.trim() ? middle + ',\n' + templateObj : templateObj;
    const newArray = start + '\n' + newMiddle + '\n' + end;
    
    content = content.replace(arrayRegex, newArray);
    
    fs.writeFileSync(filePath, content);
    console.log(`📋 Registered in tenant apps: ${filePath}`);
  }

  async registerInPresets(templateId) {
    const filePath = 'app.config.base.ts';
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`App config file not found: ${filePath}`);
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add to AVAILABLE_PRESETS array
    const presetsRegex = /(export const AVAILABLE_PRESETS = \[)([\s\S]*?)(\] as const;)/;
    const match = content.match(presetsRegex);
    
    if (!match) {
      throw new Error('Could not find AVAILABLE_PRESETS array');
    }

    const [, start, middle, end] = match;
    const newMiddle = middle.trim() ? middle + `,\n  '${templateId}'` : `\n  '${templateId}'`;
    const newArray = start + newMiddle + '\n' + end;
    
    content = content.replace(presetsRegex, newArray);
    
    fs.writeFileSync(filePath, content);
    console.log(`⚙️ Registered in presets: ${filePath}`);
  }

  async validateAndTest(templateId) {
    console.log('\n🔍 Validating template...');
    
    const isValid = await this.validator.validateTemplate(templateId);
    
    if (!isValid) {
      console.log('\n⚠️ Validation found issues. Running auto-fix...');
      await this.validator.autoFix(templateId);
      
      // Re-validate
      const isValidAfterFix = await this.validator.validateTemplate(templateId);
      if (!isValidAfterFix) {
        throw new Error('Template validation failed even after auto-fix');
      }
    }

    console.log('✅ Template validation passed');
  }

  // Utility methods
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async promptChoice(question, choices) {
    console.log(`\n${question}:`);
    choices.forEach((choice, i) => {
      console.log(`  ${i + 1}. ${choice}`);
    });
    
    const answer = await this.prompt('Choice [1]: ');
    const index = parseInt(answer) - 1;
    
    return choices[index] || choices[0];
  }

  async promptYesNo(question, defaultValue = false) {
    const answer = await this.prompt(`${question} [${defaultValue ? 'Y/n' : 'y/N'}]: `);
    
    if (!answer.trim()) return defaultValue;
    
    return /^y(es)?$/i.test(answer.trim());
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    switch (key) {
      case '--template-id':
        options.templateId = value;
        break;
      case '--name':
        options.name = value;
        break;
      case '--description':
        options.description = value;
        break;
      case '--category':
        options.category = value;
        break;
      case '--icon':
        options.icon = value;
        break;
      case '--premium':
        options.isPremium = value === 'true';
        break;
    }
  }

  try {
    const creator = new TemplateCreator();
    await creator.createTemplate(options);
  } catch (error) {
    console.error('❌ Template creation failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TemplateCreator };
