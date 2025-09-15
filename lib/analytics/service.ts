/**
 * @fileoverview Analytics Service - Core analytics calculations and data processing
 * @module lib/analytics/service
 * @author OSS Hero System
 * @version 1.0.0
 */

import { createServiceRoleClient } from '@/lib/supabase/server';
import { 
  TaskAnalytics, 
  VelocityMetrics, 
  BurndownData, 
  ProductivityInsights,
  AnalyticsTimeRange,
  ChartDataPoint,
  ChartConfig
} from './types';

export class AnalyticsService {
  private supabase = createServiceRoleClient();

  /**
   * Get comprehensive task analytics for the specified time range
   */
  async getTaskAnalytics(timeRange: AnalyticsTimeRange): Promise<TaskAnalytics> {
    const { data: tasks, error } = await this.supabase
      .from('hero_tasks')
      .select('*')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) {
      throw new Error(`Failed to fetch task analytics: ${error.message}`);
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length;

    // Calculate average completion time
    const completedTasksWithTimes = tasks.filter(t => 
      t.status === 'completed' && t.completed_at && t.created_at
    );
    const averageCompletionTime = completedTasksWithTimes.length > 0
      ? completedTasksWithTimes.reduce((sum, task) => {
          const created = new Date(task.created_at);
          const completed = new Date(task.completed_at);
          return sum + (completed.getTime() - created.getTime());
        }, 0) / completedTasksWithTimes.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Group by priority
    const tasksByPriority = tasks.reduce((acc, task) => {
      const priority = task.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by status
    const tasksByStatus = tasks.reduce((acc, task) => {
      const status = task.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by assignee
    const tasksByAssignee = tasks.reduce((acc, task) => {
      const assignee = task.assignee || 'unassigned';
      acc[assignee] = (acc[assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by tags
    const tasksByTag = tasks.reduce((acc, task) => {
      const tags = task.tags || [];
      tags.forEach((tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      averageCompletionTime,
      tasksByPriority,
      tasksByStatus,
      tasksByAssignee,
      tasksByTag
    };
  }

  /**
   * Calculate velocity metrics for sprints
   */
  async getVelocityMetrics(): Promise<VelocityMetrics> {
    // Get current sprint data
    const { data: currentSprint, error: sprintError } = await this.supabase
      .from('sprints')
      .select('*')
      .eq('is_active', true)
      .single();

    if (sprintError) {
      throw new Error(`Failed to fetch current sprint: ${sprintError.message}`);
    }

    // Get tasks for current sprint
    const { data: currentTasks, error: tasksError } = await this.supabase
      .from('hero_tasks')
      .select('*')
      .gte('created_at', currentSprint.start_date)
      .lte('created_at', currentSprint.end_date);

    if (tasksError) {
      throw new Error(`Failed to fetch sprint tasks: ${tasksError.message}`);
    }

    const plannedPoints = currentTasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
    const completedPoints = currentTasks
      .filter(t => t.status === 'completed')
      .reduce((sum, task) => sum + (task.story_points || 0), 0);
    const remainingPoints = plannedPoints - completedPoints;

    const now = new Date();
    const endDate = new Date(currentSprint.end_date);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate average velocity from historical data
    const { data: historicalSprints, error: histError } = await this.supabase
      .from('sprints')
      .select('*')
      .eq('is_active', false)
      .order('end_date', { ascending: false })
      .limit(5);

    if (histError) {
      throw new Error(`Failed to fetch historical sprints: ${histError.message}`);
    }

    const historicalVelocity = await Promise.all(
      historicalSprints.map(async (sprint) => {
        const { data: sprintTasks } = await this.supabase
          .from('hero_tasks')
          .select('story_points, status')
          .gte('created_at', sprint.start_date)
          .lte('created_at', sprint.end_date);

        const completedPoints = sprintTasks
          ?.filter(t => t.status === 'completed')
          .reduce((sum, task) => sum + (task.story_points || 0), 0) || 0;

        return {
          sprint: sprint.name,
          plannedPoints: sprint.total_points || 0,
          completedPoints,
          velocity: completedPoints,
          startDate: new Date(sprint.start_date),
          endDate: new Date(sprint.end_date)
        };
      })
    );

    const averageVelocity = historicalVelocity.length > 0
      ? historicalVelocity.reduce((sum, sprint) => sum + sprint.velocity, 0) / historicalVelocity.length
      : 0;

    const projectedCompletion = averageVelocity > 0 && remainingPoints > 0
      ? new Date(now.getTime() + (remainingPoints / averageVelocity) * 24 * 60 * 60 * 1000)
      : endDate;

    // Calculate team velocity
    const teamVelocity = currentTasks.reduce((acc, task) => {
      const assignee = task.assignee || 'unassigned';
      if (task.status === 'completed') {
        acc[assignee] = (acc[assignee] || 0) + (task.story_points || 0);
      }
      return acc;
    }, {} as Record<string, number>);

    // Determine velocity trend
    const recentVelocities = historicalVelocity.slice(0, 3).map(s => s.velocity);
    const velocityTrend = recentVelocities.length >= 2
      ? recentVelocities[0] > recentVelocities[recentVelocities.length - 1] ? 'increasing'
        : recentVelocities[0] < recentVelocities[recentVelocities.length - 1] ? 'decreasing'
        : 'stable'
      : 'stable';

    return {
      currentSprint: {
        plannedPoints,
        completedPoints,
        remainingPoints,
        daysRemaining,
        averageVelocity,
        projectedCompletion
      },
      historicalVelocity,
      teamVelocity,
      velocityTrend
    };
  }

  /**
   * Generate burndown chart data for a sprint
   */
  async getBurndownData(sprintId: string): Promise<BurndownData> {
    const { data: sprint, error: sprintError } = await this.supabase
      .from('sprints')
      .select('*')
      .eq('id', sprintId)
      .single();

    if (sprintError) {
      throw new Error(`Failed to fetch sprint: ${sprintError.message}`);
    }

    const { data: tasks, error: tasksError } = await this.supabase
      .from('hero_tasks')
      .select('*')
      .gte('created_at', sprint.start_date)
      .lte('created_at', sprint.end_date);

    if (tasksError) {
      throw new Error(`Failed to fetch sprint tasks: ${tasksError.message}`);
    }

    const totalPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Generate daily progress data
    const dailyProgress = [];
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Get tasks completed by this date
      const completedByDate = tasks.filter(task => {
        if (!task.completed_at) return false;
        const completedDate = new Date(task.completed_at);
        return completedDate <= currentDate;
      });

      const completedPoints = completedByDate.reduce((sum, task) => sum + (task.story_points || 0), 0);
      const remainingPoints = totalPoints - completedPoints;
      const idealBurndown = totalPoints - (totalPoints * i / totalDays);

      dailyProgress.push({
        date: currentDate,
        remainingPoints,
        completedPoints,
        idealBurndown
      });
    }

    const now = new Date();
    const currentDay = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentProgress = dailyProgress[currentDay] || dailyProgress[dailyProgress.length - 1];
    const isOnTrack = currentProgress.remainingPoints <= currentProgress.idealBurndown;

    // Project completion date
    const lastProgress = dailyProgress[dailyProgress.length - 1];
    const projectedCompletion = lastProgress.remainingPoints > 0
      ? new Date(endDate.getTime() + (lastProgress.remainingPoints / (totalPoints / totalDays)) * 24 * 60 * 60 * 1000)
      : endDate;

    return {
      sprintId,
      sprintName: sprint.name,
      startDate,
      endDate,
      totalPoints,
      dailyProgress,
      currentDay,
      totalDays,
      isOnTrack,
      projectedCompletion
    };
  }

  /**
   * Generate productivity insights and recommendations
   */
  async getProductivityInsights(timeRange: AnalyticsTimeRange): Promise<ProductivityInsights> {
    const { data: tasks, error } = await this.supabase
      .from('hero_tasks')
      .select('*')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) {
      throw new Error(`Failed to fetch tasks for insights: ${error.message}`);
    }

    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(tasks);

    // Calculate team performance
    const teamPerformance = this.calculateTeamPerformance(tasks);

    // Analyze completion trends
    const completionTrends = this.analyzeCompletionTrends(tasks, timeRange);

    // Generate recommendations
    const recommendations = this.generateRecommendations(tasks, bottlenecks, teamPerformance);

    return {
      bottlenecks,
      teamPerformance,
      completionTrends,
      recommendations
    };
  }

  /**
   * Identify bottlenecks in task processing
   */
  private identifyBottlenecks(tasks: any[]): ProductivityInsights['bottlenecks'] {
    const bottlenecks = [];

    // Check for assignee bottlenecks
    const assigneeCounts = tasks.reduce((acc, task) => {
      const assignee = task.assignee || 'unassigned';
      acc[assignee] = (acc[assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assigneeCounts_values = Object.values(assigneeCounts);
    const maxTasks = assigneeCounts_values.length > 0 ? Math.max(...assigneeCounts_values as number[]) : 0;
    const avgTasks = tasks.length / Math.max(Object.keys(assigneeCounts).length, 1);

    if (maxTasks > avgTasks * 2 && maxTasks > 0) {
      const overloadedAssignee = Object.entries(assigneeCounts).find(([_, count]) => count === maxTasks);
      if (overloadedAssignee) {
        bottlenecks.push({
          type: 'assignee' as const,
          description: `${overloadedAssignee[0]} has ${maxTasks} tasks (${Math.round(maxTasks / avgTasks * 100)}% above average)`,
          impact: maxTasks > avgTasks * 3 ? 'high' as const : 'medium' as const,
          recommendation: 'Consider redistributing tasks or adding team members',
          affectedTasks: maxTasks
        });
      }
    }

    // Check for priority bottlenecks
    const priorityCounts = tasks.reduce((acc, task) => {
      const priority = task.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const highPriorityCount = priorityCounts.high || 0;
    if (highPriorityCount > tasks.length * 0.4) {
      bottlenecks.push({
        type: 'priority' as const,
        description: `${highPriorityCount} high priority tasks (${Math.round(highPriorityCount / tasks.length * 100)}% of total)`,
        impact: 'high' as const,
        recommendation: 'Review priority assignments and focus on completing high-priority tasks first',
        affectedTasks: highPriorityCount
      });
    }

    // Check for overdue tasks
    const overdueTasks = tasks.filter(task => 
      task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
    );

    if (overdueTasks.length > 0) {
      bottlenecks.push({
        type: 'dependency' as const,
        description: `${overdueTasks.length} overdue tasks`,
        impact: overdueTasks.length > tasks.length * 0.2 ? 'high' as const : 'medium' as const,
        recommendation: 'Review deadlines and adjust timelines or resources',
        affectedTasks: overdueTasks.length
      });
    }

    return bottlenecks;
  }

  /**
   * Calculate team performance metrics
   */
  private calculateTeamPerformance(tasks: any[]): ProductivityInsights['teamPerformance'] {
    interface AssigneeStats {
      totalTasks: number;
      completedTasks: number;
      totalTime: number;
      completedTime: number;
    }

    const assigneeStats = tasks.reduce((acc, task) => {
      const assignee = task.assignee || 'unassigned';
      if (!acc[assignee]) {
        acc[assignee] = {
          totalTasks: 0,
          completedTasks: 0,
          totalTime: 0,
          completedTime: 0
        };
      }

      acc[assignee].totalTasks++;
      if (task.status === 'completed') {
        acc[assignee].completedTasks++;
        if (task.completed_at && task.created_at) {
          const timeDiff = new Date(task.completed_at).getTime() - new Date(task.created_at).getTime();
          acc[assignee].completedTime += timeDiff;
        }
      }
      if (task.created_at) {
        const timeDiff = new Date().getTime() - new Date(task.created_at).getTime();
        acc[assignee].totalTime += timeDiff;
      }

      return acc;
    }, {} as Record<string, AssigneeStats>);

    return Object.entries(assigneeStats).map(([assignee, stats]) => {
      const typedStats = stats as AssigneeStats;
      const completionRate = typedStats.totalTasks > 0 ? typedStats.completedTasks / typedStats.totalTasks : 0;
      const averageCompletionTime = typedStats.completedTasks > 0 
        ? typedStats.completedTime / typedStats.completedTasks / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      // Calculate productivity score (0-100)
      const productivityScore = Math.round(
        (completionRate * 0.6 + (averageCompletionTime > 0 ? Math.max(0, 1 - averageCompletionTime / 7) * 0.4 : 0)) * 100
      );

      // Determine trend (simplified)
      const trend = completionRate > 0.8 ? 'improving' : completionRate > 0.5 ? 'stable' : 'declining';

      return {
        assignee,
        completedTasks: typedStats.completedTasks,
        averageCompletionTime,
        productivityScore,
        trend
      };
    });
  }

  /**
   * Analyze completion trends over time
   */
  private analyzeCompletionTrends(tasks: any[], timeRange: AnalyticsTimeRange): ProductivityInsights['completionTrends'] {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const totalDays = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const periodDays = Math.max(1, Math.floor(totalDays / 7)); // Weekly periods

    const trends = [];
    for (let i = 0; i < totalDays; i += periodDays) {
      const periodStart = new Date(timeRange.start.getTime() + i * 24 * 60 * 60 * 1000);
      const periodEnd = new Date(Math.min(
        timeRange.start.getTime() + (i + periodDays) * 24 * 60 * 60 * 1000,
        timeRange.end.getTime()
      ));

      const periodTasks = completedTasks.filter(task => {
        const completedDate = new Date(task.completed_at);
        return completedDate >= periodStart && completedDate < periodEnd;
      });

      const averageTime = periodTasks.length > 0
        ? periodTasks.reduce((sum, task) => {
            const created = new Date(task.created_at);
            const completed = new Date(task.completed_at);
            return sum + (completed.getTime() - created.getTime());
          }, 0) / periodTasks.length / (1000 * 60 * 60 * 24)
        : 0;

      trends.push({
        period: `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`,
        completedTasks: periodTasks.length,
        averageTime,
        efficiency: periodTasks.length / periodDays // Tasks per day
      });
    }

    return trends;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    tasks: any[], 
    bottlenecks: ProductivityInsights['bottlenecks'],
    teamPerformance: ProductivityInsights['teamPerformance']
  ): ProductivityInsights['recommendations'] {
    const recommendations = [];

    // Process recommendations
    if (bottlenecks.some(b => b.type === 'assignee' && b.impact === 'high')) {
      recommendations.push({
        category: 'resource' as const,
        priority: 'high' as const,
        title: 'Redistribute Workload',
        description: 'Some team members are overloaded with tasks',
        impact: 'Reduces burnout and improves delivery speed',
        effort: 'medium' as const
      });
    }

    // Quality recommendations
    const lowPerformingMembers = teamPerformance.filter(member => member.productivityScore < 60);
    if (lowPerformingMembers.length > 0) {
      recommendations.push({
        category: 'process' as const,
        priority: 'medium' as const,
        title: 'Provide Additional Support',
        description: `${lowPerformingMembers.length} team members need additional support`,
        impact: 'Improves overall team productivity',
        effort: 'high' as const
      });
    }

    // Timeline recommendations
    const overdueCount = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length;

    if (overdueCount > tasks.length * 0.1) {
      recommendations.push({
        category: 'timeline' as const,
        priority: 'high' as const,
        title: 'Review Project Timelines',
        description: `${overdueCount} tasks are overdue`,
        impact: 'Prevents project delays and improves planning accuracy',
        effort: 'low' as const
      });
    }

    return recommendations;
  }

  /**
   * Convert analytics data to chart configuration
   */
  toChartConfig(data: any, type: string): ChartConfig {
    switch (type) {
      case 'burndown':
        return this.createBurndownChart(data);
      case 'velocity':
        return this.createVelocityChart(data);
      case 'productivity':
        return this.createProductivityChart(data);
      default:
        throw new Error(`Unknown chart type: ${type}`);
    }
  }

  private createBurndownChart(burndownData: BurndownData): ChartConfig {
    const data: ChartDataPoint[] = burndownData.dailyProgress.map(day => ({
      x: day.date,
      y: day.remainingPoints,
      label: day.date.toLocaleDateString(),
      metadata: { completedPoints: day.completedPoints, idealBurndown: day.idealBurndown }
    }));

    return {
      type: 'line',
      title: `${burndownData.sprintName} Burndown Chart`,
      xAxis: { label: 'Date', type: 'time' },
      yAxis: { label: 'Remaining Points', min: 0 },
      data,
      colors: ['#3b82f6', '#ef4444'],
      showLegend: true,
      showGrid: true,
      animation: true
    };
  }

  private createVelocityChart(velocityData: VelocityMetrics): ChartConfig {
    const data: ChartDataPoint[] = velocityData.historicalVelocity.map(sprint => ({
      x: sprint.sprint,
      y: sprint.velocity,
      label: `${sprint.velocity} points`,
      metadata: { plannedPoints: sprint.plannedPoints, completedPoints: sprint.completedPoints }
    }));

    return {
      type: 'bar',
      title: 'Sprint Velocity History',
      xAxis: { label: 'Sprint', type: 'category' },
      yAxis: { label: 'Velocity (Points)', min: 0 },
      data,
      colors: ['#10b981'],
      showLegend: false,
      showGrid: true,
      animation: true
    };
  }

  private createProductivityChart(teamPerformance: ProductivityInsights['teamPerformance']): ChartConfig {
    const data: ChartDataPoint[] = teamPerformance.map(member => ({
      x: member.assignee,
      y: member.productivityScore,
      label: `${member.productivityScore}%`,
      metadata: { 
        completedTasks: member.completedTasks, 
        averageTime: member.averageCompletionTime,
        trend: member.trend
      }
    }));

    return {
      type: 'bar',
      title: 'Team Productivity Scores',
      xAxis: { label: 'Team Member', type: 'category' },
      yAxis: { label: 'Productivity Score', min: 0, max: 100 },
      data,
      colors: ['#8b5cf6'],
      showLegend: false,
      showGrid: true,
      animation: true
    };
  }
}

export const analyticsService = new AnalyticsService();
