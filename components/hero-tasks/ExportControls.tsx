/**
 * Hero Tasks - Export Controls Component
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { Checkbox } from '@ui/checkbox';
import { Badge } from '@ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Settings,
  Calendar,
  Users,
  Tag,
  MessageSquare,
  Paperclip,
  History,
  Database,
  BarChart3
} from 'lucide-react';
import {
  ExportRequest,
  ExportFormat,
  ExportType,
  ExportOptions,
  TaskSearchFilters
} from '@/types/hero-tasks';

interface ExportControlsProps {
  selectedTasks?: string[];
  currentFilters?: TaskSearchFilters;
  onExport: (exportRequest: ExportRequest) => Promise<void>;
  className?: string;
}

export function ExportControls({
  selectedTasks = [],
  currentFilters,
  onExport,
  className
}: ExportControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.CSV);
  const [exportType, setExportType] = useState<ExportType>(ExportType.ALL_TASKS);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    include_subtasks: true,
    include_comments: false,
    include_attachments: false,
    include_workflow_history: false,
    include_metadata: true,
    date_format: 'iso',
    field_selection: []
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const exportRequest: ExportRequest = {
        export_type: exportType,
        format: exportFormat,
        filters: exportType === ExportType.FILTERED_TASKS ? currentFilters : undefined,
        task_ids: exportType === ExportType.SELECTED_TASKS ? selectedTasks : undefined,
        options: exportOptions
      };

      await onExport(exportRequest);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    const icons = {
      [ExportFormat.CSV]: FileText,
      [ExportFormat.JSON]: File,
      [ExportFormat.PDF]: FileText,
      [ExportFormat.EXCEL]: FileSpreadsheet
    };
    const IconComponent = icons[format];
    return <IconComponent className="w-4 h-4" />;
  };

  const getFormatDescription = (format: ExportFormat) => {
    const descriptions = {
      [ExportFormat.CSV]: 'Comma-separated values, compatible with Excel and Google Sheets',
      [ExportFormat.JSON]: 'JavaScript Object Notation, full data structure',
      [ExportFormat.PDF]: 'Portable Document Format, formatted report',
      [ExportFormat.EXCEL]: 'Microsoft Excel format with formatting'
    };
    return descriptions[format];
  };

  const getExportTypeDescription = (type: ExportType) => {
    const descriptions = {
      [ExportType.ALL_TASKS]: 'Export all tasks in the system',
      [ExportType.FILTERED_TASKS]: 'Export tasks matching current filters',
      [ExportType.SELECTED_TASKS]: `Export ${selectedTasks.length} selected tasks`,
      [ExportType.TASK_REPORT]: 'Generate a comprehensive task report',
      [ExportType.ANALYTICS_REPORT]: 'Generate analytics and metrics report',
      [ExportType.CUSTOM_REPORT]: 'Create a custom report with specific criteria'
    };
    return descriptions[type];
  };

  const isSelectedTasksDisabled = selectedTasks.length === 0;
  const isFilteredTasksDisabled = !currentFilters || Object.keys(currentFilters).length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Tasks
          </DialogTitle>
          <DialogDescription>
            Choose export format and options to download your tasks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Type</Label>
            <Select value={exportType} onValueChange={(value) => setExportType(value as ExportType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ExportType.ALL_TASKS}>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    All Tasks
                  </div>
                </SelectItem>
                <SelectItem value={ExportType.FILTERED_TASKS} disabled={isFilteredTasksDisabled}>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Filtered Tasks
                    {isFilteredTasksDisabled && (
                      <Badge variant="secondary" className="ml-2">No filters</Badge>
                    )}
                  </div>
                </SelectItem>
                <SelectItem value={ExportType.SELECTED_TASKS} disabled={isSelectedTasksDisabled}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Selected Tasks
                    {isSelectedTasksDisabled && (
                      <Badge variant="secondary" className="ml-2">No selection</Badge>
                    )}
                  </div>
                </SelectItem>
                <SelectItem value={ExportType.TASK_REPORT}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Task Report
                  </div>
                </SelectItem>
                <SelectItem value={ExportType.ANALYTICS_REPORT}>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Analytics Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {getExportTypeDescription(exportType)}
            </p>
          </div>

          {/* Export Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(ExportFormat).map((format) => (
                <Card
                  key={format}
                  className={`cursor-pointer transition-colors ${
                    exportFormat === format ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setExportFormat(format)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getFormatIcon(format)}
                      <span className="font-medium capitalize">{format}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {getFormatDescription(format)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <Label className="text-sm font-medium">Export Options</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_subtasks"
                    checked={exportOptions.include_subtasks}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, include_subtasks: !!checked }))
                    }
                  />
                  <Label htmlFor="include_subtasks" className="text-sm">
                    Include Subtasks
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_comments"
                    checked={exportOptions.include_comments}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, include_comments: !!checked }))
                    }
                  />
                  <Label htmlFor="include_comments" className="text-sm">
                    Include Comments
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_attachments"
                    checked={exportOptions.include_attachments}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, include_attachments: !!checked }))
                    }
                  />
                  <Label htmlFor="include_attachments" className="text-sm">
                    Include Attachments
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_workflow_history"
                    checked={exportOptions.include_workflow_history}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, include_workflow_history: !!checked }))
                    }
                  />
                  <Label htmlFor="include_workflow_history" className="text-sm">
                    Include Workflow History
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_metadata"
                    checked={exportOptions.include_metadata}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, include_metadata: !!checked }))
                    }
                  />
                  <Label htmlFor="include_metadata" className="text-sm">
                    Include Metadata
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_format" className="text-sm">Date Format</Label>
                  <Select
                    value={exportOptions.date_format}
                    onValueChange={(value) =>
                      setExportOptions(prev => ({ ...prev, date_format: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso">ISO 8601 (2025-01-27T12:00:00Z)</SelectItem>
                      <SelectItem value="local">Local Format (1/27/2025)</SelectItem>
                      <SelectItem value="custom">Custom Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Export Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="capitalize">{exportFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{getExportTypeDescription(exportType)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Options:</span>
                  <span>
                    {Object.entries(exportOptions)
                      .filter(([key, value]) => typeof value === 'boolean' && value)
                      .map(([key]) => key.replace('include_', ''))
                      .join(', ') || 'None'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Tasks
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExportControls;
