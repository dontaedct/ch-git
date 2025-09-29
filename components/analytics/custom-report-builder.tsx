/**
 * @fileoverview Custom Report Builder Component
 * Allows users to create, schedule, and manage custom analytics reports
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  FileText, Calendar, Download, Settings, Plus, Trash2, Edit3, 
  Clock, Mail, Bell, BarChart3, TrendingUp, Users, DollarSign,
  Eye, Share2, Save, RefreshCw
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  schedule: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  lastRun?: Date;
  nextRun?: Date;
  status: 'active' | 'paused' | 'draft';
}

interface MetricOption {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<any>;
}

const availableMetrics: MetricOption[] = [
  { id: 'submissions', name: 'Submissions', category: 'Engagement', description: 'Total form submissions', icon: FileText },
  { id: 'conversions', name: 'Conversions', category: 'Engagement', description: 'Successful conversions', icon: Target },
  { id: 'revenue', name: 'Revenue', category: 'Financial', description: 'Total revenue generated', icon: DollarSign },
  { id: 'visitors', name: 'Visitors', category: 'Traffic', description: 'Unique visitors', icon: Users },
  { id: 'page_views', name: 'Page Views', category: 'Traffic', description: 'Total page views', icon: Eye },
  { id: 'bounce_rate', name: 'Bounce Rate', category: 'Engagement', description: 'Page bounce rate', icon: TrendingUp },
  { id: 'session_time', name: 'Session Time', category: 'Engagement', description: 'Average session duration', icon: Clock },
  { id: 'conversion_rate', name: 'Conversion Rate', category: 'Engagement', description: 'Visitor to conversion rate', icon: BarChart3 }
];

const scheduleOptions = [
  { value: 'daily', label: 'Daily', description: 'Every day at 9:00 AM' },
  { value: 'weekly', label: 'Weekly', description: 'Every Monday at 9:00 AM' },
  { value: 'monthly', label: 'Monthly', description: 'First day of each month' },
  { value: 'quarterly', label: 'Quarterly', description: 'First day of each quarter' },
  { value: 'custom', label: 'Custom', description: 'Set custom schedule' }
];

const formatOptions = [
  { value: 'pdf', label: 'PDF', description: 'Formatted report with charts' },
  { value: 'excel', label: 'Excel', description: 'Spreadsheet with data tables' },
  { value: 'csv', label: 'CSV', description: 'Raw data export' }
];

export function CustomReportBuilder({ className }: { className?: string }) {
  const [reports, setReports] = useState<ReportTemplate[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ReportTemplate>>({
    name: '',
    description: '',
    metrics: [],
    schedule: 'weekly',
    recipients: [],
    format: 'pdf',
    status: 'draft'
  });

  // Load existing reports
  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockReports: ReportTemplate[] = [
      {
        id: '1',
        name: 'Weekly Performance Report',
        description: 'Comprehensive weekly analytics overview',
        metrics: ['submissions', 'conversions', 'revenue', 'visitors'],
        schedule: 'weekly',
        recipients: ['admin@example.com', 'team@example.com'],
        format: 'pdf',
        lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: '2',
        name: 'Monthly Revenue Report',
        description: 'Monthly revenue and conversion analysis',
        metrics: ['revenue', 'conversions', 'conversion_rate'],
        schedule: 'monthly',
        recipients: ['finance@example.com'],
        format: 'excel',
        lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'active'
      }
    ];
    setReports(mockReports);
  }, []);

  const handleCreateReport = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedReport(null);
    setFormData({
      name: '',
      description: '',
      metrics: [],
      schedule: 'weekly',
      recipients: [],
      format: 'pdf',
      status: 'draft'
    });
  };

  const handleEditReport = (report: ReportTemplate) => {
    setSelectedReport(report);
    setIsEditing(true);
    setIsCreating(false);
    setFormData(report);
  };

  const handleSaveReport = () => {
    if (!formData.name || formData.metrics?.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const newReport: ReportTemplate = {
      id: selectedReport?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description || '',
      metrics: formData.metrics!,
      schedule: formData.schedule!,
      recipients: formData.recipients!,
      format: formData.format!,
      status: formData.status!,
      lastRun: selectedReport?.lastRun,
      nextRun: selectedReport?.nextRun
    };

    if (isEditing && selectedReport) {
      setReports(prev => prev.map(r => r.id === selectedReport.id ? newReport : r));
    } else {
      setReports(prev => [...prev, newReport]);
    }

    setIsCreating(false);
    setIsEditing(false);
    setSelectedReport(null);
    setFormData({});
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      setReports(prev => prev.filter(r => r.id !== reportId));
    }
  };

  const handleToggleMetric = (metricId: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics?.includes(metricId)
        ? prev.metrics.filter(id => id !== metricId)
        : [...(prev.metrics || []), metricId]
    }));
  };

  const handleAddRecipient = (email: string) => {
    if (email && !formData.recipients?.includes(email)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...(prev.recipients || []), email]
      }));
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients?.filter(e => e !== email) || []
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScheduleIcon = (schedule: string) => {
    switch (schedule) {
      case 'daily': return <Clock className="w-4 h-4" />;
      case 'weekly': return <Calendar className="w-4 h-4" />;
      case 'monthly': return <Calendar className="w-4 h-4" />;
      case 'quarterly': return <Calendar className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Reports</h2>
          <p className="text-gray-600">Create and schedule custom analytics reports</p>
        </div>
        <Button onClick={handleCreateReport} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Report
        </Button>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        {/* Reports List */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {getScheduleIcon(report.schedule)}
                        <span className="capitalize">{report.schedule}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span className="uppercase">{report.format}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}</span>
                      </div>

                      {report.nextRun && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Next: {report.nextRun.toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReport(report)}
                          className="flex-1"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Report Builder Form */}
        {(isCreating || isEditing) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setIsCreating(false);
              setIsEditing(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {isEditing ? 'Edit Report' : 'Create New Report'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-name">Report Name *</Label>
                    <Input
                      id="report-name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter report name..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="report-description">Description</Label>
                    <Textarea
                      id="report-description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this report covers..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Metrics Selection */}
                <div>
                  <Label>Metrics to Include *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {availableMetrics.map((metric) => (
                      <div
                        key={metric.id}
                        className={cn(
                          "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
                          formData.metrics?.includes(metric.id)
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleToggleMetric(metric.id)}
                      >
                        <Checkbox
                          checked={formData.metrics?.includes(metric.id) || false}
                          onChange={() => handleToggleMetric(metric.id)}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <metric.icon className="w-4 h-4 text-gray-600" />
                          <div>
                            <div className="font-medium text-sm">{metric.name}</div>
                            <div className="text-xs text-gray-500">{metric.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <Label>Schedule</Label>
                  <Select
                    value={formData.schedule}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, schedule: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Format */}
                <div>
                  <Label>Export Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value: 'pdf' | 'excel' | 'csv') => setFormData(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Recipients */}
                <div>
                  <Label>Email Recipients</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter email address..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddRecipient(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          handleAddRecipient(input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.recipients?.map((email) => (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <button
                            onClick={() => handleRemoveRecipient(email)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setIsEditing(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveReport}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update Report' : 'Create Report'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </Tabs>
    </div>
  );
}

export default CustomReportBuilder;
