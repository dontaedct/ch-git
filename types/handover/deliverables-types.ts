/**
 * @fileoverview Handover Deliverables Type Definitions
 * @module types/handover/deliverables-types
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.1: Comprehensive type definitions for the client handover automation system.
 * Defines all interfaces, types, and schemas for deliverables generation and management.
 */

// Base deliverable types
export type DeliverableType = 
  | 'sop'
  | 'technical_documentation'
  | 'training_materials' 
  | 'workflow_artifacts'
  | 'module_configuration'
  | 'support_package'
  | 'admin_access'
  | 'walkthrough_video';

export type DeliverableFormat = 
  | 'pdf'
  | 'html'
  | 'markdown'
  | 'json'
  | 'yaml'
  | 'zip'
  | 'video'
  | 'interactive';

export type DeliverableStatus = 
  | 'pending'
  | 'generating'
  | 'validating'
  | 'completed'
  | 'failed'
  | 'expired';

// Core interfaces
export interface BaseDeliverable {
  id: string;
  type: DeliverableType;
  status: DeliverableStatus;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  clientId: string;
  metadata: DeliverableMetadata;
}

export interface DeliverableMetadata {
  title: string;
  description: string;
  tags: string[];
  size?: number; // bytes
  checksum?: string;
  customizations: Record<string, any>;
  qualityScore?: number;
  generationDuration?: number; // milliseconds
}

// Client configuration interfaces
export interface ClientConfiguration {
  id: string;
  name: string;
  domain: string;
  tier: ClientTier;
  contactInfo: ClientContactInfo;
  brandingConfig: ClientBrandingConfig;
  technicalConfig: ClientTechnicalConfig;
  businessConfig: ClientBusinessConfig;
  customizations: ClientCustomizations;
}

export type ClientTier = 'basic' | 'standard' | 'premium' | 'enterprise';

export interface ClientContactInfo {
  primaryContact: ContactPerson;
  technicalContact: ContactPerson;
  emergencyContact: ContactPerson;
  billingContact?: ContactPerson;
  supportContacts: ContactPerson[];
}

export interface ContactPerson {
  name: string;
  email: string;
  phone?: string;
  role: string;
  timezone?: string;
  preferredContactMethod: 'email' | 'phone' | 'slack' | 'teams';
}

export interface ClientBrandingConfig {
  companyName: string;
  logoUrl?: string;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  fonts: {
    primary?: string;
    secondary?: string;
  };
  assets: BrandingAsset[];
  guidelines?: BrandingGuidelines;
}

export interface BrandingAsset {
  id: string;
  type: 'logo' | 'icon' | 'background' | 'watermark' | 'template';
  url: string;
  description?: string;
  dimensions?: { width: number; height: number };
  format: string;
}

export interface BrandingGuidelines {
  logoUsage?: string;
  colorUsage?: string;
  typography?: string;
  spacing?: string;
  doNots?: string[];
}

export interface ClientTechnicalConfig {
  productionUrl: string;
  stagingUrl?: string;
  developmentUrl?: string;
  adminUrls: AdminUrlConfig;
  databaseConfig: DatabaseConfig;
  integrations: IntegrationConfig[];
  deploymentConfig: DeploymentConfig;
  monitoringConfig: MonitoringConfig;
}

export interface AdminUrlConfig {
  main: string;
  diagnostics: string;
  flags: string;
  users?: string;
  settings?: string;
}

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'supabase';
  host?: string;
  port?: number;
  name: string;
  ssl: boolean;
  backupStrategy: BackupStrategy;
}

export interface BackupStrategy {
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number; // days
  location: string;
  encryption: boolean;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'database' | 'saas' | 'custom';
  status: 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
  credentials?: CredentialReference;
}

