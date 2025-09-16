"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Code2,
  Settings,
  TestTube,
  Rocket,
  CheckCircle,
  Clock,
  Zap,
  GitBranch,
  Monitor,
  FileCode,
  Package,
  Shield
} from 'lucide-react';
import Link from 'next/link';

const DeveloperToolsPage = () => {
  const toolCategories = [
    {
      title: "Development Environment",
      description: "Automated setup and configuration tools",
      icon: <Monitor className="w-6 h-6" />,
      href: "/developer-tools/environment",
      status: "active",
      tools: [
        "Environment Setup Automation",
        "Dependency Management",
        "Development Tools Configuration",
        "Environment Validation"
      ]
    },
    {
      title: "Code Generation",
      description: "AI-assisted scaffolding and template tools",
      icon: <Code2 className="w-6 h-6" />,
      href: "/developer-tools/code-generation",
      status: "pending",
      tools: [
        "Template Generation",
        "Component Scaffolding",
        "API Boilerplate",
        "Configuration Templates"
      ]
    },
    {
      title: "Productivity Tools",
      description: "Developer assistance and debugging tools",
      icon: <Zap className="w-6 h-6" />,
      href: "/developer-tools/productivity",
      status: "pending",
      tools: [
        "Debug Assistance",
        "Performance Profiling",
        "Code Analysis",
        "Productivity Metrics"
      ]
    },
    {
      title: "Testing Automation",
      description: "Automated testing and quality assurance",
      icon: <TestTube className="w-6 h-6" />,
      href: "/developer-tools/testing",
      status: "pending",
      tools: [
        "Unit Test Generation",
        "Integration Testing",
        "E2E Test Automation",
        "Coverage Analysis"
      ]
    },
    {
      title: "Quality Assurance",
      description: "Code quality and linting automation",
      icon: <Shield className="w-6 h-6" />,
      href: "/developer-tools/quality",
      status: "pending",
      tools: [
        "Code Linting",
        "Format Automation",
        "Security Scanning",
        "Quality Gates"
      ]
    },
    {
      title: "Deployment Pipeline",
      description: "Automated deployment and delivery",
      icon: <Rocket className="w-6 h-6" />,
      href: "/developer-tools/deployment",
      status: "pending",
      tools: [
        "Build Automation",
        "Environment Deployment",
        "Rollback Management",
        "Release Validation"
      ]
    }
  ];

  const performanceMetrics = {
    setupTime: 25,
    codeGenTime: 3,
    testTime: 8,
    deployTime: 12,
    qualityScore: 85
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Developer Tools Dashboard</h1>
              <p className="text-lg text-gray-600 mt-2">AI-Assisted Development & Delivery Pipeline</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">&lt; 7 Days</div>
              <div className="text-sm text-gray-500">Delivery Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">300%</div>
              <div className="text-sm text-gray-500">Speed Increase</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">80%</div>
              <div className="text-sm text-gray-500">Automation</div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Performance Targets</span>
            </CardTitle>
            <CardDescription>Current performance metrics vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Setup Time</span>
                  <span>{performanceMetrics.setupTime}/30 min</span>
                </div>
                <Progress value={(performanceMetrics.setupTime / 30) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Code Gen</span>
                  <span>{performanceMetrics.codeGenTime}/5 min</span>
                </div>
                <Progress value={(performanceMetrics.codeGenTime / 5) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Testing</span>
                  <span>{performanceMetrics.testTime}/10 min</span>
                </div>
                <Progress value={(performanceMetrics.testTime / 10) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Deploy</span>
                  <span>{performanceMetrics.deployTime}/15 min</span>
                </div>
                <Progress value={(performanceMetrics.deployTime / 15) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quality</span>
                  <span>{performanceMetrics.qualityScore}%</span>
                </div>
                <Progress value={performanceMetrics.qualityScore} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tool Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolCategories.map((category, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(category.status)} text-white`}>
                    {getStatusText(category.status)}
                  </Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {category.tools.map((tool, toolIndex) => (
                    <div key={toolIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
                <Link href={category.href}>
                  <Button className="w-full" variant={category.status === 'active' ? 'default' : 'outline'}>
                    {category.status === 'active' ? 'Configure' : 'Setup'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common developer workflow actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col space-y-2 p-4 h-auto">
                <Package className="w-6 h-6" />
                <span>New Project</span>
              </Button>
              <Button variant="outline" className="flex flex-col space-y-2 p-4 h-auto">
                <FileCode className="w-6 h-6" />
                <span>Generate Code</span>
              </Button>
              <Button variant="outline" className="flex flex-col space-y-2 p-4 h-auto">
                <TestTube className="w-6 h-6" />
                <span>Run Tests</span>
              </Button>
              <Button variant="outline" className="flex flex-col space-y-2 p-4 h-auto">
                <Rocket className="w-6 h-6" />
                <span>Deploy</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeveloperToolsPage;