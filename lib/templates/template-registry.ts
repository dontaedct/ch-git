import { createClient } from '@supabase/supabase-js'

export interface TemplateMetadata {
  id: string
  name: string
  description: string
  version: string
  category: string
  tags: string[]
  author: string
  created_at: string
  updated_at: string
  downloads: number
  rating: number
  compatibility: string[]
  dependencies: string[]
  customization_points: Record<string, any>
  preview_url?: string
  demo_url?: string
  documentation_url?: string
  source_path: string
  is_active: boolean
  is_featured: boolean
  pricing_tier: 'free' | 'premium' | 'enterprise'
  business_category: string[]
  industry_tags: string[]
  complexity_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_setup_time: number
  support_level: 'community' | 'professional' | 'enterprise'
}

export interface TemplateRegistration {
  template: TemplateMetadata
  files: TemplateFile[]
  configuration: TemplateConfiguration
  validation_results: ValidationResult[]
}

export interface TemplateFile {
  path: string
  content: string
  type: 'component' | 'page' | 'api' | 'config' | 'style' | 'asset'
  customizable: boolean
  required: boolean
}

export interface TemplateConfiguration {
  env_variables: EnvironmentVariable[]
  feature_flags: FeatureFlag[]
  integrations: Integration[]
  deployment_settings: DeploymentSettings
  customization_schema: Record<string, any>
}

export interface EnvironmentVariable {
  key: string
  description: string
  required: boolean
  default_value?: string
  type: 'string' | 'number' | 'boolean' | 'url' | 'secret'
}

export interface FeatureFlag {
  key: string
  name: string
  description: string
  default_enabled: boolean
  dependencies?: string[]
}

export interface Integration {
  name: string
  type: 'api' | 'service' | 'database' | 'auth' | 'payment' | 'analytics'
  required: boolean
  configuration: Record<string, any>
}

export interface DeploymentSettings {
  platform: string[]
  requirements: Record<string, any>
  scripts: Record<string, string>
  environment_setup: string[]
}

export interface ValidationResult {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
  line?: number
  suggestion?: string
}

export interface TemplateSearchCriteria {
  query?: string
  category?: string
  tags?: string[]
  business_category?: string[]
  industry_tags?: string[]
  complexity_level?: string[]
  pricing_tier?: string[]
  min_rating?: number
  compatibility?: string[]
  is_featured?: boolean
  sort_by?: 'name' | 'downloads' | 'rating' | 'created_at' | 'updated_at'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface TemplateAnalytics {
  template_id: string
  downloads: number
  views: number
  installations: number
  success_rate: number
  avg_setup_time: number
  user_ratings: number[]
  feedback_count: number
  last_updated: string
  trending_score: number
  compatibility_issues: string[]
  popular_customizations: string[]
}

export class TemplateRegistry {
  private supabase: any
  private cache: Map<string, TemplateMetadata> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_TTL = 300000 // 5 minutes

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  async registerTemplate(registration: TemplateRegistration): Promise<{ success: boolean; template_id?: string; errors?: string[] }> {
    try {
      const validation = await this.validateTemplate(registration)
      if (!validation.is_valid) {
        return { success: false, errors: validation.errors }
      }

      const { data, error } = await this.supabase
        .from('template_registry')
        .insert({
          ...registration.template,
          files: registration.files,
          configuration: registration.configuration,
          validation_results: registration.validation_results,
          registered_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      this.cache.set(data.id, data)
      this.cacheExpiry.set(data.id, Date.now() + this.CACHE_TTL)

      await this.updateTemplateAnalytics(data.id, { template_registered: true })

      return { success: true, template_id: data.id }
    } catch (error) {
      console.error('Error registering template:', error)
      return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] }
    }
  }

  async getTemplate(template_id: string): Promise<TemplateMetadata | null> {
    try {
      if (this.cache.has(template_id) && this.cacheExpiry.get(template_id)! > Date.now()) {
        return this.cache.get(template_id)!
      }

      const { data, error } = await this.supabase
        .from('template_registry')
        .select('*')
        .eq('id', template_id)
        .eq('is_active', true)
        .single()

      if (error || !data) return null

      this.cache.set(template_id, data)
      this.cacheExpiry.set(template_id, Date.now() + this.CACHE_TTL)

      await this.updateTemplateAnalytics(template_id, { view_count: 1 })

      return data
    } catch (error) {
      console.error('Error fetching template:', error)
      return null
    }
  }

