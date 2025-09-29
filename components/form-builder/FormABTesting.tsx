"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Beaker, 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface ABTest {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  startDate?: string
  endDate?: string
  trafficSplit: number // percentage for variant A
  variants: ABTestVariant[]
  metrics: ABTestMetrics
  createdAt: string
  updatedAt: string
}

export interface ABTestVariant {
  id: string
  name: string
  description: string
  isControl: boolean
  formConfig: any // Form configuration for this variant
  trafficPercentage: number
  results: VariantResults
}

export interface VariantResults {
  views: number
  starts: number
  completions: number
  conversionRate: number
  averageCompletionTime: number
  bounceRate: number
  errorRate: number
}

export interface ABTestMetrics {
  primaryMetric: 'conversion_rate' | 'completion_time' | 'bounce_rate' | 'error_rate'
  secondaryMetrics: string[]
  minimumDetectableEffect: number
  confidenceLevel: number
  statisticalSignificance: number
  isSignificant: boolean
}

interface FormABTestingProps {
  tests?: ABTest[]
  onCreateTest?: (test: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateTest?: (testId: string, updates: Partial<ABTest>) => void
  onDeleteTest?: (testId: string) => void
  className?: string
}

export function FormABTesting({
  tests = [],
  onCreateTest,
  onUpdateTest,
  onDeleteTest,
  className
}: FormABTestingProps) {
  const [activeTab, setActiveTab] = useState("tests")
  const [isCreatingTest, setIsCreatingTest] = useState(false)

  // Mock data for demonstration
  const mockTests: ABTest[] = tests.length > 0 ? tests : [
    {
      id: "test_1",
      name: "Form Layout Optimization",
      description: "Testing single column vs two column layout",
      status: 'running',
      startDate: "2024-01-01",
      endDate: "2024-01-15",
      trafficSplit: 50,
      variants: [
        {
          id: "variant_a",
          name: "Control - Single Column",
          description: "Original single column layout",
          isControl: true,
          formConfig: {},
          trafficPercentage: 50,
          results: {
            views: 1250,
            starts: 890,
            completions: 456,
            conversionRate: 51.2,
            averageCompletionTime: 180,
            bounceRate: 48.8,
            errorRate: 2.1
          }
        },
        {
          id: "variant_b",
          name: "Variant - Two Column",
          description: "New two column layout",
          isControl: false,
          formConfig: {},
          trafficPercentage: 50,
          results: {
            views: 1280,
            starts: 920,
            completions: 520,
            conversionRate: 56.5,
            averageCompletionTime: 165,
            bounceRate: 43.5,
            errorRate: 1.8
          }
        }
      ],
      metrics: {
        primaryMetric: 'conversion_rate',
        secondaryMetrics: ['completion_time', 'bounce_rate'],
        minimumDetectableEffect: 5,
        confidenceLevel: 95,
        statisticalSignificance: 87.3,
        isSignificant: false
      },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-10T12:00:00Z"
    }
  ]

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'draft': return <Clock className="h-4 w-4" />
    }
  }

  const calculateImprovement = (control: number, variant: number) => {
    if (control === 0) return 0
    return ((variant - control) / control) * 100
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">A/B Testing</CardTitle>
            <Button onClick={() => setIsCreatingTest(true)}>
              <Beaker className="h-4 w-4 mr-2" />
              Create Test
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tests">Active Tests</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="create">Create Test</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tests" className="space-y-4 mt-6">
              {mockTests.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(test.status)}>
                          {getStatusIcon(test.status)}
                          <span className="ml-1 capitalize">{test.status}</span>
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateTest?.(test.id, { 
                            status: test.status === 'running' ? 'paused' : 'running' 
                          })}
                        >
                          {test.status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {test.variants.map((variant) => (
                        <div key={variant.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{variant.name}</h4>
                            {variant.isControl && (
                              <Badge variant="outline">Control</Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Traffic</span>
                              <span>{variant.trafficPercentage}%</span>
                            </div>
                            <Progress value={variant.trafficPercentage} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Views</p>
                              <p className="font-medium">{variant.results.views.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Completions</p>
                              <p className="font-medium">{variant.results.completions.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Conversion</p>
                              <p className="font-medium">{variant.results.conversionRate.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg. Time</p>
                              <p className="font-medium">{Math.floor(variant.results.averageCompletionTime / 60)}m</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4" />
                          <span className="text-sm font-medium">Statistical Significance</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            "text-sm font-medium",
                            test.metrics.isSignificant ? "text-green-600" : "text-yellow-600"
                          )}>
                            {test.metrics.statisticalSignificance.toFixed(1)}%
                          </span>
                          {test.metrics.isSignificant ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4 mt-6">
              {mockTests.map((test) => {
                const control = test.variants.find(v => v.isControl)
                const variant = test.variants.find(v => !v.isControl)
                
                if (!control || !variant) return null
                
                const conversionImprovement = calculateImprovement(
                  control.results.conversionRate,
                  variant.results.conversionRate
                )
                
                const timeImprovement = calculateImprovement(
                  control.results.averageCompletionTime,
                  variant.results.averageCompletionTime
                )
                
                return (
                  <Card key={test.id}>
                    <CardHeader>
                      <CardTitle>{test.name} - Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900">Conversion Rate</h4>
                            <p className="text-2xl font-bold text-blue-600">
                              {conversionImprovement > 0 ? '+' : ''}{conversionImprovement.toFixed(1)}%
                            </p>
                            <p className="text-sm text-blue-700">
                              {control.results.conversionRate.toFixed(1)}% → {variant.results.conversionRate.toFixed(1)}%
                            </p>
                          </div>
                          
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-900">Completion Time</h4>
                            <p className="text-2xl font-bold text-green-600">
                              {timeImprovement > 0 ? '+' : ''}{timeImprovement.toFixed(1)}%
                            </p>
                            <p className="text-sm text-green-700">
                              {Math.floor(control.results.averageCompletionTime / 60)}m → {Math.floor(variant.results.averageCompletionTime / 60)}m
                            </p>
                          </div>
                          
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-medium text-purple-900">Confidence</h4>
                            <p className="text-2xl font-bold text-purple-600">
                              {test.metrics.statisticalSignificance.toFixed(1)}%
                            </p>
                            <p className="text-sm text-purple-700">
                              {test.metrics.isSignificant ? 'Significant' : 'Not Significant'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Recommendation</h4>
                          <p className="text-sm text-muted-foreground">
                            {test.metrics.isSignificant 
                              ? `The test shows a ${conversionImprovement > 0 ? 'positive' : 'negative'} impact of ${Math.abs(conversionImprovement).toFixed(1)}% on conversion rate with ${test.metrics.statisticalSignificance.toFixed(1)}% confidence. Consider ${conversionImprovement > 0 ? 'implementing' : 'rejecting'} the variant.`
                              : `The test needs more data to reach statistical significance. Current confidence is ${test.metrics.statisticalSignificance.toFixed(1)}%. Continue running the test or increase traffic.`
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
            
            <TabsContent value="create" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New A/B Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="test-name">Test Name</Label>
                    <Input id="test-name" placeholder="e.g., Form Layout Optimization" />
                  </div>
                  
                  <div>
                    <Label htmlFor="test-description">Description</Label>
                    <Input id="test-description" placeholder="Describe what you're testing" />
                  </div>
                  
                  <div>
                    <Label htmlFor="primary-metric">Primary Metric</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                        <SelectItem value="completion_time">Completion Time</SelectItem>
                        <SelectItem value="bounce_rate">Bounce Rate</SelectItem>
                        <SelectItem value="error_rate">Error Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="traffic-split">Traffic Split</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="traffic-split" 
                        type="number" 
                        defaultValue={50} 
                        min={10} 
                        max={90} 
                      />
                      <span className="text-sm text-muted-foreground">% to variant A</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-start" />
                    <Label htmlFor="auto-start">Start test immediately</Label>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={() => setIsCreatingTest(false)}>
                      Create Test
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreatingTest(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default FormABTesting
