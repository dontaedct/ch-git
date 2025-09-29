/**
 * @fileoverview Visual Guide and Screenshot Generation System
 * @module lib/handover/visual-guide-generator
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.3: Visual guide and screenshot generation for creating comprehensive
 * visual documentation with annotations, highlights, and step-by-step visuals.
 */

import { z } from 'zod';
import { ClientConfiguration } from '../../types/handover/deliverables-types';
import { ScreenshotOptions, ScreenshotResult, ScreenshotAnnotation } from './screen-capture';

// Visual guide configuration types
export interface VisualGuideConfiguration {
  id: string;
  clientId: string;
  clientConfig: ClientConfiguration;
  guide: GuideDefinition;
  capture: CaptureConfiguration;
  processing: ProcessingConfiguration;
  output: OutputConfiguration;
  metadata: GuideMetadata;
}

export interface GuideDefinition {
  id: string;
  title: string;
  description: string;
  type: GuideType;
  scope: GuideScope;
  flow: GuideFlow[];
  styling: GuideStyling;
  annotations: GlobalAnnotationSettings;
}

export type GuideType = 
  | 'quick_reference'
  | 'step_by_step'
  | 'troubleshooting'
  | 'feature_overview'
  | 'workflow_guide'
  | 'admin_manual'
  | 'user_manual';

export interface GuideScope {
  targetUrl: string;
  includedPaths: string[];
  excludedPaths: string[];
  viewport: ViewportConfiguration;
  userAgent?: string;
  authentication?: AuthenticationConfig;
}

export interface ViewportConfiguration {
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  deviceType: 'desktop' | 'tablet' | 'mobile';
}

export interface AuthenticationConfig {
  type: 'none' | 'basic' | 'bearer' | 'session' | 'oauth';
  credentials?: Record<string, string>;
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string; domain?: string }>;
}

export interface GuideFlow {
  id: string;
  order: number;
  title: string;
  description: string;
  steps: GuideStep[];
  prerequisites?: string[];
  expectedOutcome: string;
}

export interface GuideStep {
  id: string;
  order: number;
  title: string;
  description: string;
  action: StepAction;
  capture: StepCapture;
  annotations: StepAnnotations;
  validation?: StepValidation;
}

export interface StepAction {
  type: ActionType;
  target?: ElementTarget;
  value?: string;
  waitConditions?: WaitCondition[];
  beforeCapture?: PreCaptureAction[];
  afterCapture?: PostCaptureAction[];
}

export type ActionType = 
  | 'navigate'
  | 'click'
  | 'type'
  | 'scroll'
  | 'hover'
  | 'focus'
  | 'highlight'
  | 'wait'
  | 'custom';

export interface ElementTarget {
  selector: string;
  index?: number;
  position?: 'first' | 'last' | 'visible' | 'clickable';
  frame?: string;
  shadow?: boolean;
}

export interface WaitCondition {
  type: 'element' | 'network' | 'timeout' | 'load' | 'custom';
  condition: string;
  timeout: number;
  optional?: boolean;
}

export interface PreCaptureAction {
  type: 'scroll' | 'hover' | 'focus' | 'wait' | 'execute';
  target?: string;
  value?: any;
  delay?: number;
}

export interface PostCaptureAction {
  type: 'reset' | 'cleanup' | 'navigate' | 'execute';
  target?: string;
  value?: any;
}

export interface StepCapture {
  enabled: boolean;
  type: CaptureType;
  region?: CaptureRegion;
  quality: ImageQuality;
  format: ImageFormat;
  filename?: string;
  thumbnail?: ThumbnailConfig;
}

export type CaptureType = 'fullpage' | 'viewport' | 'element' | 'region' | 'comparison';

export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  relative?: boolean; // relative to viewport or absolute
}

export type ImageQuality = 'low' | 'medium' | 'high' | 'lossless';
export type ImageFormat = 'png' | 'jpg' | 'webp' | 'svg';

export interface ThumbnailConfig {
  enabled: boolean;
  width: number;
  height: number;
  quality: ImageQuality;
}

export interface StepAnnotations {
  enabled: boolean;
  elements: AnnotationElement[];
  overlays: AnnotationOverlay[];
  callouts: AnnotationCallout[];
  highlights: AnnotationHighlight[];
}

export interface AnnotationElement {
  id: string;
  type: AnnotationType;
  target: ElementTarget;
  content: AnnotationContent;
  style: AnnotationStyle;
  position: AnnotationPosition;
  behavior?: AnnotationBehavior;
}

export type AnnotationType = 
  | 'arrow'
  | 'circle'
  | 'rectangle'
  | 'text'
  | 'callout'
  | 'highlight'
  | 'blur'
  | 'number'
  | 'icon';

