'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Globe,
  MapPin,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';

interface RouteManagementData {
  id: string;
  path: string;
  fullUrl: string;
  templateId: string;
  templateName: string;
  tenantId: string;
  tenantName: string;
  status: 'active' | 'inactive' | 'pending' | 'error' | 'maintenance';
  customDomain?: string;
  performance: {
    loadTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  };
  analytics: {
    totalViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  seo: {
    score: number;
    title: string;
    description: string;
    keywords: string[];
  };
  security: {
    httpsEnabled: boolean;
    cspEnabled: boolean;
    rateLimitEnabled: boolean;
    authRequired: boolean;
  };
  createdAt: string;
  lastModified: string;
  lastAccessed: string;
}

interface RouteFilter {
  status: string[];
  templateType: string[];
  customDomain: boolean | null;
  performanceThreshold: number;
  createdDateRange: [string, string] | null;
}

export default function RouteManagementPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [routes, setRoutes] = useState<RouteManagementData[]>([
    {
      id: 'route_001',
      path: '/acme-consulting/consultation',
      fullUrl: 'https://app.example.com/acme-consulting/consultation',
      templateId: 'tmpl_landing_001',
      templateName: 'Consultation Landing Page',
      tenantId: 'tenant_abc123',
      tenantName: 'Acme Consulting',
      status: 'active',
      customDomain: 'consulting.acme.com',
      performance: {
        loadTime: 1.2,
        uptime: 99.8,
        errorRate: 0.1,
        throughput: 150
      },
      analytics: {
        totalViews: 2847,
        uniqueVisitors: 1923,
        bounceRate: 23.5,
        avgSessionDuration: 245
      },
      seo: {
        score: 92,
        title: 'Professional Business Consultation | Acme Consulting',
        description: 'Get expert business consultation and recommendations from Acme Consulting professionals.',
        keywords: ['business consultation', 'professional advice', 'business growth', 'strategic planning']
      },
      security: {
        httpsEnabled: true,
        cspEnabled: true,
        rateLimitEnabled: true,
        authRequired: false
      },
      createdAt: '2025-09-18T20:30:00Z',
      lastModified: '2025-09-18T20:45:00Z',
      lastAccessed: '2025-09-18T20:47:00Z'
    },
    {
      id: 'route_002',
      path: '/beta-solutions/questionnaire',
      fullUrl: 'https://app.example.com/beta-solutions/questionnaire',
      templateId: 'tmpl_questionnaire_001',
      templateName: 'Client Questionnaire Flow',
      tenantId: 'tenant_def456',
      tenantName: 'Beta Solutions',
      status: 'active',
      performance: {
        loadTime: 0.9,
        uptime: 99.9,
        errorRate: 0.05,
        throughput: 89
      },
      analytics: {
        totalViews: 1456,
        uniqueVisitors: 1134,
        bounceRate: 18.2,
        avgSessionDuration: 312
      },
      seo: {
        score: 88,
        title: 'Client Assessment Questionnaire | Beta Solutions',
        description: 'Complete our comprehensive questionnaire to receive personalized business recommendations.',
        keywords: ['client assessment', 'business questionnaire', 'personalized recommendations']
      },
      security: {
        httpsEnabled: true,
        cspEnabled: true,
        rateLimitEnabled: true,
        authRequired: true
      },
      createdAt: '2025-09-18T20:32:00Z',
      lastModified: '2025-09-18T20:40:00Z',
      lastAccessed: '2025-09-18T20:46:00Z'
    },
    {
      id: 'route_003',
      path: '/gamma-corp/pdf-report',
      fullUrl: 'https://app.example.com/gamma-corp/pdf-report',
      templateId: 'tmpl_pdf_001',
      templateName: 'PDF Consultation Report',
      tenantId: 'tenant_ghi789',
      tenantName: 'Gamma Corp',
      status: 'maintenance',
      performance: {
        loadTime: 2.1,
        uptime: 95.2,
        errorRate: 0.8,
        throughput: 23
      },
      analytics: {
        totalViews: 567,
        uniqueVisitors: 445,
        bounceRate: 31.7,
        avgSessionDuration: 189
      },
      seo: {
        score: 76,
        title: 'Consultation Report | Gamma Corp',
        description: 'Download your personalized business consultation report.',
        keywords: ['consultation report', 'business analysis', 'recommendations']
      },
      security: {
        httpsEnabled: true,
        cspEnabled: false,
        rateLimitEnabled: true,
        authRequired: true
      },
      createdAt: '2025-09-18T20:35:00Z',
      lastModified: '2025-09-18T20:38:00Z',
      lastAccessed: '2025-09-18T20:41:00Z'
    }
  ]);

