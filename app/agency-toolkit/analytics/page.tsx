'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Users, 
  Code, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

interface ProductivityMetrics {
  dailyCommits: number
  weeklyCommits: number
  monthlyCommits: number
  averageCommitSize: number
  codeReviewTime: number
  deploymentFrequency: number
  leadTime: number
  mttr: number
  productivityScore: number
  trendDirection: 'up' | 'down' | 'stable'
}

interface PerformanceMetrics {
  buildTime: number
  testExecutionTime: number
  bundleSize: number
  lighthouseScore: number
  testCoverage: number
  performanceScore: number
  optimizationLevel: 'low' | 'medium' | 'high'
}

interface Recommendation {
  id: string
  title: string
  description: string
  category: 'performance' | 'productivity' | 'quality' | 'security'
  priority: 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  confidence: number
  estimatedSavings: string
  implementationSteps: string[]
}

export default function DevelopmentAnalyticsPage() {
  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetrics | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedTimeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Simulate API calls - in real implementation, these would call actual analytics services
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProductivityMetrics({
        dailyCommits: 12,
        weeklyCommits: 67,
        monthlyCommits: 234,
        averageCommitSize: 45,
        codeReviewTime: 2.5,
        deploymentFrequency: 8,
        leadTime: 4.2,
        mttr: 1.8,
        productivityScore: 87,
        trendDirection: 'up'
      })

      setPerformanceMetrics({
        buildTime: 2.3,
        testExecutionTime: 45,
        bundleSize: 1.2,
        lighthouseScore: 94,
        testCoverage: 89,
        performanceScore: 91,
        optimizationLevel: 'high'
      })

      setRecommendations([
        {
          id: 'perf-001',
          title: 'Optimize Bundle Size',
          description: 'Remove unused dependencies and implement code splitting to reduce bundle size by 15%',
          category: 'performance',
          priority: 'high',
          impact: 'high',
          effort: 'medium',
          confidence: 92,
          estimatedSavings: '2.3s load time',
          implementationSteps: [
            'Analyze bundle composition',
            'Remove unused dependencies',
            'Implement dynamic imports',
            'Configure webpack optimization'
          ]
        },
        {
          id: 'prod-002',
          title: 'Automate Code Reviews',
          description: 'Implement automated code review tools to reduce manual review time by 40%',
          category: 'productivity',
          priority: 'medium',
          impact: 'high',
          effort: 'low',
          confidence: 85,
          estimatedSavings: '1.5h per review',
          implementationSteps: [
            'Set up ESLint rules',
            'Configure SonarQube',
            'Implement automated PR checks',
            'Train team on new workflow'
          ]
        },
        {
          id: 'qual-003',
          title: 'Increase Test Coverage',
          description: 'Add unit tests for critical components to improve test coverage to 95%',
          category: 'quality',
          priority: 'medium',
          impact: 'medium',
          effort: 'high',
          confidence: 78,
          estimatedSavings: '30% fewer bugs',
          implementationSteps: [
            'Identify untested components',
            'Write unit tests',
            'Add integration tests',
            'Configure coverage reporting'
          ]
        }
      ])
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default: return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="h-4 w-4" />
      case 'productivity': return <Users className="h-4 w-4" />
      case 'quality': return <CheckCircle className="h-4 w-4" />
      case 'security': return <AlertTriangle className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Development Analytics</h1>
          <p className="text-muted-foreground">
            Monitor development productivity, performance, and optimization opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Time Range:</span>
        <div className="flex gap-1">
          {['1d', '7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Productivity Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
                {getTrendIcon(productivityMetrics?.trendDirection || 'stable')}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productivityMetrics?.productivityScore}%</div>
                <Progress value={productivityMetrics?.productivityScore} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  +5% from last week
                </p>
              </CardContent>
            </Card>

            {/* Performance Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics?.performanceScore}%</div>
                <Progress value={performanceMetrics?.performanceScore} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Lighthouse: {performanceMetrics?.lighthouseScore}
                </p>
              </CardContent>
            </Card>

            {/* Weekly Commits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Commits</CardTitle>
                <Code className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productivityMetrics?.weeklyCommits}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {productivityMetrics?.averageCommitSize} lines
                </p>
              </CardContent>
            </Card>

            {/* Active Recommendations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Recommendations</CardTitle>
                <Target className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recommendations.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {recommendations.filter(r => r.priority === 'high').length} high priority
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Productivity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Productivity trend chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Performance breakdown chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Productivity Tab */}
        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Commit Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Daily</span>
                  <span className="font-medium">{productivityMetrics?.dailyCommits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Weekly</span>
                  <span className="font-medium">{productivityMetrics?.weeklyCommits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly</span>
                  <span className="font-medium">{productivityMetrics?.monthlyCommits}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm">Avg Commit Size</span>
                  <span className="font-medium">{productivityMetrics?.averageCommitSize} lines</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Development Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Code Review Time</span>
                  <span className="font-medium">{productivityMetrics?.codeReviewTime}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Deployment Frequency</span>
                  <span className="font-medium">{productivityMetrics?.deploymentFrequency}/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Lead Time</span>
                  <span className="font-medium">{productivityMetrics?.leadTime} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">MTTR</span>
                  <span className="font-medium">{productivityMetrics?.mttr} hours</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Productivity Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center mb-4">
                  {productivityMetrics?.productivityScore}%
                </div>
                <Progress value={productivityMetrics?.productivityScore} className="mb-4" />
                <div className="text-sm text-muted-foreground text-center">
                  {productivityMetrics?.trendDirection === 'up' ? '↗ Improving' : 
                   productivityMetrics?.trendDirection === 'down' ? '↘ Declining' : '→ Stable'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Build Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Build Time</span>
                  <span className="font-medium">{performanceMetrics?.buildTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Test Execution</span>
                  <span className="font-medium">{performanceMetrics?.testExecutionTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bundle Size</span>
                  <span className="font-medium">{performanceMetrics?.bundleSize}MB</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Lighthouse Score</span>
                  <span className="font-medium">{performanceMetrics?.lighthouseScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Test Coverage</span>
                  <span className="font-medium">{performanceMetrics?.testCoverage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Optimization Level</span>
                  <Badge variant={performanceMetrics?.optimizationLevel === 'high' ? 'default' : 'secondary'}>
                    {performanceMetrics?.optimizationLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center mb-4">
                  {performanceMetrics?.performanceScore}%
                </div>
                <Progress value={performanceMetrics?.performanceScore} className="mb-4" />
                <div className="text-sm text-muted-foreground text-center">
                  Excellent performance
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Optimization Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered suggestions to improve development productivity and performance
              </p>
            </div>
            <Badge variant="outline">
              {recommendations.length} recommendations
            </Badge>
          </div>

          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(recommendation.category)}
                      <div>
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {recommendation.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                      <Badge variant="outline">
                        {recommendation.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Impact:</span>
                      <Badge variant="outline" className="ml-2">
                        {recommendation.impact}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Effort:</span>
                      <Badge variant="outline" className="ml-2">
                        {recommendation.effort}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Savings:</span>
                      <span className="ml-2 font-medium">{recommendation.estimatedSavings}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="secondary" className="ml-2">
                        {recommendation.category}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Implementation Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {recommendation.implementationSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm">Apply Recommendation</Button>
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}