/**
 * @fileoverview Form Editor Wireframe - Advanced Form Builder Configuration UI
 * @module specs/wireframes/formEditor
 * @version 1.0.0
 *
 * FORM-FIRST APPROACH: Advanced form builder with validation, conditional logic, and field grouping
 *
 * Layout: 3-Column responsive design
 * - Left: Form metadata & settings
 * - Center: Field list with ordering & field editor
 * - Right: Field properties & validation editor
 *
 * Based on existing form builders: form-builder.tsx and form-builder-engine.tsx
 * Design Tokens: Uses exact homepage tokens from design-tokens.json
 * Accessibility: WCAG AA compliant with comprehensive ARIA support
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI Components (using existing design system)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Icons (Lucide React)
import {
  Plus, Trash2, GripVertical, Eye, Download, Save, Settings, Copy,
  Type, Mail, Phone, Calendar, FileText, Hash, ToggleLeft,
  CheckSquare, Circle, Palette, Shield, BarChart3, Zap,
  AlertTriangle, CheckCircle, Info, ChevronDown, ChevronRight,
  Smartphone, Monitor, Tablet, Target, Users, Lock, Globe
} from 'lucide-react';

// Types
import type { FormField, FormFieldType } from '@/types/componentContracts';

/**
 * Form Editor Schema
 */
const formEditorSchema = z.object({
  // Basic form info
  name: z.string().min(1, 'Form name is required').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  category: z.enum(['lead-capture', 'contact', 'survey', 'registration', 'application', 'feedback', 'order', 'booking', 'support', 'newsletter', 'quote', 'general']),
  description: z.string().max(500).optional(),

  // Settings
  settings: z.object({
    title: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    submitButtonText: z.string().max(30).default('Submit'),
    resetButtonText: z.string().max(30).default('Reset'),
    showReset: z.boolean().default(false),
    layout: z.enum(['vertical', 'horizontal', 'grid', 'wizard']).default('vertical'),
    columns: z.number().min(1).max(4).default(1),
    progressBar: z.boolean().default(false),
  }),

  // Security & validation
  security: z.object({
    honeypot: z.boolean().default(true),
    captcha: z.object({
      enabled: z.boolean().default(false),
      provider: z.enum(['recaptcha', 'hcaptcha', 'turnstile']).optional(),
    }),
    rateLimit: z.object({
      enabled: z.boolean().default(true),
      maxSubmissions: z.number().min(1).default(5),
      windowMinutes: z.number().min(1).default(60),
    }),
    requireConsent: z.boolean().default(false),
  }),

  // Submission
  submission: z.object({
    type: z.enum(['webhook', 'email', 'database', 'api']),
    target: z.string().min(1, 'Submission target is required'),
    method: z.enum(['POST', 'PUT', 'PATCH']).default('POST'),
  }),
});

type FormEditorFormData = z.infer<typeof formEditorSchema>;

/**
 * Field Type Palette
 */
