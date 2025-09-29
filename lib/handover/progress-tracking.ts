export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number; // in seconds
  attempts: number;
  score?: number;
  feedback?: string;
  metadata?: any;
}

export interface UserProgress {
  userId: string;
  programId: string;
  clientId: string;
  overallStatus: 'not_started' | 'in_progress' | 'completed' | 'paused';
  completionPercentage: number;
  totalTimeSpent: number;
  startedAt?: Date;
  lastActivity?: Date;
  completedAt?: Date;
  steps: Map<string, ProgressStep>;
  milestones: string[];
  achievements: string[];
  currentStep?: string;
}

export interface ProgressMetrics {
  totalUsers: number;
  activeUsers: number;
  completedUsers: number;
  averageCompletionTime: number;
  averageCompletionRate: number;
  dropoffPoints: string[];
  engagementScore: number;
  satisfactionScore: number;
}

export interface ProgressAlert {
  id: string;
  userId: string;
  type: 'stalled' | 'behind_schedule' | 'low_engagement' | 'milestone_reached' | 'completion';
  severity: 'low' | 'medium' | 'high';
  message: string;
  triggeredAt: Date;
  acknowledged: boolean;
  actionRequired: boolean;
}

export class ProgressTracker {
  private userProgress: Map<string, UserProgress> = new Map();
  private alerts: Map<string, ProgressAlert[]> = new Map();
  private thresholds = {
    stallTime: 24 * 60 * 60 * 1000, // 24 hours
    lowEngagementThreshold: 30, // 30% engagement score
    behindScheduleThreshold: 0.5 // 50% behind expected pace
  };

  async initializeUserProgress(
    userId: string,
    programId: string,
    clientId: string,
    steps: string[]
  ): Promise<UserProgress> {
    const progressKey = `${userId}_${programId}`;

    const stepsMap = new Map<string, ProgressStep>();
    steps.forEach(stepId => {
      stepsMap.set(stepId, {
        id: stepId,
        title: '',
        description: '',
        status: 'not_started',
        timeSpent: 0,
        attempts: 0
      });
    });

    const progress: UserProgress = {
      userId,
      programId,
      clientId,
      overallStatus: 'not_started',
      completionPercentage: 0,
      totalTimeSpent: 0,
      steps: stepsMap,
      milestones: [],
      achievements: [],
      currentStep: steps[0]
    };

    this.userProgress.set(progressKey, progress);
    return progress;
  }

