import {
  DocumentTemplate,
  TemplateVariable,
  ClientBranding
} from '../core/types'
import { DocumentTemplateLibrary, TemplatePattern, ClientDeliverable } from './library'
import { ExportManager } from '../export/export-manager'

export interface PatternSearchFilter {
  category?: string
  complexity?: 'simple' | 'moderate' | 'complex'
  industry?: string
  useCase?: string
  tags?: string[]
}

export interface PatternUsage {
  patternId: string
  usageCount: number
  lastUsed: Date
  averageRating: number
  feedbackCount: number
}

export interface CustomPattern {
  id: string
  name: string
  basePatternId: string
  customizations: PatternCustomization
  createdBy: string
  createdAt: Date
  isPublic: boolean
}

export interface PatternCustomization {
  variables: TemplateVariable[]
  styling: any
  sections: any[]
  branding?: ClientBranding
  content?: { [sectionId: string]: string }
}

export interface PatternRecommendation {
  pattern: TemplatePattern
  score: number
  reason: string
  similarPatterns: string[]
}

export class TemplatePatternRegistry {
  private library: DocumentTemplateLibrary
  private exportManager: ExportManager
  private customPatterns: Map<string, CustomPattern> = new Map()
  private patternUsage: Map<string, PatternUsage> = new Map()
  private userPreferences: Map<string, any> = new Map()

  constructor() {
    this.library = new DocumentTemplateLibrary()
    this.exportManager = new ExportManager()
    this.initializeUsageTracking()
  }

  // Pattern Discovery & Search
  searchPatterns(query: string, filters?: PatternSearchFilter): TemplatePattern[] {
    let patterns = this.library.searchPatterns(query)

    if (filters) {
      patterns = this.applyFilters(patterns, filters)
    }

    // Sort by relevance and usage
    return patterns.sort((a, b) => {
      const usageA = this.patternUsage.get(a.id)?.usageCount || 0
      const usageB = this.patternUsage.get(b.id)?.usageCount || 0
      return usageB - usageA
    })
  }

  getPatternsByCategory(category: string): TemplatePattern[] {
    return this.library.getPatternsByCategory(category)
  }

  getPatternById(patternId: string): TemplatePattern | null {
    return this.library.getPattern(patternId)
  }

  getRecommendedPatterns(userId: string, context?: any): PatternRecommendation[] {
    const userPrefs = this.userPreferences.get(userId) || {}
    const recommendations: PatternRecommendation[] = []

    // Get all patterns
    const allPatterns = this.library.getAllPatterns()

    for (const pattern of allPatterns) {
      const score = this.calculateRecommendationScore(pattern, userPrefs, context)
      if (score > 0.3) { // Threshold for recommendations
        recommendations.push({
          pattern,
          score,
          reason: this.generateRecommendationReason(pattern, userPrefs, context),
          similarPatterns: this.findSimilarPatterns(pattern.id, 3)
        })
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 10)
  }

  // Pattern Customization
  createCustomPattern(
    userId: string,
    basePatternId: string,
    customizations: PatternCustomization,
    name: string,
    isPublic: boolean = false
  ): CustomPattern {
    const basePattern = this.library.getPattern(basePatternId)
    if (!basePattern) {
      throw new Error(`Base pattern not found: ${basePatternId}`)
    }

    const customPattern: CustomPattern = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      basePatternId,
      customizations,
      createdBy: userId,
      createdAt: new Date(),
      isPublic
    }

    this.customPatterns.set(customPattern.id, customPattern)
    return customPattern
  }

  getCustomPattern(patternId: string): CustomPattern | null {
    return this.customPatterns.get(patternId) || null
  }

  getUserCustomPatterns(userId: string): CustomPattern[] {
    return Array.from(this.customPatterns.values())
      .filter(p => p.createdBy === userId)
  }

  getPublicCustomPatterns(): CustomPattern[] {
    return Array.from(this.customPatterns.values())
      .filter(p => p.isPublic)
  }

  updateCustomPattern(
    patternId: string,
    updates: Partial<CustomPattern>
  ): CustomPattern {
    const existing = this.customPatterns.get(patternId)
    if (!existing) {
      throw new Error(`Custom pattern not found: ${patternId}`)
    }

    const updated: CustomPattern = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation date
      createdBy: existing.createdBy // Preserve creator
    }

