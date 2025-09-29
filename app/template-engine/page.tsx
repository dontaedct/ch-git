/**
 * @fileoverview Template Engine Dashboard
 * Main interface for template engine management and monitoring
 * HT-029.1.1 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TemplateEngineFactory } from "@/lib/template-engine";

interface TemplateEngineStats {
  totalTemplates: number;
  activeCompilations: number;
  generationSpeed: number;
  successRate: number;
  cacheHitRate: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

interface RecentActivity {
  id: string;
  type: 'compilation' | 'generation' | 'validation' | 'deployment';
  template: string;
  status: 'success' | 'warning' | 'error';
  timestamp: Date;
  duration: number;
}

export default function TemplateEnginePage() {
  const [stats, setStats] = useState<TemplateEngineStats>({
    totalTemplates: 0,
    activeCompilations: 0,
    generationSpeed: 0,
    successRate: 0,
    cacheHitRate: 0,
    systemHealth: 'healthy'
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading template engine statistics
    const loadDashboardData = async () => {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data for demonstration
      setStats({
        totalTemplates: 24,
        activeCompilations: 3,
        generationSpeed: 1.2, // minutes
        successRate: 95.8,
        cacheHitRate: 87.3,
        systemHealth: 'healthy'
      });

      setRecentActivity([
        {
          id: '1',
          type: 'generation',
          template: 'consultation-mvp',
          status: 'success',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          duration: 1.8
        },
        {
          id: '2',
          type: 'compilation',
          template: 'landing-page-basic',
          status: 'success',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          duration: 0.3
        },
        {
          id: '3',
          type: 'validation',
          template: 'questionnaire-flow',
          status: 'warning',
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          duration: 0.1
        },
        {
          id: '4',
          type: 'deployment',
          template: 'consultation-mvp',
          status: 'success',
          timestamp: new Date(Date.now() - 12 * 60 * 1000),
          duration: 2.1
        }
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthStatusColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    return `${minutes.toFixed(1)}m`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    return `${diffHours}h ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black/60">Loading template engine dashboard...</p>
        </div>
      </div>
    );
  }

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
                Template Engine Dashboard
              </h1>
              <p className="text-black/60 mt-2">
                Dynamic template compilation, generation, and deployment management
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Link href="/template-engine/architecture">
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  System Architecture
                </Button>
              </Link>
              <Link href="/template-engine/core">
                <Button className="bg-black text-white hover:bg-gray-800">
                  Template Core
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 border-black/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${stats.systemHealth === 'healthy' ? 'bg-green-500' : stats.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                System Health: <span className={getHealthStatusColor(stats.systemHealth)}>{stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}</span>
              </CardTitle>
              <CardDescription>
                Template engine core infrastructure status and performance metrics
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <Card className="border-2 border-black/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-black/60">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalTemplates}</div>
              <Badge variant="outline" className="mt-1 text-xs">Active</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Active Compilations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeCompilations}</div>
              <Badge variant="outline" className="mt-1 text-xs border-blue-300 text-blue-600">Running</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Generation Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatDuration(stats.generationSpeed)}</div>
              <Badge variant="outline" className="mt-1 text-xs border-green-300 text-green-600">Average</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.successRate}%</div>
              <Badge variant="outline" className="mt-1 text-xs border-purple-300 text-purple-600">24h</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Cache Hit Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.cacheHitRate}%</div>
              <Badge variant="outline" className="mt-1 text-xs border-orange-300 text-orange-600">Optimized</Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Link href="/template-engine/templates">
            <Card className="border-2 border-black/30 hover:border-black/50 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Template Management</CardTitle>
                <CardDescription>Manage and configure templates</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/template-engine/generation">
            <Card className="border-2 border-black/30 hover:border-black/50 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Dynamic Generation</CardTitle>
                <CardDescription>Create new client applications</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/template-engine/compiler">
            <Card className="border-2 border-black/30 hover:border-black/50 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Template Compiler</CardTitle>
                <CardDescription>Compile and validate templates</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/template-engine/performance">
            <Card className="border-2 border-black/30 hover:border-black/50 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
                <CardDescription>Monitor system performance</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-black/30">
            <CardHeader>
              <CardTitle>Recent Template Engine Activity</CardTitle>
              <CardDescription>Latest compilations, generations, and deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 rounded-lg border border-black/20"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(activity.status)} text-xs`}>
                        {activity.type}
                      </Badge>
                      <div>
                        <div className="font-medium text-black">{activity.template}</div>
                        <div className="text-sm text-black/60">{formatTimeAgo(activity.timestamp)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${activity.status === 'success' ? 'text-green-600' : activity.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </div>
                      <div className="text-xs text-black/60">{formatDuration(activity.duration)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}