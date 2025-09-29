/**
 * @fileoverview Template Editor Wireframe - 3-Column Configuration UI
 * @module specs/wireframes/templateEditor
 * @version 1.0.0
 *
 * CONFIGURATION-FIRST APPROACH: No WYSIWYG editing, only structured manifest configuration
 *
 * Layout: 3-Column responsive design
 * - Left: Primary template settings & metadata
 * - Center: Component list with ordering & basic props
 * - Right: Selected component detailed editor
 *
 * Design Tokens: Uses exact homepage tokens from design-tokens.json
 * Theme Support: Full light/dark mode with glass morphism effects
 * Accessibility: WCAG AA compliant with keyboard navigation
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useForm, Controller } from 'react-hook-form';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Icons (Lucide React)
import {
  Plus, Trash2, GripVertical, Eye, Download, Save, Settings,
  Palette, Type, Smartphone, Monitor, Tablet, Copy, Undo, Redo,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Info,
  Layout, Image, FileText, MousePointer, Grid3X3, Users, Mail
} from 'lucide-react';

// Types and schemas
import type { ComponentType, BaseComponent } from '@/types/componentContracts';
import { templateManifestSchema } from '@/schemas/template-manifest.schema';

/**
 * Template Editor Form Schema
 */
const templateEditorSchema = z.object({
  // Basic template info
  name: z.string().min(1, 'Template name is required').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  industry: z.enum(['fitness', 'retail', 'saas', 'consulting', 'healthcare', 'education', 'finance', 'real-estate', 'restaurant', 'legal', 'agency', 'non-profit', 'automotive', 'beauty', 'general']),
  description: z.string().max(500).optional(),

  // Theme configuration
  theme: z.object({
    useSiteDefaults: z.boolean().default(true),
    overrides: z.object({
      palette: z.object({
        primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      }).optional(),
      typography: z.object({
        fontFamily: z.string().optional(),
        headingWeight: z.enum(['normal', 'medium', 'semibold', 'bold']).optional(),
      }).optional(),
    }).optional(),
  }),

  // Meta information
  tags: z.array(z.string()).default([]),
});

type TemplateEditorFormData = z.infer<typeof templateEditorSchema>;

/**
 * Component Palette - Available components to add
 */
const COMPONENT_PALETTE: { type: ComponentType; label: string; icon: React.ReactNode; description: string; category: string }[] = [
  // Layout Components
  { type: 'header', label: 'Header', icon: <Layout className="w-4 h-4" />, description: 'Navigation and branding', category: 'Layout' },
  { type: 'hero', label: 'Hero Section', icon: <Monitor className="w-4 h-4" />, description: 'Main headline and CTA', category: 'Layout' },
  { type: 'footer', label: 'Footer', icon: <Layout className="w-4 h-4" />, description: 'Site footer with links', category: 'Layout' },

  // Content Components
  { type: 'text', label: 'Text Block', icon: <FileText className="w-4 h-4" />, description: 'Rich text content', category: 'Content' },
  { type: 'image', label: 'Image', icon: <Image className="w-4 h-4" />, description: 'Single image with caption', category: 'Content' },
  { type: 'feature_grid', label: 'Feature Grid', icon: <Grid3X3 className="w-4 h-4" />, description: 'Grid of features with icons', category: 'Content' },

  // Interactive Components
  { type: 'cta', label: 'Call to Action', icon: <MousePointer className="w-4 h-4" />, description: 'Button group with actions', category: 'Interactive' },
  { type: 'form', label: 'Form', icon: <Mail className="w-4 h-4" />, description: 'Data collection form', category: 'Interactive' },

  // Social Proof
  { type: 'testimonial', label: 'Testimonial', icon: <Users className="w-4 h-4" />, description: 'Customer testimonial', category: 'Social' },
  { type: 'pricing', label: 'Pricing Table', icon: <Grid3X3 className="w-4 h-4" />, description: 'Pricing plans comparison', category: 'Social' },
];

/**
 * Template Editor Main Component
 */
