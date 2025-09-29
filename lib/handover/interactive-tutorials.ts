import { TutorialConfig, TutorialStep, InteractiveElement, TutorialProgress } from '@/types/handover/tutorial';

export interface TutorialCreationOptions {
  walkthroughId: string;
  clientId: string;
  appId: string;
  templateId: string;
  interactivityLevel: 'basic' | 'advanced' | 'expert';
  adaptiveMode?: boolean;
  progressTracking?: boolean;
  gamification?: boolean;
}

export interface GeneratedTutorial {
  id: string;
  metadata: {
    title: string;
    description: string;
    walkthroughId: string;
    clientId: string;
    appId: string;
    difficulty: string;
    estimatedDuration: number;
    completionRate: number;
    lastUpdated: Date;
  };
  steps: TutorialStep[];
  interactiveElements: InteractiveElement[];
  progressTracking: TutorialProgress;
  navigation: {
    allowSkip: boolean;
    requireCompletion: boolean;
    showProgress: boolean;
    enableBookmarks: boolean;
  };
  customization: {
    theme: Record<string, any>;
    branding: Record<string, any>;
    layout: string;
  };
}

export class InteractiveTutorialEngine {
  private tutorialCache: Map<string, GeneratedTutorial> = new Map();
  private progressTracker: Map<string, TutorialProgress> = new Map();
  private interactionHandlers: Map<string, Function> = new Map();

  async createInteractiveTutorial(options: TutorialCreationOptions): Promise<GeneratedTutorial> {
    try {
      const tutorialId = this.generateTutorialId(options);
      const walkthroughData = await this.getWalkthroughData(options.walkthroughId);
      const clientData = await this.getClientData(options.clientId);

      const tutorial: GeneratedTutorial = {
        id: tutorialId,
        metadata: await this.createTutorialMetadata(options, walkthroughData, clientData),
        steps: await this.createInteractiveSteps(walkthroughData.steps, options),
        interactiveElements: await this.createInteractiveElements(walkthroughData.steps, options),
        progressTracking: this.initializeProgressTracking(tutorialId, options),
        navigation: this.createNavigationConfig(options),
        customization: await this.createCustomizationConfig(clientData, options)
      };

      await this.saveTutorial(tutorial);
      this.setupTutorialHandlers(tutorial);

      return tutorial;
    } catch (error) {
      console.error('Error creating interactive tutorial:', error);
      throw new Error(`Failed to create interactive tutorial: ${error.message}`);
    }
  }

  async enhanceWithInteractivity(
    tutorial: GeneratedTutorial,
    options: TutorialCreationOptions
  ): Promise<GeneratedTutorial> {
    const enhancedSteps = await this.enhanceStepsWithInteractivity(tutorial.steps, options);
    const enhancedElements = await this.createAdvancedInteractiveElements(enhancedSteps, options);

    return {
      ...tutorial,
      steps: enhancedSteps,
      interactiveElements: [...tutorial.interactiveElements, ...enhancedElements],
      metadata: {
        ...tutorial.metadata,
        lastUpdated: new Date()
      }
    };
  }

  async createAdaptiveTutorial(options: TutorialCreationOptions): Promise<GeneratedTutorial> {
    const baseTutorial = await this.createInteractiveTutorial({
      ...options,
      adaptiveMode: true
    });

    const adaptiveSteps = await this.createAdaptiveSteps(baseTutorial.steps, options);
    const adaptiveElements = await this.createAdaptiveElements(baseTutorial.interactiveElements, options);

    return {
      ...baseTutorial,
      steps: adaptiveSteps,
      interactiveElements: adaptiveElements,
      progressTracking: {
        ...baseTutorial.progressTracking,
        adaptiveMode: true,
        learningPath: this.createAdaptiveLearningPath(adaptiveSteps)
      }
    };
  }

