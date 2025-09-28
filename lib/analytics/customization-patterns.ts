import { supabase } from '@/lib/supabase/client'

export interface CustomizationPattern {
  id: string
  templateId: string
  patternName: string
  patternType: 'visual' | 'functional' | 'content' | 'integration' | 'workflow'
  frequency: number
  customizations: {
    field: string
    originalValue: any
    customizedValue: any
    changeType: 'add' | 'modify' | 'remove' | 'replace'
  }[]
  clientProfiles: {
    industry: string
    companySize: string
    budget: string
    technicalLevel: string
  }[]
  outcomes: {
    deploymentSuccess: boolean
    clientSatisfaction: number
    timeToDeployment: number
    revenueGenerated: number
  }
  insights: {
    commonUseCase: string
    recommendedFor: string[]
    complexity: 'low' | 'medium' | 'high'
    riskLevel: 'low' | 'medium' | 'high'
  }
}

export interface CustomizationTrend {
  templateId: string
  trendPeriod: string
  emergingPatterns: CustomizationPattern[]
  decliningPatterns: CustomizationPattern[]
  stablePatterns: CustomizationPattern[]
  predictions: {
    likelyToEmerge: string[]
    likelyToDecline: string[]
    growthOpportunities: string[]
  }
}

export interface ClientCustomizationPreference {
  clientId: string
  industry: string
  companySize: string
  preferredPatterns: CustomizationPattern[]
  avoidedPatterns: CustomizationPattern[]
  customizationStyle: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    innovationLevel: 'standard' | 'advanced' | 'cutting-edge'
    customizationDepth: 'surface' | 'moderate' | 'deep'
  }
  successMetrics: {
    averageTimeToDeployment: number
    satisfactionScore: number
    retentionRate: number
  }
}

export interface CustomizationRecommendation {
  templateId: string
  clientId: string
  recommendedPatterns: {
    pattern: CustomizationPattern
    confidence: number
    reasoning: string[]
    expectedOutcomes: {
      deploymentTime: number
      successProbability: number
      satisfactionScore: number
    }
  }[]
  warningsAndRisks: {
    pattern: string
    risk: string
    mitigation: string
  }[]
  alternativeApproaches: {
    description: string
    patterns: CustomizationPattern[]
    tradeoffs: string[]
  }[]
}

export class CustomizationPatternAnalyzer {
  async discoverCustomizationPatterns(templateId?: string): Promise<CustomizationPattern[]> {
    try {
      let query = supabase
        .from('client_customizations')
        .select(`
          *,
          clients(industry, company_size, budget_range),
          client_deployments(status, deployment_time_minutes, client_satisfaction_score),
          templates(name, category)
        `)

      if (templateId) {
        query = query.eq('template_id', templateId)
      }

      const { data: customizations, error } = await query

      if (error) {
        throw new Error(`Failed to fetch customizations: ${error.message}`)
      }

      return this.analyzeCustomizationPatterns(customizations || [])
    } catch (error) {
      console.error('Error discovering customization patterns:', error)
      return []
    }
  }

  async getCustomizationTrends(
    templateId: string,
    periodMonths: number = 12
  ): Promise<CustomizationTrend | null> {
    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - periodMonths)

      const { data: customizations, error } = await supabase
        .from('client_customizations')
        .select(`
          *,
          clients(industry, company_size),
          client_deployments(status, client_satisfaction_score)
        `)
        .eq('template_id', templateId)
        .gte('created_at', startDate.toISOString())

      if (error) {
        throw new Error(`Failed to fetch customization trends: ${error.message}`)
      }

      const patterns = await this.analyzeCustomizationPatterns(customizations || [])
      const trendAnalysis = this.analyzeTrends(patterns, periodMonths)

