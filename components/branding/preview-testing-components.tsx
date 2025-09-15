/**
 * @fileoverview HT-011.1.8: Brand Preview and Testing UI Components
 * @module components/branding/preview-testing-components
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.8 - Implement Brand Preview and Testing System
 * Focus: UI components for brand preview and testing functionality
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (branding system enhancement)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Monitor,
  Tablet,
  Smartphone,
  BarChart3,
  Zap,
  Shield,
  Palette
} from 'lucide-react';
import { 
  useBrandPreviewTesting,
  useBrandPreview,
  useBrandTesting,
  useBrandPreviewMetrics,
  useBrandPreviewConfig
} from '@/lib/branding/preview-testing-hooks';
import { DynamicBrandConfig } from '@/lib/branding/logo-manager';
import { BrandPreset } from '@/lib/branding/preset-manager';
import { BrandPreviewTestingUtils } from '@/lib/branding/preview-testing-manager';

/**
 * Brand Preview Component
 */
interface BrandPreviewProps {
  brandConfig: DynamicBrandConfig;
  preset?: BrandPreset;
  onConfigChange?: (config: DynamicBrandConfig) => void;
}

export function BrandPreview({ brandConfig, preset, onConfigChange }: BrandPreviewProps) {
  const { 
    previewState, 
    isLoading, 
    error, 
    updateBrandConfig, 
    refreshPreview,
    setPreviewContainer,
    startAutoRefresh,
    stopAutoRefresh,
    clearError 
  } = useBrandPreview();
  
  const { config, updateConfig, updateDimensions, updateContent, updateSettings } = useBrandPreviewConfig();
  const { metrics, startMonitoring, stopMonitoring } = useBrandPreviewMetrics();
  
  const previewRef = useRef<HTMLDivElement>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  // Initialize preview
  useEffect(() => {
    if (previewRef.current) {
      setPreviewContainer(previewRef.current);
    }
  }, [setPreviewContainer]);

  // Update brand config when props change
  useEffect(() => {
    updateBrandConfig(brandConfig);
  }, [brandConfig, updateBrandConfig]);

  // Handle auto-refresh toggle
  const handleAutoRefreshToggle = (enabled: boolean) => {
    setIsAutoRefresh(enabled);
    updateSettings({ autoRefresh: enabled });
    
    if (enabled) {
      startAutoRefresh();
      startMonitoring();
    } else {
      stopAutoRefresh();
      stopMonitoring();
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Brand Preview
          </CardTitle>
          <CardDescription>
            Live preview of your brand configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview Controls */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={refreshPreview} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={isAutoRefresh}
                onCheckedChange={handleAutoRefreshToggle}
              />
              <Label htmlFor="auto-refresh">Auto Refresh</Label>
            </div>
          </div>

          {/* Device Selection */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={config.dimensions.device === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateDimensions({ device: 'desktop', width: 1200, height: 800 })}
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </Button>
            <Button
              variant={config.dimensions.device === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateDimensions({ device: 'tablet', width: 768, height: 1024 })}
            >
              <Tablet className="h-4 w-4" />
              Tablet
            </Button>
            <Button
              variant={config.dimensions.device === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateDimensions({ device: 'mobile', width: 375, height: 667 })}
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </Button>
          </div>

          {/* Content Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preview Content</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-logo"
                    checked={config.content.showLogo}
                    onCheckedChange={(checked) => updateContent({ showLogo: checked })}
                  />
                  <Label htmlFor="show-logo">Show Logo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-brand-name"
                    checked={config.content.showBrandName}
                    onCheckedChange={(checked) => updateContent({ showBrandName: checked })}
                  />
                  <Label htmlFor="show-brand-name">Show Brand Name</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-navigation"
                    checked={config.content.showNavigation}
                    onCheckedChange={(checked) => updateContent({ showNavigation: checked })}
                  />
                  <Label htmlFor="show-navigation">Show Navigation</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Components</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-buttons"
                    checked={config.content.showButtons}
                    onCheckedChange={(checked) => updateContent({ showButtons: checked })}
                  />
                  <Label htmlFor="show-buttons">Show Buttons</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-cards"
                    checked={config.content.showCards}
                    onCheckedChange={(checked) => updateContent({ showCards: checked })}
                  />
                  <Label htmlFor="show-cards">Show Cards</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-forms"
                    checked={config.content.showForms}
                    onCheckedChange={(checked) => updateContent({ showForms: checked })}
                  />
                  <Label htmlFor="show-forms">Show Forms</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Preview</span>
            <Badge variant={previewState?.status === 'ready' ? 'default' : 'secondary'}>
              {previewState?.status || 'idle'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div 
              ref={previewRef}
              className="w-full h-96 bg-gray-50 flex items-center justify-center"
              style={{ 
                minHeight: `${config.dimensions.height}px`,
                maxWidth: `${config.dimensions.width}px`
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading preview...</span>
                </div>
              ) : previewState?.status === 'error' ? (
                <div className="text-red-500 text-center">
                  <XCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Preview failed to load</p>
                  <p className="text-sm text-gray-500">{previewState.error}</p>
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2" />
                  <p>Preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      {config.settings.showMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Preview Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Render Time</Label>
                <div className="text-2xl font-bold">{metrics.renderTime.toFixed(0)}ms</div>
              </div>
              <div>
                <Label>Load Time</Label>
                <div className="text-2xl font-bold">{metrics.loadTime.toFixed(0)}ms</div>
              </div>
              <div>
                <Label>Accessibility Score</Label>
                <div className="text-2xl font-bold">{metrics.accessibilityScore.toFixed(0)}%</div>
              </div>
              <div>
                <Label>Performance Score</Label>
                <div className="text-2xl font-bold">{metrics.performanceScore.toFixed(0)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Brand Testing Component
 */
interface BrandTestingProps {
  brandConfig: DynamicBrandConfig;
}

export function BrandTesting({ brandConfig }: BrandTestingProps) {
  const { 
    testScenarios, 
    testResults, 
    isRunning, 
    currentTest, 
    error, 
    runTestScenario, 
    runAllTests,
    getLatestTestResult,
    clearError 
  } = useBrandTesting();

  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleRunTest = async (scenarioId: string) => {
    try {
      await runTestScenario(scenarioId);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  const handleRunAllTests = async () => {
    try {
      await runAllTests();
    } catch (error) {
      console.error('Tests failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Brand Testing
          </CardTitle>
          <CardDescription>
            Test your brand configuration for accessibility, usability, and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleRunAllTests} 
              disabled={isRunning}
              className="flex-1"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
          <CardDescription>
            Available test scenarios for brand validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testScenarios.map((scenario) => {
              const latestResult = getLatestTestResult(scenario.id);
              const isRunningThisTest = currentTest === scenario.id;
              
              return (
                <div key={scenario.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <Badge variant="outline">{scenario.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                    {latestResult && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={latestResult.passed ? 'default' : 'destructive'}>
                          {latestResult.score}%
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {latestResult.timestamp.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleRunTest(scenario.id)}
                    disabled={isRunning}
                    size="sm"
                    variant="outline"
                  >
                    {isRunningThisTest ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Latest test execution results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.slice(-5).reverse().map((result) => (
                <div key={`${result.scenarioId}-${result.timestamp.getTime()}`} className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{result.scenarioId}</h4>
                      {result.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <Badge variant={result.passed ? 'default' : 'destructive'}>
                      {result.score}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Score: {result.score}%</p>
                    <p>Passed: {result.metrics.passedChecks}/{result.metrics.totalChecks}</p>
                    <p>Time: {result.timestamp.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Brand Preview Testing Manager Component
 */
interface BrandPreviewTestingManagerProps {
  brandConfig: DynamicBrandConfig;
  preset?: BrandPreset;
}

export function BrandPreviewTestingManager({ brandConfig, preset }: BrandPreviewTestingManagerProps) {
  const [activeTab, setActiveTab] = useState('preview');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <BrandPreview brandConfig={brandConfig} preset={preset} />
        </TabsContent>

        <TabsContent value="testing">
          <BrandTesting brandConfig={brandConfig} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Brand Preview Metrics Component
 */
export function BrandPreviewMetrics() {
  const { metrics, isMonitoring, startMonitoring, stopMonitoring, resetMetrics } = useBrandPreviewMetrics();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Preview Metrics
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => isMonitoring ? stopMonitoring() : startMonitoring()}
              size="sm"
              variant="outline"
            >
              {isMonitoring ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>
            <Button onClick={() => resetMetrics()} size="sm" variant="outline">
              Reset
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Real-time metrics for brand preview performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Render Time</Label>
            <div className="text-2xl font-bold">{metrics.renderTime.toFixed(0)}ms</div>
            <Progress value={Math.min(100, (metrics.renderTime / 100) * 100)} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <Label>Load Time</Label>
            <div className="text-2xl font-bold">{metrics.loadTime.toFixed(0)}ms</div>
            <Progress value={Math.min(100, (metrics.loadTime / 100) * 100)} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <Label>Accessibility Score</Label>
            <div className="text-2xl font-bold">{metrics.accessibilityScore.toFixed(0)}%</div>
            <Progress value={metrics.accessibilityScore} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <Label>Performance Score</Label>
            <div className="text-2xl font-bold">{metrics.performanceScore.toFixed(0)}%</div>
            <Progress value={metrics.performanceScore} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
