'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, TrendingUp, Users, Target, Brain, Zap, Shield, BarChart3 } from 'lucide-react';
import { tierSystem, hasFeatureAccess, type UserContext, type TierLevel } from '@/lib/features/tier-system';
import { runtimeConfig } from '@/lib/features/runtime-config';

interface FeatureRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: 'performance' | 'engagement' | 'revenue' | 'security' | 'usability';
  suggestedAction: 'enable' | 'disable' | 'modify' | 'test';
  reasoning: string[];
  metrics?: {
    expectedLift?: number;
    confidenceInterval?: [number, number];
    estimatedROI?: number;
  };
}

interface FeatureUsageData {
  featureId: string;
  usageCount: number;
  userCount: number;
  conversionRate: number;
  errorRate: number;
  performanceImpact: number;
  lastUsed: Date;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface ABTestResult {
  testId: string;
  featureId: string;
  status: 'running' | 'completed' | 'paused';
  variants: Array<{
    id: string;
    name: string;
    performance: number;
    confidence: number;
  }>;
  recommendation?: 'continue' | 'stop' | 'scale_winner' | 'needs_more_data';
}

interface IntelligentManagementProps {
  userContext: UserContext;
  onFeatureToggle?: (featureId: string, enabled: boolean) => void;
  onABTestAction?: (testId: string, action: string) => void;
  onConfigUpdate?: (key: string, value: any) => void;
}

export default function IntelligentFeatureManagement({
  userContext,
  onFeatureToggle,
  onABTestAction,
  onConfigUpdate
}: IntelligentManagementProps) {
  const [recommendations, setRecommendations] = useState<FeatureRecommendation[]>([]);
  const [usageData, setUsageData] = useState<FeatureUsageData[]>([]);
  const [abTestResults, setABTestResults] = useState<ABTestResult[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<FeatureRecommendation | null>(null);
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(false);
  const [optimizationMode, setOptimizationMode] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');

  // Load intelligent recommendations and data
  useEffect(() => {
    loadRecommendations();
    loadUsageData();
    loadABTestResults();
  }, [userContext]);

  const loadRecommendations = async () => {
    // In real implementation, this would call ML/AI service
    const mockRecommendations: FeatureRecommendation[] = [
      {
        id: 'rec-1',
        title: 'Enable AI Form Optimization',
        description: 'Users in your tier would benefit from AI-powered form optimization features',
        confidence: 0.85,
        impact: 'high',
        effort: 'low',
        category: 'engagement',
        suggestedAction: 'enable',
        reasoning: [
          'Your form completion rate is 23% below industry average',
          'Similar organizations saw 31% improvement with AI optimization',
          'Your tier includes access to this feature'
        ],
        metrics: {
          expectedLift: 0.31,
          confidenceInterval: [0.25, 0.37],
          estimatedROI: 2.4
        }
      },
      {
        id: 'rec-2',
        title: 'Optimize Real-time Collaboration Rollout',
        description: 'Gradually increase real-time collaboration feature availability',
        confidence: 0.72,
        impact: 'medium',
        effort: 'medium',
        category: 'usability',
        suggestedAction: 'modify',
        reasoning: [
          'Current 50% rollout shows positive user feedback (4.2/5)',
          'No significant performance degradation observed',
          'Team size correlation suggests higher value for larger teams'
        ],
        metrics: {
          expectedLift: 0.18,
          confidenceInterval: [0.12, 0.24]
        }
      },
      {
        id: 'rec-3',
        title: 'Review Advanced Security Feature Usage',
        description: 'Advanced security features show low adoption despite being enabled',
        confidence: 0.63,
        impact: 'medium',
        effort: 'low',
        category: 'security',
        suggestedAction: 'test',
        reasoning: [
          'Only 15% of eligible users have activated advanced security',
          'May indicate UX friction or lack of awareness',
          'A/B test different onboarding approaches'
        ]
      },
      {
        id: 'rec-4',
        title: 'Cache Configuration Optimization',
        description: 'Adjust cache TTL based on usage patterns',
        confidence: 0.91,
        impact: 'high',
        effort: 'low',
        category: 'performance',
        suggestedAction: 'modify',
        reasoning: [
          'Cache hit rate is only 68% with current 1-hour TTL',
          'Form templates rarely change - can extend TTL safely',
          'Estimated 40% reduction in API calls'
        ],
        metrics: {
          expectedLift: 0.40,
          estimatedROI: 1.8
        }
      }
    ];
    setRecommendations(mockRecommendations);
  };

  const loadUsageData = async () => {
    // Mock usage data
    const mockUsageData: FeatureUsageData[] = [
      {
        featureId: 'basic-forms',
        usageCount: 15420,
        userCount: 1250,
        conversionRate: 0.87,
        errorRate: 0.02,
        performanceImpact: 0.1,
        lastUsed: new Date(),
        trend: 'stable'
      },
      {
        featureId: 'ai-assistance',
        usageCount: 3240,
        userCount: 280,
        conversionRate: 0.94,
        errorRate: 0.01,
        performanceImpact: 0.3,
        lastUsed: new Date(),
        trend: 'increasing'
      },
      {
        featureId: 'real-time-collaboration',
        usageCount: 890,
        userCount: 65,
        conversionRate: 0.91,
        errorRate: 0.03,
        performanceImpact: 0.5,
        lastUsed: new Date(),
        trend: 'increasing'
      }
    ];
    setUsageData(mockUsageData);
  };

  const loadABTestResults = async () => {
    // Mock A/B test results
    const mockResults: ABTestResult[] = [
      {
        testId: 'test-1',
        featureId: 'ai-assistance',
        status: 'running',
        variants: [
          { id: 'control', name: 'Standard AI', performance: 0.87, confidence: 0.95 },
          { id: 'enhanced', name: 'Enhanced AI', performance: 0.94, confidence: 0.89 }
        ],
        recommendation: 'scale_winner'
      },
      {
        testId: 'test-2',
        featureId: 'form-templates',
        status: 'completed',
        variants: [
          { id: 'minimal', name: 'Minimal UI', performance: 0.82, confidence: 0.97 },
          { id: 'detailed', name: 'Detailed UI', performance: 0.79, confidence: 0.96 }
        ],
        recommendation: 'scale_winner'
      }
    ];
    setABTestResults(mockResults);
  };

  const handleRecommendationAction = async (recommendation: FeatureRecommendation) => {
    switch (recommendation.suggestedAction) {
      case 'enable':
        // Enable feature through feature flag system
        onFeatureToggle?.(recommendation.id.replace('rec-', 'feature-'), true);
        break;
      case 'disable':
        onFeatureToggle?.(recommendation.id.replace('rec-', 'feature-'), false);
        break;
      case 'modify':
        // Open configuration modal or apply suggested changes
        break;
      case 'test':
        // Initiate A/B test
        break;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'engagement': return <Users className="h-4 w-4" />;
      case 'revenue': return <TrendingUp className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'usability': return <Target className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const sortedRecommendations = useMemo(() => {
    return [...recommendations].sort((a, b) => {
      // Sort by confidence first, then impact
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      const impactWeight = { high: 3, medium: 2, low: 1 };
      return impactWeight[b.impact] - impactWeight[a.impact];
    });
  }, [recommendations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Intelligent Feature Management
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered recommendations for optimal feature configuration
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-optimization">Auto-optimization</Label>
            <Switch
              id="auto-optimization"
              checked={autoOptimizationEnabled}
              onCheckedChange={setAutoOptimizationEnabled}
            />
          </div>
          <Select value={optimizationMode} onValueChange={(value: any) => setOptimizationMode(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Features</p>
                <p className="text-2xl font-bold">{usageData.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Conversion</p>
                <p className="text-2xl font-bold">
                  {Math.round(usageData.reduce((acc, d) => acc + d.conversionRate, 0) / usageData.length * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Running Tests</p>
                <p className="text-2xl font-bold">
                  {abTestResults.filter(t => t.status === 'running').length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recommendations</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
              <Brain className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>
            AI-generated suggestions to optimize your feature configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getCategoryIcon(recommendation.category)}
                      <h3 className="font-semibold">{recommendation.title}</h3>
                      <Badge className={getImpactColor(recommendation.impact)}>
                        {recommendation.impact} impact
                      </Badge>
                      <Badge className={getEffortColor(recommendation.effort)}>
                        {recommendation.effort} effort
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(recommendation.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{recommendation.description}</p>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Reasoning:</Label>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {recommendation.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {recommendation.metrics && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {recommendation.metrics.expectedLift && (
                            <div>
                              <span className="text-gray-600">Expected Lift:</span>
                              <span className="font-semibold ml-1">
                                +{Math.round(recommendation.metrics.expectedLift * 100)}%
                              </span>
                            </div>
                          )}
                          {recommendation.metrics.estimatedROI && (
                            <div>
                              <span className="text-gray-600">Est. ROI:</span>
                              <span className="font-semibold ml-1">
                                {recommendation.metrics.estimatedROI}x
                              </span>
                            </div>
                          )}
                          {recommendation.metrics.confidenceInterval && (
                            <div>
                              <span className="text-gray-600">CI:</span>
                              <span className="font-semibold ml-1">
                                {Math.round(recommendation.metrics.confidenceInterval[0] * 100)}-
                                {Math.round(recommendation.metrics.confidenceInterval[1] * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleRecommendationAction(recommendation)}
                    >
                      {recommendation.suggestedAction === 'enable' && 'Enable'}
                      {recommendation.suggestedAction === 'disable' && 'Disable'}
                      {recommendation.suggestedAction === 'modify' && 'Configure'}
                      {recommendation.suggestedAction === 'test' && 'Start Test'}
                    </Button>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* A/B Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>A/B Test Intelligence</CardTitle>
          <CardDescription>
            Automated analysis of running experiments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {abTestResults.map((test) => (
            <Card key={test.testId} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Feature: {test.featureId}</h3>
                  <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                    {test.status}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {test.variants.map((variant) => (
                      <div key={variant.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{variant.name}</span>
                          <span className="text-sm text-gray-500">
                            {Math.round(variant.confidence * 100)}% confidence
                          </span>
                        </div>
                        <div className="text-2xl font-bold">
                          {Math.round(variant.performance * 100)}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${variant.performance * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {test.recommendation && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          AI Recommendation: {test.recommendation.replace('_', ' ')}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onABTestAction?.(test.testId, test.recommendation!)}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Feature Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Performance Analytics</CardTitle>
          <CardDescription>
            Real-time insights into feature adoption and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageData.map((data) => (
              <div key={data.featureId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{data.featureId}</h3>
                    <Badge variant={data.trend === 'increasing' ? 'default' : 'outline'}>
                      {data.trend}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Usage Count:</span>
                      <span className="font-semibold ml-1">{data.usageCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Users:</span>
                      <span className="font-semibold ml-1">{data.userCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Conversion:</span>
                      <span className="font-semibold ml-1">{Math.round(data.conversionRate * 100)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Error Rate:</span>
                      <span className="font-semibold ml-1">{Math.round(data.errorRate * 100)}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Performance Impact</div>
                  <div className="text-lg font-semibold">
                    {data.performanceImpact > 0 ? '+' : ''}{Math.round(data.performanceImpact * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}