const FIELD_TYPES: { type: FormFieldType; label: string; icon: React.ReactNode; description: string; category: string }[] = [
  // Basic Input
  { type: 'text', label: 'Text', icon: <Type className="w-4 h-4" />, description: 'Single line text input', category: 'Basic' },
  { type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, description: 'Email address input', category: 'Basic' },
  { type: 'tel', label: 'Phone', icon: <Phone className="w-4 h-4" />, description: 'Phone number input', category: 'Basic' },
  { type: 'number', label: 'Number', icon: <Hash className="w-4 h-4" />, description: 'Numeric input', category: 'Basic' },
  { type: 'password', label: 'Password', icon: <Lock className="w-4 h-4" />, description: 'Password input', category: 'Basic' },
  { type: 'url', label: 'URL', icon: <Globe className="w-4 h-4" />, description: 'Website URL input', category: 'Basic' },

  // Text Areas
  { type: 'textarea', label: 'Textarea', icon: <FileText className="w-4 h-4" />, description: 'Multi-line text input', category: 'Text' },

  // Selection
  { type: 'select', label: 'Dropdown', icon: <ChevronDown className="w-4 h-4" />, description: 'Single selection dropdown', category: 'Selection' },
  { type: 'multiselect', label: 'Multi-Select', icon: <CheckSquare className="w-4 h-4" />, description: 'Multiple selection dropdown', category: 'Selection' },
  { type: 'radio', label: 'Radio Group', icon: <Circle className="w-4 h-4" />, description: 'Single choice from options', category: 'Selection' },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="w-4 h-4" />, description: 'Single checkbox', category: 'Selection' },

  // Date & Time
  { type: 'date', label: 'Date', icon: <Calendar className="w-4 h-4" />, description: 'Date picker', category: 'Date/Time' },
  { type: 'time', label: 'Time', icon: <Calendar className="w-4 h-4" />, description: 'Time picker', category: 'Date/Time' },
  { type: 'datetime', label: 'Date & Time', icon: <Calendar className="w-4 h-4" />, description: 'Date and time picker', category: 'Date/Time' },

  // Advanced
  { type: 'file', label: 'File Upload', icon: <FileText className="w-4 h-4" />, description: 'File upload input', category: 'Advanced' },
  { type: 'range', label: 'Slider', icon: <ToggleLeft className="w-4 h-4" />, description: 'Range slider input', category: 'Advanced' },
  { type: 'color', label: 'Color Picker', icon: <Palette className="w-4 h-4" />, description: 'Color selection input', category: 'Advanced' },
  { type: 'rating', label: 'Rating', icon: <Target className="w-4 h-4" />, description: 'Star rating input', category: 'Advanced' },
];

/**
 * Form Editor Main Component
 */
