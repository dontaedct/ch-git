/**
 * @fileoverview Template Configuration Types - HT-033.1.1
 * @module types/templates/template-config
 * @author Hero Task System
 * @version 1.0.0
 *
 * Comprehensive type definitions for template configuration,
 * AI-ready structures, and client customization support.
 */

// Core Template Types
export type TemplateId = string;
export type TemplateVersion = string;
export type ClientId = string;
export type UserId = string;

export type TemplateType =
  | 'page'
  | 'component'
  | 'layout'
  | 'micro-app'
  | 'form'
  | 'document'
  | 'email'
  | 'workflow'
  | 'api'
  | 'config'
  | 'dashboard'
  | 'landing'
  | 'portfolio'
  | 'blog'
  | 'ecommerce'
  | 'admin'
  | 'cms'
  | 'auth'
  | 'utility'
  | 'integration';

export type TemplateCategory =
  | 'business'
  | 'ecommerce'
  | 'marketing'
  | 'dashboard'
  | 'auth'
  | 'cms'
  | 'blog'
  | 'portfolio'
  | 'landing'
  | 'admin'
  | 'utility'
  | 'integration'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'real-estate'
  | 'travel'
  | 'food'
  | 'fashion'
  | 'technology'
  | 'consulting'
  | 'nonprofit'
  | 'government';

export type TemplateStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'deprecated'
  | 'archived'
  | 'deleted';

export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'expert';
export type MaturityLevel = 'experimental' | 'beta' | 'stable' | 'mature' | 'legacy';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Base Template Configuration
export interface BaseTemplateConfig {
  id: TemplateId;
  name: string;
  displayName: string;
  description: string;
  version: TemplateVersion;
  type: TemplateType;
  category: TemplateCategory;
  status: TemplateStatus;
  tags: string[];
  keywords: string[];
  created: Date;
  updated: Date;
  author: UserInfo;
  maintainers: UserInfo[];
}

export interface UserInfo {
  id: UserId;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Template Metadata
export interface TemplateMetadata {
  title: string;
  description: string;
  longDescription?: string;
  summary: string;
  license: LicenseInfo;
  documentation: DocumentationConfig;
  media: MediaConfig;
  industry: string[];
  useCase: string[];
  targetAudience: string[];
  businessValue: BusinessValueConfig;
  technicalSpecs: TechnicalSpecsConfig;
  quality: QualityMetrics;
  popularity: PopularityMetrics;
  usage: UsageMetrics;
  seo: SEOConfig;
}

export interface LicenseInfo {
  type: string;
  name: string;
  url?: string;
  text?: string;
  commercial: boolean;
  redistribution: boolean;
  modification: boolean;
  attribution: boolean;
}

export interface DocumentationConfig {
  readme: string;
  changelog: string;
  installation: string;
  configuration: string;
  usage: string;
  examples: ExampleConfig[];
  tutorials: TutorialConfig[];
  apiDocs: string;
  troubleshooting: string;
  faq: FAQConfig[];
  support: SupportConfig;
}

export interface ExampleConfig {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  preview?: string;
  live?: string;
  difficulty: ComplexityLevel;
  tags: string[];
  duration: number; // in minutes
}

export interface TutorialConfig {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  duration: number; // in minutes
  difficulty: ComplexityLevel;
  prerequisites: string[];
  learning_outcomes: string[];
  tags: string[];
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: string;
  code?: string;
  image?: string;
  video?: string;
  interactive?: boolean;
  validation?: StepValidation;
}

export interface StepValidation {
  type: 'code' | 'input' | 'multiple_choice' | 'output';
  criteria: string;
  feedback: {
    success: string;
    failure: string;
    hint: string;
  };
}

export interface FAQConfig {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  priority: number;
}

export interface SupportConfig {
  channels: SupportChannel[];
  hours: string;
  response_time: string;
  languages: string[];
}

export interface SupportChannel {
  type: 'email' | 'chat' | 'forum' | 'ticket' | 'phone';
  contact: string;
  availability: string;
  primary: boolean;
}

export interface MediaConfig {
  logo?: string;
  icon?: string;
  banner?: string;
  screenshots: string[];
  videos: VideoConfig[];
  gallery: GalleryItem[];
  preview: PreviewConfig;
}

export interface VideoConfig {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  type: 'overview' | 'tutorial' | 'demo' | 'walkthrough';
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video' | 'interactive';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  tags: string[];
}

export interface PreviewConfig {
  enabled: boolean;
  url?: string;
  embed?: string;
  iframe?: boolean;
  interactive: boolean;
  responsive: boolean;
  devices: DevicePreview[];
}

export interface DevicePreview {
  name: string;
  width: number;
  height: number;
  scale: number;
  label: string;
}

export interface BusinessValueConfig {
  problem: string;
  solution: string;
  benefits: string[];
  roi: ROIMetrics;
  case_studies: CaseStudy[];
  testimonials: Testimonial[];
}

export interface ROIMetrics {
  time_savings: number; // hours
  cost_savings: number; // dollars
  revenue_increase: number; // percentage
  efficiency_gain: number; // percentage
  payback_period: number; // months
}

export interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string;
  metrics: Record<string, number>;
  testimonial?: string;
  url?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  date: Date;
  verified: boolean;
  featured: boolean;
}

export interface TechnicalSpecsConfig {
  framework: FrameworkConfig;
  dependencies: DependencyConfig[];
  requirements: RequirementsConfig;
  compatibility: CompatibilityConfig;
  performance: PerformanceSpecs;
  security: SecuritySpecs;
  accessibility: AccessibilitySpecs;
}

export interface FrameworkConfig {
  name: string;
  version: string;
  language: string;
  runtime: string;
  build_tools: string[];
  testing: string[];
  linting: string[];
}

export interface DependencyConfig {
  name: string;
  version: string;
  type: 'runtime' | 'development' | 'peer' | 'optional' | 'bundled';
  source: 'npm' | 'yarn' | 'cdn' | 'local' | 'git';
  purpose: string;
  license: string;
  size: number;
  tree_shakeable: boolean;
  alternatives: DependencyAlternative[];
}

export interface DependencyAlternative {
  name: string;
  version: string;
  pros: string[];
  cons: string[];
  migration_effort: ComplexityLevel;
}

export interface RequirementsConfig {
  node_version: string;
  npm_version?: string;
  memory: number; // MB
  disk_space: number; // MB
  bandwidth: number; // Mbps
  browser_support: BrowserSupport[];
  server_requirements?: ServerRequirements;
}

export interface BrowserSupport {
  name: string;
  min_version: string;
  support_level: 'full' | 'partial' | 'none';
  notes?: string;
}

export interface ServerRequirements {
  cpu: string;
  memory: string;
  storage: string;
  network: string;
  os: string[];
}

export interface CompatibilityConfig {
  frameworks: FrameworkCompatibility[];
  platforms: PlatformCompatibility[];
  versions: VersionCompatibility;
  integrations: IntegrationCompatibility[];
}

export interface FrameworkCompatibility {
  name: string;
  versions: string[];
  compatibility: 'full' | 'partial' | 'none';
  notes?: string;
  adapter?: string;
}

export interface PlatformCompatibility {
  platform: 'web' | 'mobile' | 'desktop' | 'server' | 'edge';
  support: 'native' | 'adapter' | 'none';
  notes?: string;
}

export interface VersionCompatibility {
  backward: string[];
  forward: string[];
  breaking_changes: BreakingChange[];
  migration_guides: MigrationGuide[];
}

export interface BreakingChange {
  version: string;
  description: string;
  impact: SeverityLevel;
  mitigation: string;
  automated_fix: boolean;
}

export interface MigrationGuide {
  from_version: string;
  to_version: string;
  steps: MigrationStep[];
  automated: boolean;
  estimated_time: number; // hours
}

export interface MigrationStep {
  id: string;
  title: string;
  description: string;
  type: 'manual' | 'automated' | 'verification';
  command?: string;
  validation: string;
  rollback?: string;
}

export interface IntegrationCompatibility {
  service: string;
  type: 'api' | 'webhook' | 'plugin' | 'widget' | 'sdk';
  versions: string[];
  authentication: string[];
  documentation: string;
}

export interface PerformanceSpecs {
  metrics: PerformanceMetric[];
  benchmarks: BenchmarkResult[];
  optimization: OptimizationConfig;
  monitoring: MonitoringConfig;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  target: number;
  threshold: number;
  measurement: string;
}

export interface BenchmarkResult {
  scenario: string;
  environment: string;
  metrics: Record<string, number>;
  date: Date;
  version: string;
}

export interface OptimizationConfig {
  techniques: OptimizationTechnique[];
  build: BuildOptimization;
  runtime: RuntimeOptimization;
  caching: CachingOptimization;
}

export interface OptimizationTechnique {
  name: string;
  type: 'build' | 'runtime' | 'caching' | 'network';
  enabled: boolean;
  impact: number; // percentage improvement
  cost: ComplexityLevel;
  configuration: Record<string, any>;
}

export interface BuildOptimization {
  minification: boolean;
  tree_shaking: boolean;
  code_splitting: boolean;
  bundle_analysis: boolean;
  dead_code_elimination: boolean;
  compression: CompressionConfig;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'brotli' | 'deflate';
  level: number;
  threshold: number; // bytes
}

export interface RuntimeOptimization {
  lazy_loading: boolean;
  virtual_scrolling: boolean;
  memoization: boolean;
  debouncing: boolean;
  throttling: boolean;
  worker_threads: boolean;
}

export interface CachingOptimization {
  browser_cache: boolean;
  service_worker: boolean;
  cdn: boolean;
  memory_cache: boolean;
  disk_cache: boolean;
  cache_strategies: CacheStrategy[];
}

export interface CacheStrategy {
  name: string;
  type: 'stale-while-revalidate' | 'cache-first' | 'network-first' | 'network-only' | 'cache-only';
  resources: string[];
  duration: number; // seconds
  conditions: string[];
}

export interface MonitoringConfig {
  real_user_monitoring: boolean;
  synthetic_monitoring: boolean;
  core_web_vitals: boolean;
  custom_metrics: CustomMetric[];
  alerts: AlertConfig[];
}

export interface CustomMetric {
  name: string;
  description: string;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  collection: string;
  aggregation: string;
}

export interface AlertConfig {
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: SeverityLevel;
  notification: NotificationConfig[];
}

export interface NotificationConfig {
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'pagerduty';
  target: string;
  template: string;
  rate_limit: number;
}

export interface SecuritySpecs {
  authentication: AuthenticationSpec[];
  authorization: AuthorizationSpec;
  encryption: EncryptionSpec;
  compliance: ComplianceSpec[];
  vulnerabilities: VulnerabilitySpec;
  best_practices: SecurityBestPractice[];
}

export interface AuthenticationSpec {
  method: 'oauth' | 'jwt' | 'session' | 'api_key' | 'certificate' | 'biometric';
  provider?: string;
  configuration: Record<string, any>;
  required: boolean;
  multi_factor: boolean;
}

export interface AuthorizationSpec {
  model: 'rbac' | 'abac' | 'dac' | 'mac' | 'acl';
  granularity: 'resource' | 'action' | 'attribute' | 'role';
  policies: PolicySpec[];
  inheritance: boolean;
  delegation: boolean;
}

export interface PolicySpec {
  name: string;
  description: string;
  rules: PolicyRule[];
  priority: number;
  active: boolean;
}

export interface PolicyRule {
  subject: string;
  action: string;
  resource: string;
  condition?: string;
  effect: 'allow' | 'deny';
}

export interface EncryptionSpec {
  at_rest: EncryptionConfig;
  in_transit: EncryptionConfig;
  in_memory: EncryptionConfig;
  key_management: KeyManagementSpec;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  key_size: number;
  mode: string;
  padding?: string;
}

