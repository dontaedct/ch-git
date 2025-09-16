/**
 * @fileoverview Document Library Page
 * Document management and generation system
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const documents = [
    {
      id: "1",
      name: "Project Proposal Template",
      description: "Professional project proposal with timeline and budget sections",
      category: "proposal",
      type: "Template",
      format: ["PDF", "DOCX", "HTML"],
      size: "2.4 MB",
      pages: 8,
      downloads: 450,
      rating: 4.8,
      created: "2024-01-15",
      lastUpdated: "2024-01-15",
      author: "Agency Team",
      tags: ["business", "proposal", "project"],
      status: "published",
      complexity: "intermediate"
    },
    {
      id: "2",
      name: "Invoice Template",
      description: "Clean, professional invoice template with automatic calculations",
      category: "invoice",
      type: "Template",
      format: ["PDF", "DOCX"],
      size: "1.2 MB",
      pages: 2,
      downloads: 890,
      rating: 4.9,
      created: "2024-01-12",
      lastUpdated: "2024-01-14",
      author: "Finance Team",
      tags: ["finance", "invoice", "billing"],
      status: "published",
      complexity: "simple"
    },
    {
      id: "3",
      name: "Contract Agreement",
      description: "Legal contract template with customizable terms and conditions",
      category: "legal",
      type: "Template",
      format: ["PDF", "DOCX"],
      size: "3.1 MB",
      pages: 12,
      downloads: 320,
      rating: 4.7,
      created: "2024-01-10",
      lastUpdated: "2024-01-13",
      author: "Legal Team",
      tags: ["legal", "contract", "agreement"],
      status: "published",
      complexity: "advanced"
    },
    {
      id: "4",
      name: "Marketing Report",
      description: "Comprehensive marketing performance report with charts and analytics",
      category: "report",
      type: "Template",
      format: ["PDF", "HTML"],
      size: "4.5 MB",
      pages: 15,
      downloads: 250,
      rating: 4.6,
      created: "2024-01-08",
      lastUpdated: "2024-01-11",
      author: "Marketing Team",
      tags: ["marketing", "report", "analytics"],
      status: "published",
      complexity: "advanced"
    },
    {
      id: "5",
      name: "Meeting Minutes",
      description: "Simple meeting minutes template with action items and attendance",
      category: "meeting",
      type: "Template",
      format: ["PDF", "DOCX", "HTML"],
      size: "0.8 MB",
      pages: 3,
      downloads: 670,
      rating: 4.5,
      created: "2024-01-05",
      lastUpdated: "2024-01-09",
      author: "Operations Team",
      tags: ["meeting", "minutes", "notes"],
      status: "published",
      complexity: "simple"
    },
    {
      id: "6",
      name: "User Manual Template",
      description: "Technical documentation template with step-by-step instructions",
      category: "documentation",
      type: "Template",
      format: ["PDF", "HTML"],
      size: "5.2 MB",
      pages: 25,
      downloads: 180,
      rating: 4.8,
      created: "2024-01-03",
      lastUpdated: "2024-01-07",
      author: "Technical Team",
      tags: ["documentation", "manual", "technical"],
      status: "published",
      complexity: "advanced"
    }
  ];

  const categories = ["all", "proposal", "invoice", "legal", "report", "meeting", "documentation"];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "simple": return "text-green-600 bg-green-50";
      case "intermediate": return "text-orange-600 bg-orange-50";
      case "advanced": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "PDF": return "📄";
      case "DOCX": return "📝";
      case "HTML": return "🌐";
      default: return "📄";
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
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
                Document Library
              </h1>
              <p className="text-black/60 mt-2">
                Professional document templates with multi-format export capabilities
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Link
                href="/documents/templates"
                className="px-6 py-3 bg-white text-black rounded-lg border-2 border-black/30 font-bold transition-all duration-300 hover:border-black/50"
              >
                Browse Templates
              </Link>
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
            <div className="text-2xl font-bold text-black">{documents.length}</div>
            <div className="text-sm text-black/60">Document Templates</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-green-300 bg-green-50">
            <div className="text-2xl font-bold text-green-600">
              {documents.reduce((sum, d) => sum + d.downloads, 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Total Downloads</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-blue-300 bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">
              {(documents.reduce((sum, d) => sum + d.rating, 0) / documents.length).toFixed(1)}
            </div>
            <div className="text-sm text-blue-600">Average Rating</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-purple-300 bg-purple-50">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-purple-600">Export Formats</div>
          </div>
        </motion.div>

        {/* Search and Filters */}
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
                placeholder="Search documents..."
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
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-lg border-2 transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/30 hover:border-black/50"
                }`}
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-lg border-2 transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/30 hover:border-black/50"
                }`}
              >
                ☰
              </button>
            </div>
          </div>
        </motion.div>

        {/* Documents Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="group rounded-lg border-2 border-black/30 overflow-hidden transition-all duration-300 hover:border-black/50 hover:shadow-lg bg-white"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-black group-hover:text-black/80 transition-colors">
                          {doc.name}
                        </h3>
                        <p className="text-sm text-black/60">{doc.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(doc.complexity)}`}>
                        {doc.complexity}
                      </span>
                    </div>

                    <p className="text-black/80 text-sm mb-4 leading-relaxed">
                      {doc.description}
                    </p>

                    {/* Document Info */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-black/60 mb-2">
                        <span>📄 {doc.pages} pages</span>
                        <span>💾 {doc.size}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-black/60">
                        <span>⭐ {doc.rating}</span>
                        <span>📥 {doc.downloads}</span>
                      </div>
                    </div>

                    {/* Formats */}
                    <div className="mb-4">
                      <div className="text-xs text-black/60 mb-1">Available Formats</div>
                      <div className="flex gap-1">
                        {doc.format.map((fmt, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20 flex items-center gap-1"
                          >
                            {getFormatIcon(fmt)} {fmt}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/documents/${doc.id}`}
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
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 border-2 border-black/30 rounded-lg hover:border-black/50 transition-all duration-300 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-bold text-black">{doc.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(doc.complexity)}`}>
                          {doc.complexity}
                        </span>
                        <div className="flex gap-1">
                          {doc.format.map((fmt, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20"
                            >
                              {getFormatIcon(fmt)} {fmt}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-black/80 text-sm mb-2">{doc.description}</p>
                      <div className="flex items-center gap-6 text-xs text-black/60">
                        <span>📄 {doc.pages} pages</span>
                        <span>💾 {doc.size}</span>
                        <span>⭐ {doc.rating}</span>
                        <span>📥 {doc.downloads} downloads</span>
                        <span>👤 {doc.author}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="px-4 py-2 bg-black text-white rounded-lg border-2 border-black font-medium text-sm transition-all duration-300 hover:bg-white hover:text-black"
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
            </div>
          )}
        </motion.div>

        {/* No Results */}
        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-black mb-2">No documents found</h3>
            <p className="text-black/60">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            href="/documents/generator"
            className="p-6 border-2 border-black/30 rounded-lg hover:border-black/50 transition-all duration-300 text-center group"
          >
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-bold text-black group-hover:text-black/80">Generate Document</h3>
            <p className="text-sm text-black/60">Create a new document from template</p>
          </Link>

          <Link
            href="/documents/templates"
            className="p-6 border-2 border-black/30 rounded-lg hover:border-black/50 transition-all duration-300 text-center group"
          >
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-bold text-black group-hover:text-black/80">Browse Templates</h3>
            <p className="text-sm text-black/60">Explore all available templates</p>
          </Link>

          <Link
            href="/documents/export"
            className="p-6 border-2 border-black/30 rounded-lg hover:border-black/50 transition-all duration-300 text-center group"
          >
            <div className="text-3xl mb-2">📤</div>
            <h3 className="font-bold text-black group-hover:text-black/80">Export Options</h3>
            <p className="text-sm text-black/60">Multiple format export tools</p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}