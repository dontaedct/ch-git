/**
 * @fileoverview HT-022.4.1: Agency Customization Admin Page
 * @module app/admin/customization
 * @author Agency Component System
 * @version 1.0.0
 *
 * AGENCY CUSTOMIZATION ADMIN: Client branding dashboard
 * Features:
 * - Simple customization wizard
 * - Quick brand generator
 * - Brand export manager
 * - Real-time preview
 * - Quality assurance tools
 */

'use client';

import React, { useState } from 'react';
import { SimpleThemeProvider } from '@/components/ui/atomic/theming/simple-theme-provider';
import {
  SimpleCustomizationWizard,
  QuickBrandGenerator,
  BrandExportManager,
  type SimpleClientTheme
} from '@/components/ui/atomic/customization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Wand2,
  Zap,
  Package,
  Clock,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface CustomizationStats {
  totalBrands: number;
  avgSetupTime: number;
  clientSatisfaction: number;
  activeProjects: number;
}

export default function CustomizationAdminPage() {
  const [activeTab, setActiveTab] = useState('wizard');
  const [currentTheme, setCurrentTheme] = useState<SimpleClientTheme | null>(null);
  const [stats] = useState<CustomizationStats>({
    totalBrands: 24,
    avgSetupTime: 180, // 3 hours
    clientSatisfaction: 95,
    activeProjects: 8
  });

  const handleThemeGenerated = (theme: SimpleClientTheme) => {
    setCurrentTheme(theme);
    // Switch to export tab after generation
    setActiveTab('export');
  };

  return (
    <SimpleThemeProvider>
      <div className="container mx-auto py-6 space-y-6">
        {/* Page Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Agency Customization Suite</h1>
            <p className="text-muted-foreground">
              Create and manage client brands with ≤4 hour turnaround times
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalBrands}</div>
                    <div className="text-xs text-muted-foreground">Total Brands</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-md">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{Math.floor(stats.avgSetupTime / 60)}h {stats.avgSetupTime % 60}m</div>
                    <div className="text-xs text-muted-foreground">Avg Setup Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-md">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.clientSatisfaction}%</div>
                    <div className="text-xs text-muted-foreground">Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-md">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.activeProjects}</div>
                    <div className="text-xs text-muted-foreground">Active Projects</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Customization Interface */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Client Brand Customization</CardTitle>
                <CardDescription>
                  Choose your preferred workflow for creating client brands
                </CardDescription>
              </div>
              {currentTheme && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Theme Active: {currentTheme.name}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="wizard" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Full Wizard</span>
                  <span className="sm:hidden">Wizard</span>
                </TabsTrigger>
                <TabsTrigger value="quick" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Quick Generate</span>
                  <span className="sm:hidden">Quick</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Export & Deploy</span>
                  <span className="sm:hidden">Export</span>
                </TabsTrigger>
              </TabsList>

              {/* Full Customization Wizard */}
              <TabsContent value="wizard" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Wand2 className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Complete Customization Wizard</h3>
                      <p className="text-sm text-muted-foreground">
                        Step-by-step brand creation with full customization options
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      ≤4 Hours
                    </Badge>
                  </div>

                  <SimpleCustomizationWizard
                    onComplete={handleThemeGenerated}
                  />
                </div>
              </TabsContent>

              {/* Quick Brand Generator */}
              <TabsContent value="quick" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">Quick Brand Generator</h3>
                      <p className="text-sm text-muted-foreground">
                        AI-powered instant brand creation for rapid turnaround
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-orange-600 border-orange-200">
                      ≤30 Minutes
                    </Badge>
                  </div>

                  <QuickBrandGenerator
                    onGenerate={handleThemeGenerated}
                  />
                </div>
              </TabsContent>

              {/* Export & Deploy */}
              <TabsContent value="export" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">Brand Export & Deployment</h3>
                      <p className="text-sm text-muted-foreground">
                        Export brand configurations and deployment assets
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-blue-600 border-blue-200">
                      Production Ready
                    </Badge>
                  </div>

                  <BrandExportManager
                    theme={currentTheme || undefined}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Full Wizard</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Step-by-step client onboarding</li>
                <li>• Industry-specific presets</li>
                <li>• Complete brand customization</li>
                <li>• Real-time preview system</li>
                <li>• Quality assurance checks</li>
              </ul>
              <Badge variant="secondary" className="w-full justify-center">
                Recommended for new clients
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">Quick Generator</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• AI-powered color generation</li>
                <li>• Industry-optimized defaults</li>
                <li>• One-click brand creation</li>
                <li>• Instant preview and export</li>
                <li>• Ultra-fast turnaround</li>
              </ul>
              <Badge variant="secondary" className="w-full justify-center">
                Perfect for tight deadlines
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Export Manager</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Multiple export formats</li>
                <li>• Production-ready configs</li>
                <li>• Quality validation tools</li>
                <li>• Implementation guides</li>
                <li>• Deployment automation</li>
              </ul>
              <Badge variant="secondary" className="w-full justify-center">
                Essential for deployment
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Targets</CardTitle>
            <CardDescription>
              Agency customization system performance benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">≤4h</div>
                <div className="text-sm text-muted-foreground">Full Customization</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">≤30m</div>
                <div className="text-sm text-muted-foreground">Quick Generation</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">≤1h</div>
                <div className="text-sm text-muted-foreground">Implementation</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">≤7d</div>
                <div className="text-sm text-muted-foreground">Full Delivery</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleThemeProvider>
  );
}