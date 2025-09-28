/**
 * @fileoverview Template Engine Interface
 * Template management system with 8 custom micro-app templates
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { TemplateCreationWizard } from "@/components/template-builder/TemplateCreationWizard";
import { TemplateMarketplace } from "@/components/template-builder/TemplateMarketplace";
import { getTemplateStorage } from "@/lib/template-storage/TemplateStorage";
import { TemplateManifest } from "@/types/componentContracts";

// Template Interface
interface Template {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'ecommerce' | 'portfolio' | 'dashboard' | 'landing';
  preview: string;
  features: string[];
  deploymentTime: string;
  usageCount: number;
  lastUsed: string;
  status: 'active' | 'draft' | 'archived';
  customization: {
    colors: number;
    layouts: number;
    components: number;
  };
}

// Template Category
interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

export default function TemplateEnginePage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories] = useState<TemplateCategory[]>([
    { id: 'all', name: 'All Templates', description: 'View all available templates', count: 8 },
    { id: 'business', name: 'Business', description: 'Corporate and business applications', count: 2 },
    { id: 'ecommerce', name: 'E-Commerce', description: 'Online store and shopping platforms', count: 2 },
    { id: 'portfolio', name: 'Portfolio', description: 'Personal and professional portfolios', count: 1 },
    { id: 'dashboard', name: 'Dashboard', description: 'Analytics and management dashboards', count: 2 },
    { id: 'landing', name: 'Landing', description: 'Marketing and promotional pages', count: 1 }
  ]);

  // Load templates from storage
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templateStorage = getTemplateStorage();
      const templateVersions = await templateStorage.getAllTemplates();
      
      // Convert template versions to template interface
      const convertedTemplates: Template[] = templateVersions.map(version => ({
        id: version.manifest.id,
        name: version.manifest.name,
        description: version.manifest.description || '',
        category: version.manifest.category as any,
        preview: `/api/templates/${version.manifest.slug}/preview`,
        features: version.manifest.components.map(comp => comp.type),
        deploymentTime: '1-2 days',
        usageCount: 0, // Would be tracked separately
        lastUsed: version.createdAt,
        status: version.isActive ? 'active' : 'draft',
        customization: {
          colors: 8,
          layouts: 4,
          components: version.manifest.components.length
        }
      }));

      setTemplates(convertedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Fallback to mock data
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  };

  const mockTemplates: Template[] = [
    {
      id: '1',
      name: 'CRM Dashboard',
      description: 'Complete customer relationship management dashboard with analytics and pipeline tracking',
      category: 'dashboard',
      preview: '/api/templates/crm-dashboard/preview',
      features: ['Customer Management', 'Sales Pipeline', 'Analytics Dashboard', 'Task Management', 'Reporting'],
      deploymentTime: '2-3 days',
      usageCount: 24,
      lastUsed: '2 hours ago',
      status: 'active',
      customization: { colors: 12, layouts: 4, components: 28 }
    },
    {
      id: '2',
      name: 'E-Commerce Store',
      description: 'Full-featured online store with product catalog, cart, and payment processing',
      category: 'ecommerce',
      preview: '/api/templates/ecommerce-store/preview',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Order Management', 'Inventory'],
      deploymentTime: '3-4 days',
      usageCount: 18,
      lastUsed: '1 day ago',
      status: 'active',
      customization: { colors: 8, layouts: 6, components: 35 }
    },
    {
      id: '3',
      name: 'Business Portfolio',
      description: 'Professional business portfolio with project showcase and contact forms',
      category: 'portfolio',
      preview: '/api/templates/business-portfolio/preview',
      features: ['Project Gallery', 'About Section', 'Contact Forms', 'Testimonials', 'Blog'],
      deploymentTime: '1-2 days',
      usageCount: 31,
      lastUsed: '3 hours ago',
      status: 'active',
      customization: { colors: 6, layouts: 3, components: 18 }
    },
    {
      id: '4',
      name: 'Lead Capture Landing',
      description: 'High-conversion landing page optimized for lead generation and marketing campaigns',
      category: 'landing',
      preview: '/api/templates/lead-capture/preview',
      features: ['Hero Section', 'Lead Forms', 'Social Proof', 'Feature Highlights', 'CTA Optimization'],
      deploymentTime: '1 day',
      usageCount: 42,
      lastUsed: '30 min ago',
      status: 'active',
      customization: { colors: 4, layouts: 2, components: 12 }
    },
    {
      id: '5',
      name: 'Service Business Hub',
      description: 'Complete service business platform with booking, scheduling, and client management',
      category: 'business',
      preview: '/api/templates/service-business/preview',
      features: ['Appointment Booking', 'Service Catalog', 'Client Portal', 'Payment Processing', 'Calendar'],
      deploymentTime: '4-5 days',
      usageCount: 15,
      lastUsed: '2 days ago',
      status: 'active',
      customization: { colors: 10, layouts: 5, components: 32 }
    },
    {
      id: '6',
      name: 'Analytics Dashboard',
      description: 'Data visualization dashboard with charts, metrics, and real-time monitoring',
      category: 'dashboard',
      preview: '/api/templates/analytics-dashboard/preview',
      features: ['Data Visualization', 'Real-time Metrics', 'Custom Reports', 'Alert System', 'Export Tools'],
      deploymentTime: '2-3 days',
      usageCount: 27,
      lastUsed: '4 hours ago',
      status: 'active',
      customization: { colors: 8, layouts: 3, components: 22 }
    },
    {
      id: '7',
      name: 'Restaurant Ordering',
      description: 'Online food ordering system with menu management and delivery tracking',
      category: 'ecommerce',
      preview: '/api/templates/restaurant-ordering/preview',
      features: ['Digital Menu', 'Order Management', 'Delivery Tracking', 'Payment Gateway', 'Customer Reviews'],
      deploymentTime: '3-4 days',
      usageCount: 12,
      lastUsed: '1 week ago',
      status: 'active',
      customization: { colors: 6, layouts: 4, components: 24 }
    },
    {
      id: '8',
      name: 'Corporate Website',
      description: 'Professional corporate website with company information and contact features',
      category: 'business',
      preview: '/api/templates/corporate-website/preview',
      features: ['Company Pages', 'News Section', 'Contact Forms', 'Team Profiles', 'Career Portal'],
      deploymentTime: '2-3 days',
      usageCount: 19,
      lastUsed: '5 days ago',
      status: 'active',
      customization: { colors: 8, layouts: 4, components: 26 }
    }
  ];

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(template => template.category === activeCategory);

  useEffect(() => {
    setMounted(true);
    loadTemplates();
  }, []);

  // Handle template creation
  const handleTemplateCreated = (template: TemplateManifest) => {
    // Reload templates to include the new one
    loadTemplates();
    setShowCreationWizard(false);
    
    // Optionally redirect to template builder
    // router.push(`/agency-toolkit/templates/builder?id=${template.id}`);
  };

  // Handle template actions
  const handleTemplateAction = async (templateId: string, action: string) => {
    try {
      const templateStorage = getTemplateStorage();
      
      switch (action) {
        case 'duplicate':
          const originalTemplate = await templateStorage.loadTemplate(templateId);
          if (originalTemplate) {
            const duplicated = await templateStorage.duplicateTemplate(
              templateId,
              `${originalTemplate.name} (Copy)`,
              `${originalTemplate.slug}-copy`
            );
            if (duplicated) {
              loadTemplates();
              alert('Template duplicated successfully!');
            }
          }
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this template?')) {
            await templateStorage.deleteTemplate(templateId);
            loadTemplates();
            alert('Template deleted successfully!');
          }
          break;
        case 'export':
          const exported = await templateStorage.exportTemplate(templateId, 'json');
          const blob = new Blob([exported], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `template-${templateId}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} template:`, error);
      alert(`Failed to ${action} template. Please try again.`);
    }
  };

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b-2 transition-all duration-300",
        isDark ? "border-white/30" : "border-black/30"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-wide uppercase">
                Template Engine Interface
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                8 custom micro-app templates for rapid deployment
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/agency-toolkit"
                className={cn(
                  "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                ← Back to Toolkit
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Template Statistics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Total Templates", value: templates.length, color: "blue" },
              { label: "Active Templates", value: templates.filter(t => t.status === 'active').length, color: "green" },
              { label: "Total Deployments", value: templates.reduce((sum, t) => sum + t.usageCount, 0), color: "yellow" },
              { label: "Avg Deployment", value: "2.5 days", color: "purple" }
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all duration-300",
                  isDark
                    ? "bg-black/5 border-white/30 hover:border-white/50"
                    : "bg-white/5 border-black/30 hover:border-black/50"
                )}
              >
                <div className="text-sm font-medium uppercase tracking-wide opacity-70">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
              </div>
            ))}
          </motion.div>

          {/* Category Navigation */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                  activeCategory === category.id
                    ? isDark
                      ? "bg-white/10 border-white/50"
                      : "bg-black/10 border-black/50"
                    : isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                )}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </motion.div>

          {/* Template Grid */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "p-6 rounded-lg border-2 transition-all duration-300",
              isDark
                ? "bg-black/5 border-white/30"
                : "bg-white/5 border-black/30"
            )}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-wide uppercase">
                {activeCategory === 'all' ? 'All Templates' : categories.find(c => c.id === activeCategory)?.name}
                ({filteredTemplates.length})
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowMarketplace(true)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                    "hover:scale-105",
                    isDark
                      ? "border-green-500/30 hover:border-green-500/50 text-green-400"
                      : "border-green-500/30 hover:border-green-500/50 text-green-600"
                  )}
                >
                  Browse Marketplace
                </button>
                <button
                  onClick={() => setShowCreationWizard(true)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                    "hover:scale-105",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                >
                  Create New Template
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                    "hover:scale-105",
                    isDark
                      ? "border-white/30 hover:border-white/50 hover:bg-white/10"
                      : "border-black/30 hover:border-black/50 hover:bg-black/10"
                  )}
                  onClick={() => setSelectedTemplate(template)}
                >
                  {/* Template Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold tracking-wide uppercase text-lg">
                        {template.name}
                      </h3>
                      <p className="text-sm opacity-70 mt-1">
                        {template.description}
                      </p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium uppercase",
                      template.status === 'active' && "bg-green-500/20 text-green-500",
                      template.status === 'draft' && "bg-yellow-500/20 text-yellow-500",
                      template.status === 'archived' && "bg-gray-500/20 text-gray-500"
                    )}>
                      {template.status}
                    </span>
                  </div>

                  {/* Template Preview */}
                  <div className={cn(
                    "mb-4 h-32 rounded-lg border-2 flex items-center justify-center",
                    isDark ? "bg-white/5 border-white/20" : "bg-black/5 border-black/20"
                  )}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {template.category === 'dashboard' && '📊'}
                        {template.category === 'ecommerce' && '🛍️'}
                        {template.category === 'portfolio' && '💼'}
                        {template.category === 'landing' && '🚀'}
                        {template.category === 'business' && '🏢'}
                      </div>
                      <div className="text-xs opacity-70">Template Preview</div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-70">Deployment Time:</span>
                      <span className="font-medium">{template.deploymentTime}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-70">Usage Count:</span>
                      <span className="font-medium">{template.usageCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-70">Last Used:</span>
                      <span className="font-medium">{template.lastUsed}</span>
                    </div>
                  </div>

                  {/* Template Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/agency-toolkit/templates/builder?id=${template.id}`}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateAction(template.id, 'duplicate');
                        }}
                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Duplicate
                      </button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateAction(template.id, 'export');
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Export"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateAction(template.id, 'delete');
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

                  {/* Customization Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold">{template.customization.colors}</div>
                      <div className="opacity-70">Colors</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{template.customization.layouts}</div>
                      <div className="opacity-70">Layouts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{template.customization.components}</div>
                      <div className="opacity-70">Components</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Template Details Modal */}
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedTemplate(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-lg border-2",
                  isDark ? "bg-black border-white/30" : "bg-white border-black/30"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold tracking-wide uppercase">
                    {selectedTemplate.name}
                  </h3>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className={cn(
                      "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                      isDark
                        ? "border-white/30 hover:border-white/50"
                        : "border-black/30 hover:border-black/50"
                    )}
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Template Info */}
                  <div>
                    <h4 className="font-bold uppercase tracking-wide mb-4">Template Details</h4>
                    <div className="space-y-4">
                      <p className="text-sm opacity-70">{selectedTemplate.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Category:</span> {selectedTemplate.category}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {selectedTemplate.status}
                        </div>
                        <div>
                          <span className="font-medium">Deployment:</span> {selectedTemplate.deploymentTime}
                        </div>
                        <div>
                          <span className="font-medium">Usage:</span> {selectedTemplate.usageCount} times
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Features:</h5>
                        <ul className="text-sm space-y-1">
                          {selectedTemplate.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="font-bold uppercase tracking-wide mb-4">Actions</h4>
                    <div className="space-y-4">
                      <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all">
                        Deploy Template
                      </button>
                      <button className={cn(
                        "w-full px-4 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}>
                        Customize Template
                      </button>
                      <button className={cn(
                        "w-full px-4 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}>
                        Preview Template
                      </button>
                      <button className={cn(
                        "w-full px-4 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}>
                        Clone Template
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Template Creation Wizard */}
      {showCreationWizard && (
        <TemplateCreationWizard
          onTemplateCreated={handleTemplateCreated}
          onClose={() => setShowCreationWizard(false)}
        />
      )}

      {/* Template Marketplace */}
      {showMarketplace && (
        <TemplateMarketplace
          onTemplateSelect={(template) => {
            console.log('Template selected from marketplace:', template);
            setShowMarketplace(false);
            // Reload templates to include the new one
            loadTemplates();
          }}
          onClose={() => setShowMarketplace(false)}
        />
      )}
    </div>
  );
}