export interface CredentialReference {
  id: string;
  type: 'api_key' | 'oauth' | 'basic_auth' | 'certificate';
  description: string;
  expiresAt?: Date;
}

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'aws' | 'azure' | 'gcp' | 'docker' | 'kubernetes';
  environment: 'production' | 'staging' | 'development';
  region?: string;
  scalingConfig?: ScalingConfig;
  cicdConfig?: CICDConfig;
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  targetCPU: number;
  targetMemory: number;
}

export interface CICDConfig {
  provider: 'github' | 'gitlab' | 'bitbucket' | 'azure_devops';
  repository: string;
  branch: string;
  triggers: string[];
}

export interface MonitoringConfig {
  healthCheckUrl: string;
  alertContacts: string[];
  uptimeMonitoring: boolean;
  performanceMonitoring: boolean;
  errorTracking: boolean;
  logRetention: number; // days
}

export interface ClientBusinessConfig {
  industry: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  targetAudience: string;
  businessHours: BusinessHours;
  timezone: string;
  supportLevel: SupportLevel;
  slaRequirements: SLARequirements;
}

export interface BusinessHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
  holidays: Holiday[];
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  timezone: string;
}

export interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD format
  recurring: boolean;
}

export type SupportLevel = 'basic' | 'standard' | 'premium' | 'enterprise' | 'vip';

export interface SLARequirements {
  uptime: number; // percentage
  responseTime: {
    critical: number; // hours
    high: number;     // hours
    medium: number;   // hours
    low: number;      // hours
  };
  resolutionTime: {
    critical: number; // hours
    high: number;     // hours
    medium: number;   // hours
    low: number;      // hours
  };
}

export interface ClientCustomizations {
  sopCustomizations: SOPCustomizations;
  documentationCustomizations: DocumentationCustomizations;
  trainingCustomizations: TrainingCustomizations;
  uiCustomizations: UICustomizations;
  workflowCustomizations: WorkflowCustomizations;
}

export interface SOPCustomizations {
  includeClientSpecificSections: boolean;
  customSections: CustomSection[];
  templateOverrides: Record<string, string>;
  contactOverrides: Record<string, ContactPerson>;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  position: 'before' | 'after' | 'replace';
  targetSection: string;
}

export interface DocumentationCustomizations {
  includeCustomModules: boolean;
  customAPIs: APIDocumentationConfig[];
  excludeSections: string[];
  additionalSections: CustomSection[];
}

export interface APIDocumentationConfig {
  name: string;
  baseUrl: string;
  endpoints: APIEndpointConfig[];
  authentication: AuthenticationConfig;
}

export interface APIEndpointConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: ParameterConfig[];
  responses: ResponseConfig[];
}

export interface ParameterConfig {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: any;
}

export interface ResponseConfig {
  statusCode: number;
  description: string;
  schema?: any;
  example?: any;
}

export interface AuthenticationConfig {
  type: 'none' | 'api_key' | 'bearer' | 'basic' | 'oauth2';
  description: string;
  location?: 'header' | 'query' | 'cookie';
  parameterName?: string;
}

export interface TrainingCustomizations {
  includeAdvancedTopics: boolean;
  customWorkflows: CustomWorkflow[];
  videoDuration: VideoDuration;
  interactivityLevel: 'basic' | 'intermediate' | 'advanced';
}

export interface CustomWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  estimatedDuration: number; // minutes
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  action: string;
  expected: string;
  screenshot?: string;
}

export type VideoLength = 'short' | 'medium' | 'long'; // 90s, 120s, 180s

export interface VideoCustomizations {
  duration: VideoLength;
  includeVoiceover: boolean;
  includeSubtitles: boolean;
  includeAnnotations: boolean;
  quality: 'standard' | 'high' | 'ultra';
  format: 'mp4' | 'webm' | 'mov';
}

export interface UICustomizations {
  theme: 'light' | 'dark' | 'auto';
  layout: 'compact' | 'comfortable' | 'spacious';
  features: FeatureToggle[];
  customCSS?: string;
}

export interface FeatureToggle {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
}

export interface WorkflowCustomizations {
  customTriggers: WorkflowTrigger[];
  customActions: WorkflowAction[];
  notifications: NotificationConfig[];
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  configuration: Record<string, any>;
}

