'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle,
  CheckCircle,
  Zap,
  Users,
  Target,
  TrendingUp,
  Clock,
  Lightbulb,
  BarChart3,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Star,
  Bookmark,
  Share,
  Download,
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

interface OptimizationRecommendation {
  id: string
  title: string
  description: string
  category: 'performance' | 'productivity' | 'quality' | 'security' | 'cost'
  priority: 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  confidence: number
  estimatedSavings: string
  estimatedTimeToImplement: string
  implementationSteps: string[]
  prerequisites: string[]
  relatedMetrics: string[]
  tags: string[]
  createdAt: Date
  lastUpdated: Date
  applied: boolean
  appliedAt?: Date
  dismissed: boolean
  dismissedAt?: Date
  userRating?: number
  implementationProgress?: number
}

interface RecommendationFilters {
  category: string[]
  priority: string[]
  impact: string[]
  effort: string[]
  applied: boolean | null
  dismissed: boolean | null
}

interface RecommendationSort {
  field: 'priority' | 'impact' | 'confidence' | 'createdAt' | 'estimatedSavings'
  direction: 'asc' | 'desc'
}

export default function OptimizationRecommendations() {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [filteredRecommendations, setFilteredRecommendations] = useState<OptimizationRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<RecommendationFilters>({
    category: [],
    priority: [],
    impact: [],
    effort: [],
    applied: null,
    dismissed: null
  })
  const [sort, setSort] = useState<RecommendationSort>({
    field: 'priority',
    direction: 'desc'
  })
  const [selectedRecommendation, setSelectedRecommendation] = useState<OptimizationRecommendation | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [recommendations, searchTerm, filters, sort])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      // Simulate API call - in real implementation, this would call the analytics service
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const sampleRecommendations: OptimizationRecommendation[] = [
        {
          id: 'rec-001',
          title: 'Optimize Bundle Size',
          description: 'Remove unused dependencies and implement code splitting to reduce bundle size by 15% and improve loading performance',
          category: 'performance',
          priority: 'high',
          impact: 'high',
          effort: 'medium',
          confidence: 92,
          estimatedSavings: '2.3s load time reduction',
          estimatedTimeToImplement: '4-6 hours',
          implementationSteps: [
            'Analyze current bundle composition using webpack-bundle-analyzer',
            'Identify and remove unused dependencies',
            'Implement dynamic imports for route-based code splitting',
            'Configure webpack optimization settings',
            'Test and validate performance improvements'
          ],
          prerequisites: [
            'Access to webpack configuration',
            'Understanding of current application structure',
            'Performance testing environment'
          ],
          relatedMetrics: ['bundle_size', 'load_time', 'lighthouse_score'],
          tags: ['webpack', 'performance', 'optimization', 'bundle'],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
          applied: false,
          dismissed: false
        },
        {
          id: 'rec-002',
          title: 'Implement Automated Code Reviews',
          description: 'Set up automated code review tools to reduce manual review time by 40% and improve code quality consistency',
          category: 'productivity',
          priority: 'medium',
          impact: 'high',
          effort: 'low',
          confidence: 85,
          estimatedSavings: '1.5h per review cycle',
          estimatedTimeToImplement: '2-3 hours',
          implementationSteps: [
            'Configure ESLint with custom rules for code quality',
            'Set up SonarQube for code analysis',
            'Implement automated PR checks in CI/CD pipeline',
            'Train team on new automated review workflow',
            'Monitor and adjust rules based on team feedback'
          ],
          prerequisites: [
            'CI/CD pipeline access',
            'Team training time',
            'ESLint configuration knowledge'
          ],
          relatedMetrics: ['code_review_time', 'code_quality_score', 'bug_rate'],
          tags: ['automation', 'code-quality', 'ci-cd', 'productivity'],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
          applied: false,
          dismissed: false
        },
        {
          id: 'rec-003',
          title: 'Increase Test Coverage',
          description: 'Add comprehensive unit and integration tests to improve test coverage from 75% to 95% and reduce production bugs',
          category: 'quality',
          priority: 'medium',
          impact: 'medium',
          effort: 'high',
          confidence: 78,
          estimatedSavings: '30% reduction in production bugs',
          estimatedTimeToImplement: '2-3 days',
          implementationSteps: [
            'Audit current test coverage and identify gaps',
            'Write unit tests for critical business logic',
            'Add integration tests for API endpoints',
            'Implement end-to-end tests for key user flows',
            'Set up coverage reporting and quality gates'
          ],
          prerequisites: [
            'Testing framework knowledge',
            'Understanding of application architecture',
            'Access to testing environments'
          ],
          relatedMetrics: ['test_coverage', 'bug_rate', 'code_quality'],
          tags: ['testing', 'quality', 'automation', 'coverage'],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
          applied: false,
          dismissed: false
        },
        {
          id: 'rec-004',
          title: 'Implement Caching Strategy',
          description: 'Add Redis caching for frequently accessed data to reduce database load and improve response times by 40%',
          category: 'performance',
          priority: 'high',
          impact: 'high',
          effort: 'medium',
          confidence: 88,
          estimatedSavings: '40% faster response times',
          estimatedTimeToImplement: '1-2 days',
          implementationSteps: [
            'Analyze current database query patterns',
            'Identify frequently accessed data suitable for caching',
            'Set up Redis infrastructure',
            'Implement caching layer in application',
            'Configure cache invalidation strategies',
            'Monitor cache hit rates and performance'
          ],
          prerequisites: [
            'Redis infrastructure setup',
            'Application architecture understanding',
            'Database query analysis skills'
          ],
          relatedMetrics: ['response_time', 'database_load', 'cache_hit_rate'],
          tags: ['caching', 'performance', 'redis', 'database'],
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000),
          applied: true,
          appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          implementationProgress: 75
        },
        {
          id: 'rec-005',
          title: 'Optimize Database Queries',
          description: 'Add database indexes and optimize slow queries to improve query performance by 60%',
          category: 'performance',
          priority: 'medium',
          impact: 'high',
          effort: 'high',
          confidence: 82,
          estimatedSavings: '60% faster query execution',
          estimatedTimeToImplement: '3-4 days',
          implementationSteps: [
            'Analyze slow query logs and identify bottlenecks',
            'Add appropriate database indexes',
            'Rewrite inefficient queries',
            'Implement query result caching',
            'Monitor and validate performance improvements'
          ],
          prerequisites: [
            'Database administration access',
            'SQL optimization knowledge',
            'Performance monitoring tools'
          ],
          relatedMetrics: ['query_execution_time', 'database_performance', 'response_time'],
          tags: ['database', 'optimization', 'sql', 'performance'],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
          applied: false,
          dismissed: false
        }
      ]

      setRecommendations(sampleRecommendations)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...recommendations]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(rec =>
        rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(rec => filters.category.includes(rec.category))
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(rec => filters.priority.includes(rec.priority))
    }

    // Apply impact filter
    if (filters.impact.length > 0) {
      filtered = filtered.filter(rec => filters.impact.includes(rec.impact))
    }

    // Apply effort filter
    if (filters.effort.length > 0) {
      filtered = filtered.filter(rec => filters.effort.includes(rec.effort))
    }

    // Apply applied filter
    if (filters.applied !== null) {
      filtered = filtered.filter(rec => rec.applied === filters.applied)
    }

    // Apply dismissed filter
    if (filters.dismissed !== null) {
      filtered = filtered.filter(rec => rec.dismissed === filters.dismissed)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sort.field) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'impact':
          const impactOrder = { high: 3, medium: 2, low: 1 }
          aValue = impactOrder[a.impact]
          bValue = impactOrder[b.impact]
          break
        case 'confidence':
          aValue = a.confidence
          bValue = b.confidence
          break
        case 'createdAt':
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        case 'estimatedSavings':
          // Extract numeric value from savings string
          aValue = parseFloat(a.estimatedSavings.match(/\d+/)?.[0] || '0')
          bValue = parseFloat(b.estimatedSavings.match(/\d+/)?.[0] || '0')
          break
        default:
          aValue = 0
          bValue = 0
      }

      if (sort.direction === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    setFilteredRecommendations(filtered)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
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
      case 'cost': return <Target className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const applyRecommendation = (recommendationId: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, applied: true, appliedAt: new Date(), implementationProgress: 0 }
        : rec
    ))
  }

  const dismissRecommendation = (recommendationId: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, dismissed: true, dismissedAt: new Date() }
        : rec
    ))
  }

  const rateRecommendation = (recommendationId: string, rating: number) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, userRating: rating }
        : rec
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading recommendations...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Optimization Recommendations</h2>
          <p className="text-muted-foreground">
            AI-powered suggestions to improve development productivity and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadRecommendations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search recommendations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {Object.values(filters).some(filter => 
            Array.isArray(filter) ? filter.length > 0 : filter !== null
          ) && <Badge variant="secondary" className="ml-1">Active</Badge>}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="space-y-2">
                  {['performance', 'productivity', 'quality', 'security', 'cost'].map(category => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, category: [...prev.category, category] }))
                          } else {
                            setFilters(prev => ({ ...prev, category: prev.category.filter(c => c !== category) }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <div className="space-y-2">
                  {['high', 'medium', 'low'].map(priority => (
                    <label key={priority} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, priority: [...prev.priority, priority] }))
                          } else {
                            setFilters(prev => ({ ...prev, priority: prev.priority.filter(p => p !== priority) }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Impact</label>
                <div className="space-y-2">
                  {['high', 'medium', 'low'].map(impact => (
                    <label key={impact} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.impact.includes(impact)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, impact: [...prev.impact, impact] }))
                          } else {
                            setFilters(prev => ({ ...prev, impact: prev.impact.filter(i => i !== impact) }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{impact}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Effort</label>
                <div className="space-y-2">
                  {['high', 'medium', 'low'].map(effort => (
                    <label key={effort} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.effort.includes(effort)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, effort: [...prev.effort, effort] }))
                          } else {
                            setFilters(prev => ({ ...prev, effort: prev.effort.filter(e => e !== effort) }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{effort}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  category: [],
                  priority: [],
                  impact: [],
                  effort: [],
                  applied: null,
                  dismissed: null
                })}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Sort by:</span>
        <select
          value={sort.field}
          onChange={(e) => setSort(prev => ({ ...prev, field: e.target.value as any }))}
          className="px-3 py-1 border rounded-md text-sm"
        >
          <option value="priority">Priority</option>
          <option value="impact">Impact</option>
          <option value="confidence">Confidence</option>
          <option value="createdAt">Date Created</option>
          <option value="estimatedSavings">Estimated Savings</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSort(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
        >
          {sort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredRecommendations.length} of {recommendations.length} recommendations
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">
            {recommendations.filter(r => r.applied).length} Applied
          </Badge>
          <Badge variant="outline">
            {recommendations.filter(r => r.dismissed).length} Dismissed
          </Badge>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className={`hover:shadow-md transition-shadow ${
            recommendation.applied ? 'border-green-200 bg-green-50' : 
            recommendation.dismissed ? 'border-gray-200 bg-gray-50' : ''
          }`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(recommendation.category)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      {recommendation.applied && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Applied
                        </Badge>
                      )}
                      {recommendation.dismissed && (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Dismissed
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base">
                      {recommendation.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority}
                    </Badge>
                    <Badge variant="outline">
                      {recommendation.confidence}% confidence
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getImpactColor(recommendation.impact)}>
                      {recommendation.impact} impact
                    </Badge>
                    <Badge variant={getEffortColor(recommendation.effort)}>
                      {recommendation.effort} effort
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Savings:</span>
                  <p className="font-medium">{recommendation.estimatedSavings}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Time to Implement:</span>
                  <p className="font-medium">{recommendation.estimatedTimeToImplement}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="secondary" className="ml-2">
                    {recommendation.category}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{recommendation.createdAt.toLocaleDateString()}</p>
                </div>
              </div>

              {/* Implementation Progress */}
              {recommendation.applied && recommendation.implementationProgress !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Implementation Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {recommendation.implementationProgress}%
                    </span>
                  </div>
                  <Progress value={recommendation.implementationProgress} className="mb-2" />
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {recommendation.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* User Rating */}
              {recommendation.userRating && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Your Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= recommendation.userRating! 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {!recommendation.applied && !recommendation.dismissed && (
                  <>
                    <Button 
                      size="sm"
                      onClick={() => applyRecommendation(recommendation.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Apply Recommendation
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRecommendation(recommendation)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => dismissRecommendation(recommendation.id)}
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Dismiss
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Rating Controls */}
              {!recommendation.userRating && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rate this recommendation:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => rateRecommendation(recommendation.id, star)}
                        className="hover:text-yellow-400 transition-colors"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your filters or search terms to find relevant recommendations.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setFilters({
                category: [],
                priority: [],
                impact: [],
                effort: [],
                applied: null,
                dismissed: null
              })
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
