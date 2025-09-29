/**
 * @fileoverview System Settings Components - HT-032.1.3
 * @module components/admin/system-settings
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Reusable UI components for system configuration including performance
 * settings, logging controls, backup management, and monitoring displays.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  CheckCircle2,
  XCircle,
  Archive,
  Bug,
  Info,
  Eye,
  EyeOff,
  Trash2,
  Monitor,
  BarChart3,
  Clock,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemSettings } from '@/lib/admin/foundation-settings';

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

interface LogLevel {
  value: 'error' | 'warn' | 'info' | 'debug';
  label: string;
  description: string;
  color: string;
}

interface BackupFrequency {
  value: 'hourly' | 'daily' | 'weekly' | 'monthly';
  label: string;
  description: string;
}

interface SystemStatusOverviewProps {
  status: SystemStatus;
  className?: string;
}

interface PerformanceSettingsProps {
  settings: SystemSettings;
  onSettingChange: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => void;
  onClearCache: () => void;
  loading: boolean;
  className?: string;
}

interface LoggingSettingsProps {
  settings: SystemSettings;
  onSettingChange: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => void;
  recentLogs: LogEntry[];
  className?: string;
}

interface BackupSettingsProps {
  settings: SystemSettings;
  onSettingChange: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => void;
  onTriggerBackup: () => void;
  lastBackup: Date | null;
  loading: boolean;
  className?: string;
}

interface FileHandlingSettingsProps {
  settings: SystemSettings;
  onSettingChange: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => void;
  onFileTypeChange: (fileType: string, enabled: boolean) => void;
  className?: string;
}

interface MonitoringSettingsProps {
  settings: SystemSettings;
  onSettingChange: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => void;
  systemStatus: SystemStatus;
  className?: string;
}

const LOG_LEVELS: LogLevel[] = [
  { value: 'error', label: 'Error', description: 'Only critical errors', color: 'red' },
  { value: 'warn', label: 'Warning', description: 'Errors and warnings', color: 'yellow' },
  { value: 'info', label: 'Info', description: 'General information', color: 'blue' },
  { value: 'debug', label: 'Debug', description: 'Detailed debugging info', color: 'gray' }
];

const BACKUP_FREQUENCIES: BackupFrequency[] = [
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

/**
 * System Status Overview Component
 */
