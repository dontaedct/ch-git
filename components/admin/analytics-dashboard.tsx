/**
 * @file Analytics Dashboard Components
 * @description Comprehensive analytics dashboard with charts, metrics, and insights
 * @author AI Assistant
 * @created 2025-09-20
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  Eye,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import { templateMetrics } from '@/lib/analytics/template-metrics';
import { usageTracking } from '@/lib/analytics/usage-tracking';

interface AnalyticsDashboardProps {
  timeRange: string;
  category?: string;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  orange: '#F97316',
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.purple, COLORS.pink, COLORS.teal];

export function AnalyticsDashboard({ timeRange, category }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<any>(null);
  const [chartData, setChartData] = useState<{
    usage: ChartData[];
    conversion: ChartData[];
    categories: ChartData[];
    devices: ChartData[];
    geographic: ChartData[];
    timeSeriesData: ChartData[];
  } | null>(null);
  const [metricCards, setMetricCards] = useState<MetricCard[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, category]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load usage overview
      const overview = await usageTracking.getUsageOverview(timeRange);
      setUsageData(overview);

      // Prepare chart data
      const usageChartData = overview.topTemplates.map((template: any) => ({
        name: template.templateName.length > 15 
          ? template.templateName.substring(0, 15) + '...' 
          : template.templateName,
        fullName: template.templateName,
        views: template.views,
        downloads: template.downloads,
        installs: template.installs,
        conversion: template.conversionRate,
      }));

      const conversionData = overview.topTemplates.slice(0, 5).map((template: any) => ({
        name: template.templateName.length > 10 
          ? template.templateName.substring(0, 10) + '...' 
          : template.templateName,
        fullName: template.templateName,
        conversionRate: template.conversionRate,
        views: template.views,
        downloads: template.downloads,
      }));

      const categoryData = overview.userSegments.map((segment: any) => ({
        name: segment.segment,
        value: segment.count,
        percentage: segment.percentage,
      }));

      // Mock device data
      const deviceData = [
        { name: 'Desktop', value: 45, icon: 'monitor' },
        { name: 'Mobile', value: 35, icon: 'smartphone' },
        { name: 'Tablet', value: 20, icon: 'tablet' },
      ];

      const geographicData = overview.geographicDistribution.slice(0, 8).map((geo: any) => ({
        name: geo.country,
        value: geo.count,
        percentage: geo.percentage,
      }));

      // Mock time series data for trends
      const timeSeriesData = generateTimeSeriesData(timeRange);

      setChartData({
        usage: usageChartData,
        conversion: conversionData,
        categories: categoryData,
        devices: deviceData,
        geographic: geographicData,
        timeSeriesData,
      });

      // Prepare metric cards
      const cards: MetricCard[] = [
        {
          title: 'Total Views',
          value: formatNumber(overview.totalViews),
          change: Math.random() * 20 - 10, // Mock change
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          icon: <Eye className="h-5 w-5" />,
          color: COLORS.primary,
        },
        {
          title: 'Total Downloads',
          value: formatNumber(overview.totalDownloads),
          change: overview.growthRate,
          changeType: overview.growthRate > 0 ? 'increase' : overview.growthRate < 0 ? 'decrease' : 'neutral',
          icon: <Download className="h-5 w-5" />,
          color: COLORS.secondary,
        },
        {
          title: 'Conversion Rate',
          value: `${overview.conversionRate.toFixed(1)}%`,
          change: Math.random() * 10 - 5, // Mock change
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          icon: <Target className="h-5 w-5" />,
          color: COLORS.accent,
        },
        {
          title: 'Active Sessions',
          value: formatNumber(overview.uniqueSessions),
          change: Math.random() * 15 - 7.5, // Mock change
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          icon: <Users className="h-5 w-5" />,
          color: COLORS.purple,
        },
      ];

      setMetricCards(cards);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const generateTimeSeriesData = (range: string): ChartData[] => {
    const days = range === '24h' ? 24 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data: ChartData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        name: range === '24h' 
          ? date.getHours().toString().padStart(2, '0') + ':00'
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        views: Math.floor(Math.random() * 500) + 100,
        downloads: Math.floor(Math.random() * 100) + 20,
        installs: Math.floor(Math.random() * 50) + 10,
      });
    }
    
    return data;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderMetricCard = (card: MetricCard, index: number) => (
    <Card key={index}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            <div className="flex items-center mt-2">
              {card.changeType === 'increase' ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : card.changeType === 'decrease' ? (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              ) : null}
              <p className={`text-xs ${
                card.changeType === 'increase' 
                  ? 'text-green-600' 
                  : card.changeType === 'decrease' 
                  ? 'text-red-600' 
                  : 'text-gray-600'
              }`}>
                {card.changeType !== 'neutral' && (
                  <>{Math.abs(card.change).toFixed(1)}% vs last period</>
                )}
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${card.color}15` }}>
            <div style={{ color: card.color }}>
              {card.icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map(renderMetricCard)}
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Trends Over Time
                </CardTitle>
                <CardDescription>
                  Template views, downloads, and installations over the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData?.timeSeriesData}>
                      <defs>
                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="downloadsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="installsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={formatNumber}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke={COLORS.primary}
                        fillOpacity={1}
                        fill="url(#viewsGradient)"
                        name="Views"
                      />
                      <Area
                        type="monotone"
                        dataKey="downloads"
                        stroke={COLORS.secondary}
                        fillOpacity={1}
                        fill="url(#downloadsGradient)"
                        name="Downloads"
                      />
                      <Area
                        type="monotone"
                        dataKey="installs"
                        stroke={COLORS.accent}
                        fillOpacity={1}
                        fill="url(#installsGradient)"
                        name="Installs"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Template Usage Comparison
                </CardTitle>
                <CardDescription>
                  Views, downloads, and installs by template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData?.usage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#666"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={formatNumber}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="views" fill={COLORS.primary} name="Views" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="downloads" fill={COLORS.secondary} name="Downloads" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="installs" fill={COLORS.accent} name="Installs" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Template Categories
                </CardTitle>
                <CardDescription>
                  Distribution of usage across template categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData?.categories}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        labelLine={false}
                      >
                        {chartData?.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Conversion Rates by Template
              </CardTitle>
              <CardDescription>
                How effectively templates convert views to downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData?.conversion} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      type="number" 
                      stroke="#666"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#666"
                      fontSize={12}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${value.toFixed(1)}%`, 
                        'Conversion Rate'
                      ]}
                      labelFormatter={(label) => {
                        const item = chartData?.conversion.find(d => d.name === label);
                        return item?.fullName || label;
                      }}
                    />
                    <Bar 
                      dataKey="conversionRate" 
                      fill={COLORS.accent}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Segments
                </CardTitle>
                <CardDescription>
                  Breakdown of users by organization type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData?.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}\n${percentage}%`}
                      >
                        {chartData?.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Device Usage
                </CardTitle>
                <CardDescription>
                  How users access templates across different devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData?.devices.map((device, index) => {
                    const IconComponent = device.icon === 'monitor' ? Monitor : 
                                        device.icon === 'smartphone' ? Smartphone : Tablet;
                    return (
                      <div key={device.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full" style={{ backgroundColor: `${CHART_COLORS[index]}15` }}>
                            <IconComponent className="h-5 w-5" style={{ color: CHART_COLORS[index] }} />
                          </div>
                          <span className="font-medium text-gray-900">{device.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${device.value}%`, 
                                backgroundColor: CHART_COLORS[index] 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                            {device.value}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>
                Template usage by country and region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData?.geographic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#666"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                      tickFormatter={formatNumber}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        formatNumber(value), 
                        'Usage Count'
                      ]}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={COLORS.teal}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
