/**
 * @fileoverview HT-011.1.7: Brand Import/Export UI Components
 * @module components/branding/import-export-components
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.7 - Implement Brand Import/Export System
 * Focus: UI components for brand import/export functionality
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (branding system enhancement)
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  History,
  Settings,
  Trash2
} from 'lucide-react';
import { 
  useBrandImportExport, 
  useBrandValidation,
  useBrandAnalytics 
} from '@/lib/branding/import-export-hooks';
import { DynamicBrandConfig } from '@/lib/branding/logo-manager';
import { BrandPreset } from '@/lib/branding/preset-manager';
import { BrandImportExportUtils } from '@/lib/branding/import-export-manager';

/**
 * Brand Export Component
 */
interface BrandExportProps {
  brandConfig: DynamicBrandConfig;
  preset?: BrandPreset;
  onExportComplete?: (success: boolean) => void;
}

export function BrandExport({ brandConfig, preset, onExportComplete }: BrandExportProps) {
  const { 
    isExporting, 
    exportError, 
    exportBrandConfig, 
    exportBrandPreset, 
    exportFullBranding,
    downloadExport,
    clearError 
  } = useBrandImportExport();

  const [exportOptions, setExportOptions] = useState({
    format: 'json' as 'json' | 'yaml',
    includeAssets: true,
    includeValidation: true,
    customDescription: ''
  });

  const handleExport = async (type: 'config' | 'preset' | 'full') => {
    try {
      clearError();
      
      let exportData: string;
      const options = {
        format: exportOptions.format,
        includeAssets: exportOptions.includeAssets,
        includeValidation: exportOptions.includeValidation,
        customMetadata: exportOptions.customDescription ? { description: exportOptions.customDescription } : undefined
      };

      switch (type) {
        case 'config':
          exportData = await exportBrandConfig(brandConfig, options);
          break;
        case 'preset':
          if (!preset) throw new Error('No preset available for export');
          exportData = await exportBrandPreset(preset, options);
          break;
        case 'full':
          exportData = await exportFullBranding(brandConfig, preset, undefined, options);
          break;
        default:
          throw new Error('Invalid export type');
      }

      const filename = BrandImportExportUtils.generateFilename(
        type === 'config' ? 'brand-config' : type === 'preset' ? 'preset' : 'full-branding',
        exportOptions.format
      );

      const success = downloadExport(exportData, filename);
      onExportComplete?.(success);
    } catch (error) {
      console.error('Export failed:', error);
      onExportComplete?.(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Brand Configuration
        </CardTitle>
        <CardDescription>
          Export your brand configuration for backup or sharing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {exportError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{exportError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="export-format">Format</Label>
              <Select 
                value={exportOptions.format} 
                onValueChange={(value: 'json' | 'yaml') => 
                  setExportOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="include-assets"
                checked={exportOptions.includeAssets}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeAssets: checked }))
                }
              />
              <Label htmlFor="include-assets">Include Assets</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="include-validation"
                checked={exportOptions.includeValidation}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeValidation: checked }))
                }
              />
              <Label htmlFor="include-validation">Include Validation</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="custom-description">Custom Description (Optional)</Label>
            <Input
              id="custom-description"
              placeholder="Enter custom description for export"
              value={exportOptions.customDescription}
              onChange={(e) => 
                setExportOptions(prev => ({ ...prev, customDescription: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => handleExport('config')} 
            disabled={isExporting}
            className="flex-1"
          >
            {isExporting ? 'Exporting...' : 'Export Config'}
          </Button>
          
          {preset && (
            <Button 
              onClick={() => handleExport('preset')} 
              disabled={isExporting}
              variant="outline"
              className="flex-1"
            >
              Export Preset
            </Button>
          )}
          
          <Button 
            onClick={() => handleExport('full')} 
            disabled={isExporting}
            variant="outline"
            className="flex-1"
          >
            Export Full
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Brand Import Component
 */
interface BrandImportProps {
  onImportComplete?: (result: any) => void;
}

export function BrandImport({ onImportComplete }: BrandImportProps) {
  const { 
    isImporting, 
    importError, 
    importFromFileAndApply,
    clearError 
  } = useBrandImportExport();

  const [importOptions, setImportOptions] = useState({
    validate: true,
    overwrite: false,
    createBackup: true
  });

  const handleFileImport = async (file: File) => {
    try {
      clearError();
      const result = await importFromFileAndApply(file, importOptions);
      onImportComplete?.(result);
    } catch (error) {
      console.error('Import failed:', error);
      onImportComplete?.({ success: false, error: error instanceof Error ? error.message : 'Import failed' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Brand Configuration
        </CardTitle>
        <CardDescription>
          Import a brand configuration from a file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {importError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="validate-import"
              checked={importOptions.validate}
              onCheckedChange={(checked) => 
                setImportOptions(prev => ({ ...prev, validate: checked }))
              }
            />
            <Label htmlFor="validate-import">Validate Before Import</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="overwrite-import"
              checked={importOptions.overwrite}
              onCheckedChange={(checked) => 
                setImportOptions(prev => ({ ...prev, overwrite: checked }))
              }
            />
            <Label htmlFor="overwrite-import">Overwrite Existing</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="create-backup"
              checked={importOptions.createBackup}
              onCheckedChange={(checked) => 
                setImportOptions(prev => ({ ...prev, createBackup: checked }))
              }
            />
            <Label htmlFor="create-backup">Create Backup</Label>
          </div>
        </div>

        <FileUploadArea onFileSelect={handleFileImport} disabled={isImporting} />
      </CardContent>
    </Card>
  );
}

/**
 * File Upload Area Component
 */
interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUploadArea({ onFileSelect, disabled }: FileUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && BrandImportExportUtils.validateFileType(file)) {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && BrandImportExportUtils.validateFileType(file)) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-300 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-600 mb-2">
        {isDragOver ? 'Drop file here' : 'Drag and drop a file or click to browse'}
      </p>
      <p className="text-xs text-gray-500">
        Supported formats: JSON, YAML
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.yaml,.yml"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

/**
 * Import History Component
 */
export function ImportHistory() {
  const { importHistory, clearHistory } = useBrandImportExport();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Import History
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearHistory}
            disabled={importHistory.length === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Recent import operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {importHistory.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No import history available
          </p>
        ) : (
          <div className="space-y-2">
            {importHistory.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {result.success ? 'Import successful' : 'Import failed'}
                  </span>
                </div>
                <div className="flex gap-1">
                  {result.errors.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {result.errors.length} errors
                    </Badge>
                  )}
                  {result.warnings.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {result.warnings.length} warnings
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Brand Analytics Component
 */
export function BrandAnalytics() {
  const { analytics } = useBrandAnalytics();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Import/Export Analytics
        </CardTitle>
        <CardDescription>
          Statistics for brand import/export operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Exports</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>{analytics.totalExports}</span>
              </div>
              <div className="flex justify-between">
                <span>Successful:</span>
                <span className="text-green-600">{analytics.successfulExports}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <span className="text-red-600">{analytics.failedExports}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Imports</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>{analytics.totalImports}</span>
              </div>
              <div className="flex justify-between">
                <span>Successful:</span>
                <span className="text-green-600">{analytics.successfulImports}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <span className="text-red-600">{analytics.failedImports}</span>
              </div>
            </div>
          </div>
        </div>

        {analytics.lastExportDate && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Last export: {analytics.lastExportDate.toLocaleString()}
            </p>
          </div>
        )}

        {analytics.lastImportDate && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Last import: {analytics.lastImportDate.toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main Brand Import/Export Manager Component
 */
interface BrandImportExportManagerProps {
  brandConfig: DynamicBrandConfig;
  preset?: BrandPreset;
}

export function BrandImportExportManager({ brandConfig, preset }: BrandImportExportManagerProps) {
  const [activeTab, setActiveTab] = useState('export');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <BrandExport brandConfig={brandConfig} preset={preset} />
        </TabsContent>

        <TabsContent value="import">
          <div className="space-y-6">
            <BrandImport />
            <ImportHistory />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <BrandAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
