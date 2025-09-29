'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  TrendingUp,
  Star,
  Clock,
  Users,
  Zap,
  Building,
  ShoppingCart,
  Server,
  Palette,
  Briefcase,
  PenTool,
  Globe,
  Coffee
} from 'lucide-react'
import { templateCategorization, CategoryHierarchy, CategoryRecommendation, CategoryInsights } from '@/lib/templates/categorization'

interface TemplateCategoriesProps {
  onCategorySelect?: (category: CategoryHierarchy) => void
  onCategoryRecommendation?: (category: CategoryHierarchy) => void
  selectedCategoryId?: string
  showInsights?: boolean
  showRecommendations?: boolean
  userPreferences?: {
    business_type?: string
    industry?: string
    experience_level?: string
    project_type?: string
    budget?: string
    timeline?: string
  }
  layout?: 'tree' | 'grid' | 'list'
  maxDepth?: number
}

interface TemplateCategoriesState {
  categories: CategoryHierarchy[]
  expandedCategories: Set<string>
  selectedCategory: CategoryHierarchy | null
  categoryInsights: Map<string, CategoryInsights>
  recommendations: CategoryRecommendation[]
  trendingCategories: CategoryHierarchy[]
  loading: boolean
  showInsightDetails: boolean
}

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  'business': Building,
  'e-commerce': ShoppingCart,
  'saas': Server,
  'creative': Palette,
  'portfolio': Briefcase,
  'blog': PenTool,
  'landing': Globe,
  'restaurant': Coffee,
  'default': Folder
}

