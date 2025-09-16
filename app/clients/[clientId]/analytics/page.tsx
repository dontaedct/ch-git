/**
 * @fileoverview Client Analytics Page
 * Comprehensive analytics dashboard for client projects and performance
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ClientAnalyticsPage() {
  const params = useParams();
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("overview");

  const metrics = {
    overview: {
      totalProjects: 12,
      completedProjects: 8,
      activeProjects: 4,
      totalRevenue: 125000,
      avgProjectDuration: 45,
      clientSatisfaction: 4.8,
      onTimeDelivery: 92,
      bugReports: 3
    },
    performance: {
      pageSpeed: 95,
      uptime: 99.9,
      securityScore: 98,
      seoScore: 87,
      accessibilityScore: 94,
      bestPractices: 91
    },
    engagement: {
      dailyActiveUsers: 1250,
      weeklyActiveUsers: 4800,
      monthlyActiveUsers: 12500,
      averageSessionDuration: "4m 32s",
      bounceRate: 28,
      conversionRate: 3.2
    }
  };

  const chartData = [
    { month: "Jan", projects: 2, revenue: 25000, satisfaction: 4.5 },
    { month: "Feb", projects: 3, revenue: 35000, satisfaction: 4.6 },
    { month: "Mar", projects: 2, revenue: 22000, satisfaction: 4.7 },
    { month: "Apr", projects: 1, revenue: 15000, satisfaction: 4.8 },
    { month: "May", projects: 2, revenue: 18000, satisfaction: 4.9 },
    { month: "Jun", projects: 2, revenue: 20000, satisfaction: 4.8 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "project_completed",
      title: "Website Redesign Project Completed",
      description: "Successfully delivered the new website with all requirements met",
      timestamp: "2 hours ago",
      status: "success"
    },
    {
      id: 2,
      type: "milestone_reached",
      title: "50% Milestone Reached",
      description: "Mobile app development reached 50% completion",
      timestamp: "1 day ago",
      status: "info"
    },
    {
      id: 3,
      type: "feedback_received",
      title: "Client Feedback Received",
      description: "Positive feedback on the latest design iterations",
      timestamp: "2 days ago",
      status: "success"
    },
    {
      id: 4,
      type: "issue_reported",
      title: "Minor Issue Reported",
      description: "Small UI inconsistency reported and being addressed",
      timestamp: "3 days ago",
      status: "warning"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-600 bg-green-50 border-green-200";
      case "info": return "text-blue-600 bg-blue-50 border-blue-200";
      case "warning": return "text-orange-600 bg-orange-50 border-orange-200";
      case "error": return "text-red-600 bg-red-50 border-red-200";
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
                Client Analytics Dashboard
              </h1>
              <p className="text-black/60 mt-2">
                Performance insights and analytics for {params.clientId}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-2">
              {["7d", "30d", "90d", "1y"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium uppercase tracking-wide ${
                    timeRange === range
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black/30 hover:border-black/50"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Metric Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {["overview", "performance", "engagement"].map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-6 py-3 rounded-lg border-2 transition-all duration-300 text-sm font-medium uppercase tracking-wide ${
                  selectedMetric === metric
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/30 hover:border-black/50"
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Metrics */}
        {selectedMetric === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <div className="p-6 rounded-lg border-2 border-black/30 bg-black/5">
              <div className="text-3xl font-bold text-black">{metrics.overview.totalProjects}</div>
              <div className="text-sm text-black/60">Total Projects</div>
              <div className="mt-2 text-xs text-green-600">
                +{metrics.overview.completedProjects} completed
              </div>
            </div>
            <div className="p-6 rounded-lg border-2 border-green-300 bg-green-50">
              <div className="text-3xl font-bold text-green-600">
                ${(metrics.overview.totalRevenue / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-green-600">Total Revenue</div>
              <div className="mt-2 text-xs text-green-600">+12% this month</div>
            </div>
            <div className="p-6 rounded-lg border-2 border-blue-300 bg-blue-50">
              <div className="text-3xl font-bold text-blue-600">{metrics.overview.clientSatisfaction}</div>
              <div className="text-sm text-blue-600">Client Satisfaction</div>
              <div className="mt-2 text-xs text-blue-600">Out of 5.0</div>
            </div>
            <div className="p-6 rounded-lg border-2 border-purple-300 bg-purple-50">
              <div className="text-3xl font-bold text-purple-600">{metrics.overview.onTimeDelivery}%</div>
              <div className="text-sm text-purple-600">On-Time Delivery</div>
              <div className="mt-2 text-xs text-purple-600">Industry: 75%</div>
            </div>
          </motion.div>
        )}

        {/* Performance Metrics */}
        {selectedMetric === "performance" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          >
            {Object.entries(metrics.performance).map(([key, value]) => (
              <div key={key} className="p-6 rounded-lg border-2 border-black/30 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-black capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  <div className="text-2xl font-bold text-black">{value}{typeof value === "number" ? "%" : ""}</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${typeof value === "number" ? value : 85}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-black/60">
                  {typeof value === "number" && value >= 90 ? "Excellent" :
                   typeof value === "number" && value >= 70 ? "Good" : "Needs Improvement"}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Engagement Metrics */}
        {selectedMetric === "engagement" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          >
            {Object.entries(metrics.engagement).map(([key, value]) => (
              <div key={key} className="p-6 rounded-lg border-2 border-black/30 bg-white">
                <div className="text-lg font-bold text-black capitalize mb-2">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </div>
                <div className="text-2xl font-bold text-black">{value}{typeof value === "number" && key.includes("Rate") ? "%" : ""}</div>
                <div className="mt-2 text-xs text-black/60">
                  {key === "bounceRate" ? "Lower is better" : "Higher is better"}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Revenue Chart */}
          <div className="p-6 rounded-lg border-2 border-black/30 bg-white">
            <h3 className="text-xl font-bold text-black mb-4">Revenue Trend</h3>
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={item.month} className="flex items-center justify-between">
                  <div className="text-sm text-black/60 w-12">{item.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(item.revenue / 35000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-black w-16 text-right">
                    ${(item.revenue / 1000).toFixed(0)}K
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction Chart */}
          <div className="p-6 rounded-lg border-2 border-black/30 bg-white">
            <h3 className="text-xl font-bold text-black mb-4">Satisfaction Trend</h3>
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={item.month} className="flex items-center justify-between">
                  <div className="text-sm text-black/60 w-12">{item.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(item.satisfaction / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-black w-16 text-right">
                    {item.satisfaction}/5.0
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold tracking-wide uppercase text-black mb-6">
            Recent Activities
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`p-4 rounded-lg border-2 ${getStatusColor(activity.status)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-black">{activity.title}</h3>
                    <p className="text-black/80 text-sm mt-1">{activity.description}</p>
                  </div>
                  <div className="text-xs text-black/60 ml-4">{activity.timestamp}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}