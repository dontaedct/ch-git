'use client'

/**
 * Service Package Editor Component
 *
 * Comprehensive editor for creating and managing service packages
 * with validation, templates, and advanced configuration options.
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  X,
  Save,
  Copy,
  AlertCircle,
  CheckCircle,
  Package,
  Settings,
  Target,
  DollarSign,
  Clock,
  Users,
  Building
} from 'lucide-react'
import type { ServicePackage } from '@/lib/ai/consultation-generator'
import type { ServicePackageCategory, ServicePackageTemplate, ServicePackageValidation } from '@/lib/consultation/service-packages'

export interface ServicePackageEditorProps {
  package?: ServicePackage | null;
  categories: ServicePackageCategory[];
  templates: ServicePackageTemplate[];
  onSave: (packageData: Omit<ServicePackage, 'id'>) => Promise<void>;
  onCancel: () => void;
  onValidate?: (packageData: Partial<ServicePackage>) => ServicePackageValidation;
  isLoading?: boolean;
}

/**
 * Service package editor with comprehensive form controls
 */
export function ServicePackageEditor({
  package: initialPackage,
  categories,
  templates,
  onSave,
  onCancel,
  onValidate,
  isLoading = false
}: ServicePackageEditorProps) {
  const [formData, setFormData] = useState<Partial<ServicePackage>>({
    title: '',
    description: '',
    category: '',
    tier: 'foundation',
    price_band: '',
    timeline: '',
    includes: [],
    industry_tags: [],
    eligibility_criteria: {},
    content: {
      what_you_get: '',
      why_this_fits: '',
      timeline: '',
      next_steps: ''
    }
  });

  const [validation, setValidation] = useState<ServicePackageValidation>({
    is_valid: true,
    errors: [],
    warnings: []
  });

  const [currentInclude, setCurrentInclude] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [eligibilityKey, setEligibilityKey] = useState('');
  const [eligibilityValue, setEligibilityValue] = useState('');

  // Initialize form data
  useEffect(() => {
    if (initialPackage) {
      setFormData(initialPackage);
    }
  }, [initialPackage]);

  // Validate form data
  useEffect(() => {
    if (onValidate) {
      const result = onValidate(formData);
      setValidation(result);
    }
  }, [formData, onValidate]);

  const updateFormData = useCallback((updates: Partial<ServicePackage>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateContent = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  }, []);

  const addInclude = useCallback(() => {
    if (currentInclude.trim()) {
      const includes = [...(formData.includes || []), currentInclude.trim()];
      updateFormData({ includes });
      setCurrentInclude('');
    }
  }, [currentInclude, formData.includes, updateFormData]);

  const removeInclude = useCallback((index: number) => {
    const includes = formData.includes?.filter((_, i) => i !== index) || [];
    updateFormData({ includes });
  }, [formData.includes, updateFormData]);

  const addTag = useCallback(() => {
    if (currentTag.trim()) {
      const tags = [...(formData.industry_tags || []), currentTag.trim()];
      updateFormData({ industry_tags: tags });
      setCurrentTag('');
    }
  }, [currentTag, formData.industry_tags, updateFormData]);

  const removeTag = useCallback((index: number) => {
    const tags = formData.industry_tags?.filter((_, i) => i !== index) || [];
    updateFormData({ industry_tags: tags });
  }, [formData.industry_tags, updateFormData]);

  const addEligibilityCriteria = useCallback(() => {
    if (eligibilityKey.trim() && eligibilityValue.trim()) {
      const criteria = {
        ...formData.eligibility_criteria,
        [eligibilityKey.trim()]: [eligibilityValue.trim()]
      };
      updateFormData({ eligibility_criteria: criteria });
      setEligibilityKey('');
      setEligibilityValue('');
    }
  }, [eligibilityKey, eligibilityValue, formData.eligibility_criteria, updateFormData]);

  const removeEligibilityCriteria = useCallback((key: string) => {
    const criteria = { ...formData.eligibility_criteria };
    delete criteria[key];
    updateFormData({ eligibility_criteria: criteria });
  }, [formData.eligibility_criteria, updateFormData]);

  const loadTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateFormData({
        ...template.default_content,
        category: template.category_id,
        description: template.description
      });
    }
  }, [templates, updateFormData]);

  const handleSave = useCallback(async () => {
    if (!validation.is_valid) {
      return;
    }

    try {
      await onSave(formData as Omit<ServicePackage, 'id'>);
    } catch (error) {
      console.error('Error saving package:', error);
    }
  }, [formData, validation.is_valid, onSave]);

  const isEditMode = !!initialPackage;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold">
            {isEditMode ? 'Edit Service Package' : 'Create Service Package'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {!isEditMode && templates.length > 0 && (
            <Select onValueChange={loadTemplate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Load from template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!validation.is_valid || isLoading}
            className="min-w-20"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Validation Messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          ))}
          {validation.warnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-700">{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Package Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="Enter package title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Describe what this package offers"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category || ''}
                    onValueChange={(value) => updateFormData({ category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tier *</Label>
                  <Select
                    value={formData.tier || 'foundation'}
                    onValueChange={(value: 'foundation' | 'growth' | 'enterprise') =>
                      updateFormData({ tier: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="foundation">Foundation</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_band">Price Band</Label>
                  <Input
                    id="price_band"
                    value={formData.price_band || ''}
                    onChange={(e) => updateFormData({ price_band: e.target.value })}
                    placeholder="e.g., $$, $$$, Contact"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline || ''}
                    onChange={(e) => updateFormData({ timeline: e.target.value })}
                    placeholder="e.g., 4-6 weeks"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Package Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="what_you_get">What You Get</Label>
                <Textarea
                  id="what_you_get"
                  value={formData.content?.what_you_get || ''}
                  onChange={(e) => updateContent('what_you_get', e.target.value)}
                  placeholder="Describe the main deliverables and outcomes"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="why_this_fits">Why This Fits</Label>
                <Textarea
                  id="why_this_fits"
                  value={formData.content?.why_this_fits || ''}
                  onChange={(e) => updateContent('why_this_fits', e.target.value)}
                  placeholder="Explain why this package is ideal for the target audience"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_steps">Next Steps</Label>
                <Textarea
                  id="next_steps"
                  value={formData.content?.next_steps || ''}
                  onChange={(e) => updateContent('next_steps', e.target.value)}
                  placeholder="What happens after the client selects this package"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Includes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                What's Included
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={currentInclude}
                  onChange={(e) => setCurrentInclude(e.target.value)}
                  placeholder="Add feature or deliverable"
                  onKeyDown={(e) => e.key === 'Enter' && addInclude()}
                />
                <Button onClick={addInclude} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {formData.includes?.map((include, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{include}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInclude(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industry Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Industry Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add industry tag"
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.industry_tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Eligibility Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  value={eligibilityKey}
                  onChange={(e) => setEligibilityKey(e.target.value)}
                  placeholder="Question ID (e.g., company-size)"
                />
                <Input
                  value={eligibilityValue}
                  onChange={(e) => setEligibilityValue(e.target.value)}
                  placeholder="Required value (e.g., small)"
                />
                <Button
                  onClick={addEligibilityCriteria}
                  size="sm"
                  className="w-full"
                  disabled={!eligibilityKey.trim() || !eligibilityValue.trim()}
                >
                  Add Criteria
                </Button>
              </div>

              <div className="space-y-2">
                {Object.entries(formData.eligibility_criteria || {}).map(([key, values]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="text-sm">
                      <div className="font-medium">{key}</div>
                      <div className="text-gray-500">{Array.isArray(values) ? values.join(', ') : values}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEligibilityCriteria(key)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}