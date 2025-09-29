'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Grid, List, Star, Download, Eye, Clock, Users, TrendingUp, Zap } from 'lucide-react'
import { templateRegistry, TemplateMetadata, TemplateSearchCriteria } from '@/lib/templates/template-registry'
import { templateDiscoveryEngine, DiscoveryQuery, TemplateRecommendation } from '@/lib/templates/discovery-engine'
import { templateCategorization, CategoryHierarchy } from '@/lib/templates/categorization'

interface TemplateBrowserProps {
  onTemplateSelect?: (template: TemplateMetadata) => void
  onTemplatePreview?: (template: TemplateMetadata) => void
  onTemplateUse?: (template: TemplateMetadata) => void
  showFeaturedOnly?: boolean
  categoryFilter?: string
  maxResults?: number
  layout?: 'grid' | 'list'
  enablePersonalization?: boolean
  userPreferences?: {
    business_type?: string
    industry?: string
    experience_level?: string
    budget?: string
  }
}

interface TemplateBrowserState {
  templates: TemplateMetadata[]
  recommendations: TemplateRecommendation[]
  categories: CategoryHierarchy[]
  loading: boolean
  searchQuery: string
  selectedCategory: string
  selectedComplexity: string
  selectedPricingTier: string
  selectedBusinessType: string
  selectedIndustry: string
  sortBy: string
  viewMode: 'grid' | 'list'
  currentPage: number
  totalPages: number
  totalResults: number
  showFilters: boolean
  discoveryMode: boolean
  personalizedResults: TemplateRecommendation[]
}

