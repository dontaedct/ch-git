export interface CustomizationConfig {
  id: string;
  name: string;
  description: string;
  type: CustomizationType;
  target: string;
  value: any;
  metadata: CustomizationMetadata;
}

export type CustomizationType =
  | 'branding'
  | 'layout'
  | 'content'
  | 'styling'
  | 'behavior'
  | 'functionality';

export interface CustomizationMetadata {
  version: string;
  author: string;
  created: Date;
  updated: Date;
  tags: string[];
  priority: number;
}

export interface CustomizationRule {
  id: string;
  condition: string;
  action: string;
  target: string;
  enabled: boolean;
}

export interface CustomizationValidation {
  type: string;
  rules: ValidationRule[];
  required: boolean;
}

export interface ValidationRule {
  field: string;
  operator: string;
  value: any;
  message: string;
}

export interface CustomizationPreset {
  id: string;
  name: string;
  description: string;
  configurations: CustomizationConfig[];
  clientTypes: string[];
}

export interface CustomizationHistory {
  id: string;
  templateId: string;
  changes: CustomizationChange[];
  timestamp: Date;
  author: string;
}

export interface CustomizationChange {
  type: 'create' | 'update' | 'delete';
  target: string;
  before?: any;
  after?: any;
  reason?: string;
}

export interface CustomizationContext {
  scope: 'global' | 'template' | 'component' | 'element';
  environment: 'development' | 'staging' | 'production';
  clientId?: string;
  userId?: string;
  permissions: string[];
}

export interface CustomizationConstraints {
  readonly: boolean;
  required: boolean;
  dependencies: string[];
  conflicts: string[];
  validation: CustomizationValidation[];
}

export interface CustomizationTarget {
  id: string;
  path: string;
  type: string;
  selector: string;
  constraints: CustomizationConstraints;
}

export interface CustomizationApplication {
  targetId: string;
  configId: string;
  applied: boolean;
  timestamp: Date;
  result: ApplicationResult;
}

export interface ApplicationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  performance: PerformanceImpact;
}

export interface PerformanceImpact {
  buildTime: number;
  bundleSize: number;
  renderTime: number;
  memoryUsage: number;
}

export interface CustomizationTemplate {
  id: string;
  name: string;
  description: string;
  points: CustomizationPoint[];
  rules: CustomizationRule[];
  presets: CustomizationPreset[];
  validation: TemplateValidation;
}

export interface CustomizationPoint {
  id: string;
  name: string;
  description: string;
  type: CustomizationType;
  path: string;
  defaultValue: any;
  constraints: CustomizationConstraints;
  examples: CustomizationExample[];
}

export interface CustomizationExample {
  name: string;
  description: string;
  value: any;
  preview?: string;
  code?: string;
}

export interface TemplateValidation {
  schema: ValidationSchema;
  rules: ValidationRule[];
  tests: ValidationTest[];
}

export interface ValidationSchema {
  type: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
}

export interface SchemaProperty {
  type: string;
  description: string;
  enum?: any[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
}

export interface ValidationTest {
  name: string;
  description: string;
  input: any;
  expected: any;
  assertion: string;
}

export interface CustomizationEngine {
  id: string;
  name: string;
  version: string;
  capabilities: EngineCapability[];
  processors: CustomizationProcessor[];
}

export interface EngineCapability {
  name: string;
  description: string;
  supported: boolean;
  configuration?: Record<string, any>;
}

export interface CustomizationProcessor {
  type: CustomizationType;
  handler: string;
  configuration: ProcessorConfig;
  validation: ProcessorValidation;
}

export interface ProcessorConfig {
  options: Record<string, any>;
  defaults: Record<string, any>;
  overrides: Record<string, any>;
}

export interface ProcessorValidation {
  input: ValidationSchema;
  output: ValidationSchema;
  constraints: ValidationConstraint[];
}

export interface ValidationConstraint {
  type: string;
  expression: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface CustomizationSession {
  id: string;
  templateId: string;
  userId: string;
  started: Date;
  updated: Date;
  configurations: CustomizationConfig[];
  state: SessionState;
}

export interface SessionState {
  current: Record<string, any>;
  previous: Record<string, any>;
  changes: CustomizationChange[];
  saved: boolean;
}

export interface CustomizationExport {
  version: string;
  timestamp: Date;
  template: CustomizationTemplate;
  configurations: CustomizationConfig[];
  metadata: ExportMetadata;
}

export interface ExportMetadata {
  format: 'json' | 'yaml' | 'xml';
  compression: boolean;
  encryption: boolean;
  checksum: string;
}

export interface CustomizationImport {
  source: CustomizationExport;
  options: ImportOptions;
  result: ImportResult;
}

export interface ImportOptions {
  merge: boolean;
  overwrite: boolean;
  validate: boolean;
  backup: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  item: string;
  reason: string;
  resolution?: string;
}

export const CUSTOMIZATION_TYPES: CustomizationType[] = [
  'branding',
  'layout',
  'content',
  'styling',
  'behavior',
  'functionality'
];

export const DEFAULT_CONSTRAINTS: CustomizationConstraints = {
  readonly: false,
  required: false,
  dependencies: [],
  conflicts: [],
  validation: []
};

export function createCustomizationConfig(
  type: CustomizationType,
  target: string,
  value: any
): CustomizationConfig {
  return {
    id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${type} customization`,
    description: `Customization for ${target}`,
    type,
    target,
    value,
    metadata: {
      version: '1.0.0',
      author: 'system',
      created: new Date(),
      updated: new Date(),
      tags: [type],
      priority: 5
    }
  };
}

export function validateCustomizationConfig(config: CustomizationConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.id) errors.push('ID is required');
  if (!config.name) errors.push('Name is required');
  if (!config.type) errors.push('Type is required');
  if (!config.target) errors.push('Target is required');

  if (!CUSTOMIZATION_TYPES.includes(config.type)) {
    errors.push(`Invalid type: ${config.type}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Additional interfaces for Requirements Analysis Engine (HT-033.2.1)

// Core client requirements interface
export interface ClientRequirements {
  clientId: string;
  businessDescription: string;
  goals: string;
  targetMarket: string;
  budget: number;
  timeline: string;
  expectedUsers: number;
  integrationNeeds: string[];
  performanceNeeds: string[];
  securityNeeds: string[];
  complianceRequirements: string[];
  technologyPreferences: string[];
  competitorInfo: string;
  budgetNotes: string;
}

// Business context for processing
export interface BusinessContext {
  businessDescription: string;
  goals: string;
  targetMarket: string;
  competitorInfo: string;
  budget: number;
  timeline: string;
  expectedUsers: number;
}

// Technical requirements interface
export interface TechnicalRequirements {
  expectedUsers: number;
  integrationNeeds: string[];
  performanceNeeds: string[];
  securityNeeds: string[];
  complianceRequirements: string[];
  technologyPreferences: string[];
  dataTypes?: string[];
  timeline: string;
  budget: number;
  businessDescription: string;
}

// Budget constraints interface
export interface BudgetConstraints {
  totalBudget: number;
  budgetBuffer: number;
  timeline: string;
  featurePriority: string;
  scopeStability: string;
  technicalComplexity: string;
  integrationRequirements?: string[];
  allowTemplateUsage?: boolean;
  technologyConstraints?: boolean;
  budgetNotes?: string;
}

// Processing configuration
export interface ProcessingConfig {
  aiModel: string;
  analysisDepth: 'basic' | 'standard' | 'comprehensive';
  includeRecommendations: boolean;
  generateAlternatives: boolean;
  confidenceThreshold: number;
  processingTimeout: number;
}

// Analysis result interfaces
export interface AnalysisResult {
  id: string;
  timestamp: Date;
  confidence: number;
  processingTime: number;
  dataQuality: number;
  recommendations: string[];
  alternatives: string[];
  risks: RiskFactor[];
  assumptions: string[];
  limitations: string[];
}

export interface RiskFactor {
  category: 'technical' | 'business' | 'budget' | 'timeline' | 'market';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  mitigation: string[];
  contingency: string;
}

// Cost optimization interface
export interface CostOptimization {
  type: 'template-usage' | 'phased-implementation' | 'feature-simplification' | 'technology-optimization';
  description: string;
  potentialSavings: number;
  implementationComplexity: 'low' | 'medium' | 'high';
  qualityImpact: 'positive' | 'none' | 'minimal' | 'moderate' | 'significant';
  timelineImpact: 'significant-reduction' | 'moderate-reduction' | 'slight-reduction' | 'none' | 'increase';
}

// System architecture interface
export interface SystemArchitecture {
  pattern: 'monolithic' | 'microservices' | 'serverless' | 'hybrid';
  deployment: 'cloud' | 'on-premise' | 'hybrid' | 'edge';
  dataStrategy: string;
  scalingStrategy: string;
  securityLevel: 'basic' | 'standard' | 'high' | 'critical';
}

// Technical constraints interface
export interface TechnicalConstraints {
  budgetLimit: number;
  timelineConstraint: string;
  technologyRestrictions: string[];
  complianceRequired: string[];
  performanceTargets: PerformanceTarget[];
  scalabilityRequirements: ScalabilityRequirement[];
}

export interface PerformanceTarget {
  metric: string;
  target: number;
  unit: string;
  priority: 'critical' | 'important' | 'nice-to-have';
}

export interface ScalabilityRequirement {
  dimension: 'users' | 'data' | 'transactions' | 'geographic';
  currentScale: number;
  targetScale: number;
  timeframe: string;
}

// Industry insights and market analysis
export interface IndustryInsights {
  trends: string[];
  regulations: string[];
  keyFactors: string[];
}

export interface MarketAnalysis {
  size: string;
  growth: string;
  competition: string[];
  opportunities: string[];
}