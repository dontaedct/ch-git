/**
 * Template Analytics Component
 * 
 * Tracks template usage, performance metrics, and provides insights
 * for optimization and improvement.
 */

import React, { useState, useEffect, useCallback } from 'react';
// TODO: Re-enable when template-engine is implemented
// import { getRouteGenerator } from '../../lib/template-engine/route-generator';
// import { getTemplateStorage } from '../../lib/template-storage/TemplateStorage';
import { TemplateManifest } from '../../types/componentContracts';

// Temporary stubs for MVP
const getRouteGenerator = () => ({
  getTemplateRoutes: () => []
});
const getTemplateStorage = () => ({
  getTemplate: () => null
});

interface TemplateAnalyticsProps {
  template: TemplateManifest;
  tenantId: string;
  onClose: () => void;
}

interface AnalyticsData {
  usage: {
    totalViews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  performance: {
    avgLoadTime: number;
    coreWebVitals: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
    };
    accessibilityScore: number;
    seoScore: number;
  };
  components: {
    componentType: string;
    usageCount: number;
    avgRenderTime: number;
    errorRate: number;
  }[];
  routes: {
    routeId: string;
    path: string;
    views: number;
    avgLoadTime: number;
    seoScore: number;
  }[];
  trends: {
    date: string;
    views: number;
    loadTime: number;
    errors: number;
  }[];
}

interface ComponentUsage {
  [componentType: string]: {
    count: number;
    avgRenderTime: number;
    errorRate: number;
    lastUsed: string;
  };
}

export const TemplateAnalytics: React.FC<TemplateAnalyticsProps> = ({
  template,
  tenantId,
  onClose
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const routeGenerator = getRouteGenerator();
  const templateStorage = getTemplateStorage();

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get routes for this template
      const routes = routeGenerator.getTemplateRoutes(template.id);
      const routeAnalytics = routeGenerator.getRouteAnalytics(tenantId);

      // Mock analytics data (in real implementation, this would come from analytics service)
      const mockAnalytics: AnalyticsData = {
        usage: {
          totalViews: Math.floor(Math.random() * 10000) + 1000,
          uniqueVisitors: Math.floor(Math.random() * 5000) + 500,
          avgSessionDuration: Math.floor(Math.random() * 300) + 60, // seconds
          bounceRate: Math.random() * 0.5 + 0.2, // 20-70%
          conversionRate: Math.random() * 0.1 + 0.02 // 2-12%
        },
        performance: {
          avgLoadTime: Math.floor(Math.random() * 2000) + 500, // ms
          coreWebVitals: {
            lcp: Math.floor(Math.random() * 2000) + 1000, // ms
            fid: Math.floor(Math.random() * 100) + 10, // ms
            cls: Math.random() * 0.2 + 0.05 // 0.05-0.25
          },
          accessibilityScore: Math.floor(Math.random() * 20) + 80, // 80-100
          seoScore: Math.floor(Math.random() * 20) + 80 // 80-100
        },
        components: template.components.map(comp => ({
          componentType: comp.type,
          usageCount: Math.floor(Math.random() * 1000) + 100,
          avgRenderTime: Math.floor(Math.random() * 50) + 10, // ms
          errorRate: Math.random() * 0.05 + 0.001 // 0.1-5%
        })),
        routes: routes.map(route => ({
          routeId: route.id,
          path: route.path,
          views: Math.floor(Math.random() * 1000) + 50,
          avgLoadTime: route.metadata.estimatedLoadTime,
          seoScore: Math.floor(Math.random() * 20) + 80
        })),
        trends: Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return {
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 100) + 10,
            loadTime: Math.floor(Math.random() * 1000) + 500,
            errors: Math.floor(Math.random() * 10)
          };
        })
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [template.id, template.components, tenantId, routeGenerator]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Format percentage
  const formatPercentage = (num: number): string => {
    return (num * 100).toFixed(1) + '%';
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  // Get performance color
  const getPerformanceColor = (score: number, type: 'score' | 'time' = 'score'): string => {
    if (type === 'time') {
      if (score < 1000) return 'text-green-600';
      if (score < 2000) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={loadAnalytics}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Template Analytics</h2>
              <p className="text-sm text-gray-600 mt-1">{template.name} - Performance & Usage Insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-blue-600 text-2xl mr-3">👁️</div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Views</p>
                  <p className="text-2xl font-bold text-blue-900">{formatNumber(analytics.usage.totalViews)}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-green-600 text-2xl mr-3">👥</div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Unique Visitors</p>
                  <p className="text-2xl font-bold text-green-900">{formatNumber(analytics.usage.uniqueVisitors)}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-yellow-600 text-2xl mr-3">⏱️</div>
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Avg Load Time</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(analytics.performance.avgLoadTime, 'time')}`}>
                    {analytics.performance.avgLoadTime}ms
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-purple-600 text-2xl mr-3">📊</div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Conversion Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{formatPercentage(analytics.usage.conversionRate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Core Web Vitals</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Largest Contentful Paint</span>
                  <span className={`font-medium ${getPerformanceColor(analytics.performance.coreWebVitals.lcp, 'time')}`}>
                    {analytics.performance.coreWebVitals.lcp}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">First Input Delay</span>
                  <span className={`font-medium ${getPerformanceColor(analytics.performance.coreWebVitals.fid, 'time')}`}>
                    {analytics.performance.coreWebVitals.fid}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cumulative Layout Shift</span>
                  <span className={`font-medium ${getPerformanceColor(analytics.performance.coreWebVitals.cls * 100, 'score')}`}>
                    {analytics.performance.coreWebVitals.cls.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quality Scores</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accessibility Score</span>
                  <span className={`font-medium ${getPerformanceColor(analytics.performance.accessibilityScore)}`}>
                    {analytics.performance.accessibilityScore}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">SEO Score</span>
                  <span className={`font-medium ${getPerformanceColor(analytics.performance.seoScore)}`}>
                    {analytics.performance.seoScore}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bounce Rate</span>
                  <span className="font-medium text-gray-900">{formatPercentage(analytics.usage.bounceRate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Component Usage */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Component Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Render Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Error Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.components.map((component, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {component.componentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(component.usageCount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {component.avgRenderTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPercentage(component.errorRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Route Performance */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Route Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Load Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SEO Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.routes.map((route) => (
                    <tr key={route.routeId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {route.path}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(route.views)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {route.avgLoadTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`font-medium ${getPerformanceColor(route.seoScore)}`}>
                          {route.seoScore}/100
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateAnalytics;
