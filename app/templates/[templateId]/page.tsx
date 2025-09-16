/**
 * @fileoverview Individual Template View Page
 * Detailed template view with preview and deployment options
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function TemplateDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [deploymentConfig, setDeploymentConfig] = useState({
    name: "",
    domain: "",
    environment: "staging"
  });

  // Mock template data - in real app, this would be fetched based on templateId
  const template = {
    id: params.templateId,
    name: "Modern Business Landing",
    description: "Clean, professional landing page template for modern businesses with responsive design and optimized performance.",
    category: "landing",
    type: "Website",
    tags: ["responsive", "modern", "business", "landing"],
    thumbnail: "/api/placeholder/800/600",
    features: [
      "Responsive Design",
      "Hero Section with CTA",
      "Services Grid",
      "Testimonials Carousel",
      "Contact Form",
      "SEO Optimized",
      "Fast Loading",
      "Cross-browser Compatible"
    ],
    popularity: 95,
    downloads: 1250,
    rating: 4.8,
    reviews: 156,
    lastUpdated: "2024-01-15",
    difficulty: "beginner",
    estimatedTime: "2-4 hours",
    author: "Agency Team",
    version: "1.2.0",
    changelog: [
      { version: "1.2.0", date: "2024-01-15", changes: ["Added mobile menu", "Improved accessibility", "Performance optimizations"] },
      { version: "1.1.0", date: "2024-01-01", changes: ["Added testimonials section", "Updated color scheme"] },
      { version: "1.0.0", date: "2023-12-15", changes: ["Initial release"] }
    ],
    demo: {
      live: "https://demo.example.com/modern-business",
      code: "https://github.com/agency/modern-business-template"
    },
    requirements: [
      "Node.js 18+",
      "React 18+",
      "Tailwind CSS",
      "Framer Motion"
    ],
    sections: [
      {
        name: "Hero Section",
        description: "Eye-catching header with call-to-action",
        customizable: ["Title", "Subtitle", "Button Text", "Background Image"]
      },
      {
        name: "Services Grid",
        description: "Showcase your key services",
        customizable: ["Service Items", "Icons", "Descriptions", "Layout"]
      },
      {
        name: "About Section",
        description: "Tell your company story",
        customizable: ["Content", "Images", "Team Info"]
      },
      {
        name: "Testimonials",
        description: "Customer feedback carousel",
        customizable: ["Customer Data", "Photos", "Testimonial Text"]
      },
      {
        name: "Contact Form",
        description: "Lead capture form",
        customizable: ["Form Fields", "Validation", "Submission Handler"]
      }
    ]
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-600 bg-green-50 border-green-200";
      case "intermediate": return "text-orange-600 bg-orange-50 border-orange-200";
      case "advanced": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
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
              href="/templates"
              className="text-black/60 hover:text-black transition-colors"
            >
              ← Back to Templates
            </Link>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
                  {template.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
              </div>
              <p className="text-black/80 mb-4 leading-relaxed">
                {template.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-black/60">
                <span>⭐ {template.rating} ({template.reviews} reviews)</span>
                <span>📥 {template.downloads} downloads</span>
                <span>⏱️ {template.estimatedTime}</span>
                <span>👤 {template.author}</span>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex gap-3">
              <a
                href={template.demo.live}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-black rounded-lg border-2 border-black/30 font-bold transition-all duration-300 hover:border-black/50"
              >
                Live Demo
              </a>
              <button className="px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black">
                Use Template
              </button>
            </div>
          </div>
        </motion.div>

        {/* Template Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="aspect-video bg-black/5 border-2 border-black/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <div className="text-xl font-bold text-black/60">Template Preview</div>
              <div className="text-black/40">{template.name}</div>
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
            {["overview", "sections", "requirements", "changelog", "deploy"].map((tab) => (
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
                <h3 className="text-xl font-bold text-black mb-4">Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {template.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 border border-black/20 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-black rounded-full" />
                      <span className="text-black/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-black/5 text-black/70 text-sm rounded border border-black/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-black mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black/60">Category:</span>
                    <span className="text-black font-medium">{template.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Type:</span>
                    <span className="text-black font-medium">{template.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Version:</span>
                    <span className="text-black font-medium">{template.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Last Updated:</span>
                    <span className="text-black font-medium">{new Date(template.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sections" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-black">Template Sections</h3>
              {template.sections.map((section, index) => (
                <div key={index} className="p-6 border-2 border-black/30 rounded-lg">
                  <h4 className="text-lg font-bold text-black mb-2">{section.name}</h4>
                  <p className="text-black/80 mb-4">{section.description}</p>
                  <div>
                    <div className="text-sm font-medium text-black/60 mb-2">Customizable:</div>
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
          )}

          {activeTab === "requirements" && (
            <div>
              <h3 className="text-xl font-bold text-black mb-4">Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.requirements.map((requirement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 border border-black/20 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-black/80">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "changelog" && (
            <div>
              <h3 className="text-xl font-bold text-black mb-4">Version History</h3>
              <div className="space-y-4">
                {template.changelog.map((entry, index) => (
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

          {activeTab === "deploy" && (
            <div>
              <h3 className="text-xl font-bold text-black mb-4">Deploy Template</h3>
              <div className="max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Project Name</label>
                    <input
                      type="text"
                      value={deploymentConfig.name}
                      onChange={(e) => setDeploymentConfig({...deploymentConfig, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300"
                      placeholder="My awesome project"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Domain (optional)</label>
                    <input
                      type="text"
                      value={deploymentConfig.domain}
                      onChange={(e) => setDeploymentConfig({...deploymentConfig, domain: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300"
                      placeholder="myproject.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Environment</label>
                    <select
                      value={deploymentConfig.environment}
                      onChange={(e) => setDeploymentConfig({...deploymentConfig, environment: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300"
                    >
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <button className="w-full px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black">
                      Deploy Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}