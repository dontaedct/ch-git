import { createClient } from '@supabase/supabase-js';

// Client tracking interface definitions
export interface ClientActivity {
  id: string;
  clientId: string;
  activityType: 'consultation_started' | 'consultation_completed' | 'login' | 'logout' | 'template_accessed' | 'settings_changed' | 'payment_processed' | 'support_ticket';
  timestamp: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ClientSession {
  id: string;
  clientId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  actionsPerformed: number;
  conversionEvent?: string;
}

export interface ClientMetrics {
  clientId: string;
  totalSessions: number;
  totalDuration: number;
  averageSessionDuration: number;
  totalConsultations: number;
  completedConsultations: number;
  conversionRate: number;
  lastActivity: string;
  activityScore: number;
  engagementLevel: 'low' | 'medium' | 'high';
}

export interface ClientPerformance {
  clientId: string;
  period: string;
  consultationsGenerated: number;
  leadsConverted: number;
  revenue: number;
  averageRating: number;
  responseTime: number;
  uptime: number;
  errorRate: number;
}

export interface ClientAlert {
  id: string;
  clientId: string;
  type: 'performance_drop' | 'low_activity' | 'high_error_rate' | 'quota_exceeded' | 'payment_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

// Client tracking service class
export class ClientTracker {
  private supabase: any;

  constructor() {
    // Initialize Supabase client
    if (typeof window !== 'undefined') {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
    }
  }