    this.customPatterns.set(patternId, updated)
    return updated
  }

  // Template Generation from Patterns
  generateTemplateFromPattern(
    patternId: string,
    data: any,
    customizations?: PatternCustomization
  ): DocumentTemplate {
    // Check if it's a custom pattern first
    const customPattern = this.getCustomPattern(patternId)
    if (customPattern) {
      return this.generateFromCustomPattern(customPattern, data)
    }

    // Use library pattern
    const template = this.library.createTemplateFromPattern(patternId, customizations)
    this.trackPatternUsage(patternId)
    return template
  }

  generateFromCustomPattern(customPattern: CustomPattern, data: any): DocumentTemplate {
    const baseTemplate = this.library.createTemplateFromPattern(
      customPattern.basePatternId,
      customPattern.customizations
    )

    // Apply custom pattern modifications
    baseTemplate.name = customPattern.name
    baseTemplate.id = `from_custom_${customPattern.id}_${Date.now()}`

    // Override variables if specified
    if (customPattern.customizations.variables) {
      baseTemplate.schema.variables = customPattern.customizations.variables
    }

    // Apply custom styling
    if (customPattern.customizations.styling) {
      baseTemplate.schema.styling = {
        ...baseTemplate.schema.styling,
        ...customPattern.customizations.styling
      }
    }

    // Apply custom sections
    if (customPattern.customizations.sections) {
      baseTemplate.sections = customPattern.customizations.sections.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type || 'content',
        content: s.content,
        variables: s.variables || []
      }))
    }

    // Apply custom content
    if (customPattern.customizations.content) {
      Object.entries(customPattern.customizations.content).forEach(([sectionId, content]) => {
        const section = baseTemplate.sections.find(s => s.id === sectionId)
        if (section) {
          section.content = content
        }
      })
    }

    this.trackPatternUsage(customPattern.id)
    return baseTemplate
  }

  // Client Deliverable Management
  getClientDeliverables(type?: string, industry?: string): ClientDeliverable[] {
    // This would typically query a database
    // For now, return mock data based on the library
    const deliverables: ClientDeliverable[] = []

    if (type === 'proposal' || !type) {
      deliverables.push({
        type: 'proposal',
        industry: industry || 'technology',
        patterns: [
          this.library.getPattern('business-proposal')!,
          this.library.getPattern('technical-documentation')!
        ].filter(Boolean),
        customization: {
          brandingRequired: true,
          contentVariations: ['web-development', 'mobile-app', 'consulting'],
          outputFormats: ['pdf', 'html']
        }
      })
    }

    if (type === 'contract' || !type) {
      deliverables.push({
        type: 'contract',
        industry: industry || 'legal',
        patterns: [
          this.library.getPattern('service-agreement')!
        ].filter(Boolean),
        customization: {
          brandingRequired: true,
          contentVariations: ['consulting', 'development', 'maintenance'],
          outputFormats: ['pdf']
        }
      })
    }

    return deliverables
  }

  createClientDeliverable(
    type: string,
    industry: string,
    clientData: any,
    brandingId?: string
  ): DocumentTemplate[] {
    const deliverables = this.getClientDeliverables(type, industry)
    const templates: DocumentTemplate[] = []

    for (const deliverable of deliverables) {
      for (const pattern of deliverable.patterns) {
        const customizations: PatternCustomization = {
          variables: pattern.variables,
          styling: pattern.styling,
          sections: pattern.sections
        }

        // Apply client-specific branding if provided
        if (brandingId) {
          // This would fetch and apply client branding
          customizations.branding = {
            id: brandingId,
            clientId: clientData.clientId || '',
            name: clientData.clientName || '',
            colorPalette: {
              primary: '#2563eb',
              secondary: '#64748b',
              accent: '#0ea5e9',
              neutral: {
                50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
                400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
                800: '#1e293b', 900: '#0f172a'
              },
              semantic: {
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6'
              }
            },
            typography: {
              fontFamily: 'Inter, sans-serif',
              fontSizes: {
                xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
                xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem'
              },
              fontWeights: {
                light: 300, normal: 400, medium: 500, semibold: 600, bold: 700
              },
              lineHeights: {
                tight: 1.25, normal: 1.5, relaxed: 1.625, loose: 2
              }
            },
            spacing: {
              scale: {
                px: '1px', 0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem',
                4: '1rem', 5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem',
                12: '3rem', 16: '4rem', 20: '5rem', 24: '6rem', 32: '8rem'
              },
              containerPadding: '1rem',
              sectionSpacing: '2rem'
            },
            components: {
              button: {
                styles: { padding: '0.5rem 1rem', borderRadius: '0.375rem' }
              },
              input: {
                styles: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }
              },
              card: {
                styles: { borderRadius: '0.5rem', padding: '1.5rem' }
              }
            },
            assets: {
              logo: { name: 'Logo', url: clientData.logoUrl || '' },
              images: [],
              fonts: []
            }
          }
        }

        const template = this.generateTemplateFromPattern(pattern.id, clientData, customizations)
        templates.push(template)
      }
    }

    return templates
  }

  // Pattern Analytics & Usage Tracking
  getPatternUsageStats(patternId: string): PatternUsage | null {
    return this.patternUsage.get(patternId) || null
  }

  getPopularPatterns(limit: number = 10): TemplatePattern[] {
    const sortedUsage = Array.from(this.patternUsage.entries())
      .sort(([, a], [, b]) => b.usageCount - a.usageCount)
      .slice(0, limit)

    return sortedUsage
      .map(([patternId]) => this.library.getPattern(patternId))
      .filter(Boolean) as TemplatePattern[]
  }

  trackPatternUsage(patternId: string): void {
    const existing = this.patternUsage.get(patternId)
    if (existing) {
      existing.usageCount++
      existing.lastUsed = new Date()
    } else {
      this.patternUsage.set(patternId, {
        patternId,
        usageCount: 1,
        lastUsed: new Date(),
        averageRating: 0,
        feedbackCount: 0
      })
    }
  }

  recordPatternFeedback(patternId: string, rating: number, feedback?: string): void {
    const usage = this.patternUsage.get(patternId)
    if (usage) {
      const totalRating = usage.averageRating * usage.feedbackCount + rating
      usage.feedbackCount++
      usage.averageRating = totalRating / usage.feedbackCount
    }
    // Store feedback for analysis (would typically go to database)
  }

  // User Preferences & Learning
  updateUserPreferences(userId: string, preferences: any): void {
    this.userPreferences.set(userId, {
      ...this.userPreferences.get(userId),
      ...preferences
    })
  }

  getUserPreferences(userId: string): any {
    return this.userPreferences.get(userId) || {}
  }

  // Utility Methods
  private applyFilters(patterns: TemplatePattern[], filters: PatternSearchFilter): TemplatePattern[] {
    return patterns.filter(pattern => {
      if (filters.category && pattern.category !== filters.category) return false
      if (filters.complexity && pattern.complexity !== filters.complexity) return false
      if (filters.useCase && !pattern.useCase.toLowerCase().includes(filters.useCase.toLowerCase())) return false
      if (filters.tags && !filters.tags.some(tag =>
        pattern.name.toLowerCase().includes(tag.toLowerCase()) ||
        pattern.description.toLowerCase().includes(tag.toLowerCase())
      )) return false
      return true
    })
  }

  private calculateRecommendationScore(
    pattern: TemplatePattern,
    userPrefs: any,
    context?: any
  ): number {
    let score = 0

    // Base score from usage
    const usage = this.patternUsage.get(pattern.id)
    if (usage) {
      score += Math.min(usage.usageCount / 100, 0.3) // Max 0.3 from usage
      score += Math.min(usage.averageRating / 5, 0.2) // Max 0.2 from rating
    }

    // User preference matching
    if (userPrefs.preferredCategories?.includes(pattern.category)) {
      score += 0.3
    }

    if (userPrefs.preferredComplexity === pattern.complexity) {
      score += 0.2
    }

    // Context matching
    if (context?.industry && pattern.useCase.toLowerCase().includes(context.industry.toLowerCase())) {
      score += 0.3
    }

    if (context?.projectType && pattern.name.toLowerCase().includes(context.projectType.toLowerCase())) {
      score += 0.2
    }

    return Math.min(score, 1.0) // Cap at 1.0
  }

  private generateRecommendationReason(
    pattern: TemplatePattern,
    userPrefs: any,
    context?: any
  ): string {
    const reasons: string[] = []

    if (userPrefs.preferredCategories?.includes(pattern.category)) {
      reasons.push(`matches your preferred ${pattern.category} category`)
    }

    const usage = this.patternUsage.get(pattern.id)
    if (usage && usage.usageCount > 10) {
      reasons.push('popular among users')
    }

    if (usage && usage.averageRating > 4) {
      reasons.push('highly rated')
    }

    if (context?.industry && pattern.useCase.toLowerCase().includes(context.industry.toLowerCase())) {
      reasons.push(`suitable for ${context.industry} industry`)
    }

    return reasons.length > 0
      ? `Recommended because it ${reasons.join(', ')}`
      : 'Recommended based on your usage patterns'
  }

  private findSimilarPatterns(patternId: string, limit: number): string[] {
    const pattern = this.library.getPattern(patternId)
    if (!pattern) return []

    const allPatterns = this.library.getAllPatterns()
    const similarities = allPatterns
      .filter(p => p.id !== patternId)
      .map(p => ({
        id: p.id,
        score: this.calculateSimilarity(pattern, p)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return similarities.map(s => s.id)
  }

  private calculateSimilarity(pattern1: TemplatePattern, pattern2: TemplatePattern): number {
    let score = 0

    // Category match
    if (pattern1.category === pattern2.category) score += 0.4

    // Complexity match
    if (pattern1.complexity === pattern2.complexity) score += 0.2

    // Use case similarity (simple text matching)
    const useCase1Words = pattern1.useCase.toLowerCase().split(/\s+/)
    const useCase2Words = pattern2.useCase.toLowerCase().split(/\s+/)
    const commonWords = useCase1Words.filter(word => useCase2Words.includes(word))
    score += (commonWords.length / Math.max(useCase1Words.length, useCase2Words.length)) * 0.4

    return score
  }

  private initializeUsageTracking(): void {
    // Initialize with some sample usage data
    const samplePatterns = ['business-proposal', 'meeting-minutes', 'service-agreement', 'case-study']

    samplePatterns.forEach((patternId, index) => {
      this.patternUsage.set(patternId, {
        patternId,
        usageCount: Math.floor(Math.random() * 50) + 10,
        lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        averageRating: 3.5 + Math.random() * 1.5, // Random rating between 3.5 and 5
        feedbackCount: Math.floor(Math.random() * 20) + 5
      })
    })
  }

  // Export Integration
  async exportPatternDocumentation(patternId: string, format: 'pdf' | 'html' = 'html'): Promise<any> {
    const pattern = this.library.getPattern(patternId)
    if (!pattern) {
      throw new Error(`Pattern not found: ${patternId}`)
    }

    // Create documentation template
    const docTemplate = this.generateDocumentationTemplate(pattern)

    return this.exportManager.exportDocument(docTemplate, pattern, {
      format,
      quality: 'standard',
      optimization: {
        compress: true,
        minify: true,
        responsive: true,
        accessibility: true,
        seo: true
      }
    })
  }

  private generateDocumentationTemplate(pattern: TemplatePattern): DocumentTemplate {
    // This would create a documentation template for the pattern
    // Simplified for brevity
    return {
      id: `doc_${pattern.id}`,
      name: `${pattern.name} Documentation`,
      version: '1.0.0',
      type: 'document',
      documentType: 'html',
      schema: {
        variables: [],
        sections: [],
        layout: {
          type: 'single-page',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          sections: []
        },
        styling: {
          fonts: [],
          colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            accent: '#0ea5e9',
            background: '#ffffff',
            text: '#333333',
            border: '#cccccc'
          },
          spacing: { small: 8, medium: 16, large: 24, xlarge: 32 }
        }
      },
      content: {
        html: `<h1>${pattern.name}</h1><p>${pattern.description}</p>`,
        css: '',
        assets: []
      },
      metadata: {
        id: `doc_${pattern.id}`,
        name: `${pattern.name} Documentation`,
        tags: ['documentation', pattern.category],
        category: 'documentation',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      },
      pageSettings: {
        size: { width: 8.5, height: 11, unit: 'in' },
        orientation: 'portrait',
        margins: { top: 1, right: 1, bottom: 1, left: 1, unit: 'in' }
      },
      sections: []
    }
  }
}