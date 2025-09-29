/**
 * Integration Management Dashboard
 * 
 * Comprehensive dashboard for managing third-party integrations,
 * browsing the marketplace, and monitoring integration performance.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Globe, 
  Settings, 
  TestTube, 
  TrendingUp,
  Zap,
  ExternalLink,
  Copy,
  Play,
  Pause,
  Trash2,
  Plus,
  Search,
  Filter,
  Star,
  Users,
  BarChart3,
  Puzzle
} from 'lucide-react';

interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl?: string;
  websiteUrl?: string;
  verified: boolean;
  popularityScore: number;
  status: 'active' | 'beta' | 'deprecated' | 'coming_soon';
  features: Array<{
    id: string;
    name: string;
    description: string;
    available: boolean;
  }>;
  pricing?: {
    model: 'free' | 'freemium' | 'paid' | 'usage_based';
    freeTier?: {
      requests: number;
      features: string[];
      limitations: string[];
    };
    paidTier?: {
      startingPrice: number;
      currency: string;
      billingPeriod: 'month' | 'year';
      features: string[];
    };
  };
  lastUpdated: string;
}

interface IntegrationInstance {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastHealthCheck?: string;
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationAnalytics {
  totalIntegrations: number;
  activeIntegrations: number;
  usageByProvider: Array<{
    providerId: string;
    providerName: string;
    usage: number;
    errors: number;
  }>;
  popularProviders: Array<{
    providerId: string;
    providerName: string;
    installations: number;
    category: string;
  }>;
  errorAnalysis: Array<{
    type: string;
    count: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  performance: {
    averageResponseTime: number;
    successRate: number;
    uptime: number;
  };
}

export function IntegrationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [instances, setInstances] = useState<IntegrationInstance[]>([]);
  const [analytics, setAnalytics] = useState<IntegrationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load providers
      const providersResponse = await fetch('/api/integrations');
      const providersData = await providersResponse.json();
      
      if (providersData.ok) {
        setProviders(providersData.data.providers);
        setInstances(providersData.data.instances);
      }

      // Load analytics
      const analyticsResponse = await fetch('/api/integrations/analytics');
      const analyticsData = await analyticsResponse.json();
      
      if (analyticsData.ok) {
        setAnalytics(analyticsData.data.analytics);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = !searchQuery || 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    const matchesProvider = !selectedProvider || provider.id === selectedProvider;
    
    return matchesSearch && matchesCategory && matchesProvider;
  });

  const categories = Array.from(new Set(providers.map(p => p.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration Management</h1>
          <p className="text-muted-foreground">
            Connect and manage third-party services and APIs
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="instances">My Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {analytics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                  <Puzzle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalIntegrations}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.activeIntegrations} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.performance.successRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average over last 7 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.performance.averageResponseTime}ms</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.performance.uptime.toFixed(1)}% uptime
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Popular Providers</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.popularProviders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Available integrations
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Providers</CardTitle>
                <CardDescription>Most used integration providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.popularProviders.slice(0, 5).map((provider) => (
                    <div key={provider.providerId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{provider.category}</Badge>
                        <span className="text-sm font-medium">{provider.providerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {provider.installations} installs
                        </span>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>Status of your active integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {instances.slice(0, 5).map((instance) => {
                    const provider = providers.find(p => p.id === instance.providerId);
                    return (
                      <div key={instance.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            instance.status === 'active' ? 'bg-green-500' :
                            instance.status === 'error' ? 'bg-red-500' :
                            instance.status === 'pending' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`} />
                          <span className="text-sm font-medium">{instance.name}</span>
                          {provider && (
                            <Badge variant="outline" className="text-xs">
                              {provider.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(instance.updatedAt).toLocaleDateString()}
                          </span>
                          {instance.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {provider.logoUrl && (
                        <img 
                          src={provider.logoUrl} 
                          alt={provider.name}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <div>
                        <CardTitle className="text-base">{provider.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {provider.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {provider.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                      <Badge 
                        variant={provider.status === 'active' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {provider.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline" className="capitalize">
                        {provider.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Popularity:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{provider.popularityScore}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {provider.features.slice(0, 3).map((feature) => (
                        <Badge key={feature.id} variant="outline" className="text-xs">
                          {feature.name}
                        </Badge>
                      ))}
                    </div>

                    {provider.pricing && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pricing:</span>
                        <span className="capitalize">{provider.pricing.model}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Updated {new Date(provider.lastUpdated).toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-1">
                        {provider.websiteUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={provider.websiteUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProviders.length === 0 && (
            <div className="text-center py-8">
              <Puzzle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No integrations found matching your criteria</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Integrations</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>

          <div className="grid gap-4">
            {instances.map((instance) => {
              const provider = providers.find(p => p.id === instance.providerId);
              return (
                <Card key={instance.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {provider?.logoUrl && (
                          <img 
                            src={provider.logoUrl} 
                            alt={provider.name}
                            className="w-10 h-10 rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-medium">{instance.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {provider?.name} • {instance.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            instance.status === 'active' ? 'bg-green-500' :
                            instance.status === 'error' ? 'bg-red-500' :
                            instance.status === 'pending' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`} />
                          <span className="text-sm capitalize">{instance.status}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <TestTube className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {instance.errorMessage && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{instance.errorMessage}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {instances.length === 0 && (
            <div className="text-center py-8">
              <Puzzle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No integrations configured yet</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Integration
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Analytics</CardTitle>
              <CardDescription>Performance metrics and usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  Advanced analytics features are available. Use the API endpoints to get detailed metrics,
                  usage patterns, and performance analysis for your integrations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
