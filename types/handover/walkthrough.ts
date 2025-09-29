export interface WalkthroughConfig {
  id: string;
  title: string;
  description: string;
  version: string;
  steps: WalkthroughStep[];
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  customization?: {
    allowStepReordering: boolean;
    allowStepDeletion: boolean;
    allowStepModification: boolean;
    allowBrandingCustomization: boolean;
    allowContentCustomization: boolean;
  };
}

export interface WalkthroughStep {
  id: string;
  title: string;
  content: string;
  type: 'introduction' | 'navigation' | 'feature' | 'configuration' | 'completion' | 'video' | 'interactive' | 'task' | 'overview' | 'management' | 'security' | 'maintenance' | 'integration' | 'analytics' | 'support';
  order: number;
  estimatedDuration: number;
  required: boolean;
  optional?: boolean;
  screenshotConfig?: ScreenshotConfig[];
  videoConfig?: VideoConfig[];
  annotations?: Annotation[];
  interactions?: StepInteractions;
  validation?: StepValidation;
  feedback?: StepFeedback;
  hints?: string[];
  assets?: {
    screenshots: string[];
    videos: string[];
    annotations: any[];
  };
  // Enhanced properties for interactive tutorials
  interactive?: boolean;
  controls?: {
    nextButton: boolean;
    previousButton: boolean;
    skipButton: boolean;
    helpButton: boolean;
  };
  enhanced?: boolean;
  interactivityLevel?: 'basic' | 'advanced' | 'expert';
  challenges?: any[];
  alternatives?: any[];
  gamification?: {
    points: number;
    badges: string[];
    achievements: any[];
  };
  adaptive?: {
    enabled: boolean;
    difficultyAdjustment: boolean;
    personalizedContent: boolean;
    learningStyle: string;
    adaptations: {
      visual: boolean;
      auditory: boolean;
      kinesthetic: boolean;
    };
  };
  elements?: any[];
}

export interface ScreenshotConfig {
  path: string;
  selector: string;
  annotations: Annotation[];
}

export interface VideoConfig {
  path: string;
  actions: string[];
  duration: number;
  effects?: string[];
  annotations?: Annotation[];
}

export interface Annotation {
  type: 'highlight' | 'arrow' | 'text' | 'circle' | 'rectangle';
  selector?: string;
  text: string;
  position?: {
    x: number;
    y: number;
  };
  style?: Record<string, any>;
}

export interface StepInteractions {
  click?: {
    selector: string;
    target: string;
  };
  form?: {
    selector: string;
    data: Record<string, any>;
  };
  navigate?: {
    selector: string;
    target: string;
  };
}

export interface StepValidation {
  timeout?: number;
  maxAttempts?: number;
  criteria?: string[];
  required?: boolean;
}

export interface StepFeedback {
  success?: string;
  error?: string;
  hint?: string;
  adaptive?: boolean;
  personalized?: boolean;
}

export interface WalkthroughMetadata {
  id: string;
  title: string;
  description: string;
  clientId: string;
  appId: string;
  templateId: string;
  language: string;
  format: 'interactive' | 'video' | 'pdf' | 'all';
  version: string;
  tags: string[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  interactiveFeatures?: boolean;
  videoGenerated?: boolean;
}