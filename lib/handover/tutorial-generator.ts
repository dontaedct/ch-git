/**
 * @fileoverview Interactive Tutorial Creation System
 * @module lib/handover/tutorial-generator
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.3: Interactive tutorial creation system for generating guided walkthroughs
 * with step-by-step instructions, tooltips, highlights, and user interaction tracking.
 */

import { z } from 'zod';
import { ClientConfiguration } from '../../types/handover/deliverables-types';

// Tutorial configuration types
export interface TutorialConfiguration {
  id: string;
  clientId: string;
  clientConfig: ClientConfiguration;
  tutorial: TutorialDefinition;
  interactivity: InteractivitySettings;
  presentation: PresentationSettings;
  tracking: TrackingSettings;
  metadata: TutorialMetadata;
}

export interface TutorialDefinition {
  id: string;
  title: string;
  description: string;
  type: TutorialType;
  difficulty: TutorialDifficulty;
  estimatedDuration: number; // minutes
  prerequisites: string[];
  learningObjectives: string[];
  steps: TutorialStep[];
  assessments?: TutorialAssessment[];
}

export type TutorialType = 
  | 'guided_tour'
  | 'hands_on_practice'
  | 'interactive_demo'
  | 'step_by_step'
  | 'knowledge_check'
  | 'troubleshooting'
  | 'workflow_training';

export type TutorialDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TutorialStep {
  id: string;
  order: number;
  title: string;
  description: string;
  content: StepContent;
  interaction: StepInteraction;
  validation: StepValidation;
  hints: StepHint[];
  navigation: StepNavigation;
}

export interface StepContent {
  type: ContentType;
  target?: ElementTarget;
  highlight?: HighlightConfig;
  tooltip?: TooltipConfig;
  overlay?: OverlayConfig;
  media?: MediaContent;
  text?: TextContent;
}

export type ContentType = 
  | 'tooltip'
  | 'modal'
  | 'highlight'
  | 'hotspot'
  | 'overlay'
  | 'sidebar'
  | 'banner'
  | 'popup'
  | 'inline';

export interface ElementTarget {
  selector: string;
  position: TargetPosition;
  offset?: { x: number; y: number };
  scrollIntoView?: boolean;
  waitForElement?: boolean;
  timeout?: number;
}

export type TargetPosition = 
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';

export interface HighlightConfig {
  enabled: boolean;
  style: HighlightStyle;
  animation?: AnimationConfig;
  duration?: number; // milliseconds
}

export interface HighlightStyle {
  color: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadow?: string;
  opacity?: number;
  zIndex?: number;
}

