interface Tutorial {
  id: string;
  title: string;
  description: string;
  module: string;
  steps: TutorialStep[];
  prerequisites?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: string;
  action?: {
    type: 'click' | 'input' | 'navigate' | 'wait' | 'highlight';
    target: string;
    value?: string;
    duration?: number;
  };
  validation?: {
    type: 'element-exists' | 'value-equals' | 'page-contains';
    target: string;
    expected: string;
  };
  hints: string[];
  isOptional: boolean;
}

interface TutorialProgress {
  tutorialId: string;
  userId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  score?: number;
}

interface TutorialContext {
  currentModule: string;
  currentPage: string;
  userRole: string;
  userExperience: string;
  completedTutorials: string[];
}

class TutorialManager {
  private tutorials: Map<string, Tutorial> = new Map();
  private userProgress: Map<string, TutorialProgress[]> = new Map();
  private activeContext: TutorialContext | null = null;

  constructor() {
    this.initializeDefaultTutorials();
  }

  private initializeDefaultTutorials() {
    const defaultTutorials: Tutorial[] = [
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Learn to navigate and use the main dashboard effectively',
        module: 'dashboard',
        difficulty: 'beginner',
        estimatedDuration: 5,
        category: 'Getting Started',
        tags: ['dashboard', 'navigation', 'basics'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          {
            id: 'welcome',
            title: 'Welcome to Your Dashboard',
            description: 'This is your central hub for all agency operations',
            content: 'The dashboard provides a unified view of all your agency toolkit modules. Each card represents a different area of functionality.',
            hints: ['Look for the module cards', 'Notice the status indicators'],
            isOptional: false
          },
          {
            id: 'module-cards',
            title: 'Understanding Module Cards',
            description: 'Each card shows module status and key metrics',
            content: 'Module cards display real-time information about each system component, including status, recent activity, and quick actions.',
            action: {
              type: 'highlight',
              target: '[data-module="orchestration"]',
              duration: 3000
            },
            hints: ['Click on any card to access that module', 'Status indicators show system health'],
            isOptional: false
          },
          {
            id: 'navigation',
            title: 'Navigation Basics',
            description: 'Learn how to move between different modules',
            content: 'Use the module cards or the navigation menu to move between different areas of the toolkit.',
            action: {
              type: 'click',
              target: '[data-module="orchestration"] .module-card-link'
            },
            validation: {
              type: 'page-contains',
              target: 'body',
              expected: 'orchestration'
            },
            hints: ['Try clicking on the Orchestration card'],
            isOptional: false
          }
        ]
      },
      {
        id: 'orchestration-basics',
        title: 'Workflow Orchestration Basics',
        description: 'Create and manage your first workflow',
        module: 'orchestration',
        difficulty: 'intermediate',
        estimatedDuration: 15,
        category: 'Orchestration',
        tags: ['workflows', 'automation', 'processes'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: ['dashboard-overview'],
        steps: [
          {
            id: 'orchestration-intro',
            title: 'Introduction to Orchestration',
            description: 'Understanding workflow automation',
            content: 'Workflow orchestration allows you to automate repetitive tasks and create efficient processes for your agency.',
            hints: ['Orchestration saves time', 'Reduces manual errors'],
            isOptional: false
          },
          {
            id: 'create-workflow',
            title: 'Creating Your First Workflow',
            description: 'Build a simple automated workflow',
            content: 'Let\'s create a basic client onboarding workflow to demonstrate the process.',
            action: {
              type: 'click',
              target: '[data-action="create-workflow"]'
            },
            hints: ['Look for the "Create Workflow" button', 'Start with a simple template'],
            isOptional: false
          },
          {
            id: 'workflow-designer',
            title: 'Using the Workflow Designer',
            description: 'Drag and drop components to build workflows',
            content: 'The visual designer makes it easy to create complex workflows by connecting different actions and triggers.',
            hints: ['Drag components from the palette', 'Connect components with arrows'],
            isOptional: false
          }
        ]
      },
      {
        id: 'module-installation',
        title: 'Installing Your First Module',
        description: 'Learn how to browse and install modules',
        module: 'modules',
        difficulty: 'beginner',
        estimatedDuration: 8,
        category: 'Modules',
        tags: ['modules', 'installation', 'marketplace'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          {
            id: 'browse-modules',
            title: 'Browsing Available Modules',
            description: 'Explore the module marketplace',
            content: 'The module system allows you to extend your toolkit with additional functionality. Browse available modules by category or search for specific features.',
            hints: ['Use filters to find relevant modules', 'Read module descriptions carefully'],
            isOptional: false
          },
          {
            id: 'install-module',
            title: 'Installing a Module',
            description: 'Install your first module without downtime',
            content: 'Select a module and follow the installation process. The system will handle dependencies automatically.',
            action: {
              type: 'click',
              target: '[data-action="install-module"]'
            },
            hints: ['Check system requirements', 'Review permissions'],
            isOptional: false
          },
          {
            id: 'configure-module',
            title: 'Module Configuration',
            description: 'Set up your newly installed module',
            content: 'After installation, configure the module settings to match your agency\'s needs.',
            hints: ['Start with default settings', 'Customize later as needed'],
            isOptional: false
          }
        ]
      },
      {
        id: 'client-handover-setup',
        title: 'Setting Up Client Handover',
        description: 'Configure automated client handover process',
        module: 'handover',
        difficulty: 'intermediate',
        estimatedDuration: 12,
        category: 'Handover',
        tags: ['handover', 'automation', 'clients'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: ['dashboard-overview'],
        steps: [
          {
            id: 'handover-overview',
            title: 'Client Handover Overview',
            description: 'Understanding the handover process',
            content: 'Client handover is the final step in project delivery, involving documentation, training, and transition to client management.',
            hints: ['Handover ensures smooth transitions', 'Reduces support requests'],
            isOptional: false
          },
          {
            id: 'create-template',
            title: 'Creating Handover Templates',
            description: 'Build reusable handover templates',
            content: 'Templates standardize your handover process and ensure consistency across all client projects.',
            action: {
              type: 'click',
              target: '[data-action="create-handover-template"]'
            },
            hints: ['Use industry-specific templates', 'Include all necessary documentation'],
            isOptional: false
          },
          {
            id: 'automation-setup',
            title: 'Setting Up Automation',
            description: 'Configure automated handover workflows',
            content: 'Automate document generation, email sequences, and client portal setup for efficient handovers.',
            hints: ['Test automation with sample data', 'Set up proper notifications'],
            isOptional: false
          }
        ]
      }
    ];

    defaultTutorials.forEach(tutorial => {
      this.tutorials.set(tutorial.id, tutorial);
    });
  }

  // Tutorial Management
  getTutorial(tutorialId: string): Tutorial | undefined {
    return this.tutorials.get(tutorialId);
  }

  getAllTutorials(): Tutorial[] {
    return Array.from(this.tutorials.values());
  }

  getTutorialsByModule(module: string): Tutorial[] {
    return Array.from(this.tutorials.values()).filter(t => t.module === module);
  }

  getTutorialsByDifficulty(difficulty: Tutorial['difficulty']): Tutorial[] {
    return Array.from(this.tutorials.values()).filter(t => t.difficulty === difficulty);
  }

  searchTutorials(query: string): Tutorial[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tutorials.values()).filter(tutorial =>
      tutorial.title.toLowerCase().includes(lowercaseQuery) ||
      tutorial.description.toLowerCase().includes(lowercaseQuery) ||
      tutorial.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Progress Management
  getUserProgress(userId: string, tutorialId: string): TutorialProgress | undefined {
    const userProgressList = this.userProgress.get(userId) || [];
    return userProgressList.find(p => p.tutorialId === tutorialId);
  }

  startTutorial(userId: string, tutorialId: string): TutorialProgress {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial) {
      throw new Error(`Tutorial ${tutorialId} not found`);
    }

    // Check prerequisites
    if (tutorial.prerequisites) {
      const userProgressList = this.userProgress.get(userId) || [];
      const missingPrereqs = tutorial.prerequisites.filter(prereq => {
        const prereqProgress = userProgressList.find(p => p.tutorialId === prereq);
        return !prereqProgress || prereqProgress.status !== 'completed';
      });

      if (missingPrereqs.length > 0) {
        throw new Error(`Missing prerequisites: ${missingPrereqs.join(', ')}`);
      }
    }

    const progress: TutorialProgress = {
      tutorialId,
      userId,
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      status: 'in-progress'
    };

    const userProgressList = this.userProgress.get(userId) || [];
    const existingIndex = userProgressList.findIndex(p => p.tutorialId === tutorialId);

    if (existingIndex >= 0) {
      userProgressList[existingIndex] = progress;
    } else {
      userProgressList.push(progress);
    }

    this.userProgress.set(userId, userProgressList);
    return progress;
  }

  updateProgress(userId: string, tutorialId: string, stepId: string, completed: boolean = true): TutorialProgress {
    const userProgressList = this.userProgress.get(userId) || [];
    const progressIndex = userProgressList.findIndex(p => p.tutorialId === tutorialId);

    if (progressIndex === -1) {
      throw new Error(`Tutorial progress not found for user ${userId} and tutorial ${tutorialId}`);
    }

    const progress = userProgressList[progressIndex];
    const tutorial = this.getTutorial(tutorialId);

    if (!tutorial) {
      throw new Error(`Tutorial ${tutorialId} not found`);
    }

    if (completed && !progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId);
    }

    // Update current step
    const stepIndex = tutorial.steps.findIndex(s => s.id === stepId);
    if (stepIndex >= 0 && completed) {
      progress.currentStep = Math.max(progress.currentStep, stepIndex + 1);
    }

    // Check if tutorial is completed
    if (progress.completedSteps.length === tutorial.steps.length) {
      progress.status = 'completed';
      progress.completedAt = new Date();
      progress.score = this.calculateScore(progress, tutorial);
    }

    progress.lastAccessedAt = new Date();
    userProgressList[progressIndex] = progress;
    this.userProgress.set(userId, userProgressList);

    return progress;
  }

