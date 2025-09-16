/**
 * @fileoverview Template Engine Interface
 * Template management system with 5+ custom micro-app templates
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

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

  const [categories] = useState<TemplateCategory[]>([
    { id: 'all', name: 'All Templates', description: 'View all available templates', count: 8 },
    { id: 'business', name: 'Business', description: 'Corporate and business applications', count: 2 },
    { id: 'ecommerce', name: 'E-Commerce', description: 'Online store and shopping platforms', count: 2 },
    { id: 'portfolio', name: 'Portfolio', description: 'Personal and professional portfolios', count: 1 },
    { id: 'dashboard', name: 'Dashboard', description: 'Analytics and management dashboards', count: 2 },
    { id: 'landing', name: 'Landing', description: 'Marketing and promotional pages', count: 1 }
  ]);

  const [templates] = useState<Template[]>([
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
  ]);

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(template => template.category === activeCategory);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                5+ custom micro-app templates for rapid deployment
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/agency-toolkit"
                className={cn(
                  "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                ← Back to Toolkit
              </a>
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
              <button
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
    </div>
  );
}