export interface AnimationConfig {
  type: 'pulse' | 'glow' | 'shake' | 'bounce' | 'fade' | 'zoom';
  duration: number; // milliseconds
  iterations: number | 'infinite';
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

export interface TooltipConfig {
  content: string;
  position: TargetPosition;
  arrow: boolean;
  theme: TooltipTheme;
  autoClose?: boolean;
  closeDelay?: number; // milliseconds
  trigger?: TooltipTrigger;
}

export type TooltipTheme = 'light' | 'dark' | 'branded' | 'minimal' | 'info' | 'warning' | 'error';

export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

export interface OverlayConfig {
  enabled: boolean;
  opacity: number;
  color: string;
  blur: boolean;
  blockInteraction: boolean;
  zIndex: number;
  clickToClose?: boolean;
}

export interface MediaContent {
  type: 'image' | 'video' | 'audio' | 'animation' | 'diagram';
  url: string;
  alt?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  dimensions?: { width: number; height: number };
}

export interface TextContent {
  html: string;
  markdown?: string;
  plainText?: string;
  formatting: TextFormatting;
}

export interface TextFormatting {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder';
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface StepInteraction {
  required: boolean;
  type: InteractionType;
  target?: string; // CSS selector
  validation?: InteractionValidation;
  feedback: InteractionFeedback;
  timeout?: number; // milliseconds
  retries?: number;
}

export type InteractionType = 
  | 'click'
  | 'type'
  | 'select'
  | 'drag'
  | 'scroll'
  | 'hover'
  | 'keyboard'
  | 'wait'
  | 'custom';

export interface InteractionValidation {
  enabled: boolean;
  rules: ValidationRule[];
  customValidator?: string; // JavaScript function
}

export interface ValidationRule {
  type: 'element_exists' | 'element_visible' | 'text_contains' | 'value_equals' | 'url_matches';
  target?: string;
  expected?: string;
  message?: string;
}

export interface InteractionFeedback {
  success: FeedbackMessage;
  error: FeedbackMessage;
  hint?: FeedbackMessage;
  encouragement?: string[];
}

export interface FeedbackMessage {
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // milliseconds
  dismissible?: boolean;
}

export interface StepValidation {
  enabled: boolean;
  automatic: boolean;
  conditions: ValidationCondition[];
  customLogic?: string; // JavaScript function
}

export interface ValidationCondition {
  type: 'element_state' | 'page_state' | 'user_action' | 'time_based' | 'custom';
  condition: string;
  expected: any;
  operator?: 'equals' | 'contains' | 'exists' | 'visible' | 'enabled';
}

export interface StepHint {
  id: string;
  trigger: HintTrigger;
  content: string;
  type: 'text' | 'arrow' | 'highlight' | 'animation';
  position?: TargetPosition;
  delay?: number; // milliseconds
}

export interface HintTrigger {
  type: 'time' | 'idle' | 'retry' | 'request' | 'error';
  threshold?: number;
  condition?: string;
}

export interface StepNavigation {
  previous: NavigationConfig;
  next: NavigationConfig;
  skip: NavigationConfig;
  exit: NavigationConfig;
}

export interface NavigationConfig {
  enabled: boolean;
  label?: string;
  icon?: string;
  position?: 'top' | 'bottom' | 'floating' | 'inline';
  confirmation?: ConfirmationConfig;
}

export interface ConfirmationConfig {
  required: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface TutorialAssessment {
  id: string;
  type: 'quiz' | 'task' | 'observation' | 'reflection';
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  passingScore: number;
  attempts: number;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'task_completion';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  hints?: string[];
}

export interface InteractivitySettings {
  mode: InteractivityMode;
  guidance: GuidanceLevel;
  adaptivity: AdaptivitySettings;
  accessibility: AccessibilitySettings;
  customization: CustomizationOptions;
}

export type InteractivityMode = 'guided' | 'self_paced' | 'exploratory' | 'assessment' | 'practice';

export type GuidanceLevel = 'minimal' | 'moderate' | 'extensive' | 'adaptive';

export interface AdaptivitySettings {
  enabled: boolean;
  personalizeContent: boolean;
  adjustDifficulty: boolean;
  trackProgress: boolean;
  recommendNextSteps: boolean;
  adaptTiming: boolean;
}

export interface AccessibilitySettings {
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusIndicators: boolean;
  altText: boolean;
}

export interface CustomizationOptions {
  allowSkipping: boolean;
  allowRestart: boolean;
  saveProgress: boolean;
  bookmarks: boolean;
  notes: boolean;
  speed: SpeedSettings;
}

export interface SpeedSettings {
  adjustable: boolean;
  options: number[]; // Multipliers: [0.5, 1, 1.5, 2]
  default: number;
}

export interface PresentationSettings {
  theme: PresentationTheme;
  layout: LayoutSettings;
  branding: BrandingSettings;
  responsive: ResponsiveSettings;
}

export interface PresentationTheme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
}

export interface ThemeColors {
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

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeAnimations {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface LayoutSettings {
  position: 'overlay' | 'sidebar' | 'inline' | 'modal';
  width: string | number;
  height: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  padding: string;
  margin: string;
  zIndex: number;
}

export interface BrandingSettings {
  logo?: string;
  favicon?: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  customCSS?: string;
}

export interface ResponsiveSettings {
  enabled: boolean;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  adaptations: ResponsiveAdaptation[];
}

export interface ResponsiveAdaptation {
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  changes: Record<string, any>;
}

export interface TrackingSettings {
  enabled: boolean;
  events: TrackingEvent[];
  analytics: AnalyticsConfig;
  privacy: PrivacySettings;
}

export interface TrackingEvent {
  type: EventType;
  enabled: boolean;
  customData?: Record<string, any>;
}

export type EventType = 
  | 'tutorial_start'
  | 'tutorial_complete'
  | 'tutorial_exit'
  | 'step_start'
  | 'step_complete'
  | 'step_skip'
  | 'hint_request'
  | 'error_encounter'
  | 'interaction_attempt'
  | 'navigation_action';

export interface AnalyticsConfig {
  provider: 'google_analytics' | 'mixpanel' | 'amplitude' | 'custom';
  trackingId?: string;
  customEndpoint?: string;
  batchSize: number;
  flushInterval: number; // milliseconds
}

export interface PrivacySettings {
  anonymizeData: boolean;
  respectDoNotTrack: boolean;
  consentRequired: boolean;
  dataRetention: number; // days
}

export interface TutorialMetadata {
  title: string;
  description: string;
  version: string;
  author: string;
  created: Date;
  updated: Date;
  tags: string[];
  category: string;
  language: string;
  targetAudience: string[];
}

// Tutorial session types
export interface TutorialSession {
  id: string;
  configurationId: string;
  userId?: string;
  status: TutorialStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // seconds
  progress: TutorialProgress;
  interactions: UserInteraction[];
  results?: TutorialResults;
}

export type TutorialStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'abandoned'
  | 'failed'
  | 'paused';

export interface TutorialProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  completedSteps: number[];
  skippedSteps: number[];
  timeSpent: number; // seconds
  hintsUsed: number;
  errorsEncountered: number;
}

export interface UserInteraction {
  id: string;
  timestamp: Date;
  stepId: string;
  type: InteractionType;
  target?: string;
  success: boolean;
  duration: number; // milliseconds
  attempts: number;
  data?: any;
}

export interface TutorialResults {
  completed: boolean;
  score?: number;
  feedback: string;
  recommendations: string[];
  timeToComplete: number; // seconds
  efficiency: number; // percentage
  assessmentResults?: AssessmentResult[];
}

export interface AssessmentResult {
  assessmentId: string;
  score: number;
  passed: boolean;
  answers: AssessmentAnswer[];
  timeSpent: number; // seconds
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string | string[];
  correct: boolean;
  points: number;
  timeSpent: number; // seconds
}

// Main tutorial generator class
export class TutorialGenerator {
  private static instance: TutorialGenerator;
  private activeSessions: Map<string, TutorialSession> = new Map();
  private sessionHistory: TutorialSession[] = [];
  