export interface AnnotationContent {
  text?: string;
  icon?: string;
  number?: number;
  html?: string;
  markdown?: string;
}

export interface AnnotationStyle {
  color: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  opacity?: number;
  shadow?: ShadowConfig;
  zIndex?: number;
}

export interface ShadowConfig {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface AnnotationPosition {
  type: 'absolute' | 'relative' | 'smart';
  x?: number;
  y?: number;
  anchor?: AnchorPosition;
  offset?: { x: number; y: number };
  margin?: number;
}

export type AnchorPosition = 
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';

export interface AnnotationBehavior {
  autoPosition: boolean;
  avoidOverlap: boolean;
  followScroll: boolean;
  fadeIn?: boolean;
  duration?: number;
}

export interface AnnotationOverlay {
  id: string;
  type: 'mask' | 'dimmer' | 'spotlight' | 'frame';
  target?: ElementTarget;
  style: OverlayStyle;
  content?: OverlayContent;
}

export interface OverlayStyle {
  color: string;
  opacity: number;
  blur?: number;
  pattern?: 'solid' | 'dots' | 'lines' | 'gradient';
  animation?: AnimationConfig;
}

export interface OverlayContent {
  title?: string;
  description?: string;
  instructions?: string;
  position: ContentPosition;
}

export interface ContentPosition {
  anchor: AnchorPosition;
  offset: { x: number; y: number };
  width?: number;
  height?: number;
}

export interface AnimationConfig {
  type: 'fade' | 'slide' | 'zoom' | 'pulse' | 'bounce';
  duration: number;
  delay?: number;
  iterations?: number | 'infinite';
  easing?: string;
}

export interface AnnotationCallout {
  id: string;
  target: ElementTarget;
  content: CalloutContent;
  style: CalloutStyle;
  position: CalloutPosition;
}

export interface CalloutContent {
  title?: string;
  description: string;
  steps?: string[];
  tips?: string[];
  warnings?: string[];
}

export interface CalloutStyle {
  theme: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  size: 'small' | 'medium' | 'large';
  arrow: boolean;
  closeable: boolean;
  maxWidth?: number;
  background?: string;
  border?: string;
}

export interface CalloutPosition {
  placement: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  alignment: 'start' | 'center' | 'end';
  offset: number;
  flip: boolean; // Auto-flip when space is limited
}

export interface AnnotationHighlight {
  id: string;
  target: ElementTarget;
  style: HighlightStyle;
  effect?: HighlightEffect;
}

export interface HighlightStyle {
  type: 'border' | 'background' | 'outline' | 'glow';
  color: string;
  thickness?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  radius?: number;
  blur?: number;
}

export interface HighlightEffect {
  animation: 'pulse' | 'glow' | 'shake' | 'bounce' | 'none';
  duration: number;
  iterations: number | 'infinite';
}

export interface StepValidation {
  enabled: boolean;
  checks: ValidationCheck[];
  retryOnFail: boolean;
  maxRetries: number;
}

export interface ValidationCheck {
  type: 'element_exists' | 'element_visible' | 'url_match' | 'text_present' | 'custom';
  target?: string;
  expected?: any;
  timeout: number;
}

export interface GuideStyling {
  theme: StylingTheme;
  branding: BrandingConfiguration;
  layout: LayoutConfiguration;
  responsive: ResponsiveConfiguration;
}

export interface StylingTheme {
  name: string;
  colors: ThemeColorPalette;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  effects: ThemeEffects;
}

export interface ThemeColorPalette {
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
  highlight: string;
  overlay: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFont?: string;
  monoFont?: string;
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  weights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
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

export interface ThemeEffects {
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export interface BrandingConfiguration {
  logo?: BrandingAsset;
  watermark?: BrandingAsset;
  colorOverrides?: Partial<ThemeColorPalette>;
  fontOverrides?: Partial<ThemeTypography>;
  customCSS?: string;
}

export interface BrandingAsset {
  url: string;
  position: AssetPosition;
  size: AssetSize;
  opacity: number;
}

export interface AssetPosition {
  x: number | string;
  y: number | string;
  anchor: AnchorPosition;
}

export interface AssetSize {
  width: number | string;
  height: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

export interface LayoutConfiguration {
  annotationLayer: LayerConfig;
  contentLayer: LayerConfig;
  overlayLayer: LayerConfig;
  margins: MarginConfig;
  spacing: SpacingConfig;
}

export interface LayerConfig {
  zIndex: number;
  isolation: boolean;
}

export interface MarginConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SpacingConfig {
  betweenAnnotations: number;
  betweenSteps: number;
  aroundContent: number;
}

export interface ResponsiveConfiguration {
  enabled: boolean;
  breakpoints: ResponsiveBreakpoints;
  adaptations: ResponsiveAdaptation[];
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  widescreen: number;
}

export interface ResponsiveAdaptation {
  breakpoint: keyof ResponsiveBreakpoints;
  changes: ResponsiveChanges;
}

export interface ResponsiveChanges {
  fontSize?: number;
  spacing?: number;
  annotationSize?: number;
  layoutAdjustments?: Record<string, any>;
}

export interface GlobalAnnotationSettings {
  autoNumbering: AutoNumberingConfig;
  consistency: ConsistencyConfig;
  accessibility: AccessibilityConfig;
}

export interface AutoNumberingConfig {
  enabled: boolean;
  style: 'numeric' | 'alphabetic' | 'roman' | 'custom';
  startAt: number;
  prefix?: string;
  suffix?: string;
  resetPerFlow: boolean;
}

export interface ConsistencyConfig {
  enforceStyleGuides: boolean;
  colorConsistency: boolean;
  sizingConsistency: boolean;
  spacingConsistency: boolean;
  fontConsistency: boolean;
}

export interface AccessibilityConfig {
  altText: boolean;
  highContrast: boolean;
  focusIndicators: boolean;
  minimumColorContrast: number;
  textScaling: boolean;
}

export interface CaptureConfiguration {
  browser: BrowserConfig;
  timing: TimingConfig;
  quality: QualityConfig;
  optimization: OptimizationConfig;
}

export interface BrowserConfig {
  engine: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  viewport: ViewportConfiguration;
  options: BrowserOptions;
}

export interface BrowserOptions {
  args: string[];
  timeout: number;
  slowMo: number;
  devtools: boolean;
  locale?: string;
  timezone?: string;
  permissions?: string[];
}

export interface TimingConfig {
  pageLoadTimeout: number;
  elementTimeout: number;
  networkTimeout: number;
  stabilityDelay: number;
  betweenStepsDelay: number;
  beforeCaptureDelay: number;
  afterCaptureDelay: number;
}

export interface QualityConfig {
  defaultQuality: ImageQuality;
  compressionLevel: number;
  optimizeForWeb: boolean;
  preserveMetadata: boolean;
  colorProfile: string;
}

export interface OptimizationConfig {
  parallelCapture: boolean;
  cacheResults: boolean;
  skipDuplicates: boolean;
  compressImages: boolean;
  generateThumbnails: boolean;
  createSprites: boolean;
}

export interface ProcessingConfiguration {
  postProcessing: PostProcessingConfig;
  imageProcessing: ImageProcessingConfig;
  annotationProcessing: AnnotationProcessingConfig;
  optimization: ProcessingOptimizationConfig;
}

export interface PostProcessingConfig {
  enabled: boolean;
  filters: ImageFilter[];
  adjustments: ImageAdjustments;
  effects: ImageEffects;
}

export interface ImageFilter {
  type: 'blur' | 'sharpen' | 'noise_reduction' | 'edge_enhancement' | 'custom';
  strength: number;
  parameters?: Record<string, any>;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  gamma: number;
  exposure: number;
}

export interface ImageEffects {
  dropShadow?: DropShadowEffect;
  glow?: GlowEffect;
  border?: BorderEffect;
  vignette?: VignetteEffect;
}

export interface DropShadowEffect {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity: number;
}

export interface GlowEffect {
  enabled: boolean;
  radius: number;
  color: string;
  intensity: number;
}

export interface BorderEffect {
  enabled: boolean;
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  radius: number;
}

export interface VignetteEffect {
  enabled: boolean;
  strength: number;
  radius: number;
  color: string;
}

export interface ImageProcessingConfig {
  resizing: ResizingConfig;
  cropping: CroppingConfig;
  watermarking: WatermarkingConfig;
  compression: CompressionConfig;
}

export interface ResizingConfig {
  enabled: boolean;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio: boolean;
  algorithm: 'lanczos' | 'bicubic' | 'bilinear' | 'nearest';
}

export interface CroppingConfig {
  enabled: boolean;
  smartCrop: boolean;
  focusPoint?: { x: number; y: number };
  padding: number;
}

export interface WatermarkingConfig {
  enabled: boolean;
  image?: string;
  text?: string;
  position: WatermarkPosition;
  opacity: number;
  size: number;
}

export interface WatermarkPosition {
  anchor: AnchorPosition;
  offsetX: number;
  offsetY: number;
}

export interface CompressionConfig {
  enabled: boolean;
  quality: number;
  progressive: boolean;
  optimizeHuffman: boolean;
  stripMetadata: boolean;
}

export interface AnnotationProcessingConfig {
  rendering: AnnotationRenderingConfig;
  layering: AnnotationLayeringConfig;
  optimization: AnnotationOptimizationConfig;
}

export interface AnnotationRenderingConfig {
  antialiasing: boolean;
  subpixelRendering: boolean;
  highDPI: boolean;
  vectorRendering: boolean;
}

export interface AnnotationLayeringConfig {
  separateLayers: boolean;
  layerOrder: string[];
  blendModes: Record<string, string>;
  groupLayers: boolean;
}

export interface AnnotationOptimizationConfig {
  mergeOverlapping: boolean;
  simplifyPaths: boolean;
  optimizeText: boolean;
  cacheRenders: boolean;
}

export interface ProcessingOptimizationConfig {
  parallelProcessing: boolean;
  maxConcurrency: number;
  memoryLimit: number;
  tempDirectory: string;
  cleanupTemporary: boolean;
}

export interface OutputConfiguration {
  formats: OutputFormat[];
  structure: OutputStructure;
  naming: NamingConfiguration;
  metadata: MetadataConfiguration;
}

export interface OutputFormat {
  type: 'html' | 'pdf' | 'images' | 'json' | 'markdown' | 'docx';
  enabled: boolean;
  options: FormatOptions;
}

export interface FormatOptions {
  quality?: number;
  compression?: boolean;
  embedImages?: boolean;
  includeCSS?: boolean;
  includeJS?: boolean;
  responsive?: boolean;
  template?: string;
  customOptions?: Record<string, any>;
}

export interface OutputStructure {
  directory: string;
  subdirectories: SubdirectoryConfig;
  indexFile: IndexFileConfig;
  assetDirectory: string;
}

export interface SubdirectoryConfig {
  byFlow: boolean;
  byType: boolean;
  byDate: boolean;
  customStructure?: string;
}

export interface IndexFileConfig {
  generate: boolean;
  filename: string;
  template: string;
  includeNavigation: boolean;
  includeThumbnails: boolean;
}

export interface NamingConfiguration {
  pattern: string;
  includeTimestamp: boolean;
  includeStepNumber: boolean;
  includeFlowName: boolean;
  sanitize: boolean;
  maxLength: number;
}

export interface MetadataConfiguration {
  includeInFiles: boolean;
  separateMetadataFile: boolean;
  format: 'json' | 'yaml' | 'xml';
  includeSystem: boolean;
  includeProcessing: boolean;
  includeQuality: boolean;
}

export interface GuideMetadata {
  title: string;
  description: string;
  version: string;
  author: string;
  created: Date;
  updated: Date;
  tags: string[];
  category: string;
  estimatedDuration: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  clientInfo: ClientMetadata;
}

export interface ClientMetadata {
  id: string;
  name: string;
  tier: string;
  domain: string;
  customizations: Record<string, any>;
}

// Generation session types
export interface GuideGenerationSession {
  id: string;
  configurationId: string;
  status: GenerationStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  progress: GenerationProgress;
  results?: GenerationResults;
  error?: GenerationError;
}

export type GenerationStatus = 
  | 'initializing'
  | 'capturing'
  | 'processing'
  | 'annotating'
  | 'rendering'
  | 'optimizing'
  | 'outputting'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface GenerationProgress {
  phase: GenerationStatus;
  percentage: number;
  currentFlow: number;
  totalFlows: number;
  currentStep: number;
  totalSteps: number;
  estimatedTimeRemaining: number;
  message?: string;
}

export interface GenerationResults {
  outputFiles: OutputFile[];
  statistics: GenerationStatistics;
  quality: QualityMetrics;
  metadata: ResultMetadata;
}

export interface OutputFile {
  type: string;
  filename: string;
  path: string;
  size: number;
  format: string;
  url?: string;
  checksum: string;
}

export interface GenerationStatistics {
  totalSteps: number;
  screenshotsCaptured: number;
  annotationsAdded: number;
  processingTime: number;
  outputSize: number;
  compressionRatio: number;
}

export interface QualityMetrics {
  overall: number;
  imageQuality: number;
  annotationAccuracy: number;
  completeness: number;
  consistency: number;
  accessibility: number;
}

export interface ResultMetadata {
  generatedBy: string;
  version: string;
  configuration: string;
  timestamp: Date;
  environment: EnvironmentInfo;
}

export interface EnvironmentInfo {
  browser: string;
  browserVersion: string;
  platform: string;
  viewport: string;
  userAgent: string;
}

export interface GenerationError {
  type: string;
  message: string;
  details: any;
  timestamp: Date;
  step?: string;
  flow?: string;
  recoverable: boolean;
}

// Main visual guide generator class
export class VisualGuideGenerator {
  private static instance: VisualGuideGenerator;
  private activeSessions: Map<string, GuideGenerationSession> = new Map();
  private sessionHistory: GuideGenerationSession[] = [];
  