export interface KeyManagementSpec {
  provider: 'aws_kms' | 'azure_key_vault' | 'gcp_kms' | 'hashicorp_vault' | 'local';
  rotation: boolean;
  rotation_period: number; // days
  backup: boolean;
  versioning: boolean;
}

export interface ComplianceSpec {
  standard: 'gdpr' | 'ccpa' | 'hipaa' | 'pci_dss' | 'sox' | 'iso27001' | 'fips140' | 'common_criteria';
  version: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'in_progress';
  requirements: ComplianceRequirement[];
  audit: AuditConfig;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  category: string;
  priority: PriorityLevel;
  status: 'implemented' | 'partial' | 'not_implemented' | 'not_applicable';
  evidence: string[];
  controls: ControlConfig[];
}

export interface ControlConfig {
  id: string;
  name: string;
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  automated: boolean;
  effectiveness: number; // percentage
  testing: TestingConfig;
}

export interface TestingConfig {
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  method: 'automated' | 'manual' | 'hybrid';
  coverage: number; // percentage
  last_test: Date;
  next_test: Date;
}

export interface AuditConfig {
  frequency: 'quarterly' | 'annually' | 'on_demand';
  scope: string[];
  auditor: 'internal' | 'external' | 'third_party';
  methodology: string;
  reporting: ReportingConfig;
}

export interface ReportingConfig {
  format: 'pdf' | 'html' | 'json' | 'csv';
  template: string;
  distribution: DistributionConfig[];
  retention: number; // years
}

export interface DistributionConfig {
  recipient: string;
  method: 'email' | 'portal' | 'api' | 'file_share';
  schedule: string;
  format: string;
}

export interface VulnerabilitySpec {
  scanning: ScanningConfig;
  assessment: AssessmentConfig;
  remediation: RemediationConfig;
  disclosure: DisclosureConfig;
}

export interface ScanningConfig {
  automated: boolean;
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly';
  tools: ScanningTool[];
  scope: string[];
  reporting: boolean;
}

export interface ScanningTool {
  name: string;
  type: 'sast' | 'dast' | 'iast' | 'sca' | 'secrets' | 'infrastructure';
  version: string;
  configuration: Record<string, any>;
  integration: string;
}

export interface AssessmentConfig {
  methodology: 'owasp' | 'nist' | 'sans' | 'custom';
  frequency: 'quarterly' | 'annually' | 'on_demand';
  scope: string[];
  assessor: 'internal' | 'external' | 'red_team';
}

export interface RemediationConfig {
  sla: SLAConfig[];
  workflow: WorkflowConfig;
  tracking: TrackingConfig;
  verification: VerificationConfig;
}

export interface SLAConfig {
  severity: SeverityLevel;
  response_time: number; // hours
  resolution_time: number; // hours
  escalation: EscalationConfig[];
}

export interface EscalationConfig {
  level: number;
  trigger: string;
  action: string;
  notification: string[];
}

export interface WorkflowConfig {
  stages: WorkflowStage[];
  automation: number; // percentage
  approval_required: boolean;
  documentation_required: boolean;
}

export interface WorkflowStage {
  name: string;
  description: string;
  required: boolean;
  automated: boolean;
  duration: number; // hours
  dependencies: string[];
}

export interface TrackingConfig {
  system: string;
  fields: TrackingField[];
  reporting: boolean;
  metrics: TrackingMetric[];
}

export interface TrackingField {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'enum';
  required: boolean;
  validation: string;
}

export interface TrackingMetric {
  name: string;
  calculation: string;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface VerificationConfig {
  required: boolean;
  method: 'automated' | 'manual' | 'hybrid';
  criteria: string[];
  documentation: boolean;
  approval: boolean;
}

export interface DisclosureConfig {
  policy: 'full' | 'coordinated' | 'responsible' | 'none';
  timeline: DisclosureTimeline;
  contacts: ContactConfig[];
  legal: LegalConfig;
}

export interface DisclosureTimeline {
  initial_response: number; // days
  investigation: number; // days
  fix_development: number; // days
  testing: number; // days
  deployment: number; // days
  public_disclosure: number; // days
}

export interface ContactConfig {
  type: 'security' | 'technical' | 'legal' | 'management';
  email: string;
  pgp_key?: string;
  priority: PriorityLevel;
}

export interface LegalConfig {
  terms: string;
  liability: string;
  jurisdiction: string;
  dispute_resolution: string;
}

export interface SecurityBestPractice {
  category: 'coding' | 'deployment' | 'configuration' | 'monitoring' | 'incident_response';
  practice: string;
  description: string;
  implementation: string;
  validation: string;
  automation: boolean;
}

export interface AccessibilitySpecs {
  level: 'A' | 'AA' | 'AAA';
  guidelines: 'WCAG2.1' | 'WCAG2.2' | 'Section508' | 'EN301549';
  features: AccessibilityFeature[];
  testing: AccessibilityTesting;
  tools: AccessibilityTool[];
  compliance: AccessibilityCompliance;
}

export interface AccessibilityFeature {
  name: string;
  description: string;
  guideline: string;
  level: 'A' | 'AA' | 'AAA';
  implemented: boolean;
  testing: boolean;
  automation: boolean;
}

export interface AccessibilityTesting {
  automated: AutomatedAccessibilityTesting;
  manual: ManualAccessibilityTesting;
  user_testing: UserAccessibilityTesting;
  compliance_testing: ComplianceAccessibilityTesting;
}

export interface AutomatedAccessibilityTesting {
  enabled: boolean;
  tools: string[];
  frequency: 'commit' | 'daily' | 'weekly';
  coverage: number; // percentage
  threshold: number; // minimum score
}

export interface ManualAccessibilityTesting {
  required: boolean;
  checklist: ChecklistItem[];
  frequency: 'release' | 'monthly' | 'quarterly';
  reviewer: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  guideline: string;
  level: 'A' | 'AA' | 'AAA';
  automated: boolean;
  instructions: string;
}

export interface UserAccessibilityTesting {
  required: boolean;
  participants: ParticipantConfig[];
  scenarios: TestScenario[];
  feedback: FeedbackConfig;
}

export interface ParticipantConfig {
  disability_type: string;
  assistive_technology: string[];
  experience_level: 'beginner' | 'intermediate' | 'expert';
  sample_size: number;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  tasks: TestTask[];
  success_criteria: string[];
  duration: number; // minutes
}

export interface TestTask {
  id: string;
  description: string;
  expected_outcome: string;
  difficulty: ComplexityLevel;
  assistive_technology?: string[];
}

export interface FeedbackConfig {
  collection_method: 'survey' | 'interview' | 'observation' | 'analytics';
  questions: FeedbackQuestion[];
  analysis: FeedbackAnalysis;
}

export interface FeedbackQuestion {
  id: string;
  type: 'rating' | 'multiple_choice' | 'text' | 'boolean';
  question: string;
  required: boolean;
  options?: string[];
}

export interface FeedbackAnalysis {
  quantitative: boolean;
  qualitative: boolean;
  themes: string[];
  reporting: boolean;
}

export interface ComplianceAccessibilityTesting {
  standard: string;
  level: 'A' | 'AA' | 'AAA';
  frequency: 'release' | 'quarterly' | 'annually';
  auditor: 'internal' | 'external' | 'certified';
  certification: CertificationConfig;
}

export interface CertificationConfig {
  required: boolean;
  authority: string;
  validity_period: number; // months
  renewal_process: string;
  cost: number;
}

export interface AccessibilityTool {
  name: string;
  type: 'automated' | 'manual' | 'browser_extension' | 'screen_reader' | 'color_analyzer';
  purpose: string[];
  integration: string;
  configuration: Record<string, any>;
}

export interface AccessibilityCompliance {
  requirements: AccessibilityRequirement[];
  documentation: ComplianceDocumentation;
  reporting: ComplianceReporting;
  monitoring: ComplianceMonitoring;
}

export interface AccessibilityRequirement {
  id: string;
  guideline: string;
  level: 'A' | 'AA' | 'AAA';
  description: string;
  implementation: string;
  testing: string;
  status: 'compliant' | 'partial' | 'non_compliant';
}

export interface ComplianceDocumentation {
  accessibility_statement: boolean;
  conformance_report: boolean;
  user_guide: boolean;
  training_materials: boolean;
  contact_information: ContactInfo;
}

export interface ContactInfo {
  accessibility_contact: string;
  feedback_mechanism: string;
  response_time: string;
  escalation_process: string;
}

// Quality and Popularity Metrics
export interface QualityMetrics {
  overall: number;
  code_quality: CodeQualityMetrics;
  documentation: DocumentationQualityMetrics;
  testing: TestingQualityMetrics;
  performance: PerformanceQualityMetrics;
  security: SecurityQualityMetrics;
  accessibility: AccessibilityQualityMetrics;
  maintainability: MaintainabilityMetrics;
  usability: UsabilityMetrics;
}

export interface CodeQualityMetrics {
  score: number;
  complexity: number;
  duplication: number;
  coverage: number;
  debt: number; // technical debt in hours
  issues: IssueMetrics;
  standards: StandardsCompliance;
}

export interface IssueMetrics {
  total: number;
  critical: number;
  major: number;
  minor: number;
  info: number;
  resolved: number;
  resolution_time: number; // average hours
}

export interface StandardsCompliance {
  coding_standards: number; // percentage
  best_practices: number; // percentage
  conventions: number; // percentage
  security_guidelines: number; // percentage
}

export interface DocumentationQualityMetrics {
  score: number;
  completeness: number; // percentage
  accuracy: number; // percentage
  clarity: number; // percentage
  examples: number; // count
  maintenance: MaintenanceMetrics;
}

export interface MaintenanceMetrics {
  last_updated: Date;
  update_frequency: number; // days
  staleness: number; // days since last update
  contributor_count: number;
}

export interface TestingQualityMetrics {
  score: number;
  coverage: CoverageMetrics;
  automation: AutomationMetrics;
  quality: TestQualityMetrics;
}

export interface CoverageMetrics {
  line: number; // percentage
  branch: number; // percentage
  function: number; // percentage
  statement: number; // percentage
}

export interface AutomationMetrics {
  unit: number; // percentage
  integration: number; // percentage
  e2e: number; // percentage
  visual: number; // percentage
}

export interface TestQualityMetrics {
  reliability: number; // percentage
  maintainability: number; // percentage
  readability: number; // percentage
  performance: number; // execution time
}

export interface PerformanceQualityMetrics {
  score: number;
  web_vitals: WebVitalsMetrics;
  optimization: OptimizationMetrics;
  scalability: ScalabilityMetrics;
}

export interface WebVitalsMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface OptimizationMetrics {
  bundle_size: number; // KB
  load_time: number; // seconds
  cache_hit_rate: number; // percentage
  compression_ratio: number; // percentage
}

export interface ScalabilityMetrics {
  concurrent_users: number;
  response_time_p95: number; // milliseconds
  throughput: number; // requests per second
  resource_utilization: number; // percentage
}

export interface SecurityQualityMetrics {
  score: number;
  vulnerabilities: VulnerabilityMetrics;
  compliance: SecurityComplianceMetrics;
  practices: SecurityPracticeMetrics;
}

export interface VulnerabilityMetrics {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  false_positives: number;
  mean_time_to_fix: number; // hours
}

export interface SecurityComplianceMetrics {
  standards_met: number; // count
  requirements_compliant: number; // percentage
  audit_score: number; // percentage
  certification_level: string;
}

export interface SecurityPracticeMetrics {
  secure_coding: number; // percentage
  authentication: number; // percentage
  authorization: number; // percentage
  encryption: number; // percentage
}

export interface AccessibilityQualityMetrics {
  score: number;
  wcag_compliance: WCAGComplianceMetrics;
  automation: AccessibilityAutomationMetrics;
  user_testing: AccessibilityUserTestingMetrics;
}

export interface WCAGComplianceMetrics {
  level_a: number; // percentage
  level_aa: number; // percentage
  level_aaa: number; // percentage
  total_guidelines: number;
  compliant_guidelines: number;
}

export interface AccessibilityAutomationMetrics {
  automated_tests: number; // count
  coverage: number; // percentage
  pass_rate: number; // percentage
  false_positives: number;
}

export interface AccessibilityUserTestingMetrics {
  participants: number;
  scenarios_completed: number; // percentage
  task_success_rate: number; // percentage
  satisfaction_score: number; // 1-10
}

export interface MaintainabilityMetrics {
  score: number;
  complexity: ComplexityMetrics;
  modularity: ModularityMetrics;
  documentation: DocumentationMetrics;
  testing: TestabilityMetrics;
}

export interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  nesting_depth: number;
  function_length: number;
  parameter_count: number;
}

