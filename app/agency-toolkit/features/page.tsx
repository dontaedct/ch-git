'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AlertCircle, Settings, Users, Target, TrendingUp, Shield } from 'lucide-react';
import { useFeatureFlag, useFeatureFlagValue } from '@/lib/architecture/feature-flags';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  tier: 'starter' | 'pro' | 'advanced';
  category: 'ui' | 'api' | 'analytics' | 'security' | 'integration';
  rolloutPercentage: number;
  targetAudience: string[];
  conditions: Record<string, any>;
  lastModified: Date;
  modifiedBy: string;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: Array<{
    id: string;
    name: string;
    percentage: number;
    config: Record<string, any>;
  }>;
  metrics: string[];
  startDate?: Date;
  endDate?: Date;
  results?: Record<string, number>;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load feature flags and AB tests
  useEffect(() => {
    loadFeatureFlags();
    loadABTests();
  }, []);

  const loadFeatureFlags = async () => {
    // Simulated data - in real implementation, fetch from API
    const mockFlags: FeatureFlag[] = [
      {
        id: 'advanced-forms',
        name: 'Advanced Form Builder',
        description: 'Enable advanced form building capabilities with conditional logic',
        enabled: true,
        tier: 'pro',
        category: 'ui',
        rolloutPercentage: 100,
        targetAudience: ['pro-users', 'beta-testers'],
        conditions: { userTier: ['pro', 'advanced'] },
        lastModified: new Date(),
        modifiedBy: 'admin@agency.com'
      },
      {
        id: 'ai-insights',
        name: 'AI-Powered Insights',
        description: 'Machine learning insights for form optimization',
        enabled: false,
        tier: 'advanced',
        category: 'analytics',
        rolloutPercentage: 25,
        targetAudience: ['advanced-users'],
        conditions: { userTier: ['advanced'], region: ['US', 'EU'] },
        lastModified: new Date(),
        modifiedBy: 'admin@agency.com'
      },
      {
        id: 'real-time-collaboration',
        name: 'Real-time Collaboration',
        description: 'Multiple users can edit forms simultaneously',
        enabled: true,
        tier: 'advanced',
        category: 'ui',
        rolloutPercentage: 50,
        targetAudience: ['advanced-users', 'enterprise'],
        conditions: { userTier: ['advanced'], teamSize: { min: 3 } },
        lastModified: new Date(),
        modifiedBy: 'admin@agency.com'
      },
      {
        id: 'advanced-security',
        name: 'Advanced Security Features',
        description: 'Enhanced encryption and security compliance',
        enabled: true,
        tier: 'advanced',
        category: 'security',
        rolloutPercentage: 100,
        targetAudience: ['enterprise', 'compliance-required'],
        conditions: { userTier: ['advanced'], complianceRequired: true },
        lastModified: new Date(),
        modifiedBy: 'security@agency.com'
      }
    ];
    setFlags(mockFlags);
  };

  const loadABTests = async () => {
    // Simulated data
    const mockTests: ABTest[] = [
      {
        id: 'button-style-test',
        name: 'Button Style Optimization',
        description: 'Testing different button styles for conversion optimization',
        status: 'running',
        variants: [
          { id: 'control', name: 'Original Button', percentage: 50, config: { style: 'default' } },
          { id: 'variant-a', name: 'Green Button', percentage: 50, config: { style: 'green' } }
        ],
        metrics: ['click-through-rate', 'conversion-rate'],
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        results: { 'click-through-rate': 0.15, 'conversion-rate': 0.08 }
      },
      {
        id: 'form-layout-test',
        name: 'Form Layout A/B Test',
        description: 'Testing single-column vs multi-column form layouts',
        status: 'completed',
        variants: [
          { id: 'single-column', name: 'Single Column', percentage: 50, config: { layout: 'single' } },
          { id: 'multi-column', name: 'Multi Column', percentage: 50, config: { layout: 'multi' } }
        ],
        metrics: ['completion-rate', 'time-to-complete'],
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        results: { 'completion-rate': 0.92, 'time-to-complete': 180 }
      }
    ];
    setABTests(mockTests);
  };

  const toggleFlag = async (flagId: string) => {
    setFlags(prev => prev.map(flag =>
      flag.id === flagId ? { ...flag, enabled: !flag.enabled } : flag
    ));
  };

  const updateRolloutPercentage = async (flagId: string, percentage: number) => {
    setFlags(prev => prev.map(flag =>
      flag.id === flagId ? { ...flag, rolloutPercentage: percentage } : flag
    ));
  };

  const filteredFlags = flags.filter(flag => {
    const matchesTier = filterTier === 'all' || flag.tier === filterTier;
    const matchesCategory = filterCategory === 'all' || flag.category === filterCategory;
    const matchesSearch = searchQuery === '' ||
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTier && matchesCategory && matchesSearch;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ui': return <Settings className="h-4 w-4" />;
      case 'analytics': return <TrendingUp className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'integration': return <Target className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Flag Management</h1>
          <p className="text-gray-600">Manage feature flags, A/B tests, and runtime configuration across your agency toolkit</p>
        </div>

        <Tabs defaultValue="flags" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="flags">Feature Flags</TabsTrigger>
            <TabsTrigger value="ab-tests">A/B Tests</TabsTrigger>
            <TabsTrigger value="configuration">Runtime Config</TabsTrigger>
          </TabsList>

          <TabsContent value="flags" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search flags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterTier} onValueChange={setFilterTier}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="ui">UI</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Feature Flags List */}
            <div className="grid gap-4">
              {filteredFlags.map((flag) => (
                <Card key={flag.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(flag.category)}
                        <div>
                          <CardTitle className="text-lg">{flag.name}</CardTitle>
                          <CardDescription>{flag.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getTierColor(flag.tier)}>
                          {flag.tier}
                        </Badge>
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => toggleFlag(flag.id)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Rollout Percentage</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={flag.rolloutPercentage}
                            onChange={(e) => updateRolloutPercentage(flag.id, parseInt(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Target Audience</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {flag.targetAudience.map((audience) => (
                            <Badge key={audience} variant="outline" className="text-xs">
                              {audience}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Last Modified</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {flag.lastModified.toLocaleDateString()} by {flag.modifiedBy}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFlag(flag)}
                      >
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ab-tests" className="space-y-6">
            {/* A/B Tests */}
            <div className="grid gap-4">
              {abTests.map((test) => (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        <CardDescription>{test.description}</CardDescription>
                      </div>
                      <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Variants</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {test.variants.map((variant) => (
                            <div key={variant.id} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{variant.name}</span>
                                <span className="text-sm text-gray-500">{variant.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {test.results && (
                        <div>
                          <Label className="text-sm font-medium">Results</Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            {Object.entries(test.results).map(([metric, value]) => (
                              <div key={metric} className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600">{metric}</div>
                                <div className="text-lg font-semibold">
                                  {typeof value === 'number' ? (value * 100).toFixed(1) + '%' : value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTest(test)}
                        >
                          Configure
                        </Button>
                        {test.status === 'running' && (
                          <Button variant="outline" size="sm">
                            Pause Test
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Create New A/B Test</CardTitle>
                <CardDescription>Set up a new A/B test for feature optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>
                  Create A/B Test
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            {/* Runtime Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Runtime Configuration</CardTitle>
                <CardDescription>Manage application configuration that can be updated without deployment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">API Rate Limits</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Starter Tier</span>
                        <Input type="number" defaultValue="100" className="w-20" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pro Tier</span>
                        <Input type="number" defaultValue="1000" className="w-20" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Advanced Tier</span>
                        <Input type="number" defaultValue="10000" className="w-20" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Cache Settings</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">TTL (seconds)</span>
                        <Input type="number" defaultValue="3600" className="w-20" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Max Size (MB)</span>
                        <Input type="number" defaultValue="100" className="w-20" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Enable Redis</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Environment Variables</Label>
                  <Textarea
                    className="mt-2"
                    rows={8}
                    defaultValue={`# Runtime configuration variables
MAX_UPLOAD_SIZE=50MB
ENABLE_ANALYTICS=true
DEFAULT_THEME=professional
WEBHOOK_TIMEOUT=30000
AUTO_SAVE_INTERVAL=5000`}
                  />
                </div>

                <div className="flex gap-2">
                  <Button>Save Configuration</Button>
                  <Button variant="outline">Reset to Defaults</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}