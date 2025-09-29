/**
 * @fileoverview System Settings Interface - HT-032.1.3
 * @module app/admin/settings/system/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * System settings interface for managing debug mode, logging, caching,
 * backups, file handling, API settings, and monitoring. Part of the
 * foundation settings system.
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  Server,
  Database,
  Activity,
  Shield,
  HardDrive,
  FileText,
  Zap,
  AlertTriangle,
  Save,
  RefreshCw,
  ArrowLeft,
  Check,
  Info,
  Settings,
  Clock,
  BarChart3,
  Archive,
  Upload,
  Download,
  Bug,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Monitor
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  getFoundationSettingsManager,
  SystemSettings,
  type SettingsValidationResult 
} from '@/lib/admin/foundation-settings';

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  lastBackup: Date | null;
  cacheHitRate: number;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  module: string;
}

const LOG_LEVEL_OPTIONS = [
  { value: 'error', label: 'Error', description: 'Only critical errors', color: 'red' },
  { value: 'warn', label: 'Warning', description: 'Errors and warnings', color: 'yellow' },
  { value: 'info', label: 'Info', description: 'General information', color: 'blue' },
  { value: 'debug', label: 'Debug', description: 'Detailed debugging info', color: 'gray' }
];

const BACKUP_FREQUENCY_OPTIONS = [
  { value: 'hourly', label: 'Hourly', description: 'Every hour' },
  { value: 'daily', label: 'Daily', description: 'Once per day' },
  { value: 'weekly', label: 'Weekly', description: 'Once per week' },
  { value: 'monthly', label: 'Monthly', description: 'Once per month' }
];

const FILE_TYPE_PRESETS = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  spreadsheets: ['xls', 'xlsx', 'csv'],
  archives: ['zip', 'rar', '7z', 'tar', 'gz'],
  media: ['mp4', 'avi', 'mov', 'mp3', 'wav', 'ogg']
};

export default function SystemSettingsPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const settingsManager = getFoundationSettingsManager();
  
  const [settings, setSettings] = useState<SystemSettings>(
    settingsManager.getSection('system')
  );

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'healthy',
    uptime: '5 days, 12 hours',
    memoryUsage: 68,
    diskUsage: 45,
    activeConnections: 127,
    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
    cacheHitRate: 94.2
  });

  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      level: 'info',
      message: 'User authentication successful',
      module: 'auth'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      level: 'warn',
      message: 'High memory usage detected',
      module: 'system'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      level: 'info',
      message: 'Backup completed successfully',
      module: 'backup'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [validationResult, setValidationResult] = useState<SettingsValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState('performance');

  useEffect(() => {
    setMounted(true);
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        memoryUsage: Math.max(50, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        activeConnections: Math.max(50, Math.min(200, prev.activeConnections + Math.floor((Math.random() - 0.5) * 20))),
        cacheHitRate: Math.max(80, Math.min(100, prev.cacheHitRate + (Math.random() - 0.5) * 2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = settingsManager.subscribe((event) => {
      if (event.section === 'system') {
        setSettings(settingsManager.getSection('system'));
        setUnsavedChanges(false);
      }
    });

    return unsubscribe;
  }, [settingsManager]);

  const updateSetting = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setUnsavedChanges(true);

    // Clear previous messages
    setError(null);
    setSuccess(null);
  };

  const updateFileType = (fileType: string, enabled: boolean) => {
    const currentTypes = [...settings.allowedFileTypes];
    if (enabled) {
      if (!currentTypes.includes(fileType)) {
        currentTypes.push(fileType);
      }
    } else {
      const index = currentTypes.indexOf(fileType);
      if (index > -1) {
        currentTypes.splice(index, 1);
      }
    }
    updateSetting('allowedFileTypes', currentTypes);
  };

  const applyFileTypePreset = (preset: keyof typeof FILE_TYPE_PRESETS) => {
    const presetTypes = FILE_TYPE_PRESETS[preset];
    const currentTypes = [...settings.allowedFileTypes];
    
    presetTypes.forEach(type => {
      if (!currentTypes.includes(type)) {
        currentTypes.push(type);
      }
    });
    
    updateSetting('allowedFileTypes', currentTypes);
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const validation = await settingsManager.updateSection('system', settings);
      setValidationResult(validation);
      
      if (validation.isValid) {
        setSuccess('System settings saved successfully!');
        setUnsavedChanges(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Please fix validation errors before saving');
      }
      
    } catch (error) {
      setError('Failed to save system settings');
      console.error('Save settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all system settings to defaults?')) {
      try {
        setLoading(true);
        
        await settingsManager.updateSection('system', {
          debugMode: false,
          logLevel: 'info',
          cacheEnabled: true,
          cacheTtl: 3600,
          backupEnabled: true,
          backupFrequency: 'daily',
          backupRetention: 30,
          maxFileSize: 10,
          allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
          enableApiRateLimit: true,
          apiRateLimit: 100,
          enableAuditLog: true,
          auditLogRetention: 90,
          enableMetrics: true,
          metricsRetention: 30
        });
        
        setSuccess('System settings reset to defaults');
        setTimeout(() => setSuccess(null), 3000);
        
      } catch (error) {
        setError('Failed to reset settings');
      } finally {
        setLoading(false);
      }
    }
  };

  const exportSystemSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importSystemSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          const validation = await settingsManager.updateSection('system', importedSettings);
          
          if (validation.isValid) {
            setSuccess('System settings imported successfully');
            setTimeout(() => setSuccess(null), 3000);
          } else {
            setError('Invalid system settings file');
          }
        } catch (error) {
          setError('Failed to import settings - invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerBackup = async () => {
    try {
      setLoading(true);
      // In a real app, this would trigger a backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSystemStatus(prev => ({ ...prev, lastBackup: new Date() }));
      setSuccess('Manual backup completed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setLoading(true);
      // In a real app, this would clear the cache
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Cache cleared successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to clear cache');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getLogLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'debug':
        return <Bug className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AdminLayout
      title="System Settings"
      description="Configure debug mode, logging, caching, backups, and system monitoring"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Actions */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/settings')}
                className="transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Settings
              </Button>
              
              {unsavedChanges && (
                <Badge variant="outline" className="text-sm">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}

              <Badge variant="outline" className="flex items-center space-x-1">
                {getStatusIcon(systemStatus.status)}
                <span className="capitalize">{systemStatus.status}</span>
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={exportSystemSettings}
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <label className="cursor-pointer">
                <Button variant="outline" disabled={loading} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importSystemSettings}
                  className="hidden"
                />
              </label>
              
              <Button
                variant="outline"
                onClick={resetToDefaults}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              
              <Button
                onClick={saveSettings}
                disabled={loading || !unsavedChanges}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </motion.div>

          {/* System Status Overview */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  System Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{systemStatus.uptime}</div>
                    <div className="text-sm text-gray-500">System Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{systemStatus.memoryUsage}%</div>
                    <Progress value={systemStatus.memoryUsage} className="w-full h-2 mb-1" />
                    <div className="text-sm text-gray-500">Memory Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{systemStatus.diskUsage}%</div>
                    <Progress value={systemStatus.diskUsage} className="w-full h-2 mb-1" />
                    <div className="text-sm text-gray-500">Disk Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{systemStatus.activeConnections}</div>
                    <div className="text-sm text-gray-500">Active Connections</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Messages */}
          {error && (
            <motion.div variants={itemVariants}>
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 dark:text-red-300">{error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setError(null)}
                      className="ml-auto"
                    >
                      ×
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {success && (
            <motion.div variants={itemVariants}>
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 dark:text-green-300">{success}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Debug Mode Warning */}
          {settings.debugMode && (
            <motion.div variants={itemVariants}>
              <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                        Debug Mode is Active
                      </h4>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        <p>Debug mode should not be enabled in production environments. It may expose sensitive information and impact performance.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSetting('debugMode', false)}
                        className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                      >
                        <EyeOff className="w-4 h-4 mr-2" />
                        Disable Debug Mode
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="performance" className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Performance</span>
                </TabsTrigger>
                <TabsTrigger value="logging" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Logging</span>
                </TabsTrigger>
                <TabsTrigger value="backups" className="flex items-center space-x-2">
                  <Archive className="w-4 h-4" />
                  <span>Backups</span>
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4" />
                  <span>File Handling</span>
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Monitoring</span>
                </TabsTrigger>
              </TabsList>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Performance & Caching
                    </CardTitle>
                    <CardDescription>
                      Configure caching, debug mode, and performance optimizations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {settings.debugMode ? (
                          <Eye className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <Label htmlFor="debugMode">Debug Mode</Label>
                          <p className="text-sm text-gray-500">
                            Enable detailed error reporting and debugging information
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="debugMode"
                        checked={settings.debugMode}
                        onCheckedChange={(checked) => updateSetting('debugMode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Database className="w-5 h-5" />
                        <div>
                          <Label htmlFor="cacheEnabled">Enable Caching</Label>
                          <p className="text-sm text-gray-500">
                            Enable system-wide caching for improved performance
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="cacheEnabled"
                        checked={settings.cacheEnabled}
                        onCheckedChange={(checked) => updateSetting('cacheEnabled', checked)}
                      />
                    </div>

                    {settings.cacheEnabled && (
                      <>
                        <div>
                          <Label htmlFor="cacheTtl">Cache TTL (seconds)</Label>
                          <div className="mt-2">
                            <Slider
                              value={[settings.cacheTtl]}
                              onValueChange={(value) => updateSetting('cacheTtl', value[0])}
                              max={86400}
                              min={60}
                              step={60}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>1 min</span>
                              <span className="font-medium">{Math.floor(settings.cacheTtl / 60)} minutes</span>
                              <span>24 hours</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            How long cached data remains valid before expiring
                          </p>
                        </div>

                        {/* Cache Status */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Cache Performance</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {systemStatus.cacheHitRate.toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-500">Hit Rate</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold">2.1GB</div>
                                <div className="text-sm text-gray-500">Cache Size</div>
                              </div>
                              <div className="text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={clearCache}
                                  disabled={loading}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Clear Cache
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {/* API Rate Limiting */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        API Rate Limiting
                      </h4>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5" />
                          <div>
                            <Label htmlFor="enableApiRateLimit">Enable API Rate Limiting</Label>
                            <p className="text-sm text-gray-500">
                              Limit the number of API requests per minute
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="enableApiRateLimit"
                          checked={settings.enableApiRateLimit}
                          onCheckedChange={(checked) => updateSetting('enableApiRateLimit', checked)}
                        />
                      </div>

                      {settings.enableApiRateLimit && (
                        <div>
                          <Label htmlFor="apiRateLimit">Requests per minute</Label>
                          <Input
                            id="apiRateLimit"
                            type="number"
                            value={settings.apiRateLimit}
                            onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value) || 1)}
                            min="10"
                            max="10000"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Maximum number of API requests allowed per minute per user
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Logging Tab */}
              <TabsContent value="logging" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Logging Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure system logging levels and audit trails
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="logLevel">Log Level</Label>
                      <Select 
                        value={settings.logLevel}
                        onValueChange={(value: any) => updateSetting('logLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select log level" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOG_LEVEL_OPTIONS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center space-x-2">
                                <div className={cn(
                                  "w-3 h-3 rounded-full",
                                  level.color === 'red' && "bg-red-500",
                                  level.color === 'yellow' && "bg-yellow-500",
                                  level.color === 'blue' && "bg-blue-500",
                                  level.color === 'gray' && "bg-gray-500"
                                )} />
                                <div>
                                  <div className="font-medium">{level.label}</div>
                                  <div className="text-sm text-gray-500">{level.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-1">
                        Higher levels include all lower level messages
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5" />
                        <div>
                          <Label htmlFor="enableAuditLog">Enable Audit Logging</Label>
                          <p className="text-sm text-gray-500">
                            Log user actions and system changes
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="enableAuditLog"
                        checked={settings.enableAuditLog}
                        onCheckedChange={(checked) => updateSetting('enableAuditLog', checked)}
                      />
                    </div>

                    {settings.enableAuditLog && (
                      <div>
                        <Label htmlFor="auditLogRetention">Audit Log Retention (days)</Label>
                        <Input
                          id="auditLogRetention"
                          type="number"
                          value={settings.auditLogRetention}
                          onChange={(e) => updateSetting('auditLogRetention', parseInt(e.target.value) || 1)}
                          min="1"
                          max="2555"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          How long to keep audit log entries
                        </p>
                      </div>
                    )}

                    {/* Recent Logs */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Recent Log Entries</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {recentLogs.map((log) => (
                            <div key={log.id} className="flex items-start space-x-3 text-sm">
                              <div className="flex-shrink-0 mt-0.5">
                                {getLogLevelIcon(log.level)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{log.message}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {log.module}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {log.timestamp.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Backups Tab */}
              <TabsContent value="backups" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Archive className="w-5 h-5 mr-2" />
                      Backup Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure automatic backups and retention policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Archive className="w-5 h-5" />
                        <div>
                          <Label htmlFor="backupEnabled">Enable Automatic Backups</Label>
                          <p className="text-sm text-gray-500">
                            Automatically create system backups
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="backupEnabled"
                        checked={settings.backupEnabled}
                        onCheckedChange={(checked) => updateSetting('backupEnabled', checked)}
                      />
                    </div>

                    {settings.backupEnabled && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="backupFrequency">Backup Frequency</Label>
                            <Select 
                              value={settings.backupFrequency}
                              onValueChange={(value: any) => updateSetting('backupFrequency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                {BACKUP_FREQUENCY_OPTIONS.map((freq) => (
                                  <SelectItem key={freq.value} value={freq.value}>
                                    <div>
                                      <div className="font-medium">{freq.label}</div>
                                      <div className="text-sm text-gray-500">{freq.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="backupRetention">Backup Retention (days)</Label>
                            <Input
                              id="backupRetention"
                              type="number"
                              value={settings.backupRetention}
                              onChange={(e) => updateSetting('backupRetention', parseInt(e.target.value) || 1)}
                              min="1"
                              max="365"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              How long to keep backup files
                            </p>
                          </div>
                        </div>

                        {/* Backup Status */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Backup Status</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-sm font-medium mb-1">Last Backup</div>
                                <div className="text-xs text-gray-500">
                                  {systemStatus.lastBackup?.toLocaleString() || 'Never'}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium mb-1">Next Backup</div>
                                <div className="text-xs text-gray-500">
                                  {settings.backupFrequency === 'hourly' && 'In 45 minutes'}
                                  {settings.backupFrequency === 'daily' && 'Tomorrow at 2:00 AM'}
                                  {settings.backupFrequency === 'weekly' && 'Sunday at 2:00 AM'}
                                  {settings.backupFrequency === 'monthly' && '1st of next month'}
                                </div>
                              </div>
                              <div className="text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={triggerBackup}
                                  disabled={loading}
                                >
                                  <Archive className="w-4 h-4 mr-2" />
                                  Backup Now
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {!settings.backupEnabled && (
                      <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 text-yellow-700 dark:text-yellow-300">
                            <AlertTriangle className="w-5 h-5" />
                            <div>
                              <p className="font-medium">Backups are disabled</p>
                              <p className="text-sm">This increases the risk of data loss. Consider enabling automatic backups.</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* File Handling Tab */}
              <TabsContent value="files" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HardDrive className="w-5 h-5 mr-2" />
                      File Upload Settings
                    </CardTitle>
                    <CardDescription>
                      Configure file upload limits and allowed file types
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[settings.maxFileSize]}
                          onValueChange={(value) => updateSetting('maxFileSize', value[0])}
                          max={100}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 MB</span>
                          <span className="font-medium">{settings.maxFileSize} MB</span>
                          <span>100 MB</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Maximum size allowed for uploaded files
                      </p>
                    </div>

                    {/* File Type Presets */}
                    <div>
                      <Label>Quick Add File Types</Label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                        {Object.entries(FILE_TYPE_PRESETS).map(([preset, types]) => (
                          <Button
                            key={preset}
                            variant="outline"
                            size="sm"
                            onClick={() => applyFileTypePreset(preset as keyof typeof FILE_TYPE_PRESETS)}
                            className="text-xs"
                          >
                            {preset.charAt(0).toUpperCase() + preset.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Allowed File Types */}
                    <div>
                      <Label>Allowed File Types</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {settings.allowedFileTypes.map((fileType) => (
                            <Badge
                              key={fileType}
                              variant="secondary"
                              className="cursor-pointer hover:bg-red-100"
                              onClick={() => updateFileType(fileType, false)}
                            >
                              .{fileType}
                              <XCircle className="w-3 h-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Add custom file type */}
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add file extension (e.g., pdf)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                const fileType = input.value.replace(/^\./, '').toLowerCase();
                                if (fileType && !settings.allowedFileTypes.includes(fileType)) {
                                  updateFileType(fileType, true);
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                              if (input) {
                                const fileType = input.value.replace(/^\./, '').toLowerCase();
                                if (fileType && !settings.allowedFileTypes.includes(fileType)) {
                                  updateFileType(fileType, true);
                                  input.value = '';
                                }
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Click on a file type to remove it, or add new ones below
                      </p>
                    </div>

                    {/* File Upload Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Upload Configuration Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Maximum file size:</span>
                            <span className="font-medium">{settings.maxFileSize} MB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Allowed file types:</span>
                            <span className="font-medium">{settings.allowedFileTypes.length} types</span>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-500">
                              Users can upload files up to {settings.maxFileSize} MB in size with the following extensions: {settings.allowedFileTypes.join(', ')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Monitoring Tab */}
              <TabsContent value="monitoring" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      System Monitoring
                    </CardTitle>
                    <CardDescription>
                      Configure system metrics collection and monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5" />
                        <div>
                          <Label htmlFor="enableMetrics">Enable Metrics Collection</Label>
                          <p className="text-sm text-gray-500">
                            Collect system performance metrics and statistics
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="enableMetrics"
                        checked={settings.enableMetrics}
                        onCheckedChange={(checked) => updateSetting('enableMetrics', checked)}
                      />
                    </div>

                    {settings.enableMetrics && (
                      <div>
                        <Label htmlFor="metricsRetention">Metrics Retention (days)</Label>
                        <Input
                          id="metricsRetention"
                          type="number"
                          value={settings.metricsRetention}
                          onChange={(e) => updateSetting('metricsRetention', parseInt(e.target.value) || 1)}
                          min="1"
                          max="365"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          How long to keep performance metrics data
                        </p>
                      </div>
                    )}

                    {/* Current Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Current System Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>CPU Usage:</span>
                              <span className="font-medium">23%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Memory Usage:</span>
                              <span className="font-medium">{systemStatus.memoryUsage}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Disk I/O:</span>
                              <span className="font-medium">1.2 MB/s</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Network In:</span>
                              <span className="font-medium">450 KB/s</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Network Out:</span>
                              <span className="font-medium">280 KB/s</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Active Users:</span>
                              <span className="font-medium">42</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {!settings.enableMetrics && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 text-gray-500">
                            <Activity className="w-5 h-5" />
                            <div>
                              <p className="font-medium">Metrics collection is disabled</p>
                              <p className="text-sm">Enable metrics to monitor system performance and usage</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