export interface ModularityMetrics {
  coupling: number; // lower is better
  cohesion: number; // higher is better
  abstraction: number; // higher is better
  instability: number; // depends on context
}

export interface DocumentationMetrics {
  api_coverage: number; // percentage
  code_comments: number; // percentage
  examples: number; // count
  tutorials: number; // count
}

export interface TestabilityMetrics {
  unit_testable: number; // percentage
  integration_testable: number; // percentage
  mock_friendly: number; // percentage
  test_isolation: number; // percentage
}

export interface UsabilityMetrics {
  score: number;
  learnability: number; // percentage
  efficiency: number; // percentage
  memorability: number; // percentage
  errors: ErrorMetrics;
  satisfaction: SatisfactionMetrics;
}

export interface ErrorMetrics {
  error_rate: number; // percentage
  error_recovery: number; // percentage
  error_prevention: number; // percentage
  help_effectiveness: number; // percentage
}

export interface SatisfactionMetrics {
  user_rating: number; // 1-10
  nps_score: number; // Net Promoter Score
  retention_rate: number; // percentage
  recommendation_rate: number; // percentage
}

export interface PopularityMetrics {
  downloads: number;
  views: number;
  stars: number;
  forks: number;
  contributors: number;
  issues: number;
  pull_requests: number;
  mentions: number;
  social_shares: number;
  trend: TrendMetrics;
}

export interface TrendMetrics {
  growth_rate: number; // percentage per month
  velocity: number; // downloads per day
  momentum: number; // calculated metric
  seasonality: SeasonalityData[];
}

export interface SeasonalityData {
  period: 'monthly' | 'quarterly' | 'yearly';
  pattern: number[];
  confidence: number; // percentage
}

export interface UsageMetrics {
  installations: number;
  active_users: number;
  sessions: number;
  page_views: number;
  bounce_rate: number; // percentage
  session_duration: number; // minutes
  retention: RetentionMetrics;
  geography: GeographyMetrics;
  devices: DeviceMetrics;
}

export interface RetentionMetrics {
  day_1: number; // percentage
  day_7: number; // percentage
  day_30: number; // percentage
  cohort_analysis: CohortData[];
}

export interface CohortData {
  cohort: string;
  size: number;
  retention_rates: number[];
  timeframe: string;
}

export interface GeographyMetrics {
  countries: CountryData[];
  regions: RegionData[];
  cities: CityData[];
}

export interface CountryData {
  country: string;
  users: number;
  percentage: number;
  growth_rate: number;
}

export interface RegionData {
  region: string;
  users: number;
  percentage: number;
  growth_rate: number;
}

export interface CityData {
  city: string;
  country: string;
  users: number;
  percentage: number;
}

export interface DeviceMetrics {
  desktop: number; // percentage
  mobile: number; // percentage
  tablet: number; // percentage
  browsers: BrowserData[];
  operating_systems: OSData[];
}

export interface BrowserData {
  name: string;
  version: string;
  users: number;
  percentage: number;
}

export interface OSData {
  name: string;
  version: string;
  users: number;
  percentage: number;
}

export interface SEOConfig {
  meta: MetaConfig;
  structured_data: StructuredDataConfig;
  sitemap: SitemapConfig;
  analytics: AnalyticsConfig;
  optimization: SEOOptimizationConfig;
}

export interface MetaConfig {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  canonical: string;
  robots: string;
  viewport: string;
  open_graph: OpenGraphConfig;
  twitter: TwitterConfig;
}

export interface OpenGraphConfig {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  site_name: string;
  locale: string;
}

export interface TwitterConfig {
  card: string;
  site: string;
  creator: string;
  title: string;
  description: string;
  image: string;
}

export interface StructuredDataConfig {
  enabled: boolean;
  types: string[];
  schemas: SchemaConfig[];
  validation: boolean;
}

export interface SchemaConfig {
  type: string;
  properties: Record<string, any>;
  required: string[];
  context: string;
}

export interface SitemapConfig {
  enabled: boolean;
  frequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  last_modified: Date;
  change_frequency: string;
}

export interface AnalyticsConfig {
  google_analytics: boolean;
  google_tag_manager: boolean;
  facebook_pixel: boolean;
  custom_tracking: CustomTrackingConfig[];
}

export interface CustomTrackingConfig {
  provider: string;
  tracking_id: string;
  events: TrackingEvent[];
  configuration: Record<string, any>;
}

export interface TrackingEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface SEOOptimizationConfig {
  content: ContentOptimization;
  technical: TechnicalOptimization;
  performance: PerformanceOptimization;
  mobile: MobileOptimization;
}

export interface ContentOptimization {
  keyword_density: number; // percentage
  readability_score: number;
  content_length: number; // words
  heading_structure: boolean;
  internal_links: number;
  external_links: number;
}

export interface TechnicalOptimization {
  url_structure: boolean;
  breadcrumbs: boolean;
  pagination: boolean;
  redirects: RedirectConfig[];
  error_pages: boolean;
}

export interface RedirectConfig {
  from: string;
  to: string;
  type: 301 | 302 | 307 | 308;
  reason: string;
}

export interface PerformanceOptimization {
  page_speed: number; // 0-100
  core_web_vitals: boolean;
  image_optimization: boolean;
  lazy_loading: boolean;
  caching: boolean;
}

export interface MobileOptimization {
  responsive_design: boolean;
  mobile_friendly: boolean;
  amp: boolean;
  pwa: boolean;
  touch_optimization: boolean;
}

// Template Content and Structure
export interface TemplateStructure {
  directories: DirectoryConfig[];
  files: FileConfig[];
  patterns: StructurePattern[];
  conventions: NamingConvention[];
  validation: StructureValidation;
}

export interface DirectoryConfig {
  path: string;
  purpose: string;
  required: boolean;
  template: boolean;
  permissions: string;
  subdirectories: DirectoryConfig[];
}

export interface FileConfig {
  path: string;
  template: boolean;
  required: boolean;
  purpose: string;
  type: FileType;
  encoding: string;
  permissions: string;
  processing: ProcessingRule[];
  validation: FileValidation;
}

export type FileType =
  | 'component'
  | 'page'
  | 'layout'
  | 'style'
  | 'script'
  | 'config'
  | 'data'
  | 'asset'
  | 'documentation'
  | 'test'
  | 'build'
  | 'deployment';

export interface ProcessingRule {
  stage: 'pre' | 'during' | 'post';
  condition: string;
  action: ProcessingAction;
  parameters: Record<string, any>;
  priority: number;
}

export interface ProcessingAction {
  type: 'transform' | 'validate' | 'generate' | 'copy' | 'move' | 'delete' | 'merge';
  processor: string;
  configuration: Record<string, any>;
}

export interface FileValidation {
  schema?: string;
  format?: string;
  size_limit?: number;
  encoding?: string;
  custom_rules?: ValidationRule[];
}

export interface ValidationRule {
  name: string;
  description: string;
  rule: string;
  severity: SeverityLevel;
  fix_suggestion: string;
  auto_fix: boolean;
}

export interface StructurePattern {
  name: string;
  description: string;
  pattern: string;
  type: 'required' | 'recommended' | 'optional' | 'forbidden';
  scope: 'global' | 'directory' | 'file';
  examples: string[];
}

export interface NamingConvention {
  scope: 'file' | 'directory' | 'component' | 'variable' | 'function' | 'class';
  pattern: string;
  description: string;
  examples: string[];
  counterexamples: string[];
  enforcement: 'strict' | 'warning' | 'suggestion';
}

export interface StructureValidation {
  enabled: boolean;
  rules: StructureValidationRule[];
  automation: boolean;
  reporting: boolean;
}

export interface StructureValidationRule {
  name: string;
  description: string;
  type: 'existence' | 'pattern' | 'dependency' | 'constraint';
  condition: string;
  message: string;
  severity: SeverityLevel;
  auto_fix: boolean;
}

// Customization Configuration
export interface CustomizationConfig {
  enabled: boolean;
  points: CustomizationPoint[];
  workflows: CustomizationWorkflow[];
  validation: CustomizationValidation;
  documentation: CustomizationDocumentation;
  ai_support: AICustomizationSupport;
}

export interface CustomizationPoint {
  id: string;
  name: string;
  description: string;
  type: CustomizationType;
  category: CustomizationCategory;
  scope: CustomizationScope;
  complexity: ComplexityLevel;
  impact: ImpactLevel;
  location: LocationConfig;
  properties: CustomizationProperty[];
  constraints: CustomizationConstraint[];
  dependencies: string[];
  examples: CustomizationExample[];
  documentation: string;
  ai_support: PointAISupport;
}

export type CustomizationType =
  | 'theme'
  | 'layout'
  | 'content'
  | 'behavior'
  | 'integration'
  | 'configuration'
  | 'styling'
  | 'branding'
  | 'functionality'
  | 'workflow';

export type CustomizationCategory =
  | 'visual'
  | 'functional'
  | 'structural'
  | 'behavioral'
  | 'integration'
  | 'performance'
  | 'security'
  | 'accessibility'
  | 'analytics'
  | 'content';

export type CustomizationScope = 'global' | 'page' | 'component' | 'element' | 'property';
export type ImpactLevel = 'cosmetic' | 'functional' | 'structural' | 'architectural';

export interface LocationConfig {
  file: string;
  line?: number;
  selector?: string;
  property?: string;
  section?: string;
  context: Record<string, any>;
}

export interface CustomizationProperty {
  name: string;
  type: PropertyType;
  description: string;
  default: any;
  required: boolean;
  validation: PropertyValidation;
  ui_config: UIConfig;
}

export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'color'
  | 'font'
  | 'size'
  | 'spacing'
  | 'enum'
  | 'array'
  | 'object'
  | 'file'
  | 'url'
  | 'code';

export interface PropertyValidation {
  required: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  custom?: string;
  message?: string;
}

export interface UIConfig {
  widget: UIWidget;
  label: string;
  help_text?: string;
  placeholder?: string;
  options?: UIOption[];
  layout?: UILayout;
  conditional?: ConditionalConfig;
}

export type UIWidget =
  | 'text'
  | 'textarea'
  | 'number'
  | 'slider'
  | 'toggle'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'multiselect'
  | 'color_picker'
  | 'font_picker'
  | 'file_upload'
  | 'code_editor'
  | 'rich_text'
  | 'date_picker'
  | 'time_picker';

export interface UIOption {
  label: string;
  value: any;
  description?: string;
  icon?: string;
  preview?: string;
}

export interface UILayout {
  columns?: number;
  rows?: number;
  span?: number;
  order?: number;
  visible?: boolean;
  collapsible?: boolean;
}

export interface ConditionalConfig {
  show_when: string;
  hide_when: string;
  enable_when: string;
  disable_when: string;
}

export interface CustomizationConstraint {
  type: ConstraintType;
  condition: string;
  message: string;
  severity: SeverityLevel;
  enforcement: 'block' | 'warn' | 'suggest';
  bypass: BypassConfig;
}

export type ConstraintType =
  | 'value_range'
  | 'pattern_match'
  | 'dependency'
  | 'compatibility'
  | 'business_rule'
  | 'security'
  | 'performance'
  | 'accessibility';

export interface BypassConfig {
  allowed: boolean;
  roles: string[];
  approval_required: boolean;
  justification_required: boolean;
}

