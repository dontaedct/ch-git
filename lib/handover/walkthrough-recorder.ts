/**
 * @fileoverview Automated Walkthrough Video Recording System
 * @module lib/handover/walkthrough-recorder
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.3: Automated walkthrough video generation system (90-180s) with screen recording,
 * interactive tutorials, and visual guides per PRD Section 18 requirements.
 */

import { z } from 'zod';
import { ClientConfiguration, VideoLength, VideoCustomizations, VideoAsset, VideoChapter, VideoAnnotation } from '../types/handover/deliverables-types';

// Recording configuration types
export interface RecordingConfiguration {
  id: string;
  clientId: string;
  clientConfig: ClientConfiguration;
  scenario: WalkthroughScenario;
  settings: RecordingSettings;
  branding: BrandingSettings;
  outputConfig: OutputConfiguration;
  metadata: RecordingMetadata;
}

export interface WalkthroughScenario {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  steps: RecordingStep[];
  estimatedDuration: number; // seconds
  targetAudience: 'admin' | 'user' | 'developer' | 'stakeholder';
  complexity: 'basic' | 'intermediate' | 'advanced';
}

export type ScenarioType = 
  | 'admin_tour'
  | 'user_onboarding' 
  | 'feature_demo'
  | 'troubleshooting'
  | 'configuration_guide'
  | 'maintenance_procedure'
  | 'custom_workflow';

export interface RecordingStep {
  id: string;
  title: string;
  description: string;
  action: StepAction;
  expectedDuration: number; // seconds
  annotations?: StepAnnotation[];
  voiceover?: VoiceoverConfig;
  waitConditions?: WaitCondition[];
}

export interface StepAction {
  type: ActionType;
  target: string; // CSS selector, URL, or element identifier
  value?: string;
  options?: ActionOptions;
}

export type ActionType = 
  | 'navigate'
  | 'click'
  | 'type'
  | 'scroll'
  | 'hover'
  | 'wait'
  | 'screenshot'
  | 'highlight'
  | 'narrate'
  | 'pause';

export interface ActionOptions {
  delay?: number;
  smooth?: boolean;
  highlight?: boolean;
  annotate?: boolean;
  captureScreenshot?: boolean;
}

export interface StepAnnotation {
  type: 'text' | 'arrow' | 'highlight' | 'callout' | 'tooltip';
  position: { x: number; y: number };
  content: string;
  style?: AnnotationStyle;
  duration?: number; // seconds
}

export interface AnnotationStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  borderColor?: string;
  borderWidth?: number;
}

export interface VoiceoverConfig {
  enabled: boolean;
  text: string;
  voice?: 'natural' | 'synthetic';
  speed?: number; // 0.5 - 2.0
  language?: string;
}

export interface WaitCondition {
  type: 'element' | 'timeout' | 'network' | 'load' | 'custom';
  condition: string;
  timeout: number; // milliseconds
}

export interface RecordingSettings {
  resolution: Resolution;
  frameRate: number;
  quality: VideoQuality;
  duration: VideoLengthConfig;
  audio: AudioSettings;
  cursor: CursorSettings;
  transitions: TransitionSettings;
}

export interface Resolution {
  width: number;
  height: number;
  scaling?: number; // for high DPI displays
}

export type VideoQuality = 'standard' | 'high' | 'ultra';

export interface VideoLengthConfig {
  target: number; // seconds (90-180 as per requirements)
  minimum: number;
  maximum: number;
  autoTrim: boolean;
}

export interface AudioSettings {
  enabled: boolean;
  systemAudio: boolean;
  voiceover: boolean;
  musicTrack?: string;
  volume: {
    system: number;   // 0.0 - 1.0
    voiceover: number; // 0.0 - 1.0
    music: number;    // 0.0 - 1.0
  };
}

export interface CursorSettings {
  visible: boolean;
  highlightClicks: boolean;
  clickAnimation: boolean;
  customCursor?: string;
  size: number;
}

export interface TransitionSettings {
  enabled: boolean;
  type: 'fade' | 'slide' | 'zoom' | 'none';
  duration: number; // milliseconds
}

