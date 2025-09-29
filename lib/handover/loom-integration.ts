/**
 * @fileoverview Loom API Integration for Video Hosting
 * @module lib/handover/loom-integration
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.3: Loom API integration for video hosting and management of
 * walkthrough videos with sharing, embedding, and analytics capabilities.
 */

import { z } from 'zod';
import { ClientConfiguration } from '../../types/handover/deliverables-types';

// Loom integration configuration types
export interface LoomConfiguration {
  id: string;
  clientId: string;
  clientConfig: ClientConfiguration;
  credentials: LoomCredentials;
  settings: LoomSettings;
  privacy: PrivacySettings;
  branding: LoomBrandingSettings;
  analytics: AnalyticsSettings;
}

export interface LoomCredentials {
  apiKey: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  workspace?: string;
  userId?: string;
}

export interface LoomSettings {
  defaultPrivacy: LoomPrivacyLevel;
  autoUpload: boolean;
  generateThumbnails: boolean;
  autoTranscription: boolean;
  notificationSettings: NotificationSettings;
  qualitySettings: LoomQualitySettings;
  retentionSettings: RetentionSettings;
}

export type LoomPrivacyLevel = 'public' | 'unlisted' | 'private' | 'password_protected' | 'domain_restricted';

export interface NotificationSettings {
  uploadComplete: boolean;
  transcriptionReady: boolean;
  shareEvents: boolean;
  commentNotifications: boolean;
  emailNotifications: boolean;
  webhookNotifications: boolean;
  webhookUrl?: string;
}

export interface LoomQualitySettings {
  resolution: 'auto' | '1080p' | '720p' | '480p';
  compression: 'auto' | 'high' | 'medium' | 'low';
  audioQuality: 'auto' | 'high' | 'medium' | 'low';
  uploadTimeout: number; // seconds
}

export interface RetentionSettings {
  autoDelete: boolean;
  retentionPeriod: number; // days
  archiveBeforeDelete: boolean;
  backupLocation?: string;
}

export interface PrivacySettings {
  allowDownloads: boolean;
  allowComments: boolean;
  allowReactions: boolean;
  requireAuthentication: boolean;
  domainRestrictions: string[];
  passwordProtection?: PasswordProtection;
  expirationSettings?: ExpirationSettings;
}

export interface PasswordProtection {
  enabled: boolean;
  password?: string;
  autoGenerate: boolean;
  complexity: 'simple' | 'medium' | 'complex';
}

export interface ExpirationSettings {
  enabled: boolean;
  expirationDate?: Date;
  expirationDays?: number;
  notifyBeforeExpiration: boolean;
  notificationDays: number;
}

export interface LoomBrandingSettings {
  customThumbnail: boolean;
  brandedPlayer: boolean;
  logoOverlay: LogoOverlaySettings;
  customColors: CustomColorSettings;
  callToAction: CallToActionSettings;
}

export interface LogoOverlaySettings {
  enabled: boolean;
  logoUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium' | 'large';
  opacity: number;
}