export interface CustomizationExample {
  name: string;
  description: string;
  use_case: string;
  before: any;
  after: any;
  code?: string;
  preview?: string;
  difficulty: ComplexityLevel;
  tags: string[];
}

export interface PointAISupport {
  enabled: boolean;
  confidence: number;
  generation: boolean;
  validation: boolean;
  suggestions: boolean;
  auto_apply: boolean;
  learning: boolean;
}

export interface CustomizationWorkflow {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  steps: WorkflowStep[];
  automation: WorkflowAutomation;
  validation: WorkflowValidation;
  approval: WorkflowApproval;
  deployment: WorkflowDeployment;
}

export type WorkflowType = 'linear' | 'branching' | 'parallel' | 'conditional' | 'iterative';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: StepType;
  required: boolean;
  automated: boolean;
  inputs: StepInput[];
  outputs: StepOutput[];
  validation: StepValidation[];
  dependencies: string[];
  conditions: StepCondition[];
  error_handling: ErrorHandling;
}

export type StepType =
  | 'input'
  | 'validation'
  | 'transformation'
  | 'generation'
  | 'review'
  | 'approval'
  | 'deployment'
  | 'notification'
  | 'rollback';

export interface StepInput {
  name: string;
  type: string;
  source: 'user' | 'previous_step' | 'external' | 'ai' | 'system';
  required: boolean;
  validation: InputValidation;
  ui_config?: UIConfig;
}

export interface InputValidation {
  schema?: string;
  rules?: ValidationRule[];
  custom?: string;
  async?: boolean;
}

export interface StepOutput {
  name: string;
  type: string;
  destination: 'next_step' | 'storage' | 'external' | 'user' | 'system';
  format: string;
  transformation?: string;
}

export interface StepValidation {
  type: 'pre' | 'during' | 'post';
  validator: string;
  configuration: Record<string, any>;
  required: boolean;
  blocking: boolean;
}

export interface StepCondition {
  expression: string;
  action: 'continue' | 'skip' | 'branch' | 'retry' | 'fail';
  parameters: Record<string, any>;
}

export interface ErrorHandling {
  retry: RetryConfig;
  fallback: FallbackConfig;
  notification: ErrorNotificationConfig;
  rollback: RollbackConfig;
}

export interface RetryConfig {
  enabled: boolean;
  max_attempts: number;
  delay: number; // milliseconds
  backoff: 'linear' | 'exponential' | 'fixed';
  conditions: string[];
}

export interface FallbackConfig {
  enabled: boolean;
  strategy: 'manual' | 'automated' | 'default_value' | 'previous_step';
  configuration: Record<string, any>;
}

export interface ErrorNotificationConfig {
  enabled: boolean;
  recipients: string[];
  severity_threshold: SeverityLevel;
  template: string;
  channels: string[];
}

export interface RollbackConfig {
  enabled: boolean;
  automatic: boolean;
  scope: 'step' | 'workflow' | 'all';
  conditions: string[];
}

export interface WorkflowAutomation {
  level: number; // percentage
  triggers: AutomationTrigger[];
  ai_assistance: boolean;
  approval_bypass: ApprovalBypass[];
  scheduling: SchedulingConfig;
}

export interface AutomationTrigger {
  event: string;
  condition: string;
  action: string;
  parameters: Record<string, any>;
  priority: number;
}

export interface ApprovalBypass {
  condition: string;
  justification: string;
  audit_required: boolean;
  notification_required: boolean;
}

export interface SchedulingConfig {
  enabled: boolean;
  timezone: string;
  working_hours: WorkingHours;
  holidays: HolidayConfig[];
  blackout_periods: BlackoutPeriod[];
}

export interface WorkingHours {
  start: string; // HH:MM
  end: string; // HH:MM
  days: string[]; // day names
  timezone: string;
}

export interface HolidayConfig {
  name: string;
  date: string; // YYYY-MM-DD or recurrence rule
  country?: string;
  region?: string;
}

export interface BlackoutPeriod {
  name: string;
  start: Date;
  end: Date;
  reason: string;
  exceptions: string[];
}

export interface WorkflowValidation {
  enabled: boolean;
  stages: ValidationStage[];
  quality_gates: QualityGate[];
  compliance_checks: ComplianceCheck[];
}

export interface ValidationStage {
  name: string;
  type: 'syntax' | 'semantic' | 'business' | 'technical' | 'security' | 'performance';
  validators: ValidatorConfig[];
  required: boolean;
  blocking: boolean;
}

export interface ValidatorConfig {
  name: string;
  type: string;
  configuration: Record<string, any>;
  severity_threshold: SeverityLevel;
  timeout: number; // milliseconds
}

export interface QualityGate {
  name: string;
  description: string;
  metrics: QualityMetric[];
  threshold: number; // percentage
  action: 'block' | 'warn' | 'report';
}

export interface QualityMetric {
  name: string;
  weight: number;
  target: number;
  measurement: string;
}

export interface ComplianceCheck {
  standard: string;
  requirements: string[];
  automated: boolean;
  documentation_required: boolean;
  approval_required: boolean;
}

export interface WorkflowApproval {
  required: boolean;
  stages: ApprovalStage[];
  matrix: ApprovalMatrix;
  escalation: ApprovalEscalation;
  audit: ApprovalAudit;
}

export interface ApprovalStage {
  name: string;
  description: string;
  type: 'individual' | 'group' | 'unanimous' | 'majority' | 'quorum';
  approvers: ApproverConfig[];
  conditions: ApprovalCondition[];
  timeout: number; // hours
  delegation: DelegationConfig;
}

export interface ApproverConfig {
  type: 'user' | 'role' | 'group' | 'external';
  identifier: string;
  required: boolean;
  weight: number;
  delegation_allowed: boolean;
}

export interface ApprovalCondition {
  expression: string;
  required_approvers: string[];
  bypass_conditions: string[];
}

export interface DelegationConfig {
  allowed: boolean;
  scope: 'full' | 'limited' | 'conditional';
  duration: number; // hours
  audit_required: boolean;
}

export interface ApprovalMatrix {
  criteria: ApprovalCriteria[];
  routing: ApprovalRouting[];
  defaults: ApprovalDefaults;
}

export interface ApprovalCriteria {
  condition: string;
  approver_requirements: string[];
  bypass_conditions: string[];
  documentation_requirements: string[];
}

export interface ApprovalRouting {
  condition: string;
  stages: string[];
  parallel: boolean;
  optional_stages: string[];
}

export interface ApprovalDefaults {
  timeout: number; // hours
  escalation_enabled: boolean;
  auto_approve_conditions: string[];
  notification_frequency: number; // hours
}

export interface ApprovalEscalation {
  enabled: boolean;
  levels: EscalationLevel[];
  final_action: 'approve' | 'reject' | 'manual';
}

export interface EscalationLevel {
  level: number;
  trigger_after: number; // hours
  approvers: string[];
  notification: EscalationNotification;
  action: 'notify' | 'delegate' | 'auto_approve' | 'auto_reject';
}

export interface EscalationNotification {
  recipients: string[];
  template: string;
  channels: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface ApprovalAudit {
  enabled: boolean;
  fields: AuditField[];
  retention: number; // days
  reporting: AuditReporting;
}

export interface AuditField {
  name: string;
  type: string;
  required: boolean;
  encrypted: boolean;
  pii: boolean;
}

export interface AuditReporting {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
}

export interface WorkflowDeployment {
  strategy: DeploymentStrategy;
  environments: DeploymentEnvironment[];
  validation: DeploymentValidation;
  rollback: DeploymentRollback;
  monitoring: DeploymentMonitoring;
}

export interface DeploymentStrategy {
  type: 'blue_green' | 'canary' | 'rolling' | 'recreation' | 'shadow';
  configuration: Record<string, any>;
  automation_level: number; // percentage
  approval_gates: string[];
}

export interface DeploymentEnvironment {
  name: string;
  type: 'development' | 'staging' | 'production' | 'test' | 'preview';
  configuration: EnvironmentConfig;
  prerequisites: string[];
  validation_required: boolean;
}

export interface EnvironmentConfig {
  variables: Record<string, string>;
  secrets: string[];
  resources: ResourceConfig[];
  networking: NetworkingConfig;
  security: EnvironmentSecurity;
}

export interface ResourceConfig {
  type: 'compute' | 'storage' | 'network' | 'database' | 'cache';
  specification: Record<string, any>;
  scaling: ScalingConfig;
  monitoring: ResourceMonitoring;
}

export interface ScalingConfig {
  enabled: boolean;
  min_instances: number;
  max_instances: number;
  target_utilization: number; // percentage
  metrics: ScalingMetric[];
}

export interface ScalingMetric {
  name: string;
  threshold: number;
  duration: number; // seconds
  action: 'scale_up' | 'scale_down';
}

export interface ResourceMonitoring {
  enabled: boolean;
  metrics: string[];
  alerts: ResourceAlert[];
  dashboards: string[];
}

export interface ResourceAlert {
  name: string;
  condition: string;
  severity: SeverityLevel;
  notification: string[];
  action: string[];
}

export interface NetworkingConfig {
  vpc: string;
  subnets: string[];
  security_groups: string[];
  load_balancer: LoadBalancerConfig;
  cdn: CDNConfig;
}

export interface LoadBalancerConfig {
  enabled: boolean;
  type: 'application' | 'network' | 'classic';
  listeners: ListenerConfig[];
  health_check: HealthCheckConfig;
}

export interface ListenerConfig {
  port: number;
  protocol: string;
  ssl_certificate?: string;
  rules: RoutingRule[];
}

export interface RoutingRule {
  condition: string;
  action: string;
  priority: number;
  target: string;
}

export interface HealthCheckConfig {
  enabled: boolean;
  path: string;
  interval: number; // seconds
  timeout: number; // seconds
  healthy_threshold: number;
  unhealthy_threshold: number;
}

export interface CDNConfig {
  enabled: boolean;
  provider: string;
  distribution: string;
  cache_behaviors: CacheBehavior[];
  origins: OriginConfig[];
}

export interface CacheBehavior {
  path_pattern: string;
  ttl: number; // seconds
  compress: boolean;
  viewer_protocol: 'http' | 'https' | 'redirect';
}

export interface OriginConfig {
  domain: string;
  path: string;
  custom_headers: Record<string, string>;
  ssl_protocols: string[];
}

export interface EnvironmentSecurity {
  encryption: EnvironmentEncryption;
  access_control: EnvironmentAccessControl;
  compliance: EnvironmentCompliance;
  monitoring: SecurityMonitoring;
}

export interface EnvironmentEncryption {
  at_rest: boolean;
  in_transit: boolean;
  key_management: string;
  algorithm: string;
}

export interface EnvironmentAccessControl {
  authentication: string[];
  authorization: string;
  mfa_required: boolean;
  session_timeout: number; // minutes
}

export interface EnvironmentCompliance {
  standards: string[];
  auditing: boolean;
  data_residency: string;
  privacy_controls: string[];
}

export interface SecurityMonitoring {
  enabled: boolean;
  tools: string[];
  alerts: SecurityAlert[];
  incident_response: IncidentResponse;
}

export interface SecurityAlert {
  name: string;
  type: 'vulnerability' | 'intrusion' | 'anomaly' | 'compliance';
  severity: SeverityLevel;
  notification: string[];
  escalation: SecurityEscalation;
}

export interface SecurityEscalation {
  enabled: boolean;
  levels: SecurityEscalationLevel[];
  automation: boolean;
}

export interface SecurityEscalationLevel {
  level: number;
  trigger_after: number; // minutes
  action: string;
  notification: string[];
}

export interface IncidentResponse {
  enabled: boolean;
  playbooks: PlaybookConfig[];
  team: IncidentTeam;
  communication: IncidentCommunication;
}

export interface PlaybookConfig {
  name: string;
  trigger: string;
  steps: PlaybookStep[];
  roles: PlaybookRole[];
}

export interface PlaybookStep {
  name: string;
  description: string;
  action: string;
  automated: boolean;
  timeout: number; // minutes
}

export interface PlaybookRole {
  role: string;
  responsibilities: string[];
  escalation_path: string[];
}

export interface IncidentTeam {
  lead: string;
  members: string[];
  escalation: string[];
  external_contacts: string[];
}

export interface IncidentCommunication {
  channels: string[];
  templates: CommunicationTemplate[];
  stakeholders: StakeholderGroup[];
  updates: UpdateSchedule;
}

export interface CommunicationTemplate {
  type: 'initial' | 'update' | 'resolution' | 'post_mortem';
  template: string;
  required_fields: string[];
  distribution: string[];
}

export interface StakeholderGroup {
  name: string;
  members: string[];
  notification_threshold: SeverityLevel;
  communication_preference: string;
}

export interface UpdateSchedule {
  frequency: number; // minutes
  escalation_frequency: number; // minutes
  stakeholder_updates: boolean;
  public_updates: boolean;
}

export interface DeploymentValidation {
  pre_deployment: ValidationCheck[];
  post_deployment: ValidationCheck[];
  smoke_tests: SmokeTest[];
  integration_tests: IntegrationTest[];
}

export interface ValidationCheck {
  name: string;
  type: 'syntax' | 'configuration' | 'dependency' | 'security' | 'performance';
  command: string;
  expected_result: string;
  timeout: number; // seconds
  retry_count: number;
}

export interface SmokeTest {
  name: string;
  description: string;
  endpoint: string;
  method: string;
  expected_status: number;
  expected_response?: any;
  timeout: number; // seconds
}

export interface IntegrationTest {
  name: string;
  description: string;
  test_suite: string;
  environment: string;
  duration: number; // minutes
  coverage_threshold: number; // percentage
}

export interface DeploymentRollback {
  enabled: boolean;
  automatic: boolean;
  triggers: RollbackTrigger[];
  strategy: RollbackStrategy;
  validation: RollbackValidation;
}

export interface RollbackTrigger {
  metric: string;
  threshold: number;
  duration: number; // seconds
  action: 'immediate' | 'delayed' | 'manual';
}

export interface RollbackStrategy {
  type: 'previous_version' | 'last_known_good' | 'backup' | 'rebuild';
  configuration: Record<string, any>;
  data_preservation: boolean;
  notification_required: boolean;
}

export interface RollbackValidation {
  required: boolean;
  checks: ValidationCheck[];
  approval_required: boolean;
  documentation_required: boolean;
}

export interface DeploymentMonitoring {
  enabled: boolean;
  metrics: DeploymentMetric[];
  dashboards: MonitoringDashboard[];
  alerts: DeploymentAlert[];
  reporting: DeploymentReporting;
}

export interface DeploymentMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  collection_interval: number; // seconds
  retention_period: number; // days
  aggregation: string;
}

