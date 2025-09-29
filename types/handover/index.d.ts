// Handover and Documentation Generation Types

export interface DocumentationTemplate {
  id: string;
  name: string;
  sections: string[];
  format: 'markdown' | 'html' | 'pdf' | 'docx';
  description?: string;
  estimatedTime?: string;
  targetAudience?: string;
  icon?: string;
}

export interface ClientConfig {
  clientId: string;
  businessName: string;
  domain?: string;
  timezone?: string;
  language?: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    theme?: string;
  };
  enabledFeatures?: string[];
  integrations?: Array<{
    name: string;
    description: string;
    status: string;
    type?: string;
  }>;
  screenshots?: string[];
}

export interface GeneratedDocumentation {
  id: string;
  clientId: string;
  templateType: string;
  title: string;
  content: string;
  assets: string[];
  generatedAt: Date;
  version: string;
  format: string;
  metadata?: {
    wordCount?: number;
    pageCount?: number;
    estimatedReadTime?: string;
    sections?: string[];
    author?: string;
    reviewedBy?: string;
  };
}

export interface DocumentationGenerationRequest {
  clientId: string;
  templateType: string;
  customizations?: {
    includeSections?: string[];
    excludeSections?: string[];
    additionalContent?: Record<string, string>;
    brandingOverrides?: Partial<ClientConfig['branding']>;
  };
  outputFormat?: 'markdown' | 'html' | 'pdf' | 'docx';
  includeAssets?: boolean;
  generateTOC?: boolean;
}

export interface DocumentationGenerationResult {
  success: boolean;
  documentId?: string;
  downloadUrl?: string;
  previewUrl?: string;
  error?: string;
  metadata?: {
    generationTime: number;
    wordCount: number;
    pageCount: number;
    sectionsGenerated: number;
  };
}

export interface SOPTemplate {
  id: string;
  name: string;
  category: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    estimatedTime?: string;
    prerequisites?: string[];
    tools?: string[];
    warnings?: string[];
  }>;
  metadata?: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedDuration: string;
    targetRole: string;
    lastUpdated: Date;
  };
}

export interface UserGuideSection {
  id: string;
  title: string;
  content: string;
  subsections?: UserGuideSection[];
  screenshots?: string[];
  videoUrl?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime?: string;
}

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  action?: 'click' | 'type' | 'wait' | 'navigate' | 'verify';
  target?: string;
  value?: string;
  screenshot?: string;
  tooltip?: string;
  duration?: number;
}

export interface AutomatedWalkthrough {
  id: string;
  title: string;
  description: string;
  targetFeature: string;
  steps: WalkthroughStep[];
  estimatedDuration: string;
  prerequisites?: string[];
  learningObjectives?: string[];
  metadata?: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}

export interface VideoGenerationConfig {
  resolution: '720p' | '1080p' | '4k';
  frameRate: number;
  includeAudio: boolean;
  voiceOver?: {
    enabled: boolean;
    voice: string;
    speed: number;
    language: string;
  };
  branding?: {
    watermark?: string;
    introSlide?: boolean;
    outroSlide?: boolean;
    brandColors?: string[];
  };
}

export interface InteractiveTutorial {
  id: string;
  title: string;
  description: string;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      type: 'video' | 'interactive' | 'quiz' | 'reading';
      content: string;
      duration: string;
      completionCriteria?: string;
    }>;
  }>;
  progressTracking: {
    trackingEnabled: boolean;
    saveProgress: boolean;
    generateCertificate: boolean;
  };
}

export interface ClientAccessCredentials {
  userId: string;
  username: string;
  temporaryPassword: string;
  mustChangePassword: boolean;
  roles: string[];
  permissions: string[];
  expiresAt?: Date;
  activationRequired: boolean;
}

export interface AdminAccessPackage {
  clientId: string;
  credentials: ClientAccessCredentials[];
  accessUrls: {
    adminPanel: string;
    userPortal: string;
    documentation: string;
    support: string;
  };
  securityInformation: {
    passwordPolicy: string;
    mfaRequired: boolean;
    sessionTimeout: string;
    ipRestrictions?: string[];
  };
  emergencyContacts: Array<{
    name: string;
    role: string;
    email: string;
    phone?: string;
  }>;
}

export interface OnboardingChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'setup' | 'training' | 'verification' | 'handover';
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo?: string;
  dueDate?: Date;
  dependencies?: string[];
  resources?: Array<{
    type: 'document' | 'video' | 'tutorial' | 'link';
    title: string;
    url: string;
  }>;
}