export interface CustomColorSettings {
  enabled: boolean;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface CallToActionSettings {
  enabled: boolean;
  type: 'button' | 'overlay' | 'end_screen';
  text: string;
  url: string;
  timing: CTATiming;
  style: CTAStyleSettings;
}

export interface CTATiming {
  showAt: 'start' | 'middle' | 'end' | 'custom';
  customTime?: number; // seconds
  duration?: number; // seconds for overlays
}

export interface CTAStyleSettings {
  buttonColor: string;
  textColor: string;
  size: 'small' | 'medium' | 'large';
  position?: 'center' | 'bottom' | 'top';
}

export interface AnalyticsSettings {
  enabled: boolean;
  trackViews: boolean;
  trackEngagement: boolean;
  trackCompletion: boolean;
  trackShares: boolean;
  customEvents: CustomAnalyticsEvent[];
  exportSettings: AnalyticsExportSettings;
}

export interface CustomAnalyticsEvent {
  name: string;
  trigger: 'play' | 'pause' | 'seek' | 'complete' | 'share' | 'download';
  data?: Record<string, any>;
}

export interface AnalyticsExportSettings {
  autoExport: boolean;
  exportFrequency: 'daily' | 'weekly' | 'monthly';
  exportFormat: 'csv' | 'json' | 'xlsx';
  exportDestination: 'email' | 'webhook' | 'storage';
  webhookUrl?: string;
  emailAddress?: string;
}

// Loom API response types
export interface LoomVideo {
  id: string;
  title: string;
  description?: string;
  status: LoomVideoStatus;
  privacy: LoomPrivacyLevel;
  url: string;
  embedUrl: string;
  shareUrl: string;
  thumbnailUrl: string;
  duration: number; // seconds
  resolution: VideoResolution;
  fileSize: number; // bytes
  createdAt: Date;
  updatedAt: Date;
  uploadedAt?: Date;
  owner: LoomUser;
  workspace?: LoomWorkspace;
  metadata: LoomVideoMetadata;
  analytics?: LoomVideoAnalytics;
}

export type LoomVideoStatus = 'uploading' | 'processing' | 'ready' | 'failed' | 'archived' | 'deleted';

export interface VideoResolution {
  width: number;
  height: number;
  quality: string;
}

export interface LoomUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface LoomWorkspace {
  id: string;
  name: string;
  domain: string;
  plan: string;
  settings: LoomWorkspaceSettings;
}

export interface LoomWorkspaceSettings {
  allowExternalSharing: boolean;
  requireAuthentication: boolean;
  customBranding: boolean;
  analyticsEnabled: boolean;
  retentionPolicy: number; // days
}

export interface LoomVideoMetadata {
  tags: string[];
  transcript?: LoomTranscript;
  chapters?: LoomChapter[];
  customData?: Record<string, any>;
  uploadSource: string;
  clientInfo?: LoomClientInfo;
}

export interface LoomTranscript {
  language: string;
  confidence: number;
  segments: TranscriptSegment[];
  fullText: string;
  generatedAt: Date;
}

export interface TranscriptSegment {
  startTime: number; // seconds
  endTime: number; // seconds
  text: string;
  confidence: number;
  speaker?: string;
}

export interface LoomChapter {
  id: string;
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
  thumbnail?: string;
}

export interface LoomClientInfo {
  clientId: string;
  clientName: string;
  projectId?: string;
  sessionId?: string;
}

export interface LoomVideoAnalytics {
  views: number;
  uniqueViewers: number;
  completionRate: number; // percentage
  averageWatchTime: number; // seconds
  engagement: EngagementMetrics;
  geography: GeographyMetrics;
  devices: DeviceMetrics;
  timeData: TimeSeriesData[];
}

export interface EngagementMetrics {
  likes: number;
  shares: number;
  comments: number;
  downloads: number;
  reactions: ReactionCount[];
}

export interface ReactionCount {
  type: string;
  count: number;
}

export interface GeographyMetrics {
  countries: CountryMetric[];
  cities: CityMetric[];
}

export interface CountryMetric {
  country: string;
  countryCode: string;
  views: number;
  percentage: number;
}

export interface CityMetric {
  city: string;
  country: string;
  views: number;
  percentage: number;
}

export interface DeviceMetrics {
  desktop: number;
  mobile: number;
  tablet: number;
  browsers: BrowserMetric[];
  operatingSystems: OSMetric[];
}

export interface BrowserMetric {
  browser: string;
  version: string;
  views: number;
  percentage: number;
}

export interface OSMetric {
  os: string;
  version: string;
  views: number;
  percentage: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  views: number;
  uniqueViewers: number;
  watchTime: number; // seconds
}

// Upload and management types
export interface LoomUploadSession {
  id: string;
  status: UploadStatus;
  progress: UploadProgress;
  videoFile: string;
  configuration: LoomConfiguration;
  result?: LoomVideo;
  error?: LoomError;
  startedAt: Date;
  completedAt?: Date;
}

export type UploadStatus = 
  | 'preparing'
  | 'uploading'
  | 'processing'
  | 'transcoding'
  | 'generating_thumbnail'
  | 'generating_transcript'
  | 'finalizing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface UploadProgress {
  phase: UploadStatus;
  percentage: number;
  uploadedBytes: number;
  totalBytes: number;
  uploadSpeed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
  currentStep: string;
}

