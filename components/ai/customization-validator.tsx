"use client";

/**
 * Customization Validation Interface
 * HT-033.2.4: Customization Quality Assurance & Validation System
 *
 * Provides user interface for:
 * - Running customization validation
 * - Viewing validation results
 * - Managing validation rules
 * - Fixing validation issues
 * - Tracking validation history
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, Clock, Play, RefreshCw, Download, Settings, Info } from 'lucide-react';
import {
  CustomizationValidationReport,
  ValidationResult,
  ValidationIssue,
  customizationValidator
} from '@/lib/ai/customization-validator';

interface CustomizationValidatorProps {
  customizationId: string;
  clientId: string;
  onValidationComplete?: (report: CustomizationValidationReport) => void;
  className?: string;
}

interface ValidationState {
  isRunning: boolean;
  report: CustomizationValidationReport | null;
  error: string | null;
  history: CustomizationValidationReport[];
}

export function CustomizationValidator({
  customizationId,
  clientId,
  onValidationComplete,
  className
}: CustomizationValidatorProps) {
  const [validationState, setValidationState] = useState<ValidationState>({
    isRunning: false,
    report: null,
    error: null,
    history: []
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    loadValidationHistory();
  }, [customizationId]);

  const loadValidationHistory = async () => {
    try {
      // Load validation history from storage/API
      // For now, we'll simulate loading history
      const history: CustomizationValidationReport[] = [];
      setValidationState(prev => ({ ...prev, history }));
    } catch (error) {
      console.error('Failed to load validation history:', error);
    }
  };

  const runValidation = async () => {
    setValidationState(prev => ({
      ...prev,
      isRunning: true,
      error: null
    }));

    try {
      // Simulate customization data
      const customization = {
        id: customizationId,
        clientId,
        name: 'Client Customization',
        templateId: 'template-1',
        // Add more mock data as needed
      };

      const report = await customizationValidator.validateCustomization(customization);

      setValidationState(prev => ({
        ...prev,
        isRunning: false,
        report,
        history: [report, ...prev.history]
      }));

      onValidationComplete?.(report);
    } catch (error) {
      setValidationState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterIssues = (issues: ValidationIssue[]) => {
    return issues.filter(issue => {
      const categoryMatch = selectedCategory === 'all' || issue.category === selectedCategory;
      const priorityMatch = selectedPriority === 'all' || issue.type === selectedPriority;
      return categoryMatch && priorityMatch;
    });
  };

  const downloadReport = () => {
    if (!validationState.report) return;

    const reportData = JSON.stringify(validationState.report, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${customizationId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const { report } = validationState;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customization Validation</h2>
          <p className="text-muted-foreground">
            Validate customization quality, compliance, and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runValidation}
            disabled={validationState.isRunning}
            className="flex items-center gap-2"
          >
            {validationState.isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {validationState.isRunning ? 'Running...' : 'Run Validation'}
          </Button>
          {report && (
            <Button variant="outline" onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Error State */}
      {validationState.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <p>Validation Error: {validationState.error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {validationState.isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Running validation...</p>
                <p className="text-sm text-muted-foreground">
                  Analyzing customization for quality, compliance, and performance issues
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {report && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{report.overallScore}</p>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </div>
                  {getStatusIcon(report.overallStatus)}
                </div>
                <Progress
                  value={report.overallScore}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{report.summary.passedRules}</p>
                    <p className="text-sm text-muted-foreground">Passed Rules</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-600">{report.summary.failedRules}</p>
                    <p className="text-sm text-muted-foreground">Failed Rules</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{report.summary.criticalIssues}</p>
                    <p className="text-sm text-muted-foreground">Critical Issues</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Category Scores</CardTitle>
              <CardDescription>
                Detailed scores by validation category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(report.categoryScores).map(([category, score]) => (
                  <div key={category} className="text-center">
                    <div className="text-2xl font-bold mb-1">{score}</div>
                    <div className="text-sm text-muted-foreground capitalize">{category}</div>
                    <Progress value={score} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Tabs defaultValue="issues" className="space-y-4">
            <TabsList>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="rules">Validation Rules</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="security">Security</option>
                  <option value="performance">Performance</option>
                  <option value="ux">User Experience</option>
                  <option value="brand">Brand</option>
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Priorities</option>
                  <option value="error">Errors</option>
                  <option value="warning">Warnings</option>
                  <option value="suggestion">Suggestions</option>
                </select>
              </div>

              {/* Issues List */}
              <div className="space-y-3">
                {report.results.flatMap(result =>
                  filterIssues(result.issues).map((issue, index) => (
                    <Card key={`${issue.id}-${index}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getPriorityColor(issue.type)}>
                                {issue.type}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {issue.category}
                              </Badge>
                              {issue.autoFixable && (
                                <Badge variant="secondary">Auto-fixable</Badge>
                              )}
                            </div>
                            <h4 className="font-medium mb-1">{issue.message}</h4>
                            {issue.location && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Location: {issue.location}
                              </p>
                            )}
                            {issue.fix && (
                              <div className="bg-blue-50 p-3 rounded-md">
                                <p className="text-sm font-medium text-blue-700">
                                  Suggested Fix:
                                </p>
                                <p className="text-sm text-blue-600">{issue.fix}</p>
                              </div>
                            )}
                          </div>
                          {issue.autoFixable && (
                            <Button size="sm" variant="outline">
                              Auto Fix
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-3">
                {report.recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{rec}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <div className="space-y-3">
                {customizationValidator.getValidationRules().map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityColor(rule.priority)}>
                              {rule.priority}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {rule.category}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {rule.description}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                {validationState.history.map((historyReport, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(historyReport.overallStatus)}
                            <span className="font-medium">
                              Score: {historyReport.overallScore}
                            </span>
                            <Badge className={getStatusColor(historyReport.overallStatus)}>
                              {historyReport.overallStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {historyReport.validationDate.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {historyReport.summary.passedRules}/{historyReport.summary.totalRules} rules passed
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {historyReport.summary.criticalIssues} critical issues
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Estimated Fix Time */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Estimated Fix Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Time required to address all issues
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{report.estimatedFixTime}min</p>
                  <p className="text-sm text-muted-foreground">
                    {report.summary.autoFixableIssues} auto-fixable
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}