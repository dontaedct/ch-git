/**
 * @fileoverview Analytics hooks for real-time metrics and KPIs tracking
 * Provides comprehensive analytics data management and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';

export interface AnalyticsMetrics {
  totalSubmissions: number;
  totalConversions: number;
  totalRevenue: number;
  totalVisitors: number;
  conversionRate: number;
  avgBounceRate: number;
  avgSessionTime: number;
  activeUsers: number;
  submissionsToday: number;
  avgResponseTime: number;
}

export interface TimeSeriesData {
  date: string;
  submissions: number;
  conversions: number;
  revenue: number;
  visitors: number;
  bounceRate: number;
  avgSessionTime: number;
}

export interface RealTimeMetrics {
  activeUsers: number;
  submissionsToday: number;
  conversionRate: number;
  avgResponseTime: number;
  lastUpdated: Date;
}

export interface ConversionFunnel {
  step: string;
  count: number;
  percentage: number;
  dropoffRate?: number;
}

export interface TrafficSource {
  source: string;
  percentage: number;
  count: number;
  conversionRate: number;
}

export interface DeviceBreakdown {
  device: string;
  percentage: number;
  count: number;
  conversionRate: number;
}

export interface TopPage {
  page: string;
  views: number;
  conversions: number;
  rate: number;
  bounceRate: number;
  avgTimeOnPage: number;
}

export interface AnalyticsFilters {
  timeRange: '24h' | '7d' | '30d' | '90d';
  dateFrom?: string;
  dateTo?: string;
  appId?: string;
  source?: string;
  device?: string;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  timeSeries: TimeSeriesData[];
  realTime: RealTimeMetrics;
  conversionFunnel: ConversionFunnel[];
  trafficSources: TrafficSource[];
  deviceBreakdown: DeviceBreakdown[];
  topPages: TopPage[];
  lastUpdated: Date;
}

/**
 * Hook for managing analytics data with real-time updates
 */
export function useAnalytics(filters: AnalyticsFilters = { timeRange: '7d' }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Generate mock data for demonstration
  const generateMockData = useCallback((filters: AnalyticsFilters): AnalyticsData => {
    const now = new Date();
    const days = filters.timeRange === '24h' ? 1 : 
                 filters.timeRange === '7d' ? 7 : 
                 filters.timeRange === '30d' ? 30 : 90;
    
    const timeSeries: TimeSeriesData[] = Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      if (filters.timeRange === '24h') {
        date.setHours(date.getHours() - (23 - i));
        return {
          date: date.toISOString(),
          submissions: Math.floor(Math.random() * 20) + 5,
          conversions: Math.floor(Math.random() * 8) + 2,
          revenue: Math.floor(Math.random() * 500) + 100,
          visitors: Math.floor(Math.random() * 100) + 20,
          bounceRate: Math.random() * 0.4 + 0.2,
          avgSessionTime: Math.floor(Math.random() * 300) + 120
        };
      } else {
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toISOString().split('T')[0],
          submissions: Math.floor(Math.random() * 50) + 10,
          conversions: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 1000) + 200,
          visitors: Math.floor(Math.random() * 200) + 50,
          bounceRate: Math.random() * 0.4 + 0.2,
          avgSessionTime: Math.floor(Math.random() * 300) + 120
        };
      }
    });

    const totalSubmissions = timeSeries.reduce((sum, item) => sum + item.submissions, 0);
    const totalConversions = timeSeries.reduce((sum, item) => sum + item.conversions, 0);
    const totalRevenue = timeSeries.reduce((sum, item) => sum + item.revenue, 0);
    const totalVisitors = timeSeries.reduce((sum, item) => sum + item.visitors, 0);
    const avgBounceRate = timeSeries.reduce((sum, item) => sum + item.bounceRate, 0) / timeSeries.length;
    const avgSessionTime = timeSeries.reduce((sum, item) => sum + item.avgSessionTime, 0) / timeSeries.length;
    const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

    return {
      metrics: {
        totalSubmissions,
        totalConversions,
        totalRevenue,
        totalVisitors,
        conversionRate,
        avgBounceRate,
        avgSessionTime,
        activeUsers: Math.floor(Math.random() * 50) + 10,
        submissionsToday: Math.floor(Math.random() * 20) + 5,
        avgResponseTime: Math.floor(Math.random() * 100) + 100
      },
      timeSeries,
      realTime: {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        submissionsToday: Math.floor(Math.random() * 20) + 5,
        conversionRate: Math.random() * 2 + 2,
        avgResponseTime: Math.floor(Math.random() * 100) + 100,
        lastUpdated: new Date()
      },
      conversionFunnel: [
        { step: "Visitors", count: totalVisitors, percentage: 100 },
        { step: "Engaged", count: Math.floor(totalVisitors * 0.6), percentage: 60, dropoffRate: 40 },
        { step: "Interested", count: Math.floor(totalVisitors * 0.3), percentage: 30, dropoffRate: 50 },
        { step: "Converted", count: totalConversions, percentage: conversionRate, dropoffRate: 100 - conversionRate }
      ],
      trafficSources: [
        { source: 'Direct', percentage: 45, count: Math.floor(totalVisitors * 0.45), conversionRate: 3.2 },
        { source: 'Google', percentage: 30, count: Math.floor(totalVisitors * 0.30), conversionRate: 2.8 },
        { source: 'Social Media', percentage: 15, count: Math.floor(totalVisitors * 0.15), conversionRate: 1.5 },
        { source: 'Email', percentage: 10, count: Math.floor(totalVisitors * 0.10), conversionRate: 4.1 }
      ],
      deviceBreakdown: [
        { device: 'Desktop', percentage: 65, count: Math.floor(totalVisitors * 0.65), conversionRate: 3.5 },
        { device: 'Mobile', percentage: 28, count: Math.floor(totalVisitors * 0.28), conversionRate: 2.1 },
        { device: 'Tablet', percentage: 7, count: Math.floor(totalVisitors * 0.07), conversionRate: 2.8 }
      ],
      topPages: [
        { page: '/lead-form', views: 1250, conversions: 45, rate: 3.6, bounceRate: 0.25, avgTimeOnPage: 180 },
        { page: '/consultation', views: 980, conversions: 32, rate: 3.3, bounceRate: 0.30, avgTimeOnPage: 240 },
        { page: '/contact', views: 750, conversions: 18, rate: 2.4, bounceRate: 0.35, avgTimeOnPage: 120 },
        { page: '/about', views: 650, conversions: 8, rate: 1.2, bounceRate: 0.45, avgTimeOnPage: 90 },
        { page: '/pricing', views: 420, conversions: 15, rate: 3.6, bounceRate: 0.40, avgTimeOnPage: 200 }
      ],
      lastUpdated: new Date()
    };
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (filters: AnalyticsFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const analyticsData = generateMockData(filters);
      setData(analyticsData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [generateMockData]);

  // Update real-time metrics
  const updateRealTimeMetrics = useCallback(() => {
    if (!data) return;
    
    setData(prev => prev ? {
      ...prev,
      realTime: {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        submissionsToday: Math.floor(Math.random() * 20) + 5,
        conversionRate: Math.random() * 2 + 2,
        avgResponseTime: Math.floor(Math.random() * 100) + 100,
        lastUpdated: new Date()
      },
      lastUpdated: new Date()
    } : null);
  }, [data]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics(filters);
  }, [fetchAnalytics, filters]);

  // Real-time updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(updateRealTimeMetrics, 5000);
    return () => clearInterval(interval);
  }, [updateRealTimeMetrics]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchAnalytics(filters);
  }, [fetchAnalytics, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    fetchAnalytics(updatedFilters);
  }, [filters, fetchAnalytics]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh,
    updateFilters,
    filters
  };
}

