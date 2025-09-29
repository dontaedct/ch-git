import { TemplateMetadata } from './template-registry'

export interface CategoryHierarchy {
  id: string
  name: string
  description: string
  parent_id?: string
  level: number
  icon?: string
  color?: string
  children?: CategoryHierarchy[]
  template_count: number
  is_active: boolean
  sort_order: number
  metadata: CategoryMetadata
}

export interface CategoryMetadata {
  keywords: string[]
  typical_features: string[]
  complexity_distribution: Record<string, number>
  pricing_distribution: Record<string, number>
  popularity_score: number
  success_rate: number
  average_setup_time: number
  common_integrations: string[]
  business_types: string[]
  industry_focus: string[]
}

export interface CategoryFilter {
  categories?: string[]
  business_types?: string[]
  industries?: string[]
  complexity_levels?: string[]
  pricing_tiers?: string[]
  features?: string[]
  integrations?: string[]
  include_subcategories?: boolean
}

export interface CategoryInsights {
  category_id: string
  trending_templates: string[]
  popular_features: string[]
  growth_rate: number
  user_satisfaction: number
  typical_project_size: string
  success_stories: string[]
  common_challenges: string[]
  best_practices: string[]
}

export interface CategoryRecommendation {
  category: CategoryHierarchy
  relevance_score: number
  match_reasons: string[]
  template_count: number
  estimated_success_rate: number
  typical_timeline: string
  recommended_complexity: string
  key_benefits: string[]
}

export interface AutoCategorizationResult {
  suggested_categories: string[]
  confidence_scores: Record<string, number>
  feature_analysis: FeatureAnalysis
  business_type_prediction: BusinessTypePrediction
  complexity_assessment: ComplexityAssessment
  recommendations: string[]
}

export interface FeatureAnalysis {
  detected_features: string[]
  primary_features: string[]
  secondary_features: string[]
  missing_features: string[]
  feature_completeness: number
}

export interface BusinessTypePrediction {
  predicted_type: string
  confidence: number
  alternative_types: Array<{ type: string; confidence: number }>
  reasoning: string[]
}

export interface ComplexityAssessment {
  predicted_level: 'beginner' | 'intermediate' | 'advanced'
  confidence: number
  complexity_factors: string[]
  time_estimate: number
  skill_requirements: string[]
}

export class TemplateCategorization {
  private categories: Map<string, CategoryHierarchy> = new Map()
  private categoryInsights: Map<string, CategoryInsights> = new Map()
  private featureKeywords: Map<string, string[]> = new Map()

  constructor() {
    this.initializeCategories()
    this.initializeFeatureKeywords()
  }

  async getCategoryHierarchy(): Promise<CategoryHierarchy[]> {
    try {
      const rootCategories = Array.from(this.categories.values())
        .filter(cat => !cat.parent_id)
        .sort((a, b) => a.sort_order - b.sort_order)

      for (const category of rootCategories) {
        category.children = await this.getCategoryChildren(category.id)
      }

      return rootCategories
    } catch (error) {
      console.error('Error getting category hierarchy:', error)
      return []
    }
  }

  async getCategoryById(category_id: string): Promise<CategoryHierarchy | null> {
    return this.categories.get(category_id) || null
  }

