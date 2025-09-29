/**
 * @fileoverview Template Configuration Interface
 * Interface for managing template configuration schema and customization framework
 * HT-029.1.4 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateConfiguration {
  id: string;
  templateId: string;
  templateName: string;
  version: string;
  schema: ConfigurationSchema;
  variables: TemplateVariable[];
  customizations: CustomizationFramework;
  validation: ValidationRules;
  defaults: DefaultValues;
  status: 'active' | 'draft' | 'deprecated';
  lastModified: Date;
  usageCount: number;
}

interface ConfigurationSchema {
  metadata: SchemaMetadata;
  sections: ConfigurationSection[];
  validation: ValidationSchema;
  dependencies: SchemaDependency[];
}

interface SchemaMetadata {
  name: string;
  version: string;
  description: string;
  tags: string[];
  category: string;
  compatibility: string[];
}

interface ConfigurationSection {
  id: string;
  name: string;
  type: 'basic' | 'advanced' | 'branding' | 'content' | 'behavior' | 'integration';
  description: string;
  fields: ConfigurationField[];
  required: boolean;
  order: number;
  dependencies?: string[];
  conditions?: FieldCondition[];
}

interface ConfigurationField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'file' | 'json' | 'array';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  validation?: FieldValidation;
  options?: FieldOption[];
  placeholder?: string;
  helpText?: string;
  group?: string;
}

interface FieldOption {
  value: any;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
  errorMessage?: string;
}

interface FieldCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}

interface TemplateVariable {
  name: string;
  type: 'static' | 'dynamic' | 'computed' | 'inherited';
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  source: 'configuration' | 'user-input' | 'system' | 'external-api';
  transformation?: VariableTransformation;
  validation?: VariableValidation;
  defaultValue?: any;
  description: string;
  example?: any;
}

interface VariableTransformation {
  type: 'format' | 'calculate' | 'lookup' | 'merge';
  function: string;
  parameters?: Record<string, any>;
}

interface VariableValidation {
  required: boolean;
  rules: ValidationRule[];
  sanitization?: string[];
}

interface ValidationRule {
  type: 'type' | 'range' | 'pattern' | 'custom';
  parameters: any;
  message: string;
}

interface CustomizationFramework {
  themes: ThemeConfiguration[];
  layouts: LayoutConfiguration[];
  components: ComponentCustomization[];
  branding: BrandingConfiguration;
  content: ContentCustomization;
}

interface ThemeConfiguration {
  id: string;
  name: string;
  colors: ColorScheme;
  typography: TypographySettings;
  spacing: SpacingSettings;
  effects: EffectSettings;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string[];
  semantic: SemanticColors;
}

interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface TypographySettings {
  fontFamily: string;
  fontSizes: Record<string, string>;
  fontWeights: Record<string, number>;
  lineHeights: Record<string, number>;
}

interface SpacingSettings {
  scale: Record<string, string>;
  containerPadding: string;
  sectionSpacing: string;
}

interface EffectSettings {
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
}

interface LayoutConfiguration {
  id: string;
  name: string;
  structure: LayoutStructure;
  responsive: ResponsiveSettings;
}

interface LayoutStructure {
  type: 'single-column' | 'multi-column' | 'grid' | 'flex' | 'custom';
  columns?: number;
  areas: LayoutArea[];
}

interface LayoutArea {
  id: string;
  name: string;
  type: 'header' | 'content' | 'sidebar' | 'footer' | 'custom';
  span?: number;
  order?: number;
}

interface ResponsiveSettings {
  breakpoints: Record<string, number>;
  behavior: Record<string, any>;
}

interface ComponentCustomization {
  componentId: string;
  overrides: ComponentOverride[];
  variants: ComponentVariant[];
}

interface ComponentOverride {
  property: string;
  value: any;
  conditions?: any[];
}

interface ComponentVariant {
  name: string;
  overrides: ComponentOverride[];
}

interface BrandingConfiguration {
  logo: BrandAsset;
  favicon: BrandAsset;
  colors: ColorScheme;
  typography: TypographySettings;
  imagery: ImageryGuidelines;
}

interface BrandAsset {
  url?: string;
  alt?: string;
  variants?: BrandAssetVariant[];
}

interface BrandAssetVariant {
  name: string;
  url: string;
  dimensions?: { width: number; height: number };
}

interface ImageryGuidelines {
  style: string;
  filters: string[];
  aspectRatios: string[];
}

interface ContentCustomization {
  copyTone: string;
  messaging: MessagingFramework;
  localization: LocalizationSettings;
}

interface MessagingFramework {
  headlines: string[];
  taglines: string[];
  callsToAction: string[];
}

interface LocalizationSettings {
  languages: string[];
  dateFormats: Record<string, string>;
  numberFormats: Record<string, any>;
}

interface ValidationRules {
  schema: ValidationSchema;
  business: BusinessRule[];
  technical: TechnicalConstraint[];
}

interface ValidationSchema {
  version: string;
  rules: SchemaRule[];
}

interface SchemaRule {
  field: string;
  type: string;
  constraints: any;
  message: string;
}

interface BusinessRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  severity: 'error' | 'warning' | 'info';
}

interface TechnicalConstraint {
  id: string;
  name: string;
  type: 'performance' | 'security' | 'compatibility' | 'accessibility';
  constraint: any;
  impact: 'low' | 'medium' | 'high';
}

interface DefaultValues {
  configuration: Record<string, any>;
  variables: Record<string, any>;
  customizations: Record<string, any>;
}

interface SchemaDependency {
  id: string;
  type: 'template' | 'component' | 'service' | 'integration';
  name: string;
  version: string;
  required: boolean;
}

export default function TemplateConfigurationPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [configurations, setConfigurations] = useState<TemplateConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfigurationData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockConfigurations: TemplateConfiguration[] = [
        {
          id: "config_consultation_mvp",
          templateId: "consultation-mvp",
          templateName: "Consultation MVP",
          version: "2.1.0",
          schema: {
            metadata: {
              name: "Consultation MVP Configuration",
              version: "2.1.0",
              description: "Configuration schema for consultation workflow template",
              tags: ["consultation", "mvp", "business"],
              category: "business-workflow",
              compatibility: ["2.0.0", "2.1.0"]
            },
            sections: [
              {
                id: "basic_info",
                name: "Basic Information",
                type: "basic",
                description: "Basic template configuration settings",
                fields: [
                  {
                    id: "company_name",
                    name: "companyName",
                    type: "text",
                    label: "Company Name",
                    description: "The name of the client company",
                    required: true,
                    placeholder: "Enter company name",
                    validation: { min: 2, max: 100, errorMessage: "Company name must be 2-100 characters" }
                  },
                  {
                    id: "service_description",
                    name: "serviceDescription",
                    type: "text",
                    label: "Service Description",
                    description: "Brief description of consultation services",
                    required: true,
                    placeholder: "Describe your consultation services",
                    validation: { min: 10, max: 500, errorMessage: "Description must be 10-500 characters" }
                  }
                ],
                required: true,
                order: 1
              },
              {
                id: "branding",
                name: "Branding",
                type: "branding",
                description: "Brand colors, fonts, and visual identity",
                fields: [
                  {
                    id: "primary_color",
                    name: "primaryColor",
                    type: "color",
                    label: "Primary Color",
                    description: "Main brand color",
                    required: true,
                    defaultValue: "#6366F1"
                  },
                  {
                    id: "logo_url",
                    name: "logoUrl",
                    type: "file",
                    label: "Logo",
                    description: "Company logo image",
                    required: false,
                    helpText: "Recommended size: 200x60px"
                  }
                ],
                required: false,
                order: 2
              },
              {
                id: "questionnaire",
                name: "Questionnaire Settings",
                type: "content",
                description: "Configuration for the consultation questionnaire",
                fields: [
                  {
                    id: "question_count",
                    name: "questionCount",
                    type: "select",
                    label: "Number of Questions",
                    description: "Total questions in the questionnaire",
                    required: true,
                    defaultValue: "standard",
                    options: [
                      { value: "minimal", label: "Minimal (5-8 questions)" },
                      { value: "standard", label: "Standard (12-15 questions)" },
                      { value: "comprehensive", label: "Comprehensive (20-25 questions)" }
                    ]
                  },
                  {
                    id: "progress_tracking",
                    name: "progressTracking",
                    type: "boolean",
                    label: "Show Progress Bar",
                    description: "Display progress indicator during questionnaire",
                    required: false,
                    defaultValue: true
                  }
                ],
                required: true,
                order: 3
              }
            ],
            validation: {
              version: "1.0.0",
              rules: [
                {
                  field: "companyName",
                  type: "string",
                  constraints: { minLength: 2, maxLength: 100 },
                  message: "Company name is required"
                }
              ]
            },
            dependencies: [
              {
                id: "questionnaire_engine",
                type: "component",
                name: "Questionnaire Engine",
                version: "1.8.0",
                required: true
              }
            ]
          },
          variables: [
            {
              name: "companyName",
              type: "static",
              dataType: "string",
              source: "configuration",
              description: "Company name used throughout the template",
              example: "TechStartup Co"
            },
            {
              name: "brandColors",
              type: "computed",
              dataType: "object",
              source: "configuration",
              transformation: {
                type: "calculate",
                function: "generateColorScheme",
                parameters: { baseColor: "primaryColor" }
              },
              description: "Complete color scheme derived from primary color"
            },
            {
              name: "questionnaireData",
              type: "dynamic",
              dataType: "object",
              source: "user-input",
              validation: {
                required: true,
                rules: [
                  {
                    type: "type",
                    parameters: { type: "object" },
                    message: "Must be a valid questionnaire response object"
                  }
                ]
              },
              description: "User responses from the consultation questionnaire"
            }
          ],
          customizations: {
            themes: [
              {
                id: "professional",
                name: "Professional",
                colors: {
                  primary: "#2563EB",
                  secondary: "#64748B",
                  accent: "#0F172A",
                  neutral: ["#F8FAFC", "#F1F5F9", "#E2E8F0"],
                  semantic: {
                    success: "#059669",
                    warning: "#D97706",
                    error: "#DC2626",
                    info: "#2563EB"
                  }
                },
                typography: {
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSizes: {
                    xs: "0.75rem",
                    sm: "0.875rem",
                    base: "1rem",
                    lg: "1.125rem",
                    xl: "1.25rem"
                  },
                  fontWeights: {
                    normal: 400,
                    medium: 500,
                    semibold: 600,
                    bold: 700
                  },
                  lineHeights: {
                    tight: 1.25,
                    normal: 1.5,
                    relaxed: 1.75
                  }
                },
                spacing: {
                  scale: {
                    xs: "0.5rem",
                    sm: "0.75rem",
                    md: "1rem",
                    lg: "1.5rem",
                    xl: "2rem"
                  },
                  containerPadding: "1rem",
                  sectionSpacing: "2rem"
                },
                effects: {
                  borderRadius: {
                    sm: "0.25rem",
                    md: "0.5rem",
                    lg: "0.75rem"
                  },
                  shadows: {
                    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  },
                  transitions: {
                    fast: "150ms ease",
                    normal: "300ms ease"
                  }
                }
              }
            ],
            layouts: [
              {
                id: "standard",
                name: "Standard Layout",
                structure: {
                  type: "single-column",
                  areas: [
                    { id: "header", name: "Header", type: "header", order: 1 },
                    { id: "content", name: "Main Content", type: "content", order: 2 },
                    { id: "footer", name: "Footer", type: "footer", order: 3 }
                  ]
                },
                responsive: {
                  breakpoints: {
                    sm: 640,
                    md: 768,
                    lg: 1024,
                    xl: 1280
                  },
                  behavior: {
                    sm: { columns: 1 },
                    md: { columns: 1 },
                    lg: { columns: 1 }
                  }
                }
              }
            ],
            components: [
              {
                componentId: "hero-section",
                overrides: [
                  {
                    property: "backgroundColor",
                    value: "{{theme.colors.primary}}"
                  }
                ],
                variants: [
                  {
                    name: "minimal",
                    overrides: [
                      {
                        property: "padding",
                        value: "{{theme.spacing.md}}"
                      }
                    ]
                  }
                ]
              }
            ],
            branding: {
              logo: {
                url: "",
                alt: "Company Logo"
              },
              favicon: {
                url: "",
                alt: "Favicon"
              },
              colors: {
                primary: "#6366F1",
                secondary: "#8B5CF6",
                accent: "#06B6D4",
                neutral: ["#F8FAFC", "#F1F5F9"],
                semantic: {
                  success: "#10B981",
                  warning: "#F59E0B",
                  error: "#EF4444",
                  info: "#3B82F6"
                }
              },
              typography: {
                fontFamily: "'SF Pro Display', system-ui, sans-serif",
                fontSizes: {},
                fontWeights: {},
                lineHeights: {}
              },
              imagery: {
                style: "modern",
                filters: ["high-contrast", "minimal"],
                aspectRatios: ["16:9", "4:3", "1:1"]
              }
            },
            content: {
              copyTone: "professional",
              messaging: {
                headlines: ["Get Expert Business Insights", "Transform Your Business Today"],
                taglines: ["Professional consultation made simple", "Your success is our priority"],
                callsToAction: ["Get Started", "Book Consultation", "Learn More"]
              },
              localization: {
                languages: ["en-US"],
                dateFormats: {
                  "en-US": "MM/DD/YYYY"
                },
                numberFormats: {
                  "en-US": { currency: "USD", decimal: "." }
                }
              }
            }
          },
          validation: {
            schema: {
              version: "1.0.0",
              rules: []
            },
            business: [
              {
                id: "company_name_required",
                name: "Company Name Required",
                description: "Company name must be provided for branding",
                condition: "companyName != null && companyName.length > 0",
                action: "block_generation",
                severity: "error"
              }
            ],
            technical: [
              {
                id: "performance_bundle_size",
                name: "Bundle Size Constraint",
                type: "performance",
                constraint: { maxSize: "500KB" },
                impact: "medium"
              }
            ]
          },
          defaults: {
            configuration: {
              companyName: "",
              serviceDescription: "",
              primaryColor: "#6366F1",
              questionCount: "standard",
              progressTracking: true
            },
            variables: {
              brandColors: null,
              questionnaireData: null
            },
            customizations: {
              theme: "professional",
              layout: "standard"
            }
          },
          status: "active",
          lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          usageCount: 145
        }
      ];

      setConfigurations(mockConfigurations);
      setIsLoading(false);
    };

    loadConfigurationData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'deprecated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSectionTypeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'branding': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'content': return 'bg-green-100 text-green-800 border-green-200';
      case 'behavior': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'integration': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-50 text-blue-700';
      case 'number': return 'bg-green-50 text-green-700';
      case 'boolean': return 'bg-purple-50 text-purple-700';
      case 'select': return 'bg-orange-50 text-orange-700';
      case 'color': return 'bg-pink-50 text-pink-700';
      case 'file': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.round(diffDays / 7)} weeks ago`;
    return `${Math.round(diffDays / 30)} months ago`;
  };

  const filteredConfigurations = configurations.filter(config =>
    filterStatus === "all" || config.status === filterStatus
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black/60">Loading template configuration interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
                Template Configuration
              </h1>
              <p className="text-black/60 mt-2">
                Configuration schema design and customization framework management
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Link href="/template-engine">
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  ← Dashboard
                </Button>
              </Link>
              <Link href="/template-engine/data-flow">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  Data Flow
                </Button>
              </Link>
              <Button className="bg-black text-white hover:bg-gray-800">
                Create Configuration
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Configuration Status Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {["all", "active", "draft", "deprecated"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium uppercase tracking-wide ${
                  filterStatus === status
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/30 hover:border-black/50"
                }`}
              >
                {status} {status !== "all" && `(${configurations.filter(c => c.status === status).length})`}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Configuration Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schema">Configuration Schema</TabsTrigger>
              <TabsTrigger value="variables">Template Variables</TabsTrigger>
              <TabsTrigger value="customization">Customization Framework</TabsTrigger>
              <TabsTrigger value="validation">Validation Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-2 border-black/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-black/60">Total Configurations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-black">{configurations.length}</div>
                    <Badge variant="outline" className="mt-1 text-xs">Schema</Badge>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-600">Active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {configurations.filter(c => c.status === 'active').length}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs border-green-300 text-green-600">Ready</Badge>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-600">Total Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {configurations.reduce((sum, c) => sum + c.usageCount, 0)}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs border-blue-300 text-blue-600">Instances</Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {filteredConfigurations.map((config, index) => (
                  <motion.div
                    key={config.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`cursor-pointer transition-all duration-300 ${selectedConfig === config.id ? 'scale-102' : 'hover:scale-102'}`}
                    onClick={() => setSelectedConfig(selectedConfig === config.id ? null : config.id)}
                  >
                    <Card className={`border-2 border-black/30 hover:border-black/50 ${selectedConfig === config.id ? 'ring-2 ring-black/20 border-black' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{config.templateName}</CardTitle>
                            <CardDescription className="mt-1">
                              Configuration Schema v{config.version} • {config.schema.sections.length} sections • {config.variables.length} variables
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={`${getStatusColor(config.status)} text-xs`}>
                              {config.status}
                            </Badge>
                            <div className="text-xs text-black/60 text-right">
                              Used {config.usageCount} times
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium mb-2">Configuration Sections</div>
                            <div className="flex flex-wrap gap-1">
                              {config.schema.sections.map((section, i) => (
                                <Badge key={i} className={`${getSectionTypeColor(section.type)} text-xs`}>
                                  {section.name} ({section.fields.length})
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="text-xs text-black/60">
                            Last modified {formatTimeAgo(config.lastModified)}
                          </div>

                          {selectedConfig === config.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-4 border-t pt-3"
                            >
                              <div>
                                <div className="text-sm font-medium mb-2">Schema Dependencies</div>
                                <div className="flex flex-wrap gap-1">
                                  {config.schema.dependencies.map((dep, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {dep.name} v{dep.version}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="text-sm font-medium mb-2">Variable Sources</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div>Configuration: {config.variables.filter(v => v.source === 'configuration').length}</div>
                                  <div>User Input: {config.variables.filter(v => v.source === 'user-input').length}</div>
                                  <div>System: {config.variables.filter(v => v.source === 'system').length}</div>
                                  <div>External API: {config.variables.filter(v => v.source === 'external-api').length}</div>
                                </div>
                              </div>

                              <div>
                                <div className="text-sm font-medium mb-2">Customization Framework</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div>Themes: {config.customizations.themes.length}</div>
                                  <div>Layouts: {config.customizations.layouts.length}</div>
                                  <div>Components: {config.customizations.components.length}</div>
                                  <div>Business Rules: {config.validation.business.length}</div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schema" className="mt-6">
              {filteredConfigurations.map((config) => (
                <Card key={config.id} className="border-2 border-black/30 mb-6">
                  <CardHeader>
                    <CardTitle>{config.templateName} Schema</CardTitle>
                    <CardDescription>Configuration sections and field definitions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {config.schema.sections.map((section, index) => (
                        <motion.div
                          key={section.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="p-4 rounded-lg border border-black/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-black">{section.name}</h4>
                                <Badge className={`${getSectionTypeColor(section.type)} text-xs`}>
                                  {section.type}
                                </Badge>
                                {section.required && (
                                  <Badge variant="outline" className="text-xs border-red-300 text-red-600">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-black/60 mt-1">{section.description}</p>
                            </div>
                            <div className="text-sm text-black/60">
                              {section.fields.length} fields
                            </div>
                          </div>

                          <div className="space-y-2">
                            {section.fields.map((field, i) => (
                              <div key={field.id} className="flex items-center justify-between p-2 rounded border border-black/10">
                                <div className="flex items-center gap-3">
                                  <Badge className={`${getFieldTypeColor(field.type)} text-xs`}>
                                    {field.type}
                                  </Badge>
                                  <div>
                                    <div className="font-mono text-sm">{field.name}</div>
                                    <div className="text-xs text-black/60">{field.label}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {field.required && (
                                    <Badge variant="outline" className="text-xs border-red-300 text-red-600">Required</Badge>
                                  )}
                                  {field.defaultValue && (
                                    <div className="text-xs text-green-600">Default: {JSON.stringify(field.defaultValue)}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="variables" className="mt-6">
              {filteredConfigurations.map((config) => (
                <Card key={config.id} className="border-2 border-black/30 mb-6">
                  <CardHeader>
                    <CardTitle>{config.templateName} Variables</CardTitle>
                    <CardDescription>Template variable system and data transformations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {config.variables.map((variable, index) => (
                        <motion.div
                          key={variable.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between p-3 rounded-lg border border-black/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-sm font-medium text-black">{variable.name}</div>
                            <Badge className={`${getFieldTypeColor(variable.dataType)} text-xs`}>
                              {variable.dataType}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {variable.source}
                            </Badge>
                            {variable.type === 'computed' && (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">Computed</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-black/70">{variable.description}</div>
                            {variable.example && (
                              <div className="text-xs text-green-600 mt-1">Example: {JSON.stringify(variable.example)}</div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="customization" className="mt-6">
              {filteredConfigurations.map((config) => (
                <div key={config.id} className="space-y-6">
                  <Card className="border-2 border-black/30">
                    <CardHeader>
                      <CardTitle>Customization Framework</CardTitle>
                      <CardDescription>Themes, layouts, and component customizations for {config.templateName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm font-medium mb-3">Available Themes</div>
                          <div className="space-y-2">
                            {config.customizations.themes.map((theme, i) => (
                              <div key={theme.id} className="p-3 rounded border border-black/20">
                                <div className="font-medium text-sm">{theme.name}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex gap-1">
                                    <div
                                      className="w-4 h-4 rounded border border-black/20"
                                      style={{ backgroundColor: theme.colors.primary }}
                                      title="Primary"
                                    />
                                    <div
                                      className="w-4 h-4 rounded border border-black/20"
                                      style={{ backgroundColor: theme.colors.secondary }}
                                      title="Secondary"
                                    />
                                    <div
                                      className="w-4 h-4 rounded border border-black/20"
                                      style={{ backgroundColor: theme.colors.accent }}
                                      title="Accent"
                                    />
                                  </div>
                                  <div className="text-xs text-black/60">{theme.typography.fontFamily}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-3">Layout Options</div>
                          <div className="space-y-2">
                            {config.customizations.layouts.map((layout, i) => (
                              <div key={layout.id} className="p-3 rounded border border-black/20">
                                <div className="font-medium text-sm">{layout.name}</div>
                                <div className="text-xs text-black/60 mt-1">
                                  {layout.structure.type} • {layout.structure.areas.length} areas
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {layout.structure.areas.map((area, j) => (
                                    <Badge key={j} variant="outline" className="text-xs">
                                      {area.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-black/30">
                    <CardHeader>
                      <CardTitle>Branding Configuration</CardTitle>
                      <CardDescription>Brand identity settings and guidelines</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <div className="text-sm font-medium mb-3">Color Scheme</div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded border border-black/20"
                                style={{ backgroundColor: config.customizations.branding.colors.primary }}
                              />
                              <span className="text-sm">Primary: {config.customizations.branding.colors.primary}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded border border-black/20"
                                style={{ backgroundColor: config.customizations.branding.colors.secondary }}
                              />
                              <span className="text-sm">Secondary: {config.customizations.branding.colors.secondary}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-3">Typography</div>
                          <div className="text-sm">
                            <div>Font: {config.customizations.branding.typography.fontFamily}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-3">Content Strategy</div>
                          <div className="text-sm">
                            <div>Tone: {config.customizations.content.copyTone}</div>
                            <div className="mt-2">
                              <div className="text-xs text-black/60 mb-1">Sample CTAs:</div>
                              <div className="flex flex-wrap gap-1">
                                {config.customizations.content.messaging.callsToAction.slice(0, 2).map((cta, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{cta}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="validation" className="mt-6">
              {filteredConfigurations.map((config) => (
                <div key={config.id} className="space-y-6">
                  <Card className="border-2 border-black/30">
                    <CardHeader>
                      <CardTitle>Business Rules</CardTitle>
                      <CardDescription>Business logic validation rules for {config.templateName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {config.validation.business.map((rule, index) => (
                          <motion.div
                            key={rule.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center justify-between p-3 rounded-lg border border-black/20"
                          >
                            <div>
                              <div className="font-medium text-sm">{rule.name}</div>
                              <div className="text-xs text-black/60 mt-1">{rule.description}</div>
                              <div className="font-mono text-xs text-blue-600 mt-1">{rule.condition}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${
                                rule.severity === 'error' ? 'bg-red-100 text-red-800 border-red-200' :
                                rule.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-blue-100 text-blue-800 border-blue-200'
                              }`}>
                                {rule.severity}
                              </Badge>
                              <div className="text-xs text-black/60">{rule.action}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-black/30">
                    <CardHeader>
                      <CardTitle>Technical Constraints</CardTitle>
                      <CardDescription>Performance, security, and compatibility constraints</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {config.validation.technical.map((constraint, index) => (
                          <motion.div
                            key={constraint.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center justify-between p-3 rounded-lg border border-black/20"
                          >
                            <div>
                              <div className="font-medium text-sm">{constraint.name}</div>
                              <div className="text-xs text-black/60 mt-1">{constraint.type}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${
                                constraint.impact === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                                constraint.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-green-100 text-green-800 border-green-200'
                              }`}>
                                {constraint.impact} impact
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}