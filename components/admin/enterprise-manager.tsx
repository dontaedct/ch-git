/**
 * @fileoverview Enterprise Management Interface Components
 * @module components/admin/enterprise-manager
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
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Shield,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Download,
  Star,
  Zap,
  Settings,
  RefreshCw,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';

interface EnterpriseTemplate {
  id: string;
  name: string;
  version: string;
  author: string;
  category: string;
  status: 'active' | 'deprecated' | 'maintenance' | 'beta';
  downloads: number;
  lastUpdated: string;
  securityScore: number;
  performanceScore: number;
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

interface EnterpriseManagerProps {
  templates: EnterpriseTemplate[];
  stats: EnterpriseStats;
  onRefresh: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function EnterpriseManager({ templates, stats, onRefresh }: EnterpriseManagerProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [loading, setLoading] = useState(false);
  
  // Mock chart data
  const downloadTrends = [
    { name: 'Mon', downloads: 1200 },
    { name: 'Tue', downloads: 1900 },
    { name: 'Wed', downloads: 800 },
    { name: 'Thu', downloads: 2100 },
    { name: 'Fri', downloads: 1600 },
    { name: 'Sat', downloads: 900 },
    { name: 'Sun', downloads: 1300 }
  ];
  
  const categoryDistribution = [
    { name: 'Dashboard', value: 35, templates: 45 },
    { name: 'Forms', value: 25, templates: 32 },
    { name: 'E-commerce', value: 20, templates: 26 },
    { name: 'Analytics', value: 12, templates: 15 },
    { name: 'Other', value: 8, templates: 10 }
  ];
  
  const securityOverview = [
    { severity: 'Critical', count: 2, color: '#DC2626' },
    { severity: 'High', count: 5, color: '#EA580C' },
    { severity: 'Medium', count: 12, color: '#D97706' },
    { severity: 'Low', count: 8, color: '#65A30D' },
    { severity: 'None', count: 101, color: '#059669' }
  ];
  
  const handleRefresh = async () => {
    setLoading(true);
    await onRefresh();
    setLoading(false);
  };
  
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
  
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>
      
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Download Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Download Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={downloadTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="downloads" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-600" />
              Template Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.name} ({item.templates})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-red-600" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {securityOverview.map((item) => (
              <div key={item.severity} className="text-center">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: item.color }}
                >
                  {item.count}
                </div>
                <p className="text-sm font-medium text-gray-900">{item.severity}</p>
                <p className="text-xs text-gray-500">
                  {item.severity === 'None' ? 'Clean' : 'Issues'}
                </p>
              </div>
            ))}
          </div>
          
          {stats.securityIssues > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800 font-medium">
                  {stats.securityIssues} security issues require attention
                </p>
              </div>
              <div className="mt-2">
                <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                  View Details
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Top Performing Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-600" />
            Top Performing Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.slice(0, 5).map((template, index) => (
              <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500">by {template.author}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {template.downloads.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Downloads</p>
                  </div>
                  
                  <div className="text-center">
                    <p className={`text-sm font-medium ${getScoreColor(template.securityScore)}`}>
                      {template.securityScore}
                    </p>
                    <p className="text-xs text-gray-500">Security</p>
                  </div>
                  
                  <div className="text-center">
                    <p className={`text-sm font-medium ${getScoreColor(template.performanceScore)}`}>
                      {template.performanceScore}
                    </p>
                    <p className="text-xs text-gray-500">Performance</p>
                  </div>
                  
                  <Badge className={getStatusColor(template.status)}>
                    {template.status}
                  </Badge>
                  
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Templates
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Template Registry</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Healthy</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Security Scanner</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Running</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Backup System</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Warning</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">API Endpoints</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Template approved</p>
                  <p className="text-xs text-gray-500">Enterprise Dashboard Pro v2.1.0</p>
                  <p className="text-xs text-gray-400">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Security scan completed</p>
                  <p className="text-xs text-gray-500">15 templates scanned, 2 issues found</p>
                  <p className="text-xs text-gray-400">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Template deprecated</p>
                  <p className="text-xs text-gray-500">Legacy Form Builder v1.2.0</p>
                  <p className="text-xs text-gray-400">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Bulk operation completed</p>
                  <p className="text-xs text-gray-500">Updated 25 template priorities</p>
                  <p className="text-xs text-gray-400">3 hours ago</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View Activity Log
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Shield className="h-6 w-6 text-red-600" />
              <span className="text-sm">Security Scan</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-sm">Bulk Approve</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Download className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Export Data</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Settings className="h-6 w-6 text-gray-600" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
