/**
 * Hero Tasks - Main Dashboard Component
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 * Updated: 2025-09-08T23:19:46.000Z - Redesigned to match home page UI/UX
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Container } from "@/components/ui/container";
import { Grid, Col } from "@/components/ui/grid";
import { Surface, SurfaceCard, SurfaceSubtle, SurfaceElevated } from "@/components/ui/surface";
import { CTAButton, SecondaryCTAButton } from "@/components/ui/button";
import { MobileCarousel, CarouselSlide } from "@/components/ui/mobile-carousel";
import { SingleCardCarousel } from "@/components/ui/single-card-carousel";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  BarChart3, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Users,
  TrendingUp,
  Keyboard,
  RefreshCw,
  Zap,
  Target,
  Rocket,
  Star,
  Activity,
  Database,
  Webhook,
  ExternalLink,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface HeroTasksDashboardProps {
  className?: string;
}

export function HeroTasksDashboard({ className = '' }: HeroTasksDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate slides every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`hero-tasks-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Container variant="page" className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">HT</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hero Tasks</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">HT-004 Enhanced Task Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
              </div>
              <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Plus className="w-4 h-4 mr-2 inline" />
                New Task
              </button>
      </div>
          </div>
        </Container>
        </div>

      {/* Task Management Dashboard */}
      <section 
        className="py-32 relative overflow-hidden bg-gray-100 dark:bg-gray-900" 
        aria-labelledby="dashboard-heading"
      >
        <Container variant="page">
          <div className="mx-auto max-w-7xl">
            {/* Dashboard header */}
            <div className="text-center mb-20">
              <h2 
                id="dashboard-heading" 
                className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight text-gray-900 dark:text-gray-100"
              >
                Task Management Dashboard
              </h2>
              <p 
                className="text-xl max-w-3xl mx-auto leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <strong className="text-gray-900 dark:text-gray-100">Complete overview</strong><br />
                Manage projects, track progress, and collaborate with your team in real-time.
              </p>
      </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <SurfaceElevated className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">24</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last week</div>
              </SurfaceElevated>

              <SurfaceElevated className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">18</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">75% completion rate</div>
              </SurfaceElevated>

              <SurfaceElevated className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">6</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Active tasks</div>
              </SurfaceElevated>

              <SurfaceElevated className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">8</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">3 online now</div>
              </SurfaceElevated>
            </div>

            {/* Main Dashboard Grid */}
            <Grid cols={12} gap="lg">
              {/* Task List */}
              <Col span={12} lg={8}>
                <SurfaceElevated className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Tasks</h3>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        All Tasks
                      </button>
                      <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Filter
                      </button>
                    </div>
      </div>

                  {/* Task Items */}
                  <div className="space-y-4">
                    {/* Task 1 */}
                    <div className="group p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              Update API documentation
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Complete API endpoint documentation for v2.1</p>
                          </div>
            </div>
            <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">JD</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">2h ago</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded">Completed</span>
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded">Frontend</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>Done</span>
                        </div>
                      </div>
                    </div>

                    {/* Task 2 */}
                    <div className="group p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              Fix authentication bug
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Resolve login issues with OAuth providers</p>
                          </div>
            </div>
            <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">SM</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">1h ago</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded">In Progress</span>
                          <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded">Backend</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>Due in 2 days</span>
                        </div>
                      </div>
                    </div>

                    {/* Task 3 */}
                    <div className="group p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              Design new landing page
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Create modern landing page for product launch</p>
                          </div>
            </div>
            <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">AL</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">3h ago</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded">Pending</span>
                          <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded">Design</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>Due next week</span>
                        </div>
                      </div>
                    </div>

                    {/* Task 4 */}
                    <div className="group p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              Code review for PR #142
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Review and approve feature branch changes</p>
                          </div>
            </div>
            <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">RK</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">5h ago</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">Review</span>
                          <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded">DevOps</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Needs attention</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <button className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      View All Tasks
                    </button>
                  </div>
                </SurfaceElevated>
              </Col>

              {/* Sidebar */}
              <Col span={12} lg={4}>
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <SurfaceElevated className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center space-x-3 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Create New Task</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <BarChart3 className="w-4 h-4" />
                        <span>View Analytics</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <Calendar className="w-4 h-4" />
                        <span>Schedule Meeting</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <Users className="w-4 h-4" />
                        <span>Invite Team Member</span>
                      </button>
                    </div>
                  </SurfaceElevated>

                  {/* Team Activity */}
                  <SurfaceElevated className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Team Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">JD</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-gray-100">John completed "Update API docs"</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">SM</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-gray-100">Sarah started "Fix auth bug"</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">AL</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-gray-100">Alex created "Design landing page"</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                        </div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  </SurfaceElevated>

                  {/* Project Progress */}
                  <SurfaceElevated className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Project Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Frontend Development</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">85%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Backend API</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">72%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Testing & QA</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Documentation</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">90%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '90%'}}></div>
                        </div>
                      </div>
                    </div>
                  </SurfaceElevated>
                </div>
              </Col>
            </Grid>
          </div>
        </Container>
      </section>

      {/* Analytics Dashboard */}
      <section 
        className="py-32 relative overflow-hidden bg-gray-50 dark:bg-gray-800" 
        aria-labelledby="analytics-heading"
      >
        <Container variant="page">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <h2 
                id="analytics-heading" 
                className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight text-gray-900 dark:text-gray-100"
              >
                Analytics & Insights
              </h2>
              <p 
                className="text-xl max-w-3xl mx-auto leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <strong className="text-gray-900 dark:text-gray-100">Data-driven decisions</strong><br />
                Track performance, identify bottlenecks, and optimize your team's productivity.
              </p>
            </div>

            <Grid cols={12} gap="lg">
              {/* Performance Chart */}
              <Col span={12} lg={8}>
                <SurfaceElevated className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Team Performance</h3>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg">Last 30 days</button>
                      <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">Export</button>
                    </div>
                  </div>
                  
                  {/* Mock Chart */}
                  <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-end justify-between">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 bg-blue-500 rounded-t" style={{height: '120px'}}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Mon</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 bg-green-500 rounded-t" style={{height: '160px'}}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Tue</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 bg-blue-500 rounded-t" style={{height: '140px'}}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Wed</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 bg-purple-500 rounded-t" style={{height: '180px'}}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Thu</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 bg-orange-500 rounded-t" style={{height: '200px'}}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Fri</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 bg-green-500 rounded-t" style={{height: '100px'}}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Sat</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 bg-blue-500 rounded-t" style={{height: '80px'}}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Sun</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">156</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">+23%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">vs Last Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">4.2h</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Task Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">92%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">On-time Rate</div>
                    </div>
                  </div>
                </SurfaceElevated>
              </Col>

              {/* Team Stats */}
              <Col span={12} lg={4}>
                <SurfaceElevated className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Team Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Most Productive</span>
            <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">JD</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">John</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">42</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Projects</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Team Efficiency</span>
                      <span className="text-sm font-medium text-green-500">94%</span>
                    </div>
                  </div>
                </SurfaceElevated>

                <SurfaceElevated className="p-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Achievements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sprint Goal Met</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completed 15/15 tasks</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Rocket className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Zero Bugs</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Clean release this week</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Team Collaboration</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">100% participation</p>
                      </div>
                    </div>
            </div>
                </SurfaceElevated>
              </Col>
            </Grid>
          </div>
        </Container>
      </section>

      {/* Project Management */}
      <section 
        className="py-32 relative overflow-hidden bg-gray-100 dark:bg-gray-900" 
        aria-labelledby="projects-heading"
      >
        <Container variant="page">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <h2 
                id="projects-heading" 
                className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight text-gray-900 dark:text-gray-100"
              >
                Project Management
              </h2>
              <p 
                className="text-xl max-w-3xl mx-auto leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <strong className="text-gray-900 dark:text-gray-100">Organize everything</strong><br />
                Manage multiple projects, track milestones, and coordinate team efforts seamlessly.
              </p>
            </div>

            <Grid cols={12} gap="lg">
              {/* Active Projects */}
              <Col span={12} lg={8}>
                <SurfaceElevated className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Active Projects</h3>
                    <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Create Project
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project 1 */}
                    <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">FE</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Frontend Redesign</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Modern UI overhaul</p>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">85%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">4 members</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Due Dec 15</span>
                        </div>
                      </div>
                    </div>

                    {/* Project 2 */}
                    <div className="group p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">API</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">API v3.0</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">RESTful API redesign</p>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">72%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">3 members</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Due Jan 10</span>
                        </div>
                      </div>
                    </div>

                    {/* Project 3 */}
                    <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">QA</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Testing Suite</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Automated testing framework</p>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">2 members</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Due Feb 1</span>
                        </div>
                      </div>
                    </div>

                    {/* Project 4 */}
                    <div className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-xl border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">DOC</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Documentation</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Complete API documentation</p>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">90%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '90%'}}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">1 member</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Due Dec 20</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SurfaceElevated>
              </Col>

              {/* Project Sidebar */}
              <Col span={12} lg={4}>
                <div className="space-y-6">
                  {/* Upcoming Milestones */}
                  <SurfaceElevated className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Upcoming Milestones</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Frontend Beta Release</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Dec 15, 2024</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Rocket className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">API v3.0 Launch</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Jan 10, 2025</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Testing Complete</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Feb 1, 2025</p>
                        </div>
                      </div>
                    </div>
                  </SurfaceElevated>

                  {/* Team Workload */}
                  <SurfaceElevated className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Team Workload</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">JD</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">John</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '80%'}}></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">80%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">SM</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Sarah</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">65%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">AL</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Alex</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">45%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">RK</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Ryan</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: '90%'}}></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">90%</span>
                        </div>
                      </div>
                    </div>
                  </SurfaceElevated>

                  {/* Recent Comments */}
                  <SurfaceElevated className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Comments</h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">JD</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">John</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">2m ago</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">"Great progress on the API documentation! Almost ready for review."</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">SM</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Sarah</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">1h ago</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">"Found a bug in the authentication flow. Working on a fix now."</p>
                      </div>
                    </div>
                  </SurfaceElevated>
                </div>
              </Col>
            </Grid>
          </div>
        </Container>
      </section>

      {/* HT-004 Advanced Features */}
      <section 
        className="py-32 relative overflow-hidden bg-gray-50 dark:bg-gray-800" 
        aria-labelledby="ht004-features-heading"
      >
        <Container variant="page">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <h2 
                id="ht004-features-heading" 
                className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight text-gray-900 dark:text-gray-100"
              >
                HT-004 Advanced Features
              </h2>
              <p 
                className="text-xl max-w-3xl mx-auto leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <strong className="text-gray-900 dark:text-gray-100">Enterprise-grade capabilities</strong><br />
                Advanced features implemented in HT-004 for modern task management.
              </p>
            </div>

            <Grid cols={12} gap="lg">
              {/* Real-time Features */}
              <Col span={12} lg={6}>
                <SurfaceElevated className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Real-time Collaboration</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">WebSocket powered live updates</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Live Cursors</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Typing Indicators</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Instant Updates</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Presence Detection</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </SurfaceElevated>
              </Col>

              {/* AI Features */}
              <Col span={12} lg={6}>
                <SurfaceElevated className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Intelligence</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">GPT-4 powered insights</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Smart Suggestions</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Auto-Prioritization</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Natural Language</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dependency Detection</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </SurfaceElevated>
              </Col>

              {/* Mobile & PWA */}
              <Col span={12} lg={6}>
                <SurfaceElevated className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mobile-First PWA</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Progressive Web App</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Offline Support</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Push Notifications</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Touch Optimization</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">App-like Experience</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </SurfaceElevated>
              </Col>

              {/* Enterprise Security */}
              <Col span={12} lg={6}>
                <SurfaceElevated className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Enterprise Security</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">SOC 2 compliant</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">SSO Integration</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Role-Based Access</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Audit Logging</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Data Encryption</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </SurfaceElevated>
              </Col>
            </Grid>

            {/* Integration Status */}
            <div className="mt-16">
              <SurfaceElevated className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Integration Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">GH</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">GitHub</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Connected</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">SL</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Slack</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Connected</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">VS</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">VS Code</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Connected</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CLI</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">CLI Tool</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Available</div>
                    </div>
                  </div>
                </div>
              </SurfaceElevated>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}

export default HeroTasksDashboard;