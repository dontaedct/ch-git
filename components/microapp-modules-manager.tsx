/**
 * @fileoverview MicroApp Modules Manager - PRD-compliant module system
 * Implements hot-pluggable modules with component taxonomy and version control
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  Zap,
  Package,
  Settings,
  Eye,
  Clock,
  Shield,
  Form,
  FileText,
  BarChart,
  Workflow,
  Palette,
  Users,
  Mail,
  Calendar
} from 'lucide-react';

// PRD-aligned module contract interface
interface ModuleContract {
  id: string;
  name: string;
  version: string;
  description: string;
  tier: 'core' | 'professional' | 'business';
  category: 'forms' | 'documents' | 'analytics' | 'automation' | 'theming' | 'communication' | 'integration';
  icon: React.ComponentType<any>;

  // PRD requirements
  hotPluggable: boolean;
  rollbackSupported: boolean;
  requiresConfig: boolean;

  // Dependencies and compatibility
  dependencies: string[];
  compatibleWith: string[];
  minVersion: string;

  // Pricing and delivery impact
  pricingImpact: number; // in USD
  deliveryDays: number; // days added to delivery timeline

  // Status
  status: 'stable' | 'beta' | 'experimental';
  lastUpdated: string;
}

interface ModulesManagerProps {
  clientId?: string;
}

export function MicroAppModulesManager({ clientId }: ModulesManagerProps) {
  const [activeTab, setActiveTab] = useState('available');
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // PRD-compliant module registry
  const moduleRegistry: ModuleContract[] = [
    // Core Components (included in every app)
    {
      id: 'auth-basic',
      name: 'Basic Authentication',
      version: '1.0.0',
      description: 'Essential user authentication with session management',
      tier: 'core',
      category: 'integration',
      icon: Shield,
      hotPluggable: false, // Core modules are always active
      rollbackSupported: false,
      requiresConfig: false,
      dependencies: [],
      compatibleWith: ['*'],
      minVersion: '1.0.0',
      pricingImpact: 0,
      deliveryDays: 0,
      status: 'stable',
      lastUpdated: '2025-01-15'
    },
    {
      id: 'forms-basic',
      name: 'Form Builder',
      version: '2.1.0',
      description: 'Basic form creation with validation and submission handling',
      tier: 'core',
      category: 'forms',
      icon: Form,
      hotPluggable: true,
      rollbackSupported: true,
      requiresConfig: true,
      dependencies: ['auth-basic'],
      compatibleWith: ['documents-basic', 'analytics-basic'],
      minVersion: '1.0.0',
      pricingImpact: 0,
      deliveryDays: 1,
      status: 'stable',
      lastUpdated: '2025-01-10'
    },

    // Professional Components
    {
      id: 'documents-advanced',
      name: 'Document Generator Pro',
      version: '1.5.0',
      description: 'Advanced PDF/HTML generation with templating and branding',
      tier: 'professional',
      category: 'documents',
      icon: FileText,
      hotPluggable: true,
      rollbackSupported: true,
      requiresConfig: true,
      dependencies: ['forms-basic'],
      compatibleWith: ['analytics-pro', 'theming-advanced'],
      minVersion: '1.0.0',
      pricingImpact: 500,
      deliveryDays: 1,
      status: 'stable',
      lastUpdated: '2025-01-08'
    },
    {
      id: 'analytics-pro',
      name: 'Analytics & Reporting',
      version: '1.2.0',
      description: 'Advanced analytics with custom dashboards and insights',
      tier: 'professional',
      category: 'analytics',
      icon: BarChart,
      hotPluggable: true,
      rollbackSupported: true,
      requiresConfig: true,
      dependencies: ['auth-basic'],
      compatibleWith: ['*'],
      minVersion: '1.0.0',
      pricingImpact: 750,
      deliveryDays: 1,
      status: 'stable',
      lastUpdated: '2025-01-12'
    },
    {
      id: 'automation-workflows',
      name: 'Workflow Automation',
      version: '1.0.0',
      description: 'n8n integration for automated business processes',
      tier: 'professional',
      category: 'automation',
      icon: Workflow,
      hotPluggable: true,
      rollbackSupported: true,
      requiresConfig: true,
      dependencies: ['forms-basic'],
      compatibleWith: ['email-advanced', 'calendar-pro'],
      minVersion: '1.0.0',
      pricingImpact: 1000,
      deliveryDays: 2,
      status: 'stable',
      lastUpdated: '2025-01-05'
    },

    // Business Components
    {
      id: 'theming-enterprise',
      name: 'Enterprise Theming',
      version: '1.1.0',
      description: 'Complete white-labeling with custom CSS and branding',
      tier: 'business',
      category: 'theming',
      icon: Palette,
      hotPluggable: true,
      rollbackSupported: true,
      requiresConfig: true,
      dependencies: ['auth-basic'],
      compatibleWith: ['*'],
      minVersion: '1.0.0',
      pricingImpact: 1500,
      deliveryDays: 1,
      status: 'stable',
      lastUpdated: '2025-01-14'
    },
    {
      id: 'crm-integration',
      name: 'CRM Integration',
      version: '0.9.0',
      description: 'Salesforce, HubSpot, and custom CRM integrations',
      tier: 'business',
      category: 'integration',
      icon: Users,
      hotPluggable: true,
      rollbackSupported: true,
      requiresConfig: true,
      dependencies: ['auth-basic', 'forms-basic'],
      compatibleWith: ['analytics-pro', 'automation-workflows'],
      minVersion: '1.0.0',
      pricingImpact: 2000,
      deliveryDays: 2,
      status: 'beta',
      lastUpdated: '2025-01-01'
    },
    {
      id: 'email-enterprise',
      name: 'Enterprise Email',
      version: '1.0.0',
      description: 'Advanced email automation with templates and campaigns',
      tier: 'business',
      category: 'communication',
      icon: Mail,
      hotPluggable: true,
      rollbackSupported: true,
      requiresConfig: true,
      dependencies: ['auth-basic'],
      compatibleWith: ['automation-workflows', 'crm-integration'],
      minVersion: '1.0.0',
      pricingImpact: 1200,
      deliveryDays: 1,
      status: 'stable',
      lastUpdated: '2025-01-06'
    }
  ];

  useEffect(() => {
    loadModuleConfiguration();
  }, [clientId]);

  const loadModuleConfiguration = async () => {
    setIsLoading(true);
    try {
      // Try to load from API
      const response = await fetch(`/api/modules/config?clientId=${clientId}`);

      if (response.ok) {
        const config = await response.json();
        setEnabledModules(config.enabledModules || getDefaultModules());
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem(`module-config-${clientId}`);
        setEnabledModules(saved ? JSON.parse(saved) : getDefaultModules());
      }
    } catch (error) {
      console.error('Failed to load module configuration:', error);
      setEnabledModules(getDefaultModules());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultModules = (): string[] => {
    // Core modules are always enabled, plus basic professional modules
    return moduleRegistry
      .filter(m => m.tier === 'core' || (m.tier === 'professional' && ['documents-advanced', 'analytics-pro'].includes(m.id)))
      .map(m => m.id);
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      const config = {
        clientId,
        enabledModules,
        lastUpdated: new Date().toISOString()
      };

      const response = await fetch('/api/modules/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success('Module configuration saved successfully');
        setLastSaved(new Date());
      } else {
        throw new Error('API save failed');
      }
    } catch (error) {
      // Fallback to localStorage
      localStorage.setItem(`module-config-${clientId}`, JSON.stringify(enabledModules));
      toast.success('Configuration saved locally');
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setEnabledModules(getDefaultModules());
    toast.success('Reset to default configuration');
  };

  const toggleModule = (moduleId: string) => {
    const module = moduleRegistry.find(m => m.id === moduleId);

    // Core modules cannot be disabled
    if (module?.tier === 'core') {
      toast.warning('Core modules cannot be disabled');
      return;
    }

    setEnabledModules(prev => {
      if (prev.includes(moduleId)) {
        // Check for dependencies before removing
        const dependentModules = moduleRegistry
          .filter(m => m.dependencies.includes(moduleId) && prev.includes(m.id))
          .map(m => m.name);

        if (dependentModules.length > 0) {
          toast.warning(`Cannot disable: ${dependentModules.join(', ')} depends on this module`);
          return prev;
        }

        return prev.filter(id => id !== moduleId);
      } else {
        // Add dependencies when enabling
        const newModules = [...prev, moduleId];
        module?.dependencies.forEach(dep => {
          if (!newModules.includes(dep)) {
            newModules.push(dep);
          }
        });
        return newModules;
      }
    });
  };

  const getModulesByCategory = (category: string) => {
    return moduleRegistry.filter(m => m.category === category);
  };

  const getModulesByTier = (tier: string) => {
    return moduleRegistry.filter(m => m.tier === tier);
  };

  const calculateProjectImpact = () => {
    const enabled = moduleRegistry.filter(m => enabledModules.includes(m.id));
    const totalCost = enabled.reduce((sum, m) => sum + m.pricingImpact, 0);
    const totalDays = Math.max(...enabled.map(m => m.deliveryDays), 3); // Minimum 3 days

    return { totalCost, totalDays, moduleCount: enabled.length };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'text-green-600 bg-green-100';
      case 'beta': return 'text-yellow-600 bg-yellow-100';
      case 'experimental': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'core': return 'default';
      case 'professional': return 'secondary';
      case 'business': return 'outline';
      default: return 'outline';
    }
  };

  const impact = calculateProjectImpact();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Impact Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Project Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">${impact.totalCost.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Additional Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{impact.totalDays} days</div>
              <div className="text-sm text-muted-foreground">Delivery Timeline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{impact.moduleCount}</div>
              <div className="text-sm text-muted-foreground">Active Modules</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Modules</TabsTrigger>
          <TabsTrigger value="tier">By Tier</TabsTrigger>
          <TabsTrigger value="enabled">Enabled ({enabledModules.length})</TabsTrigger>
        </TabsList>

        {/* Available Modules by Category */}
        <TabsContent value="available" className="space-y-6">
          {['forms', 'documents', 'analytics', 'automation', 'theming', 'communication', 'integration'].map(category => {
            const categoryModules = getModulesByCategory(category);
            if (categoryModules.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Modules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryModules.map(module => {
                      const IconComponent = module.icon;
                      const isEnabled = enabledModules.includes(module.id);
                      const isCoreModule = module.tier === 'core';

                      return (
                        <div
                          key={module.id}
                          className={`p-4 border rounded-lg transition-all ${
                            isEnabled ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <IconComponent className="w-6 h-6 text-primary" />
                              <div>
                                <h3 className="font-semibold">{module.name}</h3>
                                <p className="text-sm text-muted-foreground">v{module.version}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getTierColor(module.tier)}>
                                {module.tier}
                              </Badge>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() => toggleModule(module.id)}
                                disabled={isCoreModule || isSaving}
                              />
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {module.description}
                          </p>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4">
                              <span className={`px-2 py-1 rounded ${getStatusColor(module.status)}`}>
                                {module.status}
                              </span>
                              {module.pricingImpact > 0 && (
                                <span className="text-muted-foreground">
                                  +${module.pricingImpact}
                                </span>
                              )}
                              {module.deliveryDays > 0 && (
                                <span className="text-muted-foreground">
                                  +{module.deliveryDays}d
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {module.hotPluggable && <Zap className="w-3 h-3 text-yellow-600" />}
                              {module.rollbackSupported && <RotateCcw className="w-3 h-3 text-blue-600" />}
                              {module.requiresConfig && <Settings className="w-3 h-3 text-purple-600" />}
                            </div>
                          </div>

                          {module.dependencies.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <strong>Requires:</strong> {module.dependencies.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Modules by Tier */}
        <TabsContent value="tier" className="space-y-6">
          {['core', 'professional', 'business'].map(tier => {
            const tierModules = getModulesByTier(tier);

            return (
              <Card key={tier}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    {tier} Components
                    <Badge variant={getTierColor(tier)}>{tierModules.length} modules</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tierModules.map(module => {
                      const IconComponent = module.icon;
                      const isEnabled = enabledModules.includes(module.id);

                      return (
                        <div key={module.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-5 h-5 text-primary" />
                            <div>
                              <span className="font-medium">{module.name}</span>
                              <div className="text-xs text-muted-foreground">
                                v{module.version} • {module.status}
                                {module.pricingImpact > 0 && ` • +$${module.pricingImpact}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEnabled && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => toggleModule(module.id)}
                              disabled={module.tier === 'core' || isSaving}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Enabled Modules */}
        <TabsContent value="enabled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Module Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {enabledModules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No modules enabled
                </div>
              ) : (
                <div className="space-y-3">
                  {enabledModules.map(moduleId => {
                    const module = moduleRegistry.find(m => m.id === moduleId);
                    if (!module) return null;

                    const IconComponent = module.icon;

                    return (
                      <div key={moduleId} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-primary" />
                          <div>
                            <span className="font-medium">{module.name}</span>
                            <div className="text-xs text-muted-foreground">
                              v{module.version} • {module.category}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getTierColor(module.tier)}>
                            {module.tier}
                          </Badge>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center gap-4">
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveConfiguration} disabled={isSaving}>
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}