  async startStep(
    userId: string,
    programId: string,
    stepId: string
  ): Promise<void> {
    const progressKey = `${userId}_${programId}`;
    const progress = this.userProgress.get(progressKey);

    if (!progress) {
      throw new Error('User progress not found');
    }

    const step = progress.steps.get(stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    step.status = 'in_progress';
    step.startedAt = new Date();
    step.attempts++;

    progress.overallStatus = 'in_progress';
    progress.currentStep = stepId;
    progress.lastActivity = new Date();

    if (!progress.startedAt) {
      progress.startedAt = new Date();
    }

    await this.logProgressEvent(userId, programId, 'step_started', { stepId });
  }

  async completeStep(
    userId: string,
    programId: string,
    stepId: string,
    score?: number,
    feedback?: string,
    metadata?: any
  ): Promise<void> {
    const progressKey = `${userId}_${programId}`;
    const progress = this.userProgress.get(progressKey);

    if (!progress) {
      throw new Error('User progress not found');
    }

    const step = progress.steps.get(stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    step.status = 'completed';
    step.completedAt = new Date();
    step.score = score;
    step.feedback = feedback;
    step.metadata = metadata;

    if (step.startedAt) {
      step.timeSpent += Date.now() - step.startedAt.getTime();
    }

    await this.updateOverallProgress(userId, programId);
    await this.checkMilestones(userId, programId);
    await this.checkAchievements(userId, programId);

    await this.logProgressEvent(userId, programId, 'step_completed', {
      stepId,
      score,
      timeSpent: step.timeSpent
    });
  }

  async pauseStep(
    userId: string,
    programId: string,
    stepId: string
  ): Promise<void> {
    const progressKey = `${userId}_${programId}`;
    const progress = this.userProgress.get(progressKey);

    if (!progress) {
      throw new Error('User progress not found');
    }

    const step = progress.steps.get(stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    if (step.status === 'in_progress' && step.startedAt) {
      step.timeSpent += Date.now() - step.startedAt.getTime();
    }

    progress.overallStatus = 'paused';
    progress.lastActivity = new Date();

    await this.logProgressEvent(userId, programId, 'step_paused', { stepId });
  }

  async skipStep(
    userId: string,
    programId: string,
    stepId: string,
    reason?: string
  ): Promise<void> {
    const progressKey = `${userId}_${programId}`;
    const progress = this.userProgress.get(progressKey);

    if (!progress) {
      throw new Error('User progress not found');
    }

    const step = progress.steps.get(stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    step.status = 'skipped';
    step.metadata = { skipReason: reason };

    await this.updateOverallProgress(userId, programId);
    await this.logProgressEvent(userId, programId, 'step_skipped', { stepId, reason });
  }

  async failStep(
    userId: string,
    programId: string,
    stepId: string,
    reason?: string
  ): Promise<void> {
    const progressKey = `${userId}_${programId}`;
    const progress = this.userProgress.get(progressKey);

    if (!progress) {
      throw new Error('User progress not found');
    }

    const step = progress.steps.get(stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    step.status = 'failed';
    step.feedback = reason;

    await this.logProgressEvent(userId, programId, 'step_failed', { stepId, reason });
  }

  private async updateOverallProgress(userId: string, programId: string): Promise<void> {
    const progressKey = `${userId}_${programId}`;
    const progress = this.userProgress.get(progressKey);

    if (!progress) return;

    const totalSteps = progress.steps.size;
    const completedSteps = Array.from(progress.steps.values())
      .filter(step => step.status === 'completed').length;
    const skippedSteps = Array.from(progress.steps.values())
      .filter(step => step.status === 'skipped').length;

    progress.completionPercentage = ((completedSteps + skippedSteps) / totalSteps) * 100;
    progress.totalTimeSpent = Array.from(progress.steps.values())
      .reduce((total, step) => total + step.timeSpent, 0);

    if (progress.completionPercentage >= 100) {
      progress.overallStatus = 'completed';
      progress.completedAt = new Date();

      await this.generateAlert(userId, programId, {
        type: 'completion',
        severity: 'low',
        message: 'Congratulations! You have completed the training program.',
        actionRequired: false
      });
    }
  }

  private async checkMilestones(userId: string, programId: string): Promise<void> {
    const progressKey = `${userId}_${programId}`;
    const progress = this.userProgress.get(progressKey);

    if (!progress) return;

    const milestoneThresholds = [25, 50, 75, 100];

    for (const threshold of milestoneThresholds) {
      const milestoneKey = `${threshold}%`;

      if (progress.completionPercentage >= threshold &&
          !progress.milestones.includes(milestoneKey)) {

        progress.milestones.push(milestoneKey);

        await this.generateAlert(userId, programId, {
          type: 'milestone_reached',
          severity: 'low',
          message: `Milestone reached: ${threshold}% completion!`,
          actionRequired: false
        });
      }
    }
  }

  private async checkAchievements(userId: string, programId: string): Promise<void> {
    const progressKey = `${userId}_${programId}`;
    const progress = this.userProgress.get(progressKey);

    if (!progress) return;

    const achievements = [];

    // Fast learner achievement
    const avgStepTime = progress.totalTimeSpent / progress.steps.size;
    if (avgStepTime < 300000 && progress.completionPercentage > 50) { // Less than 5 minutes per step
      achievements.push('fast_learner');
    }

    // Perfect score achievement
    const completedSteps = Array.from(progress.steps.values())
      .filter(step => step.status === 'completed' && step.score !== undefined);
    if (completedSteps.length > 0) {
      const avgScore = completedSteps.reduce((sum, step) => sum + (step.score || 0), 0) / completedSteps.length;
      if (avgScore >= 95) {
        achievements.push('perfect_score');
      }
    }

    // Consistent learner achievement
    const lastWeek = Date.now() - (7 * 24 * 60 * 60 * 1000);
    if (progress.lastActivity && progress.lastActivity.getTime() > lastWeek) {
      achievements.push('consistent_learner');
    }

    // Add new achievements
    for (const achievement of achievements) {
      if (!progress.achievements.includes(achievement)) {
        progress.achievements.push(achievement);
      }
    }
  }

  async getProgressSummary(userId: string, programId: string): Promise<UserProgress | null> {
    const progressKey = `${userId}_${programId}`;
    return this.userProgress.get(progressKey) || null;
  }

  async getProgressMetrics(programId: string): Promise<ProgressMetrics> {
    const allProgress = Array.from(this.userProgress.values())
      .filter(progress => progress.programId === programId);

    const totalUsers = allProgress.length;
    const activeUsers = allProgress.filter(p => p.overallStatus === 'in_progress').length;
    const completedUsers = allProgress.filter(p => p.overallStatus === 'completed').length;

    const completionTimes = allProgress
      .filter(p => p.completedAt && p.startedAt)
      .map(p => p.completedAt!.getTime() - p.startedAt!.getTime());

    const averageCompletionTime = completionTimes.length > 0 ?
      completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length : 0;

    const averageCompletionRate = totalUsers > 0 ?
      allProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / totalUsers : 0;

    const dropoffPoints = this.identifyDropoffPoints(allProgress);
    const engagementScore = this.calculateEngagementScore(allProgress);

    return {
      totalUsers,
      activeUsers,
      completedUsers,
      averageCompletionTime,
      averageCompletionRate,
      dropoffPoints,
      engagementScore,
      satisfactionScore: 85 // This would come from feedback surveys
    };
  }

  private identifyDropoffPoints(progressList: UserProgress[]): string[] {
    const stepDropoffs = new Map<string, number>();

    for (const progress of progressList) {
      for (const [stepId, step] of progress.steps) {
        if (step.status === 'not_started' && progress.currentStep === stepId) {
          stepDropoffs.set(stepId, (stepDropoffs.get(stepId) || 0) + 1);
        }
      }
    }

    return Array.from(stepDropoffs.entries())
      .filter(([_, count]) => count > progressList.length * 0.1) // More than 10% dropoff
      .map(([stepId, _]) => stepId);
  }

  private calculateEngagementScore(progressList: UserProgress[]): number {
    if (progressList.length === 0) return 0;

    const engagementFactors = progressList.map(progress => {
      const recentActivity = progress.lastActivity ?
        (Date.now() - progress.lastActivity.getTime()) / (24 * 60 * 60 * 1000) : 30; // days

      const activityScore = Math.max(0, 100 - (recentActivity * 10));
      const completionScore = progress.completionPercentage;
      const consistencyScore = progress.achievements.includes('consistent_learner') ? 100 : 50;

      return (activityScore + completionScore + consistencyScore) / 3;
    });

    return engagementFactors.reduce((sum, score) => sum + score, 0) / engagementFactors.length;
  }

  async monitorProgress(): Promise<void> {
    for (const [key, progress] of this.userProgress) {
      await this.checkForStalls(progress);
      await this.checkScheduleAdherence(progress);
      await this.checkEngagement(progress);
    }
  }

  private async checkForStalls(progress: UserProgress): Promise<void> {
    if (progress.overallStatus !== 'in_progress') return;

    const lastActivity = progress.lastActivity?.getTime() || 0;
    const timeSinceActivity = Date.now() - lastActivity;

    if (timeSinceActivity > this.thresholds.stallTime) {
      await this.generateAlert(progress.userId, progress.programId, {
        type: 'stalled',
        severity: 'medium',
        message: 'User has been inactive for more than 24 hours',
        actionRequired: true
      });
    }
  }

  private async checkScheduleAdherence(progress: UserProgress): Promise<void> {
    // Implementation would check if user is behind expected schedule
    // based on program timeline and current progress
  }

  private async checkEngagement(progress: UserProgress): Promise<void> {
    const engagementScore = this.calculateEngagementScore([progress]);

    if (engagementScore < this.thresholds.lowEngagementThreshold) {
      await this.generateAlert(progress.userId, progress.programId, {
        type: 'low_engagement',
        severity: 'medium',
        message: 'Low engagement detected - user may need additional support',
        actionRequired: true
      });
    }
  }

  private async generateAlert(
    userId: string,
    programId: string,
    alertData: Partial<ProgressAlert>
  ): Promise<void> {
    const alertKey = `${userId}_${programId}`;
    const alerts = this.alerts.get(alertKey) || [];

    const alert: ProgressAlert = {
      id: `alert_${Date.now()}`,
      userId,
      type: alertData.type!,
      severity: alertData.severity!,
      message: alertData.message!,
      triggeredAt: new Date(),
      acknowledged: false,
      actionRequired: alertData.actionRequired || false
    };

    alerts.push(alert);
    this.alerts.set(alertKey, alerts);

    console.log(`Alert generated: ${alert.type} for user ${userId}`);
  }

  async getAlerts(userId: string, programId: string): Promise<ProgressAlert[]> {
    const alertKey = `${userId}_${programId}`;
    return this.alerts.get(alertKey) || [];
  }

  async acknowledgeAlert(userId: string, programId: string, alertId: string): Promise<void> {
    const alertKey = `${userId}_${programId}`;
    const alerts = this.alerts.get(alertKey) || [];

    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  private async logProgressEvent(
    userId: string,
    programId: string,
    event: string,
    data: any
  ): Promise<void> {
    console.log(`Progress event: ${event} for user ${userId} in program ${programId}`, data);
    // Implementation would integrate with logging service
  }
}

export default ProgressTracker;