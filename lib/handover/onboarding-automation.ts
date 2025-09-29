export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'interactive' | 'task' | 'assessment';
  content: string;
  estimatedTime: number;
  prerequisites: string[];
  completionCriteria: string[];
  resources: string[];
}

export interface OnboardingProgram {
  id: string;
  clientId: string;
  templateId: string;
  title: string;
  description: string;
  steps: OnboardingStep[];
  estimatedDuration: number;
  completionRate: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  startedAt?: Date;
  completedAt?: Date;
  currentStep: number;
}

export interface OnboardingMetrics {
  programId: string;
  clientId: string;
  totalSteps: number;
  completedSteps: number;
  timeSpent: number;
  averageStepTime: number;
  lastActivity: Date;
  engagementScore: number;
  satisfactionScore?: number;
}

export class OnboardingAutomation {
  private programs: Map<string, OnboardingProgram> = new Map();
  private metrics: Map<string, OnboardingMetrics> = new Map();

  async createOnboardingProgram(
    clientId: string,
    templateId: string,
    customizations: any
  ): Promise<OnboardingProgram> {
    const programId = `onboarding_${clientId}_${Date.now()}`;

    const baseSteps = await this.generateBaseOnboardingSteps(templateId);
    const customizedSteps = await this.customizeStepsForClient(baseSteps, customizations);

    const program: OnboardingProgram = {
      id: programId,
      clientId,
      templateId,
      title: `Onboarding Program for ${customizations.clientName || 'Client'}`,
      description: 'Comprehensive onboarding program for your new application',
      steps: customizedSteps,
      estimatedDuration: customizedSteps.reduce((total, step) => total + step.estimatedTime, 0),
      completionRate: 0,
      status: 'not_started',
      currentStep: 0
    };

    this.programs.set(programId, program);

    await this.initializeMetrics(programId, clientId);
    await this.scheduleAutomatedNotifications(program);

    return program;
  }

  private async generateBaseOnboardingSteps(templateId: string): Promise<OnboardingStep[]> {
    return [
      {
        id: 'welcome',
        title: 'Welcome & Overview',
        description: 'Introduction to your new application and key features',
        type: 'video',
        content: 'welcome-video-template',
        estimatedTime: 10,
        prerequisites: [],
        completionCriteria: ['video_watched', 'overview_acknowledged'],
        resources: ['getting-started-guide', 'feature-overview']
      },
      {
        id: 'admin_access',
        title: 'Admin Access Setup',
        description: 'Set up your administrator account and initial configuration',
        type: 'interactive',
        content: 'admin-setup-wizard',
        estimatedTime: 15,
        prerequisites: ['welcome'],
        completionCriteria: ['admin_account_created', 'initial_config_completed'],
        resources: ['admin-guide', 'security-best-practices']
      },
      {
        id: 'basic_configuration',
        title: 'Basic Configuration',
        description: 'Configure basic settings and preferences for your application',
        type: 'task',
        content: 'configuration-checklist',
        estimatedTime: 20,
        prerequisites: ['admin_access'],
        completionCriteria: ['basic_settings_configured', 'preferences_set'],
        resources: ['configuration-guide', 'settings-reference']
      },
      {
        id: 'feature_training',
        title: 'Core Features Training',
        description: 'Learn how to use the main features of your application',
        type: 'interactive',
        content: 'feature-training-modules',
        estimatedTime: 30,
        prerequisites: ['basic_configuration'],
        completionCriteria: ['all_modules_completed', 'feature_quiz_passed'],
        resources: ['feature-documentation', 'tutorial-videos']
      },
      {
        id: 'customization_guide',
        title: 'Customization Guide',
        description: 'Learn how to customize your application to match your brand',
        type: 'video',
        content: 'customization-walkthrough',
        estimatedTime: 25,
        prerequisites: ['feature_training'],
        completionCriteria: ['customization_completed', 'brand_applied'],
        resources: ['branding-guide', 'customization-examples']
      },
      {
        id: 'support_resources',
        title: 'Support & Resources',
        description: 'Learn about available support channels and resources',
        type: 'document',
        content: 'support-guide',
        estimatedTime: 10,
        prerequisites: ['customization_guide'],
        completionCriteria: ['support_guide_reviewed', 'contact_info_saved'],
        resources: ['support-documentation', 'faq', 'contact-directory']
      },
      {
        id: 'final_assessment',
        title: 'Knowledge Assessment',
        description: 'Complete a final assessment to validate your understanding',
        type: 'assessment',
        content: 'comprehensive-assessment',
        estimatedTime: 20,
        prerequisites: ['support_resources'],
        completionCriteria: ['assessment_passed', 'feedback_provided'],
        resources: ['study-materials', 'assessment-guide']
      }
    ];
  }

  private async customizeStepsForClient(
    steps: OnboardingStep[],
    customizations: any
  ): Promise<OnboardingStep[]> {
    return steps.map(step => ({
      ...step,
      content: step.content.replace(/\{clientName\}/g, customizations.clientName || 'Client'),
      description: step.description.replace(/\{appName\}/g, customizations.appName || 'application'),
      resources: step.resources.map(resource =>
        this.personalizeResource(resource, customizations)
      )
    }));
  }

  private personalizeResource(resource: string, customizations: any): string {
    return resource
      .replace(/\{clientName\}/g, customizations.clientName || 'Client')
      .replace(/\{appName\}/g, customizations.appName || 'Application')
      .replace(/\{industry\}/g, customizations.industry || 'Business');
  }

  async startOnboarding(programId: string): Promise<void> {
    const program = this.programs.get(programId);
    if (!program) throw new Error('Onboarding program not found');

    program.status = 'in_progress';
    program.startedAt = new Date();

    await this.sendWelcomeNotification(program);
    await this.logActivity(programId, 'program_started');
  }

