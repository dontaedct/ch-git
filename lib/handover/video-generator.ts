import { VideoConfig, VideoSegment, VideoTransition, VideoMetadata } from '@/types/handover/video';

export interface VideoGenerationOptions {
  walkthroughId: string;
  steps: any[];
  config: VideoConfig;
  clientBranding?: {
    logo?: string;
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
  };
  voiceover?: {
    enabled: boolean;
    voice: string;
    speed: number;
    language: string;
  };
  subtitles?: {
    enabled: boolean;
    language: string;
    style: Record<string, any>;
  };
}

export interface GeneratedVideo {
  id: string;
  metadata: VideoMetadata;
  segments: VideoSegment[];
  duration: number;
  fileSize: number;
  urls: {
    master: string;
    preview: string;
    thumbnail: string;
  };
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    startedAt: Date;
    completedAt?: Date;
    error?: string;
  };
}

export class VideoGenerator {
  private processingQueue: Map<string, any> = new Map();
  private templates: Map<string, any> = new Map();

  async generateVideo(options: VideoGenerationOptions): Promise<GeneratedVideo> {
    try {
      const videoId = this.generateVideoId(options);
      const metadata = await this.createVideoMetadata(options, videoId);

      const generatedVideo: GeneratedVideo = {
        id: videoId,
        metadata,
        segments: [],
        duration: 0,
        fileSize: 0,
        urls: {
          master: '',
          preview: '',
          thumbnail: ''
        },
        processing: {
          status: 'pending',
          progress: 0,
          startedAt: new Date()
        }
      };

      await this.saveVideoRecord(generatedVideo);
      this.startVideoProcessing(generatedVideo, options);

      return generatedVideo;
    } catch (error) {
      console.error('Error generating video:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  }

  async generateScreenRecordingVideo(options: VideoGenerationOptions): Promise<GeneratedVideo> {
    const baseVideo = await this.generateVideo(options);

    this.startScreenRecording(baseVideo, options);

    return baseVideo;
  }

  async generateAnimatedVideo(options: VideoGenerationOptions): Promise<GeneratedVideo> {
    const baseVideo = await this.generateVideo(options);

    this.startAnimatedVideoGeneration(baseVideo, options);

    return baseVideo;
  }

  async getVideoStatus(videoId: string): Promise<GeneratedVideo | null> {
    return this.loadVideoRecord(videoId);
  }

  async getVideoPreview(videoId: string): Promise<string | null> {
    const video = await this.loadVideoRecord(videoId);
    return video?.urls.preview || null;
  }

  private async startVideoProcessing(video: GeneratedVideo, options: VideoGenerationOptions): Promise<void> {
    this.processingQueue.set(video.id, { video, options });

    try {
      await this.updateVideoStatus(video.id, 'processing', 10);

      const segments = await this.createVideoSegments(options.steps, options);
      await this.updateVideoStatus(video.id, 'processing', 40);

      const compiledVideo = await this.compileVideoSegments(segments, options);
      await this.updateVideoStatus(video.id, 'processing', 70);

      const finalVideo = await this.applyPostProcessing(compiledVideo, options);
      await this.updateVideoStatus(video.id, 'processing', 90);

      const urls = await this.uploadVideo(finalVideo, video.id);
      await this.updateVideoStatus(video.id, 'completed', 100, {
        urls,
        duration: finalVideo.duration,
        fileSize: finalVideo.fileSize
      });

    } catch (error) {
      console.error('Video processing error:', error);
      await this.updateVideoStatus(video.id, 'failed', 0, { error: error.message });
    } finally {
      this.processingQueue.delete(video.id);
    }
  }

  private async startScreenRecording(video: GeneratedVideo, options: VideoGenerationOptions): Promise<void> {
    try {
      await this.updateVideoStatus(video.id, 'processing', 10);

      const recordings = [];
      for (let i = 0; i < options.steps.length; i++) {
        const step = options.steps[i];
        const recording = await this.recordStepInteraction(step, options);
        recordings.push(recording);

        const progress = 20 + (i / options.steps.length) * 50;
        await this.updateVideoStatus(video.id, 'processing', progress);
      }

      const compiledRecording = await this.compileScreenRecordings(recordings, options);
      await this.updateVideoStatus(video.id, 'processing', 80);

      const finalVideo = await this.applyPostProcessing(compiledRecording, options);
      const urls = await this.uploadVideo(finalVideo, video.id);

      await this.updateVideoStatus(video.id, 'completed', 100, {
        urls,
        duration: finalVideo.duration,
        fileSize: finalVideo.fileSize
      });

    } catch (error) {
      console.error('Screen recording error:', error);
      await this.updateVideoStatus(video.id, 'failed', 0, { error: error.message });
    }
  }

  private async startAnimatedVideoGeneration(video: GeneratedVideo, options: VideoGenerationOptions): Promise<void> {
    try {
      await this.updateVideoStatus(video.id, 'processing', 10);

      const animations = [];
      for (let i = 0; i < options.steps.length; i++) {
        const step = options.steps[i];
        const animation = await this.createStepAnimation(step, options);
        animations.push(animation);

        const progress = 20 + (i / options.steps.length) * 50;
        await this.updateVideoStatus(video.id, 'processing', progress);
      }

      const compiledAnimation = await this.compileAnimations(animations, options);
      await this.updateVideoStatus(video.id, 'processing', 80);

      const finalVideo = await this.applyPostProcessing(compiledAnimation, options);
      const urls = await this.uploadVideo(finalVideo, video.id);

      await this.updateVideoStatus(video.id, 'completed', 100, {
        urls,
        duration: finalVideo.duration,
        fileSize: finalVideo.fileSize
      });

    } catch (error) {
      console.error('Animated video generation error:', error);
      await this.updateVideoStatus(video.id, 'failed', 0, { error: error.message });
    }
  }

  private async createVideoSegments(steps: any[], options: VideoGenerationOptions): Promise<VideoSegment[]> {
    const segments: VideoSegment[] = [];

    for (const step of steps) {
      const segment = await this.createSegmentFromStep(step, options);
      segments.push(segment);
    }

    return segments;
  }

  private async createSegmentFromStep(step: any, options: VideoGenerationOptions): Promise<VideoSegment> {
    const segment: VideoSegment = {
      id: `segment-${step.id}`,
      type: step.videoType || 'screenshot',
      duration: step.estimatedDuration || 5,
      content: {
        title: step.title,
        description: step.content,
        assets: step.assets || []
      },
      transitions: {
        in: this.getTransition('fadeIn'),
        out: this.getTransition('fadeOut')
      },
      timing: {
        start: 0,
        end: step.estimatedDuration || 5
      }
    };

    if (step.videoConfig) {
      segment.effects = step.videoConfig.effects || [];
      segment.annotations = step.videoConfig.annotations || [];
    }

    return segment;
  }

  private async recordStepInteraction(step: any, options: VideoGenerationOptions): Promise<any> {
    return {
      id: `recording-${step.id}`,
      duration: step.estimatedDuration || 5,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/generated/recordings/${step.id}.mp4`,
      interactions: step.interactions || [],
      annotations: step.annotations || []
    };
  }

  private async createStepAnimation(step: any, options: VideoGenerationOptions): Promise<any> {
    return {
      id: `animation-${step.id}`,
      type: 'slide-animation',
      duration: step.estimatedDuration || 5,
      frames: await this.generateAnimationFrames(step),
      transitions: step.transitions || []
    };
  }

  private async generateAnimationFrames(step: any): Promise<any[]> {
    const frames = [];
    const frameCount = (step.estimatedDuration || 5) * 30; // 30 FPS

    for (let i = 0; i < frameCount; i++) {
      frames.push({
        index: i,
        timestamp: i / 30,
        content: this.generateFrameContent(step, i / frameCount)
      });
    }

    return frames;
  }

  private generateFrameContent(step: any, progress: number): any {
    return {
      background: step.background || '#ffffff',
      elements: step.elements?.map((element: any) => ({
        ...element,
        opacity: this.calculateElementOpacity(element, progress),
        position: this.calculateElementPosition(element, progress)
      })) || []
    };
  }

  private calculateElementOpacity(element: any, progress: number): number {
    if (element.animation?.type === 'fadeIn') {
      return Math.min(progress * 2, 1);
    }
    return element.opacity || 1;
  }

  private calculateElementPosition(element: any, progress: number): any {
    if (element.animation?.type === 'slideIn') {
      const startX = element.animation.from?.x || element.position.x;
      const endX = element.position.x;
      return {
        ...element.position,
        x: startX + (endX - startX) * progress
      };
    }
    return element.position || { x: 0, y: 0 };
  }

  private async compileVideoSegments(segments: VideoSegment[], options: VideoGenerationOptions): Promise<any> {
    const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);

    return {
      id: this.generateUniqueId(),
      duration: totalDuration,
      segments,
      metadata: {
        resolution: options.config.resolution,
        framerate: options.config.framerate,
        format: options.config.format
      }
    };
  }

  private async compileScreenRecordings(recordings: any[], options: VideoGenerationOptions): Promise<any> {
    const totalDuration = recordings.reduce((sum, recording) => sum + recording.duration, 0);

    return {
      id: this.generateUniqueId(),
      duration: totalDuration,
      recordings,
      metadata: {
        resolution: options.config.resolution,
        framerate: options.config.framerate,
        format: options.config.format
      }
    };
  }

  private async compileAnimations(animations: any[], options: VideoGenerationOptions): Promise<any> {
    const totalDuration = animations.reduce((sum, animation) => sum + animation.duration, 0);

    return {
      id: this.generateUniqueId(),
      duration: totalDuration,
      animations,
      metadata: {
        resolution: options.config.resolution,
        framerate: options.config.framerate,
        format: options.config.format
      }
    };
  }

  private async applyPostProcessing(video: any, options: VideoGenerationOptions): Promise<any> {
    let processedVideo = { ...video };

    if (options.clientBranding) {
      processedVideo = await this.applyBranding(processedVideo, options.clientBranding);
    }

    if (options.voiceover?.enabled) {
      processedVideo = await this.addVoiceover(processedVideo, options.voiceover);
    }

    if (options.subtitles?.enabled) {
      processedVideo = await this.addSubtitles(processedVideo, options.subtitles);
    }

    processedVideo.fileSize = this.calculateFileSize(processedVideo);

    return processedVideo;
  }

  private async applyBranding(video: any, branding: any): Promise<any> {
    return {
      ...video,
      branding: {
        logo: branding.logo,
        watermark: true,
        colors: branding.colors,
        fonts: branding.fonts
      }
    };
  }

  private async addVoiceover(video: any, voiceover: any): Promise<any> {
    const voiceoverTrack = await this.generateVoiceover(video, voiceover);

    return {
      ...video,
      audio: {
        voiceover: voiceoverTrack,
        volume: 0.8
      }
    };
  }

  private async generateVoiceover(video: any, config: any): Promise<any> {
    const script = this.extractVideoScript(video);

    return {
      id: this.generateUniqueId(),
      script,
      voice: config.voice,
      language: config.language,
      speed: config.speed,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/generated/voiceover/${video.id}.mp3`
    };
  }

  private extractVideoScript(video: any): string {
    if (video.segments) {
      return video.segments
        .map((segment: any) => segment.content.description)
        .join(' ');
    }
    return '';
  }

  private async addSubtitles(video: any, subtitles: any): Promise<any> {
    const subtitleTrack = await this.generateSubtitles(video, subtitles);

    return {
      ...video,
      subtitles: {
        track: subtitleTrack,
        style: subtitles.style,
        language: subtitles.language
      }
    };
  }

  private async generateSubtitles(video: any, config: any): Promise<any> {
    const script = this.extractVideoScript(video);

    return {
      id: this.generateUniqueId(),
      language: config.language,
      content: script,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/generated/subtitles/${video.id}.vtt`
    };
  }

  private calculateFileSize(video: any): number {
    const baseSizePerSecond = 2 * 1024 * 1024; // 2MB per second estimate
    return video.duration * baseSizePerSecond;
  }

  private async uploadVideo(video: any, videoId: string): Promise<any> {
    const masterUrl = `${process.env.NEXT_PUBLIC_APP_URL}/generated/videos/${videoId}/master.mp4`;
    const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/generated/videos/${videoId}/preview.mp4`;
    const thumbnailUrl = `${process.env.NEXT_PUBLIC_APP_URL}/generated/videos/${videoId}/thumbnail.jpg`;

    return {
      master: masterUrl,
      preview: previewUrl,
      thumbnail: thumbnailUrl
    };
  }

  private getTransition(type: string): VideoTransition {
    const transitions: Record<string, VideoTransition> = {
      fadeIn: { type: 'fade', direction: 'in', duration: 0.5 },
      fadeOut: { type: 'fade', direction: 'out', duration: 0.5 },
      slideLeft: { type: 'slide', direction: 'left', duration: 0.3 },
      slideRight: { type: 'slide', direction: 'right', duration: 0.3 }
    };

    return transitions[type] || transitions.fadeIn;
  }

  private async createVideoMetadata(options: VideoGenerationOptions, videoId: string): Promise<VideoMetadata> {
    return {
      id: videoId,
      title: `Walkthrough Video - ${options.walkthroughId}`,
      description: 'Auto-generated client walkthrough video',
      walkthroughId: options.walkthroughId,
      config: options.config,
      format: options.config.format,
      resolution: options.config.resolution,
      framerate: options.config.framerate,
      quality: options.config.quality,
      language: options.voiceover?.language || 'en',
      tags: ['auto-generated', 'walkthrough', 'client-onboarding'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateVideoId(options: VideoGenerationOptions): string {
    return `video-${options.walkthroughId}-${Date.now()}`;
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private async updateVideoStatus(
    videoId: string,
    status: string,
    progress: number,
    data?: any
  ): Promise<void> {
    try {
      const video = await this.loadVideoRecord(videoId);
      if (!video) return;

      const updatedVideo = {
        ...video,
        processing: {
          ...video.processing,
          status,
          progress
        }
      };

      if (data) {
        Object.assign(updatedVideo, data);
      }

      if (status === 'completed') {
        updatedVideo.processing.completedAt = new Date();
      }

      await this.saveVideoRecord(updatedVideo);
    } catch (error) {
      console.error('Error updating video status:', error);
    }
  }

  private async saveVideoRecord(video: GeneratedVideo): Promise<void> {
    const response = await fetch('/api/handover/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(video),
    });

    if (!response.ok) {
      throw new Error(`Failed to save video record: ${response.statusText}`);
    }
  }

  private async loadVideoRecord(videoId: string): Promise<GeneratedVideo | null> {
    try {
      const response = await fetch(`/api/handover/videos/${videoId}`);
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      console.error('Error loading video record:', error);
      return null;
    }
  }
}

export const videoGenerator = new VideoGenerator();
export default videoGenerator;