  pauseTutorial(userId: string, tutorialId: string): void {
    const userProgressList = this.userProgress.get(userId) || [];
    const progressIndex = userProgressList.findIndex(p => p.tutorialId === tutorialId);

    if (progressIndex >= 0) {
      userProgressList[progressIndex].status = 'paused';
      userProgressList[progressIndex].lastAccessedAt = new Date();
      this.userProgress.set(userId, userProgressList);
    }
  }

  resumeTutorial(userId: string, tutorialId: string): TutorialProgress | undefined {
    const userProgressList = this.userProgress.get(userId) || [];
    const progressIndex = userProgressList.findIndex(p => p.tutorialId === tutorialId);

    if (progressIndex >= 0) {
      userProgressList[progressIndex].status = 'in-progress';
      userProgressList[progressIndex].lastAccessedAt = new Date();
      this.userProgress.set(userId, userProgressList);
      return userProgressList[progressIndex];
    }

    return undefined;
  }

  // Context Management
  setContext(context: TutorialContext): void {
    this.activeContext = context;
  }

  getContext(): TutorialContext | null {
    return this.activeContext;
  }

  getRecommendedTutorials(userId: string, limit: number = 5): Tutorial[] {
    if (!this.activeContext) {
      return this.getAllTutorials().slice(0, limit);
    }

    const userProgressList = this.userProgress.get(userId) || [];
    const completedTutorialIds = userProgressList
      .filter(p => p.status === 'completed')
      .map(p => p.tutorialId);

    // Filter tutorials based on context and user progress
    let recommendations = Array.from(this.tutorials.values())
      .filter(tutorial => {
        // Not already completed
        if (completedTutorialIds.includes(tutorial.id)) return false;

        // Match current module or general tutorials
        if (tutorial.module !== 'general' && tutorial.module !== this.activeContext!.currentModule) return false;

        // Check prerequisites
        if (tutorial.prerequisites) {
          const hasPrereqs = tutorial.prerequisites.every(prereq => completedTutorialIds.includes(prereq));
          if (!hasPrereqs) return false;
        }

        // Match difficulty to user experience
        const experienceMatch = this.matchDifficultyToExperience(tutorial.difficulty, this.activeContext!.userExperience);
        if (!experienceMatch) return false;

        return true;
      });

    // Sort by relevance (module match first, then by difficulty)
    recommendations.sort((a, b) => {
      const aModuleMatch = a.module === this.activeContext!.currentModule ? 1 : 0;
      const bModuleMatch = b.module === this.activeContext!.currentModule ? 1 : 0;

      if (aModuleMatch !== bModuleMatch) {
        return bModuleMatch - aModuleMatch;
      }

      return a.estimatedDuration - b.estimatedDuration; // Shorter tutorials first
    });

    return recommendations.slice(0, limit);
  }