/**
 * Hook for tracking specific KPIs with real-time updates
 */
export function useKPIs() {
  const [kpis, setKpis] = useState<{
    conversionRate: number;
    avgOrderValue: number;
    customerLifetimeValue: number;
    churnRate: number;
    netPromoterScore: number;
    lastUpdated: Date;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setKpis({
          conversionRate: Math.random() * 5 + 2,
          avgOrderValue: Math.random() * 200 + 100,
          customerLifetimeValue: Math.random() * 1000 + 500,
          churnRate: Math.random() * 10 + 5,
          netPromoterScore: Math.random() * 40 + 30,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Failed to fetch KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
    
    // Update KPIs every 30 seconds
    const interval = setInterval(fetchKPIs, 30000);
    return () => clearInterval(interval);
  }, []);

  return { kpis, loading };
}

/**
 * Hook for conversion tracking and funnel analysis
 */
export function useConversionTracking(appId?: string) {
  const [funnelData, setFunnelData] = useState<ConversionFunnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunnelData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const mockFunnelData: ConversionFunnel[] = [
          { step: "Visitors", count: 1000, percentage: 100 },
          { step: "Page Views", count: 800, percentage: 80, dropoffRate: 20 },
          { step: "Form Starts", count: 400, percentage: 40, dropoffRate: 50 },
          { step: "Form Completions", count: 200, percentage: 20, dropoffRate: 50 },
          { step: "Conversions", count: 50, percentage: 5, dropoffRate: 75 }
        ];
        
        setFunnelData(mockFunnelData);
      } catch (error) {
        console.error('Failed to fetch funnel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunnelData();
  }, [appId]);

  return { funnelData, loading };
}

/**
 * Hook for real-time event tracking
 */
export function useRealTimeEvents() {
  const [events, setEvents] = useState<Array<{
    id: string;
    type: 'submission' | 'conversion' | 'page_view' | 'error';
    timestamp: Date;
    data: any;
  }>>([]);

  useEffect(() => {
    // Simulate real-time events
    const interval = setInterval(() => {
      const eventTypes: Array<'submission' | 'conversion' | 'page_view' | 'error'> = 
        ['submission', 'conversion', 'page_view', 'error'];
      
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: randomType,
        timestamp: new Date(),
        data: {
          page: '/lead-form',
          userAgent: 'Mozilla/5.0...',
          ip: '192.168.1.1'
        }
      };
      
      setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { events };
}
