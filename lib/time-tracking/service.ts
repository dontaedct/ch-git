/**
 * Hero Tasks Time Tracking Service
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

import { createClient } from '@supabase/supabase-js';
import {
  TimeEntry,
  TimeTrackingSession,
  TimeTrackingSettings,
  TimeTrackingSummary,
  TimeTrackingAnalytics,
  TimeTrackingReport,
  TimeTrackingReportData,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  StartTimeTrackingRequest,
  StopTimeTrackingRequest,
  TimeTrackingReportType,
  TaskTimeBreakdown,
  DailyTimeBreakdown,
  ProductivityMetrics,
  TimeTrackingInsight,
  TimeDistribution,
  TimeTrackingTrend
} from '@/types/hero-tasks';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class TimeTrackingService {
  /**
   * Start time tracking for a task
   */
  static async startTracking(userId: string, request: StartTimeTrackingRequest): Promise<TimeTrackingSession> {
    try {
      // Stop any existing active session
      await this.stopActiveSession(userId);

      // Create new session
      const { data: session, error } = await supabase
        .from('time_tracking_sessions')
        .insert({
          task_id: request.task_id,
          user_id: userId,
          start_time: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return session;
    } catch (error) {
      console.error('Error starting time tracking:', error);
      throw new Error('Failed to start time tracking');
    }
  }

  /**
   * Stop time tracking and create time entry
   */
  static async stopTracking(userId: string, request?: StopTimeTrackingRequest): Promise<TimeEntry> {
    try {
      // Get active session
      const activeSession = await this.getActiveSession(userId);
      if (!activeSession) {
        throw new Error('No active time tracking session found');
      }

      // Create time entry
      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: activeSession.task_id,
          user_id: userId,
          description: request?.description || 'Manual time tracking session',
          start_time: activeSession.start_time,
          end_time: new Date().toISOString(),
          is_active: false,
          is_manual: true,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Mark session as inactive
      await supabase
        .from('time_tracking_sessions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', activeSession.id);

      return timeEntry;
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      throw new Error('Failed to stop time tracking');
    }
  }

  /**
   * Get active time tracking session for user
   */
  static async getActiveSession(userId: string): Promise<TimeTrackingSession | null> {
    try {
      const { data, error } = await supabase
        .from('time_tracking_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  }

  /**
   * Update last activity for active session
   */
  static async updateActivity(userId: string): Promise<void> {
    try {
      const activeSession = await this.getActiveSession(userId);
      if (!activeSession) return;

      await supabase
        .from('time_tracking_sessions')
        .update({ 
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeSession.id);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }

  /**
   * Stop active session without creating time entry
   */
  static async stopActiveSession(userId: string): Promise<void> {
    try {
      await supabase
        .from('time_tracking_sessions')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true);
    } catch (error) {
      console.error('Error stopping active session:', error);
    }
  }

  /**
   * Create manual time entry
   */
  static async createTimeEntry(userId: string, request: CreateTimeEntryRequest): Promise<TimeEntry> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: request.task_id,
          user_id: userId,
          description: request.description,
          start_time: request.start_time || new Date().toISOString(),
          end_time: request.end_time,
          duration_minutes: request.duration_minutes || 0,
          is_active: false,
          is_manual: request.is_manual ?? true,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw new Error('Failed to create time entry');
    }
  }

  /**
   * Update time entry
   */
  static async updateTimeEntry(userId: string, entryId: string, request: UpdateTimeEntryRequest): Promise<TimeEntry> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          description: request.description,
          start_time: request.start_time,
          end_time: request.end_time,
          duration_minutes: request.duration_minutes,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw new Error('Failed to update time entry');
    }
  }

  /**
   * Delete time entry
   */
  static async deleteTimeEntry(userId: string, entryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw new Error('Failed to delete time entry');
    }
  }

  /**
   * Get time entries for user
   */
  static async getTimeEntries(
    userId: string,
    options: {
      taskId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<TimeEntry[]> {
    try {
      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (options.taskId) {
        query = query.eq('task_id', options.taskId);
      }

      if (options.startDate) {
        query = query.gte('start_time', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('start_time', options.endDate);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting time entries:', error);
      throw new Error('Failed to get time entries');
    }
  }

  /**
   * Get time tracking summary for user
   */
  static async getTimeTrackingSummary(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TimeTrackingSummary> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();

      // Get summary data using database function
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_time_tracking_summary', {
          user_id_param: userId,
          start_date: start,
          end_date: end
        });

      if (summaryError) throw summaryError;

      // Get active session
      const activeSession = await this.getActiveSession(userId);

      // Get user settings for goals
      const { data: settings } = await supabase
        .from('time_tracking_settings')
        .select('daily_goal_hours, weekly_goal_hours')
        .eq('user_id', userId)
        .single();

      const dailyGoal = settings?.daily_goal_hours || 8;
      const weeklyGoal = settings?.weekly_goal_hours || 40;

      // Calculate goal progress
      const dailyGoalProgress = Math.min((summaryData[0]?.total_hours || 0) / dailyGoal * 100, 100);
      const weeklyGoalProgress = Math.min((summaryData[0]?.total_hours || 0) / weeklyGoal * 100, 100);

      return {
        total_hours: summaryData[0]?.total_hours || 0,
        total_entries: summaryData[0]?.total_entries || 0,
        tasks_tracked: summaryData[0]?.tasks_tracked || 0,
        average_session_hours: summaryData[0]?.average_session_hours || 0,
        most_active_day: summaryData[0]?.most_active_day || '',
        most_active_task_id: summaryData[0]?.most_active_task_id || '',
        active_session: activeSession || undefined,
        daily_goal_progress: dailyGoalProgress,
        weekly_goal_progress: weeklyGoalProgress
      };
    } catch (error) {
      console.error('Error getting time tracking summary:', error);
      throw new Error('Failed to get time tracking summary');
    }
  }

  /**
   * Get time tracking analytics
   */
  static async getTimeTrackingAnalytics(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeTrackingAnalytics> {
    try {
      // Get time entries for the period
      const timeEntries = await this.getTimeEntries(userId, {
        startDate,
        endDate
      });

      // Calculate analytics
      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60;
      const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const dailyAverageHours = totalHours / Math.max(daysDiff, 1);

      // Get task breakdown
      const taskBreakdown = await this.getTaskTimeBreakdown(userId, startDate, endDate);

      // Get time distribution
      const timeDistribution = this.calculateTimeDistribution(timeEntries);

      // Get trends
      const trends = await this.calculateTimeTrackingTrends(userId, startDate, endDate);

      // Calculate productivity score
      const productivityScore = this.calculateProductivityScore(timeEntries, dailyAverageHours);

      // Get goal completion rate
      const { data: settings } = await supabase
        .from('time_tracking_settings')
        .select('daily_goal_hours')
        .eq('user_id', userId)
        .single();

      const dailyGoal = settings?.daily_goal_hours || 8;
      const goalCompletionRate = Math.min((dailyAverageHours / dailyGoal) * 100, 100);

      return {
        user_id: userId,
        period_start: startDate,
        period_end: endDate,
        total_hours: totalHours,
        daily_average_hours: dailyAverageHours,
        productivity_score: productivityScore,
        goal_completion_rate: goalCompletionRate,
        top_tasks: taskBreakdown.slice(0, 10),
        time_distribution: timeDistribution,
        trends: trends
      };
    } catch (error) {
      console.error('Error getting time tracking analytics:', error);
      throw new Error('Failed to get time tracking analytics');
    }
  }

  /**
   * Get task time breakdown
   */
  static async getTaskTimeBreakdown(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<TaskTimeBreakdown[]> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          task_id,
          duration_minutes,
          start_time,
          hero_tasks!inner(title)
        `)
        .eq('user_id', userId)
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .eq('is_active', false);

      if (error) throw error;

      // Group by task
      const taskMap = new Map<string, TaskTimeBreakdown>();
      
      data?.forEach(entry => {
        const taskId = entry.task_id;
        const durationHours = entry.duration_minutes / 60;
        
        if (!taskMap.has(taskId)) {
          taskMap.set(taskId, {
            task_id: taskId,
            task_title: entry.hero_tasks[0]?.title || 'Unknown Task',
            total_hours: 0,
            entries_count: 0,
            average_session_hours: 0,
            last_tracked: entry.start_time
          });
        }
        
        const task = taskMap.get(taskId)!;
        task.total_hours += durationHours;
        task.entries_count += 1;
        task.average_session_hours = task.total_hours / task.entries_count;
        
        if (new Date(entry.start_time) > new Date(task.last_tracked)) {
          task.last_tracked = entry.start_time;
        }
      });

      return Array.from(taskMap.values()).sort((a, b) => b.total_hours - a.total_hours);
    } catch (error) {
      console.error('Error getting task time breakdown:', error);
      throw new Error('Failed to get task time breakdown');
    }
  }

  /**
   * Calculate time distribution
   */
  static calculateTimeDistribution(timeEntries: TimeEntry[]): TimeDistribution {
    const byDayOfWeek: Record<string, number> = {};
    const byHourOfDay: Record<string, number> = {};
    const byTaskType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    timeEntries.forEach(entry => {
      const date = new Date(entry.start_time);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hourOfDay = date.getHours().toString();

      byDayOfWeek[dayOfWeek] = (byDayOfWeek[dayOfWeek] || 0) + entry.duration_minutes / 60;
      byHourOfDay[hourOfDay] = (byHourOfDay[hourOfDay] || 0) + entry.duration_minutes / 60;
    });

    return {
      by_day_of_week: byDayOfWeek,
      by_hour_of_day: byHourOfDay,
      by_task_type: byTaskType,
      by_priority: byPriority
    };
  }

  /**
   * Calculate time tracking trends
   */
  static async calculateTimeTrackingTrends(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeTrackingTrend[]> {
    try {
      // Get previous period data for comparison
      const periodLength = new Date(endDate).getTime() - new Date(startDate).getTime();
      const previousStartDate = new Date(new Date(startDate).getTime() - periodLength).toISOString();
      const previousEndDate = startDate;

      const currentEntries = await this.getTimeEntries(userId, { startDate, endDate });
      const previousEntries = await this.getTimeEntries(userId, { 
        startDate: previousStartDate, 
        endDate: previousEndDate 
      });

      const currentTotalHours = currentEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60;
      const previousTotalHours = previousEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60;

      const changePercentage = previousTotalHours > 0 
        ? ((currentTotalHours - previousTotalHours) / previousTotalHours) * 100 
        : 0;

      const trends: TimeTrackingTrend[] = [
        {
          metric: 'Total Hours',
          direction: changePercentage > 5 ? 'increasing' : changePercentage < -5 ? 'decreasing' : 'stable',
          change_percentage: Math.abs(changePercentage),
          period: 'week'
        }
      ];

      return trends;
    } catch (error) {
      console.error('Error calculating trends:', error);
      return [];
    }
  }

  /**
   * Calculate productivity score
   */
  static calculateProductivityScore(timeEntries: TimeEntry[], dailyAverageHours: number): number {
    if (timeEntries.length === 0) return 0;

    // Base score from daily average (0-50 points)
    const dailyScore = Math.min(dailyAverageHours / 8 * 50, 50);

    // Consistency bonus (0-30 points)
    const sessionCount = timeEntries.length;
    const consistencyScore = Math.min(sessionCount / 20 * 30, 30);

    // Session quality bonus (0-20 points)
    const averageSessionLength = timeEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / timeEntries.length / 60;
    const qualityScore = Math.min(averageSessionLength / 2 * 20, 20);

    return Math.round(dailyScore + consistencyScore + qualityScore);
  }

  /**
   * Get user time tracking settings
   */
  static async getTimeTrackingSettings(userId: string): Promise<TimeTrackingSettings | null> {
    try {
      const { data, error } = await supabase
        .from('time_tracking_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting time tracking settings:', error);
      return null;
    }
  }

  /**
   * Update user time tracking settings
   */
  static async updateTimeTrackingSettings(
    userId: string,
    settings: Partial<TimeTrackingSettings>
  ): Promise<TimeTrackingSettings> {
    try {
      const { data, error } = await supabase
        .from('time_tracking_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating time tracking settings:', error);
      throw new Error('Failed to update time tracking settings');
    }
  }

  /**
   * Generate time tracking report
   */
  static async generateTimeTrackingReport(
    userId: string,
    reportType: TimeTrackingReportType,
    startDate: string,
    endDate: string
  ): Promise<TimeTrackingReport> {
    try {
      const analytics = await this.getTimeTrackingAnalytics(userId, startDate, endDate);
      const taskBreakdown = await this.getTaskTimeBreakdown(userId, startDate, endDate);

      // Generate daily breakdown
      const dailyBreakdown: DailyTimeBreakdown[] = [];
      const currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);

      while (currentDate <= endDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayEntries = await this.getTimeEntries(userId, {
          startDate: `${dateStr}T00:00:00Z`,
          endDate: `${dateStr}T23:59:59Z`
        });

        const totalHours = dayEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60;
        const tasksCount = new Set(dayEntries.map(entry => entry.task_id)).size;

        dailyBreakdown.push({
          date: dateStr,
          total_hours: totalHours,
          entries_count: dayEntries.length,
          tasks_count: tasksCount,
          average_session_hours: dayEntries.length > 0 ? totalHours / dayEntries.length : 0
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Generate productivity metrics
      const productivityMetrics: ProductivityMetrics = {
        total_hours: analytics.total_hours,
        average_daily_hours: analytics.daily_average_hours,
        most_productive_day: Object.entries(analytics.time_distribution.by_day_of_week)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || '',
        most_productive_hour: parseInt(Object.entries(analytics.time_distribution.by_hour_of_day)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || '0'),
        longest_session_hours: Math.max(...analytics.top_tasks.map(task => task.total_hours), 0),
        shortest_session_hours: Math.min(...analytics.top_tasks.map(task => task.total_hours), 0),
        goal_completion_percentage: analytics.goal_completion_rate
      };

      // Generate insights
      const insights = this.generateTimeTrackingInsights(analytics, productivityMetrics);

      const reportData: TimeTrackingReportData = {
        daily_breakdown: dailyBreakdown,
        task_breakdown: taskBreakdown,
        productivity_metrics: productivityMetrics,
        insights: insights
      };

      // Save report
      const { data: report, error } = await supabase
        .from('time_tracking_reports')
        .insert({
          user_id: userId,
          report_type: reportType,
          report_period_start: startDate,
          report_period_end: endDate,
          total_hours: analytics.total_hours,
          total_entries: analytics.top_tasks.reduce((sum, task) => sum + task.entries_count, 0),
          tasks_tracked: analytics.top_tasks.length,
          report_data: reportData
        })
        .select()
        .single();

      if (error) throw error;
      return report;
    } catch (error) {
      console.error('Error generating time tracking report:', error);
      throw new Error('Failed to generate time tracking report');
    }
  }

  /**
   * Generate time tracking insights
   */
  static generateTimeTrackingInsights(
    analytics: TimeTrackingAnalytics,
    metrics: ProductivityMetrics
  ): TimeTrackingInsight[] {
    const insights: TimeTrackingInsight[] = [];

    // Goal completion insight
    if (metrics.goal_completion_percentage >= 100) {
      insights.push({
        type: 'achievement',
        title: 'Goal Achieved!',
        message: `You've exceeded your daily goal by ${Math.round(metrics.goal_completion_percentage - 100)}%`,
        priority: 'high',
        actionable: false
      });
    } else if (metrics.goal_completion_percentage < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Productivity',
        message: `You're only at ${Math.round(metrics.goal_completion_percentage)}% of your daily goal`,
        priority: 'high',
        actionable: true
      });
    }

    // Productivity trend insight
    const trend = analytics.trends.find(t => t.metric === 'Total Hours');
    if (trend) {
      if (trend.direction === 'increasing') {
        insights.push({
          type: 'achievement',
          title: 'Productivity Up!',
          message: `Your productivity has increased by ${Math.round(trend.change_percentage)}%`,
          priority: 'medium',
          actionable: false
        });
      } else if (trend.direction === 'decreasing') {
        insights.push({
          type: 'suggestion',
          title: 'Productivity Down',
          message: `Consider taking breaks or adjusting your schedule`,
          priority: 'medium',
          actionable: true
        });
      }
    }

    // Session length insight
    if (metrics.longest_session_hours > 4) {
      insights.push({
        type: 'suggestion',
        title: 'Long Sessions Detected',
        message: 'Consider taking regular breaks during long work sessions',
        priority: 'low',
        actionable: true
      });
    }

    return insights;
  }

  /**
   * Clean up expired sessions (called by cron job)
   */
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await supabase.rpc('stop_inactive_sessions');
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }
}