  private constructor() {}
  
  public static getInstance(): TutorialGenerator {
    if (!TutorialGenerator.instance) {
      TutorialGenerator.instance = new TutorialGenerator();
    }
    return TutorialGenerator.instance;
  }
  
  /**
   * Generate a new interactive tutorial
   */
  public async generateTutorial(configuration: TutorialConfiguration): Promise<GeneratedTutorial> {
    try {
      console.log(`🎓 Generating interactive tutorial: ${configuration.tutorial.title}`);
      
      // Validate configuration
      await this.validateConfiguration(configuration);
      
      // Generate tutorial content
      const tutorial = await this.generateTutorialContent(configuration);
      
      console.log(`✅ Tutorial generated successfully: ${tutorial.id}`);
      return tutorial;
      
    } catch (error) {
      console.error(`❌ Failed to generate tutorial:`, error);
      throw new Error(`Failed to generate tutorial: ${error.message}`);
    }
  }
  
  /**
   * Start a tutorial session
   */
  public async startTutorialSession(
    tutorialId: string,
    userId?: string
  ): Promise<TutorialSession> {
    try {
      console.log(`📚 Starting tutorial session: ${tutorialId}`);
      
      // Create session
      const session = await this.createTutorialSession(tutorialId, userId);
      
      // Add to active sessions
      this.activeSessions.set(session.id, session);
      
      console.log(`✅ Tutorial session started: ${session.id}`);
      return session;
      
    } catch (error) {
      console.error(`❌ Failed to start tutorial session:`, error);
      throw new Error(`Failed to start tutorial session: ${error.message}`);
    }
  }
  