export interface ClientOnboardingPlan {
  clientId: string;
  planId: string;
  title: string;
  description: string;
  checklist: OnboardingChecklistItem[];
  timeline: {
    startDate: Date;
    targetCompletionDate: Date;
    phases: Array<{
      id: string;
      title: string;
      startDate: Date;
      endDate: Date;
      items: string[]; // OnboardingChecklistItem IDs
    }>;
  };
  progress: {
    overallProgress: number;
    completedItems: number;
    totalItems: number;
    currentPhase: string;
    estimatedCompletion: Date;
  };
  stakeholders: Array<{
    userId: string;
    name: string;
    email: string;
    role: string;
    responsibilities: string[];
  }>;
}

export interface TrainingMaterial {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'interactive' | 'presentation' | 'quiz';
  content: string;
  targetAudience: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  prerequisites?: string[];
  learningObjectives: string[];
  assessmentCriteria?: string[];
  resources: Array<{
    type: string;
    title: string;
    url: string;
    description?: string;
  }>;
  metadata: {
    version: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  };
}

export interface ProgressTrackingData {
  userId: string;
  clientId: string;
  onboardingPlanId: string;
  progress: {
    completedItems: string[];
    currentItem?: string;
    startedAt: Date;
    lastActivityAt: Date;
    estimatedCompletionAt?: Date;
  };
  assessmentResults?: Array<{
    materialId: string;
    score: number;
    maxScore: number;
    completedAt: Date;
    attempts: number;
  }>;
  feedback?: Array<{
    itemId: string;
    rating: number;
    comment: string;
    submittedAt: Date;
  }>;
  notes?: Array<{
    id: string;
    content: string;
    createdAt: Date;
    createdBy: string;
    type: 'system' | 'user' | 'admin';
  }>;
}

export interface SupportAutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'keyword' | 'category' | 'priority' | 'time_based';
    conditions: Record<string, any>;
  };
  action: {
    type: 'assign' | 'escalate' | 'auto_response' | 'notify' | 'create_ticket';
    parameters: Record<string, any>;
  };
  enabled: boolean;
  priority: number;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastTriggered?: Date;
    triggerCount: number;
  };
}

export interface HandoverPackage {
  clientId: string;
  packageId: string;
  title: string;
  description: string;
  components: {
    documentation: string[]; // GeneratedDocumentation IDs
    credentials: AdminAccessPackage;
    onboardingPlan: ClientOnboardingPlan;
    trainingMaterials: string[]; // TrainingMaterial IDs
    walkthroughs: string[]; // AutomatedWalkthrough IDs
    supportContacts: Array<{
      type: 'technical' | 'business' | 'emergency';
      name: string;
      email: string;
      phone?: string;
      availability: string;
    }>;
  };
  deliveryMethod: 'email' | 'portal' | 'secure_link' | 'physical';
  status: 'preparing' | 'ready' | 'delivered' | 'acknowledged';
  createdAt: Date;
  deliveredAt?: Date;
  acknowledgedAt?: Date;
  metadata?: {
    generatedBy: string;
    approvedBy?: string;
    deliveryConfirmation?: string;
    clientFeedback?: {
      rating: number;
      comment: string;
      submittedAt: Date;
    };
  };
}

// Event types for tracking and analytics
export interface HandoverEvent {
  id: string;
  clientId: string;
  eventType: 'documentation_generated' | 'walkthrough_created' | 'credentials_issued' |
             'onboarding_started' | 'training_completed' | 'handover_delivered' |
             'feedback_received' | 'support_request';
  eventData: Record<string, any>;
  timestamp: Date;
  userId?: string;
  metadata?: {
    source: string;
    version: string;
    correlationId?: string;
  };
}

// API Response types
export interface HandoverAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

// Configuration types
export interface HandoverSystemConfig {
  documentation: {
    defaultTemplate: string;
    supportedFormats: string[];
    maxGenerationTime: number;
    includeAssetsByDefault: boolean;
  };
  walkthroughs: {
    defaultResolution: string;
    maxDuration: number;
    supportedFormats: string[];
    voiceOverEnabled: boolean;
  };
  onboarding: {
    defaultTimelineWeeks: number;
    requiredChecklistItems: string[];
    autoAssignRoles: boolean;
    sendNotifications: boolean;
  };
  security: {
    credentialExpiration: number;
    passwordComplexity: string;
    mfaRequired: boolean;
    sessionTimeout: number;
  };
}