/**
 * @fileoverview HT-022.4.3: Performance Dashboard Component
 * @module components/ui/atomic/validation
 * @author Agency Component System
 * @version 1.0.0
 *
 * PERFORMANCE DASHBOARD: Real-time performance and quality monitoring
 * Features:
 * - Performance metrics visualization
 * - Quality score tracking
 * - Client satisfaction monitoring
 * - Delivery time analytics
 * - System reliability status
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  performanceQualityValidator,
  type ValidationResult,
  type PerformanceTargets,
  type QualityMetrics,
  type ClientSatisfactionMetrics,
  type SystemReliabilityMetrics
} from '@/lib/validation/performance-quality-validator';
import { useSimpleTheme } from '../theming/simple-theme-provider';
import { Button } from '../atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../molecules';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../molecules';
import { Badge } from '../atoms';
import {
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Star,
  Shield,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Target,
  Users,
  Zap
} from 'lucide-react';

interface PerformanceDashboardProps {
  className?: string;
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const { currentTheme } = useSimpleTheme();
  const [validationResults, setValidationResults] = useState<{
    overall: ValidationResult | null;
    performance: ValidationResult | null;
    quality: ValidationResult | null;
    satisfaction: ValidationResult | null;
    deliveryTime: ValidationResult | null;
    reliability: ValidationResult | null;
  }>({
    overall: null,
    performance: null,
    quality: null,
    satisfaction: null,
    deliveryTime: null,
    reliability: null
  });

  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock delivery result for validation
  const mockDeliveryResult = {
    deliveryId: 'demo-delivery',
    clientName: 'Demo Client',
    success: true,
    startTime: new Date(Date.now() - 3600000), // 1 hour ago
    endTime: new Date(),
    duration: 3600000, // 1 hour
    qualityGates: {},
    artifacts: [],
    errors: [],
    warnings: []
  };

  const runValidation = useCallback(async () => {
    setIsValidating(true);
    try {
      const results = await performanceQualityValidator.validateAll(
        currentTheme,
        mockDeliveryResult,
        {
          deliveryTimeScore: 4.2,
          qualityScore: 4.5,
          communicationScore: 4.1,
          supportScore: 4.3,
          overallSatisfaction: 4.3,
          wouldRecommend: true
        }
      );
      setValidationResults(results);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  }, [currentTheme]);

  // Run validation on mount and theme change
  useEffect(() => {
    runValidation();
  }, [runValidation]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number): { variant: any; label: string } => {
    if (score >= 90) return { variant: 'default', label: 'Excellent' };
    if (score >= 75) return { variant: 'secondary', label: 'Good' };
    return { variant: 'destructive', label: 'Needs Work' };
  };

  const stats = performanceQualityValidator.getValidationStats();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance & Quality Dashboard
            </CardTitle>
            <CardDescription>
              Real-time monitoring of performance targets and quality metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={runValidation}
              disabled={isValidating}
              variant="outline"
              size="sm"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {stats.totalValidations} Total
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${getScoreColor(validationResults.overall?.score || 0)}`}>
                        {validationResults.overall?.score || '--'}
                      </div>
                      <div className="text-xs text-muted-foreground">Overall Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-md">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${getScoreColor(validationResults.performance?.score || 0)}`}>
                        {validationResults.performance?.score || '--'}
                      </div>
                      <div className="text-xs text-muted-foreground">Performance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-md">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${getScoreColor(validationResults.quality?.score || 0)}`}>
                        {validationResults.quality?.score || '--'}
                      </div>
                      <div className="text-xs text-muted-foreground">Quality</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-md">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${getScoreColor(validationResults.satisfaction?.score || 0)}`}>
                        {validationResults.satisfaction?.score || '--'}
                      </div>
                      <div className="text-xs text-muted-foreground">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Overview */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Validation Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Performance Targets', result: validationResults.performance },
                      { name: 'Quality Metrics', result: validationResults.quality },
                      { name: 'Client Satisfaction', result: validationResults.satisfaction },
                      { name: 'Delivery Time', result: validationResults.deliveryTime },
                      { name: 'System Reliability', result: validationResults.reliability }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center gap-2">
                          {item.result?.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge {...getScoreBadge(item.result?.score || 0)}>
                            {item.result?.score || 0}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Key Issues & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {validationResults.overall?.issues.slice(0, 5).map((issue, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          issue.severity === 'critical' ? 'text-red-500' :
                          issue.severity === 'high' ? 'text-orange-500' :
                          'text-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{issue.message}</div>
                          <div className="text-xs text-muted-foreground">{issue.recommendation}</div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No issues found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance History</CardTitle>
                <CardDescription>Historical validation statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalValidations}</div>
                    <div className="text-sm text-muted-foreground">Total Validations</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.passRate}%</div>
                    <div className="text-sm text-muted-foreground">Pass Rate</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.averageScore}</div>
                    <div className="text-sm text-muted-foreground">Average Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Targets</CardTitle>
                <CardDescription>Component and system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {validationResults.performance ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(validationResults.performance.metrics).map(([key, value]) => (
                        <div key={key} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                            <Badge variant="outline">
                              {typeof value === 'number' ?
                                (key.includes('Time') ? `${value}ms` :
                                 key.includes('Size') ? `${Math.round(value / 1024)}KB` :
                                 key.includes('Memory') ? `${value}MB` :
                                 value.toString()) :
                                String(value)}
                            </Badge>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(10,
                                  key.includes('Time') ? Math.max(0, (300 - (value as number)) / 300 * 100) :
                                  key.includes('Size') ? Math.max(0, (1500000 - (value as number)) / 1500000 * 100) :
                                  75
                                ))}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {validationResults.performance.issues.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Performance Issues</h4>
                        <div className="space-y-2">
                          {validationResults.performance.issues.map((issue, index) => (
                            <div key={index} className="p-3 border-l-4 border-orange-500 bg-orange-50">
                              <div className="font-medium text-orange-800">{issue.message}</div>
                              <div className="text-sm text-orange-600 mt-1">{issue.recommendation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Run validation to see performance metrics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Code quality, accessibility, and best practices scores</CardDescription>
              </CardHeader>
              <CardContent>
                {validationResults.quality ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      {Object.entries(validationResults.quality.metrics).map(([key, value]) => (
                        <div key={key} className="text-center p-4 border rounded-lg">
                          <div className={`text-3xl font-bold mb-2 ${getScoreColor(value as number)}`}>
                            {value}
                            {key !== 'testCoverage' && key.includes('Score') ? '' : '%'}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  (value as number) >= 90 ? 'bg-green-500' :
                                  (value as number) >= 75 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {validationResults.quality.recommendations.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Quality Recommendations</h4>
                        <div className="space-y-2">
                          {validationResults.quality.recommendations.map((rec, index) => (
                            <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50">
                              <div className="text-blue-800 text-sm">{rec}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Run validation to see quality metrics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Satisfaction Tab */}
          <TabsContent value="satisfaction" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Satisfaction</CardTitle>
                <CardDescription>Client feedback and satisfaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {validationResults.satisfaction ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(validationResults.satisfaction.metrics)
                        .filter(([key]) => key !== 'wouldRecommend')
                        .map(([key, value]) => (
                        <div key={key} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase().replace('score', '')}
                            </span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < (value as number) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="ml-2 font-bold">{value}/5</span>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${((value as number) / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Would Recommend</span>
                        <div className="flex items-center gap-2">
                          {validationResults.satisfaction.metrics.wouldRecommend ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="font-bold">
                            {validationResults.satisfaction.metrics.wouldRecommend ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {validationResults.satisfaction.issues.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Satisfaction Issues</h4>
                        <div className="space-y-2">
                          {validationResults.satisfaction.issues.map((issue, index) => (
                            <div key={index} className="p-3 border-l-4 border-red-500 bg-red-50">
                              <div className="font-medium text-red-800">{issue.message}</div>
                              <div className="text-sm text-red-600 mt-1">{issue.recommendation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Run validation to see satisfaction metrics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}