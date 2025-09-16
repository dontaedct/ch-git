/**
 * @fileoverview Document Export Page
 * Multi-format export tools and batch processing
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function DocumentExportPage() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState("PDF");
  const [exportSettings, setExportSettings] = useState({
    quality: "high",
    includeImages: true,
    includeHeader: true,
    includeFooter: true,
    pageNumbers: true,
    watermark: false,
    compression: "medium"
  });

  const documents = [
    {
      id: "1",
      name: "Project Proposal - TechCorp",
      type: "Proposal",
      pages: 8,
      size: "2.4 MB",
      status: "ready",
      lastModified: "2024-01-15",
      format: "Template"
    },
    {
      id: "2",
      name: "Invoice #2024-001",
      type: "Invoice",
      pages: 2,
      size: "1.2 MB",
      status: "ready",
      lastModified: "2024-01-14",
      format: "Generated"
    },
    {
      id: "3",
      name: "Marketing Report Q4",
      type: "Report",
      pages: 15,
      size: "4.5 MB",
      status: "processing",
      lastModified: "2024-01-13",
      format: "Template"
    },
    {
      id: "4",
      name: "Service Agreement",
      type: "Contract",
      pages: 12,
      size: "3.1 MB",
      status: "ready",
      lastModified: "2024-01-12",
      format: "Generated"
    },
    {
      id: "5",
      name: "Meeting Minutes - Team Sync",
      type: "Minutes",
      pages: 3,
      size: "0.8 MB",
      status: "ready",
      lastModified: "2024-01-11",
      format: "Template"
    }
  ];

  const exportFormats = [
    { value: "PDF", label: "PDF", icon: "📄", description: "Portable Document Format" },
    { value: "DOCX", label: "DOCX", icon: "📝", description: "Microsoft Word Document" },
    { value: "HTML", label: "HTML", icon: "🌐", description: "Web Page Format" },
    { value: "ZIP", label: "ZIP", icon: "📦", description: "Compressed Archive" }
  ];

  const qualityOptions = [
    { value: "low", label: "Low (Fast)", description: "Smaller file size, faster processing" },
    { value: "medium", label: "Medium (Balanced)", description: "Balanced file size and quality" },
    { value: "high", label: "High (Best)", description: "Best quality, larger file size" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "text-green-600 bg-green-50 border-green-200";
      case "processing": return "text-orange-600 bg-orange-50 border-orange-200";
      case "error": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAllDocuments = () => {
    const readyDocs = documents.filter(doc => doc.status === "ready").map(doc => doc.id);
    setSelectedDocuments(readyDocs);
  };

  const clearSelection = () => {
    setSelectedDocuments([]);
  };

  const handleExport = () => {
    console.log("Exporting documents:", {
      documents: selectedDocuments,
      format: exportFormat,
      settings: exportSettings
    });
    // Mock export process
    alert(`Exporting ${selectedDocuments.length} documents to ${exportFormat} format`);
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
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
              Document Export Center
            </h1>
            <p className="text-black/60 mt-2">
              Export your documents in multiple formats with advanced options
            </p>
          </div>
        </motion.div>

        {/* Export Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 border-2 border-black/30 rounded-lg bg-black/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-black">Export Summary</h2>
              <p className="text-black/60">
                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected for export
                {selectedDocuments.length > 0 && ` as ${exportFormat}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAllDocuments}
                className="px-4 py-2 bg-white text-black rounded-lg border-2 border-black/30 text-sm font-medium transition-all duration-300 hover:border-black/50"
              >
                Select All Ready
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-white text-black rounded-lg border-2 border-black/30 text-sm font-medium transition-all duration-300 hover:border-black/50"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Selection */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-black mb-6">Select Documents</h2>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 border-2 rounded-lg transition-all duration-300 cursor-pointer ${
                      selectedDocuments.includes(doc.id)
                        ? "border-black bg-black/5"
                        : "border-black/30 hover:border-black/50"
                    } ${doc.status !== "ready" ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => doc.status === "ready" && toggleDocumentSelection(doc.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => toggleDocumentSelection(doc.id)}
                          disabled={doc.status !== "ready"}
                          className="w-4 h-4"
                        />
                        <div>
                          <h3 className="font-bold text-black">{doc.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-black/60">
                            <span>{doc.type}</span>
                            <span>📄 {doc.pages} pages</span>
                            <span>💾 {doc.size}</span>
                            <span>📅 {new Date(doc.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                        <span className="px-2 py-1 bg-black/5 text-black/70 text-xs rounded">
                          {doc.format}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Export Settings */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-black mb-6">Export Settings</h2>

                {/* Format Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-3">Export Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {exportFormats.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setExportFormat(format.value)}
                        className={`p-3 border-2 rounded-lg transition-all duration-300 text-left ${
                          exportFormat === format.value
                            ? "border-black bg-black/5"
                            : "border-black/30 hover:border-black/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{format.icon}</span>
                          <span className="font-bold text-black">{format.label}</span>
                        </div>
                        <div className="text-xs text-black/60">{format.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Settings */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-3">Export Quality</label>
                  {qualityOptions.map((option) => (
                    <label key={option.value} className="flex items-start gap-2 mb-2 cursor-pointer">
                      <input
                        type="radio"
                        name="quality"
                        value={option.value}
                        checked={exportSettings.quality === option.value}
                        onChange={(e) => setExportSettings({...exportSettings, quality: e.target.value})}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-black">{option.label}</div>
                        <div className="text-xs text-black/60">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Additional Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-3">Additional Options</label>
                  <div className="space-y-3">
                    {[
                      { key: "includeImages", label: "Include Images", description: "Embed all images in the document" },
                      { key: "includeHeader", label: "Include Header", description: "Add header to each page" },
                      { key: "includeFooter", label: "Include Footer", description: "Add footer to each page" },
                      { key: "pageNumbers", label: "Page Numbers", description: "Add page numbers to the document" },
                      { key: "watermark", label: "Add Watermark", description: "Include watermark on each page" }
                    ].map((option) => (
                      <label key={option.key} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportSettings[option.key as keyof typeof exportSettings] as boolean}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            [option.key]: e.target.checked
                          })}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-black text-sm">{option.label}</div>
                          <div className="text-xs text-black/60">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Compression */}
                {exportFormat === "PDF" && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-black mb-2">Compression</label>
                    <select
                      value={exportSettings.compression}
                      onChange={(e) => setExportSettings({...exportSettings, compression: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300"
                    >
                      <option value="none">No Compression</option>
                      <option value="low">Low Compression</option>
                      <option value="medium">Medium Compression</option>
                      <option value="high">High Compression</option>
                    </select>
                  </div>
                )}

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  disabled={selectedDocuments.length === 0}
                  className={`w-full px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300 ${
                    selectedDocuments.length > 0
                      ? "bg-black text-white border-black hover:bg-white hover:text-black"
                      : "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                  }`}
                >
                  Export {selectedDocuments.length} Document{selectedDocuments.length !== 1 ? 's' : ''}
                </button>

                {/* Export Preview */}
                {selectedDocuments.length > 0 && (
                  <div className="mt-6 p-4 border border-black/20 rounded-lg bg-black/5">
                    <h4 className="font-bold text-black mb-2">Export Preview</h4>
                    <div className="text-sm text-black/80 space-y-1">
                      <div>Format: {exportFormat}</div>
                      <div>Quality: {exportSettings.quality}</div>
                      <div>Documents: {selectedDocuments.length}</div>
                      <div>
                        Total Pages: {
                          documents
                            .filter(doc => selectedDocuments.includes(doc.id))
                            .reduce((sum, doc) => sum + doc.pages, 0)
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Export History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-xl font-bold text-black mb-6">Recent Exports</h2>
          <div className="space-y-3">
            {[
              { name: "Project Proposal Bundle", format: "PDF", date: "2024-01-15", size: "5.2 MB", status: "completed" },
              { name: "Invoice Package Q1", format: "ZIP", date: "2024-01-14", size: "8.1 MB", status: "completed" },
              { name: "Marketing Reports", format: "HTML", date: "2024-01-13", size: "12.4 MB", status: "failed" },
              { name: "Legal Documents", format: "DOCX", date: "2024-01-12", size: "7.3 MB", status: "completed" }
            ].map((export_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-black/20 rounded-lg">
                <div>
                  <h4 className="font-bold text-black">{export_.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-black/60">
                    <span>{export_.format}</span>
                    <span>💾 {export_.size}</span>
                    <span>📅 {new Date(export_.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(export_.status)}`}>
                    {export_.status}
                  </span>
                  {export_.status === "completed" && (
                    <button className="px-3 py-1 bg-black text-white rounded text-sm hover:bg-black/80">
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}