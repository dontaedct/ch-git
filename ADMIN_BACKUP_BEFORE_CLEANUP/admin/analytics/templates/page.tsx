'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Users, Clock, DollarSign, AlertTriangle, CheckCircle, Target, Zap } from 'lucide-react'

interface TemplatePerformanceMetrics {
  templateId: string
  templateName: string
  totalUsage: number
  successfulDeployments: number
  failedDeployments: number
  averageCustomizationTime: number
  averageDeploymentTime: number
  clientSatisfactionScore: number
  revenueGenerated: number
  popularCustomizations: string[]
  performanceScore: number
  trends: {
    usageGrowth: number
    performanceChange: number
    satisfactionTrend: number
  }
}

interface UsagePattern {
  period: string
  count: number
  events: any[]
}

interface CustomizationPattern {
  patternName: string
  frequency: number
  complexity: 'low' | 'medium' | 'high'
  successRate: number
}

interface OptimizationInsight {
  title: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  impact: {
    metric: string
    improvementPercentage: number
  }
  effort: 'low' | 'medium' | 'high'
}

export default function TemplateAnalyticsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('30d')
  const [performanceMetrics, setPerformanceMetrics] = useState<TemplatePerformanceMetrics[]>([])
  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([])
  const [customizationPatterns, setCustomizationPatterns] = useState<CustomizationPattern[]>([])
  const [optimizationInsights, setOptimizationInsights] = useState<OptimizationInsight[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock performance metrics
      setPerformanceMetrics([
        {
          templateId: 'template-1',
          templateName: 'E-commerce Starter',
          totalUsage: 45,
          successfulDeployments: 42,
          failedDeployments: 3,
          averageCustomizationTime: 25,
          averageDeploymentTime: 18,
          clientSatisfactionScore: 4.3,
          revenueGenerated: 125000,
          popularCustomizations: ['Brand Colors', 'Product Categories', 'Payment Integration'],
          performanceScore: 87,
          trends: {
            usageGrowth: 15,
            performanceChange: 8,
            satisfactionTrend: 5
          }
        },
        {
          templateId: 'template-2',
          templateName: 'SaaS Dashboard',
          totalUsage: 32,
          successfulDeployments: 30,
          failedDeployments: 2,
          averageCustomizationTime: 35,
          averageDeploymentTime: 22,
          clientSatisfactionScore: 4.1,
          revenueGenerated: 98000,
          popularCustomizations: ['User Roles', 'API Integration', 'Custom Metrics'],
          performanceScore: 82,
          trends: {
            usageGrowth: 8,
            performanceChange: -2,
            satisfactionTrend: 3
          }
        },
        {
          templateId: 'template-3',
          templateName: 'Portfolio Website',
          totalUsage: 28,
          successfulDeployments: 26,
          failedDeployments: 2,
          averageCustomizationTime: 15,
          averageDeploymentTime: 12,
          clientSatisfactionScore: 4.5,
          revenueGenerated: 42000,
          popularCustomizations: ['Gallery Layout', 'Contact Form', 'Social Links'],
          performanceScore: 91,
          trends: {
            usageGrowth: 22,
            performanceChange: 12,
            satisfactionTrend: 8
          }
        }
      ])

      // Mock usage patterns
      setUsagePatterns([
        { period: 'Week 1', count: 8, events: [] },
        { period: 'Week 2', count: 12, events: [] },
        { period: 'Week 3', count: 15, events: [] },
        { period: 'Week 4', count: 18, events: [] },
      ])

      // Mock customization patterns
      setCustomizationPatterns([
        { patternName: 'Brand Color Customization', frequency: 28, complexity: 'low', successRate: 0.96 },
        { patternName: 'Layout Modification', frequency: 22, complexity: 'medium', successRate: 0.91 },
        { patternName: 'API Integration', frequency: 18, complexity: 'high', successRate: 0.83 },
        { patternName: 'Content Personalization', frequency: 15, complexity: 'medium', successRate: 0.93 },
        { patternName: 'Feature Enhancement', frequency: 12, complexity: 'high', successRate: 0.75 }
      ])

      // Mock optimization insights
      setOptimizationInsights([
        {
          title: 'Reduce Deployment Time',
          priority: 'high',
          impact: { metric: 'Deployment Speed', improvementPercentage: 35 },
          effort: 'medium'
        },
        {
          title: 'Improve Success Rate',
          priority: 'critical',
          impact: { metric: 'Success Rate', improvementPercentage: 15 },
          effort: 'high'
        },
        {
          title: 'Enhance Documentation',
          priority: 'medium',
          impact: { metric: 'User Experience', improvementPercentage: 25 },
          effort: 'low'
        }
      ])

      setLoading(false)
    }

    fetchAnalytics()
  }, [selectedTemplate, timeRange])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalRevenue = performanceMetrics.reduce((sum, metric) => sum + metric.revenueGenerated, 0)
  const totalUsage = performanceMetrics.reduce((sum, metric) => sum + metric.totalUsage, 0)
  const avgSatisfaction = performanceMetrics.length > 0
    ? performanceMetrics.reduce((sum, metric) => sum + metric.clientSatisfactionScore, 0) / performanceMetrics.length
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading template analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Performance & Usage Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into template usage, customization patterns, and optimization opportunities
          </p>
        </div>

        <div className="flex gap-4">
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              <SelectItem value="template-1">E-commerce Starter</SelectItem>
              <SelectItem value="template-2">SaaS Dashboard</SelectItem>
              <SelectItem value="template-3">Portfolio Website</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.3</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">93.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-1.2%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
          <TabsTrigger value="insights">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Performance Scores</CardTitle>
                <CardDescription>Overall performance rating based on multiple metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="templateName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="performanceScore" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Usage</CardTitle>
                <CardDescription>Correlation between template usage and revenue generation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="templateName" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area yAxisId="left" type="monotone" dataKey="totalUsage" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area yAxisId="right" type="monotone" dataKey="revenueGenerated" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Performance Details</CardTitle>
              <CardDescription>Detailed metrics for each template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.templateId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{metric.templateName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-muted-foreground">
                        <div>Usage: {metric.totalUsage}</div>
                        <div>Success: {((metric.successfulDeployments / metric.totalUsage) * 100).toFixed(1)}%</div>
                        <div>Avg Deploy: {metric.averageDeploymentTime}m</div>
                        <div>Satisfaction: {metric.clientSatisfactionScore}/5</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{metric.performanceScore}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {metric.trends.usageGrowth > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm ${metric.trends.usageGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.trends.usageGrowth > 0 ? '+' : ''}{metric.trends.usageGrowth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Template usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usagePatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Customizations</CardTitle>
                <CardDescription>Most frequently requested customizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceMetrics[0]?.popularCustomizations.map((customization, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{customization}</span>
                      <Badge variant="secondary">{Math.floor(Math.random() * 20) + 10} uses</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Usage Comparison</CardTitle>
              <CardDescription>Comparative usage metrics across templates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceMetrics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="templateName" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="totalUsage" fill="#3b82f6" />
                  <Bar dataKey="successfulDeployments" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customization Patterns</CardTitle>
                <CardDescription>Analysis of customization frequency and complexity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customizationPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="patternName" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Complexity</CardTitle>
                <CardDescription>How complexity affects customization success</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customizationPatterns}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="successRate"
                      label={({ patternName, successRate }) => `${patternName}: ${(successRate * 100).toFixed(0)}%`}
                    >
                      {customizationPatterns.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getComplexityColor(entry.complexity)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customization Pattern Details</CardTitle>
              <CardDescription>Detailed analysis of each customization pattern</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customizationPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{pattern.patternName}</h4>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-muted-foreground">
                        <div>Frequency: {pattern.frequency}</div>
                        <div>Success Rate: {(pattern.successRate * 100).toFixed(1)}%</div>
                        <div>
                          Complexity:
                          <Badge
                            variant="outline"
                            className="ml-2"
                            style={{
                              borderColor: getComplexityColor(pattern.complexity),
                              color: getComplexityColor(pattern.complexity)
                            }}
                          >
                            {pattern.complexity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Insights</CardTitle>
              <CardDescription>AI-powered recommendations for template improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationInsights.map((insight, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge variant={getPriorityColor(insight.priority) as any}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>Metric: {insight.impact.metric}</div>
                        <div>Potential Improvement: {insight.impact.improvementPercentage}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {insight.effort} effort
                      </Badge>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Wins
                </CardTitle>
                <CardDescription>Low effort, high impact improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-medium text-green-800">Enhance Documentation</h5>
                    <p className="text-sm text-green-600 mt-1">25% improvement potential</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-800">Add Template Previews</h5>
                    <p className="text-sm text-blue-600 mt-1">30% improvement potential</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Strategic Opportunities
                </CardTitle>
                <CardDescription>High impact, long-term improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <h5 className="font-medium text-orange-800">AI-Powered Customization</h5>
                    <p className="text-sm text-orange-600 mt-1">50% improvement potential</p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h5 className="font-medium text-purple-800">Advanced Analytics</h5>
                    <p className="text-sm text-purple-600 mt-1">40% improvement potential</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Technical Debt
                </CardTitle>
                <CardDescription>Issues that need addressing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="font-medium text-red-800">Update Dependencies</h5>
                    <p className="text-sm text-red-600 mt-1">Security & performance impact</p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-medium text-yellow-800">Optimize Build Process</h5>
                    <p className="text-sm text-yellow-600 mt-1">Deployment time impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}