  async searchTemplates(criteria: TemplateSearchCriteria): Promise<{
    templates: TemplateMetadata[]
    total: number
    facets: Record<string, any>
  }> {
    try {
      let query = this.supabase
        .from('template_registry')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      if (criteria.query) {
        query = query.or(`name.ilike.%${criteria.query}%,description.ilike.%${criteria.query}%,tags.cs.{${criteria.query}}`)
      }

      if (criteria.category) {
        query = query.eq('category', criteria.category)
      }

      if (criteria.tags && criteria.tags.length > 0) {
        query = query.contains('tags', criteria.tags)
      }

      if (criteria.business_category && criteria.business_category.length > 0) {
        query = query.overlaps('business_category', criteria.business_category)
      }

      if (criteria.industry_tags && criteria.industry_tags.length > 0) {
        query = query.overlaps('industry_tags', criteria.industry_tags)
      }

      if (criteria.complexity_level && criteria.complexity_level.length > 0) {
        query = query.in('complexity_level', criteria.complexity_level)
      }

      if (criteria.pricing_tier && criteria.pricing_tier.length > 0) {
        query = query.in('pricing_tier', criteria.pricing_tier)
      }

      if (criteria.min_rating) {
        query = query.gte('rating', criteria.min_rating)
      }

      if (criteria.compatibility && criteria.compatibility.length > 0) {
        query = query.overlaps('compatibility', criteria.compatibility)
      }

      if (criteria.is_featured !== undefined) {
        query = query.eq('is_featured', criteria.is_featured)
      }

      if (criteria.sort_by) {
        const order = criteria.sort_order || 'desc'
        query = query.order(criteria.sort_by, { ascending: order === 'asc' })
      } else {
        query = query.order('downloads', { ascending: false })
      }

      if (criteria.limit) {
        query = query.limit(criteria.limit)
      }

      if (criteria.offset) {
        query = query.range(criteria.offset, (criteria.offset + (criteria.limit || 20)) - 1)
      }

      const { data, error, count } = await query

      if (error) throw error

      const facets = await this.generateSearchFacets(criteria)

      return {
        templates: data || [],
        total: count || 0,
        facets
      }
    } catch (error) {
      console.error('Error searching templates:', error)
      return { templates: [], total: 0, facets: {} }
    }
  }

  async getFeaturedTemplates(limit: number = 10): Promise<TemplateMetadata[]> {
    try {
      const { data, error } = await this.supabase
        .from('template_registry')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching featured templates:', error)
      return []
    }
  }

