import { templateRegistry, TemplateMetadata, TemplateSearchCriteria } from './template-registry'
import { createClient } from '@supabase/supabase-js'

export interface DiscoveryQuery {
  query?: string
  business_type?: string
  industry?: string
  features_needed?: string[]
  complexity_preference?: 'beginner' | 'intermediate' | 'advanced'
  budget_range?: 'free' | 'premium' | 'enterprise'
  use_case?: string
  integration_requirements?: string[]
  design_preferences?: string[]
  performance_requirements?: string[]
  target_audience?: string[]
  timeline?: 'immediate' | 'within_week' | 'within_month' | 'flexible'
}

export interface DiscoveryResult {
  templates: TemplateRecommendation[]
  alternatives: TemplateRecommendation[]
  recommendations: AIRecommendation[]
  total_matches: number
  search_insights: SearchInsights
  refinement_suggestions: RefinementSuggestion[]
}

export interface TemplateRecommendation {
  template: TemplateMetadata
  relevance_score: number
  match_reasons: string[]
  customization_suggestions: string[]
  estimated_setup_time: number
  complexity_match: boolean
  feature_coverage: number
  integration_compatibility: number
  ai_insights: string[]
}

export interface AIRecommendation {
  type: 'feature_addition' | 'alternative_approach' | 'best_practice' | 'cost_optimization' | 'timeline_optimization'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  templates_affected?: string[]
  implementation_notes?: string[]
}

export interface SearchInsights {
  popular_in_industry: string[]
  trending_features: string[]
  common_integrations: string[]
  typical_complexity: string
  average_setup_time: number
  success_rate: number
  user_satisfaction: number
  business_impact_score: number
}

export interface RefinementSuggestion {
  type: 'filter' | 'query' | 'category' | 'feature'
  suggestion: string
  reason: string
  expected_impact: string
  filter_updates?: Partial<DiscoveryQuery>
}

export interface TemplateUsagePattern {
  template_id: string
  business_types: string[]
  common_features: string[]
  success_metrics: Record<string, number>
  user_feedback: string[]
  customization_patterns: string[]
  integration_patterns: string[]
}

export interface PersonalizedRecommendation {
  user_id?: string
  user_profile: UserProfile
  recommendations: TemplateRecommendation[]
  learning_insights: string[]
  next_steps: string[]
}

export interface UserProfile {
  business_type?: string
  industry?: string
  experience_level?: string
  previous_templates?: string[]
  preferred_complexity?: string
  typical_project_size?: string
  favorite_features?: string[]
  integration_preferences?: string[]
}

