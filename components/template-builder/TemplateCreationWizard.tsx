/**
 * Template Creation Wizard
 * 
 * Multi-step wizard for creating templates from scratch with guided setup,
 * template selection, and initial configuration.
 */

import React, { useState, useCallback } from 'react';
import { TemplateManifest } from '../../types/componentContracts';
import { getTemplateStorage } from '../../lib/template-storage/TemplateStorage';

interface TemplateCreationWizardProps {
  onTemplateCreated: (template: TemplateManifest) => void;
  onClose: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

interface TemplateTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  components: any[];
  features: string[];
}

const templateTemplates: TemplateTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Template',
    description: 'Start with a completely empty template',
    category: 'blank',
    preview: '📄',
    components: [],
    features: ['Complete customization', 'No pre-built components']
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'High-converting landing page with hero, features, and CTA',
    category: 'marketing',
    preview: '🚀',
    components: [
      { type: 'header', order: 0, props: { logo: 'Your Brand', navigation: [] } },
      { type: 'hero', order: 1, props: { title: 'Welcome to Our Product', subtitle: 'The best solution for your needs' } },
      { type: 'feature_grid', order: 2, props: { title: 'Features', features: [] } },
      { type: 'cta', order: 3, props: { title: 'Get Started Today', buttons: [] } },
      { type: 'footer', order: 4, props: { copyright: '© 2024 Your Company' } }
    ],
    features: ['Hero section', 'Feature showcase', 'Call-to-action', 'Responsive design']
  },
  {
    id: 'business-website',
    name: 'Business Website',
    description: 'Professional business website with about, services, and contact',
    category: 'business',
    preview: '🏢',
    components: [
      { type: 'header', order: 0, props: { logo: 'Your Business', navigation: [] } },
      { type: 'hero', order: 1, props: { title: 'Professional Services', subtitle: 'Excellence in every project' } },
      { type: 'section', order: 2, props: { title: 'About Us', content: 'Learn about our company' } },
      { type: 'feature_grid', order: 3, props: { title: 'Our Services', features: [] } },
      { type: 'testimonial', order: 4, props: { quote: 'Great service!', author: 'Happy Customer' } },
      { type: 'contact', order: 5, props: { title: 'Get In Touch' } },
      { type: 'footer', order: 6, props: { copyright: '© 2024 Your Business' } }
    ],
    features: ['About section', 'Services showcase', 'Testimonials', 'Contact form']
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Creative portfolio with project showcase and personal branding',
    category: 'creative',
    preview: '🎨',
    components: [
      { type: 'header', order: 0, props: { logo: 'Your Name', navigation: [] } },
      { type: 'hero', order: 1, props: { title: 'Creative Portfolio', subtitle: 'Showcasing my best work' } },
      { type: 'section', order: 2, props: { title: 'About Me', content: 'Learn about my background' } },
      { type: 'feature_grid', order: 3, props: { title: 'Featured Projects', features: [] } },
      { type: 'testimonial', order: 4, props: { quote: 'Amazing work!', author: 'Client' } },
      { type: 'contact', order: 5, props: { title: 'Let\'s Work Together' } },
      { type: 'footer', order: 6, props: { copyright: '© 2024 Your Name' } }
    ],
    features: ['Project gallery', 'Personal branding', 'Client testimonials', 'Contact form']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Online store with product showcase, cart, and checkout',
    category: 'ecommerce',
    preview: '🛍️',
    components: [
      { type: 'header', order: 0, props: { logo: 'Your Store', navigation: [] } },
      { type: 'hero', order: 1, props: { title: 'Welcome to Our Store', subtitle: 'Quality products at great prices' } },
      { type: 'feature_grid', order: 2, props: { title: 'Featured Products', features: [] } },
      { type: 'section', order: 3, props: { title: 'Why Choose Us', content: 'Quality, service, and value' } },
      { type: 'testimonial', order: 4, props: { quote: 'Great products!', author: 'Satisfied Customer' } },
      { type: 'contact', order: 5, props: { title: 'Customer Support' } },
      { type: 'footer', order: 6, props: { copyright: '© 2024 Your Store' } }
    ],
    features: ['Product showcase', 'Shopping cart', 'Customer reviews', 'Support contact']
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Content-focused blog with articles, categories, and author info',
    category: 'content',
    preview: '📝',
    components: [
      { type: 'header', order: 0, props: { logo: 'Your Blog', navigation: [] } },
      { type: 'hero', order: 1, props: { title: 'Latest Articles', subtitle: 'Insights and updates' } },
      { type: 'feature_grid', order: 2, props: { title: 'Recent Posts', features: [] } },
      { type: 'section', order: 3, props: { title: 'About the Author', content: 'Learn about the writer' } },
      { type: 'cta', order: 4, props: { title: 'Subscribe to Updates', buttons: [] } },
      { type: 'footer', order: 5, props: { copyright: '© 2024 Your Blog' } }
    ],
    features: ['Article layout', 'Category navigation', 'Author bio', 'Newsletter signup']
  }
];

