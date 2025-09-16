/**
 * @fileoverview Template Builder Page
 * Drag-and-drop template builder with live preview
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function TemplateBuilderPage() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [templateComponents, setTemplateComponents] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const componentLibrary = [
    {
      id: "hero",
      name: "Hero Section",
      description: "Large banner with headline and CTA",
      category: "headers",
      icon: "🎯",
      config: {
        title: "Your Amazing Headline",
        subtitle: "Compelling subtitle that converts",
        buttonText: "Get Started",
        backgroundType: "gradient"
      }
    },
    {
      id: "features",
      name: "Features Grid",
      description: "Showcase key features in a grid",
      category: "content",
      icon: "✨",
      config: {
        title: "Key Features",
        columns: 3,
        features: [
          { title: "Feature 1", description: "Description 1" },
          { title: "Feature 2", description: "Description 2" },
          { title: "Feature 3", description: "Description 3" }
        ]
      }
    },
    {
      id: "testimonials",
      name: "Testimonials",
      description: "Customer testimonials carousel",
      category: "social",
      icon: "💬",
      config: {
        title: "What Our Customers Say",
        testimonials: [
          { name: "John Doe", company: "Company A", text: "Great service!" },
          { name: "Jane Smith", company: "Company B", text: "Highly recommended!" }
        ]
      }
    },
    {
      id: "contact",
      name: "Contact Form",
      description: "Contact form with validation",
      category: "forms",
      icon: "📧",
      config: {
        title: "Get In Touch",
        fields: ["name", "email", "message"],
        submitText: "Send Message"
      }
    },
    {
      id: "pricing",
      name: "Pricing Table",
      description: "Pricing plans comparison",
      category: "commerce",
      icon: "💰",
      config: {
        title: "Choose Your Plan",
        plans: [
          { name: "Basic", price: "$9", features: ["Feature 1", "Feature 2"] },
          { name: "Pro", price: "$19", features: ["All Basic", "Feature 3", "Feature 4"] }
        ]
      }
    },
    {
      id: "team",
      name: "Team Section",
      description: "Team member profiles",
      category: "content",
      icon: "👥",
      config: {
        title: "Meet Our Team",
        members: [
          { name: "John Doe", role: "CEO", bio: "Experienced leader" },
          { name: "Jane Smith", role: "CTO", bio: "Tech expert" }
        ]
      }
    }
  ];

  const categories = ["headers", "content", "social", "forms", "commerce"];

  const addComponent = (component: any) => {
    const newComponent = {
      ...component,
      id: `${component.id}_${Date.now()}`,
      order: templateComponents.length
    };
    setTemplateComponents([...templateComponents, newComponent]);
  };

  const removeComponent = (componentId: string) => {
    setTemplateComponents(templateComponents.filter(c => c.id !== componentId));
  };

  const moveComponent = (componentId: string, direction: "up" | "down") => {
    const index = templateComponents.findIndex(c => c.id === componentId);
    if (
      (direction === "up" && index > 0) ||
      (direction === "down" && index < templateComponents.length - 1)
    ) {
      const newComponents = [...templateComponents];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newComponents[index], newComponents[targetIndex]] = [newComponents[targetIndex], newComponents[index]];
      setTemplateComponents(newComponents);
    }
  };

  const renderComponentPreview = (component: any) => {
    switch (component.name.toLowerCase().replace(/\s+/g, "")) {
      case "herosection":
        return (
          <div className="bg-gradient-to-r from-black to-gray-800 text-white p-12 text-center">
            <h1 className="text-4xl font-bold mb-4">{component.config.title}</h1>
            <p className="text-xl mb-6">{component.config.subtitle}</p>
            <button className="px-6 py-3 bg-white text-black rounded-lg font-bold">
              {component.config.buttonText}
            </button>
          </div>
        );
      case "featuresgrid":
        return (
          <div className="p-12 bg-white">
            <h2 className="text-3xl font-bold text-center mb-8">{component.config.title}</h2>
            <div className="grid grid-cols-3 gap-6">
              {component.config.features.map((feature: any, idx: number) => (
                <div key={idx} className="text-center p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "testimonials":
        return (
          <div className="p-12 bg-gray-50">
            <h2 className="text-3xl font-bold text-center mb-8">{component.config.title}</h2>
            <div className="grid grid-cols-2 gap-6">
              {component.config.testimonials.map((testimonial: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-lg border">
                  <p className="mb-4">"{testimonial.text}"</p>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.company}</div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8 bg-gray-100 text-center border-2 border-dashed border-gray-300">
            <div className="text-2xl mb-2">{component.icon}</div>
            <div className="font-bold">{component.name}</div>
            <div className="text-sm text-gray-600">{component.description}</div>
          </div>
        );
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
                Template Builder
              </h1>
              <p className="text-black/60 mt-2">
                Create custom templates with drag-and-drop components
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium ${
                  previewMode
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/30 hover:border-black/50"
                }`}
              >
                {previewMode ? "Edit Mode" : "Preview Mode"}
              </button>
              <button className="px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black">
                Save Template
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Component Library */}
          {!previewMode && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-3 border-2 border-black/30 rounded-lg p-4 overflow-y-auto"
            >
              <h2 className="font-bold text-black mb-4 uppercase tracking-wide">Components</h2>

              {categories.map((category) => (
                <div key={category} className="mb-6">
                  <h3 className="font-bold text-black/80 mb-2 capitalize">{category}</h3>
                  <div className="space-y-2">
                    {componentLibrary
                      .filter(comp => comp.category === category)
                      .map((component) => (
                        <motion.div
                          key={component.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-3 border border-black/20 rounded-lg cursor-pointer hover:border-black/40 transition-all duration-300"
                          onClick={() => addComponent(component)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{component.icon}</span>
                            <div>
                              <div className="font-medium text-sm">{component.name}</div>
                              <div className="text-xs text-black/60">{component.description}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Template Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${previewMode ? "col-span-12" : "col-span-6"} border-2 border-black/30 rounded-lg overflow-y-auto`}
          >
            <div className="p-4 border-b border-black/20 bg-black/5">
              <h3 className="font-bold text-black">Template Canvas</h3>
            </div>
            <div className="min-h-full">
              {templateComponents.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-black/60">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎨</div>
                    <div>Drag components here to start building</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {templateComponents.map((component, index) => (
                    <motion.div
                      key={component.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative group"
                    >
                      {!previewMode && (
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveComponent(component.id, "up")}
                              disabled={index === 0}
                              className="p-1 bg-black text-white rounded text-xs disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveComponent(component.id, "down")}
                              disabled={index === templateComponents.length - 1}
                              className="p-1 bg-black text-white rounded text-xs disabled:opacity-50"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => removeComponent(component.id)}
                              className="p-1 bg-red-600 text-white rounded text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                      {renderComponentPreview(component)}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Component Properties */}
          {!previewMode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-3 border-2 border-black/30 rounded-lg p-4 overflow-y-auto"
            >
              <h2 className="font-bold text-black mb-4 uppercase tracking-wide">Properties</h2>

              {selectedComponent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-black/30 rounded-lg text-sm"
                      placeholder="Component title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Background</label>
                    <select className="w-full px-3 py-2 border border-black/30 rounded-lg text-sm">
                      <option>White</option>
                      <option>Black</option>
                      <option>Gradient</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Spacing</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-black/60 py-8">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div>Select a component to edit properties</div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Template Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-between items-center"
        >
          <div className="text-sm text-black/60">
            {templateComponents.length} components added
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border-2 border-black/30 text-black rounded-lg transition-all duration-300 hover:border-black/50">
              Export HTML
            </button>
            <button className="px-4 py-2 border-2 border-black/30 text-black rounded-lg transition-all duration-300 hover:border-black/50">
              Export React
            </button>
            <button className="px-4 py-2 bg-black text-white rounded-lg border-2 border-black transition-all duration-300 hover:bg-white hover:text-black">
              Publish Template
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}