export class TemplateDiscoveryEngine {
  private supabase: any
  private mlEndpoint: string
  private cache: Map<string, any> = new Map()
  private readonly CACHE_TTL = 600000 // 10 minutes

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    this.mlEndpoint = process.env.ML_RECOMMENDATIONS_ENDPOINT || ''
  }

  async discoverTemplates(query: DiscoveryQuery): Promise<DiscoveryResult> {
    try {
      const cacheKey = this.generateCacheKey(query)
      const cached = this.getCachedResult(cacheKey)
      if (cached) return cached

      const [templates, usagePatterns, searchInsights] = await Promise.all([
        this.searchTemplatesByQuery(query),
        this.getUsagePatterns(query),
        this.generateSearchInsights(query)
      ])

      const rankedTemplates = await this.rankTemplatesByRelevance(templates, query, usagePatterns)
      const aiRecommendations = await this.generateAIRecommendations(query, rankedTemplates)
      const refinementSuggestions = await this.generateRefinementSuggestions(query, rankedTemplates)

      const alternatives = await this.findAlternativeTemplates(rankedTemplates, query)

      const result: DiscoveryResult = {
        templates: rankedTemplates.slice(0, 20),
        alternatives: alternatives.slice(0, 10),
        recommendations: aiRecommendations,
        total_matches: templates.length,
        search_insights: searchInsights,
        refinement_suggestions: refinementSuggestions
      }

      this.setCachedResult(cacheKey, result)
      return result
    } catch (error) {
      console.error('Error in template discovery:', error)
      return this.getEmptyResult()
    }
  }

  async getPersonalizedRecommendations(userProfile: UserProfile, limit: number = 10): Promise<PersonalizedRecommendation> {
    try {
      const query = await this.profileToQuery(userProfile)
      const discoveryResult = await this.discoverTemplates(query)

      const personalizedTemplates = await this.personalizeRecommendations(
        discoveryResult.templates,
        userProfile
      )

      const learningInsights = await this.generateLearningInsights(userProfile, personalizedTemplates)
      const nextSteps = await this.generateNextSteps(userProfile, personalizedTemplates)

      return {
        user_profile: userProfile,
        recommendations: personalizedTemplates.slice(0, limit),
        learning_insights: learningInsights,
        next_steps: nextSteps
      }
    } catch (error) {
      console.error('Error generating personalized recommendations:', error)
      return {
        user_profile: userProfile,
        recommendations: [],
        learning_insights: [],
        next_steps: []
      }
    }
  }

  async findSimilarTemplates(template_id: string, limit: number = 5): Promise<TemplateRecommendation[]> {
    try {
      const template = await templateRegistry.getTemplate(template_id)
      if (!template) return []

      const similarityQuery: DiscoveryQuery = {
        business_type: template.business_category?.[0],
        industry: template.industry_tags?.[0],
        features_needed: template.tags,
        complexity_preference: template.complexity_level
      }

      const discovery = await this.discoverTemplates(similarityQuery)
      return discovery.templates
        .filter(t => t.template.id !== template_id)
        .slice(0, limit)
    } catch (error) {
      console.error('Error finding similar templates:', error)
      return []
    }
  }

  async getTemplateRecommendationsForProject(projectDescription: string): Promise<TemplateRecommendation[]> {
    try {
      const extractedQuery = await this.extractQueryFromDescription(projectDescription)
      const discovery = await this.discoverTemplates(extractedQuery)

      return discovery.templates.slice(0, 10)
    } catch (error) {
      console.error('Error getting project recommendations:', error)
      return []
    }
  }

  async getTrendingTemplatesForIndustry(industry: string, limit: number = 10): Promise<TemplateRecommendation[]> {
    try {
      const trendingQuery: DiscoveryQuery = {
        industry,
        timeline: 'within_month'
      }

      const discovery = await this.discoverTemplates(trendingQuery)

      const trendingTemplates = discovery.templates
        .sort((a, b) => b.template.downloads - a.template.downloads)
        .slice(0, limit)

      return trendingTemplates
    } catch (error) {
      console.error('Error getting trending templates:', error)
      return []
    }
  }

  private async searchTemplatesByQuery(query: DiscoveryQuery): Promise<TemplateMetadata[]> {
    const searchCriteria: TemplateSearchCriteria = {
      query: query.query,
      business_category: query.business_type ? [query.business_type] : undefined,
      industry_tags: query.industry ? [query.industry] : undefined,
      complexity_level: query.complexity_preference ? [query.complexity_preference] : undefined,
      pricing_tier: query.budget_range ? [query.budget_range] : undefined,
      tags: query.features_needed,
      limit: 100
    }

    const searchResult = await templateRegistry.searchTemplates(searchCriteria)
    return searchResult.templates
  }

  private async rankTemplatesByRelevance(
    templates: TemplateMetadata[],
    query: DiscoveryQuery,
    usagePatterns: TemplateUsagePattern[]
  ): Promise<TemplateRecommendation[]> {
    const rankedTemplates: TemplateRecommendation[] = []

    for (const template of templates) {
      const relevanceScore = await this.calculateRelevanceScore(template, query, usagePatterns)
      const matchReasons = this.generateMatchReasons(template, query)
      const customizationSuggestions = await this.generateCustomizationSuggestions(template, query)
      const aiInsights = await this.generateAIInsights(template, query)

      const recommendation: TemplateRecommendation = {
        template,
        relevance_score: relevanceScore,
        match_reasons: matchReasons,
        customization_suggestions: customizationSuggestions,
        estimated_setup_time: template.estimated_setup_time || 60,
        complexity_match: template.complexity_level === query.complexity_preference,
        feature_coverage: this.calculateFeatureCoverage(template, query),
        integration_compatibility: this.calculateIntegrationCompatibility(template, query),
        ai_insights: aiInsights
      }

      rankedTemplates.push(recommendation)
    }

    return rankedTemplates.sort((a, b) => b.relevance_score - a.relevance_score)
  }

  private async calculateRelevanceScore(
    template: TemplateMetadata,
    query: DiscoveryQuery,
    usagePatterns: TemplateUsagePattern[]
  ): Promise<number> {
    let score = 0

    if (query.business_type && template.business_category?.includes(query.business_type)) {
      score += 20
    }

    if (query.industry && template.industry_tags?.includes(query.industry)) {
      score += 15
    }

    if (query.complexity_preference === template.complexity_level) {
      score += 10
    }

    if (query.features_needed) {
      const featureMatches = query.features_needed.filter(feature =>
        template.tags?.includes(feature)
      ).length
      score += (featureMatches / query.features_needed.length) * 20
    }

    score += template.rating * 5
    score += Math.min(template.downloads / 100, 10)

    const usagePattern = usagePatterns.find(p => p.template_id === template.id)
    if (usagePattern) {
      const businessTypeMatch = query.business_type &&
        usagePattern.business_types.includes(query.business_type)
      if (businessTypeMatch) score += 15

      const successMetric = usagePattern.success_metrics['overall_success'] || 0
      score += successMetric * 10
    }

    if (template.is_featured) score += 5

    return Math.min(score, 100)
  }

  private generateMatchReasons(template: TemplateMetadata, query: DiscoveryQuery): string[] {
    const reasons: string[] = []

    if (query.business_type && template.business_category?.includes(query.business_type)) {
      reasons.push(`Perfect for ${query.business_type} businesses`)
    }

    if (query.industry && template.industry_tags?.includes(query.industry)) {
      reasons.push(`Optimized for ${query.industry} industry`)
    }

    if (query.complexity_preference === template.complexity_level) {
      reasons.push(`Matches your ${query.complexity_preference} complexity preference`)
    }

    if (template.rating >= 4.5) {
      reasons.push('Highly rated by users')
    }

    if (template.downloads > 1000) {
      reasons.push('Popular choice among developers')
    }

    if (template.is_featured) {
      reasons.push('Featured template with proven success')
    }

    return reasons
  }

  private async generateCustomizationSuggestions(template: TemplateMetadata, query: DiscoveryQuery): Promise<string[]> {
    const suggestions: string[] = []

    if (query.business_type && !template.business_category?.includes(query.business_type)) {
      suggestions.push(`Customize branding for ${query.business_type} business`)
    }

    if (query.features_needed) {
      const missingFeatures = query.features_needed.filter(feature =>
        !template.tags?.includes(feature)
      )

      if (missingFeatures.length > 0) {
        suggestions.push(`Add ${missingFeatures.join(', ')} features`)
      }
    }

    if (query.integration_requirements) {
      suggestions.push(`Configure integrations for ${query.integration_requirements.join(', ')}`)
    }

    if (query.design_preferences) {
      suggestions.push(`Apply ${query.design_preferences.join(', ')} design preferences`)
    }

    return suggestions
  }

  private async generateAIInsights(template: TemplateMetadata, query: DiscoveryQuery): Promise<string[]> {
    const insights: string[] = []

    const avgSetupTime = template.estimated_setup_time || 60
    if (avgSetupTime < 30) {
      insights.push('Quick setup - can be deployed in under 30 minutes')
    } else if (avgSetupTime > 120) {
      insights.push('Complex setup - plan for 2+ hours of configuration')
    }

    if (template.rating >= 4.5 && template.downloads > 500) {
      insights.push('High confidence recommendation based on user success')
    }

    if (template.complexity_level === 'beginner' && query.complexity_preference === 'advanced') {
      insights.push('Consider this as a foundation to build upon')
    }

    if (template.complexity_level === 'advanced' && query.complexity_preference === 'beginner') {
      insights.push('May require additional development experience')
    }

    return insights
  }

  private calculateFeatureCoverage(template: TemplateMetadata, query: DiscoveryQuery): number {
    if (!query.features_needed || query.features_needed.length === 0) return 100

    const matchedFeatures = query.features_needed.filter(feature =>
      template.tags?.includes(feature)
    ).length

    return (matchedFeatures / query.features_needed.length) * 100
  }

  private calculateIntegrationCompatibility(template: TemplateMetadata, query: DiscoveryQuery): number {
    if (!query.integration_requirements || query.integration_requirements.length === 0) return 100

    const templateIntegrations = template.dependencies || []
    const matchedIntegrations = query.integration_requirements.filter(integration =>
      templateIntegrations.some(dep => dep.toLowerCase().includes(integration.toLowerCase()))
    ).length

    return (matchedIntegrations / query.integration_requirements.length) * 100
  }

  private async getUsagePatterns(query: DiscoveryQuery): Promise<TemplateUsagePattern[]> {
    try {
      const { data, error } = await this.supabase
        .from('template_usage_patterns')
        .select('*')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching usage patterns:', error)
      return []
    }
  }

  private async generateSearchInsights(query: DiscoveryQuery): Promise<SearchInsights> {
    try {
      return {
        popular_in_industry: ['e-commerce', 'saas', 'portfolio'],
        trending_features: ['ai-integration', 'real-time-updates', 'mobile-responsive'],
        common_integrations: ['stripe', 'auth0', 'sendgrid'],
        typical_complexity: 'intermediate',
        average_setup_time: 90,
        success_rate: 85,
        user_satisfaction: 4.2,
        business_impact_score: 78
      }
    } catch (error) {
      console.error('Error generating search insights:', error)
      return {
        popular_in_industry: [],
        trending_features: [],
        common_integrations: [],
        typical_complexity: 'intermediate',
        average_setup_time: 60,
        success_rate: 0,
        user_satisfaction: 0,
        business_impact_score: 0
      }
    }
  }

  private async generateAIRecommendations(query: DiscoveryQuery, templates: TemplateRecommendation[]): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = []

    if (templates.length === 0) {
      recommendations.push({
        type: 'alternative_approach',
        title: 'Consider Custom Development',
        description: 'No templates match your exact requirements. Consider custom development or broaden your search criteria.',
        impact: 'high',
        effort: 'high'
      })
    }

    if (query.budget_range === 'free' && templates.every(t => t.template.pricing_tier !== 'free')) {
      recommendations.push({
        type: 'cost_optimization',
        title: 'Premium Templates Recommended',
        description: 'Consider premium templates for better features and support, or look for open-source alternatives.',
        impact: 'medium',
        effort: 'low'
      })
    }

    if (query.timeline === 'immediate' && templates.some(t => t.estimated_setup_time > 120)) {
      recommendations.push({
        type: 'timeline_optimization',
        title: 'Quick Setup Options',
        description: 'Focus on templates with setup time under 2 hours for immediate deployment.',
        impact: 'medium',
        effort: 'low'
      })
    }

    return recommendations
  }

  private async generateRefinementSuggestions(query: DiscoveryQuery, templates: TemplateRecommendation[]): Promise<RefinementSuggestion[]> {
    const suggestions: RefinementSuggestion[] = []

    if (templates.length > 50) {
      suggestions.push({
        type: 'filter',
        suggestion: 'Add more specific filters',
        reason: 'Too many results found',
        expected_impact: 'More focused recommendations',
        filter_updates: { complexity_preference: 'intermediate' }
      })
    }

    if (templates.length < 5) {
      suggestions.push({
        type: 'query',
        suggestion: 'Broaden your search criteria',
        reason: 'Limited results found',
        expected_impact: 'More template options',
        filter_updates: { complexity_preference: undefined }
      })
    }

    return suggestions
  }

  private async findAlternativeTemplates(templates: TemplateRecommendation[], query: DiscoveryQuery): Promise<TemplateRecommendation[]> {
    const alternatives: TemplateRecommendation[] = []

    if (query.business_type) {
      const relatedBusinessTypes = this.getRelatedBusinessTypes(query.business_type)

      for (const businessType of relatedBusinessTypes) {
        const altQuery = { ...query, business_type: businessType }
        const altTemplates = await this.searchTemplatesByQuery(altQuery)

        if (altTemplates.length > 0) {
          const topAlt = altTemplates[0]
          alternatives.push({
            template: topAlt,
            relevance_score: 60,
            match_reasons: [`Alternative for ${businessType} businesses`],
            customization_suggestions: [`Adapt from ${businessType} to ${query.business_type}`],
            estimated_setup_time: (topAlt.estimated_setup_time || 60) + 30,
            complexity_match: false,
            feature_coverage: 70,
            integration_compatibility: 80,
            ai_insights: ['Consider as alternative approach']
          })
        }
      }
    }

    return alternatives
  }

  private getRelatedBusinessTypes(businessType: string): string[] {
    const relations: Record<string, string[]> = {
      'e-commerce': ['retail', 'marketplace', 'subscription'],
      'saas': ['software', 'platform', 'service'],
      'consulting': ['agency', 'professional-services', 'freelance'],
      'restaurant': ['hospitality', 'food-service', 'local-business']
    }

    return relations[businessType] || []
  }

  private async profileToQuery(profile: UserProfile): Promise<DiscoveryQuery> {
    return {
      business_type: profile.business_type,
      industry: profile.industry,
      complexity_preference: profile.preferred_complexity as any,
      features_needed: profile.favorite_features,
      integration_requirements: profile.integration_preferences
    }
  }

  private async personalizeRecommendations(
    templates: TemplateRecommendation[],
    profile: UserProfile
  ): Promise<TemplateRecommendation[]> {
    return templates.map(template => {
      let personalizedScore = template.relevance_score

      if (profile.previous_templates?.includes(template.template.id)) {
        personalizedScore -= 20
      }

      if (profile.experience_level === 'beginner' && template.template.complexity_level === 'beginner') {
        personalizedScore += 15
      }

      if (profile.favorite_features) {
        const featureMatches = profile.favorite_features.filter(feature =>
          template.template.tags?.includes(feature)
        ).length
        personalizedScore += featureMatches * 5
      }

      return {
        ...template,
        relevance_score: Math.min(personalizedScore, 100)
      }
    }).sort((a, b) => b.relevance_score - a.relevance_score)
  }

  private async generateLearningInsights(profile: UserProfile, templates: TemplateRecommendation[]): Promise<string[]> {
    const insights: string[] = []

    if (profile.experience_level === 'beginner') {
      insights.push('Start with simpler templates to build confidence')
      insights.push('Focus on templates with good documentation')
    }

    if (templates.some(t => t.template.complexity_level === 'advanced')) {
      insights.push('Consider advanced templates for learning new patterns')
    }

    return insights
  }

  private async generateNextSteps(profile: UserProfile, templates: TemplateRecommendation[]): Promise<string[]> {
    const steps: string[] = []

    if (templates.length > 0) {
      steps.push(`Start with ${templates[0].template.name} for best fit`)
      steps.push('Review customization requirements')
      steps.push('Set up development environment')
    }

    return steps
  }

  private async extractQueryFromDescription(description: string): Promise<DiscoveryQuery> {
    const keywords = description.toLowerCase().split(' ')

    const businessTypes = ['e-commerce', 'saas', 'blog', 'portfolio', 'restaurant']
    const features = ['authentication', 'payment', 'cms', 'analytics', 'api']

    const detectedBusinessType = businessTypes.find(type => keywords.includes(type))
    const detectedFeatures = features.filter(feature => keywords.includes(feature))

    return {
      query: description,
      business_type: detectedBusinessType,
      features_needed: detectedFeatures,
      complexity_preference: keywords.includes('simple') ? 'beginner' : 'intermediate'
    }
  }

  private generateCacheKey(query: DiscoveryQuery): string {
    return `discovery_${JSON.stringify(query)}`
  }

  private getCachedResult(key: string): DiscoveryResult | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() < cached.expiry) {
      return cached.data
    }
    return null
  }

  private setCachedResult(key: string, data: DiscoveryResult): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL
    })
  }

  private getEmptyResult(): DiscoveryResult {
    return {
      templates: [],
      alternatives: [],
      recommendations: [],
      total_matches: 0,
      search_insights: {
        popular_in_industry: [],
        trending_features: [],
        common_integrations: [],
        typical_complexity: 'intermediate',
        average_setup_time: 60,
        success_rate: 0,
        user_satisfaction: 0,
        business_impact_score: 0
      },
      refinement_suggestions: []
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const templateDiscoveryEngine = new TemplateDiscoveryEngine()