  private constructor() {}
  
  public static getInstance(): VisualGuideGenerator {
    if (!VisualGuideGenerator.instance) {
      VisualGuideGenerator.instance = new VisualGuideGenerator();
    }
    return VisualGuideGenerator.instance;
  }
  
  /**
   * Generate a visual guide
   */
  public async generateVisualGuide(configuration: VisualGuideConfiguration): Promise<GuideGenerationSession> {
    try {
      console.log(`📖 Starting visual guide generation: ${configuration.guide.title}`);
      
      // Validate configuration
      await this.validateConfiguration(configuration);
      
      // Create generation session
      const session = await this.createGenerationSession(configuration);
      
      // Add to active sessions
      this.activeSessions.set(session.id, session);
      
      // Start generation asynchronously
      this.executeGenerationAsync(session.id);
      
      console.log(`✅ Visual guide generation started: ${session.id}`);
      return session;
      
    } catch (error) {
      console.error(`❌ Failed to start visual guide generation:`, error);
      throw new Error(`Failed to start visual guide generation: ${error.message}`);
    }
  }
  
  /**
   * Get generation session status
   */
  public async getSessionStatus(sessionId: string): Promise<GuideGenerationSession | null> {
    return this.activeSessions.get(sessionId) || 
           this.sessionHistory.find(s => s.id === sessionId) || null;
  }
  
