/**
 * @fileoverview Document Generator Page
 * Interactive document generation with template selection and customization
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function DocumentGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [documentData, setDocumentData] = useState<any>({});
  const [exportFormat, setExportFormat] = useState("PDF");

  const templates = [
    {
      id: "proposal",
      name: "Project Proposal",
      description: "Professional project proposal with timeline and budget",
      icon: "📋",
      fields: ["projectName", "clientName", "budget", "timeline", "description"],
      category: "business"
    },
    {
      id: "invoice",
      name: "Invoice",
      description: "Clean invoice template with automatic calculations",
      icon: "💰",
      fields: ["invoiceNumber", "clientInfo", "items", "dueDate"],
      category: "finance"
    },
    {
      id: "contract",
      name: "Contract Agreement",
      description: "Legal contract with customizable terms",
      icon: "📝",
      fields: ["parties", "terms", "duration", "payment", "signatures"],
      category: "legal"
    },
    {
      id: "report",
      name: "Business Report",
      description: "Comprehensive business report with charts",
      icon: "📊",
      fields: ["title", "executive_summary", "data", "conclusions"],
      category: "reporting"
    }
  ];

  const fieldTemplates = {
    proposal: {
      projectName: { type: "text", label: "Project Name", required: true },
      clientName: { type: "text", label: "Client Name", required: true },
      budget: { type: "currency", label: "Project Budget", required: true },
      timeline: { type: "date", label: "Project Timeline", required: true },
      description: { type: "textarea", label: "Project Description", required: true }
    },
    invoice: {
      invoiceNumber: { type: "text", label: "Invoice Number", required: true },
      clientInfo: { type: "object", label: "Client Information", fields: ["name", "address", "email"] },
      items: { type: "array", label: "Invoice Items", fields: ["description", "quantity", "rate"] },
      dueDate: { type: "date", label: "Due Date", required: true }
    },
    contract: {
      parties: { type: "object", label: "Contract Parties", fields: ["party1", "party2"] },
      terms: { type: "textarea", label: "Terms and Conditions", required: true },
      duration: { type: "text", label: "Contract Duration", required: true },
      payment: { type: "object", label: "Payment Terms", fields: ["amount", "schedule"] },
      signatures: { type: "object", label: "Signatures", fields: ["date", "location"] }
    },
    report: {
      title: { type: "text", label: "Report Title", required: true },
      executive_summary: { type: "textarea", label: "Executive Summary", required: true },
      data: { type: "object", label: "Data Section", fields: ["charts", "tables"] },
      conclusions: { type: "textarea", label: "Conclusions", required: true }
    }
  };

  const exportFormats = ["PDF", "DOCX", "HTML"];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCurrentStep(2);
    setDocumentData({});
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setDocumentData({ ...documentData, [fieldName]: value });
  };

  const handleGenerate = () => {
    // Mock document generation
    console.log("Generating document:", {
      template: selectedTemplate,
      data: documentData,
      format: exportFormat
    });
    setCurrentStep(4);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= step
                ? "bg-black text-white"
                : "bg-black/20 text-black/60"
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-12 h-0.5 ${
                currentStep > step ? "bg-black" : "bg-black/20"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6 text-center">
        Choose a Template
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            className="p-6 border-2 border-black/30 rounded-lg cursor-pointer hover:border-black/50 transition-all duration-300"
            onClick={() => handleTemplateSelect(template.id)}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">{template.icon}</div>
              <h3 className="text-lg font-bold text-black mb-2">{template.name}</h3>
              <p className="text-black/60 text-sm">{template.description}</p>
              <div className="mt-4">
                <span className="px-3 py-1 bg-black/5 text-black/70 text-xs rounded border border-black/20">
                  {template.category}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    const fields = fieldTemplates[selectedTemplate as keyof typeof fieldTemplates];

    if (!template || !fields) return null;

    return (
      <div>
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          Fill Document Details
        </h2>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 p-4 border border-black/20 rounded-lg bg-black/5">
            <h3 className="font-bold text-black mb-2">Selected Template: {template.name}</h3>
            <p className="text-black/60 text-sm">{template.description}</p>
          </div>

          <div className="space-y-6">
            {Object.entries(fields).map(([fieldName, fieldConfig]) => (
              <div key={fieldName}>
                <label className="block text-sm font-medium text-black mb-2">
                  {fieldConfig.label}
                  {'required' in fieldConfig && fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {fieldConfig.type === "text" && (
                  <input
                    type="text"
                    value={documentData[fieldName] || ""}
                    onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300"
                    required={'required' in fieldConfig ? fieldConfig.required : false}
                  />
                )}

                {fieldConfig.type === "textarea" && (
                  <textarea
                    value={documentData[fieldName] || ""}
                    onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300 h-32"
                    required={'required' in fieldConfig ? fieldConfig.required : false}
                  />
                )}

                {fieldConfig.type === "currency" && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/60">$</span>
                    <input
                      type="number"
                      value={documentData[fieldName] || ""}
                      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300"
                      required={'required' in fieldConfig ? fieldConfig.required : false}
                    />
                  </div>
                )}

                {fieldConfig.type === "date" && (
                  <input
                    type="date"
                    value={documentData[fieldName] || ""}
                    onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300"
                    required={'required' in fieldConfig ? fieldConfig.required : false}
                  />
                )}

                {fieldConfig.type === "object" && (
                  <div className="space-y-3 p-4 border border-black/20 rounded-lg bg-black/5">
                    {'fields' in fieldConfig && fieldConfig.fields?.map((subField: string) => (
                      <div key={subField}>
                        <label className="block text-xs font-medium text-black/70 mb-1 capitalize">
                          {subField.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type="text"
                          value={documentData[fieldName]?.[subField] || ""}
                          onChange={(e) => handleFieldChange(fieldName, {
                            ...documentData[fieldName],
                            [subField]: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-black/30 rounded text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 bg-white text-black rounded-lg border-2 border-black/30 font-bold transition-all duration-300 hover:border-black/50"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6 text-center">
        Preview & Export Options
      </h2>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-black mb-4">Document Preview</h3>
            <div className="border-2 border-black/30 rounded-lg p-6 bg-white min-h-96">
              <div className="text-center text-black/60">
                <div className="text-4xl mb-4">📄</div>
                <div className="font-bold text-black mb-2">
                  {templates.find(t => t.id === selectedTemplate)?.name}
                </div>
                <div className="text-sm">Preview will be generated here</div>

                {/* Mock preview content */}
                <div className="mt-8 text-left space-y-4">
                  {Object.entries(documentData).map(([key, value]) => (
                    <div key={key} className="p-3 bg-black/5 rounded border border-black/20">
                      <div className="text-xs font-medium text-black/60 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="text-sm text-black">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-bold text-black mb-4">Export Options</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Export Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300"
                >
                  {exportFormats.map((format) => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-black">Include header/footer</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-black">Add page numbers</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm text-black">Watermark</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-black">High quality images</span>
                </label>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleGenerate}
                  className="w-full px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black"
                >
                  Generate Document
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-3 bg-white text-black rounded-lg border-2 border-black/30 font-bold transition-all duration-300 hover:border-black/50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6 text-center">
        Document Generated Successfully!
      </h2>
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-6">✅</div>
        <p className="text-black/80 mb-8">
          Your document has been generated and is ready for download.
        </p>

        <div className="p-6 border-2 border-green-300 rounded-lg bg-green-50 mb-8">
          <h3 className="font-bold text-green-800 mb-2">Document Details</h3>
          <div className="space-y-1 text-sm text-green-700">
            <div>Template: {templates.find(t => t.id === selectedTemplate)?.name}</div>
            <div>Format: {exportFormat}</div>
            <div>Generated: {new Date().toLocaleString()}</div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg border-2 border-green-600 font-bold transition-all duration-300 hover:bg-white hover:text-green-600">
            Download Document
          </button>
          <button className="px-6 py-3 bg-white text-black rounded-lg border-2 border-black/30 font-bold transition-all duration-300 hover:border-black/50">
            Preview Document
          </button>
          <button
            onClick={() => {
              setCurrentStep(1);
              setSelectedTemplate(null);
              setDocumentData({});
            }}
            className="px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black"
          >
            Generate Another
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
              Document Generator
            </h1>
            <p className="text-black/60 mt-2">
              Create professional documents with our intelligent generator
            </p>
          </div>
        </motion.div>

        {/* Step Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {renderStepIndicator()}
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </motion.div>
      </div>
    </div>
  );
}