'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Workflow,
  Layers,
  ShoppingBag,
  Package,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HT035ModuleStatus {
  orchestration: {
    totalWorkflows: number;
    activeExecutions: number;
    successRate: number;
    systemHealth: 'healthy' | 'warning' | 'error';
  };
  modules: {
    totalModules: number;
    activeModules: number;
    clientConfigurations: number;
    syncStatus: 'synced' | 'syncing' | 'error';
  };
  marketplace: {
    availableTemplates: number;
    installedTemplates: number;
    monthlyDownloads: number;
    revenue: number;
  };
  handover: {
    packagesInProgress: number;
    packagesReady: number;
    completedThisMonth: number;
    avgCompletionTime: string;
  };
}

interface HT035ModuleGridProps {
  moduleStatuses?: HT035ModuleStatus;
  isLoading?: boolean;
  className?: string;
}

const defaultStatuses: HT035ModuleStatus = {
  orchestration: {
    totalWorkflows: 0,
    activeExecutions: 0,
    successRate: 0,
    systemHealth: 'healthy'
  },
  modules: {
    totalModules: 0,
    activeModules: 0,
    clientConfigurations: 0,
    syncStatus: 'synced'
  },
  marketplace: {
    availableTemplates: 0,
    installedTemplates: 0,
    monthlyDownloads: 0,
    revenue: 0
  },
  handover: {
    packagesInProgress: 0,
    packagesReady: 0,
    completedThisMonth: 0,
    avgCompletionTime: '0h'
  }
};

export function HT035ModuleGrid({
  moduleStatuses = defaultStatuses,
  isLoading = false,
  className
}: HT035ModuleGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><AlertCircle className="w-3 h-3 mr-1" />Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return null;
    }
  };

  const getSyncBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Synced</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Activity className="w-3 h-3 mr-1 animate-pulse" />Syncing</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={cardVariants}>
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Workflow className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Workflow Orchestration</CardTitle>
                  <CardDescription>Automate complex workflows with n8n and Temporal</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getHealthBadge(moduleStatuses.orchestration.systemHealth)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Workflows</p>
                  <p className="text-2xl font-bold text-blue-600">{moduleStatuses.orchestration.totalWorkflows}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Executions</p>
                  <p className="text-2xl font-bold text-blue-600">{moduleStatuses.orchestration.activeExecutions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{moduleStatuses.orchestration.successRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      moduleStatuses.orchestration.systemHealth === 'healthy' && "bg-green-500",
                      moduleStatuses.orchestration.systemHealth === 'warning' && "bg-yellow-500",
                      moduleStatuses.orchestration.systemHealth === 'error' && "bg-red-500"
                    )} />
                    <span className="text-sm font-medium capitalize">{moduleStatuses.orchestration.systemHealth}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Link href="/agency-toolkit/orchestration" className="flex-1">
                  <Button variant="default" className="w-full group-hover:shadow-md transition-all">
                    View Workflows
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/agency-toolkit/orchestration/monitor">
                  <Button variant="outline" size="sm">
                    <Activity className="w-4 h-4 mr-2" />
                    Monitor
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Layers className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Module Management</CardTitle>
                  <CardDescription>Hot-pluggable module registry with activation controls</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getSyncBadge(moduleStatuses.modules.syncStatus)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Modules</p>
                  <p className="text-2xl font-bold text-purple-600">{moduleStatuses.modules.totalModules}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Modules</p>
                  <p className="text-2xl font-bold text-purple-600">{moduleStatuses.modules.activeModules}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Client Configurations</p>
                  <p className="text-2xl font-bold text-purple-600">{moduleStatuses.modules.clientConfigurations}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Link href="/agency-toolkit/modules" className="flex-1">
                  <Button variant="default" className="w-full group-hover:shadow-md transition-all">
                    Manage Modules
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/agency-toolkit/modules/registry">
                  <Button variant="outline" size="sm">
                    <Layers className="w-4 h-4 mr-2" />
                    Registry
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500 group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Template Marketplace</CardTitle>
                  <CardDescription>Browse, install, and manage premium templates</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  ${moduleStatuses.marketplace.revenue}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Available Templates</p>
                  <p className="text-2xl font-bold text-emerald-600">{moduleStatuses.marketplace.availableTemplates}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Installed</p>
                  <p className="text-2xl font-bold text-emerald-600">{moduleStatuses.marketplace.installedTemplates}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Downloads</p>
                  <p className="text-2xl font-bold text-emerald-600">{moduleStatuses.marketplace.monthlyDownloads}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${moduleStatuses.marketplace.revenue}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Link href="/marketplace" className="flex-1">
                  <Button variant="default" className="w-full group-hover:shadow-md transition-all">
                    Browse Templates
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/marketplace?tab=my-templates">
                  <Button variant="outline" size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    My Templates
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500 group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Client Handover Automation</CardTitle>
                  <CardDescription>Automated package assembly and delivery</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {moduleStatuses.handover.packagesReady > 0 && (
                  <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                    {moduleStatuses.handover.packagesReady} Ready
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">{moduleStatuses.handover.packagesInProgress}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ready to Deliver</p>
                  <p className="text-2xl font-bold text-orange-600">{moduleStatuses.handover.packagesReady}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed (Month)</p>
                  <p className="text-2xl font-bold text-green-600">{moduleStatuses.handover.completedThisMonth}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Completion</p>
                  <p className="text-2xl font-bold text-orange-600">{moduleStatuses.handover.avgCompletionTime}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Link href="/agency-toolkit/handover" className="flex-1">
                  <Button variant="default" className="w-full group-hover:shadow-md transition-all">
                    View Packages
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/agency-toolkit/handover/packages/create">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}