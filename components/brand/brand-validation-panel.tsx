/**
 * @fileoverview Brand Validation Panel Component
 * @module components/brand/brand-validation-panel
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.4: Brand Configuration User Interface
 * Component for displaying brand validation results and recommendations.
 */

'use client';

import { BrandValidationResult } from '@/types/brand-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface BrandValidationPanelProps {
  validation: BrandValidationResult;
  onClose: () => void;
}

export function BrandValidationPanel({ validation, onClose }: BrandValidationPanelProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Brand Validation Results
              </CardTitle>
              <CardDescription>
                Review validation results and recommendations for your brand configuration
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Status */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              {validation.valid ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <h3 className="font-semibold">
                  {validation.valid ? 'Brand Configuration Valid' : 'Brand Configuration Issues Found'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {validation.valid 
                    ? 'Your brand configuration meets all requirements'
                    : `${validation.errors.length} error(s) and ${validation.warnings.length} warning(s) found`
                  }
                </p>
              </div>
            </div>
            <Badge variant={validation.valid ? 'default' : 'destructive'}>
              {validation.valid ? 'Valid' : 'Issues Found'}
            </Badge>
          </div>

          {/* Scores */}
          {(validation.accessibilityScore !== undefined || validation.usabilityScore !== undefined) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validation.accessibilityScore !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(validation.accessibilityScore)}`}>
                        {validation.accessibilityScore}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Accessibility Score</p>
                      <Badge variant="outline" className="mt-2">
                        {getScoreLabel(validation.accessibilityScore)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
              {validation.usabilityScore !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(validation.usabilityScore)}`}>
                        {validation.usabilityScore}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Usability Score</p>
                      <Badge variant="outline" className="mt-2">
                        {getScoreLabel(validation.usabilityScore)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Errors */}
          {validation.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Errors ({validation.errors.length})
                </CardTitle>
                <CardDescription>
                  Issues that must be fixed before the brand can be applied
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {validation.errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    {getSeverityIcon(error.severity)}
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">{error.message}</p>
                        <p className="text-xs opacity-75">Path: {error.path}</p>
                        <p className="text-xs opacity-75">Code: {error.code}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Warnings ({validation.warnings.length})
                </CardTitle>
                <CardDescription>
                  Recommendations to improve your brand configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {validation.warnings.map((warning, index) => (
                  <Alert key={index}>
                    {getSeverityIcon(warning.severity)}
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">{warning.message}</p>
                        <p className="text-xs opacity-75">Path: {warning.path}</p>
                        <p className="text-xs opacity-75">Code: {warning.code}</p>
                        {warning.suggestion && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                            <p className="font-medium text-blue-800 dark:text-blue-200">Suggestion:</p>
                            <p className="text-blue-700 dark:text-blue-300">{warning.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommendations</CardTitle>
              <CardDescription>
                Best practices for brand configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Color Contrast:</strong> Ensure sufficient contrast between text and background colors for accessibility compliance (WCAG AA standard).
                </AlertDescription>
              </Alert>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Typography:</strong> Use web-safe fonts or ensure custom fonts are properly loaded to prevent layout shifts.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Assets:</strong> Optimize images and logos for web use to ensure fast loading times and crisp display across devices.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Consistency:</strong> Maintain consistent spacing, colors, and typography throughout your brand configuration.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-validate
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Guidelines
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {validation.valid && (
                <Button>
                  Apply Brand
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
