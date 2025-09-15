/**
 * Hero Tasks - Task Template Selection Component
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Bug,
  Zap,
  Shield,
  Code,
  Palette,
  TestTube,
  BookOpen,
  Wrench,
  Search,
  Plus,
  Clock,
  Tag,
  User,
  Calendar
} from 'lucide-react';
import { TaskTemplate, TaskTemplateCategory, CreateHeroTaskRequest } from '@/types/hero-tasks';

interface TaskTemplateSelectorProps {
  onTemplateSelect: (taskData: CreateHeroTaskRequest) => void;
  onCancel: () => void;
  className?: string;
}

export function TaskTemplateSelector({
  onTemplateSelect,
  onCancel,
  className
}: TaskTemplateSelectorProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      params.append('is_public', 'true');

      const response = await fetch(`/api/hero-tasks/templates?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch templates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: TaskTemplateCategory) => {
    const icons: Record<TaskTemplateCategory, React.ComponentType<any>> = {
      [TaskTemplateCategory.DEVELOPMENT]: Code,
      [TaskTemplateCategory.DESIGN]: Palette,
      [TaskTemplateCategory.TESTING]: TestTube,
      [TaskTemplateCategory.DOCUMENTATION]: BookOpen,
      [TaskTemplateCategory.MAINTENANCE]: Wrench,
      [TaskTemplateCategory.SECURITY]: Shield,
      [TaskTemplateCategory.PERFORMANCE]: Zap,
      [TaskTemplateCategory.INTEGRATION]: Code,
      [TaskTemplateCategory.DEPLOYMENT]: Zap,
      [TaskTemplateCategory.RESEARCH]: BookOpen,
      [TaskTemplateCategory.PLANNING]: Calendar,
      [TaskTemplateCategory.REVIEW]: FileText,
      [TaskTemplateCategory.BUG_FIX]: Bug,
      [TaskTemplateCategory.FEATURE]: Plus,
      [TaskTemplateCategory.REFACTOR]: Code,
      [TaskTemplateCategory.CUSTOM]: FileText
    };
    const IconComponent = icons[category] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  const getCategoryColor = (category: TaskTemplateCategory) => {
    const colors: Record<TaskTemplateCategory, string> = {
      [TaskTemplateCategory.DEVELOPMENT]: 'bg-blue-100 text-blue-800',
      [TaskTemplateCategory.DESIGN]: 'bg-purple-100 text-purple-800',
      [TaskTemplateCategory.TESTING]: 'bg-green-100 text-green-800',
      [TaskTemplateCategory.DOCUMENTATION]: 'bg-yellow-100 text-yellow-800',
      [TaskTemplateCategory.MAINTENANCE]: 'bg-orange-100 text-orange-800',
      [TaskTemplateCategory.SECURITY]: 'bg-red-100 text-red-800',
      [TaskTemplateCategory.PERFORMANCE]: 'bg-indigo-100 text-indigo-800',
      [TaskTemplateCategory.INTEGRATION]: 'bg-cyan-100 text-cyan-800',
      [TaskTemplateCategory.DEPLOYMENT]: 'bg-emerald-100 text-emerald-800',
      [TaskTemplateCategory.RESEARCH]: 'bg-amber-100 text-amber-800',
      [TaskTemplateCategory.PLANNING]: 'bg-pink-100 text-pink-800',
      [TaskTemplateCategory.REVIEW]: 'bg-gray-100 text-gray-800',
      [TaskTemplateCategory.BUG_FIX]: 'bg-red-100 text-red-800',
      [TaskTemplateCategory.FEATURE]: 'bg-blue-100 text-blue-800',
      [TaskTemplateCategory.REFACTOR]: 'bg-yellow-100 text-yellow-800',
      [TaskTemplateCategory.CUSTOM]: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleTemplateSelect = async (template: TaskTemplate) => {
    try {
      setIsCreating(true);

      const response = await fetch(`/api/hero-tasks/templates/${template.id}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customizations,
          user_id: 'current-user' // This would come from auth context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task from template');
      }

      const result = await response.json();
      
      if (result.success) {
        // Convert the created task back to CreateHeroTaskRequest format
        const taskData: CreateHeroTaskRequest = {
          title: result.data.title,
          description: result.data.description,
          priority: result.data.priority,
          type: result.data.type,
          assignee_id: result.data.assignee_id,
          due_date: result.data.due_date,
          estimated_duration_hours: result.data.estimated_duration_hours,
          tags: result.data.tags,
          metadata: result.data.metadata
        };

        onTemplateSelect(taskData);
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCreating(false);
    }
  };

  const extractPlaceholders = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
  };

  const renderCustomizationFields = (template: TaskTemplate) => {
    const titlePlaceholders = extractPlaceholders(template.template_data.title_template);
    const descriptionPlaceholders = template.template_data.description_template 
      ? extractPlaceholders(template.template_data.description_template)
      : [];
    
    const allPlaceholders = [...new Set([...titlePlaceholders, ...descriptionPlaceholders])];
    
    if (allPlaceholders.length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-gray-700">Customize Template</h4>
        {allPlaceholders.map(placeholder => (
          <div key={placeholder} className="space-y-2">
            <Label htmlFor={placeholder} className="text-sm">
              {placeholder.charAt(0).toUpperCase() + placeholder.slice(1)}
            </Label>
            <Input
              id={placeholder}
              value={customizations[placeholder] || ''}
              onChange={(e) => setCustomizations(prev => ({
                ...prev,
                [placeholder]: e.target.value
              }))}
              placeholder={`Enter ${placeholder}...`}
            />
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error: {error}</p>
            <Button onClick={fetchTemplates} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Choose a Task Template
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select a template to quickly create a new task with predefined settings
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(TaskTemplateCategory).map(category => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No templates found</p>
            <p className="text-sm text-gray-400">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Dialog key={template.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: template.color + '20', color: template.color }}
                        >
                          {getCategoryIcon(template.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2 mb-1">
                            {template.name}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={getCategoryColor(template.category)}>
                              {template.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {template.usage_count} uses
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: template.color + '20', color: template.color }}
                      >
                        {getCategoryIcon(template.category)}
                      </div>
                      {template.name}
                    </DialogTitle>
                    <DialogDescription>
                      {template.description}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Template Preview */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-700">Template Preview</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div>
                          <Label className="text-xs text-gray-600">Title</Label>
                          <p className="text-sm font-medium">
                            {template.template_data.title_template}
                          </p>
                        </div>
                        {template.template_data.description_template && (
                          <div>
                            <Label className="text-xs text-gray-600">Description</Label>
                            <p className="text-sm text-gray-700">
                              {template.template_data.description_template}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {template.template_data.default_tags.join(', ')}
                          </div>
                          {template.template_data.estimated_duration_hours && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {template.template_data.estimated_duration_hours}h
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customization Fields */}
                    {renderCustomizationFields(template)}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={() => handleTemplateSelect(template)}
                        disabled={isCreating}
                        className="flex-1"
                      >
                        {isCreating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating Task...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Task
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={onCancel}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Create from Scratch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskTemplateSelector;