  /**
   * Update tutorial session progress
   */
  public async updateSessionProgress(
    sessionId: string,
    interaction: UserInteraction
  ): Promise<TutorialSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Tutorial session ${sessionId} not found`);
    }
    
    // Add interaction
    session.interactions.push(interaction);
    
    // Update progress
    if (interaction.success && !session.progress.completedSteps.includes(session.progress.currentStep)) {
      session.progress.completedSteps.push(session.progress.currentStep);
      session.progress.currentStep++;
      session.progress.percentage = Math.round((session.progress.completedSteps.length / session.progress.totalSteps) * 100);
    }
    
    // Check if tutorial is completed
    if (session.progress.currentStep >= session.progress.totalSteps) {
      session.status = 'completed';
      session.completedAt = new Date();
      session.duration = Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000);
      
      // Generate results
      session.results = await this.generateTutorialResults(session);
      
      // Move to history
      this.sessionHistory.push(session);
      this.activeSessions.delete(sessionId);
    }
    
    return session;
  }
  
  /**
   * Get tutorial session status
   */
  public async getSessionStatus(sessionId: string): Promise<TutorialSession | null> {
    return this.activeSessions.get(sessionId) || 
           this.sessionHistory.find(s => s.id === sessionId) || null;
  }
  
  // Private implementation methods
  
  private async validateConfiguration(config: TutorialConfiguration): Promise<void> {
    const configSchema = z.object({
      id: z.string().min(1),
      clientId: z.string().min(1),
      tutorial: z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        steps: z.array(z.any()).min(1)
      })
    });
    
    configSchema.parse(config);
    
    if (config.tutorial.steps.length === 0) {
      throw new Error('Tutorial must have at least one step');
    }
  }
  
  private async generateTutorialContent(config: TutorialConfiguration): Promise<GeneratedTutorial> {
    // Generate tutorial HTML/JavaScript
    const content = await this.generateInteractiveContent(config);
    
    // Generate tutorial assets
    const assets = await this.generateTutorialAssets(config);
    
    // Generate tutorial metadata
    const metadata = this.generateTutorialMetadata(config);
    
    const generatedTutorial: GeneratedTutorial = {
      id: config.tutorial.id,
      configuration: config,
      content,
      assets,
      metadata,
      generatedAt: new Date()
    };
    
    return generatedTutorial;
  }
  
  private async generateInteractiveContent(config: TutorialConfiguration): Promise<TutorialContent> {
    // Generate HTML structure
    const html = this.generateTutorialHTML(config);
    
    // Generate CSS styles
    const css = this.generateTutorialCSS(config);
    
    // Generate JavaScript functionality
    const javascript = this.generateTutorialJavaScript(config);
    
    return {
      html,
      css,
      javascript,
      embedCode: this.generateEmbedCode(config)
    };
  }
  
  private generateTutorialHTML(config: TutorialConfiguration): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.tutorial.title}</title>
    <link rel="stylesheet" href="tutorial-styles.css">
</head>
<body>
    <div id="tutorial-container" class="tutorial-container">
        <div class="tutorial-header">
            <h1 class="tutorial-title">${config.tutorial.title}</h1>
            <div class="tutorial-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0 / ${config.tutorial.steps.length}</span>
            </div>
        </div>
        
        <div class="tutorial-content">
            ${this.generateStepsHTML(config.tutorial.steps)}
        </div>
        
        <div class="tutorial-navigation">
            <button id="prev-btn" class="nav-btn" disabled>Previous</button>
            <button id="next-btn" class="nav-btn">Next</button>
            <button id="skip-btn" class="nav-btn secondary">Skip</button>
            <button id="exit-btn" class="nav-btn secondary">Exit</button>
        </div>
        
        <div class="tutorial-overlay" style="display: none;"></div>
    </div>
    
    <script src="tutorial-script.js"></script>
</body>
</html>`;
  }
  
  private generateStepsHTML(steps: TutorialStep[]): string {
    return steps.map((step, index) => `
        <div class="tutorial-step" id="step-${step.id}" data-step="${index}" style="${index === 0 ? '' : 'display: none;'}">
            <div class="step-header">
                <h2 class="step-title">${step.title}</h2>
                <div class="step-number">${index + 1}</div>
            </div>
            <div class="step-content">
                <p class="step-description">${step.description}</p>
                ${this.generateStepContentHTML(step.content)}
            </div>
            ${this.generateStepHintsHTML(step.hints)}
        </div>
    `).join('');
  }
  
  private generateStepContentHTML(content: StepContent): string {
    switch (content.type) {
      case 'tooltip':
        return `<div class="tooltip-content">${content.text?.html || ''}</div>`;
      case 'modal':
        return `<div class="modal-content">${content.text?.html || ''}</div>`;
      case 'highlight':
        return `<div class="highlight-content">${content.text?.html || ''}</div>`;
      default:
        return `<div class="default-content">${content.text?.html || ''}</div>`;
    }
  }
  
