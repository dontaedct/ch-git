export interface TutorialConfig {
  id: string;
  title: string;
  description: string;
  walkthroughId: string;
  clientId: string;
  appId: string;
  templateId: string;
  interactivityLevel: 'basic' | 'advanced' | 'expert';
  adaptiveMode: boolean;
  progressTracking: boolean;
  gamification: boolean;
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  type: string;
  order: number;
  estimatedDuration: number;
  required: boolean;
  interactive: boolean;
  elements: any[];
  validation: any;
  hints: string[];
  completion: {
    requiresInteraction: boolean;
    autoAdvance: boolean;
    validationRequired: boolean;
  };
  enhanced?: boolean;
  interactivityLevel?: 'basic' | 'advanced' | 'expert';
  feedback?: {
    success?: string;
    error?: string;
    hint?: string;
    adaptive?: boolean;
    personalized?: boolean;
  };
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
}

export interface InteractiveElement {
  id: string;
  type: 'click' | 'form' | 'navigation' | 'guidance' | 'progress' | 'overlay';
  stepId: string;
  selector?: string;
  action: string;
  target?: string;
  data?: any;
  feedback?: {
    success: string;
    error: string;
    hint: string;
  };
  validation?: {
    required: boolean;
    timeout: number;
    attempts?: number;
  };
  guidance?: {
    arrow: boolean;
    spotlight: boolean;
    tooltip: boolean;
    animation: string;
  };
  progress?: {
    type: string;
    showPercentage: boolean;
    showSteps: boolean;
  };
  overlay?: {
    type: string;
    interactive: boolean;
    dismissible: boolean;
  };
  adaptive?: {
    enabled: boolean;
    responseTime: boolean;
    errorPatterns: boolean;
    preferenceTracking: boolean;
  };
}

export interface TutorialProgress {
  tutorialId: string;
  userId: string;
  currentStepIndex: number;
  completedSteps: string[];
  timeSpent: number;
  startedAt: Date;
  lastActiveAt: Date;
  completedAt?: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  score: number;
  bookmarks: TutorialBookmark[];
  adaptiveMode?: boolean;
  adaptiveData?: Record<string, any>;
}

export interface TutorialBookmark {
  stepId: string;
  note: string;
  createdAt: Date;
}