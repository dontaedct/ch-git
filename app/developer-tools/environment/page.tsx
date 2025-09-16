"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Monitor,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Download,
  Settings,
  Terminal,
  Package,
  GitBranch,
  Database,
  Shield,
  Zap,
  FileText,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const EnvironmentSetupPage = () => {
  const [setupProgress, setSetupProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [autoConfig, setAutoConfig] = useState({
    dependencies: true,
    devTools: true,
    environment: true,
    validation: true,
    testing: false,
    deployment: false
  });

  const environmentChecks = [
    {
      name: "Node.js Environment",
      status: "completed",
      description: "Node.js 18+ with npm/yarn package manager",
      icon: <Terminal className="w-5 h-5" />,
      time: "2 min"
    },
    {
      name: "Development Dependencies",
      status: "completed",
      description: "TypeScript, React, Next.js, and build tools",
      icon: <Package className="w-5 h-5" />,
      time: "5 min"
    },
    {
      name: "Git Configuration",
      status: "completed",
      description: "Git setup with hooks and commit standards",
      icon: <GitBranch className="w-5 h-5" />,
      time: "1 min"
    },
    {
      name: "Database Setup",
      status: "pending",
      description: "Local development database configuration",
      icon: <Database className="w-5 h-5" />,
      time: "3 min"
    },
    {
      name: "Security Configuration",
      status: "pending",
      description: "Environment variables and security setup",
      icon: <Shield className="w-5 h-5" />,
      time: "2 min"
    },
    {
      name: "Development Tools",
      status: "pending",
      description: "VS Code extensions and debugging setup",
      icon: <Settings className="w-5 h-5" />,
      time: "4 min"
    },
    {
      name: "Performance Monitoring",
      status: "pending",
      description: "Local performance and debugging tools",
      icon: <Zap className="w-5 h-5" />,
      time: "2 min"
    },
    {
      name: "Environment Validation",
      status: "pending",
      description: "Automated validation and health checks",
      icon: <CheckCircle2 className="w-5 h-5" />,
      time: "1 min"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAutoSetup = () => {
    setIsRunning(true);
    setSetupProgress(0);

    // Simulate automated setup process
    const interval = setInterval(() => {
      setSetupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const completedChecks = environmentChecks.filter(check => check.status === 'completed').length;
  const totalEstimatedTime = environmentChecks.reduce((total, check) => {
    const minutes = parseInt(check.time);
    return total + minutes;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/developer-tools">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tools
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Development Environment Setup</h1>
                <p className="text-lg text-gray-600">Automated configuration and optimization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{completedChecks}/{environmentChecks.length}</div>
                  <div className="text-sm text-gray-500">Setup Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{totalEstimatedTime} min</div>
                  <div className="text-sm text-gray-500">Total Setup Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">Auto</div>
                  <div className="text-sm text-gray-500">Configuration</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">Secure</div>
                  <div className="text-sm text-gray-500">By Default</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automated Setup */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Automated Environment Setup</span>
            </CardTitle>
            <CardDescription>
              Configure your development environment automatically with optimized settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Setup Progress</span>
                  <span>{setupProgress}%</span>
                </div>
                <Progress value={setupProgress} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(autoConfig).map(([key, enabled]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    id={key}
                    checked={enabled}
                    onCheckedChange={(checked) => setAutoConfig(prev => ({...prev, [key]: checked}))}
                    disabled={isRunning}
                  />
                  <Label htmlFor={key} className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>

            <Button
              onClick={handleAutoSetup}
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Setting Up Environment...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Automated Setup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Environment Checks */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Environment Checklist</span>
            </CardTitle>
            <CardDescription>
              Development environment components and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {environmentChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {check.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{check.name}</div>
                      <div className="text-sm text-gray-500">{check.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(check.status)}>
                      {check.status}
                    </Badge>
                    <div className="text-sm text-gray-500">{check.time}</div>
                    {getStatusIcon(check.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manual Actions */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Manual Configuration</CardTitle>
            <CardDescription>
              Advanced setup options and manual configuration tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start space-x-2">
                <Download className="w-4 h-4" />
                <span>Download Config Files</span>
              </Button>
              <Button variant="outline" className="justify-start space-x-2">
                <Settings className="w-4 h-4" />
                <span>Custom Configuration</span>
              </Button>
              <Button variant="outline" className="justify-start space-x-2">
                <Terminal className="w-4 h-4" />
                <span>Run Setup Scripts</span>
              </Button>
              <Button variant="outline" className="justify-start space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Validate Environment</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnvironmentSetupPage;