/**
 * @fileoverview Template Customization Points - HT-033.1.2
 * @module lib/templates/customization-points
 * @author Hero Task System
 * @version 1.0.0
 *
 * Comprehensive system for defining, managing, and validating template customization points
 * with AI-powered targeting and client-specific customization capabilities.
 */

import { z } from 'zod';

// Core customization point types
export type CustomizationPointType =
  | 'theme'
  | 'layout'
  | 'content'
  | 'behavior'
  | 'integration'
  | 'configuration'
  | 'styling'
  | 'branding'
  | 'functionality'
  | 'workflow'
  | 'component'
  | 'data'
  | 'api'
  | 'routing';

export type CustomizationScope = 'global' | 'page' | 'component' | 'element' | 'property' | 'method' | 'event';
export type CustomizationImpact = 'cosmetic' | 'functional' | 'structural' | 'architectural' | 'behavioral';
export type CustomizationComplexity = 'simple' | 'moderate' | 'complex' | 'expert' | 'enterprise';
export type CustomizationPriority = 'low' | 'medium' | 'high' | 'critical' | 'client-requested';

// Customization Point Definition
export interface CustomizationPoint {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: CustomizationPointType;
  scope: CustomizationScope;
  impact: CustomizationImpact;
  complexity: CustomizationComplexity;
  priority: CustomizationPriority;

  // Location and targeting
  location: CustomizationLocation;
  selector: CustomizationSelector;
  context: CustomizationContext;

  // Customization properties
  properties: CustomizationProperty[];
  constraints: CustomizationConstraint[];
  dependencies: CustomizationDependency[];

  // AI and automation
  aiSupport: AICustomizationSupport;
  automation: AutomationSupport;

  // Validation and testing
  validation: CustomizationValidation;
  testing: CustomizationTesting;

  // Documentation and examples
  documentation: CustomizationDocumentation;
  examples: CustomizationExample[];

  // Metadata
  metadata: CustomizationMetadata;

  // Client-specific settings
  clientSettings: ClientCustomizationSettings;

  // Performance and monitoring
  performance: PerformanceSettings;
  monitoring: MonitoringSettings;
}

// Location and targeting interfaces
export interface CustomizationLocation {
  templateId: string;
  templatePath: string;
  file: string;
  line?: number;
  column?: number;
  method?: string;
  component?: string;
  element?: string;
  property?: string;
  selector?: string;
  xpath?: string;
  astNode?: ASTNodeReference;
  sourceMap?: SourceMapReference;
}

export interface ASTNodeReference {
  type: string;
  id: string;
  path: string[];
  startPosition: { line: number; column: number };
  endPosition: { line: number; column: number };
}

export interface SourceMapReference {
  file: string;
  line: number;
  column: number;
  originalFile: string;
  originalLine: number;
  originalColumn: number;
}

export interface CustomizationSelector {
  css?: string;
  xpath?: string;
  react?: ReactSelector;
  vue?: VueSelector;
  angular?: AngularSelector;
  custom?: CustomSelector;
}

export interface ReactSelector {
  component: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
  context?: string;
  ref?: string;
  hook?: string;
}

export interface VueSelector {
  component: string;
  props?: Record<string, any>;
  data?: Record<string, any>;
  computed?: string;
  method?: string;
  directive?: string;
}

export interface AngularSelector {
  component: string;
  selector: string;
  input?: string;
  output?: string;
  service?: string;
  directive?: string;
  pipe?: string;
}

export interface CustomSelector {
  type: string;
  query: string;
  framework: string;
  version: string;
  parameters: Record<string, any>;
}

export interface CustomizationContext {
  framework: string;
  version: string;
  environment: 'development' | 'staging' | 'production' | 'test';
  platform: 'web' | 'mobile' | 'desktop' | 'server' | 'edge';
  device: 'desktop' | 'tablet' | 'mobile' | 'watch' | 'tv';
  browser: BrowserContext;
  user: UserContext;
  tenant: TenantContext;
  feature_flags: Record<string, boolean>;
  variables: Record<string, any>;
}

export interface BrowserContext {
  name: string;
  version: string;
  engine: string;
  capabilities: string[];
  limitations: string[];
}

export interface UserContext {
  role: string;
  permissions: string[];
  preferences: Record<string, any>;
  locale: string;
  timezone: string;
  accessibility: AccessibilityContext;
}

export interface AccessibilityContext {
  screenReader: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: number;
  colorBlindness: string[];
}

export interface TenantContext {
  id: string;
  name: string;
  plan: string;
  features: string[];
  limits: Record<string, number>;
  branding: TenantBranding;
}

export interface TenantBranding {
  logo: string;
  colors: ColorScheme;
  fonts: FontScheme;
  theme: string;
  customCss: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface FontScheme {
  primary: FontDefinition;
  secondary: FontDefinition;
  monospace: FontDefinition;
  display: FontDefinition;
}

export interface FontDefinition {
  family: string;
  weight: string;
  size: string;
  lineHeight: string;
  letterSpacing: string;
}

// Customization properties
export interface CustomizationProperty {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: PropertyType;
  dataType: PropertyDataType;

  // Value settings
  defaultValue: any;
  currentValue?: any;
  allowedValues?: any[];
  valueRange?: ValueRange;

  // UI configuration
  uiConfig: PropertyUIConfig;

  // Validation
  validation: PropertyValidation;

  // Dependencies
  dependencies: PropertyDependency[];
  dependents: string[];

  // Conditional logic
  conditions: PropertyCondition[];

  // AI support
  aiGeneration: AIPropertyGeneration;

  // Metadata
  metadata: PropertyMetadata;
}

export type PropertyType =
  | 'primitive'
  | 'object'
  | 'array'
  | 'function'
  | 'component'
  | 'style'
  | 'asset'
  | 'config'
  | 'data'
  | 'event';

export type PropertyDataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'color'
  | 'font'
  | 'size'
  | 'spacing'
  | 'url'
  | 'email'
  | 'date'
  | 'time'
  | 'datetime'
  | 'json'
  | 'css'
  | 'html'
  | 'markdown'
  | 'code'
  | 'file'
  | 'image'
  | 'video'
  | 'audio'
  | 'enum'
  | 'multiselect'
  | 'range'
  | 'regex'
  | 'custom';

export interface ValueRange {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface PropertyUIConfig {
  widget: UIWidget;
  label: string;
  placeholder?: string;
  helpText?: string;
  tooltip?: string;
  icon?: string;

  // Layout
  layout: UILayout;
  grouping: UIGrouping;

  // Appearance
  appearance: UIAppearance;

  // Behavior
  behavior: UIBehavior;

  // Options for select/multi-select
  options?: UIOption[];

  // Conditional display
  conditional: ConditionalDisplay;
}

export type UIWidget =
  | 'text'
  | 'textarea'
  | 'number'
  | 'slider'
  | 'range'
  | 'toggle'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'multiselect'
  | 'combobox'
  | 'color_picker'
  | 'color_palette'
  | 'font_picker'
  | 'size_picker'
  | 'spacing_picker'
  | 'file_upload'
  | 'image_upload'
  | 'code_editor'
  | 'rich_text'
  | 'markdown_editor'
  | 'date_picker'
  | 'time_picker'
  | 'datetime_picker'
  | 'url_input'
  | 'email_input'
  | 'phone_input'
  | 'password_input'
  | 'search_input'
  | 'tag_input'
  | 'json_editor'
  | 'css_editor'
  | 'component_picker'
  | 'asset_picker'
  | 'icon_picker'
  | 'gradient_picker'
  | 'shadow_picker'
  | 'animation_picker'
  | 'custom';

export interface UILayout {
  width: string;
  columns?: number;
  span?: number;
  order?: number;
  alignment?: 'left' | 'center' | 'right' | 'stretch';
  margin?: string;
  padding?: string;
}

export interface UIGrouping {
  group?: string;
  section?: string;
  tab?: string;
  accordion?: string;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface UIAppearance {
  variant?: 'default' | 'outline' | 'filled' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  theme?: 'light' | 'dark' | 'auto';
  rounded?: boolean;
  shadow?: boolean;
  border?: boolean;
}

export interface UIBehavior {
  readonly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  autoFocus?: boolean;
  autoComplete?: boolean;
  debounce?: number;
  throttle?: number;
}

export interface UIOption {
  label: string;
  value: any;
  description?: string;
  icon?: string;
  image?: string;
  color?: string;
  disabled?: boolean;
  group?: string;
  metadata?: Record<string, any>;
}

export interface ConditionalDisplay {
  showWhen?: string;
  hideWhen?: string;
  enableWhen?: string;
  disableWhen?: string;
  requiredWhen?: string;
  conditions?: DisplayCondition[];
}

export interface DisplayCondition {
  property: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

export interface PropertyValidation {
  required: boolean;
  rules: ValidationRule[];
  customValidation?: string;
  asyncValidation?: AsyncValidation;
  realTimeValidation: boolean;
  validationTrigger: 'change' | 'blur' | 'submit';
}

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export type ValidationType =
  | 'required'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'email'
  | 'url'
  | 'numeric'
  | 'integer'
  | 'positive'
  | 'negative'
  | 'alpha'
  | 'alphanumeric'
  | 'date'
  | 'time'
  | 'datetime'
  | 'json'
  | 'css'
  | 'html'
  | 'markdown'
  | 'color'
  | 'file'
  | 'image'
  | 'video'
  | 'audio'
  | 'custom';

export interface AsyncValidation {
  endpoint: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
  timeout: number;
  retries: number;
  cache: boolean;
  cacheDuration: number;
}

export interface PropertyDependency {
  property: string;
  type: 'value' | 'state' | 'computation' | 'validation';
  relationship: 'requires' | 'conflicts' | 'enhances' | 'modifies';
  condition?: string;
  action?: string;
}

export interface PropertyCondition {
  id: string;
  description: string;
  condition: string;
  action: ConditionAction;
  priority: number;
}

export interface ConditionAction {
  type: 'setValue' | 'clearValue' | 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'validate' | 'transform';
  parameters: Record<string, any>;
}

export interface AIPropertyGeneration {
  supported: boolean;
  confidence: number;
  models: string[];
  prompts: AIPromptConfig[];
  validation: AIValidationConfig;
  fallback: AIFallbackConfig;
}

export interface AIPromptConfig {
  id: string;
  name: string;
  template: string;
  variables: string[];
  model: string;
  parameters: Record<string, any>;
}

export interface AIValidationConfig {
  enabled: boolean;
  rules: string[];
  threshold: number;
  humanReview: boolean;
}

export interface AIFallbackConfig {
  enabled: boolean;
  strategy: 'default' | 'previous' | 'manual' | 'skip';
  value?: any;
}

export interface PropertyMetadata {
  version: string;
  author: string;
  created: Date;
  updated: Date;
  tags: string[];
  category: string;
  popularity: number;
  usage: PropertyUsage;
  performance: PropertyPerformance;
}

export interface PropertyUsage {
  frequency: number;
  lastUsed: Date;
  contexts: string[];
  variations: PropertyVariation[];
}

export interface PropertyVariation {
  name: string;
  value: any;
  usage: number;
  context: string;
}

export interface PropertyPerformance {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  cacheability: number;
}

// Customization constraints
export interface CustomizationConstraint {
  id: string;
  name: string;
  description: string;
  type: ConstraintType;
  scope: ConstraintScope;
  condition: string;
  validation: ConstraintValidation;
  enforcement: ConstraintEnforcement;
  metadata: ConstraintMetadata;
}

export type ConstraintType =
  | 'value_range'
  | 'pattern_match'
  | 'dependency'
  | 'compatibility'
  | 'business_rule'
  | 'security'
  | 'performance'
  | 'accessibility'
  | 'brand_compliance'
  | 'technical_limit'
  | 'user_permission'
  | 'tenant_limit'
  | 'feature_flag'
  | 'custom';

export type ConstraintScope = 'property' | 'component' | 'page' | 'template' | 'global' | 'tenant' | 'user';

export interface ConstraintValidation {
  expression: string;
  parameters: Record<string, any>;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ConstraintEnforcement {
  level: 'block' | 'warn' | 'suggest' | 'log';
  bypass: BypassConfiguration;
  escalation: EscalationConfiguration;
}

export interface BypassConfiguration {
  allowed: boolean;
  roles: string[];
  permissions: string[];
  approval: ApprovalConfiguration;
  justification: JustificationConfiguration;
  audit: AuditConfiguration;
}

export interface ApprovalConfiguration {
  required: boolean;
  approvers: string[];
  timeout: number;
  escalation: string[];
}

export interface JustificationConfiguration {
  required: boolean;
  minLength: number;
  categories: string[];
  template?: string;
}

export interface AuditConfiguration {
  enabled: boolean;
  fields: string[];
  retention: number;
  notification: string[];
}

export interface EscalationConfiguration {
  enabled: boolean;
  levels: EscalationLevel[];
  finalAction: 'block' | 'allow' | 'defer';
}

export interface EscalationLevel {
  level: number;
  trigger: string;
  action: string;
  notification: string[];
  timeout: number;
}

export interface ConstraintMetadata {
  priority: number;
  tags: string[];
  category: string;
  owner: string;
  source: 'system' | 'tenant' | 'user' | 'imported';
  created: Date;
  updated: Date;
}

// Customization dependencies
export interface CustomizationDependency {
  id: string;
  type: DependencyType;
  target: string;
  relationship: DependencyRelationship;
  condition?: string;
  metadata: DependencyMetadata;
}

export type DependencyType = 'property' | 'component' | 'template' | 'asset' | 'service' | 'api' | 'data';
export type DependencyRelationship = 'requires' | 'conflicts' | 'enhances' | 'modifies' | 'triggers' | 'follows';

export interface DependencyMetadata {
  strength: 'weak' | 'strong' | 'critical';
  direction: 'uni' | 'bi';
  optional: boolean;
  description: string;
}

// AI Customization Support
export interface AICustomizationSupport {
  enabled: boolean;
  confidence: number;
  capabilities: AICapability[];
  models: AIModelConfiguration[];
  training: AITrainingConfiguration;
  inference: AIInferenceConfiguration;
  validation: AIValidationConfiguration;
  monitoring: AIMonitoringConfiguration;
}

export interface AICapability {
  name: string;
  type: AICapabilityType;
  confidence: number;
  availability: CapabilityAvailability;
  requirements: string[];
  limitations: string[];
}

export type AICapabilityType =
  | 'value_generation'
  | 'style_suggestion'
  | 'layout_optimization'
  | 'content_enhancement'
  | 'accessibility_improvement'
  | 'performance_optimization'
  | 'security_validation'
  | 'compatibility_checking'
  | 'user_preference_learning'
  | 'trend_analysis'
  | 'pattern_recognition'
  | 'anomaly_detection';

export interface CapabilityAvailability {
  regions: string[];
  languages: string[];
  frameworks: string[];
  complexity_levels: CustomizationComplexity[];
}

export interface AIModelConfiguration {
  id: string;
  name: string;
  type: string;
  version: string;
  provider: string;
  endpoint: string;
  authentication: AIAuthentication;
  parameters: AIParameters;
  limits: AILimits;
}

export interface AIAuthentication {
  type: 'api_key' | 'oauth' | 'jwt' | 'certificate';
  configuration: Record<string, any>;
  rotation: boolean;
  expiration: number;
}

export interface AIParameters {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  custom?: Record<string, any>;
}

export interface AILimits {
  requestsPerMinute: number;
  requestsPerDay: number;
  tokensPerRequest: number;
  timeout: number;
  retries: number;
}

export interface AITrainingConfiguration {
  enabled: boolean;
  datasets: string[];
  schedule: string;
  automation: number;
  validation: TrainingValidation;
}

export interface TrainingValidation {
  enabled: boolean;
  holdout: number;
  metrics: string[];
  threshold: number;
}

export interface AIInferenceConfiguration {
  caching: InferenceCaching;
  batching: InferenceBatching;
  fallback: InferenceFallback;
  optimization: InferenceOptimization;
}

export interface InferenceCaching {
  enabled: boolean;
  duration: number;
  strategy: 'lru' | 'lfu' | 'ttl' | 'adaptive';
  storage: 'memory' | 'redis' | 'database';
}

export interface InferenceBatching {
  enabled: boolean;
  maxSize: number;
  timeout: number;
  strategy: 'size' | 'time' | 'adaptive';
}

export interface InferenceFallback {
  enabled: boolean;
  strategy: 'default' | 'cached' | 'manual' | 'skip';
  timeout: number;
}

export interface InferenceOptimization {
  compression: boolean;
  quantization: boolean;
  pruning: boolean;
  distillation: boolean;
}

export interface AIValidationConfiguration {
  enabled: boolean;
  rules: AIValidationRule[];
  threshold: number;
  humanReview: boolean;
  feedback: FeedbackConfiguration;
}

export interface AIValidationRule {
  name: string;
  type: string;
  condition: string;
  severity: 'error' | 'warning' | 'info';
  action: 'block' | 'flag' | 'log';
}

export interface FeedbackConfiguration {
  enabled: boolean;
  collection: 'automatic' | 'manual' | 'hybrid';
  storage: string;
  analysis: FeedbackAnalysis;
}

export interface FeedbackAnalysis {
  enabled: boolean;
  frequency: string;
  metrics: string[];
  reporting: boolean;
}

export interface AIMonitoringConfiguration {
  enabled: boolean;
  metrics: AIMetric[];
  alerts: AIAlert[];
  logging: AILogging;
}

export interface AIMetric {
  name: string;
  type: 'performance' | 'accuracy' | 'usage' | 'cost';
  collection: string;
  aggregation: string;
  retention: number;
}

export interface AIAlert {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification: string[];
  action: string[];
}

export interface AILogging {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug';
  includeInputs: boolean;
  includeOutputs: boolean;
  retention: number;
}

// Automation Support
export interface AutomationSupport {
  enabled: boolean;
  level: AutomationLevel;
  triggers: AutomationTrigger[];
  workflows: AutomationWorkflow[];
  monitoring: AutomationMonitoring;
}

export type AutomationLevel = 'none' | 'assisted' | 'guided' | 'automated' | 'autonomous';

export interface AutomationTrigger {
  id: string;
  name: string;
  type: TriggerType;
  condition: string;
  action: string;
  parameters: Record<string, any>;
}

export type TriggerType = 'value_change' | 'condition_met' | 'time_based' | 'event_driven' | 'user_action' | 'ai_suggestion';

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  validation: WorkflowValidation;
  rollback: WorkflowRollback;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'validation' | 'notification';
  configuration: Record<string, any>;
  timeout: number;
  retries: number;
}

export interface WorkflowValidation {
  enabled: boolean;
  rules: string[];
  approval: boolean;
  testing: boolean;
}

export interface WorkflowRollback {
  enabled: boolean;
  conditions: string[];
  automatic: boolean;
  approval: boolean;
}

export interface AutomationMonitoring {
  enabled: boolean;
  metrics: string[];
  logging: boolean;
  alerting: boolean;
}

// Validation and Testing
export interface CustomizationValidation {
  enabled: boolean;
  realTime: boolean;
  rules: CustomizationValidationRule[];
  integration: ValidationIntegration;
}

export interface CustomizationValidationRule {
  id: string;
  name: string;
  type: string;
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  autoFix: boolean;
  documentation: string;
}

export interface ValidationIntegration {
  ide: boolean;
  cicd: boolean;
  runtime: boolean;
  testing: boolean;
}

export interface CustomizationTesting {
  enabled: boolean;
  types: TestType[];
  automation: TestAutomation;
  reporting: TestReporting;
}

export type TestType = 'unit' | 'integration' | 'visual' | 'accessibility' | 'performance' | 'security' | 'compatibility';

export interface TestAutomation {
  enabled: boolean;
  trigger: 'change' | 'deploy' | 'schedule' | 'manual';
  coverage: number;
  parallel: boolean;
}

export interface TestReporting {
  enabled: boolean;
  format: 'html' | 'json' | 'xml' | 'junit';
  storage: string;
  notification: boolean;
}

// Documentation and Examples
export interface CustomizationDocumentation {
  overview: string;
  usage: string;
  examples: string;
  bestPractices: string;
  troubleshooting: string;
  api: string;
  changelog: string;
  migration: string;
}

export interface CustomizationExample {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: CustomizationComplexity;
  useCase: string;
  before: ExampleValue;
  after: ExampleValue;
  code?: string;
  preview?: string;
  tutorial?: string;
  tags: string[];
  popularity: number;
}

export interface ExampleValue {
  value: any;
  screenshot?: string;
  description?: string;
  context?: Record<string, any>;
}

// Metadata
export interface CustomizationMetadata {
  version: string;
  schema: string;
  author: string;
  created: Date;
  updated: Date;
  tags: string[];
  category: string;
  popularity: PopularityMetrics;
  usage: UsageMetrics;
  performance: PerformanceMetrics;
  quality: QualityMetrics;
}

export interface PopularityMetrics {
  uses: number;
  likes: number;
  shares: number;
  rating: number;
  reviews: number;
  trend: 'rising' | 'stable' | 'falling';
}

export interface UsageMetrics {
  frequency: number;
  lastUsed: Date;
  contexts: UsageContext[];
  variations: UsageVariation[];
}

export interface UsageContext {
  templateId: string;
  clientId: string;
  frequency: number;
  value: any;
}

export interface UsageVariation {
  value: any;
  frequency: number;
  effectiveness: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  cacheability: number;
}

export interface QualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  usability: number;
  accessibility: number;
}

// Client-specific settings
export interface ClientCustomizationSettings {
  enabled: boolean;
  isolation: ClientIsolation;
  branding: ClientBranding;
  permissions: ClientPermissions;
  limits: ClientLimits;
  approval: ClientApproval;
}

export interface ClientIsolation {
  level: 'none' | 'basic' | 'complete';
  namespace: string;
  encryption: boolean;
  audit: boolean;
}

export interface ClientBranding {
  allowCustomBranding: boolean;
  brandingPoints: string[];
  restrictions: BrandingRestriction[];
  validation: BrandingValidation;
}

export interface BrandingRestriction {
  type: string;
  scope: string;
  condition: string;
  message: string;
}

export interface BrandingValidation {
  enabled: boolean;
  rules: string[];
  approval: boolean;
  preview: boolean;
}

export interface ClientPermissions {
  view: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  share: boolean;
  advanced: AdvancedPermissions;
}

export interface AdvancedPermissions {
  codeEdit: boolean;
  styleEdit: boolean;
  scriptEdit: boolean;
  dataEdit: boolean;
  integrationEdit: boolean;
}

export interface ClientLimits {
  maxCustomizations: number;
  maxComplexity: CustomizationComplexity;
  maxFileSize: number;
  maxAssets: number;
  rateLimits: RateLimit[];
}

export interface RateLimit {
  action: string;
  limit: number;
  window: number;
  penalty: string;
}

export interface ClientApproval {
  required: boolean;
  workflow: string;
  criteria: ApprovalCriteria[];
  escalation: ApprovalEscalation;
}

export interface ApprovalCriteria {
  condition: string;
  approver: string;
  timeout: number;
}

export interface ApprovalEscalation {
  enabled: boolean;
  levels: string[];
  timeout: number;
}

// Performance and Monitoring
export interface PerformanceSettings {
  monitoring: PerformanceMonitoring;
  optimization: PerformanceOptimization;
  caching: PerformanceCaching;
  limits: PerformanceLimits;
}

export interface PerformanceMonitoring {
  enabled: boolean;
  metrics: string[];
  sampling: number;
  alerting: boolean;
}

export interface PerformanceOptimization {
  enabled: boolean;
  techniques: string[];
  automatic: boolean;
  threshold: number;
}

export interface PerformanceCaching {
  enabled: boolean;
  strategy: string;
  duration: number;
  invalidation: string[];
}

export interface PerformanceLimits {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  complexity: number;
}

export interface MonitoringSettings {
  enabled: boolean;
  events: MonitoringEvent[];
  analytics: MonitoringAnalytics;
  alerting: MonitoringAlerting;
}

export interface MonitoringEvent {
  type: string;
  condition: string;
  data: string[];
  sampling: number;
}

export interface MonitoringAnalytics {
  enabled: boolean;
  metrics: string[];
  aggregation: string;
  retention: number;
}

export interface MonitoringAlerting {
  enabled: boolean;
  rules: AlertRule[];
  notification: string[];
  escalation: AlertingEscalation;
}

export interface AlertRule {
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  frequency: number;
}

export interface AlertingEscalation {
  enabled: boolean;
  levels: number;
  timeout: number;
  action: string;
}

/**
 * CustomizationPointManager
 * Main class for managing template customization points
 */
export class CustomizationPointManager {
  private points: Map<string, CustomizationPoint> = new Map();
  private categories: Map<string, string[]> = new Map();
  private dependencies: Map<string, Set<string>> = new Map();
  private cache: Map<string, any> = new Map();

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the customization point manager
   */
  private initialize(): void {
    // Load default customization points
    this.loadDefaultCustomizationPoints();

    // Build dependency graph
    this.buildDependencyGraph();

    // Initialize categories
    this.initializeCategories();
  }

  /**
   * Register a new customization point
   */
  registerCustomizationPoint(point: CustomizationPoint): void {
    // Validate the customization point
    this.validateCustomizationPoint(point);

    // Store the point
    this.points.set(point.id, point);

    // Update categories
    this.updateCategories(point);

    // Update dependencies
    this.updateDependencies(point);

    // Clear relevant cache
    this.clearCache(point.id);
  }

  /**
   * Get customization point by ID
   */
  getCustomizationPoint(id: string): CustomizationPoint | null {
    return this.points.get(id) || null;
  }

  /**
   * Get all customization points
   */
  getAllCustomizationPoints(): CustomizationPoint[] {
    return Array.from(this.points.values());
  }

  /**
   * Get customization points by type
   */
  getCustomizationPointsByType(type: CustomizationPointType): CustomizationPoint[] {
    return Array.from(this.points.values()).filter(point => point.type === type);
  }

  /**
   * Get customization points by scope
   */
  getCustomizationPointsByScope(scope: CustomizationScope): CustomizationPoint[] {
    return Array.from(this.points.values()).filter(point => point.scope === scope);
  }

  /**
   * Get customization points by complexity
   */
  getCustomizationPointsByComplexity(complexity: CustomizationComplexity): CustomizationPoint[] {
    return Array.from(this.points.values()).filter(point => point.complexity === complexity);
  }

  /**
   * Get customization points for template
   */
  getCustomizationPointsForTemplate(templateId: string): CustomizationPoint[] {
    return Array.from(this.points.values()).filter(
      point => point.location.templateId === templateId
    );
  }

  /**
   * Search customization points
   */
  searchCustomizationPoints(query: CustomizationQuery): CustomizationPoint[] {
    let results = Array.from(this.points.values());

    // Apply filters
    if (query.type) {
      results = results.filter(point => query.type!.includes(point.type));
    }

    if (query.scope) {
      results = results.filter(point => query.scope!.includes(point.scope));
    }

    if (query.complexity) {
      results = results.filter(point => query.complexity!.includes(point.complexity));
    }

    if (query.templateId) {
      results = results.filter(point => point.location.templateId === query.templateId);
    }

    if (query.searchTerm) {
      const term = query.searchTerm.toLowerCase();
      results = results.filter(point =>
        point.name.toLowerCase().includes(term) ||
        point.description.toLowerCase().includes(term) ||
        point.displayName.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    if (query.sortBy) {
      results.sort((a, b) => {
        const aValue = this.getPropertyValue(a, query.sortBy!);
        const bValue = this.getPropertyValue(b, query.sortBy!);

        if (query.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    // Apply pagination
    if (query.pagination) {
      const start = (query.pagination.page - 1) * query.pagination.limit;
      const end = start + query.pagination.limit;
      results = results.slice(start, end);
    }

    return results;
  }

  /**
   * Validate customization point
   */
  validateCustomizationPoint(point: CustomizationPoint): void {
    const schema = z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      displayName: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(['theme', 'layout', 'content', 'behavior', 'integration', 'configuration', 'styling', 'branding', 'functionality', 'workflow', 'component', 'data', 'api', 'routing']),
      scope: z.enum(['global', 'page', 'component', 'element', 'property', 'method', 'event']),
      impact: z.enum(['cosmetic', 'functional', 'structural', 'architectural', 'behavioral']),
      complexity: z.enum(['simple', 'moderate', 'complex', 'expert', 'enterprise']),
      priority: z.enum(['low', 'medium', 'high', 'critical', 'client-requested'])
    });

    const result = schema.safeParse(point);
    if (!result.success) {
      throw new Error(`Invalid customization point: ${result.error.message}`);
    }

    // Additional validation
    this.validateCustomizationPointStructure(point);
  }

  /**
   * Get dependencies for a customization point
   */
  getDependencies(pointId: string): string[] {
    const dependencies = this.dependencies.get(pointId);
    return dependencies ? Array.from(dependencies) : [];
  }

  /**
   * Get dependents for a customization point
   */
  getDependents(pointId: string): string[] {
    const dependents: string[] = [];

    for (const [id, deps] of this.dependencies) {
      if (deps.has(pointId)) {
        dependents.push(id);
      }
    }

    return dependents;
  }

  /**
   * Check if customization point can be modified
   */
  canModify(pointId: string, context: CustomizationContext): boolean {
    const point = this.getCustomizationPoint(pointId);
    if (!point) return false;

    // Check constraints
    for (const constraint of point.constraints) {
      if (!this.evaluateConstraint(constraint, context)) {
        return false;
      }
    }

    // Check dependencies
    const dependencies = this.getDependencies(pointId);
    for (const depId of dependencies) {
      const depPoint = this.getCustomizationPoint(depId);
      if (depPoint && !this.canModify(depId, context)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get AI suggestions for customization point
   */
  async getAISuggestions(pointId: string, context: CustomizationContext): Promise<AISuggestion[]> {
    const point = this.getCustomizationPoint(pointId);
    if (!point || !point.aiSupport.enabled) {
      return [];
    }

    // Implementation would call AI service
    // For now, return empty array
    return [];
  }

  /**
   * Export customization points
   */
  exportCustomizationPoints(pointIds?: string[]): CustomizationPointExport {
    const points = pointIds
      ? pointIds.map(id => this.getCustomizationPoint(id)).filter(Boolean) as CustomizationPoint[]
      : this.getAllCustomizationPoints();

    return {
      version: '1.0.0',
      exportDate: new Date(),
      points,
      dependencies: this.extractDependencies(points),
      metadata: {
        totalPoints: points.length,
        types: this.getTypeDistribution(points),
        complexities: this.getComplexityDistribution(points)
      }
    };
  }

  /**
   * Import customization points
   */
  importCustomizationPoints(exportData: CustomizationPointExport): void {
    // Validate export data
    this.validateExportData(exportData);

    // Import points
    for (const point of exportData.points) {
      this.registerCustomizationPoint(point);
    }

    // Rebuild dependencies
    this.buildDependencyGraph();
  }

  // Private helper methods

  private loadDefaultCustomizationPoints(): void {
    // Load common customization points for web applications
    const defaultPoints: Partial<CustomizationPoint>[] = [
      {
        id: 'theme-primary-color',
        name: 'Primary Color',
        displayName: 'Primary Brand Color',
        description: 'Main brand color used throughout the application',
        type: 'theme',
        scope: 'global',
        impact: 'cosmetic',
        complexity: 'simple',
        priority: 'high'
      },
      {
        id: 'layout-header-style',
        name: 'Header Style',
        displayName: 'Header Layout Style',
        description: 'Styling and layout configuration for the main header',
        type: 'layout',
        scope: 'global',
        impact: 'functional',
        complexity: 'moderate',
        priority: 'medium'
      },
      {
        id: 'content-home-hero',
        name: 'Home Hero Content',
        displayName: 'Homepage Hero Section',
        description: 'Content and styling for the homepage hero section',
        type: 'content',
        scope: 'page',
        impact: 'functional',
        complexity: 'moderate',
        priority: 'high'
      }
    ];

    // Convert to full customization points and register
    // Implementation would create complete CustomizationPoint objects
  }

  private buildDependencyGraph(): void {
    this.dependencies.clear();

    for (const point of this.points.values()) {
      const deps = new Set<string>();

      for (const dep of point.dependencies) {
        if (dep.type === 'property' && this.points.has(dep.target)) {
          deps.add(dep.target);
        }
      }

      this.dependencies.set(point.id, deps);
    }
  }

  private initializeCategories(): void {
    this.categories.clear();

    for (const point of this.points.values()) {
      const category = point.metadata.category;
      if (!this.categories.has(category)) {
        this.categories.set(category, []);
      }
      this.categories.get(category)!.push(point.id);
    }
  }

  private updateCategories(point: CustomizationPoint): void {
    const category = point.metadata.category;
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }

    const categoryPoints = this.categories.get(category)!;
    if (!categoryPoints.includes(point.id)) {
      categoryPoints.push(point.id);
    }
  }

  private updateDependencies(point: CustomizationPoint): void {
    const deps = new Set<string>();

    for (const dep of point.dependencies) {
      if (dep.type === 'property' && this.points.has(dep.target)) {
        deps.add(dep.target);
      }
    }

    this.dependencies.set(point.id, deps);
  }

  private clearCache(pointId: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(pointId)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  private validateCustomizationPointStructure(point: CustomizationPoint): void {
    // Validate location
    if (!point.location.templateId || !point.location.templatePath) {
      throw new Error('Customization point must have valid location');
    }

    // Validate properties
    if (point.properties.length === 0) {
      throw new Error('Customization point must have at least one property');
    }

    // Validate AI support configuration
    if (point.aiSupport.enabled && point.aiSupport.capabilities.length === 0) {
      throw new Error('AI-enabled customization point must have capabilities defined');
    }
  }

  private getPropertyValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  private evaluateConstraint(constraint: CustomizationConstraint, context: CustomizationContext): boolean {
    // Implementation would evaluate constraint condition
    // For now, return true
    return true;
  }

  private extractDependencies(points: CustomizationPoint[]): Record<string, string[]> {
    const dependencies: Record<string, string[]> = {};

    for (const point of points) {
      dependencies[point.id] = point.dependencies.map(dep => dep.target);
    }

    return dependencies;
  }

  private getTypeDistribution(points: CustomizationPoint[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const point of points) {
      distribution[point.type] = (distribution[point.type] || 0) + 1;
    }

    return distribution;
  }

  private getComplexityDistribution(points: CustomizationPoint[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const point of points) {
      distribution[point.complexity] = (distribution[point.complexity] || 0) + 1;
    }

    return distribution;
  }

  private validateExportData(exportData: CustomizationPointExport): void {
    if (!exportData.version || !exportData.points || !Array.isArray(exportData.points)) {
      throw new Error('Invalid export data format');
    }

    // Validate each point
    for (const point of exportData.points) {
      this.validateCustomizationPoint(point);
    }
  }
}

// Additional interfaces
export interface CustomizationQuery {
  type?: CustomizationPointType[];
  scope?: CustomizationScope[];
  complexity?: CustomizationComplexity[];
  templateId?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface AISuggestion {
  id: string;
  property: string;
  suggestedValue: any;
  confidence: number;
  reasoning: string;
  alternatives: AlternativeSuggestion[];
}

export interface AlternativeSuggestion {
  value: any;
  confidence: number;
  reasoning: string;
}

export interface CustomizationPointExport {
  version: string;
  exportDate: Date;
  points: CustomizationPoint[];
  dependencies: Record<string, string[]>;
  metadata: {
    totalPoints: number;
    types: Record<string, number>;
    complexities: Record<string, number>;
  };
}

// Global instance
let globalCustomizationPointManager: CustomizationPointManager | null = null;

/**
 * Get the global customization point manager instance
 */
export function getCustomizationPointManager(): CustomizationPointManager {
  if (!globalCustomizationPointManager) {
    globalCustomizationPointManager = new CustomizationPointManager();
  }
  return globalCustomizationPointManager;
}

/**
 * Create a new customization point manager instance
 */
export function createCustomizationPointManager(): CustomizationPointManager {
  return new CustomizationPointManager();
}