export interface WorkflowAction {
  id: string;
  name: string;
  type: 'email' | 'webhook' | 'api_call' | 'database' | 'file_operation';
  configuration: Record<string, any>;
}

export interface NotificationConfig {
  id: string;
  type: 'email' | 'sms' | 'slack' | 'webhook';
  recipients: string[];
  template: string;
  triggers: string[];
}

// SOP specific types
export interface SOPDocument extends BaseDeliverable {
  type: 'sop';
  sections: SOPSection[];
  formats: SOPFormats;
  customizations: SOPCustomizations;
  approvalStatus: ApprovalStatus;
}

export interface SOPSection {
  id: string;
  title: string;
  content: string;
  subsections: SOPSubsection[];
  order: number;
  required: boolean;
  customized: boolean;
}

export interface SOPSubsection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: 'text' | 'checklist' | 'code' | 'table' | 'diagram';
}

export interface SOPFormats {
  pdf: PDFFormat;
  html: HTMLFormat;
  markdown: MarkdownFormat;
  interactive?: InteractiveFormat;
}

export interface PDFFormat {
  url: string;
  size: number;
  pageCount: number;
  generatedAt: Date;
  watermarked: boolean;
}

export interface HTMLFormat {
  url: string;
  size: number;
  generatedAt: Date;
  interactive: boolean;
}

export interface MarkdownFormat {
  content: string;
  size: number;
  generatedAt: Date;
}

export interface InteractiveFormat {
  url: string;
  features: string[];
  generatedAt: Date;
}

export type ApprovalStatus = 'draft' | 'review' | 'approved' | 'rejected';

// Technical documentation types
export interface TechnicalDocumentation extends BaseDeliverable {
  type: 'technical_documentation';
  documents: TechnicalDocument[];
  assets: DocumentationAsset[];
  searchIndex?: SearchIndex;
}

export interface TechnicalDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  format: DeliverableFormat;
  lastUpdated: Date;
  version: string;
  dependencies: string[];
}

export type DocumentType = 
  | 'architecture'
  | 'api_reference'
  | 'database_schema'
  | 'configuration'
  | 'integration'
  | 'troubleshooting'
  | 'deployment'
  | 'security'
  | 'performance';

export interface DocumentationAsset {
  id: string;
  type: AssetType;
  url: string;
  description: string;
  relatedDocuments: string[];
}

export type AssetType = 
  | 'diagram'
  | 'screenshot'
  | 'code_sample'
  | 'configuration_file'
  | 'template'
  | 'video'
  | 'interactive_demo';

export interface SearchIndex {
  version: string;
  lastUpdated: Date;
  entries: SearchEntry[];
}

export interface SearchEntry {
  id: string;
  title: string;
  content: string;
  type: string;
  url: string;
  keywords: string[];
}

// Training materials types
export interface TrainingMaterials extends BaseDeliverable {
  type: 'training_materials';
  modules: TrainingModule[];
  assessments: Assessment[];
  resources: TrainingResource[];
  completionCriteria: CompletionCriteria;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  type: ModuleType;
  content: ModuleContent;
  prerequisites: string[];
  learningObjectives: string[];
}

export type ModuleType = 
  | 'video'
  | 'interactive'
  | 'documentation'
  | 'hands_on'
  | 'assessment'
  | 'walkthrough';

export interface ModuleContent {
  format: DeliverableFormat;
  url?: string;
  embeddedContent?: string;
  interactiveElements?: InteractiveElement[];
}

