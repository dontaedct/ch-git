/**
 * Form Builder Page
 *
 * Implementation of the 3-column form builder interface from Phase 3 wireframes.
 * Configuration-first approach with advanced field management and validation.
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
// Simplified types for form builder
interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  order: number;
  validation: any;
  options: string[];
}

interface FormManifest {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  settings: any;
  theme: any;
  fields: FormField[];
  validation: any;
  submission: any;
  security: any;
  analytics: any;
  meta: any;
}

// Form metadata schema
const formMetadataSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  slug: z.string().min(2, 'Slug required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.string().min(1, 'Category required'),
  title: z.string().max(200, 'Title too long').optional(),
  submitButtonText: z.string().max(50, 'Button text too long').optional(),
  layout: z.enum(['vertical', 'horizontal', 'two-column']),
  showReset: z.boolean(),
  progressBar: z.boolean(),
});

type FormMetadata = z.infer<typeof formMetadataSchema>;

export default function FormBuilderPage() {
  // State management
  const [form, setForm] = useState<FormManifest>({
    id: `form_${Date.now()}`,
    name: 'New Form',
    slug: 'new-form',
    description: '',
    category: 'contact',
    settings: {
      title: 'Contact Form',
      description: '',
      submitButtonText: 'Submit',
      resetButtonText: 'Reset',
      showReset: false,
      layout: 'vertical',
      progressBar: false
    },
    theme: { useSiteDefaults: true },
    fields: [],
    validation: {
      enabled: true,
      realtime: true,
      showErrorSummary: true
    },
    submission: {
      type: 'email',
      target: 'admin@example.com',
      method: 'POST'
    },
    security: {
      honeypot: true,
      rateLimit: {
        enabled: true,
        maxSubmissions: 5,
        windowMinutes: 60
      },
      dataRetention: {
        enabled: true,
        retentionDays: 90
      }
    },
    analytics: {
      enabled: true,
      trackViews: true,
      trackStarted: true,
      trackCompleted: true
    },
    meta: {
      version: '1.0.0',
      createdBy: 'team_dct',
      createdAt: new Date().toISOString().split('T')[0],
      tags: [],
      schemaVersion: '1.0.0'
    }
  });

  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [fieldPaletteOpen, setFieldPaletteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'settings' | 'security'>('fields');

  // Refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Form handling for form metadata
  const metadataForm = useForm<FormMetadata>({
    resolver: zodResolver(formMetadataSchema),
    defaultValues: {
      name: form.name,
      slug: form.slug,
      description: form.description || '',
      category: form.category,
      title: form.settings?.title || '',
      submitButtonText: form.settings?.submitButtonText || 'Submit',
      layout: form.settings?.layout || 'vertical',
      showReset: form.settings?.showReset || false,
      progressBar: form.settings?.progressBar || false,
    }
  });

  // Available field types
  const availableFields = [
    'text', 'email', 'password', 'number', 'tel', 'url', 'search', 'hidden',
    'textarea', 'select', 'radio', 'checkbox', 'range', 'rating', 'file',
    'signature', 'date', 'time', 'datetime', 'color', 'address'
  ];

  // Auto-save functionality
  useEffect(() => {
    if (isDirty) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [form, isDirty]);

  // Handle metadata changes
  const handleMetadataChange = useCallback((data: FormMetadata) => {
    setForm(prev => ({
      ...prev,
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      settings: {
        ...prev.settings,
        title: data.title,
        submitButtonText: data.submitButtonText,
        layout: data.layout,
        showReset: data.showReset,
        progressBar: data.progressBar,
      }
    }));
    setIsDirty(true);
  }, []);

  // Handle field addition
  const handleAddField = useCallback((fieldType: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `field_${form.fields.length + 1}`,
      type: fieldType,
      label: getDefaultLabel(fieldType),
      placeholder: getDefaultPlaceholder(fieldType),
      required: false,
      order: form.fields.length,
      validation: getDefaultValidation(fieldType),
      options: getDefaultOptions(fieldType),
    };

    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));

    setSelectedField(newField);
    setFieldPaletteOpen(false);
    setIsDirty(true);
  }, [form.fields.length]);

  // Handle field reordering
  const handleDragEnd = useCallback((result: DragEndEvent) => {
    if (!result.destination) return;

    const items = Array.from(form.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const reorderedFields = items.map((field, index) => ({
      ...field,
      order: index
    }));

    setForm(prev => ({
      ...prev,
      fields: reorderedFields
    }));

    setIsDirty(true);
  }, [form.fields]);

  // Handle field property updates
  const handleFieldUpdate = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));

    setIsDirty(true);
  }, []);

  // Handle field deletion
  const handleDeleteField = useCallback((fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      setForm(prev => ({
        ...prev,
        fields: prev.fields
          .filter(field => field.id !== fieldId)
          .map((field, index) => ({ ...field, order: index }))
      }));

      if (selectedField?.id === fieldId) {
        setSelectedField(null);
      }

      setIsDirty(true);
    }
  }, [selectedField]);

  // Handle duplicate field
  const handleDuplicateField = useCallback((fieldId: string) => {
    const fieldToDuplicate = form.fields.find(field => field.id === fieldId);
    if (!fieldToDuplicate) return;

    const duplicatedField: FormField = {
      ...fieldToDuplicate,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${fieldToDuplicate.name}_copy`,
      label: `${fieldToDuplicate.label} (Copy)`,
      order: fieldToDuplicate.order + 1
    };

    setForm(prev => ({
      ...prev,
      fields: [
        ...prev.fields.slice(0, duplicatedField.order),
        duplicatedField,
        ...prev.fields.slice(duplicatedField.order).map(field => ({
          ...field,
          order: field.order + 1
        }))
      ]
    }));

    setSelectedField(duplicatedField);
    setIsDirty(true);
  }, [form.fields]);

  // Auto-save function
  const handleAutoSave = useCallback(async () => {
    try {
      const savedForm = await saveForm(form, false);
      if (savedForm) {
        setIsDirty(false);
        console.log('Form auto-saved');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [form]);

  // Manual save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const savedForm = await saveForm(form, true);
      if (savedForm) {
        setIsDirty(false);
        alert('Form saved successfully!');
      }
    } catch (error) {
      alert('Failed to save form. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [form]);

  // Export manifest
  const handleExport = useCallback(async () => {
    try {
      // Download JSON file
      const blob = new Blob([JSON.stringify(form, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.slug}-form.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Copy to clipboard
      await navigator.clipboard.writeText(JSON.stringify(form, null, 2));
      alert('Form exported and copied to clipboard!');

    } catch (error) {
      alert('Failed to export form.');
    }
  }, [form]);

  // Helper functions
  function getDefaultLabel(fieldType: string): string {
    const labels: Record<string, string> = {
      text: 'Text Field',
      email: 'Email Address',
      password: 'Password',
      number: 'Number',
      tel: 'Phone Number',
      url: 'Website URL',
      search: 'Search',
      hidden: 'Hidden Field',
      textarea: 'Message',
      select: 'Select Option',
      radio: 'Choose One',
      checkbox: 'Checkbox',
      range: 'Range',
      rating: 'Rating',
      file: 'Upload File',
      signature: 'Signature',
      date: 'Date',
      time: 'Time',
      datetime: 'Date & Time',
      color: 'Color',
      address: 'Address'
    };
    return labels[fieldType] || 'Field';
  }

  function getDefaultPlaceholder(fieldType: string): string {
    const placeholders: Record<string, string> = {
      text: 'Enter text...',
      email: 'you@example.com',
      password: 'Enter password...',
      number: '0',
      tel: '(555) 123-4567',
      url: 'https://example.com',
      search: 'Search...',
      hidden: '',
      textarea: 'Enter your message...',
      select: 'Choose an option...',
      radio: '',
      checkbox: '',
      range: '',
      rating: '',
      file: 'Choose file...',
      signature: '',
      date: 'Select date',
      time: 'Select time',
      datetime: 'Select date and time',
      color: '#007AFF',
      address: ''
    };
    return placeholders[fieldType] || '';
  }

  function getDefaultValidation(fieldType: string): any {
    const validations: Record<string, any> = {
      email: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        patternMessage: 'Please enter a valid email address'
      },
      tel: {
        pattern: '^[\\+]?[1-9][\\d]{0,15}$',
        patternMessage: 'Please enter a valid phone number'
      },
      url: {
        pattern: '^https?:\\/\\/.+',
        patternMessage: 'Please enter a valid URL'
      },
      text: {
        minLength: 1,
        maxLength: 255
      },
      textarea: {
        minLength: 1,
        maxLength: 2000
      },
      number: {
        min: 0,
        max: 999999
      },
      range: {
        min: 0,
        max: 100
      },
      rating: {
        min: 1,
        max: 5
      }
    };
    return validations[fieldType] || {};
  }

  function getDefaultOptions(fieldType: string): string[] {
    const options: Record<string, string[]> = {
      select: ['Option 1', 'Option 2', 'Option 3'],
      radio: ['Option 1', 'Option 2', 'Option 3'],
      checkbox: ['Option 1', 'Option 2', 'Option 3'],
      range: ['0', '100'],
      rating: ['5']
    };
    return options[fieldType] || [];
  }

  // Save form function
  async function saveForm(form: FormManifest, manual: boolean): Promise<FormManifest | null> {
    try {
      // Save to localStorage for now (would be API call in production)
      localStorage.setItem(`form_${form.id}`, JSON.stringify(form));
      localStorage.setItem('form_last_saved', new Date().toISOString());

      return form;
    } catch (error) {
      throw error;
    }
  }

  return (
    <div className="form-builder h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Form Builder</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{form.name}</span>
              {isDirty && (
                <span className="flex items-center text-orange-600">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-1"></div>
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Form Settings */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { key: 'fields', label: 'Fields', icon: '📝' },
                { key: 'settings', label: 'Settings', icon: '⚙️' },
                { key: 'security', label: 'Security', icon: '🛡️' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`
                    flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'fields' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Form Information</h2>

                <form onSubmit={metadataForm.handleSubmit(handleMetadataChange)} className="space-y-4">
                  {/* Form Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Form Name *
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
                            placeholder="Enter form name"
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
                          <option value="contact">Contact</option>
                          <option value="lead-capture">Lead Capture</option>
                          <option value="survey">Survey</option>
                          <option value="registration">Registration</option>
                          <option value="feedback">Feedback</option>
                          <option value="newsletter">Newsletter</option>
                        </select>
                      )}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700"
                  >
                    Update Form Info
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Form Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Form Title
                    </label>
                    <Controller
                      name="title"
                      control={metadataForm.control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Form title"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Layout
                    </label>
                    <Controller
                      name="layout"
                      control={metadataForm.control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="vertical">Vertical</option>
                          <option value="horizontal">Horizontal</option>
                          <option value="two-column">Two Column</option>
                        </select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Controller
                      name="showReset"
                      control={metadataForm.control}
                      render={({ field }) => (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mr-2"
                          />
                          <span className="text-sm">Show reset button</span>
                        </label>
                      )}
                    />

                    <Controller
                      name="progressBar"
                      control={metadataForm.control}
                      render={({ field }) => (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mr-2"
                          />
                          <span className="text-sm">Show progress bar</span>
                        </label>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Spam Protection</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.security?.honeypot}
                          onChange={(e) => setForm(prev => ({
                            ...prev,
                            security: { ...prev.security, honeypot: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable honeypot</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Rate Limiting</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.security?.rateLimit?.enabled}
                          onChange={(e) => setForm(prev => ({
                            ...prev,
                            security: {
                              ...prev.security,
                              rateLimit: {
                                ...prev.security?.rateLimit,
                                enabled: e.target.checked
                              }
                            }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable rate limiting</span>
                      </label>

                      {form.security?.rateLimit?.enabled && (
                        <div className="ml-6 space-y-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Max submissions per hour
                            </label>
                            <input
                              type="number"
                              value={form.security?.rateLimit?.maxSubmissions || 5}
                              onChange={(e) => setForm(prev => ({
                                ...prev,
                                security: {
                                  ...prev.security,
                                  rateLimit: {
                                    ...prev.security?.rateLimit,
                                    maxSubmissions: parseInt(e.target.value)
                                  }
                                }
                              }))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              min="1"
                              max="100"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Data Retention</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.security?.dataRetention?.enabled}
                          className="mr-2"
                          readOnly
                        />
                        <span className="text-sm">Auto-delete submissions</span>
                      </label>
                      <div className="ml-6">
                        <label className="block text-xs text-gray-600 mb-1">
                          Retention period (days)
                        </label>
                        <input
                          type="number"
                          value={form.security?.dataRetention?.retentionDays || 90}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          min="1"
                          max="3650"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Column - Fields List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Form Fields</h2>
              <span className="text-sm text-gray-500">{form.fields.length} fields</span>
            </div>

            <button
              onClick={() => setFieldPaletteOpen(true)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              + Add Field
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Field List - Simplified for build stability */}
            <div className="p-4 space-y-2">
              {form.fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`
                    field-item p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer
                    ${selectedField?.id === field.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-100'}
                  `}
                  onClick={() => setSelectedField(field)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {field.label}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                          <span>{getFieldTypeDisplay(field.type)}</span>
                          {field.required && (
                            <span className="text-red-500">Required</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateField(field.id);
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
                          handleDeleteField(field.id);
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
              ))}

              {form.fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">No fields yet</p>
                  <p className="text-xs">Add fields to build your form</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Field Editor or Preview */}
        <div className="flex-1 flex flex-col">
          {isPreviewOpen ? (
            <div className="flex-1 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Form Preview</h3>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-xl font-semibold mb-4">{form.settings?.title || form.name}</h4>
                <div className="space-y-4">
                  {form.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type={field.type === 'textarea' ? 'text' : field.type}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    disabled
                  >
                    {form.settings?.submitButtonText || 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          ) : selectedField ? (
            <div className="flex-1 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Field Editor</h3>
              <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) => handleFieldUpdate(selectedField.id, { label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                  <input
                    type="text"
                    value={selectedField.placeholder}
                    onChange={(e) => handleFieldUpdate(selectedField.id, { placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedField.required}
                    onChange={(e) => handleFieldUpdate(selectedField.id, { required: e.target.checked })}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">Required field</label>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Field Selected</h3>
                <p className="text-gray-600">Select a field to edit its properties</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Field Palette Modal */}
      {fieldPaletteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Field</h3>
              <button
                onClick={() => setFieldPaletteOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableFields.map((fieldType) => (
                <button
                  key={fieldType}
                  onClick={() => handleAddField(fieldType)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300"
                >
                  <div className="text-sm font-medium text-gray-900">{getDefaultLabel(fieldType)}</div>
                  <div className="text-xs text-gray-500">{fieldType}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Helper functions
function getFieldTypeDisplay(type: string): string {
  const displays: Record<string, string> = {
    text: 'Text Input',
    email: 'Email',
    password: 'Password',
    number: 'Number',
    tel: 'Phone',
    url: 'URL',
    search: 'Search',
    hidden: 'Hidden',
    textarea: 'Textarea',
    select: 'Select',
    radio: 'Radio',
    checkbox: 'Checkbox',
    range: 'Range',
    rating: 'Rating',
    file: 'File Upload',
    signature: 'Signature',
    date: 'Date',
    time: 'Time',
    datetime: 'Date & Time',
    color: 'Color',
    address: 'Address'
  };
  return displays[type] || type;
}

function getFieldIcon(type: string): string {
  const icons: Record<string, string> = {
    text: '📝',
    email: '📧',
    password: '🔒',
    number: '🔢',
    tel: '📞',
    url: '🔗',
    search: '🔍',
    hidden: '👁️‍🗨️',
    textarea: '📄',
    select: '📋',
    radio: '🔘',
    checkbox: '☑️',
    range: '🎚️',
    rating: '⭐',
    file: '📎',
    signature: '✍️',
    date: '📅',
    time: '🕐',
    datetime: '📅🕐',
    color: '🎨',
    address: '📍'
  };
  return icons[type] || '📝';
}