/**
 * Route Manager Component
 * 
 * Manages dynamic routes for templates with URL structure management,
 * SEO configuration, and custom domain support.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getRouteGenerator, RouteConfig, SEOConfig } from '../../lib/template-engine/route-generator';
import { TemplateManifest } from '../../types/componentContracts';

interface RouteManagerProps {
  template: TemplateManifest;
  tenantId: string;
  onRouteCreated?: (route: RouteConfig) => void;
  onRouteUpdated?: (route: RouteConfig) => void;
  onRouteDeleted?: (routeId: string) => void;
  onClose: () => void;
}

interface RouteFormData {
  customPath: string;
  customDomain: string;
  seo: Partial<SEOConfig>;
}

export const RouteManager: React.FC<RouteManagerProps> = ({
  template,
  tenantId,
  onRouteCreated,
  onRouteUpdated,
  onRouteDeleted,
  onClose
}) => {
  const [routes, setRoutes] = useState<RouteConfig[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteConfig | null>(null);
  const [formData, setFormData] = useState<RouteFormData>({
    customPath: '',
    customDomain: '',
    seo: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routeGenerator = getRouteGenerator();

  // Load existing routes
  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const templateRoutes = routeGenerator.getTemplateRoutes(template.id);
      setRoutes(templateRoutes);
    } catch (err) {
      setError('Failed to load routes');
      console.error('Failed to load routes:', err);
    } finally {
      setLoading(false);
    }
  }, [template.id, routeGenerator]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingRoute) {
        // Update existing route
        const updatedRoute = routeGenerator.updateRoute(editingRoute.id, {
          path: formData.customPath || undefined,
          customDomain: formData.customDomain || undefined,
          seo: { ...editingRoute.seo, ...formData.seo }
        });
        
        setRoutes(prev => prev.map(route => 
          route.id === editingRoute.id ? updatedRoute : route
        ));
        
        onRouteUpdated?.(updatedRoute);
        setEditingRoute(null);
      } else {
        // Create new route
        const newRoute = routeGenerator.generateRoute(template, tenantId, {
          customPath: formData.customPath || undefined,
          customDomain: formData.customDomain || undefined,
          seoOverrides: formData.seo
        });
        
        setRoutes(prev => [...prev, newRoute]);
        onRouteCreated?.(newRoute);
      }

      setShowCreateForm(false);
      setFormData({ customPath: '', customDomain: '', seo: {} });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save route');
      console.error('Failed to save route:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle route deletion
  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route?')) {
      return;
    }

    try {
      routeGenerator.deleteRoute(routeId);
      setRoutes(prev => prev.filter(route => route.id !== routeId));
      onRouteDeleted?.(routeId);
    } catch (err) {
      setError('Failed to delete route');
      console.error('Failed to delete route:', err);
    }
  };

  // Handle edit route
  const handleEditRoute = (route: RouteConfig) => {
    setEditingRoute(route);
    setFormData({
      customPath: route.path.replace(`/${tenantId}/${template.slug}`, '') || '',
      customDomain: route.customDomain || '',
      seo: {
        title: route.seo.title,
        description: route.seo.description,
        keywords: route.seo.keywords,
        ogImage: route.seo.ogImage,
        robots: route.seo.robots
      }
    });
    setShowCreateForm(true);
  };

  // Generate sitemap
  const handleGenerateSitemap = () => {
    const sitemap = routeGenerator.generateSitemap(tenantId);
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate robots.txt
  const handleGenerateRobots = () => {
    const robots = routeGenerator.generateRobotsTxt(tenantId, window.location.origin);
    const blob = new Blob([robots], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Route Manager</h2>
              <p className="text-sm text-gray-600 mt-1">Manage routes for {template.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleGenerateSitemap}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sitemap
              </button>
              <button
                onClick={handleGenerateRobots}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Robots.txt
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Routes List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Routes ({routes.length})</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Route
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading routes...</p>
              </div>
            ) : routes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No routes created yet. Create your first route to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {routes.map((route) => (
                  <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{route.seo.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded ${
                            route.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {route.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{route.fullUrl}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(route.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditRoute(route)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRoute ? 'Edit Route' : 'Create New Route'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Path (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.customPath}
                      onChange={(e) => setFormData(prev => ({ ...prev, customPath: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/custom-path"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Default: /{tenantId}/{template.slug}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Domain (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.customDomain}
                      onChange={(e) => setFormData(prev => ({ ...prev, customDomain: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo.title || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      seo: { ...prev.seo, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Page title for SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seo.description || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      seo: { ...prev.seo, description: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Meta description for SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.seo.keywords?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      seo: { 
                        ...prev.seo, 
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingRoute(null);
                      setFormData({ customPath: '', customDomain: '', seo: {} });
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingRoute ? 'Update Route' : 'Create Route'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteManager;
