'use client'

/**
 * Service Package Management Interface
 *
 * Administrative interface for managing service packages with full CRUD operations,
 * search, filtering, templates, and bulk operations.
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Package,
  BarChart3,
  Settings,
  Eye,
  MoreHorizontal
} from 'lucide-react'
import { ServicePackageEditor } from '@/components/admin/service-package-editor'
import type { ServicePackage } from '@/lib/ai/consultation-generator'
import type { ServicePackageCategory, ServicePackageTemplate, ServicePackageStats } from '@/lib/consultation/service-packages'
import { spacing, typography } from '@/lib/ui/shared-patterns'

interface ServicePackageData {
  packages: ServicePackage[];
  categories: ServicePackageCategory[];
  templates: ServicePackageTemplate[];
  stats: ServicePackageStats;
  total: number;
}

/**
 * Main service package management page
 */
export default function ServicePackagesPage() {
  const [data, setData] = useState<ServicePackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedTier) params.set('tier', selectedTier);

      const response = await fetch(`/api/admin/service-packages?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to load packages:', result.error);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedTier]);

  // Reload data when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  const handleCreatePackage = useCallback(() => {
    setEditingPackage(null);
    setShowEditor(true);
  }, []);

  const handleEditPackage = useCallback((pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setShowEditor(true);
  }, []);

  const handleDuplicatePackage = useCallback(async (pkg: ServicePackage) => {
    try {
      const duplicateData = {
        ...pkg,
        title: `${pkg.title} (Copy)`,
        description: `${pkg.description} (Copy)`
      };
      delete (duplicateData as any).id;

      const response = await fetch('/api/admin/service-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error duplicating package:', error);
    }
  }, [loadData]);

  const handleDeletePackage = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const response = await fetch(`/api/admin/service-packages?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData();
        setSelectedPackages(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  }, [loadData]);

  const handleSavePackage = useCallback(async (packageData: Omit<ServicePackage, 'id'>) => {
    try {
      const isEditing = !!editingPackage;
      const url = isEditing
        ? `/api/admin/service-packages?id=${editingPackage!.id}`
        : '/api/admin/service-packages';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData)
      });

      if (response.ok) {
        setShowEditor(false);
        setEditingPackage(null);
        loadData();
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save package');
      }
    } catch (error) {
      console.error('Error saving package:', error);
      throw error;
    }
  }, [editingPackage, loadData]);

  const handleBulkAction = useCallback(async (action: 'delete' | 'export') => {
    if (selectedPackages.size === 0) return;

    if (action === 'delete') {
      if (!confirm(`Delete ${selectedPackages.size} selected packages?`)) return;

      for (const id of selectedPackages) {
        try {
          await fetch(`/api/admin/service-packages?id=${id}`, { method: 'DELETE' });
        } catch (error) {
          console.error(`Error deleting package ${id}:`, error);
        }
      }

      setSelectedPackages(new Set());
      loadData();
    } else if (action === 'export') {
      // Export functionality
      if (data) {
        const exportData = {
          packages: data.packages.filter(pkg => selectedPackages.has(pkg.id)),
          exported_at: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `service-packages-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  }, [selectedPackages, data, loadData]);

  const togglePackageSelection = useCallback((id: string) => {
    setSelectedPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'foundation': return 'bg-green-100 text-green-800';
      case 'growth': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showEditor) {
    return (
      <div className="container mx-auto py-6 px-4">
        <ServicePackageEditor
          package={editingPackage}
          categories={data?.categories || []}
          templates={data?.templates || []}
          onSave={handleSavePackage}
          onCancel={() => setShowEditor(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Service Packages</h1>
            <p className="text-muted-foreground">
              Manage consultation service packages and pricing tiers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>

          <Button onClick={handleCreatePackage} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Package
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && data?.stats && (
        <Card>
          <CardHeader>
            <CardTitle>Package Statistics</CardTitle>
            <CardDescription>
              Overview of service package performance and usage metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{data.stats.total_packages}</div>
                <div className="text-sm text-muted-foreground">Total Packages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{data.stats.by_tier.foundation || 0}</div>
                <div className="text-sm text-muted-foreground">Foundation Tier</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{data.stats.by_tier.growth || 0}</div>
                <div className="text-sm text-muted-foreground">Growth Tier</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{data.stats.by_tier.enterprise || 0}</div>
                <div className="text-sm text-muted-foreground">Enterprise Tier</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {data?.categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Tiers</SelectItem>
                <SelectItem value="foundation">Foundation</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedPackages.size > 0 && (
            <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedPackages.size} packages selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                  className="gap-1"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading packages...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.packages.map(pkg => (
            <Card key={pkg.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedPackages.has(pkg.id)}
                      onChange={() => togglePackageSelection(pkg.id)}
                      className="mt-1"
                    />

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{pkg.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Badge className={getTierColor(pkg.tier)}>
                            {pkg.tier.charAt(0).toUpperCase() + pkg.tier.slice(1)}
                          </Badge>
                          {pkg.price_band && (
                            <Badge variant="outline">{pkg.price_band}</Badge>
                          )}
                          {pkg.timeline && (
                            <Badge variant="outline">{pkg.timeline}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Category: {data?.categories.find(c => c.id === pkg.category)?.name || pkg.category}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{pkg.includes.length} features included</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{pkg.industry_tags.length} industry tags</span>
                      </div>

                      {pkg.industry_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {pkg.industry_tags.slice(0, 4).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {pkg.industry_tags.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{pkg.industry_tags.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPackage(pkg)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicatePackage(pkg)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {data?.packages.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No packages found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory || selectedTier
                    ? 'Try adjusting your filters or search terms'
                    : 'Get started by creating your first service package'
                  }
                </p>
                <Button onClick={handleCreatePackage} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Package
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}