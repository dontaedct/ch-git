/**
 * @fileoverview Form Builder System
 * Advanced form builder with 4+ templates and 21 field types
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Form Template Interface
interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: 'contact' | 'survey' | 'application' | 'registration' | 'feedback';
  fields: number;
  submissions: number;
  conversionRate: number;
  lastUsed: string;
  preview: FormField[];
}

// Form Field Interface
interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: string;
}

// Field Types (21 total)
type FieldType =
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time'
  | 'datetime' | 'file' | 'range' | 'color' | 'search' | 'hidden'
  | 'signature' | 'rating' | 'address';

// Form Builder Statistics
interface FormStats {
  totalForms: number;
  activeForms: number;
  totalSubmissions: number;
  avgConversionRate: number;
  fieldTypesUsed: number;
  templatesAvailable: number;
}

export default function FormBuilderPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'builder' | 'analytics'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const [stats] = useState<FormStats>({
    totalForms: 45,
    activeForms: 32,
    totalSubmissions: 1847,
    avgConversionRate: 67.8,
    fieldTypesUsed: 21,
    templatesAvailable: 6
  });

  const [fieldTypes] = useState<Array<{type: FieldType, label: string, category: string}>>([
    // Basic Fields
    { type: 'text', label: 'Text Input', category: 'Basic' },
    { type: 'email', label: 'Email', category: 'Basic' },
    { type: 'password', label: 'Password', category: 'Basic' },
    { type: 'number', label: 'Number', category: 'Basic' },
    { type: 'tel', label: 'Phone', category: 'Basic' },
    { type: 'url', label: 'URL', category: 'Basic' },
    { type: 'search', label: 'Search', category: 'Basic' },
    { type: 'hidden', label: 'Hidden', category: 'Basic' },

    // Selection Fields
    { type: 'select', label: 'Dropdown', category: 'Selection' },
    { type: 'radio', label: 'Radio Buttons', category: 'Selection' },
    { type: 'checkbox', label: 'Checkboxes', category: 'Selection' },
    { type: 'range', label: 'Range Slider', category: 'Selection' },
    { type: 'rating', label: 'Star Rating', category: 'Selection' },

    // Content Fields
    { type: 'textarea', label: 'Text Area', category: 'Content' },
    { type: 'file', label: 'File Upload', category: 'Content' },
    { type: 'signature', label: 'Digital Signature', category: 'Content' },

    // Date/Time Fields
    { type: 'date', label: 'Date Picker', category: 'Date/Time' },
    { type: 'time', label: 'Time Picker', category: 'Date/Time' },
    { type: 'datetime', label: 'Date & Time', category: 'Date/Time' },

    // Specialized Fields
    { type: 'color', label: 'Color Picker', category: 'Specialized' },
    { type: 'address', label: 'Address Input', category: 'Specialized' }
  ]);

  const [templates] = useState<FormTemplate[]>([
    {
      id: '1',
      name: 'Contact Form',
      description: 'Standard contact form with name, email, subject, and message fields',
      category: 'contact',
      fields: 5,
      submissions: 342,
      conversionRate: 78.5,
      lastUsed: '2 hours ago',
      preview: [
        { id: '1', type: 'text', label: 'Full Name', required: true },
        { id: '2', type: 'email', label: 'Email Address', required: true },
        { id: '3', type: 'tel', label: 'Phone Number', required: false },
        { id: '4', type: 'select', label: 'Subject', required: true, options: ['General Inquiry', 'Support', 'Sales'] },
        { id: '5', type: 'textarea', label: 'Message', required: true }
      ]
    },
    {
      id: '2',
      name: 'Customer Survey',
      description: 'Comprehensive customer feedback survey with ratings and multiple choice',
      category: 'survey',
      fields: 8,
      submissions: 186,
      conversionRate: 65.2,
      lastUsed: '1 day ago',
      preview: [
        { id: '1', type: 'text', label: 'Customer Name', required: true },
        { id: '2', type: 'email', label: 'Email', required: true },
        { id: '3', type: 'rating', label: 'Overall Satisfaction', required: true },
        { id: '4', type: 'radio', label: 'Service Quality', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { id: '5', type: 'checkbox', label: 'Improvement Areas', required: false, options: ['Speed', 'Quality', 'Price', 'Support'] },
        { id: '6', type: 'range', label: 'Likelihood to Recommend', required: true },
        { id: '7', type: 'textarea', label: 'Additional Comments', required: false },
        { id: '8', type: 'date', label: 'Last Purchase Date', required: false }
      ]
    },
    {
      id: '3',
      name: 'Job Application',
      description: 'Complete job application form with file upload and personal information',
      category: 'application',
      fields: 12,
      submissions: 94,
      conversionRate: 72.1,
      lastUsed: '3 days ago',
      preview: [
        { id: '1', type: 'text', label: 'First Name', required: true },
        { id: '2', type: 'text', label: 'Last Name', required: true },
        { id: '3', type: 'email', label: 'Email Address', required: true },
        { id: '4', type: 'tel', label: 'Phone Number', required: true },
        { id: '5', type: 'address', label: 'Address', required: true },
        { id: '6', type: 'date', label: 'Date of Birth', required: true },
        { id: '7', type: 'select', label: 'Position Applied For', required: true },
        { id: '8', type: 'number', label: 'Years of Experience', required: true },
        { id: '9', type: 'file', label: 'Resume Upload', required: true },
        { id: '10', type: 'file', label: 'Cover Letter', required: false },
        { id: '11', type: 'textarea', label: 'Why do you want to work here?', required: true },
        { id: '12', type: 'checkbox', label: 'Terms and Conditions', required: true }
      ]
    },
    {
      id: '4',
      name: 'Event Registration',
      description: 'Event registration with attendee details and preferences',
      category: 'registration',
      fields: 9,
      submissions: 267,
      conversionRate: 81.3,
      lastUsed: '5 hours ago',
      preview: [
        { id: '1', type: 'text', label: 'Full Name', required: true },
        { id: '2', type: 'email', label: 'Email Address', required: true },
        { id: '3', type: 'tel', label: 'Phone Number', required: true },
        { id: '4', type: 'select', label: 'Ticket Type', required: true },
        { id: '5', type: 'number', label: 'Number of Attendees', required: true },
        { id: '6', type: 'radio', label: 'Dietary Requirements', required: false },
        { id: '7', type: 'checkbox', label: 'Workshop Preferences', required: false },
        { id: '8', type: 'textarea', label: 'Special Requests', required: false },
        { id: '9', type: 'checkbox', label: 'Marketing Consent', required: false }
      ]
    },
    {
      id: '5',
      name: 'Product Feedback',
      description: 'Product feedback form with ratings and feature requests',
      category: 'feedback',
      fields: 7,
      submissions: 153,
      conversionRate: 69.4,
      lastUsed: '1 week ago',
      preview: [
        { id: '1', type: 'text', label: 'Product Name', required: true },
        { id: '2', type: 'rating', label: 'Overall Rating', required: true },
        { id: '3', type: 'rating', label: 'Ease of Use', required: true },
        { id: '4', type: 'rating', label: 'Value for Money', required: true },
        { id: '5', type: 'checkbox', label: 'Feature Requests', required: false },
        { id: '6', type: 'textarea', label: 'What did you like most?', required: false },
        { id: '7', type: 'textarea', label: 'Suggestions for improvement', required: false }
      ]
    },
    {
      id: '6',
      name: 'Service Booking',
      description: 'Service booking form with date/time selection and requirements',
      category: 'application',
      fields: 10,
      submissions: 198,
      conversionRate: 74.6,
      lastUsed: '2 days ago',
      preview: [
        { id: '1', type: 'text', label: 'Client Name', required: true },
        { id: '2', type: 'email', label: 'Email Address', required: true },
        { id: '3', type: 'tel', label: 'Phone Number', required: true },
        { id: '4', type: 'select', label: 'Service Type', required: true },
        { id: '5', type: 'date', label: 'Preferred Date', required: true },
        { id: '6', type: 'time', label: 'Preferred Time', required: true },
        { id: '7', type: 'address', label: 'Service Address', required: true },
        { id: '8', type: 'range', label: 'Budget Range', required: false },
        { id: '9', type: 'textarea', label: 'Special Requirements', required: false },
        { id: '10', type: 'checkbox', label: 'Terms of Service', required: true }
      ]
    }
  ]);

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

  const renderFieldPreview = (field: FormField) => {
    const baseClasses = "w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm";

    switch (field.type) {
      case 'textarea':
        return <textarea className={cn(baseClasses, "h-20")} placeholder={field.placeholder} />;
      case 'select':
        return (
          <select className={baseClasses}>
            <option>Select {field.label}</option>
            {field.options?.map(option => <option key={option}>{option}</option>)}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input type="radio" name={field.id} className="w-4 h-4" />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return field.options ? (
          <div className="space-y-2">
            {field.options.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">{field.label}</span>
          </label>
        );
      case 'range':
        return (
          <div>
            <input type="range" className="w-full" min="0" max="10" />
            <div className="flex justify-between text-xs opacity-70">
              <span>0</span>
              <span>10</span>
            </div>
          </div>
        );
      case 'rating':
        return (
          <div className="flex space-x-1">
            {[1,2,3,4,5].map(star => (
              <span key={star} className="text-yellow-500 text-lg cursor-pointer">★</span>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <span className="text-sm opacity-70">Click to upload or drag and drop</span>
          </div>
        );
      case 'color':
        return <input type="color" className="w-16 h-10 border-2 border-gray-300 rounded" />;
      case 'date':
      case 'time':
      case 'datetime':
        return <input type={field.type} className={baseClasses} />;
      default:
        return <input type={field.type} className={baseClasses} placeholder={field.placeholder} />;
    }
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
                Form Builder System
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Advanced form builder with 4+ templates and 21 field types
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
          {/* Form Statistics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { label: "Total Forms", value: stats.totalForms, color: "blue" },
              { label: "Active Forms", value: stats.activeForms, color: "green" },
              { label: "Submissions", value: stats.totalSubmissions, color: "yellow" },
              { label: "Conversion Rate", value: `${stats.avgConversionRate}%`, color: "purple" },
              { label: "Field Types", value: stats.fieldTypesUsed, color: "emerald" },
              { label: "Templates", value: stats.templatesAvailable, color: "red" }
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

          {/* Tab Navigation */}
          <motion.div
            variants={itemVariants}
            className="flex space-x-4"
          >
            {[
              { id: 'templates', label: 'Form Templates' },
              { id: 'builder', label: 'Field Types' },
              { id: 'analytics', label: 'Form Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                  activeTab === tab.id
                    ? isDark
                      ? "bg-white/10 border-white/50"
                      : "bg-black/10 border-black/50"
                    : isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Form Templates Tab */}
          {activeTab === 'templates' && (
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
                  Form Templates ({templates.length})
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
                  Create New Form
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {templates.map((template) => (
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
                        template.category === 'contact' && "bg-blue-500/20 text-blue-500",
                        template.category === 'survey' && "bg-green-500/20 text-green-500",
                        template.category === 'application' && "bg-purple-500/20 text-purple-500",
                        template.category === 'registration' && "bg-yellow-500/20 text-yellow-500",
                        template.category === 'feedback' && "bg-red-500/20 text-red-500"
                      )}>
                        {template.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="opacity-70">Fields:</span> {template.fields}
                      </div>
                      <div>
                        <span className="opacity-70">Submissions:</span> {template.submissions}
                      </div>
                      <div>
                        <span className="opacity-70">Conversion:</span> {template.conversionRate}%
                      </div>
                      <div>
                        <span className="opacity-70">Last Used:</span> {template.lastUsed}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-all">
                        Use Template
                      </button>
                      <button className={cn(
                        "px-3 py-2 rounded-lg border-2 text-sm font-bold transition-all duration-300",
                        isDark
                          ? "border-white/30 hover:border-white/50"
                          : "border-black/30 hover:border-black/50"
                      )}>
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Field Types Tab */}
          {activeTab === 'builder' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <h2 className="text-xl font-bold tracking-wide uppercase mb-6">
                Available Field Types (21 Types)
              </h2>

              {['Basic', 'Selection', 'Content', 'Date/Time', 'Specialized'].map(category => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-bold mb-4">{category} Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {fieldTypes.filter(field => field.category === category).map((fieldType) => (
                      <div
                        key={fieldType.type}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all duration-300",
                          isDark
                            ? "border-white/30 hover:border-white/50"
                            : "border-black/30 hover:border-black/50"
                        )}
                      >
                        <div className="font-medium text-sm mb-2">{fieldType.label}</div>
                        <div className="text-xs opacity-70 mb-2">Type: {fieldType.type}</div>
                        <button className="w-full px-3 py-1 bg-blue-500/20 text-blue-500 rounded text-xs font-medium hover:bg-blue-500/30 transition-all">
                          Add to Form
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              variants={itemVariants}
              className={cn(
                "p-6 rounded-lg border-2 transition-all duration-300",
                isDark
                  ? "bg-black/5 border-white/30"
                  : "bg-white/5 border-black/30"
              )}
            >
              <h2 className="text-xl font-bold tracking-wide uppercase mb-6">
                Form Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">{stats.totalSubmissions}</div>
                  <div className="text-sm opacity-70">Total Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">{stats.avgConversionRate}%</div>
                  <div className="text-sm opacity-70">Average Conversion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500">{stats.activeForms}</div>
                  <div className="text-sm opacity-70">Active Forms</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Template Preview Modal */}
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
                    {selectedTemplate.name} Preview
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold uppercase tracking-wide mb-4">Form Preview</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {selectedTemplate.preview.map((field) => (
                        <div key={field.id}>
                          <label className="block text-sm font-medium mb-2">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          {renderFieldPreview(field)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold uppercase tracking-wide mb-4">Template Details</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Category:</span> {selectedTemplate.category}</div>
                        <div><span className="font-medium">Fields:</span> {selectedTemplate.fields}</div>
                        <div><span className="font-medium">Submissions:</span> {selectedTemplate.submissions}</div>
                        <div><span className="font-medium">Conversion:</span> {selectedTemplate.conversionRate}%</div>
                      </div>
                      <div className="pt-4 space-y-2">
                        <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all">
                          Use This Template
                        </button>
                        <button className={cn(
                          "w-full px-4 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                          isDark
                            ? "border-white/30 hover:border-white/50"
                            : "border-black/30 hover:border-black/50"
                        )}>
                          Customize Template
                        </button>
                      </div>
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