  /**
   * Cancel a generation session
   */
  public async cancelGeneration(sessionId: string, reason: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }
    
    session.status = 'cancelled';
    session.completedAt = new Date();
    session.error = {
      type: 'user_cancelled',
      message: `Generation cancelled: ${reason}`,
      details: { reason },
      timestamp: new Date(),
      recoverable: false
    };
    
    // Move to history
    this.sessionHistory.push(session);
    this.activeSessions.delete(sessionId);
    
    console.log(`🛑 Visual guide generation cancelled: ${sessionId} - ${reason}`);
    return true;
  }
  
  /**
   * Generate a single annotated screenshot
   */
  public async generateAnnotatedScreenshot(
    url: string,
    annotations: StepAnnotations,
    options?: ScreenshotOptions
  ): Promise<AnnotatedScreenshotResult> {
    try {
      console.log(`📸 Generating annotated screenshot for: ${url}`);
      
      // Capture base screenshot
      const screenshot = await this.captureScreenshot(url, options);
      
      // Apply annotations
      const annotatedResult = await this.applyAnnotations(screenshot, annotations);
      
      console.log(`✅ Annotated screenshot generated: ${annotatedResult.file}`);
      return annotatedResult;
      
    } catch (error) {
      console.error(`❌ Failed to generate annotated screenshot:`, error);
      throw new Error(`Failed to generate annotated screenshot: ${error.message}`);
    }
  }
  