  private generateStepHintsHTML(hints: StepHint[]): string {
    if (hints.length === 0) return '';
    
    return `
        <div class="step-hints">
            <button class="hint-trigger">💡 Need help?</button>
            <div class="hints-container" style="display: none;">
                ${hints.map(hint => `
                    <div class="hint" data-hint-id="${hint.id}">
                        ${hint.content}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
  }
  
  private generateTutorialCSS(config: TutorialConfiguration): string {
    const theme = config.presentation.theme;
    
    return `
/* Tutorial Base Styles */
.tutorial-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${theme.colors.background};
    color: ${theme.colors.text};
    font-family: ${theme.typography.fontFamily};
    z-index: 10000;
    display: flex;
    flex-direction: column;
}

.tutorial-header {
    padding: ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.colors.border};
    background: ${theme.colors.surface};
}

.tutorial-title {
    margin: 0 0 ${theme.spacing.md} 0;
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.primary};
}

.tutorial-progress {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: ${theme.colors.border};
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: ${theme.colors.primary};
    transition: width ${theme.animations.duration.normal} ${theme.animations.easing.ease};
}

.progress-text {
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.textSecondary};
    white-space: nowrap;
}

.tutorial-content {
    flex: 1;
    padding: ${theme.spacing.lg};
    overflow-y: auto;
}

.tutorial-step {
    max-width: 800px;
    margin: 0 auto;
}

.step-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${theme.spacing.lg};
}

.step-title {
    margin: 0;
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeight.semibold};
}

.step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: ${theme.typography.fontWeight.bold};
}

.step-description {
    font-size: ${theme.typography.fontSize.base};
    line-height: ${theme.typography.lineHeight.relaxed};
    margin-bottom: ${theme.spacing.lg};
}

.tutorial-navigation {
    padding: ${theme.spacing.lg};
    border-top: 1px solid ${theme.colors.border};
    background: ${theme.colors.surface};
    display: flex;
    justify-content: space-between;
    gap: ${theme.spacing.md};
}

.nav-btn {
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border: none;
    border-radius: 6px;
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all ${theme.animations.duration.fast} ${theme.animations.easing.ease};
}

.nav-btn:not(.secondary) {
    background: ${theme.colors.primary};
    color: white;
}

.nav-btn.secondary {
    background: transparent;
    color: ${theme.colors.textSecondary};
    border: 1px solid ${theme.colors.border};
}

.nav-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
}

.nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.tutorial-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
}

/* Responsive Design */
@media (max-width: 768px) {
    .tutorial-header,
    .tutorial-content,
    .tutorial-navigation {
        padding: ${theme.spacing.md};
    }
    
    .step-header {
        flex-direction: column;
        text-align: center;
        gap: ${theme.spacing.md};
    }
    
    .tutorial-navigation {
        flex-wrap: wrap;
    }
    
    .nav-btn {
        flex: 1;
        min-width: 120px;
    }
}

/* Accessibility */
.nav-btn:focus,
.hint-trigger:focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
`;
  }
  