  async startTutorial(tutorialId: string, userId: string): Promise<TutorialProgress> {
    const tutorial = await this.getTutorial(tutorialId);
    if (!tutorial) {
      throw new Error(`Tutorial not found: ${tutorialId}`);
    }

    const progress: TutorialProgress = {
      tutorialId,
      userId,
      currentStepIndex: 0,
      completedSteps: [],
      timeSpent: 0,
      startedAt: new Date(),
      lastActiveAt: new Date(),
      status: 'in_progress',
      score: 0,
      bookmarks: [],
      adaptiveData: tutorial.progressTracking.adaptiveMode ? {} : undefined
    };

    this.progressTracker.set(`${tutorialId}-${userId}`, progress);
    await this.saveProgress(progress);

    return progress;
  }

  async advanceStep(tutorialId: string, userId: string, stepId: string): Promise<TutorialProgress> {
    const progressKey = `${tutorialId}-${userId}`;
    const progress = this.progressTracker.get(progressKey);

    if (!progress) {
      throw new Error(`No active tutorial session found`);
    }

    const tutorial = await this.getTutorial(tutorialId);
    const stepIndex = tutorial!.steps.findIndex(step => step.id === stepId);

    if (stepIndex === -1) {
      throw new Error(`Step not found: ${stepId}`);
    }

    const updatedProgress: TutorialProgress = {
      ...progress,
      currentStepIndex: stepIndex + 1,
      completedSteps: [...progress.completedSteps, stepId],
      lastActiveAt: new Date(),
      score: this.calculateScore(progress.completedSteps.length + 1, tutorial!.steps.length)
    };

    if (updatedProgress.currentStepIndex >= tutorial!.steps.length) {
      updatedProgress.status = 'completed';
      updatedProgress.completedAt = new Date();
    }

    this.progressTracker.set(progressKey, updatedProgress);
    await this.saveProgress(updatedProgress);

    return updatedProgress;
  }

  async addBookmark(tutorialId: string, userId: string, stepId: string, note?: string): Promise<void> {
    const progressKey = `${tutorialId}-${userId}`;
    const progress = this.progressTracker.get(progressKey);

    if (!progress) {
      throw new Error(`No active tutorial session found`);
    }

    const bookmark = {
      stepId,
      note: note || '',
      createdAt: new Date()
    };

    const updatedProgress: TutorialProgress = {
      ...progress,
      bookmarks: [...progress.bookmarks, bookmark],
      lastActiveAt: new Date()
    };

    this.progressTracker.set(progressKey, updatedProgress);
    await this.saveProgress(updatedProgress);
  }

  async getProgress(tutorialId: string, userId: string): Promise<TutorialProgress | null> {
    const progressKey = `${tutorialId}-${userId}`;
    return this.progressTracker.get(progressKey) || null;
  }

  async getTutorial(tutorialId: string): Promise<GeneratedTutorial | null> {
    if (this.tutorialCache.has(tutorialId)) {
      return this.tutorialCache.get(tutorialId)!;
    }

    return this.loadTutorial(tutorialId);
  }

  private async createInteractiveSteps(
    walkthroughSteps: any[],
    options: TutorialCreationOptions
  ): Promise<TutorialStep[]> {
    return Promise.all(walkthroughSteps.map(async (step, index) => {
      const interactiveStep: TutorialStep = {
        id: step.id,
        title: step.title,
        content: step.content,
        type: this.determineStepType(step, options),
        order: index,
        estimatedDuration: step.estimatedDuration || 30,
        required: !step.optional,
        interactive: true,
        elements: await this.createStepElements(step, options),
        validation: await this.createStepValidation(step, options),
        hints: await this.createStepHints(step, options),
        completion: {
          requiresInteraction: true,
          autoAdvance: false,
          validationRequired: options.interactivityLevel !== 'basic'
        }
      };

      return interactiveStep;
    }));
  }