export interface MonitoringDashboard {
  name: string;
  description: string;
  widgets: DashboardWidget[];
  refresh_interval: number; // seconds
  access_control: string[];
}

export interface DashboardWidget {
  type: 'chart' | 'table' | 'metric' | 'alert' | 'log';
  configuration: Record<string, any>;
  position: WidgetPosition;
  data_source: string;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DeploymentAlert {
  name: string;
  description: string;
  condition: string;
  severity: SeverityLevel;
  notification: AlertNotification;
  escalation: AlertEscalation;
}

export interface AlertNotification {
  channels: string[];
  recipients: string[];
  template: string;
  rate_limit: number; // seconds between notifications
}

export interface AlertEscalation {
  enabled: boolean;
  levels: AlertEscalationLevel[];
  timeout: number; // minutes
}

export interface AlertEscalationLevel {
  level: number;
  recipients: string[];
  action: string;
  timeout: number; // minutes
}

export interface DeploymentReporting {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  metrics: string[];
  recipients: string[];
  format: 'pdf' | 'html' | 'csv' | 'json';
}

export interface CustomizationValidation {
  enabled: boolean;
  real_time: boolean;
  batch: boolean;
  rules: CustomizationValidationRule[];
  integration: ValidationIntegration;
}

export interface CustomizationValidationRule {
  name: string;
  description: string;
  scope: ValidationScope;
  type: ValidationType;
  condition: string;
  message: string;
  severity: SeverityLevel;
  fix_suggestion: string;
  auto_fix: boolean;
  dependencies: string[];
}

export type ValidationScope = 'global' | 'template' | 'component' | 'property';
export type ValidationType = 'syntax' | 'semantic' | 'business' | 'design' | 'performance' | 'security' | 'accessibility';

export interface ValidationIntegration {
  ide: IDEIntegration;
  ci_cd: CICDIntegration;
  runtime: RuntimeIntegration;
  testing: TestingIntegration;
}

export interface IDEIntegration {
  enabled: boolean;
  plugins: string[];
  real_time_validation: boolean;
  auto_complete: boolean;
  error_highlighting: boolean;
}

export interface CICDIntegration {
  enabled: boolean;
  pipeline_stage: string;
  blocking: boolean;
  reporting: boolean;
  badge_generation: boolean;
}

export interface RuntimeIntegration {
  enabled: boolean;
  monitoring: boolean;
  error_reporting: boolean;
  performance_tracking: boolean;
  user_feedback: boolean;
}

export interface TestingIntegration {
  unit_tests: boolean;
  integration_tests: boolean;
  e2e_tests: boolean;
  visual_regression: boolean;
  accessibility_tests: boolean;
}

export interface CustomizationDocumentation {
  enabled: boolean;
  auto_generation: boolean;
  formats: DocumentationFormat[];
  sections: DocumentationSection[];
  publishing: DocumentationPublishing;
}

export interface DocumentationFormat {
  type: 'markdown' | 'html' | 'pdf' | 'interactive' | 'video';
  enabled: boolean;
  template: string;
  configuration: Record<string, any>;
}

export interface DocumentationSection {
  name: string;
  type: 'overview' | 'tutorial' | 'reference' | 'examples' | 'troubleshooting' | 'faq';
  auto_generated: boolean;
  template: string;
  data_sources: string[];
}

export interface DocumentationPublishing {
  enabled: boolean;
  platforms: PublishingPlatform[];
  versioning: DocumentationVersioning;
  access_control: DocumentationAccessControl;
}

export interface PublishingPlatform {
  name: string;
  type: 'static_site' | 'wiki' | 'cms' | 'api' | 'portal';
  configuration: Record<string, any>;
  sync_frequency: string;
  authentication: string;
}

export interface DocumentationVersioning {
  enabled: boolean;
  strategy: 'git_tags' | 'semantic' | 'date' | 'custom';
  retention: number; // number of versions to keep
  archive: boolean;
}

export interface DocumentationAccessControl {
  enabled: boolean;
  roles: DocumentationRole[];
  authentication_required: boolean;
  public_sections: string[];
}

export interface DocumentationRole {
  name: string;
  permissions: string[];
  sections: string[];
  actions: string[];
}

export interface AICustomizationSupport {
  enabled: boolean;
  capabilities: AICapability[];
  models: AIModelConfig[];
  training: AITrainingConfig;
  inference: AIInferenceConfig;
  monitoring: AIMonitoringConfig;
}

export interface AICapability {
  name: string;
  type: AICapabilityType;
  description: string;
  confidence: number; // 0-1
  availability: CapabilityAvailability;
  performance: CapabilityPerformance;
  limitations: string[];
  examples: AIExample[];
}

export type AICapabilityType =
  | 'generation'
  | 'customization'
  | 'optimization'
  | 'validation'
  | 'suggestion'
  | 'prediction'
  | 'analysis'
  | 'translation'
  | 'summarization'
  | 'classification';

export interface CapabilityAvailability {
  regions: string[];
  languages: string[];
  platforms: string[];
  pricing_tiers: string[];
}

export interface CapabilityPerformance {
  latency: number; // milliseconds
  throughput: number; // requests per second
  accuracy: number; // 0-1
  reliability: number; // 0-1
  scalability: ScalabilityRating;
}

export type ScalabilityRating = 'low' | 'medium' | 'high' | 'unlimited';

export interface AIExample {
  name: string;
  description: string;
  input: any;
  output: any;
  context: Record<string, any>;
  performance_metrics: Record<string, number>;
}

export interface AIModelConfig {
  name: string;
  version: string;
  type: AIModelType;
  provider: string;
  capabilities: string[];
  configuration: ModelConfiguration;
  performance: ModelPerformance;
  costs: ModelCosts;
}

export type AIModelType =
  | 'llm'
  | 'vision'
  | 'multimodal'
  | 'embedding'
  | 'classification'
  | 'generation'
  | 'custom';

export interface ModelConfiguration {
  parameters: ModelParameter[];
  limits: ModelLimits;
  fine_tuning: FineTuningConfig;
  deployment: ModelDeployment;
}

export interface ModelParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  default: any;
  range?: [number, number];
  options?: any[];
  description: string;
}

export interface ModelLimits {
  max_tokens: number;
  max_requests_per_minute: number;
  max_requests_per_day: number;
  timeout: number; // seconds
  context_window: number;
}

export interface FineTuningConfig {
  supported: boolean;
  data_requirements: DataRequirements;
  training_config: TrainingConfig;
  evaluation: EvaluationConfig;
}

export interface DataRequirements {
  min_samples: number;
  max_samples: number;
  format: string[];
  quality_requirements: QualityRequirements;
}

export interface QualityRequirements {
  completeness: number; // percentage
  consistency: number; // percentage
  accuracy: number; // percentage
  diversity: number; // percentage
}

export interface TrainingConfig {
  epochs: number;
  batch_size: number;
  learning_rate: number;
  validation_split: number;
  early_stopping: boolean;
}

export interface EvaluationConfig {
  metrics: string[];
  test_set_size: number; // percentage
  validation_frequency: number; // epochs
  benchmark_tests: string[];
}

export interface ModelDeployment {
  options: DeploymentOption[];
  scaling: ModelScaling;
  monitoring: ModelMonitoring;
  versioning: ModelVersioning;
}

export interface DeploymentOption {
  type: 'cloud' | 'edge' | 'on_premise' | 'hybrid';
  provider: string;
  regions: string[];
  instance_types: string[];
  auto_scaling: boolean;
}

export interface ModelScaling {
  auto_scaling: boolean;
  min_instances: number;
  max_instances: number;
  target_utilization: number; // percentage
  scale_up_threshold: number;
  scale_down_threshold: number;
}

export interface ModelMonitoring {
  enabled: boolean;
  metrics: ModelMetric[];
  alerts: ModelAlert[];
  logging: ModelLogging;
}

export interface ModelMetric {
  name: string;
  type: 'performance' | 'quality' | 'usage' | 'cost';
  collection_interval: number; // seconds
  retention_period: number; // days
}

export interface ModelAlert {
  name: string;
  condition: string;
  severity: SeverityLevel;
  notification: string[];
  action: string[];
}

export interface ModelLogging {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug';
  include_inputs: boolean;
  include_outputs: boolean;
  retention_period: number; // days
}

export interface ModelVersioning {
  strategy: 'semantic' | 'timestamp' | 'hash' | 'sequential';
  auto_versioning: boolean;
  rollback_support: boolean;
  a_b_testing: ABTestingConfig;
}

export interface ABTestingConfig {
  enabled: boolean;
  traffic_split: Record<string, number>; // version -> percentage
  duration: number; // days
  success_metrics: string[];
  auto_promotion: boolean;
}

export interface ModelPerformance {
  latency: LatencyMetrics;
  throughput: ThroughputMetrics;
  accuracy: AccuracyMetrics;
  reliability: ReliabilityMetrics;
}

export interface LatencyMetrics {
  p50: number; // milliseconds
  p95: number; // milliseconds
  p99: number; // milliseconds
  average: number; // milliseconds
  maximum: number; // milliseconds
}