  private matchDifficultyToExperience(difficulty: Tutorial['difficulty'], experience: string): boolean {
    const experienceMap: Record<string, Tutorial['difficulty'][]> = {
      'beginner': ['beginner'],
      'intermediate': ['beginner', 'intermediate'],
      'advanced': ['intermediate', 'advanced'],
      'expert': ['beginner', 'intermediate', 'advanced']
    };

    return experienceMap[experience]?.includes(difficulty) || false;
  }

  private calculateScore(progress: TutorialProgress, tutorial: Tutorial): number {
    const completionRate = progress.completedSteps.length / tutorial.steps.length;
    const timeBonus = this.calculateTimeBonus(progress, tutorial);
    return Math.round((completionRate * 80) + (timeBonus * 20));
  }

  private calculateTimeBonus(progress: TutorialProgress, tutorial: Tutorial): number {
    if (!progress.completedAt) return 0;

    const timeSpent = (progress.completedAt.getTime() - progress.startedAt.getTime()) / (1000 * 60); // minutes
    const expectedTime = tutorial.estimatedDuration;

    if (timeSpent <= expectedTime) return 1; // Full bonus for completing on time
    if (timeSpent <= expectedTime * 1.5) return 0.5; // Half bonus for reasonable time
    return 0; // No bonus for taking too long
  }

