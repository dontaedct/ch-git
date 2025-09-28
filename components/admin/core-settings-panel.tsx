/**
 * @fileoverview Core Settings UI Components - HT-032.1.1
 * @module components/admin/core-settings-panel
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Core settings UI components that provide reusable interface elements
 * for the modular admin interface settings management system.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Users, 
  Globe, 
  Shield,
  Mail,
  Bell,
  Database,
  Server,
  Palette,
  Code,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  Zap,
  Lock,
  Unlock,
  Download,
  Upload,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CoreSettings, 
  SettingsValidationResult,
  getCoreSettingsManager 
} from '@/lib/admin/core-settings';

interface CoreSettingsPanelProps {
  section: keyof CoreSettings;
  settings: CoreSettings;
  validation?: SettingsValidationResult;
  onUpdate: (path: string, value: any) => void;
  onSave?: () => void;
  loading?: boolean;
  readOnly?: boolean;
  className?: string;
}

interface SettingsFieldProps {
  label: string;
  description?: string;
  error?: string;
  warning?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

interface SettingsGroupProps {
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Settings Field Component
 * Provides consistent styling and validation display for settings fields
 */
export function SettingsField({ 
  label, 
  description, 
  error, 
  warning, 
  required, 
  helpText, 
  children, 
  className 
}: SettingsFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
      
      <div className="space-y-2">
        {children}
        
        {error && (
          <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        {warning && !error && (
          <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span>{warning}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Settings Group Component
 * Groups related settings with optional collapsible behavior
 */
export function SettingsGroup({ 
  title, 
  description, 
  collapsible = false, 
  defaultExpanded = true, 
  children, 
  className 
}: SettingsGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={cn("", className)}>
      <CardHeader 
        className={cn(
          "pb-4",
          collapsible && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {collapsible && (
            <Button variant="ghost" size="sm">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <div className="space-y-6">
                {children}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/**
 * General Settings Panel Component
 */
export function GeneralSettingsPanel({ settings, validation, onUpdate, readOnly }: CoreSettingsPanelProps) {
  const generalErrors = validation?.errors.general || [];
  const generalWarnings = validation?.warnings.general || [];

  return (
    <div className="space-y-6">
      <SettingsGroup title="Site Information" description="Basic information about your site">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsField
            label="Site Name"
            description="The name of your site or application"
            error={generalErrors.find(e => e.includes('Site name'))}
            required
            helpText="This will appear in the browser title and throughout the interface"
          >
            <Input
              value={settings.general.siteName}
              onChange={(e) => onUpdate('general.siteName', e.target.value)}
              placeholder="Enter site name"
              disabled={readOnly}
            />
          </SettingsField>

          <SettingsField
            label="Admin Email"
            description="Primary administrator email address"
            error={generalErrors.find(e => e.includes('admin email'))}
            required
            helpText="This email will receive important system notifications"
          >
            <Input
              type="email"
              value={settings.general.adminEmail}
              onChange={(e) => onUpdate('general.adminEmail', e.target.value)}
              placeholder="admin@example.com"
              disabled={readOnly}
            />
          </SettingsField>
        </div>

        <SettingsField
          label="Site Description"
          description="A brief description of your site or application"
          helpText="This description may be used for SEO and internal documentation"
        >
          <Textarea
            value={settings.general.siteDescription || ''}
            onChange={(e) => onUpdate('general.siteDescription', e.target.value)}
            placeholder="Describe your site..."
            rows={3}
            disabled={readOnly}
          />
        </SettingsField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SettingsField
            label="Timezone"
            description="Default timezone for the application"
            required
            helpText="All timestamps will be displayed in this timezone"
          >
            <Select 
              value={settings.general.timezone}
              onValueChange={(value) => onUpdate('general.timezone', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </SettingsField>

          <SettingsField
            label="Language"
            description="Default interface language"
            required
            helpText="The primary language for the admin interface"
          >
            <Select 
              value={settings.general.language}
              onValueChange={(value) => onUpdate('general.language', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </SettingsField>

          <SettingsField
            label="Support Email"
            description="Email for user support inquiries"
            error={generalErrors.find(e => e.includes('support email'))}
            helpText="Users will see this email for support requests"
          >
            <Input
              type="email"
              value={settings.general.supportEmail}
              onChange={(e) => onUpdate('general.supportEmail', e.target.value)}
              placeholder="support@example.com"
              disabled={readOnly}
            />
          </SettingsField>
        </div>
      </SettingsGroup>

      <SettingsGroup title="System Status" description="System-wide operational settings">
        <SettingsField
          label="Maintenance Mode"
          description="Temporarily disable site access for maintenance"
          warning={generalWarnings.find(w => w.includes('maintenance'))}
          helpText="When enabled, only administrators can access the site"
        >
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-3 h-3 rounded-full",
                settings.general.maintenanceMode ? "bg-red-500" : "bg-green-500"
              )} />
              <div>
                <span className="font-medium">
                  {settings.general.maintenanceMode ? 'Maintenance Mode Active' : 'Site Online'}
                </span>
                <p className="text-sm text-gray-500">
                  {settings.general.maintenanceMode 
                    ? 'Site is currently in maintenance mode' 
                    : 'Site is accessible to all users'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={settings.general.maintenanceMode}
              onCheckedChange={(checked) => onUpdate('general.maintenanceMode', checked)}
              disabled={readOnly}
            />
          </div>
        </SettingsField>
      </SettingsGroup>
    </div>
  );
}

/**
 * Security Settings Panel Component
 */
export function SecuritySettingsPanel({ settings, validation, onUpdate, readOnly }: CoreSettingsPanelProps) {
  const securityErrors = validation?.errors.security || [];
  const securityWarnings = validation?.warnings.security || [];

  return (
    <div className="space-y-6">
      <SettingsGroup title="Authentication" description="User authentication and session management">
        <SettingsField
          label="Two-Factor Authentication"
          description="Require 2FA for all admin users"
          warning={securityWarnings.find(w => w.includes('Two-factor'))}
          helpText="Highly recommended for enhanced security"
        >
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <span className="font-medium">Two-Factor Authentication</span>
                <p className="text-sm text-gray-500">
                  {settings.security.twoFactorRequired 
                    ? 'All admin users must use 2FA' 
                    : '2FA is optional for admin users'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={settings.security.twoFactorRequired}
              onCheckedChange={(checked) => onUpdate('security.twoFactorRequired', checked)}
              disabled={readOnly}
            />
          </div>
        </SettingsField>

        <SettingsField
          label="Session Timeout"
          description="Automatic logout after inactivity (minutes)"
          error={securityErrors.find(e => e.includes('timeout'))}
          helpText="Users will be logged out after this period of inactivity"
        >
          <div className="flex items-center space-x-4">
            <Input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => onUpdate('security.sessionTimeout', parseInt(e.target.value) || 30)}
              min="5"
              max="480"
              className="w-32"
              disabled={readOnly}
            />
            <span className="text-sm text-gray-500">minutes</span>
          </div>
        </SettingsField>
      </SettingsGroup>

      <SettingsGroup title="Password Policy" description="Requirements for user passwords">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsField
            label="Minimum Length"
            description="Minimum number of characters"
            error={securityErrors.find(e => e.includes('length'))}
            warning={securityWarnings.find(w => w.includes('length'))}
            helpText="Recommended minimum is 8 characters"
          >
            <Input
              type="number"
              value={settings.security.passwordPolicy.minLength}
              onChange={(e) => onUpdate('security.passwordPolicy.minLength', parseInt(e.target.value) || 8)}
              min="6"
              max="32"
              disabled={readOnly}
            />
          </SettingsField>

          <div className="space-y-4">
            <SettingsField
              label="Character Requirements"
              description="Required character types in passwords"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Require Special Characters</Label>
                  <Switch
                    checked={settings.security.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => onUpdate('security.passwordPolicy.requireSpecialChars', checked)}
                    disabled={readOnly}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Numbers</Label>
                  <Switch
                    checked={settings.security.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => onUpdate('security.passwordPolicy.requireNumbers', checked)}
                    disabled={readOnly}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Uppercase Letters</Label>
                  <Switch
                    checked={settings.security.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => onUpdate('security.passwordPolicy.requireUppercase', checked)}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </SettingsField>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Access Control" description="System access and rate limiting">
        <SettingsField
          label="Rate Limiting"
          description="Enable rate limiting for API endpoints"
          helpText="Protects against abuse and DoS attacks"
        >
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-orange-500" />
              <div>
                <span className="font-medium">API Rate Limiting</span>
                <p className="text-sm text-gray-500">
                  {settings.security.rateLimiting 
                    ? 'Rate limiting is enabled' 
                    : 'Rate limiting is disabled'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={settings.security.rateLimiting}
              onCheckedChange={(checked) => onUpdate('security.rateLimiting', checked)}
              disabled={readOnly}
            />
          </div>
        </SettingsField>
      </SettingsGroup>
    </div>
  );
}

/**
 * Notification Settings Panel Component
 */
export function NotificationSettingsPanel({ settings, validation, onUpdate, readOnly }: CoreSettingsPanelProps) {
  const notificationErrors = validation?.errors.notifications || [];

  return (
    <div className="space-y-6">
      <SettingsGroup title="Email Configuration" description="Email settings and preferences">
        <SettingsField
          label="Notification Email"
          description="Email address to receive system notifications"
          error={notificationErrors.find(e => e.includes('notification email'))}
          required
          helpText="This email will receive all system notifications"
        >
          <Input
            type="email"
            value={settings.notifications.notificationEmail}
            onChange={(e) => onUpdate('notifications.notificationEmail', e.target.value)}
            placeholder="notifications@example.com"
            disabled={readOnly}
          />
        </SettingsField>
      </SettingsGroup>

      <SettingsGroup title="Notification Channels" description="Choose how you want to receive notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notifications.emailNotifications}
              onCheckedChange={(checked) => onUpdate('notifications.emailNotifications', checked)}
              disabled={readOnly}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-green-500" />
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">
                  Browser push notifications
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notifications.pushNotifications}
              onCheckedChange={(checked) => onUpdate('notifications.pushNotifications', checked)}
              disabled={readOnly}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-purple-500" />
              <div>
                <Label>Webhook Notifications</Label>
                <p className="text-sm text-gray-500">
                  Send notifications to external webhooks
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notifications.webhookNotifications}
              onCheckedChange={(checked) => onUpdate('notifications.webhookNotifications', checked)}
              disabled={readOnly}
            />
          </div>
        </div>
      </SettingsGroup>
    </div>
  );
}

/**
 * Branding Settings Panel Component
 */
export function BrandingSettingsPanel({ settings, validation, onUpdate, readOnly }: CoreSettingsPanelProps) {
  const brandingErrors = validation?.errors.branding || [];

  return (
    <div className="space-y-6">
      <SettingsGroup title="Visual Identity" description="Customize the appearance of your admin interface">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsField
            label="Logo URL"
            description="URL to your logo image"
            error={brandingErrors.find(e => e.includes('logo'))}
            helpText="Recommended size: 200x50px, PNG or SVG format"
          >
            <Input
              value={settings.branding.logoUrl}
              onChange={(e) => onUpdate('branding.logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              disabled={readOnly}
            />
          </SettingsField>

          <SettingsField
            label="Favicon URL"
            description="URL to your favicon"
            error={brandingErrors.find(e => e.includes('favicon'))}
            helpText="Recommended size: 32x32px, ICO or PNG format"
          >
            <Input
              value={settings.branding.faviconUrl}
              onChange={(e) => onUpdate('branding.faviconUrl', e.target.value)}
              placeholder="https://example.com/favicon.ico"
              disabled={readOnly}
            />
          </SettingsField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsField
            label="Primary Color"
            description="Main brand color"
            error={brandingErrors.find(e => e.includes('primary color'))}
            helpText="Used for buttons, links, and primary UI elements"
          >
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.branding.primaryColor}
                onChange={(e) => onUpdate('branding.primaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                disabled={readOnly}
              />
              <Input
                value={settings.branding.primaryColor}
                onChange={(e) => onUpdate('branding.primaryColor', e.target.value)}
                placeholder="#3B82F6"
                className="font-mono"
                disabled={readOnly}
              />
            </div>
          </SettingsField>

          <SettingsField
            label="Secondary Color"
            description="Secondary brand color"
            error={brandingErrors.find(e => e.includes('secondary color'))}
            helpText="Used for secondary buttons and accents"
          >
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.branding.secondaryColor}
                onChange={(e) => onUpdate('branding.secondaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                disabled={readOnly}
              />
              <Input
                value={settings.branding.secondaryColor}
                onChange={(e) => onUpdate('branding.secondaryColor', e.target.value)}
                placeholder="#1E40AF"
                className="font-mono"
                disabled={readOnly}
              />
            </div>
          </SettingsField>
        </div>

        <SettingsField
          label="Font Family"
          description="Primary font family for the interface"
          error={brandingErrors.find(e => e.includes('font'))}
          helpText="Use web-safe fonts or Google Fonts"
        >
          <Input
            value={settings.branding.fontFamily}
            onChange={(e) => onUpdate('branding.fontFamily', e.target.value)}
            placeholder="Inter, sans-serif"
            disabled={readOnly}
          />
        </SettingsField>
      </SettingsGroup>

      <SettingsGroup title="Custom Styling" description="Advanced customization options" collapsible>
        <SettingsField
          label="Custom CSS"
          description="Add custom CSS to override default styles"
          helpText="Use with caution - invalid CSS may break the interface"
        >
          <Textarea
            value={settings.branding.customCss || ''}
            onChange={(e) => onUpdate('branding.customCss', e.target.value)}
            placeholder="/* Custom CSS styles */"
            rows={8}
            className="font-mono text-sm"
            disabled={readOnly}
          />
        </SettingsField>
      </SettingsGroup>
    </div>
  );
}

/**
 * System Settings Panel Component
 */
export function SystemSettingsPanel({ settings, validation, onUpdate, readOnly }: CoreSettingsPanelProps) {
  const systemErrors = validation?.errors.system || [];
  const systemWarnings = validation?.warnings.system || [];

  return (
    <div className="space-y-6">
      <SettingsGroup title="Development" description="Development and debugging settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsField
            label="Debug Mode"
            description="Enable detailed error reporting"
            warning={systemWarnings.find(w => w.includes('Debug mode'))}
            helpText="Should be disabled in production environments"
          >
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Code className="w-5 h-5 text-purple-500" />
                <div>
                  <span className="font-medium">Debug Mode</span>
                  <p className="text-sm text-gray-500">
                    {settings.system.debugMode 
                      ? 'Debug information is shown' 
                      : 'Debug information is hidden'
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.system.debugMode}
                onCheckedChange={(checked) => onUpdate('system.debugMode', checked)}
                disabled={readOnly}
              />
            </div>
          </SettingsField>

          <SettingsField
            label="Log Level"
            description="Minimum level for system logs"
            helpText="Higher levels include all lower levels"
          >
            <Select 
              value={settings.system.logLevel}
              onValueChange={(value) => onUpdate('system.logLevel', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select log level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="error">Error - Only errors</SelectItem>
                <SelectItem value="warn">Warning - Errors and warnings</SelectItem>
                <SelectItem value="info">Info - General information</SelectItem>
                <SelectItem value="debug">Debug - All messages</SelectItem>
              </SelectContent>
            </Select>
          </SettingsField>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Performance" description="System performance and caching">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsField
            label="Cache Enabled"
            description="Enable system-wide caching"
            helpText="Improves performance but may delay updates"
          >
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-green-500" />
                <div>
                  <span className="font-medium">System Cache</span>
                  <p className="text-sm text-gray-500">
                    {settings.system.cacheEnabled 
                      ? 'Caching is enabled' 
                      : 'Caching is disabled'
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.system.cacheEnabled}
                onCheckedChange={(checked) => onUpdate('system.cacheEnabled', checked)}
                disabled={readOnly}
              />
            </div>
          </SettingsField>

          <SettingsField
            label="Max File Size"
            description="Maximum file upload size (MB)"
            error={systemErrors.find(e => e.includes('file size'))}
            helpText="Maximum size for file uploads"
          >
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={settings.system.maxFileSize}
                onChange={(e) => onUpdate('system.maxFileSize', parseInt(e.target.value) || 10)}
                min="1"
                max="100"
                className="w-32"
                disabled={readOnly}
              />
              <span className="text-sm text-gray-500">MB</span>
            </div>
          </SettingsField>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Backup & Maintenance" description="Backup and maintenance settings">
        <SettingsField
          label="Automatic Backups"
          description="Enable automatic system backups"
          helpText="Regular backups help protect your data"
        >
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Server className="w-5 h-5 text-blue-500" />
              <div>
                <span className="font-medium">Automatic Backups</span>
                <p className="text-sm text-gray-500">
                  {settings.system.backupEnabled 
                    ? 'Backups are enabled' 
                    : 'Backups are disabled'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={settings.system.backupEnabled}
              onCheckedChange={(checked) => onUpdate('system.backupEnabled', checked)}
              disabled={readOnly}
            />
          </div>
        </SettingsField>

        {settings.system.backupEnabled && (
          <SettingsField
            label="Backup Frequency"
            description="How often to create backups"
            helpText="More frequent backups provide better protection"
          >
            <Select 
              value={settings.system.backupFrequency}
              onValueChange={(value) => onUpdate('system.backupFrequency', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </SettingsField>
        )}
      </SettingsGroup>
    </div>
  );
}

/**
 * Main Core Settings Panel Component
 * Routes to the appropriate settings panel based on section
 */
export function CoreSettingsPanel(props: CoreSettingsPanelProps) {
  const { section } = props;

  switch (section) {
    case 'general':
      return <GeneralSettingsPanel {...props} />;
    case 'security':
      return <SecuritySettingsPanel {...props} />;
    case 'notifications':
      return <NotificationSettingsPanel {...props} />;
    case 'branding':
      return <BrandingSettingsPanel {...props} />;
    case 'system':
      return <SystemSettingsPanel {...props} />;
    default:
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Settings Section Not Found
            </h3>
            <p className="text-gray-600">
              The requested settings section is not available.
            </p>
          </CardContent>
        </Card>
      );
  }
}
