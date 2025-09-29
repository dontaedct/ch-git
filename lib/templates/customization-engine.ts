/**
 * Template Customization Engine
 *
 * Comprehensive system for managing template customizations, content editing,
 * questionnaire modifications, and workflow personalization with versioning and rollback.
 */

import type { UniversalTemplateConfig } from './universal-config';
import type { QuestionnaireConfig } from '@/components/questionnaire-engine';

export interface TemplateCustomization {
  id: string;
  template_id: string;
  client_id: string;
  name: string;
  description?: string;
  version: string;

  // Core customizations
  content_customizations: ContentCustomizations;
  questionnaire_customizations: QuestionnaireCustomizations;
  workflow_customizations: WorkflowCustomizations;
  layout_customizations: LayoutCustomizations;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
  is_published: boolean;

  // Versioning
  parent_version?: string;
  change_summary?: string;
  rollback_point?: boolean;
}

export interface ContentCustomizations {
  // Landing page content
  landing_page: {
    hero_title?: string;
    hero_subtitle?: string;
    hero_cta?: string;
    value_propositions?: string[];
    features?: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
    testimonials?: Array<{
      name: string;
      company: string;
      text: string;
      image?: string;
    }>;
    custom_sections?: Array<{
      id: string;
      title: string;
      content: string;
      position: number;
      visible: boolean;
    }>;
  };

  // Questionnaire content
  questionnaire: {
    intro_text?: string;
    completion_message?: string;
    privacy_notice?: string;
    custom_instructions?: string;
    progress_indicators?: {
      style: 'bar' | 'steps' | 'percentage';
      show_titles: boolean;
      show_numbers: boolean;
    };
  };

  // Results page content
  results_page: {
    title?: string;
    subtitle?: string;
    next_steps_header?: string;
    consultation_description?: string;
    contact_cta?: string;
    custom_footer?: string;
  };

  // Email templates
  email_templates: {
    welcome_subject?: string;
    welcome_body?: string;
    consultation_subject?: string;
    consultation_body?: string;
    follow_up_subject?: string;
    follow_up_body?: string;
    custom_templates?: Array<{
      id: string;
      name: string;
      subject: string;
      body: string;
      trigger: string;
    }>;
  };

  // Legal and compliance
  legal_content: {
    terms_of_service?: string;
    privacy_policy?: string;
    disclaimer?: string;
    custom_notices?: Array<{
      id: string;
      title: string;
      content: string;
      required: boolean;
    }>;
  };
}

export interface QuestionnaireCustomizations {
  // Question modifications
  modified_questions: Array<{
    question_id: string;
    changes: {
      text?: string;
      type?: string;
      required?: boolean;
      options?: Array<{ value: string; label: string }>;
      validation?: any;
      visible_if?: any;
    };
  }>;

  // New questions
  added_questions: Array<{
    id: string;
    step_id: string;
    position: number;
    text: string;
    type: string;
    required: boolean;
    options?: Array<{ value: string; label: string }>;
    validation?: any;
    visible_if?: any;
  }>;

  // Removed questions
  removed_questions: string[];

  // Step modifications
  modified_steps: Array<{
    step_id: string;
    changes: {
      title?: string;
      description?: string;
      order?: number;
    };
  }>;

  // New steps
  added_steps: Array<{
    id: string;
    title: string;
    description?: string;
    position: number;
    questions: string[];
  }>;

  // Removed steps
  removed_steps: string[];

  // Logic customizations
  conditional_logic: Array<{
    id: string;
    trigger_question: string;
    trigger_value: any;
    action: 'show' | 'hide' | 'require' | 'skip_to';
    target: string;
  }>;

  // Validation rules
  custom_validation: Array<{
    id: string;
    question_id: string;
    rule_type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'custom';
    rule_value: any;
    error_message: string;
  }>;
}

export interface WorkflowCustomizations {
  // Flow modifications
  navigation: {
    allow_back_navigation: boolean;
    show_progress: boolean;
    auto_save: boolean;
    session_timeout: number;
  };

