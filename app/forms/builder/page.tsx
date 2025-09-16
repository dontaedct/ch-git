/**
 * @fileoverview Form Builder Page
 * Drag-and-drop form builder with 21+ field types
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: any;
  order: number;
}

export default function FormBuilderPage() {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [formSettings, setFormSettings] = useState({
    name: "Untitled Form",
    description: "",
    submitText: "Submit",
    redirectUrl: "",
    email: "",
    theme: "default"
  });

  const fieldTypes = [
    { type: "text", name: "Text Input", icon: "📝", category: "basic" },
    { type: "textarea", name: "Text Area", icon: "📄", category: "basic" },
    { type: "email", name: "Email", icon: "📧", category: "basic" },
    { type: "phone", name: "Phone", icon: "📞", category: "basic" },
    { type: "number", name: "Number", icon: "🔢", category: "basic" },
    { type: "select", name: "Select", icon: "📋", category: "choice" },
    { type: "radio", name: "Radio", icon: "🔘", category: "choice" },
    { type: "checkbox", name: "Checkbox", icon: "☑️", category: "choice" },
    { type: "date", name: "Date", icon: "📅", category: "special" },
    { type: "time", name: "Time", icon: "⏰", category: "special" },
    { type: "file", name: "File Upload", icon: "📎", category: "special" },
    { type: "range", name: "Range", icon: "📊", category: "special" },
    { type: "rating", name: "Rating", icon: "⭐", category: "special" },
    { type: "url", name: "URL", icon: "🔗", category: "special" },
    { type: "password", name: "Password", icon: "🔒", category: "special" },
    { type: "color", name: "Color", icon: "🎨", category: "special" },
    { type: "currency", name: "Currency", icon: "💰", category: "special" },
    { type: "location", name: "Location", icon: "📍", category: "special" },
    { type: "signature", name: "Signature", icon: "✍️", category: "special" },
    { type: "richtext", name: "Rich Text", icon: "📝", category: "special" },
    { type: "hidden", name: "Hidden", icon: "👁️", category: "special" }
  ];

  const categories = ["basic", "choice", "special"];

  const addField = (fieldType: any) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: fieldType.type,
      label: fieldType.name,
      placeholder: `Enter ${fieldType.name.toLowerCase()}`,
      required: false,
      options: fieldType.type === "select" || fieldType.type === "radio" || fieldType.type === "checkbox"
        ? ["Option 1", "Option 2", "Option 3"] : undefined,
      order: formFields.length
    };
    setFormFields([...formFields, newField]);
  };

  const removeField = (fieldId: string) => {
    setFormFields(formFields.filter(f => f.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const index = formFields.findIndex(f => f.id === fieldId);
    if (
      (direction === "up" && index > 0) ||
      (direction === "down" && index < formFields.length - 1)
    ) {
      const newFields = [...formFields];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFormFields(newFields);
    }
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormFields(formFields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
      case "url":
      case "password":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-black/30 rounded-lg"
              disabled
            />
          </div>
        );
      case "textarea":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-black/30 rounded-lg h-24"
              disabled
            />
          </div>
        );
      case "select":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select className="w-full px-3 py-2 border border-black/30 rounded-lg" disabled>
              <option>Select an option</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      case "radio":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1">
                <input type="radio" name={field.id} disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1">
                <input type="checkbox" disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );
      case "file":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-black/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📎</div>
              <div className="text-sm text-black/60">Click to upload or drag and drop</div>
            </div>
          </div>
        );
      case "rating":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-2xl text-gray-300 cursor-pointer">⭐</span>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="mb-4 p-4 border border-black/30 rounded-lg bg-gray-50 text-center">
            <div className="text-black/60">
              {fieldTypes.find(ft => ft.type === field.type)?.icon} {field.label}
            </div>
          </div>
        );
    }
  };

  const selectedFieldData = formFields.find(f => f.id === selectedField);

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
                Form Builder
              </h1>
              <p className="text-black/60 mt-2">
                Create custom forms with 21+ field types
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
                Save Form
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Field Library */}
          {!previewMode && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-3 border-2 border-black/30 rounded-lg p-4 overflow-y-auto"
            >
              <h2 className="font-bold text-black mb-4 uppercase tracking-wide">Field Types</h2>

              {categories.map((category) => (
                <div key={category} className="mb-6">
                  <h3 className="font-bold text-black/80 mb-2 capitalize">{category}</h3>
                  <div className="space-y-2">
                    {fieldTypes
                      .filter(field => field.category === category)
                      .map((fieldType) => (
                        <motion.div
                          key={fieldType.type}
                          whileHover={{ scale: 1.02 }}
                          className="p-3 border border-black/20 rounded-lg cursor-pointer hover:border-black/40 transition-all duration-300"
                          onClick={() => addField(fieldType)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{fieldType.icon}</span>
                            <div>
                              <div className="font-medium text-sm">{fieldType.name}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Form Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${previewMode ? "col-span-12" : "col-span-6"} border-2 border-black/30 rounded-lg overflow-y-auto`}
          >
            <div className="p-4 border-b border-black/20 bg-black/5">
              <h3 className="font-bold text-black">{formSettings.name}</h3>
              {formSettings.description && (
                <p className="text-sm text-black/60 mt-1">{formSettings.description}</p>
              )}
            </div>
            <div className="p-6">
              {formFields.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-black/60">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📝</div>
                    <div>Drag field types here to start building</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {formFields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative group ${selectedField === field.id ? "ring-2 ring-black/50 rounded-lg p-2" : ""}`}
                      onClick={() => setSelectedField(field.id)}
                    >
                      {!previewMode && (
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveField(field.id, "up");
                              }}
                              disabled={index === 0}
                              className="p-1 bg-black text-white rounded text-xs disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveField(field.id, "down");
                              }}
                              disabled={index === formFields.length - 1}
                              className="p-1 bg-black text-white rounded text-xs disabled:opacity-50"
                            >
                              ↓
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeField(field.id);
                              }}
                              className="p-1 bg-red-600 text-white rounded text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                      {renderFieldPreview(field)}
                    </motion.div>
                  ))}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      className="w-full px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black"
                      disabled
                    >
                      {formSettings.submitText}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Field Properties */}
          {!previewMode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-3 border-2 border-black/30 rounded-lg p-4 overflow-y-auto"
            >
              <h2 className="font-bold text-black mb-4 uppercase tracking-wide">Properties</h2>

              {selectedFieldData ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Label</label>
                    <input
                      type="text"
                      value={selectedFieldData.label}
                      onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                      className="w-full px-3 py-2 border border-black/30 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Placeholder</label>
                    <input
                      type="text"
                      value={selectedFieldData.placeholder || ""}
                      onChange={(e) => updateField(selectedFieldData.id, { placeholder: e.target.value })}
                      className="w-full px-3 py-2 border border-black/30 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedFieldData.required}
                        onChange={(e) => updateField(selectedFieldData.id, { required: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-black">Required field</span>
                    </label>
                  </div>
                  {(selectedFieldData.type === "select" || selectedFieldData.type === "radio" || selectedFieldData.type === "checkbox") && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Options</label>
                      {selectedFieldData.options?.map((option, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(selectedFieldData.options || [])];
                              newOptions[idx] = e.target.value;
                              updateField(selectedFieldData.id, { options: newOptions });
                            }}
                            className="flex-1 px-3 py-2 border border-black/30 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => {
                              const newOptions = selectedFieldData.options?.filter((_, i) => i !== idx);
                              updateField(selectedFieldData.id, { options: newOptions });
                            }}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newOptions = [...(selectedFieldData.options || []), `Option ${(selectedFieldData.options?.length || 0) + 1}`];
                          updateField(selectedFieldData.id, { options: newOptions });
                        }}
                        className="text-sm text-black/60 hover:text-black"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-black/60 py-8">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div>Select a field to edit properties</div>
                </div>
              )}

              {/* Form Settings */}
              <div className="mt-8 pt-4 border-t border-black/20">
                <h3 className="font-bold text-black mb-4">Form Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Form Name</label>
                    <input
                      type="text"
                      value={formSettings.name}
                      onChange={(e) => setFormSettings({...formSettings, name: e.target.value})}
                      className="w-full px-3 py-2 border border-black/30 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Description</label>
                    <textarea
                      value={formSettings.description}
                      onChange={(e) => setFormSettings({...formSettings, description: e.target.value})}
                      className="w-full px-3 py-2 border border-black/30 rounded-lg text-sm h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Submit Button Text</label>
                    <input
                      type="text"
                      value={formSettings.submitText}
                      onChange={(e) => setFormSettings({...formSettings, submitText: e.target.value})}
                      className="w-full px-3 py-2 border border-black/30 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Form Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-between items-center"
        >
          <div className="text-sm text-black/60">
            {formFields.length} fields added
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border-2 border-black/30 text-black rounded-lg transition-all duration-300 hover:border-black/50">
              Export HTML
            </button>
            <button className="px-4 py-2 border-2 border-black/30 text-black rounded-lg transition-all duration-300 hover:border-black/50">
              Export React
            </button>
            <button className="px-4 py-2 bg-black text-white rounded-lg border-2 border-black transition-all duration-300 hover:bg-white hover:text-black">
              Publish Form
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}