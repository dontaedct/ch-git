/**
 * @fileoverview AI Customization Assistant Component - HT-031.1.4
 * @module components/ai/customization-assistant
 * @author Hero Tasks System
 * @version 1.0.0
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Sparkles, 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Eye,
  Download,
  Copy,
  RefreshCw,
  Palette,
  Type,
  Layout,
  MessageSquare,
  Wand2,
  Star,
  ArrowRight,
  Info
} from 'lucide-react'
import { BrandIntelligence, type BrandProfile, type BrandAnalysis, type BrandRecommendation } from '@/lib/ai/brand-intelligence'
import { ThemeGenerator, type ThemeGenerationRequest, type GeneratedTheme } from '@/lib/ai/theme-generator'

interface CustomizationAssistantProps {
  brandProfile: BrandProfile
  customizationRequest: {
    type: 'brand' | 'theme' | 'content' | 'layout'
    description: string
    context?: string
    preferences?: Record<string, any>
  }
  onSuggestionApply: (suggestion: any) => void
}

interface CustomizationSuggestion {
  id: string
  type: 'visual' | 'content' | 'interaction' | 'layout'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  reasoning: string[]
  implementation: string[]
  preview?: string
}

interface AIInsight {
  id: string
  category: 'trends' | 'best-practices' | 'accessibility' | 'performance'
  title: string
  description: string
  confidence: number
  source: string
  actionable: boolean
  suggestions: string[]
}

export function CustomizationAssistant({ 
  brandProfile, 
  customizationRequest, 
  onSuggestionApply 
}: CustomizationAssistantProps) {
  const [brandAnalysis, setBrandAnalysis] = useState<BrandAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<CustomizationSuggestion[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [generatedThemes, setGeneratedThemes] = useState<GeneratedTheme[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<CustomizationSuggestion | null>(null)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('suggestions')

  const analyzeBrand = useCallback(async () => {
    if (!brandProfile.name) return

    setIsAnalyzing(true)
    try {
      const brandIntelligence = new BrandIntelligence(brandProfile)
      const analysis = await brandIntelligence.analyzeBrand()
      setBrandAnalysis(analysis)

      // Generate suggestions based on analysis
      const generatedSuggestions = await generateSuggestionsFromAnalysis(analysis)
      setSuggestions(generatedSuggestions)

      // Generate insights
      const generatedInsights = await generateInsights(brandProfile, analysis)
      setInsights(generatedInsights)
    } catch (error) {
      console.error('Error analyzing brand:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [brandProfile])

  const generateThemeVariations = useCallback(async () => {
    setIsGenerating(true)
    try {
      const themeRequest: ThemeGenerationRequest = {
        brandProfile,
        customizationRequest,
        constraints: {
          accessibility: true,
          industryStandards: true
        }
      }

      const themeGenerator = new ThemeGenerator(themeRequest)
      const variations = await themeGenerator.generateThemeVariations(3)
      setGeneratedThemes(variations)
    } catch (error) {
      console.error('Error generating themes:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [brandProfile, customizationRequest])

  const applySuggestion = useCallback((suggestion: CustomizationSuggestion) => {
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]))
    onSuggestionApply(suggestion)
  }, [onSuggestionApply])

  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getEffortColor = (effort: string): string => {
    switch (effort) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  useEffect(() => {
    if (brandProfile.name) {
      analyzeBrand()
    }
  }, [brandProfile, analyzeBrand])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Customization Assistant
          </h2>
          <p className="text-muted-foreground">
            Intelligent suggestions and insights for your brand customization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={analyzeBrand} disabled={isAnalyzing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
          </Button>
          <Button onClick={generateThemeVariations} disabled={isGenerating}>
            <Wand2 className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
            Generate Themes
          </Button>
        </div>
      </div>

      {brandAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Brand Strength</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {brandAnalysis.brandStrength}%
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Market Position</p>
                  <p className="text-lg font-bold capitalize">
                    {brandAnalysis.marketPosition}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Opportunities</p>
                  <p className="text-2xl font-bold text-green-600">
                    {brandAnalysis.opportunities.length}
                  </p>
                </div>
                <Target className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Recommendations</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {brandAnalysis.recommendations.length}
                  </p>
                </div>
                <Lightbulb className="h-4 w-4 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Themes
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="space-y-4">
            {suggestions.map(suggestion => (
              <Card key={suggestion.id} className={`transition-all ${
                appliedSuggestions.has(suggestion.id) ? 'border-green-200 bg-green-50' : 'hover:shadow-md'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                          {suggestion.impact} impact
                        </Badge>
                        <Badge variant="outline" className={getEffortColor(suggestion.effort)}>
                          {suggestion.effort} effort
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {suggestion.description}
                      </p>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium mb-1">Reasoning:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {suggestion.reasoning.map((reason, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Implementation:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {suggestion.implementation.map((step, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button
                        size="sm"
                        onClick={() => applySuggestion(suggestion)}
                        disabled={appliedSuggestions.has(suggestion.id)}
                        className={appliedSuggestions.has(suggestion.id) ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {appliedSuggestions.has(suggestion.id) ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Applied
                          </>
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {suggestions.length === 0 && !isAnalyzing && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Suggestions Available</h3>
                    <p className="text-muted-foreground">
                      Complete your brand profile to get personalized suggestions
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {insights.map(insight => (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline">
                          {insight.category}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-blue-600">Source: {insight.source}</span>
                      </div>

                      {insight.actionable && (
                        <div>
                          <p className="text-sm font-medium mb-1">Actionable Suggestions:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {insight.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Zap className="h-3 w-3 mt-0.5 flex-shrink-0 text-yellow-600" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {insights.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
                    <p className="text-muted-foreground">
                      Insights will appear after brand analysis is complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <div className="space-y-4">
            {generatedThemes.map(theme => (
              <Card key={theme.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{theme.name}</h4>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                      <Badge variant="outline" className="mt-2">
                        {Math.round(theme.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Color Palette</h5>
                      <div className="flex gap-2">
                        <div 
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: theme.colors.primary.base }}
                          title="Primary"
                        />
                        <div 
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: theme.colors.secondary.base }}
                          title="Secondary"
                        />
                        <div 
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: theme.colors.accent.base }}
                          title="Accent"
                        />
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Typography</h5>
                      <p className="text-sm text-muted-foreground">
                        {theme.typography.fontFamily.heading}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Reasoning</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {theme.reasoning.slice(0, 3).map((reason, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}

            {generatedThemes.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Themes Generated</h3>
                    <p className="text-muted-foreground">
                      Click "Generate Themes" to create AI-powered theme variations
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {brandAnalysis && (
            <div className="space-y-4">
              {brandAnalysis.recommendations.map(recommendation => (
                <Card key={recommendation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <Badge variant="outline" className={getImpactColor(recommendation.impact)}>
                            {recommendation.impact} impact
                          </Badge>
                          <Badge variant="outline" className={getEffortColor(recommendation.effort)}>
                            {recommendation.effort} effort
                          </Badge>
                          <Badge variant="outline">
                            {recommendation.type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {recommendation.description}
                        </p>

                        <div>
                          <p className="text-sm font-medium mb-1">Implementation Steps:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {recommendation.implementation.map((step, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button size="sm">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Implement
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions for generating suggestions and insights
async function generateSuggestionsFromAnalysis(analysis: BrandAnalysis): Promise<CustomizationSuggestion[]> {
  const suggestions: CustomizationSuggestion[] = []

  // Visual suggestions
  if (analysis.weaknesses.includes('No existing brand assets')) {
    suggestions.push({
      id: 'visual-brand-assets',
      type: 'visual',
      title: 'Create Brand Assets',
      description: 'Develop a cohesive visual identity with logo, colors, and typography',
      confidence: 0.9,
      impact: 'high',
      effort: 'high',
      reasoning: [
        'Strong visual identity improves brand recognition',
        'Consistent assets build trust and professionalism',
        'Visual assets are fundamental to brand building'
      ],
      implementation: [
        'Design logo variations',
        'Define color palette',
        'Select typography system',
        'Create brand guidelines'
      ]
    })
  }

  // Content suggestions
  if (analysis.weaknesses.includes('Vague target audience definition')) {
    suggestions.push({
      id: 'content-audience',
      type: 'content',
      title: 'Define Target Audience',
      description: 'Create detailed personas and messaging for your target audience',
      confidence: 0.85,
      impact: 'high',
      effort: 'medium',
      reasoning: [
        'Clear audience definition improves messaging effectiveness',
        'Personas guide content and design decisions',
        'Targeted messaging increases engagement'
      ],
      implementation: [
        'Research audience demographics',
        'Create user personas',
        'Define messaging tone',
        'Develop content strategy'
      ]
    })
  }

  // Interaction suggestions
  if (analysis.opportunities.includes('Leverage modern design trends')) {
    suggestions.push({
      id: 'interaction-modern',
      type: 'interaction',
      title: 'Implement Modern Interactions',
      description: 'Add contemporary interaction patterns and micro-animations',
      confidence: 0.8,
      impact: 'medium',
      effort: 'medium',
      reasoning: [
        'Modern interactions improve user experience',
        'Micro-animations provide feedback and delight',
        'Contemporary patterns align with user expectations'
      ],
      implementation: [
        'Add hover states and transitions',
        'Implement loading animations',
        'Create interactive feedback',
        'Design gesture-based interactions'
      ]
    })
  }

  return suggestions
}

async function generateInsights(brandProfile: BrandProfile, analysis: BrandAnalysis): Promise<AIInsight[]> {
  const insights: AIInsight[] = []

  // Industry insights
  if (brandProfile.industry === 'Technology') {
    insights.push({
      id: 'tech-trends',
      category: 'trends',
      title: 'Technology Industry Trends',
      description: 'Current design trends in the technology sector favor minimalist interfaces and accessibility-first approaches',
      confidence: 0.85,
      source: 'Industry Analysis 2025',
      actionable: true,
      suggestions: [
        'Consider implementing dark mode',
        'Focus on accessibility compliance',
        'Use modern interaction patterns',
        'Optimize for mobile-first experience'
      ]
    })
  }

  // Best practices insights
  if (analysis.brandStrength < 70) {
    insights.push({
      id: 'brand-strength',
      category: 'best-practices',
      title: 'Brand Strength Improvement',
      description: 'Your brand strength could be improved by defining clearer values and personality traits',
      confidence: 0.9,
      source: 'Brand Analysis Framework',
      actionable: true,
      suggestions: [
        'Define 3-5 core brand values',
        'Establish clear brand personality',
        'Create comprehensive brand guidelines',
        'Develop consistent messaging'
      ]
    })
  }

  // Accessibility insights
  insights.push({
    id: 'accessibility',
    category: 'accessibility',
    title: 'Accessibility Best Practices',
    description: 'Implementing accessibility features from the start is more cost-effective than retrofitting',
    confidence: 0.95,
    source: 'WCAG Guidelines',
    actionable: true,
    suggestions: [
      'Ensure color contrast ratios meet WCAG AA standards',
      'Implement keyboard navigation',
      'Provide alternative text for images',
      'Use semantic HTML elements'
    ]
  })

  return insights
}
