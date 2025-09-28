/**
 * @fileoverview Smart Form Builder Component - HT-031.1.3
 * @module components/forms/smart-builder
 * @author Hero Tasks System
 * @version 1.0.0
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Wand2, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Brain,
  Eye,
  Settings,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react'
import { AIFormBuilder, type FormContext, type AIFormSuggestion, type FormAnalysis } from '@/lib/forms/ai-builder'
import { DynamicFormGenerator, type DynamicFormConfig } from '@/lib/forms/dynamic-generator'

interface SmartBuilderProps {
  formContext: FormContext
  onSuggestionApply: (suggestion: AIFormSuggestion) => void
  onFormGenerated?: (generatedForm: any) => void
}

interface SuggestionCategory {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  suggestions: AIFormSuggestion[]
}

export function SmartFormBuilder({ 
  formContext, 
  onSuggestionApply, 
  onFormGenerated 
}: SmartBuilderProps) {
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<AIFormSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<AIFormSuggestion | null>(null)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())
  const [aiBuilder] = useState(() => new AIFormBuilder(formContext))

  const analyzeForm = useCallback(async () => {
    setIsAnalyzing(true)
    try {
      const formAnalysis = await aiBuilder.analyzeForm()
      const formSuggestions = await aiBuilder.generateFormSuggestions()
      
      setAnalysis(formAnalysis)
      setSuggestions(formSuggestions)
    } catch (error) {
      console.error('Error analyzing form:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [aiBuilder])

  useEffect(() => {
    analyzeForm()
  }, [analyzeForm])

  const categorizeSuggestions = (suggestions: AIFormSuggestion[]): SuggestionCategory[] => {
    const categories: SuggestionCategory[] = [
      {
        id: 'accessibility',
        title: 'Accessibility',
        icon: Shield,
        suggestions: suggestions.filter(s => s.type === 'accessibility')
      },
      {
        id: 'validation',
        title: 'Validation',
        icon: CheckCircle,
        suggestions: suggestions.filter(s => s.type === 'validation')
      },
      {
        id: 'layout',
        title: 'Layout',
        icon: Settings,
        suggestions: suggestions.filter(s => s.type === 'layout')
      },
      {
        id: 'optimization',
        title: 'Optimization',
        icon: TrendingUp,
        suggestions: suggestions.filter(s => s.type === 'optimization')
      }
    ]

    return categories.filter(category => category.suggestions.length > 0)
  }

  const applySuggestion = useCallback((suggestion: AIFormSuggestion) => {
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]))
    onSuggestionApply(suggestion)
  }, [onSuggestionApply])

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  const categories = categorizeSuggestions(suggestions)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Form Assistant
          </h2>
          <p className="text-muted-foreground">
            Intelligent analysis and suggestions for your form
          </p>
        </div>
        <Button onClick={analyzeForm} disabled={isAnalyzing} variant="outline">
          <Zap className="h-4 w-4 mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
        </Button>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Completeness</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.completeness)}`}>
                    {analysis.completeness}%
                  </p>
                </div>
                {getScoreIcon(analysis.completeness)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Usability</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.usability)}`}>
                    {analysis.usability}%
                  </p>
                </div>
                {getScoreIcon(analysis.usability)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Accessibility</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.accessibility)}`}>
                    {analysis.accessibility}%
                  </p>
                </div>
                {getScoreIcon(analysis.accessibility)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Performance</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.performance)}`}>
                    {analysis.performance}%
                  </p>
                </div>
                {getScoreIcon(analysis.performance)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analysis && analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              General Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="suggestions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Smart Suggestions
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Quick Templates
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Optimize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {categories.map(category => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.title}
                  <Badge variant="secondary">{category.suggestions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.suggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      className={`p-4 border rounded-lg ${
                        appliedSuggestions.has(suggestion.id) ? 'border-green-200 bg-green-50' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{suggestion.title}</h4>
                            <Badge 
                              variant={suggestion.impact === 'high' ? 'destructive' : 
                                     suggestion.impact === 'medium' ? 'default' : 'secondary'}
                            >
                              {suggestion.impact} impact
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {suggestion.description}
                          </p>
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm font-medium mb-1">Implementation:</p>
                            <p className="text-sm">{suggestion.implementation.details}</p>
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {suggestions.length === 0 && !isAnalyzing && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-medium mb-2">Great Form!</h3>
                  <p className="text-muted-foreground">
                    No suggestions available. Your form looks well-optimized!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Quick Form Templates
              </CardTitle>
              <CardDescription>
                Apply proven form patterns to improve your form structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Contact Form Pattern</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Name, Email, Phone, Message with consent checkbox
                    </p>
                    <Button size="sm" className="w-full">
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Registration Pattern</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Personal info, credentials, terms acceptance
                    </p>
                    <Button size="sm" className="w-full">
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Feedback Pattern</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Rating, category, detailed feedback
                    </p>
                    <Button size="sm" className="w-full">
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Survey Pattern</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Multiple choice, scales, open-ended questions
                    </p>
                    <Button size="sm" className="w-full">
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Form Optimization
              </CardTitle>
              <CardDescription>
                AI-powered optimizations for better performance and user experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Performance Optimization</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Optimize form for faster loading and better performance
                    </p>
                    <Button size="sm" className="w-full">
                      Optimize Performance
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium">Accessibility Enhancement</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Improve accessibility for screen readers and keyboard navigation
                    </p>
                    <Button size="sm" className="w-full">
                      Enhance Accessibility
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium">UX Optimization</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Improve user experience with better field ordering and validation
                    </p>
                    <Button size="sm" className="w-full">
                      Optimize UX
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <h4 className="font-medium">Mobile Optimization</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Optimize form layout and inputs for mobile devices
                    </p>
                    <Button size="sm" className="w-full">
                      Optimize Mobile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
