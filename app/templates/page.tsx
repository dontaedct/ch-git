/**
 * @fileoverview Template Library Page
 * Comprehensive template management and showcase
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const templates = [
    {
      id: "1",
      name: "Modern Business Landing",
      description: "Clean, professional landing page template for modern businesses",
      category: "landing",
      type: "Website",
      tags: ["responsive", "modern", "business"],
      thumbnail: "/api/placeholder/400/300",
      features: ["Hero Section", "Services Grid", "Testimonials", "Contact Form"],
      popularity: 95,
      downloads: 1250,
      rating: 4.8,
      lastUpdated: "2024-01-15",
      difficulty: "beginner",
      estimatedTime: "2-4 hours"
    },
    {
      id: "2",
      name: "E-commerce Product Page",
      description: "Complete product page template with shopping cart integration",
      category: "ecommerce",
      type: "Website",
      tags: ["ecommerce", "product", "cart"],
      thumbnail: "/api/placeholder/400/300",
      features: ["Product Gallery", "Reviews", "Related Products", "Add to Cart"],
      popularity: 88,
      downloads: 980,
      rating: 4.7,
      lastUpdated: "2024-01-12",
      difficulty: "intermediate",
      estimatedTime: "4-6 hours"
    },
    {
      id: "3",
      name: "Portfolio Showcase",
      description: "Creative portfolio template for designers and developers",
      category: "portfolio",
      type: "Website",
      tags: ["portfolio", "creative", "showcase"],
      thumbnail: "/api/placeholder/400/300",
      features: ["Project Grid", "About Section", "Skills", "Contact"],
      popularity: 92,
      downloads: 1100,
      rating: 4.9,
      lastUpdated: "2024-01-10",
      difficulty: "beginner",
      estimatedTime: "3-5 hours"
    },
    {
      id: "4",
      name: "Blog Article Layout",
      description: "Clean blog template with reading optimization",
      category: "blog",
      type: "Content",
      tags: ["blog", "article", "reading"],
      thumbnail: "/api/placeholder/400/300",
      features: ["Article Header", "Table of Contents", "Comments", "Related Posts"],
      popularity: 85,
      downloads: 750,
      rating: 4.6,
      lastUpdated: "2024-01-08",
      difficulty: "beginner",
      estimatedTime: "2-3 hours"
    },
    {
      id: "5",
      name: "Dashboard Analytics",
      description: "Data visualization dashboard template",
      category: "dashboard",
      type: "Application",
      tags: ["dashboard", "analytics", "charts"],
      thumbnail: "/api/placeholder/400/300",
      features: ["Charts", "KPI Cards", "Data Tables", "Filters"],
      popularity: 90,
      downloads: 1050,
      rating: 4.8,
      lastUpdated: "2024-01-14",
      difficulty: "advanced",
      estimatedTime: "6-8 hours"
    },
    {
      id: "6",
      name: "Documentation Site",
      description: "Technical documentation template with search",
      category: "documentation",
      type: "Content",
      tags: ["docs", "technical", "search"],
      thumbnail: "/api/placeholder/400/300",
      features: ["Navigation Tree", "Search", "Code Blocks", "API Reference"],
      popularity: 87,
      downloads: 890,
      rating: 4.7,
      lastUpdated: "2024-01-11",
      difficulty: "intermediate",
      estimatedTime: "4-6 hours"
    }
  ];

  const categories = ["all", "landing", "ecommerce", "portfolio", "blog", "dashboard", "documentation"];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-600 bg-green-50";
      case "intermediate": return "text-orange-600 bg-orange-50";
      case "advanced": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
                Template Library
              </h1>
              <p className="text-black/60 mt-2">
                Professional templates for rapid development and deployment
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link
                href="/templates/builder"
                className="px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black"
              >
                Create New Template
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
            <div className="text-sm text-black/60">Total Templates</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-green-300 bg-green-50">
            <div className="text-2xl font-bold text-green-600">
              {templates.reduce((sum, t) => sum + t.downloads, 0)}
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
            <div className="text-2xl font-bold text-purple-600">{categories.length - 1}</div>
            <div className="text-sm text-purple-600">Categories</div>
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
              {/* Template Thumbnail */}
              <div className="aspect-video bg-black/5 border-b-2 border-black/30 flex items-center justify-center">
                <div className="text-black/40 text-lg font-bold">
                  {template.name.split(' ').map(word => word[0]).join('')}
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-black group-hover:text-black/80 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-black/60">{template.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                </div>

                <p className="text-black/80 text-sm mb-4 leading-relaxed">
                  {template.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20"
                      >
                        {feature}
                      </span>
                    ))}
                    {template.features.length > 3 && (
                      <span className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20">
                        +{template.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-black/60 mb-4">
                  <div className="flex items-center gap-4">
                    <span>⭐ {template.rating}</span>
                    <span>📥 {template.downloads}</span>
                    <span>⏱️ {template.estimatedTime}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/templates/${template.id}`}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg border-2 border-black font-medium text-sm transition-all duration-300 hover:bg-white hover:text-black text-center"
                  >
                    View Details
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
      </div>
    </div>
  );
}