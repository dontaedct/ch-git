/**
 * Universal Template Configuration System
 *
 * Comprehensive system for managing universal consultation template configurations
 * supporting multiple industries, customizable content, and white-labeling.
 */

import type { QuestionnaireConfig } from '@/components/questionnaire-engine';
import type { ServicePackage } from '@/lib/ai/consultation-generator';

export interface UniversalTemplateConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  industry: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;

  // Core configuration
  branding: TemplateBranding;
  content: TemplateContent;
  questionnaire: QuestionnaireConfig;
  service_packages: ServicePackage[];

  // Customization options
  customization_options: CustomizationOptions;
  restrictions: TemplateRestrictions;

  // Metadata
  tags: string[];
  compatibility: string[];
  dependencies: string[];
}

export interface TemplateBranding {
  // Visual branding
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url?: string;
  favicon_url?: string;
  font_family: string;

  // Text branding
  company_name: string;
  tagline?: string;
  website_url?: string;
  contact_email?: string;
  phone_number?: string;

  // Social media
  social_links: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };

  // Custom CSS
  custom_css?: string;
  theme_overrides?: Record<string, any>;
}

export interface TemplateContent {
  // Landing page content
  landing_page: {
    hero_title: string;
    hero_subtitle: string;
    hero_cta: string;
    value_propositions: string[];
    testimonials?: Array<{
      name: string;
      company: string;
      text: string;
      image?: string;
    }>;
    features: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };

  // Questionnaire content
  questionnaire: {
    intro_text: string;
    completion_message: string;
    privacy_notice: string;
    terms_url?: string;
    privacy_url?: string;
  };

  // Results page content
  results_page: {
    title: string;
    subtitle: string;
    next_steps_header: string;
    consultation_description: string;
    contact_cta: string;
  };

  // Email templates
  email_templates: {
    welcome_subject: string;
    welcome_body: string;
    consultation_subject: string;
    consultation_body: string;
    follow_up_subject: string;
    follow_up_body: string;
  };

  // Legal content
  legal: {
    terms_of_service?: string;
    privacy_policy?: string;
    disclaimer?: string;
  };
}

export interface CustomizationOptions {
  // What can be customized
  allow_branding_changes: boolean;
  allow_content_editing: boolean;
  allow_questionnaire_modification: boolean;
  allow_service_package_editing: boolean;
  allow_css_customization: boolean;

  // Restrictions on customization
  protected_elements: string[];
  required_elements: string[];
  max_questionnaire_questions: number;
  max_service_packages: number;

  // Feature toggles
  features: {
    analytics_tracking: boolean;
    email_automation: boolean;
    pdf_generation: boolean;
    crm_integration: boolean;
    payment_processing: boolean;
    calendar_booking: boolean;
  };
}

export interface TemplateRestrictions {
  // Usage restrictions
  max_monthly_consultations: number;
  max_clients: number;
  allowed_domains: string[];
  geo_restrictions: string[];

  // Content restrictions
  prohibited_content: string[];
  required_disclaimers: string[];

  // Technical restrictions
  max_file_upload_size: number;
  max_custom_css_size: number;
  allowed_integrations: string[];
}

export interface IndustryMapping {
  industry_code: string;
  template_id: string;
  priority: number;
  match_score: number;
}

export interface TemplateValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

/**
 * Universal Template Manager
 * Manages template configurations, validation, and deployment
 */
export class UniversalTemplateManager {
  private templates: Map<string, UniversalTemplateConfig> = new Map();
  private industryMappings: Map<string, IndustryMapping[]> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Get all templates
   */
  getAllTemplates(): UniversalTemplateConfig[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): UniversalTemplateConfig | null {
    return this.templates.get(id) || null;
  }

