/**
 * @fileoverview Enterprise Template Management Interface
 * @module app/admin/templates/enterprise/page
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-20T12:58:28.000Z
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Settings, 
  MoreVertical,
  Package,
  Users,
  Activity,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { EnterpriseManager } from '@/components/admin/enterprise-manager';
import { BulkOperations } from '@/components/admin/bulk-operations';

interface Template {
  id: string;
  name: string;
  version: string;
  author: string;
  category: string;
  status: 'active' | 'deprecated' | 'maintenance' | 'beta';
  downloads: number;
  lastUpdated: string;
  dependencies: string[];
  size: string;
  license: string;
  securityScore: number;
  performanceScore: number;
  compatibility: string[];
  tags: string[];
}

interface EnterpriseStats {
  totalTemplates: number;
  activeTemplates: number;
  totalDownloads: number;
  averageRating: number;
  securityIssues: number;
  pendingUpdates: number;
}

export default function EnterpriseTemplatePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<EnterpriseStats>({
    totalTemplates: 0,
    activeTemplates: 0,
    totalDownloads: 0,
    averageRating: 0,
    securityIssues: 0,
    pendingUpdates: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEnterpriseData();
  }, []);

  const loadEnterpriseData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, this would fetch from API
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Enterprise Dashboard Pro',
          version: '2.1.0',
          author: 'OSS Hero Team',
          category: 'Dashboard',
          status: 'active',
          downloads: 15420,
          lastUpdated: '2025-09-15T10:30:00Z',
          dependencies: ['react', 'typescript', 'tailwindcss'],
          size: '2.4 MB',
          license: 'MIT',
          securityScore: 95,
          performanceScore: 88,
          compatibility: ['React 18+', 'Next.js 14+', 'Node.js 18+'],
          tags: ['dashboard', 'analytics', 'enterprise', 'responsive']
        },
        {
          id: '2',
          name: 'Advanced Form Builder',
          version: '1.8.3',
          author: 'Form Systems Inc',
          category: 'Forms',
          status: 'active',
          downloads: 8750,
          lastUpdated: '2025-09-10T14:20:00Z',
          dependencies: ['react-hook-form', 'zod', 'typescript'],
          size: '1.8 MB',
          license: 'MIT',
          securityScore: 92,
          performanceScore: 91,
          compatibility: ['React 17+', 'Next.js 13+', 'Node.js 16+'],
          tags: ['forms', 'validation', 'builder', 'enterprise']
        },
        {
          id: '3',
          name: 'E-commerce Suite',
          version: '3.0.0-beta',
          author: 'Commerce Labs',
          category: 'E-commerce',
          status: 'beta',
          downloads: 3200,
          lastUpdated: '2025-09-18T09:15:00Z',
          dependencies: ['stripe', 'paypal-sdk', 'prisma'],
          size: '5.2 MB',
          license: 'Commercial',
          securityScore: 87,
          performanceScore: 85,
          compatibility: ['React 18+', 'Next.js 14+', 'Node.js 18+'],
          tags: ['ecommerce', 'payments', 'inventory', 'beta']
        }
      ];

      const mockStats: EnterpriseStats = {
        totalTemplates: 156,
        activeTemplates: 142,
        totalDownloads: 284750,
        averageRating: 4.6,
        securityIssues: 3,
        pendingUpdates: 12
      };

      setTemplates(mockTemplates);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading enterprise data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'deprecated':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'beta':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleBulkAction = (action: string, templateIds: string[]) => {
    console.log(`Performing ${action} on templates:`, templateIds);
    // Implementation would handle bulk operations
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Template Management</h1>
            <p className="text-gray-600 mt-1">Manage and monitor your enterprise template ecosystem</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Templates
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Templates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeTemplates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.securityIssues}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Updates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingUpdates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="bulk-ops">Bulk Operations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <EnterpriseManager 
              templates={templates}
              stats={stats}
              onRefresh={loadEnterpriseData}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {/* Search and Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search templates, authors, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Dashboard">Dashboard</option>
                    <option value="Forms">Forms</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Analytics">Analytics</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">by {template.author}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(template.status)}>
                          {template.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Version {template.version}</span>
                      <span className="text-gray-600">{template.size}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Security Score</span>
                        <span className={`text-sm font-medium ${getScoreColor(template.securityScore)}`}>
                          {template.securityScore}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Performance</span>
                        <span className={`text-sm font-medium ${getScoreColor(template.performanceScore)}`}>
                          {template.performanceScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Downloads: {template.downloads.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        Updated: {new Date(template.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        Manage
                      </Button>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bulk-ops" className="space-y-4">
            <BulkOperations 
              templates={templates}
              selectedTemplates={selectedTemplates}
              onSelectionChange={setSelectedTemplates}
              onBulkAction={handleBulkAction}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics dashboard coming soon...</p>
                  <p className="text-sm">Track template performance, usage patterns, and insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
