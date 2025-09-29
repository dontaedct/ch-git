/**
 * @fileoverview Template Customization Interface
 * Advanced template customization with content editing and personalization
 * HT-029.3.3 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Palette,
  Type,
  Layout,
  Image,
  Save,
  Eye,
  Undo,
  Redo,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Zap,
  Paintbrush,
  Layers,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Plus,
  Trash2,
  Edit3,
  MousePointer,
  Smartphone,
  Tablet,
  Monitor,
  Contrast,
  Sun,
  Moon
} from "lucide-react";

interface TemplateSection {
  id: string;
  name: string;
  type: 'header' | 'hero' | 'features' | 'testimonials' | 'contact' | 'footer';
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    buttonText?: string;
    buttonLink?: string;
    items?: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  styling: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    margin: string;
    borderRadius: string;
    boxShadow: string;
    layout: 'single' | 'two-column' | 'three-column' | 'grid';
    alignment: 'left' | 'center' | 'right';
    fontSize: string;
    fontWeight: string;
  };
  visible: boolean;
  order: number;
}

interface CustomTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    bodyFont: string;
    sizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    weights: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

interface TemplateCustomization {
  id: string;
  name: string;
  description: string;
  template: 'landing' | 'questionnaire' | 'results';
  theme: CustomTheme;
  sections: TemplateSection[];
  globalSettings: {
    favicon: string;
    metaTitle: string;
    metaDescription: string;
    socialImage: string;
    analytics: string;
    customCSS: string;
    customJS: string;
  };
  branding: {
    logo: string;
    logoPosition: 'left' | 'center' | 'right';
    companyName: string;
    tagline: string;
    contactInfo: {
      email: string;
      phone: string;
      address: string;
      website: string;
    };
  };
  responsiveSettings: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  };
}

export default function TemplateCustomizationInterface() {
  const [activeCustomization, setActiveCustomization] = useState<TemplateCustomization | null>(null);
  const [selectedSection, setSelectedSection] = useState<TemplateSection | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentTab, setCurrentTab] = useState("content");
  const [devicePreview, setDevicePreview] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [historyStack, setHistoryStack] = useState<TemplateCustomization[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Sample template customization data
  const [customizations] = useState<TemplateCustomization[]>([
    {
      id: 'consultation-landing',
      name: 'Business Consultation Landing',
      description: 'Customizable landing page for business consultation services',
      template: 'landing',
      theme: {
        id: 'professional-blue',
        name: 'Professional Blue',
        description: 'Clean, professional theme with blue accents',
        colors: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#F59E0B',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          text: '#1F2937',
          textSecondary: '#6B7280',
          border: '#E5E7EB',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        },
        typography: {
          fontFamily: 'Inter',
          headingFont: 'Inter',
          bodyFont: 'Inter',
          sizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem'
          },
          weights: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          full: '9999px'
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
        }
      },
      sections: [
        {
          id: 'hero',
          name: 'Hero Section',
          type: 'hero',
          content: {
            title: 'Transform Your Business with Expert Consultation',
            subtitle: 'Get personalized insights and actionable strategies to grow your business',
            description: 'Our experienced consultants help businesses like yours overcome challenges and achieve sustainable growth.',
            buttonText: 'Start Free Consultation',
            buttonLink: '/questionnaire'
          },
          styling: {
            backgroundColor: '#FFFFFF',
            textColor: '#1F2937',
            padding: '4rem 2rem',
            margin: '0',
            borderRadius: '0',
            boxShadow: 'none',
            layout: 'single',
            alignment: 'center',
            fontSize: '1rem',
            fontWeight: '400'
          },
          visible: true,
          order: 1
        },
        {
          id: 'features',
          name: 'Features Section',
          type: 'features',
          content: {
            title: 'Why Choose Our Consultation Service',
            subtitle: 'Proven expertise that delivers results',
            items: [
              {
                title: 'Expert Analysis',
                description: 'Get insights from industry experts with 10+ years of experience',
                icon: 'target'
              },
              {
                title: 'Proven Results',
                description: 'Join 500+ businesses that have increased their revenue by 40%',
                icon: 'chart'
              },
              {
                title: '100% Free',
                description: 'No hidden costs or commitments. Get valuable insights at no charge',
                icon: 'shield'
              }
            ]
          },
          styling: {
            backgroundColor: '#F8FAFC',
            textColor: '#1F2937',
            padding: '3rem 2rem',
            margin: '0',
            borderRadius: '0',
            boxShadow: 'none',
            layout: 'three-column',
            alignment: 'center',
            fontSize: '1rem',
            fontWeight: '400'
          },
          visible: true,
          order: 2
        },
        {
          id: 'testimonials',
          name: 'Testimonials',
          type: 'testimonials',
          content: {
            title: 'What Our Clients Say',
            subtitle: 'Real results from real businesses',
            items: [
              {
                title: 'Sarah Johnson - CEO, TechStart Inc',
                description: 'The consultation revealed opportunities I never considered. Revenue increased 60% in 6 months!'
              },
              {
                title: 'Michael Chen - Founder, GrowthCo',
                description: 'Actionable strategies that actually work. Best business decision I made this year.'
              }
            ]
          },
          styling: {
            backgroundColor: '#FFFFFF',
            textColor: '#1F2937',
            padding: '3rem 2rem',
            margin: '0',
            borderRadius: '0',
            boxShadow: 'none',
            layout: 'two-column',
            alignment: 'center',
            fontSize: '1rem',
            fontWeight: '400'
          },
          visible: true,
          order: 3
        }
      ],
      globalSettings: {
        favicon: '/favicon.ico',
        metaTitle: 'Business Consultation - Transform Your Business',
        metaDescription: 'Get expert business consultation and actionable strategies to grow your business. Free consultation available.',
        socialImage: '/social-image.jpg',
        analytics: '',
        customCSS: '',
        customJS: ''
      },
      branding: {
        logo: '',
        logoPosition: 'left',
        companyName: 'Business Solutions',
        tagline: 'Your Growth Partner',
        contactInfo: {
          email: 'contact@businesssolutions.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business St, Suite 100, City, State 12345',
          website: 'https://businesssolutions.com'
        }
      },
      responsiveSettings: {
        mobile: true,
        tablet: true,
        desktop: true,
        breakpoints: {
          mobile: '768px',
          tablet: '1024px',
          desktop: '1280px'
        }
      }
    }
  ]);

  useEffect(() => {
    if (customizations.length > 0) {
      setActiveCustomization(customizations[0]);
      setHistoryStack([customizations[0]]);
      setHistoryIndex(0);
    }
  }, [customizations]);

  const handleSave = async () => {
    if (!activeCustomization) return;

    setIsSaving(true);

    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add to history
    const newHistory = [...historyStack.slice(0, historyIndex + 1), activeCustomization];
    setHistoryStack(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setIsSaving(false);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setActiveCustomization(historyStack[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setActiveCustomization(historyStack[historyIndex + 1]);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
    if (!activeCustomization) return;

    const updatedSections = activeCustomization.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );

    setActiveCustomization({
      ...activeCustomization,
      sections: updatedSections
    });
  };

  const addSection = () => {
    if (!activeCustomization) return;

    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      name: 'New Section',
      type: 'features',
      content: {
        title: 'Section Title',
        subtitle: 'Section subtitle',
        description: 'Section description'
      },
      styling: {
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        padding: '2rem',
        margin: '0',
        borderRadius: '0',
        boxShadow: 'none',
        layout: 'single',
        alignment: 'center',
        fontSize: '1rem',
        fontWeight: '400'
      },
      visible: true,
      order: activeCustomization.sections.length + 1
    };

    setActiveCustomization({
      ...activeCustomization,
      sections: [...activeCustomization.sections, newSection]
    });
  };

  const removeSection = (sectionId: string) => {
    if (!activeCustomization) return;

    const updatedSections = activeCustomization.sections.filter(s => s.id !== sectionId);
    setActiveCustomization({
      ...activeCustomization,
      sections: updatedSections
    });

    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
  };

  const duplicateSection = (section: TemplateSection) => {
    if (!activeCustomization) return;

    const duplicated = {
      ...section,
      id: `section-${Date.now()}`,
      name: `${section.name} (Copy)`,
      order: activeCustomization.sections.length + 1
    };

    setActiveCustomization({
      ...activeCustomization,
      sections: [...activeCustomization.sections, duplicated]
    });
  };

  const getPreviewWidth = () => {
    switch (devicePreview) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  const renderSectionEditor = () => {
    if (!selectedSection) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Edit: {selectedSection.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSection(null)}
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="styling">Styling</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section Name</label>
                <input
                  type="text"
                  value={selectedSection.name}
                  onChange={(e) => updateSection(selectedSection.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedSection.content.title !== undefined && (
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={selectedSection.content.title || ''}
                    onChange={(e) => updateSection(selectedSection.id, {
                      content: { ...selectedSection.content, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {selectedSection.content.subtitle !== undefined && (
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={selectedSection.content.subtitle || ''}
                    onChange={(e) => updateSection(selectedSection.id, {
                      content: { ...selectedSection.content, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {selectedSection.content.description !== undefined && (
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <div className="border border-gray-300 rounded-md">
                    {/* Rich Text Editor Toolbar */}
                    <div className="flex items-center space-x-2 p-2 border-b border-gray-200 bg-gray-50">
                      <Button variant="ghost" size="sm">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Underline className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      <Button variant="ghost" size="sm">
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={selectedSection.content.description || ''}
                      onChange={(e) => updateSection(selectedSection.id, {
                        content: { ...selectedSection.content, description: e.target.value }
                      })}
                      rows={4}
                      className="border-0 focus:ring-0 resize-none"
                      placeholder="Enter section description with rich formatting..."
                    />
                  </div>
                </div>
              )}

              {selectedSection.content.buttonText !== undefined && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Button Text</label>
                    <input
                      type="text"
                      value={selectedSection.content.buttonText || ''}
                      onChange={(e) => updateSection(selectedSection.id, {
                        content: { ...selectedSection.content, buttonText: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Button Link</label>
                    <input
                      type="text"
                      value={selectedSection.content.buttonLink || ''}
                      onChange={(e) => updateSection(selectedSection.id, {
                        content: { ...selectedSection.content, buttonLink: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Image Upload for sections */}
              <div>
                <label className="block text-sm font-medium mb-2">Section Image (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drop an image here or click to upload
                  </p>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="styling" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <input
                    type="color"
                    value={selectedSection.styling.backgroundColor}
                    onChange={(e) => updateSection(selectedSection.id, {
                      styling: { ...selectedSection.styling, backgroundColor: e.target.value }
                    })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Text Color</label>
                  <input
                    type="color"
                    value={selectedSection.styling.textColor}
                    onChange={(e) => updateSection(selectedSection.id, {
                      styling: { ...selectedSection.styling, textColor: e.target.value }
                    })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Layout</label>
                <select
                  value={selectedSection.styling.layout}
                  onChange={(e) => updateSection(selectedSection.id, {
                    styling: { ...selectedSection.styling, layout: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="single">Single Column</option>
                  <option value="two-column">Two Columns</option>
                  <option value="three-column">Three Columns</option>
                  <option value="grid">Grid Layout</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Text Alignment</label>
                <div className="flex space-x-2">
                  {['left', 'center', 'right'].map((align) => (
                    <Button
                      key={align}
                      variant={selectedSection.styling.alignment === align ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSection(selectedSection.id, {
                        styling: { ...selectedSection.styling, alignment: align as any }
                      })}
                    >
                      {align === 'left' && <AlignLeft className="h-4 w-4" />}
                      {align === 'center' && <AlignCenter className="h-4 w-4" />}
                      {align === 'right' && <AlignRight className="h-4 w-4" />}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Padding</label>
                <input
                  type="text"
                  value={selectedSection.styling.padding}
                  onChange={(e) => updateSection(selectedSection.id, {
                    styling: { ...selectedSection.styling, padding: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2rem, 1rem 2rem, etc."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedSection.visible}
                  onCheckedChange={(checked) => updateSection(selectedSection.id, { visible: checked })}
                />
                <label className="text-sm font-medium">Section Visible</label>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  const renderPreview = () => {
    if (!activeCustomization) return null;

    return (
      <div
        ref={canvasRef}
        className="bg-white border rounded-lg overflow-hidden"
        style={{ width: getPreviewWidth(), minHeight: '600px' }}
      >
        {activeCustomization.sections
          .filter(section => section.visible)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div
              key={section.id}
              className={`cursor-pointer transition-all ${
                selectedSection?.id === section.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                backgroundColor: section.styling.backgroundColor,
                color: section.styling.textColor,
                padding: section.styling.padding,
                textAlign: section.styling.alignment
              }}
              onClick={() => setSelectedSection(section)}
            >
              {section.content.title && (
                <h2 className="text-2xl font-bold mb-2">{section.content.title}</h2>
              )}
              {section.content.subtitle && (
                <p className="text-lg text-gray-600 mb-4">{section.content.subtitle}</p>
              )}
              {section.content.description && (
                <p className="mb-4">{section.content.description}</p>
              )}
              {section.content.buttonText && (
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  style={{ backgroundColor: activeCustomization.theme.colors.primary }}
                >
                  {section.content.buttonText}
                </button>
              )}
              {section.content.items && (
                <div className={`grid gap-4 ${
                  section.styling.layout === 'two-column' ? 'grid-cols-2' :
                  section.styling.layout === 'three-column' ? 'grid-cols-3' :
                  section.styling.layout === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'
                }`}>
                  {section.content.items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    );
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Template Preview</h1>
            <div className="flex space-x-4">
              <div className="flex space-x-2">
                {(['mobile', 'tablet', 'desktop'] as const).map((device) => (
                  <Button
                    key={device}
                    variant={devicePreview === device ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDevicePreview(device)}
                  >
                    {device === 'mobile' && <Smartphone className="h-4 w-4" />}
                    {device === 'tablet' && <Tablet className="h-4 w-4" />}
                    {device === 'desktop' && <Monitor className="h-4 w-4" />}
                  </Button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                Exit Preview
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            {renderPreview()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Template Customization</h1>
              <p className="text-gray-600 mt-1">
                Customize your templates with advanced editing tools and theme options
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= historyStack.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setPreviewMode(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Link href="/template-engine/themes">
                <Button variant="outline">
                  <Palette className="h-4 w-4 mr-2" />
                  Browse Themes
                </Button>
              </Link>
              <Link href="/template-engine">
                <Button variant="outline">Back to Engine</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Sections List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Sections</h2>
                  <Button onClick={addSection} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                <div className="space-y-3">
                  {activeCustomization?.sections.map((section) => (
                    <motion.div
                      key={section.id}
                      layout
                      className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                        selectedSection?.id === section.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSection(section)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <MousePointer className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{section.name}</span>
                          </div>
                          {!section.visible && (
                            <Badge variant="secondary" className="text-xs">Hidden</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSection(section);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSection(section.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {section.content.title || 'No title'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Section Editor */}
              <div className="space-y-4">
                {selectedSection ? (
                  renderSectionEditor()
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">Select a Section</h3>
                      <p className="text-sm text-gray-600">
                        Click on a section to edit its content and styling
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Live Preview</h2>
                  <div className="flex space-x-2">
                    {(['mobile', 'tablet', 'desktop'] as const).map((device) => (
                      <Button
                        key={device}
                        variant={devicePreview === device ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDevicePreview(device)}
                      >
                        {device === 'mobile' && <Smartphone className="h-4 w-4" />}
                        {device === 'tablet' && <Tablet className="h-4 w-4" />}
                        {device === 'desktop' && <Monitor className="h-4 w-4" />}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg bg-gray-100 p-4 overflow-auto" style={{ height: '600px' }}>
                  {renderPreview()}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="styling" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Color Scheme</span>
                  </CardTitle>
                  <CardDescription>
                    Customize the color palette for your template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeCustomization && (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(activeCustomization.theme.colors).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium mb-2 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => {
                                setActiveCustomization({
                                  ...activeCustomization,
                                  theme: {
                                    ...activeCustomization.theme,
                                    colors: {
                                      ...activeCustomization.theme.colors,
                                      [key]: e.target.value
                                    }
                                  }
                                });
                              }}
                              className="w-12 h-8 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => {
                                setActiveCustomization({
                                  ...activeCustomization,
                                  theme: {
                                    ...activeCustomization.theme,
                                    colors: {
                                      ...activeCustomization.theme.colors,
                                      [key]: e.target.value
                                    }
                                  }
                                });
                              }}
                              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Type className="h-5 w-5" />
                    <span>Typography</span>
                  </CardTitle>
                  <CardDescription>
                    Configure fonts and text styling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Font Family</label>
                    <select
                      value={activeCustomization?.theme.typography.fontFamily}
                      onChange={(e) => {
                        if (activeCustomization) {
                          setActiveCustomization({
                            ...activeCustomization,
                            theme: {
                              ...activeCustomization.theme,
                              typography: {
                                ...activeCustomization.theme.typography,
                                fontFamily: e.target.value
                              }
                            }
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Heading Font</label>
                      <select
                        value={activeCustomization?.theme.typography.headingFont}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Body Font</label>
                      <select
                        value={activeCustomization?.theme.typography.bodyFont}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Source Sans Pro">Source Sans Pro</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Identity</CardTitle>
                  <CardDescription>
                    Configure your brand elements and identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <input
                      type="text"
                      value={activeCustomization?.branding.companyName}
                      onChange={(e) => {
                        if (activeCustomization) {
                          setActiveCustomization({
                            ...activeCustomization,
                            branding: {
                              ...activeCustomization.branding,
                              companyName: e.target.value
                            }
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tagline</label>
                    <input
                      type="text"
                      value={activeCustomization?.branding.tagline}
                      onChange={(e) => {
                        if (activeCustomization) {
                          setActiveCustomization({
                            ...activeCustomization,
                            branding: {
                              ...activeCustomization.branding,
                              tagline: e.target.value
                            }
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Logo Position</label>
                    <select
                      value={activeCustomization?.branding.logoPosition}
                      onChange={(e) => {
                        if (activeCustomization) {
                          setActiveCustomization({
                            ...activeCustomization,
                            branding: {
                              ...activeCustomization.branding,
                              logoPosition: e.target.value as any
                            }
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Logo Upload</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Drop your logo here or click to upload
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Set up your business contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={activeCustomization?.branding.contactInfo.email}
                      onChange={(e) => {
                        if (activeCustomization) {
                          setActiveCustomization({
                            ...activeCustomization,
                            branding: {
                              ...activeCustomization.branding,
                              contactInfo: {
                                ...activeCustomization.branding.contactInfo,
                                email: e.target.value
                              }
                            }
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={activeCustomization?.branding.contactInfo.phone}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      value={activeCustomization?.branding.contactInfo.website}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <Textarea
                      value={activeCustomization?.branding.contactInfo.address}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Meta Settings</CardTitle>
                  <CardDescription>
                    Configure SEO and social media settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Page Title</label>
                    <input
                      type="text"
                      value={activeCustomization?.globalSettings.metaTitle}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Description</label>
                    <Textarea
                      value={activeCustomization?.globalSettings.metaDescription}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Analytics Code</label>
                    <Textarea
                      value={activeCustomization?.globalSettings.analytics}
                      rows={2}
                      placeholder="Google Analytics tracking code"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Responsive Settings</CardTitle>
                  <CardDescription>
                    Configure responsive behavior and breakpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch checked={activeCustomization?.responsiveSettings.mobile} />
                      <label className="text-sm font-medium">Mobile Optimization</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={activeCustomization?.responsiveSettings.tablet} />
                      <label className="text-sm font-medium">Tablet Optimization</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={activeCustomization?.responsiveSettings.desktop} />
                      <label className="text-sm font-medium">Desktop Optimization</label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Mobile Breakpoint</label>
                      <input
                        type="text"
                        value={activeCustomization?.responsiveSettings.breakpoints.mobile}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tablet Breakpoint</label>
                      <input
                        type="text"
                        value={activeCustomization?.responsiveSettings.breakpoints.tablet}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Status</CardTitle>
                  <CardDescription>
                    Template customization system status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Theme System</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Content Editor</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Live Preview</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}