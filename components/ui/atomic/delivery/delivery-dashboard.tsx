/**
 * @fileoverview HT-022.4.2: Delivery Dashboard Component
 * @module components/ui/atomic/delivery
 * @author Agency Component System
 * @version 1.0.0
 *
 * DELIVERY DASHBOARD: UI for managing delivery pipeline
 * Features:
 * - Pipeline execution monitoring
 * - Quality gates visualization
 * - Client handover automation
 * - Delivery history tracking
 * - Performance metrics
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  simpleDeliveryPipeline,
  type DeliveryConfig,
  type DeliveryPipelineResult,
  type QualityGateResult
} from '@/lib/delivery/simple-delivery-pipeline';
import { useSimpleTheme, type SimpleClientTheme } from '../theming/simple-theme-provider';
import { Button, Input, Label } from '../atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../molecules';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../molecules';
import { Badge } from '../atoms';
import {
  Rocket,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText,
  Package,
  AlertCircle,
  TrendingUp,
  Activity,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface DeliveryDashboardProps {
  className?: string;
}

export function DeliveryDashboard({ className }: DeliveryDashboardProps) {
  const { currentTheme } = useSimpleTheme();
  const [activeDelivery, setActiveDelivery] = useState<DeliveryPipelineResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>({
    clientName: '',
    projectName: '',
    theme: currentTheme,
    targetEnvironment: 'staging',
    features: ['theming', 'components', 'responsive'],
    customizations: {}
  });

  const updateConfig = useCallback((updates: Partial<DeliveryConfig>) => {
    setDeliveryConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const executeDelivery = useCallback(async () => {
    if (!deliveryConfig.clientName.trim()) return;

    setIsExecuting(true);
    setActiveDelivery(null);

    try {
      const config = {
        ...deliveryConfig,
        theme: currentTheme
      };

      const result = await simpleDeliveryPipeline.executeDelivery(config);
      setActiveDelivery(result);

    } catch (error) {
      console.error('Delivery execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [deliveryConfig, currentTheme]);

  const downloadArtifact = useCallback((artifactName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = artifactName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const generateHandoverDoc = useCallback(() => {
    if (!activeDelivery) return;

    const documentation = `# ${deliveryConfig.clientName} - Delivery Report

## Delivery Summary
- **Delivery ID:** ${activeDelivery.deliveryId}
- **Status:** ${activeDelivery.success ? 'SUCCESS' : 'FAILED'}
- **Duration:** ${Math.round(activeDelivery.duration / 1000)}s
- **Completed:** ${activeDelivery.endTime.toLocaleString()}

## Quality Gates Results
${Object.entries(activeDelivery.qualityGates).map(([gateId, result]) => `
### ${gateId}
- Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
- Score: ${result.score}%
- Issues: ${result.issues.length}
`).join('')}

## Artifacts Generated
${activeDelivery.artifacts.map(artifact => `- ${artifact.name} (${Math.round(artifact.size / 1024)}KB)`).join('\n')}

## Client Information
- **Theme:** ${deliveryConfig.theme.name}
- **Environment:** ${deliveryConfig.targetEnvironment}
- **Features:** ${deliveryConfig.features.join(', ')}

Generated on: ${new Date().toLocaleString()}`;

    downloadArtifact('delivery-report.md', documentation);
  }, [activeDelivery, deliveryConfig, downloadArtifact]);

  const stats = simpleDeliveryPipeline.getDeliveryStats();

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Delivery Pipeline</h2>
            <p className="text-muted-foreground">
              Optimize micro-app delivery and client handover
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {stats.totalDeliveries} Total
            </Badge>
            <Badge variant={stats.successRate >= 90 ? "default" : "secondary"}>
              {Math.round(stats.successRate)}% Success Rate
            </Badge>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
                  <div className="text-xs text-muted-foreground">Total Deliveries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-md">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{Math.round(stats.successRate)}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-md">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.averageDuration / 1000)}s
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-md">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.mostRecentDelivery ? 'Recent' : 'None'}
                  </div>
                  <div className="text-xs text-muted-foreground">Last Delivery</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="execute" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="execute">Execute Pipeline</TabsTrigger>
            <TabsTrigger value="monitor">Monitor Progress</TabsTrigger>
            <TabsTrigger value="history">Delivery History</TabsTrigger>
          </TabsList>

          {/* Execute Pipeline */}
          <TabsContent value="execute" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Delivery Configuration
                </CardTitle>
                <CardDescription>
                  Configure client delivery parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input
                      id="client-name"
                      value={deliveryConfig.clientName}
                      onChange={(e) => updateConfig({ clientName: e.target.value })}
                      placeholder="Enter client name"
                      disabled={isExecuting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={deliveryConfig.projectName}
                      onChange={(e) => updateConfig({ projectName: e.target.value })}
                      placeholder="Enter project name"
                      disabled={isExecuting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="environment">Target Environment</Label>
                    <select
                      id="environment"
                      value={deliveryConfig.targetEnvironment}
                      onChange={(e) => updateConfig({
                        targetEnvironment: e.target.value as 'development' | 'staging' | 'production'
                      })}
                      disabled={isExecuting}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="domain">Domain (Optional)</Label>
                    <Input
                      id="domain"
                      value={deliveryConfig.domain || ''}
                      onChange={(e) => updateConfig({ domain: e.target.value })}
                      placeholder="https://client-domain.com"
                      disabled={isExecuting}
                    />
                  </div>
                </div>

                <div>
                  <Label>Active Theme</Label>
                  <div className="flex items-center gap-3 mt-2 p-3 border rounded-lg">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    >
                      {currentTheme.logo.initials}
                    </div>
                    <div>
                      <div className="font-medium">{currentTheme.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {currentTheme.colors.primary} • {currentTheme.typography.fontFamily.split(',')[0]}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Ready to execute delivery pipeline
                  </div>
                  <Button
                    onClick={executeDelivery}
                    disabled={isExecuting || !deliveryConfig.clientName.trim()}
                    size="lg"
                  >
                    {isExecuting ? (
                      <>
                        <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Execute Pipeline
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitor Progress */}
          <TabsContent value="monitor" className="space-y-4">
            {activeDelivery ? (
              <div className="space-y-4">
                {/* Delivery Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {activeDelivery.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          Delivery Status
                        </CardTitle>
                        <CardDescription>
                          {activeDelivery.clientName} • {activeDelivery.deliveryId}
                        </CardDescription>
                      </div>
                      <Badge variant={activeDelivery.success ? "default" : "destructive"}>
                        {activeDelivery.success ? 'SUCCESS' : 'FAILED'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {Math.round(activeDelivery.duration / 1000)}s
                        </div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {Object.keys(activeDelivery.qualityGates).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Quality Gates</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {activeDelivery.artifacts.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Artifacts</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Gates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Gates Results</CardTitle>
                    <CardDescription>
                      Automated validation and quality checks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(activeDelivery.qualityGates).map(([gateId, result]) => (
                      <div key={gateId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {result.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="font-medium capitalize">
                              {gateId.replace('-', ' ')}
                            </span>
                          </div>
                          <Badge variant={result.passed ? "default" : "destructive"}>
                            {result.score}%
                          </Badge>
                        </div>

                        {result.issues.length > 0 && (
                          <div className="mb-2">
                            <div className="text-sm font-medium text-red-600 mb-1">Issues:</div>
                            {result.issues.map((issue, index) => (
                              <div key={index} className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {issue}
                              </div>
                            ))}
                          </div>
                        )}

                        {result.recommendations.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-yellow-600 mb-1">Recommendations:</div>
                            {result.recommendations.map((rec, index) => (
                              <div key={index} className="text-sm text-yellow-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {rec}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Artifacts */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Generated Artifacts</CardTitle>
                        <CardDescription>
                          Deployment and handover assets
                        </CardDescription>
                      </div>
                      <Button onClick={generateHandoverDoc} variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {activeDelivery.artifacts.map((artifact, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{artifact.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {artifact.type} • {Math.round(artifact.size / 1024)}KB
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Issues and Warnings */}
                {(activeDelivery.errors.length > 0 || activeDelivery.warnings.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Issues and Warnings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activeDelivery.errors.map((error, index) => (
                        <div key={index} className="flex items-start gap-2 text-red-600">
                          <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{error}</span>
                        </div>
                      ))}
                      {activeDelivery.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 text-yellow-600">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{warning}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Active Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Execute a delivery pipeline to monitor progress here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery History</CardTitle>
                <CardDescription>
                  Past delivery executions and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.totalDeliveries > 0 ? (
                  <div className="space-y-2">
                    {simpleDeliveryPipeline.getDeliveryHistory().slice(-10).reverse().map((delivery) => (
                      <div
                        key={delivery.deliveryId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => setActiveDelivery(delivery)}
                      >
                        <div className="flex items-center gap-3">
                          {delivery.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">{delivery.clientName}</div>
                            <div className="text-sm text-muted-foreground">
                              {delivery.endTime.toLocaleDateString()} •
                              {Math.round(delivery.duration / 1000)}s
                            </div>
                          </div>
                        </div>
                        <Badge variant={delivery.success ? "default" : "destructive"}>
                          {delivery.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Delivery History</h3>
                    <p className="text-sm text-muted-foreground">
                      Delivery history will appear here after pipeline executions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}