import { WalkthroughConfig, WalkthroughStep, WalkthroughMetadata } from '@/types/handover/walkthrough';

export interface WalkthroughGenerationOptions {
  clientId: string;
  appId: string;
  templateId: string;
  customizations: Record<string, any>;
  includeAdvancedFeatures?: boolean;
  language?: string;
  format?: 'interactive' | 'video' | 'pdf' | 'all';
}

export interface GeneratedWalkthrough {
  id: string;
  metadata: WalkthroughMetadata;
  steps: WalkthroughStep[];
  duration: number;
  resources: {
    screenshots: string[];
    videos: string[];
    assets: string[];
  };
  generatedAt: Date;
}

export class WalkthroughGenerator {
  private templateRegistry: Map<string, WalkthroughConfig> = new Map();
  private customizationRules: Map<string, any> = new Map();

  async generateWalkthrough(options: WalkthroughGenerationOptions): Promise<GeneratedWalkthrough> {
    try {
      const template = await this.getTemplate(options.templateId);
      const clientData = await this.getClientData(options.clientId);
      const appData = await this.getAppData(options.appId);

      const customizedSteps = await this.customizeSteps(
        template.steps,
        options.customizations,
        clientData,
        appData
      );

      const enrichedSteps = await this.enrichStepsWithAssets(customizedSteps, options);
      const metadata = this.generateMetadata(template, options, clientData);

      const walkthrough: GeneratedWalkthrough = {
        id: this.generateWalkthroughId(options),
        metadata,
        steps: enrichedSteps,
        duration: this.calculateDuration(enrichedSteps),
        resources: await this.generateResources(enrichedSteps, options),
        generatedAt: new Date()
      };

      await this.saveWalkthrough(walkthrough);
      return walkthrough;
    } catch (error) {
      console.error('Error generating walkthrough:', error);
      throw new Error(`Failed to generate walkthrough: ${error.message}`);
    }
  }

  async generateInteractiveWalkthrough(options: WalkthroughGenerationOptions): Promise<GeneratedWalkthrough> {
    const baseWalkthrough = await this.generateWalkthrough({
      ...options,
      format: 'interactive'
    });

    const interactiveSteps = await this.enhanceWithInteractivity(baseWalkthrough.steps);

    return {
      ...baseWalkthrough,
      steps: interactiveSteps,
      metadata: {
        ...baseWalkthrough.metadata,
        format: 'interactive',
        interactiveFeatures: true
      }
    };
  }

  async generateVideoWalkthrough(options: WalkthroughGenerationOptions): Promise<GeneratedWalkthrough> {
    const baseWalkthrough = await this.generateWalkthrough({
      ...options,
      format: 'video'
    });

    const videoConfig = await this.createVideoConfiguration(baseWalkthrough);
    const videoUrls = await this.generateVideoSegments(baseWalkthrough.steps, videoConfig);

    return {
      ...baseWalkthrough,
      resources: {
        ...baseWalkthrough.resources,
        videos: videoUrls
      },
      metadata: {
        ...baseWalkthrough.metadata,
        format: 'video',
        videoGenerated: true
      }
    };
  }

  private async getTemplate(templateId: string): Promise<WalkthroughConfig> {
    if (this.templateRegistry.has(templateId)) {
      return this.templateRegistry.get(templateId)!;
    }

    const template = await this.loadTemplateFromDatabase(templateId);
    this.templateRegistry.set(templateId, template);
    return template;
  }