export default function TemplateBrowser({
  onTemplateSelect,
  onTemplatePreview,
  onTemplateUse,
  showFeaturedOnly = false,
  categoryFilter,
  maxResults = 50,
  layout = 'grid',
  enablePersonalization = false,
  userPreferences
}: TemplateBrowserProps) {
  const [state, setState] = useState<TemplateBrowserState>({
    templates: [],
    recommendations: [],
    categories: [],
    loading: true,
    searchQuery: '',
    selectedCategory: categoryFilter || '',
    selectedComplexity: '',
    selectedPricingTier: '',
    selectedBusinessType: userPreferences?.business_type || '',
    selectedIndustry: userPreferences?.industry || '',
    sortBy: 'downloads',
    viewMode: layout,
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    showFilters: false,
    discoveryMode: false,
    personalizedResults: []
  })

  const ITEMS_PER_PAGE = layout === 'grid' ? 12 : 8

  useEffect(() => {
    loadCategories()
    if (enablePersonalization && userPreferences) {
      loadPersonalizedRecommendations()
    } else {
      loadTemplates()
    }
  }, [])

  useEffect(() => {
    if (state.discoveryMode) {
      performDiscovery()
    } else {
      loadTemplates()
    }
  }, [
    state.searchQuery,
    state.selectedCategory,
    state.selectedComplexity,
    state.selectedPricingTier,
    state.selectedBusinessType,
    state.selectedIndustry,
    state.sortBy,
    state.currentPage,
    state.discoveryMode
  ])

  const loadCategories = async () => {
    try {
      const categories = await templateCategorization.getCategoryHierarchy()
      setState(prev => ({ ...prev, categories }))
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadTemplates = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const searchCriteria: TemplateSearchCriteria = {
        query: state.searchQuery || undefined,
        category: state.selectedCategory || undefined,
        complexity_level: state.selectedComplexity ? [state.selectedComplexity] : undefined,
        pricing_tier: state.selectedPricingTier ? [state.selectedPricingTier] : undefined,
        business_category: state.selectedBusinessType ? [state.selectedBusinessType] : undefined,
        industry_tags: state.selectedIndustry ? [state.selectedIndustry] : undefined,
        is_featured: showFeaturedOnly || undefined,
        sort_by: state.sortBy as any,
        sort_order: 'desc',
        limit: Math.min(ITEMS_PER_PAGE, maxResults),
        offset: (state.currentPage - 1) * ITEMS_PER_PAGE
      }

      const result = await templateRegistry.searchTemplates(searchCriteria)

      setState(prev => ({
        ...prev,
        templates: result.templates,
        totalResults: result.total,
        totalPages: Math.ceil(Math.min(result.total, maxResults) / ITEMS_PER_PAGE),
        loading: false
      }))
    } catch (error) {
      console.error('Error loading templates:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const performDiscovery = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const discoveryQuery: DiscoveryQuery = {
        query: state.searchQuery || undefined,
        business_type: state.selectedBusinessType || undefined,
        industry: state.selectedIndustry || undefined,
        complexity_preference: state.selectedComplexity as any || undefined,
        budget_range: state.selectedPricingTier as any || undefined
      }

      const discoveryResult = await templateDiscoveryEngine.discoverTemplates(discoveryQuery)

      setState(prev => ({
        ...prev,
        recommendations: discoveryResult.templates.slice(0, maxResults),
        totalResults: discoveryResult.total_matches,
        totalPages: Math.ceil(Math.min(discoveryResult.total_matches, maxResults) / ITEMS_PER_PAGE),
        loading: false
      }))
    } catch (error) {
      console.error('Error performing discovery:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const loadPersonalizedRecommendations = async () => {
    if (!userPreferences) return

    try {
      setState(prev => ({ ...prev, loading: true }))

      const personalizedResult = await templateDiscoveryEngine.getPersonalizedRecommendations(
        {
          business_type: userPreferences.business_type,
          industry: userPreferences.industry,
          experience_level: userPreferences.experience_level,
          preferred_complexity: userPreferences.experience_level
        },
        maxResults
      )

      setState(prev => ({
        ...prev,
        personalizedResults: personalizedResult.recommendations,
        loading: false
      }))
    } catch (error) {
      console.error('Error loading personalized recommendations:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleSearch = (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      currentPage: 1
    }))
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setState(prev => ({
      ...prev,
      [filterType]: value,
      currentPage: 1
    }))
  }

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode: mode }))
  }

  const handleDiscoveryToggle = () => {
    setState(prev => ({
      ...prev,
      discoveryMode: !prev.discoveryMode,
      currentPage: 1
    }))
  }

  const handleTemplateAction = (action: string, template: TemplateMetadata | TemplateRecommendation) => {
    const templateData = 'template' in template ? template.template : template

    switch (action) {
      case 'select':
        onTemplateSelect?.(templateData)
        break
      case 'preview':
        onTemplatePreview?.(templateData)
        break
      case 'use':
        onTemplateUse?.(templateData)
        break
    }
  }

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPricingColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-green-100 text-green-800'
      case 'premium': return 'bg-blue-100 text-blue-800'
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatSetupTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMin = minutes % 60
    return remainingMin > 0 ? `${hours}h ${remainingMin}min` : `${hours}h`
  }

  const renderTemplateCard = (item: TemplateMetadata | TemplateRecommendation) => {
    const template = 'template' in item ? item.template : item
    const recommendation = 'template' in item ? item : null

    return (
      <Card key={template.id} className="hover:shadow-lg transition-shadow group">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg line-clamp-1">{template.name}</h3>
            <div className="flex items-center gap-1">
              {template.is_featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              {recommendation && recommendation.relevance_score > 80 && (
                <Zap className="h-4 w-4 text-blue-500" />
              )}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {template.description}
          </p>

          {recommendation && recommendation.match_reasons.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-blue-600 mb-1">Why this matches:</p>
              <p className="text-xs text-gray-600 line-clamp-2">
                {recommendation.match_reasons[0]}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={getComplexityColor(template.complexity_level)}>
              {template.complexity_level}
            </Badge>
            <Badge className={getPricingColor(template.pricing_tier)}>
              {template.pricing_tier}
            </Badge>
            <Badge variant="outline">{template.category}</Badge>
          </div>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Rating:</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span>{template.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Downloads:</span>
              <span>{template.downloads.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Setup:</span>
              <span>{formatSetupTime(template.estimated_setup_time)}</span>
            </div>
            {recommendation && (
              <div className="flex justify-between">
                <span>Match:</span>
                <span className="font-medium text-blue-600">
                  {recommendation.relevance_score}%
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleTemplateAction('preview', item)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleTemplateAction('use', item)}
            >
              <Download className="h-3 w-3 mr-1" />
              Use
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTemplateList = (item: TemplateMetadata | TemplateRecommendation) => {
    const template = 'template' in item ? item.template : item
    const recommendation = 'template' in item ? item : null

    return (
      <Card key={template.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                {template.is_featured && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {recommendation && recommendation.relevance_score > 80 && (
                  <Badge className="bg-blue-100 text-blue-800">
                    {recommendation.relevance_score}% Match
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className={getComplexityColor(template.complexity_level)}>
                  {template.complexity_level}
                </Badge>
                <Badge className={getPricingColor(template.pricing_tier)}>
                  {template.pricing_tier}
                </Badge>
                <Badge variant="outline">{template.category}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-600">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span>{template.rating.toFixed(1)}</span>
                </div>
                <p className="text-xs">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{template.downloads}</span>
                </div>
                <p className="text-xs">Downloads</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatSetupTime(template.estimated_setup_time)}</span>
                </div>
                <p className="text-xs">Setup</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTemplateAction('preview', item)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={() => handleTemplateAction('use', item)}
              >
                <Download className="h-3 w-3 mr-1" />
                Use
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentData = state.discoveryMode ? state.recommendations :
                     enablePersonalization && state.personalizedResults.length > 0 ? state.personalizedResults :
                     state.templates

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Template Browser</h2>
          <p className="text-gray-600">
            {state.discoveryMode ? 'Discover' : 'Browse'} templates for your project
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewModeChange(state.viewMode === 'grid' ? 'list' : 'grid')}
          >
            {state.viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          {enablePersonalization && (
            <Button
              variant={state.discoveryMode ? "default" : "outline"}
              size="sm"
              onClick={handleDiscoveryToggle}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Discovery
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={state.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={state.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="downloads">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <Select value={state.selectedCategory} onValueChange={(value) => handleFilterChange('selectedCategory', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {state.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={state.selectedComplexity} onValueChange={(value) => handleFilterChange('selectedComplexity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={state.selectedPricingTier} onValueChange={(value) => handleFilterChange('selectedPricingTier', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pricing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Pricing</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>

              <Select value={state.selectedBusinessType} onValueChange={(value) => handleFilterChange('selectedBusinessType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Business Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="e-commerce">E-Commerce</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              {state.totalResults} {state.discoveryMode ? 'recommendations' : 'templates'} found
            </p>
            {state.discoveryMode && (
              <Badge className="bg-blue-100 text-blue-800">
                AI-Powered Discovery
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {state.loading ? (
        <div className={`grid gap-6 ${state.viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className={`grid gap-6 ${state.viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {currentData.map((item) =>
            state.viewMode === 'grid' ? renderTemplateCard(item) : renderTemplateList(item)
          )}
        </div>
      )}

      {currentData.length === 0 && !state.loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => setState(prev => ({
                ...prev,
                searchQuery: '',
                selectedCategory: '',
                selectedComplexity: '',
                selectedPricingTier: '',
                selectedBusinessType: '',
                selectedIndustry: ''
              }))}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {state.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={state.currentPage === 1}
            onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(5, state.totalPages) }).map((_, i) => {
            const page = i + Math.max(1, state.currentPage - 2)
            if (page > state.totalPages) return null
            return (
              <Button
                key={page}
                variant={page === state.currentPage ? "default" : "outline"}
                onClick={() => setState(prev => ({ ...prev, currentPage: page }))}
              >
                {page}
              </Button>
            )
          })}
          <Button
            variant="outline"
            disabled={state.currentPage === state.totalPages}
            onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}