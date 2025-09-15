/**
 * @fileoverview HT-011.1.6: Brand Validation Framework UI Components
 * @module components/branding/validation-components
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.6 - Create Brand Validation Framework
 * Focus: Create UI components for brand validation with real-time feedback
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

'use client';

import React, { useState } from 'react';
import { ValidationReport, ValidationResult, ValidationSeverity } from '@/lib/branding/validation-framework';
import { useBrandValidationSystem } from '@/lib/branding/validation-hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Settings, 
  BarChart3, 
  Download,
  RefreshCw,
  Eye,
  Shield,
  Palette,
  Type,
  Zap
} from 'lucide-react';

/**
 * Validation Result Item Component
 */
interface ValidationResultItemProps {
  result: ValidationResult;
  showDetails?: boolean;
}

export function ValidationResultItem({ result, showDetails = false }: ValidationResultItemProps) {
  const getSeverityIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getSeverityColor(result.severity)}`}>
      <div className="flex items-start space-x-3">
        {getSeverityIcon(result.severity)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900">{result.name}</h4>
            {result.passed ? (
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                Passed
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-red-700 bg-red-100">
                Failed
              </Badge>
            )}
            {result.wcagLevel && (
              <Badge variant="outline" className="text-xs">
                WCAG {result.wcagLevel}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{result.message}</p>
          {result.suggestion && showDetails && (
            <p className="text-sm text-gray-500 mt-2 italic">{result.suggestion}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Validation Summary Component
 */
interface ValidationSummaryProps {
  report: ValidationReport;
  onViewDetails?: () => void;
}

export function ValidationSummary({ report, onViewDetails }: ValidationSummaryProps) {
  const passRate = ((report.passedChecks / report.totalChecks) * 100).toFixed(1);
  
  const getOverallStatus = () => {
    if (report.isValid) return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
    if (report.failedChecks > 0) return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
    return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  const status = getOverallStatus();
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
            <CardTitle className="text-lg">Validation Summary</CardTitle>
          </div>
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}
        </div>
        <CardDescription>
          Brand validation completed at {report.timestamp.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{report.passedChecks}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{report.failedChecks}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Pass Rate</span>
            <span>{passRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>WCAG A:</span>
            <span className={report.wcagCompliance.levelA.failed === 0 ? 'text-green-600' : 'text-red-600'}>
              {report.wcagCompliance.levelA.passed}/{report.wcagCompliance.levelA.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span>WCAG AA:</span>
            <span className={report.wcagCompliance.levelAA.failed === 0 ? 'text-green-600' : 'text-red-600'}>
              {report.wcagCompliance.levelAA.passed}/{report.wcagCompliance.levelAA.total}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Validation Details Component
 */
interface ValidationDetailsProps {
  report: ValidationReport;
  onClose?: () => void;
}

export function ValidationDetails({ report, onClose }: ValidationDetailsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', name: 'All', icon: BarChart3 },
    { id: 'accessibility', name: 'Accessibility', icon: Shield },
    { id: 'usability', name: 'Usability', icon: Zap },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'branding', name: 'Branding', icon: Type }
  ];

  const filteredResults = selectedCategory === 'all' 
    ? report.results 
    : report.results.filter(r => r.category === selectedCategory);

  const criticalIssues = filteredResults.filter(r => r.severity === 'error' && !r.passed);
  const warnings = filteredResults.filter(r => r.severity === 'warning' && !r.passed);
  const passedChecks = filteredResults.filter(r => r.passed);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex space-x-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </Button>
          );
        })}
      </div>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            Critical Issues ({criticalIssues.length})
          </h3>
          <div className="space-y-3">
            {criticalIssues.map(result => (
              <ValidationResultItem key={result.id} result={result} showDetails />
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-yellow-600 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Warnings ({warnings.length})
          </h3>
          <div className="space-y-3">
            {warnings.map(result => (
              <ValidationResultItem key={result.id} result={result} showDetails />
            ))}
          </div>
        </div>
      )}

      {/* Passed Checks */}
      {passedChecks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Passed Checks ({passedChecks.length})
          </h3>
          <div className="space-y-3">
            {passedChecks.map(result => (
              <ValidationResultItem key={result.id} result={result} />
            ))}
          </div>
        </div>
      )}

      {filteredResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Info className="w-8 h-8 mx-auto mb-2" />
          <p>No validation results for this category</p>
        </div>
      )}
    </div>
  );
}

/**
 * Validation Configuration Component
 */
interface ValidationConfigProps {
  config: any;
  onConfigChange: (config: any) => void;
}

export function ValidationConfig({ config, onConfigChange }: ValidationConfigProps) {
  const updateConfig = (updates: any) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Validation Configuration
        </CardTitle>
        <CardDescription>
          Configure which validation checks to run
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Accessibility</Label>
              <p className="text-xs text-gray-600">WCAG compliance checks</p>
            </div>
            <Switch
              checked={config.accessibility}
              onCheckedChange={(checked) => updateConfig({ accessibility: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Usability</Label>
              <p className="text-xs text-gray-600">User experience checks</p>
            </div>
            <Switch
              checked={config.usability}
              onCheckedChange={(checked) => updateConfig({ usability: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Design</Label>
              <p className="text-xs text-gray-600">Design consistency checks</p>
            </div>
            <Switch
              checked={config.design}
              onCheckedChange={(checked) => updateConfig({ design: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Branding</Label>
              <p className="text-xs text-gray-600">Brand identity checks</p>
            </div>
            <Switch
              checked={config.branding}
              onCheckedChange={(checked) => updateConfig({ branding: checked })}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Minimum WCAG Level</Label>
          <Select 
            value={config.minWcagLevel} 
            onValueChange={(value) => updateConfig({ minWcagLevel: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">WCAG A</SelectItem>
              <SelectItem value="AA">WCAG AA</SelectItem>
              <SelectItem value="AAA">WCAG AAA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Validation Status Indicator Component
 */
interface ValidationStatusIndicatorProps {
  status: string;
  statusColor: string;
  statusIcon: string;
  statusMessage: string;
  onClick?: () => void;
}

export function ValidationStatusIndicator({ 
  status, 
  statusColor, 
  statusIcon, 
  statusMessage, 
  onClick 
}: ValidationStatusIndicatorProps) {
  return (
    <div 
      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={onClick}
    >
      <span className="text-lg">{statusIcon}</span>
      <div className="flex-1">
        <p className={`text-sm font-medium ${statusColor}`}>{statusMessage}</p>
      </div>
      {onClick && (
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Brand Validator Component
 */
interface BrandValidatorProps {
  onValidationComplete?: (report: ValidationReport) => void;
  showConfiguration?: boolean;
  showAnalytics?: boolean;
}

export function BrandValidator({ 
  onValidationComplete, 
  showConfiguration = true,
  showAnalytics = false 
}: BrandValidatorProps) {
  const {
    validationReport,
    loading,
    error,
    criticalIssues,
    warnings,
    validationStatus,
    statusColor,
    statusIcon,
    statusMessage,
    validateBrand,
    validationConfig,
    updateValidationConfig,
    validationAnalytics
  } = useBrandValidationSystem();

  const [showDetails, setShowDetails] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const handleValidate = async (config: any) => {
    await validateBrand(config);
    if (validationReport && onValidationComplete) {
      onValidationComplete(validationReport);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <ValidationStatusIndicator
        status={validationStatus}
        statusColor={statusColor}
        statusIcon={statusIcon}
        statusMessage={statusMessage}
        onClick={() => setShowDetails(true)}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Validation Summary */}
      {validationReport && (
        <ValidationSummary
          report={validationReport}
          onViewDetails={() => setShowDetails(true)}
        />
      )}

      {/* Quick Actions */}
      <div className="flex space-x-2">
        {showConfiguration && (
          <Button
            variant="outline"
            onClick={() => setShowConfig(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={() => setShowDetails(true)}
          disabled={!validationReport}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>

        {showAnalytics && (
          <Button
            variant="outline"
            onClick={() => {/* Show analytics */}}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        )}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validation Configuration</DialogTitle>
            <DialogDescription>
              Configure which validation checks to run
            </DialogDescription>
          </DialogHeader>
          <ValidationConfig
            config={validationConfig}
            onConfigChange={updateValidationConfig}
          />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Validation Details</DialogTitle>
            <DialogDescription>
              Detailed validation results and recommendations
            </DialogDescription>
          </DialogHeader>
          {validationReport && (
            <ValidationDetails report={validationReport} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