  // Analytics
  getUserStats(userId: string): {
    totalTutorials: number;
    completedTutorials: number;
    inProgressTutorials: number;
    averageScore: number;
    totalTimeSpent: number;
  } {
    const userProgressList = this.userProgress.get(userId) || [];

    const completed = userProgressList.filter(p => p.status === 'completed');
    const inProgress = userProgressList.filter(p => p.status === 'in-progress');

    const averageScore = completed.length > 0
      ? completed.reduce((sum, p) => sum + (p.score || 0), 0) / completed.length
      : 0;

    const totalTimeSpent = userProgressList.reduce((total, progress) => {
      const endTime = progress.completedAt || progress.lastAccessedAt;
      return total + (endTime.getTime() - progress.startedAt.getTime());
    }, 0) / (1000 * 60); // Convert to minutes

    return {
      totalTutorials: userProgressList.length,
      completedTutorials: completed.length,
      inProgressTutorials: inProgress.length,
      averageScore: Math.round(averageScore),
      totalTimeSpent: Math.round(totalTimeSpent)
    };
  }

  // Export/Import for persistence
  exportUserProgress(userId: string): string {
    const userProgressList = this.userProgress.get(userId) || [];
    return JSON.stringify(userProgressList);
  }

  importUserProgress(userId: string, data: string): void {
    try {
      const progressList: TutorialProgress[] = JSON.parse(data);
      this.userProgress.set(userId, progressList);
    } catch (error) {
      throw new Error('Invalid progress data format');
    }
  }
}

// Singleton instance
export const tutorialManager = new TutorialManager();

// Utility functions
export function validateTutorialStep(step: TutorialStep): boolean {
  if (!step.id || !step.title || !step.description) return false;
  if (step.action && !step.action.type) return false;
  if (step.validation && (!step.validation.type || !step.validation.target)) return false;
  return true;
}

export function createTutorialProgress(userId: string, tutorialId: string): TutorialProgress {
  return {
    tutorialId,
    userId,
    currentStep: 0,
    completedSteps: [],
    startedAt: new Date(),
    lastAccessedAt: new Date(),
    status: 'not-started'
  };
}

export type { Tutorial, TutorialStep, TutorialProgress, TutorialContext };