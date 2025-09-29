/**
 * @fileoverview Template Registration Interface Components - HT-032.1.2
 * @module components/admin/template-registration
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Template registration interface components that provide UI for registering,
 * managing, and configuring templates in the modular admin interface.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Download, 
  Upload, 
  Settings, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  Loader2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Star,
  Calendar,
  User,
  Tag,
  Globe,
  Shield,
  Zap,
  RefreshCw,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TemplateRegistration, 
  TemplateInstance, 
  TemplateStatus,
  ValidationResult 
} from '@/types/admin/template-registry';
import { getTemplateRegistryManager } from '@/lib/admin/template-registry';
import { getTemplateLoader } from '@/lib/admin/template-loader';

interface TemplateRegistrationProps {
  onRegister?: (template: TemplateRegistration) => Promise<void>;
  onUnregister?: (templateId: string) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

interface TemplateCardProps {
  template: TemplateRegistration;
  instance?: TemplateInstance;
  onInstall?: (templateId: string) => Promise<void>;
  onUninstall?: (templateId: string) => Promise<void>;
  onEnable?: (templateId: string) => Promise<void>;
  onDisable?: (templateId: string) => Promise<void>;
  onView?: (templateId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

interface TemplateRegistrationFormProps {
  onSubmit: (template: Partial<TemplateRegistration>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<TemplateRegistration>;
}

/**
 * Template Registration Form Component
 */
export function TemplateRegistrationForm({ 
  onSubmit, 
  onCancel, 
  loading = false,
  initialData 
}: TemplateRegistrationFormProps) {
  const [formData, setFormData] = useState<Partial<TemplateRegistration>>({
    metadata: {
      id: '',
      name: '',
      description: '',
      version: '1.0.0',
      author: '',
      authorEmail: '',
      category: 'business',
      tags: [],
      license: 'MIT',
      minPlatformVersion: '1.0.0',
      dependencies: [],
      conflicts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...initialData?.metadata
    },
    settings: [],
    navigation: [],
    components: {},
    hooks: {},
    assets: {
      stylesheets: [],
      scripts: [],
      images: [],
      fonts: []
    },
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Basic validation
      const validationErrors: Record<string, string> = {};
      
      if (!formData.metadata?.id?.trim()) {
        validationErrors.id = 'Template ID is required';
      }
      
      if (!formData.metadata?.name?.trim()) {
        validationErrors.name = 'Template name is required';
      }
      
      if (!formData.metadata?.description?.trim()) {
        validationErrors.description = 'Template description is required';
      }
      
      if (!formData.metadata?.author?.trim()) {
        validationErrors.author = 'Author is required';
      }
      
      if (!formData.metadata?.authorEmail?.trim()) {
        validationErrors.authorEmail = 'Author email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.metadata.authorEmail)) {
        validationErrors.authorEmail = 'Invalid email format';
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit template registration:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && formData.metadata?.tags && !formData.metadata.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata!,
          tags: [...prev.metadata!.tags, newTag.trim()]
        }
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        tags: prev.metadata!.tags.filter(tag => tag !== tagToRemove)
      }
    }));
  };

  const categories = [
    'business', 'ecommerce', 'portfolio', 'blog', 
    'landing', 'dashboard', 'admin', 'mobile', 'api'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="id">Template ID *</Label>
          <Input
            id="id"
            value={formData.metadata?.id || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata!, id: e.target.value }
            }))}
            placeholder="my-awesome-template"
            disabled={loading}
            className={errors.id ? 'border-red-500' : ''}
          />
          {errors.id && <p className="text-sm text-red-500">{errors.id}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            value={formData.metadata?.name || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata!, name: e.target.value }
            }))}
            placeholder="My Awesome Template"
            disabled={loading}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.metadata?.description || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            metadata: { ...prev.metadata!, description: e.target.value }
          }))}
          placeholder="Describe what this template does..."
          rows={3}
          disabled={loading}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={formData.metadata?.version || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata!, version: e.target.value }
            }))}
            placeholder="1.0.0"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.metadata?.category || ''}
            onValueChange={(value) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata!, category: value }
            }))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="license">License</Label>
          <Select
            value={formData.metadata?.license || ''}
            onValueChange={(value) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata!, license: value }
            }))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select license" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MIT">MIT</SelectItem>
              <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
              <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
              <SelectItem value="BSD-3-Clause">BSD 3-Clause</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            value={formData.metadata?.author || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata!, author: e.target.value }
            }))}
            placeholder="John Doe"
            disabled={loading}
            className={errors.author ? 'border-red-500' : ''}
          />
          {errors.author && <p className="text-sm text-red-500">{errors.author}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorEmail">Author Email *</Label>
          <Input
            id="authorEmail"
            type="email"
            value={formData.metadata?.authorEmail || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              metadata: { ...prev.metadata!, authorEmail: e.target.value }
            }))}
            placeholder="john@example.com"
            disabled={loading}
            className={errors.authorEmail ? 'border-red-500' : ''}
          />
          {errors.authorEmail && <p className="text-sm text-red-500">{errors.authorEmail}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.metadata?.tags?.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            disabled={loading}
          />
          <Button type="button" onClick={addTag} size="sm" disabled={loading}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Register Template
        </Button>
      </div>
    </form>
  );
}