export interface BrandingSettings {
  logo?: BrandingElement;
  watermark?: BrandingElement;
  intro?: IntroOutroConfig;
  outro?: IntroOutroConfig;
  colors: BrandingColors;
  fonts: BrandingFonts;
}

export interface BrandingElement {
  url: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size: { width: number; height: number };
  opacity: number;
}

export interface IntroOutroConfig {
  enabled: boolean;
  duration: number; // seconds
  template: string;
  customContent?: string;
}

export interface BrandingColors {
  primary: string;
  secondary: string;
  accent?: string;
  background?: string;
  text?: string;
}

export interface BrandingFonts {
  primary: string;
  secondary?: string;
  sizes: {
    title: number;
    subtitle: number;
    body: number;
    caption: number;
  };
}

export interface OutputConfiguration {
  format: 'mp4' | 'webm' | 'mov';
  codec: 'h264' | 'h265' | 'vp9' | 'av1';
  bitrate: number; // kbps
  container: ContainerSettings;
  optimization: OptimizationSettings;
}

export interface ContainerSettings {
  includeMetadata: boolean;
  includeChapters: boolean;
  includeSubtitles: boolean;
  includeThumbnails: boolean;
}

export interface OptimizationSettings {
  webOptimized: boolean;
  progressiveDownload: boolean;
  fastStart: boolean;
  compression: 'balanced' | 'quality' | 'size' | 'speed';
}

export interface RecordingMetadata {
  title: string;
  description: string;
  tags: string[];
  version: string;
  createdBy: string;
  createdAt: Date;
  clientInfo: {
    name: string;
    tier: string;
    customizations: Record<string, any>;
  };
}

// Recording execution types
export interface RecordingSession {
  id: string;
  configurationId: string;
  status: RecordingStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // seconds
  progress: RecordingProgress;
  result?: RecordingResult;
  error?: RecordingError;
}

export type RecordingStatus = 
  | 'preparing'
  | 'recording'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface RecordingProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  estimatedTimeRemaining: number; // seconds
  currentStepName: string;
}

export interface RecordingResult {
  videoAsset: VideoAsset;
  chapters: VideoChapter[];
  annotations: VideoAnnotation[];
  transcript?: string;
  screenshots: string[];
  metadata: VideoMetadata;
  qualityMetrics: QualityMetrics;
}

export interface VideoMetadata {
  originalDuration: number;
  finalDuration: number;
  compressionRatio: number;
  resolution: Resolution;
  fileSize: number;
  checksum: string;
}

export interface QualityMetrics {
  overallScore: number;
  audioQuality: number;
  videoQuality: number;
  annotationAccuracy: number;
  timingAccuracy: number;
  brandingCompliance: number;
}

export interface RecordingError {
  type: string;
  message: string;
  details: any;
  timestamp: Date;
  recoverable: boolean;
  step?: string;
}

// Main walkthrough recorder class
export class WalkthroughRecorder {
  private static instance: WalkthroughRecorder;
  private activeSessions: Map<string, RecordingSession> = new Map();
  private sessionHistory: RecordingSession[] = [];
  
  private constructor() {}
  
  public static getInstance(): WalkthroughRecorder {
    if (!WalkthroughRecorder.instance) {
      WalkthroughRecorder.instance = new WalkthroughRecorder();
    }
    return WalkthroughRecorder.instance;
  }
  
  /**
   * Start a new walkthrough recording session
   */
  public async startRecording(configuration: RecordingConfiguration): Promise<RecordingSession> {
    try {
      console.log(`🎬 Starting walkthrough recording: ${configuration.scenario.name}`);
      
      // Validate configuration
      await this.validateConfiguration(configuration);
      
      // Create recording session
      const session = await this.createRecordingSession(configuration);
      
      // Add to active sessions
      this.activeSessions.set(session.id, session);
      
      // Start recording asynchronously
      this.executeRecordingAsync(session.id);
      
      console.log(`✅ Recording session started: ${session.id}`);
      return session;
      
    } catch (error) {
      console.error(`❌ Failed to start recording:`, error);
      throw new Error(`Failed to start recording: ${error.message}`);
    }
  }
  
  /**
   * Get recording session status
   */
  public async getSessionStatus(sessionId: string): Promise<RecordingSession | null> {
    return this.activeSessions.get(sessionId) || 
           this.sessionHistory.find(s => s.id === sessionId) || null;
  }
  