  // Completion actions
  completion_actions: Array<{
    id: string;
    type: 'email' | 'webhook' | 'redirect' | 'api_call';
    config: any;
    order: number;
    enabled: boolean;
  }>;

  // Custom integrations
  integrations: Array<{
    id: string;
    name: string;
    type: string;
    config: any;
    enabled: boolean;
  }>;

  // Analytics tracking
  analytics: {
    track_page_views: boolean;
    track_question_timing: boolean;
    track_abandonment: boolean;
    custom_events: Array<{
      id: string;
      event_name: string;
      trigger: string;
      properties: any;
    }>;
  };
}

export interface LayoutCustomizations {
  // Page layout
  layout: {
    container_width: 'narrow' | 'medium' | 'wide' | 'full';
    sidebar_enabled: boolean;
    header_style: 'minimal' | 'standard' | 'prominent';
    footer_style: 'minimal' | 'standard' | 'detailed';
  };

  // Component styling
  components: {
    form_style: 'minimal' | 'cards' | 'bordered' | 'floating';
    button_style: 'solid' | 'outline' | 'ghost' | 'gradient';
    input_style: 'standard' | 'rounded' | 'floating' | 'minimal';
    card_style: 'flat' | 'bordered' | 'shadow' | 'elevated';
  };

  // Custom CSS classes
  custom_classes: Array<{
    selector: string;
    properties: Record<string, string>;
    scope: 'global' | 'page' | 'component';
  }>;

  // Responsive settings
  responsive: {
    mobile_layout: 'stack' | 'collapse' | 'hide';
    tablet_layout: 'desktop' | 'mobile' | 'adaptive';
    breakpoint_overrides: Record<string, any>;
  };
}

export interface CustomizationValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  compatibility_issues: string[];
  performance_impact: 'low' | 'medium' | 'high';
}

export interface CustomizationDiff {
  added: any[];
  modified: any[];
  removed: any[];
  conflicts: any[];
}

export interface CustomizationExport {
  customization: TemplateCustomization;
  dependencies: string[];
  assets: any[];
  exported_at: string;
  format_version: string;
}

/**
 * Template Customization Engine
 * Core system for managing template customizations
 */
export class CustomizationEngine {
  private customizations: Map<string, TemplateCustomization> = new Map();
  private versionHistory: Map<string, TemplateCustomization[]> = new Map();

  /**
   * Create new template customization
   */
  createCustomization(
    templateId: string,
    clientId: string,
    name: string,
    baseCustomization?: Partial<TemplateCustomization>
  ): TemplateCustomization {
    const id = this.generateCustomizationId(name);
    const now = new Date().toISOString();

    const customization: TemplateCustomization = {
      id,
      template_id: templateId,
      client_id: clientId,
      name,
      description: baseCustomization?.description,
      version: '1.0.0',
      content_customizations: this.getDefaultContentCustomizations(),
      questionnaire_customizations: this.getDefaultQuestionnaireCustomizations(),
      workflow_customizations: this.getDefaultWorkflowCustomizations(),
      layout_customizations: this.getDefaultLayoutCustomizations(),
      created_at: now,
      updated_at: now,
      created_by: 'system', // In real app, use actual user ID
      is_active: false,
      is_published: false,
      change_summary: 'Initial customization created',
      rollback_point: true,
      ...baseCustomization
    };

    const validation = this.validateCustomization(customization);
    if (!validation.is_valid) {
      throw new Error(`Customization validation failed: ${validation.errors.join(', ')}`);
    }

    this.customizations.set(id, customization);
    this.addToVersionHistory(customization);

    return customization;
  }