  private async createInteractiveElements(
    steps: any[],
    options: TutorialCreationOptions
  ): Promise<InteractiveElement[]> {
    const elements: InteractiveElement[] = [];

    for (const step of steps) {
      const stepElements = await this.generateElementsForStep(step, options);
      elements.push(...stepElements);
    }

    return elements;
  }

  private async generateElementsForStep(
    step: any,
    options: TutorialCreationOptions
  ): Promise<InteractiveElement[]> {
    const elements: InteractiveElement[] = [];

    // Add click interactions
    if (step.interactions?.click) {
      elements.push({
        id: `click-${step.id}`,
        type: 'click',
        stepId: step.id,
        selector: step.interactions.click.selector,
        action: 'highlight_and_click',
        feedback: {
          success: 'Great! You clicked the right element.',
          error: 'That\'s not quite right. Try clicking the highlighted area.',
          hint: 'Look for the highlighted button or link.'
        },
        validation: {
          required: true,
          timeout: 30000
        }
      });
    }

    // Add form interactions
    if (step.interactions?.form) {
      elements.push({
        id: `form-${step.id}`,
        type: 'form',
        stepId: step.id,
        selector: step.interactions.form.selector,
        action: 'fill_and_submit',
        data: step.interactions.form.data,
        feedback: {
          success: 'Perfect! You filled out the form correctly.',
          error: 'Please check your entries and try again.',
          hint: 'Make sure all required fields are filled out.'
        },
        validation: {
          required: true,
          timeout: 60000
        }
      });
    }

    // Add navigation interactions
    if (step.interactions?.navigate) {
      elements.push({
        id: `navigate-${step.id}`,
        type: 'navigation',
        stepId: step.id,
        selector: step.interactions.navigate.selector,
        action: 'navigate',
        target: step.interactions.navigate.target,
        feedback: {
          success: 'Excellent! You navigated to the right page.',
          error: 'That doesn\'t look like the right page. Let\'s try again.',
          hint: 'Look for the navigation menu or link mentioned in the instructions.'
        },
        validation: {
          required: true,
          timeout: 15000
        }
      });
    }

    return elements;
  }

  private async enhanceStepsWithInteractivity(
    steps: TutorialStep[],
    options: TutorialCreationOptions
  ): Promise<TutorialStep[]> {
    return steps.map(step => {
      const enhanced: TutorialStep = {
        ...step,
        enhanced: true,
        interactivityLevel: options.interactivityLevel
      };

      if (options.interactivityLevel === 'advanced') {
        enhanced.feedback = {
          ...enhanced.feedback,
          adaptive: true,
          personalized: true
        };
      }

      if (options.interactivityLevel === 'expert') {
        enhanced.challenges = this.createStepChallenges(step);
        enhanced.alternatives = this.createAlternativePaths(step);
      }

      if (options.gamification) {
        enhanced.gamification = {
          points: step.required ? 10 : 5,
          badges: this.determineStepBadges(step),
          achievements: this.createStepAchievements(step)
        };
      }

      return enhanced;
    });
  }

  private async createAdvancedInteractiveElements(
    steps: TutorialStep[],
    options: TutorialCreationOptions
  ): Promise<InteractiveElement[]> {
    const elements: InteractiveElement[] = [];

    for (const step of steps) {
      // Add real-time guidance
      elements.push({
        id: `guidance-${step.id}`,
        type: 'guidance',
        stepId: step.id,
        action: 'real_time_guidance',
        guidance: {
          arrow: true,
          spotlight: true,
          tooltip: true,
          animation: 'pulse'
        }
      });

      // Add progress indicators
      elements.push({
        id: `progress-${step.id}`,
        type: 'progress',
        stepId: step.id,
        action: 'show_progress',
        progress: {
          type: 'circular',
          showPercentage: true,
          showSteps: true
        }
      });

      // Add interactive overlays
      if (options.interactivityLevel === 'expert') {
        elements.push({
          id: `overlay-${step.id}`,
          type: 'overlay',
          stepId: step.id,
          action: 'interactive_overlay',
          overlay: {
            type: 'modal',
            interactive: true,
            dismissible: false
          }
        });
      }
    }

    return elements;
  }