  async getCategoriesByFilter(filter: CategoryFilter): Promise<CategoryHierarchy[]> {
    try {
      let categories = Array.from(this.categories.values())

      if (filter.categories && filter.categories.length > 0) {
        categories = categories.filter(cat => filter.categories!.includes(cat.id))

        if (filter.include_subcategories) {
          const subcategories = await this.getSubcategoriesForCategories(filter.categories)
          categories = [...categories, ...subcategories]
        }
      }

      if (filter.business_types && filter.business_types.length > 0) {
        categories = categories.filter(cat =>
          filter.business_types!.some(type => cat.metadata.business_types.includes(type))
        )
      }

      if (filter.industries && filter.industries.length > 0) {
        categories = categories.filter(cat =>
          filter.industries!.some(industry => cat.metadata.industry_focus.includes(industry))
        )
      }

      if (filter.complexity_levels && filter.complexity_levels.length > 0) {
        categories = categories.filter(cat => {
          const hasComplexity = filter.complexity_levels!.some(level =>
            cat.metadata.complexity_distribution[level] > 0
          )
          return hasComplexity
        })
      }

      if (filter.pricing_tiers && filter.pricing_tiers.length > 0) {
        categories = categories.filter(cat => {
          const hasPricing = filter.pricing_tiers!.some(tier =>
            cat.metadata.pricing_distribution[tier] > 0
          )
          return hasPricing
        })
      }

      if (filter.features && filter.features.length > 0) {
        categories = categories.filter(cat =>
          filter.features!.some(feature => cat.metadata.typical_features.includes(feature))
        )
      }

      if (filter.integrations && filter.integrations.length > 0) {
        categories = categories.filter(cat =>
          filter.integrations!.some(integration => cat.metadata.common_integrations.includes(integration))
        )
      }

      return categories.filter(cat => cat.is_active)
        .sort((a, b) => b.metadata.popularity_score - a.metadata.popularity_score)
    } catch (error) {
      console.error('Error filtering categories:', error)
      return []
    }
  }

  async suggestCategoriesForTemplate(template: TemplateMetadata): Promise<AutoCategorizationResult> {
    try {
      const featureAnalysis = this.analyzeTemplateFeatures(template)
      const businessTypePrediction = this.predictBusinessType(template)
      const complexityAssessment = this.assessComplexity(template)

      const categoryScores = await this.calculateCategoryScores(template, featureAnalysis, businessTypePrediction)
      const suggestedCategories = Object.entries(categoryScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([categoryId]) => categoryId)

      const recommendations = this.generateCategorizationRecommendations(
        featureAnalysis,
        businessTypePrediction,
        complexityAssessment
      )

      return {
        suggested_categories: suggestedCategories,
        confidence_scores: categoryScores,
        feature_analysis: featureAnalysis,
        business_type_prediction: businessTypePrediction,
        complexity_assessment: complexityAssessment,
        recommendations
      }
    } catch (error) {
      console.error('Error suggesting categories for template:', error)
      return this.getEmptyAutoCategorizationResult()
    }
  }