  async completeStep(
    programId: string,
    stepId: string,
    completionData: any
  ): Promise<void> {
    const program = this.programs.get(programId);
    if (!program) throw new Error('Onboarding program not found');

    const stepIndex = program.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) throw new Error('Step not found');

    const metrics = this.metrics.get(programId);
    if (metrics) {
      metrics.completedSteps++;
      metrics.lastActivity = new Date();
      metrics.completionRate = (metrics.completedSteps / metrics.totalSteps) * 100;
    }

    program.currentStep = Math.max(program.currentStep, stepIndex + 1);
    program.completionRate = (program.currentStep / program.steps.length) * 100;

    if (program.currentStep >= program.steps.length) {
      program.status = 'completed';
      program.completedAt = new Date();
      await this.sendCompletionNotification(program);
    } else {
      await this.sendNextStepNotification(program);
    }

    await this.logActivity(programId, 'step_completed', { stepId, completionData });
  }

  async pauseOnboarding(programId: string): Promise<void> {
    const program = this.programs.get(programId);
    if (!program) throw new Error('Onboarding program not found');

    program.status = 'paused';
    await this.logActivity(programId, 'program_paused');
  }

  async resumeOnboarding(programId: string): Promise<void> {
    const program = this.programs.get(programId);
    if (!program) throw new Error('Onboarding program not found');

    program.status = 'in_progress';
    await this.sendResumeNotification(program);
    await this.logActivity(programId, 'program_resumed');
  }

  async getOnboardingProgress(programId: string): Promise<OnboardingMetrics | null> {
    return this.metrics.get(programId) || null;
  }

  async updateEngagementScore(programId: string, interactions: any[]): Promise<void> {
    const metrics = this.metrics.get(programId);
    if (!metrics) return;

    const engagementFactors = {
      timeSpent: interactions.reduce((total, i) => total + (i.duration || 0), 0),
      frequency: interactions.length,
      completionRate: metrics.completionRate,
      consecutiveDays: this.calculateConsecutiveDays(interactions)
    };

    metrics.engagementScore = this.calculateEngagementScore(engagementFactors);
  }

  private calculateEngagementScore(factors: any): number {
    const weights = {
      timeSpent: 0.3,
      frequency: 0.2,
      completionRate: 0.4,
      consecutiveDays: 0.1
    };

    const normalizedScores = {
      timeSpent: Math.min(factors.timeSpent / 3600, 1), // Normalize to hours
      frequency: Math.min(factors.frequency / 10, 1), // Normalize to 10 interactions
      completionRate: factors.completionRate / 100,
      consecutiveDays: Math.min(factors.consecutiveDays / 7, 1) // Normalize to week
    };

    return Object.entries(weights).reduce((score, [factor, weight]) => {
      return score + (normalizedScores[factor as keyof typeof normalizedScores] * weight);
    }, 0) * 100;
  }

  private calculateConsecutiveDays(interactions: any[]): number {
    const days = interactions
      .map(i => new Date(i.timestamp).toDateString())
      .filter((day, index, arr) => arr.indexOf(day) === index)
      .sort();

    let consecutive = 0;
    let current = 0;

    for (let i = 1; i < days.length; i++) {
      const prevDate = new Date(days[i - 1]);
      const currDate = new Date(days[i]);
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);

      if (diffDays === 1) {
        current++;
      } else {
        consecutive = Math.max(consecutive, current);
        current = 0;
      }
    }

    return Math.max(consecutive, current);
  }

  private async initializeMetrics(programId: string, clientId: string): Promise<void> {
    const program = this.programs.get(programId);
    if (!program) return;

    const metrics: OnboardingMetrics = {
      programId,
      clientId,
      totalSteps: program.steps.length,
      completedSteps: 0,
      timeSpent: 0,
      averageStepTime: 0,
      lastActivity: new Date(),
      engagementScore: 0
    };

    this.metrics.set(programId, metrics);
  }

  private async scheduleAutomatedNotifications(program: OnboardingProgram): Promise<void> {
    // Schedule welcome notification
    setTimeout(() => this.sendWelcomeNotification(program), 1000);

    // Schedule reminder notifications
    setTimeout(() => this.sendReminderNotification(program), 24 * 60 * 60 * 1000); // 1 day
    setTimeout(() => this.sendReminderNotification(program), 3 * 24 * 60 * 60 * 1000); // 3 days
    setTimeout(() => this.sendReminderNotification(program), 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  private async sendWelcomeNotification(program: OnboardingProgram): Promise<void> {
    console.log(`Sending welcome notification for program: ${program.id}`);
    // Implementation would integrate with notification service
  }

  private async sendNextStepNotification(program: OnboardingProgram): Promise<void> {
    console.log(`Sending next step notification for program: ${program.id}`);
    // Implementation would integrate with notification service
  }

  private async sendCompletionNotification(program: OnboardingProgram): Promise<void> {
    console.log(`Sending completion notification for program: ${program.id}`);
    // Implementation would integrate with notification service
  }

  private async sendResumeNotification(program: OnboardingProgram): Promise<void> {
    console.log(`Sending resume notification for program: ${program.id}`);
    // Implementation would integrate with notification service
  }

  private async sendReminderNotification(program: OnboardingProgram): Promise<void> {
    if (program.status === 'in_progress' && program.completionRate < 100) {
      console.log(`Sending reminder notification for program: ${program.id}`);
      // Implementation would integrate with notification service
    }
  }

  private async logActivity(
    programId: string,
    activity: string,
    metadata?: any
  ): Promise<void> {
    console.log(`Activity logged: ${activity} for program: ${programId}`, metadata);
    // Implementation would integrate with logging service
  }
}

export default OnboardingAutomation;