  private async createAdaptiveSteps(
    steps: TutorialStep[],
    options: TutorialCreationOptions
  ): Promise<TutorialStep[]> {
    return steps.map(step => ({
      ...step,
      adaptive: {
        enabled: true,
        difficultyAdjustment: true,
        personalizedContent: true,
        learningStyle: 'auto_detect',
        adaptations: {
          visual: true,
          auditory: true,
          kinesthetic: true
        }
      }
    }));
  }

  private async createAdaptiveElements(
    elements: InteractiveElement[],
    options: TutorialCreationOptions
  ): Promise<InteractiveElement[]> {
    return elements.map(element => ({
      ...element,
      adaptive: {
        enabled: true,
        responseTime: true,
        errorPatterns: true,
        preferenceTracking: true
      }
    }));
  }

  private createAdaptiveLearningPath(steps: TutorialStep[]): any {
    return {
      primary: steps.map(step => step.id),
      alternative: steps.filter(step => !step.required).map(step => step.id),
      remedial: steps.filter(step => step.required).map(step => `${step.id}-review`),
      advanced: steps.map(step => `${step.id}-advanced`)
    };
  }

  private determineStepType(step: any, options: TutorialCreationOptions): string {
    if (step.interactions?.form) return 'form';
    if (step.interactions?.click) return 'interaction';
    if (step.interactions?.navigate) return 'navigation';
    if (step.content?.includes('video')) return 'video';
    return 'content';
  }

  private async createStepElements(step: any, options: TutorialCreationOptions): Promise<any[]> {
    const elements = [];

    if (step.assets?.screenshots) {
      elements.push({
        type: 'image',
        src: step.assets.screenshots[0],
        alt: step.title,
        interactive: true
      });
    }

    if (step.actions) {
      elements.push({
        type: 'action',
        actions: step.actions,
        interactive: true
      });
    }

    return elements;
  }

  private async createStepValidation(step: any, options: TutorialCreationOptions): Promise<any> {
    if (!step.validation) return null;

    return {
      required: step.required,
      timeout: step.validation.timeout || 30000,
      attempts: step.validation.maxAttempts || 3,
      criteria: step.validation.criteria || []
    };
  }

  private async createStepHints(step: any, options: TutorialCreationOptions): Promise<string[]> {
    const hints = [];

    if (step.hints) {
      hints.push(...step.hints);
    } else {
      hints.push(`Follow the instructions in the "${step.title}" section.`);
      if (step.interactions?.click) {
        hints.push('Look for highlighted clickable elements.');
      }
    }

    return hints;
  }

  private createStepChallenges(step: TutorialStep): any[] {
    return [
      {
        id: `challenge-${step.id}`,
        title: `${step.title} Challenge`,
        description: 'Complete this step in under 30 seconds',
        timeLimit: 30,
        bonus: 5
      }
    ];
  }

  private createAlternativePaths(step: TutorialStep): any[] {
    return [
      {
        id: `alt-${step.id}`,
        title: `Alternative: ${step.title}`,
        description: 'Try a different approach to complete this step',
        difficulty: 'advanced'
      }
    ];
  }

  private determineStepBadges(step: TutorialStep): string[] {
    const badges = [];

    if (step.required) badges.push('essential');
    if (step.estimatedDuration && step.estimatedDuration > 60) badges.push('thorough');
    if (step.type === 'interaction') badges.push('interactive');

    return badges;
  }

  private createStepAchievements(step: TutorialStep): any[] {
    return [
      {
        id: `achievement-${step.id}`,
        title: `${step.title} Master`,
        description: `Complete "${step.title}" without hints`,
        points: 15
      }
    ];
  }

