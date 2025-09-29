// Client Requirements Types
export interface ClientRequirements {
  // Business Features
  ecommerce?: boolean
  subscriptions?: boolean
  booking?: boolean
  inventory?: boolean
  reporting?: boolean
  paymentProcessing?: boolean
  subscriptionModel?: boolean
  marketplace?: boolean

  // Technical Features
  userManagement?: boolean
  dashboard?: boolean
  search?: boolean
  notifications?: boolean
  fileUpload?: boolean
  apiIntegration?: boolean
  dataExport?: boolean
  webhooks?: boolean
  multiTenant?: boolean

  // UI/UX Features
  darkMode?: boolean
  customTheme?: boolean
  accessibility?: boolean
  i18n?: boolean

  // Marketing Features
  emailMarketing?: boolean
  emailCampaigns?: boolean
  emailAutomation?: boolean
  analytics?: boolean
  conversionTracking?: boolean
  customAnalytics?: boolean

  // CRM Features
  crm?: boolean
  salesPipeline?: boolean
  crmAutomation?: boolean

  // Security Features
  authenticationMethod?: 'email-password' | 'magic-link' | 'oauth' | 'multi-factor'
  multiFactorAuth?: boolean
  socialLogin?: boolean
  securityLevel?: 'basic' | 'medium' | 'high'
  gdprCompliance?: boolean
  dataEncryption?: boolean
}

// Technical Configuration Types
export interface TechnicalCustomization {
  architecture: string
  database: any
  caching: any
  authentication: any
  apiConfiguration: any
  frontendFramework: string
  stateManagement: string
  deployment: any
}

// Feature Types
export interface FeatureSet {
  core: string[]
  business: string[]
  technical: string[]
  ui: string[]
  security: string[]
}

// Integration Types
export interface IntegrationConfig {
  type: string
  provider: string
  configuration: any
}

export interface IntegrationProvider {
  id: string
  name: string
  type: string
  description: string
  features: string[]
  pricing: {
    tier: 'free' | 'low' | 'medium' | 'high'
    model: string
  }
  complexity: 'simple' | 'moderate' | 'complex'
  setupTime: string
  baseImplementationTime: number
  industries: string[]
  businessModels: string[]
  apiDocumentation: string
  defaultConfig: any
}

// Performance Types
export interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  bundleSize: number
  lighthouse: number
}

// Customization Results
export interface CustomizationResult {
  id: string
  configuration: TechnicalCustomization
  features: FeatureSet
  integrations: IntegrationConfig[]
  performance: {
    estimatedLoadTime: number
    estimatedBundleSize: number
    optimizationRecommendations: string[]
  }
  complexity: 'low' | 'medium' | 'high'
  estimatedDevelopmentTime: number
}

// Technical Customization Configuration
export interface TechnicalCustomizationConfig {
  clientId: string
  requirements: ClientRequirements
  targetPlatform: 'web' | 'mobile' | 'hybrid'
  performanceTargets: {
    loadTime: number
    bundleSize: number
    lighthouse: number
  }
  scalabilityRequirements: {
    expectedUsers: number
    dataVolume: 'small' | 'medium' | 'large'
    concurrency: number
  }
}

// Feature Generation Types
export interface FeatureGenerationConfig {
  clientId: string
  requirements: ClientRequirements
  targetFramework: 'next.js' | 'react-native' | 'next.js-pwa'
  designSystem: 'material' | 'tailwind' | 'custom'
  complexityLevel: 'minimal' | 'standard' | 'advanced'
}

export interface ModuleConfig {
  name: string
  path: string
  exports: string[]
}

export interface ComponentConfig {
  name: string
  path: string
  props: string[]
}

export interface GeneratedFeature {
  id: string
  name: string
  description: string
  module: ModuleConfig
  components: ComponentConfig[]
  dependencies: string[]
  configuration: any
  estimatedImplementationTime: number
  priority: 'high' | 'medium' | 'low'
}

// Integration Customization Types
export interface IntegrationCustomizationConfig {
  clientId: string
  industryType: string
  businessModel: 'b2b' | 'b2c' | 'marketplace' | 'saas'
  requiredIntegrations: string[]
  budget: 'low' | 'medium' | 'high'
  timeline: 'urgent' | 'standard' | 'flexible'
  technicalSkill: 'basic' | 'intermediate' | 'advanced'
}

export interface CustomizationSettings {
  branding: {
    colors: any
    logo: boolean
    customDomain: boolean
  }
  features: string[]
  workflow: any
  notifications: any
  security: any
  performance: any
}

export interface CustomizedIntegration {
  id: string
  provider: IntegrationProvider
  configuration: any
  customization: CustomizationSettings
  implementation: {
    priority: 'critical' | 'high' | 'medium' | 'low'
    complexity: 'simple' | 'moderate' | 'complex'
    estimatedHours: number
    dependencies: string[]
    phases?: string[]
  }
  testing: {
    testSuite: string[]
    mockData: any
    validationRules: string[]
    performanceTests?: boolean
    securityTests?: boolean
  }
  documentation: {
    setup: string
    configuration: string
    troubleshooting: string
    apiReference?: string
    examples?: any
  }
}

export interface IntegrationRecommendation {
  provider: string
  reasoning: string
  benefits: string[]
  limitations: string[]
  cost: 'free' | 'low' | 'medium' | 'high'
  alternatives: string[]
}

// Performance Optimization Types
export interface PerformanceOptimizationConfig {
  clientId: string
  targetPlatform: 'web' | 'mobile' | 'hybrid'
  userBase: 'small' | 'medium' | 'large'
  dataVolume: 'light' | 'moderate' | 'heavy'
  budget: 'low' | 'medium' | 'high'
  performanceTargets: {
    loadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
    firstInputDelay: number
    bundleSize: number
  }
  constraints: {
    serverless: boolean
    cdn: boolean
    caching: boolean
    compression: boolean
  }
}

export interface OptimizationStrategy {
  name: string
  category: 'frontend' | 'backend' | 'infrastructure' | 'database'
  description: string
}

export interface OptimizationImplementation {
  category: 'frontend' | 'backend' | 'infrastructure' | 'database'
  technique: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  code: string
  dependencies: string[]
  configuration: any
}

export interface OptimizationResult {
  id: string
  strategy: OptimizationStrategy | string
  implementations: OptimizationImplementation[]
  expectedImprovements: PerformanceMetrics
  estimatedCost: 'low' | 'medium' | 'high'
  implementationTime: number
  complexity: 'simple' | 'moderate' | 'complex'
  priority: 'low' | 'medium' | 'high' | 'critical'
  score?: number
}