// Step 1: Template Selection
const TemplateSelectionStep: React.FC<{
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onNext: () => void;
}> = ({ selectedTemplate, onTemplateSelect, onNext }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates', count: templateTemplates.length },
    { id: 'marketing', name: 'Marketing', count: templateTemplates.filter(t => t.category === 'marketing').length },
    { id: 'business', name: 'Business', count: templateTemplates.filter(t => t.category === 'business').length },
    { id: 'creative', name: 'Creative', count: templateTemplates.filter(t => t.category === 'creative').length },
    { id: 'ecommerce', name: 'E-commerce', count: templateTemplates.filter(t => t.category === 'ecommerce').length },
    { id: 'content', name: 'Content', count: templateTemplates.filter(t => t.category === 'content').length },
    { id: 'blank', name: 'Blank', count: templateTemplates.filter(t => t.category === 'blank').length }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templateTemplates 
    : templateTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Choose a Template</h3>
        <p className="text-sm text-gray-600">Select a starting template or begin with a blank canvas</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{template.preview}</div>
              <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="space-y-1">
                {template.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="text-xs text-gray-500 flex items-center">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
                {template.features.length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{template.features.length - 3} more features
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!selectedTemplate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Template Details
        </button>
      </div>
    </div>
  );
};

// Step 2: Template Details
const TemplateDetailsStep: React.FC<{
  templateData: Partial<TemplateManifest>;
  onTemplateDataChange: (data: Partial<TemplateManifest>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ templateData, onTemplateDataChange, onNext, onBack }) => {
  const handleInputChange = (field: string, value: any) => {
    onTemplateDataChange({
      ...templateData,
      [field]: value
    });
  };

  const handleSlugChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    handleInputChange('slug', slug);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Template Details</h3>
        <p className="text-sm text-gray-600">Configure your template name, description, and category</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={templateData.name || ''}
              onChange={(e) => {
                handleInputChange('name', e.target.value);
                handleSlugChange(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Awesome Template"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={templateData.slug || ''}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="my-awesome-template"
            />
            <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={templateData.category || ''}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              <option value="landing-page">Landing Page</option>
              <option value="business-website">Business Website</option>
              <option value="portfolio">Portfolio</option>
              <option value="ecommerce">E-commerce</option>
              <option value="blog">Blog</option>
              <option value="dashboard">Dashboard</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={templateData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your template and its purpose..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={templateData.meta?.tags?.join(', ') || ''}
              onChange={(e) => handleInputChange('meta', {
                ...templateData.meta,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="responsive, modern, business"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated tags for organization</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!templateData.name || !templateData.slug || !templateData.category}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Review & Create
        </button>
      </div>
    </div>
  );
};

// Step 3: Review & Create
const ReviewStep: React.FC<{
  templateData: Partial<TemplateManifest>;
  selectedTemplate: TemplateTemplate;
  onCreate: () => void;
  onBack: () => void;
  isCreating: boolean;
}> = ({ templateData, selectedTemplate, onCreate, onBack, isCreating }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review & Create</h3>
        <p className="text-sm text-gray-600">Review your template configuration before creating</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Template Information</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {templateData.name}</div>
              <div><strong>Slug:</strong> {templateData.slug}</div>
              <div><strong>Category:</strong> {templateData.category}</div>
              <div><strong>Description:</strong> {templateData.description || 'No description'}</div>
              <div><strong>Tags:</strong> {templateData.meta?.tags?.join(', ') || 'No tags'}</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Template Preview</h4>
            <div className="text-center">
              <div className="text-4xl mb-2">{selectedTemplate.preview}</div>
              <div className="font-medium text-gray-900">{selectedTemplate.name}</div>
              <div className="text-sm text-gray-600 mb-3">{selectedTemplate.description}</div>
              
              <div className="text-xs text-gray-500">
                <div><strong>Components:</strong> {selectedTemplate.components.length}</div>
                <div><strong>Features:</strong> {selectedTemplate.features.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isCreating}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onCreate}
          disabled={isCreating}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <span>Create Template</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const TemplateCreationWizard: React.FC<TemplateCreationWizardProps> = ({
  onTemplateCreated,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateData, setTemplateData] = useState<Partial<TemplateManifest>>({});
  const [isCreating, setIsCreating] = useState(false);

  const steps: WizardStep[] = [
    {
      id: 'template-selection',
      title: 'Choose Template',
      description: 'Select a starting template',
      component: TemplateSelectionStep
    },
    {
      id: 'template-details',
      title: 'Template Details',
      description: 'Configure your template',
      component: TemplateDetailsStep
    },
    {
      id: 'review-create',
      title: 'Review & Create',
      description: 'Review and create your template',
      component: ReviewStep
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleTemplateDataChange = (data: Partial<TemplateManifest>) => {
    setTemplateData(data);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    
    try {
      const selectedTemplateData = templateTemplates.find(t => t.id === selectedTemplate);
      if (!selectedTemplateData) {
        throw new Error('Selected template not found');
      }

      const newTemplate: TemplateManifest = {
        id: `tpl_${Date.now()}`,
        name: templateData.name || 'New Template',
        slug: templateData.slug || 'new-template',
        description: templateData.description || '',
        category: templateData.category || 'other',
        components: selectedTemplateData.components.map((comp, index) => ({
          id: `comp_${Date.now()}_${index}`,
          type: comp.type,
          version: '1.0.0',
          order: comp.order,
          props: comp.props
        })),
        theme: { useSiteDefaults: true },
        meta: {
          version: '1.0.0',
          createdBy: 'current_user',
          createdAt: new Date().toISOString().split('T')[0],
          tags: templateData.meta?.tags || [],
          schemaVersion: '1.0.0'
        }
      };

      // Save template
      const templateStorage = getTemplateStorage();
      await templateStorage.saveTemplate(newTemplate, {
        description: 'Created from template wizard',
        isActive: true
      });

      onTemplateCreated(newTemplate);
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Template</h2>
              <p className="text-sm text-gray-600 mt-1">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
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

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 rounded ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <CurrentStepComponent
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            templateData={templateData}
            onTemplateDataChange={handleTemplateDataChange}
            selectedTemplateData={templateTemplates.find(t => t.id === selectedTemplate)}
            onNext={handleNext}
            onBack={handleBack}
            onCreate={handleCreate}
            isCreating={isCreating}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateCreationWizard;