export interface ThroughputMetrics {
  requests_per_second: number;
  tokens_per_second: number;
  concurrent_requests: number;
  peak_throughput: number;
}

export interface AccuracyMetrics {
  overall: number; // 0-1
  by_category: Record<string, number>;
  confidence_intervals: ConfidenceInterval[];
  benchmark_scores: Record<string, number>;
}

export interface ConfidenceInterval {
  metric: string;
  confidence_level: number; // percentage
  lower_bound: number;
  upper_bound: number;
}

export interface ReliabilityMetrics {
  uptime: number; // percentage
  error_rate: number; // percentage
  mtbf: number; // hours (Mean Time Between Failures)
  mttr: number; // hours (Mean Time To Recovery)
}

export interface ModelCosts {
  pricing_model: 'pay_per_use' | 'subscription' | 'hybrid' | 'free';
  rates: CostRate[];
  billing_frequency: 'real_time' | 'hourly' | 'daily' | 'monthly';
  cost_optimization: CostOptimization;
}

export interface CostRate {
  metric: 'tokens' | 'requests' | 'compute_hours' | 'storage';
  rate: number;
  currency: string;
  billing_unit: string;
  tiers: CostTier[];
}

export interface CostTier {
  threshold: number;
  rate: number;
  discount: number; // percentage
}

export interface CostOptimization {
  enabled: boolean;
  strategies: OptimizationStrategy[];
  budget_alerts: BudgetAlert[];
  cost_controls: CostControl[];
}

export interface OptimizationStrategy {
  name: string;
  type: 'caching' | 'batching' | 'compression' | 'routing' | 'scheduling';
  configuration: Record<string, any>;
  estimated_savings: number; // percentage
}

export interface BudgetAlert {
  threshold: number;
  period: 'daily' | 'weekly' | 'monthly';
  notification: string[];
  action: 'notify' | 'throttle' | 'stop';
}

export interface CostControl {
  type: 'rate_limit' | 'quota' | 'circuit_breaker' | 'priority_queue';
  configuration: Record<string, any>;
  bypass_conditions: string[];
}

export interface AITrainingConfig {
  enabled: boolean;
  datasets: TrainingDataset[];
  pipeline: TrainingPipeline;
  validation: TrainingValidation;
  deployment: TrainingDeployment;
}

export interface TrainingDataset {
  name: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'multimodal';
  source: DataSource;
  preprocessing: PreprocessingConfig;
  quality: DataQuality;
  privacy: DataPrivacy;
}

export interface DataSource {
  type: 'file' | 'database' | 'api' | 'stream' | 'synthetic';
  location: string;
  format: string;
  authentication: DataAuthentication;
  refresh_frequency: string;
}

export interface DataAuthentication {
  type: 'none' | 'api_key' | 'oauth' | 'certificate' | 'iam';
  configuration: Record<string, any>;
  rotation_policy: string;
}

export interface PreprocessingConfig {
  steps: PreprocessingStep[];
  validation: boolean;
  caching: boolean;
  parallelization: boolean;
}

export interface PreprocessingStep {
  name: string;
  type: 'cleaning' | 'transformation' | 'augmentation' | 'normalization' | 'filtering';
  configuration: Record<string, any>;
  conditional: boolean;
  order: number;
}

export interface DataQuality {
  completeness: number; // percentage
  accuracy: number; // percentage
  consistency: number; // percentage
  timeliness: number; // percentage
  validity: number; // percentage
  uniqueness: number; // percentage
}

export interface DataPrivacy {
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  anonymization: AnonymizationConfig;
  encryption: DataEncryption;
  access_control: DataAccessControl;
  retention: DataRetention;
}

export interface AnonymizationConfig {
  enabled: boolean;
  techniques: string[];
  k_anonymity: number;
  l_diversity: boolean;
  t_closeness: boolean;
}

export interface DataEncryption {
  at_rest: boolean;
  in_transit: boolean;
  algorithm: string;
  key_management: string;
}

export interface DataAccessControl {
  authentication_required: boolean;
  authorization_model: string;
  audit_logging: boolean;
  access_reviews: AccessReviewConfig;
}

export interface AccessReviewConfig {
  frequency: 'monthly' | 'quarterly' | 'annually';
  automated: boolean;
  approval_required: boolean;
  documentation_required: boolean;
}

export interface DataRetention {
  period: number; // days
  policy: 'delete' | 'archive' | 'anonymize';
  compliance_requirements: string[];
  backup_retention: number; // days
}

export interface TrainingPipeline {
  stages: TrainingStage[];
  orchestration: PipelineOrchestration;
  monitoring: PipelineMonitoring;
  optimization: PipelineOptimization;
}

export interface TrainingStage {
  name: string;
  type: 'data_loading' | 'preprocessing' | 'training' | 'validation' | 'evaluation' | 'deployment';
  configuration: StageConfiguration;
  dependencies: string[];
  resources: StageResources;
  timeout: number; // minutes
}

export interface StageConfiguration {
  parameters: Record<string, any>;
  environment: Record<string, string>;
  commands: string[];
  artifacts: ArtifactConfig[];
}

export interface ArtifactConfig {
  name: string;
  type: 'model' | 'data' | 'report' | 'log' | 'config';
  location: string;
  versioning: boolean;
  retention: number; // days
}

export interface StageResources {
  cpu: ResourceRequirement;
  memory: ResourceRequirement;
  gpu: ResourceRequirement;
  storage: ResourceRequirement;
  network: ResourceRequirement;
}

export interface ResourceRequirement {
  amount: number;
  unit: string;
  min?: number;
  max?: number;
  scalable: boolean;
}

export interface PipelineOrchestration {
  tool: 'airflow' | 'kubeflow' | 'mlflow' | 'custom';
  configuration: Record<string, any>;
  scheduling: PipelineScheduling;
  retry_policy: RetryPolicy;
}

export interface PipelineScheduling {
  enabled: boolean;
  cron_expression: string;
  timezone: string;
  max_concurrent_runs: number;
  catchup: boolean;
}

export interface RetryPolicy {
  enabled: boolean;
  max_retries: number;
  delay: number; // seconds
  backoff_strategy: 'linear' | 'exponential' | 'fixed';
  retry_conditions: string[];
}

export interface PipelineMonitoring {
  enabled: boolean;
  metrics: PipelineMetric[];
  alerts: PipelineAlert[];
  dashboards: PipelineDashboard[];
  logging: PipelineLogging;
}

export interface PipelineMetric {
  name: string;
  type: 'duration' | 'throughput' | 'quality' | 'cost' | 'resource_usage';
  collection_frequency: string;
  retention_period: number; // days
  visualization: string;
}

export interface PipelineAlert {
  name: string;
  condition: string;
  severity: SeverityLevel;
  notification: PipelineNotification;
  escalation: PipelineEscalation;
}

export interface PipelineNotification {
  channels: string[];
  recipients: string[];
  template: string;
  frequency_limit: number; // minutes
}

export interface PipelineEscalation {
  enabled: boolean;
  levels: PipelineEscalationLevel[];
  timeout: number; // minutes
}

export interface PipelineEscalationLevel {
  level: number;
  recipients: string[];
  actions: string[];
  timeout: number; // minutes
}

export interface PipelineDashboard {
  name: string;
  description: string;
  metrics: string[];
  refresh_frequency: number; // seconds
  access_control: string[];
}

export interface PipelineLogging {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug';
  structured: boolean;
  retention_period: number; // days
  aggregation: LogAggregation;
}

export interface LogAggregation {
  enabled: boolean;
  tools: string[];
  indexing: boolean;
  search: boolean;
  alerting: boolean;
}

export interface PipelineOptimization {
  enabled: boolean;
  auto_tuning: boolean;
  techniques: OptimizationTechnique[];
  objectives: OptimizationObjective[];
  constraints: OptimizationConstraint[];
}

export interface OptimizationObjective {
  name: string;
  type: 'minimize' | 'maximize';
  metric: string;
  weight: number;
  target?: number;
}

export interface OptimizationConstraint {
  name: string;
  type: 'equality' | 'inequality';
  expression: string;
  penalty: number;
}

export interface TrainingValidation {
  enabled: boolean;
  cross_validation: CrossValidationConfig;
  holdout_validation: HoldoutValidationConfig;
  custom_validation: CustomValidationConfig[];
  automated_stopping: EarlyStoppingConfig;
}

export interface CrossValidationConfig {
  enabled: boolean;
  folds: number;
  stratified: boolean;
  shuffle: boolean;
  random_state: number;
}

export interface HoldoutValidationConfig {
  enabled: boolean;
  test_size: number; // percentage
  validation_size: number; // percentage
  stratified: boolean;
  shuffle: boolean;
}

export interface CustomValidationConfig {
  name: string;
  description: string;
  implementation: string;
  parameters: Record<string, any>;
  frequency: 'epoch' | 'batch' | 'custom';
}

export interface EarlyStoppingConfig {
  enabled: boolean;
  metric: string;
  patience: number; // epochs
  min_delta: number;
  restore_best_weights: boolean;
}

export interface TrainingDeployment {
  enabled: boolean;
  strategy: TrainingDeploymentStrategy;
  environments: TrainingEnvironment[];
  automation: DeploymentAutomation;
  validation: DeploymentValidation;
}

export interface TrainingDeploymentStrategy {
  type: 'blue_green' | 'canary' | 'rolling' | 'shadow' | 'a_b_test';
  configuration: Record<string, any>;
  rollback_strategy: string;
  approval_gates: DeploymentGate[];
}

export interface DeploymentGate {
  name: string;
  type: 'manual' | 'automated';
  criteria: GateCriteria[];
  timeout: number; // minutes
  escalation: GateEscalation;
}

export interface GateCriteria {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  value: number;
  aggregation?: string;
  timeframe?: number; // minutes
}

export interface GateEscalation {
  enabled: boolean;
  timeout: number; // minutes
  action: 'approve' | 'reject' | 'manual';
  notification: string[];
}

export interface TrainingEnvironment {
  name: string;
  type: 'development' | 'staging' | 'production' | 'testing';
  infrastructure: TrainingInfrastructure;
  configuration: TrainingEnvironmentConfig;
  monitoring: EnvironmentMonitoring;
}

export interface TrainingInfrastructure {
  provider: 'aws' | 'gcp' | 'azure' | 'on_premise' | 'hybrid';
  region: string;
  compute: ComputeInfrastructure;
  storage: StorageInfrastructure;
  networking: NetworkInfrastructure;
}

export interface ComputeInfrastructure {
  instance_types: string[];
  auto_scaling: boolean;
  spot_instances: boolean;
  preemptible: boolean;
  reserved_capacity: number; // percentage
}

export interface StorageInfrastructure {
  type: 'ssd' | 'hdd' | 'object' | 'distributed';
  capacity: number; // GB
  throughput: number; // MB/s
  redundancy: string;
  backup: StorageBackup;
}

export interface StorageBackup {
  enabled: boolean;
  frequency: string;
  retention: number; // days
  cross_region: boolean;
  encryption: boolean;
}

export interface NetworkInfrastructure {
  bandwidth: number; // Mbps
  latency: number; // ms
  security_groups: string[];
  vpc_configuration: VPCConfiguration;
}

export interface VPCConfiguration {
  vpc_id: string;
  subnets: string[];
  internet_gateway: boolean;
  nat_gateway: boolean;
  vpn_connection: boolean;
}

export interface TrainingEnvironmentConfig {
  variables: Record<string, string>;
  secrets: string[];
  dependencies: EnvironmentDependency[];
  runtime: RuntimeConfig;
}

export interface EnvironmentDependency {
  name: string;
  version: string;
  source: 'package_manager' | 'container' | 'binary' | 'source';
  configuration: Record<string, any>;
}

export interface RuntimeConfig {
  language: string;
  version: string;
  runtime_options: Record<string, any>;
  environment_variables: Record<string, string>;
  resource_limits: RuntimeResourceLimits;
}