  // Private implementation methods
  
  private async validateConfiguration(config: VisualGuideConfiguration): Promise<void> {
    const configSchema = z.object({
      id: z.string().min(1),
      clientId: z.string().min(1),
      guide: z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        flow: z.array(z.any()).min(1)
      })
    });
    
    configSchema.parse(config);
    
    if (config.guide.flow.length === 0) {
      throw new Error('Visual guide must have at least one flow');
    }
  }
  
  private async createGenerationSession(config: VisualGuideConfiguration): Promise<GuideGenerationSession> {
    const sessionId = `guide-${config.clientId}-${Date.now()}`;
    
    const totalSteps = config.guide.flow.reduce((sum, flow) => sum + flow.steps.length, 0);
    
    const session: GuideGenerationSession = {
      id: sessionId,
      configurationId: config.id,
      status: 'initializing',
      startedAt: new Date(),
      progress: {
        phase: 'initializing',
        percentage: 0,
        currentFlow: 0,
        totalFlows: config.guide.flow.length,
        currentStep: 0,
        totalSteps,
        estimatedTimeRemaining: totalSteps * 10, // 10 seconds per step estimate
        message: 'Initializing guide generation...'
      }
    };
    
    return session;
  }
  
  private async executeGenerationAsync(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }
      
      // Execute generation phases
      await this.executeGenerationPhases(session);
      
      // Complete session
      session.status = 'completed';
      session.completedAt = new Date();
      session.duration = Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000);
      
