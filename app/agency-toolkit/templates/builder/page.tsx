/**
 * Template Builder Page
 *
 * Implementation of the 3-column template builder interface from Phase 3 wireframes.
 * Configuration-first approach with no WYSIWYG editing.
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TemplateManifest, BaseComponent } from '../../../../types/componentContracts';
import { getComponentRegistry } from '../../../../lib/renderer/ComponentRegistry';
import { PreviewHarness } from '../../../../components/preview/PreviewHarness';
import { validateTemplate } from '../../../../lib/validation/manifest-validator';
import designTokens from '../../../../design-tokens.json';
import { getTemplateStorage } from '../../../../lib/template-storage/TemplateStorage';
import { TemplateVersionManager } from '../../../../components/template-builder/TemplateVersionManager';
import { RouteManager } from '../../../../components/template-builder/RouteManager';
import { TemplateAnalytics } from '../../../../components/template-builder/TemplateAnalytics';
import { getRouteGenerator } from '../../../../lib/template-engine/route-generator';

// Template metadata schema
const templateMetadataSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  slug: z.string().min(2, 'Slug required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.string().min(1, 'Category required'),
  useSiteDefaults: z.boolean(),
});

type TemplateMetadata = z.infer<typeof templateMetadataSchema>;

export default function TemplateBuilderPage() {
  // State management
  const [template, setTemplate] = useState<TemplateManifest>({
    id: `tpl_${Date.now()}`,
    name: 'New Template',
    slug: 'new-template',
    description: '',
    category: 'landing-page',
    components: [],
    theme: { useSiteDefaults: true },
    meta: {
      version: '1.0.0',
      createdBy: 'team_dct',
      createdAt: new Date().toISOString().split('T')[0],
      tags: [],
      schemaVersion: '1.0.0'
    }
  });

  const [selectedComponent, setSelectedComponent] = useState<BaseComponent | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState<'hidden' | 'modal' | 'split'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [componentPaletteOpen, setComponentPaletteOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [versionManagerOpen, setVersionManagerOpen] = useState(false);
  const [routeManagerOpen, setRouteManagerOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Form handling for template metadata
  const metadataForm = useForm<TemplateMetadata>({
    resolver: zodResolver(templateMetadataSchema),
    defaultValues: {
      name: template.name,
      slug: template.slug,
      description: template.description || '',
      category: template.category,
      useSiteDefaults: template.theme?.useSiteDefaults ?? true,
    }
  });

  // Component registry
  const [componentRegistry, setComponentRegistry] = useState(getComponentRegistry());
  const [availableComponents, setAvailableComponents] = useState(componentRegistry.getAvailableComponents());

  // Auto-save functionality with validation
  useEffect(() => {
    if (isDirty) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        // Run validation before auto-save
        try {
          const validationResult = validateTemplate(template);
          if (validationResult && typeof validationResult === 'object' && 'errors' in validationResult) {
            setValidationErrors(validationResult.errors || []);

            // Only auto-save if there are no critical errors
            const hasCriticalErrors = validationResult.errors?.some((error: any) => error.severity === 'error');
            if (!hasCriticalErrors) {
              handleAutoSave();
            }
          } else {
            // If validation returns boolean true, proceed with save
            setValidationErrors([]);
            handleAutoSave();
          }
        } catch (error) {
          console.error('Validation failed:', error);
          setValidationErrors([{
            message: 'Template validation failed',
            severity: 'error',
            path: 'general'
          }]);
        }
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [template, isDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSaving) {
          handleSave();
        }
      }

      // Ctrl+Shift+S or Cmd+Shift+S to save as new version
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        if (!isSaving) {
          handleSave();
        }
      }

      // Ctrl+E or Cmd+E to export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        setComponentPaletteOpen(false);
        setVersionManagerOpen(false);
        setRouteManagerOpen(false);
        setAnalyticsOpen(false);
        setExportModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, handleSave]);

  // Handle metadata changes
  const handleMetadataChange = useCallback((data: TemplateMetadata) => {
    setTemplate(prev => ({
      ...prev,
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      theme: {
        ...prev.theme,
        useSiteDefaults: data.useSiteDefaults
      }
    }));
    setIsDirty(true);
  }, []);

  // Handle component addition
  const handleAddComponent = useCallback((componentType: string) => {
    const componentDefinition = componentRegistry.getComponentDefinition(componentType);
    if (!componentDefinition) return;

    const newComponent: BaseComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: componentType,
      version: componentDefinition.version,
      order: template.components.length,
      props: getDefaultProps(componentDefinition),
    };

    setTemplate(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));

    setSelectedComponent(newComponent);
    setComponentPaletteOpen(false);
    setIsDirty(true);
  }, [template.components.length, componentRegistry]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle component reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = template.components.findIndex(item => item.id === active.id);
      const newIndex = template.components.findIndex(item => item.id === over?.id);

      const reorderedComponents = arrayMove(template.components, oldIndex, newIndex)
        .map((component, index) => ({
          ...component,
          order: index
        }));

      setTemplate(prev => ({
        ...prev,
        components: reorderedComponents
      }));

      setIsDirty(true);
    }

    setActiveId(null);
  }, [template.components]);

  // Handle component property updates
  const handleComponentUpdate = useCallback((componentId: string, props: any) => {
    setTemplate(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === componentId ? { ...comp, props: { ...comp.props, ...props } } : comp
      )
    }));

    setIsDirty(true);
  }, []);

  // Handle component deletion
  const handleDeleteComponent = useCallback((componentId: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      setTemplate(prev => ({
        ...prev,
        components: prev.components
          .filter(comp => comp.id !== componentId)
          .map((comp, index) => ({ ...comp, order: index }))
      }));

      if (selectedComponent?.id === componentId) {
        setSelectedComponent(null);
      }

      setIsDirty(true);
    }
  }, [selectedComponent]);

  // Handle duplicate component
  const handleDuplicateComponent = useCallback((componentId: string) => {
    const componentToDuplicate = template.components.find(comp => comp.id === componentId);
    if (!componentToDuplicate) return;

    const duplicatedComponent: BaseComponent = {
      ...componentToDuplicate,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: componentToDuplicate.order + 1
    };

    setTemplate(prev => ({
      ...prev,
      components: [
        ...prev.components.slice(0, duplicatedComponent.order),
        duplicatedComponent,
        ...prev.components.slice(duplicatedComponent.order).map(comp => ({
          ...comp,
          order: comp.order + 1
        }))
      ]
    }));

    setSelectedComponent(duplicatedComponent);
    setIsDirty(true);
  }, [template.components]);

  // Auto-save function
  const handleAutoSave = useCallback(async () => {
    try {
      const templateStorage = getTemplateStorage();
      const savedVersion = await templateStorage.saveTemplate(template, {
        createNewVersion: false,
        description: 'Auto-saved',
        isActive: true
      });
      if (savedVersion) {
        setIsDirty(false);
        console.log('Template auto-saved');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [template]);

  // Manual save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const templateStorage = getTemplateStorage();
      const savedVersion = await templateStorage.saveTemplate(template, {
        createNewVersion: true,
        description: 'Manual save',
        isActive: true
      });
      if (savedVersion) {
        setIsDirty(false);
        alert('Template saved successfully!');
      }
    } catch (error) {
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [template]);

  // Save without creating new version (overwrite)
  const handleSaveOverwrite = useCallback(async () => {
    setIsSaving(true);
    try {
      const templateStorage = getTemplateStorage();
      const savedVersion = await templateStorage.saveTemplate(template, {
        createNewVersion: false,
        description: 'Overwrite save',
        isActive: true
      });
      if (savedVersion) {
        setIsDirty(false);
        alert('Template updated successfully!');
      }
    } catch (error) {
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [template]);

  // Export manifest
  const handleExport = useCallback(async () => {
    try {
      // Validate before export
      const isValid = validateTemplate(template);
      if (!isValid) {
        alert('Template has validation errors. Please fix them before exporting.');
        return;
      }

      // Download JSON file
      const blob = new Blob([JSON.stringify(template, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.slug}-template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Copy to clipboard
      await navigator.clipboard.writeText(JSON.stringify(template, null, 2));
      alert('Template exported and copied to clipboard!');

    } catch (error) {
      alert('Failed to export template.');
    }
  }, [template]);

  // Generate preview
  const handleGeneratePreview = useCallback(async () => {
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manifest: template })
      });

      if (!response.ok) {
        throw new Error('Preview generation failed');
      }

      console.log('Preview generated successfully');
    } catch (error) {
      console.error('Preview generation failed:', error);
    }
  }, [template]);

  // Get default props for a component
  function getDefaultProps(componentDefinition: any): any {
    const defaultProps: any = {};

    componentDefinition.props.forEach((prop: any) => {
      if (prop.default !== undefined) {
        defaultProps[prop.name] = prop.default;
      } else if (prop.required) {
        // Set reasonable defaults for required props
        switch (prop.type) {
          case 'string':
            defaultProps[prop.name] = prop.name === 'title' ? 'Enter title' :
                                   prop.name === 'text' ? 'Button text' :
                                   prop.name === 'url' ? '#' : '';
            break;
          case 'boolean':
            defaultProps[prop.name] = false;
            break;
          case 'number':
            defaultProps[prop.name] = 0;
            break;
          default:
            defaultProps[prop.name] = '';
        }
      }
    });

    return defaultProps;
  }

  // Load template function
  const handleLoadTemplate = useCallback(async (templateId: string) => {
    try {
      const templateStorage = getTemplateStorage();
      const loadedTemplate = await templateStorage.loadTemplate(templateId);
      if (loadedTemplate) {
        setTemplate(loadedTemplate);
        setIsDirty(false);
        alert('Template loaded successfully!');
      } else {
        alert('Template not found');
      }
    } catch (error) {
      alert('Failed to load template. Please try again.');
    }
  }, []);

  // Load template from file
  const handleLoadFromFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const templateStorage = getTemplateStorage();
      const importedTemplate = await templateStorage.importTemplate(text, 'json');
      
      if (importedTemplate) {
        setTemplate(importedTemplate);
        setIsDirty(false);
        alert('Template imported successfully!');
      } else {
        alert('Failed to import template. Please check the file format.');
      }
    } catch (error) {
      alert('Failed to import template. Please try again.');
    }
  }, []);

  // Version manager handlers
  const handleVersionSelect = useCallback((version: any) => {
    setTemplate(version.manifest);
    setIsDirty(false);
  }, []);

  const handleVersionRestore = useCallback(async (version: any) => {
    try {
      const templateStorage = getTemplateStorage();
      const restoredTemplate = await templateStorage.duplicateTemplate(
        version.manifest.id,
        `${version.manifest.name} (Restored)`,
        `${version.manifest.slug}-restored`
      );
      
      if (restoredTemplate) {
        setTemplate(restoredTemplate);
        setIsDirty(false);
        alert('Version restored successfully!');
      }
    } catch (error) {
      alert('Failed to restore version. Please try again.');
    }
  }, []);

  return (
    <div className="template-builder h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Template Builder</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{template.name}</span>

              {/* Validation Status */}
              {validationErrors.length > 0 ? (
                <span className="flex items-center text-red-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {validationErrors.filter((e: any) => e.severity === 'error').length} errors,{' '}
                  {validationErrors.filter((e: any) => e.severity === 'warning').length} warnings
                </span>
              ) : (
                <span className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Valid
                </span>
              )}

              {/* Save Status */}
              {isDirty && (
                <span className="flex items-center text-orange-600">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-1 animate-pulse"></div>
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => {
                  const modes: ('hidden' | 'modal' | 'split')[] = ['hidden', 'split', 'modal'];
                  const currentIndex = modes.indexOf(previewMode);
                  const nextMode = modes[(currentIndex + 1) % modes.length];
                  setPreviewMode(nextMode);
                  setIsPreviewOpen(nextMode !== 'hidden');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
              >
                <span>
                  {previewMode === 'hidden' && '👁️ Show Preview'}
                  {previewMode === 'split' && '📱 Split View'}
                  {previewMode === 'modal' && '🖥️ Full Screen'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="relative">
              <input
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleLoadFromFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="load-template-file"
              />
              <label
                htmlFor="load-template-file"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                Import
              </label>
            </div>

            <div className="flex">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-l-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <div className="relative">
                <button
                  className="px-2 py-2 text-sm font-medium text-white bg-blue-600 border-l border-blue-500 rounded-r-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSaving}
                  onClick={() => {
                    // Quick save options menu
                    const option = confirm('Save as new version? Click OK for new version, Cancel for overwrite.');
                    if (option) {
                      handleSave();
                    } else {
                      handleSaveOverwrite();
                    }
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              onClick={() => setVersionManagerOpen(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Versions
            </button>
            <button
              onClick={() => setRouteManagerOpen(true)}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              Routes
            </button>
            <button
              onClick={() => setAnalyticsOpen(true)}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-md hover:bg-green-100"
            >
              Analytics
            </button>

            <button
              onClick={() => setExportModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Validation Errors Panel */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-1">
                Template Validation Issues
              </h3>
              <div className="space-y-1">
                {validationErrors.slice(0, 3).map((error: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-red-700">
                    <span className={`
                      inline-block w-1.5 h-1.5 rounded-full
                      ${error.severity === 'error' ? 'bg-red-600' : 'bg-orange-500'}
                    `}></span>
                    <span>
                      {error.path && <code className="text-xs bg-red-100 px-1 rounded mr-2">{error.path}</code>}
                      {error.message}
                    </span>
                  </div>
                ))}
                {validationErrors.length > 3 && (
                  <div className="text-sm text-red-600">
                    ... and {validationErrors.length - 3} more issues
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setValidationErrors([])}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Template Settings */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Template Settings</h2>

            <form onSubmit={metadataForm.handleSubmit(handleMetadataChange)} className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <Controller
                  name="name"
                  control={metadataForm.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter template name"
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <Controller
                  name="slug"
                  control={metadataForm.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="template-slug"
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Controller
                  name="description"
                  control={metadataForm.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe your template"
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <Controller
                  name="category"
                  control={metadataForm.control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="landing-page">Landing Page</option>
                      <option value="product-page">Product Page</option>
                      <option value="about-page">About Page</option>
                      <option value="contact-page">Contact Page</option>
                      <option value="blog-post">Blog Post</option>
                      <option value="portfolio">Portfolio</option>
                    </select>
                  )}
                />
              </div>

              {/* Theme Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <Controller
                  name="useSiteDefaults"
                  control={metadataForm.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={field.value}
                          onChange={() => field.onChange(true)}
                          className="mr-2"
                        />
                        <span className="text-sm">Use site defaults</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!field.value}
                          onChange={() => field.onChange(false)}
                          className="mr-2"
                        />
                        <span className="text-sm">Custom theme</span>
                      </label>
                    </div>
                  )}
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700"
              >
                Update Settings
              </button>
            </form>
          </div>
        </div>

        {/* Center Column - Components List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Components</h2>
              <span className="text-sm text-gray-500">{template.components.length} components</span>
            </div>

            <button
              onClick={() => setComponentPaletteOpen(true)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              + Add Component
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={template.components.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="p-4 space-y-2">
                  {template.components.map((component) => (
                    <SortableComponentItem
                      key={component.id}
                      component={component}
                      isSelected={selectedComponent?.id === component.id}
                      onSelect={() => setSelectedComponent(component)}
                      onDuplicate={() => handleDuplicateComponent(component.id)}
                      onDelete={() => handleDeleteComponent(component.id)}
                      isDragging={activeId === component.id}
                    />
                  ))}

                  {template.components.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-sm">No components yet</p>
                      <p className="text-xs">Add components to build your template</p>
                    </div>
                  )}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <div className="component-item p-3 bg-white border border-gray-200 rounded-lg shadow-lg opacity-90">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getComponentDisplayName(template.components.find(c => c.id === activeId)?.type || '')}
                        </div>
                        <div className="text-xs text-gray-500">Dragging...</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Right Column - Component Editor and/or Preview */}
        <div className="flex-1 flex flex-col">
          {previewMode === 'split' ? (
            <div className="flex-1 flex flex-col">
              {/* Split view: Editor on top, Preview on bottom */}
              <div className="flex-1 max-h-[50%]">
                {selectedComponent ? (
                  <ComponentEditor
                    component={selectedComponent}
                    onUpdate={(props) => handleComponentUpdate(selectedComponent.id, props)}
                    onDelete={() => handleDeleteComponent(selectedComponent.id)}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <h3 className="text-md font-medium text-gray-900 mb-1">No Component Selected</h3>
                      <p className="text-sm text-gray-600">Select a component to edit its properties</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200"></div>

              <div className="flex-1 min-h-[50%]">
                <div className="h-full bg-gray-100 p-2">
                  <div className="h-full bg-white rounded border shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Auto-refresh</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="h-[calc(100%-40px)]">
                      <PreviewHarness
                        manifest={template}
                        showControls={false}
                        autoRefresh={true}
                        onError={(error) => console.error('Preview error:', error)}
                        onInteraction={(componentId, action, data) => {
                          console.log('Component interaction:', { componentId, action, data });
                          // Auto-select the interacted component
                          const component = template.components.find(c => c.id === componentId);
                          if (component) {
                            setSelectedComponent(component);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : previewMode === 'modal' ? (
            <div className="flex-1">
              <PreviewHarness
                manifest={template}
                showControls={true}
                autoRefresh={true}
                onError={(error) => console.error('Preview error:', error)}
                onInteraction={(componentId, action, data) =>
                  console.log('Component interaction:', { componentId, action, data })
                }
              />
            </div>
          ) : selectedComponent ? (
            <ComponentEditor
              component={selectedComponent}
              onUpdate={(props) => handleComponentUpdate(selectedComponent.id, props)}
              onDelete={() => handleDeleteComponent(selectedComponent.id)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Component Selected</h3>
                <p className="text-gray-600">Select a component to edit its properties or enable preview mode</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Component Palette Modal */}
      {componentPaletteOpen && (
        <ComponentPalette
          availableComponents={availableComponents}
          onSelectComponent={handleAddComponent}
          onClose={() => setComponentPaletteOpen(false)}
        />
      )}

      {/* Version Manager Modal */}
      {versionManagerOpen && (
        <TemplateVersionManager
          templateId={template.id}
          currentVersion={template.meta.version}
          onVersionSelect={handleVersionSelect}
          onVersionRestore={handleVersionRestore}
          onClose={() => setVersionManagerOpen(false)}
        />
      )}

      {/* Route Manager Modal */}
      {routeManagerOpen && (
        <RouteManager
          template={template}
          tenantId="current_tenant" // This would come from auth context
          onRouteCreated={(route) => {
            console.log('Route created:', route);
            setRouteManagerOpen(false);
          }}
          onRouteUpdated={(route) => {
            console.log('Route updated:', route);
          }}
          onRouteDeleted={(routeId) => {
            console.log('Route deleted:', routeId);
          }}
          onClose={() => setRouteManagerOpen(false)}
        />
      )}

      {/* Analytics Modal */}
      {analyticsOpen && (
        <TemplateAnalytics
          template={template}
          tenantId="current_tenant" // This would come from auth context
          onClose={() => setAnalyticsOpen(false)}
        />
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <ExportModal
          template={template}
          onClose={() => setExportModalOpen(false)}
        />
      )}
    </div>
  );
}

// Dynamic Component Property Editor
function ComponentEditor({
  component,
  onUpdate,
  onDelete
}: {
  component: BaseComponent;
  onUpdate: (props: any) => void;
  onDelete: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'properties' | 'styling' | 'analytics'>('properties');
  const [localProps, setLocalProps] = useState(component.props);

  const handlePropChange = useCallback((path: string, value: any) => {
    const newProps = { ...localProps };
    const keys = path.split('.');
    let current = newProps;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setLocalProps(newProps);
    onUpdate(newProps);
  }, [localProps, onUpdate]);

  const renderPropertyField = (key: string, value: any, path: string) => {
    const fieldPath = path ? `${path}.${key}` : key;

    if (typeof value === 'boolean') {
      return (
        <label key={fieldPath} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handlePropChange(fieldPath, e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </span>
        </label>
      );
    }

    if (typeof value === 'string') {
      // Multi-line for longer content
      if (key.includes('content') || key.includes('description') || key.includes('text')) {
        return (
          <div key={fieldPath}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </label>
            <textarea
              value={value}
              onChange={(e) => handlePropChange(fieldPath, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        );
      }

      // Single line for shorter strings
      return (
        <div key={fieldPath}>
          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropChange(fieldPath, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div key={fieldPath}>
          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => handlePropChange(fieldPath, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={fieldPath} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </label>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-xs text-gray-500 mb-2">Array with {value.length} items</div>
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={fieldPath} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </label>
          <div className="bg-gray-50 p-3 rounded-md space-y-3">
            {Object.entries(value).map(([subKey, subValue]) =>
              renderPropertyField(subKey, subValue, fieldPath)
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderPropertiesTab = () => (
    <div className="space-y-4">
      {Object.entries(localProps).map(([key, value]) =>
        renderPropertyField(key, value, '')
      )}
    </div>
  );

  const renderStylingTab = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-4">
        Component styling configuration
      </div>

      {/* Background */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
        <input
          type="color"
          value={localProps.backgroundColor || '#ffffff'}
          onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>

      {/* Padding */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
        <select
          value={localProps.padding || 'medium'}
          onChange={(e) => handlePropChange('padding', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="none">None</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="xl">Extra Large</option>
        </select>
      </div>

      {/* Margin */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Margin</label>
        <select
          value={localProps.margin || 'medium'}
          onChange={(e) => handlePropChange('margin', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="none">None</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="xl">Extra Large</option>
        </select>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-4">
        Analytics and tracking configuration
      </div>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={component.analytics?.trackClicks || false}
          onChange={(e) => handlePropChange('analytics.trackClicks', e.target.checked)}
          className="rounded border-gray-300"
        />
        <span className="text-sm font-medium text-gray-700">Track Clicks</span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={component.analytics?.trackViews || false}
          onChange={(e) => handlePropChange('analytics.trackViews', e.target.checked)}
          className="rounded border-gray-300"
        />
        <span className="text-sm font-medium text-gray-700">Track Views</span>
      </label>
    </div>
  );

  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {getComponentDisplayName(component.type)} Properties
          </h2>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            Delete Component
          </button>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>ID: <code className="bg-gray-100 px-2 py-1 rounded">{component.id}</code></span>
          <span>Type: <code className="bg-gray-100 px-2 py-1 rounded">{component.type}</code></span>
          <span>Position: <code className="bg-gray-100 px-2 py-1 rounded">{component.order + 1}</code></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'properties', name: 'Properties', count: Object.keys(localProps).length },
            { id: 'styling', name: 'Styling' },
            { id: 'analytics', name: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
              {tab.count && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'properties' && renderPropertiesTab()}
        {activeTab === 'styling' && renderStylingTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>
    </div>
  );
}

// Component Palette Modal
function ComponentPalette({
  availableComponents,
  onSelectComponent,
  onClose
}: {
  availableComponents: any[];
  onSelectComponent: (type: string) => void;
  onClose: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', name: 'All Components', count: availableComponents.length },
    { id: 'layout', name: 'Layout', count: availableComponents.filter(c => c.category === 'layout').length },
    { id: 'content', name: 'Content', count: availableComponents.filter(c => c.category === 'content').length },
    { id: 'interactive', name: 'Interactive', count: availableComponents.filter(c => c.category === 'interactive').length },
    { id: 'data', name: 'Data', count: availableComponents.filter(c => c.category === 'data').length }
  ];

  const filteredComponents = selectedCategory === 'all' 
    ? availableComponents 
    : availableComponents.filter(component => component.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Component</h2>
              <p className="text-sm text-gray-600 mt-1">Choose from {availableComponents.length} available components</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Category Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Components Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredComponents.map((component) => (
                <div
                  key={component.type}
                  onClick={() => onSelectComponent(component.type)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-md group"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <span className="text-2xl">{getComponentIcon(component.type)}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 text-sm">{component.name}</h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{component.description}</p>
                    <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full group-hover:bg-blue-200 transition-colors">
                      {component.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredComponents.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
                <p className="text-gray-600">Try selecting a different category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getComponentDisplayName(type: string): string {
  const names: Record<string, string> = {
    hero: 'Hero Section',
    text: 'Text Content',
    button: 'Button',
    image: 'Image',
    form: 'Form',
    section: 'Section',
    header: 'Header',
    feature_grid: 'Feature Grid',
    cta: 'Call to Action',
    card: 'Card',
    video: 'Video',
    spacer: 'Spacer',
    divider: 'Divider',
    testimonial: 'Testimonial',
    pricing: 'Pricing',
    contact: 'Contact',
    footer: 'Footer',
    grid: 'Grid Layout',
    flex: 'Flex Layout',
    container: 'Container',
    badge: 'Badge',
    progress: 'Progress Bar',
    accordion: 'Accordion',
    tabs: 'Tabs'
  };
  return names[type] || type;
}

function getComponentIcon(type: string): string {
  const icons: Record<string, string> = {
    hero: '🏠',
    text: '📝',
    button: '🔘',
    image: '🖼️',
    form: '📋',
    section: '📄',
    header: '🧭',
    feature_grid: '⚡',
    cta: '📢',
    card: '🃏',
    video: '🎥',
    spacer: '📏',
    divider: '➖',
    testimonial: '💬',
    pricing: '💰',
    contact: '📞',
    footer: '🦶',
    grid: '⊞',
    flex: '📐',
    container: '📦',
    badge: '🏷️',
    progress: '📊',
    accordion: '📁',
    tabs: '📑'
  };
  return icons[type] || '🧩';
}

// Sortable Component Item
function SortableComponentItem({
  component,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  isDragging
}: {
  component: BaseComponent;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        component-item p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-100'}
        ${isDragging ? 'shadow-lg' : ''}
      `}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {getComponentDisplayName(component.type)}
            </div>
            <div className="text-xs text-gray-500">
              Position {component.order + 1}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Export Modal Component
function ExportModal({
  template,
  onClose
}: {
  template: TemplateManifest;
  onClose: () => void;
}) {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'yaml' | 'zip'>('json');
  const [includePreview, setIncludePreview] = useState(true);
  const [includeDocumentation, setIncludeDocumentation] = useState(true);
  const [minifyOutput, setMinifyOutput] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Validate before export
      const isValid = validateTemplate(template);
      if (!isValid) {
        alert('Template has validation errors. Please fix them before exporting.');
        return;
      }

      const exportData: any = {
        manifest: template,
        metadata: {
          exportedAt: new Date().toISOString(),
          format: selectedFormat,
          version: '1.0.0'
        }
      };

      if (includeDocumentation) {
        exportData.documentation = {
          title: `${template.name} Template Documentation`,
          description: template.description || 'Generated template documentation',
          components: template.components.map(comp => ({
            id: comp.id,
            type: comp.type,
            description: `${getComponentDisplayName(comp.type)} component`,
            props: Object.keys(comp.props)
          }))
        };
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      switch (selectedFormat) {
        case 'json':
          content = minifyOutput
            ? JSON.stringify(exportData)
            : JSON.stringify(exportData, null, 2);
          filename = `${template.slug}-template.json`;
          mimeType = 'application/json';
          break;

        case 'yaml':
          // Convert to YAML (simplified conversion)
          content = '# Template Export (YAML format)\n' +
                   `name: ${template.name}\n` +
                   `slug: ${template.slug}\n` +
                   `description: ${template.description || ''}\n` +
                   `components_count: ${template.components.length}\n` +
                   '# Full JSON manifest:\n' +
                   JSON.stringify(exportData, null, 2)
                     .split('\n')
                     .map(line => `# ${line}`)
                     .join('\n');
          filename = `${template.slug}-template.yaml`;
          mimeType = 'text/yaml';
          break;

        case 'zip':
          // For zip format, we'll create multiple files
          const files = {
            'manifest.json': JSON.stringify(template, null, 2),
            'export-info.json': JSON.stringify(exportData.metadata, null, 2)
          };

          if (includeDocumentation) {
            files['README.md'] = `# ${template.name} Template\n\n` +
              `${template.description || 'Template documentation'}\n\n` +
              `## Components (${template.components.length})\n\n` +
              template.components.map(comp =>
                `- **${getComponentDisplayName(comp.type)}** (${comp.id})`
              ).join('\n') + '\n\n' +
              `## Usage\n\nImport the manifest.json file into your template builder.\n`;
          }

          // Create a simple "zip" as a JSON bundle for now
          content = JSON.stringify(files, null, 2);
          filename = `${template.slug}-template-bundle.json`;
          mimeType = 'application/json';
          break;

        default:
          throw new Error('Unsupported format');
      }

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Copy to clipboard (for JSON/YAML only)
      if (selectedFormat !== 'zip') {
        try {
          await navigator.clipboard.writeText(content);
        } catch (error) {
          // Clipboard API might fail in some browsers
          console.warn('Could not copy to clipboard:', error);
        }
      }

      alert(`Template exported successfully as ${filename}!`);
      onClose();

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export template. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [template, selectedFormat, includePreview, includeDocumentation, minifyOutput, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Export Template</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Export your template manifest in various formats for sharing or deployment.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'json', name: 'JSON', desc: 'Standard JSON format', icon: '📄' },
                  { id: 'yaml', name: 'YAML', desc: 'Human-readable YAML', icon: '📝' },
                  { id: 'zip', name: 'Bundle', desc: 'Complete package', icon: '📦' },
                ].map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id as any)}
                    className={`
                      p-4 border-2 rounded-lg text-left transition-all
                      ${selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">{format.icon}</div>
                    <div className="font-medium text-gray-900">{format.name}</div>
                    <div className="text-xs text-gray-500">{format.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Export Options</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeDocumentation}
                    onChange={(e) => setIncludeDocumentation(e.target.checked)}
                    className="rounded border-gray-300 mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Include Documentation</div>
                    <div className="text-xs text-gray-500">Generate README and component docs</div>
                  </div>
                </label>

                {selectedFormat === 'json' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={minifyOutput}
                      onChange={(e) => setMinifyOutput(e.target.checked)}
                      className="rounded border-gray-300 mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Minify Output</div>
                      <div className="text-xs text-gray-500">Remove whitespace for smaller file size</div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Template Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Template Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{template.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Components:</span>
                  <span className="ml-2 font-medium">{template.components.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Version:</span>
                  <span className="ml-2 font-medium">{template.meta.version}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium">{template.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export Template'}
          </button>
        </div>
      </div>
    </div>
  );
}