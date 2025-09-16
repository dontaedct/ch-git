/**
 * @fileoverview Client Delivery Status Page
 * Track client deliverables, timelines, and progress
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ClientDeliveryPage() {
  const params = useParams();
  const [selectedDeliverable, setSelectedDeliverable] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const deliverables = [
    {
      id: "1",
      name: "Brand Identity Package",
      type: "Design",
      status: "completed",
      dueDate: "2024-01-15",
      completedDate: "2024-01-12",
      progress: 100,
      deliverables: ["Logo Design", "Brand Guidelines", "Color Palette", "Typography"],
      client: "TechCorp",
      priority: "high"
    },
    {
      id: "2",
      name: "Website Development",
      type: "Development",
      status: "in-progress",
      dueDate: "2024-02-01",
      completedDate: null,
      progress: 75,
      deliverables: ["Homepage", "Product Pages", "Contact Form", "Admin Panel"],
      client: "TechCorp",
      priority: "high"
    },
    {
      id: "3",
      name: "Content Strategy",
      type: "Content",
      status: "pending",
      dueDate: "2024-01-25",
      completedDate: null,
      progress: 25,
      deliverables: ["Content Audit", "Content Calendar", "SEO Strategy", "Blog Posts"],
      client: "TechCorp",
      priority: "medium"
    },
    {
      id: "4",
      name: "Analytics Setup",
      type: "Analytics",
      status: "review",
      dueDate: "2024-01-20",
      completedDate: null,
      progress: 90,
      deliverables: ["Google Analytics", "Tag Manager", "Conversion Tracking", "Reports"],
      client: "TechCorp",
      priority: "low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50 border-green-200";
      case "in-progress": return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending": return "text-orange-600 bg-orange-50 border-orange-200";
      case "review": return "text-purple-600 bg-purple-50 border-purple-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const filteredDeliverables = deliverables.filter(item =>
    filter === "all" || item.status === filter
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
                Client Delivery Dashboard
              </h1>
              <p className="text-black/60 mt-2">
                Track deliverables and project progress for {params.clientId}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="text-sm text-black/60">
                Last Updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="p-6 rounded-lg border-2 border-black/30 bg-black/5">
            <div className="text-2xl font-bold text-black">4</div>
            <div className="text-sm text-black/60">Total Projects</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-green-300 bg-green-50">
            <div className="text-2xl font-bold text-green-600">1</div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-blue-300 bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-sm text-blue-600">In Progress</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-orange-300 bg-orange-50">
            <div className="text-2xl font-bold text-orange-600">2</div>
            <div className="text-sm text-orange-600">Pending/Review</div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {["all", "completed", "in-progress", "pending", "review"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium uppercase tracking-wide ${
                  filter === status
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/30 hover:border-black/50"
                }`}
              >
                {status.replace("-", " ")}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Deliverables List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredDeliverables.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                selectedDeliverable === item.id
                  ? "border-black bg-black/5"
                  : "border-black/30 hover:border-black/50 bg-white"
              }`}
              onClick={() => setSelectedDeliverable(
                selectedDeliverable === item.id ? null : item.id
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-bold text-black">{item.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status.replace("-", " ").toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-black/60 text-sm mb-2">{item.type}</div>
                  <div className="text-black/80 mb-3">
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                    {item.completedDate && (
                      <span className="ml-4 text-green-600">
                        Completed: {new Date(item.completedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-black/60">Progress</span>
                      <span className="text-black font-medium">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {selectedDeliverable === item.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-black/20"
                >
                  <h4 className="font-bold text-black mb-2">Deliverables:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.deliverables.map((deliverable, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-black/80"
                      >
                        <div className="w-2 h-2 bg-black rounded-full" />
                        {deliverable}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold tracking-wide uppercase text-black mb-6">
            Delivery Timeline
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-black/20" />
            {deliverables.map((item, index) => (
              <div key={item.id} className="relative flex items-center mb-8">
                <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white ${
                  item.status === "completed" ? "bg-green-500" :
                  item.status === "in-progress" ? "bg-blue-500" :
                  item.status === "review" ? "bg-purple-500" : "bg-gray-400"
                }`} />
                <div className="ml-12 p-4 rounded-lg border-2 border-black/30 bg-white w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-black">{item.name}</h3>
                      <p className="text-black/60 text-sm">{item.type}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-black/60">Due: {new Date(item.dueDate).toLocaleDateString()}</div>
                      {item.completedDate && (
                        <div className="text-green-600">Completed: {new Date(item.completedDate).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}