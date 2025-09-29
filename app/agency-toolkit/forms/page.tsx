/**
 * @fileoverview Form Builder - Step 6 of Client App Creation Guide
 * PRD-compliant form builder for rapid micro-app delivery
 * Focus: Essential form creation, professional appearance, minimal complexity
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Plus, Eye, Save, Clock, Zap, Settings, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple interfaces for essential form building only
interface SimpleFormTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

interface FormOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  deliveryImpact: string;
  complexity: 'low' | 'medium';
}

export default function FormsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  // Essential form options (5 only per PRD)
  const formOptions: FormOption[] = [
    {
      id: 'contact',
      name: 'Contact Form',
      description: 'Simple contact form with name, email, and message',
      icon: FileText,
      deliveryImpact: 'Day 1 - Lead capture ready',
      complexity: 'low'
    },
    {
      id: 'newsletter',
      name: 'Newsletter Signup',
      description: 'Email collection form with optional preferences',
      icon: Plus,
      deliveryImpact: 'Day 1 - Email list building',
      complexity: 'low'
    },
    {
      id: 'booking',
      name: 'Service Booking',
      description: 'Appointment booking with date and time selection',
      icon: Clock,
      deliveryImpact: 'Day 2 - Booking system active',
      complexity: 'medium'
    },
    {
      id: 'feedback',
      name: 'Feedback Form',
      description: 'Customer feedback with rating and comments',
      icon: Eye,
      deliveryImpact: 'Day 1 - Customer insights',
      complexity: 'low'
    },
    {
      id: 'quote',
      name: 'Quote Request',
      description: 'Project details form for service quotes',
      icon: Save,
      deliveryImpact: 'Day 2 - Quote generation ready',
      complexity: 'medium'
    }
  ];

  // Simple form templates (3 essential ones)
  const templates: SimpleFormTemplate[] = [
    {
      id: 'basic-contact',
      name: 'Basic Contact',
      description: 'Name, email, message - the essentials',
      fields: ['Full Name', 'Email', 'Message'],
      deliveryImpact: 'Day 1 - Ready for leads',
      complexity: 'low'
    },
    {
      id: 'service-inquiry',
      name: 'Service Inquiry',
      description: 'Contact form with service selection',
      fields: ['Name', 'Email', 'Phone', 'Service Needed', 'Message'],
      deliveryImpact: 'Day 1 - Service leads ready',
      complexity: 'low'
    },
    {
      id: 'appointment-booking',
      name: 'Appointment Booking',
      description: 'Scheduling form with date/time picker',
      fields: ['Name', 'Email', 'Phone', 'Service Type', 'Preferred Date', 'Preferred Time'],
      deliveryImpact: 'Day 2 - Booking system live',
      complexity: 'medium'
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Sophisticated Background System */}
      <div className="absolute inset-0 -z-10">
        {/* Subtle tech grid */}
        <div
          className="absolute inset-0 opacity-[0.02] text-foreground"
          style={{
            backgroundImage: `
              linear-gradient(currentColor 1px, transparent 1px),
              linear-gradient(90deg, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Tech accent lines */}
        <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        <div className="absolute top-0 bottom-0 right-1/4 w-px bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative">
        {/* Enhanced Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/agency-toolkit"
            className={cn(
              "group inline-flex items-center gap-3 px-6 py-3 border-2 font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl rounded-lg",
              isDark
                ? "border-white/30 text-white/80 hover:text-white hover:border-white/50 hover:bg-white/10"
                : "border-black/30 text-black/80 hover:text-black hover:border-black/50 hover:bg-black/10"
            )}
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back to Agency Toolkit</span>

          </Link>
        </motion.div>

        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-start gap-6 mb-6">
            {/* High-tech status indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-lg border-2 backdrop-blur-sm relative",
                isDark
                  ? "bg-black/80 border-white/30 shadow-2xl shadow-white/5"
                  : "bg-white/80 border-black/30 shadow-2xl shadow-black/5"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-green-400" : "bg-green-600"
                )}
                style={{ animationDuration: '1.5s' }} />
                <Settings className="w-3 h-3 text-primary" />
                <Zap className="w-3 h-3 text-primary" />
              </div>

              <span className={cn(
                "text-sm font-mono font-bold tracking-wider uppercase",
                isDark ? "text-white/95" : "text-black/95"
              )}>
                FORM_BUILDER_ACTIVE
              </span>

            </motion.div>

            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className={cn(
                  "inline-flex items-center justify-center w-16 h-16 rounded-xl border-2 mb-4 shadow-xl relative",
                  "bg-primary text-primary-foreground border-primary/20 hover:scale-105 transition-transform duration-300"
                )}
              >
                <FileText className="w-7 h-7" />

                {/* Tech corner brackets */}
                <div className={cn(
                  "absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 opacity-30",
                  isDark ? "border-white" : "border-black"
                )} />
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 opacity-30",
                  isDark ? "border-white" : "border-black"
                )} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-4xl lg:text-5xl font-black tracking-tight uppercase text-high-emphasis mb-3 relative"
              >
                Form Builder
                {/* Scanning line effect */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r opacity-0 animate-pulse pointer-events-none",
                  isDark
                    ? "from-transparent via-white/20 to-transparent"
                    : "from-transparent via-black/20 to-transparent"
                )}
                style={{
                  animationDuration: '4s',
                  animationDelay: '2s'
                }} />
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-lg text-medium-emphasis max-w-2xl"
              >
                Essential form creation for rapid micro-app delivery
              </motion.p>
            </div>

            {/* Activity indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300",
                "bg-primary/10 text-primary border-primary/20 shadow-lg hover:shadow-xl hover:scale-105"
              )}>
                <Activity className="w-5 h-5" />
              </div>
            </motion.div>
          </div>

          {/* PRD Compliance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium">≤7 Day Delivery</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Rapid form implementation for quick deployment
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="font-medium">Essential Only</span>
              </div>
              <p className="text-sm text-muted-foreground">
                5 core form types for minimal complexity
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Save className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Clean, responsive forms for $2k-5k projects
              </p>
            </div>
          </div>
        </motion.div>

        {/* Essential Form Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {formOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{option.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        option.complexity === 'low'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {option.complexity} complexity
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {option.description}
                </p>
                <div className="text-xs text-primary font-medium">
                  {option.deliveryImpact}
                </div>
              </div>
            );
          })}
        </div>

        {/* Simple Form Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Templates */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Quick Start Templates</h3>

              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        template.complexity === 'low'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {template.complexity}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-2">Included Fields:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">
                        {template.deliveryImpact}
                      </span>
                      <Button size="sm">Use Template</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Form
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Import Form Template
              </Button>
            </div>
          </div>

          {/* Live Preview & Timeline */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Form Preview</h3>

              {/* Sample form preview */}
              <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border rounded-md"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border rounded-md"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    placeholder="Tell us about your project..."
                    className="w-full px-3 py-2 border rounded-md h-20"
                    disabled
                  />
                </div>

                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">
                  Send Message
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                * Preview updates as you build your form
              </p>
            </div>

            {/* Delivery Timeline */}
            <div className="p-6 border rounded-lg bg-green-50">
              <h3 className="text-lg font-semibold mb-3 text-green-800">
                Delivery Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 1: Form creation & styling</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 2: Integration & testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Day 3: Email notifications setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-green-700">Days 4-7: Form goes live</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Ready Templates</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-muted-foreground">Form Types</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}