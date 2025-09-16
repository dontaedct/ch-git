/**
 * @fileoverview Form Library Page
 * Comprehensive form management and templates
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function FormsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const forms = [
    {
      id: "1",
      name: "Contact Form",
      description: "Simple contact form with name, email, and message fields",
      category: "contact",
      type: "Basic",
      fields: ["name", "email", "message"],
      submissions: 1250,
      conversionRate: 85,
      lastUpdated: "2024-01-15",
      complexity: "simple",
      integrations: ["Email", "CRM", "Slack"],
      template: true
    },
    {
      id: "2",
      name: "Lead Capture Form",
      description: "Advanced lead capture with qualification fields",
      category: "lead",
      type: "Advanced",
      fields: ["name", "email", "phone", "company", "budget", "timeline"],
      submissions: 890,
      conversionRate: 72,
      lastUpdated: "2024-01-12",
      complexity: "advanced",
      integrations: ["CRM", "Marketing Automation", "Analytics"],
      template: true
    },
    {
      id: "3",
      name: "Event Registration",
      description: "Event registration form with attendee details",
      category: "registration",
      type: "Complex",
      fields: ["name", "email", "phone", "company", "dietary", "accessibility"],
      submissions: 650,
      conversionRate: 91,
      lastUpdated: "2024-01-10",
      complexity: "complex",
      integrations: ["Payment", "Calendar", "Email"],
      template: true
    },
    {
      id: "4",
      name: "Feedback Survey",
      description: "Customer satisfaction survey with rating scales",
      category: "survey",
      type: "Survey",
      fields: ["rating", "experience", "recommend", "improvements", "contact"],
      submissions: 2100,
      conversionRate: 68,
      lastUpdated: "2024-01-08",
      complexity: "intermediate",
      integrations: ["Analytics", "Reporting", "Email"],
      template: true
    },
    {
      id: "5",
      name: "Job Application",
      description: "Complete job application form with file uploads",
      category: "hr",
      type: "Complex",
      fields: ["personal", "experience", "education", "skills", "resume", "portfolio"],
      submissions: 320,
      conversionRate: 78,
      lastUpdated: "2024-01-14",
      complexity: "complex",
      integrations: ["ATS", "Email", "Document Storage"],
      template: true
    },
    {
      id: "6",
      name: "Newsletter Signup",
      description: "Simple newsletter subscription form",
      category: "marketing",
      type: "Basic",
      fields: ["email", "preferences"],
      submissions: 3200,
      conversionRate: 94,
      lastUpdated: "2024-01-11",
      complexity: "simple",
      integrations: ["Email Marketing", "Analytics"],
      template: true
    }
  ];

  const categories = ["all", "contact", "lead", "registration", "survey", "hr", "marketing"];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "simple": return "text-green-600 bg-green-50";
      case "intermediate": return "text-orange-600 bg-orange-50";
      case "complex": return "text-red-600 bg-red-50";
      case "advanced": return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesCategory = selectedCategory === "all" || form.category === selectedCategory;
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.fields.some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const fieldTypes = [
    { name: "Text Input", icon: "📝", description: "Single line text field" },
    { name: "Textarea", icon: "📄", description: "Multi-line text area" },
    { name: "Email", icon: "📧", description: "Email validation field" },
    { name: "Phone", icon: "📞", description: "Phone number field" },
    { name: "Select", icon: "📋", description: "Dropdown selection" },
    { name: "Radio", icon: "🔘", description: "Single choice options" },
    { name: "Checkbox", icon: "☑️", description: "Multiple choice options" },
    { name: "File Upload", icon: "📎", description: "File attachment field" },
    { name: "Date", icon: "📅", description: "Date picker field" },
    { name: "Time", icon: "⏰", description: "Time picker field" },
    { name: "Number", icon: "🔢", description: "Numeric input field" },
    { name: "Range", icon: "📊", description: "Slider range input" },
    { name: "Rating", icon: "⭐", description: "Star rating field" },
    { name: "Location", icon: "📍", description: "Address/location field" },
    { name: "URL", icon: "🔗", description: "Website URL field" },
    { name: "Password", icon: "🔒", description: "Password input field" },
    { name: "Color", icon: "🎨", description: "Color picker field" },
    { name: "Hidden", icon: "👁️", description: "Hidden value field" },
    { name: "Signature", icon: "✍️", description: "Digital signature field" },
    { name: "Rich Text", icon: "📝", description: "WYSIWYG editor field" },
    { name: "Currency", icon: "💰", description: "Currency input field" }
  ];

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
                Form Library
              </h1>
              <p className="text-black/60 mt-2">
                Pre-built forms and custom form builder with 21+ field types
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link
                href="/forms/builder"
                className="px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black"
              >
                Create New Form
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
            <div className="text-2xl font-bold text-black">{forms.length}</div>
            <div className="text-sm text-black/60">Form Templates</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-green-300 bg-green-50">
            <div className="text-2xl font-bold text-green-600">
              {forms.reduce((sum, f) => sum + f.submissions, 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Total Submissions</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-blue-300 bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(forms.reduce((sum, f) => sum + f.conversionRate, 0) / forms.length)}%
            </div>
            <div className="text-sm text-blue-600">Avg Conversion Rate</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-purple-300 bg-purple-50">
            <div className="text-2xl font-bold text-purple-600">{fieldTypes.length}</div>
            <div className="text-sm text-purple-600">Field Types Available</div>
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
                placeholder="Search forms..."
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

        {/* Forms Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredForms.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="group rounded-lg border-2 border-black/30 overflow-hidden transition-all duration-300 hover:border-black/50 hover:shadow-lg bg-white"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-black group-hover:text-black/80 transition-colors">
                      {form.name}
                    </h3>
                    <p className="text-sm text-black/60">{form.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(form.complexity)}`}>
                    {form.complexity}
                  </span>
                </div>

                <p className="text-black/80 text-sm mb-4 leading-relaxed">
                  {form.description}
                </p>

                {/* Field Count */}
                <div className="mb-4">
                  <div className="text-xs text-black/60 mb-1">Fields ({form.fields.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {form.fields.slice(0, 4).map((field, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20"
                      >
                        {field}
                      </span>
                    ))}
                    {form.fields.length > 4 && (
                      <span className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20">
                        +{form.fields.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-black/60 mb-4">
                  <div className="flex items-center gap-4">
                    <span>📊 {form.submissions} submissions</span>
                    <span>📈 {form.conversionRate}% conversion</span>
                  </div>
                </div>

                {/* Integrations */}
                <div className="mb-4">
                  <div className="text-xs text-black/60 mb-1">Integrations</div>
                  <div className="flex flex-wrap gap-1">
                    {form.integrations.slice(0, 2).map((integration, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-200"
                      >
                        {integration}
                      </span>
                    ))}
                    {form.integrations.length > 2 && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-200">
                        +{form.integrations.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/forms/${form.id}`}
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

        {/* Field Types Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold tracking-wide uppercase text-black mb-6">
            Available Field Types ({fieldTypes.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {fieldTypes.map((fieldType, index) => (
              <motion.div
                key={fieldType.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                className="p-4 rounded-lg border-2 border-black/30 bg-white hover:border-black/50 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{fieldType.icon}</div>
                  <div className="font-bold text-black text-sm">{fieldType.name}</div>
                  <div className="text-xs text-black/60 mt-1">{fieldType.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* No Results */}
        {filteredForms.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-black mb-2">No forms found</h3>
            <p className="text-black/60">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}