export interface RuntimeResourceLimits {
  cpu: number; // cores
  memory: number; // GB
  gpu: number; // count
  storage: number; // GB
  network: number; // Mbps
}

export interface EnvironmentMonitoring {
  enabled: boolean;
  metrics: EnvironmentMetric[];
  alerts: EnvironmentAlert[];
  logging: EnvironmentLogging;
  tracing: EnvironmentTracing;
}

export interface EnvironmentMetric {
  name: string;
  type: 'system' | 'application' | 'business';
  collection_interval: number; // seconds
  retention_period: number; // days
  aggregation: string;
}

export interface EnvironmentAlert {
  name: string;
  condition: string;
  severity: SeverityLevel;
  notification: EnvironmentNotification;
  remediation: AutoRemediation;
}

export interface EnvironmentNotification {
  channels: string[];
  recipients: string[];
  template: string;
  rate_limit: number; // seconds
}

export interface AutoRemediation {
  enabled: boolean;
  actions: RemediationAction[];
  approval_required: boolean;
  rollback_plan: string;
}

export interface RemediationAction {
  name: string;
  type: 'restart' | 'scale' | 'redirect' | 'rollback' | 'custom';
  configuration: Record<string, any>;
  timeout: number; // seconds
  retry_count: number;
}

export interface EnvironmentLogging {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  structured: boolean;
  sampling_rate: number; // percentage
  retention_period: number; // days
}

export interface EnvironmentTracing {
  enabled: boolean;
  sampling_rate: number; // percentage
  trace_storage: string;
  retention_period: number; // days
  integration: TracingIntegration[];
}

export interface TracingIntegration {
  tool: string;
  configuration: Record<string, any>;
  enabled: boolean;
  sampling_override: number; // percentage
}

export interface DeploymentAutomation {
  enabled: boolean;
  triggers: AutomationTrigger[];
  approval_workflow: AutomationApproval;
  rollback_automation: AutomationRollback;
  notification: AutomationNotification;
}

export interface AutomationApproval {
  required: boolean;
  stages: AutomationApprovalStage[];
  bypass_conditions: string[];
  timeout: number; // minutes
}

export interface AutomationApprovalStage {
  name: string;
  approvers: string[];
  parallel: boolean;
  required_approvals: number;
  timeout: number; // minutes
}

export interface AutomationRollback {
  enabled: boolean;
  conditions: RollbackCondition[];
  strategy: string;
  approval_required: boolean;
  notification_required: boolean;
}

export interface RollbackCondition {
  metric: string;
  threshold: number;
  duration: number; // seconds
  comparison: 'baseline' | 'absolute' | 'relative';
}

export interface AutomationNotification {
  enabled: boolean;
  events: string[];
  channels: NotificationChannel[];
  templates: NotificationTemplate[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms' | 'pagerduty';
  configuration: Record<string, any>;
  enabled: boolean;
  rate_limit: number; // seconds
}

export interface NotificationTemplate {
  event: string;
  channel: string;
  template: string;
  variables: string[];
  localization: boolean;
}

export interface AIInferenceConfig {
  enabled: boolean;
  endpoints: InferenceEndpoint[];
  load_balancing: LoadBalancingConfig;
  caching: InferenceCaching;
  monitoring: InferenceMonitoring;
  optimization: InferenceOptimization;
}

export interface InferenceEndpoint {
  name: string;
  url: string;
  model: string;
  version: string;
  authentication: EndpointAuthentication;
  configuration: EndpointConfiguration;
  health_check: EndpointHealthCheck;
}

export interface EndpointAuthentication {
  type: 'none' | 'api_key' | 'oauth' | 'jwt' | 'certificate';
  configuration: Record<string, any>;
  rotation_policy: string;
  expiration_handling: string;
}

export interface EndpointConfiguration {
  timeout: number; // seconds
  retry_policy: EndpointRetryPolicy;
  rate_limiting: EndpointRateLimit;
  circuit_breaker: CircuitBreakerConfig;
}

export interface EndpointRetryPolicy {
  enabled: boolean;
  max_retries: number;
  initial_delay: number; // milliseconds
  max_delay: number; // milliseconds
  backoff_multiplier: number;
  retry_conditions: string[];
}

export interface EndpointRateLimit {
  enabled: boolean;
  requests_per_second: number;
  burst_size: number;
  queue_size: number;
  timeout: number; // seconds
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failure_threshold: number;
  recovery_timeout: number; // seconds
  half_open_max_calls: number;
  metrics_window: number; // seconds
}

export interface EndpointHealthCheck {
  enabled: boolean;
  endpoint: string;
  interval: number; // seconds
  timeout: number; // seconds
  healthy_threshold: number;
  unhealthy_threshold: number;
}

export interface LoadBalancingConfig {
  enabled: boolean;
  algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash' | 'least_response_time';
  weights: Record<string, number>;
  health_check_enabled: boolean;
  failover: FailoverConfig;
}

export interface FailoverConfig {
  enabled: boolean;
  backup_endpoints: string[];
  automatic: boolean;
  detection_threshold: number;
  recovery_threshold: number;
}

export interface InferenceCaching {
  enabled: boolean;
  levels: InferenceCacheLevel[];
  strategies: CacheStrategy[];
  invalidation: CacheInvalidation;
  metrics: CacheMetrics;
}

export interface InferenceCacheLevel {
  name: string;
  type: 'memory' | 'redis' | 'database' | 'cdn';
  configuration: Record<string, any>;
  ttl: number; // seconds
  max_size: number; // MB
}

export interface CacheMetrics {
  enabled: boolean;
  collection_interval: number; // seconds
  metrics: string[];
  alerting: CacheAlerting;
}

export interface CacheAlerting {
  enabled: boolean;
  thresholds: CacheThreshold[];
  notification: string[];
}

export interface CacheThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  value: number;
  severity: SeverityLevel;
}

export interface InferenceMonitoring {
  enabled: boolean;
  metrics: InferenceMetric[];
  logging: InferenceLogging;
  tracing: InferenceTracing;
  alerting: InferenceAlerting;
}

export interface InferenceMetric {
  name: string;
  type: 'latency' | 'throughput' | 'accuracy' | 'cost' | 'error_rate';
  collection_method: 'automatic' | 'manual' | 'sampling';
  sampling_rate: number; // percentage
  aggregation: string;
}

export interface InferenceLogging {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug';
  include_requests: boolean;
  include_responses: boolean;
  include_metadata: boolean;
  pii_filtering: PIIFiltering;
}

export interface PIIFiltering {
  enabled: boolean;
  patterns: string[];
  replacement: string;
  whitelist: string[];
}

export interface InferenceTracing {
  enabled: boolean;
  sampling_rate: number; // percentage
  trace_headers: string[];
  correlation_id: boolean;
  performance_tracking: boolean;
}

export interface InferenceAlerting {
  enabled: boolean;
  rules: InferenceAlertRule[];
  escalation: InferenceEscalation;
  suppression: AlertSuppression;
}

export interface InferenceAlertRule {
  name: string;
  condition: string;
  severity: SeverityLevel;
  duration: number; // seconds
  notification: string[];
  auto_resolution: boolean;
}

export interface InferenceEscalation {
  enabled: boolean;
  levels: InferenceEscalationLevel[];
  final_action: string;
}

export interface InferenceEscalationLevel {
  level: number;
  delay: number; // minutes
  recipients: string[];
  action: string;
}

export interface AlertSuppression {
  enabled: boolean;
  rules: SuppressionRule[];
  maintenance_windows: MaintenanceWindow[];
}

export interface SuppressionRule {
  name: string;
  condition: string;
  duration: number; // minutes
  reason: string;
}

export interface MaintenanceWindow {
  name: string;
  start: string; // cron expression or datetime
  duration: number; // minutes
  recurring: boolean;
  affected_services: string[];
}

export interface InferenceOptimization {
  enabled: boolean;
  techniques: InferenceOptimizationTechnique[];
  auto_optimization: AutoOptimization;
  cost_optimization: InferenceCostOptimization;
  performance_optimization: InferencePerformanceOptimization;
}

export interface InferenceOptimizationTechnique {
  name: string;
  type: 'batching' | 'caching' | 'compression' | 'quantization' | 'pruning' | 'distillation';
  enabled: boolean;
  configuration: Record<string, any>;
  impact_estimate: OptimizationImpact;
}

export interface OptimizationImpact {
  latency_reduction: number; // percentage
  cost_reduction: number; // percentage
  accuracy_impact: number; // percentage
  resource_savings: number; // percentage
}

export interface AutoOptimization {
  enabled: boolean;
  frequency: 'continuous' | 'hourly' | 'daily' | 'weekly';
  objectives: AutoOptimizationObjective[];
  constraints: AutoOptimizationConstraint[];
  approval_required: boolean;
}

export interface AutoOptimizationObjective {
  metric: string;
  target: number;
  weight: number;
  direction: 'minimize' | 'maximize';
}

export interface AutoOptimizationConstraint {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  value: number;
  hard_constraint: boolean;
}

export interface InferenceCostOptimization {
  enabled: boolean;
  budget_limits: BudgetLimit[];
  cost_allocation: CostAllocation;
  cost_monitoring: CostMonitoring;
  cost_controls: InferenceCostControl[];
}

export interface BudgetLimit {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  amount: number;
  currency: string;
  alert_thresholds: number[]; // percentages
  enforcement: 'soft' | 'hard';
}

export interface CostAllocation {
  enabled: boolean;
  dimensions: CostDimension[];
  reporting: CostReporting;
  chargeback: ChargebackConfig;
}

export interface CostDimension {
  name: string;
  type: 'user' | 'project' | 'model' | 'endpoint' | 'custom';
  extraction_method: string;
  default_value: string;
}

export interface CostReporting {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'csv' | 'json' | 'dashboard';
  breakdown: string[];
}

export interface ChargebackConfig {
  enabled: boolean;
  allocation_method: 'usage' | 'equal' | 'weighted' | 'custom';
  billing_frequency: 'monthly' | 'quarterly';
  approval_workflow: boolean;
}

export interface CostMonitoring {
  enabled: boolean;
  real_time: boolean;
  cost_anomaly_detection: AnomalyDetection;
  cost_forecasting: CostForecasting;
}

export interface AnomalyDetection {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  notification: string[];
  auto_investigation: boolean;
}

export interface CostForecasting {
  enabled: boolean;
  horizon: number; // days
  confidence_interval: number; // percentage
  update_frequency: 'daily' | 'weekly';
}

export interface InferenceCostControl {
  name: string;
  type: 'quota' | 'throttling' | 'prioritization' | 'scheduling';
  configuration: Record<string, any>;
  enforcement: 'advisory' | 'enforced';
  bypass_conditions: string[];
}

export interface InferencePerformanceOptimization {
  enabled: boolean;
  target_metrics: PerformanceTarget[];
  optimization_strategies: PerformanceStrategy[];
  benchmarking: PerformanceBenchmarking;
}

export interface PerformanceTarget {
  metric: string;
  target_value: number;
  priority: PriorityLevel;
  sla_requirement: boolean;
}

export interface PerformanceStrategy {
  name: string;
  type: 'scaling' | 'caching' | 'optimization' | 'routing';
  configuration: Record<string, any>;
  conditions: string[];
  impact_estimate: PerformanceImpact;
}

export interface PerformanceImpact {
  latency_improvement: number; // percentage
  throughput_improvement: number; // percentage
  resource_efficiency: number; // percentage
  cost_impact: number; // percentage change
}

export interface PerformanceBenchmarking {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  benchmarks: BenchmarkSuite[];
  reporting: BenchmarkReporting;
}

export interface BenchmarkSuite {
  name: string;
  description: string;
  test_cases: BenchmarkTestCase[];
  environment: string;
  baseline: BenchmarkBaseline;
}

