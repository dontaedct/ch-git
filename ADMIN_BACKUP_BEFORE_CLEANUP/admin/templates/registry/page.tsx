'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, CheckCircle, Clock, Search, Filter, Plus, Edit, Trash2, Star, Download, Eye, Settings } from 'lucide-react'
import { templateRegistry, TemplateMetadata, TemplateSearchCriteria } from '@/lib/templates/template-registry'
import { templateDiscoveryEngine } from '@/lib/templates/discovery-engine'
import { templateCategorization } from '@/lib/templates/categorization'

interface TemplateRegistryPageState {
  templates: TemplateMetadata[]
  loading: boolean
  searchQuery: string
  selectedCategory: string
  selectedComplexity: string
  selectedPricingTier: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  currentPage: number
  totalPages: number
  totalTemplates: number
  selectedTemplate: TemplateMetadata | null
  showAnalytics: boolean
  featuredTemplates: TemplateMetadata[]
  trendingTemplates: TemplateMetadata[]
  registrationMode: boolean
}

export default function TemplateRegistryPage() {
  const [state, setState] = useState<TemplateRegistryPageState>({
    templates: [],
    loading: true,
    searchQuery: '',
    selectedCategory: '',
    selectedComplexity: '',
    selectedPricingTier: '',
    sortBy: 'downloads',
    sortOrder: 'desc',
    currentPage: 1,
    totalPages: 1,
    totalTemplates: 0,
    selectedTemplate: null,
    showAnalytics: false,
    featuredTemplates: [],
    trendingTemplates: [],
    registrationMode: false
  })

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    loadTemplates()
    loadFeaturedTemplates()
    loadTrendingTemplates()
  }, [state.searchQuery, state.selectedCategory, state.selectedComplexity, state.selectedPricingTier, state.sortBy, state.sortOrder, state.currentPage])

  const loadTemplates = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const searchCriteria: TemplateSearchCriteria = {
        query: state.searchQuery || undefined,
        category: state.selectedCategory || undefined,
        complexity_level: state.selectedComplexity ? [state.selectedComplexity] : undefined,
        pricing_tier: state.selectedPricingTier ? [state.selectedPricingTier] : undefined,
        sort_by: state.sortBy as any,
        sort_order: state.sortOrder,
        limit: ITEMS_PER_PAGE,
        offset: (state.currentPage - 1) * ITEMS_PER_PAGE
      }

      const result = await templateRegistry.searchTemplates(searchCriteria)

      setState(prev => ({
        ...prev,
        templates: result.templates,
        totalTemplates: result.total,
        totalPages: Math.ceil(result.total / ITEMS_PER_PAGE),
        loading: false
      }))
    } catch (error) {
      console.error('Error loading templates:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const loadFeaturedTemplates = async () => {
    try {
      const featured = await templateRegistry.getFeaturedTemplates(6)
      setState(prev => ({ ...prev, featuredTemplates: featured }))
    } catch (error) {
      console.error('Error loading featured templates:', error)
    }
  }

  const loadTrendingTemplates = async () => {
    try {
      const trending = await templateRegistry.getTrendingTemplates(6)
      setState(prev => ({ ...prev, trendingTemplates: trending }))
    } catch (error) {
      console.error('Error loading trending templates:', error)
    }
  }

  const handleSearch = (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      currentPage: 1
    }))
  }

  const handleFilterChange = (type: string, value: string) => {
    setState(prev => ({
      ...prev,
      [type]: value,
      currentPage: 1
    }))
  }

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      currentPage: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }

  const handleTemplateSelect = async (template: TemplateMetadata) => {
    setState(prev => ({ ...prev, selectedTemplate: template }))
  }

  const handleTemplateAction = async (action: string, templateId: string) => {
    try {
      switch (action) {
        case 'deactivate':
          await templateRegistry.deactivateTemplate(templateId)
          loadTemplates()
          break
        case 'feature':
          await templateRegistry.updateTemplate(templateId, { is_featured: true })
          loadTemplates()
          break
        case 'unfeature':
          await templateRegistry.updateTemplate(templateId, { is_featured: false })
          loadTemplates()
          break
        default:
          break
      }
    } catch (error) {
      console.error('Error performing template action:', error)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Template Registry</h1>
          <p className="text-gray-600 mt-2">
            Manage and discover templates for client deployments
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setState(prev => ({ ...prev, showAnalytics: !prev.showAnalytics }))}
          >
            <Settings className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            onClick={() => setState(prev => ({ ...prev, registrationMode: !prev.registrationMode }))}
          >
            <Plus className="h-4 w-4 mr-2" />
            Register Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse Templates</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search templates..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={state.selectedCategory} onValueChange={(value) => handleFilterChange('selectedCategory', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="e-commerce">E-Commerce</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={state.selectedComplexity} onValueChange={(value) => handleFilterChange('selectedComplexity', value)}>
                  <SelectTrigger className="w-48">
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
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Pricing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Pricing</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {state.totalTemplates} templates found
                </div>
                <Select value={`${state.sortBy}-${state.sortOrder}`} onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-')
                  handleSortChange(sortBy, sortOrder as 'asc' | 'desc')
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="downloads-desc">Most Downloaded</SelectItem>
                    <SelectItem value="rating-desc">Highest Rated</SelectItem>
                    <SelectItem value="created_at-desc">Newest</SelectItem>
                    <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {state.loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {state.templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg truncate">{template.name}</h3>
                      {template.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={getComplexityColor(template.complexity_level)}>
                        {template.complexity_level}
                      </Badge>
                      <Badge className={getPricingColor(template.pricing_tier)}>
                        {template.pricing_tier}
                      </Badge>
                      <Badge variant="outline">
                        {template.category}
                      </Badge>
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
                        <span>Setup Time:</span>
                        <span>{formatSetupTime(template.estimated_setup_time)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTemplateAction(template.is_featured ? 'unfeature' : 'feature', template.id)}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTemplateAction('deactivate', template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {state.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={state.currentPage === 1}
                onClick={() => handlePageChange(state.currentPage - 1)}
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
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                disabled={state.currentPage === state.totalPages}
                onClick={() => handlePageChange(state.currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Featured Templates
              </CardTitle>
              <CardDescription>
                Hand-picked templates with proven success rates and excellent user feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.featuredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{template.rating.toFixed(1)}</span>
                          <Download className="h-4 w-4 text-gray-400 ml-2" />
                          <span className="text-sm text-gray-600">{template.downloads}</span>
                        </div>
                        <Button size="sm" onClick={() => handleTemplateSelect(template)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Trending Templates
              </CardTitle>
              <CardDescription>
                Templates gaining popularity and positive user feedback recently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.trendingTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <Badge className="bg-orange-100 text-orange-800">Trending</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{template.rating.toFixed(1)}</span>
                          <Download className="h-4 w-4 text-gray-400 ml-2" />
                          <span className="text-sm text-gray-600">{template.downloads}</span>
                        </div>
                        <Button size="sm" onClick={() => handleTemplateSelect(template)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Templates</p>
                    <p className="text-2xl font-bold">{state.totalTemplates}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Featured</p>
                    <p className="text-2xl font-bold">{state.featuredTemplates.length}</p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trending</p>
                    <p className="text-2xl font-bold">{state.trendingTemplates.length}</p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold">
                      {state.templates.length > 0
                        ? (state.templates.reduce((sum, t) => sum + t.rating, 0) / state.templates.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Categories Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['business', 'e-commerce', 'saas', 'portfolio', 'blog'].map((category) => {
                  const count = state.templates.filter(t => t.category === category).length
                  const percentage = state.templates.length > 0 ? (count / state.templates.length) * 100 : 0
                  return (
                    <div key={category} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium capitalize">{category}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm text-gray-600">{count}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {state.selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {state.selectedTemplate.name}
                    {state.selectedTemplate.is_featured && (
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    )}
                  </CardTitle>
                  <CardDescription>{state.selectedTemplate.description}</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setState(prev => ({ ...prev, selectedTemplate: null }))}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className={getComplexityColor(state.selectedTemplate.complexity_level)}>
                  {state.selectedTemplate.complexity_level}
                </Badge>
                <Badge className={getPricingColor(state.selectedTemplate.pricing_tier)}>
                  {state.selectedTemplate.pricing_tier}
                </Badge>
                <Badge variant="outline">{state.selectedTemplate.category}</Badge>
                {state.selectedTemplate.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Rating</p>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{state.selectedTemplate.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Downloads</p>
                  <p>{state.selectedTemplate.downloads.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium">Setup Time</p>
                  <p>{formatSetupTime(state.selectedTemplate.estimated_setup_time)}</p>
                </div>
                <div>
                  <p className="font-medium">Version</p>
                  <p>{state.selectedTemplate.version}</p>
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Business Categories</p>
                <div className="flex flex-wrap gap-2">
                  {state.selectedTemplate.business_category?.map((category) => (
                    <Badge key={category} variant="outline">{category}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Industry Tags</p>
                <div className="flex flex-wrap gap-2">
                  {state.selectedTemplate.industry_tags?.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}