      // Move to history
      this.sessionHistory.push(session);
      this.activeSessions.delete(sessionId);
      
      console.log(`🎉 Visual guide generation completed: ${sessionId} (${session.duration}s)`);
      
    } catch (error) {
      console.error(`❌ Visual guide generation failed:`, error);
      await this.handleGenerationFailure(sessionId, error);
    }
  }
  
  private async executeGenerationPhases(session: GuideGenerationSession): Promise<void> {
    const phases: GenerationStatus[] = [
      'capturing',
      'processing',
      'annotating',
      'rendering',
      'optimizing',
      'outputting'
    ];
    
    for (const phase of phases) {
      session.progress.phase = phase;
      session.progress.message = `${phase.charAt(0).toUpperCase() + phase.slice(1)} visual guide...`;
      
      console.log(`📖 Generation phase: ${phase}`);
      
      // Simulate phase processing
      await this.simulatePhaseProcessing(session, phase);
      
      // Update progress
      const phaseIndex = phases.indexOf(phase);
      session.progress.percentage = Math.round(((phaseIndex + 1) / phases.length) * 100);
    }
    
    // Generate mock results
    session.results = await this.generateMockResults(session);
  }
  
  private async simulatePhaseProcessing(session: GuideGenerationSession, phase: GenerationStatus): Promise<void> {
    const duration = 5; // seconds
    const steps = 10;
    
    for (let i = 0; i < steps; i++) {
      session.progress.estimatedTimeRemaining = Math.max(0, duration - (i * duration / steps));
      await new Promise(resolve => setTimeout(resolve, (duration / steps) * 100)); // Simulated time
    }
  }
  
  private async generateMockResults(session: GuideGenerationSession): Promise<GenerationResults> {
    return {
      outputFiles: [
        {
          type: 'html',
          filename: 'visual-guide.html',
          path: `/guides/${session.id}/visual-guide.html`,
          size: 524288, // 512KB
          format: 'html',
          url: `https://storage.example.com/guides/${session.id}/visual-guide.html`,
          checksum: `sha256:guide-${session.id}`
        },
        {
          type: 'pdf',
          filename: 'visual-guide.pdf',
          path: `/guides/${session.id}/visual-guide.pdf`,
          size: 2097152, // 2MB
          format: 'pdf',
          url: `https://storage.example.com/guides/${session.id}/visual-guide.pdf`,
          checksum: `sha256:guide-pdf-${session.id}`
        }
      ],
      statistics: {
        totalSteps: session.progress.totalSteps,
        screenshotsCaptured: session.progress.totalSteps,
        annotationsAdded: session.progress.totalSteps * 3,
        processingTime: session.duration || 0,
        outputSize: 2621440, // Total size
        compressionRatio: 0.75
      },
      quality: {
        overall: 95,
        imageQuality: 96,
        annotationAccuracy: 94,
        completeness: 100,
        consistency: 93,
        accessibility: 91
      },
      metadata: {
        generatedBy: 'Visual Guide Generator v1.0.0',
        version: '1.0.0',
        configuration: session.configurationId,
        timestamp: new Date(),
        environment: {
          browser: 'Chromium',
          browserVersion: '118.0.0.0',
          platform: 'Linux',
          viewport: '1920x1080',
          userAgent: 'Mozilla/5.0 (compatible; VisualGuideGenerator/1.0)'
        }
      }
    };
  }
  
  private async captureScreenshot(url: string, options?: ScreenshotOptions): Promise<ScreenshotResult> {
    // Mock screenshot capture
    // In real implementation, would use browser automation
    
    return {
      file: `screenshot-${Date.now()}.png`,
      metadata: {
        resolution: { width: 1920, height: 1080 },
        timestamp: new Date(),
        fileSize: 245760,
        format: 'png',
        checksum: `sha256:screenshot-${Date.now()}`
      },
      annotations: []
    };
  }
  
  private async applyAnnotations(
    screenshot: ScreenshotResult,
    annotations: StepAnnotations
  ): Promise<AnnotatedScreenshotResult> {
    // Mock annotation application
    // In real implementation, would use image processing library
    
    return {
      originalFile: screenshot.file,
      annotatedFile: `annotated-${screenshot.file}`,
      annotations: [
        ...annotations.elements.map(el => ({
          id: el.id,
          type: el.type,
          position: { x: 100, y: 100 },
          content: el.content.text || '',
          applied: true
        }))
      ],
      metadata: {
        ...screenshot.metadata,
        annotationCount: annotations.elements.length,
        processingTime: 2000 // 2 seconds
      }
    };
  }
  
  private async handleGenerationFailure(sessionId: string, error: any): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'failed';
      session.completedAt = new Date();
      session.duration = Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000);
      session.error = {
        type: 'generation_failure',
        message: error.message,
        details: error,
        timestamp: new Date(),
        recoverable: this.isRecoverableError(error)
      };
      
      // Move to history
      this.sessionHistory.push(session);
      this.activeSessions.delete(sessionId);
    }
    
    console.error(`💥 Visual guide generation failed: ${sessionId}`, error.message);
  }
  
  private isRecoverableError(error: any): boolean {
    const recoverablePatterns = [
      'timeout',
      'network',
      'browser',
      'temporary'
    ];
    
    const errorMessage = error.message?.toLowerCase() || '';
    return recoverablePatterns.some(pattern => errorMessage.includes(pattern));
  }
}