export interface BenchmarkTestCase {
  name: string;
  input: any;
  expected_output?: any;
  performance_criteria: PerformanceCriteria[];
  quality_criteria: QualityCriteria[];
}

export interface PerformanceCriteria {
  metric: string;
  threshold: number;
  comparison: 'less_than' | 'greater_than' | 'equal_to';
  unit: string;
}

export interface QualityCriteria {
  metric: string;
  threshold: number;
  comparison: 'less_than' | 'greater_than' | 'equal_to';
  weight: number;
}

export interface BenchmarkBaseline {
  version: string;
  date: Date;
  metrics: Record<string, number>;
  environment: string;
}

export interface BenchmarkReporting {
  enabled: boolean;
  recipients: string[];
  format: 'dashboard' | 'report' | 'alert';
  comparison_period: string;
  trending: boolean;
}

export interface AIMonitoringConfig {
  enabled: boolean;
  comprehensive: boolean;
  real_time: boolean;
  metrics: AIMetricConfig[];
  alerts: AIAlertConfig[];
  dashboards: AIDashboardConfig[];
  reporting: AIReportingConfig;
  compliance: AIComplianceMonitoring;
}

export interface AIMetricConfig {
  name: string;
  category: 'performance' | 'quality' | 'reliability' | 'cost' | 'usage' | 'bias' | 'drift';
  collection_method: 'automatic' | 'manual' | 'calculated';
  frequency: string;
  storage_duration: number; // days
  aggregation_methods: string[];
}

export interface AIAlertConfig {
  name: string;
  description: string;
  metric: string;
  condition: AlertCondition;
  severity: SeverityLevel;
  notification: AINotificationConfig;
  escalation: AIEscalationConfig;
  auto_remediation: AIAutoRemediation;
}

export interface AlertCondition {
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'change_percent' | 'anomaly';
  threshold: number;
  duration: number; // seconds
  aggregation: 'avg' | 'sum' | 'max' | 'min' | 'count' | 'percentile';
  percentile?: number;
}

export interface AINotificationConfig {
  channels: AINotificationChannel[];
  frequency_limit: number; // seconds
  template: string;
  context_inclusion: ContextInclusion;
}

export interface AINotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms' | 'pagerduty' | 'dashboard';
  configuration: Record<string, any>;
  enabled: boolean;
  recipient_groups: string[];
}

export interface ContextInclusion {
  metrics: boolean;
  logs: boolean;
  traces: boolean;
  model_info: boolean;
  historical_data: boolean;
}

export interface AIEscalationConfig {
  enabled: boolean;
  levels: AIEscalationLevel[];
  timeout_per_level: number; // minutes
  final_action: 'notify_all' | 'auto_remediate' | 'manual_intervention';
}

export interface AIEscalationLevel {
  level: number;
  recipients: string[];
  actions: string[];
  approval_required: boolean;
  auto_escalation_condition: string;
}

export interface AIAutoRemediation {
  enabled: boolean;
  actions: RemediationAction[];
  approval_required: boolean;
  rollback_plan: RemediationRollback;
  success_criteria: string[];
}

export interface RemediationRollback {
  enabled: boolean;
  conditions: string[];
  timeout: number; // minutes
  approval_required: boolean;
}

export interface AIDashboardConfig {
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  access_control: DashboardAccessControl;
  refresh_settings: DashboardRefresh;
}

export interface DashboardLayout {
  columns: number;
  responsive: boolean;
  theme: 'light' | 'dark' | 'auto';
  custom_css?: string;
}

export interface DashboardAccessControl {
  public: boolean;
  roles: string[];
  users: string[];
  readonly: boolean;
  sharing_enabled: boolean;
}

export interface DashboardRefresh {
  auto_refresh: boolean;
  interval: number; // seconds
  on_alert: boolean;
  manual_refresh: boolean;
}

export interface AIReportingConfig {
  enabled: boolean;
  reports: AIReport[];
  distribution: ReportDistribution;
  retention: ReportRetention;
  customization: ReportCustomization;
}

export interface AIReport {
  name: string;
  type: 'performance' | 'compliance' | 'usage' | 'cost' | 'quality' | 'summary';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on_demand';
  content: ReportContent;
  format: ReportFormat;
}

export interface ReportContent {
  sections: ReportSection[];
  metrics: string[];
  time_range: TimeRange;
  comparison: ComparisonConfig;
  filtering: FilterConfig;
}

export interface ReportSection {
  name: string;
  type: 'summary' | 'detailed' | 'chart' | 'table' | 'analysis';
  content: string;
  data_sources: string[];
  visualization: VisualizationConfig;
}

export interface TimeRange {
  type: 'relative' | 'absolute';
  value: string; // e.g., "7d", "2024-01-01 to 2024-01-31"
  timezone: string;
}

export interface ComparisonConfig {
  enabled: boolean;
  baseline: 'previous_period' | 'same_period_last_year' | 'custom';
  custom_baseline?: string;
  metrics: string[];
}

export interface FilterConfig {
  enabled: boolean;
  filters: ReportFilter[];
  global_filters: string[];
}

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'not_in' | 'gt' | 'gte' | 'lt' | 'lte';
  value: any;
  description: string;
}

export interface VisualizationConfig {
  type: 'chart' | 'table' | 'metric' | 'text' | 'image';
  chart_type?: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'gauge';
  configuration: Record<string, any>;
}

export interface ReportFormat {
  type: 'pdf' | 'html' | 'excel' | 'csv' | 'json' | 'dashboard';
  template: string;
  styling: ReportStyling;
  interactive: boolean;
}

export interface ReportStyling {
  theme: string;
  colors: string[];
  fonts: FontConfig[];
  layout: string;
  branding: BrandingConfig;
}

export interface FontConfig {
  name: string;
  family: string;
  size: number;
  weight: string;
  usage: 'heading' | 'body' | 'caption' | 'code';
}

export interface BrandingConfig {
  logo: string;
  colors: ColorScheme;
  header: HeaderConfig;
  footer: FooterConfig;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export interface HeaderConfig {
  enabled: boolean;
  content: string;
  logo: boolean;
  date: boolean;
  page_numbers: boolean;
}

export interface FooterConfig {
  enabled: boolean;
  content: string;
  page_numbers: boolean;
  timestamp: boolean;
  branding: boolean;
}

export interface ReportDistribution {
  automatic: boolean;
  recipients: RecipientConfig[];
  delivery: DeliveryConfig;
  notifications: DistributionNotification[];
}

export interface RecipientConfig {
  type: 'user' | 'group' | 'role' | 'external';
  identifier: string;
  delivery_preference: 'email' | 'portal' | 'api' | 'file_share';
  format_preference: string;
}

export interface DeliveryConfig {
  methods: DeliveryMethod[];
  scheduling: DeliveryScheduling;
  retry_policy: DeliveryRetryPolicy;
}

export interface DeliveryMethod {
  type: 'email' | 'file_share' | 'api' | 'webhook' | 'portal';
  configuration: Record<string, any>;
  encryption: boolean;
  compression: boolean;
}

export interface DeliveryScheduling {
  timezone: string;
  time_of_day: string; // HH:MM
  business_days_only: boolean;
  holiday_handling: 'skip' | 'delay' | 'deliver';
}

export interface DeliveryRetryPolicy {
  enabled: boolean;
  max_attempts: number;
  retry_delay: number; // minutes
  exponential_backoff: boolean;
  failure_notification: boolean;
}

export interface DistributionNotification {
  event: 'success' | 'failure' | 'delay' | 'retry';
  recipients: string[];
  template: string;
  channels: string[];
}

export interface ReportRetention {
  enabled: boolean;
  duration: number; // days
  archive_policy: 'delete' | 'archive' | 'compress';
  compliance_requirements: string[];
}

export interface ReportCustomization {
  enabled: boolean;
  user_customization: boolean;
  template_customization: boolean;
  data_source_customization: boolean;
  approval_required: boolean;
}

export interface AIComplianceMonitoring {
  enabled: boolean;
  frameworks: ComplianceFramework[];
  auditing: ComplianceAuditing;
  reporting: ComplianceReporting;
  remediation: ComplianceRemediation;
}

export interface ComplianceFramework {
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  monitoring: FrameworkMonitoring;
  certification: CertificationRequirement;
}

export interface FrameworkMonitoring {
  enabled: boolean;
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly';
  automated_checks: boolean;
  manual_reviews: boolean;
  documentation_tracking: boolean;
}

export interface CertificationRequirement {
  required: boolean;
  authority: string;
  validity_period: number; // months
  renewal_process: string;
  audit_frequency: string;
}

export interface ComplianceAuditing {
  enabled: boolean;
  internal_audits: InternalAuditConfig;
  external_audits: ExternalAuditConfig;
  continuous_monitoring: ContinuousMonitoringConfig;
}

export interface InternalAuditConfig {
  frequency: 'monthly' | 'quarterly' | 'annually';
  scope: string[];
  auditors: string[];
  automation_level: number; // percentage
}

export interface ExternalAuditConfig {
  frequency: 'annually' | 'bi_annually';
  auditor_requirements: string[];
  scope: string[];
  preparation_time: number; // weeks
}

export interface ContinuousMonitoringConfig {
  enabled: boolean;
  tools: string[];
  metrics: string[];
  alerting: boolean;
  reporting: boolean;
}

export interface ComplianceRemediation {
  enabled: boolean;
  automatic: boolean;
  workflow: RemediationWorkflow;
  tracking: RemediationTracking;
  reporting: RemediationReporting;
}

export interface RemediationWorkflow {
  stages: RemediationStage[];
  approval_required: boolean;
  documentation_required: boolean;
  verification_required: boolean;
}

export interface RemediationStage {
  name: string;
  type: 'identification' | 'analysis' | 'planning' | 'implementation' | 'verification';
  automated: boolean;
  duration: number; // hours
  dependencies: string[];
}

export interface RemediationTracking {
  enabled: boolean;
  metrics: TrackingMetric[];
  milestones: RemediationMilestone[];
  reporting_frequency: string;
}

export interface RemediationMilestone {
  name: string;
  description: string;
  criteria: string[];
  deadline: string;
  critical_path: boolean;
}

export interface RemediationReporting {
  enabled: boolean;
  stakeholders: string[];
  frequency: string;
  format: string;
  escalation_rules: string[];
}

// Export all types as a namespace for easier imports
export namespace TemplateConfig {
  // Re-export all types for convenience
  export type Template = BaseTemplateConfig;
  export type Metadata = TemplateMetadata;
  export type Structure = TemplateStructure;
  export type Customization = CustomizationConfig;
  export type AI = AICustomizationSupport;
  export type Performance = PerformanceSpecs;
  export type Security = SecuritySpecs;
  export type Accessibility = AccessibilitySpecs;
  export type Quality = QualityMetrics;
  export type Popularity = PopularityMetrics;
  export type Usage = UsageMetrics;
  export type SEO = SEOConfig;
}

// Default configurations and utilities
export const DEFAULT_TEMPLATE_CONFIG: Partial<BaseTemplateConfig> = {
  status: 'draft',
  tags: [],
  keywords: [],
  created: new Date(),
  updated: new Date()
};

export const TEMPLATE_VALIDATION_RULES = {
  REQUIRED_FIELDS: ['id', 'name', 'version', 'type', 'category'],
  NAME_PATTERN: /^[a-zA-Z0-9\-_\s]+$/,
  VERSION_PATTERN: /^\d+\.\d+\.\d+$/,
  ID_PATTERN: /^[a-z0-9\-_]+$/
};

export const COMPLEXITY_LEVELS: ComplexityLevel[] = ['simple', 'moderate', 'complex', 'expert'];
export const MATURITY_LEVELS: MaturityLevel[] = ['experimental', 'beta', 'stable', 'mature', 'legacy'];
export const PRIORITY_LEVELS: PriorityLevel[] = ['low', 'medium', 'high', 'critical'];
export const SEVERITY_LEVELS: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];