export interface InteractiveElement {
  id: string;
  type: 'quiz' | 'exercise' | 'simulation' | 'walkthrough';
  content: any;
  required: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'practical' | 'project';
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // minutes
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'practical';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface TrainingResource {
  id: string;
  title: string;
  type: 'reference' | 'cheat_sheet' | 'template' | 'tool' | 'external_link';
  url: string;
  description: string;
  category: string;
}

export interface CompletionCriteria {
  requiredModules: string[];
  minimumScore?: number;
  timeLimit?: number; // days
  certificateAvailable: boolean;
}

// Video specific types
export interface VideoDeliverable extends BaseDeliverable {
  type: 'walkthrough_video';
  video: VideoAsset;
  transcript?: VideoTranscript;
  chapters: VideoChapter[];
  annotations: VideoAnnotation[];
}

export interface VideoAsset {
  id: string;
  url: string;
  duration: number; // seconds
  size: number; // bytes
  format: 'mp4' | 'webm' | 'mov';
  resolution: Resolution;
  quality: VideoQuality;
  thumbnailUrl?: string;
  subtitles?: SubtitleTrack[];
}

export interface Resolution {
  width: number;
  height: number;
}

export type VideoQuality = 'standard' | 'high' | 'ultra';

export interface SubtitleTrack {
  language: string;
  url: string;
  format: 'srt' | 'vtt' | 'ass';
}

export interface VideoTranscript {
  language: string;
  content: string;
  timestamps: TimestampEntry[];
}

export interface TimestampEntry {
  start: number; // seconds
  end: number;   // seconds
  text: string;
}

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  description?: string;
}

export interface VideoAnnotation {
  id: string;
  type: 'text' | 'highlight' | 'arrow' | 'box' | 'link';
  startTime: number; // seconds
  endTime: number;   // seconds
  position: Position;
  content: string;
  style?: AnnotationStyle;
}

export interface Position {
  x: number; // percentage
  y: number; // percentage
  width?: number;  // percentage
  height?: number; // percentage
}

export interface AnnotationStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  borderColor?: string;
  borderWidth?: number;
}

export interface VideoLength {
  target: number; // seconds
  minimum: number; // seconds
  maximum: number; // seconds
}

// Workflow artifacts types
export interface WorkflowArtifacts extends BaseDeliverable {
  type: 'workflow_artifacts';
  workflows: WorkflowDefinition[];
  integrations: IntegrationDefinition[];
  configurations: ConfigurationFile[];
  exports: ExportPackage[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'n8n' | 'temporal' | 'custom';
  definition: any; // Workflow-specific definition
  triggers: TriggerDefinition[];
  actions: ActionDefinition[];
  variables: VariableDefinition[];
  dependencies: string[];
}

export interface TriggerDefinition {
  id: string;
  type: string;
  configuration: Record<string, any>;
  description: string;
}

export interface ActionDefinition {
  id: string;
  type: string;
  configuration: Record<string, any>;
  description: string;
}

export interface VariableDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: any;
  description: string;
  required: boolean;
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  type: string;
  version: string;
  configuration: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  endpoints: EndpointDefinition[];
}

export interface EndpointDefinition {
  id: string;
  path: string;
  method: string;
  description: string;
  parameters: ParameterDefinition[];
  responses: ResponseDefinition[];
}

export interface ParameterDefinition {
  name: string;
  type: string;
  required: boolean;
  description: string;
  validation?: ValidationRule[];
}

export interface ResponseDefinition {
  statusCode: number;
  description: string;
  schema?: any;
}

export interface ValidationRule {
  type: 'required' | 'format' | 'range' | 'custom';
  value?: any;
  message: string;
}

export interface ConfigurationFile {
  id: string;
  name: string;
  type: 'environment' | 'database' | 'service' | 'deployment';
  format: 'json' | 'yaml' | 'env' | 'ini' | 'toml';
  content: string;
  encrypted: boolean;
  description: string;
}

export interface ExportPackage {
  id: string;
  name: string;
  format: 'zip' | 'tar' | 'json' | 'yaml';
  url: string;
  size: number;
  contents: string[];
  generatedAt: Date;
  expiresAt?: Date;
}

// Module configuration types
export interface ModuleConfiguration extends BaseDeliverable {
  type: 'module_configuration';
  registry: ModuleRegistry;
  configurations: ModuleConfig[];
  dependencies: DependencyMap;
  permissions: ModulePermission[];
}