  async getTrendingTemplates(limit: number = 10): Promise<TemplateMetadata[]> {
    try {
      const { data, error } = await this.supabase
        .from('template_analytics')
        .select(`
          template_id,
          trending_score,
          template_registry (*)
        `)
        .order('trending_score', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data?.map(item => item.template_registry).filter(Boolean) || []
    } catch (error) {
      console.error('Error fetching trending templates:', error)
      return []
    }
  }

  async updateTemplate(template_id: string, updates: Partial<TemplateMetadata>): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const { data, error } = await this.supabase
        .from('template_registry')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', template_id)
        .select()
        .single()

      if (error) throw error

      this.cache.set(template_id, data)
      this.cacheExpiry.set(template_id, Date.now() + this.CACHE_TTL)

      return { success: true }
    } catch (error) {
      console.error('Error updating template:', error)
      return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] }
    }
  }

  async deactivateTemplate(template_id: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const { error } = await this.supabase
        .from('template_registry')
        .update({ is_active: false, deactivated_at: new Date().toISOString() })
        .eq('id', template_id)

      if (error) throw error

      this.cache.delete(template_id)
      this.cacheExpiry.delete(template_id)

      return { success: true }
    } catch (error) {
      console.error('Error deactivating template:', error)
      return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] }
    }
  }

  async getTemplateAnalytics(template_id: string): Promise<TemplateAnalytics | null> {
    try {
      const { data, error } = await this.supabase
        .from('template_analytics')
        .select('*')
        .eq('template_id', template_id)
        .single()

      if (error || !data) return null
      return data
    } catch (error) {
      console.error('Error fetching template analytics:', error)
      return null
    }
  }

  async rateTemplate(template_id: string, rating: number, user_id?: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      if (rating < 1 || rating > 5) {
        return { success: false, errors: ['Rating must be between 1 and 5'] }
      }

      const { error } = await this.supabase
        .from('template_ratings')
        .upsert({
          template_id,
          user_id: user_id || 'anonymous',
          rating,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      await this.updateAverageRating(template_id)
      return { success: true }
    } catch (error) {
      console.error('Error rating template:', error)
      return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] }
    }
  }

  private async validateTemplate(registration: TemplateRegistration): Promise<{ is_valid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (!registration.template.name?.trim()) {
      errors.push('Template name is required')
    }

    if (!registration.template.description?.trim()) {
      errors.push('Template description is required')
    }

    if (!registration.template.category?.trim()) {
      errors.push('Template category is required')
    }

    if (!registration.template.version?.trim()) {
      errors.push('Template version is required')
    }

    if (!registration.files || registration.files.length === 0) {
      errors.push('Template must include at least one file')
    }

    if (!registration.template.source_path?.trim()) {
      errors.push('Template source path is required')
    }

    const requiredFiles = registration.files.filter(f => f.required)
    if (requiredFiles.length === 0) {
      errors.push('Template must have at least one required file')
    }

    return {
      is_valid: errors.length === 0,
      errors
    }
  }

  private async generateSearchFacets(criteria: TemplateSearchCriteria): Promise<Record<string, any>> {
    try {
      const { data: categoryFacets } = await this.supabase
        .from('template_registry')
        .select('category')
        .eq('is_active', true)

      const { data: pricingFacets } = await this.supabase
        .from('template_registry')
        .select('pricing_tier')
        .eq('is_active', true)

      const { data: complexityFacets } = await this.supabase
        .from('template_registry')
        .select('complexity_level')
        .eq('is_active', true)

      return {
        categories: this.aggregateFacets(categoryFacets, 'category'),
        pricing_tiers: this.aggregateFacets(pricingFacets, 'pricing_tier'),
        complexity_levels: this.aggregateFacets(complexityFacets, 'complexity_level'),
        rating_ranges: [
          { label: '4+ Stars', value: 4, count: 0 },
          { label: '3+ Stars', value: 3, count: 0 },
          { label: '2+ Stars', value: 2, count: 0 },
          { label: '1+ Stars', value: 1, count: 0 }
        ]
      }
    } catch (error) {
      console.error('Error generating search facets:', error)
      return {}
    }
  }

  private aggregateFacets(data: any[], field: string): Array<{ label: string; value: string; count: number }> {
    const counts = data.reduce((acc, item) => {
      const value = item[field]
      if (value) {
        acc[value] = (acc[value] || 0) + 1
      }
      return acc
    }, {})

    return Object.entries(counts).map(([value, count]) => ({
      label: value.charAt(0).toUpperCase() + value.slice(1),
      value,
      count: count as number
    }))
  }

  private async updateTemplateAnalytics(template_id: string, metrics: Record<string, any>): Promise<void> {
    try {
      const { data: existing } = await this.supabase
        .from('template_analytics')
        .select('*')
        .eq('template_id', template_id)
        .single()

      if (existing) {
        const updates: Record<string, any> = {}

        if (metrics.view_count) {
          updates.views = (existing.views || 0) + metrics.view_count
        }

        if (metrics.download_count) {
          updates.downloads = (existing.downloads || 0) + metrics.download_count
        }

        if (metrics.installation_count) {
          updates.installations = (existing.installations || 0) + metrics.installation_count
        }

        updates.last_updated = new Date().toISOString()

        await this.supabase
          .from('template_analytics')
          .update(updates)
          .eq('template_id', template_id)
      } else {
        await this.supabase
          .from('template_analytics')
          .insert({
            template_id,
            downloads: metrics.download_count || 0,
            views: metrics.view_count || 0,
            installations: metrics.installation_count || 0,
            success_rate: 0,
            avg_setup_time: 0,
            user_ratings: [],
            feedback_count: 0,
            last_updated: new Date().toISOString(),
            trending_score: 0,
            compatibility_issues: [],
            popular_customizations: []
          })
      }
    } catch (error) {
      console.error('Error updating template analytics:', error)
    }
  }

  private async updateAverageRating(template_id: string): Promise<void> {
    try {
      const { data: ratings } = await this.supabase
        .from('template_ratings')
        .select('rating')
        .eq('template_id', template_id)

      if (ratings && ratings.length > 0) {
        const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length

        await this.supabase
          .from('template_registry')
          .update({ rating: Number(average.toFixed(1)) })
          .eq('id', template_id)

        this.cache.delete(template_id)
        this.cacheExpiry.delete(template_id)
      }
    } catch (error) {
      console.error('Error updating average rating:', error)
    }
  }

  clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  async bulkUpdateTemplates(updates: Array<{ template_id: string; updates: Partial<TemplateMetadata> }>): Promise<{
    success: boolean
    results: Array<{ template_id: string; success: boolean; error?: string }>
  }> {
    const results = []

    for (const update of updates) {
      try {
        const result = await this.updateTemplate(update.template_id, update.updates)
        results.push({
          template_id: update.template_id,
          success: result.success,
          error: result.errors?.[0]
        })
      } catch (error) {
        results.push({
          template_id: update.template_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const allSuccessful = results.every(r => r.success)

    return {
      success: allSuccessful,
      results
    }
  }
}

export const templateRegistry = new TemplateRegistry()