  const [filters, setFilters] = useState<RouteFilter>({
    status: [],
    templateType: [],
    customDomain: null,
    performanceThreshold: 0,
    createdDateRange: null
  });

  const filteredRoutes = routes.filter(route => {
    if (searchTerm && !route.templateName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !route.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !route.path.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (filters.status.length > 0 && !filters.status.includes(route.status)) {
      return false;
    }

    if (filters.customDomain !== null) {
      if (filters.customDomain && !route.customDomain) return false;
      if (!filters.customDomain && route.customDomain) return false;
    }

    if (filters.performanceThreshold > 0 && route.performance.loadTime > filters.performanceThreshold) {
      return false;
    }

    return true;
  });

  const handleSelectRoute = (routeId: string) => {
    setSelectedRoutes(prev =>
      prev.includes(routeId)
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRoutes.length === filteredRoutes.length) {
      setSelectedRoutes([]);
    } else {
      setSelectedRoutes(filteredRoutes.map(route => route.id));
    }
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete' | 'export') => {
    if (action === 'delete') {
      setRoutes(prev => prev.filter(route => !selectedRoutes.includes(route.id)));
      setSelectedRoutes([]);
    } else if (action === 'activate' || action === 'deactivate') {
      const newStatus = action === 'activate' ? 'active' : 'inactive';
      setRoutes(prev =>
        prev.map(route =>
          selectedRoutes.includes(route.id)
            ? { ...route, status: newStatus as any }
            : route
        )
      );
    } else if (action === 'export') {
      const exportData = routes.filter(route => selectedRoutes.includes(route.id));
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'routes_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPerformanceScore = (performance: RouteManagementData['performance']) => {
    const loadTimeScore = Math.max(0, 100 - (performance.loadTime - 1) * 50);
    const uptimeScore = performance.uptime;
    const errorScore = Math.max(0, 100 - performance.errorRate * 10);
    const throughputScore = Math.min(100, performance.throughput / 2);

    return Math.round((loadTimeScore + uptimeScore + errorScore + throughputScore) / 4);
  };

  const routeStats = {
    total: routes.length,
    active: routes.filter(r => r.status === 'active').length,
    inactive: routes.filter(r => r.status === 'inactive').length,
    maintenance: routes.filter(r => r.status === 'maintenance').length,
    error: routes.filter(r => r.status === 'error').length,
    avgPerformance: Math.round(routes.reduce((sum, r) => sum + getPerformanceScore(r.performance), 0) / routes.length),
    totalViews: routes.reduce((sum, r) => sum + r.analytics.totalViews, 0),
    avgLoadTime: Number((routes.reduce((sum, r) => sum + r.performance.loadTime, 0) / routes.length).toFixed(2))
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRoutes(prev =>
        prev.map(route => ({
          ...route,
          performance: {
            ...route.performance,
            throughput: Math.max(0, route.performance.throughput + (Math.random() - 0.5) * 10)
          },
          analytics: {
            ...route.analytics,
            totalViews: route.analytics.totalViews + Math.floor(Math.random() * 3)
          }
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Route Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor your dynamic routes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{routeStats.total} Total Routes</Badge>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routes">Route List</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {routeStats.active} active, {routeStats.inactive} inactive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Across all routes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.avgPerformance}</div>
                <p className="text-xs text-muted-foreground">
                  Performance score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.avgLoadTime}s</div>
                <p className="text-xs text-muted-foreground">
                  Response time
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm">Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{routeStats.active}</span>
                      <Badge variant="secondary">{Math.round((routeStats.active / routeStats.total) * 100)}%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full" />
                      <span className="text-sm">Inactive</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{routeStats.inactive}</span>
                      <Badge variant="secondary">{Math.round((routeStats.inactive / routeStats.total) * 100)}%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full" />
                      <span className="text-sm">Maintenance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{routeStats.maintenance}</span>
                      <Badge variant="secondary">{Math.round((routeStats.maintenance / routeStats.total) * 100)}%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {routes.slice(0, 3).map((route) => (
                    <div key={route.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-1 rounded-full ${getStatusColor(route.status)} text-white`}>
                          {getStatusIcon(route.status)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{route.templateName}</p>
                          <p className="text-xs text-muted-foreground">{route.tenantName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(route.lastAccessed).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Route Management</CardTitle>
                  <CardDescription>View and manage all dynamic routes</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search routes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showFilters && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Status</Label>
                      <div className="space-y-1 mt-1">
                        {['active', 'inactive', 'maintenance', 'error'].map((status) => (
                          <label key={status} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.status.includes(status)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({ ...prev, status: [...prev.status, status] }));
                                } else {
                                  setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }));
                                }
                              }}
                            />
                            <span className="text-sm capitalize">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Custom Domain</Label>
                      <div className="space-y-1 mt-1">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="customDomain"
                            checked={filters.customDomain === true}
                            onChange={() => setFilters(prev => ({ ...prev, customDomain: true }))}
                          />
                          <span className="text-sm">Has Custom Domain</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="customDomain"
                            checked={filters.customDomain === false}
                            onChange={() => setFilters(prev => ({ ...prev, customDomain: false }))}
                          />
                          <span className="text-sm">No Custom Domain</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="customDomain"
                            checked={filters.customDomain === null}
                            onChange={() => setFilters(prev => ({ ...prev, customDomain: null }))}
                          />
                          <span className="text-sm">All</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <Label>Max Load Time (seconds)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 2.0"
                        value={filters.performanceThreshold || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, performanceThreshold: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => setFilters({
                          status: [],
                          templateType: [],
                          customDomain: null,
                          performanceThreshold: 0,
                          createdDateRange: null
                        })}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedRoutes.length > 0 && (
                <div className="mb-4 p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {selectedRoutes.length} route{selectedRoutes.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                        Activate
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                        Deactivate
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                        Export
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border-b">
                  <input
                    type="checkbox"
                    checked={selectedRoutes.length === filteredRoutes.length && filteredRoutes.length > 0}
                    onChange={handleSelectAll}
                  />
                  <div className="flex-1 grid grid-cols-8 gap-4 text-sm font-medium text-muted-foreground">
                    <div className="col-span-2">Route</div>
                    <div>Status</div>
                    <div>Performance</div>
                    <div>Views</div>
                    <div>Load Time</div>
                    <div>SEO Score</div>
                    <div>Actions</div>
                  </div>
                </div>

                {filteredRoutes.map((route) => (
                  <div key={route.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={selectedRoutes.includes(route.id)}
                      onChange={() => handleSelectRoute(route.id)}
                    />
                    <div className="flex-1 grid grid-cols-8 gap-4 items-center">
                      <div className="col-span-2">
                        <div>
                          <p className="font-medium">{route.templateName}</p>
                          <p className="text-sm text-muted-foreground">{route.tenantName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="text-xs bg-muted px-1 rounded">{route.path}</code>
                            {route.customDomain && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Custom
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Badge variant="outline" className={`${getStatusColor(route.status)} text-white`}>
                          {route.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">{getPerformanceScore(route.performance)}</div>
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getPerformanceScore(route.performance) > 80 ? 'bg-green-500' : getPerformanceScore(route.performance) > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${getPerformanceScore(route.performance)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{route.analytics.totalViews.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{route.analytics.uniqueVisitors} unique</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{route.performance.loadTime}s</p>
                        <p className="text-xs text-muted-foreground">{route.performance.uptime}% uptime</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{route.seo.score}</p>
                        <p className="text-xs text-muted-foreground">SEO score</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.avgLoadTime}s</div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt;2.0s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Number((routes.reduce((sum, r) => sum + r.performance.uptime, 0) / routes.length).toFixed(1))}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &gt;99.9%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Error Rate</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Number((routes.reduce((sum, r) => sum + r.performance.errorRate, 0) / routes.length).toFixed(2))}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt;0.1%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Throughput</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(routes.reduce((sum, r) => sum + r.performance.throughput, 0) / routes.length)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requests/minute
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Details</CardTitle>
              <CardDescription>Detailed performance metrics for each route</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.map((route) => (
                  <div key={route.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{route.templateName}</h4>
                        <p className="text-sm text-muted-foreground">{route.tenantName}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(route.status) + ' text-white'}>
                        {route.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Load Time</Label>
                        <div className="mt-1">
                          <div className="text-lg font-bold">{route.performance.loadTime}s</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${route.performance.loadTime < 1.5 ? 'bg-green-500' : route.performance.loadTime < 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(100, (3 - route.performance.loadTime) / 3 * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Uptime</Label>
                        <div className="mt-1">
                          <div className="text-lg font-bold">{route.performance.uptime}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${route.performance.uptime > 99.5 ? 'bg-green-500' : route.performance.uptime > 99 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${route.performance.uptime}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Error Rate</Label>
                        <div className="mt-1">
                          <div className="text-lg font-bold">{route.performance.errorRate}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${route.performance.errorRate < 0.1 ? 'bg-green-500' : route.performance.errorRate < 1 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(100, route.performance.errorRate * 10)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Throughput</Label>
                        <div className="mt-1">
                          <div className="text-lg font-bold">{route.performance.throughput}</div>
                          <div className="text-xs text-muted-foreground">req/min</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Across all routes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {routes.reduce((sum, r) => sum + r.analytics.uniqueVisitors, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Individual users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Bounce Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Number((routes.reduce((sum, r) => sum + r.analytics.bounceRate, 0) / routes.length).toFixed(1))}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Single page visits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(routes.reduce((sum, r) => sum + r.analytics.avgSessionDuration, 0) / routes.length)}s
                </div>
                <p className="text-xs text-muted-foreground">
                  Duration
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analytics Details</CardTitle>
              <CardDescription>Detailed analytics for each route</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.map((route) => (
                  <div key={route.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{route.templateName}</h4>
                        <p className="text-sm text-muted-foreground">{route.tenantName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">SEO Score: {route.seo.score}</p>
                        <p className="text-xs text-muted-foreground">{route.seo.keywords.length} keywords</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Total Views</Label>
                        <div className="text-lg font-bold">{route.analytics.totalViews.toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Unique Visitors</Label>
                        <div className="text-lg font-bold">{route.analytics.uniqueVisitors.toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Bounce Rate</Label>
                        <div className="text-lg font-bold">{route.analytics.bounceRate}%</div>
                      </div>
                      <div>
                        <Label className="text-xs">Avg Session</Label>
                        <div className="text-lg font-bold">{route.analytics.avgSessionDuration}s</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
              <CardDescription>Security status and configuration for all routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.map((route) => (
                  <div key={route.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{route.templateName}</h4>
                        <p className="text-sm text-muted-foreground">{route.tenantName}</p>
                      </div>
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        {Object.values(route.security).filter(Boolean).length}/4 enabled
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${route.security.httpsEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">HTTPS</span>
                        <Badge variant={route.security.httpsEnabled ? "default" : "destructive"} className="text-xs">
                          {route.security.httpsEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${route.security.cspEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">CSP</span>
                        <Badge variant={route.security.cspEnabled ? "default" : "destructive"} className="text-xs">
                          {route.security.cspEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${route.security.rateLimitEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">Rate Limit</span>
                        <Badge variant={route.security.rateLimitEnabled ? "default" : "destructive"} className="text-xs">
                          {route.security.rateLimitEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${route.security.authRequired ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className="text-sm">Auth Required</span>
                        <Badge variant={route.security.authRequired ? "default" : "secondary"} className="text-xs">
                          {route.security.authRequired ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}