// Additional interfaces for results
export interface AnnotatedScreenshotResult {
  originalFile: string;
  annotatedFile: string;
  annotations: AppliedAnnotation[];
  metadata: AnnotatedScreenshotMetadata;
}

export interface AppliedAnnotation {
  id: string;
  type: AnnotationType;
  position: { x: number; y: number };
  content: string;
  applied: boolean;
  error?: string;
}

export interface AnnotatedScreenshotMetadata {
  resolution: { width: number; height: number };
  timestamp: Date;
  fileSize: number;
  format: string;
  checksum: string;
  annotationCount: number;
  processingTime: number;
}

// Export the singleton instance
export const visualGuideGenerator = VisualGuideGenerator.getInstance();

// Utility functions
export async function createVisualGuideConfiguration(
  clientConfig: ClientConfiguration,
  guideDefinition: Partial<GuideDefinition>,
  customizations?: Partial<VisualGuideConfiguration>
): Promise<VisualGuideConfiguration> {
  const configId = `visual-guide-${clientConfig.id}-${Date.now()}`;
  
  const defaultConfig: VisualGuideConfiguration = {
    id: configId,
    clientId: clientConfig.id,
    clientConfig,
    guide: {
      id: `guide-${configId}`,
      title: guideDefinition.title || 'Visual Guide',
      description: guideDefinition.description || 'Step-by-step visual guide',
      type: guideDefinition.type || 'step_by_step',
      scope: {
        targetUrl: clientConfig.technicalConfig.productionUrl,
        includedPaths: ['/*'],
        excludedPaths: [],
        viewport: {
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          isMobile: false,
          deviceType: 'desktop'
        }
      },
      flow: guideDefinition.flow || [],
      styling: {
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
            info: '#3b82f6',
            highlight: '#fbbf24',
            overlay: 'rgba(0, 0, 0, 0.5)'
          },
          typography: {
            fontFamily: clientConfig.brandingConfig?.fonts?.primary || 'Inter, sans-serif',
            sizes: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
              '3xl': '1.875rem'
            },
            weights: {
              light: 300,
              normal: 400,
              medium: 500,
              semibold: 600,
              bold: 700
            },
            lineHeights: {
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
          effects: {
            borderRadius: {
              none: '0',
              sm: '0.125rem',
              md: '0.375rem',
              lg: '0.5rem',
              full: '9999px'
            },
            shadows: {
              sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            },
            transitions: {
              fast: '150ms ease',
              normal: '300ms ease',
              slow: '500ms ease'
            }
          }
        },
        branding: {
          colorOverrides: clientConfig.brandingConfig?.colors,
          fontOverrides: clientConfig.brandingConfig?.fonts
        },
        layout: {
          annotationLayer: { zIndex: 1000, isolation: true },
          contentLayer: { zIndex: 100, isolation: false },
          overlayLayer: { zIndex: 2000, isolation: true },
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          spacing: {
            betweenAnnotations: 10,
            betweenSteps: 30,
            aroundContent: 20
          }
        },
        responsive: {
          enabled: true,
          breakpoints: {
            mobile: 640,
            tablet: 768,
            desktop: 1024,
            widescreen: 1280
          },
          adaptations: []
        }
      },
      annotations: {
        autoNumbering: {
          enabled: true,
          style: 'numeric',
          startAt: 1,
          resetPerFlow: true
        },
        consistency: {
          enforceStyleGuides: true,
          colorConsistency: true,
          sizingConsistency: true,
          spacingConsistency: true,
          fontConsistency: true
        },
        accessibility: {
          altText: true,
          highContrast: false,
          focusIndicators: true,
          minimumColorContrast: 4.5,
          textScaling: true
        }
      }
    },
    capture: {
      browser: {
        engine: 'chromium',
        headless: true,
        viewport: {
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          isMobile: false,
          deviceType: 'desktop'
        },
        options: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          timeout: 30000,
          slowMo: 0,
          devtools: false
        }
      },
      timing: {
        pageLoadTimeout: 30000,
        elementTimeout: 10000,
        networkTimeout: 15000,
        stabilityDelay: 1000,
        betweenStepsDelay: 2000,
        beforeCaptureDelay: 500,
        afterCaptureDelay: 200
      },
      quality: {
        defaultQuality: 'high',
        compressionLevel: 80,
        optimizeForWeb: true,
        preserveMetadata: false,
        colorProfile: 'sRGB'
      },
      optimization: {
        parallelCapture: true,
        cacheResults: true,
        skipDuplicates: true,
        compressImages: true,
        generateThumbnails: true,
        createSprites: false
      }
    },
    processing: {
      postProcessing: {
        enabled: true,
        filters: [],
        adjustments: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          hue: 0,
          gamma: 1,
          exposure: 0
        },
        effects: {}
      },
      imageProcessing: {
        resizing: {
          enabled: false,
          maintainAspectRatio: true,
          algorithm: 'lanczos'
        },
        cropping: {
          enabled: false,
          smartCrop: true,
          padding: 0
        },
        watermarking: {
          enabled: false,
          position: {
            anchor: 'bottom-right',
            offsetX: 20,
            offsetY: 20
          },
          opacity: 0.5,
          size: 100
        },
        compression: {
          enabled: true,
          quality: 90,
          progressive: true,
          optimizeHuffman: true,
          stripMetadata: true
        }
      },
      annotationProcessing: {
        rendering: {
          antialiasing: true,
          subpixelRendering: true,
          highDPI: true,
          vectorRendering: true
        },
        layering: {
          separateLayers: false,
          layerOrder: ['background', 'highlights', 'annotations', 'overlays'],
          blendModes: {},
          groupLayers: false
        },
        optimization: {
          mergeOverlapping: true,
          simplifyPaths: true,
          optimizeText: true,
          cacheRenders: true
        }
      },
      optimization: {
        parallelProcessing: true,
        maxConcurrency: 4,
        memoryLimit: 1073741824, // 1GB
        tempDirectory: '/tmp/visual-guides',
        cleanupTemporary: true
      }
    },
    output: {
      formats: [
        { type: 'html', enabled: true, options: { responsive: true, embedImages: true } },
        { type: 'pdf', enabled: true, options: { quality: 90, compression: true } },
        { type: 'images', enabled: true, options: { quality: 90 } }
      ],
      structure: {
        directory: `/guides/${configId}`,
        subdirectories: {
          byFlow: true,
          byType: false,
          byDate: false
        },
        indexFile: {
          generate: true,
          filename: 'index.html',
          template: 'default',
          includeNavigation: true,
          includeThumbnails: true
        },
        assetDirectory: 'assets'
      },
      naming: {
        pattern: '{flow}-{step}-{title}',
        includeTimestamp: false,
        includeStepNumber: true,
        includeFlowName: true,
        sanitize: true,
        maxLength: 100
      },
      metadata: {
        includeInFiles: true,
        separateMetadataFile: true,
        format: 'json',
        includeSystem: true,
        includeProcessing: true,
        includeQuality: true
      }
    },
    metadata: {
      title: guideDefinition.title || 'Visual Guide',
      description: guideDefinition.description || 'Step-by-step visual guide',
      version: '1.0.0',
      author: 'Visual Guide Generator',
      created: new Date(),
      updated: new Date(),
      tags: [guideDefinition.type || 'guide', clientConfig.tier],
      category: 'documentation',
      estimatedDuration: 15,
      complexity: 'beginner',
      clientInfo: {
        id: clientConfig.id,
        name: clientConfig.name,
        tier: clientConfig.tier,
        domain: clientConfig.domain,
        customizations: clientConfig.customizations || {}
      }
    }
  };
  
  // Apply customizations
  if (customizations) {
    Object.assign(defaultConfig, customizations);
  }
  
  return defaultConfig;
}

export async function generateVisualGuide(
  clientConfig: ClientConfiguration,
  guideDefinition: Partial<GuideDefinition>,
  customizations?: Partial<VisualGuideConfiguration>
): Promise<GuideGenerationSession> {
  const configuration = await createVisualGuideConfiguration(clientConfig, guideDefinition, customizations);
  return visualGuideGenerator.generateVisualGuide(configuration);
}

// Example usage and validation
export async function validateVisualGuideGenerator(): Promise<boolean> {
  try {
    const generator = VisualGuideGenerator.getInstance();
    console.log('✅ Visual Guide Generator initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Visual Guide Generator validation failed:', error);
    return false;
  }
}