  private generateTutorialJavaScript(config: TutorialConfiguration): string {
    return `
// Tutorial Interactive JavaScript
class InteractiveTutorial {
    constructor(config) {
        this.config = config;
        this.currentStep = 0;
        this.totalSteps = config.steps.length;
        this.interactions = [];
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateProgress();
        this.trackEvent('tutorial_start');
    }
    
    bindEvents() {
        document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevStep());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipStep());
        document.getElementById('exit-btn').addEventListener('click', () => this.exitTutorial());
        
        // Bind hint triggers
        document.querySelectorAll('.hint-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => this.showHints(e.target));
        });
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.hideCurrentStep();
            this.currentStep++;
            this.showCurrentStep();
            this.updateProgress();
            this.trackEvent('step_start', { step: this.currentStep });
        } else {
            this.completeTutorial();
        }
    }
    
    prevStep() {
        if (this.currentStep > 0) {
            this.hideCurrentStep();
            this.currentStep--;
            this.showCurrentStep();
            this.updateProgress();
            this.trackEvent('step_start', { step: this.currentStep });
        }
    }
    
    skipStep() {
        this.trackEvent('step_skip', { step: this.currentStep });
        this.nextStep();
    }
    
    hideCurrentStep() {
        const currentStepEl = document.querySelector(\`[data-step="\${this.currentStep}"]\`);
        if (currentStepEl) {
            currentStepEl.style.display = 'none';
        }
    }
    
    showCurrentStep() {
        const currentStepEl = document.querySelector(\`[data-step="\${this.currentStep}"]\`);
        if (currentStepEl) {
            currentStepEl.style.display = 'block';
        }
    }
    
    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        const percentage = Math.round((this.currentStep / this.totalSteps) * 100);
        progressFill.style.width = percentage + '%';
        progressText.textContent = \`\${this.currentStep + 1} / \${this.totalSteps}\`;
        
        prevBtn.disabled = this.currentStep === 0;
        nextBtn.textContent = this.currentStep === this.totalSteps - 1 ? 'Complete' : 'Next';
    }
    
    showHints(trigger) {
        const hintsContainer = trigger.nextElementSibling;
        const isVisible = hintsContainer.style.display !== 'none';
        
        hintsContainer.style.display = isVisible ? 'none' : 'block';
        this.trackEvent('hint_request', { step: this.currentStep });
    }
    
    completeTutorial() {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        this.trackEvent('tutorial_complete', { duration });
        
        alert('Tutorial completed! Great job!');
        this.exitTutorial();
    }
    
    exitTutorial() {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        this.trackEvent('tutorial_exit', { 
            step: this.currentStep,
            duration,
            completed: this.currentStep === this.totalSteps - 1
        });
        
        document.getElementById('tutorial-container').style.display = 'none';
    }
    
    trackEvent(eventType, data = {}) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            step: this.currentStep,
            data
        };
        
        this.interactions.push(event);
        
        // Send to analytics if configured
        if (this.config.tracking && this.config.tracking.enabled) {
            this.sendAnalytics(event);
        }
        
        console.log('Tutorial Event:', event);
    }
    
    sendAnalytics(event) {
        // Implementation would depend on analytics provider
        // Example for Google Analytics:
        if (typeof gtag !== 'undefined') {
            gtag('event', event.type, {
                custom_parameter_1: event.step,
                custom_parameter_2: JSON.stringify(event.data)
            });
        }
    }
}

// Initialize tutorial when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const tutorialConfig = ${JSON.stringify(config, null, 2)};
    window.tutorial = new InteractiveTutorial(tutorialConfig);
});
`;
  }
  
  private generateEmbedCode(config: TutorialConfiguration): string {
    return `
<!-- Embed this code in your website to include the interactive tutorial -->
<div id="tutorial-embed-${config.id}">
    <script>
        (function() {
            var script = document.createElement('script');
            script.src = 'https://your-domain.com/tutorials/${config.id}/tutorial.js';
            script.async = true;
            document.head.appendChild(script);
        })();
    </script>
</div>
`;
  }
  
  private async generateTutorialAssets(config: TutorialConfiguration): Promise<TutorialAsset[]> {
    const assets: TutorialAsset[] = [
      {
        type: 'stylesheet',
        filename: 'tutorial-styles.css',
        content: this.generateTutorialCSS(config),
        size: 0 // Will be calculated
      },
      {
        type: 'javascript',
        filename: 'tutorial-script.js',
        content: this.generateTutorialJavaScript(config),
        size: 0 // Will be calculated
      }
    ];
    
    // Add media assets if present
    config.tutorial.steps.forEach(step => {
      if (step.content.media) {
        assets.push({
          type: 'media',
          filename: step.content.media.url.split('/').pop() || 'media-file',
          content: '', // External reference
          size: 0,
          url: step.content.media.url
        });
      }
    });
    
    return assets;
  }
  
  private generateTutorialMetadata(config: TutorialConfiguration): GeneratedTutorialMetadata {
    return {
      id: config.tutorial.id,
      title: config.tutorial.title,
      description: config.tutorial.description,
      version: '1.0.0',
      generatedBy: 'Tutorial Generator v1.0.0',
      clientInfo: {
        id: config.clientId,
        name: config.clientConfig.name,
        tier: config.clientConfig.tier
      },
      statistics: {
        totalSteps: config.tutorial.steps.length,
        estimatedDuration: config.tutorial.estimatedDuration,
        interactiveElements: this.countInteractiveElements(config.tutorial.steps),
        assessments: config.tutorial.assessments?.length || 0
      },
      configuration: {
        mode: config.interactivity.mode,
        guidance: config.interactivity.guidance,
        theme: config.presentation.theme.name,
        responsive: config.presentation.responsive.enabled,
        tracking: config.tracking.enabled
      }
    };
  }
  