export interface LoomError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  retryAfter?: number; // seconds
}

export interface LoomSharingOptions {
  privacy: LoomPrivacyLevel;
  password?: string;
  domainRestrictions?: string[];
  expirationDate?: Date;
  allowDownloads: boolean;
  allowComments: boolean;
  requireSignin: boolean;
  customization: SharingCustomization;
}

export interface SharingCustomization {
  title?: string;
  description?: string;
  thumbnail?: string;
  callToAction?: CallToActionSettings;
  branding?: LoomBrandingSettings;
}

export interface LoomEmbedOptions {
  width: number;
  height: number;
  responsive: boolean;
  autoplay: boolean;
  hideTitle: boolean;
  hideOwner: boolean;
  hideShare: boolean;
  hideFullscreen: boolean;
  customization: EmbedCustomization;
}

export interface EmbedCustomization {
  theme: 'light' | 'dark' | 'auto';
  accentColor?: string;
  backgroundColor?: string;
  showControls: boolean;
  showProgress: boolean;
  startTime?: number; // seconds
  endTime?: number; // seconds
}

// Main Loom integration class
export class LoomIntegration {
  private static instance: LoomIntegration;
  private activeUploads: Map<string, LoomUploadSession> = new Map();
  private uploadHistory: LoomUploadSession[] = [];
  private apiBaseUrl = 'https://www.loom.com/api/public/v1';
  
  private constructor() {}
  
  public static getInstance(): LoomIntegration {
    if (!LoomIntegration.instance) {
      LoomIntegration.instance = new LoomIntegration();
    }
    return LoomIntegration.instance;
  }
  
  /**
   * Upload video to Loom
   */
  public async uploadVideo(
    videoFile: string,
    configuration: LoomConfiguration,
    options?: UploadOptions
  ): Promise<LoomUploadSession> {
    try {
      console.log(`📤 Starting Loom upload: ${videoFile}`);
      
      // Validate configuration and file
      await this.validateConfiguration(configuration);
      await this.validateVideoFile(videoFile);
      
      // Create upload session
      const session = await this.createUploadSession(videoFile, configuration);
      
      // Add to active uploads
      this.activeUploads.set(session.id, session);
      
      // Start upload asynchronously
      this.executeUploadAsync(session.id, options);
      
      console.log(`✅ Loom upload started: ${session.id}`);
      return session;
      
    } catch (error) {
      console.error(`❌ Failed to start Loom upload:`, error);
      throw new Error(`Failed to start Loom upload: ${error.message}`);
    }
  }
  
  /**
   * Get video information from Loom
   */
  public async getVideo(videoId: string, configuration: LoomConfiguration): Promise<LoomVideo> {
    try {
      console.log(`📹 Fetching Loom video: ${videoId}`);
      
      const response = await this.makeApiRequest(
        'GET',
        `/videos/${videoId}`,
        configuration.credentials
      );
      
      const video = this.transformApiResponse(response);
      
      console.log(`✅ Loom video fetched: ${video.title}`);
      return video;
      
    } catch (error) {
      console.error(`❌ Failed to fetch Loom video:`, error);
      throw new Error(`Failed to fetch Loom video: ${error.message}`);
    }
  }
  
  /**
   * Update video settings
   */
  public async updateVideo(
    videoId: string,
    updates: Partial<LoomVideo>,
    configuration: LoomConfiguration
  ): Promise<LoomVideo> {
    try {
      console.log(`✏️ Updating Loom video: ${videoId}`);
      
      const response = await this.makeApiRequest(
        'PATCH',
        `/videos/${videoId}`,
        configuration.credentials,
        this.transformUpdatePayload(updates)
      );
      
      const video = this.transformApiResponse(response);
      
      console.log(`✅ Loom video updated: ${video.title}`);
      return video;
      
    } catch (error) {
      console.error(`❌ Failed to update Loom video:`, error);
      throw new Error(`Failed to update Loom video: ${error.message}`);
    }
  }
  
