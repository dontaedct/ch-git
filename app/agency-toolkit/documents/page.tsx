/**
 * @fileoverview Document Generation System
 * Document generation with 3+ templates and multi-format export
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Document Template Interface
interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'contract' | 'proposal' | 'report' | 'invoice' | 'legal';
  formats: ExportFormat[];
  variables: DocumentVariable[];
  generatedCount: number;
  lastGenerated: string;
  estimatedTime: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

// Export Format Interface
interface ExportFormat {
  type: 'pdf' | 'docx' | 'html' | 'txt' | 'csv';
  label: string;
  icon: string;
  size?: string;
}

// Document Variable Interface
interface DocumentVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'list' | 'image';
  required: boolean;
  description?: string;
  defaultValue?: any;
}

// Generation Statistics
interface GenerationStats {
  totalDocuments: number;
  documentsToday: number;
  templatesUsed: number;
  avgGenerationTime: string;
  popularFormat: string;
  successRate: number;
}

export default function DocumentGenerationPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'generator' | 'history'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const [stats] = useState<GenerationStats>({
    totalDocuments: 1247,
    documentsToday: 23,
    templatesUsed: 8,
    avgGenerationTime: '1.2s',
    popularFormat: 'PDF',
    successRate: 99.7
  });

  const [templates] = useState<DocumentTemplate[]>([
    {
      id: '1',
      name: 'Service Agreement',
      description: 'Professional service agreement with terms, conditions, and payment details',
      category: 'contract',
      formats: [
        { type: 'pdf', label: 'PDF', icon: '📄', size: '~25KB' },
        { type: 'docx', label: 'Word Doc', icon: '📝', size: '~18KB' },
        { type: 'html', label: 'HTML', icon: '🌐', size: '~8KB' }
      ],
      variables: [
        { key: 'client_name', label: 'Client Name', type: 'text', required: true },
        { key: 'service_description', label: 'Service Description', type: 'text', required: true },
        { key: 'start_date', label: 'Start Date', type: 'date', required: true },
        { key: 'end_date', label: 'End Date', type: 'date', required: false },
        { key: 'payment_amount', label: 'Payment Amount', type: 'number', required: true },
        { key: 'payment_terms', label: 'Payment Terms', type: 'list', required: true },
        { key: 'deliverables', label: 'Deliverables', type: 'list', required: true }
      ],
      generatedCount: 156,
      lastGenerated: '2 hours ago',
      estimatedTime: '1.5s',
      complexity: 'moderate'
    },
    {
      id: '2',
      name: 'Project Proposal',
      description: 'Comprehensive project proposal with scope, timeline, and budget breakdown',
      category: 'proposal',
      formats: [
        { type: 'pdf', label: 'PDF', icon: '📄', size: '~35KB' },
        { type: 'docx', label: 'Word Doc', icon: '📝', size: '~28KB' },
        { type: 'html', label: 'HTML', icon: '🌐', size: '~12KB' }
      ],
      variables: [
        { key: 'project_title', label: 'Project Title', type: 'text', required: true },
        { key: 'client_company', label: 'Client Company', type: 'text', required: true },
        { key: 'project_scope', label: 'Project Scope', type: 'text', required: true },
        { key: 'timeline_weeks', label: 'Timeline (weeks)', type: 'number', required: true },
        { key: 'total_budget', label: 'Total Budget', type: 'number', required: true },
        { key: 'key_milestones', label: 'Key Milestones', type: 'list', required: true },
        { key: 'team_members', label: 'Team Members', type: 'list', required: false },
        { key: 'technologies', label: 'Technologies', type: 'list', required: false }
      ],
      generatedCount: 89,
      lastGenerated: '1 day ago',
      estimatedTime: '2.1s',
      complexity: 'complex'
    },
    {
      id: '3',
      name: 'Monthly Report',
      description: 'Monthly performance and analytics report with charts and insights',
      category: 'report',
      formats: [
        { type: 'pdf', label: 'PDF', icon: '📄', size: '~45KB' },
        { type: 'docx', label: 'Word Doc', icon: '📝', size: '~32KB' },
        { type: 'html', label: 'HTML', icon: '🌐', size: '~15KB' },
        { type: 'csv', label: 'CSV Data', icon: '📊', size: '~3KB' }
      ],
      variables: [
        { key: 'report_month', label: 'Report Month', type: 'date', required: true },
        { key: 'client_name', label: 'Client Name', type: 'text', required: true },
        { key: 'total_visitors', label: 'Total Visitors', type: 'number', required: true },
        { key: 'conversion_rate', label: 'Conversion Rate (%)', type: 'number', required: true },
        { key: 'revenue_generated', label: 'Revenue Generated', type: 'number', required: true },
        { key: 'key_achievements', label: 'Key Achievements', type: 'list', required: true },
        { key: 'recommendations', label: 'Recommendations', type: 'list', required: false },
        { key: 'include_charts', label: 'Include Charts', type: 'boolean', required: false }
      ],
      generatedCount: 234,
      lastGenerated: '30 min ago',
      estimatedTime: '1.8s',
      complexity: 'moderate'
    },
    {
      id: '4',
      name: 'Invoice Template',
      description: 'Professional invoice with itemized billing and payment information',
      category: 'invoice',
      formats: [
        { type: 'pdf', label: 'PDF', icon: '📄', size: '~15KB' },
        { type: 'docx', label: 'Word Doc', icon: '📝', size: '~12KB' },
        { type: 'html', label: 'HTML', icon: '🌐', size: '~5KB' }
      ],
      variables: [
        { key: 'invoice_number', label: 'Invoice Number', type: 'text', required: true },
        { key: 'client_name', label: 'Client Name', type: 'text', required: true },
        { key: 'client_address', label: 'Client Address', type: 'text', required: true },
        { key: 'invoice_date', label: 'Invoice Date', type: 'date', required: true },
        { key: 'due_date', label: 'Due Date', type: 'date', required: true },
        { key: 'line_items', label: 'Line Items', type: 'list', required: true },
        { key: 'tax_rate', label: 'Tax Rate (%)', type: 'number', required: false },
        { key: 'payment_terms', label: 'Payment Terms', type: 'text', required: false }
      ],
      generatedCount: 367,
      lastGenerated: '15 min ago',
      estimatedTime: '0.8s',
      complexity: 'simple'
    },
    {
      id: '5',
      name: 'NDA Agreement',
      description: 'Non-disclosure agreement for protecting confidential information',
      category: 'legal',
      formats: [
        { type: 'pdf', label: 'PDF', icon: '📄', size: '~20KB' },
        { type: 'docx', label: 'Word Doc', icon: '📝', size: '~16KB' }
      ],
      variables: [
        { key: 'disclosing_party', label: 'Disclosing Party', type: 'text', required: true },
        { key: 'receiving_party', label: 'Receiving Party', type: 'text', required: true },
        { key: 'effective_date', label: 'Effective Date', type: 'date', required: true },
        { key: 'term_years', label: 'Term (years)', type: 'number', required: true },
        { key: 'jurisdiction', label: 'Jurisdiction', type: 'text', required: true },
        { key: 'purpose', label: 'Purpose of Disclosure', type: 'text', required: true }
      ],
      generatedCount: 67,
      lastGenerated: '3 days ago',
      estimatedTime: '1.1s',
      complexity: 'moderate'
    }
  ]);

  const [generationHistory] = useState([
    { id: '1', template: 'Service Agreement', client: 'Acme Corp', format: 'PDF', generated: '2 hours ago', status: 'completed' },
    { id: '2', template: 'Monthly Report', client: 'TechStart Inc', format: 'HTML', generated: '30 min ago', status: 'completed' },
    { id: '3', template: 'Invoice Template', client: 'Global Solutions', format: 'PDF', generated: '15 min ago', status: 'completed' },
    { id: '4', template: 'Project Proposal', client: 'Innovation Labs', format: 'DOCX', generated: '1 day ago', status: 'completed' },
    { id: '5', template: 'NDA Agreement', client: 'Design Studio', format: 'PDF', generated: '3 days ago', status: 'completed' }
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
                Document Generation System
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Generate documents with 3+ templates and multi-format export
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
          {/* Generation Statistics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { label: "Total Generated", value: stats.totalDocuments, color: "blue" },
              { label: "Today", value: stats.documentsToday, color: "green" },
              { label: "Templates", value: stats.templatesUsed, color: "yellow" },
              { label: "Avg Time", value: stats.avgGenerationTime, color: "purple" },
              { label: "Popular Format", value: stats.popularFormat, color: "emerald" },
              { label: "Success Rate", value: `${stats.successRate}%`, color: "red" }
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
              { id: 'templates', label: 'Document Templates' },
              { id: 'generator', label: 'Quick Generator' },
              { id: 'history', label: 'Generation History' }
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

          {/* Document Templates Tab */}
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
                  Document Templates ({templates.length})
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
                  Create Template
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
                        template.complexity === 'simple' && "bg-green-500/20 text-green-500",
                        template.complexity === 'moderate' && "bg-yellow-500/20 text-yellow-500",
                        template.complexity === 'complex' && "bg-red-500/20 text-red-500"
                      )}>
                        {template.complexity}
                      </span>
                    </div>

                    {/* Export Formats */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Export Formats:</div>
                      <div className="flex flex-wrap gap-2">
                        {template.formats.map((format) => (
                          <span
                            key={format.type}
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              isDark ? "bg-white/10" : "bg-black/10"
                            )}
                          >
                            {format.icon} {format.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Template Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="opacity-70">Generated:</span> {template.generatedCount}
                      </div>
                      <div>
                        <span className="opacity-70">Variables:</span> {template.variables.length}
                      </div>
                      <div>
                        <span className="opacity-70">Last Used:</span> {template.lastGenerated}
                      </div>
                      <div>
                        <span className="opacity-70">Est. Time:</span> {template.estimatedTime}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-all">
                        Generate
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

          {/* Quick Generator Tab */}
          {activeTab === 'generator' && (
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
                Quick Document Generator
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold mb-4">Select Template</h3>
                  <div className="space-y-3">
                    {templates.slice(0, 3).map((template) => (
                      <div
                        key={template.id}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all duration-300",
                          isDark
                            ? "border-white/30 hover:border-white/50"
                            : "border-black/30 hover:border-black/50"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm opacity-70">{template.variables.length} variables</div>
                          </div>
                          <div className="text-sm opacity-70">{template.estimatedTime}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-4">Export Options</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { type: 'pdf', label: 'PDF Document', icon: '📄' },
                      { type: 'docx', label: 'Word Document', icon: '📝' },
                      { type: 'html', label: 'HTML Page', icon: '🌐' },
                      { type: 'txt', label: 'Text File', icon: '📄' }
                    ].map((format) => (
                      <div
                        key={format.type}
                        className={cn(
                          "p-4 text-center rounded-lg border-2 cursor-pointer transition-all duration-300",
                          isDark
                            ? "border-white/30 hover:border-white/50"
                            : "border-black/30 hover:border-black/50"
                        )}
                      >
                        <div className="text-2xl mb-2">{format.icon}</div>
                        <div className="text-sm font-medium">{format.label}</div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all">
                    Generate Document
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Generation History Tab */}
          {activeTab === 'history' && (
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
                Generation History
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={cn(
                      "border-b-2",
                      isDark ? "border-white/30" : "border-black/30"
                    )}>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Template</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Client</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Format</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Generated</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Status</th>
                      <th className="text-left py-3 font-bold tracking-wide uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generationHistory.map((item) => (
                      <tr
                        key={item.id}
                        className={cn(
                          "border-b transition-all duration-300",
                          isDark ? "border-white/20 hover:bg-white/5" : "border-black/20 hover:bg-black/5"
                        )}
                      >
                        <td className="py-3 font-medium">{item.template}</td>
                        <td className="py-3">{item.client}</td>
                        <td className="py-3">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium uppercase",
                            isDark ? "bg-white/10" : "bg-black/10"
                          )}>
                            {item.format}
                          </span>
                        </td>
                        <td className="py-3 opacity-70">{item.generated}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-medium uppercase">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <button className={cn(
                              "text-xs px-2 py-1 rounded border transition-all duration-300",
                              isDark
                                ? "border-white/30 hover:border-white/50"
                                : "border-black/30 hover:border-black/50"
                            )}>
                              Download
                            </button>
                            <button className={cn(
                              "text-xs px-2 py-1 rounded border transition-all duration-300",
                              isDark
                                ? "border-white/30 hover:border-white/50"
                                : "border-black/30 hover:border-black/50"
                            )}>
                              Regenerate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold uppercase tracking-wide mb-4">Template Variables</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {selectedTemplate.variables.map((variable) => (
                        <div
                          key={variable.key}
                          className={cn(
                            "p-3 rounded-lg border",
                            isDark ? "border-white/20" : "border-black/20"
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium">{variable.label}</div>
                            {variable.required && (
                              <span className="text-red-500 text-xs">Required</span>
                            )}
                          </div>
                          <div className="text-sm opacity-70">Type: {variable.type}</div>
                          {variable.description && (
                            <div className="text-xs opacity-60 mt-1">{variable.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold uppercase tracking-wide mb-4">Template Details</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Category:</span> {selectedTemplate.category}</div>
                        <div><span className="font-medium">Complexity:</span> {selectedTemplate.complexity}</div>
                        <div><span className="font-medium">Variables:</span> {selectedTemplate.variables.length}</div>
                        <div><span className="font-medium">Generated:</span> {selectedTemplate.generatedCount}</div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Export Formats:</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedTemplate.formats.map((format) => (
                            <div
                              key={format.type}
                              className={cn(
                                "p-2 rounded border text-center",
                                isDark ? "border-white/20" : "border-black/20"
                              )}
                            >
                              <div>{format.icon} {format.label}</div>
                              {format.size && <div className="text-xs opacity-70">{format.size}</div>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all">
                          Generate Document
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