      return {
        templateId,
        trendPeriod: `${periodMonths} months`,
        ...trendAnalysis
      }
    } catch (error) {
      console.error('Error getting customization trends:', error)
      return null
    }
  }

  async getClientCustomizationPreferences(clientId: string): Promise<ClientCustomizationPreference | null> {
    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError || !client) {
        throw new Error('Client not found')
      }

      const { data: customizations, error: customizationsError } = await supabase
        .from('client_customizations')
        .select(`
          *,
          client_deployments(status, deployment_time_minutes, client_satisfaction_score)
        `)
        .eq('client_id', clientId)

      if (customizationsError) {
        throw new Error(`Failed to fetch client customizations: ${customizationsError.message}`)
      }

      const patterns = await this.analyzeCustomizationPatterns(customizations || [])
      const preferences = this.analyzeClientPreferences(client, patterns)

      return preferences
    } catch (error) {
      console.error('Error getting client customization preferences:', error)
      return null
    }
  }

  async generateCustomizationRecommendations(
    templateId: string,
    clientId: string
  ): Promise<CustomizationRecommendation | null> {
    try {
      // Get client preferences
      const clientPreferences = await this.getClientCustomizationPreferences(clientId)

      // Get template patterns
      const templatePatterns = await this.discoverCustomizationPatterns(templateId)

      // Get similar client patterns
      const { data: client } = await supabase
        .from('clients')
        .select('industry, company_size, budget_range')
        .eq('id', clientId)
        .single()

      if (!client || !clientPreferences) {
        throw new Error('Insufficient data for recommendations')
      }

      const similarClientPatterns = await this.getSimilarClientPatterns(client)

      const recommendations = this.generateRecommendations(
        templateId,
        clientId,
        clientPreferences,
        templatePatterns,
        similarClientPatterns
      )

      return recommendations
    } catch (error) {
      console.error('Error generating customization recommendations:', error)
      return null
    }
  }

  async getPopularCustomizationCombinations(templateId: string): Promise<{
    combination: string[]
    frequency: number
    successRate: number
    averageOutcome: {
      deploymentTime: number
      satisfaction: number
      revenue: number
    }
  }[]> {
    try {
      const { data: customizations, error } = await supabase
        .from('client_customizations')
        .select(`
          customization_data,
          client_deployments(status, deployment_time_minutes, client_satisfaction_score, revenue_generated)
        `)
        .eq('template_id', templateId)

      if (error) {
        throw new Error(`Failed to fetch customizations: ${error.message}`)
      }

      return this.analyzeCombinations(customizations || [])
    } catch (error) {
      console.error('Error getting popular customization combinations:', error)
      return []
    }
  }

  private analyzeCustomizationPatterns(customizations: any[]): CustomizationPattern[] {
    const patternMap = new Map<string, any>()

    customizations.forEach(customization => {
      if (!customization.customization_data) return

      const changes = customization.customization_data.changes || []

      changes.forEach((change: any) => {
        const patternKey = this.generatePatternKey(change)

        if (!patternMap.has(patternKey)) {
          patternMap.set(patternKey, {
            id: patternKey,
            templateId: customization.template_id,
            patternName: this.generatePatternName(change),
            patternType: this.classifyPatternType(change),
            frequency: 0,
            customizations: [],
            clientProfiles: [],
            outcomes: []
          })
        }

        const pattern = patternMap.get(patternKey)
        pattern.frequency++
        pattern.customizations.push({
          field: change.field,
          originalValue: change.originalValue,
          customizedValue: change.customizedValue,
          changeType: change.changeType
        })

        if (customization.clients) {
          pattern.clientProfiles.push({
            industry: customization.clients.industry,
            companySize: customization.clients.company_size,
            budget: customization.clients.budget_range,
            technicalLevel: customization.clients.technical_level || 'unknown'
          })
        }

        if (customization.client_deployments) {
          pattern.outcomes.push({
            deploymentSuccess: customization.client_deployments.status === 'success',
            clientSatisfaction: customization.client_deployments.client_satisfaction_score || 0,
            timeToDeployment: customization.client_deployments.deployment_time_minutes || 0,
            revenueGenerated: customization.client_deployments.revenue_generated || 0
          })
        }
      })
    })

    return Array.from(patternMap.values()).map(pattern => ({
      ...pattern,
      insights: this.generatePatternInsights(pattern)
    }))
  }

  private generatePatternKey(change: any): string {
    return `${change.field}-${change.changeType}-${this.normalizeValue(change.customizedValue)}`
  }

  private generatePatternName(change: any): string {
    const field = change.field.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())
    const action = change.changeType === 'add' ? 'Addition' :
                   change.changeType === 'modify' ? 'Modification' :
                   change.changeType === 'remove' ? 'Removal' : 'Replacement'

    return `${field} ${action}`
  }

  private classifyPatternType(change: any): CustomizationPattern['patternType'] {
    const field = change.field.toLowerCase()

    if (field.includes('color') || field.includes('theme') || field.includes('logo') || field.includes('style')) {
      return 'visual'
    } else if (field.includes('workflow') || field.includes('process') || field.includes('step')) {
      return 'workflow'
    } else if (field.includes('api') || field.includes('integration') || field.includes('webhook')) {
      return 'integration'
    } else if (field.includes('text') || field.includes('content') || field.includes('message')) {
      return 'content'
    } else {
      return 'functional'
    }
  }

  private normalizeValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value).toLowerCase()
  }

  private generatePatternInsights(pattern: any): CustomizationPattern['insights'] {
    const outcomes = pattern.outcomes
    const avgSatisfaction = outcomes.length > 0
      ? outcomes.reduce((acc: number, o: any) => acc + o.clientSatisfaction, 0) / outcomes.length
      : 0

    const successRate = outcomes.length > 0
      ? outcomes.filter((o: any) => o.deploymentSuccess).length / outcomes.length
      : 0

    const avgDeploymentTime = outcomes.length > 0
      ? outcomes.reduce((acc: number, o: any) => acc + o.timeToDeployment, 0) / outcomes.length
      : 0

    const complexity = avgDeploymentTime > 60 ? 'high' : avgDeploymentTime > 30 ? 'medium' : 'low'
    const riskLevel = successRate < 0.7 ? 'high' : successRate < 0.9 ? 'medium' : 'low'

    const industries = pattern.clientProfiles.map((p: any) => p.industry).filter(Boolean)
    const uniqueIndustries = [...new Set(industries)]

    return {
      commonUseCase: this.determineCommonUseCase(pattern),
      recommendedFor: uniqueIndustries.slice(0, 3),
      complexity,
      riskLevel
    }
  }

  private determineCommonUseCase(pattern: any): string {
    const patternType = pattern.patternType
    const field = pattern.customizations[0]?.field || ''

    switch (patternType) {
      case 'visual':
        return `Customize ${field} for brand alignment`
      case 'workflow':
        return `Adapt ${field} for business process`
      case 'integration':
        return `Connect ${field} to external system`
      case 'content':
        return `Tailor ${field} for audience`
      default:
        return `Modify ${field} for specific requirements`
    }
  }

  private analyzeTrends(patterns: CustomizationPattern[], periodMonths: number): {
    emergingPatterns: CustomizationPattern[]
    decliningPatterns: CustomizationPattern[]
    stablePatterns: CustomizationPattern[]
    predictions: CustomizationTrend['predictions']
  } {
    // For this implementation, we'll use simple heuristics
    // In a real implementation, you'd use more sophisticated trend analysis

    const highFrequency = patterns.filter(p => p.frequency > 10)
    const mediumFrequency = patterns.filter(p => p.frequency >= 5 && p.frequency <= 10)
    const lowFrequency = patterns.filter(p => p.frequency < 5)

    return {
      emergingPatterns: highFrequency.slice(0, 5),
      decliningPatterns: lowFrequency.slice(-3),
      stablePatterns: mediumFrequency,
      predictions: {
        likelyToEmerge: ['AI-powered content customization', 'Advanced workflow automation', 'Real-time integrations'],
        likelyToDecline: ['Manual data entry fields', 'Static content blocks'],
        growthOpportunities: ['Industry-specific templates', 'Role-based customizations', 'Automated testing']
      }
    }
  }

  private analyzeClientPreferences(client: any, patterns: CustomizationPattern[]): ClientCustomizationPreference {
    const preferredPatterns = patterns.filter(p => p.outcomes.some(o => o.clientSatisfaction > 4))
    const avoidedPatterns = patterns.filter(p => p.outcomes.some(o => o.clientSatisfaction < 3))

    const avgDeploymentTime = patterns.length > 0
      ? patterns.reduce((acc, p) => acc + (p.outcomes[0]?.timeToDeployment || 0), 0) / patterns.length
      : 0

    const avgSatisfaction = patterns.length > 0
      ? patterns.reduce((acc, p) => acc + (p.outcomes[0]?.clientSatisfaction || 0), 0) / patterns.length
      : 0

    return {
      clientId: client.id,
      industry: client.industry,
      companySize: client.company_size,
      preferredPatterns: preferredPatterns.slice(0, 5),
      avoidedPatterns: avoidedPatterns.slice(0, 3),
      customizationStyle: {
        riskTolerance: avgSatisfaction > 4 ? 'aggressive' : avgSatisfaction > 3 ? 'moderate' : 'conservative',
        innovationLevel: patterns.length > 10 ? 'cutting-edge' : patterns.length > 5 ? 'advanced' : 'standard',
        customizationDepth: avgDeploymentTime > 60 ? 'deep' : avgDeploymentTime > 30 ? 'moderate' : 'surface'
      },
      successMetrics: {
        averageTimeToDeployment: avgDeploymentTime,
        satisfactionScore: avgSatisfaction,
        retentionRate: 0.85 // This would be calculated from actual data
      }
    }
  }

  private async getSimilarClientPatterns(client: any): Promise<CustomizationPattern[]> {
    const { data: similarClients, error } = await supabase
      .from('clients')
      .select(`
        id,
        client_customizations(
          *,
          client_deployments(status, client_satisfaction_score)
        )
      `)
      .eq('industry', client.industry)
      .eq('company_size', client.company_size)
      .limit(10)

    if (error) {
      return []
    }

    const allCustomizations = similarClients?.flatMap(c => c.client_customizations || []) || []
    return this.analyzeCustomizationPatterns(allCustomizations)
  }

  private generateRecommendations(
    templateId: string,
    clientId: string,
    clientPreferences: ClientCustomizationPreference,
    templatePatterns: CustomizationPattern[],
    similarClientPatterns: CustomizationPattern[]
  ): CustomizationRecommendation {
    const recommendedPatterns = this.selectRecommendedPatterns(
      clientPreferences,
      templatePatterns,
      similarClientPatterns
    )

    const warningsAndRisks = this.identifyRisks(recommendedPatterns, clientPreferences)
    const alternativeApproaches = this.generateAlternatives(templatePatterns, clientPreferences)

    return {
      templateId,
      clientId,
      recommendedPatterns,
      warningsAndRisks,
      alternativeApproaches
    }
  }

  private selectRecommendedPatterns(
    clientPreferences: ClientCustomizationPreference,
    templatePatterns: CustomizationPattern[],
    similarClientPatterns: CustomizationPattern[]
  ): CustomizationRecommendation['recommendedPatterns'] {
    const combinedPatterns = [...templatePatterns, ...similarClientPatterns]

    return combinedPatterns
      .filter(pattern => {
        // Filter based on client preferences
        const matchesRiskTolerance = this.matchesRiskTolerance(pattern, clientPreferences.customizationStyle.riskTolerance)
        const matchesInnovationLevel = this.matchesInnovationLevel(pattern, clientPreferences.customizationStyle.innovationLevel)
        return matchesRiskTolerance && matchesInnovationLevel
      })
      .slice(0, 5)
      .map(pattern => ({
        pattern,
        confidence: this.calculateConfidence(pattern, clientPreferences),
        reasoning: this.generateReasoning(pattern, clientPreferences),
        expectedOutcomes: {
          deploymentTime: pattern.outcomes[0]?.timeToDeployment || 30,
          successProbability: pattern.outcomes.filter(o => o.deploymentSuccess).length / Math.max(pattern.outcomes.length, 1),
          satisfactionScore: pattern.outcomes.reduce((acc, o) => acc + o.clientSatisfaction, 0) / Math.max(pattern.outcomes.length, 1)
        }
      }))
  }

  private matchesRiskTolerance(pattern: CustomizationPattern, riskTolerance: string): boolean {
    switch (riskTolerance) {
      case 'conservative':
        return pattern.insights.riskLevel === 'low'
      case 'moderate':
        return pattern.insights.riskLevel !== 'high'
      case 'aggressive':
        return true
      default:
        return true
    }
  }

  private matchesInnovationLevel(pattern: CustomizationPattern, innovationLevel: string): boolean {
    switch (innovationLevel) {
      case 'standard':
        return pattern.insights.complexity === 'low'
      case 'advanced':
        return pattern.insights.complexity !== 'high'
      case 'cutting-edge':
        return true
      default:
        return true
    }
  }

  private calculateConfidence(pattern: CustomizationPattern, clientPreferences: ClientCustomizationPreference): number {
    let confidence = 50 // Base confidence

    // Increase confidence based on frequency
    confidence += Math.min(pattern.frequency * 5, 30)

    // Increase confidence based on industry match
    if (pattern.insights.recommendedFor.includes(clientPreferences.industry)) {
      confidence += 20
    }

    // Adjust based on outcomes
    const avgSatisfaction = pattern.outcomes.reduce((acc, o) => acc + o.clientSatisfaction, 0) / Math.max(pattern.outcomes.length, 1)
    confidence += (avgSatisfaction - 3) * 10

    return Math.min(Math.max(confidence, 0), 100)
  }

  private generateReasoning(pattern: CustomizationPattern, clientPreferences: ClientCustomizationPreference): string[] {
    const reasons: string[] = []

    if (pattern.frequency > 5) {
      reasons.push(`Popular pattern used ${pattern.frequency} times`)
    }

    if (pattern.insights.recommendedFor.includes(clientPreferences.industry)) {
      reasons.push(`Commonly used in ${clientPreferences.industry} industry`)
    }

    if (pattern.insights.riskLevel === 'low') {
      reasons.push('Low risk with high success rate')
    }

    if (pattern.insights.complexity === 'low') {
      reasons.push('Simple to implement and maintain')
    }

    return reasons
  }

  private identifyRisks(
    recommendedPatterns: CustomizationRecommendation['recommendedPatterns'],
    clientPreferences: ClientCustomizationPreference
  ): CustomizationRecommendation['warningsAndRisks'] {
    const risks: CustomizationRecommendation['warningsAndRisks'] = []

    recommendedPatterns.forEach(rec => {
      if (rec.pattern.insights.riskLevel === 'high') {
        risks.push({
          pattern: rec.pattern.patternName,
          risk: 'High implementation risk with potential deployment issues',
          mitigation: 'Consider thorough testing and gradual rollout'
        })
      }

      if (rec.pattern.insights.complexity === 'high' && clientPreferences.customizationStyle.customizationDepth === 'surface') {
        risks.push({
          pattern: rec.pattern.patternName,
          risk: 'Complex customization may exceed client capability',
          mitigation: 'Provide additional support and documentation'
        })
      }
    })

    return risks
  }

  private generateAlternatives(
    templatePatterns: CustomizationPattern[],
    clientPreferences: ClientCustomizationPreference
  ): CustomizationRecommendation['alternativeApproaches'] {
    return [
      {
        description: 'Conservative approach with proven patterns',
        patterns: templatePatterns.filter(p => p.insights.riskLevel === 'low').slice(0, 3),
        tradeoffs: ['Lower risk', 'Faster implementation', 'Less customization flexibility']
      },
      {
        description: 'Innovative approach with cutting-edge features',
        patterns: templatePatterns.filter(p => p.insights.complexity === 'high').slice(0, 3),
        tradeoffs: ['Higher risk', 'Longer implementation', 'Greater differentiation potential']
      }
    ]
  }

  private analyzeCombinations(customizations: any[]): {
    combination: string[]
    frequency: number
    successRate: number
    averageOutcome: {
      deploymentTime: number
      satisfaction: number
      revenue: number
    }
  }[] {
    const combinationMap = new Map()

    customizations.forEach(customization => {
      if (!customization.customization_data?.changes) return

      const changes = customization.customization_data.changes.map((c: any) => c.field).sort()
      const combinationKey = changes.join('-')

      if (!combinationMap.has(combinationKey)) {
        combinationMap.set(combinationKey, {
          combination: changes,
          frequency: 0,
          outcomes: []
        })
      }

      const combo = combinationMap.get(combinationKey)
      combo.frequency++

      if (customization.client_deployments) {
        combo.outcomes.push({
          success: customization.client_deployments.status === 'success',
          deploymentTime: customization.client_deployments.deployment_time_minutes || 0,
          satisfaction: customization.client_deployments.client_satisfaction_score || 0,
          revenue: customization.client_deployments.revenue_generated || 0
        })
      }
    })

    return Array.from(combinationMap.values())
      .filter(combo => combo.frequency >= 2)
      .map(combo => ({
        combination: combo.combination,
        frequency: combo.frequency,
        successRate: combo.outcomes.filter((o: any) => o.success).length / Math.max(combo.outcomes.length, 1),
        averageOutcome: {
          deploymentTime: combo.outcomes.reduce((acc: number, o: any) => acc + o.deploymentTime, 0) / Math.max(combo.outcomes.length, 1),
          satisfaction: combo.outcomes.reduce((acc: number, o: any) => acc + o.satisfaction, 0) / Math.max(combo.outcomes.length, 1),
          revenue: combo.outcomes.reduce((acc: number, o: any) => acc + o.revenue, 0) / Math.max(combo.outcomes.length, 1)
        }
      }))
      .sort((a, b) => b.frequency - a.frequency)
  }
}

export const customizationPatternAnalyzer = new CustomizationPatternAnalyzer()