  // Activity tracking methods
  async trackActivity(clientId: string, activityType: ClientActivity['activityType'], metadata?: Record<string, any>): Promise<void> {
    try {
      const activity: Omit<ClientActivity, 'id'> = {
        clientId,
        activityType,
        timestamp: new Date().toISOString(),
        metadata,
        sessionId: this.getCurrentSessionId(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        ipAddress: await this.getClientIP()
      };

      if (this.supabase) {
        await this.supabase
          .from('client_activities')
          .insert(activity);
      }

      // Store locally for offline support
      this.storeActivityLocally(activity);

      console.log('Activity tracked:', activity);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  // Session management methods
  async startSession(clientId: string): Promise<string> {
    try {
      const sessionId = this.generateSessionId();
      const session: Omit<ClientSession, 'id'> = {
        clientId,
        startTime: new Date().toISOString(),
        pageViews: 1,
        actionsPerformed: 0
      };

      if (this.supabase) {
        await this.supabase
          .from('client_sessions')
          .insert({ ...session, id: sessionId });
      }

      // Store session ID locally
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('clientSessionId', sessionId);
        sessionStorage.setItem('clientId', clientId);
      }

      await this.trackActivity(clientId, 'login', { sessionId });

      return sessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  async endSession(clientId: string, sessionId: string): Promise<void> {
    try {
      const endTime = new Date().toISOString();
      const session = await this.getSession(sessionId);

      if (session) {
        const duration = new Date(endTime).getTime() - new Date(session.startTime).getTime();

        if (this.supabase) {
          await this.supabase
            .from('client_sessions')
            .update({
              endTime,
              duration: Math.floor(duration / 1000) // Convert to seconds
            })
            .eq('id', sessionId);
        }
      }

      await this.trackActivity(clientId, 'logout', { sessionId, duration: session ? duration : 0 });

      // Clear local session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('clientSessionId');
        sessionStorage.removeItem('clientId');
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Metrics calculation methods
  async calculateClientMetrics(clientId: string, period: string = '30d'): Promise<ClientMetrics> {
    try {
      const endDate = new Date();
      const startDate = new Date();

      // Calculate start date based on period
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Get session data
      const sessions = await this.getClientSessions(clientId, startDate, endDate);
      const activities = await this.getClientActivities(clientId, startDate, endDate);

      // Calculate metrics
      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

      const consultationActivities = activities.filter(a =>
        a.activityType === 'consultation_started' || a.activityType === 'consultation_completed'
      );
      const totalConsultations = consultationActivities.filter(a => a.activityType === 'consultation_started').length;
      const completedConsultations = consultationActivities.filter(a => a.activityType === 'consultation_completed').length;
      const conversionRate = totalConsultations > 0 ? (completedConsultations / totalConsultations) * 100 : 0;

      const lastActivity = activities.length > 0 ? activities[activities.length - 1].timestamp : '';
      const activityScore = this.calculateActivityScore(activities, sessions);
      const engagementLevel = this.determineEngagementLevel(activityScore);

      return {
        clientId,
        totalSessions,
        totalDuration,
        averageSessionDuration,
        totalConsultations,
        completedConsultations,
        conversionRate,
        lastActivity,
        activityScore,
        engagementLevel
      };
    } catch (error) {
      console.error('Error calculating client metrics:', error);
      throw error;
    }
  }

  // Performance monitoring methods
  async trackPerformance(clientId: string, metrics: Partial<ClientPerformance>): Promise<void> {
    try {
      const performance: Omit<ClientPerformance, 'clientId'> = {
        period: metrics.period || 'daily',
        consultationsGenerated: metrics.consultationsGenerated || 0,
        leadsConverted: metrics.leadsConverted || 0,
        revenue: metrics.revenue || 0,
        averageRating: metrics.averageRating || 0,
        responseTime: metrics.responseTime || 0,
        uptime: metrics.uptime || 100,
        errorRate: metrics.errorRate || 0
      };

      if (this.supabase) {
        await this.supabase
          .from('client_performance')
          .insert({
            clientId,
            ...performance,
            timestamp: new Date().toISOString()
          });
      }

      // Check for performance alerts
      await this.checkPerformanceAlerts(clientId, { clientId, ...performance });
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }

  // Alert management methods
  async createAlert(alert: Omit<ClientAlert, 'id' | 'timestamp'>): Promise<void> {
    try {
      const newAlert: Omit<ClientAlert, 'id'> = {
        ...alert,
        timestamp: new Date().toISOString()
      };

      if (this.supabase) {
        await this.supabase
          .from('client_alerts')
          .insert(newAlert);
      }

      // Send notification (in real implementation, integrate with notification service)
      console.log('Alert created:', newAlert);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      if (this.supabase) {
        await this.supabase
          .from('client_alerts')
          .update({
            resolved: true,
            resolvedAt: new Date().toISOString()
          })
          .eq('id', alertId);
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  }

  // Data retrieval methods
  async getClientActivities(clientId: string, startDate?: Date, endDate?: Date): Promise<ClientActivity[]> {
    try {
      let query = this.supabase
        .from('client_activities')
        .select('*')
        .eq('clientId', clientId)
        .order('timestamp', { ascending: false });

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting client activities:', error);
      return [];
    }
  }

  async getClientSessions(clientId: string, startDate?: Date, endDate?: Date): Promise<ClientSession[]> {
    try {
      let query = this.supabase
        .from('client_sessions')
        .select('*')
        .eq('clientId', clientId)
        .order('startTime', { ascending: false });

      if (startDate) {
        query = query.gte('startTime', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('startTime', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting client sessions:', error);
      return [];
    }
  }

  async getClientAlerts(clientId: string, resolved: boolean = false): Promise<ClientAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from('client_alerts')
        .select('*')
        .eq('clientId', clientId)
        .eq('resolved', resolved)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting client alerts:', error);
      return [];
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentSessionId(): string | undefined {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('clientSessionId') || undefined;
    }
    return undefined;
  }

  private async getSession(sessionId: string): Promise<ClientSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('client_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  private async getClientIP(): Promise<string | undefined> {
    try {
      // In real implementation, use a service to get client IP
      return 'xxx.xxx.xxx.xxx'; // Placeholder for privacy
    } catch (error) {
      return undefined;
    }
  }

  private storeActivityLocally(activity: Omit<ClientActivity, 'id'>): void {
    try {
      if (typeof window !== 'undefined') {
        const storedActivities = localStorage.getItem('clientActivities');
        const activities = storedActivities ? JSON.parse(storedActivities) : [];
        activities.push({ ...activity, id: this.generateSessionId() });

        // Keep only last 100 activities locally
        const trimmedActivities = activities.slice(-100);
        localStorage.setItem('clientActivities', JSON.stringify(trimmedActivities));
      }
    } catch (error) {
      console.error('Error storing activity locally:', error);
    }
  }

  private calculateActivityScore(activities: ClientActivity[], sessions: ClientSession[]): number {
    // Calculate activity score based on various factors
    let score = 0;

    // Base score for each activity
    score += activities.length * 10;

    // Bonus for completed consultations
    const completedConsultations = activities.filter(a => a.activityType === 'consultation_completed').length;
    score += completedConsultations * 50;

    // Bonus for session duration
    const avgSessionDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length || 0;
    score += Math.min(avgSessionDuration / 60, 60); // Max 60 points for session duration

    // Recent activity bonus
    const recentActivities = activities.filter(a => {
      const activityDate = new Date(a.timestamp);
      const daysSinceActivity = (Date.now() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActivity <= 7;
    });
    score += recentActivities.length * 5;

    return Math.min(score, 1000); // Cap at 1000
  }

  private determineEngagementLevel(activityScore: number): 'low' | 'medium' | 'high' {
    if (activityScore >= 500) return 'high';
    if (activityScore >= 200) return 'medium';
    return 'low';
  }

  private async checkPerformanceAlerts(clientId: string, performance: ClientPerformance): Promise<void> {
    // Check for various performance thresholds and create alerts

    // Low conversion rate alert
    if (performance.leadsConverted / Math.max(performance.consultationsGenerated, 1) < 0.3) {
      await this.createAlert({
        clientId,
        type: 'performance_drop',
        severity: 'medium',
        message: 'Conversion rate has dropped below 30%',
        resolved: false
      });
    }

    // High error rate alert
    if (performance.errorRate > 5) {
      await this.createAlert({
        clientId,
        type: 'high_error_rate',
        severity: 'high',
        message: `Error rate is ${performance.errorRate}%, exceeding 5% threshold`,
        resolved: false
      });
    }

    // Low uptime alert
    if (performance.uptime < 99) {
      await this.createAlert({
        clientId,
        type: 'performance_drop',
        severity: 'critical',
        message: `Uptime is ${performance.uptime}%, below 99% SLA`,
        resolved: false
      });
    }

    // Slow response time alert
    if (performance.responseTime > 5000) { // 5 seconds
      await this.createAlert({
        clientId,
        type: 'performance_drop',
        severity: 'medium',
        message: `Response time is ${performance.responseTime}ms, exceeding 5s threshold`,
        resolved: false
      });
    }
  }

  // Public utility methods for components
  async getRealtimeMetrics(clientId: string): Promise<any> {
    try {
      const metrics = await this.calculateClientMetrics(clientId, '7d');
      const alerts = await this.getClientAlerts(clientId, false);
      const recentActivities = await this.getClientActivities(clientId);

      return {
        metrics,
        alerts: alerts.slice(0, 5), // Last 5 unresolved alerts
        recentActivities: recentActivities.slice(0, 10), // Last 10 activities
        status: alerts.some(a => a.severity === 'critical') ? 'critical' :
                alerts.some(a => a.severity === 'high') ? 'warning' : 'healthy'
      };
    } catch (error) {
      console.error('Error getting realtime metrics:', error);
      return null;
    }
  }

  // Batch operations for analytics
  async batchTrackActivities(activities: Omit<ClientActivity, 'id'>[]): Promise<void> {
    try {
      if (this.supabase && activities.length > 0) {
        await this.supabase
          .from('client_activities')
          .insert(activities);
      }
    } catch (error) {
      console.error('Error batch tracking activities:', error);
    }
  }

  // Export data for reporting
  async exportClientData(clientId: string, format: 'json' | 'csv' = 'json'): Promise<any> {
    try {
      const [activities, sessions, metrics, alerts] = await Promise.all([
        this.getClientActivities(clientId),
        this.getClientSessions(clientId),
        this.calculateClientMetrics(clientId, '90d'),
        this.getClientAlerts(clientId)
      ]);

      const exportData = {
        clientId,
        exportTimestamp: new Date().toISOString(),
        metrics,
        activities,
        sessions,
        alerts
      };

      if (format === 'csv') {
        // Convert to CSV format (simplified)
        return this.convertToCSV(exportData);
      }

      return exportData;
    } catch (error) {
      console.error('Error exporting client data:', error);
      throw error;
    }
  }

  private convertToCSV(data: any): string {
    // Simplified CSV conversion - in real implementation, use proper CSV library
    const headers = Object.keys(data);
    const csvContent = headers.join(',') + '\n' +
                      headers.map(header => JSON.stringify(data[header])).join(',');
    return csvContent;
  }
}