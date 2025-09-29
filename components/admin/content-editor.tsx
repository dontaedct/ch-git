'use client';

/**
 * Content Editing Interface
 *
 * Comprehensive content editor for template customization with rich text editing,
 * media management, and real-time preview capabilities.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  templateCustomizations,
  type TemplateCustomization,
  type ContentCustomizations
} from '@/lib/templates/customization-engine';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  Save,
  Undo,
  Redo,
  Bold,
  Italic,
  Link,
  Image,
  List,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  Settings,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface ContentEditorProps {
  customization: TemplateCustomization;
  onCustomizationUpdate: (updates: Partial<TemplateCustomization>) => void;
  allowEditing?: boolean;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
  className?: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface CustomSection {
  id: string;
  title: string;
  content: string;
  position: number;
  visible: boolean;
}

interface TestimonialItem {
  name: string;
  company: string;
  text: string;
  image?: string;
}

interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export function ContentEditor({
  customization,
  onCustomizationUpdate,
  allowEditing = true,
  previewMode = 'desktop',
  className = ''
}: ContentEditorProps) {
  const [activeTab, setActiveTab] = useState<'landing' | 'questionnaire' | 'results' | 'emails' | 'legal'>('landing');
  const [previewVisible, setPreviewVisible] = useState(true);

  const updateContentField = useCallback((field: string, value: any) => {
    if (!allowEditing) return;

    const updates: Partial<TemplateCustomization> = {
      content_customizations: {
        ...customization.content_customizations
      }
    };

    // Handle nested field updates
    const parts = field.split('.');
    let current: any = updates.content_customizations;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;

    onCustomizationUpdate(updates);
  }, [customization, onCustomizationUpdate, allowEditing]);

  const renderLandingPageEditor = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Hero Section
          </CardTitle>
          <CardDescription>
            Main headline and call-to-action that visitors see first
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hero Title</Label>
            <RichTextEditor
              value={customization.content_customizations.landing_page.hero_title || ''}
              onChange={(value) => updateContentField('landing_page.hero_title', value)}
              placeholder="Transform Your Business with Expert Consulting"
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Hero Subtitle</Label>
            <RichTextEditor
              value={customization.content_customizations.landing_page.hero_subtitle || ''}
              onChange={(value) => updateContentField('landing_page.hero_subtitle', value)}
              placeholder="Get personalized insights and actionable strategies to accelerate your growth"
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Call-to-Action Button</Label>
            <input
              type="text"
              value={customization.content_customizations.landing_page.hero_cta || ''}
              onChange={(e) => updateContentField('landing_page.hero_cta', e.target.value)}
              disabled={!allowEditing}
              placeholder="Start Your Assessment"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Value Propositions */}
      <Card>
        <CardHeader>
          <CardTitle>Value Propositions</CardTitle>
          <CardDescription>
            Key benefits and value statements for your service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ValuePropositionEditor
            propositions={customization.content_customizations.landing_page.value_propositions || []}
            onChange={(propositions) => updateContentField('landing_page.value_propositions', propositions)}
            disabled={!allowEditing}
          />
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Highlight key features and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureEditor
            features={customization.content_customizations.landing_page.features || []}
            onChange={(features) => updateContentField('landing_page.features', features)}
            disabled={!allowEditing}
          />
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>
            Client testimonials and success stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestimonialEditor
            testimonials={customization.content_customizations.landing_page.testimonials || []}
            onChange={(testimonials) => updateContentField('landing_page.testimonials', testimonials)}
            disabled={!allowEditing}
          />
        </CardContent>
      </Card>

      {/* Custom Sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Sections</CardTitle>
              <CardDescription>
                Add custom content sections to your landing page
              </CardDescription>
            </div>
            {allowEditing && (
              <Button
                onClick={() => addCustomSection()}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CustomSectionEditor
            sections={customization.content_customizations.landing_page.custom_sections || []}
            onChange={(sections) => updateContentField('landing_page.custom_sections', sections)}
            disabled={!allowEditing}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderQuestionnaireEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Instructions</CardTitle>
          <CardDescription>
            Text shown to users before they start the questionnaire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Introduction Text</Label>
            <RichTextEditor
              value={customization.content_customizations.questionnaire.intro_text || ''}
              onChange={(value) => updateContentField('questionnaire.intro_text', value)}
              placeholder="This assessment will help us understand your business needs..."
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Completion Message</Label>
            <RichTextEditor
              value={customization.content_customizations.questionnaire.completion_message || ''}
              onChange={(value) => updateContentField('questionnaire.completion_message', value)}
              placeholder="Thank you for completing the assessment. Your personalized consultation is being generated..."
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Privacy Notice</Label>
            <RichTextEditor
              value={customization.content_customizations.questionnaire.privacy_notice || ''}
              onChange={(value) => updateContentField('questionnaire.privacy_notice', value)}
              placeholder="Your information is secure and will only be used to provide your consultation."
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Custom Instructions</Label>
            <RichTextEditor
              value={customization.content_customizations.questionnaire.custom_instructions || ''}
              onChange={(value) => updateContentField('questionnaire.custom_instructions', value)}
              placeholder="Additional instructions or context for users..."
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Indicators</CardTitle>
          <CardDescription>
            Configure how progress is displayed during the questionnaire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Progress Style</Label>
            <select
              value={customization.content_customizations.questionnaire.progress_indicators?.style || 'bar'}
              onChange={(e) => updateContentField('questionnaire.progress_indicators.style', e.target.value)}
              disabled={!allowEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            >
              <option value="bar">Progress Bar</option>
              <option value="steps">Step Indicators</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                checked={customization.content_customizations.questionnaire.progress_indicators?.show_titles || false}
                onCheckedChange={(checked) => updateContentField('questionnaire.progress_indicators.show_titles', checked)}
                disabled={!allowEditing}
              />
              <Label>Show Step Titles</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={customization.content_customizations.questionnaire.progress_indicators?.show_numbers || false}
                onCheckedChange={(checked) => updateContentField('questionnaire.progress_indicators.show_numbers', checked)}
                disabled={!allowEditing}
              />
              <Label>Show Step Numbers</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResultsEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Results Page Content</CardTitle>
          <CardDescription>
            Content shown on the consultation results page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Page Title</Label>
            <input
              type="text"
              value={customization.content_customizations.results_page.title || ''}
              onChange={(e) => updateContentField('results_page.title', e.target.value)}
              disabled={!allowEditing}
              placeholder="Your Personalized Business Consultation"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>

          <div>
            <Label>Subtitle</Label>
            <input
              type="text"
              value={customization.content_customizations.results_page.subtitle || ''}
              onChange={(e) => updateContentField('results_page.subtitle', e.target.value)}
              disabled={!allowEditing}
              placeholder="Based on your responses, here are our recommendations"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>

          <div>
            <Label>Next Steps Header</Label>
            <input
              type="text"
              value={customization.content_customizations.results_page.next_steps_header || ''}
              onChange={(e) => updateContentField('results_page.next_steps_header', e.target.value)}
              disabled={!allowEditing}
              placeholder="Recommended Next Steps"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>

          <div>
            <Label>Consultation Description</Label>
            <RichTextEditor
              value={customization.content_customizations.results_page.consultation_description || ''}
              onChange={(value) => updateContentField('results_page.consultation_description', value)}
              placeholder="Your consultation includes personalized insights and actionable recommendations..."
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Contact Call-to-Action</Label>
            <input
              type="text"
              value={customization.content_customizations.results_page.contact_cta || ''}
              onChange={(e) => updateContentField('results_page.contact_cta', e.target.value)}
              disabled={!allowEditing}
              placeholder="Schedule a Strategy Call"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>

          <div>
            <Label>Custom Footer</Label>
            <RichTextEditor
              value={customization.content_customizations.results_page.custom_footer || ''}
              onChange={(value) => updateContentField('results_page.custom_footer', value)}
              placeholder="Additional information or disclaimers..."
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmailEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Customize automated email communications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Welcome Email */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Welcome Email</h4>
            <div>
              <Label>Subject Line</Label>
              <input
                type="text"
                value={customization.content_customizations.email_templates.welcome_subject || ''}
                onChange={(e) => updateContentField('email_templates.welcome_subject', e.target.value)}
                disabled={!allowEditing}
                placeholder="Welcome to Your Business Assessment"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />
            </div>
            <div>
              <Label>Email Body</Label>
              <RichTextEditor
                value={customization.content_customizations.email_templates.welcome_body || ''}
                onChange={(value) => updateContentField('email_templates.welcome_body', value)}
                placeholder="Thank you for starting your business assessment..."
                disabled={!allowEditing}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Consultation Email */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Consultation Delivery Email</h4>
            <div>
              <Label>Subject Line</Label>
              <input
                type="text"
                value={customization.content_customizations.email_templates.consultation_subject || ''}
                onChange={(e) => updateContentField('email_templates.consultation_subject', e.target.value)}
                disabled={!allowEditing}
                placeholder="Your Personalized Business Consultation is Ready"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />
            </div>
            <div>
              <Label>Email Body</Label>
              <RichTextEditor
                value={customization.content_customizations.email_templates.consultation_body || ''}
                onChange={(value) => updateContentField('email_templates.consultation_body', value)}
                placeholder="Your customized consultation report is attached..."
                disabled={!allowEditing}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Follow-up Email */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Follow-up Email</h4>
            <div>
              <Label>Subject Line</Label>
              <input
                type="text"
                value={customization.content_customizations.email_templates.follow_up_subject || ''}
                onChange={(e) => updateContentField('email_templates.follow_up_subject', e.target.value)}
                disabled={!allowEditing}
                placeholder="Next Steps for Your Business Growth"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />
            </div>
            <div>
              <Label>Email Body</Label>
              <RichTextEditor
                value={customization.content_customizations.email_templates.follow_up_body || ''}
                onChange={(value) => updateContentField('email_templates.follow_up_body', value)}
                placeholder="Following up on your consultation..."
                disabled={!allowEditing}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLegalEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Content</CardTitle>
          <CardDescription>
            Terms, privacy policy, and legal disclaimers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Terms of Service</Label>
            <RichTextEditor
              value={customization.content_customizations.legal_content.terms_of_service || ''}
              onChange={(value) => updateContentField('legal_content.terms_of_service', value)}
              placeholder="Terms and conditions for service usage..."
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Privacy Policy</Label>
            <RichTextEditor
              value={customization.content_customizations.legal_content.privacy_policy || ''}
              onChange={(value) => updateContentField('legal_content.privacy_policy', value)}
              placeholder="How user data is collected, used, and protected..."
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Disclaimer</Label>
            <RichTextEditor
              value={customization.content_customizations.legal_content.disclaimer || ''}
              onChange={(value) => updateContentField('legal_content.disclaimer', value)}
              placeholder="Important disclaimers and limitations..."
              disabled={!allowEditing}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const addCustomSection = () => {
    const sections = customization.content_customizations.landing_page.custom_sections || [];
    const newSection: CustomSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      content: '',
      position: sections.length,
      visible: true
    };

    updateContentField('landing_page.custom_sections', [...sections, newSection]);
  };

  return (
    <div className={`content-editor ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Content Editor</h2>
            <p className="text-gray-600 mt-1">
              Customize all text content and messaging across your template
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewVisible(!previewVisible)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewVisible ? 'Hide' : 'Show'} Preview
            </Button>
            {allowEditing && (
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="landing">Landing Page</TabsTrigger>
            <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>

          <TabsContent value="landing">
            {renderLandingPageEditor()}
          </TabsContent>

          <TabsContent value="questionnaire">
            {renderQuestionnaireEditor()}
          </TabsContent>

          <TabsContent value="results">
            {renderResultsEditor()}
          </TabsContent>

          <TabsContent value="emails">
            {renderEmailEditor()}
          </TabsContent>

          <TabsContent value="legal">
            {renderLegalEditor()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Rich Text Editor Component
function RichTextEditor({ value, onChange, placeholder, disabled, className }: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false);

  return (
    <div className={`rich-text-editor ${className}`}>
      {showToolbar && (
        <div className="border border-gray-300 border-b-0 rounded-t-md p-2 bg-gray-50 flex items-center space-x-2">
          <Button variant="ghost" size="sm" disabled={disabled}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled={disabled}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled={disabled}>
            <Link className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" disabled={disabled}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled={disabled}>
            <Quote className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" disabled={disabled}>
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled={disabled}>
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled={disabled}>
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setShowToolbar(true)}
        onBlur={() => setShowToolbar(false)}
        className={`${showToolbar ? 'rounded-t-none' : ''}`}
        rows={4}
      />
    </div>
  );
}

// Value Proposition Editor
function ValuePropositionEditor({
  propositions,
  onChange,
  disabled
}: {
  propositions: string[];
  onChange: (propositions: string[]) => void;
  disabled: boolean;
}) {
  const addProposition = () => {
    onChange([...propositions, '']);
  };

  const updateProposition = (index: number, value: string) => {
    const updated = [...propositions];
    updated[index] = value;
    onChange(updated);
  };

  const removeProposition = (index: number) => {
    onChange(propositions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {propositions.map((proposition, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={proposition}
            onChange={(e) => updateProposition(index, e.target.value)}
            disabled={disabled}
            placeholder="Enter value proposition..."
            className="flex-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
          />
          {!disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeProposition(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button variant="outline" onClick={addProposition} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Value Proposition
        </Button>
      )}
    </div>
  );
}

// Feature Editor
function FeatureEditor({
  features,
  onChange,
  disabled
}: {
  features: FeatureItem[];
  onChange: (features: FeatureItem[]) => void;
  disabled: boolean;
}) {
  const addFeature = () => {
    onChange([...features, { title: '', description: '' }]);
  };

  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    const updated = [...features];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const removeFeature = (index: number) => {
    onChange(features.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {features.map((feature, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Feature {index + 1}</h4>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div>
              <Label>Title</Label>
              <input
                type="text"
                value={feature.title}
                onChange={(e) => updateFeature(index, 'title', e.target.value)}
                disabled={disabled}
                placeholder="Feature title..."
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={feature.description}
                onChange={(e) => updateFeature(index, 'description', e.target.value)}
                disabled={disabled}
                placeholder="Feature description..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>Icon (optional)</Label>
              <input
                type="text"
                value={feature.icon || ''}
                onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                disabled={disabled}
                placeholder="Icon name or emoji"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />
            </div>
          </div>
        </Card>
      ))}
      {!disabled && (
        <Button variant="outline" onClick={addFeature}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      )}
    </div>
  );
}

// Testimonial Editor
function TestimonialEditor({
  testimonials,
  onChange,
  disabled
}: {
  testimonials: TestimonialItem[];
  onChange: (testimonials: TestimonialItem[]) => void;
  disabled: boolean;
}) {
  const addTestimonial = () => {
    onChange([...testimonials, { name: '', company: '', text: '' }]);
  };

  const updateTestimonial = (index: number, field: keyof TestimonialItem, value: string) => {
    const updated = [...testimonials];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const removeTestimonial = (index: number) => {
    onChange(testimonials.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Testimonial {index + 1}</h4>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTestimonial(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <input
                  type="text"
                  value={testimonial.name}
                  onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                  disabled={disabled}
                  placeholder="Client name"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div>
                <Label>Company</Label>
                <input
                  type="text"
                  value={testimonial.company}
                  onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                  disabled={disabled}
                  placeholder="Company name"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
            </div>
            <div>
              <Label>Testimonial Text</Label>
              <Textarea
                value={testimonial.text}
                onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                disabled={disabled}
                placeholder="What they said about your service..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </Card>
      ))}
      {!disabled && (
        <Button variant="outline" onClick={addTestimonial}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      )}
    </div>
  );
}

// Custom Section Editor
function CustomSectionEditor({
  sections,
  onChange,
  disabled
}: {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
  disabled: boolean;
}) {
  const updateSection = (index: number, field: keyof CustomSection, value: any) => {
    const updated = [...sections];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const updated = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < sections.length) {
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      // Update positions
      updated[index].position = index;
      updated[targetIndex].position = targetIndex;
      onChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={section.id} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Custom Section {index + 1}</h4>
              <div className="flex items-center space-x-2">
                {!disabled && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label>Section Title</Label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(index, 'title', e.target.value)}
                  disabled={disabled}
                  placeholder="Section title..."
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={section.visible}
                  onCheckedChange={(checked) => updateSection(index, 'visible', checked)}
                  disabled={disabled}
                />
                <Label>Visible</Label>
              </div>
            </div>

            <div>
              <Label>Content</Label>
              <RichTextEditor
                value={section.content}
                onChange={(value) => updateSection(index, 'content', value)}
                placeholder="Section content..."
                disabled={disabled}
                className="mt-1"
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}