  async getCategoryRecommendationsForUser(
    userPreferences: {
      business_type?: string
      industry?: string
      experience_level?: string
      project_type?: string
      budget?: string
      timeline?: string
    }
  ): Promise<CategoryRecommendation[]> {
    try {
      const categories = Array.from(this.categories.values())
      const recommendations: CategoryRecommendation[] = []

      for (const category of categories) {
        if (!category.is_active) continue

        const relevanceScore = this.calculateCategoryRelevance(category, userPreferences)
        if (relevanceScore < 20) continue

        const matchReasons = this.generateCategoryMatchReasons(category, userPreferences)
        const estimatedSuccessRate = category.metadata.success_rate
        const typicalTimeline = this.estimateTimeline(category, userPreferences.timeline)
        const recommendedComplexity = this.recommendComplexity(category, userPreferences.experience_level)
        const keyBenefits = this.generateCategoryBenefits(category)

        recommendations.push({
          category,
          relevance_score: relevanceScore,
          match_reasons: matchReasons,
          template_count: category.template_count,
          estimated_success_rate: estimatedSuccessRate,
          typical_timeline: typicalTimeline,
          recommended_complexity: recommendedComplexity,
          key_benefits: keyBenefits
        })
      }

      return recommendations
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 10)
    } catch (error) {
      console.error('Error getting category recommendations:', error)
      return []
    }
  }

  async getCategoryInsights(category_id: string): Promise<CategoryInsights | null> {
    try {
      return this.categoryInsights.get(category_id) || null
    } catch (error) {
      console.error('Error getting category insights:', error)
      return null
    }
  }

  async getTrendingCategories(limit: number = 10): Promise<CategoryHierarchy[]> {
    try {
      const categories = Array.from(this.categories.values())
        .filter(cat => cat.is_active)
        .sort((a, b) => {
          const aGrowth = this.categoryInsights.get(a.id)?.growth_rate || 0
          const bGrowth = this.categoryInsights.get(b.id)?.growth_rate || 0
          return bGrowth - aGrowth
        })
        .slice(0, limit)

      return categories
    } catch (error) {
      console.error('Error getting trending categories:', error)
      return []
    }
  }

  async updateCategoryMetadata(category_id: string, templates: TemplateMetadata[]): Promise<void> {
    try {
      const category = this.categories.get(category_id)
      if (!category) return

      const metadata = this.calculateCategoryMetadata(templates)
      category.metadata = metadata
      category.template_count = templates.length

      this.categories.set(category_id, category)
    } catch (error) {
      console.error('Error updating category metadata:', error)
    }
  }

  private async getCategoryChildren(parent_id: string): Promise<CategoryHierarchy[]> {
    const children = Array.from(this.categories.values())
      .filter(cat => cat.parent_id === parent_id)
      .sort((a, b) => a.sort_order - b.sort_order)

    for (const child of children) {
      child.children = await this.getCategoryChildren(child.id)
    }

    return children
  }

  private async getSubcategoriesForCategories(category_ids: string[]): Promise<CategoryHierarchy[]> {
    const subcategories: CategoryHierarchy[] = []

    for (const categoryId of category_ids) {
      const children = await this.getCategoryChildren(categoryId)
      subcategories.push(...children)

      for (const child of children) {
        if (child.children) {
          subcategories.push(...child.children)
        }
      }
    }

    return subcategories
  }

  private analyzeTemplateFeatures(template: TemplateMetadata): FeatureAnalysis {
    const detectedFeatures = template.tags || []
    const primaryFeatures = detectedFeatures.slice(0, 3)
    const secondaryFeatures = detectedFeatures.slice(3)

    const allPossibleFeatures = Array.from(this.featureKeywords.keys())
    const missingFeatures = allPossibleFeatures.filter(feature =>
      !detectedFeatures.includes(feature)
    ).slice(0, 5)

    const completeness = detectedFeatures.length / Math.max(allPossibleFeatures.length, 10) * 100

    return {
      detected_features: detectedFeatures,
      primary_features: primaryFeatures,
      secondary_features: secondaryFeatures,
      missing_features: missingFeatures,
      feature_completeness: Math.min(completeness, 100)
    }
  }

  private predictBusinessType(template: TemplateMetadata): BusinessTypePrediction {
    const businessTypes = template.business_category || []

    if (businessTypes.length > 0) {
      return {
        predicted_type: businessTypes[0],
        confidence: 85,
        alternative_types: businessTypes.slice(1).map(type => ({ type, confidence: 70 })),
        reasoning: ['Based on template business category metadata']
      }
    }

    const keywords = [...(template.tags || []), template.name.toLowerCase(), template.description.toLowerCase()]
    const typeScores: Record<string, number> = {}

    const businessTypeKeywords = {
      'e-commerce': ['shop', 'store', 'cart', 'payment', 'product', 'commerce'],
      'saas': ['subscription', 'dashboard', 'api', 'service', 'platform'],
      'blog': ['blog', 'post', 'article', 'content', 'cms'],
      'portfolio': ['portfolio', 'showcase', 'gallery', 'work', 'project'],
      'restaurant': ['restaurant', 'menu', 'food', 'order', 'booking'],
      'agency': ['agency', 'client', 'service', 'consultation', 'team'],
      'startup': ['startup', 'landing', 'mvp', 'launch', 'beta']
    }

    for (const [businessType, typeKeywords] of Object.entries(businessTypeKeywords)) {
      const matches = typeKeywords.filter(keyword =>
        keywords.some(k => k.includes(keyword))
      ).length
      typeScores[businessType] = (matches / typeKeywords.length) * 100
    }

    const topType = Object.entries(typeScores)
      .sort(([, a], [, b]) => b - a)[0]

    const alternatives = Object.entries(typeScores)
      .sort(([, a], [, b]) => b - a)
      .slice(1, 3)
      .map(([type, confidence]) => ({ type, confidence }))

    return {
      predicted_type: topType?.[0] || 'general',
      confidence: topType?.[1] || 50,
      alternative_types: alternatives,
      reasoning: ['Based on template keywords and description analysis']
    }
  }

  private assessComplexity(template: TemplateMetadata): ComplexityAssessment {
    const existingLevel = template.complexity_level
    if (existingLevel) {
      return {
        predicted_level: existingLevel,
        confidence: 90,
        complexity_factors: ['Explicitly set in template metadata'],
        time_estimate: template.estimated_setup_time || 60,
        skill_requirements: this.getSkillRequirements(existingLevel)
      }
    }

    const dependencies = template.dependencies || []
    const features = template.tags || []

    let complexityScore = 0
    const factors: string[] = []

    if (dependencies.length > 5) {
      complexityScore += 30
      factors.push('Many dependencies required')
    }

    if (features.includes('authentication') || features.includes('database')) {
      complexityScore += 20
      factors.push('Complex backend requirements')
    }

    if (features.includes('payment') || features.includes('api')) {
      complexityScore += 25
      factors.push('External service integrations')
    }

    if (features.includes('real-time') || features.includes('websockets')) {
      complexityScore += 35
      factors.push('Real-time functionality')
    }

    let predictedLevel: 'beginner' | 'intermediate' | 'advanced'
    if (complexityScore < 30) {
      predictedLevel = 'beginner'
    } else if (complexityScore < 70) {
      predictedLevel = 'intermediate'
    } else {
      predictedLevel = 'advanced'
    }

    const timeEstimate = this.estimateSetupTime(predictedLevel, features.length)
    const skillRequirements = this.getSkillRequirements(predictedLevel)

    return {
      predicted_level: predictedLevel,
      confidence: Math.min(complexityScore + 20, 95),
      complexity_factors: factors,
      time_estimate: timeEstimate,
      skill_requirements: skillRequirements
    }
  }

  private async calculateCategoryScores(
    template: TemplateMetadata,
    featureAnalysis: FeatureAnalysis,
    businessTypePrediction: BusinessTypePrediction
  ): Promise<Record<string, number>> {
    const scores: Record<string, number> = {}

    for (const [categoryId, category] of this.categories) {
      let score = 0

      if (category.metadata.business_types.includes(businessTypePrediction.predicted_type)) {
        score += 40
      }

      const featureMatches = featureAnalysis.detected_features.filter(feature =>
        category.metadata.typical_features.includes(feature)
      ).length
      score += (featureMatches / Math.max(featureAnalysis.detected_features.length, 1)) * 30

      const keywordMatches = category.metadata.keywords.filter(keyword =>
        template.name.toLowerCase().includes(keyword) ||
        template.description.toLowerCase().includes(keyword)
      ).length
      score += keywordMatches * 10

      if (template.complexity_level && category.metadata.complexity_distribution[template.complexity_level]) {
        score += 20
      }

      if (template.pricing_tier && category.metadata.pricing_distribution[template.pricing_tier]) {
        score += 15
      }

      scores[categoryId] = Math.min(score, 100)
    }

    return scores
  }

  private generateCategorizationRecommendations(
    featureAnalysis: FeatureAnalysis,
    businessTypePrediction: BusinessTypePrediction,
    complexityAssessment: ComplexityAssessment
  ): string[] {
    const recommendations: string[] = []

    if (businessTypePrediction.confidence < 70) {
      recommendations.push('Consider adding more specific business type indicators')
    }

    if (featureAnalysis.feature_completeness < 50) {
      recommendations.push('Add more feature tags to improve categorization accuracy')
    }

    if (complexityAssessment.confidence < 60) {
      recommendations.push('Specify complexity level explicitly for better matching')
    }

    if (featureAnalysis.missing_features.length > 3) {
      recommendations.push(`Consider adding: ${featureAnalysis.missing_features.slice(0, 3).join(', ')}`)
    }

    return recommendations
  }

  private calculateCategoryRelevance(
    category: CategoryHierarchy,
    userPreferences: any
  ): number {
    let score = 0

    if (userPreferences.business_type && category.metadata.business_types.includes(userPreferences.business_type)) {
      score += 40
    }

    if (userPreferences.industry && category.metadata.industry_focus.includes(userPreferences.industry)) {
      score += 30
    }

    if (userPreferences.experience_level) {
      const complexityMatch = category.metadata.complexity_distribution[userPreferences.experience_level] || 0
      score += complexityMatch * 20
    }

    if (userPreferences.budget) {
      const budgetMatch = category.metadata.pricing_distribution[userPreferences.budget] || 0
      score += budgetMatch * 15
    }

    score += category.metadata.popularity_score * 0.1
    score += category.metadata.success_rate * 0.15

    return Math.min(score, 100)
  }

  private generateCategoryMatchReasons(category: CategoryHierarchy, userPreferences: any): string[] {
    const reasons: string[] = []

    if (userPreferences.business_type && category.metadata.business_types.includes(userPreferences.business_type)) {
      reasons.push(`Perfect for ${userPreferences.business_type} businesses`)
    }

    if (userPreferences.industry && category.metadata.industry_focus.includes(userPreferences.industry)) {
      reasons.push(`Tailored for ${userPreferences.industry} industry`)
    }

    if (category.metadata.success_rate > 80) {
      reasons.push('High success rate among users')
    }

    if (category.metadata.popularity_score > 70) {
      reasons.push('Popular choice in the community')
    }

    return reasons
  }

  private estimateTimeline(category: CategoryHierarchy, userTimeline?: string): string {
    const avgSetupTime = category.metadata.average_setup_time

    if (avgSetupTime < 60) return 'Same day'
    if (avgSetupTime < 240) return '1-2 days'
    if (avgSetupTime < 480) return '3-5 days'
    return '1+ weeks'
  }

  private recommendComplexity(category: CategoryHierarchy, experienceLevel?: string): string {
    const distribution = category.metadata.complexity_distribution
    const sorted = Object.entries(distribution).sort(([, a], [, b]) => b - a)
    return sorted[0]?.[0] || 'intermediate'
  }

  private generateCategoryBenefits(category: CategoryHierarchy): string[] {
    const benefits: string[] = []

    if (category.metadata.success_rate > 80) {
      benefits.push('High success rate')
    }

    if (category.metadata.average_setup_time < 120) {
      benefits.push('Quick setup')
    }

    if (category.template_count > 10) {
      benefits.push('Many template options')
    }

    if (category.metadata.common_integrations.length > 5) {
      benefits.push('Rich integrations available')
    }

    return benefits
  }

  private getSkillRequirements(level: string): string[] {
    const requirements: Record<string, string[]> = {
      beginner: ['Basic HTML/CSS', 'Following documentation'],
      intermediate: ['JavaScript basics', 'Framework knowledge', 'API integration'],
      advanced: ['Advanced programming', 'System architecture', 'Performance optimization']
    }

    return requirements[level] || requirements.intermediate
  }

  private estimateSetupTime(level: string, featureCount: number): number {
    const baseTimes: Record<string, number> = {
      beginner: 30,
      intermediate: 60,
      advanced: 120
    }

    return (baseTimes[level] || 60) + (featureCount * 10)
  }

  private calculateCategoryMetadata(templates: TemplateMetadata[]): CategoryMetadata {
    const allTags = templates.flatMap(t => t.tags || [])
    const typicalFeatures = this.getMostCommon(allTags, 10)

    const complexityDist = this.getDistribution(templates, 'complexity_level')
    const pricingDist = this.getDistribution(templates, 'pricing_tier')

    const avgRating = templates.reduce((sum, t) => sum + (t.rating || 0), 0) / templates.length
    const avgSetupTime = templates.reduce((sum, t) => sum + (t.estimated_setup_time || 60), 0) / templates.length

    return {
      keywords: typicalFeatures.slice(0, 5),
      typical_features: typicalFeatures,
      complexity_distribution: complexityDist,
      pricing_distribution: pricingDist,
      popularity_score: Math.min(templates.length * 2, 100),
      success_rate: avgRating * 20,
      average_setup_time: avgSetupTime,
      common_integrations: this.getMostCommon(
        templates.flatMap(t => t.dependencies || []), 5
      ),
      business_types: this.getMostCommon(
        templates.flatMap(t => t.business_category || []), 3
      ),
      industry_focus: this.getMostCommon(
        templates.flatMap(t => t.industry_tags || []), 3
      )
    }
  }

  private getMostCommon(items: string[], limit: number): string[] {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item)
  }

  private getDistribution(templates: TemplateMetadata[], field: keyof TemplateMetadata): Record<string, number> {
    const counts = templates.reduce((acc, template) => {
      const value = template[field] as string
      if (value) {
        acc[value] = (acc[value] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const total = templates.length
    const distribution: Record<string, number> = {}

    for (const [key, count] of Object.entries(counts)) {
      distribution[key] = (count / total) * 100
    }

    return distribution
  }

  private getEmptyAutoCategorizationResult(): AutoCategorizationResult {
    return {
      suggested_categories: [],
      confidence_scores: {},
      feature_analysis: {
        detected_features: [],
        primary_features: [],
        secondary_features: [],
        missing_features: [],
        feature_completeness: 0
      },
      business_type_prediction: {
        predicted_type: 'general',
        confidence: 0,
        alternative_types: [],
        reasoning: []
      },
      complexity_assessment: {
        predicted_level: 'intermediate',
        confidence: 0,
        complexity_factors: [],
        time_estimate: 60,
        skill_requirements: []
      },
      recommendations: []
    }
  }

  private initializeCategories(): void {
    const categories: CategoryHierarchy[] = [
      {
        id: 'business',
        name: 'Business',
        description: 'Templates for business applications',
        level: 0,
        template_count: 0,
        is_active: true,
        sort_order: 1,
        metadata: this.getDefaultMetadata(),
        icon: 'building',
        color: '#3B82F6'
      },
      {
        id: 'e-commerce',
        name: 'E-Commerce',
        description: 'Online store and shopping templates',
        parent_id: 'business',
        level: 1,
        template_count: 0,
        is_active: true,
        sort_order: 1,
        metadata: this.getDefaultMetadata(),
        icon: 'shopping-cart',
        color: '#10B981'
      },
      {
        id: 'saas',
        name: 'SaaS',
        description: 'Software as a Service applications',
        parent_id: 'business',
        level: 1,
        template_count: 0,
        is_active: true,
        sort_order: 2,
        metadata: this.getDefaultMetadata(),
        icon: 'server',
        color: '#8B5CF6'
      },
      {
        id: 'creative',
        name: 'Creative',
        description: 'Portfolio and creative showcase templates',
        level: 0,
        template_count: 0,
        is_active: true,
        sort_order: 2,
        metadata: this.getDefaultMetadata(),
        icon: 'palette',
        color: '#F59E0B'
      },
      {
        id: 'portfolio',
        name: 'Portfolio',
        description: 'Personal and professional portfolios',
        parent_id: 'creative',
        level: 1,
        template_count: 0,
        is_active: true,
        sort_order: 1,
        metadata: this.getDefaultMetadata(),
        icon: 'briefcase',
        color: '#EF4444'
      }
    ]

    categories.forEach(cat => this.categories.set(cat.id, cat))
  }

  private initializeFeatureKeywords(): void {
    const featureKeywords = {
      'authentication': ['auth', 'login', 'signup', 'user', 'session'],
      'payment': ['payment', 'stripe', 'checkout', 'billing', 'subscription'],
      'database': ['database', 'sql', 'mongodb', 'prisma', 'orm'],
      'api': ['api', 'rest', 'graphql', 'endpoint', 'backend'],
      'cms': ['cms', 'content', 'admin', 'editor', 'publishing'],
      'real-time': ['realtime', 'websocket', 'live', 'chat', 'notifications'],
      'analytics': ['analytics', 'tracking', 'metrics', 'stats', 'reporting'],
      'mobile': ['mobile', 'responsive', 'pwa', 'app', 'touch'],
      'seo': ['seo', 'meta', 'sitemap', 'optimization', 'search'],
      'performance': ['performance', 'speed', 'cache', 'optimization', 'lazy']
    }

    Object.entries(featureKeywords).forEach(([feature, keywords]) => {
      this.featureKeywords.set(feature, keywords)
    })
  }

  private getDefaultMetadata(): CategoryMetadata {
    return {
      keywords: [],
      typical_features: [],
      complexity_distribution: {},
      pricing_distribution: {},
      popularity_score: 0,
      success_rate: 0,
      average_setup_time: 60,
      common_integrations: [],
      business_types: [],
      industry_focus: []
    }
  }
}

export const templateCategorization = new TemplateCategorization()