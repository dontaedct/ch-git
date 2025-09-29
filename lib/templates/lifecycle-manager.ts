/**
 * @fileoverview Template Lifecycle Management System
 * @module lib/templates/lifecycle-manager
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-20T12:58:28.000Z
 */

import { z } from 'zod';
import { EnterpriseTemplate, enterpriseTemplateManager } from './enterprise-manager';
import { templateIntegrationAPI } from '@/lib/api/template-integration';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export const LifecycleStageSchema = z.enum([
  'development',
  'testing',
  'review',
  'staging',
  'production',
  'maintenance',
  'deprecated',
  'archived',
  'retired'
]);

export const LifecycleEventSchema = z.enum([
  'created',
  'updated',
  'published',
  'approved',
  'rejected',
  'deployed',
  'rolled_back',
  'deprecated',
  'archived',
  'deleted',
  'security_scan',
  'compliance_check',
  'performance_audit',
  'usage_milestone',
  'issue_reported',
  'issue_resolved'
]);

export const LifecycleRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  trigger: z.object({
    event: LifecycleEventSchema,
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains']),
      value: z.any()
    }))
  }),
  actions: z.array(z.object({
    type: z.enum(['update_status', 'send_notification', 'create_task', 'run_scan', 'backup', 'archive']),
    parameters: z.record(z.any())
  })),
  enabled: z.boolean().default(true),
  priority: z.number().default(0)
});

export const LifecycleEventRecordSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  event: LifecycleEventSchema,
  timestamp: z.date(),
  triggeredBy: z.string(),
  details: z.record(z.any()).optional(),
  metadata: z.object({
    version: z.string().optional(),
    previousStage: z.string().optional(),
    newStage: z.string().optional(),
    automated: z.boolean().default(false),
    ruleId: z.string().optional()
  }).optional()
});

export const LifecyclePolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  templateFilter: z.object({
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    authors: z.array(z.string()).optional(),
    minSecurityScore: z.number().optional(),
    maxAge: z.number().optional() // days
  }).optional(),
  stages: z.array(z.object({
    stage: LifecycleStageSchema,
    requirements: z.array(z.object({
      type: z.enum(['approval', 'test_pass', 'security_scan', 'compliance_check', 'usage_threshold']),
      parameters: z.record(z.any())
    })),
    maxDuration: z.number().optional(), // days
    autoAdvance: z.boolean().default(false),
    notifications: z.array(z.object({
      event: z.string(),
      recipients: z.array(z.string()),
      template: z.string()
    })).optional()
  })),
  rules: z.array(z.string()), // Rule IDs
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type LifecycleStage = z.infer<typeof LifecycleStageSchema>;
export type LifecycleEvent = z.infer<typeof LifecycleEventSchema>;
export type LifecycleRule = z.infer<typeof LifecycleRuleSchema>;
export type LifecycleEventRecord = z.infer<typeof LifecycleEventRecordSchema>;
export type LifecyclePolicy = z.infer<typeof LifecyclePolicySchema>;

// =============================================================================
// TEMPLATE LIFECYCLE MANAGER CLASS
// =============================================================================

export class TemplateLifecycleManager {
  private rules: Map<string, LifecycleRule> = new Map();
  private policies: Map<string, LifecyclePolicy> = new Map();
  private eventHistory: Map<string, LifecycleEventRecord[]> = new Map();
  private templateStages: Map<string, LifecycleStage> = new Map();
  
  constructor() {
    this.initializeManager();
  }
  
  private async initializeManager(): Promise<void> {
    console.log('🔄 Initializing Template Lifecycle Manager');
    
    // Load existing data
    await this.loadExistingData();
    
    // Register default rules and policies
    this.registerDefaultRules();
    this.registerDefaultPolicies();
    
    // Start background processors
    this.startBackgroundProcessors();
  }
  
