'use client'

/**
 * @fileoverview Brand Customization Interface Component - HT-033.2.2
 * @module components/ai/brand-customization
 * @author Hero Tasks System
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle, Palette, Eye, Download, RefreshCw, Sparkles } from 'lucide-react'

import { BrandProfile } from '@/lib/ai/brand-intelligence'
import { BrandGuidelinesProcessor, BrandGuidelines } from '@/lib/ai/brand-guidelines-processor'
import { VisualCustomizationGenerator, GeneratedCustomization, VisualCustomizationRequest } from '@/lib/ai/visual-customization-generator'
import { BrandingOptimizer, BrandOptimizationRequest } from '@/lib/ai/branding-optimizer'
import { ColorSchemeGenerator, ColorSchemeRequest, GeneratedColorScheme } from '@/lib/ai/color-scheme-generator'

interface BrandCustomizationProps {
  initialBrandProfile?: BrandProfile
  onCustomizationComplete?: (result: BrandCustomizationResult) => void
  onPreviewUpdate?: (preview: CustomizationPreview) => void
  className?: string
}

interface BrandCustomizationResult {
  guidelines: BrandGuidelines
  visualCustomization: GeneratedCustomization
  colorScheme: GeneratedColorScheme
  optimizations: any
  confidence: number
  metadata: {
    generatedAt: string
    processingTime: number
    version: string
  }
}

interface CustomizationPreview {
  colors: string[]
  typography: string
  layout: string
  components: string[]
  theme: 'light' | 'dark' | 'auto'
}

interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export const BrandCustomization: React.FC<BrandCustomizationProps> = ({
  initialBrandProfile,
  onCustomizationComplete,
  onPreviewUpdate,
  className = ''
}) => {
  // State management
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(
    initialBrandProfile || {
      name: '',
      industry: '',
      values: [],
      targetAudience: '',
      personality: [],
      colorPreferences: []
    }
  )

  const [customizationSettings, setCustomizationSettings] = useState({
    targetType: 'web-app' as const,
    colorPreferences: {
      dominantColor: '',
      colorMood: 'professional' as const,
      colorTemperature: 'neutral' as const,
      colorCount: 'moderate' as const,
      accessibilityPriority: 'standard' as const
    },
    typographyPreferences: {
      fontPersonality: 'modern' as const,
      readabilityLevel: 'high' as const,
      fontWeight: 'regular' as const,
      fontScale: 'standard' as const
    },
    layoutPreferences: {
      layoutStyle: 'balanced' as const,
      spacingDensity: 'comfortable' as const,
      gridComplexity: 'moderate' as const,
      responsivePriority: 'mobile-first' as const
    },
    constraints: {
      accessibility: {
        wcagLevel: 'AA' as const,
        minimumContrast: 4.5,
        colorBlindnessSupport: true,
        highContrastMode: false
      },
      technical: {
        performanceOptimization: true,
        browserSupport: ['modern'],
        platformSupport: ['web', 'mobile']
      }
    }
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [result, setResult] = useState<BrandCustomizationResult | null>(null)
  const [preview, setPreview] = useState<CustomizationPreview | null>(null)

  // Step configuration
  const steps = [
    { id: 'brand', title: 'Brand Profile', description: 'Define your brand identity and values' },
    { id: 'preferences', title: 'Design Preferences', description: 'Customize visual style and layout' },
    { id: 'constraints', title: 'Requirements', description: 'Set technical and accessibility requirements' },
    { id: 'generation', title: 'AI Generation', description: 'Generate brand customization' },
    { id: 'review', title: 'Review & Export', description: 'Review and export your customization' }
  ]

  // Validation
  const validateCurrentStep = useCallback(() => {
    const errors: ValidationError[] = []

    if (currentStep === 0) {
      if (!brandProfile.name) {
        errors.push({ field: 'name', message: 'Brand name is required', severity: 'error' })
      }
      if (!brandProfile.industry) {
        errors.push({ field: 'industry', message: 'Industry selection is required', severity: 'error' })
      }
      if (brandProfile.values.length === 0) {
        errors.push({ field: 'values', message: 'At least one brand value is recommended', severity: 'warning' })
      }
      if (!brandProfile.targetAudience) {
        errors.push({ field: 'targetAudience', message: 'Target audience description helps improve customization', severity: 'info' })
      }
    }

    if (currentStep === 1) {
      if (!customizationSettings.colorPreferences.dominantColor) {
        errors.push({ field: 'dominantColor', message: 'Consider selecting a dominant color for better results', severity: 'info' })
      }
    }

    setValidationErrors(errors)
    return errors.filter(e => e.severity === 'error').length === 0
  }, [currentStep, brandProfile, customizationSettings])

  // Effects
  useEffect(() => {
    validateCurrentStep()
  }, [validateCurrentStep])

  useEffect(() => {
    if (preview && onPreviewUpdate) {
      onPreviewUpdate(preview)
    }
  }, [preview, onPreviewUpdate])

  // Handlers
  const handleBrandProfileChange = (field: keyof BrandProfile, value: any) => {
    setBrandProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleCustomizationSettingsChange = (section: string, field: string, value: any) => {
    setCustomizationSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value
      }
    }))
  }

  const handleArrayFieldChange = (field: keyof BrandProfile, value: string) => {
    if (!value.trim()) return

    setBrandProfile(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }))
  }

  const handleArrayFieldRemove = (field: keyof BrandProfile, index: number) => {
    setBrandProfile(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleNextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Initialize processors
      const guidelinesProcessor = new BrandGuidelinesProcessor(brandProfile)
      const visualGenerator = new VisualCustomizationGenerator(brandProfile)
      const colorGenerator = new ColorSchemeGenerator(brandProfile)
      const optimizer = new BrandingOptimizer(brandProfile)

      // Progress tracking
      const updateProgress = (step: number, total: number) => {
        setGenerationProgress((step / total) * 100)
      }

      // Step 1: Generate brand guidelines
      updateProgress(1, 5)
      const guidelines = await guidelinesProcessor.processBrandGuidelines({
        includeCompetitorAnalysis: true,
        includeTrendAnalysis: true,
        includeAccessibilityFocus: customizationSettings.constraints.accessibility.wcagLevel === 'AA' || customizationSettings.constraints.accessibility.wcagLevel === 'AAA',
        customizationLevel: 'comprehensive',
        targetPlatforms: customizationSettings.constraints.technical.platformSupport as any[]
      })

      // Step 2: Generate visual customization
      updateProgress(2, 5)
      const visualRequest: VisualCustomizationRequest = {
        targetType: customizationSettings.targetType,
        brandProfile,
        preferences: {
          ...customizationSettings,
          interactionPreferences: {
            animationLevel: 'moderate' as const,
            feedbackIntensity: 'standard' as const,
            interactionComplexity: 'intuitive' as const,
            gestureSupport: false,
            voiceInteraction: false
          },
          contentPreferences: {
            contentDensity: 'balanced' as const,
            informationHierarchy: 'clear' as const,
            contentPersonalization: 'moderate' as const,
            languageSupport: ['en'] as const,
            culturalAdaptation: 'neutral' as const
          }
        },
        constraints: {
          technical: customizationSettings.constraints.technical,
          business: { budgetLimitations: [], timelineRequirements: [], resourceAvailability: [], stakeholderRequirements: [] },
          brand: { mustUseElements: [], cannotUseElements: [], colorRestrictions: [], fontRestrictions: [], layoutRestrictions: [] },
          accessibility: {
            ...customizationSettings.constraints.accessibility,
            lowVisionSupport: true,
            alternativeColors: ['high-contrast'],
            contrastRatio: customizationSettings.constraints.accessibility.minimumContrast,
            keyboardNavigation: true,
            screenReaderCompatibility: true
          }
        },
        requirements: {
          framework: 'React',
          cssFramework: 'Tailwind CSS',
          componentLibrary: 'Custom',
          buildSystem: 'Next.js',
          performance: {
            loadTime: 3,
            firstContentfulPaint: 1.5,
            largestContentfulPaint: 2.5,
            cumulativeLayoutShift: 0.1,
            firstInputDelay: 100
          }
        }
      }

      const visualCustomization = await visualGenerator.generateCustomization(visualRequest)

      // Step 3: Generate color scheme
      updateProgress(3, 5)
      const colorRequest: ColorSchemeRequest = {
        brandProfile,
        preferences: {
          ...customizationSettings.colorPreferences,
          colorHarmony: 'complementary' as const,
          seasonalAdaptation: false,
          brandAlignment: 'strict' as const,
          trendInfluence: 'moderate' as const,
          psychologicalImpact: 'trust' as const
        },
        constraints: {
          accessibility: {
            ...customizationSettings.constraints.accessibility,
            lowVisionSupport: true,
            alternativeColors: ['high-contrast'],
            contrastRatio: customizationSettings.constraints.accessibility.minimumContrast,
            keyboardNavigation: true,
            screenReaderCompatibility: true
          },
          technical: { colorSpace: 'RGB', fileFormats: ['hex', 'rgb', 'hsl'], platformSupport: customizationSettings.constraints.technical.platformSupport, performanceOptimization: true, compressionFriendly: true },
          brand: { existingColors: [], protectedColors: [], colorAssociations: [], brandPersonality: brandProfile.personality, industryStandards: [] },
          cultural: { targetRegions: ['Global'], culturalMeanings: [], religiousConsiderations: [], politicalSensitivities: [] },
          platform: { digitalPlatforms: ['web'], printRequirements: [], environmentalFactors: [], deviceSupport: ['desktop', 'mobile'] }
        },
        context: {
          applicationDomain: 'web',
          useCases: [
            { context: 'primary-actions', importance: 'primary', colorRole: 'dominant', frequency: 'high', visibility: 'prominent' },
            { context: 'secondary-actions', importance: 'secondary', colorRole: 'accent', frequency: 'medium', visibility: 'moderate' }
          ],
          targetAudience: {
            ageGroups: ['25-45'],
            demographics: ['professionals'],
            preferences: ['modern', 'clean'],
            behaviors: ['mobile-first'],
            culturalBackground: ['global']
          },
          competitiveContext: {
            competitors: [],
            differentiationStrategy: 'distinctive',
            marketPosition: 'challenger'
          },
          trendsConsideration: true
        },
        goals: [
          { objective: 'recognition', priority: 'high', successMetrics: ['brand recall > 70%'] },
          { objective: 'accessibility', priority: 'critical', successMetrics: ['WCAG AA compliance'] }
        ]
      }

      const colorScheme = await colorGenerator.generateColorScheme(colorRequest)

      // Step 4: Generate optimizations
      updateProgress(4, 5)
      const optimizationRequest: BrandOptimizationRequest = {
        brandProfile,
        optimizationGoals: [
          { id: 'brand-recognition', type: 'brand-recognition', description: 'Improve brand recognition', targetValue: 80, priority: 'high', timeline: '3 months', success_criteria: ['Increased brand recall', 'Improved visual consistency'] }
        ],
        constraints: {
          budget: { maxBudget: 50000, preferredBudget: 30000, costPriorities: ['high-impact'], investmentAreas: ['design-system'] },
          timeline: { totalDuration: '3 months', milestones: [], dependencies: [], criticalPath: [] },
          technical: { platformLimitations: [], performanceRequirements: [], compatibilityRequirements: [], securityRequirements: [] },
          brand: { mustPreserve: [], cannotChange: [], flexibleElements: [], brandGuidelines: [] },
          business: { businessGoals: [], stakeholderRequirements: [], marketConstraints: [], regulatoryRequirements: [] }
        },
        targetMetrics: {
          performance: { loadTime: 3, firstContentfulPaint: 1.5, largestContentfulPaint: 2.5, cumulativeLayoutShift: 0.1, firstInputDelay: 100 },
          accessibility: {
            ...customizationSettings.constraints.accessibility,
            lowVisionSupport: true,
            alternativeColors: ['high-contrast'],
            contrastRatio: customizationSettings.constraints.accessibility.minimumContrast,
            keyboardNavigation: true,
            screenReaderCompatibility: true
          },
          brand: { brandRecognition: 80, brandConsistency: 90, visualAppeal: 85, brandTrust: 80, marketDifferentiation: 75 },
          business: { conversionRate: 3, engagementRate: 60, customerSatisfaction: 85, marketShare: 15, revenueImpact: 20 },
          user: { userSatisfaction: 85, taskCompletionRate: 90, errorRate: 5, learningCurve: 70, retentionRate: 80 }
        },
        priorities: [
          { area: 'brand', importance: 0.9, urgency: 0.8, impact: 0.9, effort: 0.6, roi: 0.8 }
        ]
      }

      const optimizations = await optimizer.optimizeBrand(optimizationRequest)

      // Step 5: Finalize result
      updateProgress(5, 5)
      const finalResult: BrandCustomizationResult = {
        guidelines: guidelines.guidelines,
        visualCustomization,
        colorScheme,
        optimizations: optimizations.optimizations,
        confidence: (guidelines.metadata.confidence + visualCustomization.metadata.confidence + colorScheme.metadata.confidence) / 3,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime: Date.now(),
          version: '1.0.0'
        }
      }

      // Generate preview
      const customizationPreview: CustomizationPreview = {
        colors: [
          colorScheme.palette.primary.hex,
          ...(colorScheme.palette.secondary?.map(c => c.hex) || []),
          ...(colorScheme.palette.accent?.map(c => c.hex) || [])
        ],
        typography: visualCustomization.visual.typography[0]?.fonts[0]?.family || 'Inter',
        layout: visualCustomization.visual.layout[0]?.semantic.columns || '12',
        components: visualCustomization.visual.components.map(c => c.name),
        theme: 'light'
      }

      setResult(finalResult)
      setPreview(customizationPreview)
      setCurrentStep(steps.length - 1)

      if (onCustomizationComplete) {
        onCustomizationComplete(finalResult)
      }

    } catch (error) {
      console.error('Generation failed:', error)
      setValidationErrors([{
        field: 'generation',
        message: 'Failed to generate customization. Please try again.',
        severity: 'error'
      }])
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  const handleExport = (format: 'json' | 'css' | 'tokens') => {
    if (!result) return

    let exportData: string
    let filename: string

    switch (format) {
      case 'json':
        exportData = JSON.stringify(result, null, 2)
        filename = `${brandProfile.name.toLowerCase().replace(/\s+/g, '-')}-customization.json`
        break
      case 'css':
        exportData = generateCSSExport(result)
        filename = `${brandProfile.name.toLowerCase().replace(/\s+/g, '-')}-variables.css`
        break
      case 'tokens':
        exportData = JSON.stringify(result.visualCustomization.implementation.designTokens, null, 2)
        filename = `${brandProfile.name.toLowerCase().replace(/\s+/g, '-')}-tokens.json`
        break
      default:
        return
    }

    const blob = new Blob([exportData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render validation errors
  const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null

    return (
      <div className="space-y-2 mb-6">
        {validationErrors.map((error, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 p-3 rounded-lg ${
              error.severity === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              error.severity === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error.message}</span>
          </div>
        ))}
      </div>
    )
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name *</Label>
                <Input
                  id="brand-name"
                  value={brandProfile.name}
                  onChange={(e) => handleBrandProfileChange('name', e.target.value)}
                  placeholder="Enter your brand name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select value={brandProfile.industry} onValueChange={(value) => handleBrandProfileChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-audience">Target Audience</Label>
              <Textarea
                id="target-audience"
                value={brandProfile.targetAudience}
                onChange={(e) => handleBrandProfileChange('targetAudience', e.target.value)}
                placeholder="Describe your target audience (e.g., young professionals, enterprise customers, small business owners)"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label>Brand Values</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {brandProfile.values.map((value, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayFieldRemove('values', index)}>
                      {value} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a brand value (e.g., Innovation, Trust, Quality)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleArrayFieldChange('values', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input?.value) {
                        handleArrayFieldChange('values', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <Label>Brand Personality</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {brandProfile.personality.map((trait, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayFieldRemove('personality', index)}>
                      {trait} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a personality trait (e.g., Professional, Friendly, Modern)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleArrayFieldChange('personality', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input?.value) {
                        handleArrayFieldChange('personality', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dominant-color">Dominant Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dominant-color"
                      type="color"
                      value={customizationSettings.colorPreferences.dominantColor}
                      onChange={(e) => handleCustomizationSettingsChange('colorPreferences', 'dominantColor', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={customizationSettings.colorPreferences.dominantColor}
                      onChange={(e) => handleCustomizationSettingsChange('colorPreferences', 'dominantColor', e.target.value)}
                      placeholder="#2563EB"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color Mood</Label>
                  <Select
                    value={customizationSettings.colorPreferences.colorMood}
                    onValueChange={(value) => handleCustomizationSettingsChange('colorPreferences', 'colorMood', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="muted">Muted</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="pastel">Pastel</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Temperature</Label>
                  <Select
                    value={customizationSettings.colorPreferences.colorTemperature}
                    onValueChange={(value) => handleCustomizationSettingsChange('colorPreferences', 'colorTemperature', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cool">Cool</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Count</Label>
                  <Select
                    value={customizationSettings.colorPreferences.colorCount}
                    onValueChange={(value) => handleCustomizationSettingsChange('colorPreferences', 'colorCount', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal (2-3 colors)</SelectItem>
                      <SelectItem value="moderate">Moderate (4-6 colors)</SelectItem>
                      <SelectItem value="rich">Rich (7-10 colors)</SelectItem>
                      <SelectItem value="extensive">Extensive (10+ colors)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Font Personality</Label>
                  <Select
                    value={customizationSettings.typographyPreferences.fontPersonality}
                    onValueChange={(value) => handleCustomizationSettingsChange('typographyPreferences', 'fontPersonality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Readability Level</Label>
                  <Select
                    value={customizationSettings.typographyPreferences.readabilityLevel}
                    onValueChange={(value) => handleCustomizationSettingsChange('typographyPreferences', 'readabilityLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="decorative">Decorative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select
                    value={customizationSettings.typographyPreferences.fontWeight}
                    onValueChange={(value) => handleCustomizationSettingsChange('typographyPreferences', 'fontWeight', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Scale</Label>
                  <Select
                    value={customizationSettings.typographyPreferences.fontScale}
                    onValueChange={(value) => handleCustomizationSettingsChange('typographyPreferences', 'fontScale', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="generous">Generous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Layout Style</Label>
                  <Select
                    value={customizationSettings.layoutPreferences.layoutStyle}
                    onValueChange={(value) => handleCustomizationSettingsChange('layoutPreferences', 'layoutStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="content-rich">Content Rich</SelectItem>
                      <SelectItem value="visual-heavy">Visual Heavy</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Spacing Density</Label>
                  <Select
                    value={customizationSettings.layoutPreferences.spacingDensity}
                    onValueChange={(value) => handleCustomizationSettingsChange('layoutPreferences', 'spacingDensity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Grid Complexity</Label>
                  <Select
                    value={customizationSettings.layoutPreferences.gridComplexity}
                    onValueChange={(value) => handleCustomizationSettingsChange('layoutPreferences', 'gridComplexity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="complex">Complex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Responsive Priority</Label>
                  <Select
                    value={customizationSettings.layoutPreferences.responsivePriority}
                    onValueChange={(value) => handleCustomizationSettingsChange('layoutPreferences', 'responsivePriority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile-first">Mobile First</SelectItem>
                      <SelectItem value="desktop-first">Desktop First</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Target Application Type</Label>
              <Select
                value={customizationSettings.targetType}
                onValueChange={(value) => handleCustomizationSettingsChange('', 'targetType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="mobile-app">Mobile App</SelectItem>
                  <SelectItem value="web-app">Web App</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="landing-page">Landing Page</SelectItem>
                  <SelectItem value="e-commerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Accessibility Requirements</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>WCAG Compliance Level</Label>
                  <Select
                    value={customizationSettings.constraints.accessibility.wcagLevel}
                    onValueChange={(value) => handleCustomizationSettingsChange('constraints', 'accessibility', {
                      ...customizationSettings.constraints.accessibility,
                      wcagLevel: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">WCAG A (Basic)</SelectItem>
                      <SelectItem value="AA">WCAG AA (Standard)</SelectItem>
                      <SelectItem value="AAA">WCAG AAA (Enhanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Contrast Ratio</Label>
                  <Select
                    value={customizationSettings.constraints.accessibility.minimumContrast.toString()}
                    onValueChange={(value) => handleCustomizationSettingsChange('constraints', 'accessibility', {
                      ...customizationSettings.constraints.accessibility,
                      minimumContrast: parseFloat(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3:1 (Large text only)</SelectItem>
                      <SelectItem value="4.5">4.5:1 (WCAG AA)</SelectItem>
                      <SelectItem value="7">7:1 (WCAG AAA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="colorblind-support"
                  checked={customizationSettings.constraints.accessibility.colorBlindnessSupport}
                  onCheckedChange={(checked) => handleCustomizationSettingsChange('constraints', 'accessibility', {
                    ...customizationSettings.constraints.accessibility,
                    colorBlindnessSupport: checked
                  })}
                />
                <Label htmlFor="colorblind-support">Color blindness support</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="high-contrast"
                  checked={customizationSettings.constraints.accessibility.highContrastMode}
                  onCheckedChange={(checked) => handleCustomizationSettingsChange('constraints', 'accessibility', {
                    ...customizationSettings.constraints.accessibility,
                    highContrastMode: checked
                  })}
                />
                <Label htmlFor="high-contrast">High contrast mode support</Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Technical Requirements</h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="performance-optimization"
                  checked={customizationSettings.constraints.technical.performanceOptimization}
                  onCheckedChange={(checked) => handleCustomizationSettingsChange('constraints', 'technical', {
                    ...customizationSettings.constraints.technical,
                    performanceOptimization: checked
                  })}
                />
                <Label htmlFor="performance-optimization">Performance optimization</Label>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {!isGenerating && !result && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Generate Your Brand Customization</h3>
                  <p className="text-gray-600 mb-6">
                    AI will analyze your brand profile and preferences to create a comprehensive customization package including:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Brand guidelines and identity system</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>AI-generated color palette</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Typography and layout system</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Component customizations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Accessibility compliance report</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Implementation guidelines</span>
                    </div>
                  </div>
                </div>
                <Button onClick={handleGenerate} size="lg" className="mt-6">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Customization
                </Button>
              </div>
            )}

            {isGenerating && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Generating Your Customization</h3>
                  <p className="text-gray-600 mb-4">
                    AI is analyzing your brand and creating your customization...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{Math.round(generationProgress)}% complete</p>
                </div>
              </div>
            )}

            {result && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Customization Complete!</h3>
                  <p className="text-gray-600 mb-4">
                    Your brand customization has been generated with {Math.round(result.confidence)}% confidence.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Palette className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <h4 className="font-semibold">Colors</h4>
                        <p className="text-sm text-gray-600">{result.colorScheme.palette.primary.name} palette</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <h4 className="font-semibold">Components</h4>
                        <p className="text-sm text-gray-600">{result.visualCustomization.visual.components.length} customized</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <h4 className="font-semibold">Compliance</h4>
                        <p className="text-sm text-gray-600">WCAG {customizationSettings.constraints.accessibility.wcagLevel} ready</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            {result && (
              <>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Your Brand Customization</h3>
                  <p className="text-gray-600">Review your AI-generated brand customization and export your files</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Color Palette
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Primary</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-8 h-8 rounded border border-gray-200"
                              style={{ backgroundColor: result.colorScheme.palette.primary.hex }}
                            />
                            <span className="font-mono text-sm">{result.colorScheme.palette.primary.hex}</span>
                          </div>
                        </div>

                        {result.colorScheme.palette.secondary && result.colorScheme.palette.secondary.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Secondary</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {result.colorScheme.palette.secondary.slice(0, 3).map((color, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div
                                    className="w-6 h-6 rounded border border-gray-200"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <span className="font-mono text-xs">{color.hex}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium">Semantic</Label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {Object.entries(result.colorScheme.palette.semantic).slice(0, 4).map(([name, color]) => (
                              <div key={name} className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded border border-gray-200"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="text-xs capitalize">{name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Typography & Layout</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Primary Font</Label>
                        <p className="text-lg font-semibold mt-1" style={{ fontFamily: preview?.typography }}>
                          {preview?.typography || 'Inter'}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Grid System</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {preview?.layout}-column responsive grid
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Components</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {preview?.components.slice(0, 6).map((component, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                    <CardDescription>
                      Download your customization in various formats for implementation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleExport('json')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Complete JSON
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleExport('css')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        CSS Variables
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleExport('tokens')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Design Tokens
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Implementation Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(result.confidence)}%
                        </div>
                        <div className="text-sm text-gray-600">AI Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.colorScheme.validation.accessibility.score}%
                        </div>
                        <div className="text-sm text-gray-600">Accessibility Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {result.colorScheme.palette.primary.name}
                        </div>
                        <div className="text-sm text-gray-600">Theme Style</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Brand Customization</h1>
        <p className="text-gray-600">Create a comprehensive brand customization using AI-powered design intelligence</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= currentStep
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  index < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Info */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
        <p className="text-gray-600">{steps[currentStep].description}</p>
      </div>

      {/* Validation Errors */}
      {renderValidationErrors()}

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === 3 && !result && !isGenerating && (
            <Button onClick={handleGenerate} disabled={!validateCurrentStep()}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </Button>
          )}

          {currentStep < steps.length - 1 && currentStep !== 3 && (
            <Button
              onClick={handleNextStep}
              disabled={!validateCurrentStep()}
            >
              Next
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(0)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to generate CSS export
const generateCSSExport = (result: BrandCustomizationResult): string => {
  const cssVariables: string[] = []

  // Add color variables
  cssVariables.push(`/* Primary Colors */`)
  cssVariables.push(`--color-primary: ${result.colorScheme.palette.primary.hex};`)

  if (result.colorScheme.palette.secondary) {
    result.colorScheme.palette.secondary.forEach((color, index) => {
      cssVariables.push(`--color-secondary-${index + 1}: ${color.hex};`)
    })
  }

  // Add semantic colors
  cssVariables.push(`\n/* Semantic Colors */`)
  Object.entries(result.colorScheme.palette.semantic).forEach(([name, color]) => {
    cssVariables.push(`--color-${name}: ${color.hex};`)
  })

  // Add typography variables
  cssVariables.push(`\n/* Typography */`)
  if (result.visualCustomization.visual.typography[0]) {
    const typography = result.visualCustomization.visual.typography[0]
    typography.fonts.forEach(font => {
      cssVariables.push(`--font-${font.role}: ${font.family};`)
    })
  }

  // Add spacing variables
  cssVariables.push(`\n/* Spacing */`)
  if (result.visualCustomization.visual.layout[0]) {
    const layout = result.visualCustomization.visual.layout[0]
    Object.entries(layout.semantic).forEach(([name, value]) => {
      cssVariables.push(`--spacing-${name}: ${value};`)
    })
  }

  return `:root {\n  ${cssVariables.join('\n  ')}\n}`
}

export default BrandCustomization