export interface ModuleRegistry {
  id: string;
  version: string;
  modules: RegisteredModule[];
  lastUpdated: Date;
}

export interface RegisteredModule {
  id: string;
  name: string;
  version: string;
  type: 'core' | 'premium' | 'custom' | 'marketplace';
  status: 'active' | 'inactive' | 'disabled' | 'error';
  configuration: ModuleConfig;
  dependencies: ModuleDependency[];
  permissions: string[];
  metadata: ModuleMetadata;
}

export interface ModuleConfig {
  id: string;
  moduleId: string;
  settings: Record<string, any>;
  overrides: Record<string, any>;
  enabled: boolean;
  lastUpdated: Date;
  version: string;
}

export interface ModuleDependency {
  moduleId: string;
  version: string;
  required: boolean;
  type: 'hard' | 'soft';
}

export interface ModuleMetadata {
  author: string;
  description: string;
  license: string;
  homepage?: string;
  repository?: string;
  keywords: string[];
  category: string;
}

export interface DependencyMap {
  version: string;
  dependencies: DependencyNode[];
  conflicts: DependencyConflict[];
}

export interface DependencyNode {
  moduleId: string;
  version: string;
  dependencies: string[];
  dependents: string[];
}

export interface DependencyConflict {
  type: 'version' | 'circular' | 'missing';
  description: string;
  affectedModules: string[];
  resolution?: string;
}

export interface ModulePermission {
  moduleId: string;
  permissions: Permission[];
  scope: PermissionScope;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  level: 'read' | 'write' | 'admin' | 'owner';
  resource: string;
}

export type PermissionScope = 'global' | 'tenant' | 'user' | 'module';

// Support package types
export interface SupportPackage extends BaseDeliverable {
  type: 'support_package';
  contacts: SupportContact[];
  procedures: SupportProcedure[];
  documentation: SupportDocumentation[];
  tools: SupportTool[];
  escalation: EscalationMatrix;
  sla: ServiceLevelAgreement;
}

export interface SupportContact {
  id: string;
  type: 'primary' | 'technical' | 'emergency' | 'billing';
  contact: ContactPerson;
  availability: Availability;
  expertise: string[];
}

export interface Availability {
  timezone: string;
  schedule: WeeklySchedule;
  holidays: Holiday[];
  onCall: boolean;
}

export interface WeeklySchedule {
  monday: DailySchedule;
  tuesday: DailySchedule;
  wednesday: DailySchedule;
  thursday: DailySchedule;
  friday: DailySchedule;
  saturday?: DailySchedule;
  sunday?: DailySchedule;
}

export interface DailySchedule {
  start: string; // HH:MM
  end: string;   // HH:MM
  breaks?: TimeRange[];
}

export interface SupportProcedure {
  id: string;
  name: string;
  category: ProcedureCategory;
  description: string;
  steps: ProcedureStep[];
  priority: ProcedurePriority;
  estimatedTime: number; // minutes
}

export type ProcedureCategory = 
  | 'incident'
  | 'maintenance'
  | 'deployment'
  | 'backup'
  | 'security'
  | 'performance'
  | 'user_management';

export type ProcedurePriority = 'low' | 'medium' | 'high' | 'critical';

export interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  action: string;
  expected: string;
  troubleshooting?: TroubleshootingStep[];
}

export interface TroubleshootingStep {
  issue: string;
  solution: string;
  escalation?: boolean;
}

export interface SupportDocumentation {
  id: string;
  title: string;
  type: SupportDocType;
  content: string;
  url?: string;
  lastUpdated: Date;
  version: string;
}

export type SupportDocType = 
  | 'runbook'
  | 'troubleshooting'
  | 'faq'
  | 'knowledge_base'
  | 'incident_guide'
  | 'maintenance_guide';