export default function TemplateCategories({
  onCategorySelect,
  onCategoryRecommendation,
  selectedCategoryId,
  showInsights = true,
  showRecommendations = true,
  userPreferences,
  layout = 'tree',
  maxDepth = 3
}: TemplateCategoriesProps) {
  const [state, setState] = useState<TemplateCategoriesState>({
    categories: [],
    expandedCategories: new Set(),
    selectedCategory: null,
    categoryInsights: new Map(),
    recommendations: [],
    trendingCategories: [],
    loading: true,
    showInsightDetails: false
  })

  useEffect(() => {
    loadCategories()
    if (showRecommendations && userPreferences) {
      loadRecommendations()
    }
    if (showInsights) {
      loadTrendingCategories()
    }
  }, [])

  useEffect(() => {
    if (selectedCategoryId) {
      const category = findCategoryById(selectedCategoryId, state.categories)
      if (category) {
        setState(prev => ({ ...prev, selectedCategory: category }))
        loadCategoryInsights(selectedCategoryId)
      }
    }
  }, [selectedCategoryId, state.categories])

  const loadCategories = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const categories = await templateCategorization.getCategoryHierarchy()
      setState(prev => ({
        ...prev,
        categories,
        loading: false
      }))
    } catch (error) {
      console.error('Error loading categories:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const loadRecommendations = async () => {
    if (!userPreferences) return

    try {
      const recommendations = await templateCategorization.getCategoryRecommendationsForUser(userPreferences)
      setState(prev => ({ ...prev, recommendations }))
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  const loadTrendingCategories = async () => {
    try {
      const trending = await templateCategorization.getTrendingCategories(5)
      setState(prev => ({ ...prev, trendingCategories: trending }))
    } catch (error) {
      console.error('Error loading trending categories:', error)
    }
  }

  const loadCategoryInsights = async (categoryId: string) => {
    try {
      const insights = await templateCategorization.getCategoryInsights(categoryId)
      if (insights) {
        setState(prev => ({
          ...prev,
          categoryInsights: new Map(prev.categoryInsights.set(categoryId, insights))
        }))
      }
    } catch (error) {
      console.error('Error loading category insights:', error)
    }
  }

  const findCategoryById = (id: string, categories: CategoryHierarchy[]): CategoryHierarchy | null => {
    for (const category of categories) {
      if (category.id === id) return category
      if (category.children) {
        const found = findCategoryById(id, category.children)
        if (found) return found
      }
    }
    return null
  }

  const handleCategoryToggle = (categoryId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedCategories)
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId)
      } else {
        newExpanded.add(categoryId)
      }
      return { ...prev, expandedCategories: newExpanded }
    })
  }

  const handleCategorySelect = (category: CategoryHierarchy) => {
    setState(prev => ({ ...prev, selectedCategory: category }))
    loadCategoryInsights(category.id)
    onCategorySelect?.(category)
  }

  const getCategoryIcon = (category: CategoryHierarchy) => {
    const IconComponent = CATEGORY_ICONS[category.icon || category.id] || CATEGORY_ICONS.default
    return <IconComponent className="h-4 w-4" style={{ color: category.color }} />
  }

  const getComplexityDistribution = (category: CategoryHierarchy) => {
    const distribution = category.metadata.complexity_distribution
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0)

    return Object.entries(distribution).map(([level, count]) => ({
      level,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
  }

  const renderCategoryTree = (categories: CategoryHierarchy[], depth: number = 0): React.ReactNode => {
    if (depth > maxDepth) return null

    return categories.map((category) => (
      <div key={category.id} className={`${depth > 0 ? 'ml-6' : ''}`}>
        <Collapsible
          open={state.expandedCategories.has(category.id)}
          onOpenChange={() => handleCategoryToggle(category.id)}
        >
          <div className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer group ${
            selectedCategoryId === category.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}>
            {category.children && category.children.length > 0 && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {state.expandedCategories.has(category.id) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}

            <div
              className="flex items-center gap-2 flex-1"
              onClick={() => handleCategorySelect(category)}
            >
              {getCategoryIcon(category)}
              <span className="font-medium">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category.template_count}
              </Badge>

              {state.trendingCategories.some(t => t.id === category.id) && (
                <TrendingUp className="h-3 w-3 text-orange-500" />
              )}
            </div>
          </div>

          {category.children && category.children.length > 0 && (
            <CollapsibleContent className="ml-2">
              {renderCategoryTree(category.children, depth + 1)}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    ))
  }

  const renderCategoryGrid = (categories: CategoryHierarchy[]): React.ReactNode => {
    const flatCategories = categories.reduce((acc: CategoryHierarchy[], category) => {
      acc.push(category)
      if (category.children) {
        acc.push(...category.children)
      }
      return acc
    }, [])

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flatCategories.map((category) => (
          <Card
            key={category.id}
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              selectedCategoryId === category.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleCategorySelect(category)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                {getCategoryIcon(category)}
                <h3 className="font-semibold">{category.name}</h3>
                {state.trendingCategories.some(t => t.id === category.id) && (
                  <Badge className="bg-orange-100 text-orange-800">Trending</Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {category.description}
              </p>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{category.template_count} templates</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{(category.metadata.success_rate / 20).toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderCategoryList = (categories: CategoryHierarchy[]): React.ReactNode => {
    const flatCategories = categories.reduce((acc: CategoryHierarchy[], category) => {
      acc.push(category)
      if (category.children) {
        acc.push(...category.children)
      }
      return acc
    }, [])

    return (
      <div className="space-y-2">
        {flatCategories.map((category) => (
          <Card
            key={category.id}
            className={`hover:shadow-sm transition-shadow cursor-pointer ${
              selectedCategoryId === category.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleCategorySelect(category)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category)}
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="text-center">
                    <div className="font-medium">{category.template_count}</div>
                    <div className="text-xs">Templates</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium">{(category.metadata.success_rate / 20).toFixed(1)}</span>
                    </div>
                    <div className="text-xs">Rating</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium">{Math.round(category.metadata.average_setup_time)}min</div>
                    <div className="text-xs">Setup</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (state.loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-5 w-8 bg-gray-200 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showRecommendations && state.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Recommended Categories
            </CardTitle>
            <CardDescription>
              Based on your preferences and project requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.recommendations.slice(0, 4).map((recommendation) => (
                <Card key={recommendation.category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {getCategoryIcon(recommendation.category)}
                      <h3 className="font-semibold">{recommendation.category.name}</h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {recommendation.relevance_score}% Match
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {recommendation.match_reasons[0]}
                    </p>

                    <div className="flex justify-between items-center text-sm">
                      <span>{recommendation.template_count} templates</span>
                      <span className="text-green-600 font-medium">
                        {recommendation.estimated_success_rate}% success rate
                      </span>
                    </div>

                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          handleCategorySelect(recommendation.category)
                          onCategoryRecommendation?.(recommendation.category)
                        }}
                      >
                        Explore Category
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showInsights && state.trendingCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Trending Categories
            </CardTitle>
            <CardDescription>
              Popular categories with growing adoption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {state.trendingCategories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCategorySelect(category)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {getCategoryIcon(category)}
                      <h3 className="font-semibold text-sm">{category.name}</h3>
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        Trending
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {category.template_count} templates
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Template Categories</CardTitle>
          <CardDescription>
            Browse templates by category and complexity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {layout === 'tree' && renderCategoryTree(state.categories)}
          {layout === 'grid' && renderCategoryGrid(state.categories)}
          {layout === 'list' && renderCategoryList(state.categories)}
        </CardContent>
      </Card>

      {state.selectedCategory && showInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(state.selectedCategory)}
              {state.selectedCategory.name} Category Insights
            </CardTitle>
            <CardDescription>
              {state.selectedCategory.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{state.selectedCategory.template_count}</div>
                <div className="text-sm text-gray-600">Templates</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">
                  {(state.selectedCategory.metadata.success_rate / 20).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(state.selectedCategory.metadata.average_setup_time)}min
                </div>
                <div className="text-sm text-gray-600">Setup Time</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">
                  {state.selectedCategory.metadata.popularity_score}
                </div>
                <div className="text-sm text-gray-600">Popularity</div>
              </div>
            </div>

            {state.selectedCategory.metadata.complexity_distribution && (
              <div>
                <h4 className="font-semibold mb-3">Complexity Distribution</h4>
                <div className="space-y-2">
                  {getComplexityDistribution(state.selectedCategory).map(({ level, percentage }) => (
                    <div key={level} className="flex items-center gap-3">
                      <div className="w-20 text-sm capitalize">{level}</div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <div className="w-12 text-sm text-gray-600">{percentage.toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Popular Features</h4>
                <div className="flex flex-wrap gap-2">
                  {state.selectedCategory.metadata.typical_features.slice(0, 8).map((feature) => (
                    <Badge key={feature} variant="outline">{feature}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Common Integrations</h4>
                <div className="flex flex-wrap gap-2">
                  {state.selectedCategory.metadata.common_integrations.slice(0, 6).map((integration) => (
                    <Badge key={integration} variant="secondary">{integration}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Business Types</h4>
              <div className="flex flex-wrap gap-2">
                {state.selectedCategory.metadata.business_types.map((type) => (
                  <Badge key={type} className="bg-blue-100 text-blue-800">{type}</Badge>
                ))}
              </div>
            </div>

            {state.categoryInsights.has(state.selectedCategory.id) && (
              <div>
                <h4 className="font-semibold mb-3">Additional Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Growth Rate</p>
                    <p className="text-green-600">
                      {state.categoryInsights.get(state.selectedCategory.id)?.growth_rate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">User Satisfaction</p>
                    <p className="text-blue-600">
                      {state.categoryInsights.get(state.selectedCategory.id)?.user_satisfaction.toFixed(1)}/5
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}