  private async loadExistingData(): Promise<void> {
    // In a real implementation, this would load from database
    console.log('📦 Loading lifecycle data...');
    
    // Mock template stages
    const templates = enterpriseTemplateManager.getAllTemplates();
    templates.forEach(template => {
      // Assign stages based on template status
      let stage: LifecycleStage = 'development';
      switch (template.status) {
        case 'active':
          stage = 'production';
          break;
        case 'beta':
          stage = 'staging';
          break;
        case 'maintenance':
          stage = 'maintenance';
          break;
        case 'deprecated':
          stage = 'deprecated';
          break;
      }
      this.templateStages.set(template.id, stage);
    });
    
    console.log('✅ Loaded lifecycle data');
  }
  
  private registerDefaultRules(): void {
    const defaultRules: LifecycleRule[] = [
      {
        id: 'auto-deprecate-old',
        name: 'Auto-deprecate Old Templates',
        description: 'Automatically deprecate templates that are older than 2 years and have low usage',
        trigger: {
          event: 'usage_milestone',
          conditions: [
            { field: 'age_days', operator: 'greater_than', value: 730 },
            { field: 'monthly_downloads', operator: 'less_than', value: 100 }
          ]
        },
        actions: [
          {
            type: 'update_status',
            parameters: { status: 'deprecated', reason: 'Low usage and age' }
          },
          {
            type: 'send_notification',
            parameters: {
              recipients: ['template-maintainers@osshero.dev'],
              subject: 'Template Auto-deprecated',
              template: 'auto_deprecation_notice'
            }
          }
        ],
        enabled: true,
        priority: 1
      },
      {
        id: 'security-scan-trigger',
        name: 'Security Scan on Update',
        description: 'Trigger security scan when template is updated',
        trigger: {
          event: 'updated',
          conditions: []
        },
        actions: [
          {
            type: 'run_scan',
            parameters: { scanType: 'security', priority: 'high' }
          }
        ],
        enabled: true,
        priority: 2
      },
      {
        id: 'backup-before-major-update',
        name: 'Backup Before Major Update',
        description: 'Create backup before major version updates',
        trigger: {
          event: 'updated',
          conditions: [
            { field: 'version_change_type', operator: 'equals', value: 'major' }
          ]
        },
        actions: [
          {
            type: 'backup',
            parameters: { backupType: 'full', retention: 90 }
          }
        ],
        enabled: true,
        priority: 3
      },
      {
        id: 'archive-retired-templates',
        name: 'Archive Retired Templates',
        description: 'Archive templates that have been retired for 30 days',
        trigger: {
          event: 'deprecated',
          conditions: [
            { field: 'days_since_deprecation', operator: 'greater_than', value: 30 }
          ]
        },
        actions: [
          {
            type: 'archive',
            parameters: { location: 'cold_storage', compress: true }
          }
        ],
        enabled: true,
        priority: 1
      }
    ];
    
    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
    
    console.log(`✅ Registered ${defaultRules.length} default lifecycle rules`);
  }
  