export interface SupportTool {
  id: string;
  name: string;
  type: SupportToolType;
  description: string;
  url: string;
  credentials?: CredentialReference;
  configuration?: Record<string, any>;
}

export type SupportToolType = 
  | 'monitoring'
  | 'logging'
  | 'deployment'
  | 'database'
  | 'communication'
  | 'ticketing'
  | 'documentation';

export interface EscalationMatrix {
  levels: EscalationLevel[];
  triggers: EscalationTrigger[];
  notifications: EscalationNotification[];
}

export interface EscalationLevel {
  level: number;
  name: string;
  contacts: string[];
  timeframe: number; // minutes
  authority: string[];
}

export interface EscalationTrigger {
  condition: string;
  targetLevel: number;
  automatic: boolean;
}

export interface EscalationNotification {
  level: number;
  method: 'email' | 'sms' | 'call' | 'slack' | 'teams';
  recipients: string[];
  template: string;
}

export interface ServiceLevelAgreement {
  version: string;
  effectiveDate: Date;
  expirationDate?: Date;
  uptime: SLAMetric;
  responseTime: SLAResponseTime;
  resolutionTime: SLAResolutionTime;
  exclusions: SLAExclusion[];
  penalties: SLAPenalty[];
}

export interface SLAMetric {
  target: number; // percentage
  measurement: 'monthly' | 'quarterly' | 'yearly';
  calculation: string;
}

export interface SLAResponseTime {
  critical: number;  // hours
  high: number;      // hours
  medium: number;    // hours
  low: number;       // hours
}

export interface SLAResolutionTime {
  critical: number;  // hours
  high: number;      // hours
  medium: number;    // hours
  low: number;       // hours
}

export interface SLAExclusion {
  type: string;
  description: string;
  conditions: string[];
}

export interface SLAPenalty {
  condition: string;
  penalty: string;
  calculation: string;
}

// Quality and validation types
export interface QualityMetrics {
  overallScore: number;
  componentScores: ComponentScore[];
  issues: QualityIssue[];
  recommendations: QualityRecommendation[];
  validatedAt: Date;
  validator: string;
}

export interface ComponentScore {
  component: string;
  score: number;
  weight: number;
  factors: QualityFactor[];
}

export interface QualityFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface QualityIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  component: string;
  description: string;
  impact: string;
  recommendation: string;
  autoFixable: boolean;
}

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IssueCategory = 
  | 'completeness'
  | 'accuracy'
  | 'formatting'
  | 'consistency'
  | 'accessibility'
  | 'security'
  | 'performance';

export interface QualityRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  description: string;
  implementation: string;
  estimatedEffort: number; // hours
  expectedImprovement: number; // percentage points
}

// Delivery and packaging types
export interface DeliveryPackage {
  id: string;
  clientId: string;
  deliverables: BaseDeliverable[];
  manifest: DeliveryManifest;
  security: SecurityConfig;
  delivery: DeliveryConfig;
  tracking: DeliveryTracking;
}

export interface DeliveryManifest {
  version: string;
  generatedAt: Date;
  clientName: string;
  projectName: string;
  totalFiles: number;
  totalSize: number;
  checksum: string;
  contents: ManifestEntry[];
}

export interface ManifestEntry {
  path: string;
  type: DeliverableType;
  size: number;
  checksum: string;
  description: string;
}

export interface SecurityConfig {
  encryption: EncryptionConfig;
  access: AccessConfig;
  retention: RetentionConfig;
}

export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  encrypted: boolean;
  keyManagement: 'manual' | 'automatic';
}

export interface AccessConfig {
  method: 'portal' | 'email' | 'download' | 'api';
  authentication: boolean;
  authorization: boolean;
  ipRestrictions?: string[];
  timeRestrictions?: TimeRestriction[];
}

export interface TimeRestriction {
  start: Date;
  end: Date;
  timezone: string;
}

export interface RetentionConfig {
  duration: number; // days
  autoDelete: boolean;
  archiving: boolean;
  backupLocation?: string;
}