  private countInteractiveElements(steps: TutorialStep[]): number {
    return steps.reduce((count, step) => {
      return count + (step.interaction.required ? 1 : 0);
    }, 0);
  }
  
  private async createTutorialSession(tutorialId: string, userId?: string): Promise<TutorialSession> {
    const sessionId = `session-${tutorialId}-${Date.now()}`;
    
    const session: TutorialSession = {
      id: sessionId,
      configurationId: tutorialId,
      userId,
      status: 'in_progress',
      startedAt: new Date(),
      progress: {
        currentStep: 0,
        totalSteps: 0, // Will be set based on tutorial configuration
        percentage: 0,
        completedSteps: [],
        skippedSteps: [],
        timeSpent: 0,
        hintsUsed: 0,
        errorsEncountered: 0
      },
      interactions: []
    };
    
    return session;
  }
  
  private async generateTutorialResults(session: TutorialSession): Promise<TutorialResults> {
    const efficiency = Math.round((session.progress.completedSteps.length / session.progress.totalSteps) * 100);
    
    return {
      completed: session.status === 'completed',
      feedback: this.generateFeedback(session),
      recommendations: this.generateRecommendations(session),
      timeToComplete: session.duration || 0,
      efficiency,
      assessmentResults: [] // Would be populated if assessments were completed
    };
  }
  
  private generateFeedback(session: TutorialSession): string {
    const completionRate = session.progress.completedSteps.length / session.progress.totalSteps;
    
    if (completionRate >= 0.9) {
      return 'Excellent work! You completed the tutorial successfully.';
    } else if (completionRate >= 0.7) {
      return 'Good job! You made solid progress through the tutorial.';
    } else {
      return 'You made some progress. Consider reviewing the material again.';
    }
  }
  