  /**
   * Delete video from Loom
   */
  public async deleteVideo(videoId: string, configuration: LoomConfiguration): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting Loom video: ${videoId}`);
      
      await this.makeApiRequest(
        'DELETE',
        `/videos/${videoId}`,
        configuration.credentials
      );
      
      console.log(`✅ Loom video deleted: ${videoId}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to delete Loom video:`, error);
      throw new Error(`Failed to delete Loom video: ${error.message}`);
    }
  }
  
  /**
   * Generate sharing links and embed codes
   */
  public async generateSharingOptions(
    videoId: string,
    options: LoomSharingOptions,
    configuration: LoomConfiguration
  ): Promise<SharingResult> {
    try {
      console.log(`🔗 Generating sharing options for video: ${videoId}`);
      
      // Update video privacy settings
      if (options.privacy !== 'public') {
        await this.updateVideo(videoId, { privacy: options.privacy }, configuration);
      }
      
      // Generate sharing links
      const video = await this.getVideo(videoId, configuration);
      
      const result: SharingResult = {
        videoId,
        shareUrl: video.shareUrl,
        embedUrl: video.embedUrl,
        embedCode: this.generateEmbedCode(video, options),
        qrCode: await this.generateQRCode(video.shareUrl),
        socialSharing: this.generateSocialSharingLinks(video, options),
        downloadLinks: options.allowDownloads ? await this.generateDownloadLinks(video, configuration) : undefined,
        analytics: {
          trackingEnabled: configuration.analytics.enabled,
          trackingUrl: `${this.apiBaseUrl}/analytics/${videoId}`,
          webhookUrl: configuration.analytics.exportSettings.webhookUrl
        }
      };
      
      console.log(`✅ Sharing options generated for video: ${videoId}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to generate sharing options:`, error);
      throw new Error(`Failed to generate sharing options: ${error.message}`);
    }
  }
  
  /**
   * Get video analytics
   */
  public async getVideoAnalytics(
    videoId: string,
    configuration: LoomConfiguration,
    options?: AnalyticsOptions
  ): Promise<LoomVideoAnalytics> {
    try {
      console.log(`📊 Fetching analytics for video: ${videoId}`);
      
      const queryParams = this.buildAnalyticsQuery(options);
      const response = await this.makeApiRequest(
        'GET',
        `/videos/${videoId}/insights?${queryParams}`,
        configuration.credentials
      );
      
      const analytics = this.transformAnalyticsResponse(response);
      
      console.log(`✅ Analytics fetched for video: ${videoId}`);
      return analytics;
      
    } catch (error) {
      console.error(`❌ Failed to fetch video analytics:`, error);
      throw new Error(`Failed to fetch video analytics: ${error.message}`);
    }
  }
  
  /**
   * Get upload session status
   */
  public async getUploadStatus(sessionId: string): Promise<LoomUploadSession | null> {
    return this.activeUploads.get(sessionId) || 
           this.uploadHistory.find(s => s.id === sessionId) || null;
  }
  
  /**
   * Cancel upload session
   */
  public async cancelUpload(sessionId: string, reason: string): Promise<boolean> {
    const session = this.activeUploads.get(sessionId);
    if (!session) {
      return false;
    }
    
    session.status = 'cancelled';
    session.error = {
      code: 'USER_CANCELLED',
      message: `Upload cancelled: ${reason}`,
      timestamp: new Date(),
      recoverable: false
    };
    
    // Move to history
    this.uploadHistory.push(session);
    this.activeUploads.delete(sessionId);
    
    console.log(`🛑 Loom upload cancelled: ${sessionId} - ${reason}`);
    return true;
  }
  
  // Private implementation methods
  
  private async validateConfiguration(config: LoomConfiguration): Promise<void> {
    const configSchema = z.object({
      id: z.string().min(1),
      clientId: z.string().min(1),
      credentials: z.object({
        apiKey: z.string().min(1)
      })
    });
    
    configSchema.parse(config);
    
    // Test API connection
    try {
      await this.makeApiRequest('GET', '/user', config.credentials);
    } catch (error) {
      throw new Error(`Invalid Loom credentials: ${error.message}`);
    }
  }
  
  private async validateVideoFile(videoFile: string): Promise<void> {
    // Mock file validation
    // In real implementation, would check file existence, format, size, etc.
    
    if (!videoFile || videoFile.length === 0) {
      throw new Error('Video file path is required');
    }
    
    const supportedFormats = ['.mp4', '.mov', '.avi', '.webm'];
    const extension = videoFile.toLowerCase().substring(videoFile.lastIndexOf('.'));
    
    if (!supportedFormats.includes(extension)) {
      throw new Error(`Unsupported video format: ${extension}. Supported formats: ${supportedFormats.join(', ')}`);
    }
  }
  
  private async createUploadSession(videoFile: string, config: LoomConfiguration): Promise<LoomUploadSession> {
    const sessionId = `loom-upload-${config.clientId}-${Date.now()}`;
    
    const session: LoomUploadSession = {
      id: sessionId,
      status: 'preparing',
      progress: {
        phase: 'preparing',
        percentage: 0,
        uploadedBytes: 0,
        totalBytes: 0, // Will be set after file inspection
        uploadSpeed: 0,
        estimatedTimeRemaining: 0,
        currentStep: 'Preparing upload...'
      },
      videoFile,
      configuration: config,
      startedAt: new Date()
    };
    
    return session;
  }
  
  private async executeUploadAsync(sessionId: string, options?: UploadOptions): Promise<void> {
    try {
      const session = this.activeUploads.get(sessionId);
      if (!session) {
        throw new Error(`Upload session ${sessionId} not found`);
      }
      
      // Execute upload phases
      await this.executeUploadPhases(session, options);
      
      // Complete session
      session.status = 'completed';
      session.completedAt = new Date();
      
      // Move to history
      this.uploadHistory.push(session);
      this.activeUploads.delete(sessionId);
      
      console.log(`🎉 Loom upload completed: ${sessionId}`);
      
    } catch (error) {
      console.error(`❌ Loom upload failed:`, error);
      await this.handleUploadFailure(sessionId, error);
    }
  }
  
  private async executeUploadPhases(session: LoomUploadSession, options?: UploadOptions): Promise<void> {
    const phases: UploadStatus[] = [
      'uploading',
      'processing',
      'transcoding',
      'generating_thumbnail',
      'generating_transcript',
      'finalizing'
    ];
    
    for (const phase of phases) {
      session.progress.phase = phase;
      session.progress.currentStep = this.getPhaseDescription(phase);
      
      console.log(`📤 Upload phase: ${phase}`);
      
      // Simulate phase processing
      await this.simulateUploadPhase(session, phase);
      
      // Update progress
      const phaseIndex = phases.indexOf(phase);
      session.progress.percentage = Math.round(((phaseIndex + 1) / phases.length) * 100);
    }
    
    // Generate mock Loom video result
    session.result = await this.generateMockLoomVideo(session);
  }
  
  private getPhaseDescription(phase: UploadStatus): string {
    const descriptions: Record<UploadStatus, string> = {
      'preparing': 'Preparing upload...',
      'uploading': 'Uploading video to Loom...',
      'processing': 'Processing video...',
      'transcoding': 'Transcoding video...',
      'generating_thumbnail': 'Generating thumbnail...',
      'generating_transcript': 'Generating transcript...',
      'finalizing': 'Finalizing upload...',
      'completed': 'Upload completed',
      'failed': 'Upload failed',
      'cancelled': 'Upload cancelled'
    };
    
    return descriptions[phase] || `Processing ${phase}...`;
  }
  
  private async simulateUploadPhase(session: LoomUploadSession, phase: UploadStatus): Promise<void> {
    const duration = this.getPhaseEstimatedDuration(phase);
    const steps = 10;
    
    for (let i = 0; i < steps; i++) {
      if (phase === 'uploading') {
        const stepBytes = session.progress.totalBytes / steps;
        session.progress.uploadedBytes += stepBytes;
        session.progress.uploadSpeed = stepBytes / (duration / steps);
      }
      
      session.progress.estimatedTimeRemaining = Math.max(0, duration - (i * duration / steps));
      
      await new Promise(resolve => setTimeout(resolve, (duration / steps) * 100)); // Simulated time
    }
  }
  
  private getPhaseEstimatedDuration(phase: UploadStatus): number {
    // Estimated duration in seconds for each phase
    const durations: Record<UploadStatus, number> = {
      'preparing': 5,
      'uploading': 60,
      'processing': 30,
      'transcoding': 45,
      'generating_thumbnail': 10,
      'generating_transcript': 20,
      'finalizing': 5,
      'completed': 0,
      'failed': 0,
      'cancelled': 0
    };
    
    return durations[phase] || 30;
  }
  
  private async generateMockLoomVideo(session: LoomUploadSession): Promise<LoomVideo> {
    const videoId = `loom-${session.id}`;
    
    return {
      id: videoId,
      title: `Walkthrough Video - ${session.configuration.clientConfig.name}`,
      description: 'Automated walkthrough video generated by the handover system',
      status: 'ready',
      privacy: session.configuration.settings.defaultPrivacy,
      url: `https://www.loom.com/share/${videoId}`,
      embedUrl: `https://www.loom.com/embed/${videoId}`,
      shareUrl: `https://www.loom.com/share/${videoId}`,
      thumbnailUrl: `https://cdn.loom.com/sessions/thumbnails/${videoId}-with-play.gif`,
      duration: 120, // 2 minutes
      resolution: { width: 1920, height: 1080, quality: 'HD' },
      fileSize: 15728640, // 15MB
      createdAt: new Date(),
      updatedAt: new Date(),
      uploadedAt: new Date(),
      owner: {
        id: 'user-123',
        email: session.configuration.clientConfig.contactInfo.primaryContact.email,
        name: session.configuration.clientConfig.contactInfo.primaryContact.name,
        role: 'owner'
      },
      metadata: {
        tags: ['walkthrough', 'handover', session.configuration.clientConfig.tier],
        transcript: {
          language: 'en',
          confidence: 0.95,
          segments: [
            {
              startTime: 0,
              endTime: 5,
              text: 'Welcome to your system walkthrough.',
              confidence: 0.98
            },
            {
              startTime: 5,
              endTime: 15,
              text: 'In this video, we will show you how to navigate and use your new system.',
              confidence: 0.96
            }
          ],
          fullText: 'Welcome to your system walkthrough. In this video, we will show you how to navigate and use your new system.',
          generatedAt: new Date()
        },
        uploadSource: 'handover_automation',
        clientInfo: {
          clientId: session.configuration.clientId,
          clientName: session.configuration.clientConfig.name,
          sessionId: session.id
        }
      },
      analytics: {
        views: 0,
        uniqueViewers: 0,
        completionRate: 0,
        averageWatchTime: 0,
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0,
          downloads: 0,
          reactions: []
        },
        geography: {
          countries: [],
          cities: []
        },
        devices: {
          desktop: 0,
          mobile: 0,
          tablet: 0,
          browsers: [],
          operatingSystems: []
        },
        timeData: []
      }
    };
  }
  
  private async makeApiRequest(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    credentials: LoomCredentials,
    data?: any
  ): Promise<any> {
    // Mock API request
    // In real implementation, would use fetch or axios to make actual HTTP requests
    
    console.log(`🌐 Loom API ${method} ${endpoint}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock response based on endpoint
    if (endpoint === '/user') {
      return {
        id: 'user-123',
        email: 'user@example.com',
        name: 'User Name'
      };
    }
    
    if (endpoint.startsWith('/videos/')) {
      const videoId = endpoint.split('/')[2];
      return {
        id: videoId,
        title: 'Mock Video',
        status: 'ready',
        // ... other mock video properties
      };
    }
    
    return { success: true };
  }
  
  private transformApiResponse(response: any): LoomVideo {
    // Transform Loom API response to our internal format
    // This is a simplified transformation
    return response as LoomVideo;
  }
  
  private transformUpdatePayload(updates: Partial<LoomVideo>): any {
    // Transform our internal format to Loom API format
    return {
      title: updates.title,
      description: updates.description,
      privacy: updates.privacy,
      // ... other transformations
    };
  }
  
  private generateEmbedCode(video: LoomVideo, options: LoomSharingOptions): string {
    const embedOptions: LoomEmbedOptions = {
      width: 640,
      height: 360,
      responsive: true,
      autoplay: false,
      hideTitle: false,
      hideOwner: false,
      hideShare: !options.allowDownloads,
      hideFullscreen: false,
      customization: {
        theme: 'light',
        showControls: true,
        showProgress: true
      }
    };
    
    return `<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <iframe 
    src="${video.embedUrl}" 
    frameborder="0" 
    webkitallowfullscreen 
    mozallowfullscreen 
    allowfullscreen 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
  </iframe>
</div>`;
  }
  
  private async generateQRCode(url: string): Promise<string> {
    // Mock QR code generation
    // In real implementation, would use a QR code library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  }
  
  private generateSocialSharingLinks(video: LoomVideo, options: LoomSharingOptions): SocialSharingLinks {
    const encodedUrl = encodeURIComponent(video.shareUrl);
    const encodedTitle = encodeURIComponent(video.title);
    
    return {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=Check out this video: ${video.shareUrl}`,
      copy: video.shareUrl
    };
  }
  
  private async generateDownloadLinks(video: LoomVideo, config: LoomConfiguration): Promise<DownloadLinks> {
    // Mock download links generation
    return {
      mp4: `${video.url}/download?format=mp4`,
      gif: `${video.url}/download?format=gif`,
      audio: `${video.url}/download?format=mp3`,
      transcript: `${video.url}/download?format=txt`
    };
  }
  
  private buildAnalyticsQuery(options?: AnalyticsOptions): string {
    if (!options) return '';
    
    const params = new URLSearchParams();
    
    if (options.startDate) params.append('start_date', options.startDate.toISOString());
    if (options.endDate) params.append('end_date', options.endDate.toISOString());
    if (options.granularity) params.append('granularity', options.granularity);
    if (options.metrics) params.append('metrics', options.metrics.join(','));
    
    return params.toString();
  }
  
  private transformAnalyticsResponse(response: any): LoomVideoAnalytics {
    // Transform Loom analytics API response to our internal format
    return response as LoomVideoAnalytics;
  }
  
  private async handleUploadFailure(sessionId: string, error: any): Promise<void> {
    const session = this.activeUploads.get(sessionId);
    if (session) {
      session.status = 'failed';
      session.error = {
        code: 'UPLOAD_FAILED',
        message: error.message,
        details: error,
        timestamp: new Date(),
        recoverable: this.isRecoverableError(error)
      };
      
      // Move to history
      this.uploadHistory.push(session);
      this.activeUploads.delete(sessionId);
    }
    
    console.error(`💥 Loom upload failed: ${sessionId}`, error.message);
  }
  
  private isRecoverableError(error: any): boolean {
    const recoverablePatterns = [
      'network',
      'timeout',
      'rate limit',
      'temporary'
    ];
    
    const errorMessage = error.message?.toLowerCase() || '';
    return recoverablePatterns.some(pattern => errorMessage.includes(pattern));
  }
}

