/**
 * @fileoverview Individual Document View Page
 * Detailed document template view with customization and export options
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function DocumentDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [customizationData, setCustomizationData] = useState({
    colors: { primary: "#000000", secondary: "#666666" },
    fonts: { heading: "Arial", body: "Arial" },
    logo: null,
    company: "",
    contact: ""
  });

  // Mock document data - in real app, this would be fetched based on documentId
  const document = {
    id: params.documentId,
    name: "Project Proposal Template",
    description: "Comprehensive project proposal with executive summary, scope, timeline, and budget sections. Perfect for consulting and agency work.",
    category: "proposal",
    subcategory: "business",
    complexity: "intermediate",
    pages: 8,
    size: "2.4 MB",
    author: "Business Team",
    created: "2024-01-15",
    updated: "2024-01-15",
    version: "1.2.0",
    downloads: 1250,
    rating: 4.8,
    reviews: 156,
    price: "Free",
    formats: ["PDF", "DOCX", "HTML"],
    tags: ["business", "proposal", "consulting", "agency"],
    sections: [
      {
        name: "Executive Summary",
        description: "High-level overview of the project and key benefits",
        required: true,
        customizable: ["Content", "Layout"]
      },
      {
        name: "Project Scope",
        description: "Detailed description of project deliverables and objectives",
        required: true,
        customizable: ["Content", "Structure", "Timeline"]
      },
      {
        name: "Timeline & Milestones",
        description: "Project phases, milestones, and delivery schedule",
        required: true,
        customizable: ["Dates", "Milestones", "Dependencies"]
      },
      {
        name: "Budget & Pricing",
        description: "Detailed cost breakdown and payment terms",
        required: true,
        customizable: ["Pricing", "Payment Terms", "Currency"]
      },
      {
        name: "Team & Resources",
        description: "Project team members and resource allocation",
        required: false,
        customizable: ["Team Members", "Roles", "Photos"]
      },
      {
        name: "Terms & Conditions",
        description: "Legal terms, conditions, and project requirements",
        required: true,
        customizable: ["Terms", "Conditions", "Legal Text"]
      },
      {
        name: "Next Steps",
        description: "Call to action and next steps for the client",
        required: true,
        customizable: ["Actions", "Contact Info", "CTA"]
      },
      {
        name: "Appendices",
        description: "Supporting documents and additional information",
        required: false,
        customizable: ["Documents", "References", "Links"]
      }
    ],
    customizableElements: [
      "Company Logo", "Brand Colors", "Typography", "Contact Information",
      "Project Details", "Pricing Structure", "Team Information", "Timeline"
    ],
    requirements: [
      "Company information and branding materials",
      "Project scope and requirements",
      "Timeline and budget information",
      "Team member details (optional)"
    ],
    changelog: [
      {
        version: "1.2.0",
        date: "2024-01-15",
        changes: ["Added team section", "Improved pricing layout", "Enhanced mobile view"]
      },
      {
        version: "1.1.0",
        date: "2024-01-01",
        changes: ["Updated design", "Added more customization options"]
      },
      {
        version: "1.0.0",
        date: "2023-12-15",
        changes: ["Initial release"]
      }
    ]
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "simple": return "text-green-600 bg-green-50 border-green-200";
      case "intermediate": return "text-orange-600 bg-orange-50 border-orange-200";
      case "advanced": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriceColor = (price: string) => {
    return price === "Free" ? "text-green-600 bg-green-50" : "text-purple-600 bg-purple-50";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/documents/templates"
              className="text-black/60 hover:text-black transition-colors"
            >
              ← Back to Templates
            </Link>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
                  {document.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getComplexityColor(document.complexity)}`}>
                  {document.complexity}
                </span>
                <span className={`px-3 py-1 rounded text-xs font-medium ${getPriceColor(document.price)}`}>
                  {document.price}
                </span>
              </div>
              <p className="text-black/80 mb-4 leading-relaxed">
                {document.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-black/60">
                <span>⭐ {document.rating} ({document.reviews} reviews)</span>
                <span>📥 {document.downloads} downloads</span>
                <span>📄 {document.pages} pages</span>
                <span>💾 {document.size}</span>
                <span>👤 {document.author}</span>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex gap-3">
              <button className="px-6 py-3 bg-white text-black rounded-lg border-2 border-black/30 font-bold transition-all duration-300 hover:border-black/50">
                Preview Document
              </button>
              <Link
                href="/documents/generator"
                className="px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black"
              >
                Use This Template
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Document Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="aspect-video bg-black/5 border-2 border-black/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <div className="text-xl font-bold text-black/60">Document Preview</div>
              <div className="text-black/40">{document.name}</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 border-b border-black/20">
            {["overview", "sections", "customize", "requirements", "changelog"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border-b-2 transition-all duration-300 text-sm font-medium uppercase tracking-wide ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-black/60 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-black mb-4">Template Features</h3>
                <div className="space-y-3">
                  {document.customizableElements.map((element, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 border border-black/20 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-black rounded-full" />
                      <span className="text-black/80">{element}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-black mb-4 mt-8">Available Formats</h3>
                <div className="flex gap-3">
                  {document.formats.map((format, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 border border-black/20 rounded-lg text-center"
                    >
                      <div className="text-2xl mb-1">
                        {format === "PDF" && "📄"}
                        {format === "DOCX" && "📝"}
                        {format === "HTML" && "🌐"}
                      </div>
                      <div className="font-medium text-black">{format}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-black/5 text-black/70 text-sm rounded border border-black/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-black mb-4">Document Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black/60">Category:</span>
                    <span className="text-black font-medium capitalize">{document.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Subcategory:</span>
                    <span className="text-black font-medium capitalize">{document.subcategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Complexity:</span>
                    <span className="text-black font-medium capitalize">{document.complexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Version:</span>
                    <span className="text-black font-medium">{document.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Last Updated:</span>
                    <span className="text-black font-medium">{new Date(document.updated).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sections" && (
            <div>
              <h3 className="text-xl font-bold text-black mb-6">Document Sections</h3>
              <div className="space-y-6">
                {document.sections.map((section, index) => (
                  <div key={index} className="p-6 border-2 border-black/30 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-black">{section.name}</h4>
                        <p className="text-black/80 text-sm">{section.description}</p>
                      </div>
                      {section.required && (
                        <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                          Required
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black/60 mb-2">Customizable Elements:</div>
                      <div className="flex flex-wrap gap-2">
                        {section.customizable.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "customize" && (
            <div>
              <h3 className="text-xl font-bold text-black mb-6">Template Customization</h3>
              <div className="max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Company Name</label>
                    <input
                      type="text"
                      value={customizationData.company}
                      onChange={(e) => setCustomizationData({...customizationData, company: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300"
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Contact Information</label>
                    <textarea
                      value={customizationData.contact}
                      onChange={(e) => setCustomizationData({...customizationData, contact: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300 h-24"
                      placeholder="Contact details, address, phone, email..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Brand Colors</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-black/60 mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customizationData.colors.primary}
                            onChange={(e) => setCustomizationData({
                              ...customizationData,
                              colors: {...customizationData.colors, primary: e.target.value}
                            })}
                            className="w-10 h-10 border border-black/30 rounded"
                          />
                          <input
                            type="text"
                            value={customizationData.colors.primary}
                            onChange={(e) => setCustomizationData({
                              ...customizationData,
                              colors: {...customizationData.colors, primary: e.target.value}
                            })}
                            className="flex-1 px-3 py-2 border border-black/30 rounded text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-black/60 mb-1">Secondary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customizationData.colors.secondary}
                            onChange={(e) => setCustomizationData({
                              ...customizationData,
                              colors: {...customizationData.colors, secondary: e.target.value}
                            })}
                            className="w-10 h-10 border border-black/30 rounded"
                          />
                          <input
                            type="text"
                            value={customizationData.colors.secondary}
                            onChange={(e) => setCustomizationData({
                              ...customizationData,
                              colors: {...customizationData.colors, secondary: e.target.value}
                            })}
                            className="flex-1 px-3 py-2 border border-black/30 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Typography</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-black/60 mb-1">Heading Font</label>
                        <select
                          value={customizationData.fonts.heading}
                          onChange={(e) => setCustomizationData({
                            ...customizationData,
                            fonts: {...customizationData.fonts, heading: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-black/30 rounded text-sm"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times">Times</option>
                          <option value="Georgia">Georgia</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-black/60 mb-1">Body Font</label>
                        <select
                          value={customizationData.fonts.body}
                          onChange={(e) => setCustomizationData({
                            ...customizationData,
                            fonts: {...customizationData.fonts, body: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-black/30 rounded text-sm"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times">Times</option>
                          <option value="Georgia">Georgia</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Company Logo</label>
                    <div className="border-2 border-dashed border-black/30 rounded-lg p-6 text-center">
                      <div className="text-2xl mb-2">📎</div>
                      <div className="text-sm text-black/60">Upload your company logo</div>
                      <div className="text-xs text-black/40 mt-1">PNG, JPG, SVG up to 5MB</div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="w-full px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black">
                      Apply Customizations
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "requirements" && (
            <div>
              <h3 className="text-xl font-bold text-black mb-6">Template Requirements</h3>
              <div className="max-w-2xl">
                <div className="space-y-4">
                  <p className="text-black/80 mb-6">
                    To get the best results from this template, please prepare the following information:
                  </p>
                  {document.requirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 border border-black/20 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-black/80">{requirement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "changelog" && (
            <div>
              <h3 className="text-xl font-bold text-black mb-6">Version History</h3>
              <div className="space-y-4 max-w-2xl">
                {document.changelog.map((entry, index) => (
                  <div key={index} className="p-4 border border-black/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-black">v{entry.version}</span>
                      <span className="text-sm text-black/60">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {entry.changes.map((change, idx) => (
                        <li key={idx} className="text-black/80 text-sm">{change}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}