  private generateRecommendations(session: TutorialSession): string[] {
    const recommendations: string[] = [];
    
    if (session.progress.hintsUsed > 3) {
      recommendations.push('Consider reviewing the documentation before attempting similar tasks.');
    }
    
    if (session.progress.skippedSteps.length > 0) {
      recommendations.push('Try completing the skipped steps to reinforce your learning.');
    }
    
    if (session.progress.errorsEncountered > 5) {
      recommendations.push('Practice the workflow a few more times to build confidence.');
    }
    
    return recommendations;
  }
}

// Additional interfaces for generated content
export interface GeneratedTutorial {
  id: string;
  configuration: TutorialConfiguration;
  content: TutorialContent;
  assets: TutorialAsset[];
  metadata: GeneratedTutorialMetadata;
  generatedAt: Date;
}

export interface TutorialContent {
  html: string;
  css: string;
  javascript: string;
  embedCode: string;
}

export interface TutorialAsset {
  type: 'stylesheet' | 'javascript' | 'image' | 'video' | 'audio' | 'media';
  filename: string;
  content: string;
  size: number;
  url?: string;
}

export interface GeneratedTutorialMetadata {
  id: string;
  title: string;
  description: string;
  version: string;
  generatedBy: string;
  clientInfo: {
    id: string;
    name: string;
    tier: string;
  };
  statistics: {
    totalSteps: number;
    estimatedDuration: number;
    interactiveElements: number;
    assessments: number;
  };
  configuration: {
    mode: InteractivityMode;
    guidance: GuidanceLevel;
    theme: string;
    responsive: boolean;
    tracking: boolean;
  };
}

// Export the singleton instance
export const tutorialGenerator = TutorialGenerator.getInstance();

// Utility functions
export async function createTutorialConfiguration(
  clientConfig: ClientConfiguration,
  tutorialDefinition: Partial<TutorialDefinition>,
  customizations?: Partial<TutorialConfiguration>
): Promise<TutorialConfiguration> {
  const configId = `tutorial-${clientConfig.id}-${Date.now()}`;
  
  const defaultConfig: TutorialConfiguration = {
    id: configId,
    clientId: clientConfig.id,
    clientConfig,
    tutorial: {
      id: `tutorial-${configId}`,
      title: tutorialDefinition.title || 'Interactive Tutorial',
      description: tutorialDefinition.description || 'Learn how to use the system',
      type: tutorialDefinition.type || 'guided_tour',
      difficulty: tutorialDefinition.difficulty || 'beginner',
      estimatedDuration: tutorialDefinition.estimatedDuration || 15,
      prerequisites: tutorialDefinition.prerequisites || [],
      learningObjectives: tutorialDefinition.learningObjectives || [],
      steps: tutorialDefinition.steps || [],
      assessments: tutorialDefinition.assessments
    },
    interactivity: {
      mode: 'guided',
      guidance: 'moderate',
      adaptivity: {
        enabled: true,
        personalizeContent: false,
        adjustDifficulty: false,
        trackProgress: true,
        recommendNextSteps: true,
        adaptTiming: false
      },
      accessibility: {
        keyboardNavigation: true,
        screenReaderSupport: true,
        highContrast: false,
        reducedMotion: false,
        fontSize: 'medium',
        focusIndicators: true,
        altText: true
      },
      customization: {
        allowSkipping: true,
        allowRestart: true,
        saveProgress: true,
        bookmarks: false,
        notes: false,
        speed: {
          adjustable: true,
          options: [0.5, 1, 1.5, 2],
          default: 1
        }
      }
    },
    presentation: {
      theme: {
        name: 'default',
        colors: {
          primary: clientConfig.brandingConfig?.colors?.primary || '#2563eb',
          secondary: clientConfig.brandingConfig?.colors?.secondary || '#64748b',
          accent: '#f59e0b',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1e293b',
          textSecondary: '#64748b',
          border: '#e2e8f0',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        typography: {
          fontFamily: clientConfig.brandingConfig?.fonts?.primary || 'Inter, sans-serif',
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem'
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          },
          lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem',
          '3xl': '4rem'
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        },
        animations: {
          duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms'
          },
          easing: {
            ease: 'ease',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out'
          }
        }
      },
      layout: {
        position: 'overlay',
        width: '100%',
        height: '100%',
        maxWidth: '1200px',
        maxHeight: '800px',
        padding: '1rem',
        margin: '0',
        zIndex: 10000
      },
      branding: {
        colors: clientConfig.brandingConfig?.colors || {},
        fonts: clientConfig.brandingConfig?.fonts || {}
      },
      responsive: {
        enabled: true,
        breakpoints: {
          mobile: 640,
          tablet: 768,
          desktop: 1024
        },
        adaptations: []
      }
    },
    tracking: {
      enabled: true,
      events: [
        { type: 'tutorial_start', enabled: true },
        { type: 'tutorial_complete', enabled: true },
        { type: 'step_start', enabled: true },
        { type: 'step_complete', enabled: true },
        { type: 'hint_request', enabled: true },
        { type: 'error_encounter', enabled: true }
      ],
      analytics: {
        provider: 'custom',
        batchSize: 10,
        flushInterval: 5000
      },
      privacy: {
        anonymizeData: true,
        respectDoNotTrack: true,
        consentRequired: false,
        dataRetention: 90
      }
    },
    metadata: {
      title: tutorialDefinition.title || 'Interactive Tutorial',
      description: tutorialDefinition.description || 'Learn how to use the system',
      version: '1.0.0',
      author: 'Tutorial Generator',
      created: new Date(),
      updated: new Date(),
      tags: [tutorialDefinition.type || 'tutorial', clientConfig.tier],
      category: 'training',
      language: 'en',
      targetAudience: ['users', 'administrators']
    }
  };
  
  // Apply customizations
  if (customizations) {
    Object.assign(defaultConfig, customizations);
  }
  
  return defaultConfig;
}

export async function generateInteractiveTutorial(
  clientConfig: ClientConfiguration,
  tutorialDefinition: Partial<TutorialDefinition>,
  customizations?: Partial<TutorialConfiguration>
): Promise<GeneratedTutorial> {
  const configuration = await createTutorialConfiguration(clientConfig, tutorialDefinition, customizations);
  return tutorialGenerator.generateTutorial(configuration);
}

// Example usage and validation
export async function validateTutorialGenerator(): Promise<boolean> {
  try {
    const generator = TutorialGenerator.getInstance();
    console.log('✅ Tutorial Generator initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Tutorial Generator validation failed:', error);
    return false;
  }
}