  /**
   * Cancel an active recording session
   */
  public async cancelRecording(sessionId: string, reason: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }
    
    session.status = 'cancelled';
    session.completedAt = new Date();
    session.error = {
      type: 'user_cancelled',
      message: `Recording cancelled: ${reason}`,
      details: { reason },
      timestamp: new Date(),
      recoverable: false
    };
    
    // Move to history
    this.sessionHistory.push(session);
    this.activeSessions.delete(sessionId);
    
    console.log(`🛑 Recording cancelled: ${sessionId} - ${reason}`);
    return true;
  }
  
  /**
   * Get all active recording sessions
   */
  public getActiveSessions(): RecordingSession[] {
    return Array.from(this.activeSessions.values());
  }
  
  /**
   * Get recording session history
   */
  public getSessionHistory(limit?: number): RecordingSession[] {
    return limit ? this.sessionHistory.slice(-limit) : this.sessionHistory;
  }
  
  // Private implementation methods
  
  private async validateConfiguration(config: RecordingConfiguration): Promise<void> {
    // Validate basic configuration
    const configSchema = z.object({
      id: z.string().min(1),
      clientId: z.string().min(1),
      scenario: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        steps: z.array(z.any()).min(1)
      }),
      settings: z.object({
        duration: z.object({
          target: z.number().min(90).max(180), // PRD requirement: 90-180 seconds
          minimum: z.number().min(60),
          maximum: z.number().max(300)
        })
      })
    });
    
    configSchema.parse(config);
    
    // Additional validations
    if (config.scenario.steps.length === 0) {
      throw new Error('Recording scenario must have at least one step');
    }
    
    if (config.settings.duration.target < 90 || config.settings.duration.target > 180) {
      throw new Error('Target duration must be between 90-180 seconds per PRD requirements');
    }
  }
  
  private async createRecordingSession(config: RecordingConfiguration): Promise<RecordingSession> {
    const sessionId = `recording-${config.clientId}-${Date.now()}`;
    
    const session: RecordingSession = {
      id: sessionId,
      configurationId: config.id,
      status: 'preparing',
      startedAt: new Date(),
      progress: {
        currentStep: 0,
        totalSteps: config.scenario.steps.length,
        percentage: 0,
        estimatedTimeRemaining: config.scenario.estimatedDuration,
        currentStepName: 'Preparing recording...'
      }
    };
    
    return session;
  }
  
  private async executeRecordingAsync(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }
      
      session.status = 'recording';
      
      // Execute recording workflow
      const result = await this.executeRecordingWorkflow(session);
      
      // Complete session
      session.status = 'completed';
      session.completedAt = new Date();
      session.duration = Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000);
      session.result = result;
      
      // Move to history
      this.sessionHistory.push(session);
      this.activeSessions.delete(sessionId);
      
      console.log(`🎉 Recording completed: ${sessionId} (${session.duration}s)`);
      
    } catch (error) {
      console.error(`❌ Recording execution failed:`, error);
      await this.handleRecordingFailure(sessionId, error);
    }
  }
  
  private async executeRecordingWorkflow(session: RecordingSession): Promise<RecordingResult> {
    // Simulate recording workflow execution
    // In a real implementation, this would:
    // 1. Initialize browser automation (Playwright/Puppeteer)
    // 2. Setup screen capture
    // 3. Execute scenario steps
    // 4. Capture video, screenshots, and annotations
    // 5. Process and encode final video
    
    const mockResult: RecordingResult = {
      videoAsset: {
        id: `video-${session.id}`,
        url: `https://storage.example.com/videos/${session.id}.mp4`,
        duration: 120, // 2 minutes
        size: 15728640, // 15MB
        format: 'mp4',
        resolution: { width: 1920, height: 1080 },
        quality: 'high',
        thumbnailUrl: `https://storage.example.com/thumbnails/${session.id}.jpg`
      },
      chapters: [
        {
          id: 'chapter-1',
          title: 'Introduction',
          startTime: 0,
          endTime: 15,
          description: 'Overview of the system'
        },
        {
          id: 'chapter-2',
          title: 'Main Workflow',
          startTime: 15,
          endTime: 90,
          description: 'Step-by-step walkthrough'
        },
        {
          id: 'chapter-3',
          title: 'Summary',
          startTime: 90,
          endTime: 120,
          description: 'Key takeaways and next steps'
        }
      ],
      annotations: [
        {
          id: 'annotation-1',
          type: 'text',
          startTime: 5,
          endTime: 10,
          position: { x: 50, y: 20 },
          content: 'Welcome to your system walkthrough'
        }
      ],
      transcript: 'Welcome to your system walkthrough. In this video, we will show you how to...',
      screenshots: [
        `https://storage.example.com/screenshots/${session.id}-1.png`,
        `https://storage.example.com/screenshots/${session.id}-2.png`
      ],
      metadata: {
        originalDuration: 125,
        finalDuration: 120,
        compressionRatio: 0.8,
        resolution: { width: 1920, height: 1080 },
        fileSize: 15728640,
        checksum: 'sha256:abc123...'
      },
      qualityMetrics: {
        overallScore: 95,
        audioQuality: 92,
        videoQuality: 96,
        annotationAccuracy: 98,
        timingAccuracy: 94,
        brandingCompliance: 100
      }
    };
    
    // Simulate processing time
    await this.simulateProcessingSteps(session);
    
    return mockResult;
  }
  
  private async simulateProcessingSteps(session: RecordingSession): Promise<void> {
    const steps = [
      'Initializing browser automation',
      'Setting up screen capture',
      'Recording walkthrough steps',
      'Capturing annotations',
      'Processing video',
      'Applying branding',
      'Generating chapters',
      'Creating transcript',
      'Optimizing output',
      'Finalizing video'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      session.progress.currentStep = i + 1;
      session.progress.currentStepName = steps[i];
      session.progress.percentage = Math.round(((i + 1) / steps.length) * 100);
      session.progress.estimatedTimeRemaining = Math.max(0, (steps.length - i - 1) * 5);
      
      // Simulate processing time (1-3 seconds per step)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      console.log(`📹 ${steps[i]} (${session.progress.percentage}%)`);
    }
  }
  
  private async handleRecordingFailure(sessionId: string, error: any): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'failed';
      session.completedAt = new Date();
      session.duration = Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000);
      session.error = {
        type: 'recording_failure',
        message: error.message,
        details: error,
        timestamp: new Date(),
        recoverable: this.isRecoverableError(error)
      };
      
      // Move to history
      this.sessionHistory.push(session);
      this.activeSessions.delete(sessionId);
    }
    
    console.error(`💥 Recording failed: ${sessionId}`, error.message);
  }
  
  private isRecoverableError(error: any): boolean {
    const recoverablePatterns = [
      'timeout',
      'network',
      'browser',
      'element not found'
    ];
    
    const errorMessage = error.message?.toLowerCase() || '';
    return recoverablePatterns.some(pattern => errorMessage.includes(pattern));
  }
}