// Additional interfaces
export interface UploadOptions {
  priority?: 'low' | 'normal' | 'high';
  retryAttempts?: number;
  chunkSize?: number; // bytes
  concurrent?: boolean;
}

export interface SharingResult {
  videoId: string;
  shareUrl: string;
  embedUrl: string;
  embedCode: string;
  qrCode: string;
  socialSharing: SocialSharingLinks;
  downloadLinks?: DownloadLinks;
  analytics: AnalyticsInfo;
}

export interface SocialSharingLinks {
  twitter: string;
  facebook: string;
  linkedin: string;
  email: string;
  copy: string;
}

export interface DownloadLinks {
  mp4: string;
  gif: string;
  audio: string;
  transcript: string;
}

export interface AnalyticsInfo {
  trackingEnabled: boolean;
  trackingUrl: string;
  webhookUrl?: string;
}

export interface AnalyticsOptions {
  startDate?: Date;
  endDate?: Date;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
}

// Export the singleton instance
export const loomIntegration = LoomIntegration.getInstance();

// Utility functions
export async function createLoomConfiguration(
  clientConfig: ClientConfiguration,
  apiKey: string,
  customizations?: Partial<LoomConfiguration>
): Promise<LoomConfiguration> {
  const configId = `loom-${clientConfig.id}-${Date.now()}`;
  
  const defaultConfig: LoomConfiguration = {
    id: configId,
    clientId: clientConfig.id,
    clientConfig,
    credentials: {
      apiKey,
      workspace: clientConfig.name.toLowerCase().replace(/\s+/g, '-')
    },
    settings: {
      defaultPrivacy: 'unlisted',
      autoUpload: true,
      generateThumbnails: true,
      autoTranscription: true,
      notificationSettings: {
        uploadComplete: true,
        transcriptionReady: true,
        shareEvents: false,
        commentNotifications: false,
        emailNotifications: true,
        webhookNotifications: false
      },
      qualitySettings: {
        resolution: 'auto',
        compression: 'auto',
        audioQuality: 'auto',
        uploadTimeout: 300
      },
      retentionSettings: {
        autoDelete: false,
        retentionPeriod: 365,
        archiveBeforeDelete: true
      }
    },
    privacy: {
      allowDownloads: true,
      allowComments: false,
      allowReactions: false,
      requireAuthentication: false,
      domainRestrictions: [clientConfig.domain]
    },
    branding: {
      customThumbnail: true,
      brandedPlayer: true,
      logoOverlay: {
        enabled: false,
        position: 'bottom-right',
        size: 'small',
        opacity: 0.7
      },
      customColors: {
        enabled: true,
        primaryColor: clientConfig.brandingConfig?.colors?.primary,
        accentColor: clientConfig.brandingConfig?.colors?.secondary
      },
      callToAction: {
        enabled: false,
        type: 'end_screen',
        text: 'Learn More',
        url: clientConfig.technicalConfig.productionUrl,
        timing: {
          showAt: 'end'
        },
        style: {
          buttonColor: clientConfig.brandingConfig?.colors?.primary || '#2563eb',
          textColor: '#ffffff',
          size: 'medium'
        }
      }
    },
    analytics: {
      enabled: true,
      trackViews: true,
      trackEngagement: true,
      trackCompletion: true,
      trackShares: true,
      customEvents: [],
      exportSettings: {
        autoExport: false,
        exportFrequency: 'weekly',
        exportFormat: 'json',
        exportDestination: 'webhook'
      }
    }
  };
  
  // Apply customizations
  if (customizations) {
    Object.assign(defaultConfig, customizations);
  }
  
  return defaultConfig;
}