  private async getClientData(clientId: string): Promise<any> {
    const response = await fetch(`/api/clients/${clientId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch client data: ${response.statusText}`);
    }
    return response.json();
  }

  private async getAppData(appId: string): Promise<any> {
    const response = await fetch(`/api/tenant-apps/${appId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch app data: ${response.statusText}`);
    }
    return response.json();
  }

  private async customizeSteps(
    templateSteps: WalkthroughStep[],
    customizations: Record<string, any>,
    clientData: any,
    appData: any
  ): Promise<WalkthroughStep[]> {
    return templateSteps.map(step => {
      let customizedStep = { ...step };

      if (customizations[step.id]) {
        customizedStep = {
          ...customizedStep,
          ...customizations[step.id]
        };
      }

      customizedStep.content = this.replaceVariables(step.content, {
        client: clientData,
        app: appData,
        customizations
      });

      customizedStep.title = this.replaceVariables(step.title, {
        client: clientData,
        app: appData,
        customizations
      });

      return customizedStep;
    });
  }

  private async enrichStepsWithAssets(
    steps: WalkthroughStep[],
    options: WalkthroughGenerationOptions
  ): Promise<WalkthroughStep[]> {
    return Promise.all(steps.map(async step => {
      const assets = await this.generateStepAssets(step, options);

      return {
        ...step,
        assets: {
          screenshots: assets.screenshots,
          videos: assets.videos,
          annotations: assets.annotations
        }
      };
    }));
  }

  private async generateStepAssets(step: WalkthroughStep, options: WalkthroughGenerationOptions): Promise<any> {
    return {
      screenshots: await this.generateScreenshots(step, options),
      videos: await this.generateStepVideos(step, options),
      annotations: await this.generateAnnotations(step, options)
    };
  }

  private async generateScreenshots(step: WalkthroughStep, options: WalkthroughGenerationOptions): Promise<string[]> {
    if (!step.screenshotConfig) return [];

    const screenshots = [];
    for (const config of step.screenshotConfig) {
      const screenshotUrl = await this.captureScreenshot({
        url: this.buildAppUrl(options.appId, config.path),
        selector: config.selector,
        annotations: config.annotations
      });
      screenshots.push(screenshotUrl);
    }

    return screenshots;
  }

  private async generateStepVideos(step: WalkthroughStep, options: WalkthroughGenerationOptions): Promise<string[]> {
    if (!step.videoConfig) return [];

    const videos = [];
    for (const config of step.videoConfig) {
      const videoUrl = await this.recordStepVideo({
        url: this.buildAppUrl(options.appId, config.path),
        actions: config.actions,
        duration: config.duration
      });
      videos.push(videoUrl);
    }

    return videos;
  }

  private async generateAnnotations(step: WalkthroughStep, options: WalkthroughGenerationOptions): Promise<any[]> {
    if (!step.annotations) return [];

    return step.annotations.map(annotation => ({
      ...annotation,
      customized: this.replaceVariables(annotation.text, {
        clientId: options.clientId,
        appId: options.appId
      })
    }));
  }

  private generateMetadata(
    template: WalkthroughConfig,
    options: WalkthroughGenerationOptions,
    clientData: any
  ): WalkthroughMetadata {
    return {
      id: this.generateWalkthroughId(options),
      title: this.replaceVariables(template.title, { client: clientData }),
      description: this.replaceVariables(template.description, { client: clientData }),
      clientId: options.clientId,
      appId: options.appId,
      templateId: options.templateId,
      language: options.language || 'en',
      format: options.format || 'interactive',
      version: template.version,
      tags: [...template.tags, 'auto-generated'],
      estimatedDuration: this.calculateEstimatedDuration(template.steps),
      difficulty: template.difficulty || 'beginner',
      prerequisites: template.prerequisites || []
    };
  }

  private async enhanceWithInteractivity(steps: WalkthroughStep[]): Promise<WalkthroughStep[]> {
    return steps.map(step => ({
      ...step,
      interactive: true,
      controls: {
        nextButton: true,
        previousButton: true,
        skipButton: step.optional || false,
        helpButton: true
      },
      validation: step.validation || null,
      feedback: step.feedback || null
    }));
  }

  private async createVideoConfiguration(walkthrough: GeneratedWalkthrough): Promise<any> {
    return {
      resolution: '1920x1080',
      framerate: 30,
      quality: 'high',
      format: 'mp4',
      transitions: true,
      voiceover: walkthrough.metadata.language,
      subtitles: true
    };
  }

  private async generateVideoSegments(steps: WalkthroughStep[], config: any): Promise<string[]> {
    const videoUrls = [];

    for (const step of steps) {
      const videoUrl = await this.generateStepVideo(step, config);
      videoUrls.push(videoUrl);
    }

    const compiledVideoUrl = await this.compileVideoSegments(videoUrls, config);
    return [compiledVideoUrl];
  }

  private async generateStepVideo(step: WalkthroughStep, config: any): Promise<string> {
    return `${process.env.NEXT_PUBLIC_APP_URL}/generated/videos/${step.id}.mp4`;
  }

  private async compileVideoSegments(videoUrls: string[], config: any): Promise<string> {
    const compiledId = this.generateUniqueId();
    return `${process.env.NEXT_PUBLIC_APP_URL}/generated/videos/compiled-${compiledId}.mp4`;
  }

  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;

    Object.entries(variables).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          const placeholder = `{{${key}.${subKey}}}`;
          result = result.replace(new RegExp(placeholder, 'g'), String(subValue));
        });
      } else {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), String(value));
      }
    });

    return result;
  }

  private calculateDuration(steps: WalkthroughStep[]): number {
    return steps.reduce((total, step) => total + (step.estimatedDuration || 30), 0);
  }

  private calculateEstimatedDuration(steps: WalkthroughStep[]): number {
    return this.calculateDuration(steps);
  }

  private async generateResources(steps: WalkthroughStep[], options: WalkthroughGenerationOptions): Promise<any> {
    const allScreenshots = steps.flatMap(step => step.assets?.screenshots || []);
    const allVideos = steps.flatMap(step => step.assets?.videos || []);
    const allAssets = [...allScreenshots, ...allVideos];

    return {
      screenshots: allScreenshots,
      videos: allVideos,
      assets: allAssets
    };
  }

  private generateWalkthroughId(options: WalkthroughGenerationOptions): string {
    return `walkthrough-${options.clientId}-${options.appId}-${Date.now()}`;
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private buildAppUrl(appId: string, path: string): string {
    return `${process.env.NEXT_PUBLIC_APP_URL}/client-apps/${appId}${path}`;
  }

  private async captureScreenshot(config: any): Promise<string> {
    const screenshotId = this.generateUniqueId();
    return `${process.env.NEXT_PUBLIC_APP_URL}/generated/screenshots/${screenshotId}.png`;
  }

  private async recordStepVideo(config: any): Promise<string> {
    const videoId = this.generateUniqueId();
    return `${process.env.NEXT_PUBLIC_APP_URL}/generated/videos/${videoId}.mp4`;
  }

  private async loadTemplateFromDatabase(templateId: string): Promise<WalkthroughConfig> {
    const response = await fetch(`/api/handover/templates/${templateId}`);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }
    return response.json();
  }

  private async saveWalkthrough(walkthrough: GeneratedWalkthrough): Promise<void> {
    const response = await fetch('/api/handover/walkthroughs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walkthrough),
    });

    if (!response.ok) {
      throw new Error(`Failed to save walkthrough: ${response.statusText}`);
    }
  }
}

export const walkthroughGenerator = new WalkthroughGenerator();
export default walkthroughGenerator;