/**
 * @fileoverview Smart Configuration Components
 * @module components/admin/smart-configuration
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Universal Header Compliance:
 * - File: components/admin/smart-configuration.tsx
 * - Purpose: Smart configuration components for HT-032.2.2
 * - Status: Universal header compliant
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Progress } from '@ui/progress';
import { Alert, AlertDescription } from '@ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { 
  Settings, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  BarChart3,
  Cpu,
  Database,
  Globe,
  Lock
} from 'lucide-react';

import { 
  ConfigurationOptimizer,
  ConfigurationContext,
  OptimizedConfiguration,
  OptimizationRecommendation,
  ImplementationStep
} from '@lib/ai/configuration-optimizer';

interface SmartConfigurationProps {
  currentSettings: Record<string, any>;
  environment: 'development' | 'staging' | 'production';
  onConfigurationOptimized?: (config: OptimizedConfiguration) => void;
}

interface ConfigurationState {
  isOptimizing: boolean;
  optimizedConfig: OptimizedConfiguration | null;
  selectedRecommendations: Set<string>;
  implementationProgress: number;
  currentStep: number;
}

export function SmartConfiguration({
  currentSettings,
  environment,
  onConfigurationOptimized
}: SmartConfigurationProps) {
  const [state, setState] = useState<ConfigurationState>({
    isOptimizing: false,
    optimizedConfig: null,
    selectedRecommendations: new Set(),
    implementationProgress: 0,
    currentStep: 0
  });

  const mockPerformanceMetrics = {
    responseTime: 450,
    throughput: 150,
    errorRate: 2.1,
    memoryUsage: 65,
    cpuUsage: 45,
    diskIO: 200
  };

  const mockUsagePatterns = [{
    timeframe: 'last_7_days',
    peakHours: ['09:00', '14:00', '20:00'],
    averageLoad: 120,
    peakLoad: 300,
    userBehavior: {
      sessionDuration: 8.5,
      pagesPerSession: 4.2,
      bounceRate: 35
    }
  }];

  const mockConstraints = {
    budget: 'medium' as const,
    maintenanceWindow: ['02:00-04:00'],
    complianceRequirements: ['GDPR', 'SOC2'],
    businessCriticalFeatures: ['authentication', 'payment_processing'],
    maxDowntime: 15
  };

  const optimizeConfiguration = async () => {
    setState(prev => ({ ...prev, isOptimizing: true }));

    try {
      const optimizer = new ConfigurationOptimizer();
      
      const context: ConfigurationContext = {
        environment,
        currentSettings,
        performanceMetrics: mockPerformanceMetrics,
        usagePatterns: mockUsagePatterns,
        constraints: mockConstraints
      };

      const optimizedConfig = await optimizer.optimizeConfiguration(context);
      
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        optimizedConfig,
        selectedRecommendations: new Set(optimizedConfig.recommendations.map(r => r.id))
      }));

      onConfigurationOptimized?.(optimizedConfig);
    } catch (error) {
      console.error('Error optimizing configuration:', error);
      setState(prev => ({ ...prev, isOptimizing: false }));
    }
  };

  const toggleRecommendation = (recommendationId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedRecommendations);
      if (newSelected.has(recommendationId)) {
        newSelected.delete(recommendationId);
      } else {
        newSelected.add(recommendationId);
      }
      return { ...prev, selectedRecommendations: newSelected };
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'security': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'cost': return <BarChart3 className="h-4 w-4 text-yellow-600" />;
      case 'reliability': return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'scalability': return <Zap className="h-4 w-4 text-red-600" />;
      default: return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const PerformanceMetricsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Current Performance Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Response Time</span>
            </div>
            <div className="text-2xl font-bold">{mockPerformanceMetrics.responseTime}ms</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Throughput</span>
            </div>
            <div className="text-2xl font-bold">{mockPerformanceMetrics.throughput}/s</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Error Rate</span>
            </div>
            <div className="text-2xl font-bold">{mockPerformanceMetrics.errorRate}%</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Memory</span>
            </div>
            <div className="text-2xl font-bold">{mockPerformanceMetrics.memoryUsage}%</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">CPU</span>
            </div>
            <div className="text-2xl font-bold">{mockPerformanceMetrics.cpuUsage}%</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Disk I/O</span>
            </div>
            <div className="text-2xl font-bold">{mockPerformanceMetrics.diskIO}/s</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RecommendationCard = ({ recommendation }: { recommendation: OptimizationRecommendation }) => (
    <Card 
      className={`cursor-pointer transition-all ${
        state.selectedRecommendations.has(recommendation.id) 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:bg-gray-50'
      }`}
      onClick={() => toggleRecommendation(recommendation.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">
              {getCategoryIcon(recommendation.category)}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{recommendation.setting}</h4>
                <Badge className={getPriorityColor(recommendation.priority)}>
                  {recommendation.priority}
                </Badge>
              </div>
              
              <div className="text-sm space-y-1">
                <div><strong>Current:</strong> {JSON.stringify(recommendation.currentValue)}</div>
                <div><strong>Recommended:</strong> {JSON.stringify(recommendation.recommendedValue)}</div>
              </div>
              
              <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
              
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{recommendation.expectedImpact.performance}% performance</span>
                </div>
                {recommendation.expectedImpact.cost !== 0 && (
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>{recommendation.expectedImpact.cost > 0 ? '+' : ''}{recommendation.expectedImpact.cost}% cost</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>+{recommendation.expectedImpact.reliability}% reliability</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className={`text-sm font-medium ${getRiskColor(recommendation.riskLevel)}`}>
              {recommendation.riskLevel} risk
            </div>
            <div className="text-xs text-muted-foreground">
              {recommendation.implementationComplexity} complexity
            </div>
            {state.selectedRecommendations.has(recommendation.id) && (
              <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ImplementationPlanCard = ({ plan }: { plan: ImplementationStep[] }) => (
    <Card>
      <CardHeader>
        <CardTitle>Implementation Plan</CardTitle>
        <CardDescription>
          Step-by-step implementation of selected optimizations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plan.map((step, index) => (
            <div key={step.step} className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {step.step}
              </div>
              <div className="flex-1 space-y-2">
                <div className="font-medium">{step.description}</div>
                <div className="text-sm text-muted-foreground">
                  Estimated duration: {step.expectedDuration} minutes
                </div>
                <div className="text-xs">
                  <strong>Rollback:</strong> {step.rollbackInstructions}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Configuration Optimizer</h2>
          <p className="text-muted-foreground">
            AI-powered configuration optimization for {environment} environment
          </p>
        </div>
        <Button 
          onClick={optimizeConfiguration}
          disabled={state.isOptimizing}
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>{state.isOptimizing ? 'Optimizing...' : 'Optimize Configuration'}</span>
        </Button>
      </div>

      <PerformanceMetricsCard />

      {state.optimizedConfig && (
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="impact">Expected Impact</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="configuration">Final Config</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {state.optimizedConfig.recommendations.length} optimization recommendations
              </div>
              <Badge variant="outline">
                Confidence: {state.optimizedConfig.metadata.confidence}%
              </Badge>
            </div>

            <div className="grid gap-4">
              {state.optimizedConfig.recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expected Impact Summary</CardTitle>
                <CardDescription>
                  Projected improvements from applying selected optimizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto" />
                    <div className="text-2xl font-bold text-green-600">
                      +{state.optimizedConfig.estimatedImpact.performanceImprovement.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Performance Improvement</div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-8 w-8 text-blue-600 mx-auto" />
                    <div className="text-2xl font-bold text-blue-600">
                      -{state.optimizedConfig.estimatedImpact.costReduction.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Cost Reduction</div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto" />
                    <div className="text-2xl font-bold text-purple-600">
                      +{state.optimizedConfig.estimatedImpact.reliabilityIncrease.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Reliability Increase</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-4">
            <ImplementationPlanCard plan={state.optimizedConfig.implementationPlan} />
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Optimized Configuration</CardTitle>
                <CardDescription>
                  Final configuration settings after applying optimizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(state.optimizedConfig.optimizedSettings, null, 2)}
                  </pre>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button>Apply Configuration</Button>
                  <Button variant="outline">Export Configuration</Button>
                  <Button variant="outline">Schedule Implementation</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default SmartConfiguration;