  private initializeProgressTracking(tutorialId: string, options: TutorialCreationOptions): TutorialProgress {
    return {
      tutorialId,
      userId: '',
      currentStepIndex: 0,
      completedSteps: [],
      timeSpent: 0,
      startedAt: new Date(),
      lastActiveAt: new Date(),
      status: 'not_started',
      score: 0,
      bookmarks: [],
      adaptiveMode: options.adaptiveMode || false
    };
  }

  private createNavigationConfig(options: TutorialCreationOptions): any {
    return {
      allowSkip: options.interactivityLevel === 'basic',
      requireCompletion: options.interactivityLevel === 'expert',
      showProgress: true,
      enableBookmarks: true
    };
  }

  private async createCustomizationConfig(clientData: any, options: TutorialCreationOptions): Promise<any> {
    return {
      theme: {
        primaryColor: clientData.branding?.primaryColor || '#007bff',
        secondaryColor: clientData.branding?.secondaryColor || '#6c757d',
        fontFamily: clientData.branding?.fontFamily || 'Inter, sans-serif'
      },
      branding: {
        logo: clientData.branding?.logo,
        companyName: clientData.name,
        colors: clientData.branding?.colors || {}
      },
      layout: options.interactivityLevel === 'basic' ? 'simple' : 'advanced'
    };
  }

  private async createTutorialMetadata(
    options: TutorialCreationOptions,
    walkthroughData: any,
    clientData: any
  ): Promise<any> {
    return {
      title: `Interactive Tutorial - ${clientData.name}`,
      description: `Step-by-step interactive tutorial for ${clientData.name}`,
      walkthroughId: options.walkthroughId,
      clientId: options.clientId,
      appId: options.appId,
      difficulty: options.interactivityLevel,
      estimatedDuration: walkthroughData.duration || 300,
      completionRate: 0,
      lastUpdated: new Date()
    };
  }

  private calculateScore(completedSteps: number, totalSteps: number): number {
    return Math.round((completedSteps / totalSteps) * 100);
  }

  private generateTutorialId(options: TutorialCreationOptions): string {
    return `tutorial-${options.walkthroughId}-${Date.now()}`;
  }

  private setupTutorialHandlers(tutorial: GeneratedTutorial): void {
    this.interactionHandlers.set(tutorial.id, this.createTutorialHandler(tutorial));
  }

  private createTutorialHandler(tutorial: GeneratedTutorial): Function {
    return (interaction: any) => {
      console.log(`Tutorial ${tutorial.id} interaction:`, interaction);
    };
  }

  private async getWalkthroughData(walkthroughId: string): Promise<any> {
    const response = await fetch(`/api/handover/walkthroughs/${walkthroughId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch walkthrough data: ${response.statusText}`);
    }
    return response.json();
  }

  private async getClientData(clientId: string): Promise<any> {
    const response = await fetch(`/api/clients/${clientId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch client data: ${response.statusText}`);
    }
    return response.json();
  }

  private async saveTutorial(tutorial: GeneratedTutorial): Promise<void> {
    this.tutorialCache.set(tutorial.id, tutorial);

    const response = await fetch('/api/handover/tutorials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tutorial),
    });

    if (!response.ok) {
      throw new Error(`Failed to save tutorial: ${response.statusText}`);
    }
  }

  private async loadTutorial(tutorialId: string): Promise<GeneratedTutorial | null> {
    try {
      const response = await fetch(`/api/handover/tutorials/${tutorialId}`);
      if (!response.ok) {
        return null;
      }
      const tutorial = await response.json();
      this.tutorialCache.set(tutorialId, tutorial);
      return tutorial;
    } catch (error) {
      console.error('Error loading tutorial:', error);
      return null;
    }
  }

  private async saveProgress(progress: TutorialProgress): Promise<void> {
    const response = await fetch('/api/handover/tutorials/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progress),
    });

    if (!response.ok) {
      throw new Error(`Failed to save progress: ${response.statusText}`);
    }
  }
}

export const interactiveTutorialEngine = new InteractiveTutorialEngine();
export default interactiveTutorialEngine;