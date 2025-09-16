/**
 * @fileoverview Document Templates Page
 * Browse and manage document templates
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function DocumentTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [searchTerm, setSearchTerm] = useState("");

  const templates = [
    {
      id: "1",
      name: "Project Proposal Template",
      description: "Comprehensive project proposal with executive summary, scope, timeline, and budget sections. Perfect for consulting and agency work.",
      category: "proposal",
      subcategory: "business",
      complexity: "intermediate",
      pages: 8,
      sections: ["Executive Summary", "Project Scope", "Timeline", "Budget", "Terms"],
      customizable: ["Colors", "Fonts", "Logo", "Content"],
      formats: ["PDF", "DOCX", "HTML"],
      popularity: 95,
      downloads: 1250,
      rating: 4.8,
      reviews: 156,
      author: "Business Team",
      created: "2024-01-15",
      updated: "2024-01-15",
      tags: ["business", "proposal", "consulting", "agency"],
      preview: "/api/placeholder/400/500",
      price: "Free"
    },
    {
      id: "2",
      name: "Professional Invoice",
      description: "Clean, modern invoice template with automatic calculations, payment terms, and professional branding.",
      category: "invoice",
      subcategory: "finance",
      complexity: "simple",
      pages: 2,
      sections: ["Header", "Items", "Calculations", "Payment Terms", "Footer"],
      customizable: ["Branding", "Colors", "Fields", "Layout"],
      formats: ["PDF", "DOCX"],
      popularity: 92,
      downloads: 2100,
      rating: 4.9,
      reviews: 278,
      author: "Finance Team",
      created: "2024-01-12",
      updated: "2024-01-14",
      tags: ["invoice", "billing", "finance", "accounting"],
      preview: "/api/placeholder/400/500",
      price: "Free"
    },
    {
      id: "3",
      name: "Legal Contract Agreement",
      description: "Professional legal contract template with standard clauses, terms and conditions, and signature blocks.",
      category: "legal",
      subcategory: "contract",
      complexity: "advanced",
      pages: 12,
      sections: ["Parties", "Terms", "Obligations", "Payment", "Termination", "Signatures"],
      customizable: ["Clauses", "Terms", "Parties", "Duration"],
      formats: ["PDF", "DOCX"],
      popularity: 87,
      downloads: 650,
      rating: 4.7,
      reviews: 89,
      author: "Legal Team",
      created: "2024-01-10",
      updated: "2024-01-13",
      tags: ["legal", "contract", "agreement", "terms"],
      preview: "/api/placeholder/400/500",
      price: "Premium"
    },
    {
      id: "4",
      name: "Marketing Performance Report",
      description: "Comprehensive marketing report with KPI dashboards, campaign analysis, and visual charts.",
      category: "report",
      subcategory: "marketing",
      complexity: "advanced",
      pages: 15,
      sections: ["Executive Summary", "KPIs", "Campaign Analysis", "ROI", "Recommendations"],
      customizable: ["Charts", "Data", "Branding", "Metrics"],
      formats: ["PDF", "HTML"],
      popularity: 89,
      downloads: 890,
      rating: 4.6,
      reviews: 134,
      author: "Marketing Team",
      created: "2024-01-08",
      updated: "2024-01-11",
      tags: ["marketing", "report", "analytics", "performance"],
      preview: "/api/placeholder/400/500",
      price: "Premium"
    },
    {
      id: "5",
      name: "Meeting Minutes Template",
      description: "Simple, organized meeting minutes template with agenda items, action items, and attendance tracking.",
      category: "meeting",
      subcategory: "operations",
      complexity: "simple",
      pages: 3,
      sections: ["Meeting Info", "Attendees", "Agenda", "Discussion", "Action Items"],
      customizable: ["Layout", "Fields", "Branding"],
      formats: ["PDF", "DOCX", "HTML"],
      popularity: 85,
      downloads: 1500,
      rating: 4.5,
      reviews: 201,
      author: "Operations Team",
      created: "2024-01-05",
      updated: "2024-01-09",
      tags: ["meeting", "minutes", "notes", "operations"],
      preview: "/api/placeholder/400/500",
      price: "Free"
    },
    {
      id: "6",
      name: "Technical Documentation",
      description: "Comprehensive technical documentation template with code samples, API references, and tutorials.",
      category: "documentation",
      subcategory: "technical",
      complexity: "advanced",
      pages: 25,
      sections: ["Overview", "Getting Started", "API Reference", "Examples", "Troubleshooting"],
      customizable: ["Structure", "Code Samples", "Styling", "Navigation"],
      formats: ["PDF", "HTML"],
      popularity: 91,
      downloads: 750,
      rating: 4.8,
      reviews: 95,
      author: "Technical Team",
      created: "2024-01-03",
      updated: "2024-01-07",
      tags: ["documentation", "technical", "api", "tutorial"],
      preview: "/api/placeholder/400/500",
      price: "Premium"
    }
  ];

  const categories = ["all", "proposal", "invoice", "legal", "report", "meeting", "documentation"];
  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "downloads", label: "Downloads" },
    { value: "rating", label: "Rating" },
    { value: "recent", label: "Recently Updated" },
    { value: "name", label: "Name" }
  ];

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

  const filteredTemplates = templates
    .filter(template => {
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popularity": return b.popularity - a.popularity;
        case "downloads": return b.downloads - a.downloads;
        case "rating": return b.rating - a.rating;
        case "recent": return new Date(b.updated).getTime() - new Date(a.updated).getTime();
        case "name": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

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
                Document Templates
              </h1>
              <p className="text-black/60 mt-2">
                Professional document templates for every business need
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link
                href="/documents/generator"
                className="px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black"
              >
                Generate Document
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="p-6 rounded-lg border-2 border-black/30 bg-black/5">
            <div className="text-2xl font-bold text-black">{templates.length}</div>
            <div className="text-sm text-black/60">Available Templates</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-green-300 bg-green-50">
            <div className="text-2xl font-bold text-green-600">
              {templates.reduce((sum, t) => sum + t.downloads, 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Total Downloads</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-blue-300 bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">
              {(templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1)}
            </div>
            <div className="text-sm text-blue-600">Average Rating</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-purple-300 bg-purple-50">
            <div className="text-2xl font-bold text-purple-600">
              {templates.filter(t => t.price === "Free").length}
            </div>
            <div className="text-sm text-purple-600">Free Templates</div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-black/30 focus:border-black outline-none transition-all duration-300"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium uppercase tracking-wide ${
                    selectedCategory === category
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black/30 hover:border-black/50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-lg border-2 border-black/30 focus:border-black outline-none transition-all duration-300"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="group rounded-lg border-2 border-black/30 overflow-hidden transition-all duration-300 hover:border-black/50 hover:shadow-lg bg-white"
            >
              {/* Template Preview */}
              <div className="aspect-[4/5] bg-black/5 border-b-2 border-black/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">📄</div>
                  <div className="text-xs text-black/40">{template.name}</div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black group-hover:text-black/80 transition-colors leading-tight">
                      {template.name}
                    </h3>
                    <p className="text-sm text-black/60 capitalize">{template.subcategory}</p>
                  </div>
                  <div className="flex flex-col gap-1 ml-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getComplexityColor(template.complexity)}`}>
                      {template.complexity}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriceColor(template.price)}`}>
                      {template.price}
                    </span>
                  </div>
                </div>

                <p className="text-black/80 text-sm mb-4 leading-relaxed line-clamp-3">
                  {template.description}
                </p>

                {/* Template Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-xs text-black/60">
                    <span>📄 {template.pages} pages</span>
                    <span>📊 {template.sections.length} sections</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-black/60">
                    <span>⭐ {template.rating} ({template.reviews})</span>
                    <span>📥 {template.downloads}</span>
                  </div>
                </div>

                {/* Formats */}
                <div className="mb-4">
                  <div className="text-xs text-black/60 mb-1">Formats:</div>
                  <div className="flex gap-1">
                    {template.formats.map((format, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Customizable Features */}
                <div className="mb-4">
                  <div className="text-xs text-black/60 mb-1">Customizable:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.customizable.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-200"
                      >
                        {feature}
                      </span>
                    ))}
                    {template.customizable.length > 3 && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-200">
                        +{template.customizable.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/documents/${template.id}`}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg border-2 border-black font-medium text-sm transition-all duration-300 hover:bg-white hover:text-black text-center"
                  >
                    Use Template
                  </Link>
                  <button className="px-4 py-2 bg-white text-black rounded-lg border-2 border-black/30 font-medium text-sm transition-all duration-300 hover:border-black/50">
                    Preview
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-black mb-2">No templates found</h3>
            <p className="text-black/60">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}

        {/* Featured Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold tracking-wide uppercase text-black mb-8">
            Template Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(1).map((category) => {
              const categoryTemplates = templates.filter(t => t.category === category);
              const totalDownloads = categoryTemplates.reduce((sum, t) => sum + t.downloads, 0);

              return (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedCategory(category)}
                  className="p-4 border-2 border-black/30 rounded-lg hover:border-black/50 transition-all duration-300 text-center"
                >
                  <div className="text-2xl mb-2">
                    {category === "proposal" && "📋"}
                    {category === "invoice" && "💰"}
                    {category === "legal" && "📝"}
                    {category === "report" && "📊"}
                    {category === "meeting" && "🤝"}
                    {category === "documentation" && "📚"}
                  </div>
                  <div className="font-bold text-black capitalize text-sm">{category}</div>
                  <div className="text-xs text-black/60">{categoryTemplates.length} templates</div>
                  <div className="text-xs text-black/60">{totalDownloads} downloads</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}