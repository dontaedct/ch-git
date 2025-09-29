/**
 * @fileoverview AI Settings Assistant Interface Components
 * @module components/admin/ai-settings-assistant
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Universal Header Compliance:
 * - File: components/admin/ai-settings-assistant.tsx
 * - Purpose: AI settings assistant interface components for HT-032.2.2
 * - Status: Universal header compliant
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { Badge } from '@ui/badge';
import { Progress } from '@ui/progress';
import { Alert, AlertDescription } from '@ui/alert';
import { 
  Loader2, 
  Sparkles, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Wand2,
  Settings,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

import { 
  AISettingsGenerator, 
  UserRequirements, 
  TemplateContext, 
  SettingsRecommendation,
  GeneratedConfiguration
} from '@lib/ai/settings-generator';

interface AISettingsAssistantProps {
  onConfigurationGenerated?: (config: GeneratedConfiguration) => void;
  initialRequirements?: Partial<UserRequirements>;
  initialTemplate?: Partial<TemplateContext>;
}

interface AssistantState {
  step: 'requirements' | 'analysis' | 'recommendations' | 'configuration';
  isProcessing: boolean;
  progress: number;
  currentMessage: string;
  requirements: UserRequirements;
  templateContext: TemplateContext;
  generatedConfig: GeneratedConfiguration | null;
  selectedRecommendations: Set<string>;
}

export function AISettingsAssistant({
  onConfigurationGenerated,
  initialRequirements = {},
  initialTemplate = {}
}: AISettingsAssistantProps) {
  const [state, setState] = useState<AssistantState>({
    step: 'requirements',
    isProcessing: false,
    progress: 0,
    currentMessage: '',
    requirements: {
      projectType: initialRequirements.projectType || '',
      expectedTraffic: initialRequirements.expectedTraffic || 'medium',
      securityLevel: initialRequirements.securityLevel || 'enhanced',
      performanceGoals: initialRequirements.performanceGoals || [],
      integrations: initialRequirements.integrations || [],
      customRequirements: initialRequirements.customRequirements || ''
    },
    templateContext: {
      templateId: initialTemplate.templateId || '',
      templateType: initialTemplate.templateType || '',
      complexity: initialTemplate.complexity || 'moderate',
      features: initialTemplate.features || [],
      dependencies: initialTemplate.dependencies || [],
      usagePatterns: initialTemplate.usagePatterns || []
    },
    generatedConfig: null,
    selectedRecommendations: new Set()
  });

  const generateConfiguration = async () => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      progress: 0, 
      step: 'analysis',
      currentMessage: 'Initializing AI analysis...' 
    }));

    try {
      const generator = new AISettingsGenerator();
      
      // Simulate processing steps with progress updates
      const steps = [
        { message: 'Analyzing project requirements...', progress: 20 },
        { message: 'Processing template context...', progress: 40 },
        { message: 'Generating AI recommendations...', progress: 60 },
        { message: 'Optimizing configuration settings...', progress: 80 },
        { message: 'Finalizing recommendations...', progress: 100 }
      ];

      for (const step of steps) {
        setState(prev => ({ 
          ...prev, 
          currentMessage: step.message, 
          progress: step.progress 
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const config = await generator.generateSettings(state.requirements, state.templateContext);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        generatedConfig: config,
        step: 'recommendations',
        selectedRecommendations: new Set(config.recommendations.map(r => r.id))
      }));

      onConfigurationGenerated?.(config);
    } catch (error) {
      console.error('Error generating configuration:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        currentMessage: 'Error generating configuration. Please try again.'
      }));
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

  const applySelectedRecommendations = () => {
    if (!state.generatedConfig) return;

    const selectedRecs = state.generatedConfig.recommendations.filter(
      rec => state.selectedRecommendations.has(rec.id)
    );

    const finalConfig = selectedRecs.reduce((config, rec) => {
      config[rec.setting] = rec.value;
      return config;
    }, {} as Record<string, any>);

    setState(prev => ({
      ...prev,
      step: 'configuration',
      generatedConfig: prev.generatedConfig ? {
        ...prev.generatedConfig,
        settings: finalConfig
      } : null
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'scalability': return <Zap className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactBadgeVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (state.step === 'requirements') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>AI Settings Assistant</span>
          </CardTitle>
          <CardDescription>
            Provide your project requirements for intelligent settings generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type</Label>
              <Input
                id="project-type"
                placeholder="e.g., E-commerce, Blog, SaaS"
                value={state.requirements.projectType}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  requirements: { ...prev.requirements, projectType: e.target.value }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expected-traffic">Expected Traffic</Label>
              <select
                id="expected-traffic"
                className="w-full p-2 border rounded-md"
                value={state.requirements.expectedTraffic}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  requirements: { 
                    ...prev.requirements, 
                    expectedTraffic: e.target.value as any 
                  }
                }))}
              >
                <option value="low">Low (&lt; 1K users/day)</option>
                <option value="medium">Medium (1K-10K users/day)</option>
                <option value="high">High (10K-100K users/day)</option>
                <option value="enterprise">Enterprise (&gt; 100K users/day)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="security-level">Security Level</Label>
              <select
                id="security-level"
                className="w-full p-2 border rounded-md"
                value={state.requirements.securityLevel}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  requirements: { 
                    ...prev.requirements, 
                    securityLevel: e.target.value as any 
                  }
                }))}
              >
                <option value="basic">Basic</option>
                <option value="enhanced">Enhanced</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-complexity">Template Complexity</Label>
              <select
                id="template-complexity"
                className="w-full p-2 border rounded-md"
                value={state.templateContext.complexity}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  templateContext: { 
                    ...prev.templateContext, 
                    complexity: e.target.value as any 
                  }
                }))}
              >
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-requirements">Custom Requirements</Label>
            <Textarea
              id="custom-requirements"
              placeholder="Describe any specific requirements, constraints, or preferences..."
              value={state.requirements.customRequirements}
              onChange={(e) => setState(prev => ({
                ...prev,
                requirements: { ...prev.requirements, customRequirements: e.target.value }
              }))}
              rows={3}
            />
          </div>

          <Button 
            onClick={generateConfiguration}
            disabled={!state.requirements.projectType || state.isProcessing}
            className="w-full"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Generate AI Configuration
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state.step === 'analysis') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
            <span>AI Analysis in Progress</span>
          </CardTitle>
          <CardDescription>
            Our AI is analyzing your requirements and generating optimal settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{state.currentMessage}</span>
              <span className="text-sm text-muted-foreground">{state.progress}%</span>
            </div>
            <Progress value={state.progress} className="w-full" />
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>This may take a few moments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.step === 'recommendations' && state.generatedConfig) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>AI Recommendations Generated</span>
            </CardTitle>
            <CardDescription>
              Review and select the recommendations you'd like to apply
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {state.generatedConfig.recommendations.length} recommendations generated
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Confidence:</span>
                <Badge variant="outline" className={getConfidenceColor(state.generatedConfig.metadata.confidence)}>
                  {state.generatedConfig.metadata.confidence}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {state.generatedConfig.recommendations.map((rec) => (
            <Card key={rec.id} className={`cursor-pointer transition-all ${
              state.selectedRecommendations.has(rec.id) 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}>
              <CardContent className="p-4" onClick={() => toggleRecommendation(rec.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getCategoryIcon(rec.category)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{rec.category}: {rec.setting}</h4>
                        <Badge variant={getImpactBadgeVariant(rec.impact)}>
                          {rec.impact} impact
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <strong>Recommended:</strong> {JSON.stringify(rec.value)}
                      </div>
                      
                      <p className="text-sm">{rec.reasoning}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm font-medium ${getConfidenceColor(rec.confidence)}`}>
                      {rec.confidence}%
                    </div>
                    <div className="w-4 h-4">
                      {state.selectedRecommendations.has(rec.id) && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setState(prev => ({ ...prev, step: 'requirements' }))}
          >
            Back to Requirements
          </Button>
          <Button 
            onClick={applySelectedRecommendations}
            disabled={state.selectedRecommendations.size === 0}
          >
            Apply Selected ({state.selectedRecommendations.size})
          </Button>
        </div>
      </div>
    );
  }

  if (state.step === 'configuration' && state.generatedConfig) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-green-600" />
            <span>Generated Configuration</span>
          </CardTitle>
          <CardDescription>
            Your optimized settings configuration is ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configuration generated successfully with {state.selectedRecommendations.size} applied recommendations.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Final Configuration:</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(state.generatedConfig.settings, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button className="flex-1">
                Apply Configuration
              </Button>
              <Button variant="outline">
                Export Config
              </Button>
              <Button variant="outline">
                Save Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default AISettingsAssistant;