  /**
   * Update existing customization
   */
  updateCustomization(
    id: string,
    updates: Partial<TemplateCustomization>,
    changeSummary?: string
  ): TemplateCustomization {
    const existing = this.customizations.get(id);
    if (!existing) {
      throw new Error(`Customization with ID ${id} not found`);
    }

    const updated: TemplateCustomization = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
      version: this.incrementVersion(existing.version),
      parent_version: existing.version,
      change_summary: changeSummary || 'Customization updated'
    };

    const validation = this.validateCustomization(updated);
    if (!validation.is_valid) {
      throw new Error(`Customization validation failed: ${validation.errors.join(', ')}`);
    }

    this.customizations.set(id, updated);
    this.addToVersionHistory(updated);

    return updated;
  }

  /**
   * Get customization by ID
   */
  getCustomization(id: string): TemplateCustomization | null {
    return this.customizations.get(id) || null;
  }

  /**
   * Get customizations by template
   */
  getCustomizationsByTemplate(templateId: string): TemplateCustomization[] {
    return Array.from(this.customizations.values()).filter(c => c.template_id === templateId);
  }

  /**
   * Get customizations by client
   */
  getCustomizationsByClient(clientId: string): TemplateCustomization[] {
    return Array.from(this.customizations.values()).filter(c => c.client_id === clientId);
  }

  /**
   * Apply customization to template
   */
  applyCustomizationToTemplate(
    customizationId: string,
    baseTemplate: UniversalTemplateConfig
  ): UniversalTemplateConfig {
    const customization = this.getCustomization(customizationId);
    if (!customization) {
      throw new Error(`Customization with ID ${customizationId} not found`);
    }

    const customizedTemplate: UniversalTemplateConfig = {
      ...baseTemplate,
      // Apply content customizations
      content: this.applyContentCustomizations(baseTemplate.content, customization.content_customizations),
      // Apply questionnaire customizations
      questionnaire: this.applyQuestionnaireCustomizations(baseTemplate.questionnaire, customization.questionnaire_customizations),
      // Update metadata
      updated_at: new Date().toISOString(),
      version: `${baseTemplate.version}-custom-${customization.version}`
    };

    return customizedTemplate;
  }

  /**
   * Create customization diff
   */
  createDiff(customization1Id: string, customization2Id: string): CustomizationDiff {
    const c1 = this.getCustomization(customization1Id);
    const c2 = this.getCustomization(customization2Id);

    if (!c1 || !c2) {
      throw new Error('One or both customizations not found');
    }

    return {
      added: this.findAddedProperties(c1, c2),
      modified: this.findModifiedProperties(c1, c2),
      removed: this.findRemovedProperties(c1, c2),
      conflicts: this.findConflicts(c1, c2)
    };
  }

  /**
   * Merge customizations
   */
  mergeCustomizations(
    baseId: string,
    sourceId: string,
    targetName: string,
    conflictResolution: 'keep_base' | 'take_source' | 'manual' = 'keep_base'
  ): TemplateCustomization {
    const base = this.getCustomization(baseId);
    const source = this.getCustomization(sourceId);

    if (!base || !source) {
      throw new Error('Base or source customization not found');
    }

    const diff = this.createDiff(baseId, sourceId);

    // For now, implement simple merge strategy
    // In production, this would be more sophisticated
    const merged = this.createCustomization(
      base.template_id,
      base.client_id,
      targetName,
      {
        description: `Merged from ${base.name} and ${source.name}`,
        content_customizations: conflictResolution === 'take_source'
          ? source.content_customizations
          : base.content_customizations,
        questionnaire_customizations: this.mergeQuestionnaireCustomizations(
          base.questionnaire_customizations,
          source.questionnaire_customizations,
          conflictResolution
        ),
        workflow_customizations: conflictResolution === 'take_source'
          ? source.workflow_customizations
          : base.workflow_customizations,
        layout_customizations: conflictResolution === 'take_source'
          ? source.layout_customizations
          : base.layout_customizations
      }
    );

    return merged;
  }

  /**
   * Rollback to previous version
   */
  rollbackToVersion(customizationId: string, targetVersion: string): TemplateCustomization {
    const history = this.versionHistory.get(customizationId) || [];
    const targetCustomization = history.find(c => c.version === targetVersion);

    if (!targetCustomization) {
      throw new Error(`Version ${targetVersion} not found in history`);
    }

    const rolledBack: TemplateCustomization = {
      ...targetCustomization,
      id: customizationId,
      version: this.incrementVersion(targetCustomization.version),
      updated_at: new Date().toISOString(),
      parent_version: targetCustomization.version,
      change_summary: `Rolled back to version ${targetVersion}`,
      rollback_point: true
    };

    this.customizations.set(customizationId, rolledBack);
    this.addToVersionHistory(rolledBack);

    return rolledBack;
  }

  /**
   * Get version history
   */
  getVersionHistory(customizationId: string): TemplateCustomization[] {
    return this.versionHistory.get(customizationId) || [];
  }

  /**
   * Export customization
   */
  exportCustomization(customizationId: string): CustomizationExport {
    const customization = this.getCustomization(customizationId);
    if (!customization) {
      throw new Error(`Customization with ID ${customizationId} not found`);
    }

    return {
      customization,
      dependencies: this.getDependencies(customization),
      assets: this.getReferencedAssets(customization),
      exported_at: new Date().toISOString(),
      format_version: '1.0.0'
    };
  }

  /**
   * Import customization
   */
  importCustomization(exportData: CustomizationExport, newClientId?: string): TemplateCustomization {
    const validation = this.validateCustomization(exportData.customization);
    if (!validation.is_valid) {
      throw new Error(`Import validation failed: ${validation.errors.join(', ')}`);
    }

    const imported = this.createCustomization(
      exportData.customization.template_id,
      newClientId || exportData.customization.client_id,
      `${exportData.customization.name} (Imported)`,
      {
        ...exportData.customization,
        is_active: false,
        is_published: false
      }
    );

    return imported;
  }

  /**
   * Validate customization
   */
  validateCustomization(customization: TemplateCustomization): CustomizationValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const compatibilityIssues: string[] = [];

    // Basic validation
    if (!customization.name?.trim()) {
      errors.push('Customization name is required');
    }

    if (!customization.template_id?.trim()) {
      errors.push('Template ID is required');
    }

    if (!customization.client_id?.trim()) {
      errors.push('Client ID is required');
    }

    // Content validation
    const contentCustomizations = customization.content_customizations;
    if (contentCustomizations.landing_page.hero_title && contentCustomizations.landing_page.hero_title.length > 100) {
      warnings.push('Hero title is quite long, consider shortening for better impact');
    }

    // Questionnaire validation
    const questionnaireCustomizations = customization.questionnaire_customizations;
    if (questionnaireCustomizations.added_questions.length > 20) {
      warnings.push('Many additional questions may impact completion rates');
    }

    // Check for circular dependencies in conditional logic
    const circularDependencies = this.detectCircularDependencies(questionnaireCustomizations.conditional_logic);
    if (circularDependencies.length > 0) {
      errors.push(`Circular dependencies detected in conditional logic: ${circularDependencies.join(', ')}`);
    }

    // Performance impact assessment
    let performanceImpact: 'low' | 'medium' | 'high' = 'low';

    const totalQuestions = questionnaireCustomizations.added_questions.length + questionnaireCustomizations.modified_questions.length;
    const totalLogicRules = questionnaireCustomizations.conditional_logic.length;
    const totalCustomSections = contentCustomizations.landing_page.custom_sections?.length || 0;

    if (totalQuestions > 10 || totalLogicRules > 5 || totalCustomSections > 3) {
      performanceImpact = 'medium';
    }

    if (totalQuestions > 20 || totalLogicRules > 10 || totalCustomSections > 5) {
      performanceImpact = 'high';
      warnings.push('High customization complexity may impact performance');
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      compatibility_issues: compatibilityIssues,
      performance_impact: performanceImpact
    };
  }

  // Private helper methods

  private generateCustomizationId(name: string): string {
    const base = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);

    let counter = 1;
    let id = `custom-${base}`;

    while (this.customizations.has(id)) {
      id = `custom-${base}-${counter}`;
      counter++;
    }

    return id;
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private addToVersionHistory(customization: TemplateCustomization): void {
    const history = this.versionHistory.get(customization.id) || [];
    history.push({ ...customization });

    // Keep only last 10 versions to prevent memory issues
    if (history.length > 10) {
      history.shift();
    }

    this.versionHistory.set(customization.id, history);
  }

  private applyContentCustomizations(baseContent: any, customizations: ContentCustomizations): any {
    return {
      ...baseContent,
      landing_page: {
        ...baseContent.landing_page,
        ...customizations.landing_page,
        features: customizations.landing_page.features || baseContent.landing_page.features,
        testimonials: customizations.landing_page.testimonials || baseContent.landing_page.testimonials
      },
      questionnaire: {
        ...baseContent.questionnaire,
        ...customizations.questionnaire
      },
      results_page: {
        ...baseContent.results_page,
        ...customizations.results_page
      },
      email_templates: {
        ...baseContent.email_templates,
        ...customizations.email_templates
      },
      legal: {
        ...baseContent.legal,
        ...customizations.legal_content
      }
    };
  }

  private applyQuestionnaireCustomizations(baseQuestionnaire: QuestionnaireConfig, customizations: QuestionnaireCustomizations): QuestionnaireConfig {
    let modifiedQuestionnaire = { ...baseQuestionnaire };

    // Apply step modifications
    modifiedQuestionnaire.steps = modifiedQuestionnaire.steps.map(step => {
      const modification = customizations.modified_steps.find(m => m.step_id === step.id);
      if (modification) {
        return {
          ...step,
          ...modification.changes
        };
      }
      return step;
    });

    // Apply question modifications
    modifiedQuestionnaire.steps = modifiedQuestionnaire.steps.map(step => ({
      ...step,
      questions: step.questions.map(question => {
        const modification = customizations.modified_questions.find(m => m.question_id === question.id);
        if (modification) {
          return {
            ...question,
            ...modification.changes
          };
        }
        return question;
      })
    }));

    // Add new questions
    customizations.added_questions.forEach(newQuestion => {
      const stepIndex = modifiedQuestionnaire.steps.findIndex(s => s.id === newQuestion.step_id);
      if (stepIndex !== -1) {
        modifiedQuestionnaire.steps[stepIndex].questions.splice(newQuestion.position, 0, newQuestion);
      }
    });

    // Remove questions
    customizations.removed_questions.forEach(questionId => {
      modifiedQuestionnaire.steps = modifiedQuestionnaire.steps.map(step => ({
        ...step,
        questions: step.questions.filter(q => q.id !== questionId)
      }));
    });

    return modifiedQuestionnaire;
  }

  private mergeQuestionnaireCustomizations(
    base: QuestionnaireCustomizations,
    source: QuestionnaireCustomizations,
    strategy: string
  ): QuestionnaireCustomizations {
    // Simple merge implementation
    return strategy === 'take_source' ? source : base;
  }

  private findAddedProperties(c1: TemplateCustomization, c2: TemplateCustomization): any[] {
    // Simplified implementation - in production would be more comprehensive
    return [];
  }

  private findModifiedProperties(c1: TemplateCustomization, c2: TemplateCustomization): any[] {
    // Simplified implementation
    return [];
  }

  private findRemovedProperties(c1: TemplateCustomization, c2: TemplateCustomization): any[] {
    // Simplified implementation
    return [];
  }

  private findConflicts(c1: TemplateCustomization, c2: TemplateCustomization): any[] {
    // Simplified implementation
    return [];
  }

  private detectCircularDependencies(logicRules: any[]): string[] {
    // Simplified circular dependency detection
    const dependencies = new Map<string, string[]>();

    logicRules.forEach(rule => {
      const deps = dependencies.get(rule.trigger_question) || [];
      deps.push(rule.target);
      dependencies.set(rule.trigger_question, deps);
    });

    // Simple cycle detection
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[] = [];

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = dependencies.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            cycles.push(`${node} -> ${neighbor}`);
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          cycles.push(`${node} -> ${neighbor}`);
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of dependencies.keys()) {
      if (!visited.has(node)) {
        hasCycle(node);
      }
    }

    return cycles;
  }

  private getDependencies(customization: TemplateCustomization): string[] {
    // Return list of dependencies (templates, assets, etc.)
    return [customization.template_id];
  }

  private getReferencedAssets(customization: TemplateCustomization): any[] {
    // Return list of referenced assets
    return [];
  }

  private getDefaultContentCustomizations(): ContentCustomizations {
    return {
      landing_page: {
        custom_sections: []
      },
      questionnaire: {},
      results_page: {},
      email_templates: {
        custom_templates: []
      },
      legal_content: {
        custom_notices: []
      }
    };
  }

  private getDefaultQuestionnaireCustomizations(): QuestionnaireCustomizations {
    return {
      modified_questions: [],
      added_questions: [],
      removed_questions: [],
      modified_steps: [],
      added_steps: [],
      removed_steps: [],
      conditional_logic: [],
      custom_validation: []
    };
  }

  private getDefaultWorkflowCustomizations(): WorkflowCustomizations {
    return {
      navigation: {
        allow_back_navigation: true,
        show_progress: true,
        auto_save: true,
        session_timeout: 1800 // 30 minutes
      },
      completion_actions: [],
      integrations: [],
      analytics: {
        track_page_views: true,
        track_question_timing: false,
        track_abandonment: true,
        custom_events: []
      }
    };
  }

  private getDefaultLayoutCustomizations(): LayoutCustomizations {
    return {
      layout: {
        container_width: 'medium',
        sidebar_enabled: false,
        header_style: 'standard',
        footer_style: 'standard'
      },
      components: {
        form_style: 'cards',
        button_style: 'solid',
        input_style: 'standard',
        card_style: 'shadow'
      },
      custom_classes: [],
      responsive: {
        mobile_layout: 'stack',
        tablet_layout: 'adaptive',
        breakpoint_overrides: {}
      }
    };
  }
}