export interface DeliveryConfig {
  method: DeliveryMethod;
  priority: 'standard' | 'expedited' | 'emergency';
  notifications: DeliveryNotification[];
  confirmationRequired: boolean;
}

export type DeliveryMethod = 
  | 'client_portal'
  | 'secure_email'
  | 'secure_download'
  | 'api_endpoint'
  | 'physical_media';

export interface DeliveryNotification {
  type: 'email' | 'sms' | 'webhook' | 'api_callback';
  recipients: string[];
  template: string;
  timing: 'immediate' | 'scheduled' | 'on_download';
}

export interface DeliveryTracking {
  status: DeliveryStatus;
  timeline: DeliveryEvent[];
  downloads: DownloadEvent[];
  expires: Date;
}

export type DeliveryStatus = 
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'downloaded'
  | 'expired'
  | 'failed';

export interface DeliveryEvent {
  timestamp: Date;
  event: string;
  details: string;
  user?: string;
}

export interface DownloadEvent {
  timestamp: Date;
  user: string;
  ip: string;
  userAgent: string;
  files: string[];
}

// System analysis types
export interface SystemAnalysis {
  version: string;
  analyzedAt: Date;
  analyzer: string;
  scope: AnalysisScope;
  results: AnalysisResults;
}

export interface AnalysisScope {
  includeCode: boolean;
  includeDatabase: boolean;
  includeIntegrations: boolean;
  includeModules: boolean;
  includeWorkflows: boolean;
  includePerformance: boolean;
  includeSecurity: boolean;
}

export interface AnalysisResults {
  codebase: CodebaseAnalysis;
  database: DatabaseAnalysis;
  integrations: IntegrationAnalysis[];
  modules: ModuleAnalysis[];
  workflows: WorkflowAnalysis[];
  performance: PerformanceAnalysis;
  security: SecurityAnalysis;
}

export interface CodebaseAnalysis {
  language: string;
  framework: string;
  version: string;
  totalLines: number;
  totalFiles: number;
  structure: FileStructure;
  dependencies: DependencyAnalysis;
  complexity: ComplexityMetrics;
}

export interface FileStructure {
  directories: DirectoryInfo[];
  files: FileInfo[];
}

export interface DirectoryInfo {
  path: string;
  fileCount: number;
  subdirectories: number;
  purpose: string;
}

export interface FileInfo {
  path: string;
  type: string;
  size: number;
  lines: number;
  purpose: string;
}

export interface DependencyAnalysis {
  total: number;
  production: number;
  development: number;
  outdated: number;
  vulnerable: number;
  packages: PackageInfo[];
}

export interface PackageInfo {
  name: string;
  version: string;
  type: 'production' | 'development';
  purpose: string;
  outdated: boolean;
  vulnerable: boolean;
}

export interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  maintainability: number;
  technical_debt: number;
}

export interface DatabaseAnalysis {
  type: string;
  version: string;
  size: number;
  tables: TableInfo[];
  relationships: RelationshipInfo[];
  indexes: IndexInfo[];
  performance: DatabasePerformance;
}

export interface TableInfo {
  name: string;
  rows: number;
  size: number;
  columns: ColumnInfo[];
  purpose: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  unique: boolean;
  indexed: boolean;
}

export interface RelationshipInfo {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  tables: string[];
  columns: string[];
}

export interface IndexInfo {
  name: string;
  table: string;
  columns: string[];
  type: string;
  size: number;
}

export interface DatabasePerformance {
  querySpeed: number;
  connectionCount: number;
  cacheHitRatio: number;
  slowQueries: number;
}

export interface IntegrationAnalysis {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  health: IntegrationHealth;
  usage: IntegrationUsage;
}

export interface IntegrationHealth {
  uptime: number;
  errorRate: number;
  responseTime: number;
  lastCheck: Date;
}

export interface IntegrationUsage {
  requestCount: number;
  dataVolume: number;
  frequency: string;
  peakTimes: string[];
}

