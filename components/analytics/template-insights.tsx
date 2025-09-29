'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Clock, Users, Star, AlertCircle, CheckCircle, Lightbulb, Target, ArrowRight, Filter } from 'lucide-react'

interface TemplateInsight {
  id: string
  templateId: string
  type: 'performance' | 'usage' | 'customization' | 'revenue' | 'optimization'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: {
    metric: string
    currentValue: number
    potentialValue: number
    improvementPercentage: number
  }
  confidence: number
  trends: {
    period: string
    value: number
  }[]
  recommendations: {
    action: string
    effort: 'low' | 'medium' | 'high'
    timeline: string
    expectedOutcome: string
  }[]
  evidence: string[]
}

interface TemplatePerformanceData {
  templateId: string
  templateName: string
  category: string
  performanceScore: number
  usageCount: number
  satisfactionScore: number
  revenueGenerated: number
  conversionRate: number
  deploymentTime: number
  successRate: number
  insights: TemplateInsight[]
}

interface InsightsSummary {
  totalInsights: number
  criticalInsights: number
  quickWins: number
  strategicOpportunities: number
  potentialImpact: number
  implementationCost: number
}

export default function TemplateInsightsDashboard({ templateId }: { templateId?: string }) {
  const [templateData, setTemplateData] = useState<TemplatePerformanceData | null>(null)
  const [insights, setInsights] = useState<TemplateInsight[]>([])
  const [summary, setSummary] = useState<InsightsSummary | null>(null)
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock template data
      setTemplateData({
        templateId: templateId || 'template-1',
        templateName: 'E-commerce Starter',
        category: 'E-commerce',
        performanceScore: 87,
        usageCount: 45,
        satisfactionScore: 4.3,
        revenueGenerated: 125000,
        conversionRate: 0.82,
        deploymentTime: 18,
        successRate: 0.93,
        insights: []
      })

      // Mock insights
      const mockInsights: TemplateInsight[] = [
        {
          id: 'insight-1',
          templateId: templateId || 'template-1',
          type: 'performance',
          priority: 'high',
          title: 'Optimize Deployment Pipeline',
          description: 'Current deployment time of 18 minutes can be reduced by implementing caching and optimizing build process',
          impact: {
            metric: 'Deployment Time',
            currentValue: 18,
            potentialValue: 12,
            improvementPercentage: 33
          },
          confidence: 85,
          trends: [
            { period: 'Week 1', value: 20 },
            { period: 'Week 2', value: 19 },
            { period: 'Week 3', value: 18 },
            { period: 'Week 4', value: 18 }
          ],
          recommendations: [
            {
              action: 'Implement build caching',
              effort: 'low',
              timeline: '1 week',
              expectedOutcome: '20% reduction in build time'
            },
            {
              action: 'Optimize asset compilation',
              effort: 'medium',
              timeline: '2 weeks',
              expectedOutcome: '15% additional improvement'
            }
          ],
          evidence: [
            'Build process analysis shows 40% time spent on redundant operations',
            'Similar templates achieved 30% improvement with caching',
            'Client feedback indicates deployment speed is a key concern'
          ]
        },
        {
          id: 'insight-2',
          templateId: templateId || 'template-1',
          type: 'customization',
          priority: 'medium',
          title: 'Create Color Customization Preset',
          description: 'Brand color customization is the most requested feature (28 requests). Creating a preset could improve user experience',
          impact: {
            metric: 'Customization Efficiency',
            currentValue: 25,
            potentialValue: 10,
            improvementPercentage: 60
          },
          confidence: 92,
          trends: [
            { period: 'Week 1', value: 6 },
            { period: 'Week 2', value: 7 },
            { period: 'Week 3', value: 8 },
            { period: 'Week 4', value: 7 }
          ],
          recommendations: [
            {
              action: 'Create brand color preset library',
              effort: 'medium',
              timeline: '3 weeks',
              expectedOutcome: 'Reduce customization time by 60%'
            },
            {
              action: 'Add color picker integration',
              effort: 'low',
              timeline: '1 week',
              expectedOutcome: 'Improve user experience'
            }
          ],
          evidence: [
            '28 out of 45 deployments requested brand color changes',
            'Average customization time for colors is 25 minutes',
            'Industry standards show 10-minute average for preset systems'
          ]
        },
        {
          id: 'insight-3',
          templateId: templateId || 'template-1',
          type: 'revenue',
          priority: 'critical',
          title: 'Implement Premium Feature Tier',
          description: 'Template revenue per deployment ($2,778) is below industry average. Adding premium features could increase value',
          impact: {
            metric: 'Revenue per Deployment',
            currentValue: 2778,
            potentialValue: 4000,
            improvementPercentage: 44
          },
          confidence: 78,
          trends: [
            { period: 'Q1', value: 2500 },
            { period: 'Q2', value: 2600 },
            { period: 'Q3', value: 2700 },
            { period: 'Q4', value: 2778 }
          ],
          recommendations: [
            {
              action: 'Add advanced analytics module',
              effort: 'high',
              timeline: '6 weeks',
              expectedOutcome: '$800-1200 additional revenue per deployment'
            },
            {
              action: 'Create premium support package',
              effort: 'low',
              timeline: '1 week',
              expectedOutcome: '$200-400 additional revenue per deployment'
            }
          ],
          evidence: [
            'Industry average for similar templates is $4,000+',
            'Client surveys show 70% willing to pay for advanced features',
            'Competitor analysis shows successful premium tiers'
          ]
        }
      ]

      setInsights(mockInsights)

      // Mock summary
      setSummary({
        totalInsights: mockInsights.length,
        criticalInsights: mockInsights.filter(i => i.priority === 'critical').length,
        quickWins: mockInsights.filter(i => i.recommendations.some(r => r.effort === 'low')).length,
        strategicOpportunities: mockInsights.filter(i => i.impact.improvementPercentage > 40).length,
        potentialImpact: mockInsights.reduce((sum, i) => sum + i.impact.improvementPercentage, 0),
        implementationCost: 150000
      })

      setLoading(false)
    }

    fetchInsights()
  }, [templateId])

  const filteredInsights = selectedInsightType === 'all'
    ? insights
    : insights.filter(insight => insight.type === selectedInsightType)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Activity className="h-4 w-4" />
      case 'usage': return <Users className="h-4 w-4" />
      case 'customization': return <Star className="h-4 w-4" />
      case 'revenue': return <TrendingUp className="h-4 w-4" />
      case 'optimization': return <Target className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading template insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Template Overview */}
      {templateData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{templateData.templateName}</CardTitle>
                <CardDescription>
                  {templateData.category} • Performance Score: {templateData.performanceScore}/100
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {templateData.performanceScore}/100
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{templateData.usageCount}</div>
                <div className="text-sm text-muted-foreground">Total Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{templateData.satisfactionScore}</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(templateData.revenueGenerated)}</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(templateData.conversionRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Conversion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{templateData.deploymentTime}m</div>
                <div className="text-sm text-muted-foreground">Deploy Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(templateData.successRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{summary.totalInsights}</div>
                  <div className="text-sm text-muted-foreground">Total Insights</div>
                </div>
                <Lightbulb className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{summary.criticalInsights}</div>
                  <div className="text-sm text-muted-foreground">Critical Issues</div>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{summary.quickWins}</div>
                  <div className="text-sm text-muted-foreground">Quick Wins</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{summary.strategicOpportunities}</div>
                  <div className="text-sm text-muted-foreground">Strategic Ops</div>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{summary.potentialImpact.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Potential Impact</div>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Template Insights
          </CardTitle>
          <CardDescription>AI-powered insights and recommendations for template optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedInsightType} onValueChange={setSelectedInsightType}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="customization">Customization</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-6">
              {filteredInsights.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getTypeIcon(insight.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{insight.title}</h3>
                          <p className="text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getPriorityColor(insight.priority)} border`}>
                          {insight.priority}
                        </Badge>
                        <div className="text-center">
                          <div className="text-sm font-medium">{insight.confidence}%</div>
                          <div className="text-xs text-muted-foreground">Confidence</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Impact Metrics */}
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Impact Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Metric:</span>
                              <span className="font-medium">{insight.impact.metric}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Current:</span>
                              <span className="font-medium">
                                {insight.impact.metric.includes('Revenue') || insight.impact.metric.includes('Cost')
                                  ? formatCurrency(insight.impact.currentValue)
                                  : insight.impact.currentValue.toFixed(1)
                                }
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Potential:</span>
                              <span className="font-medium text-green-600">
                                {insight.impact.metric.includes('Revenue') || insight.impact.metric.includes('Cost')
                                  ? formatCurrency(insight.impact.potentialValue)
                                  : insight.impact.potentialValue.toFixed(1)
                                }
                              </span>
                            </div>
                            <div className="pt-2">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Improvement:</span>
                                <span className="font-bold text-green-600">
                                  +{insight.impact.improvementPercentage.toFixed(0)}%
                                </span>
                              </div>
                              <Progress
                                value={Math.min(insight.impact.improvementPercentage, 100)}
                                className="h-2"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Trend Analysis */}
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Trend Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ResponsiveContainer width="100%" height={120}>
                            <LineChart data={insight.trends}>
                              <XAxis dataKey="period" fontSize={10} />
                              <YAxis fontSize={10} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Recommendations */}
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {insight.recommendations.map((rec, index) => (
                              <div key={index} className="p-3 bg-background rounded border">
                                <div className="font-medium text-sm mb-1">{rec.action}</div>
                                <div className="text-xs text-muted-foreground mb-2">
                                  {rec.timeline} • {rec.effort} effort
                                </div>
                                <div className="text-xs text-green-600">{rec.expectedOutcome}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Evidence */}
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Supporting Evidence:</h4>
                      <ul className="space-y-1">
                        {insight.evidence.map((evidence, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">
                        Implement
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}