/**
 * Default customization engine instance
 */
export const customizationEngine = new CustomizationEngine();

/**
 * Convenience functions for customization operations
 */
export const templateCustomizations = {
  create: (templateId: string, clientId: string, name: string, base?: Partial<TemplateCustomization>) =>
    customizationEngine.createCustomization(templateId, clientId, name, base),
  update: (id: string, updates: Partial<TemplateCustomization>, summary?: string) =>
    customizationEngine.updateCustomization(id, updates, summary),
  get: (id: string) => customizationEngine.getCustomization(id),
  getByTemplate: (templateId: string) => customizationEngine.getCustomizationsByTemplate(templateId),
  getByClient: (clientId: string) => customizationEngine.getCustomizationsByClient(clientId),
  applyToTemplate: (customizationId: string, template: UniversalTemplateConfig) =>
    customizationEngine.applyCustomizationToTemplate(customizationId, template),
  validate: (customization: TemplateCustomization) => customizationEngine.validateCustomization(customization),
  createDiff: (id1: string, id2: string) => customizationEngine.createDiff(id1, id2),
  merge: (baseId: string, sourceId: string, name: string, strategy?: 'keep_base' | 'take_source') =>
    customizationEngine.mergeCustomizations(baseId, sourceId, name, strategy),
  rollback: (id: string, version: string) => customizationEngine.rollbackToVersion(id, version),
  getHistory: (id: string) => customizationEngine.getVersionHistory(id),
  export: (id: string) => customizationEngine.exportCustomization(id),
  import: (data: CustomizationExport, clientId?: string) => customizationEngine.importCustomization(data, clientId)
};