  /**
   * Get templates by industry
   */
  getTemplatesByIndustry(industry: string): UniversalTemplateConfig[] {
    const mappings = this.industryMappings.get(industry) || [];
    return mappings
      .sort((a, b) => b.priority - a.priority)
      .map(mapping => this.templates.get(mapping.template_id))
      .filter(Boolean) as UniversalTemplateConfig[];
  }

  /**
   * Create new template
   */
  createTemplate(templateData: Omit<UniversalTemplateConfig, 'id' | 'created_at' | 'updated_at'>): UniversalTemplateConfig {
    const id = this.generateTemplateId(templateData.name);
    const now = new Date().toISOString();

    const newTemplate: UniversalTemplateConfig = {
      id,
      created_at: now,
      updated_at: now,
      ...templateData
    };

    const validation = this.validateTemplate(newTemplate);
    if (!validation.is_valid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    this.templates.set(id, newTemplate);
    this.updateIndustryMapping(newTemplate);

    return newTemplate;
  }

  /**
   * Update existing template
   */
  updateTemplate(id: string, updates: Partial<UniversalTemplateConfig>): UniversalTemplateConfig {
    const existingTemplate = this.templates.get(id);
    if (!existingTemplate) {
      throw new Error(`Template with ID ${id} not found`);
    }

    const updatedTemplate: UniversalTemplateConfig = {
      ...existingTemplate,
      ...updates,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    const validation = this.validateTemplate(updatedTemplate);
    if (!validation.is_valid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    this.templates.set(id, updatedTemplate);
    this.updateIndustryMapping(updatedTemplate);

    return updatedTemplate;
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): boolean {
    const template = this.templates.get(id);
    if (template) {
      this.removeIndustryMapping(template);
    }
    return this.templates.delete(id);
  }

  /**
   * Duplicate template
   */
  duplicateTemplate(id: string, newName: string): UniversalTemplateConfig {
    const original = this.templates.get(id);
    if (!original) {
      throw new Error(`Template with ID ${id} not found`);
    }

    const duplicated: Omit<UniversalTemplateConfig, 'id' | 'created_at' | 'updated_at'> = {
      ...original,
      name: newName,
      description: `${original.description} (Copy)`,
      is_active: false // Duplicates start inactive
    };

    return this.createTemplate(duplicated);
  }

  /**
   * Validate template configuration
   */
  validateTemplate(template: UniversalTemplateConfig): TemplateValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required fields validation
    if (!template.name?.trim()) {
      errors.push('Template name is required');
      score -= 20;
    }

    if (!template.description?.trim()) {
      errors.push('Template description is required');
      score -= 10;
    }

    if (!template.industry?.trim()) {
      errors.push('Industry specification is required');
      score -= 15;
    }

    // Branding validation
    if (!template.branding.company_name?.trim()) {
      errors.push('Company name is required');
      score -= 15;
    }

    if (!this.isValidColor(template.branding.primary_color)) {
      errors.push('Valid primary color is required');
      score -= 10;
    }

    // Content validation
    if (!template.content.landing_page.hero_title?.trim()) {
      errors.push('Hero title is required');
      score -= 10;
    }

    if (!template.content.landing_page.hero_subtitle?.trim()) {
      warnings.push('Hero subtitle recommended for better engagement');
      score -= 5;
    }

    if (template.content.landing_page.value_propositions.length === 0) {
      warnings.push('At least one value proposition recommended');
      score -= 5;
    }

    // Questionnaire validation
    if (!template.questionnaire.steps || template.questionnaire.steps.length === 0) {
      errors.push('At least one questionnaire step is required');
      score -= 20;
    }

    if (template.service_packages.length === 0) {
      warnings.push('At least one service package recommended');
      score -= 10;
    }

    // Technical validation
    if (template.restrictions.max_monthly_consultations <= 0) {
      errors.push('Maximum monthly consultations must be greater than 0');
      score -= 5;
    }

    if (template.customization_options.max_questionnaire_questions <= 0) {
      errors.push('Maximum questionnaire questions must be greater than 0');
      score -= 5;
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * Get best template match for industry and requirements
   */
  getBestMatch(criteria: {
    industry: string;
    company_size?: string;
    budget_range?: string;
    features_required?: string[];
  }): UniversalTemplateConfig | null {
    const industryTemplates = this.getTemplatesByIndustry(criteria.industry);
    if (industryTemplates.length === 0) {
      // Fallback to universal templates
      return this.getTemplatesByIndustry('universal')[0] || null;
    }

    // Score templates based on criteria
    const scoredTemplates = industryTemplates.map(template => ({
      template,
      score: this.calculateMatchScore(template, criteria)
    }));

    // Return highest scoring template
    scoredTemplates.sort((a, b) => b.score - a.score);
    return scoredTemplates[0]?.template || null;
  }

  /**
   * Export template for deployment
   */
  exportTemplate(id: string): {
    template: UniversalTemplateConfig;
    deployment_config: Record<string, any>;
    exported_at: string;
  } {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }

    return {
      template,
      deployment_config: {
        environment_variables: this.generateEnvironmentVariables(template),
        database_setup: this.generateDatabaseSetup(template),
        asset_urls: this.generateAssetUrls(template)
      },
      exported_at: new Date().toISOString()
    };
  }

  /**
   * Import template from export
   */
  importTemplate(data: {
    template: UniversalTemplateConfig;
    deployment_config?: Record<string, any>;
  }): UniversalTemplateConfig {
    const validation = this.validateTemplate(data.template);
    if (!validation.is_valid) {
      throw new Error(`Template import failed: ${validation.errors.join(', ')}`);
    }

    // Generate new ID to avoid conflicts
    const imported = {
      ...data.template,
      id: this.generateTemplateId(data.template.name),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: false // Imported templates start inactive
    };

    this.templates.set(imported.id, imported);
    this.updateIndustryMapping(imported);

    return imported;
  }

  /**
   * Get template statistics
   */
  getTemplateStats() {
    const templates = this.getAllTemplates();
    const activeTemplates = templates.filter(t => t.is_active);

    const byIndustry = templates.reduce((acc, template) => {
      acc[template.industry] = (acc[template.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageScore = templates.reduce((sum, template) => {
      const validation = this.validateTemplate(template);
      return sum + validation.score;
    }, 0) / templates.length;

    return {
      total_templates: templates.length,
      active_templates: activeTemplates.length,
      by_industry: byIndustry,
      average_quality_score: Math.round(averageScore),
      most_popular_industry: Object.keys(byIndustry).reduce((a, b) => byIndustry[a] > byIndustry[b] ? a : b, ''),
      creation_rate: this.calculateCreationRate()
    };
  }

  // Private helper methods

  private generateTemplateId(name: string): string {
    const base = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);

    let counter = 1;
    let id = base;

    while (this.templates.has(id)) {
      id = `${base}-${counter}`;
      counter++;
    }

    return id;
  }

  private updateIndustryMapping(template: UniversalTemplateConfig): void {
    const industry = template.industry;
    const mappings = this.industryMappings.get(industry) || [];

    // Remove existing mapping for this template
    const filtered = mappings.filter(m => m.template_id !== template.id);

    // Add new mapping
    const validation = this.validateTemplate(template);
    filtered.push({
      industry_code: industry,
      template_id: template.id,
      priority: template.is_active ? 100 : 50,
      match_score: validation.score
    });

    this.industryMappings.set(industry, filtered);
  }

  private removeIndustryMapping(template: UniversalTemplateConfig): void {
    const industry = template.industry;
    const mappings = this.industryMappings.get(industry) || [];
    const filtered = mappings.filter(m => m.template_id !== template.id);
    this.industryMappings.set(industry, filtered);
  }

  private calculateMatchScore(template: UniversalTemplateConfig, criteria: any): number {
    let score = 0;

    // Industry match (highest weight)
    if (template.industry === criteria.industry) {
      score += 50;
    } else if (template.industry === 'universal') {
      score += 25;
    }

    // Feature requirements
    if (criteria.features_required) {
      const availableFeatures = Object.keys(template.customization_options.features)
        .filter(key => template.customization_options.features[key as keyof typeof template.customization_options.features]);

      const matchedFeatures = criteria.features_required.filter(required =>
        availableFeatures.includes(required)
      );

      score += (matchedFeatures.length / criteria.features_required.length) * 30;
    }

    // Template quality
    const validation = this.validateTemplate(template);
    score += (validation.score / 100) * 20;

    return score;
  }

  private isValidColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const namedColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray'];

    return hexRegex.test(color) || namedColors.includes(color.toLowerCase());
  }

  private generateEnvironmentVariables(template: UniversalTemplateConfig): Record<string, string> {
    return {
      TEMPLATE_ID: template.id,
      TEMPLATE_NAME: template.name,
      TEMPLATE_INDUSTRY: template.industry,
      PRIMARY_COLOR: template.branding.primary_color,
      COMPANY_NAME: template.branding.company_name,
      LOGO_URL: template.branding.logo_url || '',
      CONTACT_EMAIL: template.branding.contact_email || '',
      MAX_CONSULTATIONS: template.restrictions.max_monthly_consultations.toString(),
      FEATURES_ENABLED: JSON.stringify(template.customization_options.features)
    };
  }

  private generateDatabaseSetup(template: UniversalTemplateConfig): Record<string, any> {
    return {
      tables: ['consultations', 'questionnaire_responses', 'service_packages', 'email_logs'],
      initial_data: {
        service_packages: template.service_packages,
        template_config: template
      },
      indexes: ['industry', 'created_at', 'status']
    };
  }

  private generateAssetUrls(template: UniversalTemplateConfig): Record<string, string> {
    return {
      logo: template.branding.logo_url || '/default-logo.png',
      favicon: template.branding.favicon_url || '/default-favicon.ico',
      stylesheet: `/templates/${template.id}/styles.css`,
      scripts: `/templates/${template.id}/scripts.js`
    };
  }

  private calculateCreationRate(): string {
    const templates = this.getAllTemplates();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentTemplates = templates.filter(t =>
      new Date(t.created_at) >= thirtyDaysAgo
    ).length;

    return `${recentTemplates} in last 30 days`;
  }

  private initializeDefaultTemplates(): void {
    // This will be implemented with industry-specific templates
    // For now, just initialize the maps
    this.templates = new Map();
    this.industryMappings = new Map();
  }
}

/**
 * Default universal template manager instance
 */
export const universalTemplateManager = new UniversalTemplateManager();

/**
 * Convenience functions for common operations
 */
export const universalTemplates = {
  getAll: () => universalTemplateManager.getAllTemplates(),
  getById: (id: string) => universalTemplateManager.getTemplateById(id),
  getByIndustry: (industry: string) => universalTemplateManager.getTemplatesByIndustry(industry),
  create: (data: Omit<UniversalTemplateConfig, 'id' | 'created_at' | 'updated_at'>) =>
    universalTemplateManager.createTemplate(data),
  update: (id: string, updates: Partial<UniversalTemplateConfig>) =>
    universalTemplateManager.updateTemplate(id, updates),
  delete: (id: string) => universalTemplateManager.deleteTemplate(id),
  duplicate: (id: string, newName: string) => universalTemplateManager.duplicateTemplate(id, newName),
  validate: (template: UniversalTemplateConfig) => universalTemplateManager.validateTemplate(template),
  getBestMatch: (criteria: any) => universalTemplateManager.getBestMatch(criteria),
  export: (id: string) => universalTemplateManager.exportTemplate(id),
  import: (data: any) => universalTemplateManager.importTemplate(data),
  getStats: () => universalTemplateManager.getTemplateStats()
};