export function SystemStatusOverview({ status, className }: SystemStatusOverviewProps) {
  const getStatusIcon = (statusType: SystemStatus['status']) => {
    switch (statusType) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Monitor className="w-5 h-5 mr-2" />
          System Status Overview
          <Badge variant="outline" className="ml-auto flex items-center space-x-1">
            {getStatusIcon(status.status)}
            <span className="capitalize">{status.status}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{status.uptime}</div>
            <div className="text-sm text-gray-500">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{status.memoryUsage}%</div>
            <Progress value={status.memoryUsage} className="w-full h-2 mb-1" />
            <div className="text-sm text-gray-500">Memory Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{status.diskUsage}%</div>
            <Progress value={status.diskUsage} className="w-full h-2 mb-1" />
            <div className="text-sm text-gray-500">Disk Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{status.activeConnections}</div>
            <div className="text-sm text-gray-500">Active Connections</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Performance Settings Component
 */
export function PerformanceSettings({ 
  settings, 
  onSettingChange, 
  onClearCache, 
  loading, 
  className 
}: PerformanceSettingsProps) {
  return (
    <div className={cn("space-y-6", className)}>
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
              onCheckedChange={(checked) => onSettingChange('debugMode', checked)}
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
              onCheckedChange={(checked) => onSettingChange('cacheEnabled', checked)}
            />
          </div>

          {settings.cacheEnabled && (
            <>
              <div>
                <Label htmlFor="cacheTtl">Cache TTL (seconds)</Label>
                <div className="mt-2">
                  <Slider
                    value={[settings.cacheTtl]}
                    onValueChange={(value) => onSettingChange('cacheTtl', value[0])}
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

              {/* Cache Performance */}
              <CachePerformanceDisplay onClearCache={onClearCache} loading={loading} />
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
                onCheckedChange={(checked) => onSettingChange('enableApiRateLimit', checked)}
              />
            </div>

            {settings.enableApiRateLimit && (
              <div>
                <Label htmlFor="apiRateLimit">Requests per minute</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => onSettingChange('apiRateLimit', parseInt(e.target.value) || 1)}
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
    </div>
  );
}

/**
 * Cache Performance Display Component
 */
interface CachePerformanceDisplayProps {
  onClearCache: () => void;
  loading: boolean;
  className?: string;
}

export function CachePerformanceDisplay({ onClearCache, loading, className }: CachePerformanceDisplayProps) {
  const [cacheHitRate] = useState(94.2);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Cache Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cacheHitRate.toFixed(1)}%
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
              onClick={onClearCache}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Logging Settings Component
 */
export function LoggingSettings({ settings, onSettingChange, recentLogs, className }: LoggingSettingsProps) {
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

  return (
    <Card className={className}>
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
            onValueChange={(value: any) => onSettingChange('logLevel', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select log level" />
            </SelectTrigger>
            <SelectContent>
              {LOG_LEVELS.map((level) => (
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
            onCheckedChange={(checked) => onSettingChange('enableAuditLog', checked)}
          />
        </div>

        {settings.enableAuditLog && (
          <div>
            <Label htmlFor="auditLogRetention">Audit Log Retention (days)</Label>
            <Input
              id="auditLogRetention"
              type="number"
              value={settings.auditLogRetention}
              onChange={(e) => onSettingChange('auditLogRetention', parseInt(e.target.value) || 1)}
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
  );
}

/**
 * Backup Settings Component
 */
export function BackupSettings({ 
  settings, 
  onSettingChange, 
  onTriggerBackup, 
  lastBackup, 
  loading, 
  className 
}: BackupSettingsProps) {
  const getNextBackupTime = (frequency: string) => {
    switch (frequency) {
      case 'hourly': return 'In 45 minutes';
      case 'daily': return 'Tomorrow at 2:00 AM';
      case 'weekly': return 'Sunday at 2:00 AM';
      case 'monthly': return '1st of next month';
      default: return 'Unknown';
    }
  };

  return (
    <Card className={className}>
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
            onCheckedChange={(checked) => onSettingChange('backupEnabled', checked)}
          />
        </div>

        {settings.backupEnabled ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select 
                  value={settings.backupFrequency}
                  onValueChange={(value: any) => onSettingChange('backupFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKUP_FREQUENCIES.map((freq) => (
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
                  onChange={(e) => onSettingChange('backupRetention', parseInt(e.target.value) || 1)}
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
                      {lastBackup?.toLocaleString() || 'Never'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium mb-1">Next Backup</div>
                    <div className="text-xs text-gray-500">
                      {getNextBackupTime(settings.backupFrequency)}
                    </div>
                  </div>
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onTriggerBackup}
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
        ) : (
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
  );
}

/**
 * File Handling Settings Component
 */
export function FileHandlingSettings({ 
  settings, 
  onSettingChange, 
  onFileTypeChange, 
  className 
}: FileHandlingSettingsProps) {
  const applyFileTypePreset = (preset: keyof typeof FILE_TYPE_PRESETS) => {
    const presetTypes = FILE_TYPE_PRESETS[preset];
    presetTypes.forEach(type => {
      if (!settings.allowedFileTypes.includes(type)) {
        onFileTypeChange(type, true);
      }
    });
  };

  return (
    <Card className={className}>
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
              onValueChange={(value) => onSettingChange('maxFileSize', value[0])}
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
            {Object.entries(FILE_TYPE_PRESETS).map(([preset]) => (
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
                  onClick={() => onFileTypeChange(fileType, false)}
                >
                  .{fileType}
                  <XCircle className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Click on a file type to remove it
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
  );
}

/**
 * Monitoring Settings Component
 */
export function MonitoringSettings({ settings, onSettingChange, systemStatus, className }: MonitoringSettingsProps) {
  return (
    <Card className={className}>
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
            onCheckedChange={(checked) => onSettingChange('enableMetrics', checked)}
          />
        </div>

        {settings.enableMetrics ? (
          <>
            <div>
              <Label htmlFor="metricsRetention">Metrics Retention (days)</Label>
              <Input
                id="metricsRetention"
                type="number"
                value={settings.metricsRetention}
                onChange={(e) => onSettingChange('metricsRetention', parseInt(e.target.value) || 1)}
                min="1"
                max="365"
              />
              <p className="text-sm text-gray-500 mt-1">
                How long to keep performance metrics data
              </p>
            </div>

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
          </>
        ) : (
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
  );
}

export default {
  SystemStatusOverview,
  PerformanceSettings,
  CachePerformanceDisplay,
  LoggingSettings,
  BackupSettings,
  FileHandlingSettings,
  MonitoringSettings
};