export async function uploadVideoToLoom(
  videoFile: string,
  clientConfig: ClientConfiguration,
  apiKey: string,
  options?: UploadOptions
): Promise<LoomUploadSession> {
  const configuration = await createLoomConfiguration(clientConfig, apiKey);
  return loomIntegration.uploadVideo(videoFile, configuration, options);
}

export async function generateLoomSharingOptions(
  videoId: string,
  clientConfig: ClientConfiguration,
  apiKey: string,
  sharingOptions?: Partial<LoomSharingOptions>
): Promise<SharingResult> {
  const configuration = await createLoomConfiguration(clientConfig, apiKey);
  
  const defaultOptions: LoomSharingOptions = {
    privacy: 'unlisted',
    allowDownloads: true,
    allowComments: false,
    requireSignin: false,
    customization: {
      title: `${clientConfig.name} Walkthrough`,
      description: 'System walkthrough and training video'
    }
  };
  
  const finalOptions = { ...defaultOptions, ...sharingOptions };
  
  return loomIntegration.generateSharingOptions(videoId, finalOptions, configuration);
}

// Example usage and validation
export async function validateLoomIntegration(): Promise<boolean> {
  try {
    const integration = LoomIntegration.getInstance();
    console.log('✅ Loom Integration initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Loom Integration validation failed:', error);
    return false;
  }
}
