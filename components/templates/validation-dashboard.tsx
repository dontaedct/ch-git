'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Play,
  Pause,
  RefreshCw,
  Download,
  Eye,
  Settings,
  Clock,
  Target,
  Zap,
  Shield,
  Code,
  Globe
} from 'lucide-react';
import { TemplateConfig, QualityMetrics } from '@/types/templates/template-config';
import {
  ValidationReport,
  ValidationError,
  templateValidationEngine
} from '@/lib/templates/validation-system';
import {
  QualityAssessment,
  templateQualityAssurance
} from '@/lib/templates/quality-assurance';
import {
  CompatibilityReport,
  templateCompatibilityChecker
} from '@/lib/templates/compatibility-checker';
import {
  TestExecution,
  TestResult,
  templateAutomatedTesting
} from '@/lib/templates/automated-testing';

interface ValidationDashboardProps {
  template?: TemplateConfig;
  onTemplateSelect?: (template: TemplateConfig) => void;
}

export function ValidationDashboard({ template, onTemplateSelect }: ValidationDashboardProps) {
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [qualityAssessment, setQualityAssessment] = useState<QualityAssessment | null>(null);
  const [compatibilityReport, setCompatibilityReport] = useState<CompatibilityReport | null>(null);
  const [testExecutions, setTestExecutions] = useState<Map<string, TestExecution>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('nextjs-14');
  const [activeTab, setActiveTab] = useState('validation');

  useEffect(() => {
    if (template) {
      runFullValidation();
    }
  }, [template, selectedEnvironment]);

  const runFullValidation = async () => {
    if (!template) return;

    setIsRunning(true);
    try {
      const [validation, compatibility, tests] = await Promise.all([
        templateValidationEngine.validateTemplate(template),
        templateCompatibilityChecker.checkCompatibility(template, selectedEnvironment),
        templateAutomatedTesting.runAllTests(template)
      ]);

      setValidationReport(validation);
      setCompatibilityReport(compatibility);
      setTestExecutions(tests);

      if (validation) {
        const quality = await templateQualityAssurance.assessQuality(template, validation);
        setQualityAssessment(quality);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: 'passed' | 'failed' | 'warning' | 'info') => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCertificationBadge = (level: string) => {
    const colors = {
      platinum: 'bg-purple-500',
      gold: 'bg-yellow-500',
      silver: 'bg-gray-400',
      bronze: 'bg-orange-500',
      none: 'bg-gray-300'
    };

    return (
      <Badge className={`${colors[level as keyof typeof colors]} text-white`}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const renderValidationTab = () => (
    <div className="space-y-6">
      {/* Validation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {validationReport?.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Validation Results
            {isRunning && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Template validation score: {validationReport?.score?.toFixed(1) || 0}/100
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationReport && (
            <div className="space-y-4">
              <Progress value={validationReport.score} className="w-full" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {validationReport.metrics.errorCount}
                  </div>
                  <div className="text-muted-foreground">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {validationReport.metrics.warningCount}
                  </div>
                  <div className="text-muted-foreground">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {validationReport.metrics.infoCount}
                  </div>
                  <div className="text-muted-foreground">Info</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      {validationReport && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">Completeness</span>
                </div>
                <Progress value={validationReport.metrics.completeness} />
                <span className="text-xs text-muted-foreground">
                  {validationReport.metrics.completeness}/100
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span className="text-sm font-medium">Maintainability</span>
                </div>
                <Progress value={validationReport.metrics.maintainability} />
                <span className="text-xs text-muted-foreground">
                  {validationReport.metrics.maintainability}/100
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Reusability</span>
                </div>
                <Progress value={validationReport.metrics.reusability} />
                <span className="text-xs text-muted-foreground">
                  {validationReport.metrics.reusability}/100
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Performance</span>
                </div>
                <Progress value={validationReport.metrics.performance} />
                <span className="text-xs text-muted-foreground">
                  {validationReport.metrics.performance}/100
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Security</span>
                </div>
                <Progress value={validationReport.metrics.security} />
                <span className="text-xs text-muted-foreground">
                  {validationReport.metrics.security}/100
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">Accessibility</span>
                </div>
                <Progress value={validationReport.metrics.accessibility} />
                <span className="text-xs text-muted-foreground">
                  {validationReport.metrics.accessibility}/100
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Issues */}
      {validationReport && validationReport.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Issues Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationReport.errors.map((error, index) => (
                <Alert key={index} className={
                  error.type === 'error' ? 'border-red-200' :
                  error.type === 'warning' ? 'border-yellow-200' : 'border-blue-200'
                }>
                  <div className="flex items-start gap-2">
                    {getStatusIcon(error.type === 'error' ? 'failed' : error.type === 'warning' ? 'warning' : 'info')}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-medium">{error.message}</div>
                        {error.location && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Location: {error.location}
                          </div>
                        )}
                        {error.suggestion && (
                          <div className="text-xs text-blue-600 mt-1">
                            Suggestion: {error.suggestion}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderQualityTab = () => (
    <div className="space-y-6">
      {qualityAssessment && (
        <>
          {/* Quality Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Quality Assessment</span>
                {getCertificationBadge(qualityAssessment.certificationLevel)}
              </CardTitle>
              <CardDescription>
                Overall quality score: {qualityAssessment.overallScore}/100
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={qualityAssessment.overallScore} className="w-full" />
            </CardContent>
          </Card>

          {/* Standards Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Passed Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {qualityAssessment.passedStandards.map((standard) => (
                    <div key={standard.id} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{standard.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Failed Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {qualityAssessment.failedStandards.map((standard) => (
                    <div key={standard.id} className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{standard.name}</span>
                      {standard.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {qualityAssessment.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {qualityAssessment.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <Info className="h-4 w-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const renderCompatibilityTab = () => (
    <div className="space-y-6">
      {/* Environment Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nextjs-13">Next.js 13 + React 18</SelectItem>
              <SelectItem value="nextjs-14">Next.js 14 + React 18</SelectItem>
              <SelectItem value="nextjs-15">Next.js 15 + React 19</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {compatibilityReport && (
        <>
          {/* Compatibility Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {compatibilityReport.isCompatible ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Compatibility Results
              </CardTitle>
              <CardDescription>
                Compatibility score: {compatibilityReport.compatibilityScore.toFixed(1)}/100
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={compatibilityReport.compatibilityScore} className="w-full" />
            </CardContent>
          </Card>

          {/* Environment Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Supported Environments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {compatibilityReport.supportedEnvironments.map((env) => (
                    <div key={env} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{env}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Unsupported Environments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {compatibilityReport.unsupportedEnvironments.map((env) => (
                    <div key={env} className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{env}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compatibility Issues */}
          {compatibilityReport.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Compatibility Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {compatibilityReport.issues.map((issue, index) => (
                    <Alert key={index} className={
                      issue.severity === 'critical' ? 'border-red-200' :
                      issue.severity === 'major' ? 'border-yellow-200' : 'border-blue-200'
                    }>
                      <div className="flex items-start gap-2">
                        {getStatusIcon(
                          issue.severity === 'critical' ? 'failed' :
                          issue.severity === 'major' ? 'warning' : 'info'
                        )}
                        <div className="flex-1">
                          <AlertDescription>
                            <div className="font-medium">{issue.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Component: {issue.affectedComponent} | Category: {issue.category}
                            </div>
                            {issue.suggestedFix && (
                              <div className="text-xs text-blue-600 mt-1">
                                Fix: {issue.suggestedFix}
                              </div>
                            )}
                          </AlertDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {issue.severity}
                        </Badge>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const renderTestingTab = () => (
    <div className="space-y-6">
      {Array.from(testExecutions.entries()).map(([suiteId, execution]) => (
        <Card key={suiteId}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="capitalize">{suiteId.replace('-', ' ')}</span>
              <div className="flex items-center gap-2">
                <Badge variant={
                  execution.status === 'completed' && execution.summary.failed === 0 ? 'default' :
                  execution.status === 'failed' || execution.summary.failed > 0 ? 'destructive' :
                  'secondary'
                }>
                  {execution.status}
                </Badge>
                {execution.status === 'running' && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}
              </div>
            </CardTitle>
            <CardDescription>
              {execution.summary.passed}/{execution.summary.total} tests passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress
                value={(execution.summary.passed / execution.summary.total) * 100}
                className="w-full"
              />

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500">
                    {execution.summary.passed}
                  </div>
                  <div className="text-muted-foreground">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-500">
                    {execution.summary.failed}
                  </div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-500">
                    {execution.summary.skipped}
                  </div>
                  <div className="text-muted-foreground">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-500">
                    {execution.summary.duration}ms
                  </div>
                  <div className="text-muted-foreground">Duration</div>
                </div>
              </div>

              {execution.results.length > 0 && (
                <div className="space-y-2">
                  {execution.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status === 'passed' ? 'passed' : 'failed')}
                        <span className="text-sm font-medium">{result.testId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {result.duration}ms
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Validation Dashboard</h2>
          <p className="text-muted-foreground">
            {template ? `Validating: ${template.name}` : 'Select a template to begin validation'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runFullValidation}
            disabled={!template || isRunning}
            size="sm"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Validation
              </>
            )}
          </Button>
        </div>
      </div>

      {template && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="validation">
            {renderValidationTab()}
          </TabsContent>

          <TabsContent value="quality">
            {renderQualityTab()}
          </TabsContent>

          <TabsContent value="compatibility">
            {renderCompatibilityTab()}
          </TabsContent>

          <TabsContent value="testing">
            {renderTestingTab()}
          </TabsContent>
        </Tabs>
      )}

      {!template && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Template Selected</h3>
            <p className="text-muted-foreground text-center">
              Select a template to begin validation and quality assessment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}