  private registerDefaultPolicies(): void {
    const defaultPolicies: LifecyclePolicy[] = [
      {
        id: 'enterprise-template-policy',
        name: 'Enterprise Template Policy',
        description: 'Standard lifecycle policy for enterprise templates',
        templateFilter: {
          categories: ['Dashboard', 'Forms', 'E-commerce'],
          minSecurityScore: 80
        },
        stages: [
          {
            stage: 'development',
            requirements: [
              {
                type: 'test_pass',
                parameters: { minCoverage: 80, requiredTests: ['unit', 'integration'] }
              }
            ],
            maxDuration: 30,
            autoAdvance: false
          },
          {
            stage: 'testing',
            requirements: [
              {
                type: 'security_scan',
                parameters: { minScore: 85, scanDepth: 'thorough' }
              },
              {
                type: 'compliance_check',
                parameters: { standards: ['SOC2', 'GDPR'] }
              }
            ],
            maxDuration: 14,
            autoAdvance: false
          },
          {
            stage: 'review',
            requirements: [
              {
                type: 'approval',
                parameters: { requiredApprovers: 2, approverRoles: ['template-reviewer', 'security-officer'] }
              }
            ],
            maxDuration: 7,
            autoAdvance: false
          },
          {
            stage: 'staging',
            requirements: [
              {
                type: 'test_pass',
                parameters: { environment: 'staging', duration: 48 }
              }
            ],
            maxDuration: 7,
            autoAdvance: true
          },
          {
            stage: 'production',
            requirements: [],
            autoAdvance: false,
            notifications: [
              {
                event: 'stage_entered',
                recipients: ['template-users@osshero.dev'],
                template: 'production_release_notice'
              }
            ]
          }
        ],
        rules: ['security-scan-trigger', 'backup-before-major-update'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    defaultPolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
    
    console.log(`✅ Registered ${defaultPolicies.length} default lifecycle policies`);
  }
  
  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================
  
  async recordEvent(
    templateId: string,
    event: LifecycleEvent,
    triggeredBy: string,
    details?: Record<string, any>,
    metadata?: any
  ): Promise<string> {
    const eventRecord: LifecycleEventRecord = {
      id: this.generateId(),
      templateId,
      event,
      timestamp: new Date(),
      triggeredBy,
      details,
      metadata
    };
    
    const validatedEvent = LifecycleEventRecordSchema.parse(eventRecord);
    
    // Add to history
    if (!this.eventHistory.has(templateId)) {
      this.eventHistory.set(templateId, []);
    }
    this.eventHistory.get(templateId)!.push(validatedEvent);
    
    // Process rules
    await this.processEventRules(validatedEvent);
    
    // Update stage if applicable
    await this.updateTemplateStage(templateId, event, metadata);
    
    console.log(`📝 Recorded lifecycle event: ${event} for template ${templateId}`);
    
    return validatedEvent.id;
  }
  
  private async processEventRules(event: LifecycleEventRecord): Promise<void> {
    const applicableRules = Array.from(this.rules.values()).filter(rule =>
      rule.enabled && rule.trigger.event === event.event
    );
    
    for (const rule of applicableRules) {
      try {
        const template = enterpriseTemplateManager.getTemplate(event.templateId);
        if (!template) continue;
        
        // Check conditions
        const conditionsMet = await this.evaluateConditions(rule.trigger.conditions, template, event);
        
        if (conditionsMet) {
          await this.executeRuleActions(rule, template, event);
        }
      } catch (error) {
        console.error(`Error processing rule ${rule.id}:`, error);
      }
    }
  }
  
  private async evaluateConditions(
    conditions: any[],
    template: EnterpriseTemplate,
    event: LifecycleEventRecord
  ): Promise<boolean> {
    for (const condition of conditions) {
      const value = this.getFieldValue(condition.field, template, event);
      
      if (!this.evaluateCondition(value, condition.operator, condition.value)) {
        return false;
      }
    }
    
    return true;
  }
  
  private getFieldValue(field: string, template: EnterpriseTemplate, event: LifecycleEventRecord): any {
    // Extract field values from template or event
    switch (field) {
      case 'age_days':
        return Math.floor((Date.now() - template.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      case 'monthly_downloads':
        return template.usageMetrics?.monthly || 0;
      case 'security_score':
        return template.securityScore;
      case 'version_change_type':
        return event.details?.versionChangeType || 'patch';
      case 'days_since_deprecation':
        const deprecationEvent = this.getLastEventOfType(template.id, 'deprecated');
        if (!deprecationEvent) return 0;
        return Math.floor((Date.now() - deprecationEvent.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      default:
        return template[field as keyof EnterpriseTemplate] || event.details?.[field];
    }
  }
  
  private evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expectedValue;
      case 'not_equals':
        return value !== expectedValue;
      case 'greater_than':
        return Number(value) > Number(expectedValue);
      case 'less_than':
        return Number(value) < Number(expectedValue);
      case 'contains':
        return String(value).toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'not_contains':
        return !String(value).toLowerCase().includes(String(expectedValue).toLowerCase());
      default:
        return false;
    }
  }
  
  private async executeRuleActions(
    rule: LifecycleRule,
    template: EnterpriseTemplate,
    event: LifecycleEventRecord
  ): Promise<void> {
    console.log(`⚡ Executing rule actions: ${rule.name} for template ${template.name}`);
    
    for (const action of rule.actions) {
      try {
        await this.executeAction(action, template, event, rule);
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
      }
    }
    
    // Record that this rule was executed
    await this.recordEvent(
      template.id,
      'updated',
      'system',
      { ruleExecuted: rule.id, ruleName: rule.name },
      { automated: true, ruleId: rule.id }
    );
  }
  
  private async executeAction(
    action: any,
    template: EnterpriseTemplate,
    event: LifecycleEventRecord,
    rule: LifecycleRule
  ): Promise<void> {
    switch (action.type) {
      case 'update_status':
        await enterpriseTemplateManager.updateTemplate(template.id, {
          status: action.parameters.status
        });
        break;
        
      case 'send_notification':
        await this.sendNotification(action.parameters, template, event);
        break;
        
      case 'create_task':
        await this.createTask(action.parameters, template, event);
        break;
        
      case 'run_scan':
        await this.runScan(action.parameters, template);
        break;
        
      case 'backup':
        await this.createBackup(action.parameters, template);
        break;
        
      case 'archive':
        await this.archiveTemplate(action.parameters, template);
        break;
        
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }
  
  // =============================================================================
  // STAGE MANAGEMENT
  // =============================================================================
  
  async updateTemplateStage(
    templateId: string,
    event: LifecycleEvent,
    metadata?: any
  ): Promise<void> {
    const currentStage = this.templateStages.get(templateId);
    let newStage: LifecycleStage | undefined;
    
    // Determine new stage based on event
    switch (event) {
      case 'created':
        newStage = 'development';
        break;
      case 'published':
        newStage = 'testing';
        break;
      case 'approved':
        newStage = 'staging';
        break;
      case 'deployed':
        newStage = 'production';
        break;
      case 'deprecated':
        newStage = 'deprecated';
        break;
      case 'archived':
        newStage = 'archived';
        break;
      case 'deleted':
        newStage = 'retired';
        break;
    }
    
    if (newStage && newStage !== currentStage) {
      this.templateStages.set(templateId, newStage);
      
      // Record stage change event
      await this.recordEvent(
        templateId,
        event,
        metadata?.triggeredBy || 'system',
        { stageChange: { from: currentStage, to: newStage } },
        { automated: true, previousStage: currentStage, newStage }
      );
      
      console.log(`🔄 Template ${templateId} stage changed: ${currentStage} → ${newStage}`);
    }
  }
  
  getTemplateStage(templateId: string): LifecycleStage | undefined {
    return this.templateStages.get(templateId);
  }
  
  async advanceTemplateStage(
    templateId: string,
    targetStage: LifecycleStage,
    triggeredBy: string,
    skipRequirements = false
  ): Promise<boolean> {
    const template = enterpriseTemplateManager.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    const currentStage = this.getTemplateStage(templateId);
    const applicablePolicy = this.findApplicablePolicy(template);
    
    if (!applicablePolicy) {
      console.warn(`No applicable policy found for template ${templateId}`);
      return false;
    }
    
    const targetStageConfig = applicablePolicy.stages.find(s => s.stage === targetStage);
    if (!targetStageConfig) {
      throw new Error(`Target stage ${targetStage} not found in policy`);
    }
    
    // Check requirements
    if (!skipRequirements) {
      const requirementsMet = await this.checkStageRequirements(template, targetStageConfig);
      if (!requirementsMet) {
        console.log(`Requirements not met for advancing ${templateId} to ${targetStage}`);
        return false;
      }
    }
    
    // Advance stage
    this.templateStages.set(templateId, targetStage);
    
    // Record advancement
    await this.recordEvent(
      templateId,
      'updated',
      triggeredBy,
      { stageAdvancement: { from: currentStage, to: targetStage } },
      { previousStage: currentStage, newStage: targetStage }
    );
    
    // Send notifications
    if (targetStageConfig.notifications) {
      for (const notification of targetStageConfig.notifications) {
        await this.sendStageNotification(notification, template, targetStage);
      }
    }
    
    console.log(`✅ Advanced template ${templateId} to stage: ${targetStage}`);
    return true;
  }
  
  private async checkStageRequirements(template: EnterpriseTemplate, stageConfig: any): Promise<boolean> {
    for (const requirement of stageConfig.requirements) {
      const met = await this.checkRequirement(requirement, template);
      if (!met) {
        console.log(`Requirement not met: ${requirement.type} for template ${template.id}`);
        return false;
      }
    }
    
    return true;
  }
  
  private async checkRequirement(requirement: any, template: EnterpriseTemplate): Promise<boolean> {
    switch (requirement.type) {
      case 'approval':
        // Check if template has required approvals
        return template.approvalStatus === 'approved';
        
      case 'test_pass':
        // Check if tests have passed
        return template.qualityScore >= (requirement.parameters.minScore || 80);
        
      case 'security_scan':
        // Check if security scan has passed
        return template.securityScore >= (requirement.parameters.minScore || 85);
        
      case 'compliance_check':
        // Check if compliance requirements are met
        const requiredStandards = requirement.parameters.standards || [];
        return requiredStandards.every((standard: string) => 
          template.complianceFlags.includes(standard)
        );
        
      case 'usage_threshold':
        // Check if usage threshold is met
        const minUsage = requirement.parameters.minUsage || 0;
        return (template.usageMetrics?.monthly || 0) >= minUsage;
        
      default:
        console.warn(`Unknown requirement type: ${requirement.type}`);
        return true;
    }
  }
  
  // =============================================================================
  // POLICY MANAGEMENT
  // =============================================================================
  
  private findApplicablePolicy(template: EnterpriseTemplate): LifecyclePolicy | undefined {
    const policies = Array.from(this.policies.values()).filter(p => p.active);
    
    for (const policy of policies) {
      if (this.templateMatchesPolicy(template, policy)) {
        return policy;
      }
    }
    
    return undefined;
  }
  
  private templateMatchesPolicy(template: EnterpriseTemplate, policy: LifecyclePolicy): boolean {
    const filter = policy.templateFilter;
    if (!filter) return true;
    
    // Check categories
    if (filter.categories && !filter.categories.includes(template.category)) {
      return false;
    }
    
    // Check tags
    if (filter.tags && !filter.tags.some(tag => template.tags.includes(tag))) {
      return false;
    }
    
    // Check authors
    if (filter.authors && !filter.authors.includes(template.author)) {
      return false;
    }
    
    // Check security score
    if (filter.minSecurityScore && template.securityScore < filter.minSecurityScore) {
      return false;
    }
    
    // Check age
    if (filter.maxAge) {
      const ageInDays = Math.floor((Date.now() - template.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (ageInDays > filter.maxAge) {
        return false;
      }
    }
    
    return true;
  }
  
  // =============================================================================
  // BACKGROUND PROCESSORS
  // =============================================================================
  
  private startBackgroundProcessors(): void {
    // Check for stage timeouts
    setInterval(() => {
      this.checkStageTimeouts();
    }, 60 * 60 * 1000); // Every hour
    
    // Auto-advance eligible templates
    setInterval(() => {
      this.processAutoAdvancement();
    }, 30 * 60 * 1000); // Every 30 minutes
    
    // Clean up old events
    setInterval(() => {
      this.cleanupOldEvents();
    }, 24 * 60 * 60 * 1000); // Daily
  }
  
  private async checkStageTimeouts(): Promise<void> {
    console.log('⏰ Checking stage timeouts...');
    
    const templates = enterpriseTemplateManager.getAllTemplates();
    
    for (const template of templates) {
      const stage = this.getTemplateStage(template.id);
      if (!stage) continue;
      
      const policy = this.findApplicablePolicy(template);
      if (!policy) continue;
      
      const stageConfig = policy.stages.find(s => s.stage === stage);
      if (!stageConfig || !stageConfig.maxDuration) continue;
      
      const stageEntryEvent = this.getLastStageEntryEvent(template.id, stage);
      if (!stageEntryEvent) continue;
      
      const daysSinceEntry = Math.floor(
        (Date.now() - stageEntryEvent.timestamp.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceEntry > stageConfig.maxDuration) {
        await this.recordEvent(
          template.id,
          'updated',
          'system',
          { stageTimeout: { stage, daysSinceEntry, maxDuration: stageConfig.maxDuration } }
        );
        
        // Send timeout notification
        await this.sendNotification(
          {
            recipients: ['template-managers@osshero.dev'],
            subject: `Template Stage Timeout: ${template.name}`,
            template: 'stage_timeout_notice'
          },
          template,
          stageEntryEvent
        );
      }
    }
  }
  
  private async processAutoAdvancement(): Promise<void> {
    console.log('🚀 Processing auto-advancement...');
    
    const templates = enterpriseTemplateManager.getAllTemplates();
    
    for (const template of templates) {
      const currentStage = this.getTemplateStage(template.id);
      if (!currentStage) continue;
      
      const policy = this.findApplicablePolicy(template);
      if (!policy) continue;
      
      const stageConfig = policy.stages.find(s => s.stage === currentStage);
      if (!stageConfig || !stageConfig.autoAdvance) continue;
      
      // Find next stage
      const currentIndex = policy.stages.findIndex(s => s.stage === currentStage);
      if (currentIndex === -1 || currentIndex === policy.stages.length - 1) continue;
      
      const nextStage = policy.stages[currentIndex + 1].stage;
      
      // Try to advance
      const advanced = await this.advanceTemplateStage(
        template.id,
        nextStage,
        'system',
        false
      );
      
      if (advanced) {
        console.log(`🔄 Auto-advanced template ${template.id} from ${currentStage} to ${nextStage}`);
      }
    }
  }
  
  private cleanupOldEvents(): void {
    console.log('🧹 Cleaning up old lifecycle events...');
    
    const cutoffDate = new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)); // 1 year ago
    
    for (const [templateId, events] of this.eventHistory.entries()) {
      const filteredEvents = events.filter(event => event.timestamp >= cutoffDate);
      
      if (filteredEvents.length !== events.length) {
        this.eventHistory.set(templateId, filteredEvents);
        console.log(`🗑️ Cleaned up ${events.length - filteredEvents.length} old events for template ${templateId}`);
      }
    }
  }
  
  // =============================================================================
  // UTILITY METHODS
  // =============================================================================
  
  private getLastEventOfType(templateId: string, eventType: LifecycleEvent): LifecycleEventRecord | undefined {
    const events = this.eventHistory.get(templateId) || [];
    return events
      .filter(e => e.event === eventType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }
  
  private getLastStageEntryEvent(templateId: string, stage: LifecycleStage): LifecycleEventRecord | undefined {
    const events = this.eventHistory.get(templateId) || [];
    return events
      .filter(e => e.metadata?.newStage === stage)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }
  
  private async sendNotification(
    parameters: any,
    template: EnterpriseTemplate,
    event: LifecycleEventRecord
  ): Promise<void> {
    console.log(`📧 Sending notification: ${parameters.subject || 'Lifecycle Event'}`);
    // Mock notification sending
  }
  
  private async sendStageNotification(
    notification: any,
    template: EnterpriseTemplate,
    stage: LifecycleStage
  ): Promise<void> {
    console.log(`📧 Sending stage notification for ${template.name} entering ${stage}`);
    // Mock stage notification
  }
  
  private async createTask(
    parameters: any,
    template: EnterpriseTemplate,
    event: LifecycleEventRecord
  ): Promise<void> {
    console.log(`📝 Creating task for template: ${template.name}`);
    // Mock task creation
  }
  
  private async runScan(parameters: any, template: EnterpriseTemplate): Promise<void> {
    console.log(`🔍 Running ${parameters.scanType} scan for template: ${template.name}`);
    // Mock scan execution
  }
  
  private async createBackup(parameters: any, template: EnterpriseTemplate): Promise<void> {
    console.log(`💾 Creating backup for template: ${template.name}`);
    // Mock backup creation
  }
  
  private async archiveTemplate(parameters: any, template: EnterpriseTemplate): Promise<void> {
    console.log(`📦 Archiving template: ${template.name}`);
    // Mock archival
  }
  
  private generateId(): string {
    return 'lifecycle-' + Math.random().toString(36).substr(2, 9);
  }
  
  // =============================================================================
  // PUBLIC API METHODS
  // =============================================================================
  
  getTemplateEvents(templateId: string): LifecycleEventRecord[] {
    return this.eventHistory.get(templateId) || [];
  }
  
  getTemplateLifecycleStatus(templateId: string): {
    currentStage: LifecycleStage | undefined;
    applicablePolicy: LifecyclePolicy | undefined;
    recentEvents: LifecycleEventRecord[];
    nextStage?: LifecycleStage;
    canAdvance: boolean;
  } {
    const template = enterpriseTemplateManager.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    const currentStage = this.getTemplateStage(templateId);
    const applicablePolicy = this.findApplicablePolicy(template);
    const recentEvents = this.getTemplateEvents(templateId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
    
    let nextStage: LifecycleStage | undefined;
    let canAdvance = false;
    
    if (applicablePolicy && currentStage) {
      const currentIndex = applicablePolicy.stages.findIndex(s => s.stage === currentStage);
      if (currentIndex !== -1 && currentIndex < applicablePolicy.stages.length - 1) {
        nextStage = applicablePolicy.stages[currentIndex + 1].stage;
        // Check if can advance (simplified check)
        canAdvance = template.approvalStatus === 'approved' && template.securityScore >= 80;
      }
    }
    
    return {
      currentStage,
      applicablePolicy,
      recentEvents,
      nextStage,
      canAdvance
    };
  }
  
  getLifecycleStats(): {
    templatesByStage: Record<string, number>;
    eventsByType: Record<string, number>;
    rulesExecuted: number;
    averageStageTime: Record<string, number>;
  } {
    const templatesByStage: Record<string, number> = {};
    const eventsByType: Record<string, number> = {};
    let rulesExecuted = 0;
    
    // Count templates by stage
    for (const stage of this.templateStages.values()) {
      templatesByStage[stage] = (templatesByStage[stage] || 0) + 1;
    }
    
    // Count events by type
    for (const events of this.eventHistory.values()) {
      for (const event of events) {
        eventsByType[event.event] = (eventsByType[event.event] || 0) + 1;
        if (event.metadata?.automated && event.metadata?.ruleId) {
          rulesExecuted++;
        }
      }
    }
    
    // Calculate average stage time (mock data)
    const averageStageTime: Record<string, number> = {
      development: 15, // days
      testing: 7,
      review: 3,
      staging: 2,
      production: 0 // indefinite
    };
    
    return {
      templatesByStage,
      eventsByType,
      rulesExecuted,
      averageStageTime
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const templateLifecycleManager = new TemplateLifecycleManager();