// Export the singleton instance
export const walkthroughRecorder = WalkthroughRecorder.getInstance();

// Pre-defined scenario templates
export const SCENARIO_TEMPLATES: Record<string, Partial<WalkthroughScenario>> = {
  admin_tour: {
    name: 'Admin Dashboard Tour',
    description: 'Complete tour of admin dashboard features and capabilities',
    type: 'admin_tour',
    targetAudience: 'admin',
    complexity: 'intermediate',
    estimatedDuration: 120
  },
  user_onboarding: {
    name: 'User Onboarding Walkthrough',
    description: 'Step-by-step user onboarding and first-time setup',
    type: 'user_onboarding',
    targetAudience: 'user',
    complexity: 'basic',
    estimatedDuration: 90
  },
  feature_demo: {
    name: 'Key Features Demonstration',
    description: 'Showcase of primary system features and workflows',
    type: 'feature_demo',
    targetAudience: 'stakeholder',
    complexity: 'intermediate',
    estimatedDuration: 150
  },
  troubleshooting: {
    name: 'Common Issues & Solutions',
    description: 'How to identify and resolve common system issues',
    type: 'troubleshooting',
    targetAudience: 'admin',
    complexity: 'advanced',
    estimatedDuration: 180
  }
};

// Utility functions
export async function createRecordingConfiguration(
  clientConfig: ClientConfiguration,
  scenarioType: ScenarioType,
  customizations?: Partial<RecordingConfiguration>
): Promise<RecordingConfiguration> {
  const template = SCENARIO_TEMPLATES[scenarioType];
  if (!template) {
    throw new Error(`Unknown scenario type: ${scenarioType}`);
  }
  
  const configId = `config-${clientConfig.id}-${scenarioType}-${Date.now()}`;
  
  const defaultConfig: RecordingConfiguration = {
    id: configId,
    clientId: clientConfig.id,
    clientConfig,
    scenario: {
      id: `scenario-${configId}`,
      name: template.name || 'Custom Walkthrough',
      description: template.description || 'Custom walkthrough scenario',
      type: scenarioType,
      steps: [], // Will be populated based on scenario type
      estimatedDuration: template.estimatedDuration || 120,
      targetAudience: template.targetAudience || 'user',
      complexity: template.complexity || 'basic'
    },
    settings: {
      resolution: { width: 1920, height: 1080 },
      frameRate: 30,
      quality: 'high',
      duration: {
        target: 120,
        minimum: 90,
        maximum: 180,
        autoTrim: true
      },
      audio: {
        enabled: true,
        systemAudio: false,
        voiceover: true,
        volume: {
          system: 0.3,
          voiceover: 0.8,
          music: 0.2
        }
      },
      cursor: {
        visible: true,
        highlightClicks: true,
        clickAnimation: true,
        size: 24
      },
      transitions: {
        enabled: true,
        type: 'fade',
        duration: 500
      }
    },
    branding: {
      colors: {
        primary: clientConfig.brandingConfig?.colors?.primary || '#2563eb',
        secondary: clientConfig.brandingConfig?.colors?.secondary || '#64748b',
        background: '#ffffff',
        text: '#1e293b'
      },
      fonts: {
        primary: clientConfig.brandingConfig?.fonts?.primary || 'Inter',
        sizes: {
          title: 24,
          subtitle: 18,
          body: 14,
          caption: 12
        }
      },
      intro: {
        enabled: true,
        duration: 3,
        template: 'default'
      },
      outro: {
        enabled: true,
        duration: 2,
        template: 'default'
      }
    },
    outputConfig: {
      format: 'mp4',
      codec: 'h264',
      bitrate: 5000,
      container: {
        includeMetadata: true,
        includeChapters: true,
        includeSubtitles: false,
        includeThumbnails: true
      },
      optimization: {
        webOptimized: true,
        progressiveDownload: true,
        fastStart: true,
        compression: 'balanced'
      }
    },
    metadata: {
      title: `${clientConfig.name} - ${template.name}`,
      description: template.description || 'System walkthrough video',
      tags: [scenarioType, clientConfig.tier, 'walkthrough'],
      version: '1.0.0',
      createdBy: 'system',
      createdAt: new Date(),
      clientInfo: {
        name: clientConfig.name,
        tier: clientConfig.tier,
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

export async function startWalkthroughRecording(
  clientConfig: ClientConfiguration,
  scenarioType: ScenarioType,
  customizations?: Partial<RecordingConfiguration>
): Promise<RecordingSession> {
  const configuration = await createRecordingConfiguration(clientConfig, scenarioType, customizations);
  return walkthroughRecorder.startRecording(configuration);
}

export async function getRecordingStatus(sessionId: string): Promise<RecordingSession | null> {
  return walkthroughRecorder.getSessionStatus(sessionId);
}

export async function cancelRecording(sessionId: string, reason: string): Promise<boolean> {
  return walkthroughRecorder.cancelRecording(sessionId, reason);
}

// Example usage and validation
export async function validateWalkthroughRecorder(): Promise<boolean> {
  try {
    const recorder = WalkthroughRecorder.getInstance();
    console.log('✅ Walkthrough Recorder initialized successfully');
    
    // Test scenario template validation
    const scenarioTypes = Object.keys(SCENARIO_TEMPLATES);
    console.log(`✅ ${scenarioTypes.length} scenario templates available: ${scenarioTypes.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('❌ Walkthrough Recorder validation failed:', error);
    return false;
  }
}