export function FormEditor() {
  // State management
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [fieldGroups, setFieldGroups] = useState<any[]>([]);

  // Form management
  const form = useForm<FormEditorFormData>({
    resolver: zodResolver(formEditorSchema),
    defaultValues: {
      name: '',
      slug: '',
      category: 'general',
      description: '',
      settings: {
        title: '',
        description: '',
        submitButtonText: 'Submit',
        resetButtonText: 'Reset',
        showReset: false,
        layout: 'vertical',
        columns: 1,
        progressBar: false,
      },
      security: {
        honeypot: true,
        captcha: { enabled: false },
        rateLimit: { enabled: true, maxSubmissions: 5, windowMinutes: 60 },
        requireConsent: false,
      },
      submission: {
        type: 'webhook',
        target: '',
        method: 'POST',
      },
    }
  });

  // Field management
  const addField = useCallback((type: FormFieldType) => {
    const newField: FormField = {
      id: `f${fields.length + 1}`,
      name: `field_${type}_${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      validation: {},
      order: fields.length,
    };

    setFields(prev => [...prev, newField]);
    setSelectedField(newField);
    setIsDirty(true);
  }, [fields.length]);

  const removeField = useCallback((fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
    setIsDirty(true);
  }, [selectedField]);

  const reorderFields = useCallback((result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setFields(reorderedItems);
    setIsDirty(true);
  }, [fields]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f =>
      f.id === fieldId ? { ...f, ...updates } : f
    ));

    if (selectedField?.id === fieldId) {
      setSelectedField(prev => prev ? { ...prev, ...updates } : null);
    }
    setIsDirty(true);
  }, [selectedField]);

  // Save and export functions
  const saveForm = useCallback(async () => {
    try {
      const formData = form.getValues();
      const manifest = {
        id: `form_${formData.slug}`,
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        description: formData.description,
        settings: formData.settings,
        fields,
        fieldGroups,
        security: formData.security,
        submission: formData.submission,
        meta: {
          version: '1.0.0',
          createdBy: 'form_builder',
          createdAt: new Date().toISOString().split('T')[0],
        }
      };

      console.log('Saving form:', manifest);

      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [form, fields, fieldGroups]);

  const exportManifest = useCallback(() => {
    const formData = form.getValues();
    const manifest = {
      id: `form_${formData.slug}`,
      name: formData.name,
      slug: formData.slug,
      category: formData.category,
      description: formData.description,
      settings: formData.settings,
      fields,
      fieldGroups,
      security: formData.security,
      submission: formData.submission,
      meta: {
        version: '1.0.0',
        createdBy: 'form_builder',
        createdAt: new Date().toISOString().split('T')[0],
      }
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [form, fields, fieldGroups]);

  const generatePreview = useCallback(() => {
    const previewUrl = `/preview/form?fields=${encodeURIComponent(JSON.stringify(fields))}`;
    window.open(previewUrl, '_blank');
  }, [fields]);

  // Validation stats
  const stats = useMemo(() => {
    const requiredFields = fields.filter(f => f.required).length;
    const fieldsWithValidation = fields.filter(f => f.validation && Object.keys(f.validation).length > 0).length;
    const conditionalFields = fields.filter(f => f.conditional).length;

    return {
      totalFields: fields.length,
      requiredFields,
      fieldsWithValidation,
      conditionalFields,
      completionRate: fields.length > 0 ? Math.round((fieldsWithValidation / fields.length) * 100) : 0,
    };
  }, [fields]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Forms</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">New Form</span>
          </div>

          {/* Center: Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{stats.totalFields} fields</Badge>
              <Badge variant={stats.requiredFields > stats.totalFields * 0.7 ? 'destructive' : 'default'}>
                {stats.requiredFields} required
              </Badge>
              {stats.conditionalFields > 0 && (
                <Badge variant="outline">{stats.conditionalFields} conditional</Badge>
              )}
            </div>

            {isDirty && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                Unsaved changes
              </div>
            )}

            {lastSaved && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Settings className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Basic' : 'Advanced'}
            </Button>

            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('tablet')}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
            </div>

            <ThemeToggle />

            <Separator orientation="vertical" className="h-6" />

            <Button variant="outline" size="sm" onClick={generatePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>

            <Button variant="outline" size="sm" onClick={exportManifest}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button size="sm" onClick={saveForm} disabled={!isDirty}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content: 3-Column Layout */}
      <div className="flex h-[calc(100vh-73px)]">

        {/* LEFT COLUMN: Form Metadata & Settings */}
        <div className="w-80 border-r bg-background/50 backdrop-blur-sm">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">

              {/* Form Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Form Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Form Name</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="Contact Form"
                      className="mt-1"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      {...form.register('slug')}
                      placeholder="contact-form"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Controller
                      name="category"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="lead-capture">Lead Capture</SelectItem>
                            <SelectItem value="contact">Contact</SelectItem>
                            <SelectItem value="survey">Survey</SelectItem>
                            <SelectItem value="registration">Registration</SelectItem>
                            <SelectItem value="application">Application</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Brief description of this form..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Display Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="formTitle">Form Title</Label>
                    <Input
                      id="formTitle"
                      {...form.register('settings.title')}
                      placeholder="Get in Touch"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="formDescription">Form Description</Label>
                    <Textarea
                      id="formDescription"
                      {...form.register('settings.description')}
                      placeholder="We'd love to hear from you..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="submitText">Submit Button</Label>
                      <Input
                        id="submitText"
                        {...form.register('settings.submitButtonText')}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="resetText">Reset Button</Label>
                      <Input
                        id="resetText"
                        {...form.register('settings.resetButtonText')}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showReset">Show Reset Button</Label>
                    <Controller
                      name="settings.showReset"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          id="showReset"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="layout">Layout</Label>
                    <Controller
                      name="settings.layout"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vertical">Vertical</SelectItem>
                            <SelectItem value="horizontal">Horizontal</SelectItem>
                            <SelectItem value="grid">Grid</SelectItem>
                            <SelectItem value="wizard">Wizard (Multi-step)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Honeypot Protection</Label>
                      <p className="text-xs text-muted-foreground">Prevent spam submissions</p>
                    </div>
                    <Controller
                      name="security.honeypot"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rate Limiting</Label>
                      <p className="text-xs text-muted-foreground">Limit submission frequency</p>
                    </div>
                    <Controller
                      name="security.rateLimit.enabled"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>CAPTCHA</Label>
                      <p className="text-xs text-muted-foreground">Human verification</p>
                    </div>
                    <Controller
                      name="security.captcha.enabled"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Field Types Palette */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      FIELD_TYPES.reduce((acc, field) => {
                        if (!acc[field.category]) acc[field.category] = [];
                        acc[field.category].push(field);
                        return acc;
                      }, {} as Record<string, typeof FIELD_TYPES>)
                    ).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h4>
                        <div className="grid grid-cols-2 gap-1">
                          {items.map((fieldType) => (
                            <Button
                              key={fieldType.type}
                              variant="ghost"
                              className="justify-start h-auto p-2 text-xs"
                              onClick={() => addField(fieldType.type)}
                            >
                              <div className="flex items-center gap-2">
                                {fieldType.icon}
                                <span>{fieldType.label}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>

        {/* CENTER COLUMN: Fields List */}
        <div className="flex-1 bg-background">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Fields ({fields.length})</h2>

              <div className="flex items-center gap-4">
                {stats.completionRate < 100 && (
                  <Alert className="py-2 px-3">
                    <Info className="w-4 h-4" />
                    <AlertDescription className="text-sm">
                      {stats.fieldsWithValidation}/{stats.totalFields} fields have validation
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GripVertical className="w-4 h-4" />
                  Drag to reorder
                </div>
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No fields yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add fields from the left panel to start building your form
                </p>
                <Button onClick={() => addField('text')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Text Field
                </Button>
              </div>
            ) : (
              <DragDropContext onDragEnd={reorderFields}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`cursor-pointer transition-all ${
                                selectedField?.id === field.id
                                  ? 'ring-2 ring-primary bg-primary/5'
                                  : 'hover:shadow-md'
                              } ${snapshot.isDragging ? 'shadow-lg rotate-1' : ''}`}
                              onClick={() => setSelectedField(field)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="secondary">{field.type}</Badge>
                                      <span className="font-medium">{field.label}</span>
                                      {field.required && (
                                        <Badge variant="destructive" className="text-xs">Required</Badge>
                                      )}
                                      {field.conditional && (
                                        <Badge variant="outline" className="text-xs">Conditional</Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span>Name: {field.name}</span>
                                      {field.placeholder && (
                                        <span>Placeholder: "{field.placeholder}"</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const duplicate = {
                                          ...field,
                                          id: `${field.id}_copy`,
                                          name: `${field.name}_copy`,
                                          order: fields.length
                                        };
                                        setFields(prev => [...prev, duplicate]);
                                      }}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeField(field.id);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Field Editor */}
        <div className="w-96 border-l bg-background/50 backdrop-blur-sm">
          <ScrollArea className="h-full">
            <div className="p-6">
              {selectedField ? (
                <FieldEditor
                  field={selectedField}
                  onUpdate={(updates) => updateField(selectedField.id, updates)}
                  showAdvanced={showAdvanced}
                />
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No field selected</h3>
                  <p className="text-muted-foreground">
                    Select a field from the center panel to edit its properties
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

/**
 * Field Editor - Right panel for editing selected field
 */
interface FieldEditorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  showAdvanced: boolean;
}

function FieldEditor({ field, onUpdate, showAdvanced }: FieldEditorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{field.label}</h3>
        <Badge variant="outline">{field.type}</Badge>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div>
            <Label htmlFor="fieldLabel">Label</Label>
            <Input
              id="fieldLabel"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fieldName">Name</Label>
            <Input
              id="fieldName"
              value={field.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fieldPlaceholder">Placeholder</Label>
            <Input
              id="fieldPlaceholder"
              value={field.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fieldDescription">Description</Label>
            <Textarea
              id="fieldDescription"
              value={field.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="fieldRequired">Required Field</Label>
            <Switch
              id="fieldRequired"
              checked={field.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
            />
          </div>

          {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio') && (
            <div>
              <Label>Options</Label>
              <div className="mt-2 space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[index] = { ...option, label: e.target.value };
                        onUpdate({ options: newOptions });
                      }}
                      placeholder="Option label"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newOptions = field.options?.filter((_, i) => i !== index);
                        onUpdate({ options: newOptions });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )) || []}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(field.options || []), { label: 'New Option', value: `option_${Date.now()}` }];
                    onUpdate({ options: newOptions });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <div className="space-y-3">
            {field.type === 'text' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minLength">Min Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={field.validation?.minLength || ''}
                      onChange={(e) => onUpdate({
                        validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLength">Max Length</Label>
                    <Input
                      id="maxLength"
                      type="number"
                      value={field.validation?.maxLength || ''}
                      onChange={(e) => onUpdate({
                        validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined }
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pattern">Pattern (Regex)</Label>
                  <Input
                    id="pattern"
                    value={field.validation?.pattern || ''}
                    onChange={(e) => onUpdate({
                      validation: { ...field.validation, pattern: e.target.value }
                    })}
                    className="mt-1"
                    placeholder="^[A-Za-z]+$"
                  />
                </div>

                <div>
                  <Label htmlFor="patternMessage">Pattern Error Message</Label>
                  <Input
                    id="patternMessage"
                    value={field.validation?.patternMessage || ''}
                    onChange={(e) => onUpdate({
                      validation: { ...field.validation, patternMessage: e.target.value }
                    })}
                    className="mt-1"
                    placeholder="Please enter a valid value"
                  />
                </div>
              </>
            )}

            {field.type === 'number' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="min">Minimum</Label>
                  <Input
                    id="min"
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) => onUpdate({
                      validation: { ...field.validation, min: parseFloat(e.target.value) || undefined }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max">Maximum</Label>
                  <Input
                    id="max"
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) => onUpdate({
                      validation: { ...field.validation, max: parseFloat(e.target.value) || undefined }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {field.type === 'file' && (
              <>
                <div>
                  <Label htmlFor="accept">Accepted File Types</Label>
                  <Input
                    id="accept"
                    value={field.validation?.accept || ''}
                    onChange={(e) => onUpdate({
                      validation: { ...field.validation, accept: e.target.value }
                    })}
                    className="mt-1"
                    placeholder=".pdf,.doc,.docx"
                  />
                </div>

                <div>
                  <Label htmlFor="maxFileSize">Max File Size (bytes)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={field.validation?.maxFileSize || ''}
                    onChange={(e) => onUpdate({
                      validation: { ...field.validation, maxFileSize: parseInt(e.target.value) || undefined }
                    })}
                    className="mt-1"
                    placeholder="5242880"
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Conditional Logic</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Show this field based on other field values
              </p>

              {field.conditional ? (
                <div className="space-y-3 p-3 border rounded">
                  <div>
                    <Label htmlFor="conditionalField">Show when field</Label>
                    <Input
                      id="conditionalField"
                      value={field.conditional.field}
                      onChange={(e) => onUpdate({
                        conditional: { ...field.conditional!, field: e.target.value }
                      })}
                      className="mt-1"
                      placeholder="field_id"
                    />
                  </div>

                  <div>
                    <Label htmlFor="conditionalOperator">Operator</Label>
                    <Select
                      value={field.conditional.operator}
                      onValueChange={(value: any) => onUpdate({
                        conditional: { ...field.conditional!, operator: value }
                      })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="notEquals">Not Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="notContains">Not Contains</SelectItem>
                        <SelectItem value="isEmpty">Is Empty</SelectItem>
                        <SelectItem value="isNotEmpty">Is Not Empty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="conditionalValue">Value</Label>
                    <Input
                      id="conditionalValue"
                      value={field.conditional.value || ''}
                      onChange={(e) => onUpdate({
                        conditional: { ...field.conditional!, value: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdate({ conditional: undefined })}
                  >
                    Remove Condition
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => onUpdate({
                    conditional: { field: '', operator: 'equals', value: '' }
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Accessibility</h4>
              <div>
                <Label htmlFor="ariaLabel">ARIA Label</Label>
                <Input
                  id="ariaLabel"
                  value={field.accessibility?.ariaLabel || ''}
                  onChange={(e) => onUpdate({
                    accessibility: { ...field.accessibility, ariaLabel: e.target.value }
                  })}
                  className="mt-1"
                  placeholder="Descriptive label for screen readers"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FormEditor;