/**
 * Template Card Component
 */
export function TemplateCard({ 
  template, 
  instance, 
  onInstall, 
  onUninstall, 
  onEnable, 
  onDisable,
  onView,
  loading = false,
  disabled = false 
}: TemplateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setActionLoading(true);
    try {
      await action();
    } catch (error) {
      console.error('Template action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!instance) return <Badge variant="outline">Available</Badge>;
    
    switch (instance.status) {
      case TemplateStatus.INSTALLED:
        return instance.enabled ? 
          <Badge variant="default">Installed</Badge> : 
          <Badge variant="secondary">Disabled</Badge>;
      case TemplateStatus.INSTALLING:
        return <Badge variant="outline">Installing...</Badge>;
      case TemplateStatus.UNINSTALLING:
        return <Badge variant="outline">Uninstalling...</Badge>;
      case TemplateStatus.UPDATING:
        return <Badge variant="outline">Updating...</Badge>;
      case TemplateStatus.ERROR:
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusColor = () => {
    if (!instance) return 'text-gray-500';
    
    switch (instance.status) {
      case TemplateStatus.INSTALLED:
        return instance.enabled ? 'text-green-500' : 'text-yellow-500';
      case TemplateStatus.INSTALLING:
      case TemplateStatus.UNINSTALLING:
      case TemplateStatus.UPDATING:
        return 'text-blue-500';
      case TemplateStatus.ERROR:
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{template.metadata.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {template.metadata.description}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{template.metadata.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Tag className="w-4 h-4" />
            <span>{template.metadata.category}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Package className="w-4 h-4" />
            <span>v{template.metadata.version}</span>
          </div>
        </div>

        {template.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.metadata.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.metadata.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.metadata.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled || loading}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isExpanded ? 'Hide' : 'Details'}
            </Button>
            
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(template.metadata.id)}
                disabled={disabled || loading}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!instance ? (
              onInstall && (
                <Button
                  size="sm"
                  onClick={() => handleAction(() => onInstall(template.metadata.id))}
                  disabled={disabled || loading || actionLoading}
                >
                  {(loading || actionLoading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
              )
            ) : (
              <div className="flex items-center space-x-2">
                {instance.status === TemplateStatus.INSTALLED && (
                  <>
                    {instance.enabled ? (
                      onDisable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(() => onDisable!(template.metadata.id))}
                          disabled={disabled || loading || actionLoading}
                        >
                          {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Disable
                        </Button>
                      )
                    ) : (
                      onEnable && (
                        <Button
                          size="sm"
                          onClick={() => handleAction(() => onEnable!(template.metadata.id))}
                          disabled={disabled || loading || actionLoading}
                        >
                          {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Enable
                        </Button>
                      )
                    )}
                    
                    {onUninstall && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction(() => onUninstall(template.metadata.id))}
                        disabled={disabled || loading || actionLoading}
                      >
                        {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">License:</span>
                    <p className="text-gray-600">{template.metadata.license}</p>
                  </div>
                  <div>
                    <span className="font-medium">Min Platform Version:</span>
                    <p className="text-gray-600">{template.metadata.minPlatformVersion}</p>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <p className="text-gray-600">
                      {new Date(template.metadata.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>
                    <p className="text-gray-600">
                      {new Date(template.metadata.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {template.metadata.dependencies.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Dependencies</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.metadata.dependencies.map((dep, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {template.metadata.conflicts.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 text-red-600">Conflicts</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.metadata.conflicts.map((conflict, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {conflict}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {instance?.error && (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Error:</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">{instance.error}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

/**
 * Main Template Registration Component
 */
export function TemplateRegistrationComponent({
  onRegister,
  onUnregister,
  loading = false,
  disabled = false,
  className
}: TemplateRegistrationProps) {
  const [templates, setTemplates] = useState<TemplateRegistration[]>([]);
  const [instances, setInstances] = useState<Map<string, TemplateInstance>>(new Map());
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'version' | 'updatedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const registryManager = getTemplateRegistryManager();
  const templateLoader = getTemplateLoader();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const allTemplates = registryManager.getAllTemplates();
      const installedTemplates = registryManager.getInstalledTemplates();
      
      setTemplates(allTemplates);
      
      const instancesMap = new Map<string, TemplateInstance>();
      installedTemplates.forEach(instance => {
        instancesMap.set(instance.templateId, instance);
      });
      setInstances(instancesMap);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleRegisterTemplate = async (templateData: Partial<TemplateRegistration>) => {
    try {
      if (onRegister) {
        await onRegister(templateData as TemplateRegistration);
      } else {
        await registryManager.registerTemplate(templateData as TemplateRegistration);
      }
      setShowRegistrationForm(false);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to register template:', error);
    }
  };

  const handleInstallTemplate = async (templateId: string) => {
    try {
      await registryManager.installTemplate(templateId);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to install template:', error);
    }
  };

  const handleUninstallTemplate = async (templateId: string) => {
    try {
      if (onUnregister) {
        await onUnregister(templateId);
      } else {
        await registryManager.uninstallTemplate(templateId);
      }
      await loadTemplates();
    } catch (error) {
      console.error('Failed to uninstall template:', error);
    }
  };

  const handleEnableTemplate = async (templateId: string) => {
    try {
      await registryManager.enableTemplate(templateId);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to enable template:', error);
    }
  };

  const handleDisableTemplate = async (templateId: string) => {
    try {
      await registryManager.disableTemplate(templateId);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to disable template:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.metadata.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.metadata.name.localeCompare(b.metadata.name);
        break;
      case 'version':
        comparison = a.metadata.version.localeCompare(b.metadata.version);
        break;
      case 'updatedAt':
        comparison = new Date(a.metadata.updatedAt).getTime() - new Date(b.metadata.updatedAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const categories = Array.from(new Set(templates.map(t => t.metadata.category)));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Template Registry</h1>
          <p className="text-gray-600">Manage and configure templates for your application</p>
        </div>
        
        <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
          <DialogTrigger asChild>
            <Button disabled={disabled || loading}>
              <Plus className="w-4 h-4 mr-2" />
              Register Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Template</DialogTitle>
              <DialogDescription>
                Register a new template to make it available in your application
              </DialogDescription>
            </DialogHeader>
            <TemplateRegistrationForm
              onSubmit={handleRegisterTemplate}
              onCancel={() => setShowRegistrationForm(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loading}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)} disabled={loading}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="version">Version</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                disabled={loading}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : sortedTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No templates found' : 'No templates registered'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Register your first template to get started'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTemplates.map(template => (
            <TemplateCard
              key={template.metadata.id}
              template={template}
              instance={instances.get(template.metadata.id)}
              onInstall={handleInstallTemplate}
              onUninstall={handleUninstallTemplate}
              onEnable={handleEnableTemplate}
              onDisable={handleDisableTemplate}
              loading={loading}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{templates.length}</div>
              <div className="text-sm text-gray-600">Total Templates</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{instances.size}</div>
              <div className="text-sm text-gray-600">Installed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Array.from(instances.values()).filter(i => i.enabled).length}
              </div>
              <div className="text-sm text-gray-600">Enabled</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
