'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Check, X, Save, Undo, Settings, Code, Eye } from 'lucide-react';
import {
  CustomizationConfig,
  CustomizationType,
  CustomizationPoint,
  CustomizationRule,
  ValidationResult,
  CUSTOMIZATION_TYPES,
  createCustomizationConfig,
  validateCustomizationConfig
} from '@/types/templates/customization';

interface CustomizationEditorProps {
  templateId: string;
  points: CustomizationPoint[];
  configurations: CustomizationConfig[];
  onSave: (configurations: CustomizationConfig[]) => Promise<void>;
  onPreview: (configurations: CustomizationConfig[]) => void;
  readonly?: boolean;
}

export function CustomizationEditor({
  templateId,
  points,
  configurations: initialConfigurations,
  onSave,
  onPreview,
  readonly = false
}: CustomizationEditorProps) {
  const [configurations, setConfigurations] = useState<CustomizationConfig[]>(initialConfigurations);
  const [selectedPoint, setSelectedPoint] = useState<CustomizationPoint | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<CustomizationConfig | null>(null);
  const [validationResults, setValidationResults] = useState<Map<string, ValidationResult>>(new Map());
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CustomizationType | 'all'>('all');

  const filteredPoints = points.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         point.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || point.type === filterType;
    return matchesSearch && matchesType;
  });

  const getConfigForPoint = useCallback((pointId: string) => {
    return configurations.find(config => config.target === pointId);
  }, [configurations]);

  const updateConfiguration = useCallback((pointId: string, value: any) => {
    if (readonly) return;

    const point = points.find(p => p.id === pointId);
    if (!point) return;

    setConfigurations(prev => {
      const existing = prev.find(config => config.target === pointId);
      if (existing) {
        const updated = { ...existing, value, metadata: { ...existing.metadata, updated: new Date() } };
        return prev.map(config => config.target === pointId ? updated : config);
      } else {
        const newConfig = createCustomizationConfig(point.type, pointId, value);
        return [...prev, newConfig];
      }
    });
    setHasChanges(true);
  }, [points, readonly]);

  const validateConfigurations = useCallback(() => {
    const results = new Map<string, ValidationResult>();
    configurations.forEach(config => {
      const result = validateCustomizationConfig(config);
      results.set(config.id, result);
    });
    setValidationResults(results);
  }, [configurations]);

  useEffect(() => {
    validateConfigurations();
  }, [validateConfigurations]);

  const handleSave = async () => {
    if (readonly) return;

    const hasErrors = Array.from(validationResults.values()).some(result => !result.valid);
    if (hasErrors) return;

    try {
      await onSave(configurations);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save configurations:', error);
    }
  };

  const handlePreview = () => {
    onPreview(configurations);
    setIsPreviewMode(!isPreviewMode);
  };

  const handleReset = () => {
    if (readonly) return;
    setConfigurations(initialConfigurations);
    setHasChanges(false);
  };

  const renderValueEditor = (point: CustomizationPoint, currentValue: any) => {
    const commonProps = {
      disabled: readonly,
      onChange: (value: any) => updateConfiguration(point.id, value)
    };

    switch (point.type) {
      case 'branding':
        return (
          <div className="space-y-4">
            <div>
              <Label>Brand Color</Label>
              <Input
                type="color"
                value={currentValue?.color || point.defaultValue?.color || '#000000'}
                onChange={(e) => commonProps.onChange({ ...currentValue, color: e.target.value })}
                disabled={commonProps.disabled}
              />
            </div>
            <div>
              <Label>Brand Name</Label>
              <Input
                value={currentValue?.name || point.defaultValue?.name || ''}
                onChange={(e) => commonProps.onChange({ ...currentValue, name: e.target.value })}
                disabled={commonProps.disabled}
              />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={currentValue?.logo || point.defaultValue?.logo || ''}
                onChange={(e) => commonProps.onChange({ ...currentValue, logo: e.target.value })}
                disabled={commonProps.disabled}
              />
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-4">
            <div>
              <Label>Text Content</Label>
              <Textarea
                value={currentValue?.text || point.defaultValue?.text || ''}
                onChange={(e) => commonProps.onChange({ ...currentValue, text: e.target.value })}
                disabled={commonProps.disabled}
                rows={4}
              />
            </div>
            <div>
              <Label>Content Type</Label>
              <Select
                value={currentValue?.type || point.defaultValue?.type || 'text'}
                onValueChange={(value) => commonProps.onChange({ ...currentValue, type: value })}
                disabled={commonProps.disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'styling':
        return (
          <div className="space-y-4">
            <div>
              <Label>CSS Properties</Label>
              <Textarea
                value={JSON.stringify(currentValue || point.defaultValue || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    commonProps.onChange(parsed);
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                disabled={commonProps.disabled}
                rows={6}
                className="font-mono"
              />
            </div>
          </div>
        );

      case 'layout':
        return (
          <div className="space-y-4">
            <div>
              <Label>Layout Type</Label>
              <Select
                value={currentValue?.type || point.defaultValue?.type || 'grid'}
                onValueChange={(value) => commonProps.onChange({ ...currentValue, type: value })}
                disabled={commonProps.disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="flex">Flex</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="inline">Inline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Columns</Label>
              <Input
                type="number"
                value={currentValue?.columns || point.defaultValue?.columns || 1}
                onChange={(e) => commonProps.onChange({ ...currentValue, columns: parseInt(e.target.value) })}
                disabled={commonProps.disabled}
                min={1}
                max={12}
              />
            </div>
          </div>
        );

      case 'behavior':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={currentValue?.enabled ?? point.defaultValue?.enabled ?? false}
                onCheckedChange={(checked) => commonProps.onChange({ ...currentValue, enabled: checked })}
                disabled={commonProps.disabled}
              />
              <Label>Enable Behavior</Label>
            </div>
            <div>
              <Label>Trigger Event</Label>
              <Select
                value={currentValue?.trigger || point.defaultValue?.trigger || 'click'}
                onValueChange={(value) => commonProps.onChange({ ...currentValue, trigger: value })}
                disabled={commonProps.disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="click">Click</SelectItem>
                  <SelectItem value="hover">Hover</SelectItem>
                  <SelectItem value="focus">Focus</SelectItem>
                  <SelectItem value="scroll">Scroll</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'functionality':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={currentValue?.enabled ?? point.defaultValue?.enabled ?? false}
                onCheckedChange={(checked) => commonProps.onChange({ ...currentValue, enabled: checked })}
                disabled={commonProps.disabled}
              />
              <Label>Enable Feature</Label>
            </div>
            <div>
              <Label>Configuration</Label>
              <Textarea
                value={JSON.stringify(currentValue?.config || point.defaultValue?.config || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    commonProps.onChange({ ...currentValue, config: parsed });
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                disabled={commonProps.disabled}
                rows={4}
                className="font-mono"
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label>Value</Label>
            <Input
              value={String(currentValue || point.defaultValue || '')}
              onChange={(e) => commonProps.onChange(e.target.value)}
              disabled={commonProps.disabled}
            />
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Customization</h2>
          <p className="text-muted-foreground">Configure template customization points</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              Unsaved Changes
            </Badge>
          )}
          {!readonly && (
            <>
              <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
                <Undo className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label>Search Points</Label>
              <Input
                placeholder="Search customization points..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label>Filter by Type</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {CUSTOMIZATION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Points List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Customization Points</CardTitle>
              <CardDescription>
                {filteredPoints.length} of {points.length} points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPoints.map(point => {
                  const config = getConfigForPoint(point.id);
                  const validation = config ? validationResults.get(config.id) : null;
                  const hasError = validation && !validation.valid;
                  const isModified = config && config.value !== point.defaultValue;

                  return (
                    <div
                      key={point.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPoint?.id === point.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPoint(point)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{point.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {point.description}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {isModified && <Badge variant="secondary" className="text-xs">Modified</Badge>}
                          {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
                          {config && !hasError && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {point.type}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {selectedPoint ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedPoint.name}</CardTitle>
                    <CardDescription>{selectedPoint.description}</CardDescription>
                  </div>
                  <Badge variant="outline">{selectedPoint.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="editor" className="h-full">
                  <TabsList>
                    <TabsTrigger value="editor">
                      <Settings className="h-4 w-4 mr-2" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="code">
                      <Code className="h-4 w-4 mr-2" />
                      Code
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor" className="space-y-4 mt-4">
                    {renderValueEditor(selectedPoint, getConfigForPoint(selectedPoint.id)?.value)}

                    {selectedPoint.examples && selectedPoint.examples.length > 0 && (
                      <div>
                        <Separator className="my-4" />
                        <Label>Examples</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {selectedPoint.examples.map((example, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => updateConfiguration(selectedPoint.id, example.value)}
                              disabled={readonly}
                            >
                              {example.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="code" className="mt-4">
                    <div>
                      <Label>JSON Configuration</Label>
                      <Textarea
                        value={JSON.stringify(getConfigForPoint(selectedPoint.id)?.value || selectedPoint.defaultValue, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            updateConfiguration(selectedPoint.id, parsed);
                          } catch (error) {
                            // Invalid JSON, don't update
                          }
                        }}
                        disabled={readonly}
                        rows={12}
                        className="font-mono"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a customization point to start editing</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}