export interface ModuleAnalysis {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
  usage: ModuleUsage;
  performance: ModulePerformance;
}

export interface ModuleUsage {
  activeUsers: number;
  requestCount: number;
  featureUsage: FeatureUsage[];
}

export interface FeatureUsage {
  feature: string;
  usageCount: number;
  activeUsers: number;
}

export interface ModulePerformance {
  loadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
}

export interface WorkflowAnalysis {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  execution: WorkflowExecution;
  performance: WorkflowPerformance;
}

export interface WorkflowExecution {
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  lastRun: Date;
}

export interface WorkflowPerformance {
  throughput: number;
  latency: number;
  errorRate: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
}

export interface PerformanceAnalysis {
  overall: PerformanceScore;
  frontend: FrontendPerformance;
  backend: BackendPerformance;
  database: DatabasePerformance;
}

export interface PerformanceScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: PerformanceFactor[];
}

export interface PerformanceFactor {
  name: string;
  score: number;
  weight: number;
  details: string;
}

export interface FrontendPerformance {
  lighthouse: LighthouseScore;
  coreWebVitals: CoreWebVitals;
  bundleSize: BundleAnalysis;
}

export interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface BundleAnalysis {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  chunks: ChunkInfo[];
}

export interface ChunkInfo {
  name: string;
  size: number;
  type: string;
  optimized: boolean;
}

export interface BackendPerformance {
  responseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  resourceUtilization: ResourceUsage;
}

export interface SecurityAnalysis {
  score: number;
  vulnerabilities: Vulnerability[];
  compliance: ComplianceCheck[];
  recommendations: SecurityRecommendation[];
}

export interface Vulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  component: string;
  cve?: string;
  solution: string;
}

export interface ComplianceCheck {
  standard: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  requirements: RequirementCheck[];
}

export interface RequirementCheck {
  id: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

export interface SecurityRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  implementation: string;
  effort: number; // hours
}

// Export utility types
export type DeliverableTypeMap = {
  [K in DeliverableType]: K extends 'sop' ? SOPDocument
    : K extends 'technical_documentation' ? TechnicalDocumentation
    : K extends 'training_materials' ? TrainingMaterials
    : K extends 'walkthrough_video' ? VideoDeliverable
    : K extends 'workflow_artifacts' ? WorkflowArtifacts
    : K extends 'module_configuration' ? ModuleConfiguration
    : K extends 'support_package' ? SupportPackage
    : BaseDeliverable;
};

export type AllDeliverables = DeliverableTypeMap[DeliverableType];

// Validation schemas (using zod)
export const ClientConfigurationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  domain: z.string().url(),
  tier: z.enum(['basic', 'standard', 'premium', 'enterprise']),
  contactInfo: z.object({
    primaryContact: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      role: z.string().min(1),
      timezone: z.string().optional(),
      preferredContactMethod: z.enum(['email', 'phone', 'slack', 'teams'])
    }),
    technicalContact: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      role: z.string().min(1),
      timezone: z.string().optional(),
      preferredContactMethod: z.enum(['email', 'phone', 'slack', 'teams'])
    }),
    emergencyContact: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      role: z.string().min(1),
      timezone: z.string().optional(),
      preferredContactMethod: z.enum(['email', 'phone', 'slack', 'teams'])
    })
  })
});

export const SystemAnalysisSchema = z.object({
  version: z.string().min(1),
  analyzedAt: z.date(),
  analyzer: z.string().min(1),
  scope: z.object({
    includeCode: z.boolean(),
    includeDatabase: z.boolean(),
    includeIntegrations: z.boolean(),
    includeModules: z.boolean(),
    includeWorkflows: z.boolean(),
    includePerformance: z.boolean(),
    includeSecurity: z.boolean()
  }),
  results: z.object({
    codebase: z.any(),
    database: z.any(),
    integrations: z.array(z.any()),
    modules: z.array(z.any()),
    workflows: z.array(z.any()),
    performance: z.any(),
    security: z.any()
  })
});