export function TemplateEditor() {
  // State management
  const [selectedComponent, setSelectedComponent] = useState<BaseComponent | null>(null);
  const [components, setComponents] = useState<BaseComponent[]>([]);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form management
  const form = useForm<TemplateEditorFormData>({
    resolver: zodResolver(templateEditorSchema),
    defaultValues: {
      name: '',
      slug: '',
      industry: 'general',
      description: '',
      theme: {
        useSiteDefaults: true,
        overrides: {}
      },
      tags: []
    }
  });

  // Component management
  const addComponent = useCallback((type: ComponentType) => {
    const newComponent: BaseComponent = {
      id: `c_${type}_${Date.now()}`,
      type,
      version: '1.0.0',
      props: getDefaultProps(type),
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent);
    setIsDirty(true);
  }, []);

  const removeComponent = useCallback((componentId: string) => {
    setComponents(prev => prev.filter(c => c.id !== componentId));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
    setIsDirty(true);
  }, [selectedComponent]);

  const reorderComponents = useCallback((result: any) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComponents(items);
    setIsDirty(true);
  }, [components]);

  const updateComponent = useCallback((componentId: string, updates: Partial<BaseComponent>) => {
    setComponents(prev => prev.map(c =>
      c.id === componentId ? { ...c, ...updates } : c
    ));

    if (selectedComponent?.id === componentId) {
      setSelectedComponent(prev => prev ? { ...prev, ...updates } : null);
    }
    setIsDirty(true);
  }, [selectedComponent]);

  // Save and export functions
  const saveTemplate = useCallback(async () => {
    try {
      const formData = form.getValues();
      const manifest = {
        id: `tpl_${formData.slug}`,
        name: formData.name,
        slug: formData.slug,
        industry: formData.industry,
        description: formData.description,
        theme: formData.theme,
        components,
        meta: {
          version: '1.0.0',
          createdBy: 'template_builder',
          createdAt: new Date().toISOString().split('T')[0],
          tags: formData.tags,
        }
      };

      // Here you would call your save API
      console.log('Saving template:', manifest);

      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [form, components]);

  const exportManifest = useCallback(() => {
    const formData = form.getValues();
    const manifest = {
      id: `tpl_${formData.slug}`,
      name: formData.name,
      slug: formData.slug,
      industry: formData.industry,
      description: formData.description,
      theme: formData.theme,
      components,
      meta: {
        version: '1.0.0',
        createdBy: 'template_builder',
        createdAt: new Date().toISOString().split('T')[0],
        tags: formData.tags,
      }
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [form, components]);

  const generatePreview = useCallback(() => {
    // Open preview in new tab
    const previewUrl = `/preview/template?components=${encodeURIComponent(JSON.stringify(components))}`;
    window.open(previewUrl, '_blank');
  }, [components]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Templates</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">New Template</span>
          </div>

          {/* Center: Status */}
          <div className="flex items-center gap-4">
            {isDirty && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </div>
            )}

            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

            <Button size="sm" onClick={saveTemplate} disabled={!isDirty}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content: 3-Column Layout */}
      <div className="flex h-[calc(100vh-73px)]">

        {/* LEFT COLUMN: Primary Settings */}
        <div className="w-80 border-r bg-background/50 backdrop-blur-sm">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">

              {/* Template Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Template Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="My Awesome Template"
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
                      placeholder="my-awesome-template"
                      className="mt-1"
                    />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.slug.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Controller
                      name="industry"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="fitness">Fitness</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="saas">SaaS</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
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
                      placeholder="Brief description of this template..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Theme Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Theme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useSiteDefaults">Use Site Defaults</Label>
                    <Controller
                      name="theme.useSiteDefaults"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          id="useSiteDefaults"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  {showAdvanced && (
                    <div className="space-y-3 pt-3 border-t">
                      <h4 className="text-sm font-medium">Color Overrides</h4>

                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="primaryColor"
                            {...form.register('theme.overrides.palette.primary')}
                            placeholder="#000000"
                            className="flex-1"
                          />
                          <div className="w-10 h-10 rounded border bg-black"></div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="accentColor"
                            {...form.register('theme.overrides.palette.accent')}
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                          <div className="w-10 h-10 rounded border bg-blue-500"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Component Palette */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      COMPONENT_PALETTE.reduce((acc, comp) => {
                        if (!acc[comp.category]) acc[comp.category] = [];
                        acc[comp.category].push(comp);
                        return acc;
                      }, {} as Record<string, typeof COMPONENT_PALETTE>)
                    ).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {items.map((component) => (
                            <Button
                              key={component.type}
                              variant="ghost"
                              className="justify-start h-auto p-3"
                              onClick={() => addComponent(component.type)}
                            >
                              <div className="flex items-start gap-3">
                                {component.icon}
                                <div className="text-left">
                                  <div className="font-medium">{component.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {component.description}
                                  </div>
                                </div>
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

        {/* CENTER COLUMN: Component List */}
        <div className="flex-1 bg-background">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Components ({components.length})</h2>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                Drag to reorder
              </div>
            </div>

            {components.length === 0 ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Layout className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No components yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add components from the left panel to start building your template
                </p>
                <Button onClick={() => addComponent('hero')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Hero Section
                </Button>
              </div>
            ) : (
              <DragDropContext onDragEnd={reorderComponents}>
                <Droppable droppableId="components">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {components.map((component, index) => (
                        <Draggable key={component.id} draggableId={component.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`cursor-pointer transition-all ${
                                selectedComponent?.id === component.id
                                  ? 'ring-2 ring-primary bg-primary/5'
                                  : 'hover:shadow-md'
                              } ${snapshot.isDragging ? 'shadow-lg rotate-1' : ''}`}
                              onClick={() => setSelectedComponent(component)}
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
                                      <Badge variant="secondary">{component.type}</Badge>
                                      <span className="font-medium">
                                        {getComponentDisplayName(component)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {getComponentSummary(component)}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Duplicate component
                                        const duplicate = {
                                          ...component,
                                          id: `${component.id}_copy_${Date.now()}`
                                        };
                                        setComponents(prev => [...prev, duplicate]);
                                      }}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeComponent(component.id);
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

        {/* RIGHT COLUMN: Component Editor */}
        <div className="w-96 border-l bg-background/50 backdrop-blur-sm">
          <ScrollArea className="h-full">
            <div className="p-6">
              {selectedComponent ? (
                <ComponentEditor
                  component={selectedComponent}
                  onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
                  showAdvanced={showAdvanced}
                />
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No component selected</h3>
                  <p className="text-muted-foreground">
                    Select a component from the center panel to edit its properties
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
 * Component Editor - Right panel for editing selected component
 */
interface ComponentEditorProps {
  component: BaseComponent;
  onUpdate: (updates: Partial<BaseComponent>) => void;
  showAdvanced: boolean;
}

function ComponentEditor({ component, onUpdate, showAdvanced }: ComponentEditorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {getComponentDisplayName(component)}
        </h3>
        <Badge variant="outline">{component.type}</Badge>
      </div>

      <Tabs defaultValue="props" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="props">Properties</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="props" className="space-y-4">
          {/* Component-specific property editor would go here */}
          <div className="text-sm text-muted-foreground">
            Component properties editor for {component.type}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          {/* Analytics, conditional logic, etc. */}
          <div className="text-sm text-muted-foreground">
            Advanced settings: analytics, conditional logic, custom CSS
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Helper functions
 */
function getDefaultProps(type: ComponentType): any {
  // Return default props based on component type
  switch (type) {
    case 'hero':
      return { title: 'Hero Title', subtitle: 'Hero Subtitle' };
    case 'text':
      return { content: 'Your text content here', format: 'text' };
    default:
      return {};
  }
}

function getComponentDisplayName(component: BaseComponent): string {
  // Extract display name from component props
  if ('title' in component.props && component.props.title) {
    return component.props.title;
  }
  if ('label' in component.props && component.props.label) {
    return component.props.label;
  }
  return `${component.type.charAt(0).toUpperCase() + component.type.slice(1)} Component`;
}

function getComponentSummary(component: BaseComponent): string {
  // Generate summary based on component type and props
  switch (component.type) {
    case 'hero':
      return component.props.subtitle || 'Hero section with title and CTA';
    case 'form':
      const fieldCount = component.props.fields?.length || 0;
      return `${fieldCount} fields`;
    case 'feature_grid':
      const featureCount = component.props.features?.length || 0;
      return `${featureCount} features in grid`;
    default:
      return `${component.type} component`;
  }
}

export default TemplateEditor;